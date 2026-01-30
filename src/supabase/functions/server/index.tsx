import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { sendSlackNotification } from './slackNotifications.ts';
import { getRepositories, createBranch, getBranches } from './github.ts';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize database schema
app.post('/make-server-7839915e/init-db', async (c) => {
  try {
    // Check if schema exists
    const existing = await kv.get('schema_initialized');
    if (existing) {
      return c.json({ success: true, message: 'Schema already initialized' });
    }

    // Initialize with default developers
    const defaultDevelopers = [
      { id: 'dev-1', name: '김재연', avatar: 'KJ', status: 'idle' },
      { id: 'dev-2', name: '김남준', avatar: 'KN', status: 'idle' },
      { id: 'dev-3', name: '배병윤', avatar: 'BB', status: 'idle' },
      { id: 'dev-4', name: '이민재', avatar: 'LM', status: 'idle' },
      { id: 'dev-5', name: '김우영', avatar: 'KW', status: 'idle' }
    ];

    // Initialize with empty data except developers
    await kv.set('schema_initialized', 'true');
    await kv.set('tasks', JSON.stringify([]));
    await kv.set('developers', JSON.stringify(defaultDevelopers));
    await kv.set('leases', JSON.stringify([]));
    await kv.set('pull_requests', JSON.stringify([]));
    await kv.set('path_locks', JSON.stringify([]));
    await kv.set('task_requests', JSON.stringify([]));
    await kv.set('activities', JSON.stringify([]));
    
    return c.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init DB error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== GITHUB =====

app.get('/make-server-7839915e/repos', async (c) => {
  try {
    const token = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!token) {
      // Fallback to hardcoded if no token (for demo purposes before token is set)
      return c.json([
        { id: '1', name: 'frontend', fullName: 'vibe-dev-ops/frontend', defaultBranch: 'main' },
        { id: '2', name: 'backend', fullName: 'vibe-dev-ops/backend', defaultBranch: 'main' },
        { id: '3', name: 'mobile', fullName: 'vibe-dev-ops/mobile', defaultBranch: 'main' },
        { id: '4', name: 'infrastructure', fullName: 'vibe-dev-ops/infrastructure', defaultBranch: 'main' },
      ]);
    }

    const repos = await getRepositories(token);
    return c.json(repos);
  } catch (error) {
    console.error('Get repos error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-7839915e/repos/:owner/:repo/branches', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    const token = Deno.env.get('GITHUB_ACCESS_TOKEN');
    
    if (!token) {
      // Fallback for demo
      return c.json([
        { name: 'main', protected: true },
        { name: 'develop', protected: false },
        { name: 'staging', protected: false },
        { name: 'feature/login', protected: false },
      ]);
    }

    const branches = await getBranches(token, owner, repo);
    return c.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== TASKS =====

app.get('/make-server-7839915e/tasks', async (c) => {
  try {
    const tasks = await kv.get('tasks');
    return c.json(tasks ? JSON.parse(tasks) : []);
  } catch (error) {
    console.error('Get tasks error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/tasks', async (c) => {
  try {
    const newTask = await c.req.json();
    console.log('📝 Creating task:', {
      title: newTask.title,
      assignee: newTask.assignee,
      assigneeName: newTask.assignee
    });
    
    const tasks = await kv.get('tasks');
    const taskList = tasks ? JSON.parse(tasks) : [];
    
    const createdTask = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Add randomness to prevent duplicate IDs
      status: 'assigned',
      createdAt: new Date().toISOString()
    };

    // Create Ghost Branch if repository and branch are provided
    if (newTask.repository && newTask.branch) {
      const token = Deno.env.get('GITHUB_ACCESS_TOKEN');
      if (token) {
        try {
          // Parse owner/repo from fullName (e.g., "vibe-dev-ops/frontend")
          const [owner, repo] = newTask.repository.split('/');
          if (owner && repo) {
            console.log(`👻 Creating ghost branch: ${newTask.branch} in ${newTask.repository}`);
            await createBranch(token, owner, repo, newTask.branch);
            console.log('✅ Ghost branch created successfully');
          }
        } catch (ghError) {
          console.error('⚠️ Failed to create ghost branch:', ghError);
          // Continue creating task even if branch creation fails, but maybe mark it?
          // For now we just log it.
        }
      } else {
        console.log('⚠️ No GITHUB_ACCESS_TOKEN found, skipping ghost branch creation');
      }
    }
    
    taskList.push(createdTask);
    
    await kv.set('tasks', JSON.stringify(taskList));
    console.log('✅ Task created successfully:', {
      taskId: createdTask.id,
      assignee: createdTask.assignee,
      totalTasks: taskList.length
    });
    
    return c.json(createdTask);
  } catch (error) {
    console.error('❌ Create task error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return c.json({ error: String(error) }, 500);
  }
});

app.patch('/make-server-7839915e/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const tasks = await kv.get('tasks');
    const taskList = tasks ? JSON.parse(tasks) : [];
    const index = taskList.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    taskList[index] = { ...taskList[index], ...updates };
    await kv.set('tasks', JSON.stringify(taskList));
    
    return c.json(taskList[index]);
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Start working on a task (assigned → in-progress)
app.post('/make-server-7839915e/tasks/:id/start', async (c) => {
  try {
    const id = c.req.param('id');
    const { developerId } = await c.req.json();
    
    const tasks = await kv.get('tasks');
    const taskList = tasks ? JSON.parse(tasks) : [];
    const index = taskList.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    const task = taskList[index];
    
    if (task.status !== 'assigned') {
      return c.json({ error: 'Task must be in assigned status' }, 400);
    }
    
    if (task.assignee !== developerId) {
      return c.json({ error: 'Task not assigned to this developer' }, 403);
    }
    
    task.status = 'in-progress';
    task.startedAt = new Date().toISOString();
    
    await kv.set('tasks', JSON.stringify(taskList));
    
    // Automatically create a lease for this task
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    
    // Check if lease already exists
    const existingLease = leases.find((l: any) => l.taskId === id && l.status === 'active');
    
    if (!existingLease) {
      const newLease = {
        id: `lease-${Date.now()}`,
        taskId: id,
        developerId: developerId,
        paths: task.paths,
        status: 'active',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours
        createdAt: new Date().toISOString()
      };
      
      leases.push(newLease);
      await kv.set('leases', JSON.stringify(leases));
      
      // Update path locks
      const pathLocksData = await kv.get('path_locks');
      const pathLocks = pathLocksData ? JSON.parse(pathLocksData) : {};
      
      task.paths.forEach((path: string) => {
        pathLocks[path] = {
          taskId: id,
          developerId: developerId,
          lockedAt: new Date().toISOString()
        };
      });
      
      await kv.set('path_locks', JSON.stringify(pathLocks));
    }
    
    return c.json(task);
  } catch (error) {
    console.error('Start task error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-7839915e/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const tasks = await kv.get('tasks');
    const taskList = tasks ? JSON.parse(tasks) : [];
    const index = taskList.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    const task = taskList[index];
    
    // Release any active leases for this task
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    const taskLease = leases.find((l: any) => l.taskId === id && l.status === 'active');
    
    if (taskLease) {
      taskLease.status = 'released';
      await kv.set('leases', JSON.stringify(leases));
      
      // Release path locks
      const locksData = await kv.get('path_locks');
      const locks = locksData ? JSON.parse(locksData) : {};
      const updatedLocks = Object.fromEntries(
        Object.entries(locks).filter(([path, lock]) => lock.taskId !== id)
      );
      await kv.set('path_locks', JSON.stringify(updatedLocks));
    }
    
    // Remove task
    taskList.splice(index, 1);
    await kv.set('tasks', JSON.stringify(taskList));
    
    return c.json({ success: true, deletedTask: task });
  } catch (error) {
    console.error('Delete task error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== LEASES =====

app.get('/make-server-7839915e/leases', async (c) => {
  try {
    const leases = await kv.get('leases');
    return c.json(leases ? JSON.parse(leases) : []);
  } catch (error) {
    console.error('Get leases error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/leases/claim', async (c) => {
  try {
    const { taskId, developerId } = await c.req.json();
    
    // Get task
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    const task = tasks.find((t: any) => t.id === taskId);
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Check for path conflicts
    const locksData = await kv.get('path_locks');
    const locks = locksData ? JSON.parse(locksData) : {};
    
    const conflicts = task.paths.filter((path: string) =>
      Object.values(locks).some((lock: any) => lock.path === path && lock.status === 'locked')
    );
    
    if (conflicts.length > 0) {
      return c.json({ 
        error: 'Path conflict', 
        conflicts,
        message: `These paths are locked by other developers: ${conflicts.join(', ')}`
      }, 409);
    }

    // Create lease (8 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);
    
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    
    const newLease = {
      id: `lease-${Date.now()}`,
      taskId,
      developerId,
      paths: task.paths,
      status: 'active',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    leases.push(newLease);
    await kv.set('leases', JSON.stringify(leases));

    // Lock paths
    const newLocks = task.paths.map((path: string) => ({
      path,
      lockedBy: developerId,
      taskId,
      status: 'locked',
      lockedAt: new Date().toISOString()
    }));
    
    locks.push(...newLocks);
    await kv.set('path_locks', JSON.stringify(locks));

    return c.json(newLease);
  } catch (error) {
    console.error('Claim lease error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/leases/:id/extend', async (c) => {
  try {
    const id = c.req.param('id');
    const { hours } = await c.req.json();
    
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    const index = leases.findIndex((l: any) => l.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Lease not found' }, 404);
    }
    
    const currentExpiry = new Date(leases[index].expiresAt);
    currentExpiry.setHours(currentExpiry.getHours() + hours);
    
    leases[index].expiresAt = currentExpiry.toISOString();
    await kv.set('leases', JSON.stringify(leases));
    
    return c.json(leases[index]);
  } catch (error) {
    console.error('Extend lease error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/leases/:id/release', async (c) => {
  try {
    const id = c.req.param('id');
    
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    const lease = leases.find((l: any) => l.id === id);
    
    if (!lease) {
      return c.json({ error: 'Lease not found' }, 404);
    }

    // Update lease status
    lease.status = 'released';
    await kv.set('leases', JSON.stringify(leases));

    // Release path locks
    const locksData = await kv.get('path_locks');
    const locks = locksData ? JSON.parse(locksData) : {};
    const updatedLocks = Object.fromEntries(
      Object.entries(locks).filter(([path, lock]) => lock.taskId !== lease.taskId)
    );
    await kv.set('path_locks', JSON.stringify(updatedLocks));

    return c.json({ success: true });
  } catch (error) {
    console.error('Release lease error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== PULL REQUESTS =====

app.post('/make-server-7839915e/prs/submit', async (c) => {
  try {
    const { taskId, prUrl, developerId } = await c.req.json();
    
    // Validate PR URL only if provided
    if (prUrl && (!prUrl.includes('github.com') || !prUrl.includes('pull'))) {
      return c.json({ error: 'Invalid GitHub PR URL' }, 400);
    }

    // Get task and lease
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    const task = tasks.find((t: any) => t.id === taskId);
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    const lease = leases.find((l: any) => l.taskId === taskId && l.status === 'active');
    
    if (!lease) {
      return c.json({ error: 'No active lease for this task' }, 403);
    }

    // Create PR record
    const prsData = await kv.get('pull_requests');
    const prs = prsData ? JSON.parse(prsData) : [];
    
    const newPR = {
      id: `pr-${Date.now()}`,
      taskId,
      developerId,
      prUrl,
      status: 'open',
      ciStatus: 'pending',
      pathValidation: 'passed', // Would validate against GitHub API in production
      checks: {
        lint: false,
        typecheck: false,
        tests: false
      },
      createdAt: new Date().toISOString()
    };
    
    prs.push(newPR);
    await kv.set('pull_requests', JSON.stringify(prs));

    // Update task status
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    tasks[taskIndex].status = 'in-review';
    await kv.set('tasks', JSON.stringify(tasks));

    // Log activity
    const developersData = await kv.get('developers');
    const developers = developersData ? JSON.parse(developersData) : [];
    const developer = developers.find((d: any) => d.id === developerId);
    
    const activitiesData = await kv.get('activities');
    const activities = activitiesData ? JSON.parse(activitiesData) : [];
    activities.push({
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'pr_submitted',
      taskId: task.id,
      taskTitle: task.title,
      actorId: developerId,
      actorName: developer?.name || 'Unknown Developer',
      metadata: {
        prUrl: prUrl
      }
    });
    await kv.set('activities', JSON.stringify(activities));

    // Send Slack notification to PM
    await sendSlackNotification({
      event: 'pr_submitted',
      developer: developer?.name || 'Unknown Developer',
      taskTitle: task.title,
      taskId: task.id,
      pmName: '김재연'
    });

    return c.json(newPR);
  } catch (error) {
    console.error('Submit PR error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-7839915e/prs', async (c) => {
  try {
    const prsData = await kv.get('pull_requests');
    const prs = prsData ? JSON.parse(prsData) : [];
    
    // Enrich PRs with task and developer information
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    // Developer mapping for names
    const developerMap: Record<string, string> = {
      'dev-1': '김재연',
      'dev-2': '김남준',
      'dev-3': '배병윤',
      'dev-4': '이민재',
      'dev-5': '김우영'
    };
    
    const enrichedPRs = prs.map((pr: any) => {
      const task = tasks.find((t: any) => t.id === pr.taskId);
      if (task) {
        // Extract PR number from URL (if URL is provided)
        const prNumber = pr.prUrl ? (pr.prUrl.match(/\/pull\/(\d+)/)?.[1] || '?') : '?';
        
        return {
          ...pr,
          number: prNumber === '?' ? 0 : parseInt(prNumber),
          title: task.title,
          author: developerMap[task.assignee] || task.assignee, // Map to developer name
          authorId: task.assignee, // Keep original ID for filtering
          branch: `feature/${task.id}`,
          url: pr.prUrl || '', // Ensure url is always defined
          filesChanged: task.paths?.length || 0,
          description: task.description
        };
      }
      return pr;
    });
    
    return c.json(enrichedPRs);
  } catch (error) {
    console.error('❌ [Supabase] Get PRs error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      raw: error
    });
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.post('/make-server-7839915e/prs/:id/approve', async (c) => {
  try {
    const id = c.req.param('id');
    
    const prsData = await kv.get('pull_requests');
    const prs = prsData ? JSON.parse(prsData) : [];
    const prIndex = prs.findIndex((p: any) => p.id === id);
    
    if (prIndex === -1) {
      return c.json({ error: 'PR not found' }, 404);
    }

    const pr = prs[prIndex];

    // Update PR status
    pr.status = 'merged';
    pr.mergedAt = new Date().toISOString();
    await kv.set('pull_requests', JSON.stringify(prs));

    // Release lease
    const leasesData = await kv.get('leases');
    const leases = leasesData ? JSON.parse(leasesData) : [];
    const lease = leases.find((l: any) => l.taskId === pr.taskId);
    
    if (lease) {
      lease.status = 'released';
      await kv.set('leases', JSON.stringify(leases));

      // Release path locks
      const locksData = await kv.get('path_locks');
      const locks = locksData ? JSON.parse(locksData) : {};
      const updatedLocks = Object.fromEntries(
        Object.entries(locks).filter(([path, lock]) => lock.taskId !== pr.taskId)
      );
      await kv.set('path_locks', JSON.stringify(updatedLocks));
    }

    // Update task status
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    const taskIndex = tasks.findIndex((t: any) => t.id === pr.taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'done';
      await kv.set('tasks', JSON.stringify(tasks));
      
      // Log activity
      const activitiesData = await kv.get('activities');
      const activities = activitiesData ? JSON.parse(activitiesData) : [];
      const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get developer info for task_completed activity
      const developerMap: Record<string, string> = {
        'dev-1': '김재연',
        'dev-2': '김남준',
        'dev-3': '배병윤',
        'dev-4': '이민재',
        'dev-5': '김우영'
      };
      
      const developerId = tasks[taskIndex].assignee;
      const developerName = developerMap[developerId] || developerId;
      
      activities.push({
        id: activityId,
        timestamp: new Date().toISOString(),
        type: 'pr_approved',
        taskId: tasks[taskIndex].id,
        taskTitle: tasks[taskIndex].title,
        actorId: 'pm-sarah',
        actorName: 'PM (김재연)',
        metadata: {
          prUrl: pr.prUrl
        }
      });
      
      activities.push({
        id: `activity-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: 'task_completed',
        taskId: tasks[taskIndex].id,
        taskTitle: tasks[taskIndex].title,
        actorId: developerId,
        actorName: developerName,
        metadata: {}
      });
      await kv.set('activities', JSON.stringify(activities));
      
      // Send Slack notification to developer
      await sendSlackNotification({
        event: 'pr_approved',
        developer: developerName,
        taskTitle: tasks[taskIndex].title,
        taskId: tasks[taskIndex].id,
        pmName: '김재연'
      });
    }

    return c.json({ success: true, pr: prs[prIndex] });
  } catch (error) {
    console.error('Approve PR error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== DEVELOPERS =====

app.get('/make-server-7839915e/developers', async (c) => {
  try {
    const developers = await kv.get('developers');
    return c.json(developers ? JSON.parse(developers) : []);
  } catch (error) {
    console.error('Get developers error:', error);
    return c.json({ error: 'Failed to get developers' }, 500);
  }
});

// Admin endpoint to reset developers to default
app.post('/make-server-7839915e/developers/reset', async (c) => {
  try {
    const defaultDevelopers = [
      { id: 'dev-1', name: '김재연', avatar: 'KJ', status: 'idle' },
      { id: 'dev-2', name: '김남준', avatar: 'KN', status: 'idle' },
      { id: 'dev-3', name: '배병윤', avatar: 'BB', status: 'idle' },
      { id: 'dev-4', name: '이민재', avatar: 'LM', status: 'idle' },
      { id: 'dev-5', name: '김우영', avatar: 'KW', status: 'idle' }
    ];

    await kv.set('developers', JSON.stringify(defaultDevelopers));
    
    console.log('Developers reset to default:', defaultDevelopers);
    
    return c.json({ 
      success: true, 
      message: 'Developers reset to default', 
      developers: defaultDevelopers 
    });
  } catch (error) {
    console.error('Reset developers error:', error);
    return c.json({ error: 'Failed to reset developers' }, 500);
  }
});

app.post('/make-server-7839915e/developers', async (c) => {
  try {
    const { name } = await c.req.json();
    
    if (!name || !name.trim()) {
      return c.json({ error: 'Developer name is required' }, 400);
    }

    const developersData = await kv.get('developers');
    const developers = developersData ? JSON.parse(developersData) : [];
    
    // Generate ID and avatar
    const newId = `dev-${Date.now()}`;
    const avatar = name.trim().substring(0, 2).toUpperCase();
    
    const newDeveloper = {
      id: newId,
      name: name.trim(),
      avatar: avatar,
      status: 'idle'
    };
    
    developers.push(newDeveloper);
    await kv.set('developers', JSON.stringify(developers));
    
    // Log activity
    const activitiesData = await kv.get('activities');
    const activities = activitiesData ? JSON.parse(activitiesData) : [];
    activities.push({
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'developer_added',
      actorId: 'pm-sarah',
      actorName: 'PM (김재연)',
      metadata: {
        developerName: name.trim()
      }
    });
    await kv.set('activities', JSON.stringify(activities));
    
    return c.json(newDeveloper);
  } catch (error) {
    console.error('Add developer error:', error);
    return c.json({ error: 'Failed to add developer' }, 500);
  }
});

// ===== TASK REQUESTS =====

app.get('/make-server-7839915e/task-requests', async (c) => {
  try {
    const requests = await kv.get('task_requests');
    return c.json(requests ? JSON.parse(requests) : []);
  } catch (error) {
    console.error('Get task requests error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/task-requests', async (c) => {
  try {
    const newRequest = await c.req.json();
    const requestsData = await kv.get('task_requests');
    const requests = requestsData ? JSON.parse(requestsData) : [];
    
    const taskRequest = {
      ...newRequest,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.unshift(taskRequest);
    await kv.set('task_requests', JSON.stringify(requests));
    
    // Send Slack notification to PM
    const developerMap: Record<string, string> = {
      'dev-1': '김재연',
      'dev-2': '김남준',
      'dev-3': '배병윤',
      'dev-4': '이민재',
      'dev-5': '김우영'
    };
    
    const developerName = developerMap[newRequest.developerId] || newRequest.developerId;
    await sendSlackNotification({
      event: 'task_requested',
      developer: developerName,
      taskTitle: newRequest.title || '새 작업 요청',
      pmName: '김재연'
    });
    
    return c.json(taskRequest);
  } catch (error) {
    console.error('Create task request error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch('/make-server-7839915e/task-requests/:id/approve', async (c) => {
  try {
    const id = c.req.param('id');
    const { notes } = await c.req.json();
    
    const requestsData = await kv.get('task_requests');
    const requests = requestsData ? JSON.parse(requestsData) : [];
    const index = requests.findIndex((r: any) => r.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Task request not found' }, 404);
    }
    
    if (requests[index].status !== 'pending') {
      return c.json({ error: 'Task request already reviewed' }, 400);
    }
    
    const request = requests[index];
    
    // Update request status
    requests[index].status = 'approved';
    requests[index].reviewedAt = new Date().toISOString();
    requests[index].reviewNotes = notes;
    
    await kv.set('task_requests', JSON.stringify(requests));
    
    // Create actual task from the approved request
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: request.title,
      description: request.description,
      assignee: request.developerId,
      status: 'assigned',
      priority: request.estimatedSize === 'large' ? 'high' : request.estimatedSize === 'medium' ? 'medium' : 'low',
      complexity: request.estimatedSize || 'medium', // small, medium, large
      paths: request.suggestedPaths,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'), // 7 days from now
      acceptanceCriteria: [],
      createdAt: new Date().toISOString(),
      requestId: request.id // Link back to the original request
    };
    
    tasks.push(newTask);
    await kv.set('tasks', JSON.stringify(tasks));
    
    console.log('✅ Task request approved and task created:', { requestId: id, taskId: newTask.id });
    
    return c.json(requests[index]);
  } catch (error) {
    console.error('Approve task request error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch('/make-server-7839915e/task-requests/:id/reject', async (c) => {
  try {
    const id = c.req.param('id');
    const { notes } = await c.req.json();
    
    const requestsData = await kv.get('task_requests');
    const requests = requestsData ? JSON.parse(requestsData) : [];
    const index = requests.findIndex((r: any) => r.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Task request not found' }, 404);
    }
    
    if (requests[index].status !== 'pending') {
      return c.json({ error: 'Task request already reviewed' }, 400);
    }
    
    requests[index].status = 'rejected';
    requests[index].reviewedAt = new Date().toISOString();
    requests[index].reviewNotes = notes || 'No feedback provided';
    
    await kv.set('task_requests', JSON.stringify(requests));
    
    return c.json(requests[index]);
  } catch (error) {
    console.error('Reject task request error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Clear all data (for resetting the database)
app.post('/make-server-7839915e/clear-all', async (c) => {
  try {
    await kv.set('tasks', JSON.stringify([]));
    await kv.set('developers', JSON.stringify([]));
    await kv.set('leases', JSON.stringify([]));
    await kv.set('pull_requests', JSON.stringify([]));
    await kv.set('path_locks', JSON.stringify([]));
    await kv.set('task_requests', JSON.stringify([]));
    await kv.set('activities', JSON.stringify([]));
    
    return c.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Clear all error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Activity Log endpoints
app.get('/make-server-7839915e/activities', async (c) => {
  try {
    const activitiesData = await kv.get('activities');
    const activities = activitiesData ? JSON.parse(activitiesData) : [];
    
    // Sort by timestamp descending (newest first)
    activities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-7839915e/activities', async (c) => {
  try {
    const activity = await c.req.json();
    
    const activitiesData = await kv.get('activities');
    const activities = activitiesData ? JSON.parse(activitiesData) : [];
    
    activities.push(activity);
    await kv.set('activities', JSON.stringify(activities));
    
    return c.json(activity);
  } catch (error) {
    console.error('Log activity error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-7839915e/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Slack notification endpoint
app.post('/make-server-7839915e/slack-notify', async (c) => {
  try {
    console.log('📥 Received Slack notification request');
    const params = await c.req.json();
    console.log('📋 Notification params:', params);
    
    await sendSlackNotification(params);
    console.log('✅ Slack notification sent successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Slack notification endpoint error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Migration endpoint: Move task_completed activities from PM to developers
app.post('/make-server-7839915e/migrate-activities', async (c) => {
  try {
    console.log('🔄 Starting activity migration...');
    
    const activitiesData = await kv.get('activities');
    const activities = activitiesData ? JSON.parse(activitiesData) : [];
    console.log(`  Found ${activities.length} total activities`);
    
    const tasksData = await kv.get('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    console.log(`  Found ${tasks.length} total tasks`);
    
    const developerMap: Record<string, string> = {
      'dev-1': '김재연',
      'dev-2': '김남준',
      'dev-3': '배병윤',
      'dev-4': '이민재',
      'dev-5': '김우영'
    };
    
    let migratedCount = 0;
    
    activities.forEach((activity: any) => {
      // Only migrate task_completed activities that were wrongly attributed to PM
      if (activity.type === 'task_completed' && (activity.actorId === 'pm' || activity.actorId === 'pm-sarah')) {
        // Find the task to get the actual developer
        const task = tasks.find((t: any) => t.id === activity.taskId);
        
        if (task && task.assignee) {
          const developerId = task.assignee;
          const developerName = developerMap[developerId] || developerId;
          
          console.log(`  ✓ Migrating task "${activity.taskTitle}" from PM to ${developerName}`);
          
          activity.actorId = developerId;
          activity.actorName = developerName;
          migratedCount++;
        } else {
          console.log(`  ⚠️  Could not find task for activity "${activity.taskTitle}"`);
        }
      }
    });
    
    if (migratedCount > 0) {
      await kv.set('activities', JSON.stringify(activities));
    }
    
    console.log(`✅ Migration complete. ${migratedCount} activities migrated.`);
    
    return c.json({ 
      success: true, 
      message: `Successfully migrated ${migratedCount} task_completed activities from PM to developers`,
      migratedCount 
    });
  } catch (error) {
    console.error('Migration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

Deno.serve(app.fetch);