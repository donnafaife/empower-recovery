import { useState } from 'react'
import { createLead, ApiError } from '../services/api'

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  website: '', // honeypot - real visitors never see or fill this in
}

function ContactForm() {
  const [formData, setFormData] = useState(initialFormData)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success'

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setFormError('')
    setFieldErrors({})

    try {
      await createLead(formData)
      setStatus('success')
    } catch (error) {
      setStatus('idle')
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.details || {})
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="booking-confirm" role="status">
        <h3 className="confirm-title">Thank you!</h3>
        <p className="confirm-copy">We&apos;ve received your message and will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        Name *
        <input
          className="form-input"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
        />
      </label>
      {fieldErrors.name && (
        <p className="field-error" id="contact-name-error" role="alert">
          {fieldErrors.name[0]}
        </p>
      )}

      <label className="field">
        Email *
        <input
          className="form-input"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
        />
      </label>
      {fieldErrors.email && (
        <p className="field-error" id="contact-email-error" role="alert">
          {fieldErrors.email[0]}
        </p>
      )}

      <label className="field">
        Phone (optional)
        <input
          className="form-input"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
        />
      </label>
      {fieldErrors.phone && (
        <p className="field-error" id="contact-phone-error" role="alert">
          {fieldErrors.phone[0]}
        </p>
      )}

      <label className="field">
        Message (optional)
        <textarea
          className="form-input form-textarea"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
        />
      </label>
      {fieldErrors.message && (
        <p className="field-error" id="contact-message-error" role="alert">
          {fieldErrors.message[0]}
        </p>
      )}

      {/*
        Honeypot field: invisible to sighted users (positioned off-screen)
        and skipped by screen readers (aria-hidden + tabIndex -1). Spam bots
        that blindly fill every input will populate it; the backend uses
        that as a signal to silently discard the submission.
      */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {formError && (
        <p className="field-error" role="alert">
          {formError}
        </p>
      )}

      <button className="btn-submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

export default ContactForm
