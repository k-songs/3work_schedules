import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const LOCAL_STORAGE_KEY = 'project-master-local-resources'
const ACCOUNT_STORAGE_KEY = 'project-master-account-records'
const TASK_STORAGE_KEY = 'project-master-tasks'
const LEGACY_STORAGE_KEY = 'project-master-resources'

const PCs = [
  { id: 'pc-1', name: 'PC 1', label: '자료 위치', summary: 'PC 1에 있는 작업과 자료를 확인' },
  { id: 'pc-2', name: 'PC 2', label: '자료 위치', summary: 'PC 2에 있는 작업과 자료를 확인' },
  { id: 'pc-3', name: 'PC 3', label: '자료 위치', summary: 'PC 3에 있는 작업과 자료를 확인' },
  { id: 'pc-4', name: 'PC 4', label: '자료 위치', summary: 'PC 4에 있는 작업과 자료를 확인' },
]

const googleAccounts = [
  { id: 'google-1', name: 'ad12' },
  { id: 'google-2', name: 'kss' },
  { id: 'google-3', name: 'gim' },
  { id: 'google-4', name: 'jo' },
  { id: 'google-5', name: 'fat' },
]

const tools = ['Gemini', 'ChatGPT', 'Claude', 'Notion']
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
    memo: 'PC 위치와 무관한 계정 기반 기록',
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

const emptyLocalForm = {
  name: '',
  pcId: PCs[0].id,
  savedAt: '',
  description: '',
  memo: '',
  pathMemo: '',
  status: 'To-Do',
  tagsText: '',
}

const emptyTaskForm = {
  title: '',
  pcId: PCs[0].id,
  status: 'To-Do',
  progress: '0',
  note: '',
}

const emptyAccountForm = {
  title: '',
  accountId: googleAccounts[0].id,
  tool: tools[0],
  savedAt: '',
  description: '',
  memo: '',
  link: toolHomeLinks[tools[0]],
  status: 'To-Do',
  tagsText: '',
}

const statusLabels = {
  Done: '했던 거',
  'To-Do': '할 거',
  Doing: '도중',
  Review: '확인할 거',
}

function App() {
  const [localResources, setLocalResources] = useState(() => loadLocalResources())
  const [accountRecords, setAccountRecords] = useState(() => loadAccountRecords())
  const [taskItems, setTaskItems] = useState(() => loadTasks())
  const importInputRef = useRef(null)
  const [selectedPcId, setSelectedPcId] = useState(PCs[0].id)
  const [selectedAccountId, setSelectedAccountId] = useState(googleAccounts[0].id)
  const [selectedTool, setSelectedTool] = useState('All')
  const [view, setView] = useState('pc')
  const [query, setQuery] = useState('')
  const [editingLocalResource, setEditingLocalResource] = useState(null)
  const [editingAccountRecord, setEditingAccountRecord] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [localForm, setLocalForm] = useState(emptyLocalForm)
  const [accountForm, setAccountForm] = useState(emptyAccountForm)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localResources))
  }, [localResources])

  useEffect(() => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountRecords))
  }, [accountRecords])

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskItems))
  }, [taskItems])

  const selectedPc = PCs.find((pc) => pc.id === selectedPcId)
  const pcTasks = taskItems.filter((task) => task.pcId === selectedPcId)
  const pcResources = localResources.filter((resource) => resource.pcId === selectedPcId)
  const selectedAccount = googleAccounts.find((account) => account.id === selectedAccountId)
  const accountScopedRecords = accountRecords.filter((record) => {
    const accountMatches = record.accountId === selectedAccountId
    const toolMatches = selectedTool === 'All' || record.tool === selectedTool

    return accountMatches && toolMatches
  })

  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return {
        local: localResources,
        accounts: accountRecords,
      }
    }

    return {
      local: localResources.filter((resource) => localResourceMatches(resource, keyword)),
      accounts: accountRecords.filter((record) => accountRecordMatches(record, keyword)),
    }
  }, [accountRecords, localResources, query])

  const openCreateLocalForm = (pcId = selectedPcId) => {
    setEditingLocalResource(null)
    setLocalForm({ ...emptyLocalForm, pcId, savedAt: getCurrentDateTime() })
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
    const nextTool = tool === 'All' ? tools[0] : tool
    setEditingAccountRecord(null)
    setAccountForm({
      ...emptyAccountForm,
      accountId,
      tool: nextTool,
      link: toolHomeLinks[nextTool],
      savedAt: getCurrentDateTime(),
    })
    setActiveModal('account')
  }

  const openEditAccountForm = (record) => {
    setEditingAccountRecord(record)
    setAccountForm({
      title: record.title,
      accountId: record.accountId,
      tool: record.tool,
      savedAt: record.savedAt,
      description: record.description,
      memo: record.memo ?? '',
      link: record.link ?? toolHomeLinks[record.tool],
      status: record.status ?? 'To-Do',
      tagsText: record.tags.join(', '),
    })
    setActiveModal('account')
  }

  const openCreateTaskForm = (status = 'To-Do', pcId = selectedPcId) => {
    setEditingTask(null)
    setTaskForm({ ...emptyTaskForm, pcId, status })
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
    setLocalForm(emptyLocalForm)
    setAccountForm(emptyAccountForm)
    setTaskForm(emptyTaskForm)
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
    setSelectedPcId(nextResourceData.pcId)
    closeModal()
  }

  const handleAccountSubmit = (event) => {
    event.preventDefault()

    const nextRecordData = {
      title: accountForm.title.trim(),
      accountId: accountForm.accountId,
      tool: accountForm.tool,
      savedAt: accountForm.savedAt,
      description: accountForm.description.trim(),
      memo: accountForm.memo.trim(),
      link: accountForm.link.trim(),
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
    setSelectedTool(nextRecordData.tool)
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
    setSelectedPcId(nextTaskData.pcId)
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
      `"${target?.title ?? '계정 기록'}" 기록을 삭제할까요?\n구글 계정의 실제 기록은 삭제되지 않습니다.`,
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

  const handleExportData = () => {
    const payload = {
      version: 1,
      exportedAt: getCurrentDateTime(),
      localResources,
      accountRecords,
      tasks: taskItems,
    }
    const fileContent = JSON.stringify(payload, null, 2)
    const blob = new Blob([fileContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileDate = getCurrentDateTime().replaceAll(':', '-').replace(' ', '_')

    link.href = url
    link.download = `project-master-backup-${fileDate}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportData = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    try {
      const fileContent = await selectedFile.text()
      const parsedData = JSON.parse(fileContent)
      const nextLocalResources = Array.isArray(parsedData.localResources)
        ? parsedData.localResources.map(normalizeLocalResource)
        : []
      const nextAccountRecords = Array.isArray(parsedData.accountRecords)
        ? parsedData.accountRecords.map(normalizeAccountRecord)
        : []
      const nextTasks = Array.isArray(parsedData.tasks)
        ? parsedData.tasks.map(normalizeTask)
        : taskItems

      if (!Array.isArray(parsedData.localResources) || !Array.isArray(parsedData.accountRecords)) {
        alert('가져올 수 없는 JSON 형식입니다.')
        return
      }

      const confirmed = confirm(
        `JSON 백업을 가져올까요?\n현재 로컬 자료 ${localResources.length}개와 계정 기록 ${accountRecords.length}개가 백업 내용으로 교체됩니다.`,
      )

      if (!confirmed) return

      setLocalResources(nextLocalResources)
      setAccountRecords(nextAccountRecords)
      setTaskItems(nextTasks)
      setSelectedPcId(nextLocalResources[0]?.pcId ?? PCs[0].id)
      setSelectedAccountId(nextAccountRecords[0]?.accountId ?? googleAccounts[0].id)
      setSelectedTool('All')
    } catch {
      alert('JSON 파일을 읽는 중 문제가 생겼습니다.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Project Master</p>
          <h1>기록관리</h1>
       
        </div>
        <div className="hero-card">
          <span>총 건수</span>
          <strong>{taskItems.length + accountRecords.length}</strong>
          <small>작업 {taskItems.length}개 / 계정 기록 {accountRecords.length}개</small>
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
          계정/툴 기록
        </button>
        <button className={view === 'search' ? 'active' : ''} onClick={() => setView('search')}>
          통합 검색
        </button>
      </nav>

      <section className="backup-actions" aria-label="자료 백업 관리">
        <div>
          <strong>JSON 백업</strong>
          <span>다른 PC로 옮길 때 내보내기 후 가져오기를 사용하세요.</span>
        </div>
        <div className="backup-buttons">
          <button className="ghost-button secondary" onClick={handleExportData}>
            JSON 내보내기
          </button>
          <button className="ghost-button" onClick={handleImportClick}>
            JSON 가져오기
          </button>
        </div>
        <input
          ref={importInputRef}
          className="hidden-file-input"
          type="file"
          accept="application/json,.json"
          onChange={handleImportData}
        />
      </section>

      {view === 'pc' && (
        <section className="workspace-grid">
          <aside className="pc-list" aria-label="컴퓨터 선택">
            {PCs.map((pc) => (
              <button
                key={pc.id}
                className={selectedPcId === pc.id ? 'pc-button active' : 'pc-button'}
                onClick={() => setSelectedPcId(pc.id)}
              >
                <strong>{pc.name}</strong>
                <span>{pc.label}</span>
              </button>
            ))}
          </aside>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">{selectedPc.label}</p>
                <h2>{selectedPc.name} 로컬 자료</h2>
                <p>{selectedPc.summary}</p>
              </div>
              <button className="ghost-button" onClick={() => openCreateLocalForm(selectedPcId)}>
                + 로컬 자료 추가
              </button>
            </div>

            <div className="summary-grid">
              {renderSummaryCard('작업', pcTasks.length)}
              {renderSummaryCard('로컬 자료', pcResources.length)}
            </div>

            <div className="section-block">
              <h3>작업 상태</h3>
              <div className="kanban">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <div key={status} className="kanban-column">
                    <div className="column-title">
                      <span>{label}</span>
                      <small>{pcTasks.filter((task) => task.status === status).length}</small>
                    </div>
                    <button
                      className="add-task-button"
                      onClick={() => openCreateTaskForm(status, selectedPcId)}
                    >
                      + 작업 추가
                    </button>
                    {pcTasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <button
                          key={task.id}
                          className="task-card"
                          onClick={() => openEditTaskForm(task)}
                        >
                          <strong>{task.title}</strong>
                          <p>{task.note}</p>
                          <div className="progress">
                            <span style={{ width: `${task.progress}%` }} />
                          </div>
                          <small>{task.progress}%</small>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {renderLocalTable(pcResources, {
              onEdit: openEditLocalForm,
              onDelete: handleLocalDelete,
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
                <span>계정 기반 기록</span>
              </button>
            ))}
          </aside>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Account Records</p>
                <h2>{selectedAccount.name} 툴 기록</h2>
                <p>PC 위치와 무관하게 이 계정에 남아 있는 툴별 기록을 확인합니다.</p>
              </div>
              <button className="ghost-button" onClick={() => openCreateAccountForm()}>
                + 계정 기록 추가
              </button>
            </div>

            <nav className="view-tabs" aria-label="툴 필터 선택">
              <button
                className={selectedTool === 'All' ? 'active' : ''}
                onClick={() => setSelectedTool('All')}
              >
                전체
              </button>
              {tools.map((tool) => (
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
              {renderSummaryCard('계정 기록', accountScopedRecords.length)}
              {renderSummaryCard(
                '전체 계정 기록',
                accountRecords.filter((record) => record.accountId === selectedAccountId).length,
              )}
              {renderSummaryCard('관리 툴', tools.length)}
            </div>

            {renderAccountTable(accountScopedRecords, {
              onEdit: openEditAccountForm,
              onDelete: handleAccountDelete,
            })}
          </section>
        </section>
      )}

      {view === 'search' && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Global Search</p>
              <h2>통합 검색 / 필터링</h2>
              <p>PC별 로컬 자료와 계정/툴 기록을 함께 검색하되 결과는 구분해서 보여줍니다.</p>
            </div>
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="파일명, 계정, 툴, 설명, 태그 검색"
            />
          </div>

          {renderLocalTable(searchResults.local, {
            title: '로컬 자료 검색 결과',
            showPc: true,
            onEdit: openEditLocalForm,
            onDelete: handleLocalDelete,
          })}

          {renderAccountTable(searchResults.accounts, {
            title: '계정/툴 기록 검색 결과',
            showAccount: true,
            onEdit: openEditAccountForm,
            onDelete: handleAccountDelete,
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
        )}
    </main>
  )
}

function renderLocalResourceModal(form, isEditing, onChange, onClose, onSubmit) {
  return (
    <div className="modal-backdrop">
      <dialog className="resource-modal" aria-labelledby="local-form-title" open>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Local Resource</p>
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
              {PCs.map((pc) => (
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
            <p className="eyebrow">Account Record</p>
            <h2 id="account-form-title">{isEditing ? '계정 기록 수정' : '새 계정 기록 추가'}</h2>
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
            <span>툴</span>
            <select name="tool" value={form.tool} onChange={onChange}>
              {tools.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
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
              placeholder="이 계정/툴 기록이 무엇인지 짧게 입력"
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

function renderTaskModal(form, isEditing, onChange, onClose, onSubmit, onDelete) {
  return (
    <div className="modal-backdrop">
      <dialog className="resource-modal" aria-labelledby="task-form-title" open>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task Tracker</p>
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
              {PCs.map((pc) => (
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

function renderLocalTable(rows, options = {}) {
  const { title = '로컬 자료 인덱스', showPc = false, onEdit, onDelete } = options

  return (
    <div className="section-block">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table>
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
                  등록된 로컬 자료가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    {row.pathMemo && <small>{row.pathMemo}</small>}
                  </td>
                  {showPc && <td>{getPcName(row.pcId)}</td>}
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
  const { title = '계정/툴 기록 인덱스', showAccount = false, onEdit, onDelete } = options

  return (
    <div className="section-block">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>기록 제목</th>
              {showAccount && <th>계정</th>}
              <th>툴</th>
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
                  등록된 계정/툴 기록이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                  </td>
                  {showAccount && <td>{getAccountName(row.accountId)}</td>}
                  <td>{row.tool}</td>
                  <td>{row.description}</td>
                  <td>{row.memo}</td>
                  <td>
                    {row.link ? (
                      <a href={row.link} target="_blank" rel="noreferrer">
                        열기
                      </a>
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
      <button onClick={onEdit}>수정</button>
      <button className="danger" onClick={onDelete}>
        삭제
      </button>
    </div>
  )
}

function localResourceMatches(resource, keyword) {
  const searchable = [
    resource.name,
    resource.description,
    resource.memo,
    resource.pathMemo,
    resource.status,
    getPcName(resource.pcId),
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
        tool: tools.includes(resource.tool) ? resource.tool : 'ChatGPT',
        savedAt: resource.savedAt ?? '',
        description: resource.description ?? '',
        memo: resource.memo ?? '',
        link: resource.link ?? toolHomeLinks.ChatGPT,
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
    pcId: resource.pcId ?? PCs[0].id,
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
    pcId: PCs.some((pc) => pc.id === task.pcId) ? task.pcId : PCs[0].id,
    note: task.note ?? '',
  }
}

function normalizeAccountRecord(record) {
  const tool = tools.includes(record.tool) ? record.tool : tools[0]

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
    link: record.link ?? toolHomeLinks[tool],
    status: record.status ?? 'To-Do',
    tags: Array.isArray(record.tags) ? record.tags : [],
  }
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

function getPcName(pcId) {
  return PCs.find((pc) => pc.id === pcId)?.name ?? 'PC 미지정'
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

export default App
