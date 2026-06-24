const mongoose = require('mongoose');

const dailyEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  sleepDuration: {
    type: Number,
    required: [true, 'Sleep duration is required'],
    min: [0, 'Sleep duration cannot be negative'],
    max: [24, 'Sleep duration cannot exceed 24 hours']
  },
  sleepQuality: {
    type: Number,
    required: [true, 'Sleep quality (1-10) is required'],
    min: [1, 'Sleep quality must be at least 1'],
    max: [10, 'Sleep quality cannot exceed 10']
  },
  stressLevel: {
    type: Number,
    required: [true, 'Stress level (1-10) is required'],
    min: [1, 'Stress level must be at least 1'],
    max: [10, 'Stress level cannot exceed 10']
  },
  physicalActivity: {
    type: Number,
    required: [true, 'Physical activity in minutes is required'],
    min: [0, 'Physical activity cannot be negative']
  },
  dailySteps: {
    type: Number,
    required: [true, 'Daily steps is required'],
    min: [0, 'Daily steps cannot be negative']
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Stressed']
  },
  screenTime: {
    type: Number, // Optional: minutes
    default: null
  },
  coffeeIntake: {
    type: Number, // Optional: cups
    default: null
  },
  bedTime: {
    type: String, // Optional: e.g., "22:30"
    default: null
  },
  wakeUpTime: {
    type: String, // Optional: e.g., "06:30"
    default: null
  },
  sleepScore: {
    type: Number,
    required: true
  },
  sleepScoreCategory: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor']
  },
  predictionDisorder: {
    type: String,
    default: 'None'
  },
  predictionConfidence: {
    type: Number,
    default: 100.0
  },
  predictionRisk: {
    type: String,
    default: 'Low',
    enum: ['Low', 'Medium', 'High']
  }
}, {
  timestamps: true
});

// Ensure a user can only have one entry per date
dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyEntry', dailyEntrySchema);
