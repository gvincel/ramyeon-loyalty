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


    public function test_it_stream_encrypts_and_decrypts_a_file(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-plain-');
        $encrypted = tempnam(sys_get_temp_dir(), 'ramyeon-encrypted-');
        $decrypted = tempnam(sys_get_temp_dir(), 'ramyeon-restored-');

        unlink($encrypted);
        unlink($decrypted);

        try {
            $plaintext = str_repeat(
                "-- Ramyeon Corner backup test data\n",
                10000
            );

            file_put_contents($input, $plaintext);

            $this->service->encryptFile($input, $encrypted, $this->key);
            $this->service->decryptFile($encrypted, $decrypted, $this->key);

            $this->assertNotSame(
                $plaintext,
                file_get_contents($encrypted)
            );
            $this->assertSame(
                $plaintext,
                file_get_contents($decrypted)
            );
        } finally {
            @unlink($input);
            @unlink($encrypted);
            if (is_file($decrypted)) {
                unlink($decrypted);
            }
        }
    }

    public function test_it_rejects_tampered_streaming_encrypted_files(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-plain-');
        $encrypted = tempnam(sys_get_temp_dir(), 'ramyeon-encrypted-');
        $decrypted = tempnam(sys_get_temp_dir(), 'ramyeon-restored-');

        unlink($encrypted);
        unlink($decrypted);

        try {
            file_put_contents($input, 'sensitive backup content');

            $this->service->encryptFile($input, $encrypted, $this->key);

            $contents = file_get_contents($encrypted);
            $this->assertNotFalse($contents);
            $this->assertGreaterThan(0, strlen($contents));

            $contents[strlen($contents) - 1] =
                chr(ord($contents[strlen($contents) - 1]) ^ 1);

            file_put_contents($encrypted, $contents);

            $this->expectException(RuntimeException::class);
            $this->service->decryptFile(
                $encrypted,
                $decrypted,
                $this->key
            );
        } finally {
            @unlink($input);
            @unlink($encrypted);
            if (is_file($decrypted)) {
                unlink($decrypted);
            }
        }
    }

    public function test_it_rejects_truncated_streaming_encrypted_files(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-plain-');
        $encrypted = tempnam(sys_get_temp_dir(), 'ramyeon-encrypted-');
        $decrypted = tempnam(sys_get_temp_dir(), 'ramyeon-restored-');

        unlink($encrypted);
        unlink($decrypted);

        try {
            file_put_contents(
                $input,
                str_repeat('backup data ', 100)
            );

            $this->service->encryptFile($input, $encrypted, $this->key);

            $contents = file_get_contents($encrypted);
            $this->assertNotFalse($contents);
            $this->assertGreaterThan(1, strlen($contents));

            file_put_contents(
                $encrypted,
                substr($contents, 0, -1)
            );

            $this->expectException(RuntimeException::class);
            $this->service->decryptFile(
                $encrypted,
                $decrypted,
                $this->key
            );
        } finally {
            @unlink($input);
            @unlink($encrypted);
            if (is_file($decrypted)) {
                unlink($decrypted);
            }
        }
    }

    public function test_it_does_not_overwrite_an_existing_encrypted_file(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-plain-');
        $output = tempnam(sys_get_temp_dir(), 'ramyeon-existing-');
        unlink($output);

        $originalContents = 'This existing file must remain unchanged.';

        try {
            file_put_contents($input, 'backup data to encrypt');
            file_put_contents($output, $originalContents);

            try {
                $this->service->encryptFile($input, $output, $this->key);
                $this->fail('Expected encryption to refuse an existing destination.');
            } catch (RuntimeException $exception) {
                $this->assertStringContainsString(
                    'destination may already exist',
                    $exception->getMessage()
                );
            }

            $this->assertSame(
                $originalContents,
                file_get_contents($output)
            );
        } finally {
            if (is_file($input)) {
                unlink($input);
            }

            if (is_file($output)) {
                unlink($output);
            }
        }
    }


    public function test_it_does_not_overwrite_an_existing_decrypted_file(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-encrypted-');
        $output = tempnam(sys_get_temp_dir(), 'ramyeon-existing-');

        try {
            file_put_contents($input, 'invalid encrypted backup');

            $originalContents = 'This existing file must remain unchanged.';
            file_put_contents($output, $originalContents);

            try {
                $this->service->decryptFile($input, $output, $this->key);
                $this->fail('Expected decryption to refuse an existing destination.');
            } catch (RuntimeException $exception) {
                $this->assertStringContainsString(
                    'destination may already exist',
                    $exception->getMessage()
                );
            }

            $this->assertSame(
                $originalContents,
                file_get_contents($output)
            );
        } finally {
            if (is_file($input)) {
                unlink($input);
            }

            if (is_file($output)) {
                unlink($output);
            }
        }
    }

    public function test_it_removes_partial_output_after_failed_decryption(): void
    {
        $input = tempnam(sys_get_temp_dir(), 'ramyeon-plain-');
        $encrypted = tempnam(sys_get_temp_dir(), 'ramyeon-encrypted-');
        $decrypted = tempnam(sys_get_temp_dir(), 'ramyeon-restored-');

        unlink($encrypted);
        unlink($decrypted);

        try {
            file_put_contents($input, 'backup content that will be corrupted');

            $this->service->encryptFile($input, $encrypted, $this->key);

            $contents = file_get_contents($encrypted);
            $this->assertNotFalse($contents);
            $this->assertGreaterThan(0, strlen($contents));

            $contents[strlen($contents) - 1] =
                chr(ord($contents[strlen($contents) - 1]) ^ 1);

            file_put_contents($encrypted, $contents);

            try {
                $this->service->decryptFile(
                    $encrypted,
                    $decrypted,
                    $this->key
                );

                $this->fail('Expected decryption to reject corrupted data.');
            } catch (RuntimeException) {
                $this->assertFileDoesNotExist($decrypted);
            }
        } finally {
            @unlink($input);
            @unlink($encrypted);

            if (is_file($decrypted)) {
                unlink($decrypted);
            }
        }
    }
}
