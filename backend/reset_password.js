require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function reset() {
  const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sleepsync';
  console.log('Connecting to database...');
  
  try {
    await mongoose.connect(dbURI);
    console.log('Connected successfully!');
    
    const email = 'akshayareddycheruku@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }
    
    const newPassword = 'password123';
    console.log(`Setting password to: "${newPassword}" for user ${email}`);
    
    user.password = newPassword;
    await user.save();
    
    console.log('Password updated and hashed successfully!');
    
    // Test comparison
    const doubleCheckUser = await User.findOne({ email });
    const isMatch = await doubleCheckUser.comparePassword(newPassword);
    console.log('Test comparison match result:', isMatch ? 'SUCCESS (Match!)' : 'FAILED (No Match)');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

reset();
