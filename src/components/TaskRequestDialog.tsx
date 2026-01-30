import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Lightbulb, X, FolderGit, GitBranch } from 'lucide-react';
import { taskRequestStore } from '../lib/taskRequests';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';

interface TaskRequestDialogProps {
  developerId: string;
  developerName: string;
}

export default function TaskRequestDialog({ developerId, developerName }: TaskRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Load repositories
  useEffect(() => {
    if (open) {
      api.getRepositories()
        .then(repos => {
          setRepositories(repos);
          if (!selectedRepo && repos.length > 0) {
            setSelectedRepo(repos[0].fullName);
          }
        })
        .catch(console.error);
    }
  }, [open]);

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
      }
    };

    fetchBranches();
  }, [selectedRepo]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !reasoning.trim()) {
      return;
    }

    taskRequestStore.create({
      developerId,
      developerName,
      title: title.trim(),
      description: description.trim(),
      reasoning: reasoning.trim(),
      estimatedSize: size,
      suggestedPaths: [], // Deprecated: using repository instead
      repository: selectedRepo === 'none' ? undefined : selectedRepo,
      branch: selectedBranch === 'none' || !selectedBranch ? undefined : selectedBranch
    });

    // Reset form
    setTitle('');
    setDescription('');
    setReasoning('');
    setSize('medium');
    setSelectedRepo('');
    setSelectedBranch('');
    setOpen(false);
    toast.success('작업 요청이 제출되었습니다');
  };

  const canSubmit = title.trim() && description.trim() && reasoning.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lightbulb className="w-4 h-4" />
          작업 제안하기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            새 작업 제안
          </DialogTitle>
          <DialogDescription>
            기능이나 개선 아이디어가 있으신가요? PM에게 제안해보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Repository Selection */}
            <div className="space-y-2">
              <Label htmlFor="repo">대상 리포지토리 (선택사항)</Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger id="repo" className="bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FolderGit className="w-4 h-4 text-slate-500" />
                    <SelectValue placeholder="리포지토리 선택..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 안함</SelectItem>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.fullName}>
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="branch">작업 브랜치 (선택사항)</Label>
              <Select 
                value={selectedBranch} 
                onValueChange={setSelectedBranch}
                disabled={!selectedRepo || selectedRepo === 'none' || branches.length === 0}
              >
                <SelectTrigger id="branch" className="bg-slate-50">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-slate-500" />
                    <SelectValue placeholder={
                      !selectedRepo || selectedRepo === 'none' 
                        ? "리포지토리 먼저 선택" 
                        : "브랜치 선택..."
                    } />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 안함</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">작업 제목 *</Label>
            <Input
              id="title"
              placeholder="예: 다크모드 토글 추가"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">작업 내용 *</Label>
            <Textarea
              id="description"
              placeholder="작업 내용을 자세히 설명해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="reasoning">작업이 필요한 이유 *</Label>
            <Textarea
              id="reasoning"
              placeholder="이 작업이 가져올 가치를 설명해주세요..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={3}
            />
          </div>

          {/* Size Estimate */}
          <div className="space-y-2">
            <Label htmlFor="size">예상 소요 시간</Label>
            <Select value={size} onValueChange={(v) => setSize(v as any)}>
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">소형 (1-2시간)</SelectItem>
                <SelectItem value="medium">중형 (반나절)</SelectItem>
                <SelectItem value="large">대형 (1일 이상)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="mb-2">PM이 다음과 같이 처리할 수 있습니다:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>승인하고 회원님께 할당</li>
                  <li>승인하고 다른 개발자에게 할당</li>
                  <li>추가 정보 요청</li>
                  <li>피드백과 함께 거절</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            요청 제출
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}