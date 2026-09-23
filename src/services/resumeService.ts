import type { ResumeData } from '../utils/types'
import { resumeApi } from './resumeApi'

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const resumeService = {
  async parseResume(file: File): Promise<ResumeData> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
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
    }

    const result = await resumeApi.parse(file)
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      skillsDetected: [],
      projectsDetected: [],
      experienceDetected: [],
      resumeId: result.resumeId,
      parsedAt: new Date(),
    }
  },
}