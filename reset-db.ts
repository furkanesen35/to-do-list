import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  
  // Delete all data
  await prisma.comment.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
  
  console.log("Creating users...");
  
  const furkan = await prisma.user.create({
    data: {
      name: "furkan",
      color: "#FCD34D",
    },
  });
  
  const john = await prisma.user.create({
    data: {
      name: "John",
      color: "#1E3A8A",
    },
  });
  
  const jane = await prisma.user.create({
    data: {
      name: "Jane",
      color: "#7C2D12",
    },
  });
  
  console.log("\nCreated users:");
  console.log(`- ${furkan.name} (${furkan.id})`);
  console.log(`- ${john.name} (${john.id})`);
  console.log(`- ${jane.name} (${jane.id})`);
  
  console.log("\nCreating sample todos...");
  
  await prisma.todo.create({
    data: {
      title: "Setup project",
      description: "Initialize the project with all dependencies",
      status: "DONE",
      priority: "HIGH",
      listOwnerId: furkan.id,
      createdById: furkan.id,
      assignedUserIds: [furkan.id],
    },
  });
  
  await prisma.todo.create({
    data: {
      title: "Review code",
      description: "Review the pull requests",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      listOwnerId: john.id,
      createdById: furkan.id,
      assignedUserIds: [john.id, jane.id],
      dueDate: new Date("2026-01-10"),
    },
  });
  
  await prisma.todo.create({
    data: {
      title: "Write documentation",
      description: "Document the API endpoints",
      status: "TODO",
      priority: "LOW",
      listOwnerId: jane.id,
      createdById: john.id,
      assignedUserIds: [jane.id],
      dueDate: new Date("2026-01-15"),
    },
  });
  
  console.log("✅ Database reset complete!");
  console.log("\n⚠️ IMPORTANT: Clear your browser's localStorage and refresh the page!");
  console.log("In browser console, run: localStorage.clear()");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
