import sqlite3, json

db = sqlite3.connect("C:/Users/10630/worldcup-predictor/dev.db")
db.row_factory = sqlite3.Row

# Read schema SQL
with open("C:/Users/10630/worldcup-predictor/supabase_schema.sql") as f:
    schema = f.read()

sql = schema + "\n\n"

# Teams
teams = db.execute("SELECT * FROM teams ORDER BY groupName").fetchall()
sql += "-- Teams\n"
for t in teams:
    vals = [
        f"'{t['id']}'",
        f"'{t['name'].replace(chr(39), chr(39)+chr(39))}'",
        f"'{t['flagCode']}'",
        f"'{t['groupName']}'",
        str(t['eloRating']),
        str(t['fifaRanking']) if t['fifaRanking'] else 'NULL',
        f"'{t['confederation']}'" if t['confederation'] else 'NULL',
        str(t['worldCupAppearances']),
        f"'{t['bestResult']}'" if t['bestResult'] else 'NULL',
        'NOW()', 'NOW()'
    ]
    sql += f"INSERT INTO teams (id,name,\"flagCode\",\"groupName\",\"eloRating\",\"fifaRanking\",confederation,\"worldCupAppearances\",\"bestResult\",\"createdAt\",\"updatedAt\") VALUES ({','.join(vals)});\n"

# Matches
matches = db.execute("SELECT * FROM matches ORDER BY matchTime").fetchall()
sql += "\n-- Matches\n"
for m in matches:
    vals = [
        f"'{m['id']}'",
        f"'{m['round']}'",
        f"'{m['groupName']}'" if m['groupName'] else 'NULL',
        str(m['matchday']) if m['matchday'] else 'NULL',
        f"'{m['homeTeamId']}'",
        f"'{m['awayTeamId']}'",
        str(m['homeScore']) if m['homeScore'] is not None else 'NULL',
        str(m['awayScore']) if m['awayScore'] is not None else 'NULL',
        f"'{m['matchTime']}'",
        f"'{m['status']}'",
        f"'{m['stadium']}'" if m['stadium'] else 'NULL',
        f"'{m['city']}'" if m['city'] else 'NULL',
        str(m['eloHome']),
        str(m['eloAway']),
        str(m['isFinished']).lower(),
        'NOW()', 'NOW()'
    ]
    sql += f"INSERT INTO matches (id,\"round\",\"groupName\",matchday,\"homeTeamId\",\"awayTeamId\",\"homeScore\",\"awayScore\",\"matchTime\",status,stadium,city,\"eloHome\",\"eloAway\",\"isFinished\",\"createdAt\",\"updatedAt\") VALUES ({','.join(vals)});\n"

# AI Predictions
preds = db.execute("SELECT * FROM ai_predictions").fetchall()
sql += "\n-- AI Predictions\n"
for p in preds:
    ts = p['topScores'].replace("'", "''") if p['topScores'] else None
    vals = [
        f"'{p['id']}'",
        f"'{p['matchId']}'",
        f"'{p['modelVersion']}'",
        str(p['homeWinProb']),
        str(p['drawProb']),
        str(p['awayWinProb']),
        str(p['predictedHomeScore']),
        str(p['predictedAwayScore']),
        str(p['confidence']),
        f"'{ts}'" if ts else 'NULL',
        'NOW()', 'NOW()'
    ]
    sql += f"INSERT INTO ai_predictions (id,\"matchId\",\"modelVersion\",\"homeWinProb\",\"drawProb\",\"awayWinProb\",\"predictedHomeScore\",\"predictedAwayScore\",confidence,\"topScores\",\"createdAt\",\"updatedAt\") VALUES ({','.join(vals)});\n"

with open("C:/Users/10630/worldcup-predictor/supabase_full.sql", "w") as f:
    f.write(sql)

print(f"Generated: {len(teams)} teams, {len(matches)} matches, {len(preds)} predictions")
print(f"SQL lines: {len(sql.splitlines())}")
