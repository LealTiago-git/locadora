/*
  Warnings:

  - The primary key for the `admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `client` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `movie` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `rental` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `clientId` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `movieId` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_admin" ("id", "password", "username") SELECT "id", "password", "username" FROM "admin";
DROP TABLE "admin";
ALTER TABLE "new_admin" RENAME TO "admin";
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");
CREATE TABLE "new_client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL
);
INSERT INTO "new_client" ("email", "id", "name", "phone") SELECT "email", "id", "name", "phone" FROM "client";
DROP TABLE "client";
ALTER TABLE "new_client" RENAME TO "client";
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");
CREATE TABLE "new_movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "duration" INTEGER NOT NULL
);
INSERT INTO "new_movie" ("description", "director", "duration", "id", "title") SELECT "description", "director", "duration", "id", "title" FROM "movie";
DROP TABLE "movie";
ALTER TABLE "new_movie" RENAME TO "movie";
CREATE TABLE "new_rental" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "rentalDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" DATETIME,
    CONSTRAINT "rental_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rental_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rental" ("clientId", "id", "movieId", "rentalDate", "returnDate") SELECT "clientId", "id", "movieId", "rentalDate", "returnDate" FROM "rental";
DROP TABLE "rental";
ALTER TABLE "new_rental" RENAME TO "rental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
