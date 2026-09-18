import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (errorMessage: string) => void;
}

export default function QRScanner({
    onScan,
    onError,
}: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const hasScannedRef = useRef(false);

    useEffect(() => {
        const scanner = new Html5Qrcode('qr-reader');

        scannerRef.current = scanner;

        const startScanner = async () => {
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        if (hasScannedRef.current) {
                            return;
                        }

                        hasScannedRef.current = true;

                        onScan(decodedText);

                        scanner
                            .stop()
                            .catch(() => {});
                    },
                    () => {
                        // Ignore normal scanning failures.
                    },
                );
            } catch (error) {
                onError?.(
                    'Unable to access the camera. Please allow camera access and try again.',
                );
            }
        };

        startScanner();

        return () => {
            if (scanner.isScanning) {
                scanner.stop().catch(() => {});
            }

            scanner.clear();
        };
    }, [onScan, onError]);

    return (
        <div
            id="qr-reader"
            className="w-full overflow-hidden rounded-lg"
        />
    );
}