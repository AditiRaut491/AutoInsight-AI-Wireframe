// Dashboard charts built with Recharts.
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AXIS = { fontSize: 12, fill: '#5b6475' };

/** Cars by days in stock; the darker part of each bar is cars already past their expected range. */
export function AgeingChart({ data, height = 220 }) {
  const rows = data.map((d) => ({ ...d, within: d.cars - d.past }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 18, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#e2e7ed" vertical={false} />
        <XAxis dataKey="bucket" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e2e7ed' }} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(46,92,154,.06)' }}
          formatter={(v, name) => [v, name === 'past' ? 'Past expected range' : 'Within expected range']}
          labelFormatter={(l) => `${l} days in stock`}
        />
        <Bar dataKey="within" stackId="a" fill="#d6e4f5" stroke="#8fb0d9" isAnimationActive={false} />
        <Bar dataKey="past" stackId="a" fill="#b4534a" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="cars" position="top" style={{ fontSize: 12, fill: '#1f2a44', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Simple monthly trend line. */
export function TrendChart({ data, dataKey, color, domain, suffix = '' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 20, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#e2e7ed" vertical={false} />
        <XAxis dataKey="month" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e2e7ed' }} />
        <YAxis domain={domain} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v) => [`${v}${suffix}`, '']} separator="" />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.4} dot={{ r: 3.5, fill: color }} isAnimationActive={false}>
          <LabelList dataKey={dataKey} position="top" content={({ x, y, value, index }) => (index === data.length - 1 ? <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>{value}{suffix}</text> : null)} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Mini horizontal bars used in chatbot answers. */
export function MiniBars({ data, height = 150 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="bucket" tick={AXIS} tickLine={false} axisLine={false} width={52} />
        <Bar dataKey="cars" isAnimationActive={false} radius={[0, 3, 3, 0]}>
          {data.map((d) => <Cell key={d.bucket} fill={d.past ? '#8fb0d9' : '#d6e4f5'} />)}
          <LabelList dataKey="cars" position="right" style={{ fontSize: 12, fill: '#1f2a44', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
