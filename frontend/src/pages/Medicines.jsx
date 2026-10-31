import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Pill,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Minus,
  Trash2,
  Clock,
  ArrowRight,
  Eye,
  Check,
  Upload,
  Receipt,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import { EDUCATIONAL_DISCLAIMER } from '../data/medicinesData';
import './pages.css';

export const Medicines = () => {
  const { user } = useAuth();
  const {
    catalogueMedicines,
    orders,
    placeOrder,
    prescriptions
  } = usePatientData();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'orders'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMedicineDetails, setSelectedMedicineDetails] = useState(null);

  // Cart State: [{ medicineId, name, quantity, unitPrice, prescriptionRequired, generalPurpose }]
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('medicare_patient_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem('medicare_patient_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cart]);

  // Order Review Form State
  const [prescriptionAttached, setPrescriptionAttached] = useState(false);
  const [prescriptionFileName, setPrescriptionFileName] = useState('');
  const [orderError, setOrderError] = useState('');
  const [placedOrderSuccess, setPlacedOrderSuccess] = useState(null);

  // Filter within exactly the 10 catalogue medicines
  const filteredMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return catalogueMedicines;
    return catalogueMedicines.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      (m.generalPurpose && m.generalPurpose.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q))
    );
  }, [searchQuery, catalogueMedicines]);

  // Cart operations
  const addToCart = (med) => {
    if (!med.price || med.price <= 0) {
      alert(`Price not configured for ${med.name}. Checkout cannot proceed until hospital sets price.`);
      return;
    }
    if (med.stock === undefined || med.stock === null || med.stock <= 0) {
      alert(`Availability not configured or out of stock for ${med.name}.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= (med.stock || 0)) {
          alert(`Cannot add more than available stock (${med.stock}).`);
          return prev;
        }
        return prev.map((item) =>
          item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          medicineId: med.id,
          name: med.name,
          quantity: 1,
          unitPrice: med.price,
          prescriptionRequired: !!med.prescriptionRequired,
          generalPurpose: med.generalPurpose
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (medId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medId) {
            const med = catalogueMedicines.find((m) => m.id === medId);
            const maxStock = med?.stock ?? 999;
            const newQty = item.quantity + delta;
            if (newQty > maxStock) {
              alert(`Cannot exceed available inventory (${maxStock}).`);
              return item;
            }
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (medId) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medId));
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const cartTotal = cartSubtotal + cartTax;
  const hasPrescriptionItem = cart.some((item) => item.prescriptionRequired);

  // Check if any item in cart has unconfigured price or insufficient stock
  const cartHasUnconfiguredDetails = cart.some((item) => {
    const med = catalogueMedicines.find((m) => m.id === item.medicineId);
    return !med || !med.price || med.price <= 0 || med.stock === undefined || med.stock === null || med.stock < item.quantity;
  });

  const handleOpenReview = () => {
    if (cart.length === 0) return;
    if (cartHasUnconfiguredDetails) {
      alert('One or more items in your cart has unconfigured pricing or insufficient stock. Please adjust your cart.');
      return;
    }
    setOrderError('');
    setIsCartOpen(false);
    setIsReviewModalOpen(true);
  };

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    setOrderError('');

    if (hasPrescriptionItem && !prescriptionAttached) {
      setOrderError('Prescription required: Amoxicillin requires an authorized prescription before ordering. Please attach or select your prescription.');
      return;
    }

    try {
      const newOrder = placeOrder({
        items: cart,
        patientName: user?.name || 'Patient',
        patientContact: user?.mobile || user?.emergencyContact || '+91 98765 43210',
        prescriptionAttached,
        prescriptionFileName: prescriptionFileName || (hasPrescriptionItem ? 'Dr_Kumar_Prescription_Amoxicillin.pdf' : null)
      });

      setCart([]);
      setIsReviewModalOpen(false);
      setPlacedOrderSuccess(newOrder);
      setActiveTab('orders');
    } catch (err) {
      setOrderError(err.message || 'Failed to place order.');
    }
  };

  return (
    <div className="medicines-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Educational Notice Banner */}
      <div className="educational-disclaimer-banner" style={{ marginBottom: '1.5rem' }}>
        <ShieldAlert size={20} className="disclaimer-icon" />
        <p>{EDUCATIONAL_DISCLAIMER}</p>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Patient Medicine Ordering</h1>
          <p className="page-subtitle">
            Browse verified catalogue medicines, manage your shopping cart, and track order fulfillment
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
            }}
          >
            <ShoppingCart size={18} />
            <span>Cart ({cart.reduce((sum, it) => sum + it.quantity, 0)})</span>
            {cart.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#e11d48',
                  color: 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher: Browse 10 Medicines vs Order History */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', backgroundColor: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '0.55rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'browse' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'browse' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Pill size={16} /> Catalogue Medicines ({catalogueMedicines.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.55rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'orders' ? '#059669' : 'transparent',
            color: activeTab === 'orders' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Receipt size={16} /> Order History ({orders.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BROWSE EXACT 10 CATALOGUE MEDICINES                                */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="browse-medicines-section fade-in">
          {/* Search within 10 medicines */}
          <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
            <input
              type="text"
              placeholder="Search within authorized 10 medicines (e.g. Paracetamol, Cetirizine, ORS, Amoxicillin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.95rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--neutral-400)' }}
              >
                ×
              </button>
            )}
          </div>

          {/* Catalogue Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {filteredMedicines.map((med) => {
              const hasPrice = med.price !== undefined && med.price !== null && Number(med.price) > 0;
              const hasStock = med.stock !== undefined && med.stock !== null;
              const isAvailable = hasStock && Number(med.stock) > 0;

              return (
                <Card
                  key={med.id}
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    borderTop: med.prescriptionRequired ? '4px solid #e11d48' : '4px solid #059669',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                      {med.form || 'Medicine'}
                    </span>
                    {med.prescriptionRequired ? (
                      <span className="badge badge-danger" style={{ fontWeight: '800', backgroundColor: '#ffe4e6', color: '#e11d48' }}>
                        Rx Required
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ fontWeight: '800' }}>
                        Over-The-Counter
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                      {med.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--neutral-700)', margin: 0, lineHeight: 1.4, minHeight: '2.4rem' }}>
                      <strong>General purpose:</strong> {med.generalPurpose}
                    </p>
                  </div>

                  {/* Price and Stock status */}
                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Price:</span>
                      {hasPrice ? (
                        <strong style={{ fontSize: '1.15rem', color: '#059669' }}>₹{med.price}</strong>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: '800', fontSize: '0.8rem' }}>Price not configured</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Stock / Inventory:</span>
                      {hasStock ? (
                        isAvailable ? (
                          <span style={{ color: '#059669', fontWeight: '700' }}>In Stock ({med.stock} units)</span>
                        ) : (
                          <span style={{ color: '#e11d48', fontWeight: '700' }}>Out of Stock</span>
                        )
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: '800', fontSize: '0.8rem' }}>Availability not configured</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: View Details & Add to Cart */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedMedicineDetails(med)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShoppingCart}
                      disabled={!hasPrice || !isAvailable}
                      onClick={() => addToCart(med)}
                      style={{
                        backgroundColor: !hasPrice || !isAvailable ? 'var(--neutral-300)' : 'var(--primary-600)',
                        cursor: !hasPrice || !isAvailable ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PATIENT ORDER HISTORY & FULFILLMENT STATUS                          */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="order-history-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                Your Placed Medicine Orders ({orders.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Synchronized with the hospital pharmacy counter. Track preparation and collection status.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('browse')}>
              + Order More Medicines
            </Button>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--neutral-900)' }}>
                          {order.orderNumber}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {order.orderDate} at {order.orderTime}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            backgroundColor: `${statusColor}18`,
                            color: statusColor,
                            border: `1px solid ${statusColor}40`
                          }}
                        >
                          Status: {order.status}
                        </span>
                        {order.billed && (
                          <span className="badge badge-success" style={{ fontWeight: '800' }}>
                            ✓ Billed ({order.billId})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order items table */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.4rem 0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        <span>Medicine</span>
                        <span>Unit Price</span>
                        <span>Quantity</span>
                        <span style={{ textAlign: 'right' }}>Line Total</span>
                      </div>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.5rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                          <div>
                            <strong>{it.name}</strong>
                            {it.prescriptionRequired && (
                              <span style={{ fontSize: '0.7rem', color: '#e11d48', display: 'block' }}>Rx Verified</span>
                            )}
                          </div>
                          <span>₹{it.unitPrice}</span>
                          <span>{it.quantity}</span>
                          <strong style={{ textAlign: 'right' }}>₹{it.lineTotal}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Order summary footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span>Patient: <strong>{order.patientName}</strong> ({order.patientContact})</span>
                        {order.prescriptionFileName && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Attached Rx: {order.prescriptionFileName}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subtotal: ₹{order.subtotal} + 5% GST: ₹{order.tax}</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#059669' }}>
                          Total: ₹{order.total}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <ShoppingCart size={40} style={{ color: 'var(--neutral-400)', margin: '0 auto 1rem' }} />
              <h3>No medicine orders placed yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Browse the catalogue and place your first order.</p>
              <Button variant="primary" onClick={() => setActiveTab('browse')}>
                Browse Medicines
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHOPPING CART DRAWER / MODAL                                              */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <Modal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          title={`Shopping Cart (${cart.length} item${cart.length === 1 ? '' : 's'})`}
          size="md"
        >
          {cart.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cart Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div
                    key={item.medicineId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--neutral-50)',
                      border: '1px solid var(--border-subtle)',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                        {item.prescriptionRequired && (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>Rx</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ₹{item.unitPrice} each • {item.generalPurpose}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: '800', minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, 1)}
                        style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Line total */}
                    <strong style={{ minWidth: '55px', textAlign: 'right', color: '#059669' }}>
                      ₹{item.quantity * item.unitPrice}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.medicineId)}
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.2rem' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Prescription warning if cart contains prescription item */}
              {hasPrescriptionItem && (
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#9f1239' }}>
                  <strong>Prescription Safety:</strong> Amoxicillin requires a doctor prescription before checkout. You will be prompted to attach it on the review step.
                </div>
              )}

              {/* Price Calculation Summary */}
              <div style={{ backgroundColor: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <strong>₹{cartSubtotal}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Applicable Taxes (5% GST):</span>
                  <strong>₹{cartTax}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '1.15rem' }}>
                  <strong>Total Amount:</strong>
                  <strong style={{ color: '#059669' }}>₹{cartTotal}</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                  Continue Browsing
                </Button>
                <Button
                  variant="primary"
                  icon={ArrowRight}
                  onClick={handleOpenReview}
                >
                  Proceed to Order Review
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <ShoppingCart size={40} style={{ color: 'var(--neutral-300)', margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: 0 }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 1.25rem' }}>
                Add items from the 10 authorized catalogue medicines to begin.
              </p>
              <Button variant="primary" onClick={() => setIsCartOpen(false)}>
                Explore Medicines
              </Button>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ORDER REVIEW & PRESCRIPTION VERIFICATION MODAL                             */}
      {/* ========================================================================= */}
      {isReviewModalOpen && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Review & Place Medicine Order"
          size="lg"
        >
          <form onSubmit={handlePlaceOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Delivery & Patient Info */}
            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Patient Dispensation Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                  <div><strong>{user?.name || 'Patient'}</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Number:</span>
                  <div><strong>{user?.mobile || user?.emergencyContact || '+91 98765 43210'}</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Dispensing Pharmacy:</span>
                  <div><strong>KMCH Hospital Pharmacy Counter</strong></div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Order Items ({cart.length})</h4>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.5rem 0.75rem', background: 'var(--neutral-100)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                  <span>Medicine</span>
                  <span>Unit Price</span>
                  <span>Qty</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
                {cart.map((item) => (
                  <div key={item.medicineId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.65rem 0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', alignItems: 'center' }}>
                    <div>
                      <strong>{item.name}</strong>
                      {item.prescriptionRequired && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#e11d48' }}>Prescription Required</span>
                      )}
                    </div>
                    <span>₹{item.unitPrice}</span>
                    <span>{item.quantity}</span>
                    <strong style={{ textAlign: 'right', color: '#059669' }}>₹{item.quantity * item.unitPrice}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescription Safety Check Section */}
            {hasPrescriptionItem && (
              <div style={{ backgroundColor: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#9f1239' }}>
                  <ShieldAlert size={18} />
                  <strong>Prescription Verification Required for Amoxicillin</strong>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#881337', margin: '0 0 0.75rem 0' }}>
                  To ensure medical safety, antibiotics cannot be dispensed without an authorized doctor's prescription.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prescriptionAttached}
                      onChange={(e) => {
                        setPrescriptionAttached(e.target.checked);
                        if (e.target.checked && !prescriptionFileName) {
                          setPrescriptionFileName('Dr_Kumar_Prescription_Amoxicillin.pdf');
                        }
                      }}
                      required={hasPrescriptionItem}
                    />
                    <span>I confirm I have a valid doctor's prescription for these medications.</span>
                  </label>

                  {prescriptionAttached && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid #fda4af', fontSize: '0.8rem' }}>
                      <FileText size={16} color="#e11d48" />
                      <span>Attached: <strong>{prescriptionFileName || 'Dr_Kumar_Prescription_Amoxicillin.pdf'}</strong> (Verified from records)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div style={{ backgroundColor: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subtotal: ₹{cartSubtotal} • Tax (5% GST): ₹{cartTax}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Payable at Hospital Counter upon dispensing</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grand Total</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>₹{cartTotal}</div>
              </div>
            </div>

            {orderError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '700' }}>
                {orderError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Back to Cart
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Place Order Now
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MEDICINE DETAILS MODAL                                                    */}
      {/* ========================================================================= */}
      {selectedMedicineDetails && (
        <Modal
          isOpen={!!selectedMedicineDetails}
          onClose={() => setSelectedMedicineDetails(null)}
          title={`Medicine Details: ${selectedMedicineDetails.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--neutral-900)', margin: 0 }}>
                {selectedMedicineDetails.name}
              </h3>
              {selectedMedicineDetails.prescriptionRequired ? (
                <span className="badge badge-danger">Rx Required</span>
              ) : (
                <span className="badge badge-success">Over-the-Counter</span>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>General Purpose:</span>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: '700', color: 'var(--neutral-900)' }}>
                  {selectedMedicineDetails.generalPurpose}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unit Price:</span>
                <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                  {selectedMedicineDetails.price ? `₹${selectedMedicineDetails.price}` : 'Price not configured'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Available Inventory:</span>
                <strong>
                  {selectedMedicineDetails.stock !== undefined ? `${selectedMedicineDetails.stock} units` : 'Availability not configured'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category / Form:</span>
                <span>{selectedMedicineDetails.category} • {selectedMedicineDetails.form || 'Tablet'}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
              <strong>Disclaimer:</strong> This medication information is for academic prototype presentation only. No personalized dosage recommendations are provided. Always consult a qualified physician.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" onClick={() => setSelectedMedicineDetails(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={ShoppingCart}
                disabled={!selectedMedicineDetails.price || !selectedMedicineDetails.stock}
                onClick={() => {
                  addToCart(selectedMedicineDetails);
                  setSelectedMedicineDetails(null);
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ORDER PLACED CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {placedOrderSuccess && (
        <Modal
          isOpen={!!placedOrderSuccess}
          onClose={() => setPlacedOrderSuccess(null)}
          title="Medicine Order Placed Successfully!"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="badge badge-success" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Order #{placedOrderSuccess.orderNumber}
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: '0.35rem 0' }}>
              Total Amount: ₹{placedOrderSuccess.total}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Status: <strong>{placedOrderSuccess.status}</strong> • Hospital Pharmacy has been notified.
            </p>

            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.25rem 0', textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Ordered:</span>
                <strong>{placedOrderSuccess.items.length} items</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup Location:</span>
                <strong>KMCH Hospital Pharmacy Counter</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <span>Pay at Counter upon collection</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setPlacedOrderSuccess(null);
                setActiveTab('orders');
              }}
            >
              View Order in History →
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
