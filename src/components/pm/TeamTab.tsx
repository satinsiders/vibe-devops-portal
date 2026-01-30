import { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, XCircle, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { priorityColor, priorityLabel, statusLabel } from './constants';
import type { Task } from '../../lib/mockData';
import { useDevelopers } from '../../lib/useDevelopers';

interface TeamTabProps {
  tasks: any[];
  pullRequests: any[];
  onSetCreateTaskOpen: (open: boolean) => void;
  onSetEditingTask: (task: Task) => void;
  onSetReassigningTask: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => Promise<void>;
  onSetPreSelectedDeveloper: (devId: string) => void;
  onSetAddDeveloperOpen: (open: boolean) => void;
}

export default function TeamTab({ 
  tasks, 
  pullRequests,
  onSetCreateTaskOpen,
  onSetEditingTask,
  onSetReassigningTask,
  onDeleteTask,
  onSetPreSelectedDeveloper,
  onSetAddDeveloperOpen
}: TeamTabProps) {
  const { developers, loading, refreshDevelopers } = useDevelopers();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">팀 & 작업</h2>
          <p className="text-slate-600">개발자별 작업 현황 및 관리</p>
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
                    devTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
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
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>마감 {task.deadline}</span>
                              <span>•</span>
                              <span>{task.paths.length}개 파일</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}