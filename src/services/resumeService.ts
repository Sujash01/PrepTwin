import type { ResumeData } from '../utils/types'

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// TODO: Connect to resume-parsing backend (Microsoft Foundry agent)
// This function simulates parsing. Do not store resume content or credentials here.
export const resumeService = {
  // TODO: Replace with backend resume-parsing endpoint
  async parseResume(file: File): Promise<ResumeData> {
    await DELAY(2000)

    const skillsDetected = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS']
    const projectsDetected = ['E-commerce API', 'Real-time Chat App', 'Task Management System']
    const experienceDetected = ['Software Engineer Intern at TechCorp (2023-2024)', 'Full Stack Developer at StartupXYZ (2024-Present)']

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      skillsDetected,
      projectsDetected,
      experienceDetected,
      parsedAt: new Date(),
    }
  },
}