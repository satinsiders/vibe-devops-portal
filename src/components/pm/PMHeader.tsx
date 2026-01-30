import { Button } from '../ui/button';
import { LogOut, GitBranch } from 'lucide-react';
import type { User } from '../../App';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { toast } from 'sonner@2.0.3';

interface PMHeaderProps {
  user: User;
  onLogout: () => void;
  selectedRepo: string;
  onRepoChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  branches: any[];
}

export default function PMHeader({ 
  user, 
  onLogout, 
  selectedRepo, 
  onRepoChange,
  selectedBranch,
  onBranchChange,
  branches 
}: PMHeaderProps) {
  const [repositories, setRepositories] = useState<any[]>([]);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const repos = await api.getRepositories();
        setRepositories(repos);
        
        // Set initial selection if none selected and repos exist
        if (!selectedRepo && repos.length > 0) {
          onRepoChange(repos[0].fullName);
        }
      } catch (error) {
        console.error('Failed to load repositories:', error);
        toast.error('GitHub 리포지토리를 불러오지 못했습니다');
        
        // Fallback for demo/offline
        setRepositories([
           { id: '1', name: 'vibe-dev-ops/frontend', fullName: 'vibe-dev-ops/frontend' },
           { id: '2', name: 'vibe-dev-ops/backend', fullName: 'vibe-dev-ops/backend' },
        ]);
      }
    };
    
    loadRepos();
  }, []); // Run once on mount

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="px-8 py-5 flex items-center justify-between max-w-[1800px] mx-auto">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-foreground mb-0.5">PM 관리 센터</h2>
            <p className="text-muted-foreground text-sm">팀 현황 & 워크플로우 관리</p>
          </div>
          
          <div className="flex items-center gap-2 pl-6 border-l border-border">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-1 bg-background/50 rounded-md border border-input shadow-sm">
              <Select value={selectedRepo} onValueChange={onRepoChange}>
                <SelectTrigger className="w-[240px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="GitHub 프로젝트 선택..." />
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
              
              <span className="text-muted-foreground/50 text-sm select-none">/</span>
              
              <Select value={selectedBranch} onValueChange={onBranchChange} disabled={!selectedRepo || selectedRepo === 'none'}>
                <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-muted-foreground font-mono text-xs">
                  <GitBranch className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="main" disabled>Loading...</SelectItem>
                  ) : (
                    branches.map(branch => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-foreground font-medium">{user.name}</p>
            <p className="text-muted-foreground text-sm">프로젝트 매니저</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}