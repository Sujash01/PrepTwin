/**
 * evaluationService
 *
 * Coaching evaluation contract + aggregation for PrepTwin interviews.
 *
 * Philosophy (Responsible AI):
 *  - Scores are AI-generated COACHING ESTIMATES of interview performance, never
 *    objective measurements, hiring decisions or personality judgments.
 *  - `confidence` refers ONLY to observable answer characteristics (clarity,
 *    decisiveness, hedging, completeness) - never psychological confidence or
 *    mental state.
 *  - The 7 category scores are 1-10 integers; aggregates are averages over
 *    COMPLETED evaluations only. Missing/failed evaluations are skipped, never
 *    invented.
 */

export const EVALUATION_CATEGORIES = [
  'technical',
  'relevance',
  'communication',
  'clarity',
  'structure',
  'confidence',
  'depth',
] as const

export type EvaluationCategory = (typeof EVALUATION_CATEGORIES)[number]

export type DifficultyAdjustment = 'increase' | 'maintain' | 'decrease'
export type PerformanceTrend = 'Improving' | 'Stable' | 'Developing' | 'Not enough data'

export type CategoryScores = Record<EvaluationCategory, number>

export interface EvaluationScores extends CategoryScores {
  strengths: string[]
  improvements: string[]
  summary: string
  /**
   * Coaching suggestion for the next question difficulty. The interview agent
   * (Foundry) ultimately decides the actual question; this is only context.
   */
  difficultyAdjustment: DifficultyAdjustment
}

export interface CompletedEvaluation {
  question: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  scores: EvaluationScores
  at: number
}

export interface TrendSeriesPoint {
  question: number
  score: number
}

export interface AggregateSummary {
  overallScores: CategoryScores
  strengths: string[]
  improvements: string[]
  trend: PerformanceTrend
  trendSeries: TrendSeriesPoint[]
  averageScore: number
}

const SCORE_MIN = 1
const SCORE_MAX = 10
const MAX_FEEDBACK_ITEMS = 10
const MAX_SUMMARY_CHARS = 800

function isUnsafeControlChar(code: number): boolean {
  return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31)
}

function cleanText(value: string, max?: number): string {
  const cleaned = value
    .split('')
    .map(char => (isUnsafeControlChar(char.charCodeAt(0)) ? ' ' : char))
    .join('')
    .replace(/[ \t]+/g, ' ')
    .trim()
  return max === undefined ? cleaned : cleaned.slice(0, max)
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value)
  }
  return null
}

function clampScore(value: unknown): number | null {
  const number = toFiniteNumber(value)
  if (number === null) return null
  const rounded = Math.round(number)
  if (rounded < SCORE_MIN || rounded > SCORE_MAX) return null
  return rounded
}

function coerceStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
    .map(item => (typeof item === 'number' ? String(item) : item))
    .map(item => cleanText(item, 240))
    .filter(item => item.length > 0)
    .slice(0, MAX_FEEDBACK_ITEMS)
}

function coerceDifficultyAdjustment(value: unknown): DifficultyAdjustment {
  const candidate = typeof value === 'string' ? value.toLowerCase() : ''
  return candidate === 'increase' || candidate === 'decrease' ? candidate : 'maintain'
}

/**
 * Validates a loosely-typed evaluation object against the strict schema.
 * Returns null (never a malformed object) when any required score is invalid.
 */
export function coerceEvaluation(raw: unknown): EvaluationScores | null {
  if (typeof raw !== 'object' || raw === null) return null

  const record = raw as Record<string, unknown>
  const scores: CategoryScores = {} as CategoryScores

  for (const category of EVALUATION_CATEGORIES) {
    const score = clampScore(record[category])
    if (score === null) return null
    scores[category] = score
  }

  const summary = typeof record.summary === 'string' ? cleanText(record.summary, MAX_SUMMARY_CHARS) : ''
  const strengths = coerceStringList(record.strengths)
  const improvements = coerceStringList(record.improvements)

  return {
    ...scores,
    strengths,
    improvements,
    summary,
    difficultyAdjustment: coerceDifficultyAdjustment(record.difficultyAdjustment),
  }
}

/**
 * Extracts a JSON object from foundry text using several tolerant strategies,
 * in order: whole-string, fenced ```json block, or the first balanced {...}.
 * Returns the parsed value or null. This parsing is defensive: the object is
 * ALWAYS passed through coerceEvaluation before use, so a partial or corrupt
 * payload can never reach the frontend.
 */
export function parseJsonFromText(text: string): unknown | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const tryParse = (candidate: string): unknown | null => {
    try {
      return JSON.parse(candidate)
    } catch {
      return null
    }
  }

  const direct = tryParse(trimmed)
  if (direct !== null) return direct

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    const parsedFenced = tryParse(fenced[1].trim())
    if (parsedFenced !== null) return parsedFenced
  }

  const start = trimmed.indexOf('{')
  if (start !== -1) {
    let depth = 0
    let inString = false
    let escaped = false
    for (let index = start; index < trimmed.length; index += 1) {
      const char = trimmed[index]
      if (inString) {
        if (escaped) {
          escaped = false
        } else if (char === '\\') {
          escaped = true
        } else if (char === '"') {
          inString = false
        }
        continue
      }
      if (char === '"') {
        inString = true
      } else if (char === '{') {
        depth += 1
      } else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          const parsedBalanced = tryParse(trimmed.slice(start, index + 1))
          if (parsedBalanced !== null) return parsedBalanced
          break
        }
      }
    }
  }

  return null
}

function parseEvaluationFromText(text: string): EvaluationScores | null {
  const raw = parseJsonFromText(text)
  return coerceEvaluation(raw)
}

export function averageOfCategory(
  evaluations: readonly { scores: EvaluationScores }[],
  category: EvaluationCategory,
): number {
  if (evaluations.length === 0) return 0
  const total = evaluations.reduce((sum, entry) => sum + entry.scores[category], 0)
  return Math.round((total / evaluations.length) * 10) / 10
}

export function averageScores(evaluations: readonly { scores: EvaluationScores }[]): CategoryScores {
  const result = {} as CategoryScores
  for (const category of EVALUATION_CATEGORIES) {
    result[category] = averageOfCategory(evaluations, category)
  }
  return result
}

function overallOf(entry: { scores: EvaluationScores }): number {
  let total = 0
  for (const category of EVALUATION_CATEGORIES) {
    total += entry.scores[category]
  }
  return total / EVALUATION_CATEGORIES.length
}

/**
 * Coaching trend across questions: compares the second half of completed
 * evaluations against the first half. Strictly a coaching reflection, not a
 * hiring judgment.
 */
export function computeTrend(
  evaluations: readonly { scores: EvaluationScores }[],
): { trend: PerformanceTrend; series: TrendSeriesPoint[] } {
  const series = evaluations.map((entry, index) => {
    const rawScore = overallOf(entry)
    const score = Math.round(rawScore * 10) / 10
    return { question: index + 1, score }
  })

  let trend: PerformanceTrend = 'Not enough data'
  if (evaluations.length === 1) {
    trend = 'Stable'
  } else if (evaluations.length >= 2) {
    const midpoint = Math.ceil(evaluations.length / 2)
    const firstHalf = series.slice(0, midpoint)
    const secondHalf = series.slice(midpoint)
    const average = (points: TrendSeriesPoint[]): number =>
      points.reduce((sum, point) => sum + point.score, 0) / points.length
    const delta = average(secondHalf) - average(firstHalf)
    if (delta >= 0.4) trend = 'Improving'
    else if (delta <= -0.4) trend = 'Developing'
    else trend = 'Stable'
  }

  return { trend, series }
}

function topFrequent(items: string[], limit: number): string[] {
  const counts = new Map<string, { count: number; order: number }>()
  items.forEach((item, index) => {
    const key = item.toLowerCase()
    const existing = counts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, { count: 1, order: index })
    }
  })
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].order - b[1].order)
    .slice(0, limit)
    .map(([item]) => item)
}

export function aggregateFeedback(items: string[], limit = 5): string[] {
  return topFrequent(items, limit)
}

export function buildAggregateSummary(
  evaluations: readonly { scores: EvaluationScores }[],
): AggregateSummary {
  const { trend, series } = computeTrend(evaluations)
  const allStrengths = evaluations.flatMap(entry => entry.scores.strengths)
  const allImprovements = evaluations.flatMap(entry => entry.scores.improvements)
  const averageScore =
    series.length > 0
      ? Math.round((series.reduce((sum, point) => sum + point.score, 0) / series.length) * 10) / 10
      : 0

  return {
    overallScores: averageScores(evaluations),
    strengths: aggregateFeedback(allStrengths),
    improvements: aggregateFeedback(allImprovements),
    trend,
    trendSeries: series,
    averageScore,
  }
}

export interface AdaptationGuidance {
  averageScore: number
  trend: PerformanceTrend
  /** Human-readable coaching guidance passed to the next question generation. */
  guidance: string
  adjustment: DifficultyAdjustment
}

export function buildAdaptation(
  evaluations: readonly { scores: EvaluationScores }[],
): AdaptationGuidance | null {
  if (evaluations.length === 0) return null
  const { trend, series } = computeTrend(evaluations)
  const averageScore =
    series.reduce((sum, point) => sum + point.score, 0) / series.length
  const roundedAverage = Math.round(averageScore * 10) / 10

  let adjustment: DifficultyAdjustment = 'maintain'
  if (averageScore >= 7.5) adjustment = 'increase'
  else if (averageScore < 4.5) adjustment = 'decrease'

  return {
    averageScore: roundedAverage,
    trend,
    adjustment,
    guidance: `Candidate average score so far is ${roundedAverage}/10 (trend: ${trend}). ` +
      `Proceed accordingly: if the candidate is performing well, ask a deeper or harder question; ` +
      `if the candidate is struggling, ask a simpler foundational question; ` +
      `if the last answer was incomplete, ask a targeted follow-up before moving on. ` +
      `Recommended difficulty change: ${adjustment}.`,
  }
}

export interface ParsedAgentReply {
  /** The question/answer text the candidate should see. */
  text: string
  /** Parsed + validated evaluation, or null when unavailable or malformed. */
  evaluation: EvaluationScores | null
}

const EVALUATION_MARKER = '<<<EVALUATION>>>'

/**
 * Splits the agent reply into visible text and (validated) evaluation.
 * Any malformed evaluation becomes null - the interview never fails on it.
 */
export function parseAgentReply(text: string): ParsedAgentReply {
  const markerIndex = text.indexOf(EVALUATION_MARKER)
  if (markerIndex === -1) {
    return { text: text.trim(), evaluation: null }
  }

  const questionText = text.slice(0, markerIndex).replace(/<<<EVALUATION>>>.*/s, '').trim()
  const evaluationText = text.slice(markerIndex + EVALUATION_MARKER.length).trim()

  if (!questionText || !evaluationText) {
    return { text: text.trim(), evaluation: null }
  }

  const evaluation = parseEvaluationFromText(evaluationText)
  return { text: questionText, evaluation }
}

export function evaluationMarker(): string {
  return EVALUATION_MARKER
}