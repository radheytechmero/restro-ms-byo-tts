-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Restaurant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT,
    "mid" TEXT,
    "token" TEXT,
    "role" TEXT DEFAULT 'admin',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "opening_hours" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stt_model" TEXT NOT NULL DEFAULT 'deepgram',
    "stt_deepgram_language" TEXT DEFAULT 'en',
    "stt_deepgram_voice" TEXT DEFAULT 'aura',
    "stt_elevenlabs_api_key" TEXT,
    "stt_elevenlabs_voice_id" TEXT,
    "stt_openai_base_url" TEXT,
    "stt_openai_api_key" TEXT,
    "stt_openai_model" TEXT DEFAULT 'tts-1',
    "stt_openai_voice" TEXT DEFAULT 'alloy',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Restaurant" ("active", "createdAt", "email", "id", "location", "mid", "name", "opening_hours", "password", "phone", "role", "status", "token", "updatedAt") SELECT "active", "createdAt", "email", "id", "location", "mid", "name", "opening_hours", "password", "phone", "role", "status", "token", "updatedAt" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
