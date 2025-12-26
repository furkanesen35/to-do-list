# Office Todo List

A modern, full-stack todo list application for tracking office team progress, built with Next.js, Prisma, PostgreSQL, and Tailwind CSS.

## Features

- 📝 Create, read, update, and delete todos
- 👥 Assign todos to team members
- 🎯 Set priorities (Low, Medium, High, Urgent)
- 📅 Due date tracking
- 🔄 Status tracking (Todo, In Progress, Done)
- 🎨 Dark theme UI
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/office_todos?schema=public"
```

3. Initialize the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. (Optional) Seed the database with sample users:

```bash
npx prisma db seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### User Model
- id: Unique identifier
- name: User's name
- email: User's email (unique)
- todos: Related todos

### Todo Model
- id: Unique identifier
- title: Todo title
- description: Optional description
- status: TODO | IN_PROGRESS | DONE
- priority: LOW | MEDIUM | HIGH | URGENT
- dueDate: Optional due date
- userId: Assigned user
- user: Related user

## API Routes

### Todos
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `GET /api/todos/[id]` - Get a specific todo
- `PATCH /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

## Project Structure

```
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── todos/     # Todo endpoints
│   │   │   └── users/     # User endpoints
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── TodoList.tsx   # Main todo list
│   │   ├── TodoItem.tsx   # Individual todo item
│   │   └── TodoForm.tsx   # Todo creation form
│   └── lib/
│       └── prisma.ts      # Prisma client
├── .env.example           # Environment variables template
├── package.json           # Dependencies
└── README.md             # This file
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
