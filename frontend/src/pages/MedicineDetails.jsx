import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pill,
  ShieldAlert,
  Building2,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { sampleMedicines, EDUCATIONAL_DISCLAIMER } from '../data/medicinesData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ErrorState } from '../components/ui/ErrorState';
import './pages.css';

export const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillSuccess, setRefillSuccess] = useState(false);

  // Find target medicine by id or _id
  const medicine = sampleMedicines.find(m => m.id === id || m._id === id) || sampleMedicines[0];

  if (!medicine) {
    return (
      <ErrorState
        title="Medicine Record Not Found"
        message="The medicine requested could not be found in our sample catalog."
        onRetry={() => navigate('/medicines')}
      />
    );
  }

  // Find linked Alternative Medicines
  let alternativeMedicines = sampleMedicines.filter(m =>
    medicine.alternatives?.includes(m.id) || medicine.alternatives?.includes(m._id)
  );

  // If no direct alternatives listed, fall back to medicines in the same category (excluding current)
  if (alternativeMedicines.length === 0) {
    alternativeMedicines = sampleMedicines.filter(m =>
      m.category === medicine.category && m.id !== medicine.id
    );
  }

  const handleRefillSubmit = (e) => {
    e.preventDefault();
    setRefillSuccess(true);
    setTimeout(() => {
      setRefillSuccess(false);
      setIsRefillModalOpen(false);
    }, 1200);
  };

  return (
    <div className="medicine-details-page fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/medicines')}>
          Back to Medicine Catalog
        </Button>
      </div>

      {/* Educational Disclaimer Box */}
      <div className="educational-disclaimer-box">
        <div className="disclaimer-header">
          <ShieldAlert size={20} />
          <span>Educational Prototype Disclaimer</span>
        </div>
        <p>{EDUCATIONAL_DISCLAIMER}</p>
      </div>

      {/* Main Details Grid */}
      <div className="details-container">
        {/* Left Column Image & Badges */}
        <Card className="details-image-card">
          <img src={medicine.image} alt={medicine.name} className="details-img" />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', justifyContent: 'center' }}>
            <span className="badge badge-success">{medicine.category}</span>
            <span className={`badge ${medicine.prescriptionRequired ? 'badge-danger' : 'badge-info'}`}>
              {medicine.prescriptionRequired ? 'Rx Required' : 'OTC Available'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
            {medicine.name}
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Brand: <strong>{medicine.brand}</strong> • {medicine.form}
          </p>

          <div className="details-price-badge">
            <span className="price-val">{medicine.formattedPrice}</span>
            <span className="stock-val">
              Stock Status: <strong>{medicine.stockStatus}</strong> ({medicine.stockCount} units)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1.5rem' }}>
            <Button variant="primary" icon={RefreshCw} onClick={() => setIsRefillModalOpen(true)}>
              Request Prescription Refill
            </Button>
          </div>
        </Card>

        {/* Right Column Specifications */}
        <div className="details-main-info">
          {/* Key Specifications Grid */}
          <div className="info-section">
            <h3 className="info-section-title">
              <Info className="text-primary" size={20} />
              Pharmaceutical Specifications
            </h3>

            <div className="specifications-grid">
              <div className="spec-item">
                <span className="spec-label">Medicine Name:</span>
                <span className="spec-value">{medicine.name}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Brand Name:</span>
                <span className="spec-value">{medicine.brand}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Manufacturer:</span>
                <span className="spec-value">{medicine.manufacturer}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Therapeutic Category:</span>
                <span className="spec-value">{medicine.category}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Retail Price:</span>
                <span className="spec-value">{medicine.formattedPrice}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Stock Status:</span>
                <span className={`badge ${
                  medicine.stockStatus === 'In Stock' ? 'badge-success' :
                  medicine.stockStatus === 'Low Stock' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {medicine.stockStatus} ({medicine.stockCount} left)
                </span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Prescription Needed:</span>
                <span className={`badge ${medicine.prescriptionRequired ? 'badge-danger' : 'badge-info'}`}>
                  {medicine.prescriptionRequired ? 'Yes (Doctor Prescription Required)' : 'No (Over-The-Counter)'}
                </span>
              </div>
            </div>
          </div>

          {/* General Description */}
          <div className="info-section">
            <h3 className="info-section-title">
              <FileText className="text-primary" size={20} />
              General Description & Indications
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--neutral-800)', lineHeight: '1.6' }}>
              {medicine.generalDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Medicines Section */}
      <div className="alternatives-section">
        <div className="section-header-row" style={{ marginTop: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Alternative & Therapeutic Equivalents</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Explore related medicines within the {medicine.category} class
            </p>
          </div>
        </div>

        {alternativeMedicines.length > 0 ? (
          <div className="alternatives-grid">
            {alternativeMedicines.map(alt => (
              <Card key={alt.id} className="alt-med-card" hoverable onClick={() => navigate(`/medicines/${alt.id}`)}>
                <div className="alt-med-img-wrapper">
                  <img src={alt.image} alt={alt.name} />
                </div>
                <div className="alt-med-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>{alt.brand}</span>
                    <span className="alt-price">{alt.formattedPrice}</span>
                  </div>
                  <h4 className="alt-title">{alt.name}</h4>
                  <p className="alt-mfg">by {alt.manufacturer}</p>
                  <p className="alt-desc">{alt.generalDescription.slice(0, 85)}...</p>

                  <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" icon={ChevronRight} iconPosition="right">
                      Inspect Alternative
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No direct alternatives listed for this specific product in the prototype dataset.
            </p>
          </div>
        )}
      </div>

      {/* Refill Request Modal */}
      <Modal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        title={`Prescription Refill Request: ${medicine.name}`}
        subtitle="Confirm pharmacy and pickup preference"
      >
        {refillSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <ShieldCheck size={48} style={{ color: 'var(--primary-600)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Refill Request Sent!</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Your order has been routed to 24/7 HealthPlus Pharmacy. You will be notified when ready.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRefillSubmit} className="auth-form">
            <div className="form-group">
              <label>Select Pharmacy</label>
              <select className="form-input" defaultValue="24/7 HealthPlus Pharmacy">
                <option value="24/7 HealthPlus Pharmacy">24/7 HealthPlus Pharmacy (0.8 km)</option>
                <option value="CVS Health Pharmacy">CVS Health Pharmacy (1.4 km)</option>
                <option value="MetroCare Pharmacy">MetroCare Hospital Pharmacy (1.2 km)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pickup / Delivery Preference</label>
              <select className="form-input" defaultValue="Standard Delivery">
                <option value="Standard Delivery">Home Delivery (Same Day)</option>
                <option value="Express Pickup">In-Store Express Pickup</option>
              </select>
            </div>

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <Button variant="outline" onClick={() => setIsRefillModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Refill Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
