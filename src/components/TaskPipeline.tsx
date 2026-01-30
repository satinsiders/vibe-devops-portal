import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  FileText, 
  UserCircle, 
  Calendar, 
  FolderTree,
  Clock,
  Plus,
  ChevronRight
} from 'lucide-react';
import { tasks, developers } from '../lib/mockData';
import type { Task } from '../lib/mockData';

interface TaskPipelineProps {
  developerId?: string;
}

const statusColumns = [
  { id: 'draft', label: 'Draft', color: 'bg-slate-100' },
  { id: 'ready', label: 'Ready', color: 'bg-blue-100' },
  { id: 'assigned', label: 'Assigned', color: 'bg-purple-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-orange-100' },
  { id: 'pr', label: 'PR Open', color: 'bg-yellow-100' },
  { id: 'review', label: 'In Review', color: 'bg-cyan-100' },
  { id: 'merge-queue', label: 'Merge Queue', color: 'bg-green-100' },
  { id: 'done', label: 'Done', color: 'bg-green-200' },
];

export default function TaskPipeline({ developerId }: TaskPipelineProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = developerId 
    ? tasks.filter(t => t.assignee === developerId)
    : tasks;

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(t => t.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">
            {developerId ? 'My Tasks' : 'Task Pipeline'}
          </h1>
          <p className="text-slate-600">
            {developerId 
              ? 'Your assigned tasks and their progress' 
              : 'Kanban view of all tasks across the team'}
          </p>
        </div>
        {!developerId && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      {/* Pipeline Board */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statusColumns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id}>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-slate-900">{column.label}</h3>
                    <Badge variant="secondary">{columnTasks.length}</Badge>
                  </div>
                  <div className={`h-1 rounded-full ${column.color}`} />
                </div>

                <div className="space-y-3">
                  {columnTasks.map(task => {
                    const assignee = developers.find(d => d.id === task.assignee);
                    
                    return (
                      <Card 
                        key={task.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={
                              task.priority === 'high' ? 'destructive' : 
                              task.priority === 'medium' ? 'default' : 
                              'secondary'
                            }>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.complexity}
                            </Badge>
                          </div>
                          
                          <h4 className="text-slate-900 mb-2">{task.title}</h4>
                          <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                            {task.description}
                          </p>

                          <div className="space-y-2 text-sm">
                            {assignee && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <UserCircle className="w-4 h-4" />
                                <span>{assignee.name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>{task.deadline}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600">
                              <FolderTree className="w-4 h-4" />
                              <span>{task.paths.length} path{task.paths.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {task.branch && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                                {task.branch}
                              </code>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedTask.title}</CardTitle>
                <p className="text-slate-600 mt-2">{selectedTask.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 mb-2">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                      {developers.find(d => d.id === selectedTask.assignee)?.avatar}
                    </div>
                    <p className="text-slate-900">
                      {developers.find(d => d.id === selectedTask.assignee)?.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 mb-2">Status & Priority</p>
                  <div className="flex gap-2">
                    <Badge>{selectedTask.status}</Badge>
                    <Badge variant={
                      selectedTask.priority === 'high' ? 'destructive' : 
                      selectedTask.priority === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {selectedTask.priority}
                    </Badge>
                    <Badge variant="outline">{selectedTask.complexity}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 mb-2">Timeline</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4" />
                    <span>Due {selectedTask.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 mb-2">File Paths</p>
                  <div className="space-y-1">
                    {selectedTask.paths.map(path => (
                      <code key={path} className="block text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {path}
                      </code>
                    ))}
                  </div>
                </div>

                {selectedTask.branch && (
                  <div>
                    <p className="text-slate-500 mb-2">Branch</p>
                    <code className="block text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {selectedTask.branch}
                    </code>
                  </div>
                )}

                {selectedTask.prUrl && (
                  <div>
                    <p className="text-slate-500 mb-2">Pull Request</p>
                    <Button variant="outline" size="sm">
                      View PR {selectedTask.prUrl}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-2">Acceptance Criteria</p>
              <ul className="space-y-2">
                {selectedTask.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!developerId && (
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button variant="outline">Edit Task</Button>
                <Button variant="outline">Reassign</Button>
                <Button variant="outline">Change Priority</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}