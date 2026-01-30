import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileCode,
  TestTube,
  Zap,
  FileText,
  TrendingUp,
  Shield
} from 'lucide-react';
import { pullRequests } from '../lib/mockData';

export default function QualityGates() {
  const totalPRs = pullRequests.length;
  
  // Calculate overall stats
  const allChecks = pullRequests.flatMap(pr => Object.values(pr.checks));
  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;
  const passRate = Math.round((passedChecks / totalChecks) * 100);

  // Individual check stats
  const checkTypes = ['lint', 'typecheck', 'tests', 'bundleSize'] as const;
  const checkStats = checkTypes.map(checkType => {
    const passed = pullRequests.filter(pr => pr.checks[checkType]).length;
    const total = pullRequests.length;
    return {
      name: checkType,
      label: checkType === 'bundleSize' ? 'Bundle Size' : 
             checkType === 'typecheck' ? 'Type Check' : 
             checkType.charAt(0).toUpperCase() + checkType.slice(1),
      passed,
      failed: total - passed,
      rate: Math.round((passed / total) * 100)
    };
  });

  const qualityGateRules = [
    { name: 'Lint', icon: FileCode, description: 'Code style and formatting', required: true },
    { name: 'Type Safety', icon: Shield, description: 'TypeScript type checking', required: true },
    { name: 'Unit Tests', icon: TestTube, description: 'All unit tests passing', required: true },
    { name: 'Bundle Size', icon: Zap, description: 'Under size threshold', required: true },
    { name: 'Integration Tests', icon: TestTube, description: 'End-to-end scenarios', required: false },
    { name: 'Documentation', icon: FileText, description: 'Code comments and docs', required: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Quality Gates</h1>
        <p className="text-slate-600">Automated checks ensuring code quality and stability</p>
      </div>

      {/* Overall Score */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <TrendingUp className="w-6 h-6" />
            Overall Quality Score
          </CardTitle>
          <CardDescription className="text-green-800">
            Across all {totalPRs} active pull requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-green-900 mb-2">{passRate}%</div>
              <p className="text-green-700 text-sm">Pass Rate</p>
            </div>
            <div className="flex-1">
              <Progress value={passRate} className="h-3" />
            </div>
            <div className="text-center">
              <div className="text-green-900 mb-2">{passedChecks}/{totalChecks}</div>
              <p className="text-green-700 text-sm">Checks Passed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {checkStats.map(stat => (
          <Card key={stat.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">{stat.label}</CardTitle>
                <Badge variant={stat.rate >= 80 ? 'default' : stat.rate >= 50 ? 'secondary' : 'destructive'}>
                  {stat.rate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{stat.passed} passing</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>{stat.failed} failing</span>
                </div>
              </div>
              <Progress value={stat.rate} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality Gate Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Gate Configuration</CardTitle>
          <CardDescription>Requirements for PR approval and merge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityGateRules.map(rule => {
              const Icon = rule.icon;
              
              return (
                <div 
                  key={rule.name}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                    rule.required 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    rule.required ? 'bg-orange-200' : 'bg-slate-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      rule.required ? 'text-orange-700' : 'text-slate-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{rule.name}</p>
                      {rule.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm">{rule.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded ${
                    rule.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {rule.required ? 'Cannot merge' : 'PM review'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Failed Checks Details */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Checks by PR</CardTitle>
          <CardDescription>Pull requests with failing quality gates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pullRequests.filter(pr => {
              return Object.values(pr.checks).some(check => !check);
            }).map(pr => {
              const failedChecks = Object.entries(pr.checks)
                .filter(([_, passed]) => !passed)
                .map(([name]) => name);

              return (
                <div key={pr.id} className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-red-900">#{pr.number}</p>
                        <p className="text-red-800">{pr.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {failedChecks.map(check => (
                          <Badge key={check} variant="destructive" className="text-xs">
                            {check === 'bundleSize' ? 'Bundle Size' : 
                             check === 'typecheck' ? 'Type Check' :
                             check.charAt(0).toUpperCase() + check.slice(1)} Failed
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {pullRequests.every(pr => Object.values(pr.checks).every(Boolean)) && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-green-900">All checks passing!</p>
                <p className="text-green-700 text-sm">No quality gate failures</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">92%</div>
            <p className="text-slate-500 text-sm">Average pass rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">Last Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">88%</div>
            <p className="text-green-600 text-sm">+4% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-600">First-Time Pass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 mb-1">76%</div>
            <p className="text-slate-500 text-sm">PRs passing on first try</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
