// 자연스러운 한국어 번역 - 실제 개발 현장에서 사용하는 표현

export const ko = {
  // Common
  cancel: '취소',
  save: '저장',
  submit: '제출',
  edit: '수정',
  delete: '삭제',
  close: '닫기',
  back: '뒤로',
  next: '다음',
  loading: '로딩 중...',
  error: '오류',
  success: '완료',
  
  // Roles
  pm: 'PM',
  developer: '개발자',
  
  // Auth
  login: '로그인',
  logout: '로그아웃',
  
  // Task Status
  status: {
    draft: '작성 중',
    assigned: '할당됨',
    'in-progress': '진행 중',
    pr: 'PR 대기',
    review: '리뷰 중',
    done: '완료',
    pending: '대기 중',
    approved: '승인됨',
    rejected: '반려됨',
    open: '오픈',
    merged: '머지됨',
    'changes-requested': '수정 요청'
  },
  
  // Developer Status
  devStatus: {
    active: '작업 중',
    idle: '대기',
    blocked: '차단됨'
  },
  
  // Priority
  priority: {
    low: '낮음',
    medium: '보통',
    high: '높음',
    label: '우선순위'
  },
  
  // Complexity
  complexity: {
    small: '소형',
    medium: '중형',
    large: '대형',
    label: '작업 크기'
  },
  
  // Workflow Steps
  workflow: {
    idle: '대기',
    starting: '준비 중',
    coding: '코딩 중',
    testing: '테스트 중',
    submitting: '제출 중',
    reviewing: '리뷰 대기',
    complete: '완료!'
  },
  
  // Actions
  actions: {
    start: '시작하기',
    saveAndTest: '저장 & 테스트',
    submit: '리뷰 요청',
    approve: '승인',
    reject: '반려',
    merge: '머지',
    reassign: '재할당',
    extend: '연장',
    export: '내보내기',
    create: '생성',
    assign: '할당',
    message: '메시지',
    viewAll: '전체 보기',
    viewChanges: '변경사항 보기',
    viewPreview: '미리보기',
    requestChanges: '수정 요청',
    approveAndMerge: '승인 & 머지',
    approveAll: '전체 승인'
  },
  
  // Time
  time: {
    deadline: '마감일',
    dueDate: '마감',
    createdAt: '생성일',
    updatedAt: '수정일',
    hours: '시간',
    days: '일',
    week: '주',
    thisWeek: '이번 주'
  },
  
  // Task Fields
  task: {
    title: '작업 제목',
    description: '설명',
    assignee: '담당자',
    paths: '파일 경로',
    criteria: '완료 조건',
    reasoning: '작업 이유',
    estimatedSize: '예상 소요',
    suggestedPaths: '예상 파일',
    yourChecklist: '체크리스트',
    filesYouCanEdit: '수정 가능한 파일',
    currentlyWorkingOn: '현재 작업 중'
  },
  
  // PR
  pr: {
    number: '번호',
    author: '작성자',
    files: '파일',
    filesChanged: '변경된 파일',
    checks: '체크',
    allChecksPassed: '모든 체크 통과',
    ciPassing: 'CI 통과',
    ciFailing: 'CI 실패',
    ciRunning: 'CI 실행 중'
  },
  
  // Stats
  stats: {
    activeWork: '진행 중인 작업',
    readyToReview: '리뷰 대기',
    teamVelocity: '팀 속도',
    qualityScore: '품질 점수',
    activeTasks: '진행 중',
    completedTasks: '완료',
    openPRs: '오픈 PR',
    tasksInProgress: '작업 진행 중',
    prsAwaiting: 'PR 대기 중',
    testsPassingRate: '테스트 통과율'
  },
  
  // Messages
  messages: {
    noTasks: '할당된 작업이 없습니다',
    allCaughtUp: '모든 작업을 완료했습니다!',
    greatWork: '훌륭합니다!',
    fixErrors: '다음 항목을 수정해주세요',
    allChecksPassed: '모든 체크가 통과했습니다!',
    readyToSubmit: '제출 준비가 완료되었습니다',
    waitingForReview: '리뷰를 기다리고 있습니다',
    mergedSuccess: '머지되었습니다! 🎉',
    featureIsLive: '기능이 배포되었습니다',
    readyToWork: '작업을 시작할까요?',
    selectTask: '작업을 선택해주세요',
    whatHappensNext: '다음 단계',
    pmWillReview: 'PM이 변경사항을 리뷰합니다',
    autoMerge: '승인되면 자동으로 머지됩니다',
    readyForNext: '다음 작업을 진행할 수 있습니다',
    takingBreak: '잠시 쉬어도 됩니다. 승인되면 알림을 보내드립니다.',
    needsAttention: '확인이 필요합니다',
    developersBlocked: '명의 개발자가 차단되었습니다',
    noActiveTasks: '진행 중인 작업 없음',
    prsFailing: '개의 PR CI 실패',
    requiresIntervention: '조치가 필요합니다',
    leasesExpiring: '개의 리스가 곧 만료됩니다',
    mayNeedExtension: '연장이 필요할 수 있습니다',
    taskRequestsPending: '개의 작업 요청 대기 중',
    awaitingFeedback: '피드백 대기 중',
    noTaskRequests: '아직 작업 요청이 없습니다',
    devsCanSuggest: '개발자가 작업을 제안할 수 있습니다'
  },
  
  // Tabs
  tabs: {
    overview: '개요',
    requests: '요청',
    team: '팀',
    approvals: '승인',
    tasks: '작업'
  },
  
  // Headers
  headers: {
    pmControl: 'PM 관리 센터',
    teamOversight: '팀 현황 & 워크플로우 관리',
    readyToApprove: '승인 대기',
    teamActivity: '팀 활동',
    pendingApprovals: '대기 중인 승인',
    allTasks: '전체 작업',
    taskRequests: '팀 작업 요청',
    reviewAndApprove: '작업 제안 검토 및 승인',
    teamOverview: '팀 현황',
    suggestTask: '작업 제안하기',
    suggestNewTask: '새 작업 제안',
    haveIdea: '기능이나 개선 아이디어가 있으신가요? 제안해주세요.',
    createNewTask: '새 작업 생성',
    assignNewTask: '새 작업을 개발자에게 할당',
    editTask: '작업 수정',
    updateDetails: '작업 세부사항 수정',
    reassignTask: '작업 재할당',
    changeResponsible: '담당자 변경',
    yourTaskRequests: '내 작업 요청',
    requestsStatus: '제안한 작업의 상태'
  },
  
  // Descriptions
  descriptions: {
    whatToDo: '작업 내용',
    whyImportant: '작업이 필요한 이유',
    taskTitle: '예: 다크모드 토글 추가',
    describeTask: '작업 내용을 자세히 설명해주세요...',
    explainValue: '이 작업이 필요한 이유를 설명해주세요...',
    filesYoullWorkIn: '작업할 파일/폴더 (선택사항)',
    pmMayOptions: 'PM이 다음과 같이 처리할 수 있습니다',
    approveAssignYou: '승인하고 회원님께 할당',
    approveAssignOther: '승인하고 다른 사람에게 할당',
    askMoreDetails: '추가 정보 요청',
    declineWithFeedback: '피드백과 함께 거절',
    currentTask: '작업',
    currentlyAssigned: '현재 담당자',
    reassignTo: '재할당 대상',
    addNotesOptional: '선택사항: 메모나 피드백 추가...',
    pmNotes: 'PM 메모',
    what: '내용',
    why: '이유',
    suggestedPaths: '제안 파일 경로'
  },
  
  // Setup Messages
  setup: {
    settingUp: '작업 환경을 준비하고 있습니다',
    createdBranch: '브랜치 생성됨',
    grantedAccess: '파일 접근 권한 부여됨',
    preparingEditor: '에디터 준비 중...',
    savingChanges: '변경사항 저장 중',
    runningChecks: '최종 체크 실행 중',
    creatingPR: 'PR 생성 중...',
    runningTests: '테스트 실행 중...'
  },
  
  // Size Labels
  sizes: {
    small: '소형 (1-2시간)',
    medium: '중형 (반나절)',
    large: '대형 (1일 이상)'
  },
  
  // Report Types
  reports: {
    team: '팀 리포트',
    tasks: '작업 리포트',
    prs: 'PR 리포트',
    exportReport: '리포트 내보내기',
    addDeveloper: '개발자 추가'
  }
};
