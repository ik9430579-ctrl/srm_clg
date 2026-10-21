import React, { useState } from 'react';
import { TaskItem, TaskPriority, TaskStatus, PredictiveScheduleSuggestion, Collaborator } from '../types';
import { 
  Sparkles, CheckCircle2, Clock, AlertCircle, ArrowUpRight, 
  Calendar, User, Plus, Filter, RefreshCw, Send, Check
} from 'lucide-react';

interface DashboardViewProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  collaborators: Collaborator[];
  onOpenCanvasWithTask?: (task: TaskItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  setTasks,
  collaborators,
  onOpenCanvasWithTask,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<{
    summary: string;
    recommendations: PredictiveScheduleSuggestion[];
    workloadBalance: string;
  } | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  const [isGoogleTasksSynced, setIsGoogleTasksSynced] = useState<boolean>(false);
  const [chatExportNotice, setChatExportNotice] = useState<string | null>(null);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-10-24');

  // Velocity metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Run AI Predictive Task Scheduling
  const runPredictiveOptimization = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/predict-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          teamMembers: collaborators,
          goal: 'Minimize sprint bottleneck between video generation and bio-modeling',
        }),
      });
      const data = await response.json();
      if (data.recommendations) {
        setOptimizationResult({
          summary: data.summary || 'Schedule optimized for team throughput.',
          recommendations: data.recommendations,
          workloadBalance: data.workloadBalance || 'Workload balanced across team members.',
        });
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply single recommendation
  const applyRecommendation = (rec: PredictiveScheduleSuggestion) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === rec.taskId) {
          return {
            ...t,
            priority: rec.priorityAdjustment || t.priority,
            aiSuggestedSlot: rec.suggestedSlot,
            predictedDurationMinutes: rec.predictedDurationMinutes,
          };
        }
        return t;
      })
    );
    setAppliedRecommendations((prev) => [...prev, rec.taskId]);
  };

  // Move task to next status
  const cycleTaskStatus = (taskId: string) => {
    const sequence: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextIndex = (sequence.indexOf(t.status) + 1) % sequence.length;
          const nextStatus = sequence[nextIndex];
          return {
            ...t,
            status: nextStatus,
            progressPercent: nextStatus === 'done' ? 100 : nextStatus === 'review' ? 80 : nextStatus === 'in_progress' ? 50 : 0,
          };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'AI multimedia project workflow item',
      status: 'todo',
      priority: newPriority,
      assignee: {
        name: collaborators[0]?.name || 'Elena Rostova',
        avatar: collaborators[0]?.avatar || '/src/assets/images/avatar_creative_lead_1792562543074.jpg',
        role: 'Creative Lead',
        color: '#00F2FE',
      },
      dueDate: newDueDate,
      tags: ['Multimedia', 'New'],
      progressPercent: 0,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setIsAddingTask(false);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Overview & Primary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Team Command Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
              Sprint 26.4
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Predictive scheduling, live generative pipelines, and team workload telemetry.
          </p>
        </div>

        {/* Integration Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsGoogleTasksSynced(true);
              setTimeout(() => setIsGoogleTasksSynced(false), 3000);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isGoogleTasksSynced ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Synced to Google Tasks</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sync Google Tasks</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setChatExportNotice("Broadcasted sprint briefing to Google Chat channel #multimedia-studio");
              setTimeout(() => setChatExportNotice(null), 4000);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-purple-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-purple-400" />
            <span>Broadcast Google Chat</span>
          </button>
        </div>
      </div>

      {chatExportNotice && (
        <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between">
          <span>{chatExportNotice}</span>
          <button onClick={() => setChatExportNotice(null)} className="text-purple-300 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Top Metric KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">{completionRate}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active In-Flight</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300">{inProgressTasks} Tasks</div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-modal rendering queue active</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Deliverables</span>
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-300">{totalTasks} Total</div>
          <div className="text-[11px] text-slate-500 mt-1">Spread over 3 production tracks</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Live Collaborators</span>
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-2">
              {collaborators.map((c) => (
                <img
                  key={c.id}
                  src={c.avatar}
                  alt={c.name}
                  className="w-7 h-7 rounded-full border-2 border-[#090d16] object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-mono text-slate-300 font-semibold">{collaborators.length} Online</span>
          </div>
        </div>
      </div>

      {/* 3. Predictive Task Suggestions & Automated Scheduling Engine */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1222]/90 via-[#090d16]/90 to-[#120f24]/90 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Predictive AI Task Scheduler & Workload Optimizer
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini Flash 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Machine-learning analysis of task dependencies, estimated render duration, and team bandwidth.
              </p>
            </div>
          </div>

          <button
            onClick={runPredictiveOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Evaluating Pipeline...' : 'Run Predictive Optimizer'}</span>
          </button>
        </div>

        {optimizationResult ? (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="text-xs text-cyan-200 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
              <span>{optimizationResult.summary}</span>
              <span className="text-[11px] font-mono text-cyan-400">{optimizationResult.workloadBalance}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optimizationResult.recommendations.map((rec, idx) => {
                const targetTask = tasks.find((t) => t.id === rec.taskId);
                const isApplied = appliedRecommendations.includes(rec.taskId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#070a11]/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          {targetTask?.title || rec.taskId}
                        </span>
                        <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {rec.suggestedSlot}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{rec.rationale}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-slate-500 font-mono">Est: {rec.predictedDurationMinutes}m</span>
                      {isApplied ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Scheduled
                        </span>
                      ) : (
                        <button
                          onClick={() => applyRecommendation(rec)}
                          className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-medium transition-colors"
                        >
                          Apply Slot
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 bg-black/20 p-3 rounded-lg border border-dashed border-white/10 flex items-center justify-between">
            <span>AI scheduler is ready to scan task dependencies and recommend optimal time windows.</span>
            <span className="text-slate-500 font-mono text-[11px]">Click 'Run Predictive Optimizer' above</span>
          </div>
        )}
      </div>

      {/* 4. Task Management Kanban / List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">Project Pipeline</h2>
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/10 text-xs">
              {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    filterPriority === p
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAddingTask ? 'Cancel' : 'Create Task'}</span>
          </button>
        </div>

        {/* Create Task Form */}
        {isAddingTask && (
          <form
            onSubmit={handleCreateTask}
            className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/30 shadow-xl space-y-3"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
              New Pipeline Task
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Task title (e.g. Render 3D Cas9 Binding Video)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
              <div className="flex gap-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <textarea
              placeholder="Task details and model prompt instructions..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 h-16 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400"
              >
                Add to Pipeline
              </button>
            </div>
          </form>
        )}

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            const statusLabels: Record<TaskStatus, { title: string; color: string }> = {
              todo: { title: 'To Do', color: 'text-slate-400' },
              in_progress: { title: 'In Generation', color: 'text-cyan-400' },
              review: { title: 'In Review', color: 'text-purple-400' },
              done: { title: 'Completed', color: 'text-emerald-400' },
            };

            return (
              <div
                key={colStatus}
                className="bg-[#090d16]/75 border border-white/10 rounded-xl p-3 flex flex-col space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className={`text-xs font-bold uppercase tracking-wider ${statusLabels[colStatus].color}`}>
                    {statusLabels[colStatus].title}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">{colTasks.length}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-6 text-center italic">No tasks in queue</div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-[#070a11] border border-white/10 hover:border-cyan-500/40 transition-all shadow-md space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ${
                              task.priority === 'urgent'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : task.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                        {task.aiSuggestedSlot && (
                          <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                            <span>Slot: {task.aiSuggestedSlot}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-5 h-5 rounded-full object-cover border border-white/20"
                            />
                            <span className="text-slate-400 text-[10px] truncate max-w-[90px]">
                              {task.assignee.name}
                            </span>
                          </div>

                          <button
                            onClick={() => cycleTaskStatus(task.id)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Advance Status"
                          >
                            Status →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
