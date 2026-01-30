import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shield, Code2, Zap } from 'lucide-react';
import type { UserRole } from '../App';
import { useDevelopers } from '../lib/useDevelopers';

interface RoleSelectionProps {
  onLogin: (role: UserRole, name: string, id: string) => void;
}

export default function RoleSelection({ onLogin }: RoleSelectionProps) {
  const { developers, loading } = useDevelopers();
  const [selectedDev, setSelectedDev] = useState<string>('');

  const handlePMLogin = () => {
    onLogin('pm', '김재연', 'pm-sarah');
  };

  const handleDevLogin = () => {
    if (selectedDev) {
      const dev = developers.find(d => d.id === selectedDev);
      if (dev) {
        onLogin('developer', dev.name, dev.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-slate-900 mb-2">Vibe Dev Ops Portal</h1>
          <p className="text-slate-600">
            고속 성장 팀을 위한 개발 워크플로우 관리 시스템
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* PM Login */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>프로젝트 매니저</CardTitle>
                  <CardDescription>팀 & 워크플로우 관리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-slate-700">접근 가능 항목:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• 전체 대시보드 & 분석</li>
                  <li>• 작업 할당 & 추적</li>
                  <li>• 리스 관리</li>
                  <li>• PR 승인 & 머지 큐</li>
                  <li>• 팀 성과 인사이트</li>
                </ul>
              </div>
              <Button onClick={handlePMLogin} className="w-full" size="lg">
                PM으로 로그인 (김재연)
              </Button>
            </CardContent>
          </Card>

          {/* Developer Login */}
          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Code2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>개발자</CardTitle>
                  <CardDescription>일일 워크플로우 & 작업</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-slate-700">접근 가능 항목:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• 내 작업 & 체크리스트</li>
                  <li>• 단계별 워크플로우</li>
                  <li>• PR 생성 & 상태</li>
                  <li>• 파일 권한 관리</li>
                  <li>• 빌드 미리보기</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>개발자 선택</Label>
                <Select value={selectedDev} onValueChange={setSelectedDev}>
                  <SelectTrigger>
                    <SelectValue placeholder="개발자를 선택하세요..." />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map(dev => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleDevLogin} 
                className="w-full" 
                size="lg"
                disabled={!selectedDev}
              >
                개발자로 로그인
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-slate-500">
          <p>데모 시스템 • 역할을 선택하여 계속하세요</p>
        </div>
      </div>
    </div>
  );
}