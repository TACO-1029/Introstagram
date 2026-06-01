# Introstagram

> Instagram UI를 모티브로 만든 팀/개인 소개용 정적 웹 프로젝트입니다.  
> 별도의 빌드 도구 없이 HTML, CSS, JavaScript만으로 피드, 스토리, 릴스, DM, 지도, 프로필 화면을 구현했습니다.
>
> ### [🔗 Introstagram 링크](https://taco-1029.github.io/Introstagram/)

## 주요 기능

- 메인 피드에서 팀원 게시글 랜덤 렌더링
- 팀원별 프로필 페이지와 게시글 상세 페이지
- 게시글 이미지 슬라이드, 좋아요, 댓글 bottom sheet
- 댓글 작성, 댓글 좋아요, localStorage 기반 상태 저장
- 스토리 뷰어, 스토리 카메라/캔버스 편집
- 릴스 영상 재생, 스와이프 전환, 음소거 토글
- Direct Message 화면과 대화 상세 화면
- 현대 계열사 위치 지도와 핀 포인트 이동
- 프로필 팔로워/팔로우 모달
- 메인 팀원 목록 드래그 앤 드롭 순서 변경
- GitHub Actions 기반 GitHub Pages 배포 설정

## 디렉토리 구조

```text
Introstagram/
├─ index.html
├─ README.md
├─ .github/
│  └─ workflows/
│     └─ pages.yml
├─ pages/
│  ├─ directmessage/
│  │  └─ index.html
│  ├─ location/
│  │  └─ index.html
│  ├─ member/
│  │  ├─ 1/
│  │  │  ├─ index.html
│  │  │  └─ posts/
│  │  ├─ 2/
│  │  ├─ 3/
│  │  └─ 4/
│  ├─ profile/
│  │  ├─ index.html
│  │  └─ posts/
│  ├─ reels/
│  │  └─ index.html
│  └─ story/
│     └─ index.html
├─ static/
│  ├─ css/
│  │  ├─ style.css
│  │  ├─ layout.css
│  │  ├─ comments.css
│  │  ├─ direct.css
│  │  ├─ location.css
│  │  ├─ reels.css
│  │  └─ story.css
│  ├─ js/
│  ├─ icons/
│  ├─ img/
│  ├─ story-filter/
│  ├─ video/
│  └─ music/
└─ legacy/
   └─ pages/
```

## 페이지 구성

- `index.html`: 메인 피드, 스토리, 팀원 목록
- `pages/member/{1~4}/index.html`: 팀원별 프로필
- `pages/member/{1~4}/posts/post-n.html`: 팀원별 게시글 상세
- `pages/profile/index.html`: 팀 계정 프로필
- `pages/profile/posts/post-n.html`: 팀 계정 게시글 상세
- `pages/reels/index.html`: 릴스
- `pages/directmessage/index.html`: DM
- `pages/location/index.html`: 위치 지도
- `pages/story/index.html`: 스토리 편집 화면

## 데이터 저장

브라우저 저장소를 사용해 일부 상태를 유지합니다.

- `localStorage`
  - 댓글 데이터
  - 게시글 좋아요 상태
  - 댓글 좋아요 상태
  - 릴스 좋아요 상태
  - 팀원 목록 드래그 정렬 순서
- `sessionStorage`
  - 스토리 이미지 편집 흐름 일부

## 기술 스택

- HTML
- CSS
- Vanilla JavaScript
- Canvas API
- Kakao Maps API
- GitHub Actions
- GitHub Pages
