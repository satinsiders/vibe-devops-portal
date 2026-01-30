import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Lock,
  Users,
  Shield,
  Info
} from 'lucide-react';
import { repoStructure, type RepoNode } from '../lib/mockData';

export default function RepoMap() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [selectedNode, setSelectedNode] = useState<RepoNode | null>(null);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const getStatusColor = (status: RepoNode['status']) => {
    switch (status) {
      case 'free': return 'text-green-600 bg-green-50 border-green-200';
      case 'leased': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'shared': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'protected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: RepoNode['status']) => {
    switch (status) {
      case 'leased': return <Lock className="w-4 h-4" />;
      case 'shared': return <Users className="w-4 h-4" />;
      case 'protected': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderNode = (node: RepoNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const Icon = node.type === 'folder' ? Folder : File;
    const statusColor = getStatusColor(node.status);
    const statusIcon = getStatusIcon(node.status);

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50 ${
            selectedNode?.path === node.path ? 'bg-orange-50' : ''
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={() => {
            if (hasChildren) toggleExpand(node.path);
            setSelectedNode(node);
          }}
        >
          {hasChildren && (
            <button className="p-0.5 hover:bg-slate-200 rounded">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">{node.name}</span>
          
          {statusIcon && (
            <div className={`p-1 rounded border ${statusColor}`}>
              {statusIcon}
            </div>
          )}

          {node.owner && (
            <Badge variant="outline" className="ml-auto text-xs">
              {node.owner}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Repository Map</h1>
        <p className="text-slate-600">Visual representation of file ownership and lease status</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* File Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Structure</CardTitle>
              <CardDescription>Click folders to expand, select items to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-lg p-2 max-h-[600px] overflow-y-auto">
                {renderNode(repoStructure)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend & Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded border ${getStatusColor('free')}`}>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <p className="text-green-900">Free</p>
                  <p className="text-green-700 text-sm">Available to lease</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded border ${getStatusColor('leased')}`}>
                <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center text-white">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-yellow-900">Leased</p>
                  <p className="text-yellow-700 text-sm">Currently owned by a developer</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded border ${getStatusColor('shared')}`}>
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-blue-900">Shared</p>
                  <p className="text-blue-700 text-sm">Common directory</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded border ${getStatusColor('protected')}`}>
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-red-900">Protected</p>
                  <p className="text-red-700 text-sm">Requires PM approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Path Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-500 mb-1">Path</p>
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 block">
                    {selectedNode.path}
                  </code>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">Type</p>
                  <Badge variant="outline">
                    {selectedNode.type === 'folder' ? 'Directory' : 'File'}
                  </Badge>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${getStatusColor(selectedNode.status)}`}>
                    {getStatusIcon(selectedNode.status)}
                    <span className="capitalize">{selectedNode.status}</span>
                  </div>
                </div>

                {selectedNode.owner && (
                  <div>
                    <p className="text-slate-500 mb-1">Current Owner</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                        {selectedNode.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-slate-900">{selectedNode.owner}</p>
                    </div>
                  </div>
                )}

                {selectedNode.status === 'leased' && (
                  <Button variant="outline" className="w-full" size="sm">
                    <Lock className="w-4 h-4 mr-2" />
                    View Lease Details
                  </Button>
                )}

                {selectedNode.status === 'free' && (
                  <Button className="w-full" size="sm">
                    Request Lease
                  </Button>
                )}

                {selectedNode.status === 'protected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-900 text-sm">
                      This path is protected. Changes require PM approval.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
