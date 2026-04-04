import { useState, useEffect, useRef } from 'react'
import { notificationApi } from '../api'

export default function NotificationBell() {
  const [notes, setNotes] = useState([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const dropdownRef = useRef(null)

  const fetchNotes = async () => {
    try {
      const { data } = await notificationApi.get()
      setNotes(data)
      setUnread(data.filter(n => !n.read).length)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchNotes()
    const timer = setInterval(fetchNotes, 5000) // Poll every 5s for fast Kirana updates
    return () => clearInterval(timer)
  }, [])

  const markAsRead = async (id) => {
    await notificationApi.markRead(id)
    fetchNotes()
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <style>{`
        @keyframes buzz { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .buzz-alert { animation: buzz 1s infinite; }
      `}</style>

      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          background: unread > 0 ? 'var(--purple-xl)' : 'transparent',
          border: '1px solid var(--border)',
          width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, position: 'relative', transition: 'all 0.2s'
        }}
      >
        🔔
        {unread > 0 && (
          <span className="buzz-alert" style={{ 
            position: 'absolute', top: -4, right: -4, background: 'var(--coral)',
            color: 'white', fontSize: 10, minWidth: 18, height: 18,
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, border: '2px solid white',
            boxShadow: '0 0 8px var(--coral)'
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{ 
          position: 'absolute', top: 50, right: 0, width: 320, 
          background: 'white', borderRadius: 16, border: '1px solid var(--border)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 1000,
          maxHeight: 450, overflowY: 'auto'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Notifications</span>
            <span style={{ fontSize: 10, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 20 }}>{unread} New</span>
          </div>
          
          {!notes || notes.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              ✨ No new alerts. All systems normal.
            </div>
          ) : notes.map(n => {
            if (!n) return null;
            return (
              <div 
                key={n._id} 
                onClick={() => markAsRead(n._id)}
                style={{ 
                  padding: '16px 20px', borderBottom: '1px solid var(--bg3)', 
                  background: n.read ? 'white' : 'var(--bg2)',
                  cursor: 'pointer', opacity: n.read ? 0.6 : 1,
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                   <div style={{ 
                     width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                     background: n.type === 'LOW_STOCK' ? 'var(--coral-xl)' : n.type === 'SALES_TARGET' ? 'var(--green-xl)' : n.type === 'HIGH_VALUE' ? 'var(--amber-xl)' : n.type === 'CREDIT_LIMIT' ? 'var(--coral-xl)' : 'var(--purple-xl)'
                   }}>
                     {n.type === 'LOW_STOCK' ? '📦' : n.type === 'SALES_TARGET' ? '🏆' : n.type === 'HIGH_VALUE' ? '💰' : n.type === 'CREDIT_LIMIT' ? '📍' : '🔔'}
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: 13, fontWeight: 700, 
                        color: n.type === 'LOW_STOCK' ? 'var(--coral)' : n.type === 'SALES_TARGET' ? 'var(--green)' : n.type === 'HIGH_VALUE' ? 'var(--amber)' : n.type === 'CREDIT_LIMIT' ? 'var(--coral)' : 'var(--purple)' 
                      }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      
                      {n.actionData?.waUrl ? (
                        <a 
                          href={n.actionData.waUrl} 
                          target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()} // DON'T mark as read when clicking the link, let them do it manually or separately
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            marginTop: 10, padding: '6px 12px', borderRadius: 8,
                            background: '#25D366', color: 'white', textDecoration: 'none',
                            fontSize: 11, fontWeight: 700, boxShadow: '0 4px 6px rgba(37,211,102,0.15)'
                          }}
                        >
                          📦 Order from {n.actionData.supplierName}
                        </a>
                      ) : n.type === 'LOW_STOCK' && (
                        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>💡 Link a supplier to order with 1-click</span>
                        </div>
                      )}
  
                      <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                         <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                         <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                  </div>
               </div>
             </div>
           )
         })}
       </div>
     )}
   </div>
 )
}
