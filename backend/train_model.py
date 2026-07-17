from ucimlrepo import fetch_ucirepo
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Load UCI Heart Disease dataset
heart_disease = fetch_ucirepo(id=45)

X = heart_disease.data.features.copy()
y = heart_disease.data.targets.copy()

# Convert target to binary:
# 0 = no heart disease
# 1 = presence of heart disease
y = (y.iloc[:, 0] > 0).astype(int)

print("Dataset shape:", X.shape)
print("Features:")
print(X.columns.tolist())

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create complete ML pipeline
model = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(max_iter=1000))
])

# Train model
model.fit(X_train, y_train)

# Test model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model and feature names
joblib.dump(model, "heart_model.pkl")
joblib.dump(X.columns.tolist(), "feature_names.pkl")

print("\nModel saved successfully!")