import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Edit, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { taskRequestStore } from '../lib/taskRequests';

interface TaskEditDialogProps {
  task: any;
  onTaskUpdated: () => void;
  developerName: string;
}

export default function TaskEditDialog({ task, onTaskUpdated, developerName }: TaskEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [proposedChanges, setProposedChanges] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [suggestedPaths, setSuggestedPaths] = useState<string[]>(task.paths || []);
  const [newPath, setNewPath] = useState('');

  const handleAddPath = () => {
    if (newPath.trim()) {
      setSuggestedPaths([...suggestedPaths, newPath.trim()]);
      setNewPath('');
    }
  };

  const handleRemovePath = (index: number) => {
    setSuggestedPaths(suggestedPaths.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!proposedChanges.trim() || !reasoning.trim()) {
      toast.error('모든 ���드를 입력하세요');
      return;
    }

    try {
      // Create a task request for the proposed edit
      await taskRequestStore.create({
        developerId: task.assignee,
        developerName: developerName, // Will be filled by the store
        title: `[수정 제안] ${task.title}`,
        description: proposedChanges.trim(),
        reasoning: reasoning.trim(),
        estimatedSize: task.complexity,
        suggestedPaths: suggestedPaths
      });

      setProposedChanges('');
      setReasoning('');
      setSuggestedPaths(task.paths || []);
      setOpen(false);
      toast.success('작업 수정 제안이 제출되었습니다');
    } catch (error) {
      console.error('Failed to submit edit proposal:', error);
      toast.error('제안 제출에 실패했습니다');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          수정 제안
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>작업 수정 제안</DialogTitle>
          <DialogDescription>
            "{task.title}" 작업에 대한 수정 사항을 PM에게 제안합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Task Details */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">현재 작업 설명:</p>
            <p className="text-sm text-slate-900">{task.description}</p>
          </div>

          {/* Proposed Changes */}
          <div className="space-y-2">
            <Label htmlFor="proposed-changes">
              제안하는 수정 사항 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="proposed-changes"
              placeholder="예: 인증 로직을 JWT에서 세션 기반으로 변경하는 것을 제안합니다"
              value={proposedChanges}
              onChange={(e) => setProposedChanges(e.target.value)}
              rows={4}
            />
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="reasoning">
              제안 이유 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reasoning"
              placeholder="예: 현재 요구사항으로는 JWT 구현이 과도하며, 세션 기반이 더 간단하고 유지보수가 쉽습니다"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={3}
            />
          </div>

          {/* Suggested Paths */}
          <div className="space-y-2">
            <Label>제안하는 작업 경로</Label>
            <div className="space-y-2">
              {suggestedPaths.map((path, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={path} disabled className="flex-1 bg-slate-50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePath(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="src/components/NewComponent.tsx"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPath();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddPath}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              제안 제출
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}