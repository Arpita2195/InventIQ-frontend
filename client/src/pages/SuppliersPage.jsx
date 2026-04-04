import { useState, useEffect } from 'react'
import { supplierApi } from '../api'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', categories: '' })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supplierApi.get()
      setSuppliers(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return alert("Please fill Name and Phone!")
    
    try {
      const cats = form.categories.split(',').map(c => c.trim()).filter(Boolean)
      await supplierApi.add({ ...form, categories: cats })
      alert("Supplier added successfully!")
      setForm({ name: '', phone: '', address: '', categories: '' })
      load()
    } catch (err) {
      alert("Error adding supplier: " + (err.response?.data?.message || err.message))
    }
  }

  const openWA = (phone, name) => {
    const msg = `Hi ${name}, I'm checking in from my shop. Please let me know the stock status.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, background: 'linear-gradient(45deg, var(--purple), var(--coral))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Supplier Hub</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>Manage your supply chain and automate restock requests</p>
        </div>
        <div style={{ background: 'var(--bg2)', padding: '8px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, color: 'var(--muted2)' }}>
          🚚 {suppliers.length} Active Suppliers
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
        {/* Add Form */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--border)', height: 'fit-content' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Register New Supplier</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              placeholder="Supplier Name (e.g. Amul Hub)" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
            />
            <input 
              placeholder="WhatsApp Phone (e.g. 919876543210)" 
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
            />
            <input 
              placeholder="Supplier Address (Area/Shop Loc)" 
              value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
            />
            <textarea 
              placeholder="Categories Supplied (e.g. Dairy, Grains, Toothpaste)" 
              value={form.categories} onChange={e => setForm({...form, categories: e.target.value})}
              style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, minHeight: 60 }}
            />
            <button type="submit" style={{ 
              background: 'var(--purple)', color: 'white', border: 'none', padding: 12, borderRadius: 8, 
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>Add Supplier</button>
          </form>
        </div>

        {/* Supplier List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? <div>Loading...</div> : suppliers.map(s => (
            <div key={s._id} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>📞 {s.phone}</div>
                {s.address && <div style={{ color: 'var(--muted2)', fontSize: 11, marginTop: 2 }}>📍 {s.address}</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {s.categories.map(c => (
                    <span key={c} style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => openWA(s.phone, s.name)}
                  style={{ background: '#25D366', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >Message</button>
                <button 
                  onClick={async () => { 
                    if (window.confirm("Are you sure you want to remove this supplier?")) {
                      await supplierApi.remove(s._id); 
                      load(); 
                    }
                  }}
                  style={{ background: 'var(--coral-xl)', color: 'var(--coral)', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >Delete</button>
              </div>
            </div>
          ))}
          {!loading && suppliers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg2)', borderRadius: 16, color: 'var(--muted)' }}>
              No suppliers registered yet. Add one to enable one-click orders!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
