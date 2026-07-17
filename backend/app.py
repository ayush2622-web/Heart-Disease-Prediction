from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load trained model and feature names
model = joblib.load("heart_model.pkl")
feature_names = joblib.load("feature_names.pkl")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Heart Disease Prediction API is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Arrange input in exactly the same order as training data
        input_data = {
            feature: [float(data[feature])]
            for feature in feature_names
        }

        input_df = pd.DataFrame(input_data)

        # Make prediction
        prediction = int(model.predict(input_df)[0])

        # Get probability
        probability = float(model.predict_proba(input_df)[0][1])

        return jsonify({
            "prediction": prediction,
            "probability": round(probability * 100, 2),
            "message": (
                "Higher predicted likelihood of heart disease"
                if prediction == 1
                else "Lower predicted likelihood of heart disease"
            )
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)