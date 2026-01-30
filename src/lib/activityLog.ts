import * as api from './api';

export interface Activity {
  id: string;
  timestamp: string;
  type: 'task_created' | 'task_started' | 'task_assigned' | 'pr_submitted' | 'pr_approved' | 'task_completed' | 'task_edited' | 'task_deleted';
  taskId: string;
  taskTitle: string;
  actorId: string;
  actorName: string;
  metadata?: {
    previousAssignee?: string;
    newAssignee?: string;
    prUrl?: string;
    [key: string]: any;
  };
}

class ActivityLogStore {
  private activities: Activity[] = [];
  private listeners: (() => void)[] = [];

  async load(): Promise<Activity[]> {
    try {
      const data = await api.getActivities();
      this.activities = data || [];
      return this.activities;
    } catch (error) {
      console.error('Failed to load activities:', error);
      return [];
    }
  }

  async log(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    const newActivity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activity
    };

    try {
      await api.logActivity(newActivity);
      this.activities.unshift(newActivity); // Add to beginning
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  getAll(): Activity[] {
    return [...this.activities];
  }

  getByTask(taskId: string): Activity[] {
    return this.activities.filter(a => a.taskId === taskId);
  }

  getByDateRange(startDate: Date, endDate: Date): Activity[] {
    return this.activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const activityLog = new ActivityLogStore();
