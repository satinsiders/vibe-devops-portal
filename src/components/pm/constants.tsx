export const priorityColor = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-orange-600 bg-orange-50 border-orange-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200'
};

export const priorityLabel = {
  high: '높음',
  medium: '보통',
  low: '낮음'
};

export const statusLabel = {
  draft: '작성 중',
  assigned: '할당됨',
  'in-progress': '진행 중',
  'in-review': 'PR 제출됨',
  pr: 'PR 대기',
  review: '리뷰 중',
  done: '완료',
  open: '오픈',
  approved: '승인됨',
  merged: '머지됨',
  'changes-requested': '수정 요청',
  pending: '대기 중',
  rejected: '반려됨'
};

export const ciStatusLabel = {
  passing: 'CI 통과',
  failing: 'CI 실패',
  pending: 'CI 실행 중'
};