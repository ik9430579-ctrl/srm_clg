import React, { useState, useEffect } from 'react';
import { ActiveView, TaskItem, CanvasNode, Collaborator, AITemplate } from './types';
import { INITIAL_TASKS, INITIAL_CANVAS_NODES, INITIAL_COLLABORATORS, AI_TEMPLATES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { CyberBackground } from './components/CyberBackground';
import { DashboardView } from './components/DashboardView';
import { CanvasView } from './components/CanvasView';
import { MultimediaView } from './components/MultimediaView';
import { TemplatesView } from './components/TemplatesView';
import { Sparkles, X, Plus, Layers } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // High-performance State with LocalStorage Persistence
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('neon_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>(() => {
    try {
      const saved = localStorage.getItem('neon_canvas_nodes');
      return saved ? JSON.parse(saved) : INITIAL_CANVAS_NODES;
    } catch {
      return INITIAL_CANVAS_NODES;
    }
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('neon_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_canvas_nodes', JSON.stringify(canvasNodes));
    } catch (e) {
      console.error(e);
    }
  }, [canvasNodes]);

  // Handle template loading into workspace
  const handleApplyTemplate = (template: AITemplate) => {
    // Generate new unique nodes from template
    const newNodes: CanvasNode[] = template.nodesPreset.map((np, idx) => ({
      ...np,
      id: `node-${Date.now()}-${idx}`,
      connections: [],
    }));

    // Generate new tasks from template
    const newTasks: TaskItem[] = template.tasksPreset.map((tp, idx) => ({
      ...tp,
      id: `task-${Date.now()}-${idx}`,
    }));

    setCanvasNodes((prev) => [...prev, ...newNodes]);
    setTasks((prev) => [...newTasks, ...prev]);
  };

  // Create New Project Handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplateId !== 'none') {
      const tpl = AI_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (tpl) {
        handleApplyTemplate(tpl);
      }
    }
    setIsNewProjectModalOpen(false);
    setActiveView('canvas');
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans bg-[#070a11] selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* 1. Procedural Three.js 3D Background with Ambient Video Loop */}
      <CyberBackground />

      {/* 2. Top Navigation Bar (3-Zone Top Bar Contract) */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        collaboratorCount={collaborators.length}
        onNewProject={() => setIsNewProjectModalOpen(true)}
      />

      {/* 3. Main Workspace Viewport */}
      <main className="relative z-10 flex-1 pt-14">
        {activeView === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            setTasks={setTasks}
            collaborators={collaborators}
            onOpenCanvasWithTask={(task) => {
              setActiveView('canvas');
            }}
          />
        )}

        {activeView === 'canvas' && (
          <CanvasView
            nodes={canvasNodes}
            setNodes={setCanvasNodes}
            collaborators={collaborators}
          />
        )}

        {activeView === 'multimedia' && <MultimediaView />}

        {activeView === 'templates' && (
          <TemplatesView
            onApplyTemplate={(tpl) => {
              handleApplyTemplate(tpl);
              setActiveView('canvas');
            }}
          />
        )}
      </main>

      {/* 4. New Project Creation Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsNewProjectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Initialize AI Project Pipeline</h3>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Neon Horizon Teaser or Cas9 Proteomics"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Select AI Starter Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="none">Blank Collaborative Canvas</option>
                  {AI_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-lg hover:from-cyan-400 hover:to-purple-500 transition-all cursor-pointer"
                >
                  Initialize Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
