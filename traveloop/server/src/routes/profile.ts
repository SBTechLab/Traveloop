import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const prisma = new PrismaClient();

// GET /api/profile
router.get('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, profilePhoto: true, language: true, isAdmin: true, createdAt: true },
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

// PUT /api/profile
router.put('/', verifyToken, upload.single('profilePhoto'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, language, email } = req.body;
  const profilePhoto = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (language) updateData.language = language;
  if (email) updateData.email = email;
  if (profilePhoto) updateData.profilePhoto = profilePhoto;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: { id: true, name: true, email: true, profilePhoto: true, language: true, isAdmin: true },
  });
  res.json(user);
});

// PUT /api/profile/password
router.put('/password', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) { res.status(400).json({ error: 'currentPassword and newPassword required' }); return; }
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: 'Current password incorrect' }); return; }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
  res.json({ message: 'Password updated' });
});

// DELETE /api/profile
router.delete('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.user.delete({ where: { id: req.user!.id } });
  res.json({ message: 'Account deleted' });
});

export default router;
