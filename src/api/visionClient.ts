import Anthropic from '@anthropic-ai/sdk'

export interface ParsedNutrition {
  label: string
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  fiberG: number
}

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [header, data] = result.split(',')
      const mediaType = header.match(/data:(.*?);base64/)?.[1] ?? file.type
      resolve({ data, mediaType })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const PROMPT = `この画像は食事の栄養成分表示(スクリーンショット)です。
写っている内容から、以下のJSON形式のみで回答してください。他の文章は一切含めないでください。
数値が読み取れない項目は0にしてください。単位はすべてグラム(g)、カロリーはkcalです。

{"label": "食品名や料理名の要約", "calories": 数値, "proteinG": 数値, "fatG": 数値, "carbsG": 数値, "fiberG": 数値}`

export async function parseNutritionImage(apiKey: string, file: File): Promise<ParsedNutrition> {
  const { data, mediaType } = await fileToBase64(file)

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
              data,
            },
          },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AIからの応答を読み取れませんでした')
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AIの応答からJSONを抽出できませんでした')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    label: String(parsed.label ?? '食事'),
    calories: Number(parsed.calories) || 0,
    proteinG: Number(parsed.proteinG) || 0,
    fatG: Number(parsed.fatG) || 0,
    carbsG: Number(parsed.carbsG) || 0,
    fiberG: Number(parsed.fiberG) || 0,
  }
}
