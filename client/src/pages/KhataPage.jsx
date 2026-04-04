import { useState, useEffect } from 'react'
import { customerApi } from '../api'

export default function KhataPage() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [udharForm, setUdharForm] = useState({ amount: '', type: 'borrow', note: '' })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await customerApi.get()
      setCustomers(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    await customerApi.add(form)
    setForm({ name: '', phone: '' })
    load()
  }

  const handleUdharUpdate = async (e) => {
    e.preventDefault()
    if (!selected) return
    await customerApi.updateUdhar(selected._id, udharForm)
    setUdharForm({ amount: '', type: 'borrow', note: '' })
    const { data } = await customerApi.get()
    setCustomers(data)
    setSelected(data.find(c => c._id === selected._id))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'fadeIn 0.5s' }}>
      <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--purple)' }}>Khata Book</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Track customer credit (Udhar) and repayments</p>
        </div>
        <div style={{ background: 'var(--coral-xl)', color: 'var(--coral)', padding: '10px 20px', borderRadius: 12, fontWeight: 700 }}>
          Total Udhar: ₹{customers.reduce((acc, c) => acc + c.udharBalance, 0).toLocaleString()}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
        {/* Left: Customer List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>New Customer</h3>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Customer Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              <button type="submit" style={{ background: 'var(--purple)', color: 'white', border: 'none', padding: 12, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Add to Khata</button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
             {customers.map(c => (
               <div 
                key={c._id} 
                onClick={() => setSelected(c)}
                style={{ 
                  background: selected?._id === c._id ? 'var(--purple-xl)' : 'white', 
                  padding: 16, borderRadius: 12, border: '1px solid ' + (selected?._id === c._id ? 'var(--purple)' : 'var(--border)'),
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
               >
                 <div style={{ fontWeight: 700 }}>{c.name}</div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
                   <span style={{ color: 'var(--muted)' }}>{c.phone}</span>
                   <span style={{ color: c.udharBalance > 0 ? 'var(--coral)' : 'var(--green)', fontWeight: 700 }}>₹{c.udharBalance}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Right: History & Action */}
        <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid var(--border)', minHeight: 600 }}>
          {selected ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>{selected.name}'s History</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => window.open(`https://wa.me/${selected.phone}?text=${encodeURIComponent(`Hi ${selected.name}, your current Udhar balance at InventIQ is ₹${selected.udharBalance}. Please clear it when possible!`)}`)} style={{ background: '#25D366', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Share on WhatsApp</button>
                </div>
              </div>

              <form onSubmit={handleUdharUpdate} style={{ display: 'flex', gap: 12, marginBottom: 32, background: 'var(--bg2)', padding: 20, borderRadius: 12 }}>
                <select value={udharForm.type} onChange={e => setUdharForm({...udharForm, type: e.target.value})} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <option value="borrow">Give Udhar (-)</option>
                  <option value="repay">Recieve Payment (+)</option>
                </select>
                <input type="number" placeholder="Amount" value={udharForm.amount} onChange={e => setUdharForm({...udharForm, amount: e.target.value})} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', flex: 1 }} />
                <input placeholder="Note (Batch 1, Paid partial...)" value={udharForm.note} onChange={e => setUdharForm({...udharForm, note: e.target.value})} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', flex: 2 }} />
                <button type="submit" style={{ background: 'var(--purple)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Update</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selected.history.slice().reverse().map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--bg3)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: h.type === 'borrow' ? 'var(--coral)' : 'var(--green)' }}>{h.type === 'borrow' ? 'Borrowed' : 'Repaid'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{h.note || 'No note'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₹{h.amount}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{new Date(h.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48 }}>📒</div>
              <div style={{ fontSize: 16 }}>Select a customer to view their Khata history</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
