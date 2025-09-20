# Frontend Setup (Azure DevOps Migration Demo)

This document explains the scaffold, libraries, and structure that were added.

## Stack

- React 17 (pinned for `azure-devops-ui` compatibility)
- TypeScript
- Create React App (react-scripts 5)
- React Router v6
- Azure DevOps Fluent UI component library (`azure-devops-ui`)

## Why React 17?
`azure-devops-ui@2.262.0` has peer dependency `react@^16.8.1` but works with React 17; React 18/19 caused install conflicts. We pinned React + @types to 17.x and used `--legacy-peer-deps` to satisfy npm.

## Folder Structure (added)
```
src/
  pages/
    Home/HomePage.tsx
    NotFound/NotFoundPage.tsx
  routes/AppRoutes.tsx
  (future) components/
  (future) services/
  (future) hooks/
  (future) types/
```

## Key Files

`src/index.tsx` – Adds BrowserRouter and global Azure DevOps UI CSS.
`src/App.tsx` – Delegates to `AppRoutes`.
`src/routes/AppRoutes.tsx` – Central routing (Home + 404 fallback).
`src/pages/Home/HomePage.tsx` – Landing page using `Page`, `Header`, `Card`, `Button` from `azure-devops-ui`.

## Installed Dependencies

Runtime:
- react 17.0.2
- react-dom 17.0.2
- react-router-dom ^6
- azure-devops-ui ^2.262.0

Dev / Types:
- typescript
- @types/react 17.x
- @types/react-dom 17.x
- @types/jest, @testing-library/* (from CRA template)
- ajv@6 + ajv-keywords@3 (to satisfy older webpack tooling expectations)

## Commands

Initial scaffold (done):
```
npx create-react-app frontend --template typescript
```

Install libraries (with peer override):
```
npm install react@17 react-dom@17 react-router-dom azure-devops-ui @types/react@17 @types/react-dom@17 --legacy-peer-deps
```

Fix Ajv (only if start error appears):
```
npm install ajv@6 ajv-keywords@3 --save-dev --legacy-peer-deps
```

Run dev server on alternate port:
```
set PORT=3001&& npm start
```
Or PowerShell syntax:
```
$env:PORT=3001; npm start
```

Build:
```
npm run build
```

Tests:
```
npm test
```

## Using Azure DevOps UI Components
Import required core styles once (already in `index.tsx`):
```ts
import 'azure-devops-ui/Core/override.css';
import 'azure-devops-ui/Core/core.css';
```
Then import components by path, e.g.:
```ts
import { Button } from 'azure-devops-ui/Button';
```

## Authentication (Microsoft Entra ID with MSAL)

Implemented secure(ish) front-end authentication using `@azure/msal-browser` + `@azure/msal-react` with in-memory token storage.

### Files Added
```
src/auth/msalConfig.ts        # MSAL configuration (authority, clientId, scopes)
src/auth/AuthProvider.tsx     # Provides auth context, login/logout, token acquisition
src/auth/routeGuards.tsx      # ProtectedRoute + RoleGuard components
src/pages/Profile/ProfilePage.tsx  # Example protected page displaying account/token snippet
```

### Environment Variables (`.env`)
See `.env.example`:
```
REACT_APP_AAD_CLIENT_ID=YOUR_CLIENT_ID
REACT_APP_AAD_TENANT_ID=YOUR_TENANT_ID_OR_COMMON
REACT_APP_AAD_REDIRECT_URI=http://localhost:3000
REACT_APP_AAD_DEFAULT_SCOPES=User.Read,openid,profile,email
```

Restart dev server after adding or changing `.env` values.

### Azure Portal Setup Steps
1. Go to Azure Portal > Microsoft Entra ID > App registrations > New registration.
2. Name: e.g. `AzureDevOpsMigrationFrontend`.
3. Supported account types: (pick single tenant or multitenant as needed).
4. Redirect URI: `Single-page application (SPA)` → `http://localhost:3000`.
5. Register.
6. Copy Application (client) ID → set `REACT_APP_AAD_CLIENT_ID`.
7. If single tenant, copy Directory (tenant) ID → set `REACT_APP_AAD_TENANT_ID`. Otherwise use `common`.
8. (Optional) Expose an API > Add app role(s) if you plan role-based access. Assign roles to users/groups.
9. (Optional) API Permissions: Add Microsoft Graph > Delegated `User.Read` (granted by default) plus any others you need; click Grant admin consent.
10. Add additional redirect URIs for production domains later.

### Best Practices Applied
- In-memory token cache (`cacheLocation: 'memoryStorage'`) to reduce token persistence risk.
- Silent token acquisition first, then interactive fallback.
- Role extraction from `idTokenClaims.roles` and `idTokenClaims.groups` (supports future RBAC).
- Access token not stored; only short preview shown in UI.
- Parameterized scopes via `REACT_APP_AAD_DEFAULT_SCOPES`.

### Adding a Protected Route
Wrap the element in `<ProtectedRoute>` (see `AppRoutes.tsx` for `/profile`). For role-based restriction:
```tsx
<RoleGuard roles={["Admin"]} fallback={<div>Need Admin role</div>}>
  <AdminPage />
</RoleGuard>
```

### Using the Auth Context
```tsx
import { useAuth } from '../auth/AuthProvider';
const { isAuthenticated, account, login, logout, getAccessToken, roles } = useAuth();
```

Acquire an access token (for calling an API with custom scope):
```ts
const token = await getAccessToken(["api://YOUR_API_CLIENT_ID/Custom.Scope"]);
```

### Future Expansion
- Add refresh logic for long-lived sessions (monitor `expiresOn`).
- Integrate a backend to exchange tokens for downstream APIs (avoid exposing broad scopes in front end).
- Add conditional rendering for role-based navigation.
- Implement MS Graph calls using the acquired token.

## Next Steps / Suggestions
- Add theming or dark mode toggle.
- Abstract layout (header/nav) into shared component.
- Introduce state management if needed (Zustand, Redux Toolkit).
- Add environment-based configuration (`REACT_APP_` vars).
- Implement services layer for Azure DevOps REST API calls.

## Troubleshooting
- If you see many source map warnings from `azure-devops-ui`, you can safely ignore or suppress them by disabling source map loader or adding `GENERATE_SOURCEMAP=false` in `.env`.
- If install conflicts reappear, clear `node_modules` and `package-lock.json` then reinstall with `--legacy-peer-deps`.

---
Scaffold complete. You can now extend features inside the provided structure.

## Dual-Pane Azure DevOps Explorer (Mock)

An experimental dual-pane explorer UI was added to prototype cross-organization resource operations.

### Location & Key Files
```
src/explorer/
  types.ts                 # Core resource & provider interfaces
  dataProvider.ts          # Provider switching (mock vs future API)
  mockData.ts              # In-memory mock implementation & lazy child generation
  ExplorerContext.tsx      # Pane state (navigation, expansion, selection) for left/right orgs
  DragAndDrop.tsx          # Lightweight drag context abstraction
  ResourceBreadcrumbs.tsx  # Breadcrumb component per pane
  ResourceContextMenu.tsx  # Simple action menu (rename/delete placeholders)
  ResourceTree.tsx         # Indented tree/list hybrid
  ExplorerPane.tsx         # Pane composition (breadcrumbs + tree + drop target)
pages/Explorer/DualExplorerPage.tsx # Hosts two panes side-by-side
```

### Route
`/explorer` — added to `AppRoutes`. A button is available on the Home page.

### Current Capabilities (Mock)
- Two organizations (`orgA`, `orgB`) each with category roots (Boards, Repos, Pipelines, Tests, Artifacts)
- Lazy child generation when expanding/navigating
- Breadcrumb navigation (click segments to jump)
- Selection (single/multi via Ctrl/Cmd)
- Rename (prompt) via context menu (mock persistence)
- Delete / Move / Copy placeholders (alerts only)
- Drag start/end across panes (mock drop alert)
 - Command bar (Refresh, placeholders for Collapse/Expand All, New, Rename, Delete)
 - Filter bar (live text filtering of children in current folder)

### Swapping to Real Backend
1. Implement an API provider in `dataProvider.ts` (e.g. `apiDataProvider`) using `fetch`/`axios` to call backend endpoints.
2. Add resource endpoints: list children, rename, delete, move, copy.
3. Replace `providerKind="mock"` with `"api"` in `DualExplorerPage`.
4. Introduce a mapping from Azure DevOps entities (Projects → category roots, Repos → items, etc.).

### Potential Enhancements
- Replace manual tree with a virtualized list or dedicated tree component.
- Real drag-and-drop library (react-dnd or dnd-kit) with keyboard accessibility.
- Batch operations UI (toolbar appearing when multi-selected).
- Inline rename (editable text field) rather than prompt.
- Status toasts using azure-devops-ui MessageBar.
- Persist expansion & selection state per session.

### Accessibility Notes
- Ensure focus styles on interactive elements (currently basic button styling).
- Provide ARIA roles for tree/list semantics if expanded.

### Styling
Refined explorer styling now lives in `src/explorer/ExplorerStyles.css`, consolidating:
* Design tokens (colors, spacing, radii, shadows)
* Pane chrome & drag-over highlighting
* Tree row states (hover, selected, dragging)
* Context menu appearance
* Scrollbar refinement (WebKit) and layout spacing

Breadcrumbs are wrapped in a styled container and implement basic chain collapsing (first item + ellipsis + last three) to avoid horizontal overflow. The ellipsis currently displays the full path via a simple alert placeholder; you can replace this with a popover or in-place expansion toggle.

To customize theme quickly, adjust the CSS variables at the top of `ExplorerStyles.css`:
```
:root {
  --explorer-bg: #ffffff;
  --explorer-accent: #0078d4;
  /* etc. */
}
```

Future improvements could migrate these tokens to a theming context or CSS-in-JS solution if dynamic (light/dark) switching is desired.

#### Command & Filter Bar Design Inspiration
The command bar and filter layout take visual inspiration from Azure DevOps query editor pages (toolbar above content with compact buttons and a lightweight filter input). Implementation here is custom; no proprietary markup/assets are copied. Collapse/Expand All are placeholders pending recursive traversal helpers.

### Warning
All mutation operations are mock/no-op besides rename in the in-memory store.

---
