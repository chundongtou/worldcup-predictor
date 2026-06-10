"""
World Cup Prediction Engine - Dixon-Coles Modified Poisson Model

This module implements the core prediction logic using multiple models:
1. Dixon-Coles modified Poisson model
2. ELO direct prediction model
3. XGBoost classifier (stub)
4. Market odds placeholder
5. Ensemble combination
"""

import math
import numpy as np
from scipy.stats import poisson
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


# Model constants
BASELINE_GOALS = 1.3
HOME_ADVANTAGE = 100  # ELO points
TAU = 0.002  # Decay factor
RHO = 0.001  # Dixon-Coles dependency parameter


@dataclass
class MatchPrediction:
    """Data class for match predictions."""
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    home_expected_goals: float
    away_expected_goals: float
    predicted_home_goals: int
    predicted_away_goals: int
    confidence: float
    top_scores: List[Tuple[int, int, float]]
    model_breakdown: Dict[str, Dict[str, float]]


class DixonColesPredictor:
    """
    Dixon-Coles modified Poisson model for football match prediction.
    """
    
    def __init__(self, baseline_goals: float = BASELINE_GOALS,
                 home_advantage: float = HOME_ADVANTAGE,
                 tau: float = TAU,
                 rho: float = RHO):
        self.baseline_goals = baseline_goals
        self.home_advantage = home_advantage
        self.tau = tau
        self.rho = rho
        self.alpha = 0.15  # Scaling factor for ELO difference
    
    def calculate_expected_goals(self, home_elo: float, away_elo: float,
                                  is_neutral: bool = False) -> Tuple[float, float]:
        """
        Calculate expected goals for home and away teams using ELO ratings.
        
        Args:
            home_elo: Home team ELO rating
            away_elo: Away team ELO rating
            is_neutral: Whether the match is at a neutral venue
            
        Returns:
            Tuple of (home_expected_goals, away_expected_goals)
        """
        # Apply home advantage if not neutral
        effective_home_elo = home_elo + (0 if is_neutral else self.home_advantage)
        
        # ELO difference
        elo_diff = effective_home_elo - away_elo
        
        # Expected goals using exponential model
        lambda_home = self.baseline_goals * math.exp(self.alpha * elo_diff / 400)
        lambda_away = self.baseline_goals * math.exp(-self.alpha * elo_diff / 400)
        
        return lambda_home, lambda_away
    
    def tau_function(self, x: int, y: int, lambda_x: float, lambda_y: float) -> float:
        """
        Dixon-Coles tau function for low-score correlation adjustment.
        """
        if x == 0 and y == 0:
            return 1 - lambda_x * lambda_y * self.rho
        elif x == 0 and y == 1:
            return 1 + lambda_x * self.rho
        elif x == 1 and y == 0:
            return 1 + lambda_y * self.rho
        elif x == 1 and y == 1:
            return 1 - self.rho
        else:
            return 1.0
    
    def calculate_score_probabilities(self, lambda_home: float, lambda_away: float,
                                      max_goals: int = 5) -> np.ndarray:
        """
        Calculate probability matrix for all score combinations.
        
        Args:
            lambda_home: Expected goals for home team
            lambda_away: Expected goals for away team
            max_goals: Maximum number of goals to consider
            
        Returns:
            Matrix of probabilities for each score combination
        """
        # Base Poisson probabilities
        prob_matrix = np.zeros((max_goals + 1, max_goals + 1))
        
        for i in range(max_goals + 1):
            for j in range(max_goals + 1):
                # Poisson probabilities
                p_home = poisson.pmf(i, lambda_home)
                p_away = poisson.pmf(j, lambda_away)
                
                # Apply Dixon-Coles tau adjustment
                tau = self.tau_function(i, j, lambda_home, lambda_away)
                
                prob_matrix[i, j] = p_home * p_away * tau
        
        # Normalize to ensure probabilities sum to 1
        total = prob_matrix.sum()
        if total > 0:
            prob_matrix /= total
        
        return prob_matrix
    
    def predict(self, home_elo: float, away_elo: float,
                is_neutral: bool = False) -> Dict[str, float]:
        """
        Predict match outcome probabilities using Dixon-Coles model.
        
        Returns:
            Dictionary with win, draw, and loss probabilities
        """
        lambda_home, lambda_away = self.calculate_expected_goals(home_elo, away_elo, is_neutral)
        prob_matrix = self.calculate_score_probabilities(lambda_home, lambda_away)
        
        # Calculate outcome probabilities
        home_win = sum(prob_matrix[i, j] for i in range(6) for j in range(6) if i > j)
        draw = sum(prob_matrix[i, i] for i in range(6))
        away_win = sum(prob_matrix[i, j] for i in range(6) for j in range(6) if i < j)
        
        return {
            'home_win': home_win,
            'draw': draw,
            'away_win': away_win,
            'lambda_home': lambda_home,
            'lambda_away': lambda_away,
            'prob_matrix': prob_matrix
        }


class ELOPredictor:
    """
    Direct ELO-based prediction model.
    """
    
    def __init__(self):
        self.draw_factor = 0.3
        self.draw_decay = 400
    
    def predict(self, home_elo: float, away_elo: float,
                is_neutral: bool = False) -> Dict[str, float]:
        """
        Predict match outcome using ELO ratings directly.
        
        Formula:
        P(win) = 1 / (1 + 10^(-elo_diff/400))
        P(draw) = 0.3 * exp(-|elo_diff|/400)
        """
        # Apply home advantage if not neutral
        effective_home_elo = home_elo + (0 if is_neutral else 100)
        
        elo_diff = effective_home_elo - away_elo
        
        # Win probability using ELO formula
        home_win_raw = 1 / (1 + 10 ** (-elo_diff / 400))
        
        # Draw probability
        draw_prob = self.draw_factor * math.exp(-abs(elo_diff) / self.draw_decay)
        
        # Normalize
        total = home_win_raw + draw_prob + (1 - home_win_raw)
        home_win = home_win_raw / total
        draw = draw_prob / total
        away_win = (1 - home_win_raw) / total
        
        # Renormalize to ensure sum is 1
        total = home_win + draw + away_win
        home_win /= total
        draw /= total
        away_win /= total
        
        return {
            'home_win': home_win,
            'draw': draw,
            'away_win': away_win
        }


class XGBoostPredictor:
    """
    XGBoost classifier stub for future implementation.
    """
    
    def __init__(self):
        self.model = None
        self.is_trained = False
    
    def extract_features(self, home_elo: float, away_elo: float,
                         is_neutral: bool) -> np.ndarray:
        """
        Extract features for XGBoost model.
        Placeholder implementation.
        """
        features = [
            home_elo,
            away_elo,
            home_elo - away_elo,
            int(is_neutral),
            home_elo / 2000,  # Normalized
            away_elo / 2000,
        ]
        return np.array(features).reshape(1, -1)
    
    def predict(self, home_elo: float, away_elo: float,
                is_neutral: bool = False) -> Dict[str, float]:
        """
        Placeholder prediction using simple ELO-based heuristic.
        Returns probabilities based on ELO difference.
        """
        # Simple heuristic based on ELO difference
        elo_diff = home_elo - away_elo + (0 if is_neutral else 100)
        
        # Logistic function for home win probability
        home_win = 1 / (1 + math.exp(-elo_diff / 200))
        
        # Draw probability decreases with ELO difference
        draw = 0.25 * math.exp(-abs(elo_diff) / 500)
        
        # Away win
        away_win = 1 - home_win - draw
        
        # Ensure non-negative
        away_win = max(0.05, away_win)
        total = home_win + draw + away_win
        
        return {
            'home_win': home_win / total,
            'draw': draw / total,
            'away_win': away_win / total
        }


class MarketOddsPredictor:
    """
    Market odds placeholder predictor.
    Uses a simple model until real odds data is available.
    """
    
    def predict(self, home_elo: float, away_elo: float,
                is_neutral: bool = False) -> Dict[str, float]:
        """
        Placeholder market odds prediction.
        Assumes market odds follow ELO with some noise.
        """
        elo_diff = home_elo - away_elo + (0 if is_neutral else 100)
        
        # Market-style probabilities (slightly more conservative)
        home_win = 1 / (1 + 10 ** (-elo_diff / 450))
        draw = 0.28 * math.exp(-abs(elo_diff) / 600)
        away_win = 1 - home_win - draw
        
        # Ensure non-negative
        away_win = max(0.05, away_win)
        total = home_win + draw + away_win
        
        return {
            'home_win': home_win / total,
            'draw': draw / total,
            'away_win': away_win / total
        }


class EnsemblePredictor:
    """
    Ensemble predictor combining multiple models.
    Weights: Dixon-Coles 0.35, XGBoost 0.25, ELO 0.25, Market Odds 0.15
    """
    
    def __init__(self):
        self.dixon_coles = DixonColesPredictor()
        self.elo_predictor = ELOPredictor()
        self.xgboost_predictor = XGBoostPredictor()
        self.market_odds = MarketOddsPredictor()
        
        # Ensemble weights
        self.weights = {
            'dixon_coles': 0.35,
            'xgboost': 0.25,
            'elo': 0.25,
            'market_odds': 0.15
        }
    
    def predict(self, home_elo: float, away_elo: float,
                home_name: str = "Home", away_name: str = "Away",
                is_neutral: bool = False) -> MatchPrediction:
        """
        Generate ensemble prediction combining all models.
        
        Args:
            home_elo: Home team ELO rating
            away_elo: Away team ELO rating
            home_name: Home team name
            away_name: Away team name
            is_neutral: Whether match is at neutral venue
            
        Returns:
            MatchPrediction object with all prediction data
        """
        # Get predictions from each model
        dc_pred = self.dixon_coles.predict(home_elo, away_elo, is_neutral)
        elo_pred = self.elo_predictor.predict(home_elo, away_elo, is_neutral)
        xgb_pred = self.xgboost_predictor.predict(home_elo, away_elo, is_neutral)
        market_pred = self.market_odds.predict(home_elo, away_elo, is_neutral)
        
        # Calculate ensemble probabilities
        home_win = (
            self.weights['dixon_coles'] * dc_pred['home_win'] +
            self.weights['xgboost'] * xgb_pred['home_win'] +
            self.weights['elo'] * elo_pred['home_win'] +
            self.weights['market_odds'] * market_pred['home_win']
        )
        
        draw = (
            self.weights['dixon_coles'] * dc_pred['draw'] +
            self.weights['xgboost'] * xgb_pred['draw'] +
            self.weights['elo'] * elo_pred['draw'] +
            self.weights['market_odds'] * market_pred['draw']
        )
        
        away_win = (
            self.weights['dixon_coles'] * dc_pred['away_win'] +
            self.weights['xgboost'] * xgb_pred['away_win'] +
            self.weights['elo'] * elo_pred['away_win'] +
            self.weights['market_odds'] * market_pred['away_win']
        )
        
        # Normalize
        total = home_win + draw + away_win
        home_win /= total
        draw /= total
        away_win /= total
        
        # Get expected goals from Dixon-Coles
        lambda_home = dc_pred['lambda_home']
        lambda_away = dc_pred['lambda_away']
        
        # Get top scores from Dixon-Coles
        top_scores = self._get_top_scores(dc_pred['prob_matrix'], n=3)
        
        # Calculate predicted score (most likely)
        predicted_home, predicted_away = top_scores[0][0], top_scores[0][1]
        
        # Calculate confidence
        confidence = self._calculate_confidence(home_win, draw, away_win)
        
        # Model breakdown
        model_breakdown = {
            'dixon_coles': {
                'home_win': dc_pred['home_win'],
                'draw': dc_pred['draw'],
                'away_win': dc_pred['away_win']
            },
            'elo': elo_pred,
            'xgboost': xgb_pred,
            'market_odds': market_pred
        }
        
        return MatchPrediction(
            home_win_prob=home_win,
            draw_prob=draw,
            away_win_prob=away_win,
            home_expected_goals=lambda_home,
            away_expected_goals=lambda_away,
            predicted_home_goals=predicted_home,
            predicted_away_goals=predicted_away,
            confidence=confidence,
            top_scores=top_scores,
            model_breakdown=model_breakdown
        )
    
    def _get_top_scores(self, prob_matrix: np.ndarray, n: int = 3) -> List[Tuple[int, int, float]]:
        """
        Get top N most likely scores from probability matrix.
        
        Returns:
            List of (home_goals, away_goals, probability) tuples
        """
        scores = []
        for i in range(prob_matrix.shape[0]):
            for j in range(prob_matrix.shape[1]):
                scores.append((i, j, prob_matrix[i, j]))
        
        # Sort by probability descending
        scores.sort(key=lambda x: x[2], reverse=True)
        
        return scores[:n]
    
    def _calculate_confidence(self, home_win: float, draw: float, away_win: float) -> float:
        """
        Calculate prediction confidence based on probability distribution.
        
        Returns:
            Confidence score between 0 and 1
        """
        # Entropy-based confidence
        probs = [home_win, draw, away_win]
        entropy = -sum(p * math.log(p + 1e-10) for p in probs)
        max_entropy = math.log(3)  # Maximum entropy for 3 outcomes
        
        # Normalize confidence (lower entropy = higher confidence)
        confidence = 1 - (entropy / max_entropy)
        
        # Boost confidence if one outcome is very likely
        max_prob = max(probs)
        if max_prob > 0.6:
            confidence = min(1.0, confidence + 0.1)
        
        return round(confidence, 3)


def predict_match(home_elo: float, away_elo: float,
                  home_name: str = "Home", away_name: str = "Away",
                  is_neutral: bool = False) -> MatchPrediction:
    """
    Main prediction function.
    
    Args:
        home_elo: Home team ELO rating
        away_elo: Away team ELO rating
        home_name: Home team name
        away_name: Away team name
        is_neutral: Whether match is at neutral venue
        
    Returns:
        MatchPrediction object with all prediction data
    """
    predictor = EnsemblePredictor()
    return predictor.predict(home_elo, away_elo, home_name, away_name, is_neutral)


def format_prediction(prediction: MatchPrediction, home_name: str, away_name: str) -> Dict:
    """
    Format prediction as dictionary for API response.
    """
    return {
        'home_team': home_name,
        'away_team': away_name,
        'prediction': {
            'home_win': round(prediction.home_win_prob, 4),
            'draw': round(prediction.draw_prob, 4),
            'away_win': round(prediction.away_win_prob, 4),
        },
        'expected_goals': {
            'home': round(prediction.home_expected_goals, 2),
            'away': round(prediction.away_expected_goals, 2),
        },
        'predicted_score': {
            'home': prediction.predicted_home_goals,
            'away': prediction.predicted_away_goals,
        },
        'top_scores': [
            {'home': s[0], 'away': s[1], 'probability': round(s[2], 4)}
            for s in prediction.top_scores
        ],
        'confidence': prediction.confidence,
        'model_breakdown': prediction.model_breakdown
    }


# Standalone testing
if __name__ == "__main__":
    print("=" * 60)
    print("World Cup Prediction Engine - Standalone Test")
    print("=" * 60)
    
    # Test match: Argentina vs France
    print("\nTest Match: Argentina vs France")
    print("-" * 40)
    
    prediction = predict_match(
        home_elo=1860,  # Argentina
        away_elo=1850,  # France
        home_name="Argentina",
        away_name="France",
        is_neutral=True
    )
    
    result = format_prediction(prediction, "Argentina", "France")
    
    print(f"Predicted Score: {result['predicted_score']['home']} - {result['predicted_score']['away']}")
    print(f"\nWin Probabilities:")
    print(f"  Argentina: {result['prediction']['home_win']:.1%}")
    print(f"  Draw:      {result['prediction']['draw']:.1%}")
    print(f"  France:    {result['prediction']['away_win']:.1%}")
    print(f"\nExpected Goals:")
    print(f"  Argentina: {result['expected_goals']['home']}")
    print(f"  France:    {result['expected_goals']['away']}")
    print(f"\nConfidence: {result['confidence']:.1%}")
    
    print(f"\nTop 3 Scores:")
    for score in result['top_scores']:
        print(f"  {score['home']}-{score['away']}: {score['probability']:.1%}")
    
    print("\n" + "=" * 60)
    print("Test Match: Brazil vs Germany (Home advantage)")
    print("-" * 40)
    
    prediction2 = predict_match(
        home_elo=1820,  # Brazil
        away_elo=1750,  # Germany
        home_name="Brazil",
        away_name="Germany",
        is_neutral=False
    )
    
    result2 = format_prediction(prediction2, "Brazil", "Germany")
    
    print(f"Predicted Score: {result2['predicted_score']['home']} - {result2['predicted_score']['away']}")
    print(f"\nWin Probabilities:")
    print(f"  Brazil:   {result2['prediction']['home_win']:.1%}")
    print(f"  Draw:     {result2['prediction']['draw']:.1%}")
    print(f"  Germany:  {result2['prediction']['away_win']:.1%}")
    print(f"\nConfidence: {result2['confidence']:.1%}")
    
    print("\n" + "=" * 60)
    print("All tests completed!")
