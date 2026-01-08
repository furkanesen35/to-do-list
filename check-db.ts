import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n========== USERS ==========");
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));
  
  console.log("\n========== TODOS ==========");
  const todos = await prisma.todo.findMany({
    include: {
      listOwner: true,
      creator: true,
    }
  });
  console.log(JSON.stringify(todos, null, 2));
  
  console.log("\n========== SUMMARY ==========");
  console.log(`Total users: ${users.length}`);
  console.log(`Total todos: ${todos.length}`);
  
  // Check for any todos with invalid user references
  const invalidTodos = todos.filter(t => !t.creator || !t.listOwner);
  if (invalidTodos.length > 0) {
    console.log("\n⚠️ INVALID TODOS (missing creator or listOwner):");
    console.log(JSON.stringify(invalidTodos, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
