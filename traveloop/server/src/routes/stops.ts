import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/stops (for a trip)
router.post('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { tripId, cityId, arrivalDate, departureDate } = req.body;
  if (!tripId || !cityId || !arrivalDate || !departureDate) {
    res.status(400).json({ error: 'tripId, cityId, arrivalDate, departureDate required' }); return;
  }
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not your trip' }); return; }

  const count = await prisma.stop.count({ where: { tripId } });
  const stop = await prisma.stop.create({
    data: { tripId, cityId, arrivalDate: new Date(arrivalDate), departureDate: new Date(departureDate), order: count },
    include: { city: true, stopActivities: { include: { activity: true } } },
  });
  res.status(201).json(stop);
});

// PUT /api/stops/:id
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { arrivalDate, departureDate, cityId } = req.body;
  const stop = await prisma.stop.findUnique({ where: { id: String(req.params.id) }, include: { trip: true } });
  if (!stop || stop.trip.userId !== req.user!.id) { res.status(404).json({ error: 'Stop not found' }); return; }

  const updated = await prisma.stop.update({
    where: { id: String(req.params.id) },
    data: {
      arrivalDate: arrivalDate ? new Date(arrivalDate) : stop.arrivalDate,
      departureDate: departureDate ? new Date(departureDate) : stop.departureDate,
      cityId: cityId || stop.cityId,
    },
    include: { city: true, stopActivities: { include: { activity: true } } },
  });
  res.json(updated);
});

// DELETE /api/stops/:id
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const stop = await prisma.stop.findUnique({ where: { id: String(req.params.id) }, include: { trip: true } });
  if (!stop || stop.trip.userId !== req.user!.id) { res.status(404).json({ error: 'Stop not found' }); return; }
  await prisma.stop.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Stop deleted' });
});

// PATCH /api/stops/reorder
router.patch('/reorder', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { tripId, orderedIds } = req.body as { tripId: string; orderedIds: string[] };
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.user!.id } });
  if (!trip) { res.status(403).json({ error: 'Not your trip' }); return; }

  await Promise.all(orderedIds.map((id, index) =>
    prisma.stop.update({ where: { id }, data: { order: index } })
  ));
  res.json({ message: 'Stops reordered' });
});

export default router;
