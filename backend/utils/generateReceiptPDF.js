const { jsPDF } = require('jspdf');

const generateReceiptPDF = (order) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.text('SheEm Shop', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Order Receipt', 20, 30);
  doc.text(`Order #${order._id.toString().slice(-6).toUpperCase()}`, 20, 40);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 50);
  
  // Customer Info
  doc.setFontSize(12);
  doc.text('Customer Information:', 20, 70);
  doc.setFontSize(10);
  doc.text(`Name: ${order.userId?.username || 'N/A'}`, 20, 80);
  doc.text(`Email: ${order.userId?.email || 'N/A'}`, 20, 90);
  doc.text(`Phone: ${order.phone}`, 20, 100);
  
  // Shipping Address
  doc.setFontSize(12);
  doc.text('Shipping Address:', 20, 120);
  doc.setFontSize(10);
  const addressLines = doc.splitTextToSize(order.address, 160);
  doc.text(addressLines, 20, 130);
  
  // Items Table Header
  doc.setFontSize(12);
  doc.text('Items:', 20, 160);
  
  // Table Headers
  let yPos = 170;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('Item', 20, yPos);
  doc.text('Qty', 80, yPos);
  doc.text('Price', 120, yPos);
  doc.text('Total', 160, yPos);
  
  // Table Rows
  yPos = 180;
  doc.setFont(undefined, 'normal');
  order.items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(item.name.substring(0, 30), 20, yPos); // Truncate long names
    doc.text(item.quantity.toString(), 80, yPos);
    doc.text(`₱${item.price.toFixed(2)}`, 120, yPos);
    doc.text(`₱${(item.price * item.quantity).toFixed(2)}`, 160, yPos);
    yPos += 10;
  });
  
  // Totals
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  yPos += 10;
  
  doc.text('Shipping Fee:', 120, yPos);
  doc.text(`₱${order.shippingFee.toFixed(2)}`, 160, yPos);
  yPos += 10;
  
  doc.text('TOTAL AMOUNT:', 120, yPos);
  doc.text(`₱${order.totalAmount.toFixed(2)}`, 160, yPos);
  
  // Footer
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.text('Thank you for shopping with SheEm Shop!', 20, yPos + 20);
  
  return doc;
};

module.exports = generateReceiptPDF;

