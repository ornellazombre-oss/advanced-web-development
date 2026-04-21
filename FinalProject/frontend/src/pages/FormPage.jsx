import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  date:  z.string().min(1, 'Please select a date'),
})

function FormPage() {
  const [values, setValues]     = useState({ name: '', email: '', date: '' })
  const [errors, setErrors]     = useState({})
  const [response, setResponse] = useState(null)
  const [loading, setLoading]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const result = schema.safeParse(values)

    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach(err => {
        fieldErrors[err.path[0]] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setResponse({ error: 'Something went wrong. Please try again.' })
    }

    setLoading(false)
  }

  return (
    <main style={{
      maxWidth: '600px',
      margin: '60px auto',
      padding: '0 24px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>

      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#3a6fa8',
        marginBottom: '8px',
      }}>
        Get in touch
      </p>

      <h1 style={{
        fontSize: '30px',
        fontWeight: 700,
        marginBottom: '40px',
        color: '#1a1a1a',
      }}>
        Contact Form
      </h1>

      <form onSubmit={handleSubmit} noValidate>

        {/* Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Full name</label>
          <input
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            placeholder="Alex Morgan"
            style={{
              ...inputBase,
              borderColor: errors.name ? '#e24b4a' : '#dde8f5',
            }}
          />
          {errors.name && (
            <p style={errorStyle}>{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Email address</label>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="alex@example.com"
            style={{
              ...inputBase,
              borderColor: errors.email ? '#e24b4a' : '#dde8f5',
            }}
          />
          {errors.email && (
            <p style={errorStyle}>{errors.email}</p>
          )}
        </div>

        {/* Date */}
        <div style={{ marginBottom: '36px' }}>
          <label style={labelStyle}>Preferred meeting date</label>
          <input
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            style={{
              ...inputBase,
              borderColor: errors.date ? '#e24b4a' : '#dde8f5',
            }}
          />
          {errors.date && (
            <p style={errorStyle}>{errors.date}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#7fa8d0' : '#3a6fa8',
            color: '#fff',
            border: 'none',
            padding: '14px 36px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Sending...' : 'Send message'}
        </button>

      </form>

      {/* Response block */}
      {response && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#1a1a1a',
          }}>
            Response from server
          </h2>
          <pre style={{
            background: '#f2f6fb',
            border: '1px solid #dde8f5',
            borderRadius: '10px',
            padding: '20px',
            fontSize: '13px',
            overflowX: 'auto',
            color: '#2c2c2c',
            lineHeight: '1.6',
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

    </main>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#2c2c2c',
}

const inputBase = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '15px',
  border: '1px solid #dde8f5',
  borderRadius: '8px',
  outline: 'none',
  background: '#fff',
  color: '#2c2c2c',
  boxSizing: 'border-box',
}

const errorStyle = {
  color: '#e24b4a',
  fontSize: '13px',
  marginTop: '6px',
  fontWeight: 500,
}

export default FormPage
