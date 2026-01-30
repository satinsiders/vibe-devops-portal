import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import * as api from '../lib/api';
import { invalidateDevelopersCache } from '../lib/useDevelopers';

interface AddDeveloperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDeveloperDialog({ open, onOpenChange }: AddDeveloperDialogProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('개발자 이름을 입력하세요');
      return;
    }

    setSubmitting(true);
    try {
      await api.addDeveloper({ name: name.trim() });
      invalidateDevelopersCache(); // Invalidate cache so all components reload
      toast.success(`${name}님이 추가되었습니다`);
      setName('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to add developer:', error);
      toast.error(error.message || '개발자 추가 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>개발자 추가</DialogTitle>
          <DialogDescription>새로운 개발자를 추가하세요.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="developer-name">이름</Label>
            <Input
              id="developer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}