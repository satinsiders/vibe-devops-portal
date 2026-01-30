import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  CheckCircle,
  Clock,
  GitPullRequest,
  UserPlus,
  Edit,
  XCircle,
  Activity as ActivityIcon
} from 'lucide-react';
import { activityLog, type Activity } from '../../lib/activityLog';
import { useDevelopers } from '../../lib/useDevelopers';

const activityIcons = {
  task_created: UserPlus,
  task_started: Edit,
  task_assigned: Edit,
  pr_submitted: GitPullRequest,
  pr_approved: CheckCircle,
  task_completed: CheckCircle,
  task_edited: Edit,
  task_deleted: XCircle
};

const activityColors = {
  task_created: 'text-blue-600 bg-blue-50',
  task_started: 'text-purple-600 bg-purple-50',
  task_assigned: 'text-orange-600 bg-orange-50',
  pr_submitted: 'text-indigo-600 bg-indigo-50',
  pr_approved: 'text-green-600 bg-green-50',
  task_completed: 'text-green-600 bg-green-50',
  task_edited: 'text-yellow-600 bg-yellow-50',
  task_deleted: 'text-red-600 bg-red-50'
};

const activityLabels = {
  task_created: '작업 생성됨',
  task_started: '작업 시작됨',
  task_assigned: '작업 재할당됨',
  pr_submitted: 'PR 제출됨',
  pr_approved: 'PR 승인됨',
  task_completed: '작업 완료됨',
  task_edited: '작업 수정됨',
  task_deleted: '작업 삭제됨'
};

export default function TimelineTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [developerFilter, setDeveloperFilter] = useState<string>('all');
  const { developers } = useDevelopers();

  useEffect(() => {
    loadActivities();
    const unsubscribe = activityLog.subscribe(loadActivities);
    return unsubscribe;
  }, []);

  const loadActivities = async () => {
    const data = await activityLog.load();
    setActivities(data);
  };

  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    // Only show completed tasks
    if (activity.type !== 'task_completed') {
      return false;
    }
    
    // Time filter
    let matchesTime = true;
    if (filter === 'today') {
      matchesTime = activityDate.toDateString() === now.toDateString();
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = activityDate >= weekAgo;
    }
    
    // Developer filter
    const matchesDeveloper = developerFilter === 'all' || activity.actorId === developerFilter;
    
    return matchesTime && matchesDeveloper;
  });

  const groupedByDate = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">완료된 작업</h2>
          <p className="text-slate-600">승인되고 완료된 작업 기록</p>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* Developer Filter */}
          <select
            value={developerFilter}
            onChange={(e) => setDeveloperFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors"
          >
            <option value="all">전체 개발자</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.id}>{dev.name}</option>
            ))}
          </select>
          
          {/* Time Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'today' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              이번 주
            </button>
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-slate-900 mb-2">완료된 작업이 없습니다</h3>
          <p className="text-slate-600">
            {filter === 'all' 
              ? 'PR이 승인되면 완료된 작업이 여기에 표시됩니다' 
              : '선택한 기간에 완료된 작업이 없습니다'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dateActivities]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-slate-700">{date}</h3>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-3 ml-7">
                {dateActivities.map((activity) => {
                  const Icon = activityIcons[activity.type] || ActivityIcon;
                  const developer = developers.find(d => d.id === activity.actorId);
                  
                  return (
                    <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activityLabels[activity.type]}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(activity.timestamp).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <p className="text-slate-900 mb-1">
                            <span className="font-medium">{activity.taskTitle}</span>
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{developer?.name || activity.actorName}</span>
                            {activity.metadata?.prUrl && (
                              <>
                                <span>•</span>
                                <a
                                  href={activity.metadata.prUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  PR 보기
                                </a>
                              </>
                            )}
                            {activity.metadata?.previousAssignee && activity.metadata?.newAssignee && (
                              <>
                                <span>•</span>
                                <span className="text-xs">
                                  {developers.find(d => d.id === activity.metadata?.previousAssignee)?.name} → {' '}
                                  {developers.find(d => d.id === activity.metadata?.newAssignee)?.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}