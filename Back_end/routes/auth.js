const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// Register
router.post('/register',
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  body('email').isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password, email } = req.body;
    try {
      let user = await User.findOne({ username });
      if(user) return res.status(400).json({ msg: 'User already exists' });

      user = await User.findOne({ email });
      if(user) return res.status(400).json({ msg: 'Email already used' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ username, email, password: hashedPassword });
      await user.save();

      const payload = { userId: user.id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Login - unchanged
router.post('/login',
  body('username').exists(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if(!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const payload = { userId: user.id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Request Password Reset (case-insensitive email search)
router.post('/request-reset',
  body('email').isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    const email = req.body.email;
    try {
      const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (!user) return res.status(404).json({ msg: 'User with this email not found' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
      });

      const resetLink = `http://localhost:3000/reset-password?token=${token}`;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Train Route Finder Password Reset',
        html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
      });

      res.json({ msg: 'Password reset link sent to your email' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Reset Password
router.post('/reset-password',
  body('token').exists(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, password } = req.body;
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.userId);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      res.json({ msg: 'Password reset successful' });
    } catch (err) {
      console.error('JWT verify error:', err);
      res.status(400).json({ msg: 'Invalid or expired token' });
    }
  }
);

module.exports = router;
