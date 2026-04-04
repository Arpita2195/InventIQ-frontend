import { useState } from 'react'
import { chatApi } from '../api'
import OfferPreviewCard from '../components/OfferPreviewCard'

const festivals = ['Diwali','Navratri','Holi','Eid','Ganesh Chaturthi','Christmas','New Year','Raksha Bandhan']

export default function OffersPage() {
  const [prompt, setPrompt] = useState('')
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async (customPrompt) => {
    const msg = customPrompt || prompt
    if (!msg) return
    setLoading(true)
    try {
      const { data } = await chatApi.send(`Generate WhatsApp offer for: ${msg}`)
      const text = data.data?.offerText || data.reply
      setOffer(text)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700 }}>Offers Generator</div>
        <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>AI-generated WhatsApp promotional messages for your customers</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Custom offer */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Custom Offer</div>
          <textarea
            value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your offer... e.g. '20% off on all vegetables today' or 'Buy 2 get 1 free on Maggi'"
            style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', fontSize:14, color:'var(--text)', outline:'none', resize:'vertical', minHeight:100, lineHeight:1.5 }}
            onFocus={e => e.target.style.borderColor='var(--coral)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <button onClick={() => generate()} disabled={loading || !prompt} style={{ marginTop:12, padding:'10px 20px', borderRadius:8, background:'var(--coral)', border:'none', color:'white', fontSize:14, fontWeight:500, opacity: loading || !prompt ? 0.6 : 1, cursor: loading || !prompt ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Generating...' : 'Generate Offer'}
          </button>
        </div>

        {/* Festival offers */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Festival Offers</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {festivals.map(f => (
              <button key={f} onClick={() => generate(`${f} special offer for my kirana store`)} disabled={loading}
                style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:13, textAlign:'left', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => { e.target.style.borderColor='var(--amber)'; e.target.style.color='var(--amber-l)' }}
                onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text)' }}
              >{f}</button>
            ))}
          </div>
        </div>
      </div>

      {offer && (
        <div style={{ marginTop:20 }}>
          <OfferPreviewCard offerText={offer} onClear={() => setOffer('')} />
        </div>
      )}

      {/* Tips */}
      <div style={{ marginTop:20, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
        <div style={{ fontSize:14, fontWeight:500, marginBottom:12 }}>Offer Ideas</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:8 }}>
          {[
            'Aaj tomato sale pe dalo', 'Weekend combo offer banao',
            'Loyalty customers ke liye special', 'Stock clearance offer',
            'Morning fresh vegetables offer', 'Bulk buy discount',
          ].map(idea => (
            <button key={idea} onClick={() => { setPrompt(idea); generate(idea) }}
              style={{ padding:'8px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:12, textAlign:'left', cursor:'pointer' }}
              onMouseEnter={e => e.target.style.color='var(--text)'}
              onMouseLeave={e => e.target.style.color='var(--muted)'}
            >{idea}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
