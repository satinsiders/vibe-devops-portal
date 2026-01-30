import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Zap,
  Lightbulb,
  Clock
} from 'lucide-react';
import { taskRequestStore, type TaskRequest } from '../lib/taskRequests';
import { pmActions } from '../lib/pmActions';
import TaskCreateDialog from './TaskCreateDialog';
import PMTaskEditDialog from './PMTaskEditDialog';
import ReassignDialog from './ReassignDialog';
import AddDeveloperDialog from './AddDeveloperDialog';
import type { User } from '../App';
import type { Task } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';
import { activityLog } from '../lib/activityLog';

// Modular tab components
import PMHeader from './pm/PMHeader';
import OverviewTab from './pm/OverviewTab';
import RequestsTab from './pm/RequestsTab';
import TimelineTab from './pm/TimelineTab';

interface PMControlProps {
  user: User;
  onLogout: () => void;
}

export default function PMControl({ user, onLogout }: PMControlProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [branches, setBranches] = useState<any[]>([]);
  const [taskRequests, setTaskRequests] = useState<TaskRequest[]>([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addDeveloperOpen, setAddDeveloperOpen] = useState(false);
  const [preSelectedDeveloper, setPreSelectedDeveloper] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reassigningTask, setReassigningTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch branches when repo changes
  useEffect(() => {
    if (!selectedRepo || selectedRepo === 'none') {
      setBranches([]);
      setSelectedBranch('');
      return;
    }

    const fetchBranches = async () => {
      try {
        const [owner, repo] = selectedRepo.split('/');
        if (owner && repo) {
          const branchList = await api.getBranches(owner, repo);
          setBranches(branchList);
          // Default to main if available, or first branch
          if (branchList.some((b: any) => b.name === 'main')) {
            setSelectedBranch('main');
          } else if (branchList.length > 0) {
            setSelectedBranch(branchList[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        toast.error('브랜치 목록을 불러오지 못했습니다');
      }
    };

    fetchBranches();
  }, [selectedRepo]);

  // Load data from API
  useEffect(() => {
    loadData();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [tasksData, prsData, leasesData] = await Promise.all([
        api.getTasks(),
        api.getPullRequests(),
        api.getLeases()
      ]);
      setTasks(tasksData);
      setPullRequests(prsData);
      setLeases(leasesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    }
  }

  useEffect(() => {
    const updateRequests = () => {
      setTaskRequests(taskRequestStore.getAll());
    };
    updateRequests();
    
    taskRequestStore.startPolling(5000); // Poll every 5 seconds
    const unsubscribe1 = taskRequestStore.subscribe(updateRequests);
    const unsubscribe2 = pmActions.subscribe(() => loadData());
    
    return () => {
      unsubscribe1();
      unsubscribe2();
      taskRequestStore.stopPolling();
    };
  }, []);

  const pendingRequests = taskRequests.filter(r => r.status === 'pending');
  const needsReview = pullRequests.filter(pr => pr.status === 'open');

  const handleApproveRequest = async (id: string, notes: string) => {
    try {
      await taskRequestStore.approve(id, notes);
      toast.success('작업 요청이 승인되고 작업이 생성되었습니다');
      await loadData();
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('작업 승인 실패');
    }
  };

  const handleRejectRequest = (id: string, notes: string) => {
    if (!notes.trim()) {
      toast.error('반려 사유를 입력해주세요');
      return;
    }
    taskRequestStore.reject(id, notes);
    toast.success('작업 요청이 반려되었습니다');
  };

  const handleApprovePR = async (prId: string) => {
    try {
      await pmActions.approvePR(prId);
      toast.success('PR이 승인되고 작업이 완료되었습니다');
      await loadData();
    } catch (error) {
      console.error('Failed to approve PR:', error);
      toast.error('PR 승인 실패');
    }
  };

  const handleApproveAllPassing = async () => {
    try {
      const count = await pmActions.approveAllPassing();
      toast.success(`${count}개의 PR이 승인되었습니다`);
      await loadData();
    } catch (error) {
      console.error('Failed to approve all passing PRs:', error);
      toast.error('PR 승인 실패');
    }
  };

  const handleExtendAllLeases = async () => {
    try {
      const count = await pmActions.extendAllLeases(4);
      toast.success(`${count}개의 리스가 연장되었습니다`);
      await loadData();
    } catch (error) {
      console.error('Failed to extend all leases:', error);
      toast.error('리스 연장 실패');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (confirm(`\"${taskTitle}\" 작업을 삭제하시겠습니까?\n\n진행 중인 리스가 있다면 자동으로 해제됩니다.`)) {
      setLoading(true);
      const success = await pmActions.deleteTask(taskId);
      if (success) {
        // Log activity
        await activityLog.log({
          type: 'task_deleted',
          taskId: taskId,
          taskTitle: taskTitle,
          actorId: 'pm-sarah',
          actorName: 'PM (김재연)',
          metadata: {}
        });
        
        toast.success('작업이 삭제되었습니다');
        await loadData();
      } else {
        toast.error('작업 삭제에 실패했습니다');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PMHeader 
        user={user} 
        onLogout={onLogout} 
        selectedRepo={selectedRepo} 
        onRepoChange={setSelectedRepo}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        branches={branches}
      />

      <main className="px-8 py-10 max-w-[1800px] mx-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-10">
            <TabsTrigger value="overview">
              <Zap className="w-4 h-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Lightbulb className="w-4 h-4" />
              요청 {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1.5">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="w-4 h-4" />
              타임라인
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              tasks={tasks}
              pullRequests={pullRequests}
              leases={leases}
              pendingRequests={pendingRequests}
              onExtendAllLeases={handleExtendAllLeases}
              onSetSelectedTab={setSelectedTab}
              onApprovePR={handleApprovePR}
              onApproveAllPassing={handleApproveAllPassing}
              onSetPreSelectedDeveloper={setPreSelectedDeveloper}
              onSetCreateTaskOpen={setCreateTaskOpen}
              onSetEditingTask={setEditingTask}
              onSetReassigningTask={setReassigningTask}
              onDeleteTask={handleDeleteTask}
              onSetAddDeveloperOpen={setAddDeveloperOpen}
            />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTab
              pendingRequests={pendingRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <TaskCreateDialog 
        open={createTaskOpen} 
        onOpenChange={(open) => {
          setCreateTaskOpen(open);
          if (!open) {
            setPreSelectedDeveloper(''); // Reset pre-selection
            loadData(); // Reload data after creating task
          }
        }} 
        preSelectedDeveloper={preSelectedDeveloper}
        selectedRepo={selectedRepo === 'none' ? '' : selectedRepo}
      />
      {editingTask && (
        <PMTaskEditDialog 
          task={editingTask} 
          open={!!editingTask} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(null);
              loadData(); // Reload data after editing
            }
          }} 
        />
      )}
      {reassigningTask && (
        <ReassignDialog 
          task={reassigningTask} 
          open={!!reassigningTask} 
          onOpenChange={(open) => {
            if (!open) {
              setReassigningTask(null);
              loadData(); // Reload data after reassigning
            }
          }} 
        />
      )}
      <AddDeveloperDialog
        open={addDeveloperOpen}
        onOpenChange={(open) => {
          setAddDeveloperOpen(open);
          if (!open) {
            loadData(); // Reload data after adding developer
          }
        }}
      />
    </div>
  );
}