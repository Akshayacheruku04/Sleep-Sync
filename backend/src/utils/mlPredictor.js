const { spawn } = require('child_process');
const path = require('path');

// Absolute path to predict.py
const PREDICT_SCRIPT_PATH = path.join(__dirname, '..', '..', '..', 'ml', 'predict.py');

/**
 * Invokes the Python random forest classifier to predict sleep disorders.
 * Falls back to a safe default if execution fails.
 */
function predictSleepDisorder(user, entry) {
  return new Promise((resolve) => {
    // 1. Determine BMI Category
    let bmiCategory = 'Normal';
    if (user.bmi) {
      if (user.bmi >= 30) {
        bmiCategory = 'Obese';
      } else if (user.bmi >= 25) {
        bmiCategory = 'Overweight';
      }
    }

    // 2. Prepare payload
    const payload = {
      Gender: user.gender === 'Male' || user.gender === 'Female' ? user.gender : 'Male',
      Age: user.age || 35,
      Occupation: user.occupation || 'Software Engineer',
      'Sleep Duration': entry.sleepDuration,
      'Quality of Sleep': entry.sleepQuality,
      'Physical Activity Level': entry.physicalActivity,
      'Stress Level': entry.stressLevel,
      'BMI Category': bmiCategory,
      'Daily Steps': entry.dailySteps,
      'Blood Pressure': '120/80', // Default BP
      'Heart Rate': 70.0 // Default resting heart rate
    };

    // Synthesize heart rate and BP from physical activity/stress if available to make data dynamic
    if (entry.stressLevel > 7) {
      payload['Heart Rate'] = 78.0;
      payload['Blood Pressure'] = '135/88';
    } else if (entry.sleepDuration < 6) {
      payload['Heart Rate'] = 74.0;
      payload['Blood Pressure'] = '128/84';
    }

    const payloadString = JSON.stringify(payload);
    
    // Determine command to run python (could be python or python3)
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    console.log(`Spawning ML prediction: ${pythonCmd} ${PREDICT_SCRIPT_PATH}`);

    const pyProcess = spawn(pythonCmd, [PREDICT_SCRIPT_PATH, payloadString]);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`ML prediction script failed with exit code ${code}`);
        console.error(`Stderr: ${stderrData}`);
        return resolve(getFallbackPrediction(entry));
      }

      try {
        const result = JSON.parse(stdoutData.trim());
        if (result.error) {
          console.error(`ML script returned error: ${result.error}`);
          return resolve(getFallbackPrediction(entry));
        }
        resolve(result);
      } catch (err) {
        console.error(`Failed to parse ML script output: ${stdoutData}`);
        resolve(getFallbackPrediction(entry));
      }
    });

    pyProcess.on('error', (err) => {
      console.error(`Failed to start ML prediction subprocess: ${err.message}`);
      resolve(getFallbackPrediction(entry));
    });
  });
}

/**
 * Standard rule-based fallback model in case Python is missing or error occurs.
 */
function getFallbackPrediction(entry) {
  console.log("Using rule-based fallback predictor...");
  
  const sleep = entry.sleepDuration;
  const stress = entry.stressLevel;
  const quality = entry.sleepQuality;

  let disorder = 'None';
  let confidence = 90.0;
  let risk = 'Low';

  // Rule 1: High stress, low sleep duration, poor sleep quality -> Insomnia
  if (sleep < 6.0 && stress >= 7 && quality <= 5) {
    disorder = 'Insomnia';
    confidence = 82.5;
    risk = 'High';
  } 
  // Rule 2: Moderate-low sleep, high stress, but medium quality -> sleep apnea tendency
  else if (sleep < 6.5 && stress >= 6 && quality <= 6) {
    disorder = 'Sleep Apnea';
    confidence = 74.0;
    risk = 'High';
  }
  // Rule 3: Extreme poor sleep
  else if (sleep < 5.0) {
    disorder = 'Insomnia';
    confidence = 88.0;
    risk = 'High';
  }

  return {
    disorder,
    confidence,
    risk
  };
}

module.exports = { predictSleepDisorder };
