const { google } = require('googleapis');

class GoogleSheetsService {
    constructor() {
        this.apiKey = process.env.GOOGLE_SHEETS_API_KEY;
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        this.sheets = google.sheets({ version: 'v4', auth: this.apiKey });
    }

    /**
     * Obtiene datos de una hoja específica
     */
    async getSheetData(range = 'A:Z', sheetName = 'Base') {
        try {
            const fullRange = sheetName === 'Base' ? range : `${sheetName}!${range}`;

            console.log(`📊 Obteniendo datos de: ${fullRange}`);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: fullRange,
            });

            const rows = response.data.values || [];
            console.log(`✅ ${rows.length} filas obtenidas de ${sheetName}`);

            return {
                success: true,
                data: rows,
                range: response.data.range,
                rowCount: rows.length
            };
        } catch (error) {
            console.error('❌ Error obteniendo datos de hoja:', error.message);
            throw new Error(`Error accessing sheet ${sheetName}: ${error.message}`);
        }
    }

    /**
     * Obtiene todas las pestañas disponibles del spreadsheet
     */
    async getAvailableSheets() {
        try {
            console.log('📋 Obteniendo pestañas disponibles...');

            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });

            const sheets = response.data.sheets.map(sheet => ({
                id: sheet.properties.sheetId,
                title: sheet.properties.title,
                index: sheet.properties.index,
                hidden: sheet.properties.hidden || false
            }));

            console.log(`✅ ${sheets.length} pestañas encontradas:`, sheets.map(s => s.title));

            return {
                success: true,
                sheets: sheets.filter(s => !s.hidden), // Solo pestañas visibles
                count: sheets.length
            };
        } catch (error) {
            console.error('❌ Error obteniendo pestañas:', error.message);
            throw new Error(`Error getting sheets: ${error.message}`);
        }
    }

    /**
     * Obtiene configuración financiera desde la pestaña ConfigFinanciera
     */
    async getFinancialConfig(scenario = 'Base') {
        try {
            console.log(`💰 Obteniendo configuración financiera para: ${scenario}`);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'ConfigFinanciera!A:D', // Escenario, Campo, Valor, Cantidad
            });

            const rows = response.data.values || [];
            if (rows.length === 0) {
                throw new Error('ConfigFinanciera sheet is empty');
            }

            // Procesar configuración
            const config = {};
            const headers = rows[0];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const rowScenario = row[0];
                const campo = row[1];
                const valor = parseFloat(row[2]) || 0;
                const cantidad = parseFloat(row[3]) || 0;

                if (rowScenario === scenario && campo) {
                    config[campo] = {
                        valor: valor,
                        cantidad: cantidad
                    };
                }
            }

            console.log(`✅ Configuración financiera cargada para ${scenario}:`, Object.keys(config));

            return {
                success: true,
                config: config,
                scenario: scenario
            };
        } catch (error) {
            console.log(`⚠️ ConfigFinanciera no disponible para ${scenario}:`, error.message);
            return {
                success: false,
                config: {},
                scenario: scenario,
                error: error.message
            };
        }
    }

    /**
     * Valida la conexión con Google Sheets
     */
    async validateConnection() {
        try {
            console.log('🔍 Validando conexión con Google Sheets...');

            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });

            const title = response.data.properties.title;
            const sheetCount = response.data.sheets.length;

            console.log(`✅ Conexión exitosa con: "${title}" (${sheetCount} pestañas)`);

            return {
                success: true,
                title: title,
                sheetCount: sheetCount,
                locale: response.data.properties.locale,
                timeZone: response.data.properties.timeZone
            };
        } catch (error) {
            console.error('❌ Error validando conexión:', error.message);
            throw new Error(`Connection validation failed: ${error.message}`);
        }
    }
}

module.exports = GoogleSheetsService;