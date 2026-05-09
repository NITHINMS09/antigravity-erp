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
// GET /api/purchases
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { limit = '50' } = req.query;
        const purchases = await prisma_1.default.purchase.findMany({
            include: { supplier: true, items: { include: { material: true } } },
            orderBy: { purchaseDate: 'desc' },
            take: parseInt(limit),
        });
        res.json({ purchases });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch purchases.' });
    }
});
// GET /api/purchases/suppliers
router.get('/suppliers', auth_1.authenticate, async (_req, res) => {
    try {
        const suppliers = await prisma_1.default.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
        res.json({ suppliers });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers.' });
    }
});
// POST /api/purchases/suppliers
router.post('/suppliers', auth_1.authenticate, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required.' });
            return;
        }
        const supplier = await prisma_1.default.supplier.create({ data: { name, phone, address } });
        res.status(201).json({ supplier });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create supplier.' });
    }
});
// POST /api/purchases
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { supplierId, supplierName, supplierPhone, items, transportCost, loadingCost, otherCharges, paidAmount, paymentMethod, notes, purchaseDate } = req.body;
        // Create supplier inline if needed
        let finalSupplierId = supplierId;
        if (!finalSupplierId && supplierName) {
            const supplier = await prisma_1.default.supplier.create({ data: { name: supplierName, phone: supplierPhone || null } });
            finalSupplierId = supplier.id;
        }
        if (!finalSupplierId) {
            res.status(400).json({ error: 'Supplier is required.' });
            return;
        }
        if (!items || items.length === 0) {
            res.status(400).json({ error: 'At least one item is required.' });
            return;
        }
        const count = await prisma_1.default.purchase.count();
        const purchaseNumber = `PUR-${String(count + 1).padStart(5, '0')}`;
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
        const grandTotal = totalAmount + (transportCost || 0) + (loadingCost || 0) + (otherCharges || 0);
        const paid = paidAmount || 0;
        const due = grandTotal - paid;
        const purchase = await prisma_1.default.purchase.create({
            data: {
                purchaseNumber,
                supplierId: finalSupplierId,
                totalAmount,
                transportCost: transportCost || 0,
                loadingCost: loadingCost || 0,
                otherCharges: otherCharges || 0,
                grandTotal,
                paidAmount: paid,
                dueAmount: due,
                paymentStatus: paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending',
                paymentMethod,
                notes,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
                items: {
                    create: items.map((item) => ({
                        materialId: item.materialId,
                        quantity: item.quantity,
                        rate: item.rate,
                        amount: item.quantity * item.rate,
                    })),
                },
            },
            include: { supplier: true, items: { include: { material: true } } },
        });
        // Increase stock for each item
        for (const item of items) {
            const stock = await prisma_1.default.stock.findUnique({ where: { materialId: item.materialId } });
            if (stock) {
                await prisma_1.default.stock.update({
                    where: { materialId: item.materialId },
                    data: { quantity: { increment: item.quantity }, lastUpdated: new Date() },
                });
            }
            await prisma_1.default.stockMovement.create({
                data: {
                    materialId: item.materialId, type: 'IN', quantity: item.quantity,
                    reference: purchase.id, referenceType: 'PURCHASE', notes: `Purchase ${purchaseNumber}`,
                },
            });
        }
        if (due > 0) {
            await prisma_1.default.supplier.update({ where: { id: finalSupplierId }, data: { totalDue: { increment: due } } });
        }
        res.status(201).json({ purchase });
    }
    catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Failed to create purchase.' });
    }
});
exports.default = router;
//# sourceMappingURL=purchases.js.map