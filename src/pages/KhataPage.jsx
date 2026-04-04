import { useState, useEffect } from 'react'
import { khataApi } from '../api'
import { Link } from 'react-router-dom'

export default function KhataPage() {
  const [customers, setCustomers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newCust, setNewCust] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const { data } = await khataApi.getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await khataApi.addCustomer(newCust)
      setNewCust({ name: '', phone: '' })
      setShowAdd(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Error adding customer')
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  const totalUdhar = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>📖 Khata Book</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Manage customer credit and payments</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          style={{ padding: '10px 20px', background: 'var(--purple)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Customer
        </button>
      </div>

      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Total Customers</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{customers.length}</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Total Udhaar (Credit)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--coral)' }}>₹{totalUdhar.toLocaleString()}</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Total Paid</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)' }}>₹{customers.reduce((acc, c) => acc + c.totalPaid, 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Customer</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Total Credit</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Total Paid</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Balance</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No customers found.</td>
              </tr>
            ) : filtered.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.phone}</div>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text)', fontSize: 14 }}>₹{c.totalCredit.toLocaleString()}</td>
                <td style={{ padding: '16px 20px', color: 'var(--text)', fontSize: 14 }}>₹{c.totalPaid.toLocaleString()}</td>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: c.balance > 0 ? 'var(--coral)' : 'var(--teal)', fontSize: 14 }}>
                  ₹{c.balance.toLocaleString()}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <Link 
                    to={`/khata/${c._id}`}
                    style={{ color: 'var(--purple)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Add New Customer</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Create a new khata profile for a regular customer.</p>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Customer Name</label>
                <input 
                  required 
                  type="text" 
                  value={newCust.name} 
                  onChange={e => setNewCust({...newCust, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Mobile Number</label>
                <input 
                  required 
                  type="text" 
                  value={newCust.phone} 
                  onChange={e => setNewCust({...newCust, phone: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--purple)', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
