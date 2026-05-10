import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import stopRoutes from './routes/stops';
import cityRoutes from './routes/cities';
import activityRoutes from './routes/activities';
import budgetRoutes from './routes/budget';
import packingRoutes from './routes/packing';
import noteRoutes from './routes/notes';
import profileRoutes from './routes/profile';
import adminRoutes from './routes/admin';
import shareRoutes from './routes/share';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/share', shareRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.listen(PORT, () => console.log(`🚀 Traveloop server running on http://localhost:${PORT}`));

export default app;
