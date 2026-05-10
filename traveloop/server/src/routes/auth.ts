import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const signToken = (user: { id: string; email: string; isAdmin: boolean }) =>
  jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '7d' });

// POST /api/auth/signup
router.post('/signup',
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  async (req, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  }
);

// POST /api/auth/login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, profilePhoto: user.profilePhoto, isAdmin: user.isAdmin } });
  }
);

// POST /api/auth/logout (client should clear token)
router.post('/logout', verifyToken, (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, profilePhoto: true, language: true, isAdmin: true, createdAt: true } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

export default router;
