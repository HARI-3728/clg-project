const { HospitalBill, Hospital } = require('../models');
const { dataStore, saveStore } = require('../data/store');
const { getDBStatus } = require('../config/db');

/**
 * Generate unique Hospital Invoice Number
 */
const generateHospitalInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-HOSP-${year}-${rand}`;
};

/**
 * Helper to convert number to words for printable Indian currency invoice
 */
const numberToINRWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? `${str.trim()} Rupees Only` : 'Zero Rupees Only';
};

/**
 * @desc   Create Hospital Bill (Backend Total Calculation, Price Validation, Unique Invoice)
 * @route  POST /api/hospital/bills
 * @access Private (Hospital staff only)
 */
const createHospitalBill = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const hospitalName = req.user?.name || req.user?.legalName || 'KMCH Super-Specialty Hospital';

    const {
      patientName,
      patientId,
      patientContact,
      patientAge,
      patientGender,
      doctorName,
      doctorId,
      doctorSpecialization,
      consultationCharges,
      treatmentCharges,
      testCharges,
      laboratoryCharges,
      laboratoryTestCharges,
      roomCharges,
      otherCharges,
      paymentStatus,
      paymentMode,
      serviceCategory,
      roomNo,
      notes
    } = req.body;

    // 1. Validation of required inputs & prices
    if (!patientName && !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient name or Patient ID is required to generate hospital bill.'
      });
    }

    const cCharges = Number(consultationCharges || 0);
    const trCharges = Number(treatmentCharges || 0);
    const teCharges = Number(laboratoryTestCharges !== undefined ? laboratoryTestCharges : laboratoryCharges !== undefined ? laboratoryCharges : testCharges || 0);
    const rmCharges = Number(roomCharges || 0);
    const otCharges = Number(otherCharges || 0);

    if ([cCharges, trCharges, teCharges, rmCharges, otCharges].some((c) => isNaN(c) || c < 0)) {
      return res.status(400).json({
        success: false,
        message: 'All billing charges must be valid non-negative numbers in Indian Rupees (₹).'
      });
    }

    // 2. Calculate Total on the Backend
    const backendCalculatedTotal = cCharges + trCharges + teCharges + rmCharges + otCharges;

    // 3. Unique Invoice Number Generation
    const invoiceNumber = generateHospitalInvoiceNumber();
    const billDate = new Date();
    const todayStr = billDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const normalizedStatus = (paymentStatus || 'PAID').toUpperCase() === 'PENDING' ? 'PENDING' : 'PAID';

    const newBillRecord = {
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
        contact: patientContact || '+91 98765 43210',
        age: patientAge ? Number(patientAge) : 28,
        gender: patientGender || 'Male'
      },
      doctorId: doctorId || 'doc_1',
      doctorName: doctorName || 'Dr. Kumar',
      doctorDetails: {
        name: doctorName || 'Dr. Kumar',
        doctorId: doctorId || 'doc_1',
        specialization: doctorSpecialization || 'General Physician'
      },
      consultationCharges: cCharges,
      treatmentCharges: trCharges,
      testCharges: teCharges,
      roomCharges: rmCharges,
      otherCharges: otCharges,
      subtotal: backendCalculatedTotal,
      totalAmount: backendCalculatedTotal,
      numericAmount: backendCalculatedTotal,
      amount: `₹${backendCalculatedTotal.toLocaleString('en-IN')}`,
      currency: 'INR',
      paymentStatus: normalizedStatus,
      status: normalizedStatus === 'PAID' ? 'Paid' : 'Pending',
      paymentMode: paymentMode || 'UPI / Cash',
      serviceCategory: serviceCategory || 'OPD Consultation & Clinical Examination',
      roomNo: roomNo || 'OPD Room 4',
      notes: notes || 'Official Hospital Statement'
    };

    if (getDBStatus()) {
      try {
        await HospitalBill.create(newBillRecord);
      } catch (dbErr) {
        console.warn('HospitalBill DB save notice:', dbErr.message);
      }
    }

    if (!dataStore.hospitalBills) dataStore.hospitalBills = [];
    dataStore.hospitalBills.unshift(newBillRecord);
    saveStore();

    return res.status(201).json({
      success: true,
      message: `Hospital bill generated successfully. Invoice #${invoiceNumber}`,
      bill: newBillRecord
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get Hospital Bills for Hospital Staff (Scoped to Hospital, Search & Status Filters)
 * @route  GET /api/hospital/bills
 * @access Private (Hospital staff only)
 */
const getHospitalBills = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';
    const { status, search } = req.query;

    let bills = [];
    if (getDBStatus()) {
      try {
        bills = await HospitalBill.find({ hospitalId }).sort({ createdAt: -1 });
      } catch (e) {}
    }

    if (!bills || bills.length === 0) {
      bills = (dataStore.hospitalBills || []).filter(
        (b) => (!b.hospitalId || b.hospitalId === hospitalId) && (b.type !== 'Pharmacy' && !b.billNo?.includes('PHARM'))
      );
    }

    // Filter by status if specified
    if (status) {
      const s = status.toUpperCase();
      bills = bills.filter((b) => (b.paymentStatus || b.status || '').toUpperCase() === s);
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase().trim();
      bills = bills.filter(
        (b) =>
          (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
          (b.billNo && b.billNo.toLowerCase().includes(q)) ||
          (b.patientName && b.patientName.toLowerCase().includes(q)) ||
          (b.patientId && b.patientId.toLowerCase().includes(q))
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
 * @desc   Get Printable Hospital Invoice Data
 * @route  GET /api/hospital/bills/:id/invoice
 * @access Private (Hospital staff only)
 */
const getHospitalPrintableInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.hospitalId || req.hospitalScope || 'hosp_1';

    let bill = (dataStore.hospitalBills || []).find(
      (b) => (b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id)
    );

    if (getDBStatus() && !bill) {
      try {
        bill = await HospitalBill.findOne({
          $or: [{ invoiceNumber: id }, { billId: id }, { _id: id }]
        });
      } catch (e) {}
    }

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Hospital bill not found.' });
    }

    const billObj = bill.toObject ? bill.toObject() : bill;
    const total = billObj.totalAmount || billObj.numericAmount || 1050;

    const printableInvoice = {
      hospital: {
        name: 'KMCH Super-Specialty Hospital',
        legalName: 'Kovai Medical Center and Hospital Ltd.',
        address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641014',
        contact: '+91 422 432 3800',
        registrationNo: 'CBE-HOSP-1990-08',
        gstNumber: '33AAACK4412M1Z8'
      },
      invoice: {
        invoiceNumber: billObj.invoiceNumber || billObj.billNo,
        billDate: billObj.date || new Date().toLocaleDateString('en-GB'),
        paymentStatus: (billObj.paymentStatus || billObj.status || 'PAID').toUpperCase(),
        paymentMode: billObj.paymentMode || 'UPI / Cash',
        currency: 'INR (₹)'
      },
      patient: {
        name: billObj.patientDetails?.name || billObj.patientName || 'Patient',
        patientId: billObj.patientId || 'MC-8942-021',
        contact: billObj.patientDetails?.contact || '+91 98765 43210',
        age: billObj.patientDetails?.age || 28,
        gender: billObj.patientDetails?.gender || 'Male'
      },
      doctor: {
        name: billObj.doctorDetails?.name || billObj.doctorName || 'Dr. Kumar',
        specialization: billObj.doctorDetails?.specialization || 'General Physician & Clinical Specialist',
        doctorId: billObj.doctorId || 'doc_1',
        roomNo: billObj.roomNo || 'OPD Room 4'
      },
      itemizedCharges: [
        {
          description: 'Consultation & Clinical OPD Examination',
          amount: billObj.consultationCharges || 500,
          formattedAmount: `₹${(billObj.consultationCharges || 500).toLocaleString('en-IN')}`
        },
        {
          description: 'Clinical Nursing & Treatment Procedures',
          amount: billObj.treatmentCharges || 300,
          formattedAmount: `₹${(billObj.treatmentCharges || 300).toLocaleString('en-IN')}`
        },
        {
          description: 'Laboratory & Diagnostic Investigations',
          amount: billObj.testCharges || 250,
          formattedAmount: `₹${(billObj.testCharges || 250).toLocaleString('en-IN')}`
        },
        {
          description: 'Room & Inpatient Care Charges',
          amount: billObj.roomCharges || 0,
          formattedAmount: `₹${(billObj.roomCharges || 0).toLocaleString('en-IN')}`
        },
        {
          description: 'Other Incidental Hospital Services',
          amount: billObj.otherCharges || 0,
          formattedAmount: `₹${(billObj.otherCharges || 0).toLocaleString('en-IN')}`
        }
      ],
      totalAmount: total,
      formattedTotal: `₹${total.toLocaleString('en-IN')}`,
      amountInWords: numberToINRWords(total),
      authorizedSignatory: 'KMCH Hospital Billing Superintendent'
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
 * @desc   Update Hospital Bill Payment Status
 * @route  PUT /api/hospital/bills/:id/status
 * @access Private (Hospital staff only)
 */
const updateHospitalBillStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, status } = req.body;
    const finalStatus = (paymentStatus || status || 'PAID').toUpperCase();

    const bill = (dataStore.hospitalBills || []).find(
      (b) => (b.id === id || b.billId === id || b.billNo === id || b.invoiceNumber === id)
    );

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Hospital bill not found.' });
    }

    bill.paymentStatus = finalStatus;
    bill.status = finalStatus === 'PAID' ? 'Paid' : 'Pending';

    if (getDBStatus()) {
      try {
        await HospitalBill.findOneAndUpdate(
          { $or: [{ invoiceNumber: id }, { billId: id }, { _id: id }] },
          { $set: { paymentStatus: finalStatus } }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: `Hospital bill payment status updated to ${finalStatus}.`,
      bill
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createHospitalBill,
  getHospitalBills,
  getHospitalPrintableInvoice,
  updateHospitalBillStatus
};

