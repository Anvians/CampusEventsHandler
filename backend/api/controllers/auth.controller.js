import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, SECRET } from '../utils/jwt.js';
import { sendEmail } from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();


export const signup = async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const numericYear = year ? parseInt(year, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        year: numericYear,
        role: 'STUDENT',
        verified: true, 
      },
    });

    const token = generateToken(user.id, user.role);
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'SignUp Successful', token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login Successful', token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const promoteToOrganizer = async (req, res) => {
  try {
    const { userIdToPromote } = req.body; 
    
    if (!userIdToPromote) {
      return res.status(400).json({ message: 'userIdToPromote is required in the body' });
    }

    const userId = parseInt(userIdToPromote, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'ORGANIZER') {
      return res.status(400).json({ message: 'User is already an organizer' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'ORGANIZER',
        year: null, 
      },
    });
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ message: 'User promoted to organizer', user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        year: true,
        verified: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // This prevents "email enumeration" attacks, where a hacker
    // could guess which emails are registered in your system.
    if (!user) {
      return res.json({
        message: 'If your email is registered, you will receive a password reset link.',
      });
    }

    const resetToken = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: '15m',
    });


    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Please click the link below to set a new one:</p>
      <a href="${resetUrl}" target="_blank">Reset Your Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, 'Password Reset for College Connect', emailHtml);

    res.json({
      message: 'If your email is registered, you will receive a password reset link.',
    });
  } catch (err) {
    console.error(err);
    res.json({
      message: 'If your email is registered, you will receive a password reset link.',
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (verifyError) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyToken = async (req, res) => {
  try {

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        year: true,
        profile_photo: true,
        verified: true,
      }
    });

    if (!user) {
      return res.status(404).json({message: 'User not found' });
    }

 
    res.json(user);
  } catch (err) {
    console.error("Verify token error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

