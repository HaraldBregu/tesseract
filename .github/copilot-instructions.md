# Criterion - AI Coding Agent Instructions

## Conversation Style

**MANDATORY GREETING RULE:**

- Start EVERY message with the unicorn emoji: 🦄
- Place the emoji at the very beginning, followed by a space
- Never skip this emoji, even in short responses
- Don't substitute with other emojis

**Response Structure:**

1. Unicorn emoji + greeting/acknowledgment
2. Context or understanding of the request
3. Main response or action

## ⚠️ CRITICAL RULE - NO DOCUMENTATION FILES ⚠️

- **NEVER** create .md files, README files, changelog files, or ANY markdown documentation
- **DO NOT** create files like: CHANGES.md, SUMMARY.md, MODIFICATIONS.md, UPDATES.md, etc.
- **DO NOT** summarize changes in markdown files
- **ONLY** deliver code changes - NO documentation files unless EXPLICITLY requested
- If you need to explain changes, do it in the chat response, NOT in a file

## Project Overview

Criterion is an Electron-based desktop application for critical text edition (v1.2.9), built with React 19, TypeScript 5.8, and TipTap v2.11 editor. It features a multi-process architecture (main/preload/renderer) with sophisticated document editing, apparatus management, PDF generation, user authentication, and TEI export capabilities.

**Key Technologies:**
- **Runtime**: Electron 38, Node.js >=22
- **Frontend**: React 19, Redux Toolkit + Redux Saga, TipTap v2.11
- **UI**: shadcn/ui, Radix UI, Tailwind CSS 3.3, Lucide React
- **Forms**: React Hook Form + Zod validation
- **Build**: electron-vite 4, Vite 6
- **Testing**: Jest 30, React Testing Library

## Architecture

### Three-Process Model (Electron)

- **`src/main/`** - Main process (Node.js APIs, IPC handlers, file system, window management)
- **`src/preload/`** - Security bridge using `contextBridge` (see `src/preload/index.ts` for API surface)
- **`src/renderer/`** - React UI (functional components, hooks, no Node.js access)

**Critical**: Never expose Node.js APIs directly in preload. All main↔renderer communication uses IPC channels (`ipcMain.handle` / `ipcRenderer.invoke`).

### State Management Architecture

The app uses **dual state systems**:

1. **Redux Toolkit + Sagas** (`src/renderer/src/store/`) - Global app state
   - Root files: `store.ts`, `rootReducers.ts`, `rootSaga.ts`
   
2. **Redux Slices** (`src/renderer/src/pages/editor/store/`) - Editor-specific state
   - `editor/editor.slice.ts` - Main editor state
   - `comment/comments.slice.ts` - Comments management
   - `bookmark/bookmark.slice.ts` - Bookmarks management  
   - `pagination/pagination.slice.ts` - Pagination state

3. **React Context + useReducer** - Editor-local state (`src/renderer/src/pages/editor/provider/`)
   - Pattern: `editorContext` provides `[state, dispatch]` tuple
   - Files: `context.ts`, `state.ts`, `reducer.ts`, `actions/`
   - Used via custom hook: `const [state, dispatch] = useEditor()`
   - See `src/renderer/src/pages/editor/ELayout.tsx` for provider implementation

### Editor Architecture (TipTap v2.11)

**Primary Editor Components** (`src/renderer/src/lib/editor/`):
- `main-text-editor.tsx` - Primary document editing
- `manuscript-text-editor.tsx` - Manuscript text editing
- `apparatus-text-editor.tsx` - Critical apparatus editing
- `siglum-text-editor.tsx` - Manuscript siglum editing
- `description-text-editor.tsx` - Description editing
- `common.tsx` - Shared editor utilities
- `editor-plugins-extensions.tsx` - Plugin configuration

**Custom TipTap Extensions** (`src/renderer/src/lib/tiptap/`):
- `character-spacing-extension.ts` - Character spacing control
- `line-spacing-extension.ts` - Line spacing control
- `line-number-extension.ts` - Line numbering
- `heading-extension.ts` - Custom headings
- `indent-extension.ts` - Indentation
- `custom-subscript.ts` / `custom-superscript.ts` - Script formatting
- `extended-bullet-list.ts` / `extended-ordered-list.ts` - Enhanced lists
- `ligature-mark.ts` - Ligature support
- `section-divider.ts` - Section dividers
- `non-printable-character.ts` - Special characters

**Custom Editor Extensions** (`src/renderer/src/lib/editor/extensions/`):
- `apparatus-entry.tsx` - Apparatus entry nodes
- `apparatus-paragraph.tsx` - Apparatus paragraphs
- `bookmark-mark.ts` - Bookmark marks
- `comment-mark.tsx` - Comment marks
- `lemma.tsx` - Lemma nodes
- `siglum.tsx` - Siglum nodes
- `search.tsx` - Search highlighting
- `page-break.tsx` - Page break handling
- `reading-separator.tsx` / `reading-type.tsx` - Reading apparatus
- `text-note.tsx` - Text notes
- `toc-paragraph.tsx` - Table of contents
- `custom-text-align.tsx` - Text alignment

**Editor State**: Stored in Redux, NOT TipTap internal state. Content synced via `JSONContent` type (TipTap's JSON representation).

## Development Workflows

### Build & Run

```bash
# Development (with logs)
npm run dev

# Development with staging/production API
npm run dev:staging
npm run dev:prod

# Linux development (disables sandbox)
npm run dev-linux
npm run dev-linux:staging
npm run dev-linux:prod

# Full production build + package
npm run dist-mac          # macOS (both architectures)
npm run dist-mac:dev      # macOS dev build
npm run dist-mac:staging  # macOS staging build
npm run dist-win          # Windows x64
npm run dist-win:dev      # Windows dev build
npm run dist-win:staging  # Windows staging build
npm run dist-linux        # Linux Debian package

# macOS PKG installers
npm run dist-mac-pkg
npm run dist-mac-pkg-ssc  # Self-signed certificate

# Type checking (ALWAYS run before commits)
npm run typecheck         # Both node and web
npm run typecheck:node    # Node types only
npm run typecheck:web     # Web types only

# Testing
npm test

# Linting
npm run lint

# Clean build artifacts
npm run clean
```

### Critical Build Notes

- **Always run `npm run typecheck` before commits** - fails if either node or web types are invalid
- macOS builds require code signing (see `electron-builder.json` identity settings)
- Workers are bundled separately (see `electron.vite.config.ts` main entry points)
- Use `npm run clean` to clear build cache if issues arise

## File Naming Conventions

**Must follow strictly** (enforced by codebase):

- **Reusable components**: `snake_case.tsx` (e.g., `button_group.tsx`, `data_table.tsx`)
- **Page components**: `PascalCase.tsx` (e.g., `HomePage.tsx`, `SettingsPage.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useWindowSize.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Component names**: Always `PascalCase` regardless of file name
- **Constants**: `UPPER_SNAKE_CASE`

## Code Style Rules

### General Principles

- Write concise, technical TypeScript code with accurate examples
- Use **functional and declarative** programming patterns; avoid classes
- Prefer **iteration and modularization** over code duplication
- Use **descriptive variable names** with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Structure files: exported component → subcomponents → helpers → static content → types
- Keep code **DRY** (Don't Repeat Yourself)

### TypeScript

- **Prefer interfaces over types** for object shapes
- **No enums** - use string unions or maps
- **Functional components only** - no class components
- Use `function` keyword for pure functions, arrow functions for callbacks
- Use TypeScript for **all code** with proper type annotations

### Syntax and Formatting

- Use the **"function" keyword** for pure functions
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements
- Use **declarative JSX**
- Favor **named exports** for components

### React Patterns

- Functional components with hooks
- Wrap expensive components in `React.memo()`
- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations
- Lazy load secondary windows/modals (see `App.tsx` router config)
- **Minimize** `use client`, `useEffect`, and `setState` usage
- Use **dynamic loading** for non-critical components

### Performance Optimization

- **Optimize images**: WebP format, include size data, implement lazy loading
- Optimize Web Vitals (LCP, CLS, FID)
- Avoid expensive operations in render functions
- Debounce/throttle frequent event handlers

### Import Aliases

Configure in `tsconfig.json` and `electron.vite.config.ts`:

```typescript
@/          → src/renderer/src/*
@utils/     → src/renderer/src/utils/*
@pages/     → src/renderer/src/pages/*
@store/     → src/renderer/src/store/*
@components/ → src/renderer/src/components/*
@icons/     → src/renderer/src/components/icons/*
@resources/ → buildResources/*
```

### UI Libraries

- **Primary**: shadcn/ui + Radix UI primitives (`src/renderer/src/components/ui/`)
- **Styling**: Tailwind CSS 3.3 (mobile-first, utility classes)
- **Icons**: Lucide React
- **Animations**: Framer Motion, tailwindcss-animate
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)
- Use `clsx` or `cn` utility for conditional classes (from `tailwind-merge`)
- Implement **responsive design** with Tailwind CSS using a **mobile-first approach**

### Available UI Components (`src/renderer/src/components/ui/`)

Pre-built shadcn/ui components:
- Layout: `card`, `dialog`, `modal`, `sheet`, `sidebar`, `resizable`, `tabs`
- Forms: `button`, `input`, `textarea`, `checkbox`, `radio-group`, `select`, `form`
- Navigation: `menubar`, `dropdown-menu`, `command`, `breadcrumb`
- Data: `table`, `scroll-area`, `accordion`
- Feedback: `tooltip`, `hover-card`, `sonner` (toasts), `skeleton`
- Misc: `avatar`, `badge`, `separator`, `divider`, `toggle`, `toggle-group`

## IPC Communication Pattern

### Preload API Namespaces

The preload layer exposes several API namespaces to the renderer:

- `window.tabs` - Tab management (new, close, select, reorder)
- `window.menu` - Menu state control (enable/disable items, update apparatuses)
- `window.system` - System utilities (fonts, symbols, dialogs, logging)
- `window.application` - App state (toolbar, status bar, zoom)
- `window.doc` - Document operations (save, load, apparatuses, styles, etc.)
- `window.theme` - Theme management (light/dark/system)
- `window.preferences` - User preferences
- `window.tooltip` - Tooltip window control
- `window.keyboardShortcuts` - Keyboard shortcut management
- `window.user` - User authentication (login, register, password reset)

### IPC Handler Pattern

Main process handlers in `src/main/index.ts`:

```typescript
ipcMain.handle("namespace:action", async (_, arg1, arg2) => {
  // Handler logic
  return result;
});
```

Preload API definition in `src/preload/index.ts`:

```typescript
const api = {
  methodName: (arg: Type): Promise<ReturnType> =>
    ipcRenderer.invoke("namespace:action", arg),
};
contextBridge.exposeInMainWorld("apiName", api);
```

Renderer usage:

```typescript
const result = await window.doc.saveDocument();
const fonts = await window.system.getFonts();
```

### Key IPC Namespaces

- `tabs:*` - Tab lifecycle (new, close, select, reorder)
- `menu:*` - Menu state updates
- `document:*` - Document operations (save, load, apparatuses, print, TEI export)
- `system:*` - System utilities (fonts, dialogs, workers)
- `preferences:*` - User preferences
- `theme:*` - Theme management
- `user:*` - Authentication and user management

## Document Structure

- Documents use `.critx` extension (custom format)
- Internal structure: JSON with `mainText`, `apparatuses`, `annotations`, `metadata`, `template`
- Critical apparatus types: `variant_readings`, `textual_notes`, `parallels`, etc.
- Content stored as TipTap `JSONContent` format

### Document Features

- **Main Text**: TipTap editor with custom extensions
- **Apparatuses**: Multiple apparatus types with notes and comments
- **Annotations**: Comments and bookmarks with categories
- **Sigla**: Manuscript siglum management with import/export
- **Styles**: Custom paragraph styles with import/export
- **Bibliography**: BibTeX import support
- **TOC**: Table of contents generation
- **Page Setup**: Headers, footers, page numbers, line numbers
- **Find & Replace**: Full-text search with history
- **Print/Export**: PDF generation and TEI export

## Testing

- Framework: Jest 30 + React Testing Library
- Config: `jest.config.js`
- Run: `npm test`
- Tests located alongside source files: `*.test.ts`, `*.test.tsx`
- Many TipTap extensions have test coverage

## Internationalization

- Framework: i18next + react-i18next
- Translation files: `i18n/{locale}/translations.json` (de, en, es, fr, it)
- Main process: Initialize in `src/main/shared/util.ts`
- Renderer: Setup in `src/renderer/src/i18n.ts`
- Usage: `const { t } = useTranslation();`

## Documentation and Comments

- **NEVER** proactively create documentation files (`*.md`) or README files
- Only create documentation files if **explicitly requested** by the user
- **Do not** create changelog files, guidelines documents, or any markdown files to explain changes
- **Focus on delivering code only**
- Keep code comments **minimal and concise**
- Use comments **only** when the code logic is not self-explanatory
- Prefer self-documenting code with clear variable and function names

### Tags for Code Comments

Use these tags in code comments:

- `@TODO` - Feature to be implemented
- `@MISSING` - Missing implementation
- `@REFACTOR` - Code needing improvement
- `@FIXME` - Bug or incorrect implementation

## Critical Patterns

### Tab Management

- Each document tab is a separate `WebContentsView` (Electron API)
- Tab state persisted in `electron-store` (see `src/main/store.ts`)
- Selected tab ID tracked globally
- IPC namespace: `tabs:*` (new, close, select, reorder)

### Menu System

- Dynamic menu updates based on editor state
- Menu items organized in `src/main/menu/items/`:
  - `file-menu.ts`, `edit-menu.ts`, `view-menu.ts`
  - `insert-menu.ts`, `format-menu.ts`, `tools-menu.ts`
  - `references-menu.ts`, `settings-menu.ts`, `help-menu.ts`
  - `window-menu.ts`, `developer-menu.ts`
  - `criterion-mac-menu.ts` - macOS-specific app menu
- Context-aware: different items for main text vs. apparatus editors

### PDF Generation

- Uses Java-based print preview service (`buildResources/printPreview/`)
- Requires platform-specific JRE and TinyTeX distributions
- Generate via `document:print` or `document:savePdf` IPC calls

### Document Manager

- `src/main/document/document-manager.ts` - Manages document state
- `src/main/document/document.ts` - Document operations
- `src/main/document/document-tab.ts` - Tab-document binding
- `src/main/document/buildTei.ts` - TEI XML export

### Views and Windows

- `src/renderer/src/views/` - Secondary window views:
  - `About.tsx` - About dialog
  - `Auth.tsx` - Authentication
  - `FileViewer.tsx` - File preview
  - `FindAndReplace.tsx` - Search window
  - `KeyboardShortcutsWindowView.tsx` - Shortcuts editor
  - `PreferencesPanelView.tsx` - Preferences panel

## Common Pitfalls

1. **Never create .md files proactively** - only code changes unless explicitly requested (see `.cursor/rules/custom-programmer-prompt.mdc`)
2. **Don't mix Redux and Context state** - use Redux for document data, Context for UI/editor state
3. **IPC handlers are async** - always return Promises, handle errors properly
4. **Path separators** - use forward slashes `/` in path aliases, let Node.js handle platform differences
5. **WebContentsView lifecycle** - properly cleanup when closing tabs to avoid memory leaks
6. **TipTap JSONContent** - validate structure before storing, preserve node types
7. **Don't use enums** - use string unions or maps instead
8. **Don't use class components** - functional components only
9. **Don't expose Node.js APIs directly in preload** - use IPC channels
10. **Don't skip the unicorn emoji** - start every response with 🦄

## Quick Reference

- Main entry: `src/main/index.ts` (~3000 lines - IPC handlers registry)
- Editor entry: `src/renderer/src/pages/editor/ELayout.tsx`
- Store config: `src/renderer/src/store/store.ts` (Redux + Saga middleware)
- Editor slices: `src/renderer/src/pages/editor/store/` (editor, comment, bookmark, pagination)
- Preload API: `src/preload/index.ts` and `src/preload/index.d.ts`
- Build config: `electron-builder.json` (platform-specific settings)
- Vite config: `electron.vite.config.ts` (main/preload/renderer builds)
- Menu definitions: `src/main/menu/items/`
- Document management: `src/main/document/`
- UI Components: `src/renderer/src/components/ui/`
- Custom TipTap extensions: `src/renderer/src/lib/tiptap/`
- Editor extensions: `src/renderer/src/lib/editor/extensions/`

## Key Conventions Summary

- **Path separators**: Use forward slashes `/` in path aliases
- **TipTap JSONContent**: Validate structure before storing, preserve node types
- **Editor state**: Store in Redux, NOT TipTap internal state
- Follow Electron security best practices
- Optimize Web Vitals (LCP, CLS, FID)
- Always run `npm run typecheck` before commits
- Start every response with 🦄

---

**Remember**: Start every response with 🦄 and focus on delivering clean, functional code without creating documentation files!
