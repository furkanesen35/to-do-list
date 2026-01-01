import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
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
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Failed to fetch todo:", error);
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate, assignedUserIds, parentId } = body;

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedUserIds !== undefined && { assignedUserIds }),
        ...(parentId !== undefined && { parentId }),
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
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Failed to update todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
