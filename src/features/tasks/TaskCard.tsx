import React from 'react';
import { Task, TaskCompletion } from '../../types/domain.types';
import { CheckCircle, Clock, AlertCircle, Edit, Trash } from 'lucide-react';

interface TaskCardProps {
  id: string;
  task: Task;
  role: 'child' | 'parent';
  completion?: TaskCompletion;
  checklistState?: { [itemIndex: number]: boolean };
  onCheckItem?: (taskId: string, idx: number) => void;
  onComplete?: (task: Task) => void;
  onFix?: (completionId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isVisitActive?: boolean; // pass whether visit mode is active
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  task,
  role,
  completion,
  checklistState = {},
  onCheckItem,
  onComplete,
  onFix,
  onEdit,
  onDelete,
  isVisitActive = false
}) => {
  const isPaused = isVisitActive && !!task.pausedDuringVisit;

  // Status evaluation
  let statusLabel = isPaused ? "Paused (Visit) 🏡" : "To Do";
  let cardBg = isPaused 
    ? "bg-slate-900/60 border-dashed border-white/10 text-white/50 backdrop-blur-md" 
    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white";
  let badgeBg = isPaused 
    ? "bg-amber-500/10 text-amber-305 border border-amber-500/20" 
    : "bg-white/5 text-white/50 border border-white/5";

  if (completion) {
    if (completion.status === 'pending_review') {
      statusLabel = "Pending Parents";
      cardBg = "bg-indigo-500/5 border-indigo-500/30 text-white shadow-indigo-500/5 shadow-md";
      badgeBg = "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20";
    } else if (completion.status === 'approved') {
      statusLabel = "Approved!";
      cardBg = "bg-teal-500/5 border-teal-500/30 text-white shadow-teal-500/5 shadow-md";
      badgeBg = "bg-teal-500/15 text-teal-300 border border-teal-500/20";
    } else if (completion.status === 'needs_fix') {
      statusLabel = "Needs a Fix 🛠️";
      cardBg = "bg-rose-500/10 border-rose-500/40 text-rose-50 shadow-rose-500/5 shadow-md";
      badgeBg = "bg-rose-500/20 text-rose-300 border border-rose-500/20";
    }
  }

  // Custom category styling
  let catBadge = "bg-white/5 text-white/50 border border-white/5";
  if (task.category === "Self Care") {
    catBadge = "bg-violet-500/20 text-violet-300 border border-violet-500/10";
  } else if (task.category === "Responsibility") {
    catBadge = "bg-rose-500/20 text-rose-300 border border-rose-500/10";
  } else if (task.category === "Growth") {
    catBadge = "bg-teal-500/20 text-teal-300 border border-teal-500/10";
  }

  const handleSubCheck = (idx: number) => {
    if (onCheckItem && role === 'child' && (!completion || completion?.status === 'needs_fix')) {
      onCheckItem(task.id, idx);
    }
  };

  return (
    <div
      id={id}
      className={`cosmic-glass cosmic-glow-border rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between transition-all duration-500 ${cardBg}`}
    >
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex justify-between items-center">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${catBadge}`}>
            {task.category}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badgeBg}`}>
            {statusLabel}
          </span>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-display font-black text-white text-lg tracking-tight flex items-center justify-between">
            {task.title}
            {role === 'parent' && (
              <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1.5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 hover:bg-rose-500/10 rounded-xl text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed mt-2 font-medium">{task.description}</p>
        </div>

        {/* Checklist Sub-items */}
        {task.checklistItems && task.checklistItems.length > 0 && (
          <div className="bg-white/5 p-4 rounded-[1.5rem] space-y-3 border border-white/5">
            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] block">
              Daily Milestones
            </span>
            {task.checklistItems.map((item, idx) => {
              const isChecked = completion 
                ? (completion.checklistState?.[idx] ?? true) 
                : (checklistState[idx] || false);
              
              const disabled = role !== 'child' || isPaused || (completion && completion.status !== 'needs_fix');

              return (
                <div
                  key={idx}
                  onClick={() => !disabled && handleSubCheck(idx)}
                  className={`flex gap-3 items-center text-xs transition-all ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:translate-x-1'
                  }`}
                >
                  <span className="shrink-0">
                    {isChecked ? (
                      <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-white/10 bg-white/5 group-hover:border-white/30 transition-colors" />
                    )}
                  </span>
                  <span className={`leading-tight font-semibold ${isChecked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parents Needs Fix Feedback block */}
      {role === 'child' && completion && completion.status === 'needs_fix' && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-2xl p-4 text-xs space-y-2 shadow-inner">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-rose-400">
            <AlertCircle className="w-4 h-4" /> Parent Directive
          </div>
          <p className="italic font-medium text-rose-100/80 leading-relaxed">
            "{completion.parentFeedback || 'Please review items thoroughly.'}"
          </p>
          {onFix && (
            <button
              onClick={() => onFix(completion.id)}
              className="mt-2 w-full bg-rose-500/20 border border-rose-500/35 text-rose-200 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-500/30 cursor-pointer active:scale-95 transition-all"
            >
              Update & Resubmit Chores
            </button>
          )}
        </div>
      )}

      {/* Footer controls or timestamp status */}
      <div className="pt-6 mt-6 border-t border-white/5">
        {completion ? (
          <div className="text-slate-500 text-[10px] flex items-center justify-between font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {new Date(completion.completedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
            {role === 'parent' && (
              <span className="text-indigo-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {completion.childName}
              </span>
            )}
          </div>
        ) : (
          role === 'child' && onComplete && (
            isPaused ? (
              <div className="w-full bg-orange-500/5 border border-orange-500/20 text-orange-400 py-3 px-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest">
                Protocol Paused: Caregiver Visit Active
              </div>
            ) : (
              <button
                onClick={() => onComplete(task)}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black py-4 px-6 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.95] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/10"
              >
                Log Mission: +{task.pointValue} PTS
              </button>
            )
          )
        )}
      </div>
    </div>
  );
};
