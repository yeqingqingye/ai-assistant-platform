import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { answerQuestion } from "@/lib/openai"

// GET - 获取用户的文档列表
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        qas: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Get documents error:", error)
    return NextResponse.json({ error: "Failed to get documents" }, { status: 500 })
  }
}

// POST - 创建新文档或提问
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    // 如果是问答请求
    if (body.documentId && body.question) {
      const document = await prisma.document.findFirst({
        where: { id: body.documentId, userId }
      })

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      // 使用 OpenAI 回答问题
      const answer = await answerQuestion(document.content, body.question)

      // 保存问答记录
      const qa = await prisma.documentQA.create({
        data: {
          documentId: body.documentId,
          question: body.question,
          answer
        }
      })

      return NextResponse.json(qa, { status: 201 })
    }

    // 如果是创建新文档
    const { title, content, fileType } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const document = await prisma.document.create({
      data: {
        userId,
        title,
        content,
        fileType: fileType || "txt"
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Document operation error:", error)
    return NextResponse.json({ error: "Operation failed" }, { status: 500 })
  }
}

// DELETE - 删除文档
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId }
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    await prisma.document.delete({
      where: { id: documentId }
    })

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
