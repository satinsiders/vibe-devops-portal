import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { pmActions } from '../lib/pmActions';
import type { Task } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';
import { useDevelopers } from '../lib/useDevelopers';
import { activityLog } from '../lib/activityLog';
import { sendSlackNotification } from '../lib/slackNotifications';

interface ReassignDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReassignDialog({ task, open, onOpenChange }: ReassignDialogProps) {
  const { developers } = useDevelopers();
  const [newAssignee, setNewAssignee] = useState('');

  const handleReassign = async () => {
    if (!newAssignee || newAssignee === task.assignee) {
      return;
    }

    const previousDev = developers.find(d => d.id === task.assignee);
    const newDev = developers.find(d => d.id === newAssignee);

    await pmActions.reassignTask(task.id, newAssignee);
    
    // Log activity
    await activityLog.log({
      type: 'task_assigned',
      taskId: task.id,
      taskTitle: task.title,
      actorId: 'pm-sarah',
      actorName: 'PM (김재연)',
      metadata: {
        previousAssignee: task.assignee,
        previousAssigneeName: previousDev?.name,
        newAssignee: newAssignee,
        newAssigneeName: newDev?.name
      }
    });
    
    // Send Slack notification to new assignee
    if (newDev) {
      await sendSlackNotification({
        event: 'task_reassigned',
        developer: newDev.name,
        taskTitle: task.title,
        taskId: task.id,
        pmName: '김재연'
      });
    }

    onOpenChange(false);
    setNewAssignee('');
    toast.success('작업이 재할당되었습니다');
  };

  const currentAssignee = developers.find(d => d.id === task.assignee);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>작업 재할당</DialogTitle>
          <DialogDescription>
            작업 담당자를 변경하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">작업:</p>
            <p className="text-slate-900">{task.title}</p>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">현재 담당자:</p>
            <p className="text-slate-900">{currentAssignee?.name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reassign-to">재할당 대상:</Label>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger id="reassign-to">
                <SelectValue placeholder="개발자 선택..." />
              </SelectTrigger>
              <SelectContent>
                {developers
                  .filter(dev => dev.id !== task.assignee)
                  .map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleReassign} disabled={!newAssignee || newAssignee === task.assignee}>
            재할당
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}