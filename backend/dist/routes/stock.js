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
// GET /api/stock
router.get('/', auth_1.authenticate, async (_req, res) => {
    try {
        const stock = await prisma_1.default.stock.findMany({
            include: { material: true },
            orderBy: { material: { sortOrder: 'asc' } },
        });
        res.json({ stock });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock.' });
    }
});
// GET /api/stock/movements
router.get('/movements', auth_1.authenticate, async (req, res) => {
    try {
        const { materialId, type, limit = '50' } = req.query;
        const where = {};
        if (materialId)
            where.materialId = materialId;
        if (type)
            where.type = type;
        const movements = await prisma_1.default.stockMovement.findMany({
            where,
            include: { material: true },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });
        res.json({ movements });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock movements.' });
    }
});
// POST /api/stock/adjust
router.post('/adjust', auth_1.authenticate, async (req, res) => {
    try {
        const { materialId, quantity, type, notes } = req.body;
        if (!materialId || quantity === undefined || !type) {
            res.status(400).json({ error: 'materialId, quantity, and type are required.' });
            return;
        }
        const stock = await prisma_1.default.stock.findUnique({ where: { materialId } });
        if (!stock) {
            res.status(404).json({ error: 'Stock record not found.' });
            return;
        }
        let newQuantity = stock.quantity;
        if (type === 'IN')
            newQuantity += quantity;
        else if (type === 'OUT')
            newQuantity -= quantity;
        else if (type === 'ADJUSTMENT')
            newQuantity = quantity;
        else if (type === 'WASTAGE')
            newQuantity -= quantity;
        await prisma_1.default.stock.update({
            where: { materialId },
            data: { quantity: newQuantity, lastUpdated: new Date() },
        });
        await prisma_1.default.stockMovement.create({
            data: {
                materialId,
                type,
                quantity,
                referenceType: 'ADJUSTMENT',
                notes,
            },
        });
        res.json({ message: 'Stock updated.', newQuantity });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to adjust stock.' });
    }
});
// PUT /api/stock/:materialId/levels
router.put('/:materialId/levels', auth_1.authenticate, async (req, res) => {
    try {
        const { materialId } = req.params;
        const { minLevel, maxLevel } = req.body;
        const stock = await prisma_1.default.stock.update({
            where: { materialId },
            data: { minLevel, maxLevel },
        });
        res.json({ stock });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update stock levels.' });
    }
});
exports.default = router;
//# sourceMappingURL=stock.js.map