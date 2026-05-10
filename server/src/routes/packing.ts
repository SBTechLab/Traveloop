import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/packing/:tripId
router.get('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not authorized' }); return; }
  const items = await prisma.packingItem.findMany({ where: { tripId: String(req.params.tripId) }, orderBy: { category: 'asc' } });
  res.json(items);
});

// POST /api/packing/:tripId
router.post('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not authorized' }); return; }
  const { name, category } = req.body;
  if (!name || !category) { res.status(400).json({ error: 'name and category required' }); return; }
  const item = await prisma.packingItem.create({ data: { tripId: String(req.params.tripId), name, category } });
  res.status(201).json(item);
});

// PATCH /api/packing/item/:id
router.patch('/item/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await prisma.packingItem.findUnique({ where: { id: String(req.params.id) }, include: { trip: true } });
  if (!item || item.trip.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }
  const updated = await prisma.packingItem.update({ where: { id: String(req.params.id) }, data: { isPacked: req.body.isPacked } });
  res.json(updated);
});

// DELETE /api/packing/item/:id
router.delete('/item/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await prisma.packingItem.findUnique({ where: { id: String(req.params.id) }, include: { trip: true } });
  if (!item || item.trip.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }
  await prisma.packingItem.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Item deleted' });
});

// POST /api/packing/:tripId/reset
router.post('/:tripId/reset', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not authorized' }); return; }
  await prisma.packingItem.updateMany({ where: { tripId: String(req.params.tripId) }, data: { isPacked: false } });
  res.json({ message: 'All items reset' });
});

export default router;
