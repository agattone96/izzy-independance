import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

interface ChartDataItem {
  label: string;
  Completed: number;
}

interface ChildProgressChartProps {
  id: string;
  childName: string;
  avatar: string;
  data: ChartDataItem[];
}

export const ChildProgressChart: React.FC<ChildProgressChartProps> = ({
  id,
  childName,
  avatar,
  data
}) => {
  return (
    <div className="space-y-3" id={id}>
      <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-wider block">
        📈 7-Day Chore Completion Trend
      </span>
      <div 
        className="bg-neutral-900/35 border border-white/5 rounded-2xl p-4 h-56 flex flex-col justify-between" 
        id={`${id}-inner`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 12, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#ffffff33" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis 
              stroke="#ffffff33" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                borderColor: 'rgba(255, 255, 255, 0.08)', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '10px',
                fontFamily: 'sans-serif',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            />
            <Legend 
              verticalAlign="top" 
              height={28} 
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}
            />
            <Bar 
              name={`Approved Missions (${avatar} ${childName})`} 
              dataKey="Completed" 
              fill="#818cf850" 
              stroke="#818cf8"
              strokeWidth={1}
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
