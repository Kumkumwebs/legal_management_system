# NTS Legal Pro — Frontend

A production-ready SaaS Legal Management System dashboard built with React + Vite + Material UI.

## Tech Stack
- **React 18** + **Vite**
- **Material UI (MUI) v5**
- **React Router v6**
- **Axios** with JWT interceptors
- **Recharts** for analytics

## Project Structure
```
src/
├── api/
│   ├── apiClient.js      # Axios instance + interceptors
│   └── services.js       # All API endpoint functions
├── auth/
│   ├── AuthContext.jsx   # JWT auth context + hooks
│   └── ProtectedRoute.jsx
├── layout/
│   └── MainLayout.jsx    # Sidebar + TopNav shell
├── pages/
│   ├── LoginPage.jsx
│   ├── Dashboard/DashboardPage.jsx
│   ├── Clients/ClientsPage.jsx
│   ├── Cases/CasesPage.jsx
│   ├── Documents/DocumentsPage.jsx
│   ├── Payments/PaymentsPage.jsx
│   └── Team/TeamPage.jsx
├── components/
│   └── UI.jsx            # Shared: PageHeader, StatCard, SectionCard, StatusChip, EmptyState
├── theme.js              # MUI theme (colors, typography, component overrides)
└── App.jsx               # Router + providers
```

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Configuration

Edit `src/api/apiClient.js` to change the base URL:
```js
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

## Expected DRF API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/token/` | Login — returns `{ access, refresh }` |
| POST | `/auth/add-user/` | Create team member |
| GET/POST | `/clients/` | List / Create clients |
| PUT/DELETE | `/clients/{id}/` | Update / Delete client |
| GET/POST | `/cases/` | List / Create cases |
| GET/POST | `/documents/` | List / Upload documents |
| GET/POST | `/payments/` | List / Create payments |

## Features
- ✅ JWT authentication with auto-attach + 401 redirect
- ✅ Protected routes
- ✅ Dashboard with KPI cards + Bar/Line charts
- ✅ Full client CRUD (add, edit, delete, search)
- ✅ Case management with client assignment
- ✅ Document upload (multipart/form-data) with case filter
- ✅ Payments with status tracking + revenue summary
- ✅ Team management with role assignment
- ✅ Responsive sidebar layout
- ✅ Professional MUI theme (DM Sans + Playfair Display)
