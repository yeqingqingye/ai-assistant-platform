import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWriting } from "@/lib/openai";

// GET - 获取用户的写作任务列表
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await prisma.writingTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get writing tasks error:", error);
    return NextResponse.json({ error: "Failed to get tasks" }, { status: 500 });
  }
}

// POST - 创建新的写作任务
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { title, contentType, prompt, tone, wordCount } =
      await request.json();

    if (!prompt || !contentType) {
      return NextResponse.json(
        { error: "Prompt and content type are required" },
        { status: 400 },
      );
    }

    // Create task with pending status
    const task = await prisma.writingTask.create({
      data: {
        userId,
        title: title || `Writing Task - ${new Date().toLocaleDateString()}`,
        contentType,
        prompt,
        tone,
        wordCount,
        status: "processing",
      },
    });

    // Generate content using OpenAI
    try {
      const generatedContent = await generateWriting(
        prompt,
        contentType,
        tone,
        wordCount,
      );

      // Update task with generated content
      const updatedTask = await prisma.writingTask.update({
        where: { id: task.id },
        data: {
          generatedContent,
          status: "completed",
        },
      });

      return NextResponse.json(updatedTask, { status: 201 });
    } catch (aiError) {
      // Update task status to failed
      await prisma.writingTask.update({
        where: { id: task.id },
        data: { status: "failed" },
      });

      throw aiError;
    }
  } catch (error) {
    console.error("Create writing task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

// DELETE - 删除写作任务
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const task = await prisma.writingTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.writingTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete writing task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
