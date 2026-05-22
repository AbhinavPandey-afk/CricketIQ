import pandas as pd
import numpy as np
import joblib
import os

from xgboost import XGBClassifier

from sklearn.model_selection import train_test_split

from sklearn.metrics import accuracy_score

from sklearn.calibration import CalibratedClassifierCV

# ==========================================
# LOAD DATASETS
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

deliveries_path = os.path.join(
    BASE_DIR,
    "../data/raw/deliveries.csv"
)

matches_path = os.path.join(
    BASE_DIR,
    "../data/raw/matches.csv"
)

deliveries = pd.read_csv(
    deliveries_path
)

matches = pd.read_csv(
    matches_path
)

print("\n==============================")
print("Datasets Loaded!")
print("==============================\n")

# ==========================================
# FIRST INNINGS TOTAL
# ==========================================

total_score_df = deliveries.groupby(
    ['match_id', 'inning']
)['total_runs'].sum().reset_index()

total_score_df = total_score_df[
    total_score_df['inning'] == 1
]

# ==========================================
# CREATE TARGET
# ==========================================

match_df = matches.merge(
    total_score_df[['match_id', 'total_runs']],
    left_on='id',
    right_on='match_id'
)

match_df['target'] = (
    match_df['total_runs'] + 1
)

# ==========================================
# SECOND INNINGS ONLY
# ==========================================

chasing_df = deliveries.merge(
    match_df[['match_id', 'target']],
    on='match_id'
)

chasing_df = chasing_df[
    chasing_df['inning'] == 2
]

# ==========================================
# CURRENT SCORE
# ==========================================

chasing_df['current_score'] = chasing_df.groupby(
    'match_id'
)['total_runs'].cumsum()

# ==========================================
# RUNS LEFT
# ==========================================

chasing_df['runs_left'] = (
    chasing_df['target']
    -
    chasing_df['current_score']
)

# ==========================================
# BALLS BOWLED
# ==========================================

chasing_df['balls_bowled'] = (
    (chasing_df['over'] - 1) * 6
    +
    chasing_df['ball']
)

# ==========================================
# BALLS LEFT
# ==========================================

chasing_df['balls_left'] = (
    120 - chasing_df['balls_bowled']
)

# ==========================================
# WICKETS LEFT
# ==========================================

chasing_df['player_dismissed'] = (
    chasing_df['player_dismissed']
    .fillna("0")
)

wickets = chasing_df.groupby(
    'match_id'
)['player_dismissed'].transform(
    lambda x: (x != "0").cumsum()
)

chasing_df['wickets_left'] = (
    10 - wickets
)

# ==========================================
# CURRENT RUN RATE
# ==========================================

balls_used = (
    120 - chasing_df['balls_left']
)

balls_used = balls_used.replace(
    0,
    np.nan
)

chasing_df['crr'] = (
    chasing_df['current_score'] * 6
) / balls_used

# ==========================================
# REQUIRED RUN RATE
# ==========================================

safe_balls_left = chasing_df[
    'balls_left'
].replace(
    0,
    np.nan
)

chasing_df['rrr'] = (
    chasing_df['runs_left'] * 6
) / safe_balls_left

# ==========================================
# MATCH RESULT + CITY
# ==========================================

match_result = matches[
    ['id', 'winner', 'city']
]

chasing_df = chasing_df.merge(
    match_result,
    left_on='match_id',
    right_on='id'
)

# ==========================================
# TARGET VARIABLE
# ==========================================

chasing_df['result'] = np.where(

    chasing_df['batting_team']
    ==
    chasing_df['winner'],

    1,

    0
)

# ==========================================
# FINAL DATAFRAME
# ==========================================

final_df = chasing_df[[
    'batting_team',
    'bowling_team',
    'city',
    'runs_left',
    'balls_left',
    'wickets_left',
    'target',
    'crr',
    'rrr',
    'result'
]]

# ==========================================
# REMOVE INVALID STATES
# ==========================================

final_df = final_df[
    final_df['balls_left'] > 0
]

final_df = final_df[
    final_df['runs_left'] >= 0
]

final_df = final_df[
    final_df['wickets_left'] > 0
]

# ==========================================
# REMOVE EXTREME MATCH STATES
# ==========================================

# Avoid dead matches / unrealistic states

final_df = final_df[
    final_df['balls_left'] >= 18
]

final_df = final_df[
    final_df['balls_left'] <= 90
]

final_df = final_df[
    final_df['runs_left'] <= 80
]

final_df = final_df[
    final_df['wickets_left'] >= 3
]

# ==========================================
# CLEAN NaN + INF
# ==========================================

final_df.replace(
    [np.inf, -np.inf],
    np.nan,
    inplace=True
)

final_df.dropna(inplace=True)

final_df.reset_index(
    drop=True,
    inplace=True
)

# ==========================================
# DEBUGGING INFO
# ==========================================

print("\n==============================")
print("FINAL DATASET")
print("==============================")

print(final_df.shape)

print("\nMissing Values:")

print(
    final_df.isnull().sum().sum()
)

print("\nInfinite Values:")

print(

    np.isinf(

        final_df.select_dtypes(
            include=[np.number]
        )

    ).sum().sum()

)

# ==========================================
# ONE HOT ENCODING
# ==========================================

final_df = pd.get_dummies(

    final_df,

    columns=[
        'batting_team',
        'bowling_team',
        'city'
    ]

)

# ==========================================
# FEATURES + TARGET
# ==========================================

X = final_df.drop(
    'result',
    axis=1
)

y = final_df['result']

# ==========================================
# TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.2,

    random_state=42
)

# ==========================================
# BASE MODEL
# ==========================================

base_model = XGBClassifier(

    n_estimators=200,

    learning_rate=0.03,

    max_depth=5,

    subsample=0.8,

    colsample_bytree=0.8,

    random_state=42
)

# ==========================================
# CALIBRATED MODEL
# ==========================================

model = CalibratedClassifierCV(

    estimator=base_model,

    method='sigmoid',

    cv=3
)

print("\n==============================")
print("Training Live Match Model...")
print("==============================\n")

# ==========================================
# TRAIN MODEL
# ==========================================

model.fit(
    X_train,
    y_train
)

# ==========================================
# EVALUATION
# ==========================================

predictions = model.predict(
    X_test
)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n==============================")
print("MODEL ACCURACY")
print("==============================")

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)

# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    "live_model.pkl"
)

joblib.dump(
    X_train.columns,
    "live_model_columns.pkl"
)

print("\n==============================")
print("Live Match Model Saved!")
print("==============================\n")