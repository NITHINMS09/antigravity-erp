import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const router = Router();
const adminRoles = new Set(['super_admin', 'manager']);

const createBookingSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name is required.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits long.')
    .max(20, 'Phone number is too long.'),
  tourName: z.string().trim().min(2, 'Tour name is required.'),
  travelDate: z.coerce.date(),
  seats: z.coerce.number().int().positive('Seats must be greater than 0.'),
  amountPaid: z.coerce.number().nonnegative('Amount paid cannot be negative.'),
  paymentStatus: z.enum(['pending', 'completed', 'failed']).optional(),
});

function canManageAllBookings(role?: string): boolean {
  return role ? adminRoles.has(role) : false;
}

function bookingAccessWhere(req: Request, bookingId?: string) {
  if (canManageAllBookings(req.user?.role)) {
    return bookingId ? { id: bookingId } : {};
  }

  return bookingId
    ? { id: bookingId, userId: req.user?.userId }
    : { userId: req.user?.userId };
}

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const payload = createBookingSchema.parse(req.body);
    const bookingId = `BKG-${Date.now().toString().slice(-6)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        customerName: payload.customerName,
        phone: payload.phone,
        tourName: payload.tourName,
        travelDate: payload.travelDate,
        seats: payload.seats,
        amountPaid: payload.amountPaid,
        paymentStatus: payload.paymentStatus ?? 'completed',
        userId: req.user?.userId,
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid booking data.' });
      return;
    }

    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: bookingAccessWhere(req),
      include: {
        receipt: true,
      },
      orderBy: { bookingDate: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: bookingAccessWhere(req, req.params.id as string),
      include: { receipt: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.post('/:id/receipt', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: bookingAccessWhere(req, req.params.id as string),
      include: { receipt: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    let pdfUrl = booking.receipt?.pdfUrl;
    if (!pdfUrl) {
      pdfUrl = await generateReceiptPDF(booking);

      if (booking.receipt) {
        await prisma.receipt.update({
          where: { id: booking.receipt.id },
          data: { pdfUrl },
        });
      } else {
        await prisma.receipt.create({
          data: {
            bookingId: booking.id,
            pdfUrl,
          },
        });
      }
    }

    const receiptLink = `${req.protocol}://${req.get('host') as string}${pdfUrl}`;
    const message = [
      'Mysuru Travel Club',
      '',
      'Booking Confirmed',
      '',
      `Booking ID: ${booking.bookingId}`,
      `Name: ${booking.customerName}`,
      `Tour: ${booking.tourName}`,
      `Travel Date: ${booking.travelDate.toLocaleDateString()}`,
      `Seats: ${booking.seats}`,
      `Amount Paid: Rs ${booking.amountPaid}`,
      '',
      'Your booking has been successfully confirmed.',
      '',
      'Receipt:',
      receiptLink,
      '',
      'Thank you for choosing Mysuru Travel Club.',
    ].join('\n');

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    res.json({
      success: true,
      pdfUrl,
      whatsappLink,
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

router.post('/:id/whatsapp-status', authenticate, async (req: Request, res: Response) => {
  try {
    const status = req.body?.status as string | undefined;
    if (status !== 'sent' && status !== 'failed' && status !== 'pending') {
      res.status(400).json({ error: 'Invalid WhatsApp status.' });
      return;
    }

    const booking = await prisma.booking.findFirst({
      where: bookingAccessWhere(req, req.params.id as string),
      include: { receipt: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.receipt) {
      await prisma.receipt.update({
        where: { id: booking.receipt.id },
        data: {
          whatsappSent: status === 'sent',
          deliveryStatus: status,
          sentAt: status === 'sent' ? new Date() : null,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update WhatsApp status' });
  }
});

export default router;
