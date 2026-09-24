import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'servicedesk_pro_jwt_secret_dev_key_2026_x99!',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
