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
// GET /api/materials
router.get('/', auth_1.authenticate, async (_req, res) => {
    try {
        const materials = await prisma_1.default.material.findMany({
            include: { stock: true, loadingCharges: true },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ materials });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials.' });
    }
});
// POST /api/materials
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, code, unit, category, defaultRate, gstRate, hsnCode, sortOrder } = req.body;
        if (!name || !code || !unit) {
            res.status(400).json({ error: 'Name, code, and unit are required.' });
            return;
        }
        const material = await prisma_1.default.material.create({
            data: { name, code, unit, category, defaultRate: defaultRate || 0, gstRate: gstRate || 0, hsnCode, sortOrder: sortOrder || 0 },
        });
        // Create stock record
        await prisma_1.default.stock.create({
            data: { materialId: material.id, quantity: 0, minLevel: 0 },
        });
        await prisma_1.default.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'CREATE',
                entity: 'Material',
                entityId: material.id,
                details: `Created material: ${name}`,
            },
        });
        res.status(201).json({ material });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Material code already exists.' });
            return;
        }
        res.status(500).json({ error: 'Failed to create material.' });
    }
});
// PUT /api/materials/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder } = req.body;
        const material = await prisma_1.default.material.update({
            where: { id },
            data: { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder },
        });
        res.json({ material });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update material.' });
    }
});
// DELETE /api/materials/:id
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma_1.default.material.update({
            where: { id },
            data: { isActive: false },
        });
        res.json({ message: 'Material deactivated.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete material.' });
    }
});
exports.default = router;
//# sourceMappingURL=materials.js.map