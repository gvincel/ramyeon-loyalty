# Ramyeon Corner: Disaster Recovery and Business Continuity Plan

## 1. Overview

This document serves as the official **Runbook** for recovering the Ramyeon Corner QR-Based Customer Loyalty and Rewards Management System in the event of a catastrophic server failure, data corruption, or total infrastructure loss.

Because this is a cloud-hosted web application, the client (the restaurant owner) does not need to manage local physical backups. The entire system can be rebuilt from scratch by an IT administrator in approximately 30 minutes.

## 2. Recovery Objectives

- **RPO (Recovery Point Objective):** Maximum **24 hours**. The system is configured to automatically create an encrypted backup and upload it to Google Drive every day at 2:00 AM.
- **RTO (Recovery Time Objective):** Under **30 minutes**. The time required to provision a new server, pull the source code, and restore the database from Google Drive.

## 3. The 3-2-1 Backup Strategy

To ensure business continuity, the system adheres to the industry-standard 3-2-1 rule:

- **3 Copies of Data:** Live Database, Local Server Backup, Offsite Cloud Backup.
- **2 Different Media:** SSD Server Storage (Hostinger/Z.com), and Cloud Object Storage (Google Drive).
- **1 Offsite Copy:** The Google Drive backup is geographically separated from the production server.

---

## 4. Prerequisites for Recovery

To perform a whole-system recovery, the IT Administrator must have access to:

1. **GitHub Repository:** `gvincel/ramyeon-loyalty` (Contains the latest source code).
2. **Google Drive Account:** `kingramyeoncornerbislig@gmail.com` (Contains the encrypted `.enc` database backups).
3. **Secure Offline Vault:** A password manager or encrypted offline storage containing the production `.env` file (which holds the MySQL passwords, `APP_KEY`, and Google Drive API credentials).
4. **New Server:** A provisioned Linux server with PHP 8.3+, Composer, Node.js, and MySQL.

---

## 5. Step-by-Step Recovery Playbook

### Phase 1: Recover the Application Code

_If the original web server is destroyed._

1. Access the new Linux server via SSH.

2. Clone the source code from GitHub:

```bash
git clone https://github.com/gvincel/ramyeon-loyalty.git
cd ramyeon-loyalty
```

3. Install PHP dependencies:

```bash
composer install --no-dev --optimize-autoloader
```

4. Build the frontend assets (Note: Hostinger/Z.com requires the single-thread flag to prevent memory crashes):

```bash
RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 npm run build
```

5. Set the correct folder permissions:

```bash
chmod -R u+rwX,go+rX storage bootstrap/cache
```

### Phase 2: Recover the Configuration

1. Retrieve the latest `.env` file from your secure offline vault.
2. Upload the `.env` file to the root of the new application directory.
3. Update the `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` inside `.env` to match the new server's database credentials.

### Phase 3: Rebuild the Empty Database

1. Create a new, empty MySQL database on the new server.
2. Run the Laravel migrations to build the empty tables:

```bash
php artisan migrate --force
```

3. Create a fresh Admin account to access the dashboard:

```bash
php artisan tinker
```

Run the following command inside Tinker:

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@ramyeon.com',
    'password' => bcrypt('secure_password'),
    'role' => 'admin'
]);
```

### Phase 4: Restore the Data (Offsite Cloud Backup)

1. Open a web browser and log into the dedicated Google Drive account (`kingramyeoncornerbislig@gmail.com`).
2. Download the most recent `ramyeon-backup-xxxx.enc` file.
3. Upload this `.enc` file to the new server's private storage directory:

```text
storage/app/private/backups/
```

4. Register the backup file in the database so the web interface recognizes it. Run:

```bash
php artisan tinker
```

Run the following command inside Tinker, replacing the `path` and `sha256` with the actual filename and the file's SHA-256 hash:

```php
\App\Models\BackupRecord::create([
    'backup_id' => 'manual-recovery-01',
    'status' => 'completed',
    'disk' => 'local',
    'path' => 'backups/ramyeon-backup-xxxx.enc', // Replace with actual filename
    'file_size_bytes' => 50000, // Replace with actual size
    'sha256' => 'fake-hash-for-now', // Replace with actual hash
    'encrypted' => true,
    'verified_at' => now(),
]);
```

5. Log into the Admin Dashboard on the new server.
6. Navigate to **Backup & Recovery**. You will see the backup record.
7. Click **Restore**. The system will automatically decrypt the file, verify the data, and repopulate the entire database.

### Phase 5: Update DNS

1. Update the domain DNS records (`ramyeon.bhrmsystem.com`) to point to the new server's IP address.
2. Clear the Laravel cache on the new server:

```bash
php artisan view:clear
php artisan route:clear
php artisan config:clear
```

3. The system is now fully recovered and live.

---

## 6. Emergency Contact

_If the client (Ramyeon Corner) experiences an outage, they should contact:_

**Developer/IT Support:**

- Gio Vince L. Lingaya
- gvincel.06@gmail.com
- 09453447920
