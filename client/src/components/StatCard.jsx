export default function StatCard({ label, value, sub, accent = '#6D28D9', accentBg = '#EDE9FE' }) {
  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12,
      padding:'20px', position:'relative', overflow:'hidden',
      boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent, borderRadius:'12px 12px 0 0' }} />
      <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:8, background:accentBg, marginBottom:10 }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:accent }} />
      </div>
      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:500 }}>{label}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, color:'var(--text)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--muted2)', marginTop:6 }}>{sub}</div>}
    </div>
  )
}
