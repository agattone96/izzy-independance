import React from 'react';
import { History } from 'lucide-react';
import { useBoard } from '../../../store';
import { useParentDashboardMetrics } from '../hooks/useParentDashboardMetrics';

export const ParentHistorySection: React.FC = () => {
  const { resetAllData } = useBoard();
  const { sortedLogs } = useParentDashboardMetrics();

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-md text-white" id="parent-tab-history">
      <div className="border-b border-white/10 pb-3 mb-6 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Historic Chore Operation logs
          </h3>
          <p className="text-white/60 text-xs mt-0.5">Audit trail of all approvals, point adjustments, and system events.</p>
        </div>
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to hard reset all family and user records back to default template? This cannot be undone!")) {
              resetAllData();
            }
          }}
          className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
        >
          ⚠️ Reset Entire Board & Seed Template
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3 font-bold">Family User</th>
              <th className="p-3 font-bold">Action logged</th>
              <th className="p-3 font-bold">System Description</th>
              <th className="p-3 font-bold">Specific Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedLogs.map((log) => (
              <tr key={log.id} id={`history-row-${log.id}`} className="hover:bg-white/5 font-medium transition duration-200">
                <td className="p-3 font-semibold text-teal-300">{log.userName}</td>
                <td className="p-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-white/5 px-2 py-0.5 border border-white/5 rounded">
                    {log.actionType.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-white/80">{log.description}</td>
                <td className="p-3 text-white/40 font-mono text-nowrap">
                  {new Date(log.timestamp).toLocaleDateString()} at{' '}
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
