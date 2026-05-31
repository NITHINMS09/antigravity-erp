import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const router = Router();

// Create a booking
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { customerName, phone, tourName, travelDate, seats, amountPaid, paymentStatus } = req.body;
    
    const bookingId = `BKG-${Date.now().toString().slice(-6)}`;
    
    const booking = await prisma.booking.create({
      data: {
        bookingId,
        customerName,
        phone,
        tourName,
        travelDate: new Date(travelDate),
        seats: parseInt(seats),
        amountPaid: parseFloat(amountPaid),
        paymentStatus: paymentStatus || 'completed',
        userId: req.user?.userId
      }
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get all bookings
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        receipt: true
      },
      orderBy: { bookingDate: 'desc' }
    });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { receipt: true }
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Generate receipt
router.post('/:id/receipt', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { receipt: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    let pdfUrl = (booking as any).receipt?.pdfUrl;
    
    // Generate new PDF if not exists
    if (!pdfUrl) {
      pdfUrl = await generateReceiptPDF(booking);
      
      if ((booking as any).receipt) {
        await prisma.receipt.update({
          where: { id: (booking as any).receipt.id },
          data: { pdfUrl }
        });
      } else {
        await prisma.receipt.create({
          data: {
            bookingId: booking.id,
            pdfUrl
          }
        });
      }
    }

    // Generate WhatsApp link and message
    const receiptLink = `${req.protocol}://${req.get('host') as string}${pdfUrl}`;
    
    const message = `🚌 Mysuru Travel Club\n\nBooking Confirmed ✅\n\nBooking ID: ${booking.bookingId}\nName: ${booking.customerName}\nTour: ${booking.tourName}\nTravel Date: ${booking.travelDate.toLocaleDateString()}\nSeats: ${booking.seats}\nAmount Paid: ₹${booking.amountPaid}\n\nYour booking has been successfully confirmed.\n\nReceipt:\n${receiptLink}\n\nThank you for choosing Mysuru Travel Club ❤️`;
    
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    res.json({
      success: true,
      pdfUrl,
      whatsappLink: waLink
    });

  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Update WhatsApp delivery status
router.post('/:id/whatsapp-status', authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // 'sent', 'failed'
    
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { receipt: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if ((booking as any).receipt) {
      await prisma.receipt.update({
        where: { id: (booking as any).receipt.id },
        data: {
          whatsappSent: status === 'sent',
          deliveryStatus: status,
          sentAt: status === 'sent' ? new Date() : null
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update WhatsApp status' });
  }
});

export default router;
