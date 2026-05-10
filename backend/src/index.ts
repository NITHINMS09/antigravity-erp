import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

// Middleware - Allow all origins for free-tier compatibility
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import materialRoutes from './routes/materials';
import stockRoutes from './routes/stock';
import customerRoutes from './routes/customers';
import billingRoutes from './routes/billing';
import purchaseRoutes from './routes/purchases';
import workerRoutes from './routes/workers';
import transportRoutes from './routes/transport';
import bakeryRoutes from './routes/bakery';
import expenseRoutes from './routes/expenses';
import configRoutes from './routes/config';
import aiRoutes from './routes/ai';
import loadingChargeRoutes from './routes/loading-charges';

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/bakery', bakeryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/loading-charges', loadingChargeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Antigravity ERP Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Auto-sync database tables
  try {
    const { execSync } = require('child_process');
    console.log('🔄 Syncing database tables...');
    execSync('node ./node_modules/prisma/build/index.js db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database synced successfully!');
  } catch (error: any) {
    console.error('❌ Database sync failed:', error.message);
  }
});

export default app;
