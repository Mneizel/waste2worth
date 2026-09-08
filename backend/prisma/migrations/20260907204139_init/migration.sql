-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ItemVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "diameterMm" INTEGER NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'GLOBAL',
    "typicalContents" TEXT NOT NULL DEFAULT 'water',
    "isCommon" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemVariant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
    "minAge" INTEGER NOT NULL DEFAULT 6,
    "finalImageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "model3dUrl" TEXT NOT NULL,
    "model3dPreviewUrl" TEXT NOT NULL,
    "safetyNotes" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IdeaVariant" (
    "ideaId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    PRIMARY KEY ("ideaId", "variantId"),
    CONSTRAINT "IdeaVariant_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ItemVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdeaTool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'tool',
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "quantity" TEXT NOT NULL DEFAULT '1',
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "IdeaTool_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdeaStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "tip" TEXT NOT NULL DEFAULT '',
    "warning" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeaStep_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "imageFilename" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageMimeType" TEXT NOT NULL,
    "imageSizeBytes" INTEGER NOT NULL,
    "imageSha256" TEXT NOT NULL,
    "aiCategoryKey" TEXT,
    "aiGuessLabel" TEXT,
    "aiGuessVolumeMl" INTEGER,
    "aiConfidence" REAL,
    "aiRawJson" TEXT NOT NULL DEFAULT '{}',
    "aiGuessVariantId" TEXT,
    "confirmedVariantId" TEXT,
    "selectedIdeaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scan_aiGuessVariantId_fkey" FOREIGN KEY ("aiGuessVariantId") REFERENCES "ItemVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Scan_confirmedVariantId_fkey" FOREIGN KEY ("confirmedVariantId") REFERENCES "ItemVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Scan_selectedIdeaId_fkey" FOREIGN KEY ("selectedIdeaId") REFERENCES "Idea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanEvent_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_key_key" ON "ItemCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ItemVariant_key_key" ON "ItemVariant"("key");

-- CreateIndex
CREATE INDEX "ItemVariant_categoryId_idx" ON "ItemVariant"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Idea_slug_key" ON "Idea"("slug");

-- CreateIndex
CREATE INDEX "IdeaVariant_variantId_idx" ON "IdeaVariant"("variantId");

-- CreateIndex
CREATE INDEX "IdeaTool_ideaId_idx" ON "IdeaTool"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaStep_ideaId_idx" ON "IdeaStep"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaStep_ideaId_stepNumber_key" ON "IdeaStep"("ideaId", "stepNumber");

-- CreateIndex
CREATE INDEX "Scan_status_idx" ON "Scan"("status");

-- CreateIndex
CREATE INDEX "ScanEvent_scanId_idx" ON "ScanEvent"("scanId");
