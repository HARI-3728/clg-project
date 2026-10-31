const { PharmacyBill } = require('../models');
const { dataStore, saveStore } = require('../data/store');
const { getDBStatus } = require('../config/db');

/**
 * Generate unique Pharmacy Invoice Number
 */
const generatePharmacyInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-PHARM-${year}-${rand}`;
};

/**
 * @desc   Create Pharmacy Bill (Backend Total Calculation, Price & Qty Validation, Unique Invoice)
 * @route  POST /api/hospital/pharmacy-bills
 * @access Private (Hospital / Pharmacy staff only)
 */
const createPharmacyBill = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const hospitalName = req.user?.name || req.user?.legalName || 'KMCH Hospital Pharmacy Counter';

    const {
      patientName,
      patientId,
      patientContact,
      medicineName,
      quantity,
      unitPrice,
      medicines,
      items: rawItemsList,
      discount,
      tax,
      paymentStatus,
      paymentMode,
      orderId,
      prescriptionVerified
    } = req.body;

    // 1. Validation of medicines / items
    const candidateMedicines = Array.isArray(medicines) && medicines.length > 0
      ? medicines
      : (Array.isArray(rawItemsList) && rawItemsList.length > 0 ? rawItemsList : null);

    let items = [];
    if (candidateMedicines) {
      items = candidateMedicines.map((item) => {
        const qty = item.quantity !== undefined ? Number(item.quantity) : 1;
        const price = item.unitPrice !== undefined ? Number(item.unitPrice) : 0;
        if (isNaN(qty) || qty < 1) {
          throw new Error(`Invalid quantity for ${item.medicineName || 'medicine'}. Must be at least 1.`);
        }
        if (isNaN(price) || price < 0) {
          throw new Error(`Invalid unit price for ${item.medicineName || 'medicine'}. Cannot be negative.`);
        }
        return {
          medicineId: item.medicineId || item.id || `med_${Date.now()}`,
          medicineName: item.medicineName || item.medicine || 'Medicine',
          quantity: qty,
          unitPrice: price,
          lineTotal: qty * price
        };
      });
    } else if (medicineName && unitPrice !== undefined) {
      const qty = quantity !== undefined ? Number(quantity) : 1;
      const price = Number(unitPrice);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
      }
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Unit price cannot be negative.' });
      }
      items = [
        {
          medicineName,
          quantity: qty,
          unitPrice: price,
          lineTotal: qty * price
        }
      ];
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one medicine item with valid quantity and unit price is required.'
      });
    }

    // 2. Backend Totals Calculation
    const calculatedSubtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const calculatedDiscount = Math.max(0, Number(discount || 0));
    const calculatedTax = Math.max(0, Number(tax || Math.round(calculatedSubtotal * 0.05))); // 5% GST if not provided
    const calculatedTotalAmount = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedTax);

    // 3. Unique Invoice Number Generation
    const invoiceNumber = generatePharmacyInvoiceNumber();
    const billDate = new Date();
    const todayStr = billDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const normalizedStatus = (paymentStatus || 'PAID').toUpperCase() === 'PENDING' ? 'PENDING' : 'PAID';

    const newPharmacyBill = {
      id: invoiceNumber,
      billId: invoiceNumber,
      invoiceNumber,
      billNo: invoiceNumber,
      billDate,
      date: todayStr,
      hospitalId,
      hospital: hospitalName,
      patientId: patientId || 'MC-8942-021',
      patientName: patientName || 'Patient',
      patientDetails: {
        name: patientName || 'Patient',
        patientId: patientId || 'MC-8942-021',
        contact: patientContact || '+91 98765 43210'
      },
      medicineName: items[0].medicineName,
      quantity: items.reduce((sum, it) => sum + it.quantity, 0),
      unitPrice: items[0].unitPrice,
      medicines: items,
      price: calculatedSubtotal,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      discountAmount: calculatedDiscount,
      tax: calculatedTax,
      taxAmount: calculatedTax,
      totalAmount: calculatedTotalAmount,
      numericAmount: calculatedTotalAmount,
      amount: `₹${calculatedTotalAmount.toLocaleString('en-IN')}`,
      currency: 'INR',
      paymentStatus: normalizedStatus,
      status: normalizedStatus === 'PAID' ? 'Paid' : 'Pending',
      paymentMode: paymentMode || 'Cash / UPI Counter',
      orderId: orderId || `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptionVerified: prescriptionVerified !== false
    };

    if (getDBStatus()) {
      try {
        await PharmacyBill.create(newPharmacyBill);
      } catch (dbErr) {
        console.warn('PharmacyBill DB save notice:', dbErr.message);
      }
    }

    if (!dataStore.pharmacyBills) dataStore.pharmacyBills = [];
    dataStore.pharmacyBills.unshift(newPharmacyBill);

    // Keep compatibility with frontend store
    if (!dataStore.hospitalBills) dataStore.hospitalBills = [];
    dataStore.hospitalBills.unshift({
      ...newPharmacyBill,
      type: 'Pharmacy'
    });

    saveStore();

    return res.status(201).json({
      success: true,
      message: `Pharmacy bill generated successfully. Invoice #${invoiceNumber}`,
      bill: newPharmacyBill
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get Pharmacy Bills for Hospital Staff (Scoped to Hospital, Search & Status Filters)
 * @route  GET /api/hospital/pharmacy-bills
 * @access Private (Hospital / Pharmacy staff only)
 */
const getPharmacyBills = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const { status, search } = req.query;

    let bills = [];
    if (getDBStatus()) {
      try {
        bills = await PharmacyBill.find({ hospitalId }).sort({ createdAt: -1 });
      } catch (e) {}
    }

    if (!bills || bills.length === 0) {
      bills = (dataStore.pharmacyBills || []).filter(
        (b) => !b.hospitalId || b.hospitalId === hospitalId
      );
    }

    // Fallback to checking dataStore.hospitalBills with Pharmacy type
    if (bills.length === 0) {
      bills = (dataStore.hospitalBills || []).filter(
        (b) => (b.type === 'Pharmacy' || b.billNo?.includes('PHARM')) && (!b.hospitalId || b.hospitalId === hospitalId)
      );
    }

    if (status) {
      const s = status.toUpperCase();
      bills = bills.filter((b) => (b.paymentStatus || b.status || '').toUpperCase() === s);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      bills = bills.filter(
        (b) =>
          (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
          (b.billNo && b.billNo.toLowerCase().includes(q)) ||
          (b.patientName && b.patientName.toLowerCase().includes(q)) ||
          (b.medicineName && b.medicineName.toLowerCase().includes(q)) ||
          (b.orderId && b.orderId.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      hospitalId,
      currency: 'INR',
      count: bills.length,
      bills
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get Printable Pharmacy Invoice / Counter Receipt
 * @route  GET /api/hospital/pharmacy-bills/:id/invoice
 * @access Private (Hospital / Pharmacy staff only)
 */
const getPharmacyPrintableInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    let bill = (dataStore.pharmacyBills || []).find(
      (b) => b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id
    );

    if (!bill) {
      bill = (dataStore.hospitalBills || []).find(
        (b) => (b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id)
      );
    }

    if (getDBStatus() && !bill) {
      try {
        bill = await PharmacyBill.findOne({
          $or: [{ invoiceNumber: id }, { billId: id }, { _id: id }]
        });
      } catch (e) {}
    }

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Pharmacy bill not found.' });
    }

    const billObj = bill.toObject ? bill.toObject() : bill;
    const total = billObj.totalAmount || billObj.numericAmount || 116;

    const printableInvoice = {
      pharmacy: {
        name: 'KMCH Hospital Pharmacy Counter',
        parentHospital: 'Kovai Medical Center and Hospital Ltd.',
        address: 'Avinashi Road, Peelamedu, Coimbatore - 641014',
        contact: '+91 422 432 3800 (Ext. 204)',
        gstin: '33AAACK4412M1Z8',
        drugLicenseNo: 'TN-CBE-20B-18821 / 21B-18822'
      },
      invoice: {
        invoiceNumber: billObj.invoiceNumber || billObj.billNo,
        orderId: billObj.orderId || 'COUNTER-CASH',
        billDate: billObj.date || new Date().toLocaleDateString('en-GB'),
        paymentStatus: (billObj.paymentStatus || billObj.status || 'PAID').toUpperCase(),
        paymentMode: billObj.paymentMode || 'Cash / UPI Counter',
        prescriptionVerified: billObj.prescriptionVerified !== false,
        currency: 'INR (₹)'
      },
      patient: {
        name: billObj.patientDetails?.name || billObj.patientName || 'Patient',
        patientId: billObj.patientId || 'MC-8942-021',
        contact: billObj.patientDetails?.contact || '+91 98765 43210'
      },
      items: (billObj.medicines || []).map((m) => ({
        medicineName: m.medicineName || m.medicine,
        quantity: m.quantity,
        unitPrice: `₹${m.unitPrice}`,
        lineTotal: `₹${m.lineTotal || (m.quantity * m.unitPrice)}`
      })),
      pricingBreakdown: {
        subtotal: `₹${(billObj.price || billObj.subtotal || 110).toLocaleString('en-IN')}`,
        discount: `₹${(billObj.discount || 0).toLocaleString('en-IN')}`,
        taxGST: `₹${(billObj.tax || billObj.taxAmount || 6).toLocaleString('en-IN')}`,
        grandTotal: `₹${total.toLocaleString('en-IN')}`
      },
      authorizedPharmacist: 'KMCH Hospital Dispensing Chemist'
    };

    return res.status(200).json({
      success: true,
      invoice: printableInvoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update Pharmacy Bill Payment Status
 * @route  PUT /api/hospital/pharmacy-bills/:id/status
 * @access Private (Hospital / Pharmacy staff only)
 */
const updatePharmacyBillStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, status } = req.body;
    const finalStatus = (paymentStatus || status || 'PAID').toUpperCase();

    let bill = (dataStore.pharmacyBills || []).find(
      (b) => b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id
    );

    if (!bill) {
      bill = (dataStore.hospitalBills || []).find(
        (b) => (b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id)
      );
    }

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Pharmacy bill not found.' });
    }

    bill.paymentStatus = finalStatus;
    bill.status = finalStatus === 'PAID' ? 'Paid' : 'Pending';

    if (getDBStatus()) {
      try {
        await PharmacyBill.findOneAndUpdate(
          { $or: [{ invoiceNumber: id }, { billId: id }, { _id: id }] },
          { $set: { paymentStatus: finalStatus } }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: `Pharmacy bill payment status updated to ${finalStatus}.`,
      bill
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPharmacyBill,
  getPharmacyBills,
  getPharmacyPrintableInvoice,
  updatePharmacyBillStatus
};
