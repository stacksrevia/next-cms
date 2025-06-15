/*
  Warnings:

  - You are about to drop the `page_modules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_modules" DROP CONSTRAINT "page_modules_pageId_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_languageId_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_parentId_fkey";

-- DropTable
DROP TABLE "page_modules";

-- DropTable
DROP TABLE "pages";

-- DropEnum
DROP TYPE "ModuleType";

-- CreateTable
CREATE TABLE "GlobalPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "globalPageId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageModule" (
    "id" TEXT NOT NULL,
    "pageContentId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_old" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "parentId" TEXT,
    "languageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_old_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPage_slug_key" ON "GlobalPage"("slug");

-- CreateIndex
CREATE INDEX "GlobalPage_parentId_order_idx" ON "GlobalPage"("parentId", "order");

-- CreateIndex
CREATE INDEX "PageContent_globalPageId_idx" ON "PageContent"("globalPageId");

-- CreateIndex
CREATE INDEX "PageContent_languageId_idx" ON "PageContent"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_globalPageId_languageId_key" ON "PageContent"("globalPageId", "languageId");

-- CreateIndex
CREATE INDEX "PageModule_pageContentId_order_idx" ON "PageModule"("pageContentId", "order");

-- CreateIndex
CREATE INDEX "PageModule_languageId_idx" ON "PageModule"("languageId");

-- CreateIndex
CREATE INDEX "page_old_languageId_idx" ON "page_old"("languageId");

-- CreateIndex
CREATE INDEX "page_old_parentId_idx" ON "page_old"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "page_old_slug_languageId_key" ON "page_old"("slug", "languageId");

-- AddForeignKey
ALTER TABLE "GlobalPage" ADD CONSTRAINT "GlobalPage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GlobalPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_globalPageId_fkey" FOREIGN KEY ("globalPageId") REFERENCES "GlobalPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageModule" ADD CONSTRAINT "PageModule_pageContentId_fkey" FOREIGN KEY ("pageContentId") REFERENCES "PageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageModule" ADD CONSTRAINT "PageModule_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
