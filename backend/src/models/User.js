const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
    trim: true
  },
  height: {
    type: Number,
    required: [true, 'Height in cm is required'],
    min: [30, 'Height must be valid']
  },
  weight: {
    type: Number,
    required: [true, 'Weight in kg is required'],
    min: [5, 'Weight must be valid']
  },
  bmi: {
    type: Number
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate BMI automatically before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('height') || this.isModified('weight')) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
