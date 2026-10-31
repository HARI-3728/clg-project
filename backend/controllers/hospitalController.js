const { dataStore, saveStore } = require('../data/store');

// Get orders scoped to hospital
const getHospitalOrders = (req, res) => {
  const hospitalId = req.hospitalScope || req.query.hospitalId;
  let orders = dataStore.orders;
  if (hospitalId) {
    orders = orders.filter((o) => !o.hospitalId || o.hospitalId === hospitalId);
  }
  res.json(orders);
};

// Update order status (Approve / Dispense / Cancel)
const updateOrderStatus = (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status || order.status;
  saveStore();
  res.json(order);
};

// Generate official hospital/pharmacy bill
const generateBillForOrder = (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const billNo = `KMCH-PHARM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBill = {
    id: `pharm_bill_${Date.now()}`,
    billNo,
    type: 'Pharmacy',
    patientName: order.patientName || 'Patient',
    patientId: order.patientId || 'MC-8942-021',
    hospital: req.user?.name || 'KMCH Hospital Pharmacy Counter',
    hospitalId: req.user?.hospitalId || 'hosp_1',
    date: new Date().toISOString().split('T')[0],
    orderId: order.orderNumber,
    items: order.items,
    subtotal: order.subtotal,
    taxAmount: order.tax,
    amount: `₹${order.total}`,
    numericAmount: order.total,
    status: 'Paid',
    paymentMode: 'Cash / Counter UPI',
    prescriptionVerified: true
  };

  order.billed = true;
  order.billId = billNo;
  dataStore.hospitalBills.unshift(newBill);
  saveStore();

  res.status(201).json({ success: true, bill: newBill, order });
};

// Hospital bills list scoped to hospital
const getHospitalBills = (req, res) => {
  const hospitalId = req.hospitalScope || req.query.hospitalId;
  let bills = dataStore.hospitalBills;
  if (hospitalId) {
    bills = bills.filter((b) => !b.hospitalId || b.hospitalId === hospitalId);
  }
  res.json(bills);
};

const createHospitalBill = (req, res) => {
  const newBill = {
    id: `hosp_bill_${Date.now()}`,
    billNo: `KMCH-HOSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    hospitalId: req.user?.hospitalId || 'hosp_1',
    status: 'Paid',
    ...req.body
  };
  dataStore.hospitalBills.unshift(newBill);
  saveStore();
  res.status(201).json(newBill);
};

module.exports = {
  getHospitalOrders,
  updateOrderStatus,
  generateBillForOrder,
  getHospitalBills,
  createHospitalBill
};

