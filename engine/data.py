"""
Static data: team ELO ratings and historical match data for training.
World Cup 2026 team ELO ratings (approximate, based on FIFA rankings).
"""

# ELO ratings for World Cup 2026 qualified/likely teams
# Ratings are approximate and based on historical performance
TEAM_ELO_RATINGS = {
    # Top tier (1800+)
    "Argentina": 1860,
    "France": 1850,
    "England": 1830,
    "Brazil": 1820,
    "Belgium": 1800,
    
    # Strong (1700-1800)
    "Netherlands": 1780,
    "Portugal": 1770,
    "Spain": 1760,
    "Germany": 1750,
    "Croatia": 1740,
    "Italy": 1730,
    "Colombia": 1720,
    "Uruguay": 1710,
    "Mexico": 1700,
    
    # Good (1600-1700)
    "USA": 1690,
    "Senegal": 1680,
    "Morocco": 1670,
    "Japan": 1660,
    "Switzerland": 1650,
    "Denmark": 1640,
    "South Korea": 1630,
    "Australia": 1620,
    "Ecuador": 1610,
    "Poland": 1600,
    
    # Average (1500-1600)
    "Serbia": 1590,
    "Chile": 1580,
    "Peru": 1570,
    "Iran": 1560,
    "Tunisia": 1550,
    "Nigeria": 1540,
    "Cameroon": 1530,
    "Ghana": 1520,
    "Canada": 1510,
    "Wales": 1500,
    
    # Developing (1400-1500)
    "Saudi Arabia": 1490,
    "Costa Rica": 1480,
    "Paraguay": 1470,
    "Ivory Coast": 1460,
    "Algeria": 1450,
    "Egypt": 1440,
    "Scotland": 1430,
    "Norway": 1420,
    "Austria": 1410,
    "Czech Republic": 1400,
    
    # Lower tier (1300-1400)
    "Turkey": 1390,
    "Greece": 1380,
    "Romania": 1370,
    "Hungary": 1360,
    "Slovakia": 1350,
    "Ireland": 1340,
    "Northern Ireland": 1330,
    "Iceland": 1320,
    "Finland": 1310,
    "Ukraine": 1300,
    
    # Emerging (below 1300)
    "Qatar": 1290,
    "UAE": 1280,
    "Iraq": 1270,
    "Jordan": 1260,
    "China": 1250,
    "Panama": 1240,
    "Jamaica": 1230,
    "Honduras": 1220,
    "Bolivia": 1210,
    "Venezuela": 1200,
}

# Historical match data for training (sample)
# Format: (home_team, away_team, home_goals, away_goals, date, tournament)
HISTORICAL_MATCHES = [
    # Recent World Cup matches
    ("Argentina", "France", 3, 3, "2022-12-18", "World Cup 2022 Final"),
    ("Croatia", "Argentina", 0, 3, "2022-12-13", "World Cup 2022 Semi"),
    ("France", "Morocco", 2, 0, "2022-12-14", "World Cup 2022 Semi"),
    ("Argentina", "Croatia", 3, 0, "2022-12-13", "World Cup 2022 Semi"),
    ("Morocco", "France", 0, 2, "2022-12-14", "World Cup 2022 Semi"),
    
    # World Cup 2022 Group stage
    ("Qatar", "Ecuador", 0, 2, "2022-11-20", "World Cup 2022 Group"),
    ("England", "Iran", 6, 2, "2022-11-21", "World Cup 2022 Group"),
    ("Senegal", "Netherlands", 0, 2, "2022-11-21", "World Cup 2022 Group"),
    ("USA", "Wales", 1, 1, "2022-11-21", "World Cup 2022 Group"),
    ("Argentina", "Saudi Arabia", 1, 2, "2022-11-22", "World Cup 2022 Group"),
    ("Denmark", "Tunisia", 0, 0, "2022-11-22", "World Cup 2022 Group"),
    ("Mexico", "Poland", 0, 0, "2022-11-22", "World Cup 2022 Group"),
    ("France", "Australia", 4, 1, "2022-11-22", "World Cup 2022 Group"),
    ("Germany", "Japan", 1, 2, "2022-11-23", "World Cup 2022 Group"),
    ("Spain", "Costa Rica", 7, 0, "2022-11-23", "World Cup 2022 Group"),
    ("Belgium", "Canada", 1, 0, "2022-11-23", "World Cup 2022 Group"),
    ("Switzerland", "Cameroon", 1, 0, "2022-11-24", "World Cup 2022 Group"),
    ("Uruguay", "South Korea", 0, 0, "2022-11-24", "World Cup 2022 Group"),
    ("Portugal", "Ghana", 3, 2, "2022-11-24", "World Cup 2022 Group"),
    ("Brazil", "Serbia", 2, 0, "2022-11-24", "World Cup 2022 Group"),
    
    # UEFA Nations League / Qualifiers
    ("England", "Italy", 3, 1, "2023-03-23", "Euro Qualifier"),
    ("France", "Netherlands", 4, 0, "2023-03-24", "Euro Qualifier"),
    ("Spain", "Norway", 3, 0, "2023-03-25", "Euro Qualifier"),
    ("Germany", "Belgium", 2, 3, "2023-03-28", "Friendly"),
    ("Argentina", "Brazil", 1, 0, "2023-11-21", "WC Qualifier"),
    ("Uruguay", "Argentina", 0, 2, "2023-11-16", "WC Qualifier"),
    
    # CONMEBOL Qualifiers
    ("Brazil", "Argentina", 0, 1, "2023-11-21", "WC Qualifier"),
    ("Colombia", "Brazil", 2, 1, "2023-11-16", "WC Qualifier"),
    ("Ecuador", "Chile", 1, 0, "2023-11-21", "WC Qualifier"),
    
    # AFC Qualifiers
    ("Japan", "Australia", 2, 0, "2024-03-21", "WC Qualifier"),
    ("South Korea", "Thailand", 1, 1, "2024-03-21", "WC Qualifier"),
    ("Iran", "UAE", 1, 0, "2024-03-21", "WC Qualifier"),
    
    # Friendly matches
    ("England", "Brazil", 0, 1, "2024-03-23", "Friendly"),
    ("France", "Germany", 0, 2, "2024-03-23", "Friendly"),
    ("Spain", "Colombia", 1, 0, "2024-03-22", "Friendly"),
    
    # More historical data
    ("Italy", "Argentina", 0, 3, "2022-06-01", "Finalissima"),
    ("Netherlands", "Argentina", 2, 2, "2022-12-09", "World Cup 2022 QF"),
    ("Brazil", "Croatia", 1, 1, "2022-12-09", "World Cup 2022 QF"),
    ("England", "France", 1, 2, "2022-12-10", "World Cup 2022 QF"),
    ("Morocco", "Portugal", 1, 0, "2022-12-10", "World Cup 2022 QF"),
]

# Group stage data for World Cup 2026 (placeholder)
WORLD_CUP_2026_GROUPS = {
    "A": ["USA", "Mexico", "Canada", "TBD"],
    "B": ["TBD", "TBD", "TBD", "TBD"],
    "C": ["TBD", "TBD", "TBD", "TBD"],
    "D": ["TBD", "TBD", "TBD", "TBD"],
    "E": ["TBD", "TBD", "TBD", "TBD"],
    "F": ["TBD", "TBD", "TBD", "TBD"],
    "G": ["TBD", "TBD", "TBD", "TBD"],
    "H": ["TBD", "TBD", "TBD", "TBD"],
    "I": ["TBD", "TBD", "TBD", "TBD"],
    "J": ["TBD", "TBD", "TBD", "TBD"],
    "K": ["TBD", "TBD", "TBD", "TBD"],
    "L": ["TBD", "TBD", "TBD", "TBD"],
}


def get_team_elo(team_name: str) -> float:
    """Get ELO rating for a team by name."""
    return TEAM_ELO_RATINGS.get(team_name, 1500.0)  # Default to 1500 if not found


def get_all_teams() -> list:
    """Get list of all teams with ELO ratings."""
    return list(TEAM_ELO_RATINGS.keys())


def get_training_data() -> list:
    """Get historical match data for training."""
    return HISTORICAL_MATCHES
