import OpenAI from 'openai'

// Import system prompts
import promptMain from '@/assets/prompts/prompt.md?raw'
import promptZh from '@/assets/prompts/prompt.zh-CN.md?raw'
import promptSkill from '@/assets/prompts/SKILL.md?raw'

const SYSTEM_PROMPT = `${promptMain}\n\n${promptZh}\n\n${promptSkill}`

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export function useAI() {
  
  async function* streamChat(messages: { role: string; content: string }[], config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('API Key is missing. Please check settings.')
    }

    console.log(config)

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true
    })

    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      yield content
    }
  }

  return {
    streamChat
  }
}
