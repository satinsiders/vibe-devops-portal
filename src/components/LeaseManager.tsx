import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  Lock,
  FolderTree,
  User,
  Plus,
  XCircle
} from 'lucide-react';
import { leases, developers } from '../lib/mockData';

export default function LeaseManager() {
  const activeLeases = leases.filter(l => l.status === 'active');
  const expiringLeases = leases.filter(l => l.status === 'expiring');

  const getTimeRemaining = (expiryTime: string) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, totalMinutes: hours * 60 + minutes };
  };

  const getProgressValue = (startTime: string, expiryTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const expiry = new Date(expiryTime);
    const total = expiry.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return (elapsed / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Lease Manager</h1>
        <p className="text-slate-600">Manage file path ownership and prevent conflicts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <Lock className="w-4 h-4" />
              Active Leases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{activeLeases.length}</div>
            <p className="text-slate-500 text-sm">Currently held paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <AlertTriangle className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{expiringLeases.length}</div>
            <p className="text-slate-500 text-sm">Within 1 hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4" />
              Active Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              {new Set(leases.map(l => l.developerId)).size}
            </div>
            <p className="text-slate-500 text-sm">With leases</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Leases Alert */}
      {expiringLeases.length > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="w-5 h-5" />
              Leases Expiring Soon
            </CardTitle>
            <CardDescription className="text-yellow-800">
              These leases will expire within the hour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringLeases.map(lease => {
              const { hours, minutes } = getTimeRemaining(lease.expiryTime);
              const dev = developers.find(d => d.id === lease.developerId);

              return (
                <div key={lease.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{lease.taskTitle}</p>
                      <Badge variant="outline">{dev?.name}</Badge>
                    </div>
                    <p className="text-slate-600 text-sm">
                      {hours > 0 ? `${hours}h ` : ''}{minutes}m remaining
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Extend
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Active Leases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Active Leases</CardTitle>
              <CardDescription>Current path ownership across the team</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Manual Grant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leases.map(lease => {
              const { hours, minutes, totalMinutes } = getTimeRemaining(lease.expiryTime);
              const progress = getProgressValue(lease.startTime, lease.expiryTime);
              const dev = developers.find(d => d.id === lease.developerId);
              const isExpiringSoon = totalMinutes < 60;

              return (
                <div 
                  key={lease.id} 
                  className={`p-4 border-2 rounded-lg ${
                    isExpiringSoon 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Developer Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {dev?.avatar}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">{lease.taskTitle}</p>
                        <Badge variant={isExpiringSoon ? 'destructive' : 'default'}>
                          {lease.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{dev?.name}</p>

                      {/* File Paths */}
                      <div className="space-y-1 mb-3">
                        {lease.paths.map(path => (
                          <div key={path} className="flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <code className="text-sm bg-white px-2 py-1 rounded text-slate-700 border border-slate-200">
                              {path}
                            </code>
                          </div>
                        ))}
                      </div>

                      {/* Time Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className={isExpiringSoon ? 'text-yellow-700' : 'text-slate-600'}>
                              {hours > 0 ? `${hours}h ` : ''}{minutes}m remaining
                            </span>
                          </div>
                          <span className="text-slate-500">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={isExpiringSoon ? 'bg-yellow-200' : ''} 
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        Extend +1h
                      </Button>
                      <Button size="sm" variant="outline">
                        Extend +2h
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Lease Timeline */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
                    <span>Started: {new Date(lease.startTime).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
                    <span>•</span>
                    <span>Expires: {new Date(lease.expiryTime).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
                  </div>
                </div>
              );
            })}

            {leases.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Lock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No active leases</p>
                <p className="text-sm">All paths are available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lease Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Lease System Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-slate-900">Automatic Behaviors</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Leases auto-expire after set duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Developers receive reminders 15min before expiry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Overlapping leases are automatically denied</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Slack/Discord notifications on status changes</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-slate-900">PM Controls</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Override any lease in emergencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Manually grant or extend leases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>View potential conflict warnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Set custom expiry times per task</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}