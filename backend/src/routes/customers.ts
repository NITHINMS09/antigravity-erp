import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/customers
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { business, search } = req.query;
    const where: Record<string, unknown> = { isActive: true };
    if (business) where.business = business;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        gstNumber: true,
        business: true,
        totalDue: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json({ customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            dueAmount: true,
            paymentStatus: true,
            invoiceDate: true,
            createdAt: true,
          },
        },
      },
    });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    res.json({ customer });
  } catch (error) {
    console.error('Fetch customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer.' });
  }
});

// POST /api/customers
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, gstNumber, business } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }

    const customer = await prisma.customer.create({
      data: { name, phone, email, address, gstNumber, business: business || 'POWER_BRICK' },
    });

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer.' });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, gstNumber, business } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: { name, phone, email, address, gstNumber, business },
    });
    res.json({ customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer.' });
  }
});

// GET /api/customers/:id/dues
router.get('/:id/dues', authenticate, async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { customerId: req.params.id as string, paymentStatus: { not: 'paid' } },
      orderBy: { invoiceDate: 'desc' },
    });
    const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
    res.json({ totalDue, invoices });
  } catch (error) {
    console.error('Fetch dues error:', error);
    res.status(500).json({ error: 'Failed to fetch dues.' });
  }
});

// DELETE /api/customers/:id
// Uses soft delete (isActive=false) when customer has invoices, hard delete when clean
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const invoicesCount = await prisma.invoice.count({ where: { customerId: id } });

    if (invoicesCount > 0) {
      // Soft delete: deactivate the customer instead of deleting
      await prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Customer deactivated (has linked invoices).' });
      return;
    }

    // No invoices — safe to hard delete
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});

export default router;
