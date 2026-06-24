require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function check() {
  const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sleepsync';
  console.log('Connecting to database...');
  
  try {
    await mongoose.connect(dbURI);
    console.log('Connected successfully!');
    
    const users = await User.find({}, 'name email role createdAt');
    console.log(`Found ${users.length} user(s) in the database:`);
    users.forEach(u => {
      console.log(`- Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Created: ${u.createdAt}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

check();
