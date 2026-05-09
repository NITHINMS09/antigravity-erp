"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/transport
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { limit = '50' } = req.query;
        const transports = await prisma_1.default.transport.findMany({
            orderBy: { tripDate: 'desc' },
            take: parseInt(limit),
        });
        res.json({ transports });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transport records.' });
    }
});
// POST /api/transport
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const data = req.body;
        data.totalCost = (data.charge || 0) + (data.dieselCost || 0) + (data.otherExpenses || 0);
        const transport = await prisma_1.default.transport.create({ data });
        res.status(201).json({ transport });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create transport record.' });
    }
});
// PUT /api/transport/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const data = req.body;
        if (data.charge !== undefined || data.dieselCost !== undefined || data.otherExpenses !== undefined) {
            const existing = await prisma_1.default.transport.findUnique({ where: { id: req.params.id } });
            if (existing) {
                data.totalCost = (data.charge ?? existing.charge) + (data.dieselCost ?? existing.dieselCost) + (data.otherExpenses ?? existing.otherExpenses);
            }
        }
        const transport = await prisma_1.default.transport.update({ where: { id: req.params.id }, data });
        res.json({ transport });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update transport record.' });
    }
});
// GET /api/transport/summary
router.get('/summary', auth_1.authenticate, async (_req, res) => {
    try {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const summary = await prisma_1.default.transport.aggregate({
            where: { tripDate: { gte: monthAgo } },
            _sum: { charge: true, dieselCost: true, otherExpenses: true, totalCost: true },
            _count: true,
        });
        res.json({ summary });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transport summary.' });
    }
});
exports.default = router;
//# sourceMappingURL=transport.js.map