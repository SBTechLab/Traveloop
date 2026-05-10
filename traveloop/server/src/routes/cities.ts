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

// GET /api/cities/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const city = await prisma.city.findUnique({ where: { id: String(req.params.id) }, include: { activities: true } });
  if (!city) { res.status(404).json({ error: 'City not found' }); return; }
  res.json(city);
});

export default router;
