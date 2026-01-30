import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RoleSelection from './components/RoleSelection';
import DeveloperWorkspace from './components/DeveloperWorkspace';
import PMControl from './components/PMControl';
import * as api from './lib/api';
import { Button } from './components/ui/button';
import { toast } from 'sonner@2.0.3';

export type UserRole = 'pm' | 'developer' | null;

export interface User {
  role: UserRole;
  name: string;
  id: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);

  // Initialize database on first load
  useEffect(() => {
    const initDB = async () => {
      try {
        await api.initializeDatabase();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Continue anyway - might already be initialized
        setDbInitialized(true);
      }
    };
    
    initDB();
  }, []);

  // Admin shortcut: Shift+Alt+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && e.key === 'C') {
        setShowAdminControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearAllData = async () => {
    if (confirm('⚠️ 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await api.clearAllData();
        toast.success('All data cleared successfully');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
        toast.error('Failed to clear data');
      }
    }
  };

  const handleResetDevelopers = async () => {
    if (confirm('🔄 개발자 목록을 기본값(김재연, 김남준, 배병윤, 이민재, 김우영)으로 리셋하시겠습니까?')) {
      try {
        await api.resetDevelopers();
        toast.success('개발자 목록이 리셋되었습니다');
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset developers:', error);
        toast.error('개발자 리셋 실패');
      }
    }
  };

  const handleMigrateActivities = async () => {
    if (confirm('🔄 완료된 작업 기록을 PM 계정에서 실제 개발자 계정으로 이동하시겠습니까?\n\n이 작업은 task_completed 활동을 작업을 실제로 수행한 개발자에게 재할당합니다.')) {
      try {
        console.log('Starting migration...');
        const response = await fetch(`https://${api.projectId}.supabase.co/functions/v1/make-server-7839915e/migrate-activities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${api.publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Migration result:', result);
        
        if (result.success) {
          toast.success(`✅ ${result.migratedCount}개의 완료 기록이 이동되었습니다`);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to migrate activities:', error);
        toast.error(`활동 기록 이동 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const handleLogin = (role: UserRole, name: string, id: string) => {
    setUser({ role, name, id });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!dbInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelection onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        {user.role === 'pm' ? (
          <>
            <Route path="/" element={<PMControl user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<DeveloperWorkspace user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      
      {/* Admin controls toggle button - HIDDEN (uncomment to re-enable) */}
      {/* <button
        onClick={() => setShowAdminControls(prev => !prev)}
        className="fixed bottom-4 left-4 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors z-50"
        title="Admin Controls (Shift+Alt+C)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button> */}
      
      {showAdminControls && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="text-slate-900 font-medium mb-2">Admin Controls</div>
          <Button
            variant="destructive"
            onClick={handleClearAllData}
            className="w-full"
          >
            Clear All Data
          </Button>
          <Button
            variant="outline"
            onClick={handleResetDevelopers}
            className="w-full"
          >
            Reset Developers
          </Button>
          <Button
            variant="outline"
            onClick={handleMigrateActivities}
            className="w-full"
          >
            Migrate Activities
          </Button>
        </div>
      )}
    </Router>
  );
}