import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/activities/city/:cityId?type=&minCost=&maxCost=&maxDuration=
router.get('/city/:cityId', async (req, res: Response) => {
  const { type, minCost, maxCost, maxDuration } = req.query as Record<string, string>;
  const activities = await prisma.activity.findMany({
    where: {
      cityId: String(req.params.cityId),
      ...(type ? { type } : {}),
      ...(minCost || maxCost ? { cost: { gte: minCost ? parseFloat(minCost) : 0, lte: maxCost ? parseFloat(maxCost) : 99999 } } : {}),
      ...(maxDuration ? { durationHours: { lte: parseFloat(maxDuration) } } : {}),
    },
  });
  res.json(activities);
});

// POST /api/activities/stop/:stopId — add activity to a stop
router.post('/stop/:stopId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { activityId, scheduledTime, notes } = req.body;
  const stop = await prisma.stop.findUnique({ where: { id: String(req.params.stopId) }, include: { trip: true } });
  if (!stop || stop.trip.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }

  const existing = await prisma.stopActivity.findFirst({ where: { stopId: String(req.params.stopId), activityId } });
  if (existing) { res.status(409).json({ error: 'Activity already added to this stop' }); return; }

  const sa = await prisma.stopActivity.create({
    data: { stopId: String(req.params.stopId), activityId, scheduledTime, notes },
    include: { activity: true },
  });
  res.status(201).json(sa);
});

// DELETE /api/activities/stopActivity/:id
router.delete('/stopActivity/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const sa = await prisma.stopActivity.findUnique({ where: { id: String(req.params.id) }, include: { stop: { include: { trip: true } } } });
  if (!sa || sa.stop.trip.userId !== req.user!.id) { res.status(403).json({ error: 'Not authorized' }); return; }
  await prisma.stopActivity.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Activity removed' });
});

export default router;
