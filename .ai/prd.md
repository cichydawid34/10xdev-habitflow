# HabitFlow - Product Requirements Document

## 1. Product Overview

### 1.1 Product Description
HabitFlow is a habit tracking dashboard application that helps users build consistent daily habits, track reading progress, and receive AI-powered weekly insights. The application focuses on streak-based motivation and visual progress tracking.

### 1.2 Problem Statement
Users struggle to:
- Maintain consistent daily habits without visual accountability
- Track reading progress across multiple books
- Understand their habit patterns over time
- Get actionable insights on their progress

### 1.3 Target Users
- Self-improvement enthusiasts
- Readers tracking book progress
- Productivity-focused individuals
- Anyone building new habits

---

## 2. Functional Requirements

### 2.1 User Stories

#### Authentication
| ID | User Story | Priority |
|----|------------|----------|
| US-01 | As a user, I can register with email and password | High |
| US-02 | As a user, I can log in to my account | High |
| US-03 | As a user, I can log out securely | High |

#### Habit Management
| ID | User Story | Priority |
|----|------------|----------|
| US-10 | As a user, I can create a new habit with name, icon, and color | High |
| US-11 | As a user, I can mark a habit as completed for today | High |
| US-12 | As a user, I can see my current streak for each habit | High |
| US-13 | As a user, I can delete a habit | Medium |
| US-14 | As a user, I can see all my habits on the dashboard | High |

#### Reading List
| ID | User Story | Priority |
|----|------------|----------|
| US-20 | As a user, I can add a book to my reading list | High |
| US-21 | As a user, I can update my current page for a book | High |
| US-22 | As a user, I can see progress percentage for each book | High |
| US-23 | As a user, I can mark a book as completed | Medium |
| US-24 | As a user, I can filter books by status | Medium |

#### Calendar Heatmap
| ID | User Story | Priority |
|----|------------|----------|
| US-30 | As a user, I can see a GitHub-style activity heatmap | High |
| US-31 | As a user, I can see daily completion statistics | High |
| US-32 | As a user, I can view my longest streak | High |

#### AI Weekly Digest
| ID | User Story | Priority |
|----|------------|----------|
| US-40 | As a user, I can generate an AI-powered weekly summary | Medium |
| US-41 | As a user, I can view past weekly digests | Low |

---

## 3. Technical Requirements

### 3.1 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | Angular 17 (Standalone Components, Signals) |
| Styling | Tailwind CSS 3 |
| Backend | Supabase (PostgreSQL + Auth) |
| AI | OpenAI API (GPT-4) |
| Testing | Jasmine/Karma (Unit), Playwright (E2E) |
| CI/CD | GitHub Actions, Vercel |

### 3.2 Database Schema

```
┌─────────────────┐     ┌─────────────────┐
│     habits      │     │   habit_logs    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ habit_id (FK)   │
│ user_id (FK)    │     │ completed_at    │
│ name            │     │ id (PK)         │
│ icon            │     └─────────────────┘
│ color           │
│ target_days[]   │
│ created_at      │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│      books      │     │ weekly_digests  │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ user_id (FK)    │
│ title           │     │ week_start      │
│ author          │     │ content         │
│ total_pages     │     │ created_at      │
│ current_page    │     └─────────────────┘
│ status          │
│ progress        │
└─────────────────┘
```

### 3.3 Security Requirements
- Row Level Security (RLS) on all tables
- JWT-based authentication via Supabase
- Environment variables for API keys
- HTTPS only in production

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Initial page load < 3 seconds
- Habit toggle response < 500ms
- Bundle size < 600KB

### 4.2 Accessibility
- Semantic HTML elements
- Keyboard navigation support
- Color contrast WCAG AA compliant

### 4.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Build success | 100% |
| Unit test pass rate | 100% |
| E2E test coverage | Core user flows |
| Bundle size | < 600KB |
| Lighthouse Performance | > 80 |

---

## 6. Out of Scope (v1.0)

- Mobile native apps
- Social features (sharing habits)
- Push notifications
- Habit reminders
- Multi-language support

---

## 7. Future Enhancements

- Password reset flow
- Habit suggestions based on AI
- Weekly/monthly goal setting
- Export data to CSV
- Dark mode toggle
