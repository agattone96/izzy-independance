import React from 'react';
import { 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useCSVImport } from './useCSVImport';

export const CSVImportSection: React.FC = () => {
  const {
    taskFile,
    rewardFile,
    taskPreview,
    rewardPreview,
    taskErrors,
    rewardErrors,
    taskImportMode,
    setTaskImportMode,
    rewardImportMode,
    setRewardImportMode,
    importResult,
    taskInputRef,
    rewardInputRef,
    downloadTaskTemplate,
    downloadRewardTemplate,
    handleTaskUploadChange,
    handleRewardUploadChange,
    confirmTaskImport,
    confirmRewardImport,
  } = useCSVImport();

  return (
    <div className="space-y-10" id="csv-import-viewport">
      {/* Overview Block */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start backdrop-blur-md" id="csv-intro">
        <div className="p-3 bg-white/10 rounded-xl shadow-lg border border-white/10 text-teal-350 shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Bulk Setup & Synchronization Panel</h3>
          <p className="text-white/60 text-sm mt-1 max-w-2xl leading-relaxed">
            Easily seed, update, or completely initialize categories of challenges, chores, and rewards! Download the provided templates below, fill columns with editing tools (Excel/Sheets), and upload.
          </p>
        </div>
      </div>

      {importResult && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-250 rounded-xl flex items-center gap-3 shadow-lg" id="import-notification">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">
            Import Complete! Successfully synchronized <strong>{importResult.count} {importResult.type}</strong> into your live database.
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8" id="csv-twin-sections">
        
        {/* Section: Chores Chores Tasks */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-md" id="csv-tasks-card">
          <div>
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-teal-300 uppercase bg-teal-500/15 border border-teal-500/20 px-2.5 py-1 rounded-md">
                  CHORES SETUP
                </span>
                <h4 className="font-extrabold text-white text-lg mt-1">Schedule Tasks CSV</h4>
              </div>
              <button 
                onClick={downloadTaskTemplate}
                className="text-xs bg-white/10 border border-white/10 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white/15 transition duration-200"
                title="Download task CSV example template file"
              >
                <Download className="w-4 h-4" /> Template
              </button>
            </div>

            <p className="text-white/50 text-xs mb-4 leading-relaxed">
              Columns strictly required: <code className="bg-white/5 p-0.5 text-rose-300 font-mono text-[10px] rounded border border-white/5">task_key, title, Category, point_value...</code> Checklist items can be bundled separating texts with vertical pipe (|) symbol.
            </p>

            <div className="space-y-4">
              <label className="border border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer block hover:border-white/40 hover:bg-white/5 transition duration-200">
                <input 
                  type="file" 
                  accept=".csv"
                  ref={taskInputRef}
                  onChange={handleTaskUploadChange}
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <span className="text-xs font-semibold text-white/80 block">
                  {taskFile ? taskFile.name : "Select or Drop Tasks CSV"}
                </span>
                <span className="text-[10px] text-white/40 block mt-1">.csv format only</span>
              </label>

              {taskErrors.length > 0 && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> validation failed (Fix errors to upload):
                  </span>
                  <ul className="list-disc pl-5 text-[10px] text-rose-300 space-y-1 font-mono">
                    {taskErrors.slice(0, 5).map((e, idx) => <li key={idx}>{e}</li>)}
                    {taskErrors.length > 5 && <li>...and {taskErrors.length - 5} more issues.</li>}
                  </ul>
                </div>
              )}

              {taskPreview.length > 0 && taskErrors.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-350 shrink-0" />
                    <span className="text-xs text-emerald-250 font-medium">Valid CSV Schema decoded! Ready to merge {taskPreview.length} objects.</span>
                  </div>

                  {/* Mode Option */}
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex gap-4 text-xs font-semibold text-white/95">
                    <label className="flex items-center gap-1.5 cursor-pointer text-white/80">
                      <input 
                        type="radio" 
                        name="taskMode" 
                        checked={taskImportMode === 'update'}
                        onChange={() => setTaskImportMode('update')}
                        className="text-teal-400"
                      /> Sync & Merge (Keep Existing)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-white/80">
                      <input 
                        type="radio" 
                        name="taskMode" 
                        checked={taskImportMode === 'overwrite'}
                        onChange={() => setTaskImportMode('overwrite')}
                        className="text-rose-450"
                      /> Overwrite All Board
                    </label>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto max-h-48 border border-white/10 rounded-lg">
                    <table className="w-full text-[10px] text-white/90 font-sans">
                      <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                        <tr className="border-b border-white/10">
                          <th className="p-1 px-2 text-left uppercase text-white/40 font-bold">Key</th>
                          <th className="p-1 px-2 text-left uppercase text-white/40 font-bold">Title</th>
                          <th className="p-1 px-2 text-center uppercase text-white/40 font-bold">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent">
                        {taskPreview.map((tp, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-1 px-2 font-mono font-bold text-teal-350">{tp.key}</td>
                            <td className="p-1 px-2 font-medium truncate max-w-[120px]">{tp.title}</td>
                            <td className="p-1 px-2 text-center font-bold text-amber-350">{tp.pointValue} pt</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={confirmTaskImport}
              disabled={taskPreview.length === 0 || taskErrors.length > 0}
              className="w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer bg-teal-500/25 text-teal-300 border border-teal-500/30 hover:bg-teal-500/35"
            >
              Confirm Task Upload & Sync <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section: Rewards Rewards Cabinets */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-md" id="csv-rewards-card">
          <div>
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-350 uppercase bg-indigo-505/15 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                  REWARDS SEED
                </span>
                <h4 className="font-extrabold text-white text-lg mt-1">Rewards Cabinet CSV</h4>
              </div>
              <button 
                onClick={downloadRewardTemplate}
                className="text-xs bg-white/10 border border-white/10 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white/15 transition duration-200"
              >
                <Download className="w-4 h-4" /> Template
              </button>
            </div>

            <p className="text-white/50 text-xs mb-4 leading-relaxed">
              Columns strictly required: <code className="bg-white/5 p-0.5 text-rose-300 font-mono text-[10px] rounded border border-white/5">reward_key, title, category, point_cost, boundary...</code> Categories allowed: small, medium, weekly, saved_up.
            </p>

            <div className="space-y-4">
              <label className="border border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer block hover:border-white/40 hover:bg-white/5 transition duration-200">
                <input 
                  type="file" 
                  accept=".csv"
                  ref={rewardInputRef}
                  onChange={handleRewardUploadChange}
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <span className="text-xs font-semibold text-white/80 block">
                  {rewardFile ? rewardFile.name : "Select or Drop Rewards CSV"}
                </span>
                <span className="text-[10px] text-white/40 block mt-1">.csv format only</span>
              </label>

              {rewardErrors.length > 0 && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> validation failed (Fix errors to upload):
                  </span>
                  <ul className="list-disc pl-5 text-[10px] text-rose-300 space-y-1 font-mono">
                    {rewardErrors.slice(0, 5).map((e, idx) => <li key={idx}>{e}</li>)}
                    {rewardErrors.length > 5 && <li>...and {rewardErrors.length - 5} more issues.</li>}
                  </ul>
                </div>
              )}

              {rewardPreview.length > 0 && rewardErrors.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-355 shrink-0" />
                    <span className="text-xs text-emerald-250 font-medium">Valid CSV Schema decoded! Ready to merge {rewardPreview.length} items.</span>
                  </div>

                  {/* Mode Option */}
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex gap-4 text-xs font-semibold text-white/95">
                    <label className="flex items-center gap-1.5 cursor-pointer text-white/80">
                      <input 
                        type="radio" 
                        name="rewardMode" 
                        checked={rewardImportMode === 'update'}
                        onChange={() => setRewardImportMode('update')}
                        className="text-teal-400"
                      /> Sync & Merge (Keep Existing)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-white/80">
                      <input 
                        type="radio" 
                        name="rewardMode" 
                        checked={rewardImportMode === 'overwrite'}
                        onChange={() => setRewardImportMode('overwrite')}
                        className="text-rose-450"
                      /> Overwrite List
                    </label>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto max-h-48 border border-white/10 rounded-lg">
                    <table className="w-full text-[10px] text-white/90 font-sans">
                      <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                        <tr className="border-b border-white/10">
                          <th className="p-1 px-2 text-left uppercase text-white/40 font-bold">Key</th>
                          <th className="p-1 px-2 text-left uppercase text-white/40 font-bold">Title</th>
                          <th className="p-1 px-2 text-center uppercase text-white/40 font-bold">Cost</th>
                          <th className="p-1 px-2 text-center uppercase text-white/40 font-bold">Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent">
                        {rewardPreview.map((rp, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-1 px-2 font-mono font-bold text-teal-300">{rp.key}</td>
                            <td className="p-1 px-2 truncate font-medium max-w-[120px]">{rp.title}</td>
                            <td className="p-1 px-2 text-center font-bold text-amber-350">{rp.pointCost} pt</td>
                            <td className="p-1 px-2 text-center uppercase text-white/40 font-bold">{rp.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={confirmRewardImport}
              disabled={rewardPreview.length === 0 || rewardErrors.length > 0}
              className="w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer bg-indigo-500/25 text-indigo-350 border border-indigo-500/30 hover:bg-indigo-500/35"
            >
              Confirm Reward Upload & Cabinet Sync <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
