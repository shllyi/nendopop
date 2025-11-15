const { jsPDF } = require('jspdf');

const generateReceiptPDF = (order) => {
  const doc = new jsPDF();

  // Set colors - Orange theme matching the system
  const primaryColor = [255, 140, 0]; // #ff8c00
  const secondaryColor = [255, 168, 0]; // #ffa800
  const textColor = [51, 51, 51]; // #333333
  const lightGray = [245, 245, 245]; // #f5f5f5

  // Header with background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('NendoPop by SheEm', 105, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Premium Nendoroid Collection', 105, 30, { align: 'center' });

  // Receipt Title
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('OFFICIAL RECEIPT', 105, 55, { align: 'center' });

  // Order Details Box
  doc.setFillColor(...lightGray);
  doc.rect(20, 65, 170, 25, 'F');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Order Number:', 25, 75);
  doc.text('Date:', 25, 85);
  doc.text('Status:', 120, 75);

  doc.setFont(undefined, 'normal');
  doc.text(`#${order._id.toString().slice(-6).toUpperCase()}`, 55, 75);
  doc.text(new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 35, 85);
  doc.text(order.status || 'Confirmed', 135, 75);

  // Customer Information Section
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER INFORMATION', 20, 105);

  doc.setDrawColor(...primaryColor);
  doc.line(20, 107, 80, 107);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textColor);
  doc.text(`Name: ${order.userId?.username || 'N/A'}`, 20, 115);
  doc.text(`Email: ${order.userId?.email || 'N/A'}`, 20, 125);
  doc.text(`Phone: ${order.phone || 'N/A'}`, 20, 135);

  // Shipping Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('SHIPPING DETAILS', 110, 105);

  doc.line(110, 107, 170, 107);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textColor);
  doc.text(`Method: ${order.shipping || 'Standard'}`, 110, 115);
  doc.text(`Fee: ₱${order.shippingFee?.toFixed(2) || '0.00'}`, 110, 125);

  // Address
  doc.setFontSize(9);
  const addressLines = doc.splitTextToSize(`Address: ${order.address || 'N/A'}`, 80);
  doc.text(addressLines, 110, 135);

  // Items Table - Centered and organized
  let yPos = 155;

  // Table Header - Centered
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, 180, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('PRODUCT DESCRIPTION', 20, yPos + 3);
  doc.text('QTY', 110, yPos + 3);
  doc.text('UNIT PRICE', 135, yPos + 3);
  doc.text('TOTAL', 165, yPos + 3);

  // Table Rows
  yPos += 15;
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'normal');

  // Calculate totals first
  const subtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
  const shippingFee = order.shippingFee || 0;
  const grandTotal = subtotal + shippingFee;

  order.items?.forEach((item, index) => {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos - 2, 180, 10, 'F');
    }

    doc.setFontSize(9);
    const itemName = item.name?.substring(0, 35) || 'Unknown Item';
    const itemTotal = ((item.price || 0) * (item.quantity || 1));

    doc.text(itemName, 20, yPos + 4);
    doc.text((item.quantity || 1).toString(), 115, yPos + 4);
    doc.text(`₱${(item.price || 0).toFixed(2)}`, 140, yPos + 4);
    doc.text(`₱${itemTotal.toFixed(2)}`, 170, yPos + 4);

    yPos += 12;
  });

  // Totals Section - Perfectly aligned
  yPos += 15;

  // Separator line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(120, yPos, 190, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...textColor);

  // Subtotal - right aligned
  doc.text('Subtotal:', 140, yPos);
  doc.text(`₱${subtotal.toFixed(2)}`, 175, yPos, { align: 'right' });
  yPos += 10;

  // Shipping Fee - right aligned
  doc.text('Shipping:', 140, yPos);
  doc.text(`₱${shippingFee.toFixed(2)}`, 175, yPos, { align: 'right' });
  yPos += 10;

  // Separator line before total
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(120, yPos, 190, yPos);
  yPos += 8;

  // Grand Total - highlighted
  doc.setFillColor(...primaryColor);
  doc.rect(120, yPos - 4, 70, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('GRAND TOTAL:', 125, yPos + 4);
  doc.text(`₱${grandTotal.toFixed(2)}`, 185, yPos + 4, { align: 'right' });

  // Footer
  yPos += 25;
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.text('Thank you for choosing NendoPop by SheEm!', 105, yPos, { align: 'center' });
  doc.text('Your premium Nendoroid destination', 105, yPos + 8, { align: 'center' });

  // Terms
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('This receipt serves as proof of purchase. Keep for your records.', 105, yPos + 20, { align: 'center' });
  doc.text('For support: contact@nendopop.com | www.nendopop.com', 105, yPos + 26, { align: 'center' });

  return doc;
};

module.exports = generateReceiptPDF;

