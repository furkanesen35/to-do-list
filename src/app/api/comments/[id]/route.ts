import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.comment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
