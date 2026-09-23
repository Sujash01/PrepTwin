import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ArrowRight, Sparkles, User, FileText, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Avatar } from '../components/ui/Avatar'
import { Divider } from '../components/ui/Divider'
import { SkillInput } from '../components/setup/SkillInput'
import { ResumeUpload } from '../components/setup/ResumeUpload'
import type { ResumeUploadStatus } from '../components/setup/ResumeUpload'
import { useCandidate, useToast } from '../hooks/useApp'
import { candidateService } from '../services/candidateService'
import { resumeApi } from '../services/resumeApi'
import { COMMON_SKILLS } from '../data/mockData'
import type { Candidate, InterviewFocus, ResumeMetadata, ResumeData } from '../utils/types'
import { cn } from '../utils/helpers'

const ROLE_OPTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'AI/ML Engineer',
  'Product Manager',
  'Other',
]

const EXPERIENCE_OPTIONS = [
  'Student / Fresher',
  '0–2 years',
  '2–5 years',
  '5+ years',
]

const FOCUS_OPTIONS: Array<{ value: InterviewFocus; label: string }> = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'system-design', label: 'System Design' },
  { value: 'projects', label: 'Projects' },
  { value: 'mixed', label: 'Mixed' },
]

const MODE_OPTIONS = [
  { value: 'practice', label: 'Practice', description: 'Relaxed pace, instant feedback, retry answers' },
  { value: 'real', label: 'Real Interview', description: 'Timed, no retries, simulates real pressure' },
] as const

const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: '5 Questions', description: 'Quick screening interview' },
  { value: 10, label: '10 Questions', description: 'Standard interview length' },
  { value: 15, label: '15 Questions', description: 'Deep-dive technical interview' },
  { value: 20, label: '20 Questions', description: 'Comprehensive assessment' },
] as const

type InterviewMode = 'practice' | 'real'

interface SetupForm {
  name: string
  role: string
  experience: string
  skills: string[]
  focus: InterviewFocus
  resume: ResumeMetadata | null
  mode: InterviewMode
  questionCount: number
}

export function CandidateSetupPage() {
  const navigate = useNavigate()
  const { candidate, setCandidate } = useCandidate()
  const showToast = useToast()

  const [form, setForm] = useState<SetupForm>({
    name: candidate?.name || '',
    role: candidate?.role || '',
    experience: candidate?.experience || '',
    skills: candidate?.skills || [],
    focus: candidate?.focus || 'mixed',
    resume: candidate?.resume
      ? {
          fileName: candidate.resume.fileName,
          fileSize: candidate.resume.fileSize,
          fileType: candidate.resume.fileType,
        }
      : null,
    mode: 'practice',
    questionCount: 10,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [resumeStatus, setResumeStatus] = useState<ResumeUploadStatus>(
    () => (candidate?.resume?.resumeId ? 'ready' : 'idle')
  )
  const pendingResumeFileRef = useRef<File | null>(null)

  const resolveResumeFileType = (file: File): string => {
    if (file.type) return file.type
    return file.name.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  const processResume = async (file: File) => {
    setResumeStatus('processing')
    try {
      const result = await resumeApi.parse(file)
      const meta: ResumeMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: resolveResumeFileType(file),
        resumeId: result.resumeId,
        processed: true,
      }
      update('resume', meta)
      setResumeStatus('ready')
    } catch {
      setResumeStatus('error')
    }
  }

  const handleResumeFileSelected = (file: File) => {
    pendingResumeFileRef.current = file
    void processResume(file)
  }

  const handleResumeRetry = () => {
    const file = pendingResumeFileRef.current
    if (!file) return
    void processResume(file)
  }

  const handleResumeClear = () => {
    const resumeId = form.resume?.resumeId
    if (resumeId) {
      void resumeApi.clear(resumeId)
    }
    pendingResumeFileRef.current = null
    update('resume', null)
    setResumeStatus('idle')
  }

  const isComplete = form.name.trim() !== '' && form.role !== '' && form.experience !== '' && form.skills.length > 0

  const clearFieldError = (key: string) => {
    setErrors(prev => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const setFieldError = (key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }))
  }

  const update = <K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    clearFieldError(String(key))
  }

  const onNameBlur = () => {
    if (form.name.trim()) clearFieldError('name')
    else setFieldError('name', 'Please enter your name.')
  }

  const onRoleBlur = () => {
    if (form.role) clearFieldError('role')
    else setFieldError('role', 'Please select your target role.')
  }

  const onExperienceBlur = () => {
    if (form.experience) clearFieldError('experience')
    else setFieldError('experience', 'Please select your experience level.')
  }

  const onSkillsBlur = () => {
    if (form.skills.length > 0) clearFieldError('skills')
    else setFieldError('skills', 'Add at least one skill.')
  }

  const handleContinue = () => {
    if (!form.name.trim()) setFieldError('name', 'Please enter your name.')
    if (!form.role) setFieldError('role', 'Please select your target role.')
    if (!form.experience) setFieldError('experience', 'Please select your experience level.')
    if (form.skills.length === 0) setFieldError('skills', 'Add at least one skill.')

    if (!isComplete) return

    const saved = candidateService.saveCandidateProfile({
      name: form.name.trim(),
      role: form.role,
      experience: form.experience,
      skills: form.skills,
      focus: form.focus,
      resume: form.resume,
      mode: form.mode,
      questionCount: form.questionCount,
    })

    const resumeData: ResumeData | null = saved.resume
      ? {
          ...saved.resume,
          skillsDetected: [],
          projectsDetected: [],
          experienceDetected: [],
          parsedAt: new Date(),
        }
      : null

    const candidateRecord: Candidate = {
      id: saved.id,
      name: saved.name,
      role: saved.role,
      experience: saved.experience,
      skills: saved.skills,
      focus: saved.focus,
      mode: saved.mode,
      questionCount: saved.questionCount,
      resume: resumeData,
      createdAt: saved.createdAt,
    }

    setCandidate(candidateRecord)
    showToast(`You're all set, ${form.name.split(' ')[0]}. Your interview is ready.`, 'success')
    navigate('/interview')
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(124,92,252,0.14),transparent)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-surface-400">Step 1 of 2</span>
            <ProgressBar value={50} size="sm" variant="primary" className="w-28" />
          </div>
        </header>

        {/* Intro */}
        <div className="mb-10">
          <Badge variant="primary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1.5" />
            CANDIDATE SETUP
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-3">
            Tell us about yourself
          </h1>
          <p className="text-surface-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            PrepTwin uses your profile to personalize every question, adjust difficulty in real time,
            and build your Candidate Twin.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Candidate information */}
          <Card className="lg:col-span-3 p-6 sm:p-8">
            <CardContent>
              <div className="flex items-center gap-4 mb-8">
                <Avatar name={form.name.trim() || 'Candidate'} size="lg" />
                <div>
                  <CardTitle>Candidate Information</CardTitle>
                  <CardDescription>Let PrepTwin personalize your interview.</CardDescription>
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  onBlur={onNameBlur}
                  error={errors.name}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Select
                  label="Target Role"
                  placeholder="Select a role"
                  options={ROLE_OPTIONS}
                  value={form.role}
                  onChange={e => update('role', e.target.value)}
                  onBlur={onRoleBlur}
                  error={errors.role}
                  helperText="Questions will be tailored to this role."
                />

                <Select
                  label="Experience Level"
                  placeholder="Select your experience level"
                  options={EXPERIENCE_OPTIONS}
                  value={form.experience}
                  onChange={e => update('experience', e.target.value)}
                  onBlur={onExperienceBlur}
                  error={errors.experience}
                  helperText="Sets the baseline difficulty for your interview."
                />

<Select
                  label="Interview Focus"
                  options={FOCUS_OPTIONS}
                  value={form.focus}
                  onChange={e => update('focus', e.target.value as InterviewFocus)}
                  helperText="What should the AI emphasize during the interview?"
                />

                <Divider />

                <div className="space-y-6">
                  <Card className="p-4 bg-surface-900/50 border-surface-700/50">
                    <CardTitle className="text-base">Interview Mode</CardTitle>
                    <CardDescription className="text-xs">Choose how you want to practice.</CardDescription>
                    <div className="mt-4 grid gap-3">
                      {MODE_OPTIONS.map(option => (
                        <label
                          key={option.value}
                          className={cn(
                            'relative cursor-pointer p-4 rounded-xl border-2 transition-all',
                            form.mode === option.value
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-surface-700 hover:border-primary-500/50'
                          )}
                        >
                          <input
                            type="radio"
                            name="mode"
                            value={option.value}
                            checked={form.mode === option.value}
                            onChange={() => update('mode', option.value as InterviewMode)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0',
                              form.mode === option.value
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-surface-600'
                            )}>
                              {form.mode === option.value && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-surface-100">{option.label}</p>
                              <p className="text-xs text-surface-500 mt-0.5">{option.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {form.mode === 'practice' && (
                    <Card className="p-4 bg-surface-900/50 border-surface-700/50">
                      <CardTitle className="text-base">Question Count</CardTitle>
                      <CardDescription className="text-xs">How many questions should the interview have?</CardDescription>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {QUESTION_COUNT_OPTIONS.map(option => (
                          <label
                            key={option.value}
                            className={cn(
                              'relative cursor-pointer p-4 rounded-xl border-2 transition-all text-center',
                              form.questionCount === option.value
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-surface-700 hover:border-primary-500/50'
                            )}
                          >
                            <input
                              type="radio"
                              name="questionCount"
                              value={option.value}
                              checked={form.questionCount === option.value}
                              onChange={() => update('questionCount', option.value)}
                              className="sr-only"
                            />
                            <div>
                              <p className="font-medium text-surface-100">{option.label}</p>
                              <p className="text-xs text-surface-500 mt-0.5">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                <Divider />

                <SkillInput
                  skills={form.skills}
                  onChange={skills => update('skills', skills)}
                  onBlur={onSkillsBlur}
                  error={errors.skills}
                  suggestions={COMMON_SKILLS}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resume upload */}
          <Card className="lg:col-span-2 p-6 sm:p-8 h-fit">
            <CardContent>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <CardTitle>Resume</CardTitle>
                    <CardDescription>We use it to personalize your interview.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" size="sm">Optional</Badge>
              </div>

              <div className="mt-6">
                <ResumeUpload
                  resume={form.resume}
                  status={resumeStatus}
                  onFileSelected={handleResumeFileSelected}
                  onRetry={handleResumeRetry}
                  onClear={handleResumeClear}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-10">
          <Divider />
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-surface-500">
              Required: name, target role, experience level, and at least one skill.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleContinue}
              disabled={!isComplete}
            >
              Continue to Interview
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateSetupPage