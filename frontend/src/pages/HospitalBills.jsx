import React, { useState, useMemo } from 'react';
import { Building2, Receipt, Plus, FileText, Download, Printer, Eye, PhoneCall } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import { mockHospitalBills } from '../data/mockData';
import './pages.css';

export const HospitalBills = () => {
  const { user } = useAuth();
  const { hospitalBills, issueHospitalBill } = usePatientData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const hospitalOnlyBills = useMemo(() => {
    const list = (hospitalBills || []).filter(
      (b) => b.type === 'Hospital' || (!b.type && !b.billNo?.includes('PHARM'))
    );
    return list.length > 0 ? list : mockHospitalBills;
  }, [hospitalBills]);

  // Form State for Hospital Bill
  const [patientName, setPatientName] = useState(user?.name || 'Patient');
  const [serviceCategory, setServiceCategory] = useState('OPD Consultation & Clinical Tests');
  const [doctorName, setDoctorName] = useState('Dr. Kumar');
  const [roomNo, setRoomNo] = useState('OPD Room 4');
  const [subtotal, setSubtotal] = useState(1000);
  const [taxAmount, setTaxAmount] = useState(100);
  const [paymentMode, setPaymentMode] = useState('UPI / Cash');

  const grandTotal = Number(subtotal || 0) + Number(taxAmount || 0);

  const handleCreateBill = (e) => {
    e.preventDefault();
    const newBill = issueHospitalBill({
      type: 'Hospital',
      patientName,
      serviceCategory,
      doctorName,
      roomNo,
      subtotal: Number(subtotal),
      taxAmount: Number(taxAmount),
      numericAmount: grandTotal,
      status: 'Paid',
      paymentMode
    });

    setIsAddModalOpen(false);
    setSelectedInvoice(newBill);
  };

  return (
    <div className="hospital-bills-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 🚨 Emergency Helpline Banner */}
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
          <span style={{ fontSize: '1.2rem' }}>🏥</span>
          <div>
            <h4 style={{ margin: 0, color: '#047857', fontWeight: '800', fontSize: '0.95rem' }}>KMCH HOSPITAL SERVICES BILLING SYSTEM</h4>
            <p style={{ margin: 0, color: '#065f46', fontSize: '0.825rem' }}>Official Inpatient, OPD Consultation, Lab Tests & Room Charges Portal</p>
          </div>
        </div>
        <a href="tel:108" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" icon={PhoneCall}>
            Call 108 Emergency
          </Button>
        </a>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">🏥 Hospital Bills & Statements</h1>
          <p className="page-subtitle">Manage hospital OPD consultations, clinical treatments, diagnostic tests & room tariffs in Indian Rupees (₹)</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Issue New Hospital Bill
        </Button>
      </div>

      {/* Hospital Bills List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {hospitalOnlyBills.map((bill) => (
          <Card key={bill.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-neutral" style={{ fontWeight: '700' }}>{bill.billNo}</span>
              <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                ● {bill.status}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--neutral-900)' }}>{bill.serviceCategory}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: '700' }}>{bill.hospital}</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Patient: <strong>{bill.patientName}</strong> • Attending: <strong>{bill.doctorName}</strong> ({bill.roomNo})
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {bill.date}</span>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>Payment: {bill.paymentMode}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bill Amount</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-700)', margin: 0 }}>
                  {bill.amount}
                </h3>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Button variant="outline" size="sm" icon={Eye} style={{ width: '100%' }} onClick={() => setSelectedInvoice(bill)}>
                View Hospital Receipt
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Hospital Bill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Issue New Hospital Bill"
        subtitle="KMCH Hospital Services & Consultation Tariff"
      >
        <form onSubmit={handleCreateBill} className="auth-form" style={{ padding: '0.5rem 0' }}>
          <div className="form-group">
            <label>Patient Name</label>
            <input
              type="text"
              className="form-input"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Service / Treatment Description</label>
            <input
              type="text"
              className="form-input"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              placeholder="e.g. Cardiology Consultation & Diagnostic Tests"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Attending Doctor</label>
              <input
                type="text"
                className="form-input"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Room / OPD Ward</label>
              <input
                type="text"
                className="form-input"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Service Tariff (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Hospital Tax (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select className="form-input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="UPI / GPay">UPI / GPay</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Cash Counter">Cash Counter</option>
              <option value="Health Insurance">Health Insurance Claim</option>
            </select>
          </div>

          <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700' }}>Grand Total Amount:</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary-700)' }}>₹{grandTotal.toLocaleString()}</strong>
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Receipt}>
              Generate Hospital Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Hospital Receipt Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title="KMCH Hospital Services Invoice"
          subtitle={`Hospital Receipt #${selectedInvoice.billNo}`}
        >
          <div style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-600)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-700)', margin: 0 }}>KMCH Super-Specialty Hospital</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Avinashi Road, Coimbatore, Tamil Nadu</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontWeight: '800' }}>
                  STATUS: {selectedInvoice.status.toUpperCase()}
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.4rem', margin: 0 }}>Bill #: {selectedInvoice.billNo}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Date: {selectedInvoice.date}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--primary-200)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Patient: <strong>{selectedInvoice.patientName}</strong></p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Attending Specialist: <strong>{selectedInvoice.doctorName}</strong> ({selectedInvoice.roomNo})</p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Service: <strong>{selectedInvoice.serviceCategory}</strong></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Base Service Tariff:</span>
              <strong>₹{selectedInvoice.subtotal?.toLocaleString() || selectedInvoice.amount}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Hospital Service Tax:</span>
              <strong>₹{selectedInvoice.taxAmount || 0}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary-700)' }}>
              <span>Total Payable Amount:</span>
              <span>{selectedInvoice.amount}</span>
            </div>

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outline" icon={Download} onClick={() => alert(`Downloading PDF receipt for ${selectedInvoice.billNo}...`)}>
                Download PDF
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
