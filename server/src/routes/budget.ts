import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/budget/:tripId
router.get('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(404).json({ error: 'Trip not found' }); return; }

  let budget = await prisma.tripBudget.findUnique({ where: { tripId: String(req.params.tripId) } });
  if (!budget) {
    budget = await prisma.tripBudget.create({ data: { tripId: String(req.params.tripId) } });
  }
  res.json({ ...budget, budgetCap: trip.budgetCap });
});

// PUT /api/budget/:tripId
router.put('/:tripId', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const trip = await prisma.trip.findFirst({ where: { id: String(req.params.tripId), userId: req.user!.id } });
  if (!trip) { res.status(404).json({ error: 'Trip not found' }); return; }

  const { transportCost, stayCost, mealsCost, miscCost, budgetCap } = req.body;

  const budget = await prisma.tripBudget.upsert({
    where: { tripId: String(req.params.tripId) },
    update: {
      transportCost: transportCost !== undefined ? parseFloat(transportCost) : undefined,
      stayCost: stayCost !== undefined ? parseFloat(stayCost) : undefined,
      mealsCost: mealsCost !== undefined ? parseFloat(mealsCost) : undefined,
      miscCost: miscCost !== undefined ? parseFloat(miscCost) : undefined,
    },
    create: {
      tripId: String(req.params.tripId),
      transportCost: parseFloat(transportCost) || 0,
      stayCost: parseFloat(stayCost) || 0,
      mealsCost: parseFloat(mealsCost) || 0,
      miscCost: parseFloat(miscCost) || 0,
    },
  });

  if (budgetCap !== undefined) {
    await prisma.trip.update({ where: { id: String(req.params.tripId) }, data: { budgetCap: parseFloat(budgetCap) } });
  }

  res.json({ ...budget, budgetCap: budgetCap !== undefined ? parseFloat(budgetCap) : trip.budgetCap });
});

export default router;
