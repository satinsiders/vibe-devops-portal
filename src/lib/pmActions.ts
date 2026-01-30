// PM Actions - All interactive PM functionality

import { tasks, pullRequests, leases, developers } from './mockData';
import type { Task, PullRequest, Lease } from './mockData';
import * as api from './api';

class PMActionStore {
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Task Actions
  async createTask(taskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    complexity: 'small' | 'medium' | 'large';
    assignees: string[];
    deadline: string;
    paths: string[];
    repository?: string;
    branch?: string;
  }): Promise<any[]> {
    // Create a separate task for each assignee
    const tasks = await Promise.all(
      taskData.assignees.map(assignee =>
        api.createTask({
          ...taskData,
          assignee
        })
      )
    );
    this.notify();
    return tasks;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await api.deleteTask(taskId);
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  // PR Actions
  async approvePR(prId: string): Promise<boolean> {
    try {
      await api.approvePR(prId);
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to approve PR:', error);
      return false;
    }
  }

  async approveAllPassing(): Promise<number> {
    try {
      const prs = await api.getPullRequests();
      const openPRs = prs.filter((pr: any) => pr.status === 'open');
      
      await Promise.all(openPRs.map((pr: any) => api.approvePR(pr.id)));
      this.notify();
      
      return openPRs.length;
    } catch (error) {
      console.error('Failed to approve all PRs:', error);
      return 0;
    }
  }

  // Lease Actions
  async extendLease(leaseId: string, hours: number): Promise<boolean> {
    try {
      await api.extendLease(leaseId, hours);
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to extend lease:', error);
      return false;
    }
  }

  async extendAllLeases(hours: number): Promise<number> {
    try {
      const leases = await api.getLeases();
      const activeLeases = leases.filter((l: any) => l.status === 'active' || l.status === 'expiring');
      
      await Promise.all(activeLeases.map((l: any) => api.extendLease(l.id, hours)));
      this.notify();
      
      return activeLeases.length;
    } catch (error) {
      console.error('Failed to extend all leases:', error);
      return 0;
    }
  }

  // Developer Actions
  assignTaskToDeveloper(developerId: string, taskId: string): boolean {
    return this.reassignTask(taskId, developerId);
  }

  async reassignTask(taskId: string, newAssignee: string): Promise<boolean> {
    try {
      await api.updateTask(taskId, { assignee: newAssignee });
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to reassign task:', error);
      return false;
    }
  }

  // Get statistics
  getStats() {
    return {
      totalTasks: tasks.length,
      activeTasks: tasks.filter(t => ['in-progress', 'pr', 'review'].includes(t.status)).length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      totalPRs: pullRequests.length,
      openPRs: pullRequests.filter(pr => pr.status === 'open').length,
      passingPRs: pullRequests.filter(pr => pr.ciStatus === 'passing').length,
      activeDevs: developers.filter(d => d.status === 'active').length,
      idleDevs: developers.filter(d => d.status === 'idle').length,
      activeLeases: leases.filter(l => l.status === 'active').length
    };
  }
}

export const pmActions = new PMActionStore();