import { ITask } from './types';

const STORAGE_KEY = 'th09_tasks';

export const loadTasks = (): ITask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ITask[];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: ITask[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
