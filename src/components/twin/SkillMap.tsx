import { cn } from '../../utils/helpers'
import { SkillBar } from '../ui/SkillBar'
import type { SkillCategory } from '../../utils/types'

interface SkillMapProps {
  categories: SkillCategory[]
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Programming: 'default',
  Backend: 'success',
  Databases: 'warning',
  'System Design': 'danger',
  Communication: 'primary',
  Frontend: 'primary',
  'Machine Learning': 'success',
  DevOps: 'warning',
}

export function SkillMap({ categories, className }: SkillMapProps) {
  return (
    <div className={cn('grid md:grid-cols-2 gap-6', className)}>
      {categories.map(category => (
        <div
          key={category.name}
          className="rounded-2xl border border-surface-700/50 bg-surface-900/50 backdrop-blur-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-100">{category.name}</h3>
            <span className="text-xl font-bold text-primary-400">{category.score}%</span>
          </div>
          <SkillBar
            name=""
            score={category.score}
            size="lg"
            variant={(CATEGORY_COLORS[category.name] as 'default' | 'success' | 'warning' | 'danger' | 'primary') || 'primary'}
            showScore={false}
            className="mb-6"
          />
          <div className="flex flex-wrap gap-2">
            {category.skills.map(skill => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 border border-surface-700 text-surface-300"
              >
                {skill.name}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-900/50 text-surface-500">
                  {skill.proficiency}%
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}