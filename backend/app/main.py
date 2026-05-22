from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os

from fastapi.middleware.cors import CORSMiddleware

# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI()

# ==========================================
# ENABLE CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# BASE DIRECTORY
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

# ==========================================
# LOAD PRE-MATCH MODEL
# ==========================================

model_path = os.path.join(
    BASE_DIR,
    "ml/model.pkl"
)

encoder_path = os.path.join(
    BASE_DIR,
    "ml/encoder.pkl"
)

model = joblib.load(model_path)

encoders = joblib.load(encoder_path)

print("\n==============================")
print("Pre-Match Model Loaded!")
print("==============================\n")

# ==========================================
# LOAD LIVE MATCH MODEL
# ==========================================

live_model_path = os.path.join(
    BASE_DIR,
    "ml/live_model.pkl"
)

live_columns_path = os.path.join(
    BASE_DIR,
    "ml/live_model_columns.pkl"
)

live_model = joblib.load(
    live_model_path
)

live_model_columns = joblib.load(
    live_columns_path
)

print("\n==============================")
print("Live Match Model Loaded!")
print("==============================\n")

# ==========================================
# LOAD MATCHES DATASET
# ==========================================

data_path = os.path.join(
    BASE_DIR,
    "data/raw/matches.csv"
)

matches_df = pd.read_csv(data_path)

print("\n==============================")
print("Dataset Loaded!")
print("==============================\n")

# ==========================================
# REQUEST MODELS
# ==========================================

class MatchInput(BaseModel):

    team1: str
    team2: str
    venue: str
    toss_winner: str
    toss_decision: str
    season: int


class LiveMatchInput(BaseModel):

    batting_team: str
    bowling_team: str
    city: str
    target: int
    current_score: int
    wickets_left: int
    overs_completed: float

# ==========================================
# HOME ROUTE
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Cricket AI Backend Running"
    }

# ==========================================
# SAFE ENCODER
# ==========================================

def safe_transform(column, value):

    encoder = encoders[column]

    if value not in encoder.classes_:

        raise ValueError(
            f"Unknown value '{value}' for column '{column}'"
        )

    return int(
        encoder.transform([value])[0]
    )

# ==========================================
# ANALYTICS FUNCTIONS
# ==========================================

def calculate_recent_form(team):

    recent_matches = matches_df[
        (
            (matches_df['team1'] == team)
            |
            (matches_df['team2'] == team)
        )
    ].tail(10)

    total = recent_matches.shape[0]

    if total == 0:
        return 50

    wins = recent_matches[
        recent_matches['winner'] == team
    ].shape[0]

    raw_rate = (wins / total) * 100

    smoothed_rate = (
        (raw_rate * total) + (50 * 5)
    ) / (total + 5)

    return round(smoothed_rate, 2)

# ==========================================

def calculate_head_to_head(team1, team2):

    h2h_matches = matches_df[
        (
            (matches_df['team1'] == team1)
            &
            (matches_df['team2'] == team2)
        )
        |
        (
            (matches_df['team1'] == team2)
            &
            (matches_df['team2'] == team1)
        )
    ]

    total = h2h_matches.shape[0]

    if total == 0:
        return 50

    team1_wins = h2h_matches[
        h2h_matches['winner'] == team1
    ].shape[0]

    raw_rate = (
        team1_wins / total
    ) * 100

    smoothed_rate = (
        (raw_rate * total) + (50 * 5)
    ) / (total + 5)

    return round(smoothed_rate, 2)

# ==========================================

def calculate_venue_advantage(team, venue):

    venue_matches = matches_df[
        matches_df['venue'] == venue
    ]

    team_matches = venue_matches[
        (
            (venue_matches['team1'] == team)
            |
            (venue_matches['team2'] == team)
        )
    ]

    total = team_matches.shape[0]

    if total == 0:
        return 50

    wins = team_matches[
        team_matches['winner'] == team
    ].shape[0]

    raw_rate = (wins / total) * 100

    smoothed_rate = (
        (raw_rate * total) + (50 * 5)
    ) / (total + 5)

    return round(smoothed_rate, 2)

# ==========================================

def calculate_toss_impact(toss_winner):

    toss_matches = matches_df[
        matches_df['toss_winner']
        == toss_winner
    ]

    total = toss_matches.shape[0]

    if total == 0:
        return 50

    wins = toss_matches[
        toss_matches['winner']
        == toss_winner
    ].shape[0]

    raw_rate = (wins / total) * 100

    smoothed_rate = (
        (raw_rate * total) + (50 * 5)
    ) / (total + 5)

    return round(smoothed_rate, 2)

# ==========================================
# PRE-MATCH PREDICTION ROUTE
# ==========================================

@app.post("/predict")
def predict_match(data: MatchInput):

    try:

        # ==================================
        # ENCODE VALUES
        # ==================================

        team1 = safe_transform(
            "team1",
            data.team1
        )

        team2 = safe_transform(
            "team2",
            data.team2
        )

        venue = safe_transform(
            "venue",
            data.venue
        )

        toss_winner = safe_transform(
            "toss_winner",
            data.toss_winner
        )

        toss_decision = safe_transform(
            "toss_decision",
            data.toss_decision
        )

        # ==================================
        # REAL ANALYTICS
        # ==================================

        recent_form = calculate_recent_form(
            data.team1
        )

        head_to_head = calculate_head_to_head(
            data.team1,
            data.team2
        )

        venue_win_rate = calculate_venue_advantage(
            data.team1,
            data.venue
        )

        toss_impact = calculate_toss_impact(
            data.toss_winner
        )

        # ==================================
        # NORMALIZE FOR ML MODEL
        # ==================================

        ml_recent_form = recent_form / 100

        ml_head_to_head = head_to_head / 100

        ml_venue_rate = venue_win_rate / 100

        # ==================================
        # INPUT DATAFRAME
        # ==================================

        input_data = [[
            int(data.season),
            int(team1),
            int(team2),
            int(venue),
            int(toss_winner),
            int(toss_decision),
            float(ml_recent_form),
            float(ml_head_to_head),
            float(ml_venue_rate)
        ]]

        input_df = pd.DataFrame(
            input_data,
            columns=[
                'season',
                'team1',
                'team2',
                'venue',
                'toss_winner',
                'toss_decision',
                'team1_recent_form',
                'head_to_head_ratio',
                'venue_win_rate'
            ]
        )

        # ==================================
        # PREDICTION
        # ==================================

        prediction = int(
            model.predict(input_df)[0]
        )

        probabilities = model.predict_proba(
            input_df
        )[0]

        win_probability = float(
            round(
                max(probabilities) * 100,
                2
            )
        )

        predicted_winner = (
            data.team1
            if prediction == 1
            else data.team2
        )

        # ==================================
        # RESPONSE
        # ==================================

        return {

            "predicted_winner": predicted_winner,

            "win_probability": win_probability,

            "analytics": {

                "recent_form": recent_form,

                "head_to_head": head_to_head,

                "venue_advantage": venue_win_rate,

                "toss_impact": toss_impact
            }
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# ==========================================
# LIVE MATCH PREDICTION ROUTE
# ==========================================

@app.post("/predict_live")
def predict_live_match(data: LiveMatchInput):

    try:

        # ==================================
        # CALCULATIONS
        # ==================================

        runs_left = (
            data.target
            - data.current_score
        )

        overs = int(data.overs_completed)

        balls = int(
            round(
                (
                    data.overs_completed
                    - overs
                ) * 10
            )
        )

        balls_bowled = (
            overs * 6
        ) + balls

        balls_left = 120 - balls_bowled

        current_run_rate = (
            data.current_score
            / data.overs_completed
        )

        required_run_rate = (
            (runs_left * 6)
            / balls_left
        )

        # ==================================
        # CREATE INPUT
        # ==================================

        input_dict = {

            'runs_left': runs_left,

            'balls_left': balls_left,

            'wickets_left': data.wickets_left,

            'target': data.target,

            'crr': current_run_rate,

            'rrr': required_run_rate
        }

        # ==================================
        # ADD TEAM/CITY FEATURES
        # ==================================

        for col in live_model_columns:

            if col.startswith(
                'batting_team_'
            ):

                input_dict[col] = 0

            elif col.startswith(
                'bowling_team_'
            ):

                input_dict[col] = 0

            elif col.startswith(
                'city_'
            ):

                input_dict[col] = 0

        batting_col = (
            f"batting_team_{data.batting_team}"
        )

        bowling_col = (
            f"bowling_team_{data.bowling_team}"
        )

        city_col = (
            f"city_{data.city}"
        )

        if batting_col in input_dict:
            input_dict[batting_col] = 1

        if bowling_col in input_dict:
            input_dict[bowling_col] = 1

        if city_col in input_dict:
            input_dict[city_col] = 1

        # ==================================
        # DATAFRAME
        # ==================================

        input_df = pd.DataFrame(
            [input_dict]
        )

        input_df = input_df.reindex(
            columns=live_model_columns,
            fill_value=0
        )

        # ==================================
        # PREDICT
        # ==================================

        probabilities = live_model.predict_proba(
            input_df
        )[0]

        batting_team_probability = float(
            round(
                float(probabilities[1]) * 100,
                2
            )
        )

        bowling_team_probability = float(
            round(
                float(probabilities[0]) * 100,
                2
            )
        )

        # ==================================
        # RESPONSE
        # ==================================

        return {

            "batting_team": data.batting_team,

            "bowling_team": data.bowling_team,

            "batting_team_win_probability":
                batting_team_probability,

            "bowling_team_win_probability":
                bowling_team_probability
        }

    except Exception as e:

        return {
            "error": str(e)
        }