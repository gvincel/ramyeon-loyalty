<?php

namespace App\Services;

use RuntimeException;

final class BackupEncryptionService
{
    private const NONCE_LENGTH = \SODIUM_CRYPTO_SECRETBOX_NONCEBYTES;
    private const KEY_LENGTH = \SODIUM_CRYPTO_SECRETBOX_KEYBYTES;

    private const MAGIC = "RCB1";

    public function encrypt(string $plaintext, ?string $key = null): string
    {
        $key = $this->resolveKey($key);

        $nonce = random_bytes(self::NONCE_LENGTH);

        $ciphertext = sodium_crypto_secretbox(
            $plaintext,
            $nonce,
            $key
        );

        return self::MAGIC . $nonce . $ciphertext;
    }

    public function decrypt(string $encrypted, ?string $key = null): string
    {
        $key = $this->resolveKey($key);

        $minimumLength = strlen(self::MAGIC)
            + self::NONCE_LENGTH
            + SODIUM_CRYPTO_SECRETBOX_MACBYTES;

        if (
            strlen($encrypted) < $minimumLength
            || ! str_starts_with($encrypted, self::MAGIC)
        ) {
            throw new RuntimeException('Invalid encrypted backup format.');
        }

        $offset = strlen(self::MAGIC);

        $nonce = substr($encrypted, $offset, self::NONCE_LENGTH);

        $ciphertext = substr(
            $encrypted,
            $offset + self::NONCE_LENGTH
        );

        $plaintext = sodium_crypto_secretbox_open(
            $ciphertext,
            $nonce,
            $key
        );

        if ($plaintext === false) {
            throw new RuntimeException(
                'Backup decryption failed: invalid key or corrupted data.'
            );
        }

        return $plaintext;
    }


    private const STREAM_MAGIC = 'RCS1';

    private const STREAM_CHUNK_SIZE = 65536;

    public function encryptFile(
        string $inputPath,
        string $outputPath,
        ?string $key = null
    ): void {
        $key = $this->resolveKey($key);
        $input = null;
        $output = null;
        $success = false;
        $outputCreated = false;

        try {
            if ($inputPath === $outputPath || ! is_file($inputPath)) {
                throw new RuntimeException('Invalid backup input file.');
            }

            $input = fopen($inputPath, 'rb');

            if ($input === false) {
                throw new RuntimeException('Unable to open backup input file.');
            }

            if (file_exists($outputPath)) {
                throw new RuntimeException(
                    'Unable to create encrypted backup: the destination may already exist.'
                );
            }

            $output = @fopen($outputPath, 'xb');

            if ($output === false) {
                throw new RuntimeException(
                    'Unable to create encrypted backup: the destination may already exist.'
                );
            }

            $outputCreated = true;

            [$state, $header] =
                sodium_crypto_secretstream_xchacha20poly1305_init_push($key);

            $this->writeAll(
                $output,
                self::STREAM_MAGIC . $header
            );

            while (! feof($input)) {
                $chunk = fread($input, self::STREAM_CHUNK_SIZE);

                if ($chunk === false) {
                    throw new RuntimeException('Unable to read backup input.');
                }

                if ($chunk === '' && ! feof($input)) {
                    throw new RuntimeException('Unexpected end of backup input.');
                }

                if ($chunk === '') {
                    break;
                }

                $encryptedChunk =
                    sodium_crypto_secretstream_xchacha20poly1305_push(
                        $state,
                        $chunk,
                        '',
                        SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_MESSAGE
                    );

                $this->writeAll(
                    $output,
                    pack('N', strlen($encryptedChunk)) . $encryptedChunk
                );
            }

            // An authenticated final frame is required, even for empty files.
            $finalChunk =
                sodium_crypto_secretstream_xchacha20poly1305_push(
                    $state,
                    '',
                    '',
                    SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL
                );

            $this->writeAll(
                $output,
                pack('N', strlen($finalChunk)) . $finalChunk
            );

            if (! fflush($output)) {
                throw new RuntimeException('Unable to flush encrypted backup.');
            }

            $success = true;
        } finally {
            if (is_resource($input)) {
                fclose($input);
            }

            if (is_resource($output)) {
                fclose($output);
            }

            if (! $success && $outputCreated && is_file($outputPath)) {
                @unlink($outputPath);
            }
        }
    }

    public function decryptFile(
        string $inputPath,
        string $outputPath,
        ?string $key = null
    ): void {
        $key = $this->resolveKey($key);
        $input = null;
        $output = null;
        $success = false;
        $outputCreated = false;

        try {
            if ($inputPath === $outputPath || ! is_file($inputPath)) {
                throw new RuntimeException('Invalid encrypted backup input file.');
            }

            $input = fopen($inputPath, 'rb');

            if ($input === false) {
                throw new RuntimeException('Unable to open encrypted backup input.');
            }

            if (file_exists($outputPath)) {
                throw new RuntimeException(
                    'Unable to create decrypted backup: the destination may already exist.'
                );
            }

            $output = @fopen($outputPath, 'xb');

            if ($output === false) {
                throw new RuntimeException(
                    'Unable to create decrypted backup: the destination may already exist.'
                );
            }

            $outputCreated = true;

            $prefixLength = strlen(self::STREAM_MAGIC);
            $prefix = $this->readExact($input, $prefixLength);

            if ($prefix !== self::STREAM_MAGIC) {
                throw new RuntimeException('Invalid streaming backup format.');
            }

            $header = $this->readExact(
                $input,
                SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_HEADERBYTES
            );

            $state =
                sodium_crypto_secretstream_xchacha20poly1305_init_pull(
                    $header,
                    $key
                );

            $finalSeen = false;
            $maxFrameLength = self::STREAM_CHUNK_SIZE
                + SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES;

            while (! feof($input)) {
                $lengthBytes = $this->readExactOrEof($input, 4);

                if ($lengthBytes === '') {
                    break;
                }

                $unpacked = unpack('Nlength', $lengthBytes);
                $frameLength = $unpacked['length'] ?? 0;

                if (
                    $frameLength < SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES
                    || $frameLength > $maxFrameLength
                ) {
                    throw new RuntimeException('Invalid encrypted backup frame.');
                }

                $encryptedChunk = $this->readExact($input, $frameLength);

                $result =
                    sodium_crypto_secretstream_xchacha20poly1305_pull(
                        $state,
                        $encryptedChunk
                    );

                if ($result === false) {
                    throw new RuntimeException(
                        'Backup decryption failed: invalid key or corrupted data.'
                    );
                }

                [$plaintext, $tag] = $result;

                if (
                    $tag !== SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_MESSAGE
                    && $tag !== SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL
                ) {
                    throw new RuntimeException('Invalid encrypted backup tag.');
                }

                if ($tag === SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL) {
                    if (! feof($input)) {
                        $extra = fread($input, 1);

                        if ($extra === false || $extra !== '') {
                            throw new RuntimeException(
                                'Unexpected data after encrypted backup final frame.'
                            );
                        }
                    }

                    $finalSeen = true;
                }

                $this->writeAll($output, $plaintext);

                if ($finalSeen) {
                    break;
                }
            }

            if (! $finalSeen) {
                throw new RuntimeException(
                    'Encrypted backup is truncated or missing its final frame.'
                );
            }

            if (! fflush($output)) {
                throw new RuntimeException('Unable to flush decrypted backup.');
            }

            $success = true;
        } finally {
            if (is_resource($input)) {
                fclose($input);
            }

            if (is_resource($output)) {
                fclose($output);
            }

            if (! $success && $outputCreated && is_file($outputPath)) {
                @unlink($outputPath);
            }
        }
    }

    /**
     * Write all data to a stream.
     *
     * @param resource $stream
     */
    private function writeAll($stream, string $data): void
    {
        $length = strlen($data);
        $written = 0;

        while ($written < $length) {
            $count = fwrite($stream, substr($data, $written));

            if ($count === false || $count === 0) {
                throw new RuntimeException('Unable to write backup file.');
            }

            $written += $count;
        }
    }

    /**
     * Read an exact number of bytes from a stream.
     *
     * @param resource $stream
     */
    private function readExact($stream, int $length): string
    {
        $data = $this->readExactOrEof($stream, $length);

        if (strlen($data) !== $length) {
            throw new RuntimeException('Encrypted backup is truncated.');
        }

        return $data;
    }

    /**
     * Read bytes from a stream until the requested length or EOF.
     *
     * @param resource $stream
     */
    private function readExactOrEof($stream, int $length): string
    {
        $data = '';

        while (strlen($data) < $length && ! feof($stream)) {
            $chunk = fread($stream, $length - strlen($data));

            if ($chunk === false) {
                throw new RuntimeException('Unable to read encrypted backup.');
            }

            if ($chunk === '') {
                break;
            }

            $data .= $chunk;
        }

        return $data;
    }

    private function resolveKey(?string $key): string
    {
        if ($key === null) {
            $configuredKey = config('backup.encryption_key');

            if (! is_string($configuredKey) || $configuredKey === '') {
                throw new RuntimeException(
                    'Backup encryption key is not configured.'
                );
            }

            if (! str_starts_with($configuredKey, 'base64:')) {
                throw new RuntimeException(
                    'Backup encryption key must use the base64: format.'
                );
            }

            $decodedKey = base64_decode(
                substr($configuredKey, strlen('base64:')),
                true
            );

            if ($decodedKey === false) {
                throw new RuntimeException(
                    'Backup encryption key contains invalid Base64 data.'
                );
            }

            $key = $decodedKey;
        }

        $this->validateKey($key);

        return $key;
    }

    private function validateKey(string $key): void
    {
        if (strlen($key) !== self::KEY_LENGTH) {
            throw new RuntimeException(
                'Backup encryption key must be exactly '
                . self::KEY_LENGTH
                . ' bytes.'
            );
        }
    }
}
