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
// GET /api/customers
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { business, search } = req.query;
        const where = { isActive: true };
        if (business)
            where.business = business;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        const customers = await prisma_1.default.customer.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        res.json({ customers });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers.' });
    }
});
// GET /api/customers/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const customer = await prisma_1.default.customer.findUnique({
            where: { id: req.params.id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found.' });
            return;
        }
        res.json({ customer });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer.' });
    }
});
// POST /api/customers
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, phone, email, address, gstNumber, business } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required.' });
            return;
        }
        const customer = await prisma_1.default.customer.create({
            data: { name, phone, email, address, gstNumber, business: business || 'POWER_BRICK' },
        });
        res.status(201).json({ customer });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create customer.' });
    }
});
// PUT /api/customers/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const customer = await prisma_1.default.customer.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ customer });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update customer.' });
    }
});
// GET /api/customers/:id/dues
router.get('/:id/dues', auth_1.authenticate, async (req, res) => {
    try {
        const invoices = await prisma_1.default.invoice.findMany({
            where: { customerId: req.params.id, paymentStatus: { not: 'paid' } },
            orderBy: { invoiceDate: 'desc' },
        });
        const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
        res.json({ totalDue, invoices });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dues.' });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map