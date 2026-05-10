import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notes/:tripId
router.get('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not authorized' }); return; }
  const notes = await prisma.tripNote.findMany({
    where: { tripId: String(req.params.tripId) },
    include: { stop: { include: { city: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notes);
});

// POST /api/notes/:tripId
router.post('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not authorized' }); return; }
  const { content, stopId } = req.body;
  if (!content) { res.status(400).json({ error: 'content required' }); return; }
  const note = await prisma.tripNote.create({
    data: { tripId: String(req.params.tripId), userId: req.user!.id, content, stopId: stopId || null },
    include: { stop: { include: { city: true } } },
  });
  res.status(201).json(note);
});

// PUT /api/notes/note/:id
router.put('/note/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await prisma.tripNote.findUnique({ where: { id: String(req.params.id) } });
  if (!note || note.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }
  const updated = await prisma.tripNote.update({
    where: { id: String(req.params.id) },
    data: { content: req.body.content },
    include: { stop: { include: { city: true } } },
  });
  res.json(updated);
});

// DELETE /api/notes/note/:id
router.delete('/note/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await prisma.tripNote.findUnique({ where: { id: String(req.params.id) } });
  if (!note || note.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }
  await prisma.tripNote.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Note deleted' });
});

export default router;
