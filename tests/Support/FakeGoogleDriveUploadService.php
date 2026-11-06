<?php

namespace Tests\Support;

use App\Models\BackupRecord;
use App\Services\GoogleDriveAuthService;
use App\Services\GoogleDriveUploadService;
use Throwable;

class FakeGoogleDriveUploadService extends GoogleDriveUploadService
{
    /** @var list<string> */
    public array $uploadCalls = [];

    public function __construct(
        GoogleDriveAuthService $auth,
        public readonly ?string $returnId = null,
        public readonly ?Throwable $throw = null,
    ) {
        parent::__construct($auth);
    }

    protected function performUpload(BackupRecord $record): string
    {
        $this->uploadCalls[] = $record->backup_id;

        if ($this->throw !== null) {
            throw $this->throw;
        }

        return $this->returnId ?? 'drive-file-' . $record->backup_id;
    }
}