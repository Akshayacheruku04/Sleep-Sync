const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret',
    { expiresIn: '7d' }
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, occupation, height, weight, role } = req.body;

    // 1. Basic validation
    if (!name || !email || !password || !age || !gender || !occupation || !height || !weight) {
      return res.status(400).json({ error: 'All registration fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // 3. Admin assignment rule
    let assignedRole = 'User';
    if (role === 'Admin' || email.toLowerCase().startsWith('admin@') || email.toLowerCase() === 'admin@sleepsync.ai') {
      assignedRole = 'Admin';
    }

    // 4. Create user (BMI calculated in Pre-Save hook)
    const user = new User({
      name,
      email,
      password,
      age: Number(age),
      gender,
      occupation,
      height: Number(height),
      weight: Number(weight),
      role: assignedRole
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Cookie configuration (Remember Me logic)
    const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Check user and match token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Session expired, please login again' });
    }

    // Issue new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Clear in database
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
      }
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Set new password (Mongoose pre-save hook will automatically hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Server error during password update' });
  }
};

module.exports = { signup, login, refresh, logout, changePassword };
