import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, X } from 'lucide-react';
import { pmActions } from '../lib/pmActions';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';
import { useDevelopers } from '../lib/useDevelopers';
import { activityLog } from '../lib/activityLog';
import { sendSlackNotification } from '../lib/slackNotifications';
import { Checkbox } from './ui/checkbox';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedDeveloper?: string;
  selectedRepo: string;
}

export default function TaskCreateDialog({ open, onOpenChange, preSelectedDeveloper, selectedRepo }: TaskCreateDialogProps) {
  const { developers } = useDevelopers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [complexity, setComplexity] = useState<'small' | 'medium' | 'large'>('medium');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [newPath, setNewPath] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ghost Branch State
  const [ghostBranch, setGhostBranch] = useState('');

  // Auto-generate Ghost Branch name when title or repo changes
  useEffect(() => {
    if (!title.trim() || !selectedRepo) {
      setGhostBranch('');
      return;
    }
    
    // Format: feat/{repo-name}/{kebab-case-title}
    // Clean repo name: remove owner, keep repo (e.g. "vibe-dev-ops/frontend" -> "frontend")
    const repoName = selectedRepo.split('/')[1] || selectedRepo;
    
    // Clean title: english/korean mix -> kebab case roughly
    // This is a simple approximation. In real app might need transliteration or UUIDs
    // For now, we'll use a simple timestamp + sanitized suffix
    const sanitizedTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with dashes
      .slice(0, 30);            // Limit length
      
    const branchName = `feat/${repoName}/${sanitizedTitle}-${Date.now().toString().slice(-4)}`;
    setGhostBranch(branchName);
  }, [title, selectedRepo]);

  // Set pre-selected developer when dialog opens
  useEffect(() => {
    if (open && preSelectedDeveloper) {
      setAssignees([preSelectedDeveloper]);
    }
  }, [open, preSelectedDeveloper]);

  const handleAddPath = () => {
    if (newPath.trim() && !paths.includes(newPath.trim())) {
      setPaths([...paths, newPath.trim()]);
      setNewPath('');
    }
  };

  const handleRemovePath = (path: string) => {
    setPaths(paths.filter(p => p !== path));
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !assignees.length || !deadline) {
      return;
    }

    setLoading(true);
    try {
      // Create multiple tasks - one for each assignee
      const newTasks = await pmActions.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        complexity,
        assignees,
        deadline,
        paths,
        repository: selectedRepo,
        branch: ghostBranch
      });

      // Log activity and send notifications for each created task
      // CRITICAL FIX: Match tasks to developers by assignees array order, not developers array order
      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i];
        const assigneeId = assignees[i]; // Use assignees array order
        const dev = developers.find(d => d.id === assigneeId); // Look up developer by ID
        
        if (!dev) {
          console.error(`⚠️ Developer not found for assignee ID: ${assigneeId}`);
          continue;
        }
        
        // Log activity for each task
        await activityLog.log({
          type: 'task_created',
          taskId: task.id,
          taskTitle: title.trim(),
          actorId: 'pm-sarah',
          actorName: 'PM (김재연)',
          metadata: {
            assignee: dev.id,
            assigneeName: dev.name
          }
        });

        // Send Slack notification to each developer
        console.log('🔔 Sending Slack notification for task assignment:', {
          event: 'task_assigned',
          developer: dev.name,
          taskTitle: title.trim(),
          taskId: task.id,
          assigneeId: assigneeId
        });
        await sendSlackNotification({
          event: 'task_assigned',
          developer: dev.name,
          taskTitle: title.trim(),
          taskId: task.id,
          pmName: '김재연'
        });
      }
      
      console.log(`✅ ${newTasks.length}개의 작업 생성 및 알림 전송 완료`);

      toast.success(`${assignees.length}명에게 작업이 할당되었습니다`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setComplexity('medium');
      setAssignees([]);
      setDeadline('');
      setPaths([]);
      setNewPath('');
      
      // Close dialog last
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('작업 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const canCreate = title.trim() && description.trim() && assignees.length && deadline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            새 작업 생성
          </DialogTitle>
          <DialogDescription>
            개발자에게 새 작업을 할당하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-title">작업 제목 *</Label>
            <Input
              id="create-title"
              placeholder="예: 사용자 설정 페이지 추가"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">설명 *</Label>
            <Textarea
              id="create-description"
              placeholder="작업 내용을 설명해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Ghost Branch Info */}
          <div className={`p-3 rounded-md border text-sm ${selectedRepo ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium flex items-center gap-1 ${selectedRepo ? 'text-slate-700' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${selectedRepo ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                Ghost Branching
              </span>
              <span className="text-xs text-slate-500">{selectedRepo || '리포지토리 미선택'}</span>
            </div>
            <div className={`font-mono border px-2 py-1 rounded text-xs ${selectedRepo ? 'text-slate-600 bg-white' : 'text-slate-400 bg-slate-50'}`}>
              {selectedRepo 
                ? (ghostBranch || '작업 제목을 입력하면 브랜치가 자동 생성됩니다...') 
                : '리포지토리가 선택되지 않아 브랜치를 생성하지 않습니다.'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedRepo ? '작업 생성 시 이 브랜치가 자동으로 예약됩니다.' : '단순 작업 관리만 수행합니다 (GitHub 연동 없음).'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>담당자 * (복수 선택 가능)</Label>
              <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
                {developers.map(dev => (
                  <div key={dev.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dev-${dev.id}`}
                      checked={assignees.includes(dev.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignees([...assignees, dev.id]);
                        } else {
                          setAssignees(assignees.filter(id => id !== dev.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`dev-${dev.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {dev.name}
                    </label>
                  </div>
                ))}
              </div>
              {assignees.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {assignees.length}명 선택됨 - 각 개발자에게 개별 작업이 생성됩니다
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-deadline">마감일 *</Label>
              <Input
                id="create-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-priority">우선순위</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger id="create-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-complexity">작업 크기</Label>
              <Select value={complexity} onValueChange={(v) => setComplexity(v as any)}>
                <SelectTrigger id="create-complexity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">소형 (1-2시간)</SelectItem>
                  <SelectItem value="medium">중형 (반나절)</SelectItem>
                  <SelectItem value="large">대형 (1일 이상)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || loading}>
            작업 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}