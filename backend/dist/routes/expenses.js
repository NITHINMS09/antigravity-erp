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
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { category, business, month } = req.query;
        const where = {};
        if (category)
            where.category = category;
        if (business)
            where.business = business;
        if (month)
            where.month = month;
        const expenses = await prisma_1.default.expense.findMany({ where, orderBy: { createdAt: 'desc' } });
        res.json({ expenses });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const expense = await prisma_1.default.expense.create({ data: req.body });
        res.status(201).json({ expense });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create expense.' });
    }
});
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const expense = await prisma_1.default.expense.update({ where: { id: req.params.id }, data: req.body });
        res.json({ expense });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update expense.' });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.default.expense.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deleted.' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete expense.' });
    }
});
router.get('/summary', auth_1.authenticate, async (_req, res) => {
    try {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const byCategory = await prisma_1.default.expense.groupBy({
            by: ['category'], where: { createdAt: { gte: monthAgo } },
            _sum: { amount: true }, _count: true,
        });
        res.json({ summary: byCategory });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch summary.' });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map