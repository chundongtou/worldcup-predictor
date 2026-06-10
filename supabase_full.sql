-- ============================================
-- FIFA World Cup 2026 Predictor - Supabase Schema + Seed
-- Run this in Supabase SQL Editor
-- ============================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flagCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "eloRating" INTEGER NOT NULL,
    "fifaRanking" INTEGER,
    "marketValue" DOUBLE PRECISION,
    "confederation" TEXT,
    "worldCupAppearances" INTEGER NOT NULL DEFAULT 0,
    "bestResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "groupName" TEXT,
    "matchday" INTEGER,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "matchTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "stadium" TEXT,
    "city" TEXT,
    "eloHome" INTEGER NOT NULL,
    "eloAway" INTEGER NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "matches_round_idx" ON "matches"("round");
CREATE INDEX "matches_groupName_idx" ON "matches"("groupName");
CREATE INDEX "matches_matchTime_idx" ON "matches"("matchTime");
CREATE INDEX "matches_status_idx" ON "matches"("status");

CREATE TABLE "ai_predictions" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "homeWinProb" DOUBLE PRECISION NOT NULL,
    "drawProb" DOUBLE PRECISION NOT NULL,
    "awayWinProb" DOUBLE PRECISION NOT NULL,
    "predictedHomeScore" INTEGER NOT NULL,
    "predictedAwayScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "topScores" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_predictions_matchId_key" ON "ai_predictions"("matchId");

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "favoriteTeam" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "correctPredictions" INTEGER NOT NULL DEFAULT 0,
    "totalPredictions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "user_predictions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "predHome" INTEGER NOT NULL,
    "predAway" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 5,
    "pointsEarned" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_predictions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_predictions_userId_matchId_key" ON "user_predictions"("userId", "matchId");

CREATE TABLE "points_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "points_log_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "matches" ADD CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "points_log" ADD CONSTRAINT "points_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "points_log" ADD CONSTRAINT "points_log_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- SEED DATA: 48 Teams
-- ============================================
INSERT INTO teams (id,name,"flagCode","groupName","eloRating","fifaRanking",confederation,"worldCupAppearances","bestResult","createdAt","updatedAt") VALUES
('t01','Mexico','MX','A',1862,22,'CONCACAF',17,'Quarter-finals',NOW(),NOW()),
('t02','South Africa','ZA','A',1520,62,'CAF',4,'Group stage',NOW(),NOW()),
('t03','South Korea','KR','A',1825,29,'AFC',11,'Semi-finals',NOW(),NOW()),
('t04','Czechia','CZ','A',1800,35,'UEFA',2,'Group stage',NOW(),NOW()),
('t05','Canada','CA','B',1680,43,'CONCACAF',2,'Group stage',NOW(),NOW()),
('t06','Bosnia & Herzegovina','BA','B',1595,55,'UEFA',1,'Group stage',NOW(),NOW()),
('t07','Qatar','QA','B',1690,50,'AFC',2,'Group stage',NOW(),NOW()),
('t08','Switzerland','CH','B',1818,31,'UEFA',12,'Quarter-finals',NOW(),NOW()),
('t09','Brazil','BR','C',1988,5,'CONMEBOL',23,'Champions',NOW(),NOW()),
('t10','Morocco','MA','C',1880,17,'CAF',7,'Semi-finals',NOW(),NOW()),
('t11','Haiti','HT','C',1380,87,'CONCACAF',1,'Group stage',NOW(),NOW()),
('t12','Scotland','SC','C',1805,34,'UEFA',9,'Group stage',NOW(),NOW()),
('t13','USA','US','D',1875,18,'CONCACAF',12,'Semi-finals',NOW(),NOW()),
('t14','Paraguay','PY','D',1650,49,'CONMEBOL',9,'Quarter-finals',NOW(),NOW()),
('t15','Australia','AU','D',1765,40,'AFC',7,'Round of 16',NOW(),NOW()),
('t16','Turkiye','TR','D',1810,33,'UEFA',3,'Semi-finals',NOW(),NOW()),
('t17','Germany','DE','E',1968,7,'UEFA',21,'Champions',NOW(),NOW()),
('t18','Curacao','CW','E',1340,95,'CONCACAF',0,'N/A',NOW(),NOW()),
('t19','Cote d''Ivoire','CI','E',1720,46,'CAF',4,'Group stage',NOW(),NOW()),
('t20','Ecuador','EC','E',1812,32,'CONMEBOL',4,'Round of 16',NOW(),NOW()),
('t21','Netherlands','NL','F',1955,8,'UEFA',11,'Runners-up',NOW(),NOW()),
('t22','Japan','JP','F',1885,16,'AFC',8,'Round of 16',NOW(),NOW()),
('t23','Sweden','SE','F',1845,25,'UEFA',12,'Runners-up',NOW(),NOW()),
('t24','Tunisia','TN','F',1640,52,'CAF',7,'Group stage',NOW(),NOW()),
('t25','Belgium','BE','G',1942,9,'UEFA',14,'Semi-finals',NOW(),NOW()),
('t26','Egypt','EG','G',1830,28,'CAF',4,'Group stage',NOW(),NOW()),
('t27','Iran','IR','G',1775,38,'AFC',7,'Group stage',NOW(),NOW()),
('t28','New Zealand','NZ','G',1500,70,'OFC',3,'Group stage',NOW(),NOW()),
('t29','Spain','ES','H',2155,1,'UEFA',17,'Champions',NOW(),NOW()),
('t30','Cabo Verde','CV','H',1420,78,'CAF',0,'N/A',NOW(),NOW()),
('t31','Saudi Arabia','SA','H',1720,45,'AFC',7,'Round of 16',NOW(),NOW()),
('t32','Uruguay','UY','H',1898,14,'CONMEBOL',14,'Champions',NOW(),NOW()),
('t33','France','FR','I',2062,3,'UEFA',17,'Champions',NOW(),NOW()),
('t34','Senegal','SN','I',1855,23,'CAF',4,'Quarter-finals',NOW(),NOW()),
('t35','Iraq','IQ','I',1560,63,'AFC',1,'Group stage',NOW(),NOW()),
('t36','Norway','NO','I',1835,27,'UEFA',4,'Round of 16',NOW(),NOW()),
('t37','Argentina','AR','J',2113,2,'CONMEBOL',18,'Champions',NOW(),NOW()),
('t38','Algeria','DZ','J',1610,54,'CAF',5,'Round of 16',NOW(),NOW()),
('t39','Austria','AT','J',1840,26,'UEFA',8,'Third place',NOW(),NOW()),
('t40','Jordan','JO','J',1510,66,'AFC',0,'N/A',NOW(),NOW()),
('t41','Portugal','PT','K',1975,6,'UEFA',9,'Third place',NOW(),NOW()),
('t42','DR Congo','CD','K',1540,61,'CAF',2,'Quarter-finals',NOW(),NOW()),
('t43','Uzbekistan','UZ','K',1570,59,'AFC',0,'N/A',NOW(),NOW()),
('t44','Colombia','CO','K',1910,12,'CONMEBOL',7,'Quarter-finals',NOW(),NOW()),
('t45','England','GB-ENG','L',2020,4,'UEFA',17,'Champions',NOW(),NOW()),
('t46','Croatia','HR','L',1930,10,'UEFA',7,'Runners-up',NOW(),NOW()),
('t47','Ghana','GH','L',1600,58,'CAF',4,'Quarter-finals',NOW(),NOW()),
('t48','Panama','PA','L',1620,56,'CONCACAF',2,'Group stage',NOW(),NOW());

-- ============================================
-- Note: Matches (104) and AI Predictions (72)
-- will be seeded by running:
--   cd worldcup-predictor
--   npx prisma db seed
-- after configuring DATABASE_URL
-- ============================================
