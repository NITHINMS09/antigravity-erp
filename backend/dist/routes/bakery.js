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
router.get('/products', auth_1.authenticate, async (_req, res) => {
    try {
        const products = await prisma_1.default.bakeryProduct.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
        res.json({ products });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});
router.post('/products', auth_1.authenticate, async (req, res) => {
    try {
        const product = await prisma_1.default.bakeryProduct.create({ data: req.body });
        res.status(201).json({ product });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create product.' });
    }
});
router.put('/products/:id', auth_1.authenticate, async (req, res) => {
    try {
        const product = await prisma_1.default.bakeryProduct.update({ where: { id: req.params.id }, data: req.body });
        res.json({ product });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update product.' });
    }
});
// GET /api/bakery/sales — simple daily sales list
router.get('/sales', auth_1.authenticate, async (req, res) => {
    try {
        const sales = await prisma_1.default.bakerySale.findMany({
            orderBy: { saleDate: 'desc' },
            take: parseInt(req.query.limit || '60'),
        });
        res.json({ sales });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch sales.' });
    }
});
// POST /api/bakery/sales — simple daily total entry (no product dependency)
router.post('/sales', auth_1.authenticate, async (req, res) => {
    try {
        const { totalAmount, cashAmount, upiAmount, cardAmount, discountAmount, notes, saleDate } = req.body;
        if (!totalAmount && totalAmount !== 0) {
            res.status(400).json({ error: 'Total amount is required.' });
            return;
        }
        const sale = await prisma_1.default.bakerySale.create({
            data: {
                saleDate: saleDate ? new Date(saleDate) : new Date(),
                totalAmount: totalAmount || 0,
                cashAmount: cashAmount || 0,
                upiAmount: upiAmount || 0,
                cardAmount: cardAmount || 0,
                discountAmount: discountAmount || 0,
                notes,
            },
        });
        res.status(201).json({ sale });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create sale.' });
    }
});
// PUT /api/bakery/sales/:id — update a daily sale entry
router.put('/sales/:id', auth_1.authenticate, async (req, res) => {
    try {
        const sale = await prisma_1.default.bakerySale.update({ where: { id: req.params.id }, data: req.body });
        res.json({ sale });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update sale.' });
    }
});
// DELETE /api/bakery/sales/:id
router.delete('/sales/:id', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.default.bakerySale.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deleted.' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete sale.' });
    }
});
exports.default = router;
//# sourceMappingURL=bakery.js.map