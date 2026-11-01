
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | MySQL Dump Utility
    |--------------------------------------------------------------------------
    |
    | Set MYSQLDUMP_PATH in the environment to the location of the
    | mysqldump executable available on the server.
    |
    */

    'mysqldump_path' => env('MYSQLDUMP_PATH', 'mysqldump'),

    /*
    |--------------------------------------------------------------------------
    | Backup Storage
    |--------------------------------------------------------------------------
    |
    | Store database backups in Laravel's private local storage,
    | not inside the publicly accessible public directory.
    |
    */

    'connection' => env('BACKUP_DATABASE_CONNECTION'),

    'restore_connection' => env('BACKUP_RESTORE_CONNECTION'),

    'disk' => 'local',

    'directory' => 'backups',

    'encryption_key' => env('BACKUP_ENCRYPTION_KEY'),

];
