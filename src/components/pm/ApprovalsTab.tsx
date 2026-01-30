import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  GitPullRequest,
  CheckCircle2,
  Eye,
  ArrowUpRight
} from 'lucide-react';

interface ApprovalsTabProps {
  pullRequests: any[];
  onApprovePR: (prId: string) => void;
  onApproveAllPassing: () => void;
}

export default function ApprovalsTab({ pullRequests, onApprovePR, onApproveAllPassing }: ApprovalsTabProps) {
  const openPRs = pullRequests.filter(pr => pr.status === 'open');

  return (
    <div className="space-y-6">
      {/* Pending PRs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-900">PR 승인</h2>
            <p className="text-slate-600">리뷰 대기 중인 풀 리퀘스트</p>
          </div>
          {openPRs.length > 0 && (
            <Button onClick={onApproveAllPassing}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              전체 승인
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {openPRs.length === 0 ? (
            <Card className="p-12 text-center">
              <GitPullRequest className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-slate-900 mb-2">대기 중인 PR이 없습니다</h3>
              <p className="text-slate-600">개발자가 PR을 제출하면 여기에 표시됩니다</p>
            </Card>
          ) : (
            openPRs.map(pr => (
              <Card key={pr.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-slate-600">#{pr.number}</span>
                      <h3 className="text-slate-900">{pr.title}</h3>
                      <Badge variant="default">리뷰 대기</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                      <span>{pr.author}</span>
                      <span>•</span>
                      <span>{pr.filesChanged}개 파일</span>
                      <span>•</span>
                      <span>{new Date(pr.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {pr.url && (
                      <a 
                        href={pr.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        GitHub에서 보기
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onApprovePR(pr.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    승인 & 머지
                  </Button>
                  {pr.url && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(pr.url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      변경사항 보기
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Removed "승인된 PR" section - finished tasks now only appear in Timeline */}
    </div>
  );
}