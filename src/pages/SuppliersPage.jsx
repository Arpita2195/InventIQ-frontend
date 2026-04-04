import { useState, useEffect } from 'react'
import api from '../api/axiosInstance'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newSup, setNewSup] = useState({ name: '', contact: '', email: '', address: '', categories: [] })

  useEffect(() => { loadSuppliers() }, [])

  const loadSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers')
      setSuppliers(data)
    } finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!newSup.name || !newSup.contact) return alert('Name and Contact are required')
    await api.post('/suppliers', newSup)
    setAdding(false)
    setNewSup({ name: '', contact: '', email: '', address: '', categories: [] })
    loadSuppliers()
  }

  const handleDelete = async (id) => {
    if(window.confirm('Delete supplier? This will unmap linked products.')) {
      await api.delete(`/suppliers/${id}`)
      loadSuppliers()
    }
  }

  const s = {
    card: { background:'white', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 },
    input: { padding:'10px', borderRadius:8, border:'1px solid var(--border)', outline:'none', fontSize:14 }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700 }}>Supplier Management</h1>
          <p style={{ fontSize:13, color:'var(--muted)' }}>Map products to vendors for automatic restocking</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding:'10px 20px', borderRadius:8, background:'var(--purple)', color:'white', border:'none', cursor:'pointer', fontWeight:600 }}>+ Add Supplier</button>
      </div>

      {adding && (
        <div style={{ ...s.card, marginBottom:30, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <input placeholder="Supplier Name *" value={newSup.name} onChange={e => setNewSup({...newSup, name:e.target.value})} style={s.input} />
          <input placeholder="Contact Number *" value={newSup.contact} onChange={e => setNewSup({...newSup, contact:e.target.value})} style={s.input} />
          <input placeholder="Email Address" value={newSup.email} onChange={e => setNewSup({...newSup, email:e.target.value})} style={s.input} />
          <input placeholder="Office Address" value={newSup.address} onChange={e => setNewSup({...newSup, address:e.target.value})} style={s.input} />
           <div style={{ gridColumn:'1/-1', display:'flex', gap:8 }}>
            <button onClick={handleAdd} style={{ padding:'10px 24px', borderRadius:8, background:'var(--green)', color:'white', border:'none', cursor:'pointer', fontWeight:600 }}>Save Supplier</button>
            <button onClick={() => setAdding(false)} style={{ padding:'10px 20px', borderRadius:8, background:'white', border:'1px solid var(--border)', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p>Loading vendors...</p> : (
        <div style={s.grid}>
          {suppliers.map(sup => (
            <div key={sup._id} style={s.card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--purple)' }}>{sup.name}</div>
                <button onClick={() => handleDelete(sup._id)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--coral)', color:'var(--coral)', background:'white', fontSize:11, cursor:'pointer' }}>Delete</button>
              </div>
              <div style={{ fontSize:14, color:'var(--text)', marginBottom:4 }}>📞 {sup.contact}</div>
              {sup.email && <div style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>✉️ {sup.email}</div>}
              {sup.address && <div style={{ fontSize:13, color:'var(--muted)' }}>📍 {sup.address}</div>}
              
              <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                 <div style={{ fontSize:11, textTransform:'uppercase', color:'var(--muted)', letterSpacing:1, marginBottom:8 }}>Quick Map Categories</div>
                 <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {['Grocery', 'Dairy', 'Snacks', 'Personal Care', 'Cleaning', 'General'].map(cat => {
                        const isMapped = sup.categories?.includes(cat);
                        return (
                          <button 
                              key={cat} 
                              onClick={async () => {
                                  if (isMapped) return;
                                  await api.post('/suppliers/map-categories', { supplierId: sup._id, categories: [cat] });
                                  alert(`Success: ${cat} items mapped to ${sup.name}`);
                                  loadSuppliers();
                              }}
                              style={{ 
                                padding:'4px 10px', borderRadius:20, 
                                background: isMapped ? 'var(--purple)' : 'var(--bg)', 
                                color: isMapped ? 'white' : 'inherit',
                                border: isMapped ? '1px solid var(--purple)' : '1px solid var(--border)', 
                                fontSize:11, cursor: isMapped ? 'default' : 'pointer' 
                              }}
                          >{isMapped ? '✓' : '+'} {cat}</button>
                        );
                    })}
                 </div>
              </div>
            </div>
          ))}
          {!suppliers.length && <p style={{ color:'var(--muted)' }}>No suppliers added yet.</p>}
        </div>
      )}
    </div>
  )
}
