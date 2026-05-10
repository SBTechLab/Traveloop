import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { AuthRequest, verifyToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { sendItineraryShareEmail } from '../utils/emailService';

const router = Router();
const prisma = new PrismaClient();

// GET /api/trips
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user!.id },
    include: { stops: { include: { city: true, stopActivities: true } }, budget: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(trips);
});

// POST /api/trips
router.post('/', verifyToken, upload.single('coverPhoto'), async (req: AuthRequest, res: Response) => {
  const { name, description, startDate, endDate, isPublic, budgetCap } = req.body;
  if (!name || !startDate || !endDate) { res.status(400).json({ error: 'name, startDate, endDate required' }); return; }
  if (new Date(endDate) <= new Date(startDate)) { res.status(400).json({ error: 'endDate must be after startDate' }); return; }

  const coverPhoto = req.file ? `/uploads/covers/${req.file.filename}` : null;
  const trip = await prisma.trip.create({
    data: {
      userId: req.user!.id,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverPhoto,
      isPublic: isPublic === 'true',
      shareSlug: isPublic === 'true' ? randomUUID() : null,
      budgetCap: budgetCap ? parseFloat(budgetCap) : null,
    },
    include: { stops: true, budget: true },
  });
  res.status(201).json(trip);
});

// GET /api/trips/:id
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
    include: {
      stops: { include: { city: true, stopActivities: { include: { activity: true } } }, orderBy: { order: 'asc' } },
      budget: true,
      notes: { orderBy: { createdAt: 'desc' } },
      packingItems: true,
    },
  });
  if (!trip) { res.status(404).json({ error: 'Trip not found' }); return; }
  res.json(trip);
});

// PUT /api/trips/:id
router.put('/:id', verifyToken, upload.single('coverPhoto'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, startDate, endDate, isPublic, budgetCap } = req.body;
  const existing = await prisma.trip.findFirst({ where: { id: String(req.params.id), userId: req.user!.id } });
  if (!existing) { res.status(404).json({ error: 'Trip not found' }); return; }

  const coverPhoto = req.file ? `/uploads/covers/${req.file.filename}` : existing.coverPhoto;
  const shouldBePublic = isPublic === 'true';
  const shareSlug = shouldBePublic ? (existing.shareSlug || randomUUID()) : null;

  const trip = await prisma.trip.update({
    where: { id: String(req.params.id) },
    data: {
      name: name || existing.name,
      description: description ?? existing.description,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      endDate: endDate ? new Date(endDate) : existing.endDate,
      coverPhoto,
      isPublic: shouldBePublic,
      shareSlug,
      budgetCap: budgetCap !== undefined ? parseFloat(budgetCap) : existing.budgetCap,
    },
    include: { stops: { include: { city: true } }, budget: true },
  });
  res.json(trip);
});

// DELETE /api/trips/:id
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.trip.findFirst({ where: { id: String(req.params.id), userId: req.user!.id } });
  if (!existing) { res.status(404).json({ error: 'Trip not found' }); return; }
  await prisma.trip.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Trip deleted' });
});

// POST /api/trips/:id/share
router.post('/:id/share', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    res.status(400).json({ error: 'emails array required' });
    return;
  }

  const trip = await prisma.trip.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id }
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  // Ensure trip is shared if not already
  let shareSlug = trip.shareSlug;
  if (!shareSlug) {
    shareSlug = randomUUID();
    await prisma.trip.update({
      where: { id: trip.id },
      data: { isPublic: true, shareSlug }
    });
  }

  const shareLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/share/${shareSlug}`;

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const senderName = currentUser?.name || 'A Traveloop User';

    for (const email of emails) {
      await sendItineraryShareEmail(email, senderName, trip.name, shareLink);
    }
    res.json({ message: `Itinerary shared with ${emails.length} friends` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send share emails' });
  }
});

export default router;
