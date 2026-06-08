// src/components/charts/CompatibilityChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompatibilityDist {
  range: string;
  count: number;
}

interface CompatibilityChartProps {
  data: CompatibilityDist[];
  height?: number;
  barColor?: string;
}

export default function CompatibilityChart({ 
  data, 
  height = 300,
  barColor = '#3b82f6' 
}: CompatibilityChartProps) {
  // Se não houver dados ou estiver vazio, mostra mensagem
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">Sem dados de compatibilidade disponíveis.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="range" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
          allowDecimals={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => [`${value} candidaturas`, 'Quantidade']}
          labelFormatter={(label) => `Compatibilidade: ${label}`}
        />
        <Bar 
          dataKey="count" 
          fill={barColor}
          radius={[4, 4, 0, 0]}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}