import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Edit, Plus, X } from 'lucide-react';
import { pmActions } from '../lib/pmActions';
import { developers } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';
import { activityLog } from '../lib/activityLog';
import { sendSlackNotification } from '../lib/slackNotifications';
import type { Task } from '../lib/mockData';

interface PMTaskEditDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PMTaskEditDialog({ task, open, onOpenChange }: PMTaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [complexity, setComplexity] = useState<'small' | 'medium' | 'large'>('medium');
  const [deadline, setDeadline] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [newPath, setNewPath] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setComplexity(task.complexity);
      setDeadline(task.deadline);
      setPaths(task.paths || []);
    }
  }, [open, task]);

  const handleAddPath = () => {
    if (newPath.trim() && !paths.includes(newPath.trim())) {
      setPaths([...paths, newPath.trim()]);
      setNewPath('');
    }
  };

  const handleRemovePath = (path: string) => {
    setPaths(paths.filter(p => p !== path));
  };

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim() || !deadline) {
      return;
    }

    setLoading(true);
    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        complexity,
        deadline,
        paths
      });

      // Log activity
      await activityLog.log({
        type: 'task_edited',
        taskId: task.id,
        taskTitle: title.trim(),
        actorId: 'pm-sarah',
        actorName: 'PM (김재연)',
        metadata: {
          changes: {
            title: task.title !== title.trim(),
            description: task.description !== description.trim(),
            priority: task.priority !== priority,
            complexity: task.complexity !== complexity,
            deadline: task.deadline !== deadline,
            paths: JSON.stringify(task.paths) !== JSON.stringify(paths)
          }
        }
      });

      // Send Slack notification to task assignee
      const assigneeDev = developers.find(d => d.id === task.assignee);
      if (assigneeDev) {
        const changesList = [];
        if (task.title !== title.trim()) changesList.push('제목');
        if (task.description !== description.trim()) changesList.push('설명');
        if (task.priority !== priority) changesList.push('우선순위');
        if (task.complexity !== complexity) changesList.push('작업 크기');
        if (task.deadline !== deadline) changesList.push('마감일');
        if (JSON.stringify(task.paths) !== JSON.stringify(paths)) changesList.push('파일 경로');
        
        await sendSlackNotification({
          event: 'task_edited',
          developer: assigneeDev.name,
          taskTitle: title.trim(),
          taskId: task.id,
          pmName: '김재연',
          changes: changesList.join(', ')
        });
      }

      onOpenChange(false);
      toast.success('작업이 수정되었습니다');
    } catch (error) {
      toast.error('작업 수정에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const canUpdate = title.trim() && description.trim() && deadline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            작업 수정
          </DialogTitle>
          <DialogDescription>
            작업 세부사항을 수정하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">작업 제목 *</Label>
            <Input
              id="edit-title"
              placeholder="예: 사용자 설정 페이지 추가"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">설명 *</Label>
            <Textarea
              id="edit-description"
              placeholder="작업 내용을 설명해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">마감일 *</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">우선순위</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger id="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-complexity">작업 크기</Label>
            <Select value={complexity} onValueChange={(v) => setComplexity(v as any)}>
              <SelectTrigger id="edit-complexity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">소형 (1-2시간)</SelectItem>
                <SelectItem value="medium">중형 (반나절)</SelectItem>
                <SelectItem value="large">대형 (1일 이상)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>파일 경로 (선택사항)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="/apps/web/src/..."
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPath())}
              />
              <Button type="button" variant="outline" onClick={handleAddPath}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {paths.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {paths.map(path => (
                  <Badge key={path} variant="secondary" className="gap-1">
                    <code className="text-xs">{path}</code>
                    <button
                      type="button"
                      onClick={() => handleRemovePath(path)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleUpdate} disabled={!canUpdate || loading}>
            수정 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}