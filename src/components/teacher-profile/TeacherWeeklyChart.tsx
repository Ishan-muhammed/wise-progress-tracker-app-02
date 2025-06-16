
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyChartProps {
  data: Array<{
    week: string;
    completed: number;
    total: number;
  }>;
}

const TeacherWeeklyChart = ({ data }: WeeklyChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No weekly data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#039559" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#039559" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
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
            stroke="#039559" 
            strokeWidth={3}
            fill="url(#weeklyGradient)"
            dot={{ fill: '#039559', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#039559' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeacherWeeklyChart;
