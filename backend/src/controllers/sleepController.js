const DailyEntry = require('../models/DailyEntry');
const User = require('../models/User');
const { calculateSleepScore } = require('../utils/sleepScore');
const { predictSleepDisorder } = require('../utils/mlPredictor');

// Helpers for streak and badges
const calculateStreak = (entries) => {
  if (entries.length === 0) return 0;
  
  // Sort dates descending
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If latest entry is neither today nor yesterday, streak is broken
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    
    // Difference in days
    const diffTime = Math.abs(current - next);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // Streak broken
    }
  }

  return streak;
};

const calculateBadges = (entries) => {
  const badges = [];
  
  // Early Sleeper badge: bedTime before 23:00 (11 PM) for at least 3 days
  let earlySleepCount = 0;
  // Stress Master: stress level <= 3 for at least 3 days
  let lowStressCount = 0;
  // Sleep Champion: sleep quality >= 8 for at least 3 days
  let highQualityCount = 0;
  // Fitness Enthusiast: steps >= 10,000 OR activity >= 45 mins for at least 3 days
  let fitnessCount = 0;

  entries.forEach(e => {
    // 1. Check bedTime
    if (e.bedTime) {
      const parts = e.bedTime.split(':');
      if (parts.length === 2) {
        const hour = parseInt(parts[0]);
        // If hour is < 23 (11 PM) or hour >= 18 (6 PM, indicating bedtime of the previous night)
        if (hour < 23 || hour >= 18) {
          earlySleepCount++;
        }
      }
    }
    // 2. Check stress level
    if (e.stressLevel <= 3) {
      lowStressCount++;
    }
    // 3. Check sleep quality
    if (e.sleepQuality >= 8) {
      highQualityCount++;
    }
    // 4. Check steps or activity
    if (e.dailySteps >= 10000 || e.physicalActivity >= 45) {
      fitnessCount++;
    }
  });

  if (earlySleepCount >= 3) badges.push({ id: 'early_sleeper', name: 'Early Sleeper', description: 'Bedtime logged before 11 PM for 3+ days', icon: 'Moon' });
  if (lowStressCount >= 3) badges.push({ id: 'stress_master', name: 'Stress Master', description: 'Stress level kept at 3 or lower for 3+ days', icon: 'Shield' });
  if (highQualityCount >= 3) badges.push({ id: 'sleep_champion', name: 'Sleep Champion', description: 'Sleep quality rated 8 or higher for 3+ days', icon: 'Award' });
  if (fitnessCount >= 3) badges.push({ id: 'fitness_enthusiast', name: 'Fitness Enthusiast', description: 'Steps (10k+) or activity (45m+) hit for 3+ days', icon: 'Flame' });

  return badges;
};

// Log Daily Sleep Entry
const logEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      date,
      sleepDuration,
      sleepQuality,
      stressLevel,
      physicalActivity,
      dailySteps,
      mood,
      screenTime,
      coffeeIntake,
      bedTime,
      wakeUpTime
    } = req.body;

    if (!date || sleepDuration === undefined || sleepQuality === undefined || stressLevel === undefined || physicalActivity === undefined || dailySteps === undefined || !mood) {
      return res.status(400).json({ error: 'All core fields are required' });
    }

    // 1. Calculate Sleep Score
    const { score, category } = calculateSleepScore({
      sleepDuration: Number(sleepDuration),
      sleepQuality: Number(sleepQuality),
      stressLevel: Number(stressLevel),
      physicalActivity: Number(physicalActivity),
      dailySteps: Number(dailySteps),
      mood
    });

    // 2. Fetch user to provide demographic info to ML
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Make ML prediction
    const tempEntry = {
      sleepDuration: Number(sleepDuration),
      sleepQuality: Number(sleepQuality),
      physicalActivity: Number(physicalActivity),
      stressLevel: Number(stressLevel),
      dailySteps: Number(dailySteps)
    };
    const prediction = await predictSleepDisorder(user, tempEntry);

    // 4. Create or update entry (Upsert)
    const entryData = {
      userId,
      date,
      sleepDuration: Number(sleepDuration),
      sleepQuality: Number(sleepQuality),
      stressLevel: Number(stressLevel),
      physicalActivity: Number(physicalActivity),
      dailySteps: Number(dailySteps),
      mood,
      screenTime: screenTime !== undefined ? Number(screenTime) : null,
      coffeeIntake: coffeeIntake !== undefined ? Number(coffeeIntake) : null,
      bedTime: bedTime || null,
      wakeUpTime: wakeUpTime || null,
      sleepScore: score,
      sleepScoreCategory: category,
      predictionDisorder: prediction.disorder,
      predictionConfidence: prediction.confidence,
      predictionRisk: prediction.risk
    };

    const entry = await DailyEntry.findOneAndUpdate(
      { userId, date },
      entryData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Daily entry saved successfully',
      entry
    });
  } catch (error) {
    console.error('Log Entry Error:', error);
    res.status(500).json({ error: 'Failed to save daily entry. Please try again.' });
  }
};

// Get History list
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, page = 1, limit = 10 } = req.query;

    const query = { userId };
    
    // Admin query override: Admin can view all entries
    if (req.user.role === 'Admin') {
      delete query.userId;
    }

    if (search) {
      query.$or = [
        { mood: { $regex: search, $options: 'i' } },
        { predictionDisorder: { $regex: search, $options: 'i' } },
        { sleepScoreCategory: { $regex: search, $options: 'i' } },
        { date: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const entries = await DailyEntry.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');

    const total = await DailyEntry.countDocuments(query);

    res.status(200).json({
      entries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ error: 'Failed to retrieve sleep logs' });
  }
};

// Delete daily log
const deleteEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    const entry = await DailyEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Role check: users can only delete their own entries
    if (req.user.role !== 'Admin' && entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own logs' });
    }

    await DailyEntry.findByIdAndDelete(entryId);
    res.status(200).json({ message: 'Daily sleep log deleted successfully' });
  } catch (error) {
    console.error('Delete Entry Error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
};

// Get Dashboard Info
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all logs for user
    const entries = await DailyEntry.find({ userId }).sort({ date: -1 });

    // 1. Calculate health streak
    const streak = calculateStreak(entries);

    // 2. Fetch latest entry
    const latestEntry = entries[0] || null;

    // 3. Compute Badges
    const badges = calculateBadges(entries);

    // 4. Fetch user profile stats
    const user = await User.findById(userId);

    res.status(200).json({
      streak,
      badges,
      latestEntry,
      user: {
        name: user.name,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        bmi: user.bmi,
        createdAt: user.createdAt,
        totalEntries: entries.length
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};

// Get Weekly analytics
const getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get logs for the last 7 entries
    const entries = await DailyEntry.find({ userId }).sort({ date: -1 }).limit(7);
    
    // Sort chronological for frontend charts
    const chartEntries = [...entries].reverse();

    if (entries.length === 0) {
      return res.status(200).json({
        hasData: false,
        averages: { sleepDuration: 0, stressLevel: 0, sleepQuality: 0, totalSteps: 0 },
        chartData: []
      });
    }

    // Averages
    const totalSleep = entries.reduce((sum, e) => sum + e.sleepDuration, 0);
    const totalStress = entries.reduce((sum, e) => sum + e.stressLevel, 0);
    const totalQuality = entries.reduce((sum, e) => sum + e.sleepQuality, 0);
    const totalSteps = entries.reduce((sum, e) => sum + e.dailySteps, 0);

    const count = entries.length;

    // Mood distribution
    const moodCounts = {};
    entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    res.status(200).json({
      hasData: true,
      averages: {
        sleepDuration: parseFloat((totalSleep / count).toFixed(1)),
        stressLevel: parseFloat((totalStress / count).toFixed(1)),
        sleepQuality: parseFloat((totalQuality / count).toFixed(1)),
        totalSteps: Math.round(totalSteps)
      },
      moodDistribution: moodCounts,
      chartData: chartEntries.map(e => ({
        date: e.date,
        sleepDuration: e.sleepDuration,
        sleepQuality: e.sleepQuality,
        stressLevel: e.stressLevel,
        dailySteps: e.dailySteps,
        physicalActivity: e.physicalActivity,
        mood: e.mood
      }))
    });
  } catch (error) {
    console.error('Weekly Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly analytics reports' });
  }
};

module.exports = {
  logEntry,
  getHistory,
  deleteEntry,
  getDashboardStats,
  getWeeklyAnalytics
};
