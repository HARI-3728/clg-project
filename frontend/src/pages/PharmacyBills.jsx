import React, { useState, useMemo } from 'react';
import {
  Pill,
  FileText,
  Plus,
  Trash2,
  Download,
  Printer,
  Eye,
  PhoneCall,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  ShieldCheck,
  Check,
  Building2,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const PharmacyBills = () => {
  const { user } = useAuth();
  const {
    catalogueMedicines,
    updateCatalogueMedicine,
    hospitalBills,
    issueHospitalBill,
    orders,
    hospitalUpdateOrderStatus,
    hospitalGenerateBillFromOrder
  } = usePatientData();

  const [activeTab, setActiveTab] = useState('billing-counter'); // 'billing-counter' | 'patient-orders' | 'history' | 'inventory'

  // ==================== SUPERMARKET BILLING COUNTER STATE ====================
  const [patientName, setPatientName] = useState('Patient');
  const [patientId, setPatientId] = useState('MC-8942-021');
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // 'Paid' | 'Unpaid'
  const [paymentMode, setPaymentMode] = useState('Cash / Counter');
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);

  // Counter Cart Items: [{ id, medicine, quantity, unitPrice, lineTotal, prescriptionRequired }]
  const [counterItems, setCounterItems] = useState([
    { id: 'med_1', medicine: 'Paracetamol', quantity: 2, unitPrice: 40, lineTotal: 80, prescriptionRequired: false },
    { id: 'med_3', medicine: 'ORS', quantity: 1, unitPrice: 30, lineTotal: 30, prescriptionRequired: false }
  ]);

  // Selected medicine for quick add
  const [selectedMedId, setSelectedMedId] = useState('med_4');
  const [selectedQty, setSelectedQty] = useState(1);
  const [counterError, setCounterError] = useState('');

  // Search in Billing History
  const [historySearch, setHistorySearch] = useState('');

  // Printable Invoice Modal State
  const [printableBill, setPrintableBill] = useState(null);

  // Inventory Edit State
  const [editingMedId, setEditingMedId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Pharmacy bills from hospitalBills
  const pharmacyBillsList = useMemo(() => {
    return hospitalBills.filter((b) => b.type === 'Pharmacy' || b.billNo?.includes('PHARM'));
  }, [hospitalBills]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    const q = historySearch.toLowerCase().trim();
    if (!q) return pharmacyBillsList;
    return pharmacyBillsList.filter(
      (b) =>
        b.billNo.toLowerCase().includes(q) ||
        (b.patientName && b.patientName.toLowerCase().includes(q)) ||
        (b.date && b.date.toLowerCase().includes(q)) ||
        (b.orderId && b.orderId.toLowerCase().includes(q))
    );
  }, [historySearch, pharmacyBillsList]);

  // Subtotal, 5% GST tax, Grand Total calculation for counter
  const counterSubtotal = counterItems.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const counterTax = Math.round(counterSubtotal * 0.05); // 5% GST
  const counterGrandTotal = counterSubtotal + counterTax;
  const hasCounterRxItem = counterItems.some((item) => item.prescriptionRequired);

  // Add Item to Counter Bill
  const handleAddItemToCounter = (e) => {
    e.preventDefault();
    setCounterError('');

    const med = catalogueMedicines.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (!med.price || med.price <= 0) {
      setCounterError(`Price not configured for ${med.name}. Please set price in Inventory first.`);
      return;
    }

    if (med.stock === undefined || med.stock === null || med.stock < selectedQty) {
      setCounterError(`Insufficient stock for ${med.name}. Available: ${med.stock || 0}`);
      return;
    }

    const existingIndex = counterItems.findIndex((it) => it.id === med.id);
    if (existingIndex !== -1) {
      const newQty = counterItems[existingIndex].quantity + Number(selectedQty);
      if (newQty > (med.stock || 0)) {
        setCounterError(`Total quantity (${newQty}) exceeds available stock (${med.stock}).`);
        return;
      }
      setCounterItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex
            ? { ...it, quantity: newQty, lineTotal: newQty * it.unitPrice }
            : it
        )
      );
    } else {
      setCounterItems((prev) => [
        ...prev,
        {
          id: med.id,
          medicine: med.name,
          quantity: Number(selectedQty),
          unitPrice: med.price,
          lineTotal: Number(selectedQty) * med.price,
          prescriptionRequired: !!med.prescriptionRequired
        }
      ]);
    }

    setSelectedQty(1);
  };

  // Change Item Quantity in Counter
  const handleUpdateCounterQty = (id, newQty) => {
    setCounterError('');
    const qty = Number(newQty);
    if (qty <= 0) {
      handleRemoveCounterItem(id);
      return;
    }

    const med = catalogueMedicines.find((m) => m.id === id);
    if (med && med.stock !== undefined && qty > med.stock) {
      setCounterError(`Cannot set quantity above available stock (${med.stock}) for ${med.name}.`);
      return;
    }

    setCounterItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: qty, lineTotal: qty * it.unitPrice } : it
      )
    );
  };

  // Remove Item
  const handleRemoveCounterItem = (id) => {
    setCounterItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Generate & Save Bill from Counter
  const handleGenerateCounterBill = (e) => {
    e.preventDefault();
    setCounterError('');

    if (counterItems.length === 0) {
      setCounterError('At least one medicine item is required to generate a bill.');
      return;
    }

    if (hasCounterRxItem && !prescriptionVerified) {
      setCounterError('Prescription validation required: Bill contains Amoxicillin (Rx Required). Please verify prescription before generating bill.');
      return;
    }

    try {
      const newBill = issueHospitalBill({
        type: 'Pharmacy',
        patientName: patientName.trim() || 'Patient',
        patientId: patientId.trim() || 'MC-8942-021',
        serviceCategory: 'Pharmacy Dispensation Counter',
        items: counterItems,
        subtotal: counterSubtotal,
        taxAmount: counterTax,
        discountAmount: 0,
        numericAmount: counterGrandTotal,
        paymentMode: paymentMode,
        status: paymentStatus,
        prescriptionVerified: hasCounterRxItem ? prescriptionVerified : true
      });

      // Clear counter cart
      setCounterItems([]);
      setPrescriptionVerified(false);
      setPrintableBill(newBill);
    } catch (err) {
      setCounterError(err.message || 'Failed to save bill.');
    }
  };

  // Handle Inventory Update
  const handleSaveInventory = (medId) => {
    updateCatalogueMedicine(medId, {
      price: editPrice ? Number(editPrice) : undefined,
      stock: editStock ? Number(editStock) : undefined
    });
    setEditingMedId(null);
  };

  // Print Dialog Trigger
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="pharmacy-bills-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hospital Pharmacy Top Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #10b981',
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
          <span style={{ fontSize: '1.3rem' }}>💊</span>
          <div>
            <h4 style={{ margin: 0, color: '#047857', fontWeight: '800', fontSize: '0.95rem' }}>
              KMCH HOSPITAL PHARMACY & BILLING OPERATIONS COUNTER
            </h4>
            <p style={{ margin: 0, color: '#065f46', fontSize: '0.825rem' }}>
              Supermarket POS Billing • Real-time Inventory Verification • Patient Orders Sync
            </p>
          </div>
        </div>
        <a href="tel:108" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" icon={PhoneCall}>
            Call 108 Emergency
          </Button>
        </a>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Billing & Pharmacy Module</h1>
          <p className="page-subtitle">
            Point-of-sale medicine dispensation, line totals calculation, inventory tracking and patient order billing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('billing-counter')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'billing-counter' ? 'var(--primary-600)' : 'var(--neutral-100)',
              color: activeTab === 'billing-counter' ? 'white' : 'var(--neutral-700)'
            }}
          >
            🛒 POS Billing Counter
          </button>

          <button
            onClick={() => setActiveTab('patient-orders')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'patient-orders' ? '#059669' : 'var(--neutral-100)',
              color: activeTab === 'patient-orders' ? 'white' : 'var(--neutral-700)'
            }}
          >
            📦 Patient Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#0284c7' : 'var(--neutral-100)',
              color: activeTab === 'history' ? 'white' : 'var(--neutral-700)'
            }}
          >
            📄 Billing History ({pharmacyBillsList.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'inventory' ? '#7c3aed' : 'var(--neutral-100)',
              color: activeTab === 'inventory' ? 'white' : 'var(--neutral-700)'
            }}
          >
            ⚙️ Price & Stock Setup
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: POS BILLING COUNTER (SUPERMARKET BILLING STYLE)                    */}
      {/* ========================================================================= */}
      {activeTab === 'billing-counter' && (
        <div className="pos-billing-section fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Left Box: Product Scanner / Selector */}
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
                  Select Medicine & Quantity
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Unit prices are retrieved directly from the configured catalogue database.
                </p>
              </div>

              <form onSubmit={handleAddItemToCounter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    Select Medicine (From 10 Authorized Catalogue Items):
                  </label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}
                  >
                    {catalogueMedicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.prescriptionRequired ? '(Rx Required)' : ''} — ₹{m.price || 0} ({m.stock !== undefined ? `${m.stock} in stock` : 'Stock unconfigured'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      Quantity:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '0.9rem',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      Calculated Line Total:
                    </label>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>
                      ₹{((catalogueMedicines.find((m) => m.id === selectedMedId)?.price || 0) * selectedQty).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button variant="primary" icon={Plus} type="submit" style={{ width: '100%' }}>
                  Add Line Item to Bill
                </Button>
              </form>

              {/* Patient details section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Patient Details (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Patient Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Walk-in Patient"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Patient Medical ID</label>
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="MC-8942-021"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid / Credit</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                  >
                    <option value="Cash / Counter">Cash Counter</option>
                    <option value="UPI / QR Code">UPI QR Code</option>
                    <option value="Card (POS Terminal)">Card (POS Terminal)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Right Box: Live Supermarket Counter Bill Sheet */}
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '5px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--neutral-900)', margin: 0 }}>
                    Pharmacy Counter Bill
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    MediCare+ Kovai Medical Center (KMCH)
                  </span>
                </div>
                <span className="badge badge-success">POS Terminal #01</span>
              </div>

              {/* Items Table */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 30px', padding: '0.5rem', backgroundColor: 'var(--neutral-100)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                  <span>Item</span>
                  <span>Price</span>
                  <span>Qty</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span></span>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {counterItems.length > 0 ? (
                    counterItems.map((it) => (
                      <div
                        key={it.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 30px',
                          padding: '0.55rem',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.85rem',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong>{it.medicine}</strong>
                          {it.prescriptionRequired && (
                            <span style={{ fontSize: '0.65rem', color: '#e11d48', display: 'block' }}>Rx</span>
                          )}
                        </div>
                        <span>₹{it.unitPrice}</span>
                        <div>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => handleUpdateCounterQty(it.id, e.target.value)}
                            style={{ width: '45px', padding: '0.2rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                          />
                        </div>
                        <strong style={{ textAlign: 'right', color: '#059669' }}>₹{it.lineTotal}</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveCounterItem(it.id)}
                          style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: 0 }}
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No items added yet. Select medicine from the left panel.
                    </div>
                  )}
                </div>
              </div>

              {/* Prescription verification requirement */}
              {hasCounterRxItem && (
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#9f1239', fontWeight: '700' }}>
                    <input
                      type="checkbox"
                      checked={prescriptionVerified}
                      onChange={(e) => setPrescriptionVerified(e.target.checked)}
                    />
                    <span>Pharmacist Verification: Authorized Doctor's Prescription Verified for Amoxicillin</span>
                  </label>
                </div>
              )}

              {/* Totals Summary */}
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <strong>₹{counterSubtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Applicable GST (5%):</span>
                  <strong>₹{counterTax.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '1.25rem' }}>
                  <strong>Final Total:</strong>
                  <strong style={{ color: '#059669' }}>₹{counterGrandTotal.toLocaleString()}</strong>
                </div>
              </div>

              {counterError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '700' }}>
                  {counterError}
                </div>
              )}

              {/* Action Buttons: Generate Bill & Print Bill */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
                <Button
                  variant="outline"
                  icon={Printer}
                  disabled={counterItems.length === 0}
                  onClick={handleGenerateCounterBill}
                >
                  Generate & Print
                </Button>
                <Button
                  variant="primary"
                  icon={Receipt}
                  disabled={counterItems.length === 0}
                  onClick={handleGenerateCounterBill}
                >
                  Generate Bill (₹{counterGrandTotal})
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PATIENT MEDICINE ORDERS REVIEW & BILL GENERATION (SECTION 7)       */}
      {/* ========================================================================= */}
      {activeTab === 'patient-orders' && (
        <div className="patient-orders-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                Patient Medicine Orders Queue ({orders.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Review incoming patient orders, verify prescriptions, and convert approved orders to official hospital bills without duplicate charging.
              </p>
            </div>
          </div>

          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => {
                const statusColor =
                  order.status === 'Completed' ? '#059669' :
                  order.status === 'Ready' ? '#0284c7' :
                  order.status === 'Preparing' ? '#7c3aed' :
                  order.status === 'Confirmed' ? '#2563eb' :
                  order.status === 'Cancelled' ? '#e11d48' : '#d97706';

                return (
                  <Card key={order.id} style={{ padding: '1.5rem', borderLeft: `5px solid ${statusColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)' }}>
                          Order #{order.orderNumber}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                          Placed on {order.orderDate} at {order.orderTime}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: statusColor }}>
                          Status: {order.status}
                        </span>
                        {order.billed ? (
                          <span className="badge badge-success" style={{ fontWeight: '800' }}>
                            ✓ Billed ({order.billId})
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontWeight: '800' }}>
                            Unbilled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient & Items Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>PATIENT</span>
                        <h4 style={{ margin: '0.2rem 0', fontSize: '1rem', fontWeight: '800' }}>{order.patientName}</h4>
                        <div>Contact: <strong>{order.patientContact}</strong></div>
                        {order.prescriptionRequired && (
                          <div style={{ marginTop: '0.4rem', color: order.prescriptionVerified ? '#059669' : '#e11d48', fontWeight: '700' }}>
                            {order.prescriptionVerified ? '✓ Prescription Verified' : '⚠️ Prescription Awaiting Staff Verification'}
                          </div>
                        )}
                      </div>

                      <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>FINANCIAL TOTAL</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#059669', margin: '0.2rem 0' }}>
                          ₹{order.total}
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal: ₹{order.subtotal} + 5% GST: ₹{order.tax}</span>
                      </div>
                    </div>

                    {/* Items table */}
                    <div style={{ marginBottom: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderTop: idx > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <span><strong>{it.name}</strong> {it.prescriptionRequired ? '(Rx Required)' : ''}</span>
                          <span>₹{it.unitPrice}</span>
                          <span>Qty: {it.quantity}</span>
                          <strong style={{ textAlign: 'right' }}>₹{it.lineTotal}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Hospital staff workflow actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      {/* Status update select */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Update Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => hospitalUpdateOrderStatus(order.id, e.target.value)}
                          style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: '700' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Generate bill action */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!order.billed ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Receipt}
                            onClick={() => {
                              try {
                                const generated = hospitalGenerateBillFromOrder(order.id);
                                setPrintableBill(generated);
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                          >
                            Generate Official Bill
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Printer}
                            onClick={() => {
                              const existingBill = hospitalBills.find((b) => b.billNo === order.billId || b.orderId === order.orderNumber);
                              if (existingBill) {
                                setPrintableBill(existingBill);
                              } else {
                                alert(`Bill ${order.billId} is recorded in billing history.`);
                              }
                            }}
                          >
                            Print Saved Bill ({order.billId})
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <ShoppingCart size={36} style={{ color: 'var(--neutral-400)', margin: '0 auto 0.75rem' }} />
              <h3>No patient orders in queue</h3>
              <p style={{ color: 'var(--text-muted)' }}>Orders placed by patients will appear here for review and billing.</p>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BILLING HISTORY (SECTION 6.C)                                      */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="billing-history-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                Pharmacy Billing History & Invoices ({filteredHistory.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Historical dispensary transactions recorded in database. Print anytime.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                type="text"
                placeholder="Search bill #, patient, date..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredHistory.map((bill) => (
              <Card key={bill.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '4px solid #059669' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-neutral" style={{ fontWeight: '800' }}>{bill.billNo}</span>
                  <span className="badge badge-success">● {bill.status || 'Paid'}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.2rem 0' }}>
                    Patient: {bill.patientName || 'Patient'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Date: {bill.date} • Mode: {bill.paymentMode || 'Counter'}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span>₹{bill.subtotal || bill.numericAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Taxes:</span>
                    <span>₹{bill.taxAmount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem', fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>
                    <span>Final Amount:</span>
                    <span>{bill.amount}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => setPrintableBill(bill)}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  View & Print Official Bill
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MEDICINE PRICE & INVENTORY CONFIGURATION (SECTION 6.D & 13)        */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="inventory-section fade-in">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
              Pharmacy Catalogue Inventory & Pricing Setup
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Configure unit prices and physical stock for the 10 authorized catalogue medicines. No unconfigured items can be checked out by patients.
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', background: 'var(--neutral-100)', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <span>Medicine Name</span>
              <span>General Purpose</span>
              <span>Unit Price (₹)</span>
              <span>Stock Count</span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>

            {catalogueMedicines.map((med) => {
              const isEditing = editingMedId === med.id;

              return (
                <div
                  key={med.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                    padding: '0.85rem 1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.875rem',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{med.name}</strong>
                    {med.prescriptionRequired && (
                      <span className="badge badge-danger" style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                        Rx Required
                      </span>
                    )}
                  </div>

                  <span style={{ color: 'var(--neutral-700)', fontSize: '0.825rem' }}>{med.generalPurpose}</span>

                  <div>
                    {isEditing ? (
                      <input
                        type="number"
                        min={1}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        style={{ width: '80px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                      />
                    ) : (
                      <strong style={{ color: med.price ? '#059669' : '#d97706' }}>
                        {med.price ? `₹${med.price}` : 'Unconfigured'}
                      </strong>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        style={{ width: '80px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                      />
                    ) : (
                      <span style={{ fontWeight: '700', color: med.stock > 0 ? 'var(--neutral-900)' : '#e11d48' }}>
                        {med.stock !== undefined ? `${med.stock} units` : 'Unconfigured'}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isEditing ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Save}
                        onClick={() => handleSaveInventory(med.id)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        onClick={() => {
                          setEditingMedId(med.id);
                          setEditPrice(med.price || '');
                          setEditStock(med.stock !== undefined ? med.stock : '');
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE BILL MODAL (SECTION 6.C)                                        */}
      {/* ========================================================================= */}
      {printableBill && (
        <Modal
          isOpen={!!printableBill}
          onClose={() => setPrintableBill(null)}
          title={`Printable Bill: ${printableBill.billNo}`}
          size="lg"
        >
          <div className="printable-bill-container" style={{ padding: '1rem', backgroundColor: '#ffffff', color: '#0f172a' }}>
            {/* Header with MediCare+ Hospital Branding */}
            <div style={{ borderBottom: '2.5px solid #059669', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#047857', margin: 0 }}>
                  MediCare+ • KMCH Hospital
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Kovai Medical Center & Hospital Pharmacy Counter • Avinashi Road, Coimbatore
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GSTIN: 33AAACK4921C1Z0 • Phone: +91 422 432 3800</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>TAX INVOICE</span>
                <div style={{ fontSize: '1rem', fontWeight: '900', marginTop: '0.25rem' }}>{printableBill.billNo}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {printableBill.date}</div>
              </div>
            </div>

            {/* Patient & Billing Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Billed To Patient:</span>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.05rem', fontWeight: '800' }}>{printableBill.patientName || 'Patient'}</h4>
                <div>Patient ID: <strong>{printableBill.patientId || 'MC-8942-021'}</strong></div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div>Payment Status: <strong style={{ color: '#059669' }}>{printableBill.status || 'Paid'}</strong></div>
                <div>Payment Mode: <strong>{printableBill.paymentMode || 'Cash / Counter'}</strong></div>
                {printableBill.orderId && (
                  <div>Linked Patient Order: <strong>{printableBill.orderId}</strong></div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>#</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Description / Medicine</th>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {(printableBill.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <strong>{it.medicine || it.description}</strong>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>₹{it.unitPrice}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: '700' }}>₹{it.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <strong>₹{printableBill.subtotal || printableBill.numericAmount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>GST Tax (5%):</span>
                  <strong>₹{printableBill.taxAmount || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #059669', paddingTop: '0.5rem', fontSize: '1.25rem', fontWeight: '900', color: '#047857' }}>
                  <span>Final Amount:</span>
                  <span>{printableBill.amount}</span>
                </div>
              </div>
            </div>

            {/* Sign off */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Authorized Pharmacist Signature: _______________________</span>
              <span>Computer-Generated Official MediCare+ Hospital Receipt</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setPrintableBill(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={triggerPrint}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
