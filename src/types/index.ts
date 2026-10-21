export type ActiveView = 'dashboard' | 'canvas' | 'multimedia' | 'templates';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: {
    name: string;
    avatar: string;
    role: string;
    color: string;
  };
  dueDate: string;
  predictedDurationMinutes?: number;
  aiSuggestedSlot?: string;
  tags: string[];
  progressPercent: number;
}

export interface PredictiveScheduleSuggestion {
  taskId: string;
  suggestedSlot: string;
  predictedDurationMinutes: number;
  priorityAdjustment: TaskPriority;
  rationale: string;
  assigneeRecommendation: string;
}

export type NodeType = 'text' | 'image' | 'video' | 'audio' | 'bio_structure' | 'note';

export interface CanvasNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: {
    prompt?: string;
    content?: string;
    mediaUrl?: string;
    aspectRatio?: string;
    imageSize?: string;
    audioBase64?: string;
    isGenerating?: boolean;
    metadata?: Record<string, any>;
  };
  connections: string[]; // target node IDs
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor: { x: number; y: number };
  activeNodeId?: string;
  status: 'active' | 'idle' | 'generating';
}

export interface AITemplate {
  id: string;
  category: 'creative' | 'marketing' | 'video' | 'bioscience';
  title: string;
  description: string;
  tag: string;
  nodesPreset: Omit<CanvasNode, 'id'>[];
  tasksPreset: Omit<TaskItem, 'id'>[];
}
