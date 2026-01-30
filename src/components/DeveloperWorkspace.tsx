import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LogOut,
  CheckCircle2,
  Lightbulb,
  Lock,
  Link as LinkIcon,
  Clock,
  Play,
  CheckCheck,
  GitBranch,
  FolderGit
} from 'lucide-react';
import type { User } from '../App';
import { toast } from 'sonner@2.0.3';
import TaskRequestDialog from './TaskRequestDialog';
import TaskEditDialog from './TaskEditDialog';
import * as api from '../lib/api';
import { taskRequestStore } from '../lib/taskRequests';
import { activityLog } from '../lib/activityLog';

interface DeveloperWorkspaceProps {
  user: User;
  onLogout: () => void;
}

const priorityColor = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-orange-600 bg-orange-50 border-orange-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200'
};

const priorityLabel = {
  high: '높음',
  medium: '보통',
  low: '낮음'
};

const complexityLabel = {
  small: '소형',
  medium: '중형',
  large: '대형'
};

// TaskCard component defined OUTSIDE of the parent component to prevent re-creation
const TaskCard = memo(({ 
  task, 
  showStartButton = false, 
  showPRForm = false, 
  showEditButton = false,
  prUrl,
  onPrUrlChange,
  onSubmitPR,
  onStartTask,
  submittingPR,
  startingTask,
  onTaskUpdated,
  userName
}: { 
  task: any; 
  showStartButton?: boolean; 
  showPRForm?: boolean; 
  showEditButton?: boolean;
  prUrl?: string;
  onPrUrlChange?: (value: string) => void;
  onSubmitPR?: () => void;
  onStartTask?: () => void;
  submittingPR?: boolean;
  startingTask?: boolean;
  onTaskUpdated?: () => void;
  userName?: string;
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-slate-900">{task.title}</h3>
          <Badge className={priorityColor[task.priority]}>
            {priorityLabel[task.priority]}
          </Badge>
          <Badge variant="outline">
            {complexityLabel[task.complexity]}
          </Badge>
        </div>
        <p className="text-slate-600 mb-3">{task.description}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>마감: {task.deadline}</span>
          <span>•</span>
          <span>{task.paths.length}개 파일</span>
        </div>
      </div>
      {showEditButton && onTaskUpdated && userName && (
        <TaskEditDialog task={task} onTaskUpdated={onTaskUpdated} developerName={userName} />
      )}
    </div>

    {/* Allowed Paths */}
    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
      <div className="flex gap-4">
        {/* Git Context */}
        {task.branch && (
          <div className="flex-1 border-r border-slate-200 pr-4 mr-4">
            <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              Ghost Branch
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-700">
                  {task.branch}
                </code>
              </div>
              {task.repository && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FolderGit className="w-3 h-3" />
                  <span>{task.repository}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paths */}
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            작업 경로
          </p>
          <div className="grid grid-cols-1 gap-1">
            {task.paths.map((path: string) => (
              <div key={path} className="flex items-center gap-2">
                <code className="text-xs text-slate-900">{path}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Acceptance Criteria */}
    {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-2">완료 조건:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
          {task.acceptanceCriteria.map((criteria: string, idx: number) => (
            <li key={idx}>{criteria}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Start Button */}
    {showStartButton && onStartTask && (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Button 
          onClick={onStartTask}
          disabled={startingTask}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {startingTask ? '시작 중...' : '작업 시작하기'}
        </Button>
      </div>
    )}

    {/* PR Submission Form */}
    {showPRForm && onPrUrlChange && onSubmitPR && (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Label htmlFor={`pr-url-${task.id}`} className="text-sm mb-2 block">
          GitHub PR URL <span className="text-slate-400">(선택사항)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id={`pr-url-${task.id}`}
            type="url"
            placeholder="https://github.com/org/repo/pull/123"
            value={prUrl || ''}
            onChange={(e) => onPrUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submittingPR) {
                e.preventDefault();
                onSubmitPR();
              }
            }}
          />
          <Button 
            onClick={onSubmitPR}
            disabled={submittingPR}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            제출
          </Button>
        </div>
      </div>
    )}
  </Card>
));

TaskCard.displayName = 'TaskCard';

export default function DeveloperWorkspace({ user, onLogout }: DeveloperWorkspaceProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskRequests, setTaskRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [prUrls, setPrUrls] = useState<Record<string, string>>({});
  const [submittingPR, setSubmittingPR] = useState<string | null>(null);
  const [startingTask, setStartingTask] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('작업을 불러오지 못했습니다');
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Poll for updates every 5 seconds to stay in sync with PM actions
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loadTasks]);

  useEffect(() => {
    const updateRequests = () => {
      // Only show pending and rejected requests in the "내 제안" tab
      // Approved requests have been converted to tasks and show in "할당됨" tab
      const allRequests = taskRequestStore.getByDeveloper(user.id);
      const activeRequests = allRequests.filter(r => r.status === 'pending' || r.status === 'rejected');
      setTaskRequests(activeRequests);
    };
    
    taskRequestStore.load().then(updateRequests);
    taskRequestStore.startPolling(5000); // Poll every 5 seconds
    const unsubscribe = taskRequestStore.subscribe(updateRequests);
    
    return () => {
      unsubscribe();
      taskRequestStore.stopPolling();
    };
  }, [user.id]);

  const assignedTasks = tasks.filter(t => 
    t.status === 'assigned' && t.assignee === user.id
  );
  
  const inProgressTasks = tasks.filter(t => 
    t.status === 'in-progress' && t.assignee === user.id
  );
  
  const inReviewTasks = tasks.filter(t => 
    t.status === 'in-review' && t.assignee === user.id
  );
  
  const completedTasks = tasks.filter(t => 
    t.status === 'done' && t.assignee === user.id
  );

  const handleStartTask = useCallback(async (taskId: string) => {
    setStartingTask(taskId);
    const task = tasks.find(t => t.id === taskId);
    
    try {
      await api.startTask(taskId, user.id);
      
      // Log activity
      if (task) {
        await activityLog.log({
          type: 'task_started',
          taskId: task.id,
          taskTitle: task.title,
          actorId: user.id,
          actorName: user.name
        });
      }
      
      toast.success('작업을 시작했습니다');
      await loadTasks();
      setActiveTab('inprogress');
    } catch (error: any) {
      console.error('Failed to start task:', error);
      toast.error(error.message || '작업 시작 실패');
    } finally {
      setStartingTask(null);
    }
  }, [user.id, user.name, loadTasks, tasks]);

  const handleSubmitPR = useCallback(async (taskId: string) => {
    const prUrl = prUrls[taskId]?.trim();
    
    console.log('=== PR SUBMISSION START ===');
    console.log('Task ID:', taskId);
    console.log('PR URL:', prUrl || '(not provided)');
    console.log('Developer ID:', user.id);
    
    // Validate PR URL only if provided
    if (prUrl && (!prUrl.includes('github.com') || !prUrl.includes('pull'))) {
      console.log('❌ Validation failed: Not a GitHub PR URL');
      console.log('Must contain both "github.com" and "pull"');
      toast.error('올바른 GitHub PR URL을 입력하세요 (예: https://github.com/org/repo/pull/123)');
      return;
    }

    console.log('✅ Validation passed, submitting...');
    setSubmittingPR(taskId);
    
    try {
      const result = await api.submitPR({
        taskId,
        developerId: user.id,
        prUrl: prUrl || '' // Send empty string if no URL provided
      });
      
      console.log('✅ PR submitted successfully:', result);

      toast.success(prUrl ? 'PR이 제출되었습니다' : '작업이 리뷰로 제출되었습니다');
      setPrUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[taskId];
        return newUrls;
      });
      
      console.log('Reloading tasks...');
      await loadTasks();
      console.log('Tasks reloaded');
      
      // Switch to review tab after successful submission
      console.log('Switching to review tab...');
      setTimeout(() => {
        setActiveTab('review');
        console.log('Switched to review tab');
      }, 100);
    } catch (error: any) {
      console.error('❌ Failed to submit PR:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(error.message || 'PR 제출 실패');
    } finally {
      setSubmittingPR(null);
      console.log('=== PR SUBMISSION END ===');
    }
  }, [prUrls, user.id, loadTasks]);

  const handlePrUrlChange = useCallback((taskId: string, value: string) => {
    setPrUrls(prev => ({ ...prev, [taskId]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900">개발자 워크스페이스</h2>
            <p className="text-slate-500">바이브 코딩 작업 관리</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-slate-900">{user.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-8 py-8 max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="assigned" className="relative">
                할당됨
                {assignedTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                    {assignedTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inprogress" className="relative">
                작업 중
                {inProgressTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                    {inProgressTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="review" className="relative">
                리뷰 중
                {inReviewTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                    {inReviewTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative">
                완료됨
                {completedTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                    {completedTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                내 제안
                {taskRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                    {taskRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TaskRequestDialog 
              developerId={user.id}
              developerName={user.name}
            />
          </div>

          {/* Tab 1: Assigned Tasks */}
          <TabsContent value="assigned" className="mt-0">
            {assignedTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">할당된 작업이 없습니다</h3>
                <p className="text-slate-600">PM이 작업을 할당하면 여기에 표시됩니다</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    showStartButton={true} 
                    showEditButton={true}
                    onStartTask={() => handleStartTask(task.id)}
                    startingTask={startingTask === task.id}
                    onTaskUpdated={loadTasks}
                    userName={user.name}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: In Progress Tasks */}
          <TabsContent value="inprogress" className="mt-0">
            {inProgressTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">진행 중인 작업이 없습니다</h3>
                <p className="text-slate-600">작업을 시작하면 여기에 표시됩니다</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inProgressTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    showPRForm={true} 
                    showEditButton={true}
                    prUrl={prUrls[task.id]}
                    onPrUrlChange={(value) => handlePrUrlChange(task.id, value)}
                    onSubmitPR={() => handleSubmitPR(task.id)}
                    submittingPR={submittingPR === task.id}
                    onTaskUpdated={loadTasks}
                    userName={user.name}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: In Review Tasks */}
          <TabsContent value="review" className="mt-0">
            {inReviewTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">리뷰 중인 작업이 없습니다</h3>
                <p className="text-slate-600">PR을 제출하면 여기에 표시됩니다</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inReviewTasks.map(task => (
                  <Card key={task.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-slate-900">{task.title}</h3>
                          <Badge className={priorityColor[task.priority]}>
                            {priorityLabel[task.priority]}
                          </Badge>
                          <Badge variant="outline">
                            {complexityLabel[task.complexity]}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            리뷰 대기 중
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>마감: {task.deadline}</span>
                          <span>•</span>
                          <span>{task.paths.length}개 파일</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900">PM 승인 대기 중</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 4: Completed Tasks */}
          <TabsContent value="completed" className="mt-0">
            {completedTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">완료된 작업이 없습니다</h3>
                <p className="text-slate-600">PM이 승인한 작업이 여기에 표시됩니다</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedTasks.map(task => (
                  <Card key={task.id} className="p-6 bg-green-50/50 border-green-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <h3 className="text-slate-900">{task.title}</h3>
                          <Badge className={priorityColor[task.priority]}>
                            {priorityLabel[task.priority]}
                          </Badge>
                          <Badge variant="outline">
                            {complexityLabel[task.complexity]}
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            완료
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>마감: {task.deadline}</span>
                          <span>•</span>
                          <span>{task.paths.length}개 파일</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 5: Task Requests */}
          <TabsContent value="requests" className="mt-0">
            {taskRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">제안한 작업이 없습니다</h3>
                <p className="text-slate-600">새로운 작업을 제안해보세요</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {taskRequests.map(request => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-slate-900">{request.title}</h4>
                          {request.status === 'pending' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              대기 중
                            </Badge>
                          )}
                          {request.status === 'approved' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              승인됨 → 할당됨 탭 확인
                            </Badge>
                          )}
                          {request.status === 'rejected' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              거절됨
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                        {request.reviewNotes && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                            <span className="text-slate-700">PM 피드백: </span>
                            <span className="text-slate-600">{request.reviewNotes}</span>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => setActiveTab('assigned')}
                          >
                            할당됨 탭에서 작업 시작하기 →
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}