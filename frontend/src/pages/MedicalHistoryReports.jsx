import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  History,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Eye,
  Download,
  Building2,
  User,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Trash2,
  File,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usePatientData } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export const MedicalHistoryReports = ({ defaultTab = 'history' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState(urlTab); // 'history' | 'reports'
  const { user } = useAuth();
  const patientDisplayName = user?.name || 'Patient';

  const {
    medicalHistory,
    medicalReports,
    uploadMedicalReport,
    deleteMedicalReport
  } = usePatientData();

  // Search & Filter States for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyHospital, setHistoryHospital] = useState('ALL');
  const [historyDiagnosis, setHistoryDiagnosis] = useState('ALL');

  // Search & Filter States for Reports
  const [reportSearch, setReportSearch] = useState('');
  const [reportCategory, setReportCategory] = useState('ALL');

  // Modal States
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Upload Form State
  const fileInputRef = useRef(null);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    reportType: 'Blood Test Report',
    hospital: 'KMCH (Kovai Medical Center)',
    doctor: 'Dr. Kumar',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    fileName: '',
    fileSize: '',
    fileType: 'application/pdf',
    fileDataUrl: null
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // History filtering
  const filteredHistory = medicalHistory.filter((item) => {
    const q = historySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.diagnosis.toLowerCase().includes(q) ||
      item.doctor.toLowerCase().includes(q) ||
      item.hospital.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q);

    const matchesHospital = historyHospital === 'ALL' || item.hospital.includes(historyHospital);
    const matchesDiagnosis = historyDiagnosis === 'ALL' || item.diagnosis.toLowerCase().includes(historyDiagnosis.toLowerCase());

    return matchesSearch && matchesHospital && matchesDiagnosis;
  });

  // Reports filtering
  const filteredReports = medicalReports.filter((rep) => {
    const q = reportSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rep.name.toLowerCase().includes(q) ||
      rep.reportType.toLowerCase().includes(q) ||
      (rep.hospital && rep.hospital.toLowerCase().includes(q)) ||
      (rep.doctor && rep.doctor.toLowerCase().includes(q));

    const matchesCat = reportCategory === 'ALL' || rep.reportType === reportCategory;
    return matchesSearch && matchesCat;
  });

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (PDF and images)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and image formats (JPEG, PNG, WEBP) are supported for medical reports.');
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: fileSizeStr,
        fileType: file.type,
        fileDataUrl: reader.result,
        name: prev.name || file.name.replace(/\.[^/.]+$/, '')
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.name.trim()) {
      alert('Please enter a report name.');
      return;
    }
    if (!uploadFormData.fileName) {
      alert('Please select a PDF or image medical document to upload.');
      return;
    }

    uploadMedicalReport({
      name: uploadFormData.name,
      reportType: uploadFormData.reportType,
      hospital: uploadFormData.hospital,
      doctor: uploadFormData.doctor,
      date: uploadFormData.date,
      summary: uploadFormData.summary || 'Uploaded by patient for doctor consultation review.',
      fileName: uploadFormData.fileName,
      fileSize: uploadFormData.fileSize,
      fileType: uploadFormData.fileType,
      fileDataUrl: uploadFormData.fileDataUrl
    });

    setIsUploadModalOpen(false);
    setUploadFormData({
      name: '',
      reportType: 'Blood Test Report',
      hospital: 'KMCH (Kovai Medical Center)',
      doctor: 'Dr. Kumar',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      fileName: '',
      fileSize: '',
      fileType: 'application/pdf',
      fileDataUrl: null
    });
  };

  const handleDownload = (rep) => {
    if (rep.fileDataUrl) {
      const a = document.createElement('a');
      a.href = rep.fileDataUrl;
      a.download = rep.fileName || `${rep.name}.pdf`;
      a.click();
    } else {
      alert(`Downloading verified medical report: ${rep.fileName || rep.name}.pdf...`);
    }
  };

  const handleDeleteReport = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from your records?`)) {
      deleteMedicalReport(id);
    }
  };

  return (
    <div className="medical-history-reports-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Medical History & Medical Reports</h1>
          <p className="page-subtitle">
            Secure records of your clinical hospital visits, past diagnoses, laboratory tests & encrypted document uploads
          </p>
        </div>

        {activeTab === 'reports' && (
          <Button variant="primary" size="md" icon={UploadCloud} onClick={() => setIsUploadModalOpen(true)}>
            Upload Medical Report
          </Button>
        )}
      </div>

      {/* Privacy Guarantee Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#166534',
        fontSize: '0.875rem'
      }}>
        <Lock size={18} style={{ flexShrink: 0, color: '#15803d' }} />
        <span>
          <strong>Confidential & Private:</strong> All health history records and uploaded medical documents are strictly restricted to logged-in patient <strong>{patientDisplayName} ({user?.medicalID || 'MC-8942-021'})</strong> and authorized medical users.
        </span>
      </div>

      {/* Section Tabs: Medical History vs Medical Reports */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => handleTabChange('history')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'history' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'history' ? 'white' : 'var(--neutral-700)',
            boxShadow: activeTab === 'history' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <History size={18} />
          <span>Medical History ({medicalHistory.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'reports' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'reports' ? 'white' : 'var(--neutral-700)',
            boxShadow: activeTab === 'reports' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileSpreadsheet size={18} />
          <span>Medical Reports ({medicalReports.length})</span>
        </button>
      </div>

      {/* ======================= TAB 1: MEDICAL HISTORY ======================= */}
      {activeTab === 'history' && (
        <div className="history-tab-content fade-in">
          {/* History Filters */}
          <Card style={{ padding: '1.25rem', marginBottom: '1.75rem', backgroundColor: 'var(--neutral-50)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Search History</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search diagnosis, doctor, notes..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Hospital</label>
                <select className="form-input" value={historyHospital} onChange={(e) => setHistoryHospital(e.target.value)}>
                  <option value="ALL">All Hospitals</option>
                  <option value="KMCH">KMCH</option>
                  <option value="ABC Hospital">ABC Hospital</option>
                  <option value="MetroCare Hospital">MetroCare Hospital</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Diagnosis</label>
                <select className="form-input" value={historyDiagnosis} onChange={(e) => setHistoryDiagnosis(e.target.value)}>
                  <option value="ALL">All Diagnoses</option>
                  <option value="Fever">Fever & Infection</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Respiratory">Respiratory</option>
                </select>
              </div>
            </div>
          </Card>

          {/* History Cards */}
          {filteredHistory.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {filteredHistory.map((item) => (
                <Card key={item.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '5px solid var(--primary-600)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-info" style={{ fontWeight: '800' }}>{item.hospital}</span>
                    <span className="badge badge-success">{item.status}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                      {item.diagnosis}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--neutral-700)', margin: 0 }}>
                      Attending: <strong>{item.doctor}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Visit Date: <strong>{item.date}</strong>
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--neutral-800)', border: '1px solid var(--border-subtle)' }}>
                    <strong>Clinical Notes:</strong> {item.notes}
                  </div>

                  {item.rxCode && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} /> Linked Rx: <strong>{item.rxCode}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedHistoryItem(item)}
                      style={{ flex: 1 }}
                    >
                      View Visit Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
              <History size={40} style={{ color: 'var(--neutral-400)', marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>No History Records Match Filter</h3>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: MEDICAL REPORTS ======================= */}
      {activeTab === 'reports' && (
        <div className="reports-tab-content fade-in">
          {/* Reports Filter & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                'ALL',
                'Blood Test Report',
                'Lab Report',
                'Radiology Scan',
                'Prescription'
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setReportCategory(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: reportCategory === cat ? 'var(--primary-600)' : 'var(--surface-card)',
                    color: reportCategory === cat ? 'white' : 'var(--neutral-700)',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search reports by name, type, hospital..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {/* Medical Reports Grid */}
          {filteredReports.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {filteredReports.map((rep) => {
                const isPdf = rep.fileType?.includes('pdf') || rep.fileName?.endsWith('.pdf');
                const isImg = rep.fileType?.includes('image') || rep.fileName?.endsWith('.jpg') || rep.fileName?.endsWith('.png');

                return (
                  <Card key={rep.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '5px solid #059669', position: 'relative' }}>
                    {/* Header: Report Type & Privacy Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info" style={{ fontWeight: '800' }}>
                        {rep.reportType}
                      </span>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={11} /> Private Document
                      </span>
                    </div>

                    {/* Report Name & Hospital */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        {isPdf ? <FileText size={20} color="var(--primary-600)" /> : <ImageIcon size={20} color="#059669" />}
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', margin: 0 }}>
                          {rep.name}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        {rep.hospital} • {rep.doctor}
                      </p>
                    </div>

                    {/* Report Metadata Box */}
                    <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', fontWeight: '700' }}>UPLOAD DATE</span>
                        <strong>{rep.uploadDate}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', fontWeight: '700' }}>REPORT TYPE</span>
                        <strong>{rep.reportType}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', fontWeight: '700' }}>FORMAT & SIZE</span>
                        <span>{isPdf ? 'PDF Document' : 'Digital Image'} ({rep.fileSize || '1.5 MB'})</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem', fontWeight: '700' }}>STATUS</span>
                        <span style={{ color: '#15803d', fontWeight: '700' }}>● {rep.status || 'Verified'}</span>
                      </div>
                    </div>

                    {/* Report Summary */}
                    {rep.summary && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--neutral-700)', backgroundColor: 'var(--surface-card)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                        <strong>Diagnostic Summary:</strong> {rep.summary}
                      </div>
                    )}

                    {/* Actions: View / Download / Delete */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedReport(rep)}
                        style={{ flex: 1 }}
                      >
                        View Report
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={() => handleDownload(rep)}
                        style={{ flex: 1 }}
                      >
                        Download
                      </Button>

                      {rep.isUploaded && (
                        <button
                          onClick={() => handleDeleteReport(rep.id, rep.name)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #fecdd3',
                            background: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer'
                          }}
                          title="Delete uploaded report"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
              <FileSpreadsheet size={44} style={{ color: 'var(--neutral-400)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>No Medical Reports Found</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Upload lab reports, blood panels, scans or prescriptions in PDF/image format.
              </p>
              <Button variant="primary" size="md" icon={UploadCloud} onClick={() => setIsUploadModalOpen(true)}>
                Upload Your First Medical Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Upload Medical Report */}
      {isUploadModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Medical Report / Document"
          subtitle="Support for PDF and image medical files (JPEG, PNG, WEBP) stored privately"
        >
          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--primary-400)',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <UploadCloud size={38} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-900)', margin: '0 0 0.25rem 0' }}>
                {uploadFormData.fileName ? uploadFormData.fileName : 'Click or Drag to Upload Medical File'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', margin: 0 }}>
                {uploadFormData.fileSize ? `File Size: ${uploadFormData.fileSize}` : 'Common medical formats: PDF, JPG, PNG, WEBP (Max: 25MB)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Report Name */}
            <div className="form-group">
              <label htmlFor="rep-name">Report Name *</label>
              <input
                id="rep-name"
                type="text"
                className="form-input"
                placeholder="e.g., Complete Blood Count (CBC), Chest X-Ray PA View..."
                value={uploadFormData.name}
                onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                required
              />
            </div>

            {/* Category & Hospital */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="rep-type">Report Type *</label>
                <select
                  id="rep-type"
                  className="form-input"
                  value={uploadFormData.reportType}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, reportType: e.target.value })}
                >
                  <option value="Blood Test Report">Blood Test Report</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Radiology Scan">Radiology Scan (X-Ray / MRI / CT)</option>
                  <option value="Prescription">Prescription Document</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Other Medical Record">Other Medical Record</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rep-hospital">Hospital / Diagnostic Center</label>
                <input
                  id="rep-hospital"
                  type="text"
                  className="form-input"
                  placeholder="e.g., KMCH Hospital, ABC Lab..."
                  value={uploadFormData.hospital}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, hospital: e.target.value })}
                />
              </div>
            </div>

            {/* Doctor & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="rep-doc">Prescribing Doctor</label>
                <input
                  id="rep-doc"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Dr. Kumar"
                  value={uploadFormData.doctor}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, doctor: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rep-date">Report Date *</label>
                <input
                  id="rep-date"
                  type="date"
                  className="form-input"
                  value={uploadFormData.date}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Summary */}
            <div className="form-group">
              <label htmlFor="rep-summary">Diagnostic Summary / Patient Notes</label>
              <textarea
                id="rep-summary"
                className="form-input"
                rows={2}
                placeholder="Enter summary or doctor notes for quick reference..."
                value={uploadFormData.summary}
                onChange={(e) => setUploadFormData({ ...uploadFormData, summary: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={UploadCloud}>
                Upload & Secure in Patient Records
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: View Medical Report */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={`Medical Report: ${selectedReport.name}`}
          subtitle={`Uploaded on ${selectedReport.uploadDate} • ${selectedReport.hospital}`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            {/* Header Card */}
            <div style={{
              backgroundColor: 'var(--neutral-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>PATIENT</span>
                <strong>{patientDisplayName} ({user?.medicalID || 'MC-8942-021'})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>REPORT TYPE</span>
                <strong>{selectedReport.reportType}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>CENTER / HOSPITAL</span>
                <strong>{selectedReport.hospital}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>DOCTOR</span>
                <strong>{selectedReport.doctor}</strong>
              </div>
            </div>

            {/* Document Viewer Preview */}
            <div style={{
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}>
              {selectedReport.fileDataUrl && selectedReport.fileType?.includes('image') ? (
                <img
                  src={selectedReport.fileDataUrl}
                  alt={selectedReport.name}
                  style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <FileText size={48} color="var(--primary-600)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                    {selectedReport.fileName || `${selectedReport.name}.pdf`}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Encrypted Medical Document • {selectedReport.fileSize || '2.4 MB'}
                  </p>
                </div>
              )}

              {selectedReport.summary && (
                <div style={{ width: '100%', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.875rem', color: 'var(--neutral-800)' }}>
                  <strong>Diagnostic Findings & Clinical Summary:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>{selectedReport.summary}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Download} onClick={() => handleDownload(selectedReport)}>
                Download Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: View History Item Details */}
      {selectedHistoryItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedHistoryItem(null)}
          title={`Clinical Visit: ${selectedHistoryItem.diagnosis}`}
          subtitle={`${selectedHistoryItem.hospital} • ${selectedHistoryItem.date}`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Hospital:</strong> {selectedHistoryItem.hospital}</div>
              <div><strong>Attending Doctor:</strong> {selectedHistoryItem.doctor}</div>
              <div><strong>Visit Date:</strong> {selectedHistoryItem.date}</div>
              <div><strong>Treatment Status:</strong> <span className="badge badge-success">{selectedHistoryItem.status}</span></div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.35rem' }}>Clinical Notes & Observations:</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--neutral-700)', lineHeight: 1.6, backgroundColor: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {selectedHistoryItem.notes}
              </p>
            </div>

            {selectedHistoryItem.rxCode && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', fontSize: '0.85rem', color: 'var(--primary-900)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Prescription Generated: <strong>{selectedHistoryItem.rxCode}</strong></span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button variant="outline" onClick={() => setSelectedHistoryItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
