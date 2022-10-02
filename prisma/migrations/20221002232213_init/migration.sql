-- CreateTable
CREATE TABLE "Manga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "query" TEXT NOT NULL
);
