import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBoard } from '../../../store';
import { Task } from '../../../types/domain.types';
import { TaskCard } from '../../tasks/TaskCard';

export const ParentTaskOverviewSection: React.FC = () => {
  const { tasks, addNewTask, updateTask, deleteTask } = useBoard();

  // Input states Chores
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskKey, setTaskKey] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Responsibility');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPts, setTaskPts] = useState(1);
  const [taskBonus, setTaskBonus] = useState(5);
  const [taskDay, setTaskDay] = useState('All');
  const [taskChecklist, setTaskChecklist] = useState('');
  const [taskFormError, setTaskFormError] = useState('');

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    setTaskFormError('');

    // Before saving, trim parameters
    const trimmedKey = taskKey.trim();
    const trimmedTitle = taskTitle.trim();
    const trimmedCategory = taskCategory.trim();
    const trimmedDesc = taskDesc.trim();
    const trimmedDay = taskDay.trim();
    const items = taskChecklist.split('\n').map(i => i.trim()).filter(i => i !== '');

    // Normalize taskKey before saving
    const normalizedKey = trimmedKey.toLowerCase().replace(/\s+/g, '_');

    const ptsNum = Number(taskPts);
    const bonusNum = Number(taskBonus);

    // Block saving if conditions are met
    if (!normalizedKey) {
      setTaskFormError("System Key cannot be empty.");
      return;
    }

    if (!trimmedTitle) {
      setTaskFormError("Chore Display Title cannot be empty.");
      return;
    }

    // Check duplicate keys (allow keeping same key when editing)
    const duplicateKeyTask = tasks.find(t => t.key === normalizedKey);
    if (duplicateKeyTask && (!editingTask || duplicateKeyTask.id !== editingTask.id)) {
      setTaskFormError(`The System Key "${normalizedKey}" is already in use by another chore.`);
      return;
    }

    if (isNaN(ptsNum) || ptsNum < 0) {
      setTaskFormError("Point value must be 0 or greater.");
      return;
    }

    if (isNaN(bonusNum) || bonusNum < 0) {
      setTaskFormError("Device minutes must be 0 or greater.");
      return;
    }

    if (bonusNum > 60) {
      setTaskFormError("Device minutes cannot exceed 60.");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        key: normalizedKey,
        title: trimmedTitle,
        category: trimmedCategory,
        description: trimmedDesc,
        pointValue: ptsNum,
        tabletBonusMinutes: bonusNum,
        dayOfWeek: trimmedDay,
        checklistItems: items,
      });
      setEditingTask(null);
    } else {
      addNewTask({
        key: normalizedKey,
        title: trimmedTitle,
        category: trimmedCategory,
        description: trimmedDesc,
        pointValue: ptsNum,
        tabletBonusMinutes: bonusNum,
        dayOfWeek: trimmedDay,
        active: true,
        sortOrder: tasks.length + 1,
        checklistItems: items,
      });
    }

    // Reset Form
    setTaskKey('');
    setTaskTitle('');
    setTaskCategory('Responsibility');
    setTaskDesc('');
    setTaskPts(1);
    setTaskBonus(5);
    setTaskDay('All');
    setTaskChecklist('');
    setTaskFormError('');
  };

  const handleEditTaskClick = (task: Task) => {
    setTaskFormError('');
    setEditingTask(task);
    setTaskKey(task.key);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setTaskDesc(task.description);
    setTaskPts(task.pointValue);
    setTaskBonus(task.tabletBonusMinutes);
    setTaskDay(task.dayOfWeek);
    setTaskChecklist(task.checklistItems.join('\n'));
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setTaskKey('');
    setTaskTitle('');
    setTaskCategory('Responsibility');
    setTaskDesc('');
    setTaskPts(1);
    setTaskBonus(5);
    setTaskDay('All');
    setTaskChecklist('');
    setTaskFormError('');
  };

  return (
    <div className="grid md:grid-cols-12 gap-8" id="parent-tab-tasks">
      
      {/* Creator form card */}
      <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 text-white backdrop-blur-md self-start" id="task-creator-form">
        <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-teal-400" />
          {editingTask ? "🛠️ Edit Custom Chore" : "📝 Create Fresh Habit Chore"}
        </h3>

        <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-white/70 block">Unique System Key (alphanumeric_or_snake)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. bed_making_standard"
              value={taskKey}
              onChange={(e) => setTaskKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={!!editingTask}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white placeholder-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Chore Display Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Make up your Bed neatly"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-bold font-sans text-white placeholder-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-white/70 block">Point Val</label>
              <input 
                type="number" 
                required
                min={1}
                value={taskPts}
                onChange={(e) => setTaskPts(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-white/70 block">Device Mins</label>
              <input 
                type="number" 
                required
                min={0}
                value={taskBonus}
                onChange={(e) => setTaskBonus(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Checklist Accountability Sub-Items (One item per line)</label>
            <textarea 
              rows={4}
              required
              placeholder="Fluff the pillows&#10;Pull sheets flat"
              value={taskChecklist}
              onChange={(e) => setTaskChecklist(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-medium text-white placeholder-white/20 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/70 block">Brief Chore Instruction Description</label>
            <input 
              type="text" 
              placeholder="Do this before taking out tablet devices."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-white placeholder-white/20"
            />
          </div>

          {taskFormError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold leading-relaxed" id="task-form-error-banner">
              ⚠️ {taskFormError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {editingTask && (
              <button 
                type="button" 
                onClick={cancelTaskEdit}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-white font-bold transition"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="flex-1 bg-teal-500/25 hover:bg-teal-500/35 border border-teal-500/40 py-2.5 rounded-xl text-teal-300 font-extrabold tracking-wide transition shadow-lg shadow-teal-500/5 cursor-pointer"
            >
              {editingTask ? "Commit Edits" : "Add Chore"}
            </button>
          </div>
        </form>
      </div>

      {/* Chores catalog active grid */}
      <div className="md:col-span-8 space-y-6" id="tasks-catalog-section">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-extrabold text-white text-base">Active Chore Mission Cards ({tasks.length})</h3>
          <p className="text-white/60 text-xs mt-0.5">Below are the current daily chore templates active in your family board.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6" id="parent-tasks-catalog">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={`parent-task-card-${task.id}`}
              task={task}
              role="parent"
              onEdit={handleEditTaskClick}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
