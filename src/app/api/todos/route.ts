import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        parentId: null, // Only get parent todos, not sub-todos
      },
      include: {
        listOwner: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subTodos: {
          include: {
            listOwner: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, listOwnerId, createdById, assignedUserIds, priority, dueDate, parentId } = body;

    if (!title || !listOwnerId || !createdById) {
      return NextResponse.json(
        { error: "Title, listOwnerId, and createdById are required" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        listOwnerId,
        createdById,
        assignedUserIds: assignedUserIds || [],
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        parentId: parentId || null,
      },
      include: {
        listOwner: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subTodos: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
