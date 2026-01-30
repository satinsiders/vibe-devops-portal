import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  ListTodo, 
  FolderTree, 
  Lock, 
  GitPullRequest, 
  CheckCircle2, 
  FileText,
  LogOut,
  Zap,
  FileCode
} from 'lucide-react';
import type { User } from '../App';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();

  const pmNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: ListTodo, label: 'Task Pipeline' },
    { path: '/repo-map', icon: FolderTree, label: 'Repo Map' },
    { path: '/leases', icon: Lock, label: 'Leases' },
    { path: '/pr-queue', icon: GitPullRequest, label: 'PR Queue' },
    { path: '/quality', icon: CheckCircle2, label: 'Quality Gates' },
    { path: '/contracts', icon: FileCode, label: 'Contracts' },
    { path: '/logs', icon: FileText, label: 'Daily Logs' },
  ];

  const devNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'My Workspace' },
    { path: '/tasks', icon: ListTodo, label: 'My Tasks' },
    { path: '/pr-queue', icon: GitPullRequest, label: 'My PRs' },
  ];

  const navItems = user.role === 'pm' ? pmNavItems : devNavItems;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-orange-500" />
            <h1 className="text-slate-900">Vibe Dev Ops</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-slate-900">{user.name}</p>
              <p className="text-slate-500">
                {user.role === 'pm' ? 'Project Manager' : 'Developer'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
