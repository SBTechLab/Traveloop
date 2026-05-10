import { randomUUID } from 'crypto';
import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';

import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/share/:slug — public, no auth required
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({
    where: { shareSlug: String(req.params.slug), isPublic: true },
    include: {
      user: { select: { name: true } },
      stops: {
        include: { city: true, stopActivities: { include: { activity: true } } },
        orderBy: { order: 'asc' },
      },
      budget: true,
    },
  });
  if (!trip) { res.status(404).json({ error: 'Shared trip not found' }); return; }
  res.json(trip);
});

// POST /api/share/:slug/copy — auth required, clones trip for logged-in user
router.post('/:slug/copy', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const original = await prisma.trip.findFirst({
    where: { shareSlug: String(req.params.slug), isPublic: true },
    include: {
      stops: { include: { stopActivities: true }, orderBy: { order: 'asc' } },
      budget: true,
      packingItems: true,
    },
  });
  if (!original) { res.status(404).json({ error: 'Shared trip not found' }); return; }

  const newTrip = await prisma.trip.create({
    data: {
      userId: req.user!.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      coverPhoto: original.coverPhoto,
      isPublic: false,
      shareSlug: randomUUID(),
    },
  });

  // Copy stops and activities
  for (const stop of original.stops) {
    const newStop = await prisma.stop.create({
      data: { tripId: newTrip.id, cityId: stop.cityId, arrivalDate: stop.arrivalDate, departureDate: stop.departureDate, order: stop.order },
    });
    for (const sa of stop.stopActivities) {
      await prisma.stopActivity.create({ data: { stopId: newStop.id, activityId: sa.activityId, scheduledTime: sa.scheduledTime, notes: sa.notes } });
    }
  }

  // Copy budget
  if (original.budget) {
    await prisma.tripBudget.create({
      data: { tripId: newTrip.id, transportCost: original.budget.transportCost, stayCost: original.budget.stayCost, mealsCost: original.budget.mealsCost, miscCost: original.budget.miscCost },
    });
  }

  res.status(201).json({ message: 'Trip copied', tripId: newTrip.id });
});

export default router;
