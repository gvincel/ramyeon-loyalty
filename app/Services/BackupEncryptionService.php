<?php

namespace App\Services;

use RuntimeException;

final class BackupEncryptionService
{
    private const NONCE_LENGTH = SODIUM_CRYPTO_SECRETBOX_NONCEBYTES;

    private const KEY_LENGTH = SODIUM_CRYPTO_SECRETBOX_KEYBYTES;

    private const MAGIC = "RCB1";

    public function encrypt(string $plaintext, string $key): string
    {
        $this->validateKey($key);

        $nonce = random_bytes(self::NONCE_LENGTH);

        $ciphertext = sodium_crypto_secretbox(
            $plaintext,
            $nonce,
            $key
        );

        return self::MAGIC . $nonce . $ciphertext;
    }

    public function decrypt(string $encrypted, string $key): string
    {
        $this->validateKey($key);

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
