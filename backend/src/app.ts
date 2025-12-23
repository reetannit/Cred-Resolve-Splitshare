import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware';
import {
    authRoutes,
    userRoutes,
    groupRoutes,
    expenseRoutes,
    settlementRoutes,
} from './routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in development
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Swagger API Documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Expense Sharing API',
            version: '1.0.0',
            description: 'A Splitwise-like expense sharing application API',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Expense Sharing API Docs',
}));

// Root route
app.get('/', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Hello from backend! 🚀',
        version: '1.0.0',
        docs: '/api-docs',
    });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Expense Sharing API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server only if not running on Vercel
const PORT = process.env.PORT || 5000;

// Only start the server if we're not in a serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`
🚀 Server is running!
📍 Local: http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/api-docs
🏥 Health: http://localhost:${PORT}/health
    `);
    });
}

// Export for Vercel serverless
export default app;
module.exports = app;
