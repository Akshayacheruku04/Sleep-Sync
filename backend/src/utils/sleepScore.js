/**
 * Calculates a sleep score out of 100 based on daily habits.
 * 
 * Score breakdown:
 * - Sleep Duration (Max 25 pts)
 * - Sleep Quality (Max 25 pts)
 * - Stress Level (Max 15 pts)
 * - Physical Activity (Max 15 pts)
 * - Daily Steps (Max 10 pts)
 * - Mood (Max 10 pts)
 */
function calculateSleepScore({
  sleepDuration,
  sleepQuality,
  stressLevel,
  physicalActivity,
  dailySteps,
  mood
}) {
  let score = 0;

  // 1. Sleep Duration (Ideal: 7-9 hours) - Max 25
  if (sleepDuration >= 7.0 && sleepDuration <= 9.0) {
    score += 25;
  } else if ((sleepDuration >= 6.0 && sleepDuration < 7.0) || (sleepDuration > 9.0 && sleepDuration <= 10.0)) {
    score += 20;
  } else if (sleepDuration >= 5.0 && sleepDuration < 6.0) {
    score += 15;
  } else {
    score += 10; // Extreme sleep duration (too low or too high)
  }

  // 2. Sleep Quality (1-10) - Max 25
  const qualityScore = Math.max(1, Math.min(10, sleepQuality));
  score += qualityScore * 2.5;

  // 3. Stress Level (1-10) - Max 15 (lower stress = higher points)
  const stress = Math.max(1, Math.min(10, stressLevel));
  score += (11 - stress) * 1.5;

  // 4. Physical Activity (Minutes) - Max 15 (target 30+ minutes)
  const activityScore = Math.min(15, (physicalActivity / 30) * 15);
  score += activityScore;

  // 5. Daily Steps - Max 10 (target 10,000 steps)
  const stepsScore = Math.min(10, (dailySteps / 10000) * 10);
  score += stepsScore;

  // 6. Mood - Max 10
  const moodPoints = {
    'Very Happy': 10,
    'Happy': 8,
    'Neutral': 6,
    'Sad': 4,
    'Very Stressed': 2
  };
  score += moodPoints[mood] || 6;

  // Final score processing
  const finalScore = Math.round(score);
  
  // Categorization
  let category = 'Poor';
  if (finalScore >= 90) {
    category = 'Excellent';
  } else if (finalScore >= 75) {
    category = 'Good';
  } else if (finalScore >= 50) {
    category = 'Moderate';
  }

  return {
    score: finalScore,
    category
  };
}

module.exports = { calculateSleepScore };
