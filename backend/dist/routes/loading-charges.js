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
// GET /api/loading-charges
router.get('/', auth_1.authenticate, async (_req, res) => {
    try {
        const charges = await prisma_1.default.loadingCharge.findMany({
            where: { isActive: true },
            include: { material: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ charges });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch loading charges.' });
    }
});
// POST /api/loading-charges
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { materialId, rate, unit, description } = req.body;
        if (!materialId || rate === undefined) {
            res.status(400).json({ error: 'Material and rate are required.' });
            return;
        }
        const charge = await prisma_1.default.loadingCharge.create({
            data: { materialId, rate, unit: unit || 'per_ton', description },
            include: { material: true },
        });
        res.status(201).json({ charge });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create loading charge.' });
    }
});
// PUT /api/loading-charges/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const charge = await prisma_1.default.loadingCharge.update({
            where: { id: req.params.id },
            data: req.body,
            include: { material: true },
        });
        res.json({ charge });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update loading charge.' });
    }
});
// DELETE /api/loading-charges/:id
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.default.loadingCharge.update({ where: { id: req.params.id }, data: { isActive: false } });
        res.json({ message: 'Deleted.' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete loading charge.' });
    }
});
exports.default = router;
//# sourceMappingURL=loading-charges.js.map