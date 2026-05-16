# 로컬 앱 백업/불러오기와 콘솔 복구 원리

## 1. 앱 안의 백업/불러오기 기능이 하는 일

`PC 추가 · 이름 · 삭제` 버튼을 누르면 열리는 패널 안에 `JSON 백업`, `JSON 불러오기` 기능이 있다.

이 기능은 브라우저 `localStorage`에 저장되는 앱 데이터를 사람이 다루기 쉬운 **JSON 파일**로 내보내고, 나중에 그 파일을 다시 읽어서 앱 상태로 복원하는 방식이다.

앱이 백업하는 주요 데이터는 다음과 같다.

- PC 목록
- 로컬 자료 목록
- AI/계정 기록 목록
- 작업 목록

즉, 현재 앱 상태를 하나의 JSON 객체로 묶어서 파일로 저장한다.

---

## 2. 백업 기능의 동작 원리

백업 버튼을 누르면 앱은 현재 React state에 있는 데이터를 모은다.

예시 구조:

```js
{
  version: 2,
  exportedAt: "2026-05-17 02:00",
  pcs: [...],
  localResources: [...],
  accountRecords: [...],
  tasks: [...]
}


아래 내용을 그대로 `.md` 문서로 쓰면 됩니다.

```md
# 로컬 앱 백업/불러오기와 콘솔 복구 원리

## 1. 앱 안의 백업/불러오기 기능이 하는 일

`PC 추가 · 이름 · 삭제` 버튼을 누르면 열리는 패널 안에 `JSON 백업`, `JSON 불러오기` 기능이 있다.

이 기능은 브라우저 `localStorage`에 저장되는 앱 데이터를 사람이 다루기 쉬운 **JSON 파일**로 내보내고, 나중에 그 파일을 다시 읽어서 앱 상태로 복원하는 방식이다.

앱이 백업하는 주요 데이터는 다음과 같다.

- PC 목록
- 로컬 자료 목록
- AI/계정 기록 목록
- 작업 목록

즉, 현재 앱 상태를 하나의 JSON 객체로 묶어서 파일로 저장한다.

---

## 2. 백업 기능의 동작 원리

백업 버튼을 누르면 앱은 현재 React state에 있는 데이터를 모은다.

예시 구조:

```js
{
  version: 2,
  exportedAt: "2026-05-17 02:00",
  pcs: [...],
  localResources: [...],
  accountRecords: [...],
  tasks: [...]
}
```

그다음 이 객체를 `JSON.stringify(payload, null, 2)`로 문자열화한다.

여기서 중요한 개념은 **직렬화(serialization)** 이다.

직렬화란 JavaScript 객체/배열 같은 메모리 데이터를 파일로 저장 가능한 문자열 형태로 바꾸는 것이다.

```js
JSON.stringify(data)
```

이렇게 만들어진 문자열은 `.json` 파일로 다운로드된다.

브라우저에서는 보통 `Blob`과 임시 URL을 이용해 파일 다운로드를 만든다.

흐름은 다음과 같다.

1. 현재 앱 데이터를 객체로 묶음
2. `JSON.stringify`로 JSON 문자열 생성
3. `Blob`으로 파일 데이터 생성
4. 임시 다운로드 링크 생성
5. 사용자의 다운로드 폴더에 `.json` 파일 저장

---

## 3. 불러오기 기능의 동작 원리

불러오기 버튼을 누르면 숨겨진 파일 선택창이 열린다.

사용자가 백업 JSON 파일을 선택하면 앱은 다음 순서로 처리한다.

1. 선택한 파일을 읽음
2. 파일 내용을 문자열로 가져옴
3. `JSON.parse`로 문자열을 다시 객체로 변환
4. 데이터 형식이 맞는지 확인
5. PC, 작업, 로컬 자료, AI 기록을 정규화
6. 현재 앱 state를 백업 데이터로 교체
7. React `useEffect`가 바뀐 state를 다시 `localStorage`에 저장

여기서 중요한 개념은 **역직렬화(deserialization)** 이다.

역직렬화란 JSON 문자열을 다시 JavaScript 객체/배열로 바꾸는 것이다.

```js
const parsedData = JSON.parse(fileContent)
```

백업 파일을 불러오면 현재 데이터는 백업 파일 내용으로 교체된다.

즉, “추가”가 아니라 **복원/덮어쓰기**에 가깝다.

---

## 4. 왜 새로고침하면 복원 데이터가 유지되나?

앱은 React state만 쓰는 것이 아니라 `localStorage`도 함께 사용한다.

흐름은 다음과 같다.

1. 앱 시작 시 `localStorage`에서 데이터를 읽음
2. 읽은 데이터를 React state에 넣음
3. 사용자가 데이터를 추가/수정/삭제하면 state가 바뀜
4. state가 바뀌면 `useEffect`가 `localStorage`에 다시 저장함

그래서 불러오기 후 state가 교체되면, 그 데이터가 다시 `localStorage`에 저장된다.

이후 새로고침하면 앱이 다시 `localStorage`에서 데이터를 읽기 때문에 복원된 내용이 유지된다.

---

## 5. `localStorage`의 중요한 특징

`localStorage`는 브라우저 안에 저장되는 key-value 저장소다.

값은 전부 문자열로 저장된다.

예를 들어 앱 내부 데이터가 배열이어도 실제 저장 시에는 문자열이다.

```js
localStorage.setItem('project-master-tasks', JSON.stringify(tasks))
```

읽을 때는 다시 파싱한다.

```js
const tasks = JSON.parse(localStorage.getItem('project-master-tasks'))
```

즉, `localStorage`는 객체를 직접 저장하는 것이 아니라 **문자열만 저장**한다.

---

## 6. 같은 주소로 열어야 하는 이유

`localStorage`는 주소별로 분리된다.

브라우저는 아래 값을 기준으로 저장소를 나눈다.

- 프로토콜: `http` / `https`
- 호스트: `localhost`
- 포트: `5173`, `4173` 등

예를 들어 다음 둘은 서로 다른 저장소다.

```text
http://localhost:5173
http://localhost:4173
```

그래서 개발 서버에서 저장한 데이터가 빌드 preview 주소에서 안 보일 수 있다.

이것은 데이터가 삭제된 것이 아니라, 브라우저가 다른 저장소로 취급하기 때문이다.

---

# 콘솔로 가장 쉬운 복구하는 방법

## 1. 복구 코드

백업 문자열을 클립보드에 그대로 둔 상태에서 브라우저 콘솔에 아래 코드를 실행한다.

```js
const o = JSON.parse(prompt('백업 JSON 전체 붙여넣기 후 OK'))
Object.entries(o).forEach(([k, v]) => localStorage.setItem(k, v))
```

그다음 페이지를 새로고침하면 앱이 `localStorage`를 다시 읽어서 데이터가 복구된다.

---

## 2. 이 코드가 하는 일

첫 줄:

```js
const o = JSON.parse(prompt('백업 JSON 전체 붙여넣기 후 OK'))
```

- `prompt(...)`가 입력창을 띄운다.
- 백업 JSON 문자열을 그 창에 붙여넣는다.
- `JSON.parse(...)`가 문자열을 객체로 바꾼다.
- 결과를 `o`라는 변수에 저장한다.

두 번째 줄:

```js
Object.entries(o).forEach(([k, v]) => localStorage.setItem(k, v))
```

- `Object.entries(o)`는 객체를 `[키, 값]` 쌍 배열로 바꾼다.
- 각 키/값을 순회한다.
- `localStorage.setItem(k, v)`로 저장소에 다시 넣는다.

예를 들어 백업 데이터가 이런 형태라면:

```js
{
  "project-master-tasks": "[...]",
  "project-master-pcs": "[...]"
}
```

복구 코드는 아래와 같은 일을 반복한다.

```js
localStorage.setItem("project-master-tasks", "[...]")
localStorage.setItem("project-master-pcs", "[...]")
```

---

# 왜 `JSON.parse(\`...\`)` 방식은 깨질 수 있나?

## 1. 문자열 해석 단계가 두 번 있기 때문

문제가 되는 코드는 보통 이런 형태다.

```js
JSON.parse(`{"key":"[{\"id\":1}] "}`)
```

겉으로 보기에는 JSON처럼 보이지만 실제로는 두 단계가 있다.

1. JavaScript가 먼저 백틱 문자열을 해석한다.
2. 그 결과 문자열을 `JSON.parse`가 다시 해석한다.

이때 `\"` 같은 이스케이프 문자가 문제가 된다.

---

## 2. `\"`는 무엇인가?

JSON 안에서 `\"`는 “문자열 안에 큰따옴표를 넣기 위한 표시”다.

예:

```json
"{\"id\":1}"
```

이것은 JSON 입장에서는 문자열 값 내부에 다음 내용을 넣겠다는 뜻이다.

```json
{"id":1}
```

그런데 이걸 JavaScript 백틱 문자열 안에 직접 붙여 넣으면, JavaScript가 먼저 `\"`를 처리해버릴 수 있다.

즉, JSON.parse가 받기 전에 이미 백슬래시가 사라지면서 JSON 구조가 깨진다.

---

## 3. 왜 `prompt`는 더 안전한가?

`prompt`에 붙여넣는 값은 코드 안의 문자열 리터럴로 해석되지 않는다.

즉, 아래처럼 코드 안에 직접 JSON을 넣는 것이 아니다.

```js
JSON.parse(`여기에_긴_JSON`)
```

대신 실행 중에 사용자가 입력한 텍스트를 그대로 받는다.

```js
JSON.parse(prompt('백업 JSON 전체 붙여넣기 후 OK'))
```

그래서 백슬래시가 JavaScript 문자열 문법에 의해 먼저 소비되는 문제가 줄어든다.

---

# 관련 개념 정리

## 1. 직렬화

객체나 배열을 저장 가능한 문자열로 바꾸는 것.

```js
JSON.stringify(data)
```

## 2. 역직렬화

문자열을 다시 객체나 배열로 바꾸는 것.

```js
JSON.parse(text)
```

## 3. 이스케이프

문자열 안에서 특수문자를 안전하게 표현하는 방식.

예:

```js
\"  // 문자열 안의 큰따옴표
\\  // 문자열 안의 백슬래시
\n  // 줄바꿈
```

## 4. 템플릿 리터럴

백틱으로 감싸는 JavaScript 문자열 문법.

```js
`hello`
```

여러 줄 문자열이나 `${}` 보간에 편하지만, 긴 JSON 백업 문자열을 직접 넣기에는 이스케이프 문제가 생기기 쉽다.

## 5. `localStorage`

브라우저가 사이트별로 저장하는 문자열 기반 저장소.

```js
localStorage.setItem('key', 'value')
localStorage.getItem('key')
```

## 6. Origin

브라우저가 저장소를 나누는 기준.

```text
protocol + host + port
```

예:

```text
http://localhost:5173
```

---

# 결론

앱에 넣은 백업/불러오기 기능은 가장 안전한 방식이다.

- 사용자가 직접 콘솔에서 긴 문자열을 다루지 않아도 됨
- 백슬래시/따옴표 이스케이프 문제를 피할 수 있음
- 파일로 백업하므로 나중에 다시 찾기 쉬움
- 불러오기 시 데이터 구조를 검사하고 정규화할 수 있음

콘솔 복구 방식은 비상용으로 좋지만, 실사용에는 앱 안의 `JSON 백업 / JSON 불러오기` 기능이 더 편하고 안전하다.
```