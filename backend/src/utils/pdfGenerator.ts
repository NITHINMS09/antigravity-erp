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
