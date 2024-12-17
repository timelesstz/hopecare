import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { DonationReceiptData } from './email';

export const generateDonationReceipt = (data: DonationReceiptData): Buffer => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => Buffer.concat(chunks));

  // Add logo
  doc.image('public/images/logo.png', 50, 50, { width: 150 });

  // Add receipt header
  doc.moveDown(2);
  doc.fontSize(24).text('Donation Receipt', { align: 'center' });
  doc.moveDown();

  // Add receipt details
  doc.fontSize(12);

  // Organization details
  doc.font('Helvetica-Bold').text('From:');
  doc.font('Helvetica').text('HopeCare Foundation');
  doc.text('123 Hope Street');
  doc.text('Charity City, CH 12345');
  doc.text('Tax ID: 12-3456789');
  doc.moveDown();

  // Donor details
  doc.font('Helvetica-Bold').text('To:');
  doc.font('Helvetica').text(data.donorName);
  doc.text(data.donorEmail);
  doc.moveDown();

  // Receipt details
  doc.font('Helvetica-Bold').text('Receipt Details:');
  doc.font('Helvetica');
  doc.text(`Receipt Number: ${data.transactionId}`);
  doc.text(`Date: ${format(new Date(data.date), 'MMMM d, yyyy')}`);
  doc.moveDown();

  // Donation details
  doc.font('Helvetica-Bold').text('Donation Information:');
  doc.font('Helvetica');
  doc.text(`Amount: ${data.currency.toUpperCase()} ${data.amount.toFixed(2)}`);
  doc.text(`Frequency: ${data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)}`);
  if (data.projectName) {
    doc.text(`Designated Project: ${data.projectName}`);
  }
  doc.moveDown();

  // Tax deductible notice
  if (data.taxDeductible) {
    doc.font('Helvetica-Oblique').text(
      'This letter serves as your official receipt for tax purposes. No goods or services were provided in exchange for this contribution.',
      { align: 'justify' }
    );
  }
  doc.moveDown(2);

  // Thank you message
  doc.font('Helvetica').text(
    'Thank you for your generous support. Your donation helps us continue our mission of making a positive impact in our community.',
    { align: 'justify' }
  );
  doc.moveDown();

  // Add footer with contact information
  doc.fontSize(10).text(
    'For questions about this receipt, please contact us at donations@hopecare.org or (555) 123-4567.',
    { align: 'center', color: 'gray' }
  );

  // Add page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(10).text(
      `Page ${i + 1} of ${pages.count}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  doc.end();
  return Buffer.concat(chunks);
};

export const savePDFReceipt = async (
  data: DonationReceiptData,
  filepath: string
): Promise<void> => {
  const pdfBuffer = generateDonationReceipt(data);
  await fs.promises.writeFile(filepath, pdfBuffer);
};
