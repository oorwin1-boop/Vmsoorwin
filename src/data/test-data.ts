export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'candidate';
  firstName?: string;
  lastName?: string;
}

export interface JobPosting {
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description?: string;
  requirements?: string[];
}

export interface InvalidCredential {
  email: string;
  password: string;
  description: string;
}

/* ── Users ────────────────────────────────────────────────────── */

export const testUsers: TestUser[] = [
  {
    email: process.env.TEST_USER_EMAIL || 'pavant+ui@oorwin.com',
    password: process.env.TEST_USER_PASSWORD || 'Password123!',
    role: 'recruiter',
    firstName: 'Test',
    lastName: 'User',
  },
  {
    email: process.env.ADMIN_EMAIL || 'admin@oorwin.ai',
    password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
  },
  {
    email: process.env.RECRUITER_EMAIL || 'recruiter@oorwin.ai',
    password: process.env.RECRUITER_PASSWORD || 'RecruiterPass123!',
    role: 'recruiter',
    firstName: 'Recruiter',
    lastName: 'User',
  },
];

/* ── Job Postings ─────────────────────────────────────────────── */

export const sampleJobPostings: JobPosting[] = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'full-time',
    description: 'We are looking for an experienced software engineer to join our team.',
    requirements: ['5+ years experience', 'TypeScript proficiency', 'React expertise'],
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'full-time',
    description: 'Drive product strategy and execution for our core platform.',
    requirements: ['3+ years PM experience', 'Agile methodologies', 'Data-driven mindset'],
  },
  {
    title: 'QA Automation Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'full-time',
    description: 'Build and maintain our test automation infrastructure.',
    requirements: ['Playwright/Selenium experience', 'TypeScript knowledge', 'CI/CD familiarity'],
  },
];

/* ── Invalid Credentials Matrix ──────────────────────────────── */

export const invalidCredentials: InvalidCredential[] = [
  {
    email: 'nonexistent@example.com',
    password: 'Password123!',
    description: 'Non-existent user',
  },
  {
    email: process.env.TEST_USER_EMAIL || 'pavant+ui@oorwin.com',
    password: 'WrongPassword!',
    description: 'Correct email, wrong password',
  },
  {
    email: 'not-a-valid-email',
    password: 'Password123!',
    description: 'Malformed email address',
  },
  {
    email: '',
    password: '',
    description: 'Empty credentials',
  },
];
