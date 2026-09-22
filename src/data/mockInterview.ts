export type MockDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface MockInterviewQuestion {
  id: string
  text: string
  topic: string
  difficulty: MockDifficulty
  difficultyLevel: number
  mockTranscript: string
}

export const MOCK_INTERVIEW_QUESTIONS: MockInterviewQuestion[] = [
  {
    id: 'mock-q-intro',
    text: 'Tell me about yourself and walk me through your background.',
    topic: 'Introduction',
    difficulty: 'Easy',
    difficultyLevel: 45,
    mockTranscript:
      "I'm a software engineer with about three years of experience building web applications. Most recently I worked on a React and Node.js platform that helps teams manage their release pipelines, where I led two major features end to end. I really enjoy digging into performance problems and turning messy requirements into clean, reliable code.",
  },
  {
    id: 'mock-q-oop',
    text: "In Java, what's the difference between an interface and an abstract class? When would you choose each one?",
    topic: 'Java, OOP',
    difficulty: 'Medium',
    difficultyLevel: 75,
    mockTranscript:
      'An abstract class allows you to define state and a shared implementation, and a class can only extend a single one. An interface, on the other hand, only declares a contract, and a class can implement several of them. I would lean on an abstract class for shared code among closely related types, and use interfaces to define capabilities that otherwise unrelated classes can adopt.',
  },
  {
    id: 'mock-q-api',
    text: 'Explain what a REST API is and describe the key HTTP methods and principles it relies on.',
    topic: 'REST APIs, HTTP',
    difficulty: 'Medium',
    difficultyLevel: 75,
    mockTranscript:
      'A REST API is an architectural style where resources are identified by URLs and manipulated with HTTP verbs. GET retrieves, POST creates, PUT or PATCH update, and DELETE removes, and clients and servers communicate with stateless JSON payloads. The key principles are statelessness, caching, a layered system, and a uniform interface that keeps clients decoupled from the server.',
  },
  {
    id: 'mock-q-project',
    text: "Describe a technical project you're proud of. What was your role, and what challenges did you overcome?",
    topic: 'Projects, Architecture',
    difficulty: 'Easy',
    difficultyLevel: 45,
    mockTranscript:
      "I'm most proud of a real-time analytics dashboard I built for our operations team. I owned the architecture, designed the WebSocket streaming layer, and cut first paint time by forty percent by virtualizing the chart data. The hardest part was balancing live updates with server load, and it taught me a lot about incremental engineering.",
  },
  {
    id: 'mock-q-perf',
    text: 'A web application is loading slowly for users. Walk me through how you would diagnose and improve its performance.',
    topic: 'Performance, Caching',
    difficulty: 'Hard',
    difficultyLevel: 100,
    mockTranscript:
      "First I'd reproduce the slowness and profile it in the browser, checking the network waterfall and the Performance panel. Then I'd inspect slow database queries, N+1 patterns, and whether we're shipping large or unminified assets. Usually the fix is a mix of caching, pagination, compression, and deferring non-critical work, and I validate each change against a baseline.",
  },
  {
    id: 'mock-q-behavioral',
    text: 'Tell me about a time you disagreed with a teammate. How did you resolve it?',
    topic: 'Behavioral, Teamwork',
    difficulty: 'Easy',
    difficultyLevel: 45,
    mockTranscript:
      "A teammate and I disagreed about whether to adopt a new caching library on a tight deadline. I asked to spend thirty minutes prototyping the critical path, which showed the risk was manageable, so we agreed to ship it behind a feature flag. We ended up rolling back one part, but the experiment improved trust on the team.",
  },
  {
    id: 'mock-q-design',
    text: 'How would you design a URL shortener that must handle millions of requests per day?',
    topic: 'System Design, Scalability',
    difficulty: 'Hard',
    difficultyLevel: 100,
    mockTranscript:
      "I'd start with a hash function that maps long URLs to short keys, backed by a lookup table that maps keys back to the original URL. For millions of requests I'd put a cache in front of the store, shard across read replicas, and design for fast lookups. I'd also plan for key expiration, analytics, and graceful handling of collisions.",
  },
  {
    id: 'mock-q-final',
    text: 'Where do you see yourself growing in the next few years, and how does this role fit into that plan?',
    topic: 'Career Goals, Growth',
    difficulty: 'Medium',
    difficultyLevel: 75,
    mockTranscript:
      'In the next few years I want to grow into a senior engineer who owns important systems end to end and mentors others. This role appeals to me because it combines deep technical work with a chance to shape product decisions. I would like to build a track record of delivering reliable software while broadening my leadership within the team.',
  },
]

export interface MockInterviewMeta {
  focus: string
  performanceTrend: 'Improving' | 'Stable' | 'Developing'
}

export const MOCK_INTERVIEW_META: MockInterviewMeta = {
  focus: 'Mixed',
  performanceTrend: 'Improving',
}