import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileCode, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitCompare,
  Shield,
  Plus
} from 'lucide-react';

interface ContractChange {
  id: string;
  title: string;
  type: 'api' | 'schema' | 'interface';
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  breaking: boolean;
  author: string;
  createdAt: string;
  affectedPaths: string[];
  description: string;
}

const mockContractChanges: ContractChange[] = [
  {
    id: 'contract-1',
    title: 'Add user roles to auth response',
    type: 'api',
    status: 'pending',
    breaking: false,
    author: 'Bob Martinez',
    createdAt: '2025-11-18T10:00:00Z',
    affectedPaths: ['/services/auth', '/apps/web/src/hooks/useAuth'],
    description: 'Adding roles array to authentication response to support RBAC'
  },
  {
    id: 'contract-2',
    title: 'Change user ID from number to string',
    type: 'schema',
    status: 'pending',
    breaking: true,
    author: 'Alice Chen',
    createdAt: '2025-11-17T15:30:00Z',
    affectedPaths: ['/packages/types/user.ts', '/services/users', '/apps/web'],
    description: 'Migrating to UUID-based user IDs for better scalability'
  },
  {
    id: 'contract-3',
    title: 'Add pagination to list endpoints',
    type: 'api',
    status: 'approved',
    breaking: false,
    author: 'Dana Foster',
    createdAt: '2025-11-16T09:00:00Z',
    affectedPaths: ['/services/api/list', '/apps/web/src/api'],
    description: 'Adding limit and offset parameters to all list endpoints'
  },
  {
    id: 'contract-4',
    title: 'Standardize error response format',
    type: 'interface',
    status: 'implemented',
    breaking: true,
    author: 'Bob Martinez',
    createdAt: '2025-11-15T11:00:00Z',
    affectedPaths: ['/packages/types/errors.ts', '/services/*/errors'],
    description: 'Unified error response structure across all services'
  },
];

export default function ContractChanges() {
  const [selectedChange, setSelectedChange] = useState<ContractChange | null>(null);

  const pendingChanges = mockContractChanges.filter(c => c.status === 'pending');
  const approvedChanges = mockContractChanges.filter(c => c.status === 'approved');
  const breakingChanges = mockContractChanges.filter(c => c.breaking);

  const getStatusColor = (status: ContractChange['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'implemented': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getTypeIcon = (type: ContractChange['type']) => {
    return <FileCode className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Contract Changes</h1>
          <p className="text-slate-600">Manage API, schema, and interface modifications</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Propose Change
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{pendingChanges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{approvedChanges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <AlertTriangle className="w-4 h-4" />
              Breaking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{breakingChanges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <GitCompare className="w-4 h-4" />
              Total Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{mockContractChanges.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Breaking Changes Alert */}
      {pendingChanges.some(c => c.breaking) && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Breaking Changes Pending Review
            </CardTitle>
            <CardDescription className="text-red-800">
              {pendingChanges.filter(c => c.breaking).length} breaking change{pendingChanges.filter(c => c.breaking).length !== 1 ? 's' : ''} require immediate PM attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingChanges.filter(c => c.breaking).map(change => (
              <div 
                key={change.id} 
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 cursor-pointer hover:border-red-300"
                onClick={() => setSelectedChange(change)}
              >
                <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-900">{change.title}</p>
                  <p className="text-red-700 text-sm">{change.affectedPaths.length} path{change.affectedPaths.length !== 1 ? 's' : ''} affected</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Changes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contract Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingChanges.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedChanges.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({mockContractChanges.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingChanges.map(change => (
                <ChangeCard 
                  key={change.id} 
                  change={change} 
                  onClick={() => setSelectedChange(change)}
                  getStatusColor={getStatusColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
              {pendingChanges.length === 0 && (
                <div className="text-center py-8 text-slate-400">No pending changes</div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3 mt-4">
              {approvedChanges.map(change => (
                <ChangeCard 
                  key={change.id} 
                  change={change} 
                  onClick={() => setSelectedChange(change)}
                  getStatusColor={getStatusColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
              {approvedChanges.length === 0 && (
                <div className="text-center py-8 text-slate-400">No approved changes</div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3 mt-4">
              {mockContractChanges.map(change => (
                <ChangeCard 
                  key={change.id} 
                  change={change} 
                  onClick={() => setSelectedChange(change)}
                  getStatusColor={getStatusColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedChange && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle>{selectedChange.title}</CardTitle>
                  {selectedChange.breaking && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Breaking
                    </Badge>
                  )}
                </div>
                <CardDescription>{selectedChange.description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedChange(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 mb-2">Type</p>
                  <Badge variant="outline" className="gap-1">
                    {getTypeIcon(selectedChange.type)}
                    {selectedChange.type.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-slate-500 mb-2">Status</p>
                  <Badge className={getStatusColor(selectedChange.status)}>
                    {selectedChange.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-slate-500 mb-2">Author</p>
                  <p className="text-slate-900">{selectedChange.author}</p>
                </div>

                <div>
                  <p className="text-slate-500 mb-2">Created</p>
                  <p className="text-slate-900">
                    {new Date(selectedChange.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 mb-2">Affected Paths</p>
                <div className="space-y-1">
                  {selectedChange.affectedPaths.map(path => (
                    <code key={path} className="block text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {path}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            {selectedChange.breaking && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-900 mb-1">Breaking Change Warning</p>
                    <p className="text-red-700 text-sm">
                      This change will require updates across multiple services and may break existing implementations. 
                      Migration tasks will be auto-generated for affected modules.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedChange.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline">
                  Request Changes
                </Button>
                <Button variant="destructive" className="ml-auto">
                  Reject
                </Button>
              </div>
            )}

            {selectedChange.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-900 mb-1">Approved & Ready</p>
                    <p className="text-green-700 text-sm">
                      Implementation tasks have been created and assigned to affected module owners.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChangeCard({ 
  change, 
  onClick, 
  getStatusColor, 
  getTypeIcon 
}: { 
  change: ContractChange;
  onClick: () => void;
  getStatusColor: (status: ContractChange['status']) => string;
  getTypeIcon: (type: ContractChange['type']) => React.ReactNode;
}) {
  return (
    <div 
      className={`p-4 border-2 rounded-lg cursor-pointer hover:border-slate-300 ${
        change.breaking ? 'border-red-200 bg-red-50' : 'border-slate-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          change.breaking ? 'bg-red-200' : 'bg-slate-200'
        }`}>
          {getTypeIcon(change.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-slate-900">{change.title}</p>
            <Badge className={getStatusColor(change.status)}>
              {change.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {change.type}
            </Badge>
            {change.breaking && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Breaking
              </Badge>
            )}
          </div>
          <p className="text-slate-600 text-sm mb-2">{change.description}</p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{change.author}</span>
            <span>•</span>
            <span>{change.affectedPaths.length} path{change.affectedPaths.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{new Date(change.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}