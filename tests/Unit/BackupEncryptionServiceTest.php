<?php

namespace Tests\Unit;

use App\Services\BackupEncryptionService;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class BackupEncryptionServiceTest extends TestCase
{
    private BackupEncryptionService $service;

    private string $key;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new BackupEncryptionService();
        $this->key = random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
    }

    public function test_it_encrypts_and_decrypts_backup_content(): void
    {
        $plaintext = "-- Ramyeon Corner SQL backup\nSELECT * FROM users;";

        $encrypted = $this->service->encrypt($plaintext, $this->key);

        $this->assertNotSame($plaintext, $encrypted);
        $this->assertSame(
            $plaintext,
            $this->service->decrypt($encrypted, $this->key)
        );
    }

    public function test_each_encryption_uses_a_different_nonce(): void
    {
        $plaintext = 'same backup content';

        $first = $this->service->encrypt($plaintext, $this->key);
        $second = $this->service->encrypt($plaintext, $this->key);

        $this->assertNotSame($first, $second);
        $this->assertSame(
            $plaintext,
            $this->service->decrypt($first, $this->key)
        );
        $this->assertSame(
            $plaintext,
            $this->service->decrypt($second, $this->key)
        );
    }

    public function test_it_rejects_an_incorrect_key(): void
    {
        $encrypted = $this->service->encrypt(
            'sensitive backup content',
            $this->key
        );

        $wrongKey = random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Backup decryption failed');

        $this->service->decrypt($encrypted, $wrongKey);
    }

    public function test_it_rejects_tampered_ciphertext(): void
    {
        $encrypted = $this->service->encrypt(
            'sensitive backup content',
            $this->key
        );

        $lastIndex = strlen($encrypted) - 1;
        $encrypted[$lastIndex] = chr(ord($encrypted[$lastIndex]) ^ 1);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Backup decryption failed');

        $this->service->decrypt($encrypted, $this->key);
    }

    public function test_it_rejects_invalid_key_length(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('exactly');

        $this->service->encrypt('backup content', 'short-key');
    }

    public function test_it_rejects_invalid_encrypted_format(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Invalid encrypted backup format');

        $this->service->decrypt('not-an-encrypted-backup', $this->key);
    }
}
