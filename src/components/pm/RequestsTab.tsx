import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Lightbulb, ThumbsUp, ThumbsDown, FolderGit, GitBranch } from 'lucide-react';
import type { TaskRequest } from '../../lib/taskRequests';

interface RequestsTabProps {
  pendingRequests: TaskRequest[];
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
}

export default function RequestsTab({ pendingRequests, onApprove, onReject }: RequestsTabProps) {
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleApprove = (id: string) => {
    onApprove(id, reviewNotes);
    setReviewingRequest(null);
    setReviewNotes('');
  };

  const handleReject = (id: string) => {
    if (!reviewNotes.trim()) {
      return;
    }
    onReject(id, reviewNotes);
    setReviewingRequest(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">팀 작업 요청</h2>
          <p className="text-slate-600">개발자가 제안한 작업을 검토하고 승인하세요</p>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-slate-900 mb-2">대기 중인 요청이 없습니다</h3>
          <p className="text-slate-600">개발자가 작업을 제안할 수 있습니다</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map(request => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-slate-900">{request.title}</h3>
                    <Badge variant="secondary">대기 중</Badge>
                  </div>
                  <p className="text-slate-600 text-sm mb-1">
                    제안자: {request.developerName}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {new Date(request.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Seoul'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Repo/Branch Info */}
                {(request.repository || request.branch) && (
                  <div className="flex gap-4 text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
                    {request.repository && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <FolderGit className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{request.repository}</span>
                      </div>
                    )}
                    {request.branch && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <GitBranch className="w-4 h-4 text-slate-500" />
                        <span>{request.branch}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-slate-600 mb-2">작업 내용</p>
                  <p className="text-slate-900">{request.description}</p>
                </div>

                <div>
                  <p className="text-slate-600 mb-2">작업 이유</p>
                  <p className="text-slate-700">{request.reasoning}</p>
                </div>

                {request.suggestedPaths.length > 0 && (
                  <div>
                    <p className="text-slate-600 mb-2">예상 파일</p>
                    <div className="flex flex-wrap gap-2">
                      {request.suggestedPaths.map(path => (
                        <code key={path} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {path}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {reviewingRequest === request.id ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <Textarea
                    placeholder="메모나 피드백을 입력하세요 (선택사항)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(request.id)} size="sm">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      승인
                    </Button>
                    <Button 
                      onClick={() => handleReject(request.id)} 
                      variant="destructive"
                      size="sm"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      반려
                    </Button>
                    <Button 
                      onClick={() => {
                        setReviewingRequest(null);
                        setReviewNotes('');
                      }} 
                      variant="ghost"
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setReviewingRequest(request.id)}>
                  검토하기
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
