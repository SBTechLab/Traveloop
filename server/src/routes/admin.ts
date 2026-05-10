import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalTrips, topCities, recentTrips] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.stop.groupBy({
      by: ['cityId'],
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 5,
    }),
    prisma.trip.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  const cityIds = topCities.map(c => c.cityId);
  const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });
  const topCitiesData = topCities.map(tc => ({
    count: tc._count.cityId,
    city: cities.find(c => c.id === tc.cityId),
  }));

  // Group trips by day for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const tripsByDay: Record<string, number> = {};
  recentTrips
    .filter(t => t.createdAt >= thirtyDaysAgo)
    .forEach(t => {
      const day = t.createdAt.toISOString().split('T')[0];
      tripsByDay[day] = (tripsByDay[day] || 0) + 1;
    });

  res.json({ totalUsers, totalTrips, topCities: topCitiesData, tripsByDay });
});

// GET /api/admin/users
router.get('/users', verifyToken, isAdmin, async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, isActive: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// PATCH /api/admin/users/:id/toggle
router.patch('/users/:id/toggle', verifyToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const updated = await prisma.user.update({ where: { id: String(req.params.id) }, data: { isActive: !user.isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
});

export default router;
