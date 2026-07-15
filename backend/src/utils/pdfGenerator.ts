import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReceiptPDF = async (booking: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      const fileName = `receipt-${booking.bookingId}.pdf`;
      const receiptsDir = path.join(__dirname, '../../public/receipts');
      
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filePath = path.join(receiptsDir, fileName);
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Mysuru Travel Club', { align: 'center' })
        .moveDown();
        
      doc
        .fontSize(16)
        .text('Booking Receipt', { align: 'center' })
        .moveDown();
        
      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();
        
      // Booking Details
      doc.fontSize(12).font('Helvetica');
      
      const addRow = (label: string, value: string) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
        doc.moveDown(0.5);
      };
      
      addRow('Booking ID', booking.bookingId);
      addRow('Customer Name', booking.customerName);
      addRow('Phone Number', booking.phone);
      addRow('Tour Name', booking.tourName);
      addRow('Travel Date', new Date(booking.travelDate).toLocaleDateString());
      addRow('Number of Seats', booking.seats.toString());
      addRow('Amount Paid', `Rs. ${booking.amountPaid}`);
      addRow('Payment Status', booking.paymentStatus);
      addRow('Booking Date', new Date(booking.bookingDate).toLocaleString());
      
      doc.moveDown();
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();
        
      // Footer
      doc
        .fontSize(10)
        .text('Thank you for choosing Mysuru Travel Club!', { align: 'center', continued: true })
        .text(' Have a great trip!', { align: 'center' });
        
      doc.end();
      
      stream.on('finish', () => {
        // Return the public URL path
        resolve(`/receipts/${fileName}`);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

export const generateInvoicePDF = async (invoice: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const receiptsDir = path.join(__dirname, '../../public/receipts');

      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filePath = path.join(receiptsDir, fileName);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Business Header
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('SK GROUPS', { align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text('Industrial Area, Mysuru, Karnataka', { align: 'center' })
        .text(`Business: ${invoice.business === 'POWER_BRICK' ? 'POWER BRICK' : 'BAKE LAND'}`, { align: 'center' })
        .moveDown();

      // Invoice info & client info side by side
      const startY = doc.y;
      doc.fontSize(11).font('Helvetica-Bold').text('INVOICE TO:', 50, startY);
      doc.font('Helvetica')
        .text(`Name: ${invoice.customer?.name || 'N/A'}`)
        .text(`Phone: ${invoice.customer?.phone || 'N/A'}`);
      if (invoice.customer?.gstNumber) {
        doc.text(`GST: ${invoice.customer.gstNumber}`);
      }

      // Invoice metadata on the right
      doc.font('Helvetica-Bold').text('INVOICE DETAILS:', 350, startY);
      doc.font('Helvetica')
        .text(`Invoice No: #${invoice.invoiceNumber}`, 350)
        .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350)
        .text(`Payment: ${invoice.paymentStatus.toUpperCase()}`, 350);

      doc.moveDown(2);

      // Draw table header
      let tableY = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Item Description', 50, tableY);
      doc.text('Qty', 250, tableY, { width: 50, align: 'right' });
      doc.text('Rate', 310, tableY, { width: 60, align: 'right' });
      if (invoice.isGst) {
        doc.text('GST%', 380, tableY, { width: 50, align: 'right' });
      }
      doc.text('Amount', 450, tableY, { width: 100, align: 'right' });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

      // Draw items
      doc.font('Helvetica').fontSize(10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoice.items?.forEach((item: any) => {
        const itemY = doc.y;
        const name = item.material?.name || item.bakeryProduct?.name || 'Material Item';
        doc.text(name, 50, itemY);
        doc.text(item.quantity.toString(), 250, itemY, { width: 50, align: 'right' });
        doc.text(`Rs.${item.rate}`, 310, itemY, { width: 60, align: 'right' });
        if (invoice.isGst) {
          doc.text(`${item.gstRate}%`, 380, itemY, { width: 50, align: 'right' });
        }
        doc.text(`Rs.${(item.quantity * item.rate).toFixed(2)}`, 450, itemY, { width: 100, align: 'right' });
        doc.moveDown(0.8);
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

      // Financial breakdown
      const summaryY = doc.y;
      doc.font('Helvetica').fontSize(10);
      doc.text('Subtotal:', 320, summaryY);
      doc.text(`Rs.${invoice.subtotal.toFixed(2)}`, 450, summaryY, { width: 100, align: 'right' });

      let nextY = summaryY + 15;
      if (invoice.gstAmount > 0) {
        doc.text('GST Tax:', 320, nextY);
        doc.text(`Rs.${invoice.gstAmount.toFixed(2)}`, 450, nextY, { width: 100, align: 'right' });
        nextY += 15;
      }

      if (invoice.discountAmount > 0) {
        doc.text('Discount:', 320, nextY);
        doc.text(`-Rs.${invoice.discountAmount.toFixed(2)}`, 450, nextY, { width: 100, align: 'right' });
        nextY += 15;
      }

      const otherCharges = (invoice.loadingCharge || 0) + (invoice.transportCharge || 0) + (invoice.tractorCharge || 0) + (invoice.labourCharge || 0);
      if (otherCharges > 0) {
        doc.text('Service Charges:', 320, nextY);
        doc.text(`Rs.${otherCharges.toFixed(2)}`, 450, nextY, { width: 100, align: 'right' });
        nextY += 15;
      }

      doc.font('Helvetica-Bold');
      doc.text('Grand Total:', 320, nextY);
      doc.text(`Rs.${invoice.grandTotal.toFixed(2)}`, 450, nextY, { width: 100, align: 'right' });

      doc.font('Helvetica').fontSize(9);
      doc.text(`Paid: Rs.${invoice.paidAmount.toFixed(2)}`, 320, nextY + 15);
      doc.text(`Due: Rs.${invoice.dueAmount.toFixed(2)}`, 320, nextY + 30);

      doc.moveDown(4);

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Thank you for your business!', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/receipts/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

