import { useEffect } from 'react';

import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (errorMessage: string) => void;
}

export default function QRScanner({
    onScan,
    onError,
}: QRScannerProps) {
    useEffect(() => {
        const scanner = new Html5Qrcode('qr-reader');

        let isUnmounted = false;
        let hasScanned = false;
        let isStarting = false;
        let restartRequested = false;

        let startPromise: Promise<null> | null = null;
        let stopPromise: Promise<void> | null = null;

        const scannerElement = document.getElementById('qr-reader');

        const updateVideoSize = () => {
            const video = scannerElement?.querySelector('video');

            if (!video) {
                return;
            }

            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.display = 'block';
            video.style.objectFit = 'cover';

            // Mirror front-facing cameras for a natural preview;
            // keep rear-facing cameras unmirrored.
            const stream = video.srcObject;
            const track =
                stream instanceof MediaStream
                    ? stream.getVideoTracks()[0]
                    : undefined;

            const facingMode = track?.getSettings().facingMode;
            const cameraLabel = track?.label ?? '';

            const isRearCamera =
                facingMode === 'environment' ||
                /(back|rear|environment|world)/i.test(cameraLabel);

            const isFrontCamera =
                facingMode === 'user' ||
                /(front|user|selfie|integrated camera|built-in camera|webcam)/i.test(
                    cameraLabel,
                );

            video.style.transform =
                isRearCamera ? 'none' : isFrontCamera ? 'scaleX(-1)' : 'none';
            video.style.transformOrigin = 'center';
        };

        const resizeObserver = scannerElement
            ? new ResizeObserver(() => {
                  requestAnimationFrame(() => {
                      updateVideoSize();
                  });
              })
            : null;

        if (scannerElement && resizeObserver) {
            resizeObserver.observe(scannerElement);
        }

        /**
         * Stop the active camera without clearing the scanner.
         * This allows the scanner to restart when the tab becomes visible.
         */
        const stopActiveScanner = async (): Promise<void> => {
            try {
                if (startPromise) {
                    await startPromise.catch(() => {});
                }

                if (stopPromise) {
                    await stopPromise.catch(() => {});
                    return;
                }

                if (!scanner.isScanning) {
                    return;
                }

                const pendingStop = scanner.stop();
                stopPromise = pendingStop;

                try {
                    await pendingStop;
                } catch (error) {
                    console.warn('QR scanner stop failed:', error);
                } finally {
                    if (stopPromise === pendingStop) {
                        stopPromise = null;
                    }
                }
            } catch (error) {
                console.warn('QR scanner cleanup failed:', error);
            }
        };

        /**
         * Start scanning using an available camera device ID.
         * Prefer a rear camera when available; otherwise use the first camera.
         */
        const startScanner = async (): Promise<void> => {
            if (
                isUnmounted ||
                hasScanned ||
                document.visibilityState !== 'visible'
            ) {
                return;
            }

            if (isStarting) {
                restartRequested = true;
                return;
            }

            isStarting = true;

            try {
                if (stopPromise) {
                    await stopPromise.catch(() => {});
                }

                if (
                    isUnmounted ||
                    hasScanned ||
                    document.visibilityState !== 'visible'
                ) {
                    return;
                }

                const cameras = await Html5Qrcode.getCameras();

                if (
                    isUnmounted ||
                    hasScanned ||
                    document.visibilityState !== 'visible'
                ) {
                    return;
                }

                if (cameras.length === 0) {
                    throw new Error(
                        'No cameras were found on this device.',
                    );
                }

                const selectedCamera =
                    cameras.find((camera) =>
                        /(back|rear|environment)/i.test(camera.label),
                    ) ?? cameras[0];

                // Avoid attempting to start a second active scan.
                if (scanner.isScanning) {
                    return;
                }

                startPromise = scanner.start(
                    selectedCamera.id,
                    {
                        fps: 10,
                        qrbox: (
                            viewfinderWidth,
                            viewfinderHeight,
                        ) => {
                            const maxSize = 250;

                            const widthBasedSize = Math.floor(
                                viewfinderWidth * 0.7,
                            );

                            const heightBasedSize = Math.floor(
                                viewfinderHeight * 0.7,
                            );

                            const size = Math.min(
                                maxSize,
                                widthBasedSize,
                                heightBasedSize,
                            );

                            return {
                                width: size,
                                height: size,
                            };
                        },
                    },
                    async (decodedText) => {
                        if (isUnmounted || hasScanned) {
                            return;
                        }

                        hasScanned = true;

                        // Release the camera after a successful scan.
                        await stopActiveScanner();

                        if (!isUnmounted) {
                            onScan(decodedText);
                        }
                    },
                    () => {
                        // Normal unsuccessful scan attempts are expected.
                    },
                );

                await startPromise;

                if (
                    isUnmounted ||
                    hasScanned ||
                    document.visibilityState !== 'visible'
                ) {
                    await stopActiveScanner();
                    return;
                }

                updateVideoSize();
            } catch (error) {
                console.error(
                    'QR scanner startup failed:',
                    error,
                );

                if (
                    !isUnmounted &&
                    document.visibilityState === 'visible'
                ) {
                    onError?.(
                        'Unable to start the camera. Check the browser console for details.',
                    );
                }
            } finally {
                isStarting = false;

                // Handle switching away from and back to the tab
                // while camera startup was still in progress.
                if (restartRequested) {
                    restartRequested = false;

                    if (
                        !isUnmounted &&
                        !hasScanned &&
                        document.visibilityState === 'visible'
                    ) {
                        void (async () => {
                            await stopActiveScanner();

                            if (
                                !isUnmounted &&
                                !hasScanned &&
                                document.visibilityState === 'visible'
                            ) {
                                void startScanner();
                            }
                        })();
                    }
                }
            }
        };

        /**
         * Stop the camera when the tab is hidden.
         * Restart scanning when the tab becomes visible again.
         */
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                restartRequested = false;
                void stopActiveScanner();
                return;
            }

            if (isStarting) {
                restartRequested = true;
                return;
            }

            void (async () => {
                await stopActiveScanner();

                if (
                    !isUnmounted &&
                    !hasScanned &&
                    document.visibilityState === 'visible'
                ) {
                    void startScanner();
                }
            })();
        };

        /**
         * Stop the camera when the browser page is being hidden or unloaded.
         */
        const handlePageHide = () => {
            void stopActiveScanner();
        };

        /**
         * Restart scanning if the browser restores this page from its
         * back-forward cache.
         */
        const handlePageShow = (event: PageTransitionEvent) => {
            if (
                event.persisted &&
                document.visibilityState === 'visible'
            ) {
                handleVisibilityChange();
            }
        };

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
        );

        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('pageshow', handlePageShow);

        void startScanner();

        return () => {
            isUnmounted = true;

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('pageshow', handlePageShow);

            // Stop the camera before clearing the scanner.
            void (async () => {
                await stopActiveScanner();

                try {
                    scanner.clear();
                } catch {
                    // The scanner may already be cleared.
                }

                resizeObserver?.disconnect();
            })();
        };
    }, [onScan, onError]);

    return (
        <div
            id="qr-reader"
            className="w-full overflow-hidden rounded-lg"
        />
    );
}