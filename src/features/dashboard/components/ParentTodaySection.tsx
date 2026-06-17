import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useBoard } from '../../../store';
import { useParentDashboardMetrics } from '../hooks/useParentDashboardMetrics';

export const ParentTodaySection: React.FC = () => {
  const { 
    tasks, 
    reviewTaskByParent, 
    getPointsMetrics 
  } = useBoard();

  const { pendingCompletions, childrenUsers } = useParentDashboardMetrics();

  // Feedback States (Needs feedback)
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [needsFixFeedback, setNeedsFixFeedback] = useState('');
  const [processingReviewId, setProcessingReviewId] = useState<string | null>(null);

  const triggerNeedsFix = async (completionId: string) => {
    if (!needsFixFeedback.trim()) {
      alert("Please provide some encouraging feedback so your child knows exactly what to fix!");
      return;
    }
    setProcessingReviewId(completionId);
    await reviewTaskByParent(completionId, 'needs_fix', needsFixFeedback);
    setActiveReviewId(null);
    setNeedsFixFeedback('');
    setProcessingReviewId(null);
  };

  const handleApprove = async (completionId: string) => {
    setProcessingReviewId(completionId);
    await reviewTaskByParent(completionId, 'approved');
    setProcessingReviewId(null);
  };

  return (
    <div className="space-y-8" id="parent-tab-today">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Pending actions pane */}
        <div className="lg:col-span-12 space-y-6" id="today-pending-pane">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-400" /> Pending Child Certifications ({pendingCompletions.length})
            </h3>
            <p className="text-white/60 text-xs mt-0.5">Review submissions from children; marking "Needs a fix" holds points until corrected, helping build consistent daily responsibility.</p>
          </div>

          {pendingCompletions.length === 0 ? (
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center" id="pending-empty-state">
              <CheckCircle className="w-10 h-10 text-teal-400 mx-auto mb-2 animate-pulse" />
              <h4 className="font-bold text-white text-sm">Perfect Slate!</h4>
              <p className="text-white/50 text-xs mt-0.5">No tasks are currently waiting for parental review. Encourage children to log chores!</p>
            </div>
          ) : (
            <div className="space-y-4" id="pending-list-grid">
              {pendingCompletions.map((comp) => {
                const matchedTask = tasks.find(t => t.id === comp.taskId || t.key === comp.taskKey);
                
                return (
                  <div 
                    key={comp.id} 
                    id={`review-item-${comp.id}`}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 transition duration-300 hover:border-white/20 text-white backdrop-blur-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/10 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
                          {comp.childName}
                        </span>
                        <h4 className="font-extrabold text-white text-sm mt-1">{matchedTask?.title || comp.taskKey}</h4>
                        <p className="text-white/60 text-xs font-semibold">{matchedTask?.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-extrabold text-teal-400 text-sm block">+{comp.pointsEarned} pt</span>
                      </div>
                    </div>

                    {/* Interactive checklist logs */}
                    {matchedTask && matchedTask.checklistItems.length > 0 && (
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Checked Off list:</span>
                        <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-white/95">
                          {matchedTask.checklistItems.map((item, id) => {
                            const checked = comp.checklistState?.[id] ?? true;
                            return (
                              <div key={id} className="flex gap-1.5 items-center">
                                <span className="grow-0 shrink-0">
                                  {checked ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  )}
                                </span>
                                <span className={checked ? 'font-semibold text-white/90' : 'text-white/30 line-through font-medium'}>
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end pt-3 border-t border-white/10">
                      {activeReviewId === comp.id ? (
                        <div className="w-full space-y-2 text-left" id={`review-feedback-prompt-${comp.id}`}>
                          <label className="text-[10px] font-bold text-rose-300 block uppercase">
                            Action Encouragement feedback (Instructions to fix):
                          </label>
                          <textarea
                            value={needsFixFeedback}
                            onChange={(e) => setNeedsFixFeedback(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-white/20 font-medium"
                            placeholder="E.g., Honey, remember to clean and scoop the litter completely. Try again!"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setActiveReviewId(null); setNeedsFixFeedback(''); }}
                              className="text-[10px] uppercase font-bold text-white/50 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={processingReviewId === comp.id}
                              onClick={() => triggerNeedsFix(comp.id)}
                              className="text-[10px] uppercase font-bold bg-rose-500/20 border border-rose-500/30 text-rose-303 px-3.5 py-1.5 rounded-lg hover:bg-rose-505/30 shadow-md cursor-pointer active:scale-95 transition disabled:opacity-50"
                            >
                              {processingReviewId === comp.id ? 'Processing...' : 'Flag as "Needs a Fix" 🛠️'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setActiveReviewId(comp.id); setNeedsFixFeedback(''); }}
                            className="text-xs font-bold text-rose-303 border border-white/10 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer animate-fade-in"
                          >
                            🛠️ Needs a Fix...
                          </button>
                          <button
                            disabled={processingReviewId === comp.id}
                            onClick={() => handleApprove(comp.id)}
                            className="text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer active:scale-95 text-nowrap disabled:opacity-50"
                          >
                            {processingReviewId === comp.id ? 'Approving...' : 'Approve Chore & Verify 🌟'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
