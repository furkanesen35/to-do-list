import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recursive function to fetch todos with all nested subtodos
async function getTodosWithSubTodos(parentId: string | null = null): Promise<any[]> {
  const todos = await prisma.todo.findMany({
    where: {
      parentId: parentId,
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
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: parentId === null 
      ? { createdAt: "desc" }  // Root todos ordered desc
      : { createdAt: "asc" },   // Subtodos ordered asc
  });

  // Recursively fetch subtodos for each todo
  const todosWithSubTodos = await Promise.all(
    todos.map(async (todo) => {
      const subTodos = await getTodosWithSubTodos(todo.id);
      return {
        ...todo,
        subTodos,
      };
    })
  );

  return todosWithSubTodos;
}

export async function GET() {
  try {
    const todos = await getTodosWithSubTodos(null);
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
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
    
    // Check if users exist
    const listOwner = await prisma.user.findUnique({ where: { id: listOwnerId } });
    const creator = await prisma.user.findUnique({ where: { id: createdById } });
    
    if (!listOwner) {
      return NextResponse.json(
        { error: `List owner with id ${listOwnerId} does not exist` },
        { status: 400 }
      );
    }
    
    if (!creator) {
      return NextResponse.json(
        { error: `Creator with id ${createdById} does not exist` },
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
    console.error("Failed to create todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
