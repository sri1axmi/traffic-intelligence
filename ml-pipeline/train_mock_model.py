"""
Train and save a mock XGBoost traffic congestion model.
Usage: python train_mock_model.py
"""
import numpy as np
import pickle
import os

try:
    import xgboost as xgb
    USE_XGB = True
except ImportError:
    from sklearn.ensemble import GradientBoostingRegressor
    USE_XGB = False

def generate_mock_dataset(n_samples=5000):
    np.random.seed(42)
    hours = np.random.randint(0, 24, n_samples)
    is_rush = ((hours >= 7) & (hours <= 9) | (hours >= 17) & (hours <= 19)).astype(int)
    is_night = ((hours < 6) | (hours > 22)).astype(int)
    road_len = np.random.randint(1, 10, n_samples)
    area_code = np.random.randint(0, 50, n_samples)
    X = np.column_stack([hours, is_rush, is_night, road_len, area_code])
    y = 0.2 + 0.45 * is_rush + 0.1 * (1 - is_night) + 0.05 * (road_len / 10) + np.random.uniform(0, 0.15, n_samples)
    y = np.clip(y, 0, 1)
    return X, y

def train_and_save(output_path):
    X, y = generate_mock_dataset()
    if USE_XGB:
        model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
        print("Training XGBoost model...")
    else:
        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
        print("Training sklearn GradientBoosting model...")
    model.fit(X, y)
    with open(output_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to: {output_path}")

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "backend", "ml", "traffic_model.pkl")
    train_and_save(os.path.abspath(out))
