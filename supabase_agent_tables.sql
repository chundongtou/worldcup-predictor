-- =============================================================
-- Self-Evolving Agent Tables for World Cup Predictor
-- Run this SQL in the Supabase SQL Editor to create the tables
-- =============================================================

-- 1. match_reviews: Post-match analysis and error tracking
CREATE TABLE "match_reviews" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "tags" TEXT[],
    "predictionErrorHome" INTEGER,
    "predictionErrorAway" INTEGER,
    "directionCorrect" BOOLEAN,
    "scoreCorrect" BOOLEAN,
    "surpriseLevel" INTEGER,
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "match_reviews_pkey" PRIMARY KEY ("id")
);

-- 2. model_weights: Versioned model parameter snapshots
CREATE TABLE "model_weights" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "dixonColesWeight" DOUBLE PRECISION NOT NULL,
    "xgboostWeight" DOUBLE PRECISION NOT NULL,
    "eloWeight" DOUBLE PRECISION NOT NULL,
    "marketWeight" DOUBLE PRECISION NOT NULL,
    "homeAdvantageBonus" DOUBLE PRECISION NOT NULL,
    "baselineGoals" DOUBLE PRECISION NOT NULL,
    "eloDecayTau" DOUBLE PRECISION NOT NULL,
    "updatedReason" TEXT,
    "accuracyBefore" DOUBLE PRECISION,
    "accuracyAfter" DOUBLE PRECISION,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "model_weights_pkey" PRIMARY KEY ("id")
);

-- 3. model_performance: Daily accuracy metrics per stage
CREATE TABLE "model_performance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "stage" TEXT,
    "totalPredictions" INTEGER NOT NULL DEFAULT 0,
    "directionCorrect" INTEGER NOT NULL DEFAULT 0,
    "scoreCorrect" INTEGER NOT NULL DEFAULT 0,
    "dixonColesAccuracy" DOUBLE PRECISION,
    "xgboostAccuracy" DOUBLE PRECISION,
    "eloAccuracy" DOUBLE PRECISION,
    "marketAccuracy" DOUBLE PRECISION,
    "avgConfidence" DOUBLE PRECISION,
    "calibrationError" DOUBLE PRECISION,

    CONSTRAINT "model_performance_pkey" PRIMARY KEY ("id")
);

-- 4. agent_actions: Audit log of all agent self-modification actions
CREATE TABLE "agent_actions" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "triggerEvent" TEXT,
    "detailsJson" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "agent_actions_pkey" PRIMARY KEY ("id")
);

-- 5. team_states: Current form, injuries, and tactical context per team
CREATE TABLE "team_states" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "currentForm" INTEGER NOT NULL DEFAULT 5,
    "injuries" TEXT,
    "tacticalNotes" TEXT,
    "lastUpdated" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "team_states_pkey" PRIMARY KEY ("id")
);

-- =============================================================
-- Foreign Keys
-- =============================================================

ALTER TABLE "match_reviews" ADD CONSTRAINT "match_reviews_matchId_fkey"
    FOREIGN KEY ("matchId") REFERENCES "matches"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "team_states" ADD CONSTRAINT "team_states_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "teams"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX "match_reviews_matchId_idx" ON "match_reviews"("matchId");
CREATE INDEX "match_reviews_reviewedAt_idx" ON "match_reviews"("reviewedAt");
CREATE INDEX "match_reviews_directionCorrect_idx" ON "match_reviews"("directionCorrect");

CREATE INDEX "model_weights_version_idx" ON "model_weights"("version");
CREATE INDEX "model_weights_createdAt_idx" ON "model_weights"("createdAt");

CREATE INDEX "model_performance_date_idx" ON "model_performance"("date");
CREATE INDEX "model_performance_stage_idx" ON "model_performance"("stage");

CREATE INDEX "agent_actions_actionType_idx" ON "agent_actions"("actionType");
CREATE INDEX "agent_actions_createdAt_idx" ON "agent_actions"("createdAt");

CREATE INDEX "team_states_teamId_idx" ON "team_states"("teamId");
CREATE UNIQUE INDEX "team_states_teamId_key" ON "team_states"("teamId");

-- =============================================================
-- Disable Row Level Security (Supabase uses REST API with service key)
-- =============================================================

ALTER TABLE "match_reviews" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "model_weights" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "model_performance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_actions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "team_states" DISABLE ROW LEVEL SECURITY;

-- =============================================================
-- Seed: Initial model weights v1.0
-- =============================================================

INSERT INTO "model_weights" (
    "id",
    "version",
    "dixonColesWeight",
    "xgboostWeight",
    "eloWeight",
    "marketWeight",
    "homeAdvantageBonus",
    "baselineGoals",
    "eloDecayTau",
    "updatedReason",
    "createdAt"
) VALUES (
    'weights-v1.0-seed',
    'v1.0',
    0.35,
    0.25,
    0.25,
    0.15,
    100.0,
    1.3,
    0.002,
    'Initial baseline weights',
    now()
);
