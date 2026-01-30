// Task Request System - Developers can propose new tasks to PM

import * as api from './api';

export interface TaskRequest {
  id: string;
  developerId: string;
  developerName: string;
  title: string;
  description: string;
  reasoning: string;
  estimatedSize: 'small' | 'medium' | 'large';
  suggestedPaths: string[];
  repository?: string;
  branch?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

class TaskRequestStore {
  private requests: TaskRequest[] = [];
  private listeners: Set<() => void> = new Set();
  private loaded = false;
  private pollingInterval?: ReturnType<typeof setInterval>;

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  async load() {
    try {
      this.requests = await api.getTaskRequests();
      this.loaded = true;
      this.notify();
    } catch (error) {
      console.error('Failed to load task requests:', error);
    }
  }

  // Start polling for updates
  startPolling(intervalMs: number = 5000) {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    // Set up new polling interval
    this.pollingInterval = setInterval(() => {
      this.load();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }
  }

  getAll(): TaskRequest[] {
    if (!this.loaded) {
      this.load();
    }
    return [...this.requests];
  }

  getPending(): TaskRequest[] {
    return this.requests.filter(r => r.status === 'pending');
  }

  getByDeveloper(developerId: string): TaskRequest[] {
    return this.requests.filter(r => r.developerId === developerId);
  }

  async create(request: Omit<TaskRequest, 'id' | 'createdAt' | 'status'>): Promise<TaskRequest> {
    try {
      const newRequest = await api.createTaskRequest(request);
      this.requests.unshift(newRequest);
      this.notify();
      return newRequest;
    } catch (error) {
      console.error('Failed to create task request:', error);
      throw error;
    }
  }

  async approve(id: string, notes?: string): Promise<boolean> {
    try {
      const updated = await api.approveTaskRequest(id, notes);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = updated;
        this.notify();
      }
      return true;
    } catch (error) {
      console.error('Failed to approve task request:', error);
      return false;
    }
  }

  async reject(id: string, notes: string): Promise<boolean> {
    try {
      const updated = await api.rejectTaskRequest(id, notes);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = updated;
        this.notify();
      }
      return true;
    } catch (error) {
      console.error('Failed to reject task request:', error);
      return false;
    }
  }
}

export const taskRequestStore = new TaskRequestStore();