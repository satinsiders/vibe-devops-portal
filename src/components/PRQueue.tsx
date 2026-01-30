import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  ExternalLink,
  GitBranch,
  FileCode,
  TestTube,
  Zap,
  Eye
} from 'lucide-react';
import { pullRequests, developers } from '../lib/mockData';
import type { PullRequest } from '../lib/mockData';

interface PRQueueProps {
  developerId?: string;
}

export default function PRQueue({ developerId }: PRQueueProps) {
  const filteredPRs = developerId 
    ? pullRequests.filter(pr => pr.authorId === developerId)
    : pullRequests;

  const openPRs = filteredPRs.filter(pr => pr.status === 'open');
  const approvedPRs = filteredPRs.filter(pr => pr.status === 'approved');
  const passingCI = filteredPRs.filter(pr => pr.ciStatus === 'passing').length;

  const getStatusColor = (status: PullRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'changes-requested': return 'bg-red-100 text-red-700 border-red-200';
      case 'merged': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getCIStatusIcon = (status: PullRequest['ciStatus']) => {
    switch (status) {
      case 'passing':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failing':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">
          {developerId ? 'My Pull Requests' : 'PR Queue'}
        </h1>
        <p className="text-slate-600">
          {developerId 
            ? 'Status of your submitted pull requests' 
            : 'Review and manage all pull requests'}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Open PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{openPRs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{approvedPRs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">CI Passing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{passingCI}/{filteredPRs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Avg PR Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">4.2h</div>
          </CardContent>
        </Card>
      </div>

      {/* Merge Queue */}
      {approvedPRs.length > 0 && !developerId && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Zap className="w-5 h-5" />
              Ready to Merge
            </CardTitle>
            <CardDescription className="text-green-800">
              {approvedPRs.length} PR{approvedPRs.length !== 1 ? 's' : ''} approved and passing checks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedPRs.map(pr => {
              const author = developers.find(d => d.id === pr.authorId);
              
              return (
                <div key={pr.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">#{pr.number}</p>
                      <p className="text-slate-600 truncate">{pr.title}</p>
                    </div>
                    <p className="text-slate-500 text-sm">{author?.name}</p>
                  </div>
                  <Button size="sm">
                    Merge Now
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All PRs */}
      <Card>
        <CardHeader>
          <CardTitle>All Pull Requests</CardTitle>
          <CardDescription>
            {filteredPRs.length} total PR{filteredPRs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPRs.map(pr => {
              const author = developers.find(d => d.id === pr.authorId);
              const checksPassedCount = Object.values(pr.checks).filter(Boolean).length;
              const totalChecks = Object.keys(pr.checks).length;
              const allChecksPassed = checksPassedCount === totalChecks;

              return (
                <div 
                  key={pr.id} 
                  className={`p-4 border-2 rounded-lg ${
                    pr.ciStatus === 'failing' 
                      ? 'border-red-200 bg-red-50' 
                      : pr.status === 'approved'
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* CI Status Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      pr.ciStatus === 'passing' ? 'bg-green-100' : 
                      pr.ciStatus === 'failing' ? 'bg-red-100' : 
                      'bg-yellow-100'
                    }`}>
                      {getCIStatusIcon(pr.ciStatus)}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <GitPullRequest className="w-4 h-4 text-slate-600" />
                            <p className="text-slate-900">#{pr.number}</p>
                            <Badge className={getStatusColor(pr.status)}>
                              {pr.status}
                            </Badge>
                            {pr.ciStatus === 'failing' && (
                              <Badge variant="destructive">CI Failing</Badge>
                            )}
                          </div>
                          <h4 className="text-slate-900 mb-1">{pr.title}</h4>
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs">
                                {author?.avatar}
                              </div>
                              <span>{author?.name}</span>
                            </div>
                            <span>•</span>
                            <span>{new Date(pr.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Branch & Files */}
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <GitBranch className="w-4 h-4 text-slate-500" />
                          <code className="bg-white px-2 py-1 rounded text-slate-700 text-xs border border-slate-200 truncate">
                            {pr.branch}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileCode className="w-4 h-4 text-slate-500" />
                          <span>{pr.filesChanged} files changed</span>
                        </div>
                      </div>

                      {/* Quality Checks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <TestTube className="w-4 h-4 text-slate-500" />
                          <span>Quality Checks: {checksPassedCount}/{totalChecks}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(pr.checks).map(([check, passed]) => (
                            <div 
                              key={check}
                              className={`flex items-center gap-2 px-3 py-2 rounded border text-sm ${
                                passed 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-red-50 border-red-200 text-red-700'
                              }`}
                            >
                              {passed ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span className="capitalize">{check}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      {!developerId && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                          {pr.status === 'open' && allChecksPassed && (
                            <Button size="sm">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          {pr.status === 'approved' && pr.ciStatus === 'passing' && (
                            <Button size="sm">
                              Merge to Main
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Preview
                          </Button>
                          {pr.ciStatus === 'failing' && (
                            <Button size="sm" variant="outline">
                              Request Changes
                            </Button>
                          )}
                        </div>
                      )}

                      {developerId && pr.status === 'changes-requested' && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-yellow-900 mb-1">Changes Requested</p>
                              <p className="text-yellow-700 text-sm">Review feedback and update your PR</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPRs.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <GitPullRequest className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No pull requests</p>
                <p className="text-sm">
                  {developerId ? "You haven't opened any PRs yet" : 'No PRs in the queue'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}