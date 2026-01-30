import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus,
  Clock,
  Edit,
  XCircle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CheckCircle2,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { priorityColor, priorityLabel, statusLabel } from './constants';
import { useDevelopers } from '../../lib/useDevelopers';
import type { Task } from '../../lib/mockData';

interface OverviewTabProps {
  tasks: any[];
  pullRequests: any[];
  leases: any[];
  pendingRequests: any[];
  onExtendAllLeases: () => void;
  onSetSelectedTab: (tab: string) => void;
  onApprovePR: (prId: string) => void;
  onApproveAllPassing: () => void;
  onSetPreSelectedDeveloper: (devId: string) => void;
  onSetCreateTaskOpen: (open: boolean) => void;
  onSetEditingTask: (task: Task) => void;
  onSetReassigningTask: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => Promise<void>;
  onSetAddDeveloperOpen: (open: boolean) => void;
}

export default function OverviewTab({
  tasks,
  pullRequests,
  leases,
  pendingRequests,
  onExtendAllLeases,
  onSetSelectedTab,
  onApprovePR,
  onApproveAllPassing,
  onSetPreSelectedDeveloper,
  onSetCreateTaskOpen,
  onSetEditingTask,
  onSetReassigningTask,
  onDeleteTask,
  onSetAddDeveloperOpen
}: OverviewTabProps) {
  const { developers } = useDevelopers();
  const activeTasks = tasks.filter(t => ['in-progress', 'pr', 'review'].includes(t.status));
  const needsReview = pullRequests.filter(pr => pr.status === 'open');
  const expiringLeases = leases.filter(l => l.status === 'expiring');
  const [expandedDevelopers, setExpandedDevelopers] = useState<Set<string>>(new Set());
  
  // Auto-expand all developers when they load
  useEffect(() => {
    if (developers.length > 0) {
      setExpandedDevelopers(new Set(developers.map((d: any) => d.id)));
    }
  }, [developers]);

  const toggleDeveloper = (devId: string) => {
    setExpandedDevelopers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(devId)) {
        newSet.delete(devId);
      } else {
        newSet.add(devId);
      }
      return newSet;
    });
  };

  const handleCreateTaskForDeveloper = (devId: string) => {
    onSetPreSelectedDeveloper(devId);
    onSetCreateTaskOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert Cards */}
      {(expiringLeases.length > 0 || pendingRequests.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {expiringLeases.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1.5">리스 만료 임박</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {expiringLeases.length}개의 리스가 곧 만료됩니다
                    </p>
                    <Button size="sm" variant="outline" onClick={onExtendAllLeases}>
                      전체 연장
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {pendingRequests.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1.5">작업 제안</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {pendingRequests.length}개의 작업 요청이 대기 중입니다
                    </p>
                    <Button size="sm" onClick={() => onSetSelectedTab('requests')}>
                      검토하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">진행 중인 작업</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{activeTasks.length}</span>
              <span className="text-muted-foreground">/ {tasks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">승인 대기 PR</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary">{needsReview.length}</span>
              <span className="text-muted-foreground">개</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">등록된 개발자</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{developers.length}</span>
              <span className="text-muted-foreground">명</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team & Tasks - Expanded View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900">팀 & 작업</h3>
            <p className="text-slate-600 text-sm">개발자별 작업 현황 및 관리</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => onSetAddDeveloperOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            개발자 추가
          </Button>
        </div>

        <div className="grid gap-4">
          {developers.map(dev => {
            const devTasks = tasks.filter(t => t.assignee === dev.id && t.status !== 'done');
            const activeTasks = devTasks.filter(t => !['done', 'draft'].includes(t.status));
            const completedTasks = tasks.filter(t => t.assignee === dev.id && t.status === 'done');
            const devPRs = pullRequests.filter(pr => pr.authorId === dev.id && pr.status === 'open');
            const isExpanded = expandedDevelopers.has(dev.id);

            return (
              <Card key={dev.id} className="overflow-hidden">
                {/* Developer Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleDeveloper(dev.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {dev.avatar}
                      </div>
                      <div>
                        <h3 className="text-slate-900">{dev.name}</h3>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>{activeTasks.length}개 진행 중</span>
                          <span>•</span>
                          <span>{completedTasks.length}개 완료</span>
                          <span>•</span>
                          <span>{devPRs.length}개 오픈 PR</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateTaskForDeveloper(dev.id);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        작업 추가
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Task List */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
                    {devTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        할당된 작업이 없습니다
                      </div>
                    ) : (
                      devTasks.map(task => {
                        // Find associated PR for this task - match by taskId
                        const taskPR = pullRequests.find(pr => 
                          pr.taskId === task.id && 
                          pr.status === 'open'
                        );
                        const isInReview = ['pr', 'review', 'in-review'].includes(task.status);

                        return (
                          <div 
                            key={task.id} 
                            className={`p-4 rounded-lg transition-all ${
                              isInReview 
                                ? 'bg-primary/5 border-2 border-primary/20 hover:border-primary/30' 
                                : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-slate-900">{task.title}</h4>
                                  <Badge className={priorityColor[task.priority]}>
                                    {priorityLabel[task.priority]}
                                  </Badge>
                                  <Badge variant="outline">
                                    {statusLabel[task.status]}
                                  </Badge>
                                  {isInReview && (
                                    <Badge variant="default">
                                      승인 필요
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span>마감 {task.deadline}</span>
                                  <span>•</span>
                                  <span>{task.paths.length}개 파일</span>
                                  {taskPR && (
                                    <>
                                      <span>•</span>
                                      <span>PR #{taskPR.number}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Task Management Buttons */}
                            <div className="flex gap-2">
                              {isInReview && taskPR && (
                                <Button 
                                  size="sm" 
                                  onClick={() => onApprovePR(taskPR.id)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  승인 & 머지
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onSetEditingTask(task)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                수정
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onSetReassigningTask(task)}
                              >
                                재할당
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => onDeleteTask(task.id, task.title)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                삭제
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}