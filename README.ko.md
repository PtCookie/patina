<p align="center">
  <img src="docs/header.svg" alt="Patina: mist neutrals, one emerald." width="960">
</p>

# Patina

[English](README.md) · **한국어**

차분한 청회색(Mist) 뉴트럴 위에 에메랄드 포인트 하나를 얹은 디자인 시스템입니다. 하나의 디자인 토큰 세트로 세 플랫폼을 지원합니다.

- **웹**: **Luma** 계열의 [shadcn](https://ui.shadcn.com) 레지스트리. Base UI, Tailwind 4, 더 촘촘한 radius 스케일을 씁니다.
- **데스크톱**: [Slint](https://slint.dev) 토큰 파일. `compact-*` 밀도 토큰을 포함합니다.
- **Android**: Jetpack Compose용 정적 Material 3 테마 파일(동적 색은 쓰지 않습니다).

> **상태: 초안.** 디자인과 토큰은 끝났고, `pnpm build`는 토큰을 검증한 뒤 레지스트리(base 아이템과 컴포넌트 25개), Slint 라이브러리, Android 라이브러리를 생성합니다. 레지스트리 컴포넌트는 자동 설치 테스트로, Android 라이브러리는 ktlint와 detekt로 검증합니다. 모두 `https://patina.ptcookie.net`에 배포되어 있고, 같은 주소에서 모든 컴포넌트의 미리보기가 있는 문서 사이트를 볼 수 있습니다.

## 저장소 구성

| 경로 | 내용 |
|---|---|
| `design-system/tokens.json` | 단일 기준 문서: 색(light·dark), 서체, 간격, radius, 크기, 그림자 토큰 |
| `design-system/README.md` | 시각 언어: 색, 서체, 밀도, radius, 상태, 모션, 아이콘, 접근성, UI 문구 규칙 |
| `design-system/Android.md` | 토큰을 Material 3 역할·서체·모양으로 옮기는 방법 |
| `design-system/components/` | 모든 컴포넌트의 시각 미리보기(`preview.html`)와 공용 `bundle.css` / `bundle.js` |
| `design-system/assets/Licenses/` | 서체와 아이콘의 라이선스 전문 |
| `fonts/` | `/fonts/*`로 서비스하는 공식 D2Coding·마루부리 파일과 `SHA256SUMS` |
| `design-system/VERSION` | 커밋된 토큰 스냅샷의 식별자 |
| `registry/ui/` | shadcn 컴포넌트(Base UI + Tailwind 4): Button, Badge, Input, Card, Label, Separator, Skeleton, Table, Checkbox, Toggle, ToggleGroup, Collapsible, Pagination, Popover, DropdownMenu, Sheet, NavigationMenu, Chart, Kbd, Switch, Alert, Tooltip, Tabs, Select, Article. 각각 레지스트리 아이템이 됩니다 |
| `slint/` | Slint 라이브러리: `patina.slint`(진입 파일)와 `components/`(Button, Input, Badge, Kbd, Tooltip, Separator, TreeRow, ListRow, PaneHeader, Checkbox, Switch, Tabs, Select, Menu, Table, Alert, Card, Collapsible, Toggle). 빌드가 `tokens.slint`와 아카이브를 덧붙입니다 |
| `android/` | Android 라이브러리: `patina/theme/`(`PatinaTheme.kt`)와 `patina/ui/`(PatinaButton, PatinaCard, PatinaTextField, PatinaSwitch, PatinaRadioButton, PatinaFilterChip, PatinaAlertDialog, PatinaTopAppBar, PatinaListItem, PatinaBadge, PatinaCheckbox, PatinaTabs, PatinaSelect, PatinaDropdownMenu, PatinaAlert, PatinaBottomSheet, PatinaTooltip, PatinaDivider, PatinaSkeleton). 빌드가 생성한 테마 파일과 아카이브를 덧붙입니다 |
| `site/` | 문서 사이트(Astro, Starlight): README, 가이드, 모든 컴포넌트의 미리보기. `pnpm build`가 `public/`에 빌드하고 `pnpm site:dev`로 로컬에서 띄웁니다 |
| `docs/` | 에이전트용 문서의 원본(`agent-guide.md`, `agents-snippet.md`), README 헤더 이미지 `header.svg`, GitHub 소셜 프리뷰 `social-preview.png` |
| `tools/` | 참고용 스크립트: oklch → sRGB 변환과 WCAG 대비(`cc.py`), Android 역할 매핑(`m3.py`), 토큰 → CSS(`tokens_css.py`) |

## 원칙

- **시맨틱 색 이름만 씁니다.** 컴포넌트는 색 리터럴을 쓰지 않고 상태 색을 직접 계산하지도 않습니다. hover, 틴트, 링은 모두 이름 있는 토큰이라서 웹·Slint·Android가 같은 값을 그립니다.
- **한 화면에 주 액션은 하나.** 에메랄드는 주 액션과 활성 상태에만 쓰고 장식에는 쓰지 않습니다. 위험 액션은 솔리드가 아니라 틴트입니다.
- **접근성을 구조로 보장합니다.** 모든 텍스트 색은 의도된 배경 위에서 두 테마 모두 4.5:1 이상이고, 포커스 링은 3:1 이상입니다. 토큰이 이 수치를 깨면 빌드가 실패하도록 되어 있습니다.
- **밀도는 둘, 섞지 않습니다.** 웹은 comfortable, 정보 밀도가 높은 데스크톱 도구는 compact.
- **서체:** 본문은 Inter, 헤딩과 코드는 JetBrains Mono, 한글은 Pretendard, 긴 글은 Newsreader와 마루부리, 열 정렬이 필요한 한글 코드는 D2Coding. 아이콘은 [Phosphor](https://phosphoricons.com)입니다.

전체 가이드는 [`design-system/README.md`](design-system/README.md)(영어)를 보세요.

## 사용법

모든 파일은 `https://patina.ptcookie.net`에서 정적 파일로 제공됩니다.

**웹(shadcn).** Astro(또는 React 환경), Tailwind 4, `@/*` alias가 이미 있는 프로젝트에서 base 아이템으로 초기화합니다. 토큰을 설정하고, 서체 패키지를 설치하고, 아이콘 라이브러리를 Phosphor로 바꿉니다.

```bash
npx shadcn@latest init https://patina.ptcookie.net/r/base.json
```

그다음 `components.json`에 네임스페이스를 등록하고 이름으로 컴포넌트를 추가합니다.

```json
{
  "registries": {
    "@patina": "https://patina.ptcookie.net/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @patina/button @patina/badge @patina/input @patina/card @patina/table @patina/chart
```

Patina 컴포넌트를 스톡 컴포넌트보다 먼저 설치하세요. Patina 아이템은 대체하는 shadcn 컴포넌트와 같은 이름이고 같은 파일에 씁니다. 그 컴포넌트에 의존하는 스톡 컴포넌트(`alert-dialog`는 `button`이 필요합니다)를 나중에 추가하면 파일을 덮어쓸지 묻는데, 답은 "아니오"입니다. Patina가 대체하지 않는 컴포넌트는 스톡 shadcn 레지스트리에서 가져옵니다.

**Slint와 Android.** 생성된 파일을 한 번 내려받아 프로젝트에 커밋하세요. 빌드 시점에 가져오지 않습니다.

| 플랫폼 | 파일 |
|---|---|
| Slint | `/slint/patina-slint.tar.gz` (토큰과 compact 컴포넌트. 풀어서 `patina.slint`를 라이브러리 `patina`로 등록하고 `@patina`에서 import) |
| Android | `/android/patina-android.tar.gz` (Compose 테마, 토큰, 아이콘, 컴포넌트. 소스 폴더에 풀어서 사용) |

Android 파일은 패키지 `patina.theme`과 `patina.ui`를 선언하고, `patina/theme/`와 `patina/ui/`로 풀립니다.

```bash
mkdir -p app/src/main/kotlin && curl -L https://patina.ptcookie.net/android/patina-android.tar.gz | tar xz -C app/src/main/kotlin
```

기본 `ktlint_official` 스타일의 ktlint와 기본 규칙의 detekt를 통과합니다. 단 composable 이름은 PascalCase를 허용해야 합니다(detekt의 `FunctionNaming`이 `@Composable`을 무시하게 하고, `.editorconfig`에 `ktlint_function_naming_ignore_when_annotated_with = Composable`을 둡니다). 그래서 가져온 파일을 lint하는 앱도 제외 설정이 필요 없습니다.

생성된 모든 파일의 머리말에는 출처가 된 토큰 스냅샷이 적혀 있습니다.

## AI 에이전트용

Patina로 UI를 만드는 에이전트는 `https://patina.ptcookie.net/llms.txt`([llms.txt](https://llmstxt.org) 형식의 색인) 또는 `https://patina.ptcookie.net/llms-full.txt`(문서 전체를 한 파일로)를 읽으면 됩니다. 프로젝트가 Patina를 쓰게 하려면 `https://patina.ptcookie.net/agents-snippet.md`를 그 프로젝트의 `AGENTS.md`나 `CLAUDE.md`에 붙여 넣으세요. 가이드에는 규칙(색은 토큰 이름으로만, 한 화면에 주 액션 하나), 웹·Slint·Android 설정, 모든 컴포넌트와 토큰이 들어 있습니다. 원문은 `docs/agent-guide.md`이고, 컴포넌트·토큰 표는 빌드가 덧붙이므로 코드와 어긋나지 않습니다.

## 서체

| 서체 | 구하는 방법 |
|---|---|
| Inter, JetBrains Mono, Newsreader | Fontsource 가변 패키지(`@fontsource-variable/*`), 빌드가 self-host |
| Pretendard | 공식 [`pretendard`](https://www.npmjs.com/package/pretendard) npm 패키지(웹은 dynamic subset). Slint와 Android는 공식 파일 |
| D2Coding, 마루부리 | 공식 파일을 `/fonts/*`로 제공: 그 폴더를 프로젝트의 `public/fonts`로 내려받으세요 |

D2Coding과 마루부리는 `D2Coding-*.ttf`, `MaruBuri-*.otf`, 각 `*-OFL.txt` 라이선스 전문, `patina-fonts.css`를 `public/fonts`에 복사한 뒤 스타일시트를 파일 옆에서 불러옵니다.

```html
<link rel="stylesheet" href="/fonts/patina-fonts.css" />
```

Pretendard, D2Coding, 마루부리는 SIL OFL의 Reserved Font Name이 있습니다. 공식 파일을 수정 없이 쓰고, 서브셋이나 포맷 변환을 하지 마세요. 저장소는 `fonts/SHA256SUMS`로 복사본을 고정하고, 파일이 다르면 빌드가 실패합니다. 서체나 아이콘을 배포할 때는 `design-system/assets/Licenses/`의 해당 라이선스 전문을 함께 넣으세요.

## 개발

`pnpm build`는 토큰(파생 색, 대비, Material 3 쌍)을 검증하고, 하나라도 맞지 않으면 실패한 뒤 생성 파일을 `public/`에 씁니다. Node 24 또는 22.12 이상과 pnpm 11을 사용하세요.

```bash
pnpm build   # 토큰 검증 후 레지스트리, tokens.slint, Android 파일을 public/에 생성
pnpm check   # 타입 검사, lint, 포맷 검사, 테스트(대비, 파생 토큰, 생성 파일)
pnpm smoke   # 생성한 레지스트리 아이템을 실제 shadcn CLI로 임시 Astro 프로젝트에 설치(네트워크 필요)
pnpm android:lint  # 파일을 빌드한 뒤 Android 라이브러리에 ktlint와 detekt 실행(JDK 필요)
pnpm slint:shot    # Slint 갤러리를 라이트·다크로 렌더링(slint-viewer 필요)
pnpm deploy  # 빌드 후 Cloudflare Workers에 배포
```

참고용 스크립트는 지금도 Python 3만 있으면 돌아갑니다.

```bash
python3 tools/cc.py "oklch(0.5 0.1 160)" "oklch(1 0 0)"   # 두 색의 대비
```

## 라이선스

Patina의 코드와 문서는 [MIT 라이선스](LICENSE)로 공개합니다. 서체는 해당되지 않습니다. 서체는 각자의 SIL Open Font License 1.1을 따르고, 이 저장소의 일부가 가져오거나 파생한 Phosphor Icons와 shadcn/ui는 각 저작자의 MIT 라이선스입니다. 고지와 전문은 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)와 [`design-system/assets/Licenses/`](design-system/assets/Licenses/)에 있습니다. 파일을 프로젝트에 복사할 때 함께 가져가세요.
