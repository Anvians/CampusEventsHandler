import jwt from 'jsonwebtoken';

export const SECRET = process.env.JWT_SECRET || "mysupersecretkey";


export const generateToken = (userId, role) => {
  const payload = { id: userId, role };
  
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

