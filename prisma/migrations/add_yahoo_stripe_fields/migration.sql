-- Yahoo OAuth fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sub" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yah" TEXT;

-- Stripe field (may already exist, safe with IF NOT EXISTS)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "User_sub_key" ON "User"("sub");
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- Add indexes for lookups
CREATE INDEX IF NOT EXISTS "User_sub_idx" ON "User"("sub");
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

