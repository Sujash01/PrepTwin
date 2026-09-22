import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '../../utils/helpers'

export interface PerformancePoint {
  question: string
  score: number
  label?: string
}

interface PerformanceChartProps {
  data: PerformancePoint[]
  className?: string
  variant?: 'line' | 'area'
  showGrid?: boolean
  height?: number
}

export function PerformanceChart({ data, className, variant = 'area', showGrid = true, height = 280 }: PerformanceChartProps) {
  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(51, 65, 85, 0.8)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  }

  const CustomizedDot = ({ cx, cy, value }: { cx?: number; cy?: number; value?: number }) => {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={value && value >= 8 ? '#22c55e' : value && value >= 6 ? '#f59e0b' : '#ef4444'}
        stroke="#0f172a"
        strokeWidth={2}
      />
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {variant === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
            )}
            <XAxis
              dataKey="question"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.6)' }}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => value.toFixed(1)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#38bdf8' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              formatter={(value) => [`${Number(value).toFixed(1)} / 10`, 'Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={CustomizedDot}
              activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2 }}
              animationDuration={1200}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
            )}
            <XAxis
              dataKey="question"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.6)' }}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#38bdf8' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              formatter={(value) => [`${Number(value).toFixed(1)} / 10`, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={CustomizedDot}
              activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2 }}
              animationDuration={1200}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}