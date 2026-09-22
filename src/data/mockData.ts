import type {
  Question,
  Evaluation,
  CandidateTwin,
  InterviewType,
  Difficulty,
  QuestionCategory,
} from '../utils/types'
import { User, Cpu, FolderKanban, MessageSquare, Flag, type LucideIcon } from 'lucide-react'

export const ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
] as const

export const EXPERIENCE_LEVELS = [
  'Student',
  'Fresher',
  '0–2 years',
  '2–5 years',
  '5+ years',
] as const

export const COMMON_SKILLS = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'SQL', 'PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL', 'Git',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Machine Learning',
  'Deep Learning', 'TensorFlow', 'PyTorch', 'System Design', 'Microservices',
  'Redis', 'Kafka', 'CI/CD', 'Terraform', 'Linux', 'Agile', 'Scrum',
] as const

export const MOCK_QUESTIONS: Record<InterviewType, Question[]> = {
  technical: [
    {
      id: 'q1',
      text: 'Can you explain how you handled authentication in your Flask REST API?',
      category: 'technical',
      difficulty: 'intermediate',
      expectedTopics: ['JWT', 'OAuth', 'Token Refresh', 'Security Best Practices'],
      followUpQuestions: [
        'How would you handle token revocation?',
        'What are the security implications of storing tokens in localStorage?',
      ],
    },
    {
      id: 'q2',
      text: 'Explain the difference between SQL JOIN types and when you would use each.',
      category: 'technical',
      difficulty: 'beginner',
      expectedTopics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      followUpQuestions: [
        'How would you optimize a query with multiple JOINs?',
        'What is the difference between JOIN and subquery performance?',
      ],
    },
    {
      id: 'q3',
      text: 'How would you design a rate limiter for a high-traffic API?',
      category: 'technical',
      difficulty: 'advanced',
      expectedTopics: ['Token Bucket', 'Sliding Window', 'Redis', 'Distributed Systems'],
      followUpQuestions: [
        'How would you handle distributed rate limiting across multiple servers?',
        'What are the trade-offs between different algorithms?',
      ],
    },
    {
      id: 'q4',
      text: 'Describe how you would implement caching in a microservices architecture.',
      category: 'technical',
      difficulty: 'advanced',
      expectedTopics: ['Redis', 'Cache Invalidation', 'Cache Aside', 'Write Through'],
      followUpQuestions: [
        'How do you handle cache stampede?',
        'What is your strategy for cache warming?',
      ],
    },
    {
      id: 'q5',
      text: 'Explain the CAP theorem and its implications for distributed databases.',
      category: 'technical',
      difficulty: 'intermediate',
      expectedTopics: ['Consistency', 'Availability', 'Partition Tolerance'],
      followUpQuestions: [
        'How does this apply to your choice between PostgreSQL and MongoDB?',
        'What is PACELC theorem?',
      ],
    },
  ],
  behavioral: [
    {
      id: 'b1',
      text: 'Tell me about a time you had a disagreement with a team member. How did you resolve it?',
      category: 'behavioral',
      difficulty: 'beginner',
      expectedTopics: ['Conflict Resolution', 'Communication', 'Collaboration'],
      followUpQuestions: [
        'What would you do differently in hindsight?',
        'How did this affect your working relationship?',
      ],
    },
    {
      id: 'b2',
      text: 'Describe a situation where you had to learn a new technology quickly for a project.',
      category: 'behavioral',
      difficulty: 'beginner',
      expectedTopics: ['Learning Agility', 'Adaptability', 'Problem Solving'],
      followUpQuestions: [
        'What was your learning strategy?',
        'How did you apply it to the project?',
      ],
    },
    {
      id: 'b3',
      text: 'Give an example of a project that failed. What did you learn?',
      category: 'behavioral',
      difficulty: 'intermediate',
      expectedTopics: ['Accountability', 'Growth Mindset', 'Retrospective'],
      followUpQuestions: [
        'How did you communicate the failure to stakeholders?',
        'What processes did you put in place to prevent recurrence?',
      ],
    },
    {
      id: 'b4',
      text: 'How do you prioritize tasks when everything seems urgent?',
      category: 'behavioral',
      difficulty: 'beginner',
      expectedTopics: ['Prioritization', 'Time Management', 'Stakeholder Communication'],
      followUpQuestions: [
        'What frameworks do you use?',
        'How do you handle pushback from stakeholders?',
      ],
    },
  ],
  mixed: [
    {
      id: 'm1',
      text: 'Walk me through your most recent project end-to-end.',
      category: 'introduction',
      difficulty: 'beginner',
      expectedTopics: ['Project Overview', 'Role', 'Technologies', 'Challenges', 'Outcomes'],
      followUpQuestions: [
        'What was the hardest technical challenge?',
        'How did you measure success?',
      ],
    },
    {
      id: 'm2',
      text: 'Can you explain how you handled authentication in your Flask REST API?',
      category: 'technical',
      difficulty: 'intermediate',
      expectedTopics: ['JWT', 'OAuth', 'Token Refresh', 'Security Best Practices'],
      followUpQuestions: [
        'How would you handle token revocation?',
        'What are the security implications of storing tokens in localStorage?',
      ],
    },
    {
      id: 'm3',
      text: 'Describe a time you had to refactor legacy code. What was your approach?',
      category: 'project',
      difficulty: 'intermediate',
      expectedTopics: ['Refactoring', 'Testing', 'Risk Mitigation', 'Incremental Changes'],
      followUpQuestions: [
        'How did you ensure you did not break existing functionality?',
        'How did you convince management to allocate time for refactoring?',
      ],
    },
    {
      id: 'm4',
      text: 'Explain the difference between SQL JOIN types and when you would use each.',
      category: 'technical',
      difficulty: 'beginner',
      expectedTopics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      followUpQuestions: [
        'How would you optimize a query with multiple JOINs?',
        'What is the difference between JOIN and subquery performance?',
      ],
    },
    {
      id: 'm5',
      text: 'Tell me about a time you had to make a technical decision with incomplete information.',
      category: 'behavioral',
      difficulty: 'intermediate',
      expectedTopics: ['Decision Making', 'Risk Assessment', 'Trade-offs'],
      followUpQuestions: [
        'How did you gather more information?',
        'What was the outcome?',
      ],
    },
    {
      id: 'm6',
      text: 'How would you design a rate limiter for a high-traffic API?',
      category: 'technical',
      difficulty: 'advanced',
      expectedTopics: ['Token Bucket', 'Sliding Window', 'Redis', 'Distributed Systems'],
      followUpQuestions: [
        'How would you handle distributed rate limiting across multiple servers?',
        'What are the trade-offs between different algorithms?',
      ],
    },
    {
      id: 'm7',
      text: 'Describe how you would implement caching in a microservices architecture.',
      category: 'technical',
      difficulty: 'advanced',
      expectedTopics: ['Redis', 'Cache Invalidation', 'Cache Aside', 'Write Through'],
      followUpQuestions: [
        'How do you handle cache stampede?',
        'What is your strategy for cache warming?',
      ],
    },
    {
      id: 'm8',
      text: 'Give an example of a project that failed. What did you learn?',
      category: 'behavioral',
      difficulty: 'intermediate',
      expectedTopics: ['Accountability', 'Growth Mindset', 'Retrospective'],
      followUpQuestions: [
        'How did you communicate the failure to stakeholders?',
        'What processes did you put in place to prevent recurrence?',
      ],
    },
    {
      id: 'm9',
      text: 'Explain the CAP theorem and its implications for distributed databases.',
      category: 'technical',
      difficulty: 'intermediate',
      expectedTopics: ['Consistency', 'Availability', 'Partition Tolerance'],
      followUpQuestions: [
        'How does this apply to your choice between PostgreSQL and MongoDB?',
        'What is PACELC theorem?',
      ],
    },
    {
      id: 'm10',
      text: 'Where do you see yourself in 3 years? What skills are you currently developing?',
      category: 'final',
      difficulty: 'beginner',
      expectedTopics: ['Career Goals', 'Learning Plan', 'Self Awareness'],
      followUpQuestions: [
        'How does this role align with your goals?',
        'What is your current learning focus?',
      ],
    },
  ],
  'project-based': [
    {
      id: 'p1',
      text: 'Walk me through your most recent project end-to-end.',
      category: 'introduction',
      difficulty: 'beginner',
      expectedTopics: ['Project Overview', 'Role', 'Technologies', 'Challenges', 'Outcomes'],
      followUpQuestions: [
        'What was the hardest technical challenge?',
        'How did you measure success?',
      ],
    },
    {
      id: 'p2',
      text: 'Describe the architecture of your most complex project.',
      category: 'project',
      difficulty: 'advanced',
      expectedTopics: ['System Design', 'Architecture Patterns', 'Trade-offs', 'Scalability'],
      followUpQuestions: [
        'What would you change if you rebuilt it today?',
        'How did you handle data consistency?',
      ],
    },
    {
      id: 'p3',
      text: 'How did you handle deployment and CI/CD for your project?',
      category: 'project',
      difficulty: 'intermediate',
      expectedTopics: ['CI/CD', 'Deployment Strategies', 'Monitoring', 'Rollback'],
      followUpQuestions: [
        'What was your branching strategy?',
        'How did you handle database migrations?',
      ],
    },
    {
      id: 'p4',
      text: 'Tell me about a performance bottleneck you identified and fixed.',
      category: 'project',
      difficulty: 'intermediate',
      expectedTopics: ['Profiling', 'Optimization', 'Monitoring', 'Metrics'],
      followUpQuestions: [
        'What tools did you use to identify the bottleneck?',
        'What was the impact of your fix?',
      ],
    },
    {
      id: 'p5',
      text: 'How do you approach technical debt in your projects?',
      category: 'project',
      difficulty: 'intermediate',
      expectedTopics: ['Technical Debt', 'Prioritization', 'Refactoring', 'Team Culture'],
      followUpQuestions: [
        'How do you communicate technical debt to non-technical stakeholders?',
        'What metrics do you track?',
      ],
    },
  ],
}

export const MOCK_EVALUATIONS: Record<string, Evaluation> = {
  strong: {
    id: 'eval1',
    questionId: 'q1',
    answerId: 'a1',
    technical: 8,
    relevance: 9,
    clarity: 8,
    structure: 7,
    confidence: 8,
    feedback: 'Excellent explanation of JWT authentication flow. You covered token generation, validation, and refresh mechanisms comprehensively.',
    reasoning: 'The candidate demonstrated deep understanding of authentication patterns and security considerations.',
    difficultyAdjustment: 'increase',
    createdAt: new Date(),
  },
  moderate: {
    id: 'eval2',
    questionId: 'q2',
    answerId: 'a2',
    technical: 6,
    relevance: 7,
    clarity: 6,
    structure: 6,
    confidence: 6,
    feedback: 'Good understanding of JOIN types but could elaborate more on performance implications.',
    reasoning: 'The candidate knows the basics but lacks depth on optimization strategies.',
    difficultyAdjustment: 'maintain',
    createdAt: new Date(),
  },
  weak: {
    id: 'eval3',
    questionId: 'q3',
    answerId: 'a3',
    technical: 4,
    relevance: 5,
    clarity: 5,
    structure: 4,
    confidence: 4,
    feedback: 'The answer shows limited familiarity with rate limiting algorithms and distributed systems concepts.',
    reasoning: 'Candidate struggled to articulate the differences between token bucket and sliding window approaches.',
    difficultyAdjustment: 'decrease',
    createdAt: new Date(),
  },
}

export const MOCK_CANDIDATE_TWIN: CandidateTwin = {
  id: 'twin1',
  candidateId: 'candidate1',
  scores: {
    technical: 7.8,
    communication: 7.4,
    confidence: 7.6,
    relevance: 8.1,
    structure: 7.2,
    overall: 7.8,
  },
  skillMap: [
    {
      name: 'Programming',
      score: 82,
      skills: [
        { name: 'Python', proficiency: 88, category: 'Programming' },
        { name: 'JavaScript', proficiency: 85, category: 'Programming' },
        { name: 'TypeScript', proficiency: 80, category: 'Programming' },
        { name: 'Java', proficiency: 72, category: 'Programming' },
      ],
    },
    {
      name: 'Backend',
      score: 88,
      skills: [
        { name: 'Node.js', proficiency: 90, category: 'Backend' },
        { name: 'REST APIs', proficiency: 92, category: 'Backend' },
        { name: 'GraphQL', proficiency: 78, category: 'Backend' },
        { name: 'Microservices', proficiency: 85, category: 'Backend' },
      ],
    },
    {
      name: 'Databases',
      score: 71,
      skills: [
        { name: 'PostgreSQL', proficiency: 80, category: 'Databases' },
        { name: 'MongoDB', proficiency: 75, category: 'Databases' },
        { name: 'Redis', proficiency: 70, category: 'Databases' },
        { name: 'SQL Optimization', proficiency: 60, category: 'Databases' },
      ],
    },
    {
      name: 'System Design',
      score: 54,
      skills: [
        { name: 'Distributed Systems', proficiency: 55, category: 'System Design' },
        { name: 'Scalability Patterns', proficiency: 50, category: 'System Design' },
        { name: 'CAP Theorem', proficiency: 60, category: 'System Design' },
        { name: 'Load Balancing', proficiency: 52, category: 'System Design' },
      ],
    },
    {
      name: 'Communication',
      score: 74,
      skills: [
        { name: 'Technical Explanation', proficiency: 75, category: 'Communication' },
        { name: 'Answer Structure', proficiency: 70, category: 'Communication' },
        { name: 'Clarity Under Pressure', proficiency: 68, category: 'Communication' },
        { name: 'Active Listening', proficiency: 82, category: 'Communication' },
      ],
    },
  ],
  strengths: [
    'REST API design and implementation',
    'Python fundamentals and ecosystem',
    'Problem-solving with practical approach',
    'Real-world project experience with Node.js',
    'Strong debugging and troubleshooting skills',
  ],
  weaknesses: [
    'Java OOP fundamentals need reinforcement',
    'Authentication/security concepts depth',
    'Explaining technical decisions under pressure',
    'Answer structure and organization',
    'System design at scale',
  ],
  insights: [
    {
      id: 'i1',
      type: 'strength',
      title: 'Strong Practical Backend Experience',
      description: 'Your project work demonstrates solid hands-on experience with modern backend technologies and API development.',
      priority: 'high',
    },
    {
      id: 'i2',
      type: 'weakness',
      title: 'Technical Explanations Become Less Detailed Under Pressure',
      description: 'During the interview, your answers lost depth when follow-up questions increased in complexity.',
      priority: 'high',
    },
    {
      id: 'i3',
      type: 'pattern',
      title: 'Performance Improves After Follow-up Questions',
      description: 'You tend to provide more structured and complete answers when given a second chance or clarifying question.',
      priority: 'medium',
    },
    {
      id: 'i4',
      type: 'recommendation',
      title: 'Practice Structured Answer Frameworks',
      description: 'Using frameworks like STAR (Situation, Task, Action, Result) for behavioral and PREP (Point, Reason, Example, Point) for technical answers will improve clarity.',
      priority: 'high',
    },
  ],
  recommendations: [
    {
      id: 'r1',
      topic: 'Java OOP Fundamentals',
      priority: 'high',
      reason: 'Multiple questions revealed gaps in core Java concepts like inheritance, polymorphism, and design patterns.',
      resources: [
        'Effective Java by Joshua Bloch (Chapters 1-4)',
        'Java Design Patterns course on Coursera',
        'Practice: Implement 5 classic design patterns in Java',
      ],
    },
    {
      id: 'r2',
      topic: 'JWT Authentication Deep Dive',
      priority: 'medium',
      reason: 'While you implemented JWT, the follow-up on token revocation and storage security showed knowledge gaps.',
      resources: [
        'OAuth 2.0 and OpenID Connect specifications',
        'OWASP JWT Cheat Sheet',
        'Build a token blacklist system with Redis',
      ],
    },
    {
      id: 'r3',
      topic: 'SQL Query Optimization',
      priority: 'medium',
      reason: 'JOIN performance and indexing strategies need strengthening for backend roles.',
      resources: [
        'Use The Index, Luke (use-the-index-luke.com)',
        'PostgreSQL EXPLAIN ANALYZE tutorial',
        'Practice: Optimize 10 slow queries',
      ],
    },
    {
      id: 'r4',
      topic: 'System Design Fundamentals',
      priority: 'low',
      reason: 'Strong foundation but needs more exposure to large-scale architecture patterns.',
      resources: [
        'Designing Data-Intensive Applications by Martin Kleppmann',
        'System Design Primer (GitHub)',
        'Practice: Design 3 systems from scratch',
      ],
    },
  ],
  interviewHistory: [
    {
      id: 'hist1',
      role: 'Software Engineer',
      date: new Date('2026-09-20'),
      score: 7.8,
      questionCount: 10,
      type: 'mixed',
    },
    {
      id: 'hist2',
      role: 'Backend Developer',
      date: new Date('2026-09-18'),
      score: 7.1,
      questionCount: 10,
      type: 'technical',
    },
    {
      id: 'hist3',
      role: 'Java Developer',
      date: new Date('2026-09-15'),
      score: 6.6,
      questionCount: 10,
      type: 'technical',
    },
  ],
  lastUpdated: new Date(),
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  introduction: 'Introduction',
  technical: 'Technical',
  project: 'Project',
  behavioral: 'Behavioral',
  final: 'Final',
}

export const CATEGORY_ICONS: Record<QuestionCategory, LucideIcon> = {
  introduction: User,
  technical: Cpu,
  project: FolderKanban,
  behavioral: MessageSquare,
  final: Flag,
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: 'text-green-400 bg-green-500/20 border-green-500/30',
  intermediate: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  advanced: 'text-red-400 bg-red-500/20 border-red-500/30',
  adaptive: 'text-primary-400 bg-primary-500/20 border-primary-500/30',
}