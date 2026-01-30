import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  FileCode, 
  TestTube,
  Send,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { tasks, leases, pullRequests, developers } from '../lib/mockData';

interface DeveloperViewProps {
  userId: string;
}

type WorkflowStage = 'not-started' | 'setup' | 'coding' | 'testing' | 'pr' | 'complete';

export default function DeveloperView({ userId }: DeveloperViewProps) {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('coding');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const developer = developers.find(d => d.id === userId);
  const myTasks = tasks.filter(t => t.assignee === userId);
  const activeTask = myTasks.find(t => t.status === 'in-progress') || myTasks[0];
  const myLeases = leases.filter(l => l.developerId === userId);
  const myPRs = pullRequests.filter(pr => pr.authorId === userId);

  const workflowStages = [
    { id: 'setup', label: 'Start Task', icon: PlayCircle, color: 'blue' },
    { id: 'coding', label: 'Implement', icon: FileCode, color: 'orange' },
    { id: 'testing', label: 'Test & Commit', icon: TestTube, color: 'purple' },
    { id: 'pr', label: 'Open PR', icon: Send, color: 'green' },
  ];

  const handleToggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Welcome back, {developer?.name}!</h1>
        <p className="text-slate-600">Here's your workflow for today</p>
      </div>

      {/* Daily Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{myTasks.filter(t => t.status !== 'done').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Path Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{myLeases.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Open PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{myPRs.filter(pr => pr.status === 'open').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{myTasks.filter(t => t.status === 'done').length}</div>
          </CardContent>
        </Card>
      </div>

      {activeTask && (
        <>
          {/* Current Task */}
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{activeTask.title}</CardTitle>
                  <CardDescription className="mt-2">{activeTask.description}</CardDescription>
                </div>
                <Badge>{activeTask.priority}</Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Due {activeTask.deadline}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {activeTask.complexity}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Workflow</CardTitle>
              <CardDescription>Follow these stages to complete your task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = currentStage === stage.id;
                  const isComplete = workflowStages.findIndex(s => s.id === currentStage) > idx;
                  
                  return (
                    <div key={stage.id}>
                      <button
                        onClick={() => setCurrentStage(stage.id as WorkflowStage)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isActive 
                            ? 'border-orange-300 bg-orange-50' 
                            : isComplete
                            ? 'border-green-300 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isActive 
                              ? 'bg-orange-200' 
                              : isComplete
                              ? 'bg-green-200'
                              : 'bg-slate-100'
                          }`}>
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-700" />
                            ) : (
                              <Icon className={`w-5 h-5 ${
                                isActive ? 'text-orange-700' : 'text-slate-600'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900">{stage.label}</p>
                            {isActive && (
                              <p className="text-slate-500">Click to expand details</p>
                            )}
                          </div>
                          {isComplete && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </button>

                      {/* Stage Details */}
                      {isActive && (
                        <div className="mt-3 ml-12 p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                          {stage.id === 'setup' && (
                            <>
                              <div className="space-y-2">
                                <p className="text-slate-700">The system will:</p>
                                <ul className="space-y-2">
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                    <span className="text-slate-600">Grant file path lease</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                    <span className="text-slate-600">Create branch: <code className="bg-slate-100 px-1 rounded">{activeTask.branch || 'feat/your-task'}</code></span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                    <span className="text-slate-600">Provide setup commands</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-sm">
                                <div>git checkout -b {activeTask.branch || 'feat/your-task'}</div>
                                <div>npm install</div>
                                <div>npm run dev</div>
                              </div>
                              <Button className="w-full">
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Start Task & Get Lease
                              </Button>
                            </>
                          )}

                          {stage.id === 'coding' && (
                            <>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-slate-700 mb-2">Your assigned paths:</p>
                                  <div className="space-y-1">
                                    {activeTask.paths.map(path => (
                                      <div key={path} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <FileCode className="w-4 h-4 text-green-600" />
                                        <code className="text-green-900 text-sm">{path}</code>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-slate-700 mb-2">Acceptance Criteria:</p>
                                  <div className="space-y-2">
                                    {activeTask.acceptanceCriteria.map((criteria, idx) => (
                                      <label key={idx} className="flex items-start gap-2 cursor-pointer">
                                        <Checkbox 
                                          checked={checkedItems[`criteria-${idx}`] || false}
                                          onCheckedChange={() => handleToggleCheck(`criteria-${idx}`)}
                                          className="mt-0.5"
                                        />
                                        <span className="text-slate-600">{criteria}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                  <p className="text-blue-900 mb-1">Dev Coach Available</p>
                                  <p className="text-blue-700 text-sm">Ask questions about implementation, file structure, or debugging</p>
                                </div>
                              </div>
                            </>
                          )}

                          {stage.id === 'testing' && (
                            <>
                              <div className="space-y-3">
                                <p className="text-slate-700">Pre-commit checklist:</p>
                                <div className="space-y-2">
                                  {['Run lint check', 'Run type check', 'Run unit tests', 'Test in browser', 'Review changed files'].map((item, idx) => (
                                    <label key={idx} className="flex items-start gap-2 cursor-pointer">
                                      <Checkbox 
                                        checked={checkedItems[`test-${idx}`] || false}
                                        onCheckedChange={() => handleToggleCheck(`test-${idx}`)}
                                        className="mt-0.5"
                                      />
                                      <span className="text-slate-600">{item}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-sm space-y-1">
                                <div>npm run lint</div>
                                <div>npm run typecheck</div>
                                <div>npm run test</div>
                              </div>
                              <Button className="w-full" variant="outline">
                                <GitBranch className="w-4 h-4 mr-2" />
                                Commit & Push Changes
                              </Button>
                            </>
                          )}

                          {stage.id === 'pr' && (
                            <>
                              <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <p className="text-green-900 mb-1">Ready to open PR!</p>
                                  <p className="text-green-700 text-sm">The system will auto-generate PR description and run CI checks</p>
                                </div>
                                
                                <div>
                                  <p className="text-slate-700 mb-2">PR will include:</p>
                                  <ul className="space-y-1 text-slate-600">
                                    <li>• Task summary & scope</li>
                                    <li>• Files changed list</li>
                                    <li>• Automated checklists</li>
                                    <li>• CI/CD status badges</li>
                                  </ul>
                                </div>
                              </div>
                              <Button className="w-full">
                                <Send className="w-4 h-4 mr-2" />
                                Open Pull Request
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* My PRs */}
      {myPRs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Pull Requests</CardTitle>
            <CardDescription>{myPRs.length} active PR{myPRs.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPRs.map(pr => (
                <div key={pr.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    pr.ciStatus === 'passing' ? 'bg-green-100' : 
                    pr.ciStatus === 'failing' ? 'bg-red-100' : 
                    'bg-yellow-100'
                  }`}>
                    {pr.ciStatus === 'passing' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : pr.ciStatus === 'failing' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">#{pr.number}</p>
                      <Badge variant={
                        pr.status === 'approved' ? 'default' : 
                        pr.status === 'changes-requested' ? 'destructive' : 
                        'secondary'
                      }>
                        {pr.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-2">{pr.title}</p>
                    <div className="flex gap-3 text-sm text-slate-500">
                      <span>{pr.filesChanged} files</span>
                      <span>•</span>
                      <span>{Object.values(pr.checks).filter(Boolean).length}/{Object.keys(pr.checks).length} checks</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Leases */}
      {myLeases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Path Leases</CardTitle>
            <CardDescription>Your current file ownership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myLeases.map(lease => {
                const timeLeft = new Date(lease.expiryTime).getTime() - new Date().getTime();
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                
                return (
                  <div key={lease.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-slate-900 mb-1">{lease.taskTitle}</p>
                        <p className="text-slate-500 text-sm">{lease.paths.length} path{lease.paths.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Badge variant={lease.status === 'expiring' ? 'destructive' : 'default'}>
                        {lease.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      {lease.paths.map(path => (
                        <code key={path} className="block text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {path}
                        </code>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">
                        {hoursLeft > 0 ? `${hoursLeft}h remaining` : 'Expiring soon'}
                      </span>
                      {lease.status === 'expiring' && (
                        <Button size="sm" variant="outline" className="ml-auto">
                          Extend Lease
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
