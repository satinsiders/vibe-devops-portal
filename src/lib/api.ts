const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-7839915e`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'API call failed');
  }

  return response.json();
}

// Initialize database
export async function initializeDatabase() {
  return apiCall('/init-db', { method: 'POST' });
}

// GitHub
export async function getRepositories() {
  return apiCall('/repos');
}

export async function getBranches(owner: string, repo: string) {
  return apiCall(`/repos/${owner}/${repo}/branches`);
}

// Tasks
export async function getTasks() {
  return apiCall('/tasks');
}

export async function createTask(task: {
  title: string;
  description: string;
  assignee: string;
  paths: string[];
  priority: 'high' | 'medium' | 'low';
  complexity: 'small' | 'medium' | 'large';
  deadline: string;
  repository?: string;
  branch?: string;
  acceptanceCriteria?: string[];
}) {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateTask(id: string, updates: any) {
  return apiCall(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id: string) {
  return apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function startTask(taskId: string, developerId: string) {
  return apiCall(`/tasks/${taskId}/start`, {
    method: 'POST',
    body: JSON.stringify({ developerId }),
  });
}

// Leases
export async function getLeases() {
  return apiCall('/leases');
}

export async function extendLease(leaseId: string, hours: number) {
  return apiCall(`/leases/${leaseId}/extend`, {
    method: 'POST',
    body: JSON.stringify({ hours }),
  });
}

export async function releaseLease(leaseId: string) {
  return apiCall(`/leases/${leaseId}/release`, {
    method: 'POST',
  });
}

// Pull Requests
export async function getPullRequests() {
  return apiCall('/prs');
}

export async function submitPR(data: { taskId: string; developerId: string; prUrl: string }) {
  const response = await fetch(`${API_BASE}/prs/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit PR');
  }

  return response.json();
}

export async function approvePR(prId: string) {
  return apiCall(`/prs/${prId}/approve`, {
    method: 'POST',
  });
}

// Developers
export async function getDevelopers() {
  return apiCall('/developers');
}

export async function addDeveloper(data: { name: string }) {
  return apiCall('/developers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resetDevelopers() {
  return apiCall('/developers/reset', {
    method: 'POST',
  });
}

// Task Requests
export async function getTaskRequests() {
  return apiCall('/task-requests');
}

export async function createTaskRequest(request: {
  developerId: string;
  developerName: string;
  title: string;
  description: string;
  reasoning: string;
  estimatedSize: 'small' | 'medium' | 'large';
  suggestedPaths: string[];
  repository?: string;
  branch?: string;
}) {
  return apiCall('/task-requests', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function approveTaskRequest(id: string, notes?: string) {
  return apiCall(`/task-requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export async function rejectTaskRequest(id: string, notes: string) {
  return apiCall(`/task-requests/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

// Activity Log
export async function getActivities() {
  return apiCall('/activities');
}

export async function logActivity(activity: any) {
  return apiCall('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  });
}

// Admin - Clear all data
export async function clearAllData() {
  return apiCall('/clear-all', { method: 'POST' });
}

// Health check
export async function checkHealth() {
  return apiCall('/health');
}