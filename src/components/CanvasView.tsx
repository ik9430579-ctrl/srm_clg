import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode, Collaborator, NodeType } from '../types';
import { 
  Sparkles, Image, Video, Music, Dna, FileText, Plus, 
  ZoomIn, ZoomOut, Maximize2, Play, Pause, Trash2, ArrowRight, MousePointer
} from 'lucide-react';

interface CanvasViewProps {
  nodes: CanvasNode[];
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>;
  collaborators: Collaborator[];
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  nodes,
  setNodes,
  collaborators,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeGeneratingId, setActiveGeneratingId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Simulated real-time cursor movement for collaborators
  const [simulatedCollaborators, setSimulatedCollaborators] = useState<Collaborator[]>(collaborators);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedCollaborators((prev) =>
        prev.map((c, i) => {
          const deltaX = (Math.random() - 0.5) * 40;
          const deltaY = (Math.random() - 0.5) * 40;
          return {
            ...c,
            cursor: {
              x: Math.max(50, Math.min(1200, c.cursor.x + deltaX)),
              y: Math.max(80, Math.min(700, c.cursor.y + deltaY)),
            },
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-node')) return;
    setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (draggedNodeId) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggedNodeId) {
            return {
              ...n,
              x: Math.round((e.clientX - pan.x - dragOffset.x) / scale),
              y: Math.round((e.clientY - pan.y - dragOffset.y) / scale),
            };
          }
          return n;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Node Drag Start
  const startDragNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const targetNode = nodes.find((n) => n.id === id);
    if (!targetNode) return;
    setDraggedNodeId(id);
    setDragOffset({
      x: e.clientX - (targetNode.x * scale + pan.x),
      y: e.clientY - (targetNode.y * scale + pan.y),
    });
  };

  // Connect two nodes
  const handleConnectClick = (nodeId: string) => {
    if (!connectingSourceId) {
      setConnectingSourceId(nodeId);
    } else {
      if (connectingSourceId !== nodeId) {
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === connectingSourceId && !n.connections.includes(nodeId)) {
              return { ...n, connections: [...n.connections, nodeId] };
            }
            return n;
          })
        );
      }
      setConnectingSourceId(null);
    }
  };

  // Add new node
  const addNewNode = (type: NodeType) => {
    const id = `node-${type}-${Date.now()}`;
    const titles: Record<NodeType, string> = {
      image: 'New Image Pass',
      video: 'Omni Video Sequence',
      audio: 'Audio Stem & Voice',
      bio_structure: 'Cas9 Molecular Node',
      note: 'Team Annotation Note',
      text: 'Prompt Script',
    };

    const newNode: CanvasNode = {
      id,
      type,
      title: titles[type],
      x: Math.round((-pan.x + 300 + Math.random() * 200) / scale),
      y: Math.round((-pan.y + 150 + Math.random() * 150) / scale),
      width: type === 'video' ? 340 : 300,
      height: 270,
      data: {
        prompt: type === 'image' ? 'Futuristic sci-fi cyber asset' : type === 'video' ? 'Cinematic camera dive' : 'Voice synthesis script',
        mediaUrl: type === 'image' ? '/src/assets/images/neon_studio_hero_1792562543856.jpg' : type === 'bio_structure' ? '/src/assets/images/template_bio_research_1792562544579.jpg' : undefined,
      },
      connections: [],
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  // Run AI generation on a node
  const triggerNodeGeneration = async (node: CanvasNode) => {
    setActiveGeneratingId(node.id);
    try {
      if (node.type === 'image') {
        const res = await fetch('/api/ai/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: node.data.prompt || 'Cyberpunk neon studio',
            aspectRatio: node.data.aspectRatio || '16:9',
            imageSize: node.data.imageSize || '1K',
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setNodes((prev) =>
            prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, mediaUrl: data.imageUrl } } : n))
          );
        }
      } else if (node.type === 'video') {
        const res = await fetch('/api/ai/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: node.data.prompt || 'Cinematic video sequence',
            aspectRatio: node.data.aspectRatio || '16:9',
          }),
        });
        const data = await res.json();
        if (data.videoUrl) {
          setNodes((prev) =>
            prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, mediaUrl: data.videoUrl } } : n))
          );
        }
      }
    } catch (err) {
      console.error('Node gen error:', err);
    } finally {
      setActiveGeneratingId(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* 1. Floating Canvas Toolbar Dock */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2 bg-[#090d16]/90 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase font-mono">Add Node:</span>
        <button
          onClick={() => addNewNode('image')}
          className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Add Image Node"
        >
          <Image className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>
        <button
          onClick={() => addNewNode('video')}
          className="p-1.5 rounded-lg hover:bg-purple-500/20 text-purple-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Add Video Node"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video</span>
        </button>
        <button
          onClick={() => addNewNode('audio')}
          className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Add Audio Node"
        >
          <Music className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>
        <button
          onClick={() => addNewNode('bio_structure')}
          className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Add Bioscience Node"
        >
          <Dna className="w-3.5 h-3.5" />
          <span>Bio</span>
        </button>
        <button
          onClick={() => addNewNode('note')}
          className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Add Note"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Note</span>
        </button>
      </div>

      {/* 2. Floating Zoom & Reset Dock */}
      <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 bg-[#090d16]/90 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Live Collaborators Bar */}
      <div className="absolute top-4 right-6 z-30 flex items-center gap-2 bg-[#090d16]/90 border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-medium">Collaborative Canvas</span>
        <div className="flex -space-x-1.5 ml-2">
          {simulatedCollaborators.map((c) => (
            <img
              key={c.id}
              src={c.avatar}
              alt={c.name}
              className="w-5 h-5 rounded-full border border-black object-cover"
              title={`${c.name} (${c.status})`}
            />
          ))}
        </div>
      </div>

      {/* 4. Canvas Coordinate Plane */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-0">
          <defs>
            <linearGradient id="neonWire" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7928CA" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {nodes.map((sourceNode) =>
            sourceNode.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;

              const x1 = sourceNode.x + sourceNode.width;
              const y1 = sourceNode.y + sourceNode.height / 2;
              const x2 = targetNode.x;
              const y2 = targetNode.y + targetNode.height / 2;
              const dx = (x2 - x1) * 0.5;

              return (
                <path
                  key={`${sourceNode.id}-${targetId}`}
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="url(#neonWire)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-[dash_20s_linear_infinite]"
                />
              );
            })
          )}
        </svg>

        {/* Render Canvas Nodes */}
        {nodes.map((node) => {
          const isGenerating = activeGeneratingId === node.id;
          const isConnectingSource = connectingSourceId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => startDragNode(e, node.id)}
              className={`canvas-node absolute rounded-xl bg-[#090d16]/95 border transition-shadow shadow-2xl z-10 flex flex-col overflow-hidden backdrop-blur-md ${
                isConnectingSource
                  ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                  : 'border-white/10 hover:border-cyan-500/40'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
              }}
            >
              {/* Node Card Header */}
              <div className="px-3 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between cursor-move">
                <div className="flex items-center gap-2">
                  {node.type === 'image' && <Image className="w-3.5 h-3.5 text-cyan-400" />}
                  {node.type === 'video' && <Video className="w-3.5 h-3.5 text-purple-400" />}
                  {node.type === 'audio' && <Music className="w-3.5 h-3.5 text-emerald-400" />}
                  {node.type === 'bio_structure' && <Dna className="w-3.5 h-3.5 text-cyan-300" />}
                  {node.type === 'note' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="text-xs font-semibold text-white truncate max-w-[170px]">{node.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleConnectClick(node.id)}
                    className={`p-1 rounded text-[10px] font-mono transition-colors ${
                      isConnectingSource ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-400'
                    }`}
                    title="Connect to other node"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteNode(node.id)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                    title="Delete node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Node Card Content */}
              <div className="p-3 space-y-2.5">
                {/* Image Node View */}
                {node.type === 'image' && (
                  <div className="space-y-2">
                    {node.data.mediaUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/40">
                        <img
                          src={node.data.mediaUrl}
                          alt={node.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-black/30 border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500">
                        No image generated
                      </div>
                    )}
                    <input
                      type="text"
                      value={node.data.prompt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, prompt: val } } : n))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      placeholder="Prompt for gemini-nano-banana..."
                    />
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">16:9 · 2K</span>
                      <button
                        onClick={() => triggerNodeGeneration(node)}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isGenerating ? 'Synthesizing...' : 'Generate AI'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Node View */}
                {node.type === 'video' && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/50">
                      {node.data.mediaUrl ? (
                        <video
                          src={node.data.mediaUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          Ready to animate via Omni Flash
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={node.data.prompt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, prompt: val } } : n))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      placeholder="Animate prompt for gemini-omni-1.1-flash..."
                    />
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="text-purple-300 font-mono text-[10px]">Omni Flash 16:9</span>
                      <button
                        onClick={() => triggerNodeGeneration(node)}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isGenerating ? 'Rendering Video...' : 'Render Video'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Audio Node View */}
                {node.type === 'audio' && (
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-black/40 border border-white/10 flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1 h-6">
                        {[40, 70, 30, 90, 60, 80, 45, 95, 65, 30, 85, 50].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">{node.data.content}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Model: gemini-3.8-flash-tts</span>
                      <span className="text-emerald-400">Voice: Zephyr</span>
                    </div>
                  </div>
                )}

                {/* Bioscience Node View */}
                {node.type === 'bio_structure' && (
                  <div className="space-y-2">
                    {node.data.mediaUrl && (
                      <div className="rounded-lg overflow-hidden border border-white/10 aspect-video">
                        <img
                          src={node.data.mediaUrl}
                          alt="Cas9 Structure"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-cyan-200 font-mono leading-relaxed">{node.data.content}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Argon High Thinking</span>
                      <span className="text-cyan-400">PDB: 7KRR</span>
                    </div>
                  </div>
                )}

                {/* Note Node View */}
                {node.type === 'note' && (
                  <textarea
                    value={node.data.content || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, content: val } } : n))
                      );
                    }}
                    placeholder="Type collaborative note..."
                    className="w-full h-24 p-2 rounded bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-mono"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Live Collaborator Cursors */}
        {simulatedCollaborators.map((c) => (
          <div
            key={c.id}
            className="absolute pointer-events-none transition-all duration-700 ease-out z-40 flex items-start gap-1"
            style={{
              left: `${c.cursor.x}px`,
              top: `${c.cursor.y}px`,
            }}
          >
            <MousePointer
              className="w-4 h-4"
              style={{ color: c.color, fill: c.color }}
            />
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-md font-mono whitespace-nowrap"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
