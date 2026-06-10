"""
FastAPI microservice for World Cup predictions.

Endpoints:
- POST /predict - Predict single match
- POST /predict-batch - Predict multiple matches
- GET /health - Health check
- GET /teams - Get available teams
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

from predict import predict_match, format_prediction, MatchPrediction
from data import get_team_elo, get_all_teams

# Initialize FastAPI app
app = FastAPI(
    title="World Cup Prediction API",
    description="API for predicting World Cup match outcomes using Dixon-Coles model",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class MatchRequest(BaseModel):
    """Request model for single match prediction."""
    home_elo: float = Field(..., description="Home team ELO rating", ge=1000, le=2500)
    away_elo: float = Field(..., description="Away team ELO rating", ge=1000, le=2500)
    home_name: str = Field(default="Home Team", description="Home team name")
    away_name: str = Field(default="Away Team", description="Away team name")
    is_neutral: bool = Field(default=False, description="Whether match is at neutral venue")


class MatchRequestByName(BaseModel):
    """Request model for prediction using team names."""
    home_team: str = Field(..., description="Home team name")
    away_team: str = Field(..., description="Away team name")
    is_neutral: bool = Field(default=False, description="Whether match is at neutral venue")


class BatchRequest(BaseModel):
    """Request model for batch predictions."""
    matches: List[MatchRequest]


class ScorePrediction(BaseModel):
    """Score prediction model."""
    home: int
    away: int
    probability: float


class PredictionResponse(BaseModel):
    """Response model for match prediction."""
    home_team: str
    away_team: str
    prediction: dict
    expected_goals: dict
    predicted_score: dict
    top_scores: List[ScorePrediction]
    confidence: float
    model_breakdown: dict


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    version: str
    models_loaded: dict


class TeamListResponse(BaseModel):
    """Response model for team list."""
    teams: List[dict]
    count: int


# API endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status and model availability
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": {
            "dixon_coles": True,
            "elo": True,
            "xgboost": False,  # Placeholder
            "market_odds": False,  # Placeholder
            "ensemble": True
        }
    }


@app.get("/teams", response_model=TeamListResponse)
async def get_teams():
    """
    Get list of available teams with ELO ratings.
    
    Returns:
        List of teams with their ELO ratings
    """
    teams = [
        {"name": name, "elo": elo}
        for name, elo in sorted(
            [(name, get_team_elo(name)) for name in get_all_teams()],
            key=lambda x: x[1],
            reverse=True
        )
    ]
    return {
        "teams": teams,
        "count": len(teams)
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(match: MatchRequest):
    """
    Predict match outcome.
    
    Args:
        match: Match details including ELO ratings and team names
        
    Returns:
        Prediction with probabilities, expected goals, and confidence
    """
    try:
        # Validate ELO ratings
        if match.home_elo < 1000 or match.home_elo > 2500:
            raise HTTPException(
                status_code=400,
                detail="Home ELO rating must be between 1000 and 2500"
            )
        if match.away_elo < 1000 or match.away_elo > 2500:
            raise HTTPException(
                status_code=400,
                detail="Away ELO rating must be between 1000 and 2500"
            )
        
        # Generate prediction
        prediction = predict_match(
            home_elo=match.home_elo,
            away_elo=match.away_elo,
            home_name=match.home_name,
            away_name=match.away_name,
            is_neutral=match.is_neutral
        )
        
        # Format response
        result = format_prediction(prediction, match.home_name, match.away_name)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@app.post("/predict-by-name", response_model=PredictionResponse)
async def predict_by_name(match: MatchRequestByName):
    """
    Predict match outcome using team names.
    
    Args:
        match: Match details with team names
        
    Returns:
        Prediction with probabilities, expected goals, and confidence
    """
    try:
        # Get ELO ratings from team names
        home_elo = get_team_elo(match.home_team)
        away_elo = get_team_elo(match.away_team)
        
        # Generate prediction
        prediction = predict_match(
            home_elo=home_elo,
            away_elo=away_elo,
            home_name=match.home_team,
            away_name=match.away_team,
            is_neutral=match.is_neutral
        )
        
        # Format response
        result = format_prediction(prediction, match.home_team, match.away_team)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@app.post("/predict-batch")
async def predict_batch(batch: BatchRequest):
    """
    Predict multiple matches at once.
    
    Args:
        batch: List of match details
        
    Returns:
        List of predictions
    """
    try:
        predictions = []
        
        for match in batch.matches:
            # Generate prediction
            prediction = predict_match(
                home_elo=match.home_elo,
                away_elo=match.away_elo,
                home_name=match.home_name,
                away_name=match.away_name,
                is_neutral=match.is_neutral
            )
            
            # Format and add to results
            result = format_prediction(prediction, match.home_name, match.away_name)
            predictions.append(result)
        
        return {
            "predictions": predictions,
            "count": len(predictions)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction error: {str(e)}"
        )


# Run with: python api.py
if __name__ == "__main__":
    print("Starting World Cup Prediction API...")
    print("API documentation: http://localhost:8000/docs")
    print("Health check: http://localhost:8000/health")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
