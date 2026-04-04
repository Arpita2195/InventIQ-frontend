import { useEffect, useState } from 'react'
import { chatApi } from '../api'
import SalesChart from '../components/SalesChart'

export default function ReportsPage() {
  const [days, setDays] = useState(7)
  const [report, setReport] = useState({ daily:[], topItems:[], totalRevenue:0 })
  const [loading, setLoading] = useState(true)

  const load = async (d) => { setLoading(true); try { const { data } = await chatApi.getReports(d); setReport(data) } catch(e){} finally { setLoading(false) } }
  useEffect(() => { load(days) }, [days])

  const totalSales = report.daily?.reduce((a,d) => a + d.sales, 0) || 0

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700, color:'var(--text)' }}>Sales Reports</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Sales trends and business insights</div>
        </div>
        <div style={{ display:'flex', gap:6, background:'white', border:'1px solid var(--border)', borderRadius:8, padding:4, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          {[7,14,30].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:500,
              background: days===d ? 'var(--purple)' : 'transparent',
              border: 'none', color: days===d ? 'white' : 'var(--muted)', cursor:'pointer',
            }}>{d} days</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Revenue', value:`₹${(report.totalRevenue||0).toLocaleString()}`, color:'var(--green)', bg:'var(--green-xl)' },
          { label:'Units Sold', value:totalSales, color:'var(--purple)', bg:'var(--purple-xl)' },
          { label:'Products Tracked', value:report.topItems?.length || 0, color:'var(--amber)', bg:'var(--amber-xl)' },
        ].map(s => (
          <div key={s.label} style={{ background:'white', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width:36, height:36, borderRadius:8, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:s.color }}/>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>{s.label}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, color:s.color, marginTop:4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:20 }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--muted)', background:'white', borderRadius:12, border:'1px solid var(--border)' }}>Loading...</div> : <SalesChart data={report.daily} />}
      </div>

      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:'var(--text)' }}>Top Selling Items</div>
        {!report.topItems?.length
          ? <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'24px 0', background:'var(--bg3)', borderRadius:8 }}>No sales recorded yet. Update stock via AI Chat!</div>
          : report.topItems.map((item, i) => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom: i < report.topItems.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'var(--purple-xl)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:'var(--purple)', flexShrink:0 }}>#{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{item.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{item.qty} units sold</div>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--amber)' }}>₹{item.revenue.toLocaleString()}</div>
              <div style={{ width:80, height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'var(--purple)', borderRadius:3, width:`${Math.min(100,(item.qty/(report.topItems[0]?.qty||1))*100)}%` }}/>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
