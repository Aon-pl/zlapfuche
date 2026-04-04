-- Super-Fuchowicz: Program lojalnościowy i grywalizacja

-- 1. Dodaj pola do tabeli users
ALTER TABLE `users` 
ADD COLUMN `is_super_fuchowicz` BOOLEAN DEFAULT FALSE,
ADD COLUMN `super_fuchowicz_granted_by` VARCHAR(255) NULL,
ADD COLUMN `super_fuchowicz_granted_at` DATETIME NULL;

-- 2. Zaktualizuj enum ApplicationStatus - dodaj 'completed'
-- MySQL wymaga przebudowania tabeli dla enum, więc użyj MODIFY:
ALTER TABLE `applications` MODIFY COLUMN `status` 
ENUM('pending', 'viewed', 'accepted', 'rejected', 'completed') 
DEFAULT 'pending';

-- 3. Dodaj pole mobile_image_url do tabeli banners
ALTER TABLE `banners` 
ADD COLUMN `mobile_image_url` VARCHAR(500) NULL;
