import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { khataApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function KhataDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTx, setNewTx] = useState({ amount: '', type: 'CREDIT', note: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [c, t] = await Promise.all([
        khataApi.getCustomer(id),
        khataApi.getTransactions(id)
      ])
      setCustomer(c.data)
      setTransactions(t.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await khataApi.addTransaction({
        customerId: id,
        ...newTx,
        amount: Number(newTx.amount)
      })
      
      const lastTx = { ...newTx, amount: Number(newTx.amount), date: new Date() }
      const newBal = newTx.type === 'CREDIT' ? customer.balance + Number(newTx.amount) : customer.balance - Number(newTx.amount)
      
      setNewTx({ amount: '', type: 'CREDIT', note: '' })
      setShowAdd(false)
      loadData()
      
      // Auto-open WhatsApp on success
      sendWhatsApp(lastTx, newBal)
    } catch (e) {
      alert(e.response?.data?.message || 'Error processing transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const sendWhatsApp = (tx, balance) => {
    const msg = `Hello ${customer.name},
Your transaction of ₹${tx.amount} has been recorded at ${user?.shopName}.
Type: ${tx.type === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment Received'}
Remaining Balance: ₹${balance}
Thank you!`.trim()
    
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/${customer.phone}?text=${encoded}`, '_blank')
  }

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found.</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/khata')} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginBottom: 16 }}>← Back to Khata Book</button>
      
      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--border)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{customer.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{customer.phone}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Balance Due</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: customer.balance > 0 ? 'var(--coral)' : 'var(--teal)' }}>₹{customer.balance.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Transaction History</h2>
        <button 
          onClick={() => setShowAdd(true)}
          style={{ padding: '8px 16px', background: 'var(--purple)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
        >
          + New Entry
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No transactions yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Date</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Notes</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Type</th>
                <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <td style={{ padding: '14px 20px' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{t.note || '-'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, 
                      background: t.type === 'CREDIT' ? 'var(--coral-xl)' : 'var(--teal-xl)',
                      color: t.type === 'CREDIT' ? 'var(--coral)' : 'var(--teal)'
                    }}>
                      {t.type === 'CREDIT' ? 'Credit (Udhari)' : 'Payment (In)'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600, color: t.type === 'CREDIT' ? 'var(--coral)' : 'var(--teal)' }}>
                    {t.type === 'CREDIT' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Record Transaction</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>This will update the balance and send a receipt.</p>
            <form onSubmit={handleAddTransaction}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Transaction Type</label>
                <select 
                  value={newTx.type} 
                  onChange={e => setNewTx({...newTx, type: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                >
                  <option value="CREDIT">Got (Udhaar/Credit)</option>
                  <option value="PAYMENT">Received (Payment/Settlement)</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Amount (₹)</label>
                <input 
                  required 
                  type="number" 
                  value={newTx.amount} 
                  onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  placeholder="e.g. 500"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Note (Optional)</label>
                <input 
                  type="text" 
                  value={newTx.note} 
                  onChange={e => setNewTx({...newTx, note: e.target.value})}
                  placeholder="Reason for entry..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--purple)', color: 'white', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Recording...' : 'Add & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
