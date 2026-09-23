import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  extractAssistantText,
  sendWithRefusalRetry,
  startInterview,
  isMockMode,
  InterviewServiceError,
  type FoundryRawResponse,
} from '../services/foundryService.js'
import { parseAgentReply } from '../services/evaluationService.js'

type OpenAIClientParam = Parameters<typeof sendWithRefusalRetry>[0]

interface CreateCall {
  conversation: string
  input: string
}

function makeClient(scripted: FoundryRawResponse[]): {
  client: OpenAIClientParam
  createCalls: CreateCall[]
  deletedIds: string[]
} {
  const createCalls: CreateCall[] = []
  const deletedIds: string[] = []
  const queue = [...scripted]
  const client = {
    responses: {
      create: async (params: { conversation: string; input: string }) => {
        createCalls.push({ conversation: params.conversation, input: params.input })
        const next = queue.shift()
        if (!next) throw new Error('no scripted response left')
        return next
      },
      inputItems: {
        list: async () => ({
          data: [
            {
              type: 'message',
              role: 'user',
              id: 'msg_user_1',
              content: [{ type: 'output_text', text: createCalls[createCalls.length - 1]?.input ?? '' }],
            },
          ],
        }),
      },
    },
    conversations: {
      items: {
        delete: async (itemId: string) => {
          deletedIds.push(itemId)
          return {}
        },
      },
    },
  }
  return { client: client as unknown as OpenAIClientParam, createCalls, deletedIds }
}

function refusalResponse(id = 'resp_1'): FoundryRawResponse {
  return {
    id,
    status: 'completed',
    output: [
      {
        id: 'out_refusal',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'refusal', refusal: "I'm sorry, but I cannot assist with that request." }],
      },
    ],
  }
}

function successResponse(text: string, id = 'resp_2'): FoundryRawResponse {
  return {
    id,
    status: 'completed',
    output: [
      {
        id: 'out_msg',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text }],
      },
    ],
  }
}

function mixedRefusalTextResponse(text: string): FoundryRawResponse {
  return {
    id: 'resp_3',
    status: 'completed',
    output: [
      {
        id: 'out_mixed',
        type: 'message',
        role: 'assistant',
        content: [
          { type: 'output_text', text },
          { type: 'refusal', refusal: "I can't say anything beyond that." },
        ],
      },
    ],
  }
}

function mcpListToolsPlusMessageResponse(text: string): FoundryRawResponse {
  return {
    id: 'resp_4',
    status: 'completed',
    output: [
      { id: 'tool_1', type: 'mcp_list_tools', role: 'assistant' },
      { id: 'out_msg2', type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] },
    ],
  }
}

function inlineRefusalResponse(): FoundryRawResponse {
  return {
    id: 'resp_5',
    status: 'completed',
    output: [
      {
        id: 'out_inline',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: "I'm sorry, but I cannot assist with that request." }],
      },
    ],
  }
}

const VALID_EVAL = `{
  "technical": 7,
  "relevance": 8,
  "communication": 6,
  "clarity": 7,
  "structure": 8,
  "confidence": 5,
  "depth": 6,
  "strengths": ["clear example", "good structure"],
  "improvements": ["add trade-offs"],
  "summary": "A solid answer with room to deepen.",
  "difficultyAdjustment": "maintain"
}`

describe('extractAssistantText', () => {
  it('extracts a normal single assistant message', () => {
    const result = extractAssistantText(successResponse('What is the main purpose of a REST API?'))
    assert.equal(result.text, 'What is the main purpose of a REST API?')
    assert.equal(result.refusalDetected, false)
  })

  it('does not classify a normal short question as a refusal (TEST 4)', () => {
    const result = extractAssistantText(successResponse('Tell me about your backend project.'))
    assert.equal(result.text, 'Tell me about your backend project.')
    assert.equal(result.refusalDetected, false)
  })

  it('does not classify a question merely containing trigger words as a refusal', () => {
    const result = extractAssistantText(
      successResponse("Tell me about a time you had to say sorry to a teammate when you couldn't finish on time."),
    )
    assert.equal(result.text, "Tell me about a time you had to say sorry to a teammate when you couldn't finish on time.")
    assert.equal(result.refusalDetected, false)
  })

  it('ignores mcp_list_tools tool items and uses only the assistant message text (TEST 8)', () => {
    const result = extractAssistantText(mcpListToolsPlusMessageResponse('What is the difference between TCP and UDP?'))
    assert.equal(result.text, 'What is the difference between TCP and UDP?')
    assert.equal(result.refusalDetected, false)
  })

  it('classifies a standalone inline refusal written into output_text', () => {
    const result = extractAssistantText(inlineRefusalResponse())
    assert.equal(result.text, '')
    assert.equal(result.refusalDetected, true)
  })

  it('detects a pure refusal and isolates it from the candidate', () => {
    const result = extractAssistantText(refusalResponse())
    assert.equal(result.text, '')
    assert.equal(result.refusalDetected, true)
  })

  it('keeps the legitimate text when output_text and refusal share a message', () => {
    const result = extractAssistantText(mixedRefusalTextResponse('Tell me about a project you are proud of.'))
    assert.equal(result.text, 'Tell me about a project you are proud of.')
    assert.equal(result.refusalDetected, true)
  })

  it('marks evaluation valid for single-line JSON', () => {
    const singleLine = `Tell me about yourself.
<<<EVALUATION>>>
${VALID_EVAL.replace(/\n\s*/g, ' ')}`
    const result = extractAssistantText(successResponse(singleLine))
    assert.equal(result.hasEvaluationMarker, true)
    assert.equal(result.evaluationValid, true)
  })

  it('marks evaluation valid for multiline JSON with leading prose cleaned away', () => {
    const multiline = `Tell me about yourself.
<<<EVALUATION>>>
${VALID_EVAL}
(no trailing text)`
    const result = extractAssistantText(successResponse(multiline))
    assert.equal(result.hasEvaluationMarker, true)
    assert.equal(result.evaluationValid, true)
  })

  it('marks evaluation invalid for malformed JSON', () => {
    const bad = `Tell me about yourself.
<<<EVALUATION>>>
{"technical": "not-a-number", "relevance": 8}`
    const result = extractAssistantText(successResponse(bad))
    assert.equal(result.hasEvaluationMarker, true)
    assert.equal(result.evaluationValid, false)
  })
})

describe('sendWithRefusalRetry', () => {
  it('returns the first attempt when it is a clean normal response (no retry)', async () => {
    const { client, createCalls } = makeClient([successResponse('Welcome! First question...')])
    const extracted = await sendWithRefusalRetry(client, 'conv_1', 'profile context')
    assert.equal(extracted.text, 'Welcome! First question...')
    assert.equal(extracted.refusalDetected, false)
    assert.equal(createCalls.length, 1)
  })

  it('regenerates on a refusal: removes the failed turn items then retries', async () => {
    const { client, createCalls, deletedIds } = makeClient([
      refusalResponse('resp_bad'),
      successResponse('Next question: explain an index.'),
    ])
    const extracted = await sendWithRefusalRetry(client, 'conv_1', 'answer frame content')
    assert.equal(extracted.text, 'Next question: explain an index.')
    assert.equal(extracted.refusalDetected, false)
    assert.equal(createCalls.length, 2)
    assert.equal(createCalls[1].conversation, 'conv_1')
    assert.equal(createCalls[1].input, 'answer frame content')
    // The refused output item and this turn's user message are purged.
    assert.ok(deletedIds.includes('out_refusal'))
    assert.ok(deletedIds.includes('msg_user_1'))
  })

  it('throws the safe upstream error after a double refusal (bounded, no loop)', async () => {
    const { client, createCalls } = makeClient([refusalResponse('resp_1'), refusalResponse('resp_2')])
    await assert.rejects(
      sendWithRefusalRetry(client, 'conv_1', 'content'),
      (error: unknown) => {
        assert.ok(error instanceof InterviewServiceError)
        assert.equal(error.kind, 'upstream')
        assert.equal(error.message, 'The agent declined to respond.')
        return true
      },
    )
    assert.equal(createCalls.length, 2)
  })

  it('survives also when the conversation cleanup endpoint fails (best-effort)', async () => {
    const client = {
      responses: {
        create: (() => {
          let calls = 0
          return async () => {
            calls += 1
            return calls === 1
              ? refusalResponse('resp_1')
              : successResponse('Recovered question.')
          }
        })(),
        inputItems: {
          list: async () => {
            throw new Error('inputItems unavailable')
          },
        },
      },
      conversations: {
        items: {
          delete: async () => {
            throw new Error('delete unavailable')
          },
        },
      },
    } as unknown as OpenAIClientParam
    const extracted = await sendWithRefusalRetry(client, 'conv_1', 'content')
    assert.equal(extracted.text, 'Recovered question.')
  })
})

describe('mock regression', () => {
  it('local mock interview starts without any Foundry call', async () => {
    if (!isMockMode()) {
      // Real Foundry is configured in this environment - the mock path is
      // already exercised in CI/dev where credentials are absent.
      return
    }
    const result = await startInterview({
      name: 'Test User',
      role: 'Software Engineer',
      experience: '3 years',
      skills: ['TypeScript', 'React'],
      focus: 'technical',
      mode: 'practice',
      questionCount: 5,
    })
    assert.equal(result.mode, 'local-mock')
    assert.ok(result.question.text.length > 0)
  })
})

describe('parseAgentReply', () => {
  it('returns analyzed evaluation with all 7 scores as integers 1-10 (TEST 5)', () => {
    const parsed = parseAgentReply(`Tell me about yourself.
<<<EVALUATION>>>
${VALID_EVAL}`)
    assert.equal(parsed.text, 'Tell me about yourself.')
    assert.ok(parsed.evaluation !== null)
    assert.equal(parsed.evaluation.difficultyAdjustment, 'maintain')
    const categories = [
      parsed.evaluation.technical,
      parsed.evaluation.relevance,
      parsed.evaluation.communication,
      parsed.evaluation.clarity,
      parsed.evaluation.structure,
      parsed.evaluation.confidence,
      parsed.evaluation.depth,
    ]
    assert.equal(categories.length, 7, 'exactly seven categories are present')
    for (const score of categories) {
      assert.equal(Number.isInteger(score), true, `score must be an integer, got ${score}`)
      assert.ok(score >= 1 && score <= 10, `score must be within 1-10, got ${score}`)
    }
  })

  it('returns the question with evaluation null for malformed JSON (interview continues, TEST 7)', () => {
    const parsed = parseAgentReply(`Tell me about yourself.
<<<EVALUATION>>>
{"technical": "x"}`)
    assert.equal(parsed.text, 'Tell me about yourself.')
    assert.equal(parsed.evaluation, null)
  })
})