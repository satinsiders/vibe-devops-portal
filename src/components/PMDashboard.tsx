import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  GitPullRequest, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { tasks, developers, pullRequests, leases, dailyActivity } from '../lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PMDashboard() {
  const activeTasks = tasks.filter(t => ['in-progress', 'pr', 'review'].includes(t.status)).length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const blockedDevs = developers.filter(d => d.status === 'blocked').length;
  const activeLeases = leases.filter(l => l.status === 'active').length;
  const openPRs = pullRequests.filter(pr => pr.status === 'open').length;
  const failingCI = pullRequests.filter(pr => pr.ciStatus === 'failing').length;

  const needsAttention = [
    ...pullRequests.filter(pr => pr.status === 'changes-requested').map(pr => ({
      type: 'PR',
      title: pr.title,
      detail: 'Changes requested',
      priority: 'medium' as const
    })),
    ...pullRequests.filter(pr => pr.ciStatus === 'failing').map(pr => ({
      type: 'Build',
      title: pr.title,
      detail: 'CI failing',
      priority: 'high' as const
    })),
    ...leases.filter(l => l.status === 'expiring').map(l => ({
      type: 'Lease',
      title: l.taskTitle,
      detail: `${l.developerName}'s lease expiring`,
      priority: 'low' as const
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">PM Dashboard</h1>
        <p className="text-slate-600">Overview of team activity and workflow status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-600">Active Tasks</CardTitle>
            <Activity className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">{activeTasks}</div>
            <p className="text-slate-500">In progress or review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-600">Open PRs</CardTitle>
            <GitPullRequest className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">{openPRs}</div>
            <p className="text-slate-500">
              {failingCI > 0 && (
                <span className="text-red-600">{failingCI} failing CI</span>
              )}
              {failingCI === 0 && <span className="text-green-600">All passing</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-600">Active Leases</CardTitle>
            <Clock className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">{activeLeases}</div>
            <p className="text-slate-500">File path ownership</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-600">Team Status</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">
              {developers.filter(d => d.status === 'active').length} active
            </div>
            <p className="text-slate-500">
              {blockedDevs > 0 ? `${blockedDevs} blocked` : 'All productive'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Commits, PRs, and merges over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commits" fill="#f97316" name="Commits" />
                <Bar dataKey="prs" fill="#3b82f6" name="PRs" />
                <Bar dataKey="merges" fill="#10b981" name="Merges" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle>Needs PM Attention</CardTitle>
            <CardDescription>{needsAttention.length} items requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All clear! No items need attention.</p>
                </div>
              )}
              {needsAttention.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    item.priority === 'high' ? 'text-red-500' : 
                    item.priority === 'medium' ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      {item.priority === 'high' && <Badge variant="destructive" className="text-xs">High</Badge>}
                    </div>
                    <p className="text-slate-900 truncate">{item.title}</p>
                    <p className="text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Status */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Status</CardTitle>
          <CardDescription>Current assignments and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {developers.map(dev => {
              const devTask = tasks.find(t => t.id === dev.currentTask);
              const devLeases = leases.filter(l => l.developerId === dev.id);
              const devPRs = pullRequests.filter(pr => pr.authorId === dev.id && pr.status === 'open');
              
              return (
                <div key={dev.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white">
                    {dev.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{dev.name}</p>
                      <Badge variant={
                        dev.status === 'active' ? 'default' : 
                        dev.status === 'blocked' ? 'destructive' : 
                        'secondary'
                      }>
                        {dev.status}
                      </Badge>
                    </div>
                    {devTask && (
                      <p className="text-slate-600">{devTask.title}</p>
                    )}
                    {!devTask && (
                      <p className="text-slate-500">No active task</p>
                    )}
                    <div className="flex gap-4 mt-2 text-slate-500">
                      <span>{devLeases.length} lease{devLeases.length !== 1 ? 's' : ''}</span>
                      <span>{devPRs.length} open PR{devPRs.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {devTask && (
                    <div className="text-right">
                      <div className="text-slate-900 mb-1">
                        {Math.round(Math.random() * 40 + 30)}%
                      </div>
                      <Progress value={Math.random() * 40 + 30} className="w-24" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4" />
              Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">8.5 tasks/week</div>
            <p className="text-slate-500">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <Zap className="w-4 h-4" />
              Avg. PR Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">4.2 hours</div>
            <p className="text-slate-500">From open to merge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">94%</div>
            <p className="text-slate-500">All checks passing rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
