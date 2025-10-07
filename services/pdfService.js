const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

class PDFService {
  // Generate PDF with QR codes (6 per A4 page)
  static async generateQRPDF(qrData, res) {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');

      // Pipe PDF to response
      doc.pipe(res);

      // A4 dimensions in points (1 inch = 72 points)
      const pageWidth = 595.28; // A4 width
      const pageHeight = 841.89; // A4 height
      const margin = 50;
      const usableWidth = pageWidth - 2 * margin;
      const usableHeight = pageHeight - 2 * margin;

      let currentPage = 0;
      let qrIndex = 0;

      // Process QR codes in batches of 6
      while (qrIndex < qrData.length) {
        // Add new page if not first page
        if (currentPage > 0) {
          doc.addPage();
        }

        // Add page title
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('QR Codes - Simhastha Saathi', margin, margin, {
            align: 'center',
            width: usableWidth,
          });

        // Add generation date
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, margin, margin + 25, {
            align: 'center',
            width: usableWidth,
          });

        // Generate QR codes for current page (max 6)
        const qrsForThisPage = qrData.slice(qrIndex, qrIndex + 6);

        for (let i = 0; i < qrsForThisPage.length; i++) {
          const qr = qrsForThisPage[i];
          const row = Math.floor(i / 3);
          const col = i % 3;

          // Box layout adjustments
          const boxPadding = 15; // padding inside box
          const qrInnerPadding = 10; // padding around QR inside box
          const qrSize = 80; // QR code size
          const boxWidth = qrSize + boxPadding * 2 + qrInnerPadding * 2;
          const boxHeight = qrSize + boxPadding * 2 + qrInnerPadding * 2 + 90; // extra height for logo + text + URL

          const qrSpacingX = boxWidth + 30; // space between columns
          const qrSpacingY = boxHeight + 30; // space between rows

          const x = margin + col * qrSpacingX;
          const y = margin + 60 + row * qrSpacingY;

          try {
            // Generate dynamic URL with qr.id
            const qrUrl = `https://app.jyada.in/member-details/${qr.id}`;

            // Generate QR Code from URL
            const qrDataURL = await QRCode.toDataURL(qrUrl, {
              width: qrSize,
              margin: 1,
              color: { dark: '#000000', light: '#FFFFFF' },
            });

            // Draw rounded box
            doc
              .roundedRect(x, y, boxWidth, boxHeight, 8)
              .lineWidth(0.5)
              .strokeColor('#cccccc')
              .stroke();

            // Add Hackathon logo if exists
            const logoPath = './Hackathon.png';
            if (fs.existsSync(logoPath)) {
              doc.image(logoPath, x + boxWidth / 2 - 25, y + 8, { width: 50 });
            }

            // Add QR code with inner padding
            const qrY = y + 60; // leave space for logo
            doc.image(qrDataURL, x + boxPadding + qrInnerPadding, qrY, {
              width: qrSize,
              height: qrSize,
            });

            // Add ID text
            doc
              .fontSize(8)
              .font('Helvetica')
              .fillColor('#000')
              .text(`ID: ${qr.id}`, x, qrY + qrSize + 8, {
                align: 'center',
                width: boxWidth,
              });

            // Add created date
            doc
              .fontSize(6)
              .font('Helvetica')
              .fillColor('#555')
              .text(`Created: ${new Date(qr.created_at).toLocaleDateString('en-IN')}`, x, qrY + qrSize + 18, {
                align: 'center',
                width: boxWidth,
              });

            // Add clickable URL text below QR code and text
            doc
              .fontSize(6)
              .font('Helvetica')
              .fillColor('#0000EE')
              .text(qrUrl, x + boxPadding, qrY + qrSize + 28, {
                width: boxWidth - boxPadding * 2,
                align: 'center',
                link: qrUrl,
                underline: true,
              });
          } catch (qrError) {
            console.error(`Error generating QR for ID ${qr.id}:`, qrError);
            doc.rect(x, y, boxWidth, boxHeight).stroke();
            doc
              .fontSize(8)
              .font('Helvetica')
              .text(`Error: ${qr.id}`, x, y + boxHeight / 2, {
                align: 'center',
                width: boxWidth,
              });
          }
        }

        qrIndex += 6;
        currentPage++;
      }

      // Add footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#000')
        .text(`Total QR Codes: ${qrData.length} | Generated by Simhastha Saathi`, margin, pageHeight - 30, {
          align: 'center',
          width: usableWidth,
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  // Generate QR code as data URL for individual use
  static async generateQRDataURL(qrId, options = {}) {
    try {
      const defaultOptions = {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrUrl = `https://app.jyada.in/member-details/${qrId}`;
      return await QRCode.toDataURL(qrUrl, qrOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR data URL: ${error.message}`);
    }
  }
}

module.exports = PDFService;
