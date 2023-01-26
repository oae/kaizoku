-- CreateTable
CREATE TABLE "OutOfSyncChapter" (
    "id" INTEGER NOT NULL,
    "mangaId" INTEGER NOT NULL,

    CONSTRAINT "OutOfSyncChapter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutOfSyncChapter" ADD CONSTRAINT "OutOfSyncChapter_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
