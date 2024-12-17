import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import contactRoutes from './routes/contactRoutes';
import configRoutes from './routes/configRoutes';
import { errorHandler } from './middleware/errorHandler';
import { securityMiddleware } from './middleware/security';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);

// Routes
app.use('/api', contactRoutes);
app.use('/api', configRoutes);

// Error handling
app.use(errorHandler);

export default app;
