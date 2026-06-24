import os
import sys
import json
import pickle
import numpy as np
import warnings

# Suppress sklearn feature name warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Path to saved model
ML_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(ML_DIR, 'sleep_model.pkl')

def print_error(msg):
    print(json.dumps({"error": msg}))
    sys.exit(1)

def main():
    if not os.path.exists(MODEL_PATH):
        print_error("Trained model sleep_model.pkl not found. Please run train.py first.")

    # Read input from command line arguments
    if len(sys.argv) < 2:
        print_error("No input JSON string provided.")

    try:
        input_data = json.loads(sys.argv[1])
    except Exception as e:
        print_error(f"Failed to parse input JSON: {str(e)}")

    # Load model and encoders
    try:
        with open(MODEL_PATH, 'rb') as f:
            payload = pickle.load(f)
    except Exception as e:
        print_error(f"Failed to load model payload: {str(e)}")

    model = payload['model']
    features = payload['features']
    gender_map = payload['gender_map']
    bmi_map = payload['bmi_map']
    occupation_map = payload['occupation_map']
    disorder_inverse_map = payload['disorder_inverse_map']
    unique_occupations = payload.get('unique_occupations', [])

    # Extract inputs and provide reasonable defaults
    gender = input_data.get('Gender', 'Male')
    age = float(input_data.get('Age', 35))
    sleep_duration = float(input_data.get('Sleep Duration', 7.0))
    sleep_quality = float(input_data.get('Quality of Sleep', 7.0))
    physical_activity = float(input_data.get('Physical Activity Level', 45.0))
    stress_level = float(input_data.get('Stress Level', 5.0))
    bmi_category = input_data.get('BMI Category', 'Normal')
    heart_rate = float(input_data.get('Heart Rate', 72.0))
    daily_steps = float(input_data.get('Daily Steps', 7000.0))
    
    # Blood Pressure parsing
    bp_str = input_data.get('Blood Pressure', '120/80')
    try:
        systolic, diastolic = map(float, bp_str.split('/'))
    except Exception:
        systolic, diastolic = 120.0, 80.0

    occupation = input_data.get('Occupation', 'Software Engineer')

    # Encode inputs
    gender_code = gender_map.get(gender, gender_map.get('Male', 0))
    bmi_code = bmi_map.get(bmi_category, bmi_map.get('Normal', 0))
    
    # Gracefully map occupation (find matching occupation index or pick best/default 0)
    occupation_code = occupation_map.get(occupation)
    if occupation_code is None:
        # Try case-insensitive matching
        matched = False
        for occ, code in occupation_map.items():
            if occ.lower() == occupation.lower():
                occupation_code = code
                matched = True
                break
        if not matched:
            # Pick first available as fallback
            occupation_code = 0

    # Build feature vector
    # Order: ['Gender_Code', 'Age', 'Sleep Duration', 'Quality of Sleep',
    #         'Physical Activity Level', 'Stress Level', 'BMI_Code',
    #         'Heart Rate', 'Daily Steps', 'Systolic_BP', 'Diastolic_BP', 'Occupation_Code']
    
    feature_vector = [
        gender_code,
        age,
        sleep_duration,
        sleep_quality,
        physical_activity,
        stress_level,
        bmi_code,
        heart_rate,
        daily_steps,
        systolic,
        diastolic,
        occupation_code
    ]

    # Predict
    try:
        prediction_code = int(model.predict([feature_vector])[0])
        probabilities = model.predict_proba([feature_vector])[0]
        confidence = float(probabilities[prediction_code])
        disorder = disorder_inverse_map.get(prediction_code, 'None')
    except Exception as e:
        print_error(f"Error during model prediction: {str(e)}")

    # Calculate Risk Level
    if disorder == 'None':
        risk_level = 'Low'
    else:
        if confidence >= 0.70:
            risk_level = 'High'
        else:
            risk_level = 'Medium'

    # Return prediction as JSON
    result = {
        "disorder": disorder,
        "confidence": round(confidence * 100, 1),
        "risk": risk_level
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
