const express = require('express');
const GoogleSheetsService = require('../services/googleSheets');

const router = express.Router();
const sheetsService = new GoogleSheetsService();

/**
 * GET /api/sheets/validate
 * Valida la conexión con Google Sheets
 */
router.get('/validate', async (req, res) => {
    try {
        const result = await sheetsService.validateConnection();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sheets/data
 * Obtiene datos de una hoja específica
 * Query params: range, sheet
 */
router.get('/data', async (req, res) => {
    try {
        const { range = 'A:Z', sheet = 'Base' } = req.query;

        const result = await sheetsService.getSheetData(range, sheet);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sheets/available
 * Obtiene todas las pestañas disponibles
 */
router.get('/available', async (req, res) => {
    try {
        const result = await sheetsService.getAvailableSheets();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sheets/financial-config
 * Obtiene configuración financiera
 * Query params: scenario
 */
router.get('/financial-config', async (req, res) => {
    try {
        const { scenario = 'Base' } = req.query;

        const result = await sheetsService.getFinancialConfig(scenario);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;