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
            }
        };

        const startScanner = async () => {
            try {
                startPromise = scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
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