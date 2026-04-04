import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

// Sample yearly data - in production, this would come from API
const generateYearlyData = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 2; i >= 0; i--) {
    years.push(currentYear - i);
  }
  
  return years.map(year => ({
    year: year.toString(),
    sales: Math.floor(Math.random() * 500000) + 100000,
    profit: Math.floor(Math.random() * 150000) + 20000,
    expenses: Math.floor(Math.random() * 100000) + 30000,
    growth: Math.floor(Math.random() * 45) - 10,
  }));
};

export default function YearlyComparison() {
  const data = generateYearlyData();
  
  const stats = [
    {
      label: 'Total Sales (All Years)',
      value: `₹${data.reduce((a, y) => a + y.sales, 0).toLocaleString()}`,
      color: 'var(--purple)',
    },
    {
      label: 'Total Profit',
      value: `₹${data.reduce((a, y) => a + y.profit, 0).toLocaleString()}`,
      color: 'var(--green)',
    },
    {
      label: 'Average Growth',
      value: `${(data.reduce((a, y) => a + y.growth, 0) / data.length).toFixed(1)}%`,
      color: 'var(--amber)',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text)' }}>Year {data.year}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ margin: 4, fontSize: 12, color: p.color }}>
              {p.name}: ₹{p.value.toLocaleString()}
            </p>
          ))}
          {data.growth && (
            <p style={{ margin: 4, fontSize: 12, color: data.growth > 0 ? 'var(--green)' : 'var(--coral)' }}>
              Growth: {data.growth > 0 ? '+' : ''}{data.growth}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Combined Chart */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
          📊 Yearly Sales & Profit Comparison
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <YAxis yAxisId="right" stroke="var(--muted)" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sales" fill="#6D28D9" name="Sales" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[8, 8, 0, 0]} />
            <Line type="monotone" dataKey="growth" stroke="#F59E0B" name="Growth %" strokeWidth={2} dot={{ fill: '#F59E0B', r: 5 }} yAxisId="right" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sales vs Expenses */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
          💰 Sales vs Expenses Trend
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#6D28D9" strokeWidth={3} name="Sales" dot={{ fill: '#6D28D9', r: 6 }} />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Expenses" dot={{ fill: '#EF4444', r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Summary Table */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
          📈 Yearly Summary
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Year', 'Sales', 'Expenses', 'Profit', 'Growth', 'Profit %'].map(h => (
                <th key={h} style={{
                  padding: '10px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.year} style={{ borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text)' }}>{row.year}</td>
                <td style={{ padding: '8px', color: 'var(--purple)' }}>₹{row.sales.toLocaleString()}</td>
                <td style={{ padding: '8px', color: 'var(--coral)' }}>₹{row.expenses.toLocaleString()}</td>
                <td style={{ padding: '8px', color: 'var(--green)', fontWeight: 600 }}>₹{row.profit.toLocaleString()}</td>
                <td style={{
                  padding: '8px',
                  color: row.growth > 0 ? 'var(--green)' : 'var(--coral)',
                  fontWeight: 600,
                }}>
                  {row.growth > 0 ? '📈 +' : '📉 '}{row.growth}%
                </td>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--amber)' }}>
                  {((row.profit / row.sales) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
