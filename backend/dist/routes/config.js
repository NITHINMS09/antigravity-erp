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
router.get('/:businessCode', auth_1.authenticate, async (req, res) => {
    try {
        const config = await prisma_1.default.businessConfig.findUnique({ where: { businessCode: req.params.businessCode } });
        if (!config) {
            res.status(404).json({ error: 'Config not found.' });
            return;
        }
        res.json({ config });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch config.' });
    }
});
router.put('/:businessCode', auth_1.authenticate, async (req, res) => {
    try {
        const config = await prisma_1.default.businessConfig.upsert({
            where: { businessCode: req.params.businessCode },
            update: req.body,
            create: { ...req.body, businessCode: req.params.businessCode, businessName: req.body.businessName || req.params.businessCode },
        });
        res.json({ config });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update config.' });
    }
});
router.get('/', auth_1.authenticate, async (_req, res) => {
    try {
        const configs = await prisma_1.default.businessConfig.findMany();
        res.json({ configs });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch configs.' });
    }
});
exports.default = router;
//# sourceMappingURL=config.js.map