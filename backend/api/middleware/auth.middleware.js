import jwt from 'jsonwebtoken';
import { SECRET } from '../utils/jwt.js';

export const verifyAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided. Access denied." });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

//(Authorization) Checks if the logged-in user is an ORGANIZER.
// This must run after verifyAuth.
 
export const isOrganizer = (req, res, next) => {
  if (req.user && req.user.role === 'ORGANIZER') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Organizer role required." });
  }
};


//(Authorization) Checks if the logged-in user is an ORGANIZER or an ADMIN.
//This must run after verifyAuth.
 
export const isOrganizerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ORGANIZER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Organizer or Admin role required." });
  }
};


//(Authorization) Checks if the logged-in user is a STUDENT.
//This must run after verifyAuth.

export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'STUDENT') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Student role required." });
  }
};

