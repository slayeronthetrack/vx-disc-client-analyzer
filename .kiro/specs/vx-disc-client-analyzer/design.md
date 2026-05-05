# Design Document - VX DISC Client Analyzer

## Overview

The VX DISC Client Analyzer is a full-stack web application that transforms the existing DISC test MVP into a professional client management and behavioral assessment platform. The system enables VX Consultoria team members to register clients, send personalized DISC test links, track test completion, analyze results, and generate professional PDF reports.

### Key Design Principles

1. **Security First**: All client data and test results are protected with authentication, authorization, and encryption
2. **Reusability**: Leverage existing MVP components, DISC algorithm, and UI elements to accelerate development
3. **Scalability**: Design for concurrent users and growing client database
4. **User Experience**: Maintain the clean, professional VX brand identity across all interfaces
5. **Separation of Concerns**: Clear boundaries between admin and client-facing features

### Technology Stack

- **Framework**: Next.js 14 with App Router (React Server Components + Client Components)
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS with VX brand colors
- **Authentication**: NextAuth.js v5 (Auth.js) with Credentials provider
- **Database**: Supabase (PostgreSQL) with connection pooling
- **Email**: Resend for transactional emails
- **PDF Generation**: @react-pdf/renderer for professional reports
- **Deployment**: Vercel with environment variables
- **State Management**: React hooks + Server Actions for mutations

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Admin Dashboard - VX Team]
        B[Client Portal - Public]
    end
    
    subgraph "Application Layer - Next.js 14"
        C[App Router]
        D[API Routes]
        E[Server Actions]
        F[Middleware - Auth]
    end
    
    subgraph "Service Layer"
        G[Auth Service - NextAuth]
        H[Email Service - Resend]
        I[PDF Service - react-pdf]
        J[DISC Calculator]
    end
    
    subgraph "Data Layer"
        K[(Supabase PostgreSQL)]
    end
    
    A --> C
    B --> C
    C --> F
    F --> D
    F --> E
    D --> G
    D --> H
    D --> I
    E --> J
    D --> K
    E --> K
    G --> K
```

### Application Structure

```
vx-disc-client-analyzer/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # VX team login
│   │   └── layout.tsx                # Auth layout
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Admin dashboard with metrics
│   │   ├── clients/
│   │   │   ├── page.tsx              # Client list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Client detail + history
│   │   │   │   └── edit/page.tsx     # Edit client
│   │   │   └── new/page.tsx          # New client form
│   │   ├── tests/
│   │   │   ├── page.tsx              # Test sessions list
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Test result view
│   │   │       └── pdf/route.ts      # PDF generation endpoint
│   │   └── layout.tsx                # Admin layout with sidebar
│   ├── test/
│   │   └── [token]/
│   │       └── page.tsx              # Public test interface
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts # NextAuth configuration
│   │   ├── clients/
│   │   │   └── route.ts              # Client CRUD operations
│   │   ├── tests/
│   │   │   ├── route.ts              # Test session operations
│   │   │   └── [id]/
│   │   │       ├── answers/route.ts  # Submit answers
│   │   │       └── send/route.ts     # Send/resend email
│   │   └── pdf/
│   │       └── [sessionId]/route.ts  # Generate PDF report
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # Reused from MVP
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Logo.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Loading.tsx
│   │   └── MetricCard.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx               # Admin navigation
│   │   ├── ClientTable.tsx           # Client list table
│   │   ├── TestStatusBadge.tsx       # Status indicator
│   │   └── DISCChart.tsx             # Result visualization
│   ├── test/
│   │   ├── TestQuestion.tsx          # Question display
│   │   └── TestProgress.tsx          # Progress indicator
│   └── pdf/
│       └── PDFReport.tsx             # PDF template
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── db.ts                         # Supabase client
│   ├── email.ts                      # Email service
│   └── pdf.ts                        # PDF generation
├── utils/
│   ├── calculateDISC.ts              # Reused from MVP
│   └── validation.ts                 # Input validation
├── data/
│   ├── questions.ts                  # Reused from MVP
│   └── profiles.ts                   # Reused from MVP
├── types/
│   ├── disc.ts                       # Reused from MVP
│   ├── client.ts                     # Client types
│   └── database.ts                   # Database types
└── middleware.ts                     # Auth middleware
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant VX as VX Team Member
    participant Login as Login Page
    participant NextAuth as NextAuth.js
    participant DB as Database
    participant Admin as Admin Dashboard
    
    VX->>Login: Enter email + password
    Login->>NextAuth: Submit credentials
    NextAuth->>DB: Query user by email
    DB-->>NextAuth: User record
    NextAuth->>NextAuth: Verify password hash
    alt Valid credentials
        NextAuth-->>Login: Create session + JWT
        Login->>Admin: Redirect to dashboard
    else Invalid credentials
        NextAuth-->>Login: Error message
        Login-->>VX: Display error
    end
```

### Test Administration Flow

```mermaid
sequenceDiagram
    participant VX as VX Team Member
    participant Admin as Admin Dashboard
    participant API as API Routes
    participant DB as Database
    participant Email as Email Service
    participant Client as Client
    participant Portal as Client Portal
    
    VX->>Admin: Register new client
    Admin->>API: POST /api/clients
    API->>DB: Insert client record
    API->>API: Generate secure token
    API->>DB: Create test session
    DB-->>API: Session + token
    API-->>Admin: Success
    
    VX->>Admin: Send test link
    Admin->>API: POST /api/tests/[id]/send
    API->>Email: Send email with link
    Email-->>Client: Email with test URL
    API->>DB: Update status to 'pending'
    API-->>Admin: Email sent confirmation
    
    Client->>Portal: Click test link
    Portal->>API: GET /api/tests?token=xxx
    API->>DB: Validate token
    DB-->>API: Session data
    API-->>Portal: Test questions
    
    Client->>Portal: Answer questions
    Portal->>API: POST /api/tests/[id]/answers
    API->>DB: Store answers
    API->>API: Calculate DISC result
    API->>DB: Store result
    API-->>Portal: Show result
```

## Components and Interfaces

### Core Components

#### 1. Authentication Components

**LoginForm** (`app/(auth)/login/page.tsx`)
- Email and password inputs with validation
- Submit button with loading state
- Error message display
- Uses NextAuth signIn() function

```typescript
interface LoginFormProps {
  callbackUrl?: string;
}

interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
}
```

#### 2. Admin Dashboard Components

**DashboardMetrics** (`components/admin/DashboardMetrics.tsx`)
- Displays key metrics: total clients, total tests, completion rate, profile distribution
- Uses MetricCard component from MVP
- Real-time data from database

```typescript
interface DashboardMetrics {
  totalClients: number;
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  completionRate: number;
  profileDistribution: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}
```

**ClientTable** (`components/admin/ClientTable.tsx`)
- Sortable and filterable table of clients
- Actions: view, edit, delete, send test
- Search by name or email
- Pagination for large datasets

```typescript
interface ClientTableProps {
  clients: Client[];
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onSendTest: (clientId: string) => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: Date;
  testCount: number;
  lastTestDate?: Date;
}
```

**TestSessionTable** (`components/admin/TestSessionTable.tsx`)
- List of all test sessions with status
- Filter by status: pending, in_progress, completed
- Actions: view result, resend link, generate PDF

```typescript
interface TestSession {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  token: string;
  status: 'pending' | 'in_progress' | 'completed';
  sentAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: DISCResult;
}
```

**DISCResultView** (`components/admin/DISCResultView.tsx`)
- Visual display of DISC scores with bar chart
- Dominant profile highlight
- Profile description, strengths, communication style, sales approach
- Generate PDF button

```typescript
interface DISCResultViewProps {
  result: DISCResult;
  clientName: string;
  completedAt: Date;
  onGeneratePDF: () => void;
}
```

#### 3. Client Portal Components

**TestInterface** (`app/test/[token]/page.tsx`)
- Validates token on load
- Displays questions one at a time
- Progress bar showing completion
- Navigation: previous, next, submit
- Auto-saves answers to database

```typescript
interface TestInterfaceState {
  currentQuestion: number;
  answers: Answer[];
  isSubmitting: boolean;
  error: string | null;
}

interface Answer {
  questionId: number;
  selectedOption: number;
  discType: DiscType;
}
```

**TestQuestion** (`components/test/TestQuestion.tsx`)
- Displays question text
- Radio buttons for options
- Visual feedback on selection
- Reused from MVP with enhancements

```typescript
interface TestQuestionProps {
  question: Question;
  selectedOption?: number;
  onSelect: (optionIndex: number) => void;
}
```

#### 4. PDF Components

**PDFReport** (`components/pdf/PDFReport.tsx`)
- Professional PDF layout with VX branding
- Client name, test date
- DISC scores visualization
- Profile description and recommendations
- Uses @react-pdf/renderer

```typescript
interface PDFReportProps {
  clientName: string;
  completedAt: Date;
  result: DISCResult;
}
```

### API Endpoints

#### Authentication

**POST /api/auth/signin**
- Handled by NextAuth.js
- Validates credentials against database
- Returns JWT session token

#### Client Management

**GET /api/clients**
- Returns list of all clients
- Query params: search, page, limit
- Requires authentication

**POST /api/clients**
- Creates new client
- Body: { name, email, phone, company? }
- Validates email format and uniqueness
- Returns created client with ID

**GET /api/clients/[id]**
- Returns client details with test history
- Requires authentication

**PUT /api/clients/[id]**
- Updates client information
- Body: { name?, email?, phone?, company? }
- Validates email format

**DELETE /api/clients/[id]**
- Soft deletes client and associated test sessions
- Requires confirmation

#### Test Management

**POST /api/tests**
- Creates new test session for client
- Body: { clientId }
- Generates secure token
- Returns session with token

**GET /api/tests**
- Returns list of test sessions
- Query params: status, clientId, page, limit
- Requires authentication

**GET /api/tests/[id]**
- Returns test session details
- Public endpoint if valid token provided
- Admin endpoint if authenticated

**POST /api/tests/[id]/send**
- Sends test link email to client
- Updates status to 'pending'
- Logs email attempt

**POST /api/tests/[id]/answers**
- Submits test answers
- Body: { answers: Answer[] }
- Calculates DISC result
- Updates status to 'completed'
- Returns result

**GET /api/tests/[id]/result**
- Returns DISC result for completed test
- Requires authentication or valid token

#### PDF Generation

**GET /api/pdf/[sessionId]**
- Generates PDF report for completed test
- Returns PDF file for download
- Requires authentication

## Data Models

### Database Schema

```sql
-- Users table (VX team members)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Test sessions table
CREATE TABLE test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  sent_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  selected_option INTEGER NOT NULL,
  disc_type VARCHAR(1) NOT NULL CHECK (disc_type IN ('D', 'I', 'S', 'C')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  score_d INTEGER NOT NULL,
  score_i INTEGER NOT NULL,
  score_s INTEGER NOT NULL,
  score_c INTEGER NOT NULL,
  dominant_profile VARCHAR(1) NOT NULL CHECK (dominant_profile IN ('D', 'I', 'S', 'C')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_test_sessions_token ON test_sessions(token);
CREATE INDEX idx_test_sessions_client_id ON test_sessions(client_id);
CREATE INDEX idx_test_sessions_status ON test_sessions(status);
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_results_session_id ON results(session_id);
```

### TypeScript Types

```typescript
// types/database.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TestSession {
  id: string;
  clientId: string;
  token: string;
  status: 'pending' | 'in_progress' | 'completed';
  sentAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: number;
  selectedOption: number;
  discType: DiscType;
  createdAt: Date;
}

export interface Result {
  id: string;
  sessionId: string;
  scoreD: number;
  scoreI: number;
  scoreS: number;
  scoreC: number;
  dominantProfile: DiscType;
  createdAt: Date;
}

export interface EmailLog {
  id: string;
  sessionId: string;
  recipientEmail: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  sentAt: Date;
}

// types/disc.ts (reused from MVP)
export type DiscType = 'D' | 'I' | 'S' | 'C';

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  text: string;
  discType: DiscType;
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface ProfileDescription {
  name: string;
  description: string;
  strengths: string[];
  communicationStyle: string;
  salesApproach: string;
}

export interface DISCResult {
  scores: DISCScores;
  dominant: DiscType;
  profile: ProfileDescription;
}
```

## Error Handling

### Error Types

```typescript
// types/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(502, `${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR');
  }
}
```

### Error Handling Strategy

1. **API Routes**: Wrap handlers in try-catch, return appropriate HTTP status codes
2. **Server Actions**: Return Result<T, Error> type for type-safe error handling
3. **Client Components**: Display user-friendly error messages with toast notifications
4. **Database Errors**: Log detailed errors, return generic messages to users
5. **Email Errors**: Log failures, allow retry, notify admin
6. **Validation Errors**: Return field-specific errors for form feedback

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // For validation errors
  };
}
```

## Testing Strategy

### Why Property-Based Testing Is Not Applicable

Property-based testing (PBT) is **not appropriate** for this feature because:

1. **Infrastructure-Heavy**: The system primarily involves database operations, authentication flows, email sending, and PDF generation - all external dependencies that don't benefit from property-based testing
2. **CRUD Operations**: Client and test session management are simple CRUD operations best tested with example-based tests
3. **UI Rendering**: Admin dashboard and client portal are UI-heavy features requiring snapshot tests and visual regression testing
4. **Side Effects**: Email sending, logging, and PDF generation are side-effect operations without meaningful return values to assert properties on
5. **Pure Logic Already Tested**: The only pure function (DISC calculator) is reused from the MVP where it has already been validated

**Testing Approach**: We will use **unit tests** for isolated functions, **integration tests** for API endpoints and database operations, and **end-to-end tests** for complete user workflows.

### Unit Testing

**Focus Areas**:
- Input validation functions (email format, phone format, required fields)
- Token generation and validation logic
- DISC calculation algorithm (reused from MVP, regression tests only)
- Email template rendering (snapshot tests)
- PDF structure validation (snapshot tests)
- Error handling and error message formatting

**Tools**: Jest + React Testing Library

**Example Tests**:
```typescript
describe('Validation', () => {
  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should validate phone number formats', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('+55 11 98765-4321')).toBe(true);
  });
});

describe('Token Generation', () => {
  it('should generate unique tokens of at least 32 characters', () => {
    const token1 = generateTestToken();
    const token2 = generateTestToken();
    expect(token1).toHaveLength(32);
    expect(token1).not.toBe(token2);
  });
});

describe('DISC Calculator (Regression)', () => {
  it('should calculate dominant D profile correctly', () => {
    const answers = createAnswers({ D: 7, I: 1, S: 1, C: 1 });
    const result = calculateDISC(answers);
    expect(result.dominant).toBe('D');
    expect(result.scores.D).toBe(70);
  });
});
```

### Integration Testing

**Focus Areas**:
- API endpoint request/response cycles
- Database CRUD operations with test database
- Authentication and authorization flows
- Email service integration (with mock SMTP)
- PDF generation end-to-end
- Error handling across layers

**Tools**: Jest + Supertest + Supabase test database + Mock email service

**Example Tests**:
```typescript
describe('POST /api/clients', () => {
  it('should create client and return ID', async () => {
    const response = await request(app)
      .post('/api/clients')
      .send({ name: 'Test Client', email: 'test@example.com', phone: '123456789' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');
  });

  it('should reject duplicate email', async () => {
    await createClient({ email: 'duplicate@example.com' });
    
    const response = await request(app)
      .post('/api/clients')
      .send({ name: 'Test', email: 'duplicate@example.com', phone: '123' })
      .expect(409);
    
    expect(response.body.error.code).toBe('CONFLICT_ERROR');
  });
});

describe('POST /api/tests/[id]/send', () => {
  it('should send email and update status to pending', async () => {
    const session = await createTestSession();
    
    const response = await request(app)
      .post(`/api/tests/${session.id}/send`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: session.client.email,
        subject: expect.stringContaining('DISC'),
      })
    );
    
    const updatedSession = await getTestSession(session.id);
    expect(updatedSession.status).toBe('pending');
  });
});

describe('Authentication', () => {
  it('should return 401 for unauthenticated admin requests', async () => {
    await request(app)
      .get('/api/clients')
      .expect(401);
  });

  it('should allow access with valid JWT', async () => {
    const token = await signIn('admin@vx.com', 'password');
    
    await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

### End-to-End Testing

**Focus Areas**:
- Complete user workflows from login to PDF generation
- Admin dashboard interactions (create client, send test, view results)
- Client test completion flow (access link, answer questions, view result)
- Cross-browser compatibility
- Mobile responsiveness
- Error recovery scenarios

**Tools**: Playwright

**Example Tests**:
```typescript
test('Admin workflow: create client and send test', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@vx.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // Create client
  await page.click('text=New Client');
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('input[name="phone"]', '+55 11 98765-4321');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Client created successfully')).toBeVisible();

  // Send test
  await page.click('button:has-text("Send Test")');
  await expect(page.locator('text=Test link sent')).toBeVisible();
});

test('Client workflow: complete test', async ({ page }) => {
  const testToken = await createTestSession();
  
  // Access test
  await page.goto(`/test/${testToken}`);
  await expect(page.locator('h1')).toContainText('DISC');

  // Answer all questions
  for (let i = 0; i < 10; i++) {
    await page.click('input[type="radio"]').first();
    await page.click('button:has-text("Next")');
  }

  // Submit and view result
  await page.click('button:has-text("Submit")');
  await expect(page.locator('text=Your Profile')).toBeVisible();
  await expect(page.locator('[data-testid="dominant-profile"]')).toBeVisible();
});

test('Generate PDF report', async ({ page }) => {
  await loginAsAdmin(page);
  const session = await createCompletedTestSession();
  
  await page.goto(`/tests/${session.id}`);
  
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Generate PDF")'),
  ]);
  
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
```

### Manual Testing Checklist

**Authentication & Authorization**:
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session and redirects to login
- [ ] Unauthenticated access to admin routes redirects to login
- [ ] Session persists across page refreshes

**Client Management**:
- [ ] Create client with all required fields
- [ ] Create client with duplicate email shows error
- [ ] Edit client updates information correctly
- [ ] Delete client shows confirmation dialog
- [ ] Search clients by name and email works
- [ ] Client list pagination works correctly

**Test Administration**:
- [ ] Send test email is received by client
- [ ] Test link in email is valid and accessible
- [ ] Resend test link uses same token
- [ ] Test status updates correctly (pending → in_progress → completed)
- [ ] Filter tests by status works

**Client Test Experience**:
- [ ] Test loads correctly on mobile devices
- [ ] Progress bar updates as questions are answered
- [ ] Navigation between questions works
- [ ] Answers are auto-saved
- [ ] Submit button only enabled when all questions answered
- [ ] Result displays correctly after submission

**Results & Reporting**:
- [ ] DISC scores display correctly in admin dashboard
- [ ] Profile description matches dominant type
- [ ] PDF generation completes successfully
- [ ] PDF includes all required sections (scores, profile, recommendations)
- [ ] PDF maintains VX brand identity (colors, logo)
- [ ] PDF downloads with correct filename

**Performance & Scalability**:
- [ ] Dashboard loads within 2 seconds
- [ ] Test interface responds immediately to interactions
- [ ] System handles 10 concurrent admin users
- [ ] System handles 100 concurrent client test sessions
- [ ] Database queries complete within 500ms

**Responsive Design**:
- [ ] Admin dashboard usable on tablet (768px)
- [ ] Client test fully functional on mobile (320px)
- [ ] Touch targets are at least 44px on mobile
- [ ] Text is readable on all screen sizes
- [ ] No horizontal scrolling on any device

**Error Handling**:
- [ ] Invalid test token shows user-friendly error
- [ ] Network errors display retry option
- [ ] Form validation errors are clear and specific
- [ ] Email sending failures are logged and reported
- [ ] PDF generation errors show helpful message

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_SIZE=10

# Authentication
NEXTAUTH_URL=https://disc.vxconsultoria.com
NEXTAUTH_SECRET=<generated-secret>

# Email
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=noreply@vxconsultoria.com

# Application
NODE_ENV=production
```

### Vercel Deployment

1. **Connect Repository**: Link GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required env vars in Vercel dashboard
3. **Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**: Automatic deployment on push to main branch

### Database Setup

1. **Create Supabase Project**: Set up new project in Supabase dashboard
2. **Run Migrations**: Execute SQL schema from Data Models section
3. **Create Admin User**: Insert initial VX team member with hashed password
4. **Configure Connection Pooling**: Enable in Supabase settings

### Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Send test email
- [ ] Generate test PDF
- [ ] Check error logging
- [ ] Monitor performance metrics
- [ ] Set up domain and SSL certificate

## Security Considerations

### Authentication & Authorization

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens with 7-day expiration
- HTTP-only cookies for session storage
- CSRF protection via NextAuth
- Admin routes protected by middleware

### Data Protection

- All API requests over HTTPS
- Input sanitization to prevent SQL injection
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- Test tokens are cryptographically secure (crypto.randomBytes)
- Client data access restricted to authenticated users only

### Privacy

- No client data shared between sessions
- Email addresses validated and stored securely
- Test results only accessible via authenticated admin or valid token
- Soft delete for clients (preserves audit trail)

## Performance Optimization

### Database

- Indexes on frequently queried fields (email, token, status)
- Connection pooling (max 10 connections)
- Prepared statements for all queries
- Pagination for large result sets (20 items per page)

### Caching

- Static assets cached by Vercel CDN
- Questions and profiles cached in memory (rarely change)
- API responses cached with appropriate headers
- PDF generation cached for 1 hour per session

### Frontend

- Server Components for initial page loads
- Client Components only where interactivity needed
- Image optimization with Next.js Image component
- Code splitting by route
- Lazy loading for PDF viewer

### Monitoring

- Error logging with Vercel Analytics
- Performance monitoring with Web Vitals
- Database query performance tracking
- Email delivery rate monitoring

## Future Enhancements

### Phase 2 Features

- Multi-language support (Portuguese, English, Spanish)
- Bulk client import via CSV
- Scheduled test reminders
- Custom branding per client
- Advanced analytics dashboard
- Team collaboration features
- API for third-party integrations

### Scalability Improvements

- Redis caching layer
- Background job queue for email sending
- CDN for PDF storage
- Database read replicas
- Horizontal scaling with load balancer

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-XX  
**Author**: VX Development Team
