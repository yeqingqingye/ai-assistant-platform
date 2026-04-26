import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. AI features will not work.")
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI 写作助手 - 生成内容
export async function generateWriting(
  prompt: string,
  contentType: string,
  tone: string = "professional",
  wordCount?: number
) {
  try {
    const systemPrompt = `You are a professional writing assistant. Create high-quality ${contentType} content in a ${tone} tone.${wordCount ? ` Target approximately ${wordCount} words.` : ""}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // 使用更经济的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: wordCount ? Math.min(wordCount * 2, 4000) : 2000,
    })

    return response.choices[0]?.message?.content || "生成内容为空"
  } catch (error) {
    console.error("Generate writing error:", error)
    throw new Error("AI写作服务暂时不可用，请稍后重试")
  }
}

// AI 文档问答 - 回答问题
export async function answerQuestion(documentContent: string, question: string) {
  try {
    const systemPrompt = `You are a helpful assistant that answers questions based on the provided document. Be concise and accurate. If the answer is not in the document, say so.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Document:\n${documentContent}\n\nQuestion: ${question}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    return response.choices[0]?.message?.content || "无法生成回答"
  } catch (error) {
    console.error("Answer question error:", error)
    throw new Error("AI问答服务暂时不可用，请稍后重试")
  }
}

// AI 代码审查
export async function reviewCode(code: string, language: string) {
  try {
    const systemPrompt = `You are an expert code reviewer. Review the provided ${language} code and provide:
1. A quality score (0-100)
2. A list of issues found
3. Specific suggestions for improvement
4. An overall summary

Return your response in JSON format with these keys: score (number), issues (array of objects with title and description), suggestions (array of objects with title and description), summary (string).`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || "{}"
    const result = JSON.parse(content)

    // 验证并规范化返回的数据结构
    return {
      score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : 0,
      issues: Array.isArray(result.issues) ? result.issues : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      summary: typeof result.summary === 'string' ? result.summary : "审查完成",
    }
  } catch (error) {
    console.error("Review code error:", error)
    // 返回默认结构避免崩溃
    return {
      score: 0,
      issues: [{ 
        title: "AI服务调用失败", 
        description: error instanceof Error ? error.message : "无法连接到AI服务，请检查API密钥或稍后重试" 
      }],
      suggestions: [{ 
        title: "稍后重试", 
        description: "请稍等片刻后再次尝试代码审查" 
      }],
      summary: "代码审查服务暂时不可用，请稍后重试"
    }
  }
}
