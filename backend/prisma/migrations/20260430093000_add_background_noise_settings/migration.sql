-- Add restaurant-level background noise preferences for TTS calls.
ALTER TABLE "Restaurant" ADD COLUMN "background_noise_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Restaurant" ADD COLUMN "background_noise_type" TEXT;
