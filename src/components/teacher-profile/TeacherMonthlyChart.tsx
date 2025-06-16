
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MonthlyChartProps {
  data: Array<{
    month: string;
    completed: number;
    total: number;
  }>;
}

const TeacherMonthlyChart = ({ data }: MonthlyChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No monthly data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              value,
              name === 'completed' ? 'Completed' : 'Total'
            ]}
            labelStyle={{ color: '#374151', fontWeight: 'medium' }}
          />
          <Area 
            type="monotone" 
            dataKey="completed" 
            stroke="#059669" 
            strokeWidth={2}
            fill="url(#monthlyGradient)"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#6b7280" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeacherMonthlyChart;
