"use client";

import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import TaskTable from "./TaskTable";
import ProfileSwitcher from "./ProfileSwitcher";
import WelcomeModal from "./WelcomeModal";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  listOwnerId: string;
  createdById: string;
  assignedUserIds: string[];
  parentId: string | null;
  listOwner: {
    id: string;
    name: string;
    color: string;
  };
  creator: {
    id: string;
    name: string;
    color: string;
  };
};

export type User = {
  id: string;
  name: string;
  color: string;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Who you are (auth)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // Whose list you're viewing
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "YESTERDAY" | "LAST_WEEK">("ALL");
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
    fetchUsers();
    
    // Check if user has logged in before
    const savedUserId = localStorage.getItem("currentUserId");
    console.log("========== INITIAL LOAD ==========");
    console.log("Saved user ID from localStorage:", savedUserId);
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    // Show welcome modal if no user logged in
    if (!currentUserId && users.length >= 0 && !loading) {
      setShowWelcomeModal(true);
    }
  }, [currentUserId, users, loading]);

  useEffect(() => {
    // Auto-select first user's list to view
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const handleSelectCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem("currentUserId", userId);
    setShowWelcomeModal(false);
  };

  const handleCreateUser = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const newUser = await response.json();
      setUsers([...users, newUser]);
      handleSelectCurrentUser(newUser.id);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

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
      console.log("========== FETCHED USERS ==========");
      console.log("Users in database:", data);
      if (Array.isArray(data)) {
        setUsers(data);
        console.log("User IDs:", data.map(u => `${u.name}: ${u.id}`));
      } else {
        console.error("Invalid users data:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const handleAddUser = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
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
      setTodos(todos.filter((t) => t.listOwnerId !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateUser = async (userId: string, name: string, color: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
      
      // Update todos to reflect the new user name/color
      setTodos(todos.map((todo) => ({
        ...todo,
        listOwner: todo.listOwner.id === userId ? { ...todo.listOwner, name, color } : todo.listOwner,
        creator: todo.creator.id === userId ? { ...todo.creator, name, color } : todo.creator,
      })));
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleAddTodo = async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "listOwner" | "creator">) => {
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
      console.log("✅ PATCH response for todo:", id, updatedTodo);
      console.log("  - Has creator?", !!updatedTodo.creator);
      console.log("  - Creator color:", updatedTodo.creator?.color);
      
      // Refetch all todos to ensure parent todos reflect subtask changes
      await fetchTodos();
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

  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    setDraggedTodoId(todoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Todo["status"]) => {
    e.preventDefault();
    if (draggedTodoId) {
      await handleUpdateTodo(draggedTodoId, { status: newStatus });
      setDraggedTodoId(null);
    }
  };

  const handleAddSubTodo = async (parentId: string, title: string, description: string, priority: string, dueDate: string, assignedUserIds: string[]) => {
    if (!selectedUserId || !currentUserId) {
      console.error("Cannot add subtask: selectedUserId =", selectedUserId, "currentUserId =", currentUserId);
      alert("Please select a user from the dropdown first");
      return;
    }
    
    // Validate that currentUserId exists in users list
    const userExists = users.find(u => u.id === currentUserId);
    if (!userExists) {
      console.error("Current user ID does not exist in database:", currentUserId);
      alert("Your user account no longer exists. Please select a different user from the dropdown.");
      localStorage.removeItem("currentUserId");
      setCurrentUserId(null);
      setShowWelcomeModal(true);
      return;
    }
    
    const payload = {
      title,
      description: description || null,
      listOwnerId: selectedUserId,
      createdById: currentUserId,
      assignedUserIds,
      parentId,
      status: "TODO",
      priority,
      dueDate: dueDate || null,
    };
    
    console.log("Creating subtask with payload:", payload);
    
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Failed to create subtask: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const newSubTodo = await response.json();
      console.log("Subtask created successfully:", newSubTodo);
      
      // Refresh todos to get updated parent with sub-todos
      await fetchTodos();
    } catch (error) {
      console.error("Failed to add sub-todo:", error);
      alert("Failed to add subtask. Check console for details.");
    }
  };

  const userTodos = selectedUserId
    ? todos.filter((todo) => todo.listOwnerId === selectedUserId)
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

  const filteredTodos = getFilteredByDate(userTodos);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  const todosByStatus = {
    TODO: filteredTodos.filter(t => t.status === "TODO"),
    IN_PROGRESS: filteredTodos.filter(t => t.status === "IN_PROGRESS"),
    DONE: filteredTodos.filter(t => t.status === "DONE")
  };

  return (
    <div className="space-y-6">
      <ProfileSwitcher
        users={users}
        currentUserId={currentUserId}
        onSelectUser={handleSelectCurrentUser}
      />

      <TaskTable
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
      />

      <WelcomeModal
        show={showWelcomeModal}
        users={users}
        onSelectUser={handleSelectCurrentUser}
        onCreateUser={handleCreateUser}
      />

      {selectedUser && currentUserId && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <TodoForm 
              currentUserId={currentUserId}
              selectedUserId={selectedUser.id}
              allUsers={users}
              onAdd={handleAddTodo}
            />
            
            <div className="flex gap-2 flex-wrap">
              {["ALL", "TODAY", "YESTERDAY", "LAST_WEEK"].map((date) => (
                <button
                  key={date}
                  onClick={() => setDateFilter(date as any)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* TODO Column */}
            <div 
              className="bg-gray-800 rounded-lg p-4 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "TODO")}
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center justify-between">
                <span>📝 Todo</span>
                <span className="text-sm bg-blue-600 px-2 py-1 rounded">{todosByStatus.TODO.length}</span>
              </h3>
              <div className="space-y-3">
                {todosByStatus.TODO.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No todos</div>
                ) : (
                  todosByStatus.TODO.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                      onAddSubTodo={handleAddSubTodo}
                      currentUserId={currentUserId || ""}
                      allUsers={users}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))
                )}
              </div>
            </div>

            {/* IN_PROGRESS Column */}
            <div 
              className="bg-gray-800 rounded-lg p-4 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center justify-between">
                <span>⚡ In Progress</span>
                <span className="text-sm bg-yellow-600 px-2 py-1 rounded">{todosByStatus.IN_PROGRESS.length}</span>
              </h3>
              <div className="space-y-3">
                {todosByStatus.IN_PROGRESS.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No tasks in progress</div>
                ) : (
                  todosByStatus.IN_PROGRESS.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                      onAddSubTodo={handleAddSubTodo}
                      currentUserId={currentUserId || ""}
                      allUsers={users}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))
                )}
              </div>
            </div>

            {/* DONE Column */}
            <div 
              className="bg-gray-800 rounded-lg p-4 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "DONE")}
            >
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center justify-between">
                <span>✅ Done</span>
                <span className="text-sm bg-green-600 px-2 py-1 rounded">{todosByStatus.DONE.length}</span>
              </h3>
              <div className="space-y-3">
                {todosByStatus.DONE.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No completed tasks</div>
                ) : (
                  todosByStatus.DONE.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                      onAddSubTodo={handleAddSubTodo}
                      currentUserId={currentUserId || ""}
                      allUsers={users}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))
                )}
              </div>
            </div>
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
