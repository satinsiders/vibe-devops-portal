// Workflow Engine - Enforces the vibe coder workflow

export type WorkflowStep = 
  | 'idle'
  | 'starting' 
  | 'coding'
  | 'testing'
  | 'submitting'
  | 'reviewing'
  | 'complete';

export interface WorkflowState {
  step: WorkflowStep;
  taskId: string | null;
  branchName: string | null;
  leaseActive: boolean;
  testsPass: boolean;
  changedFiles: string[];
  blockers: string[];
  canProceed: boolean;
  nextAction: string;
}

export class WorkflowEngine {
  private state: WorkflowState;

  constructor() {
    this.state = {
      step: 'idle',
      taskId: null,
      branchName: null,
      leaseActive: false,
      testsPass: false,
      changedFiles: [],
      blockers: [],
      canProceed: true,
      nextAction: 'Select a task to start'
    };
  }

  getState(): WorkflowState {
    return { ...this.state };
  }

  // Start a task - automatically creates branch, grants lease
  async startTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    if (this.state.step !== 'idle') {
      return { success: false, error: 'Finish your current task first' };
    }

    // Simulate: Create branch, grant lease, check dependencies
    await this.sleep(1000);

    this.state = {
      ...this.state,
      step: 'starting',
      taskId,
      branchName: `feat/auto/${taskId}`,
      leaseActive: true,
      nextAction: 'Branch created. Setting up your workspace...'
    };

    // Auto-transition to coding after setup
    await this.sleep(1500);
    this.state.step = 'coding';
    this.state.nextAction = 'Start coding in your assigned files';
    this.state.canProceed = true;

    return { success: true };
  }

  // Save work - automatically runs tests
  async saveWork(files: string[]): Promise<{ success: boolean; error?: string }> {
    if (this.state.step !== 'coding') {
      return { success: false, error: 'Not in coding phase' };
    }

    this.state.changedFiles = files;
    this.state.nextAction = 'Running tests...';
    this.state.canProceed = false;

    // Simulate: Run linter, type checker, tests
    await this.sleep(2000);

    const testsPass = Math.random() > 0.3; // 70% pass rate for demo
    
    this.state.testsPass = testsPass;
    this.state.canProceed = testsPass;

    if (testsPass) {
      this.state.nextAction = 'All checks passed! Ready to submit';
      this.state.blockers = [];
      return { success: true };
    } else {
      this.state.blockers = ['Fix the linting errors in UserCard.tsx'];
      this.state.nextAction = 'Fix errors before continuing';
      return { success: false, error: 'Tests failed. Check the errors below.' };
    }
  }

  // Submit for review - automatically creates PR
  async submitForReview(): Promise<{ success: boolean; error?: string }> {
    if (this.state.step !== 'coding') {
      return { success: false, error: 'Save your work first' };
    }

    if (!this.state.testsPass) {
      return { success: false, error: 'Fix all errors before submitting' };
    }

    this.state.step = 'submitting';
    this.state.nextAction = 'Creating pull request...';

    // Simulate: Create PR, assign reviewers, run CI
    await this.sleep(2000);

    this.state.step = 'reviewing';
    this.state.nextAction = 'Waiting for review';
    this.state.canProceed = false;

    return { success: true };
  }

  // PM approves - automatically merges
  async approve(): Promise<{ success: boolean }> {
    if (this.state.step !== 'reviewing') {
      return { success: false };
    }

    this.state.step = 'complete';
    this.state.nextAction = 'Merged! Great work.';

    // Simulate: Merge, deploy, release lease
    await this.sleep(1500);

    // Reset to idle for next task
    await this.sleep(2000);
    this.reset();

    return { success: true };
  }

  // Reset workflow
  reset() {
    this.state = {
      step: 'idle',
      taskId: null,
      branchName: null,
      leaseActive: false,
      testsPass: false,
      changedFiles: [],
      blockers: [],
      canProceed: true,
      nextAction: 'Select a task to start'
    };
  }

  // Helper
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if can transition to next step
  canTransition(to: WorkflowStep): boolean {
    const transitions: Record<WorkflowStep, WorkflowStep[]> = {
      idle: ['starting'],
      starting: ['coding'],
      coding: ['testing', 'submitting'],
      testing: ['coding', 'submitting'],
      submitting: ['reviewing'],
      reviewing: ['complete'],
      complete: ['idle']
    };

    return transitions[this.state.step]?.includes(to) ?? false;
  }
}
