"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const materials_1 = __importDefault(require("./routes/materials"));
const stock_1 = __importDefault(require("./routes/stock"));
const customers_1 = __importDefault(require("./routes/customers"));
const billing_1 = __importDefault(require("./routes/billing"));
const purchases_1 = __importDefault(require("./routes/purchases"));
const workers_1 = __importDefault(require("./routes/workers"));
const transport_1 = __importDefault(require("./routes/transport"));
const bakery_1 = __importDefault(require("./routes/bakery"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const config_1 = __importDefault(require("./routes/config"));
const ai_1 = __importDefault(require("./routes/ai"));
const loading_charges_1 = __importDefault(require("./routes/loading-charges"));
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/materials', materials_1.default);
app.use('/api/stock', stock_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/billing', billing_1.default);
app.use('/api/purchases', purchases_1.default);
app.use('/api/workers', workers_1.default);
app.use('/api/transport', transport_1.default);
app.use('/api/bakery', bakery_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/config', config_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/loading-charges', loading_charges_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Antigravity ERP Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map