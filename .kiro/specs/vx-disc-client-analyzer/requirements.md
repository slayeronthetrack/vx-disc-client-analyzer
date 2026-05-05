# Requirements Document - VX DISC Client Analyzer

## Introduction

O **VX DISC Client Analyzer** é um sistema de gestão interno que permite à equipe VX Consultoria aplicar, gerenciar e analisar testes DISC para clientes, leads e equipes de forma controlada e profissional. O sistema evolui o MVP público atual (disc-app/) para uma plataforma completa de gestão com autenticação, controle de acesso, geração de relatórios e histórico de testes.

O objetivo é transformar o teste DISC em uma ferramenta estratégica de qualificação de leads e análise comportamental, permitindo que a VX acompanhe o perfil comportamental de seus clientes ao longo do tempo e gere relatórios profissionais personalizados.

## Glossary

- **VX_System**: O sistema completo VX DISC Client Analyzer
- **Admin_Dashboard**: Interface administrativa para a equipe VX
- **Client_Portal**: Interface pública onde clientes respondem ao teste
- **VX_Team_Member**: Membro da equipe VX com acesso administrativo
- **Client**: Pessoa cadastrada pela VX para realizar o teste DISC
- **Test_Session**: Uma instância de teste DISC associada a um cliente
- **Test_Token**: Token único e seguro que identifica uma sessão de teste
- **DISC_Result**: Resultado calculado do teste contendo perfil e pontuações
- **PDF_Report**: Relatório profissional em PDF com identidade visual VX
- **Test_Status**: Estado atual do teste (pending, in_progress, completed)
- **Authentication_System**: Sistema de autenticação para VX_Team_Members
- **Database**: Banco de dados que armazena clientes, testes e resultados
- **DISC_Calculator**: Algoritmo que calcula o perfil DISC baseado nas respostas
- **Email_Service**: Serviço que envia emails com links de teste
- **PDF_Generator**: Componente que gera relatórios em PDF

## Requirements

### Requirement 1: Autenticação da Equipe VX

**User Story:** Como membro da equipe VX, eu quero fazer login no sistema de forma segura, para que apenas pessoas autorizadas possam gerenciar clientes e testes.

#### Acceptance Criteria

1. THE Authentication_System SHALL provide email and password authentication for VX_Team_Members
2. WHEN a VX_Team_Member submits valid credentials, THE Authentication_System SHALL grant access to the Admin_Dashboard
3. WHEN a VX_Team_Member submits invalid credentials, THE Authentication_System SHALL display an error message and deny access
4. THE Authentication_System SHALL maintain session state for authenticated VX_Team_Members
5. WHEN a VX_Team_Member logs out, THE Authentication_System SHALL terminate the session and redirect to the login page
6. THE Authentication_System SHALL protect all Admin_Dashboard routes from unauthenticated access

### Requirement 2: Cadastro de Clientes

**User Story:** Como membro da equipe VX, eu quero cadastrar clientes no sistema, para que eu possa enviar testes DISC personalizados para cada um.

#### Acceptance Criteria

1. WHEN a VX_Team_Member is authenticated, THE Admin_Dashboard SHALL display a client registration form
2. THE VX_System SHALL require name, email, and phone number for each Client
3. WHERE a company name is provided, THE VX_System SHALL store it as optional information
4. WHEN a VX_Team_Member submits a valid client form, THE Database SHALL store the Client information
5. WHEN a VX_Team_Member submits a client form with duplicate email, THE VX_System SHALL display an error message
6. THE VX_System SHALL validate email format before storing Client information
7. THE VX_System SHALL validate phone number format before storing Client information

### Requirement 3: Geração de Links Únicos de Teste

**User Story:** Como membro da equipe VX, eu quero gerar links únicos de teste para cada cliente, para que cada cliente tenha acesso exclusivo ao seu próprio teste.

#### Acceptance Criteria

1. WHEN a Client is registered, THE VX_System SHALL generate a unique Test_Token
2. THE Test_Token SHALL be cryptographically secure and contain at least 32 characters
3. THE VX_System SHALL create a unique URL containing the Test_Token
4. THE VX_System SHALL associate the Test_Token with the Client and Test_Session
5. WHEN a Test_Token is accessed, THE VX_System SHALL validate it exists in the Database
6. WHEN an invalid Test_Token is accessed, THE VX_System SHALL display an error message
7. THE Test_Token SHALL remain valid until the test is completed or manually invalidated

### Requirement 4: Envio de Links por Email

**User Story:** Como membro da equipe VX, eu quero enviar o link do teste por email para o cliente, para que ele possa acessar o teste facilmente.

#### Acceptance Criteria

1. WHEN a VX_Team_Member requests to send a test link, THE Email_Service SHALL send an email to the Client email address
2. THE Email_Service SHALL include the unique test URL in the email body
3. THE Email_Service SHALL use VX brand identity in the email template
4. THE Email_Service SHALL include test instructions in the email
5. WHEN the email is sent successfully, THE VX_System SHALL update the Test_Status to pending
6. WHEN the email fails to send, THE VX_System SHALL display an error message to the VX_Team_Member
7. THE VX_System SHALL log all email sending attempts with timestamp and status

### Requirement 5: Interface Pública do Teste

**User Story:** Como cliente, eu quero acessar o teste através do link recebido, para que eu possa responder às perguntas DISC de forma simples e intuitiva.

#### Acceptance Criteria

1. WHEN a Client accesses a valid Test_Token URL, THE Client_Portal SHALL display the test welcome page
2. THE Client_Portal SHALL display VX logo and brand identity
3. THE Client_Portal SHALL display test instructions before starting
4. WHEN a Client starts the test, THE VX_System SHALL update Test_Status to in_progress
5. THE Client_Portal SHALL display 10 DISC questions sequentially
6. THE Client_Portal SHALL display a progress bar showing completion percentage
7. THE Client_Portal SHALL allow navigation to previous questions
8. THE Client_Portal SHALL persist answers in the Database as they are submitted
9. WHEN all 10 questions are answered, THE Client_Portal SHALL enable test submission
10. THE Client_Portal SHALL be responsive and work on mobile devices

### Requirement 6: Cálculo Automático de Resultados

**User Story:** Como sistema, eu quero calcular automaticamente o perfil DISC do cliente, para que o resultado seja preciso e imediato após a conclusão do teste.

#### Acceptance Criteria

1. WHEN a Client submits all 10 answers, THE DISC_Calculator SHALL calculate the DISC scores
2. THE DISC_Calculator SHALL count responses for each DISC type (D, I, S, C)
3. THE DISC_Calculator SHALL convert counts to percentages for each DISC type
4. THE DISC_Calculator SHALL identify the dominant DISC profile
5. THE DISC_Calculator SHALL store the DISC_Result in the Database
6. WHEN calculation is complete, THE VX_System SHALL update Test_Status to completed
7. THE DISC_Calculator SHALL use the same algorithm as the current MVP (disc-app/)

### Requirement 7: Acompanhamento de Status de Testes

**User Story:** Como membro da equipe VX, eu quero visualizar o status de todos os testes enviados, para que eu possa acompanhar quem já respondeu e quem está pendente.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a list of all Test_Sessions
2. THE Admin_Dashboard SHALL display Client name, email, and Test_Status for each test
3. THE Admin_Dashboard SHALL display the date when the test link was sent
4. WHERE a test is completed, THE Admin_Dashboard SHALL display the completion date
5. THE Admin_Dashboard SHALL allow filtering by Test_Status (pending, in_progress, completed)
6. THE Admin_Dashboard SHALL allow searching by Client name or email
7. THE Admin_Dashboard SHALL update Test_Status in real-time when changes occur

### Requirement 8: Visualização de Resultados DISC

**User Story:** Como membro da equipe VX, eu quero visualizar os resultados DISC de cada cliente, para que eu possa entender o perfil comportamental e preparar recomendações.

#### Acceptance Criteria

1. WHEN a VX_Team_Member selects a completed test, THE Admin_Dashboard SHALL display the DISC_Result
2. THE Admin_Dashboard SHALL display the dominant DISC profile (D, I, S, C)
3. THE Admin_Dashboard SHALL display percentage scores for all four DISC types
4. THE Admin_Dashboard SHALL display profile strengths from the profile description
5. THE Admin_Dashboard SHALL display communication style recommendations
6. THE Admin_Dashboard SHALL display sales approach recommendations
7. THE Admin_Dashboard SHALL use the same profile descriptions as the current MVP

### Requirement 9: Geração de Relatórios em PDF

**User Story:** Como membro da equipe VX, eu quero gerar relatórios profissionais em PDF, para que eu possa entregar um documento formal ao cliente com seu perfil DISC.

#### Acceptance Criteria

1. WHEN a VX_Team_Member requests a PDF report for a completed test, THE PDF_Generator SHALL create a PDF_Report
2. THE PDF_Report SHALL include VX logo and brand identity (orange #F7971E and black #0B0F14)
3. THE PDF_Report SHALL include Client name and test completion date
4. THE PDF_Report SHALL include the dominant DISC profile with description
5. THE PDF_Report SHALL include percentage scores for all four DISC types
6. THE PDF_Report SHALL include profile strengths
7. THE PDF_Report SHALL include communication style recommendations
8. THE PDF_Report SHALL include sales approach recommendations
9. THE PDF_Report SHALL be formatted professionally with proper typography and spacing
10. WHEN PDF generation is complete, THE VX_System SHALL allow download of the PDF_Report

### Requirement 10: Histórico de Testes por Cliente

**User Story:** Como membro da equipe VX, eu quero visualizar o histórico de testes de um cliente, para que eu possa acompanhar a evolução do perfil comportamental ao longo do tempo.

#### Acceptance Criteria

1. WHEN a VX_Team_Member views a Client profile, THE Admin_Dashboard SHALL display all Test_Sessions for that Client
2. THE Admin_Dashboard SHALL display tests in chronological order (most recent first)
3. THE Admin_Dashboard SHALL display test date and Test_Status for each test
4. WHERE a test is completed, THE Admin_Dashboard SHALL display the dominant DISC profile
5. THE Admin_Dashboard SHALL allow comparison between multiple test results
6. THE Admin_Dashboard SHALL allow creating a new test for an existing Client

### Requirement 11: Dashboard com Métricas

**User Story:** Como membro da equipe VX, eu quero visualizar métricas gerais do sistema, para que eu possa acompanhar o desempenho e uso da ferramenta.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display total number of registered Clients
2. THE Admin_Dashboard SHALL display total number of Test_Sessions
3. THE Admin_Dashboard SHALL display number of completed tests
4. THE Admin_Dashboard SHALL display number of pending tests
5. THE Admin_Dashboard SHALL display completion rate as a percentage
6. THE Admin_Dashboard SHALL display distribution of DISC profiles (count per type)
7. THE Admin_Dashboard SHALL display metrics for the last 30 days
8. THE Admin_Dashboard SHALL update metrics when new data is available

### Requirement 12: Gerenciamento de Clientes

**User Story:** Como membro da equipe VX, eu quero editar e excluir clientes, para que eu possa manter os dados atualizados e remover registros incorretos.

#### Acceptance Criteria

1. WHEN a VX_Team_Member selects a Client, THE Admin_Dashboard SHALL display an edit form
2. THE Admin_Dashboard SHALL allow updating Client name, email, phone, and company
3. WHEN a VX_Team_Member saves changes, THE Database SHALL update the Client information
4. THE Admin_Dashboard SHALL allow deleting a Client
5. WHEN a Client is deleted, THE VX_System SHALL also delete all associated Test_Sessions and DISC_Results
6. WHEN a Client is deleted, THE VX_System SHALL display a confirmation dialog before proceeding
7. THE VX_System SHALL validate updated email and phone formats before saving

### Requirement 13: Reenvio de Links de Teste

**User Story:** Como membro da equipe VX, eu quero reenviar o link do teste para um cliente, para que clientes que não receberam ou perderam o email possam acessar o teste novamente.

#### Acceptance Criteria

1. WHEN a VX_Team_Member requests to resend a test link, THE Email_Service SHALL send a new email to the Client
2. THE Email_Service SHALL use the same Test_Token from the original test
3. THE Email_Service SHALL include a note indicating this is a resent link
4. WHEN the email is resent successfully, THE VX_System SHALL log the resend action with timestamp
5. THE VX_System SHALL allow resending links for tests with status pending or in_progress

### Requirement 14: Identidade Visual VX

**User Story:** Como equipe VX, eu quero que todo o sistema use nossa identidade visual, para que a ferramenta reflita nossa marca profissional.

#### Acceptance Criteria

1. THE VX_System SHALL use VX orange (#F7971E) as the primary brand color
2. THE VX_System SHALL use VX dark (#0B0F14) as the background color
3. THE VX_System SHALL use VX dark secondary (#1A1F26) for secondary backgrounds
4. THE VX_System SHALL use VX gray (#8B92A0) for text and borders
5. THE VX_System SHALL display the VX logo in the header of all pages
6. THE VX_System SHALL use Inter font family throughout the interface
7. THE VX_System SHALL maintain consistent spacing, typography, and component styling

### Requirement 15: Persistência e Armazenamento de Dados

**User Story:** Como sistema, eu quero armazenar todos os dados de forma segura e persistente, para que nenhuma informação seja perdida e possa ser recuperada a qualquer momento.

#### Acceptance Criteria

1. THE Database SHALL store Client information (name, email, phone, company, created_at)
2. THE Database SHALL store Test_Session information (client_id, token, status, sent_at, started_at, completed_at)
3. THE Database SHALL store DISC_Result information (session_id, scores, dominant_profile, created_at)
4. THE Database SHALL store individual answers for each question (session_id, question_id, selected_option, disc_type)
5. THE Database SHALL enforce referential integrity between Clients, Test_Sessions, and DISC_Results
6. THE Database SHALL use indexes on frequently queried fields (email, token, status)
7. THE Database SHALL support concurrent access from multiple VX_Team_Members

### Requirement 16: Segurança e Privacidade

**User Story:** Como equipe VX, eu quero que os dados dos clientes sejam protegidos, para que informações sensíveis não sejam expostas ou acessadas indevidamente.

#### Acceptance Criteria

1. THE VX_System SHALL encrypt passwords using industry-standard hashing algorithms
2. THE VX_System SHALL use HTTPS for all communications
3. THE VX_System SHALL validate and sanitize all user inputs to prevent injection attacks
4. THE VX_System SHALL implement rate limiting on authentication endpoints
5. THE VX_System SHALL log all authentication attempts with IP address and timestamp
6. THE VX_System SHALL restrict access to Client data only to authenticated VX_Team_Members
7. THE Test_Token SHALL be transmitted only through secure channels (HTTPS, email)

### Requirement 17: Responsividade e Acessibilidade

**User Story:** Como usuário do sistema, eu quero que a interface funcione bem em diferentes dispositivos, para que eu possa acessar o sistema de desktop, tablet ou smartphone.

#### Acceptance Criteria

1. THE VX_System SHALL be responsive and adapt to screen sizes from 320px to 2560px width
2. THE Admin_Dashboard SHALL be usable on tablets (768px width and above)
3. THE Client_Portal SHALL be fully functional on mobile devices (320px width and above)
4. THE VX_System SHALL use touch-friendly controls on mobile devices (minimum 44px touch targets)
5. THE VX_System SHALL maintain readability with appropriate font sizes on all devices
6. THE VX_System SHALL use semantic HTML for better accessibility
7. THE VX_System SHALL provide keyboard navigation for all interactive elements

### Requirement 18: Notificações e Feedback

**User Story:** Como usuário do sistema, eu quero receber feedback claro sobre minhas ações, para que eu saiba se operações foram bem-sucedidas ou se ocorreram erros.

#### Acceptance Criteria

1. WHEN a VX_Team_Member performs an action successfully, THE VX_System SHALL display a success message
2. WHEN an error occurs, THE VX_System SHALL display a descriptive error message
3. THE VX_System SHALL display loading indicators during asynchronous operations
4. WHEN a Client submits an answer, THE Client_Portal SHALL provide visual feedback
5. WHEN a PDF is being generated, THE Admin_Dashboard SHALL display a progress indicator
6. THE VX_System SHALL auto-dismiss success messages after 5 seconds
7. THE VX_System SHALL require manual dismissal of error messages

### Requirement 19: Reutilização do MVP Atual

**User Story:** Como desenvolvedor, eu quero reutilizar o código do MVP atual (disc-app/), para que eu possa aproveitar o teste DISC já validado e acelerar o desenvolvimento.

#### Acceptance Criteria

1. THE VX_System SHALL reuse the 10 DISC questions from disc-app/data/questions.ts
2. THE VX_System SHALL reuse the DISC_Calculator algorithm from disc-app/utils/calculateDISC.ts
3. THE VX_System SHALL reuse the profile descriptions from disc-app/data/profiles.ts
4. THE VX_System SHALL reuse the UI components (Button, Card, ProgressBar, Logo) from disc-app/components/
5. THE VX_System SHALL reuse the TailwindCSS configuration with VX colors from disc-app/tailwind.config.ts
6. THE VX_System SHALL maintain the same test flow and user experience as the MVP

### Requirement 20: Deployment e Escalabilidade

**User Story:** Como equipe VX, eu quero que o sistema seja fácil de implantar e escale conforme o número de clientes cresce, para que possamos atender múltiplos clientes simultaneamente.

#### Acceptance Criteria

1. THE VX_System SHALL be deployable on Vercel with a single command
2. THE VX_System SHALL support environment variables for configuration (database URL, email credentials, authentication secrets)
3. THE VX_System SHALL handle at least 100 concurrent Client_Portal sessions
4. THE VX_System SHALL handle at least 10 concurrent VX_Team_Members on Admin_Dashboard
5. THE Database SHALL support connection pooling for efficient resource usage
6. THE VX_System SHALL implement caching for frequently accessed data (profile descriptions, questions)
7. THE VX_System SHALL log errors and performance metrics for monitoring

