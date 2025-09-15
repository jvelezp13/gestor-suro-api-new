require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const sheetsRoutes = require('./routes/sheets');
const { clearCache, getCacheStats } = require('./middleware/cache');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));

// Compression
app.use(compression());

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://gestor-suro-dashboard.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Gestor Suro API v1.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/sheets', sheetsRoutes);

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
    res.json({
        success: true,
        stats: getCacheStats()
    });
});

app.post('/api/cache/clear', (req, res) => {
    const { pattern } = req.body;
    const cleared = clearCache(pattern);

    res.json({
        success: true,
        message: `Cache cleared${pattern ? ` for pattern: ${pattern}` : ' completely'}`,
        cleared: cleared
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);

    // Don't leak error details in production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(500).json({
        success: false,
        error: 'Internal server error',
        ...(isDev && { details: error.message, stack: error.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Gestor Suro API iniciado en puerto ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS habilitado para: ${corsOptions.origin.join(', ')}`);
    console.log(`📈 Health check: http://localhost:${PORT}/`);
});

module.exports = app;