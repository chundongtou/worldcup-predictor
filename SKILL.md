---
name: worldcup-self-evolving-agent
description: 2026世界杯预测端自进化引擎 - 赛后复盘、模型调优、准确率提升
tags: [worldcup, prediction, agent, self-evolution]
---

# 世界杯预测自进化 Agent

## Overview
This skill enables an AI agent to monitor and improve a FIFA World Cup 2026 prediction system. The agent automatically reviews matches after they finish, analyzes prediction errors, adjusts model weights, and generates reports.

## Architecture
- Prediction App: http://localhost:3000
- Python Engine: http://localhost:8000
- Agent API: http://localhost:3000/api/agent/*
- Auth: Bearer token wc2026-agent-secret

## Workflows

### 1. Post-Match Review (triggered after each match)
1. GET /api/agent/predictions-status to find unreviewed finished matches
2. For each match: compare AI prediction vs actual result
3. Analyze error sources (ELO miscalibration, tactical surprise, red cards, etc.)
4. Assign tags: #correct #upset #tactical #luck #injury
5. POST /api/agent/write-log with review
6. After 5+ reviews, trigger model tuning

### 2. Model Tuning
1. GET /api/agent/accuracy-report for recent performance
2. Compute per-model accuracy (Dixon-Coles, XGBoost, ELO, Market)
3. Adjust weights: increase good performers, decrease bad
4. POST /api/agent/update-weights with new weights
5. Call Python engine /predict-batch to re-predict remaining matches

### 3. Daily Deep Review (UTC 22:00)
1. Generate daily accuracy report
2. Compare vs betting market
3. Identify patterns (upset clusters, regional trends)
4. Write daily report

## API Endpoints
All endpoints require: Authorization: Bearer wc2026-agent-secret

- POST /api/agent/match-result - Record match result
- GET /api/agent/predictions-status - Get unreviewed matches
- POST /api/agent/update-weights - Update model weights
- POST /api/agent/write-log - Write review log
- GET /api/agent/accuracy-report - Get accuracy stats
- POST /api/agent/trigger - Manual trigger

## Model Weight Parameters
dixon_coles_weight (default 0.35)
xgboost_weight (default 0.25)
elo_weight (default 0.25)
market_weight (default 0.15)
home_advantage_bonus (default 100)
baseline_goals (default 1.3)
elo_decay_tau (default 0.002)

## Stage-Aware Weights
Group stage: Higher ELO weight (teams may rotate)
Knockout stage: Higher XGBoost weight (full strength, historical knockout data)

## Confidence Calibration
If model says 90% but actual is 70%, reduce confidence output by calibration factor.

## Prompt Template for Match Review
You are reviewing a World Cup 2026 match for the prediction system.

Match: {home} vs {away}
AI Prediction: {pred_home}-{pred_away} (confidence: {confidence}%)
Actual Result: {actual_home}-{actual_away}

Analysis:
1. Direction correct? {yes/no}
2. Score correct? {yes/no}
3. Error magnitude: {abs diff}
4. Root cause: {analyze}
5. Tags: {assign tags}
6. Lesson learned: {brief}
