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

        const stopScanner = async () => {
            try {
                if (startPromise) {
                    await startPromise.catch(() => {});
                }

                if (stopPromise) {
                    await stopPromise.catch(() => {});
                } else if (scanner.isScanning) {
                    stopPromise = scanner.stop();
                    await stopPromise.catch(() => {});
                }
            } finally {
                try {
                    scanner.clear();
                } catch {
                    // Scanner may already be cleared.
                }

                resizeObserver?.disconnect();
            }
        };

        const startScanner = async () => {
            try {
                startPromise = scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
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

                        try {
                            if (scanner.isScanning) {
                                stopPromise = scanner.stop();
                                await stopPromise;
                            }
                        } catch {
                            // Scanner may already be stopping.
                        }

                        if (!isUnmounted) {
                            onScan(decodedText);
                        }
                    },
                    () => {
                        // Ignore normal scanning failures.
                    },
                );

                await startPromise;

                updateVideoSize();
            } catch {
                if (!isUnmounted) {
                    onError?.(
                        'Unable to access the camera. Please allow camera access and try again.',
                    );
                }
            }
        };

        startScanner();

        return () => {
            isUnmounted = true;
            void stopScanner();
        };
    }, [onScan, onError]);

    return (
        <div
            id="qr-reader"
            className="w-full overflow-hidden rounded-lg"
        />
    );
}