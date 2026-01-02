import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { id: "temp-john" },
      update: {},
      create: {
        id: "temp-john",
        name: "John Doe",
      },
    }),
    prisma.user.upsert({
      where: { id: "temp-jane" },
      update: {},
      create: {
        id: "temp-jane",
        name: "Jane Smith",
      },
    }),
    prisma.user.upsert({
      where: { id: "temp-bob" },
      update: {},
      create: {
        id: "temp-bob",
        name: "Bob Johnson",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create sample todos
  const todos = await Promise.all([
    prisma.todo.create({
      data: {
        title: "Complete project proposal",
        description: "Finalize and submit the Q1 project proposal",
        status: "IN_PROGRESS",
        priority: "HIGH",
        listOwnerId: users[0].id,
        createdById: users[0].id,
        assignedUserIds: [users[0].id],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    }),
    prisma.todo.create({
      data: {
        title: "Review code changes",
        description: "Review pull requests for the new feature",
        status: "TODO",
        priority: "MEDIUM",
        listOwnerId: users[1].id,
        createdById: users[1].id,
        assignedUserIds: [users[1].id],
      },
    }),
    prisma.todo.create({
      data: {
        title: "Update documentation",
        description: "Update API documentation with new endpoints",
        status: "DONE",
        priority: "LOW",
        listOwnerId: users[2].id,
        createdById: users[2].id,
        assignedUserIds: [users[2].id],
      },
    }),
  ]);

  console.log(`Created ${todos.length} sample todos`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
