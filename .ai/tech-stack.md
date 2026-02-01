# HabitFlow - Technical Stack

## Overview

This document describes the technical architecture and design decisions for the HabitFlow application.

---

## Frontend Architecture

### Framework: Angular 17
- **Standalone Components**: No NgModules, simpler architecture
- **Signals**: Reactive state management without RxJS complexity
- **Lazy Loading**: Route-based code splitting

### Styling: Tailwind CSS 3
- Custom color palette (green primary, orange accent)
- Utility-first approach
- Responsive design system

### State Management
- Angular Signals for reactive UI state
- Services with `inject()` for dependency injection
- Observables for async data streams

---

## Backend Architecture

### Supabase
- **Authentication**: Email/password with Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Subscribeable table changes (future)

### Row Level Security (RLS)
All tables enforce user isolation:
```sql
CREATE POLICY "Users own data" ON table_name
FOR ALL USING (auth.uid() = user_id);
```

---

## AI Integration

### OpenAI API
- Model: GPT-4o-mini (cost-effective)
- Use case: Weekly digest generation
- Prompt engineering for structured output

---

## Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Jasmine/Karma | Services, utilities |
| E2E | Playwright | User flows |
| CI | GitHub Actions | All tests on PR |

---

## Deployment

### Vercel
- Automatic preview deployments
- Production on merge to main
- Environment variables for secrets

### CI/CD Pipeline
```
PR → Lint → Unit Tests → Build → E2E → Deploy
```

---

## Project Structure

```
src/
├── app/
│   ├── core/           # Services, guards
│   │   ├── services/   # Business logic
│   │   └── guards/     # Route protection
│   ├── features/       # Feature modules
│   │   ├── auth/       # Login, Register
│   │   ├── dashboard/  # Main view
│   │   ├── calendar/   # Heatmap
│   │   ├── books/      # Reading list
│   │   └── digest/     # AI summaries
│   └── shared/         # Models, utilities
├── environments/       # Config files
└── styles.scss         # Global styles
```

---

## Key Design Decisions

### 1. Tailwind over Angular Material
**Reason**: Full design control, smaller bundle, custom aesthetics

### 2. Signals over NgRx
**Reason**: Simpler mental model, less boilerplate for this scope

### 3. Supabase over custom backend
**Reason**: Built-in auth, RLS, real-time - faster development

### 4. Standalone Components
**Reason**: Angular 17 best practice, simpler imports
