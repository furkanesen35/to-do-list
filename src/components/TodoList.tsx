"use client";

import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import UserTabs from "./UserTabs";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type User = {
  id: string;
  name: string;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "YESTERDAY" | "LAST_WEEK">("ALL");

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error("Invalid todos data:", data);
        setTodos([]);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Invalid users data:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const handleAddUser = async (name: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setSelectedUserId(newUser.id);
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user and all their todos.")) {
      return;
    }
    try {
      await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const remainingUsers = users.filter((u) => u.id !== userId);
      setUsers(remainingUsers);
      if (selectedUserId === userId) {
        setSelectedUserId(remainingUsers.length > 0 ? remainingUsers[0].id : null);
      }
      setTodos(todos.filter((t) => t.userId !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateUser = async (userId: string, name: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleAddTodo = async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "user">) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const userTodos = selectedUserId
    ? todos.filter((todo) => todo.userId === selectedUserId)
    : [];

  const getFilteredByDate = (todos: Todo[]) => {
    if (dateFilter === "ALL") return todos;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return todos.filter((todo) => {
      const createdAt = new Date(todo.createdAt);
      if (dateFilter === "TODAY") {
        return createdAt >= today;
      } else if (dateFilter === "YESTERDAY") {
        return createdAt >= yesterday && createdAt < today;
      } else if (dateFilter === "LAST_WEEK") {
        return createdAt >= lastWeek;
      }
      return true;
    });
  };

  const filteredByStatus = filter === "ALL" 
    ? userTodos 
    : userTodos.filter((todo) => todo.status === filter);
    
  const filteredTodos = getFilteredByDate(filteredByStatus);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserTabs
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
      />

      {selectedUser && (
        <>
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
          </div>

          <TodoForm userId={selectedUser.id} onAdd={handleAddTodo} />
          
          <div className="space-y-3">
            <div className="flex gap-2 justify-center flex-wrap">
              {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 justify-center flex-wrap">
              {["ALL", "TODAY", "YESTERDAY", "LAST_WEEK"].map((date) => (
                <button
                  key={date}
                  onClick={() => setDateFilter(date as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateFilter === date
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {date === "LAST_WEEK" ? "Last Week" : date.charAt(0) + date.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No todos found for {selectedUser.name}. Create one above!
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))
            )}
          </div>
        </>
      )}

      {!selectedUser && users.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No team members yet. Click the + button above to add someone!
        </div>
      )}
    </div>
  );
}
