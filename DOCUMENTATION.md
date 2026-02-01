# HabitFlow - Dokumentacja Projektu

## 📋 Spis treści

1. [Opis projektu](#opis-projektu)
2. [Funkcjonalności](#funkcjonalności)
3. [Architektura](#architektura)
4. [Stack technologiczny](#stack-technologiczny)
5. [Struktura projektu](#struktura-projektu)
6. [Baza danych](#baza-danych)
7. [API i serwisy](#api-i-serwisy)
8. [Autentykacja](#autentykacja)
9. [Integracja AI](#integracja-ai)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Testy](#testy)
12. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
13. [Deployment](#deployment)

---

## Opis projektu

**HabitFlow** to aplikacja webowa do budowania pozytywnych nawyków i śledzenia postępu w czytaniu książek. Projekt powstał jako rozwiązanie problemu utrzymania regularności w codziennych nawykach oraz braku motywacji do systematycznego rozwoju osobistego.

### Problem
- Trudność w utrzymaniu regularności nawyków
- Brak wizualizacji postępów na przestrzeni czasu
- Brak spersonalizowanych rekomendacji

### Rozwiązanie
- System streak'ów motywujący do codziennego wykonywania nawyków
- Kalendarz aktywności w stylu GitHub (heatmap)
- AI-powered weekly digest z analizą i rekomendacjami

---

## Funkcjonalności

### 🎯 Zarządzanie nawykami (CRUD)
- **Create**: Tworzenie nowych nawyków z nazwą, ikoną i kolorem
- **Read**: Wyświetlanie listy nawyków z aktualnym statusem
- **Update**: Edycja istniejących nawyków (nazwa, ikona, kolor)
- **Delete**: Usuwanie nawyków z potwierdzeniem

### 🔥 System Streak'ów
- Automatyczne obliczanie ciągłości wykonywania nawyków
- Wizualne wskaźniki (ikona ognia 🔥)
- Resetowanie streak'a przy przerwaniu ciągłości

### 📅 Kalendarz aktywności
- Heatmap całego roku (inspirowany GitHub)
- Kolorowanie intensywności (im więcej nawyków, tym jaśniejszy kolor)
- Statystyki: łączne ukończenia, aktywne dni, najdłuższy streak

### 📚 Śledzenie książek
- Lista lektur z statusami (do przeczytania, w trakcie, ukończone, wstrzymane)
- Postęp strona po stronie z wizualnym paskiem %
- Szybkie akcje: rozpocznij czytanie, oznacz jako ukończone

### ✨ AI Weekly Digest
- Automatyczne podsumowania tygodniowe
- Analiza wzorców i trendów
- Spersonalizowane rekomendacje
- Generowane przez OpenAI GPT-3.5 Turbo

### 🔐 Autentykacja
- Rejestracja z walidacją hasła
- Logowanie email/hasło
- Sesje zarządzane przez Supabase Auth
- Route Guard chroniący prywatne trasy

---

## Architektura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Angular 17    │────▶│    Supabase     │────▶│   PostgreSQL    │
│   (Frontend)    │     │     (Auth)      │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│   OpenAI API    │
│  (GPT-3.5)      │
│                 │
└─────────────────┘
```

### Wzorce architektoniczne
- **Standalone Components**: Angular 17 bez NgModules
- **Signals**: Reaktywny state management
- **Services**: Logika biznesowa w dedykowanych serwisach
- **Guards**: Ochrona tras wymagających autentykacji
- **Lazy Loading**: Ładowanie komponentów na żądanie

---

## Stack technologiczny

| Warstwa | Technologia | Wersja |
|---------|-------------|--------|
| Frontend | Angular | 17.x |
| State Management | Angular Signals | - |
| Styling | Tailwind CSS | 3.x |
| Backend/Auth | Supabase | - |
| Database | PostgreSQL | 15.x |
| AI | OpenAI API | GPT-3.5 Turbo |
| Testing (Unit) | Karma + Jasmine | - |
| Testing (E2E) | Playwright | - |
| CI/CD | GitHub Actions | - |
| Hosting | Vercel | - |

---

## Struktura projektu

```
habitflow/
├── .ai/                          # Dokumenty projektowe
│   ├── prd.md                    # Product Requirements Document
│   ├── tech-stack.md             # Decyzje technologiczne
│   └── db-schema.md              # Schema bazy danych
│
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions pipeline
│
├── e2e/
│   └── user-journey.spec.ts      # Testy E2E Playwright
│
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── services/
│   │   │       ├── supabase.service.ts
│   │   │       ├── auth.service.ts
│   │   │       ├── habit.service.ts
│   │   │       ├── book.service.ts
│   │   │       └── ai.service.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login.component.ts
│   │   │   │   └── register.component.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── components/
│   │   │   │       ├── habit-card.component.ts
│   │   │   │       ├── add-habit-dialog.component.ts
│   │   │   │       └── edit-habit-dialog.component.ts
│   │   │   ├── calendar/
│   │   │   │   └── calendar.component.ts
│   │   │   ├── books/
│   │   │   │   └── books.component.ts
│   │   │   └── digest/
│   │   │       └── digest.component.ts
│   │   │
│   │   └── shared/
│   │       └── models/
│   │           └── index.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles.scss               # Global styles (Dark Glassmorphism)
│
├── tailwind.config.js            # Tailwind configuration
├── playwright.config.ts          # Playwright configuration
└── package.json
```

---

## Baza danych

### Tabele

#### `habits`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| user_id | UUID | FK → auth.users |
| name | VARCHAR(255) | Nazwa nawyku |
| icon | VARCHAR(10) | Emoji ikona |
| color | VARCHAR(7) | Kolor HEX |
| target_days | INT[] | Dni tygodnia (1-7) |
| created_at | TIMESTAMP | Data utworzenia |

#### `habit_logs`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| habit_id | UUID | FK → habits |
| completed_at | DATE | Data wykonania |

#### `books`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| user_id | UUID | FK → auth.users |
| title | VARCHAR(255) | Tytuł książki |
| author | VARCHAR(255) | Autor |
| status | ENUM | reading/completed/paused/want_to_read |
| current_page | INT | Aktualna strona |
| total_pages | INT | Łączna liczba stron |
| created_at | TIMESTAMP | Data dodania |

#### `weekly_digests`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| user_id | UUID | FK → auth.users |
| week_start | DATE | Początek tygodnia |
| content | TEXT | Treść digestu (JSON) |
| created_at | TIMESTAMP | Data wygenerowania |

### Row Level Security (RLS)
Wszystkie tabele mają włączone RLS z politykami ograniczającymi dostęp tylko do rekordów użytkownika:

```sql
CREATE POLICY "Users can only access own data" ON habits
  FOR ALL USING (auth.uid() = user_id);
```

---

## API i serwisy

### HabitService
```typescript
// Pobieranie nawyków z obliczonymi streak'ami
getHabitsWithStreaks(): Observable<Habit[]>

// CRUD operacje
createHabit(dto: CreateHabitDto): Promise<Observable<Habit>>
updateHabit(id: string, dto: UpdateHabitDto): Observable<Habit>
deleteHabit(id: string): Observable<void>

// Logowanie wykonania
logHabit(habitId: string, date: Date): Observable<HabitLog>
unlogHabit(habitId: string, date: Date): Observable<void>
```

### BookService
```typescript
getBooks(): Observable<Book[]>
createBook(dto: CreateBookDto): Promise<Observable<Book>>
updateBook(id: string, dto: UpdateBookDto): Observable<Book>
updateProgress(id: string, currentPage: number): Observable<Book>
deleteBook(id: string): Observable<void>
```

### AiService
```typescript
generateWeeklyDigest(): Observable<WeeklyDigest>
getWeeklyDigests(): Observable<WeeklyDigest[]>
```

---

## Autentykacja

### Flow
1. Użytkownik otwiera aplikację
2. AuthGuard sprawdza sesję Supabase
3. Brak sesji → redirect do `/login`
4. Logowanie → Supabase Auth → sesja w localStorage
5. Sukces → redirect do `/dashboard`

### Implementacja
```typescript
// auth.guard.ts
canActivate(): Observable<boolean> {
  return from(this.supabase.getSession()).pipe(
    map(session => {
      if (!session) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
}
```

---

## Integracja AI

### Proces generowania digestu

1. **Zbieranie danych** - pobieranie logów nawyków i książek z ostatniego tygodnia
2. **Budowanie promptu** - formatowanie danych w kontekst dla AI
3. **Wywołanie OpenAI API** - GPT-3.5 Turbo z system message
4. **Parsowanie odpowiedzi** - ekstrakcja treści
5. **Zapis do bazy** - przechowywanie dla późniejszego dostępu

### Przykładowy prompt
```
You are a personal development coach. Based on this week's data:
- Habits completed: 15/21 (71%)
- Books progress: "Atomic Habits" 45% → 67%
- Longest streak: Exercise (7 days)

Generate a personalized weekly summary with:
1. Highlights and achievements
2. Areas for improvement
3. Actionable recommendations for next week
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --watch=false --browsers=ChromeHeadless
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
```

### Stages
1. **Build** - kompilacja TypeScript, bundling
2. **Lint** - sprawdzenie ESLint rules
3. **Unit Tests** - Karma + Jasmine (11 testów)
4. **E2E Tests** - Playwright (user journey)
5. **Deploy** - Vercel (on push to main)

---

## Testy

### Unit Tests (Karma + Jasmine)
```bash
npm test
# Output: Chrome Headless: Executed 11 of 11 SUCCESS
```

Pokrycie:
- `habitflow.spec.ts` - podstawowe testy komponentów

### E2E Tests (Playwright)
```bash
npx playwright test
```

Scenariusze:
- `user-journey.spec.ts` - pełna ścieżka użytkownika:
  - Rejestracja
  - Logowanie
  - Dodawanie nawyku
  - Oznaczanie jako wykonane
  - Nawigacja po sekcjach

---

## Instalacja i uruchomienie

### Wymagania
- Node.js 18+
- npm 9+
- Konto Supabase
- Klucz OpenAI API

### Kroki

1. **Klonowanie repozytorium**
```bash
git clone https://github.com/cichydawid34/10xdev-habitflow.git
cd habitflow
```

2. **Instalacja zależności**
```bash
npm install
```

3. **Konfiguracja środowiska**
```bash
# Utwórz src/environments/environment.ts
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
  openaiApiKey: 'YOUR_OPENAI_API_KEY'
};
```

4. **Setup bazy danych**
- Uruchom SQL z `.ai/db-schema.md` w Supabase SQL Editor
- Włącz Row Level Security dla wszystkich tabel

5. **Uruchomienie**
```bash
npm start
# Aplikacja dostępna na http://localhost:4200
```

---

## Deployment

### Vercel

1. Import projektu z GitHub
2. Framework: Angular (auto-detect)
3. Build command: `npm run build`
4. Output directory: `dist/habitflow/browser`
5. Environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `OPENAI_API_KEY`

### Konfiguracja `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📄 Licencja

MIT License

---

## 👤 Autor

**Dawid Cichy**

- GitHub: [@cichydawid34](https://github.com/cichydawid34)
- Projekt: [10xdev-habitflow](https://github.com/cichydawid34/10xdev-habitflow)

---

*Dokumentacja utworzona: Luty 2026*
