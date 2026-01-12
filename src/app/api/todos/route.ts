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
    console.log("========== POST /api/todos ==========");
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const { title, description, listOwnerId, createdById, assignedUserIds, priority, dueDate, parentId } = body;

    console.log("Extracted values:");
    console.log("  title:", title);
    console.log("  listOwnerId:", listOwnerId);
    console.log("  createdById:", createdById);
    console.log("  assignedUserIds:", assignedUserIds);
    console.log("  parentId:", parentId);

    if (!title || !listOwnerId || !createdById) {
      console.log("❌ Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Title, listOwnerId, and createdById are required" },
        { status: 400 }
      );
    }
    
    // Check if users exist
    const listOwner = await prisma.user.findUnique({ where: { id: listOwnerId } });
    const creator = await prisma.user.findUnique({ where: { id: createdById } });
    
    console.log("User validation:");
    console.log("  listOwner exists:", !!listOwner, listOwner?.name);
    console.log("  creator exists:", !!creator, creator?.name);
    
    if (!listOwner) {
      console.log("❌ listOwner not found in database");
      return NextResponse.json(
        { error: `List owner with id ${listOwnerId} does not exist` },
        { status: 400 }
      );
    }
    
    if (!creator) {
      console.log("❌ creator not found in database");
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

    console.log("✅ Todo created successfully:", todo.id);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Failed to create todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
