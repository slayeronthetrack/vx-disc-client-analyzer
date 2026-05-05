# Implementation Plan: VX DISC Client Analyzer

## Overview

This implementation plan transforms the existing DISC test MVP (disc-app/) into a full-featured client management and behavioral assessment platform. The approach prioritizes infrastructure setup, authentication, core CRUD operations, test administration, and reporting features. We'll reuse validated components from the MVP (UI components, DISC algorithm, questions, profiles) to accelerate development while building new admin and client management capabilities.

**Technology Stack**: Next.js 14 (App Router), TypeScript, TailwindCSS, NextAuth.js, Supabase (PostgreSQL), Resend (email), @react-pdf/renderer

**Key Priorities**:
1. Database schema and infrastructure
2. Authentication system for VX team
3. Client management (CRUD)
4. Test session management and email delivery
5. Public test interface
6. Results visualization and PDF generation
7. Dashboard metrics

## Tasks

### 1. Project Setup and Infrastructure

- [x] 1.1 Initialize Next.js 14 project with TypeScript and App Router
  - Create new Next.js project with `npx create-next-app@latest`
  - Configure TypeScript, ESLint, and TailwindCSS
  - Set up project structure following design architecture
  - _Requirements: 19.1, 19.5, 20.2_

- [x] 1.2 Configure TailwindCSS with VX brand identity
  - Copy tailwind.config.ts from disc-app/ with VX colors (#F7971E, #0B0F14, #1A1F26, #8B92A0)
  - Configure Inter font family
  - Set up global styles in app/globals.css
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6, 19.5_

- [x] 1.3 Set up Supabase database and create schema
  - Create Supabase project and obtain connection URL
  - Execute SQL schema for users, clients, test_sessions, answers, results, email_logs tables
  - Create indexes on email, token, status, client_id, session_id fields
  - Configure connection pooling (max 10 connections)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 20.5_

- [x] 1.4 Create database client and TypeScript types
  - Install @supabase/supabase-js
  - Create lib/db.ts with Supabase client configuration
  - Create types/database.ts with User, Client, TestSession, Answer, Result, EmailLog interfaces
  - Create types/disc.ts (copy from disc-app/types/disc.ts)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 19.3_

- [x] 1.5 Copy reusable data and utilities from MVP
  - Copy data/questions.ts from disc-app/ (10 DISC questions)
  - Copy data/profiles.ts from disc-app/ (profile descriptions)
  - Copy utils/calculateDISC.ts from disc-app/ (DISC algorithm)
  - _Requirements: 6.7, 8.7, 19.1, 19.2, 19.3_

- [ ]* 1.6 Write unit tests for DISC calculator (regression tests)
  - Test dominant D profile calculation
  - Test dominant I profile calculation
  - Test dominant S profile calculation
  - Test dominant C profile calculation
  - Test percentage score calculations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

### 2. Authentication System

- [x] 2.1 Install and configure NextAuth.js v5
  - Install next-auth@beta and bcryptjs
  - Create lib/auth.ts with NextAuth configuration
  - Configure Credentials provider for email/password authentication
  - Set up JWT strategy with 7-day expiration
  - _Requirements: 1.1, 1.4, 16.1_

- [x] 2.2 Create authentication API route
  - Create app/api/auth/[...nextauth]/route.ts
  - Implement signIn callback with database user lookup
  - Implement password verification with bcrypt
  - Configure session callback to include user data
  - _Requirements: 1.2, 1.3, 16.1_

- [x] 2.3 Create authentication middleware
  - Create middleware.ts to protect admin routes
  - Redirect unauthenticated users to /login
  - Allow public access to /test/[token] routes
  - _Requirements: 1.6, 16.6_

- [x] 2.4 Create login page and form component
  - Create app/(auth)/login/page.tsx with login form
  - Implement email and password inputs with validation
  - Add submit button with loading state
  - Display error messages for invalid credentials
  - Redirect to /dashboard on successful login
  - _Requirements: 1.1, 1.2, 1.3, 14.1, 14.5_

- [x] 2.5 Create logout functionality
  - Implement logout button in admin layout
  - Call NextAuth signOut() function
  - Redirect to /login after logout
  - _Requirements: 1.5_

- [ ]* 2.6 Write integration tests for authentication flow
  - Test successful login with valid credentials
  - Test failed login with invalid credentials
  - Test session persistence across requests
  - Test logout clears session
  - Test unauthenticated access redirects to login
  - _Requirements: 1.2, 1.3, 1.5, 1.6_

### 3. UI Components Library

- [x] 3.1 Copy and adapt UI components from MVP
  - Copy components/ui/Button.tsx from disc-app/
  - Copy components/ui/Card.tsx from disc-app/
  - Copy components/ui/Logo.tsx from disc-app/
  - Copy components/ui/ProgressBar.tsx from disc-app/
  - Ensure all components use VX brand colors
  - _Requirements: 14.1, 14.2, 14.3, 14.5, 19.4_

- [x] 3.2 Create additional admin UI components
  - Create components/ui/Loading.tsx (spinner with VX colors)
  - Create components/ui/MetricCard.tsx (dashboard metrics display)
  - Create components/admin/Sidebar.tsx (admin navigation)
  - Create components/admin/TestStatusBadge.tsx (status indicator)
  - _Requirements: 14.1, 14.2, 18.3_

- [x] 3.3 Create admin layout with sidebar
  - Create app/(admin)/layout.tsx with sidebar navigation
  - Include VX logo in header
  - Add navigation links: Dashboard, Clients, Tests
  - Add logout button
  - Make responsive for tablet and desktop
  - _Requirements: 14.5, 17.2_

### 4. Client Management - CRUD Operations

- [x] 4.1 Create client registration form
  - Create app/(admin)/clients/new/page.tsx
  - Add form fields: name (required), email (required), phone (required), company (optional)
  - Implement client-side validation for email and phone formats
  - Add submit button with loading state
  - _Requirements: 2.1, 2.2, 2.3, 2.7_

- [x] 4.2 Create validation utilities
  - Create utils/validation.ts
  - Implement validateEmail() function with regex
  - Implement validatePhone() function with regex
  - Implement validateRequired() function
  - _Requirements: 2.6, 2.7, 12.7, 16.3_

- [ ]* 4.3 Write unit tests for validation functions
  - Test validateEmail with valid and invalid formats
  - Test validatePhone with valid and invalid formats
  - Test validateRequired with empty and non-empty values
  - _Requirements: 2.6, 2.7_

- [x] 4.4 Create client API endpoints
  - Create app/api/clients/route.ts with GET and POST handlers
  - Implement POST: validate input, check duplicate email, insert to database
  - Implement GET: fetch all clients with pagination (20 per page)
  - Add authentication check using NextAuth getServerSession
  - Return appropriate error responses (400, 409, 500)
  - _Requirements: 2.2, 2.4, 2.5, 12.2, 12.3, 15.1, 16.3_

- [x] 4.5 Create client detail and edit endpoints
  - Create app/api/clients/[id]/route.ts with GET, PUT, DELETE handlers
  - Implement GET: fetch client with test history
  - Implement PUT: validate input, update client information
  - Implement DELETE: soft delete client and cascade to test sessions
  - _Requirements: 10.1, 12.1, 12.2, 12.3, 12.4, 12.5, 15.5_

- [ ]* 4.6 Write integration tests for client API
  - Test POST /api/clients creates client successfully
  - Test POST /api/clients rejects duplicate email
  - Test GET /api/clients returns paginated list
  - Test PUT /api/clients/[id] updates client
  - Test DELETE /api/clients/[id] soft deletes client
  - Test all endpoints require authentication
  - _Requirements: 2.4, 2.5, 12.2, 12.3, 12.4_

- [x] 4.7 Create client list page with table
  - Create app/(admin)/clients/page.tsx
  - Create components/admin/ClientTable.tsx
  - Display columns: name, email, phone, company, test count, last test date
  - Add search input for filtering by name or email
  - Add pagination controls
  - Add "New Client" button linking to /clients/new
  - _Requirements: 7.2, 7.6, 12.1_

- [x] 4.8 Create client detail page
  - Create app/(admin)/clients/[id]/page.tsx
  - Display client information (name, email, phone, company, created date)
  - Display test history table (date, status, dominant profile)
  - Add "Edit" button linking to /clients/[id]/edit
  - Add "Delete" button with confirmation dialog
  - Add "Send New Test" button
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 12.1, 12.4, 12.5, 12.6_

- [x] 4.9 Create client edit page
  - Create app/(admin)/clients/[id]/edit/page.tsx
  - Pre-populate form with existing client data
  - Reuse validation from client registration
  - Add "Save" and "Cancel" buttons
  - _Requirements: 12.1, 12.2, 12.3, 12.7_

### 5. Test Session Management

- [x] 5.1 Create test token generation utility
  - Create lib/tokens.ts
  - Implement generateTestToken() using crypto.randomBytes(32)
  - Ensure tokens are URL-safe (base64url encoding)
  - _Requirements: 3.1, 3.2, 16.7_

- [ ]* 5.2 Write unit tests for token generation
  - Test tokens are at least 32 characters
  - Test tokens are unique (generate 1000, check no duplicates)
  - Test tokens are URL-safe (no special characters)
  - _Requirements: 3.2_

- [x] 5.3 Create test session API endpoints
  - Create app/api/tests/route.ts with GET and POST handlers
  - Implement POST: create test session, generate token, associate with client
  - Implement GET: fetch test sessions with filters (status, clientId) and pagination
  - Add authentication check
  - _Requirements: 3.1, 3.3, 3.4, 7.1, 7.5, 15.2_

- [x] 5.4 Create test session detail endpoint
  - Create app/api/tests/[id]/route.ts with GET handler
  - Fetch test session with client info and result (if completed)
  - Allow access with authentication OR valid token query parameter
  - _Requirements: 3.5, 8.1_

- [ ]* 5.5 Write integration tests for test session API
  - Test POST /api/tests creates session with unique token
  - Test GET /api/tests returns filtered and paginated sessions
  - Test GET /api/tests/[id] returns session details
  - Test token validation logic
  - _Requirements: 3.1, 3.4, 3.5, 7.1_

### 6. Email Service Integration

- [x] 6.1 Install and configure Resend
  - Install resend package
  - Create lib/email.ts with Resend client
  - Configure API key from environment variable
  - _Requirements: 4.1, 20.2_

- [x] 6.2 Create email template for test invitation
  - Create components/email/TestInvitationEmail.tsx
  - Include VX logo and brand colors
  - Include personalized greeting with client name
  - Include test instructions
  - Include unique test URL with token
  - Format as HTML email
  - _Requirements: 4.2, 4.3, 4.4, 14.1, 14.2, 14.5_

- [x] 6.3 Create send email API endpoint
  - Create app/api/tests/[id]/send/route.ts with POST handler
  - Fetch test session and client data
  - Render email template with test URL
  - Send email using Resend
  - Update test_sessions.sent_at and status to 'pending'
  - Log email attempt in email_logs table
  - Return success or error response
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 15.2_

- [x] 6.4 Implement resend email functionality
  - Reuse same endpoint for resending
  - Check test status is 'pending' or 'in_progress'
  - Add note in email indicating this is a resent link
  - Log resend action with timestamp
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 6.5 Write integration tests for email service
  - Test email is sent with correct recipient and content
  - Test test status updates to 'pending' after send
  - Test email failure is logged correctly
  - Test resend uses same token
  - _Requirements: 4.5, 4.6, 4.7, 13.1, 13.2_

### 7. Test Sessions List and Management

- [x] 7.1 Create test sessions list page
  - Create app/(admin)/tests/page.tsx
  - Create components/admin/TestSessionTable.tsx
  - Display columns: client name, email, status, sent date, completed date
  - Add status filter dropdown (all, pending, in_progress, completed)
  - Add search input for client name or email
  - Add pagination controls
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 7.2 Add real-time status updates to test list
  - Implement polling or use Supabase real-time subscriptions
  - Update table when test status changes
  - Show visual indicator for status changes
  - _Requirements: 7.7_

- [x] 7.3 Add action buttons to test table
  - Add "View Result" button for completed tests
  - Add "Resend Link" button for pending/in_progress tests
  - Add "Generate PDF" button for completed tests
  - Implement click handlers calling appropriate API endpoints
  - _Requirements: 8.1, 9.1, 13.1_

### 8. Public Test Interface

- [x] 8.1 Create public test page with token validation
  - Create app/test/[token]/page.tsx
  - Validate token on page load by calling API
  - Display error page for invalid tokens
  - Display welcome page with VX logo and instructions for valid tokens
  - _Requirements: 3.5, 3.6, 5.1, 5.2, 5.3, 14.5_

- [x] 8.2 Create test question component
  - Create components/test/TestQuestion.tsx
  - Display question text and options as radio buttons
  - Highlight selected option
  - Ensure touch-friendly controls (44px minimum)
  - _Requirements: 5.5, 17.4_

- [x] 8.3 Create test progress component
  - Create components/test/TestProgress.tsx
  - Display progress bar showing completion percentage (X/10 questions)
  - Display current question number
  - _Requirements: 5.6_

- [x] 8.4 Implement test flow and navigation
  - Display questions one at a time
  - Add "Previous" and "Next" buttons for navigation
  - Enable "Next" only when current question is answered
  - Enable "Submit" button only when all 10 questions are answered
  - Update test status to 'in_progress' when first question is answered
  - _Requirements: 5.4, 5.5, 5.7, 5.9_

- [x] 8.5 Implement answer persistence
  - Create app/api/tests/[id]/answers/route.ts with POST handler
  - Accept answer data: questionId, selectedOption, discType
  - Insert answer into answers table
  - Allow public access with valid token
  - _Requirements: 5.8, 15.4_

- [x] 8.6 Auto-save answers as user progresses
  - Call answer API endpoint when user selects an option
  - Show saving indicator
  - Handle network errors gracefully with retry
  - _Requirements: 5.8, 18.4_

- [x] 8.7 Implement test submission and result calculation
  - On submit, call API to calculate DISC result
  - Use calculateDISC() utility from MVP
  - Store result in results table
  - Update test status to 'completed'
  - Redirect to result page
  - _Requirements: 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 15.3_

- [ ]* 8.8 Write integration tests for test flow
  - Test token validation accepts valid tokens
  - Test token validation rejects invalid tokens
  - Test answers are saved correctly
  - Test status updates from pending → in_progress → completed
  - Test DISC result is calculated and stored
  - _Requirements: 3.5, 3.6, 5.4, 5.8, 6.6_

- [x] 8.9 Make test interface fully responsive
  - Test on mobile devices (320px width)
  - Ensure all touch targets are at least 44px
  - Optimize font sizes for readability
  - Test on tablet and desktop
  - _Requirements: 5.10, 17.1, 17.3, 17.4, 17.5_

### 9. Checkpoint - Test Core Functionality

- [x] 9.1 Checkpoint: Verify end-to-end test flow
  - Ensure all tests pass, ask the user if questions arise.
  - Manually test: create client → send test → complete test → view result
  - Verify email delivery works
  - Verify DISC calculation is correct
  - Verify status updates correctly

### 10. Results Visualization

- [x] 10.1 Create DISC result view component
  - Create components/admin/DISCResultView.tsx
  - Display dominant profile with large heading
  - Display percentage scores for all four types (D, I, S, C)
  - Use ProgressBar component for visual score representation
  - Display profile description from profiles.ts
  - _Requirements: 8.2, 8.3, 8.4, 8.7_

- [x] 10.2 Create DISC chart component
  - Create components/admin/DISCChart.tsx
  - Display bar chart or radar chart of DISC scores
  - Use VX brand colors for visualization
  - Make responsive for different screen sizes
  - _Requirements: 8.3, 14.1, 14.2_

- [x] 10.3 Create test result detail page
  - Create app/(admin)/tests/[id]/page.tsx
  - Display client name and test completion date
  - Display DISCResultView component
  - Display profile strengths, communication style, sales approach
  - Add "Generate PDF" button
  - Add "Back to Tests" link
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 10.4 Create public result page for clients
  - Create app/test/[token]/result/page.tsx
  - Display same result view as admin but without admin actions
  - Allow access with valid token
  - Display VX logo and branding
  - _Requirements: 5.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 14.5_

### 11. PDF Report Generation

- [x] 11.1 Install and configure @react-pdf/renderer
  - Install @react-pdf/renderer
  - Create lib/pdf.ts with PDF generation utilities
  - _Requirements: 9.1_

- [x] 11.2 Create PDF report template component
  - Create components/pdf/PDFReport.tsx
  - Design professional layout with VX logo and colors (#F7971E, #0B0F14)
  - Include header with VX branding
  - Include client name and test completion date
  - Include dominant profile section with description
  - Include DISC scores visualization (bar chart or table)
  - Include profile strengths section
  - Include communication style section
  - Include sales approach section
  - Use proper typography and spacing
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 11.3 Create PDF generation API endpoint
  - Create app/api/pdf/[sessionId]/route.ts with GET handler
  - Fetch test session, client, and result data
  - Render PDFReport component to PDF buffer
  - Set appropriate headers for PDF download
  - Set filename as "DISC-Report-{ClientName}-{Date}.pdf"
  - Require authentication
  - _Requirements: 9.1, 9.10, 16.6_

- [x] 11.4 Add PDF generation button to result pages
  - Add "Generate PDF" button to admin test result page
  - Trigger PDF download on click
  - Show loading indicator during generation
  - Handle errors gracefully
  - _Requirements: 9.1, 9.10, 18.5_

- [ ]* 11.5 Write integration tests for PDF generation
  - Test PDF is generated successfully for completed test
  - Test PDF contains all required sections
  - Test PDF filename is correct
  - Test PDF generation requires authentication
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

### 12. Dashboard and Metrics

- [x] 12.1 Create dashboard metrics calculation
  - Create lib/metrics.ts
  - Implement getTotalClients() query
  - Implement getTotalTests() query
  - Implement getCompletedTests() query
  - Implement getPendingTests() query
  - Implement calculateCompletionRate()
  - Implement getProfileDistribution() query (count by dominant_profile)
  - Add date filter for last 30 days
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 12.2 Create dashboard API endpoint
  - Create app/api/dashboard/route.ts with GET handler
  - Fetch all metrics using lib/metrics.ts functions
  - Return metrics as JSON
  - Require authentication
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 12.3 Create dashboard page
  - Create app/(admin)/dashboard/page.tsx
  - Display MetricCard for each metric (total clients, total tests, completed, pending, completion rate)
  - Display profile distribution chart (bar chart or pie chart)
  - Add date range selector (last 7 days, 30 days, all time)
  - Make responsive for tablet and desktop
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 17.2_

- [x] 12.4 Implement real-time metrics updates
  - Refresh metrics when new data is available
  - Use polling or Supabase real-time subscriptions
  - Show loading state during refresh
  - _Requirements: 11.8_

### 13. Error Handling and User Feedback

- [x] 13.1 Create error handling utilities
  - Create types/errors.ts with error classes (AppError, ValidationError, AuthenticationError, etc.)
  - Create lib/errorHandler.ts with error formatting functions
  - Implement error logging for server-side errors
  - _Requirements: 16.3, 18.2_

- [x] 13.2 Create toast notification component
  - Create components/ui/Toast.tsx
  - Support success, error, info, warning types
  - Auto-dismiss success messages after 5 seconds
  - Require manual dismissal for errors
  - Use VX brand colors
  - _Requirements: 18.1, 18.2, 18.6, 18.7, 14.1, 14.2_

- [x] 13.3 Add error boundaries to catch React errors
  - Create app/error.tsx for global error boundary
  - Display user-friendly error message
  - Log error details for debugging
  - Provide "Try Again" button
  - _Requirements: 18.2_

- [x] 13.4 Add loading states to all async operations
  - Add loading spinners to forms during submission
  - Add loading indicators to data fetching
  - Add progress indicators to PDF generation
  - Disable buttons during loading
  - _Requirements: 18.3, 18.4, 18.5_

- [x] 13.5 Add confirmation dialogs for destructive actions
  - Add confirmation dialog for client deletion
  - Add confirmation dialog for test session deletion
  - Display clear warning message
  - Require explicit confirmation
  - _Requirements: 12.6_

### 14. Security Hardening

- [x] 14.1 Implement password hashing for admin users
  - Use bcrypt with cost factor 12
  - Hash passwords before storing in database
  - Verify passwords during login
  - _Requirements: 16.1_

- [x] 14.2 Implement rate limiting on authentication
  - Install rate limiting middleware
  - Limit login attempts to 5 per 15 minutes per IP
  - Return 429 status code when limit exceeded
  - Log rate limit violations
  - _Requirements: 16.4, 16.5_

- [x] 14.3 Add input sanitization to all API endpoints
  - Sanitize all user inputs to prevent SQL injection
  - Validate all inputs against expected formats
  - Use parameterized queries for database operations
  - _Requirements: 16.3_

- [x] 14.4 Configure HTTPS and secure headers
  - Ensure all requests use HTTPS in production
  - Set secure headers (HSTS, X-Frame-Options, CSP)
  - Configure NextAuth for secure cookies (httpOnly, secure, sameSite)
  - _Requirements: 16.2, 16.7_

- [x] 14.5 Implement CSRF protection
  - Enable CSRF protection in NextAuth
  - Validate CSRF tokens on all state-changing requests
  - _Requirements: 16.1_

- [ ]* 14.6 Write security tests
  - Test SQL injection prevention
  - Test XSS prevention
  - Test CSRF protection
  - Test rate limiting
  - Test authentication bypass attempts
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

### 15. Testing and Quality Assurance

- [ ]* 15.1 Set up testing infrastructure
  - Install Jest and React Testing Library
  - Configure test database (Supabase test project)
  - Set up test environment variables
  - Create test utilities and helpers

- [ ]* 15.2 Write unit tests for utilities
  - Test validation functions (email, phone, required)
  - Test token generation
  - Test DISC calculator (regression tests)
  - Test error handling utilities

- [ ]* 15.3 Write integration tests for API endpoints
  - Test authentication flow
  - Test client CRUD operations
  - Test test session operations
  - Test email sending
  - Test PDF generation
  - Test all endpoints require proper authentication

- [ ]* 15.4 Write end-to-end tests with Playwright
  - Install Playwright
  - Test admin workflow: login → create client → send test → view result → generate PDF
  - Test client workflow: access test → answer questions → view result
  - Test error scenarios: invalid token, network errors, validation errors
  - Test responsive design on mobile and tablet

- [ ]* 15.5 Perform manual testing
  - Follow manual testing checklist from design document
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on multiple devices (mobile, tablet, desktop)
  - Test all user workflows end-to-end
  - Document any bugs found

### 16. Deployment and Production Setup

- [x] 16.1 Configure environment variables
  - Set up .env.local for local development
  - Document all required environment variables
  - Set up environment variables in Vercel dashboard
  - _Requirements: 20.2_

- [x] 16.2 Create initial admin user in database
  - Write SQL script to insert admin user with hashed password
  - Execute script in Supabase production database
  - Test login with admin credentials
  - _Requirements: 1.1, 1.2_

- [x] 16.3 Deploy to Vercel
  - Connect GitHub repository to Vercel
  - Configure build settings (Next.js framework, npm run build)
  - Add environment variables in Vercel dashboard
  - Deploy to production
  - _Requirements: 20.1, 20.2_

- [x] 16.4 Verify production deployment
  - Test authentication flow in production
  - Test email sending in production
  - Test PDF generation in production
  - Test database connections
  - Monitor error logs
  - _Requirements: 20.1, 20.3, 20.4_

- [x] 16.5 Set up monitoring and logging
  - Enable Vercel Analytics
  - Set up error logging (Sentry or similar)
  - Monitor database performance
  - Monitor email delivery rates
  - Set up alerts for critical errors
  - _Requirements: 20.3, 20.4, 20.5_

- [x] 16.6 Optimize performance
  - Enable caching for static assets
  - Implement database query optimization
  - Enable connection pooling
  - Test performance under load (100 concurrent users)
  - _Requirements: 20.3, 20.4, 20.5, 20.6_

### 17. Final Checkpoint and Documentation

- [x] 17.1 Final checkpoint: Complete system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are implemented
  - Verify all features work end-to-end
  - Verify responsive design on all devices
  - Verify security measures are in place
  - Verify performance meets requirements

- [x] 17.2 Create user documentation
  - Write admin user guide (how to create clients, send tests, view results, generate PDFs)
  - Write deployment guide
  - Document environment variables
  - Document database schema
  - Create troubleshooting guide

- [x] 17.3 Create developer documentation
  - Document API endpoints
  - Document database schema and relationships
  - Document component architecture
  - Document testing strategy
  - Add inline code comments

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints (9.1, 17.1) ensure incremental validation before proceeding
- The implementation reuses validated MVP components to accelerate development
- All tasks are designed to be executed by a coding agent with access to the codebase
- Testing tasks are comprehensive but optional to allow flexible development pace
- Security and performance tasks are integrated throughout rather than deferred to the end
