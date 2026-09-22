import { useState } from 'react'
import { Plus, Wrench } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { SkillChip } from '../ui/SkillBar'

interface SkillInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
  error?: string
  onBlur?: () => void
  suggestions?: readonly string[]
  className?: string
}

const DEFAULT_SUGGESTIONS = [
  'React', 'Python', 'SQL', 'Azure', 'TypeScript', 'JavaScript', 'Node.js',
  'PostgreSQL', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Machine Learning',
  'System Design', 'Git', 'Kubernetes',
]

export function SkillInput({ skills, onChange, error, onBlur, suggestions = DEFAULT_SUGGESTIONS, className }: SkillInputProps) {
  const [value, setValue] = useState('')

  const addSkill = (raw: string) => {
    const skill = raw.trim().replace(/\s+/g, ' ')
    if (!skill) return
    if (!skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      onChange([...skills, skill])
    }
    setValue('')
  }

  const removeSkill = (skill: string) => onChange(skills.filter(s => s !== skill))

  const availableSuggestions = suggestions.filter(s => !skills.some(x => x.toLowerCase() === s.toLowerCase()))

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-surface-300 mb-2">Key Skills</label>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. React, Python, SQL, Azure"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill(value)
            }
          }}
          onBlur={onBlur}
          leftIcon={<Wrench className="w-4 h-4" />}
          aria-label="Add a skill"
        />
        <Button variant="secondary" onClick={() => addSkill(value)} disabled={!value.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
        {skills.length === 0 ? (
          <span className="text-sm text-surface-500">No skills added yet.</span>
        ) : (
          skills.map(skill => (
            <SkillChip
              key={skill}
              name={skill}
              variant="selected"
              removable
              onRemove={() => removeSkill(skill)}
            />
          ))
        )}
      </div>

      {availableSuggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-500 mb-2">Add from suggestions</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 12).map(skill => (
              <SkillChip
                key={skill}
                name={skill}
                variant="suggested"
                onClick={() => addSkill(skill)}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-400" role="alert">{error}</p>
      )}
    </div>
  )
}