const NodeCache = require('node-cache');

// Cache con TTL de 5 minutos por defecto
const cache = new NodeCache({
    stdTTL: process.env.CACHE_TTL || 300,
    checkperiod: 60
});

/**
 * Middleware de cache para endpoints
 */
const cacheMiddleware = (duration = null) => {
    return (req, res, next) => {
        // Crear key única basada en URL y query params
        const key = req.originalUrl || req.url;

        // Intentar obtener del cache
        const cachedData = cache.get(key);

        if (cachedData) {
            console.log(`🚀 Cache HIT para: ${key}`);
            return res.json({
                ...cachedData,
                cached: true,
                cacheTime: new Date().toISOString()
            });
        }

        // Si no está en cache, continuar con el request
        console.log(`💾 Cache MISS para: ${key}`);

        // Interceptar res.json para guardar en cache
        const originalJson = res.json;
        res.json = function(data) {
            // Solo cachear respuestas exitosas
            if (data.success) {
                const ttl = duration || (process.env.CACHE_TTL || 300);
                cache.set(key, data, ttl);
                console.log(`✅ Guardado en cache: ${key} (TTL: ${ttl}s)`);
            }

            // Llamar al método original
            originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Función para limpiar cache manualmente
 */
const clearCache = (pattern = null) => {
    if (pattern) {
        const keys = cache.keys();
        const matchingKeys = keys.filter(key => key.includes(pattern));
        cache.del(matchingKeys);
        console.log(`🧹 Cache limpiado para patrón: ${pattern} (${matchingKeys.length} entradas)`);
        return matchingKeys.length;
    } else {
        cache.flushAll();
        console.log('🧹 Todo el cache limpiado');
        return 'all';
    }
};

/**
 * Estadísticas del cache
 */
const getCacheStats = () => {
    return {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        memory: process.memoryUsage()
    };
};

module.exports = {
    cache,
    cacheMiddleware,
    clearCache,
    getCacheStats
};