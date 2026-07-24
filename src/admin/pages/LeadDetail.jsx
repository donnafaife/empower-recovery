import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { getLeadById, updateLeadStatus, updateLeadNotes } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']

function formatDateTime(value) {
  return new Date(value).toLocaleString()
}

function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [lead, setLead] = useState(null)
  const [error, setError] = useState('')
  const [notesDraft, setNotesDraft] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [notesError, setNotesError] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLeadById(token, id)
      .then((result) => {
        if (cancelled) return
        setLead(result.data.lead)
        setNotesDraft(result.data.lead.notes || '')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load this lead.')
      })
    return () => {
      cancelled = true
    }
  }, [token, id])

  async function handleStatusChange(event) {
    const newStatus = event.target.value
    setSavingStatus(true)
    setStatusError('')
    try {
      const result = await updateLeadStatus(token, id, newStatus)
      setLead(result.data.lead)
    } catch (err) {
      setStatusError(err.message || 'Unable to update status.')
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    setNotesError('')
    setNotesSaved(false)
    try {
      const result = await updateLeadNotes(token, id, notesDraft)
      setLead(result.data.lead)
      setNotesSaved(true)
    } catch (err) {
      setNotesError(err.message || 'Unable to save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <button className="admin-button admin-button-ghost" type="button" onClick={() => navigate('/admin/leads')}>
            ← Back to Leads
          </button>

          <h1 className="admin-content-title">Lead Details</h1>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && !lead && <p className="admin-status-message">Loading…</p>}

          {lead && (
            <>
              <div className="admin-lead-detail-grid">
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Full Name</span>
                  <span className="admin-lead-field-value">{lead.name}</span>
                </div>
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Email</span>
                  <span className="admin-lead-field-value">{lead.email}</span>
                </div>
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Phone</span>
                  <span className="admin-lead-field-value">{lead.phone || '—'}</span>
                </div>
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Status</span>
                  <span className="admin-lead-field-value">
                    <StatusBadge status={lead.status} />
                  </span>
                </div>
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Date Submitted</span>
                  <span className="admin-lead-field-value">{formatDateTime(lead.createdAt)}</span>
                </div>
                <div className="admin-lead-field">
                  <span className="admin-lead-field-label">Last Updated</span>
                  <span className="admin-lead-field-value">{formatDateTime(lead.updatedAt)}</span>
                </div>
                <div className="admin-lead-field admin-lead-field-full">
                  <span className="admin-lead-field-label">Message</span>
                  <span className="admin-lead-field-value">{lead.message || '—'}</span>
                </div>
              </div>

              <section className="admin-section">
                <h2 className="admin-section-title">Update Status</h2>
                <select className="admin-input" value={lead.status} onChange={handleStatusChange} disabled={savingStatus}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {savingStatus && <p className="admin-status-message">Saving…</p>}
                {statusError && (
                  <p className="admin-error" role="alert">
                    {statusError}
                  </p>
                )}
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Internal Notes</h2>
                <textarea
                  className="admin-textarea"
                  value={notesDraft}
                  onChange={(event) => {
                    setNotesDraft(event.target.value)
                    setNotesSaved(false)
                  }}
                  rows={5}
                  placeholder="Private notes - never shown publicly."
                />
                <div className="admin-notes-actions">
                  <button className="admin-button" type="button" onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? 'Saving…' : 'Save Notes'}
                  </button>
                  {notesSaved && !savingNotes && <span className="admin-notes-saved">Saved.</span>}
                </div>
                {notesError && (
                  <p className="admin-error" role="alert">
                    {notesError}
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default LeadDetail
