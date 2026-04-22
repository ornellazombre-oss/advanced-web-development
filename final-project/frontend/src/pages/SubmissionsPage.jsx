import { useEffect, useState } from 'react'

function SubmissionsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res  = await fetch('/api/contacts')
        const data = await res.json()
        setContacts(data)
      } catch (err) {
        setError('Failed to load submissions')
      }
      setLoading(false)
    }
    fetchContacts()
  }, [])

  return (
    <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px', fontFamily: "'Segoe UI', sans-serif" }}>
      <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px',
                  textTransform: 'uppercase', color: '#3a6fa8', marginBottom: '8px' }}>
        Database
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '32px', color: '#1a1a1a' }}>
        Submissions
      </h1>

      {loading && <p style={{ color: '#666' }}>Loading...</p>}
      {error   && <p style={{ color: '#e24b4a' }}>{error}</p>}

      {!loading && !error && contacts.length === 0 && (
        <p style={{ color: '#666' }}>No submissions yet.</p>
      )}

      {contacts.map(c => (
        <div key={c.id} style={{
          background: '#fff', border: '1px solid #e8e8e4',
          borderRadius: '12px', padding: '20px 24px',
          marginBottom: '16px',
        }}>
          <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px', color: '#1a1a1a' }}>{c.name}</p>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '2px' }}>{c.email}</p>
          <p style={{ color: '#888', fontSize: '13px' }}>Meeting date: {c.date}</p>
        </div>
      ))}
    </main>
  )
}

export default SubmissionsPage