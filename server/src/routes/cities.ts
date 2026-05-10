import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/cities?search=&region=
router.get('/', async (req, res: Response) => {
  const { search, region } = req.query as { search?: string; region?: string };
  const cities = await prisma.city.findMany({
    where: {
      AND: [
        search ? { OR: [{ name: { contains: search } }, { country: { contains: search } }] } : {},
        region ? { region } : {},
      ],
    },
    orderBy: { popularity: 'desc' },
  });
  res.json(cities);
});

// GET /api/cities/popular
router.get('/popular', async (req, res: Response) => {
  try {
    const popularHubs = await prisma.city.findMany({
      include: {
        _count: {
          select: { stops: true }
        }
      },
      take: 5
    });

    // Sort by stop count manually since SQLite/Prisma might have limitations with deep ordering
    const sorted = popularHubs.sort((a, b) => b._count.stops - a._count.stops);
    
    res.json(sorted.map(c => ({
      ...c,
      tripCount: c._count.stops
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular hubs' });
  }
});

// GET /api/cities/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const city = await prisma.city.findUnique({ where: { id: String(req.params.id) }, include: { activities: true } });
  if (!city) { res.status(404).json({ error: 'City not found' }); return; }
  res.json(city);
});

export default router;
