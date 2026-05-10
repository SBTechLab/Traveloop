-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "coverPhoto" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareSlug" TEXT,
    "budgetCap" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "costIndex" REAL NOT NULL,
    "popularity" REAL NOT NULL,
    "coverPhoto" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "arrivalDate" DATETIME NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Stop_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "durationHours" REAL NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    CONSTRAINT "Activity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StopActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stopId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "scheduledTime" TEXT,
    "notes" TEXT,
    CONSTRAINT "StopActivity_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StopActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PackingItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TripNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "stopId" TEXT,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripNote_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TripNote_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TripNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TripBudget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "transportCost" REAL NOT NULL DEFAULT 0,
    "stayCost" REAL NOT NULL DEFAULT 0,
    "mealsCost" REAL NOT NULL DEFAULT 0,
    "miscCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TripBudget_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_shareSlug_key" ON "Trip"("shareSlug");

-- CreateIndex
CREATE UNIQUE INDEX "TripBudget_tripId_key" ON "TripBudget"("tripId");
