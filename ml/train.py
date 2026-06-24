
import os
import urllib.request
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Paths
ML_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(ML_DIR, 'dataset')
DATASET_PATH = os.path.join(DATASET_DIR, 'sleep_health_and_lifestyle_dataset.csv')
MODEL_PATH = os.path.join(ML_DIR, 'sleep_model.pkl')

# Ensure directories exist
os.makedirs(DATASET_DIR, exist_ok=True)

# Dataset URLs
URLS = [
    "https://raw.githubusercontent.com/OludolapoAnalyst/Sleep-and-Lifestyle-Dataset/main/Sleep_health_and_lifestyle_dataset.csv",
    "https://raw.githubusercontent.com/miayulia/Sleep-and-Health-Lifestyle-Analysis/main/Sleep_health_and_lifestyle_dataset.csv"
]

def download_dataset():
    """Tries to download the dataset from public URLs. Falls back to generating a realistic dataset if offline."""
    print("Attempting to download Kaggle sleep dataset...")
    for url in URLS:
        try:
            urllib.request.urlretrieve(url, DATASET_PATH)
            print(f"Dataset successfully downloaded from: {url}")
            return True
        except Exception as e:
            print(f"Failed to download from {url}: {e}")
    return False

def generate_fallback_dataset():
    """Generates a statistically representative synthetic dataset resembling the Kaggle sleep dataset."""
    print("Generating representative fallback dataset...")
    np.random.seed(42)
    n_samples = 400

    # Categorical option arrays
    genders = ['Male', 'Female']
    occupations = ['Software Engineer', 'Doctor', 'Nurse', 'Teacher', 'Engineer', 'Accountant', 'Lawyer', 'Salesperson', 'Scientist']
    bmi_categories = ['Normal', 'Overweight', 'Obese']
    disorders = ['None', 'Insomnia', 'Sleep Apnea']

    data = {
        'Person ID': list(range(1, n_samples + 1)),
        'Gender': np.random.choice(genders, n_samples),
        'Age': np.random.randint(25, 60, n_samples),
        'Occupation': np.random.choice(occupations, n_samples),
        'Sleep Duration': np.zeros(n_samples),
        'Quality of Sleep': np.zeros(n_samples),
        'Physical Activity Level': np.zeros(n_samples),
        'Stress Level': np.zeros(n_samples),
        'BMI Category': np.random.choice(bmi_categories, n_samples, p=[0.5, 0.4, 0.1]),
        'Blood Pressure': [],
        'Heart Rate': np.zeros(n_samples),
        'Daily Steps': np.zeros(n_samples),
        'Sleep Disorder': []
    }

    # Generate correlated data to make model learn realistic patterns
    for i in range(n_samples):
        age = data['Age'][i]
        gender = data['Gender'][i]
        occ = data['Occupation'][i]
        bmi = data['BMI Category'][i]

        # Determine features based on profile
        if occ in ['Nurse', 'Salesperson'] or bmi in ['Overweight', 'Obese']:
            # More likely to have insomnia/sleep apnea or higher stress
            stress = np.random.randint(6, 10)
            sleep_quality = np.random.randint(4, 7)
            sleep_duration = np.round(np.random.uniform(5.0, 6.5), 1)
            activity = np.random.randint(30, 60)
            steps = np.random.randint(4000, 7000)
            heart_rate = np.random.randint(72, 85)
            bp_sys = np.random.randint(130, 145)
            bp_dia = np.random.randint(85, 95)
            
            # Predict disorder based on profile
            dis = np.random.choice(['Insomnia', 'Sleep Apnea', 'None'], p=[0.4, 0.4, 0.2])
        else:
            stress = np.random.randint(3, 6)
            sleep_quality = np.random.randint(7, 10)
            sleep_duration = np.round(np.random.uniform(7.0, 8.5), 1)
            activity = np.random.randint(45, 90)
            steps = np.random.randint(7000, 11000)
            heart_rate = np.random.randint(65, 75)
            bp_sys = np.random.randint(115, 125)
            bp_dia = np.random.randint(75, 85)
            dis = 'None'

        data['Sleep Duration'][i] = sleep_duration
        data['Quality of Sleep'][i] = sleep_quality
        data['Physical Activity Level'][i] = activity
        data['Stress Level'][i] = stress
        data['Heart Rate'][i] = heart_rate
        data['Daily Steps'][i] = steps
        data['Blood Pressure'].append(f"{bp_sys}/{bp_dia}")
        data['Sleep Disorder'].append(dis)

    df = pd.DataFrame(data)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Fallback dataset saved to: {DATASET_PATH}")

def preprocess_and_train():
    if not os.path.exists(DATASET_PATH):
        success = download_dataset()
        if not success:
            generate_fallback_dataset()

    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)

    # 1. Clean sleep disorder labels
    df['Sleep Disorder'] = df['Sleep Disorder'].fillna('None')
    # Standardize names
    df['Sleep Disorder'] = df['Sleep Disorder'].replace({
        'No Sleep Disorder': 'None',
        'none': 'None',
        'None': 'None'
    })

    # 2. Clean BMI Category labels
    df['BMI Category'] = df['BMI Category'].replace({
        'Normal Weight': 'Normal',
        'normal': 'Normal'
    })

    # 3. Process Blood Pressure into Systolic and Diastolic
    bp_split = df['Blood Pressure'].str.split('/', expand=True)
    df['Systolic_BP'] = pd.to_numeric(bp_split[0])
    df['Diastolic_BP'] = pd.to_numeric(bp_split[1])

    # Save encoders for categorical variables
    gender_map = {'Male': 0, 'Female': 1}
    
    # For BMI Category
    bmi_map = {'Normal': 0, 'Overweight': 1, 'Obese': 2}
    
    # For Occupations - find all unique values
    unique_occupations = sorted(df['Occupation'].unique().tolist())
    occupation_map = {occ: idx for idx, occ in enumerate(unique_occupations)}

    # Map target
    disorder_map = {'None': 0, 'Insomnia': 1, 'Sleep Apnea': 2}
    disorder_inverse_map = {0: 'None', 1: 'Insomnia', 2: 'Sleep Apnea'}

    # Prepare features and target
    df['Gender_Code'] = df['Gender'].map(gender_map).fillna(0).astype(int)
    df['BMI_Code'] = df['BMI Category'].map(bmi_map).fillna(0).astype(int)
    df['Occupation_Code'] = df['Occupation'].map(occupation_map).fillna(0).astype(int)
    df['Target'] = df['Sleep Disorder'].map(disorder_map).fillna(0).astype(int)

    features = [
        'Gender_Code', 'Age', 'Sleep Duration', 'Quality of Sleep',
        'Physical Activity Level', 'Stress Level', 'BMI_Code',
        'Heart Rate', 'Daily Steps', 'Systolic_BP', 'Diastolic_BP', 'Occupation_Code'
    ]

    X = df[features]
    y = df['Target']

    # Handle missing values if any
    X = X.fillna(X.median())

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Training Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['None', 'Insomnia', 'Sleep Apnea']))

    # Retrain on full data
    print("Retraining on full dataset...")
    model.fit(X, y)

    # Pack model with mapping details for predict.py
    model_payload = {
        'model': model,
        'features': features,
        'gender_map': gender_map,
        'bmi_map': bmi_map,
        'occupation_map': occupation_map,
        'disorder_inverse_map': disorder_inverse_map,
        'unique_occupations': unique_occupations
    }

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model_payload, f)

    print(f"Model and mappings saved to {MODEL_PATH}")

if __name__ == "__main__":
    preprocess_and_train()
