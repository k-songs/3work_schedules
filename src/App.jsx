import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const LOCAL_STORAGE_KEY = 'project-master-local-resources'
const ACCOUNT_STORAGE_KEY = 'project-master-account-records'
const TASK_STORAGE_KEY = 'project-master-tasks'
const PC_STORAGE_KEY = 'project-master-pcs'
const LEGACY_STORAGE_KEY = 'project-master-resources'

const initialPcs = [
  { id: 'pc-1', name: 'gram', label: '자료 위치', summary: 'PC 1에 있는 작업과 자료를 확인' },
  { id: 'pc-2', name: 'basics', label: '자료 위치', summary: 'PC 2에 있는 작업과 자료를 확인' },
  { id: 'pc-3', name: 'PC', label: '자료 위치', summary: 'PC 3에 있는 작업과 자료를 확인' },
  { id: 'pc-4', name: 'mac', label: '자료 위치', summary: 'PC 4에 있는 작업과 자료를 확인' },
]

const googleAccounts = [
  { id: 'google-1', name: 'ad12' },
  { id: 'google-2', name: 'kss' },
  { id: 'google-3', name: 'gim' },
  { id: 'google-4', name: 'arti' },
  { id: 'google-5', name: 'jo' },
  { id: 'google-6', name: 'fat' },
  
]

const tools = ['Gemini', 'ChatGPT', 'Claude', 'Notion']
const UNCATEGORIZED_TOOL_LABEL = '미분류'
const toolHomeLinks = {
  Gemini: 'https://gemini.google.com',
  ChatGPT: 'https://chatgpt.com',
  Claude: 'https://claude.ai',
  Notion: 'https://notion.so',
}

const initialTasks = [
  {
    id: 1,
    title: 'Project Master 초기 구조 정리',
    status: 'Doing',
    progress: 65,
    pcId: 'pc-1',
    note: 'PC별 자료 확인 흐름과 통합 검색 범위를 먼저 확정',
  },
  {
    id: 2,
    title: '기존 자료 취합',
    status: 'To-Do',
    progress: 15,
    pcId: 'pc-2',
    note: '파일명, 경로, 설명, 태그를 빠르게 기록',
  },
  {
    id: 3,
    title: '파일 히스토리 샘플 검토',
    status: 'Review',
    progress: 80,
    pcId: 'pc-3',
    note: '파일명, 저장 시간, 작업 위치 기록 방식 확인',
  },
  {
    id: 4,
    title: '완료 자료 분류 기준 만들기',
    status: 'Done',
    progress: 100,
    pcId: 'pc-4',
    note: 'Done, To-Do, Doing, Review 기준 초안 완료',
  },
]

const initialLocalResources = [
  {
    id: 1,
    name: 'dashboard-plan.md',
    pcId: 'pc-1',
    savedAt: '2026-05-14 08:50',
    taskId: 1,
    description: '대시보드 목적과 화면 구성을 적어둔 기획 메모',
    memo: '처음 만든 화면 구조 샘플',
    pathMemo: String.raw`D:\Projects\0303\3work_schdules`,
    status: 'Doing',
    tags: ['기획', '대시보드'],
  },
  {
    id: 2,
    name: 'prompt-archive.txt',
    pcId: 'pc-2',
    savedAt: '2026-05-13 22:10',
    taskId: 2,
    description: '다시 쓸 프롬프트 후보 모음',
    memo: '프롬프트를 취합하면서 설명을 짧게 남길 자료',
    pathMemo: 'PC 2 로컬 자료 폴더',
    status: 'To-Do',
    tags: ['프롬프트', '자료'],
  },
  {
    id: 3,
    name: 'file-index-test.csv',
    pcId: 'pc-3',
    savedAt: '2026-05-12 19:35',
    taskId: 3,
    description: '파일 히스토리 테이블 입력 테스트용 샘플',
    memo: '저장 시간과 위치를 확인하는 테스트 자료',
    pathMemo: 'PC 3 테스트 폴더',
    status: 'Review',
    tags: ['인덱스', '테스트'],
  },
]

const initialAccountRecords = [
  {
    id: 101,
    title: 'Project Master 요구사항 정리',
    accountId: 'google-1',
    tool: 'ChatGPT',
    savedAt: '2026-05-14 09:10',
    description: '대시보드 구조와 CRUD 방향을 정리한 대화',
    memo: 'PC 위치와 무관한 계정 기반 AI 기록',
    link: 'https://chatgpt.com',
    status: 'Doing',
    tags: ['기획', '대화'],
  },
  {
    id: 102,
    title: '자료 태그 후보',
    accountId: 'google-2',
    tool: 'Gemini',
    savedAt: '2026-05-13 20:30',
    description: '자료 취합 시 사용할 태그 후보',
    memo: '검색과 필터링에 쓸 키워드 정리',
    link: 'https://gemini.google.com',
    status: 'To-Do',
    tags: ['태그', '정리'],
  },
  {
    id: 103,
    title: '문서 요약 기록',
    accountId: 'google-3',
    tool: 'Claude',
    savedAt: '2026-05-12 18:00',
    description: '긴 문서 요약과 비교 분석 메모',
    memo: '보관 자료 위치만 기록하고 인증 정보는 저장하지 않음',
    link: 'https://claude.ai',
    status: 'Review',
    tags: ['요약', '문서'],
  },
]

function createEmptyLocalForm(defaultPcId = '') {
  return {
    name: '',
    pcId: defaultPcId,
    savedAt: '',
    description: '',
    memo: '',
    pathMemo: '',
    status: 'To-Do',
    tagsText: '',
  }
}

function createEmptyTaskForm(defaultPcId = '') {
  return {
    title: '',
    pcId: defaultPcId,
    status: 'To-Do',
    progress: '0',
    note: '',
  }
}

const emptyAccountForm = {
  title: '',
  accountId: googleAccounts[0].id,
  tool: '',
  savedAt: '',
  description: '',
  memo: '',
  link: '',
  status: 'To-Do',
  tagsText: '',
}

const statusLabels = {
  Done: '했던 것',
  'To-Do': '할 것',
  Doing: '도중',
  Review: '확인할 것',
}

function App() {
  const [pcs, setPcs] = useState(() => loadPcs())
  const defaultPcId = pcs[0]?.id ?? ''
  const [localResources, setLocalResources] = useState(() => loadLocalResources())
  const [accountRecords, setAccountRecords] = useState(() => loadAccountRecords())
  const [taskItems, setTaskItems] = useState(() => loadTasks())
  const [selectedPcId, setSelectedPcId] = useState(defaultPcId)
  const [selectedAccountId, setSelectedAccountId] = useState(googleAccounts[0].id)
  const [selectedTool, setSelectedTool] = useState('All')
  const [view, setView] = useState('pc')
  const [query, setQuery] = useState('')
  const [editingLocalResource, setEditingLocalResource] = useState(null)
  const [editingAccountRecord, setEditingAccountRecord] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [localForm, setLocalForm] = useState(() => createEmptyLocalForm(defaultPcId))
  const [accountForm, setAccountForm] = useState(emptyAccountForm)
  const [taskForm, setTaskForm] = useState(() => createEmptyTaskForm(defaultPcId))
  const [activeModal, setActiveModal] = useState(null)
  const [selectedTaskIdsState, setSelectedTaskIdsState] = useState([])
  const [taskExportScope, setTaskExportScope] = useState('all')
  const [pcNameInput, setPcNameInput] = useState('')
  const [pcSettingsOpen, setPcSettingsOpen] = useState(false)
  const [pcDeleteTargetId, setPcDeleteTargetId] = useState('')
  const [pcRenameTargetId, setPcRenameTargetId] = useState('')
  const [pcRenameNameInput, setPcRenameNameInput] = useState('')
  const backupImportInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(PC_STORAGE_KEY, JSON.stringify(pcs))
  }, [pcs])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localResources))
  }, [localResources])

  useEffect(() => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountRecords))
  }, [accountRecords])

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskItems))
  }, [taskItems])

  const existingTaskIds = useMemo(() => new Set(taskItems.map((task) => task.id)), [taskItems])
  const selectedTaskIds = useMemo(
    () => selectedTaskIdsState.filter((id) => existingTaskIds.has(id)),
    [selectedTaskIdsState, existingTaskIds],
  )

  const selectedPc =
    pcs.find((pc) => pc.id === selectedPcId) ??
    pcs[0] ?? { id: '', name: 'PC 미지정', label: '자료 위치', summary: 'PC를 먼저 추가해 주세요.' }
  const pcDeleteTargetSafe =
    pcs.length > 0 &&
    pcDeleteTargetId &&
    pcs.some((pc) => pc.id === pcDeleteTargetId)
      ? pcDeleteTargetId
      : (pcs[0]?.id ?? '')
  const pcRenameTargetSafe =
    pcs.length > 0 &&
    pcRenameTargetId &&
    pcs.some((pc) => pc.id === pcRenameTargetId)
      ? pcRenameTargetId
      : (pcs[0]?.id ?? '')
  const pcTasks = taskItems.filter((task) => task.pcId === selectedPc.id)
  const pcResources = localResources.filter((resource) => resource.pcId === selectedPc.id)
  const selectedAccount = googleAccounts.find((account) => account.id === selectedAccountId)
  const accountToolFilters = useMemo(() => {
    const dynamicTools = accountRecords.map((record) => normalizeToolLabel(record.tool))
    return [...new Set([UNCATEGORIZED_TOOL_LABEL, ...tools, ...dynamicTools])]
  }, [accountRecords])
  const accountScopedRecords = accountRecords.filter((record) => {
    const accountMatches = record.accountId === selectedAccountId
    const toolMatches = selectedTool === 'All' || normalizeToolLabel(record.tool) === selectedTool

    return accountMatches && toolMatches
  })

  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return {
        local: localResources,
        accounts: accountRecords,
        tasks: taskItems,
      }
    }

    return {
      local: localResources.filter((resource) =>
        localResourceMatches(resource, keyword, (pcId) => getPcName(pcId, pcs)),
      ),
      accounts: accountRecords.filter((record) => accountRecordMatches(record, keyword)),
      tasks: taskItems.filter((task) =>
        taskItemMatches(task, keyword, (pcId) => getPcName(pcId, pcs)),
      ),
    }
  }, [accountRecords, localResources, pcs, query, taskItems])

  const openCreateLocalForm = (pcId = selectedPc.id) => {
    setEditingLocalResource(null)
    setLocalForm({ ...createEmptyLocalForm(defaultPcId), pcId, savedAt: getCurrentDateTime() })
    setActiveModal('local')
  }

  const openEditLocalForm = (resource) => {
    setEditingLocalResource(resource)
    setLocalForm({
      name: resource.name,
      pcId: resource.pcId,
      savedAt: resource.savedAt,
      description: resource.description,
      memo: resource.memo ?? '',
      pathMemo: resource.pathMemo ?? '',
      status: resource.status ?? 'To-Do',
      tagsText: resource.tags.join(', '),
    })
    setActiveModal('local')
  }

  const openCreateAccountForm = (accountId = selectedAccountId, tool = selectedTool) => {
    const nextTool = tool === 'All' || tool === UNCATEGORIZED_TOOL_LABEL ? '' : tool
    setEditingAccountRecord(null)
    setAccountForm({
      ...emptyAccountForm,
      accountId,
      tool: nextTool,
      link: toolHomeLinks[nextTool] ?? '',
      savedAt: getCurrentDateTime(),
    })
    setActiveModal('account')
  }

  const openEditAccountForm = (record) => {
    setEditingAccountRecord(record)
    setAccountForm({
      title: record.title,
      accountId: record.accountId,
      tool: record.tool ?? '',
      savedAt: record.savedAt,
      description: record.description,
      memo: record.memo ?? '',
      link: record.link ?? toolHomeLinks[record.tool] ?? '',
      status: record.status ?? 'To-Do',
      tagsText: record.tags.join(', '),
    })
    setActiveModal('account')
  }

  const openCreateTaskForm = (status = 'To-Do', pcId = selectedPc.id) => {
    setEditingTask(null)
    setTaskForm({ ...createEmptyTaskForm(defaultPcId), pcId, status })
    setActiveModal('task')
  }

  const openEditTaskForm = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      pcId: task.pcId,
      status: task.status,
      progress: String(task.progress),
      note: task.note ?? '',
    })
    setActiveModal('task')
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingLocalResource(null)
    setEditingAccountRecord(null)
    setEditingTask(null)
    setLocalForm(createEmptyLocalForm(defaultPcId))
    setAccountForm(emptyAccountForm)
    setTaskForm(createEmptyTaskForm(defaultPcId))
  }

  const handleLocalFormChange = (event) => {
    const { name, value } = event.target
    setLocalForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleAccountFormChange = (event) => {
    const { name, value } = event.target
    setAccountForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === 'tool' ? { link: toolHomeLinks[value] ?? currentForm.link } : {}),
    }))
  }

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target
    setTaskForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleLocalSubmit = (event) => {
    event.preventDefault()

    const nextResourceData = {
      taskId: editingLocalResource?.taskId ?? null,
      name: localForm.name.trim(),
      pcId: localForm.pcId,
      savedAt: localForm.savedAt,
      description: localForm.description.trim(),
      memo: localForm.memo.trim(),
      pathMemo: localForm.pathMemo.trim(),
      status: localForm.status,
      tags: parseTags(localForm.tagsText),
    }

    setLocalResources((currentResources) => {
      const nextResource = {
        ...nextResourceData,
        id: editingLocalResource?.id ?? getNextId(currentResources),
      }

      return editingLocalResource
        ? currentResources.map((resource) =>
            resource.id === editingLocalResource.id ? nextResource : resource,
          )
        : [nextResource, ...currentResources]
    })
    setSelectedPcId(nextResourceData.pcId || selectedPc.id)
    closeModal()
  }

  const handleAccountSubmit = (event) => {
    event.preventDefault()

    const nextRecordData = {
      title: accountForm.title.trim(),
      accountId: accountForm.accountId,
      tool: accountForm.tool.trim(),
      savedAt: accountForm.savedAt,
      description: accountForm.description.trim(),
      memo: accountForm.memo.trim(),
      link: normalizeUrl(accountForm.link),
      status: accountForm.status,
      tags: parseTags(accountForm.tagsText),
    }

    setAccountRecords((currentRecords) => {
      const nextRecord = {
        ...nextRecordData,
        id: editingAccountRecord?.id ?? getNextId(currentRecords),
      }

      return editingAccountRecord
        ? currentRecords.map((record) =>
            record.id === editingAccountRecord.id ? nextRecord : record,
          )
        : [nextRecord, ...currentRecords]
    })
    setSelectedAccountId(nextRecordData.accountId)
    setSelectedTool(normalizeToolLabel(nextRecordData.tool))
    closeModal()
  }

  const handleTaskSubmit = (event) => {
    event.preventDefault()

    const nextTaskData = {
      title: taskForm.title.trim(),
      pcId: taskForm.pcId,
      status: taskForm.status,
      progress: clampProgress(taskForm.progress),
      note: taskForm.note.trim(),
    }

    setTaskItems((currentTasks) => {
      const nextTask = {
        ...nextTaskData,
        id: editingTask?.id ?? getNextId(currentTasks),
      }

      return editingTask
        ? currentTasks.map((task) => (task.id === editingTask.id ? nextTask : task))
        : [nextTask, ...currentTasks]
    })
    setSelectedPcId(nextTaskData.pcId || selectedPc.id)
    closeModal()
  }

  const handleLocalDelete = (resourceId) => {
    const target = localResources.find((resource) => resource.id === resourceId)
    const confirmed = confirm(
      `"${target?.name ?? '로컬 자료'}" 인덱스를 삭제할까요?\n실제 파일은 삭제되지 않습니다.`,
    )

    if (!confirmed) return

    setLocalResources((currentResources) =>
      currentResources.filter((resource) => resource.id !== resourceId),
    )
  }

  const handleAccountDelete = (recordId) => {
    const target = accountRecords.find((record) => record.id === recordId)
    const confirmed = confirm(
      `"${target?.title ?? 'AI 기록'}" 기록을 삭제할까요?\n구글 계정의 실제 기록은 삭제되지 않습니다.`,
    )

    if (!confirmed) return

    setAccountRecords((currentRecords) => currentRecords.filter((record) => record.id !== recordId))
  }

  const handleTaskDelete = (taskId) => {
    const target = taskItems.find((task) => task.id === taskId)
    const confirmed = confirm(`"${target?.title ?? '작업'}"을 삭제할까요?`)

    if (!confirmed) return

    setTaskItems((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    closeModal()
  }

  const handlePcTasksDeleteAll = () => {
    if (pcTasks.length === 0) {
      alert('삭제할 작업이 없습니다.')
      return
    }

    const confirmed = confirm(
      `${selectedPc.name}의 작업 ${pcTasks.length}개를 전부 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
    )
    if (!confirmed) return

    setTaskItems((currentTasks) => currentTasks.filter((task) => task.pcId !== selectedPc.id))
  }

  const handlePcLocalDeleteAll = () => {
    if (pcResources.length === 0) {
      alert('삭제할 로컬 자료가 없습니다.')
      return
    }

    const confirmed = confirm(
      `${selectedPc.name}의 로컬 자료 ${pcResources.length}개를 전부 삭제할까요?\n실제 파일은 삭제되지 않습니다.`,
    )
    if (!confirmed) return

    setLocalResources((currentResources) =>
      currentResources.filter((resource) => resource.pcId !== selectedPc.id),
    )
  }

  const handlePcCreate = (event) => {
    event.preventDefault()
    const trimmedName = pcNameInput.trim()

    if (!trimmedName) {
      alert('PC 이름을 입력해 주세요.')
      return
    }

    const nextPc = {
      id: createPcId(pcs),
      name: trimmedName,
      label: '자료 위치',
      summary: `${trimmedName}에 있는 작업과 자료를 확인`,
    }

    setPcs((currentPcs) => [...currentPcs, nextPc])
    setSelectedPcId(nextPc.id)
    setPcNameInput('')
  }

  const handlePcRename = (event) => {
    event.preventDefault()
    const targetId = pcRenameTargetSafe
    const trimmedName = pcRenameNameInput.trim()
    if (!trimmedName) {
      alert('PC 이름을 입력해 주세요.')
      return
    }

    const targetPc = pcs.find((pc) => pc.id === targetId)
    if (!targetPc) return

    if (targetPc.name === trimmedName) return

    setPcs((currentPcs) =>
      currentPcs.map((pc) =>
        pc.id === targetId
          ? {
              ...pc,
              name: trimmedName,
              summary: `${trimmedName}에 있는 작업과 자료를 확인`,
            }
          : pc,
      ),
    )
  }

  const handlePcDelete = (pcId) => {
    if (pcs.length <= 1) {
      alert('최소 1개의 PC는 남아 있어야 합니다.')
      return
    }

    const targetPc = pcs.find((pc) => pc.id === pcId)
    if (!targetPc) return

    const taskCount = taskItems.filter((task) => task.pcId === pcId).length
    const resourceCount = localResources.filter((resource) => resource.pcId === pcId).length
    const confirmed = confirm(
      `"${targetPc.name}"을(를) 삭제할까요?\n연결된 작업 ${taskCount}개와 로컬 자료 ${resourceCount}개도 함께 삭제됩니다.`,
    )
    if (!confirmed) return

    setPcs((currentPcs) => currentPcs.filter((pc) => pc.id !== pcId))
    setTaskItems((currentTasks) => currentTasks.filter((task) => task.pcId !== pcId))
    setLocalResources((currentResources) =>
      currentResources.filter((resource) => resource.pcId !== pcId),
    )
    if (selectedPc.id === pcId) {
      const fallbackPc = pcs.find((pc) => pc.id !== pcId)
      if (fallbackPc) setSelectedPcId(fallbackPc.id)
    }
  }

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIdsState((currentIds) =>
      currentIds.includes(taskId)
        ? currentIds.filter((currentTaskId) => currentTaskId !== taskId)
        : [...currentIds, taskId],
    )
  }

  const selectPcTasks = () => {
    setSelectedTaskIdsState(pcTasks.map((task) => task.id))
  }

  const clearTaskSelection = () => {
    setSelectedTaskIdsState([])
  }

  const getTaskExportTargets = () => {
    if (taskExportScope === 'selected') {
      return taskItems.filter((task) => selectedTaskIds.includes(task.id))
    }

    return taskItems
  }

  const handleTaskFileExport = () => {
    const targetTasks = getTaskExportTargets()
    if (targetTasks.length === 0) {
      alert('내보낼 작업이 없습니다. 먼저 작업을 선택하거나 작업을 추가하세요.')
      return
    }

    const fileDate = getCurrentDateTime().replaceAll(':', '-').replace(' ', '_')
    downloadFile(
      `project-master-tasks-${fileDate}.txt`,
      createTaskExportText(targetTasks, pcs),
      'text/plain',
    )
  }

  const handleAccountLinkCopy = async (record, mode = 'url') => {
    const normalizedLink = normalizeUrl(record.link)
    if (!normalizedLink) {
      alert('복사할 링크가 없습니다.')
      return
    }

    const textToCopy =
      mode === 'title-url' ? createTitleAndUrlText(record.title, normalizedLink) : normalizedLink
    const copyMethod = await copyTextWithFallback(textToCopy)

    if (copyMethod === 'clipboard-api') {
      alert(`${mode === 'title-url' ? '제목+URL' : 'URL'}이 클립보드에 복사되었습니다.`)
      return
    }

    if (copyMethod === 'exec-command') {
      alert(
        `브라우저 기본 클립보드 접근이 거부되어 fallback 복사 방식으로 처리했습니다.\n${mode === 'title-url' ? '제목+URL' : 'URL'}이 복사되었습니다.`,
      )
      return
    }

    alert('클립보드 복사에 실패했습니다. 링크 열기로 직접 접근하거나 .url 내보내기를 사용해 주세요.')
  }

  const handleAccountShortcutExport = (record) => {
    if (!record.link) {
      alert('내보낼 링크가 없습니다.')
      return
    }

    const normalizedUrl = normalizeUrl(record.link)
    if (!normalizedUrl) {
      alert('유효한 URL이 아닙니다. 링크를 먼저 확인해 주세요.')
      return
    }

    const shortcutName = createShortcutFilename(record.title || record.tool || 'shortcut')
    const shortcutContent = createInternetShortcutContent(normalizedUrl)
    downloadFile(`${shortcutName}.url`, shortcutContent, 'text/plain')
    alert(
      `"${shortcutName}.url" 파일을 다운로드했습니다.\n다운로드 폴더에서 바탕화면으로 옮기면 바로가기처럼 사용할 수 있습니다.`,
    )
  }

  const handleBackupExport = () => {
    const payload = {
      version: 2,
      exportedAt: getCurrentDateTime(),
      pcs,
      localResources,
      accountRecords,
      tasks: taskItems,
    }

    const fileDate = getCurrentDateTime().replaceAll(':', '-').replace(' ', '_')
    downloadFile(
      `project-master-backup-${fileDate}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    )
    alert('백업 파일을 다운로드했습니다.')
  }

  const handleBackupImportClick = () => {
    backupImportInputRef.current?.click()
  }

  const handleBackupImport = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    try {
      const fileContent = await selectedFile.text()
      const parsedData = JSON.parse(fileContent)

      if (
        !Array.isArray(parsedData?.pcs) ||
        !Array.isArray(parsedData?.localResources) ||
        !Array.isArray(parsedData?.accountRecords)
      ) {
        alert('가져올 수 없는 백업 형식입니다.')
        return
      }

      const importedPcs = parsedData.pcs
        .map((pc, index) => normalizePc(pc, index))
        .filter((pc) => pc.id && pc.name)
      if (importedPcs.length === 0) {
        alert('가져올 수 있는 PC 데이터가 없습니다.')
        return
      }

      // Avoid duplicate ids in malformed backups.
      const dedupedPcs = []
      importedPcs.forEach((pc) => {
        if (dedupedPcs.some((existingPc) => existingPc.id === pc.id)) {
          dedupedPcs.push({ ...pc, id: createPcId(dedupedPcs) })
          return
        }
        dedupedPcs.push(pc)
      })

      const validPcIds = new Set(dedupedPcs.map((pc) => pc.id))
      const fallbackPcId = dedupedPcs[0].id
      const nextLocalResources = parsedData.localResources.map((resource) => {
        const normalized = normalizeLocalResource(resource)
        return {
          ...normalized,
          pcId: validPcIds.has(normalized.pcId) ? normalized.pcId : fallbackPcId,
        }
      })
      const nextTasks = Array.isArray(parsedData.tasks)
        ? parsedData.tasks.map((task) => {
            const normalized = normalizeTask(task)
            return {
              ...normalized,
              pcId: validPcIds.has(normalized.pcId) ? normalized.pcId : fallbackPcId,
            }
          })
        : taskItems
      const nextAccountRecords = parsedData.accountRecords.map(normalizeAccountRecord)

      const confirmed = confirm(
        `백업 파일을 가져올까요?\n현재 데이터가 아래 개수로 교체됩니다.\nPC ${dedupedPcs.length}개 / 로컬 자료 ${nextLocalResources.length}개 / AI 기록 ${nextAccountRecords.length}개 / 작업 ${nextTasks.length}개`,
      )
      if (!confirmed) return

      setPcs(dedupedPcs)
      setLocalResources(nextLocalResources)
      setAccountRecords(nextAccountRecords)
      setTaskItems(nextTasks)
      setSelectedPcId(fallbackPcId)
      setSelectedAccountId(nextAccountRecords[0]?.accountId ?? googleAccounts[0].id)
      setSelectedTool('All')
      setSelectedTaskIdsState([])
      alert('백업 데이터를 불러왔습니다.')
    } catch {
      alert('백업 파일을 읽는 중 문제가 생겼습니다.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">개요</p>
          <h3>기록관리</h3>
       
        </div>
        <div className="hero-card">
          <span>총 건수</span>
          <strong>{taskItems.length + accountRecords.length}</strong>
          <small>작업 {taskItems.length}개 / AI 기록 {accountRecords.length}개</small>
        </div>
      </header>

      <nav className="view-tabs" aria-label="메인 화면 선택">
        <button className={view === 'pc' ? 'active' : ''} onClick={() => setView('pc')}>
          PC별 로컬 자료
        </button>
        <button
          className={view === 'accounts' ? 'active' : ''}
          onClick={() => setView('accounts')}
        >
          계정/AI 기록
        </button>
        <button className={view === 'search' ? 'active' : ''} onClick={() => setView('search')}>
          통합 검색
        </button>
      </nav>

      {view === 'pc' && (
        <section className="workspace-grid">
          <aside className="pc-list" aria-label="컴퓨터 선택">
            {pcs.map((pc) => (
              <button
                key={pc.id}
                type="button"
                className={selectedPcId === pc.id ? 'pc-button active' : 'pc-button'}
                onClick={() => setSelectedPcId(pc.id)}
              >
                <strong>{pc.name}</strong>
                <span>{pc.label}</span>
              </button>
            ))}
            <div className="pc-list-settings">
              <button
                type="button"
                className={`ghost-button secondary pc-settings-toggle ${pcSettingsOpen ? 'active' : ''}`}
                onClick={() => {
                  const nextOpen = !pcSettingsOpen
                  if (nextOpen && pcs.length > 0) {
                    setPcRenameTargetId(selectedPcId)
                    setPcRenameNameInput(pcs.find((pc) => pc.id === selectedPcId)?.name ?? '')
                  }
                  setPcSettingsOpen(nextOpen)
                }}
                aria-expanded={pcSettingsOpen}
              >
                PC 추가
              </button>
              {pcSettingsOpen && (
                <div className="pc-settings-panel">
                  <div className="pc-settings-panel-header">
                    <p className="pc-settings-panel-title">PC 설정</p>
                    <button
                      type="button"
                      className="text-button pc-settings-close"
                      onClick={() => setPcSettingsOpen(false)}
                      aria-label="PC 설정 닫기"
                    >
                      닫기
                    </button>
                  </div>
                  <form className="pc-create-form" onSubmit={handlePcCreate}>
                    <input
                      value={pcNameInput}
                      onChange={(event) => setPcNameInput(event.target.value)}
                      placeholder="새 PC 이름"
                      aria-label="새 PC 이름"
                    />
                    <button type="submit" className="ghost-button secondary">
                      + PC 추가
                    </button>
                  </form>
                  <form className="pc-rename-form" onSubmit={handlePcRename}>
                    <p className="pc-settings-section-title">이름 수정</p>
                    <label className="pc-delete-label">
                      <span>수정할 PC</span>
                      <select
                        value={pcRenameTargetSafe}
                        onChange={(event) => {
                          const id = event.target.value
                          setPcRenameTargetId(id)
                          setPcRenameNameInput(pcs.find((pc) => pc.id === id)?.name ?? '')
                        }}
                        aria-label="이름을 수정할 PC 선택"
                      >
                        {pcs.map((pc) => (
                          <option key={pc.id} value={pc.id}>
                            {pc.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="pc-delete-label">
                      <span>새 이름</span>
                      <input
                        value={pcRenameNameInput}
                        onChange={(event) => setPcRenameNameInput(event.target.value)}
                        placeholder="표시 이름"
                        aria-label="새 PC 표시 이름"
                      />
                    </label>
                    <button type="submit" className="ghost-button secondary">
                      이름 저장
                    </button>
                  </form>
                  <div className="pc-delete-block">
                    <label className="pc-delete-label">
                      <span>삭제할 PC</span>
                      <select
                        value={pcDeleteTargetSafe}
                        onChange={(event) => setPcDeleteTargetId(event.target.value)}
                        aria-label="삭제할 PC 선택"
                      >
                        {pcs.map((pc) => (
                          <option key={pc.id} value={pc.id}>
                            {pc.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="text-button danger pc-settings-delete"
                      disabled={pcs.length <= 1}
                      onClick={() => handlePcDelete(pcDeleteTargetSafe)}
                    >
                      PC 삭제
                    </button>
                    {pcs.length <= 1 && (
                      <small className="pc-delete-hint">PC는 최소 1개 유지됩니다.</small>
                    )}
                  </div>
                  <div className="pc-backup-block">
                    <p className="pc-settings-section-title">백업 / 복원</p>
                    <small className="pc-delete-hint">
                      사이트 데이터 삭제 전에 JSON 백업을 내려받아 두세요.
                    </small>
                    <div className="pc-backup-actions">
                      <button type="button" className="ghost-button secondary" onClick={handleBackupExport}>
                        JSON 백업
                      </button>
                      <button type="button" className="text-button" onClick={handleBackupImportClick}>
                        JSON 불러오기
                      </button>
                    </div>
                    <input
                      ref={backupImportInputRef}
                      className="pc-backup-input"
                      type="file"
                      accept="application/json,.json"
                      onChange={handleBackupImport}
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">{selectedPc.label ?? '자료 위치'}</p>
                <h2>{selectedPc.name} 로컬 자료</h2>
                <p>{selectedPc.summary}</p>
              </div>
              <button className="ghost-button" onClick={() => openCreateLocalForm(selectedPc.id)}>
                + 로컬 자료 추가
              </button>
            </div>

            <div className="summary-grid">
              {renderSummaryCard('작업', pcTasks.length)}
              {renderSummaryCard('로컬 자료', pcResources.length)}
            </div>

            <div className="section-block">
              <h3>작업 제목/내용 내보내기</h3>
              <p className="hero-copy">카드에서 선택한 작업만 따로 내보내거나, 전체 작업을 한번에 내보낼 수 있습니다.</p>
              <div className="form-actions split">
                <div>
                  <button type="button" className="text-button" onClick={selectPcTasks}>
                    현재 PC 작업 선택
                  </button>
                  <button type="button" className="text-button" onClick={clearTaskSelection}>
                    선택 해제
                  </button>
                </div>
                <small>선택된 작업 {selectedTaskIds.length}개</small>
              </div>

              <div className="form-actions split">
                <label>
                  <span>내보내기 범위</span>
                  <select
                    name="taskExportScope"
                    value={taskExportScope}
                    onChange={(event) => setTaskExportScope(event.target.value)}
                  >
                    <option value="all">전체 작업</option>
                    <option value="selected">선택한 작업</option>
                  </select>
                </label>
                <div>
                  <button
                    type="button"
                    className="ghost-button secondary"
                    onClick={handleTaskFileExport}
                  >
                    텍스트 내보내기
                  </button>
                </div>
              </div>
            </div>

            <div className="section-block">
              <div className="section-heading">
                <h3>작업 상태</h3>
                <button type="button" className="text-button danger" onClick={handlePcTasksDeleteAll}>
                  전부 삭제
                </button>
              </div>
              <div className="kanban">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <div key={status} className="kanban-column">
                    <div className="column-title">
                      <span>{label}</span>
                      <span className="column-count">
                        {pcTasks.filter((task) => task.status === status).length}
                      </span>
                    </div>
                    <button
                      className="add-task-button"
                      onClick={() => openCreateTaskForm(status, selectedPc.id)}
                    >
                      + 작업 추가
                    </button>
                    {pcTasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <div key={task.id} className="task-item">
                          <button
                            className={selectedTaskIds.includes(task.id) ? 'task-card selected' : 'task-card'}
                            onClick={() => openEditTaskForm(task)}
                          >
                            <strong>{task.title}</strong>
                            <p>{task.note}</p>
                            <div className="progress">
                              <span style={{ width: `${task.progress}%` }} />
                            </div>
                            <small>{task.progress}%</small>
                          </button>
                          <button
                            type="button"
                            className={
                              selectedTaskIds.includes(task.id)
                                ? 'task-select-toggle selected'
                                : 'task-select-toggle'
                            }
                            onClick={() => toggleTaskSelection(task.id)}
                            aria-pressed={selectedTaskIds.includes(task.id)}
                          >
                            {selectedTaskIds.includes(task.id) ? '✓ 선택됨' : '+ 선택'}
                          </button>
                          <button
                            type="button"
                            className="text-button danger"
                            onClick={() => handleTaskDelete(task.id)}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {renderLocalTable(pcResources, {
              onEdit: openEditLocalForm,
              onDelete: handleLocalDelete,
              emptyActionLabel: '+ 로컬 자료 추가',
              onEmptyAction: () => openCreateLocalForm(selectedPc.id),
              headerActions: (
                <button type="button" className="text-button danger" onClick={handlePcLocalDeleteAll}>
                  전부 삭제
                </button>
              ),
            })}
          </section>
        </section>
      )}

      {view === 'accounts' && (
        <section className="workspace-grid">
          <aside className="pc-list" aria-label="구글 계정 선택">
            {googleAccounts.map((account) => (
              <button
                key={account.id}
                className={selectedAccountId === account.id ? 'pc-button active' : 'pc-button'}
                onClick={() => setSelectedAccountId(account.id)}
              >
                <strong>{account.name}</strong>
                <span>계정</span>
              </button>
            ))}
          </aside>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">계정/AI 기록</p>
                <h2>{selectedAccount.name}의 AI 기록</h2>
                <p>PC 위치와 무관하게 이 계정에 남아 있는 AI 서비스별 기록을 확인합니다.</p>
              </div>
              <button className="ghost-button" onClick={() => openCreateAccountForm()}>
                + AI 기록 추가
              </button>
            </div>

            <nav className="view-tabs" aria-label="서비스 필터 선택">
              <button
                className={selectedTool === 'All' ? 'active' : ''}
                onClick={() => setSelectedTool('All')}
              >
                전체
              </button>
              {accountToolFilters.map((tool) => (
                <button
                  key={tool}
                  className={selectedTool === tool ? 'active' : ''}
                  onClick={() => setSelectedTool(tool)}
                >
                  {tool}
                </button>
              ))}
            </nav>

            <div className="summary-grid">
              {renderSummaryCard('AI 기록', accountScopedRecords.length)}
              {renderSummaryCard(
                '전체 AI 기록',
                accountRecords.filter((record) => record.accountId === selectedAccountId).length,
              )}
              {renderSummaryCard('관리 서비스', accountToolFilters.length)}
            </div>

            {renderAccountTable(accountScopedRecords, {
              onEdit: openEditAccountForm,
              onDelete: handleAccountDelete,
              onCopyLink: (record) => handleAccountLinkCopy(record, 'url'),
              onCopyTitleLink: (record) => handleAccountLinkCopy(record, 'title-url'),
              onExportShortcut: handleAccountShortcutExport,
              emptyActionLabel: '+ AI 기록 추가',
              onEmptyAction: () => openCreateAccountForm(),
            })}
          </section>
        </section>
      )}

      {view === 'search' && (
        <section className="panel">
          <div className="panel-header search-header">
            <div>
              <p className="eyebrow">검색</p>
              <h2>통합 검색</h2>
              
            </div>
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="파일명, 계정, 서비스, 작업, 상태, 설명, 태그 검색"
            />
          </div>

          {renderLocalTable(searchResults.local, {
            title: '로컬 자료 검색 결과',
            showPc: true,
            pcNameById: (pcId) => getPcName(pcId, pcs),
            onEdit: openEditLocalForm,
            onDelete: handleLocalDelete,
          })}

          {renderTaskTable(searchResults.tasks, {
            title: '작업 검색 결과',
            showPc: true,
            pcNameById: (pcId) => getPcName(pcId, pcs),
            onEdit: openEditTaskForm,
            onDelete: handleTaskDelete,
          })}

          {renderAccountTable(searchResults.accounts, {
            title: '계정/AI 기록 검색 결과',
            showAccount: true,
            onEdit: openEditAccountForm,
            onDelete: handleAccountDelete,
            onCopyLink: (record) => handleAccountLinkCopy(record, 'url'),
            onCopyTitleLink: (record) => handleAccountLinkCopy(record, 'title-url'),
            onExportShortcut: handleAccountShortcutExport,
          })}
        </section>
      )}

      {activeModal === 'local' &&
        renderLocalResourceModal(
          localForm,
          Boolean(editingLocalResource),
          handleLocalFormChange,
          closeModal,
          handleLocalSubmit,
          pcs,
        )}

      {activeModal === 'account' &&
        renderAccountRecordModal(
          accountForm,
          Boolean(editingAccountRecord),
          handleAccountFormChange,
          closeModal,
          handleAccountSubmit,
        )}

      {activeModal === 'task' &&
        renderTaskModal(
          taskForm,
          Boolean(editingTask),
          handleTaskFormChange,
          closeModal,
          handleTaskSubmit,
          () => handleTaskDelete(editingTask?.id),
          pcs,
        )}
    </main>
  )
}

function renderLocalResourceModal(form, isEditing, onChange, onClose, onSubmit, pcs) {
  return (
    <div className="modal-backdrop">
      <dialog className="resource-modal" aria-labelledby="local-form-title" open>
        <div className="modal-header">
          <div>
            <p className="eyebrow">로컬 자료</p>
            <h2 id="local-form-title">{isEditing ? '로컬 자료 수정' : '새 로컬 자료 추가'}</h2>
            <p>실제 파일은 업로드하지 않고 파일명, 위치, 설명, 메모만 저장합니다.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className="resource-form" onSubmit={onSubmit}>
          <label>
            <span>자료명 / 파일명</span>
            <input name="name" value={form.name} onChange={onChange} required />
          </label>

          <label>
            <span>위치 PC</span>
            <select name="pcId" value={form.pcId} onChange={onChange}>
              {pcs.map((pc) => (
                <option key={pc.id} value={pc.id}>
                  {pc.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>상태</span>
            {renderStatusSelect(form.status, onChange)}
          </label>

          <label>
            <span>저장 시간</span>
            <input name="savedAt" value={form.savedAt} onChange={onChange} placeholder="2026-05-14 09:30" />
          </label>

          <label className="full">
            <span>한 줄 설명</span>
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="이 로컬 자료가 무엇인지 짧게 입력"
              required
            />
          </label>

          <label className="full">
            <span>메모</span>
            <textarea
              name="memo"
              value={form.memo}
              onChange={onChange}
              placeholder="확인할 점, 취합 이유, 특이사항"
              rows="3"
            />
          </label>

          <label className="full">
            <span>파일 위치 / 경로 메모</span>
            <input
              name="pathMemo"
              value={form.pathMemo}
              onChange={onChange}
              placeholder="예: D:\\Projects\\... 또는 PC 2 다운로드 폴더"
            />
          </label>

          <label className="full">
            <span>태그</span>
            <input
              name="tagsText"
              value={form.tagsText}
              onChange={onChange}
              placeholder="쉼표로 구분: 기획, 자료, 프롬프트"
            />
          </label>

          {renderFormActions(isEditing, onClose)}
        </form>
      </dialog>
    </div>
  )
}

function renderAccountRecordModal(form, isEditing, onChange, onClose, onSubmit) {
  return (
    <div className="modal-backdrop">
      <dialog className="resource-modal" aria-labelledby="account-form-title" open>
        <div className="modal-header">
          <div>
            <p className="eyebrow">AI 기록</p>
            <h2 id="account-form-title">{isEditing ? 'AI 기록 수정' : '새 AI 기록 추가'}</h2>
            <p>비밀번호, 인증 코드, 백업 코드, 세션 정보는 저장하지 마세요.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className="resource-form" onSubmit={onSubmit}>
          <label>
            <span>기록 제목</span>
            <input name="title" value={form.title} onChange={onChange} required />
          </label>

          <label>
            <span>구글 계정</span>
            <select name="accountId" value={form.accountId} onChange={onChange}>
              {googleAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>서비스</span>
            <input
              name="tool"
              value={form.tool}
              onChange={onChange}
              list="tool-options"
              placeholder="예: ChatGPT, Gemini, 기타 사이트명"
            />
            <datalist id="tool-options">
              {tools.map((tool) => (
                <option key={tool} value={tool} />
              ))}
            </datalist>
            <small>비워두면 미분류로 저장됩니다.</small>
            <button
              type="button"
              className="text-button"
              onClick={() => onChange({ target: { name: 'tool', value: '' } })}
            >
              미분류로 저장
            </button>
          </label>

          <label>
            <span>상태</span>
            {renderStatusSelect(form.status, onChange)}
          </label>

          <label className="full">
            <span>한 줄 설명</span>
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="이 AI 기록이 무엇인지 짧게 입력"
              required
            />
          </label>

          <label className="full">
            <span>메모</span>
            <textarea
              name="memo"
              value={form.memo}
              onChange={onChange}
              placeholder="보유 자료, 대화 요약, 확인할 링크, 특이사항"
              rows="3"
            />
          </label>

          <label>
            <span>기록 시간</span>
            <input name="savedAt" value={form.savedAt} onChange={onChange} placeholder="2026-05-14 09:30" />
          </label>

          <label>
            <span>서비스 홈 링크</span>
            <input
              name="link"
              value={form.link}
              onChange={onChange}
              placeholder="https://chatgpt.com"
            />
          </label>

          <label className="full">
            <span>태그</span>
            <input
              name="tagsText"
              value={form.tagsText}
              onChange={onChange}
              placeholder="쉼표로 구분: 요약, 프롬프트, 링크"
            />
          </label>

          {renderFormActions(isEditing, onClose)}
        </form>
      </dialog>
    </div>
  )
}

function renderTaskModal(form, isEditing, onChange, onClose, onSubmit, onDelete, pcs) {
  return (
    <div className="modal-backdrop">
      <dialog className="resource-modal" aria-labelledby="task-form-title" open>
        <div className="modal-header">
          <div>
            <p className="eyebrow">작업</p>
            <h2 id="task-form-title">{isEditing ? '작업 수정' : '새 작업 추가'}</h2>
            <p>작업 상태 칸에서 바로 추가하고, 카드를 클릭해 수정합니다.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className="resource-form" onSubmit={onSubmit}>
          <label className="full">
            <span>작업 제목</span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="작업 이름"
              required
            />
          </label>

          <label>
            <span>위치 PC</span>
            <select name="pcId" value={form.pcId} onChange={onChange}>
              {pcs.map((pc) => (
                <option key={pc.id} value={pc.id}>
                  {pc.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>상태</span>
            {renderStatusSelect(form.status, onChange)}
          </label>

          <label className="full">
            <span>진행도</span>
            <input
              name="progress"
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={onChange}
            />
            <small>{form.progress}%</small>
          </label>

          <label className="full">
            <span>메모</span>
            <textarea
              name="note"
              value={form.note}
              onChange={onChange}
              placeholder="작업 내용, 확인할 점, 다음 행동"
              rows="3"
            />
          </label>

          <div className="form-actions split">
            {isEditing ? (
              <button type="button" className="text-button danger" onClick={onDelete}>
                삭제
              </button>
            ) : (
              <span />
            )}
            <div>
              <button type="button" className="text-button" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="ghost-button">
                {isEditing ? '수정 저장' : '추가 저장'}
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  )
}

function renderStatusSelect(value, onChange) {
  return (
    <select name="status" value={value} onChange={onChange}>
      {Object.entries(statusLabels).map(([status, label]) => (
        <option key={status} value={status}>
          {label}
        </option>
      ))}
    </select>
  )
}

function renderFormActions(isEditing, onClose) {
  return (
    <div className="form-actions">
      <button type="button" className="text-button" onClick={onClose}>
        취소
      </button>
      <button type="submit" className="ghost-button">
        {isEditing ? '수정 저장' : '추가 저장'}
      </button>
    </div>
  )
}

function renderSummaryCard(label, value) {
  return (
    <article className="summary-card" key={label}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function renderTaskTable(rows, options = {}) {
  const {
    title = '작업',
    showPc = false,
    pcNameById = (pcId) => getPcName(pcId),
    onEdit,
    onDelete,
    emptyActionLabel,
    onEmptyAction,
  } = options

  return (
    <div className="section-block table-section">
      <div className="section-heading">
        <h3>{title}</h3>
      </div>
      <div className="table-wrap">
        <table className="data-table task-table">
          <colgroup>
            {showPc && <col className="col-compact" />}
            <col className="col-primary" />
            <col className="col-note" />
            <col className="col-status" />
            <col className="col-compact" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              {showPc && <th>PC</th>}
              <th>작업 제목</th>
              <th>메모</th>
              <th>상태</th>
              <th>진행도</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showPc ? 6 : 5} className="empty-cell">
                  <div className="empty-state">
                    <strong>검색된 작업이 없습니다.</strong>
                    {onEmptyAction && (
                      <button type="button" className="ghost-button secondary" onClick={onEmptyAction}>
                        {emptyActionLabel ?? '+ 작업 추가'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {showPc && <td>{pcNameById(row.pcId)}</td>}
                  <td>
                    <strong>{row.title}</strong>
                  </td>
                  <td>{row.note}</td>
                  <td>{statusLabels[row.status] ?? row.status}</td>
                  <td>{row.progress}%</td>
                  <td>
                    {renderRowActions(() => onEdit?.(row), () => onDelete?.(row.id))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderLocalTable(rows, options = {}) {
  const {
    title = '로컬 자료 인덱스',
    showPc = false,
    pcNameById = (pcId) => getPcName(pcId),
    onEdit,
    onDelete,
    emptyActionLabel,
    onEmptyAction,
    headerActions,
  } = options

  return (
    <div className="section-block table-section">
      <div className="section-heading">
        <h3>{title}</h3>
        {headerActions}
      </div>
      <div className="table-wrap">
        <table className="data-table local-table">
          <colgroup>
            <col className="col-primary" />
            {showPc && <col className="col-compact" />}
            <col className="col-description" />
            <col className="col-note" />
            <col className="col-status" />
            <col className="col-date" />
            <col className="col-tags" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>파일명</th>
              {showPc && <th>PC</th>}
              <th>설명</th>
              <th>메모</th>
              <th>상태</th>
              <th>저장 시간</th>
              <th>태그</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showPc ? 8 : 7} className="empty-cell">
                  <div className="empty-state">
                    <strong>등록된 로컬 자료가 없습니다.</strong>
                    {onEmptyAction && (
                      <button type="button" className="ghost-button secondary" onClick={onEmptyAction}>
                        {emptyActionLabel ?? '+ 추가'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    {row.pathMemo && <small>{row.pathMemo}</small>}
                  </td>
                  {showPc && <td>{pcNameById(row.pcId)}</td>}
                  <td>{row.description}</td>
                  <td>{row.memo}</td>
                  <td>{statusLabels[row.status] ?? row.status}</td>
                  <td>{row.savedAt}</td>
                  <td>
                    {renderTagList(row.tags)}
                  </td>
                  <td>
                    {renderRowActions(() => onEdit?.(row), () => onDelete?.(row.id))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderAccountTable(rows, options = {}) {
  const {
    title = '계정/AI 기록 인덱스',
    showAccount = false,
    onEdit,
    onDelete,
    onCopyLink,
    onCopyTitleLink,
    onExportShortcut,
    emptyActionLabel,
    onEmptyAction,
  } = options

  return (
    <div className="section-block table-section">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="data-table account-table">
          <colgroup>
            <col className="col-primary" />
            {showAccount && <col className="col-compact" />}
            <col className="col-tool" />
            <col className="col-description" />
            <col className="col-note" />
            <col className="col-link" />
            <col className="col-status" />
            <col className="col-date" />
            <col className="col-tags" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>기록 제목</th>
              {showAccount && <th>계정</th>}
              <th>서비스</th>
              <th>설명</th>
              <th>메모</th>
              <th>링크</th>
              <th>상태</th>
              <th>기록 시간</th>
              <th>태그</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showAccount ? 10 : 9} className="empty-cell">
                  <div className="empty-state">
                    <strong>등록된 계정/AI 기록이 없습니다.</strong>
                    {onEmptyAction && (
                      <button type="button" className="ghost-button secondary" onClick={onEmptyAction}>
                        {emptyActionLabel ?? '+ 추가'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                  </td>
                  {showAccount && <td>{getAccountName(row.accountId)}</td>}
                  <td>{normalizeToolLabel(row.tool)}</td>
                  <td>{row.description}</td>
                  <td>{row.memo}</td>
                  <td>
                    {normalizeUrl(row.link) ? (
                      <div className="link-actions">
                        <a href={normalizeUrl(row.link)} target="_blank" rel="noreferrer">
                          열기
                        </a>
                        <button type="button" className="text-button" onClick={() => onCopyLink?.(row)}>
                          URL 복사
                        </button>
                        <button type="button" className="text-button" onClick={() => onCopyTitleLink?.(row)}>
                          제목+URL
                        </button>
                        <button type="button" className="text-button" onClick={() => onExportShortcut?.(row)}>
                          .url 내보내기
                        </button>
                      </div>
                    ) : (
                      '없음'
                    )}
                  </td>
                  <td>{statusLabels[row.status] ?? row.status}</td>
                  <td>{row.savedAt}</td>
                  <td>
                    {renderTagList(row.tags)}
                  </td>
                  <td>
                    {renderRowActions(() => onEdit?.(row), () => onDelete?.(row.id))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderTagList(tags) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  )
}

function renderRowActions(onEdit, onDelete) {
  return (
    <div className="row-actions">
      <button type="button" onClick={onEdit}>
        수정
      </button>
      <button type="button" className="danger" onClick={onDelete}>
        삭제
      </button>
    </div>
  )
}

function taskItemMatches(task, keyword, pcNameById = (pcId) => getPcName(pcId)) {
  const statusLabel = statusLabels[task.status] ?? ''
  const searchable = [
    task.title,
    task.note,
    task.status,
    statusLabel,
    String(task.progress),
    `${task.progress ?? 0}%`,
    pcNameById(task.pcId),
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(keyword)
}

function localResourceMatches(resource, keyword, pcNameById = (pcId) => getPcName(pcId)) {
  const searchable = [
    resource.name,
    resource.description,
    resource.memo,
    resource.pathMemo,
    resource.status,
    pcNameById(resource.pcId),
    resource.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(keyword)
}

function accountRecordMatches(record, keyword) {
  const searchable = [
    record.title,
    record.description,
    record.memo,
    record.tool,
    record.link,
    record.status,
    getAccountName(record.accountId),
    record.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(keyword)
}

function loadLocalResources() {
  const savedResources = readStorage(LOCAL_STORAGE_KEY)
  if (savedResources) return savedResources.map(normalizeLocalResource)

  const legacyResources = readStorage(LEGACY_STORAGE_KEY)
  if (legacyResources) return legacyResources.map(normalizeLocalResource)

  return initialLocalResources
}

function loadPcs() {
  const savedPcs = readStorage(PC_STORAGE_KEY)
  if (savedPcs) {
    const normalized = savedPcs.map(normalizePc).filter((pc) => pc.id && pc.name)
    if (normalized.length > 0) return normalized
  }

  return initialPcs
}

function loadAccountRecords() {
  const savedRecords = readStorage(ACCOUNT_STORAGE_KEY)
  if (savedRecords) return savedRecords.map(normalizeAccountRecord)

  const legacyResources = readStorage(LEGACY_STORAGE_KEY)
  if (legacyResources) {
    const migratedRecords = legacyResources
      .filter((resource) => resource.accountAlias || resource.tool || resource.link)
      .map((resource, index) => ({
        id: 1000 + index,
        title: resource.description || resource.name,
        accountId: resolveAccountId(resource.accountAlias),
        tool: typeof resource.tool === 'string' ? resource.tool.trim() : '',
        savedAt: resource.savedAt ?? '',
        description: resource.description ?? '',
        memo: resource.memo ?? '',
        link:
          resource.link ??
          (typeof resource.tool === 'string' ? toolHomeLinks[resource.tool.trim()] : undefined) ??
          '',
        status: resource.status ?? 'To-Do',
        tags: Array.isArray(resource.tags) ? resource.tags : [],
      }))

    if (migratedRecords.length > 0) return migratedRecords
  }

  return initialAccountRecords
}

function loadTasks() {
  const savedTasks = readStorage(TASK_STORAGE_KEY)
  if (savedTasks) return savedTasks.map(normalizeTask)

  return initialTasks
}

function normalizeLocalResource(resource) {
  return {
    id: resource.id,
    name: resource.name,
    pcId: resource.pcId ?? initialPcs[0].id,
    savedAt: resource.savedAt ?? '',
    taskId: resource.taskId ?? null,
    description: resource.description ?? '',
    memo: resource.memo ?? '',
    pathMemo: resource.pathMemo ?? '',
    status: resource.status ?? 'To-Do',
    tags: Array.isArray(resource.tags) ? resource.tags : [],
  }
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title ?? '',
    status: Object.hasOwn(statusLabels, task.status) ? task.status : 'To-Do',
    progress: clampProgress(task.progress),
    pcId:
      typeof task.pcId === 'string' && task.pcId.trim() ? task.pcId.trim() : initialPcs[0].id,
    note: task.note ?? '',
  }
}

function normalizePc(pc, index) {
  const fallbackName = `PC ${index + 1}`
  const name = typeof pc?.name === 'string' ? pc.name.trim() : ''

  return {
    id: typeof pc?.id === 'string' && pc.id.trim() ? pc.id.trim() : `pc-${index + 1}`,
    name: name || fallbackName,
    label: typeof pc?.label === 'string' && pc.label.trim() ? pc.label.trim() : '자료 위치',
    summary:
      typeof pc?.summary === 'string' && pc.summary.trim()
        ? pc.summary.trim()
        : `${name || fallbackName}에 있는 작업과 자료를 확인`,
  }
}

function normalizeAccountRecord(record) {
  const tool = typeof record.tool === 'string' ? record.tool.trim() : ''

  return {
    id: record.id,
    title: record.title ?? '',
    accountId: googleAccounts.some((account) => account.id === record.accountId)
      ? record.accountId
      : googleAccounts[0].id,
    tool,
    savedAt: record.savedAt ?? '',
    description: record.description ?? '',
    memo: record.memo ?? '',
    link: normalizeUrl(record.link ?? toolHomeLinks[tool] ?? ''),
    status: record.status ?? 'To-Do',
    tags: Array.isArray(record.tags) ? record.tags : [],
  }
}

function normalizeToolLabel(tool) {
  const normalized = typeof tool === 'string' ? tool.trim() : ''
  return normalized || UNCATEGORIZED_TOOL_LABEL
}

function readStorage(key) {
  const savedValue = localStorage.getItem(key)
  if (!savedValue) return null

  try {
    return JSON.parse(savedValue)
  } catch {
    return null
  }
}

function parseTags(tagsText) {
  return tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getCurrentDateTime() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 5)

  return `${date} ${time}`
}

function getPcName(pcId, pcs = initialPcs) {
  return pcs.find((pc) => pc.id === pcId)?.name ?? 'PC 미지정'
}

function getAccountName(accountId) {
  return googleAccounts.find((account) => account.id === accountId)?.name ?? '계정 미지정'
}

function resolveAccountId(accountAlias = '') {
  const matchedAccount = googleAccounts.find((account) => account.name === accountAlias)
  return matchedAccount?.id ?? googleAccounts[0].id
}

function getNextId(items) {
  const maxId = items.reduce((maxValue, item) => Math.max(maxValue, Number(item.id) || 0), 0)
  return maxId + 1
}

function clampProgress(value) {
  const progress = Number(value)
  if (Number.isNaN(progress)) return 0

  return Math.min(100, Math.max(0, Math.round(progress)))
}

function createTaskExportRows(tasks, pcs = initialPcs) {
  return tasks.map((task, index) => ({
    order: index + 1,
    id: task.id,
    title: task.title ?? '',
    note: task.note ?? '',
    status: task.status ?? 'To-Do',
    progress: clampProgress(task.progress),
    pcId: task.pcId ?? initialPcs[0].id,
    pcName: getPcName(task.pcId, pcs),
  }))
}

function createTaskExportText(tasks, pcs = initialPcs) {
  const rows = createTaskExportRows(tasks, pcs)

  return rows
    .map(
      (row) =>
        [
          `[${row.order}] ${row.title || '(제목 없음)'}`,
          `- 메모: ${row.note || '-'}`,
          `- 상태/진행도: ${statusLabels[row.status] ?? row.status} / ${row.progress}%`,
          `- 위치: ${row.pcName} (${row.pcId})`,
        ].join('\n'),
    )
    .join('\n\n')
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function normalizeUrl(value = '') {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z]+:\/\//i.test(trimmed)) return ''

  return `https://${trimmed}`
}

function createInternetShortcutContent(url) {
  return `[InternetShortcut]\nURL=${url}\n`
}

function createTitleAndUrlText(title = '', url = '') {
  return `${title || '(제목 없음)'}\n${url}`
}

function createShortcutFilename(title = 'shortcut') {
  const sanitized = title
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return sanitized || 'shortcut'
}

function createPcId(existingPcs) {
  let nextId = `pc-${Date.now()}`
  while (existingPcs.some((pc) => pc.id === nextId)) {
    nextId = `pc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  return nextId
}

async function copyTextWithFallback(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return 'clipboard-api'
    }
  } catch {
    // ignore and fallback
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-1000px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const copied = document.execCommand('copy')
    textarea.remove()

    if (copied) return 'exec-command'
  } catch {
    // ignore
  }

  return 'failed'
}

export default App
