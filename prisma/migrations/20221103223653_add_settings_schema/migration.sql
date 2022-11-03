-- CreateTable
CREATE TABLE "Settings" (
  "id" SERIAL NOT NULL,
  "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
  "telegramToken" TEXT,
  "telegramChatId" TEXT,
  "telegramSendSilently" BOOLEAN NOT NULL DEFAULT false,
  "appriseEnabled" BOOLEAN NOT NULL DEFAULT false,
  "appriseHost" TEXT,
  "appriseUrls" TEXT [] DEFAULT ARRAY [] :: TEXT [],
  "komgaEnabled" BOOLEAN NOT NULL DEFAULT false,
  "komgaHost" TEXT,
  "komgaUser" TEXT,
  "komgaPassword" TEXT,
  CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO
  "Settings" (
    id,
    "telegramEnabled",
    "telegramToken",
    "telegramChatId",
    "telegramSendSilently",
    "appriseEnabled",
    "appriseHost",
    "appriseUrls",
    "komgaEnabled",
    "komgaHost",
    "komgaUser",
    "komgaPassword"
  )
VALUES
  (
    1,
    false,
    null,
    null,
    false,
    false,
    null,
    '{}',
    false,
    null,
    null,
    null
  );