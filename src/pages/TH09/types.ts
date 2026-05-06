export type Priority = 'Cao' | 'Trung bình' | 'Thấp';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ITask {
  id: string;
  name: string;
  description: string;
  deadline: string; // ISO string
  priority: Priority;
  tags: string[];
  status: TaskStatus;
  createdAt: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#ff6b6b',
  in_progress: '#ffa940',
  done: '#52c41a',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Cao': '#ff4d4f',
  'Trung bình': '#faad14',
  'Thấp': '#52c41a',
};
