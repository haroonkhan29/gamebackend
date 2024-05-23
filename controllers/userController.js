const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 

const User = require('../models/userModel');

const { generateOTP } = require('../utils');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'averroestech1@gmail.com',
    pass: 'rfnaejvdvcwnbtzg',
  },

});

const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    user.resetToken = otp;
    user.resetTokenExpiration = Date.now() + 3600000;

    await user.save();
    
    console.log('Sending OTP for email:', user.email);
    console.log('Generated OTP:', otp);

    await  transporter.sendMail({
      from: '"Averroes" averroestech1@gmail.com',
      to: user.email,
      subject: 'OTP for Password Reset',
      html: `<p>Your OTP for password reset is: ${otp}</p>`,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.resetToken !== otp || Date.now() > user.resetTokenExpiration) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const registerUser = async (req, res) => {
  const { firstname, lastname , username, email, password , type} = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      type,
    });

    await newUser.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id; 

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      type: user.type,
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      type: user.type,
    };

    res.json({ token, user: userData });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword, 
  sendOTP, 
  getUserById,
  getAllUsers,
  deleteUser, 
};