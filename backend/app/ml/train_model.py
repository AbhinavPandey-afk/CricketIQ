import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from xgboost import XGBClassifier

# ==========================================
# LOAD DATASET
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

data_path = os.path.join(
    BASE_DIR,
    "../data/raw/matches.csv"
)

df = pd.read_csv(data_path)

print("\n================ DATASET LOADED ================\n")

print(df.head())

# ==========================================
# SELECT IMPORTANT COLUMNS
# ==========================================

columns_needed = [
    'season',
    'team1',
    'team2',
    'venue',
    'toss_winner',
    'toss_decision',
    'winner'
]

df = df[columns_needed]

# ==========================================
# CLEAN DATA
# ==========================================

# Convert season safely
df['season'] = pd.to_numeric(
    df['season'],
    errors='coerce'
)

# Remove missing values
df.dropna(inplace=True)

# Remove no result matches
df = df[df['winner'] != 'No Result']

# ==========================================
# CREATE TARGET VARIABLE
# ==========================================

# 1 if team1 wins else 0
df['team1_win'] = (df['team1'] == df['winner']).astype(int)

# ==========================================
# FEATURE ENGINEERING
# ==========================================

print("\n================ FEATURE ENGINEERING ================\n")

# ------------------------------------------
# TEAM1 RECENT FORM
# ------------------------------------------

team_win_history = {}

recent_form = []

for index, row in df.iterrows():

    team = row['team1']

    if team not in team_win_history:
        team_win_history[team] = []

    recent_matches = team_win_history[team][-5:]

    if len(recent_matches) == 0:
        form = 0.5
    else:
        form = sum(recent_matches) / len(recent_matches)

    recent_form.append(form)

    # update history
    team_win_history[team].append(row['team1_win'])

df['team1_recent_form'] = recent_form

# ------------------------------------------
# HEAD TO HEAD RECORD
# ------------------------------------------

h2h_dict = {}

h2h_feature = []

for index, row in df.iterrows():

    t1 = row['team1']
    t2 = row['team2']

    pair = tuple(sorted([t1, t2]))

    if pair not in h2h_dict:
        h2h_dict[pair] = {
            t1: 0,
            t2: 0
        }

    total_matches = (
        h2h_dict[pair].get(t1, 0) +
        h2h_dict[pair].get(t2, 0)
    )

    if total_matches == 0:
        h2h_ratio = 0.5
    else:
        h2h_ratio = (
            h2h_dict[pair].get(t1, 0) /
            total_matches
        )

    h2h_feature.append(h2h_ratio)

    winner = row['winner']

    if winner not in h2h_dict[pair]:
        h2h_dict[pair][winner] = 0

    h2h_dict[pair][winner] += 1

df['head_to_head_ratio'] = h2h_feature

# ------------------------------------------
# VENUE WIN RATE
# ------------------------------------------

venue_team_stats = {}

venue_feature = []

for index, row in df.iterrows():

    venue = row['venue']
    team = row['team1']

    key = (venue, team)

    if key not in venue_team_stats:
        venue_team_stats[key] = {
            'wins': 0,
            'matches': 0
        }

    stats = venue_team_stats[key]

    if stats['matches'] == 0:
        venue_win_rate = 0.5
    else:
        venue_win_rate = (
            stats['wins'] / stats['matches']
        )

    venue_feature.append(venue_win_rate)

    stats['matches'] += 1

    if row['team1_win'] == 1:
        stats['wins'] += 1

df['venue_win_rate'] = venue_feature

# ==========================================
# ENCODING
# ==========================================

encoders = {}

categorical_columns = [
    'team1',
    'team2',
    'venue',
    'toss_winner',
    'toss_decision'
]

for col in categorical_columns:

    encoder = LabelEncoder()

    df[col] = encoder.fit_transform(df[col])

    encoders[col] = encoder

# ==========================================
# FEATURES & TARGET
# ==========================================

X = df[
    [
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
]

y = df['team1_win']

print("\n================ FEATURES ================\n")

print(X.head())

# ==========================================
# TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining Samples:", len(X_train))
print("Testing Samples:", len(X_test))

# ==========================================
# MODEL TRAINING
# ==========================================

model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.03,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    objective='binary:logistic',
    eval_metric='logloss',
    random_state=42
)

print("\n================ TRAINING MODEL ================\n")

model.fit(X_train, y_train)

print("\nModel Training Complete!")

# ==========================================
# PREDICTIONS
# ==========================================

y_pred = model.predict(X_test)

# ==========================================
# EVALUATION
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print("\n================ MODEL EVALUATION ================\n")

print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:\n")

print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")

print(confusion_matrix(y_test, y_pred))

# ==========================================
# FEATURE IMPORTANCE
# ==========================================

importance_df = pd.DataFrame({
    'Feature': X.columns,
    'Importance': model.feature_importances_
})

importance_df = importance_df.sort_values(
    by='Importance',
    ascending=False
)

print("\n================ FEATURE IMPORTANCE ================\n")

print(importance_df)

# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(model, "model.pkl")
joblib.dump(encoders, "encoder.pkl")

print("\n================ MODEL SAVED ================\n")

print("Saved:")
print("- model.pkl")
print("- encoder.pkl")