import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  PhoneCall,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { mockBills } from '../data/mockData';
import './pages.css';

export const Bills = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-bills'); // 'my-bills' | 'pharmacy-billing'
  const [billsList, setBillsList] = useState(mockBills);

  // Pharmacy Billing Form State
  const [patientName, setPatientName] = useState(user?.name || 'Patient');
  const [hospitalPharmacy, setHospitalPharmacy] = useState('24/7 MediCare+ Health Pharmacy (Avinashi Road)');
  const [discountPercent, setDiscountPercent] = useState(10); // 10%
  const [taxPercent, setTaxPercent] = useState(5); // 5% GST

  const [items, setItems] = useState([
    { id: 1, medicine: 'Paracetamol 650mg', quantity: 2, unitPrice: 50 },
    { id: 2, medicine: 'Metformin 500mg', quantity: 1, unitPrice: 180 }
  ]);

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Add Item to Billing Form
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      medicine: 'Amoxicillin 500mg',
      quantity: 1,
      unitPrice: 150
    };
    setItems([...items, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      alert('At least one item is required for the bill.');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // Update Item Fields
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculate Totals
  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const discountAmount = Math.round((subtotal * Number(discountPercent || 0)) / 100);
  const taxAmount = Math.round(((subtotal - discountAmount) * Number(taxPercent || 0)) / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Generate Bill & Create Invoice
  const handleGenerateBill = (e) => {
    e.preventDefault();
    const invNumber = `PHARM-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newBill = {
      id: `bill_${Date.now()}`,
      billNo: invNumber,
      hospital: hospitalPharmacy,
      patientName: patientName,
      department: 'Pharmacy Billing',
      date: todayStr,
      amount: `₹${grandTotal.toLocaleString()}`,
      status: 'Paid',
      paymentMode: 'Cash / UPI',
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      grandTotal,
      items: [...items]
    };

    setBillsList([newBill, ...billsList]);
    setSelectedInvoice(newBill);
    setActiveTab('my-bills');
  };

  // Print Invoice Mock Action
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="bills-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 🚨 Emergency Banner */}
      <div style={{
        backgroundColor: '#fff1f2',
        border: '1.5px solid #f43f5e',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🚨</span>
          <div>
            <h4 style={{ margin: 0, color: '#9f1239', fontWeight: '800', fontSize: '0.95rem' }}>EMERGENCY MEDICAL HELPLINE</h4>
            <p style={{ margin: 0, color: '#be123c', fontSize: '0.825rem' }}>24x7 Ambulance & Urgent Hospital Support in Coimbatore</p>
          </div>
        </div>
        <a
          href="tel:108"
          style={{
            backgroundColor: '#e11d48',
            color: 'white',
            padding: '0.5rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)'
          }}
        >
          <PhoneCall size={15} />
          <span>CALL 108</span>
        </a>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Pharmacy Billing & My Invoices</h1>
          <p className="page-subtitle">Generate pharmacy receipts, manage patient bills & view tax invoices in Indian Rupees (₹)</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: 'var(--neutral-100)', padding: '0.3rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('my-bills')}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'my-bills' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'my-bills' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          My Bills ({billsList.length})
        </button>

        <button
          onClick={() => setActiveTab('pharmacy-billing')}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'pharmacy-billing' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'pharmacy-billing' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          + Pharmacy Billing (POS)
        </button>
      </div>

      {/* TAB 1: MY BILLS */}
      {activeTab === 'my-bills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {billsList.map((bill) => (
            <Card key={bill.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-neutral" style={{ fontWeight: '700' }}>{bill.billNo}</span>
                <span className="badge badge-success">● {bill.status || 'Paid'}</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--neutral-900)' }}>{bill.hospital}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{bill.department}</p>
                <p style={{ fontSize: '0.825rem', color: 'var(--primary-700)', fontWeight: '600', marginTop: '0.2rem' }}>
                  Patient: <strong>{bill.patientName || user?.name || 'Patient'}</strong>
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {bill.date}</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>Payment: {bill.paymentMode || 'Cash / UPI'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-700)', margin: 0 }}>
                    {bill.amount}
                  </h3>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <Button variant="outline" size="sm" icon={Eye} style={{ width: '100%' }} onClick={() => setSelectedInvoice(bill)}>
                  View Invoice
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: PHARMACY BILLING */}
      {activeTab === 'pharmacy-billing' && (
        <Card style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: 'var(--surface-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)' }}>Create Pharmacy Bill</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Calculate quantities, prices, discounts & GST tax in Indian Rupees (₹)</p>
            </div>
            <span className="badge badge-info" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
              📍 24/7 MediCare+ Pharmacy Counter
            </span>
          </div>

          <form onSubmit={handleGenerateBill}>
            {/* Header Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Hospital / Pharmacy</label>
                <input
                  type="text"
                  className="form-input"
                  value={hospitalPharmacy}
                  onChange={(e) => setHospitalPharmacy(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Tax / GST (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                />
              </div>
            </div>

            {/* Medicines List Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-800)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>Medicine</th>
                    <th style={{ padding: '0.75rem 1rem', width: '100px' }}>Quantity</th>
                    <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Unit Price (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', width: '140px' }}>Total (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', width: '80px', textAlign: 'center', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={item.medicine}
                            onChange={(e) => handleItemChange(item.id, 'medicine', e.target.value)}
                            placeholder="Medicine name"
                            required
                          />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <input
                            type="number"
                            min="1"
                            className="form-input"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            required
                          />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <input
                            type="number"
                            min="0"
                            className="form-input"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            required
                          />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: 'var(--primary-700)', fontSize: '1rem' }}>
                          {item.quantity} × ₹{item.unitPrice} = ₹{itemTotal.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove Medicine"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Buttons: Add Medicine & Total Calculation Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
              <Button type="button" variant="outline" icon={Plus} onClick={handleAddItem}>
                Add Medicine
              </Button>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', minWidth: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <span>Subtotal:</span>
                  <strong>₹{subtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--success-700)' }}>
                  <span>Discount ({discountPercent}%):</span>
                  <strong>-₹{discountAmount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--neutral-700)' }}>
                  <span>Tax / GST ({taxPercent}%):</span>
                  <strong>+₹{taxAmount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', color: 'var(--primary-700)' }}>
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit / Generate Bill Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button type="submit" variant="primary" size="lg" icon={FileText}>
                Generate Bill
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* PROFESSIONAL INVOICE MODAL */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title="MediCare+ Pharmacy Invoice"
          subtitle={`Tax Invoice Receipt #${selectedInvoice.billNo}`}
        >
          <div className="printable-invoice" style={{ padding: '0.5rem' }}>
            {/* Header Logo & Hospital Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-600)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-700)', margin: 0 }}>MediCare+ Pharmacy</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Super-Specialty Health & Medical Center</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Avinashi Road, Coimbatore, Tamil Nadu - 641014</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontWeight: '800', padding: '0.35rem 0.75rem' }}>
                  ● PAYMENT STATUS: PAID
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.5rem', margin: '0.4rem 0 0 0' }}>Inv #: {selectedInvoice.billNo}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Date: {selectedInvoice.date}</p>
              </div>
            </div>

            {/* Patient & Provider Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--primary-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--primary-200)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-800)', display: 'block' }}>PATIENT DETAILS</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--neutral-900)' }}>{selectedInvoice.patientName || user?.name || 'Patient'}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-700)', margin: 0 }}>Coimbatore, Tamil Nadu</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-800)', display: 'block' }}>DISPENSED BY</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--neutral-900)' }}>{selectedInvoice.hospital || '24/7 MediCare+ Pharmacy'}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-700)', margin: 0 }}>Payment Mode: {selectedInvoice.paymentMode || 'Cash / UPI'}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-300)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Medicine / Item</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Unit Price (₹)</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '600' }}>{item.medicine}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>₹{Number(item.unitPrice).toLocaleString()}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: '700' }}>₹{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '600' }}>Paracetamol 650mg Therapy</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>2</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>₹50</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: '700' }}>₹100</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '600' }}>OPD Diagnostic Consultation Fee</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>1</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>₹750</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: '700' }}>₹750</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ width: '250px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Subtotal:</span>
                  <strong>{selectedInvoice.subtotal ? `₹${selectedInvoice.subtotal.toLocaleString()}` : selectedInvoice.amount}</strong>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: 'var(--success-700)' }}>
                    <span>Discount ({selectedInvoice.discountPercent}%):</span>
                    <strong>-₹{selectedInvoice.discountAmount.toLocaleString()}</strong>
                  </div>
                )}
                {selectedInvoice.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: 'var(--neutral-700)' }}>
                    <span>GST Tax ({selectedInvoice.taxPercent}%):</span>
                    <strong>+₹{selectedInvoice.taxAmount.toLocaleString()}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--primary-600)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '1.05rem', fontWeight: '900', color: 'var(--primary-700)' }}>
                  <span>Grand Total:</span>
                  <span>{selectedInvoice.grandTotal ? `₹${selectedInvoice.grandTotal.toLocaleString()}` : selectedInvoice.amount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Download & Print */}
            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outline" icon={Download} onClick={() => alert(`Downloading official PDF receipt for ${selectedInvoice.billNo}...`)}>
                Download Invoice
              </Button>
              <Button variant="primary" icon={Printer} onClick={handlePrintInvoice}>
                Print
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
