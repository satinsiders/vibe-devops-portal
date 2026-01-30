import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { 
  Calendar, 
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Download
} from 'lucide-react';
import { developers } from '../lib/mockData';

interface DailyLog {
  id: string;
  developerId: string;
  date: string;
  time: string;
  type: 'standup' | 'progress' | 'blocker' | 'complete';
  message: string;
}

const mockLogs: DailyLog[] = [
  {
    id: 'log-1',
    developerId: 'dev-alice',
    date: '2025-11-18',
    time: '09:15',
    type: 'standup',
    message: 'Working on user profile page today. Plan to implement edit functionality and connect to state management.'
  },
  {
    id: 'log-2',
    developerId: 'dev-bob',
    date: '2025-11-18',
    time: '10:30',
    type: 'progress',
    message: 'JWT authentication is working. Added token validation middleware. Running tests now.'
  },
  {
    id: 'log-3',
    developerId: 'dev-dana',
    date: '2025-11-18',
    time: '11:00',
    type: 'blocker',
    message: 'Navigation component tests failing. Need help with mock router setup.'
  },
  {
    id: 'log-4',
    developerId: 'dev-alice',
    date: '2025-11-18',
    time: '14:00',
    type: 'progress',
    message: 'Profile edit form completed. Added validation and error handling. Ready for testing.'
  },
  {
    id: 'log-5',
    developerId: 'dev-bob',
    date: '2025-11-18',
    time: '15:45',
    type: 'complete',
    message: 'Auth service PR opened! All tests passing. Waiting for review.'
  },
  {
    id: 'log-6',
    developerId: 'dev-charlie',
    date: '2025-11-18',
    time: '16:00',
    type: 'standup',
    message: 'Starting API documentation task. Will update OpenAPI specs for new endpoints.'
  },
];

export default function DailyLogs() {
  const [selectedDev, setSelectedDev] = useState<string | null>(null);
  const [selectedDate] = useState('2025-11-18');

  const filteredLogs = selectedDev 
    ? mockLogs.filter(log => log.developerId === selectedDev)
    : mockLogs;

  const todayLogs = filteredLogs.filter(log => log.date === selectedDate);

  const getLogTypeColor = (type: DailyLog['type']) => {
    switch (type) {
      case 'standup': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'progress': return 'bg-green-100 text-green-700 border-green-200';
      case 'blocker': return 'bg-red-100 text-red-700 border-red-200';
      case 'complete': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLogTypeIcon = (type: DailyLog['type']) => {
    switch (type) {
      case 'complete': return <CheckCircle2 className="w-4 h-4" />;
      case 'blocker': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const logsByDev = developers.map(dev => {
    const devLogs = todayLogs.filter(log => log.developerId === dev.id);
    const blockers = devLogs.filter(log => log.type === 'blocker').length;
    const completed = devLogs.filter(log => log.type === 'complete').length;
    
    return {
      ...dev,
      totalLogs: devLogs.length,
      blockers,
      completed,
      lastUpdate: devLogs.length > 0 ? devLogs[devLogs.length - 1].time : null
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Daily Logs</h1>
          <p className="text-slate-600">Developer check-ins and progress updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            {selectedDate}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Developer Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {logsByDev.map(dev => (
          <Card 
            key={dev.id}
            className={`cursor-pointer transition-all ${
              selectedDev === dev.id 
                ? 'border-2 border-orange-300 bg-orange-50' 
                : 'hover:border-slate-300'
            }`}
            onClick={() => setSelectedDev(selectedDev === dev.id ? null : dev.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white">
                  {dev.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 truncate">{dev.name}</p>
                  <p className="text-slate-500 text-sm">{dev.totalLogs} update{dev.totalLogs !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {dev.lastUpdate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Last: {dev.lastUpdate}</span>
                  </div>
                )}
                {dev.blockers > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{dev.blockers} blocker{dev.blockers !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {dev.completed > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{dev.completed} completed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                {selectedDev 
                  ? `${developers.find(d => d.id === selectedDev)?.name}'s updates` 
                  : 'All team updates'}
              </CardDescription>
            </div>
            {selectedDev && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDev(null)}>
                Show All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayLogs.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No logs for today</p>
              </div>
            )}

            {todayLogs.map(log => {
              const dev = developers.find(d => d.id === log.developerId);
              
              return (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      {dev?.avatar}
                    </div>
                    <div className="w-0.5 bg-slate-200 flex-1 mt-2" />
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-slate-900">{dev?.name}</p>
                      <span className="text-slate-400">•</span>
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{log.time}</span>
                      </div>
                      <Badge className={`${getLogTypeColor(log.type)} gap-1`}>
                        {getLogTypeIcon(log.type)}
                        {log.type}
                      </Badge>
                    </div>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Log */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle>Add Quick Update</CardTitle>
          <CardDescription>Log progress, blockers, or completions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="What are you working on? Any blockers?"
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Progress
            </Button>
            <Button size="sm" variant="outline">
              <AlertCircle className="w-4 h-4 mr-2" />
              Blocker
            </Button>
            <Button size="sm" variant="outline">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete
            </Button>
            <Button size="sm" className="ml-auto">
              Post Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Daily Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 mb-2">Total Updates</p>
              <div className="text-slate-900">{todayLogs.length}</div>
            </div>
            <div>
              <p className="text-slate-500 mb-2">Active Blockers</p>
              <div className="text-slate-900">
                {todayLogs.filter(l => l.type === 'blocker').length}
              </div>
            </div>
            <div>
              <p className="text-slate-500 mb-2">Completed Tasks</p>
              <div className="text-slate-900">
                {todayLogs.filter(l => l.type === 'complete').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
