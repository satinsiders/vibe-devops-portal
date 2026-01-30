export interface Developer {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'idle' | 'blocked';
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'draft' | 'ready' | 'assigned' | 'in-progress' | 'pr' | 'review' | 'merge-queue' | 'done';
  priority: 'low' | 'medium' | 'high';
  paths: string[];
  branch?: string;
  repository?: string;
  prUrl?: string;
  deadline: string;
  complexity: 'small' | 'medium' | 'large';
  acceptanceCriteria: string[];
}

export interface Lease {
  id: string;
  developerId: string;
  developerName: string;
  paths: string[];
  taskId: string;
  taskTitle: string;
  startTime: string;
  expiryTime: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  authorId: string;
  status: 'open' | 'approved' | 'changes-requested' | 'merged';
  ciStatus: 'pending' | 'passing' | 'failing';
  branch: string;
  createdAt: string;
  filesChanged: number;
  checks: {
    lint: boolean;
    typecheck: boolean;
    tests: boolean;
    bundleSize: boolean;
  };
}

export interface RepoNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  owner?: string;
  ownerId?: string;
  status: 'free' | 'leased' | 'shared' | 'protected';
  children?: RepoNode[];
}

export const developers: Developer[] = [
  {
    id: 'dev-1',
    name: '김재연',
    avatar: 'KJ',
    status: 'idle'
  },
  {
    id: 'dev-2',
    name: '김남준',
    avatar: 'KN',
    status: 'idle'
  },
  {
    id: 'dev-3',
    name: '배병윤',
    avatar: 'BB',
    status: 'idle'
  },
  {
    id: 'dev-4',
    name: '이민재',
    avatar: 'LM',
    status: 'idle'
  },
  {
    id: 'dev-5',
    name: '김우영',
    avatar: 'KW',
    status: 'idle'
  }
];

export const tasks: Task[] = [];

export const leases: Lease[] = [];

export const pullRequests: PullRequest[] = [];

export const repoStructure: RepoNode = {
  name: 'root',
  type: 'folder',
  path: '/',
  status: 'free',
  children: []
};

export const dailyActivity: any[] = [];