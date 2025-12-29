import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all comments for a specific todo
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const todoId = searchParams.get("todoId");

    if (!todoId) {
      return NextResponse.json(
        { error: "todoId is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { todoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST create a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, todoId, userId } = body;

    if (!text || !todoId || !userId) {
      return NextResponse.json(
        { error: "text, todoId, and userId are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        todoId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
