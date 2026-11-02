import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (errorMessage: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const onScanRef = useRef(onScan);
    const onErrorRef = useRef(onError);

    // Keep callbacks current without restarting the camera.
    onScanRef.current = onScan;
    onErrorRef.current = onError;

    useEffect(() => {
        const scanner = new Html5Qrcode('qr-reader');

        let disposed = false;
        let hasScanned = false;
        let pageSuspended = false;
        let needsReconcile = false;
        let reconcilePromise: Promise<void> | null = null;

        const scannerElement = document.getElementById('qr-reader');

        const updateVideoSize = () => {
            const video = scannerElement?.querySelector('video');

            if (!video) return;

            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.display = 'block';
            video.style.objectFit = 'cover';

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

            video.style.transform = isRearCamera
                ? 'none'
                : isFrontCamera
                  ? 'scaleX(-1)'
                  : 'none';

            video.style.transformOrigin = 'center';
        };

        const resizeObserver = scannerElement
            ? new ResizeObserver(() => {
                  requestAnimationFrame(updateVideoSize);
              })
            : null;

        if (scannerElement && resizeObserver) {
            resizeObserver.observe(scannerElement);
        }

        const shouldRun = () =>
            !disposed &&
            !hasScanned &&
            !pageSuspended &&
            document.visibilityState === 'visible';

        /**
         * Serialize camera startup and shutdown.
         * Only one reconciliation loop may run at a time.
         */
        const reconcile = (): Promise<void> => {
            needsReconcile = true;

            if (reconcilePromise) {
                return reconcilePromise;
            }

            reconcilePromise = (async () => {
                try {
                    while (needsReconcile) {
                        needsReconcile = false;

                        if (!shouldRun()) {
                            if (scanner.isScanning) {
                                try {
                                    await scanner.stop();
                                } catch (error) {
                                    console.warn(
                                        'QR scanner stop failed:',
                                        error,
                                    );
                                }
                            }

                            continue;
                        }

                        // Never start another camera session if one is active.
                        if (scanner.isScanning) {
                            updateVideoSize();
                            return;
                        }

                        try {
                            const cameras = await Html5Qrcode.getCameras();

                            // Visibility or component state may have changed
                            // while the browser was enumerating cameras.
                            if (!shouldRun()) {
                                needsReconcile = true;
                                continue;
                            }

                            if (cameras.length === 0) {
                                throw new Error(
                                    'No cameras were found on this device.',
                                );
                            }

                            const selectedCamera =
                                cameras.find((camera) =>
                                    /(back|rear|environment)/i.test(
                                        camera.label,
                                    ),
                                ) ?? cameras[0];

                            await scanner.start(
                                selectedCamera.id,
                                {
                                    fps: 10,
                                    qrbox: (
                                        viewfinderWidth,
                                        viewfinderHeight,
                                    ) => {
                                        const size = Math.max(
                                            1,
                                            Math.min(
                                                250,
                                                Math.floor(
                                                    viewfinderWidth * 0.7,
                                                ),
                                                Math.floor(
                                                    viewfinderHeight * 0.7,
                                                ),
                                            ),
                                        );

                                        return {
                                            width: size,
                                            height: size,
                                        };
                                    },
                                },
                                (decodedText) => {
                                    if (disposed || hasScanned) return;

                                    hasScanned = true;

                                    // Request camera cleanup before handing
                                    // the decoded value to the parent.
                                    void reconcile();
                                    onScanRef.current(decodedText);
                                },
                                () => {
                                    // Normal unsuccessful decode attempts
                                    // are expected while scanning.
                                },
                            );

                            if (!shouldRun()) {
                                needsReconcile = true;
                                continue;
                            }

                            updateVideoSize();
                        } catch (error) {
                            // A tab switch during startup is not a fatal
                            // scanner error. Reconcile the latest state.
                            if (!shouldRun()) {
                                needsReconcile = true;
                                continue;
                            }

                            console.error('QR scanner startup failed:', error);

                            onErrorRef.current?.(
                                'Unable to start the camera. Check the browser console for details.',
                            );

                            return;
                        }
                    }
                } finally {
                    reconcilePromise = null;

                    // Do not launch another camera operation while unmounting.
                    // Cleanup will handle the final stop and clear sequence.
                    if (needsReconcile && !disposed) {
                        void reconcile();
                    }
                }
            })();

            return reconcilePromise;
        };

        const handleVisibilityChange = () => {
            void reconcile();
        };

        const handlePageHide = () => {
            pageSuspended = true;
            void reconcile();
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                pageSuspended = false;
                void reconcile();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('pageshow', handlePageShow);

        void reconcile();

        return () => {
            disposed = true;

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('pageshow', handlePageShow);

            void (async () => {
                try {
                    // Wait until any pending startup or reconciliation finishes.
                    await reconcile();

                    // Stop the camera before clearing the scanner.
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }

                    // Never clear while scanning is still active.
                    if (scanner.isScanning) {
                        console.error(
                            'QR scanner cleanup aborted: scanner is still active.',
                        );
                        return;
                    }

                    scanner.clear();
                } catch (error) {
                    console.error('QR scanner cleanup failed:', error);
                } finally {
                    resizeObserver?.disconnect();
                }
            })();
        };
    }, []);

    return <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />;
}
