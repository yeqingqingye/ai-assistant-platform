import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewCode } from "@/lib/openai"

// GET - 获取用户的代码审查列表
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const reviews = await prisma.codeReview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Get code reviews error:", error)
    return NextResponse.json({ error: "Failed to get reviews" }, { status: 500 })
  }
}

// POST - 创建新的代码审查
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { title, code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      )
    }

    // Create review with pending status
    const review = await prisma.codeReview.create({
      data: {
        userId,
        title: title || `Code Review - ${new Date().toLocaleDateString()}`,
        code,
        language,
        status: "processing"
      }
    })

    // Perform code review using OpenAI
    try {
      const reviewResult = await reviewCode(code, language)

      // Update review with results
      const updatedReview = await prisma.codeReview.update({
        where: { id: review.id },
        data: {
          reviewResult: reviewResult.summary,
          suggestions: reviewResult.suggestions || [],
          issues: reviewResult.issues || [],
          score: reviewResult.score || 0,
          status: "completed"
        }
      })

      return NextResponse.json(updatedReview, { status: 201 })
    } catch (aiError) {
      console.error("AI review error:", aiError)
      
      // Update review status to failed with error message
      await prisma.codeReview.update({
        where: { id: review.id },
        data: { 
          status: "failed",
          reviewResult: aiError instanceof Error ? aiError.message : "AI审查失败"
        }
      })

      return NextResponse.json(
        { error: "AI review failed", details: aiError instanceof Error ? aiError.message : "Unknown error" },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("Create code review error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

// DELETE - 删除代码审查
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get("id")

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    const review = await prisma.codeReview.findFirst({
      where: { id: reviewId, userId }
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await prisma.codeReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Delete code review error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
