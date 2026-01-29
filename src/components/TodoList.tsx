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
  subTodos?: Todo[];
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
  const [dateFilter, setDateFilter] = useState<
    "ALL" | 
    "CREATED_TODAY" | "UPDATED_TODAY" | 
    "CREATED_YESTERDAY" | "UPDATED_YESTERDAY" | 
    "CREATED_THIS_WEEK" | "UPDATED_THIS_WEEK"
  >("ALL");
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [focusedColumn, setFocusedColumn] = useState<"TODO" | "IN_PROGRESS" | "DONE" | null>(null);

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Validate saved user ID once users are loaded
    if (users.length > 0 && !currentUserId) {
      const savedUserId = localStorage.getItem("currentUserId");
      
      if (savedUserId) {
        // Check if the saved user still exists
        const userExists = users.some(u => u.id === savedUserId);
        if (userExists) {
          setCurrentUserId(savedUserId);
        } else {
          localStorage.removeItem("currentUserId");
        }
      }
    }
  }, [users, currentUserId]);

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
      
      // Refresh todos to get updated parent with sub-todos
      await fetchTodos();
    } catch (error) {
      console.error("Failed to add sub-todo:", error);
      alert("Failed to add subtask. Check console for details.");
    }
  };

  const userTodos = selectedUserId
    ? todos.filter((todo) => todo.assignedUserIds.includes(selectedUserId))
    : [];

  // Extended type for todos with parent chain info
  type TodoWithContext = Todo & { 
    subTodos?: TodoWithContext[];
    parentChain?: { id: string; title: string }[];
    nestingLevel?: number;
  };

  // Flatten all todos and their nested subtasks with parent chain information
  const flattenTodos = (
    todos: (Todo & { subTodos?: Todo[] })[], 
    parentChain: { id: string; title: string }[] = [],
    nestingLevel: number = 0
  ): TodoWithContext[] => {
    const result: TodoWithContext[] = [];
    
    const flatten = (
      todo: Todo & { subTodos?: Todo[] }, 
      chain: { id: string; title: string }[],
      level: number
    ) => {
      result.push({
        ...todo,
        parentChain: chain.length > 0 ? [...chain] : undefined,
        nestingLevel: level,
        subTodos: [] // Remove subTodos for flat display
      });
      
      if (todo.subTodos && todo.subTodos.length > 0) {
        const newChain = [...chain, { id: todo.id, title: todo.title }];
        todo.subTodos.forEach(subTodo => flatten(subTodo, newChain, level + 1));
      }
    };
    
    todos.forEach(todo => flatten(todo, parentChain, nestingLevel));
    return result;
  };

  // Check if a specific todo matches the date filter
  const matchesDateFilter = (todo: Todo, filterType: typeof dateFilter): boolean => {
    if (filterType === "ALL") return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const checkDate = (dateStr: string, isCreated: boolean): boolean => {
      const date = new Date(dateStr);
      const prefix = isCreated ? "CREATED" : "UPDATED";
      
      if (filterType === `${prefix}_TODAY`) {
        return date >= today && date < tomorrow;
      } else if (filterType === `${prefix}_YESTERDAY`) {
        return date >= yesterday && date < today;
      } else if (filterType === `${prefix}_THIS_WEEK`) {
        return date >= weekStart && date < tomorrow;
      }
      return false;
    };

    const isCreatedFilter = filterType.startsWith("CREATED");
    const dateToCheck = isCreatedFilter ? todo.createdAt : todo.updatedAt;
    return checkDate(dateToCheck, isCreatedFilter);
  };

  const getFilteredByDate = (todos: (Todo & { subTodos?: Todo[] })[]): TodoWithContext[] => {
    if (dateFilter === "ALL") {
      return todos as TodoWithContext[];
    }
    
    // Flatten all todos with parent chain information
    const allTodos = flattenTodos(todos);
    
    // Filter only the todos that match the date filter
    return allTodos.filter(todo => matchesDateFilter(todo, dateFilter));
  };

  const filteredTodos = getFilteredByDate(userTodos);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleFocusColumn = (column: "TODO" | "IN_PROGRESS" | "DONE") => {
    setFocusedColumn(focusedColumn === column ? null : column);
  };

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
    <div className="flex flex-col h-screen">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold text-blue-400 whitespace-nowrap">📋 Office Todo</h1>
            <TaskTable
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={handleUpdateUser}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Filter by date"
              >
                🔍
                <span className="text-xs">
                  {dateFilter === "ALL" 
                    ? "All" 
                    : dateFilter === "CREATED_TODAY"
                    ? "Created Today"
                    : dateFilter === "UPDATED_TODAY"
                    ? "Updated Today"
                    : dateFilter === "CREATED_YESTERDAY"
                    ? "Created Yesterday"
                    : dateFilter === "UPDATED_YESTERDAY"
                    ? "Updated Yesterday"
                    : dateFilter === "CREATED_THIS_WEEK"
                    ? "Created Week"
                    : "Updated Week"}
                </span>
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setDateFilter("ALL");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                      dateFilter === "ALL"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    All Tasks
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <div className="px-3 py-1 text-xs text-gray-500 font-semibold">CREATED</div>
                  {["CREATED_TODAY", "CREATED_YESTERDAY", "CREATED_THIS_WEEK"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setDateFilter(filter as any);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                        dateFilter === filter
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {filter === "CREATED_TODAY" 
                        ? "Created Today" 
                        : filter === "CREATED_YESTERDAY"
                        ? "Created Yesterday"
                        : "Created This Week"}
                    </button>
                  ))}
                  <div className="border-t border-gray-700 my-1"></div>
                  <div className="px-3 py-1 text-xs text-gray-500 font-semibold">UPDATED</div>
                  {["UPDATED_TODAY", "UPDATED_YESTERDAY", "UPDATED_THIS_WEEK"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setDateFilter(filter as any);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                        dateFilter === filter
                          ? "bg-yellow-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {filter === "UPDATED_TODAY" 
                        ? "Updated Today" 
                        : filter === "UPDATED_YESTERDAY"
                        ? "Updated Yesterday"
                        : "Updated This Week"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <ProfileSwitcher
              users={users}
              currentUserId={currentUserId}
              onSelectUser={handleSelectCurrentUser}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-4 py-4">

      <WelcomeModal
        show={showWelcomeModal}
        users={users}
        onSelectUser={handleSelectCurrentUser}
        onCreateUser={handleCreateUser}
      />

      {selectedUser && currentUserId && (
        <div className="space-y-3">

          <div className="flex gap-4">
            {/* TODO Column */}
            <div
              className={`bg-gray-800 rounded-lg p-4 overflow-y-auto transition-all duration-300 ${
                focusedColumn === "TODO" 
                  ? "flex-[88]" 
                  : focusedColumn 
                  ? "flex-[6]" 
                  : "flex-1"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "TODO")}
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {focusedColumn === null || focusedColumn === "TODO" ? (
                    <>
                      <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="5" y="4" width="14" height="18" rx="2"/>
                        <path d="M9 10h6M9 14h6M9 18h4" strokeLinecap="round"/>
                        <path d="M9 10l1 1 2-2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Todo</span>
                      <button
                        onClick={() => handleFocusColumn("TODO")}
                        className="bg-white text-gray-900 hover:bg-gray-100 p-2 rounded transition-all hover:scale-110 flex items-center justify-center"
                        title={focusedColumn === "TODO" ? "Reset view" : "Focus this column"}
                      >
                        <span className="relative inline-block w-5 h-5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                            <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          {focusedColumn === "TODO" && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="block w-full h-[2px] bg-current transform rotate-45" style={{width: '130%'}}></span>
                            </span>
                          )}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleFocusColumn("TODO")}
                      className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                      title="Focus this column"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="5" y="4" width="14" height="18" rx="2"/>
                        <path d="M9 10h6M9 14h6M9 18h4" strokeLinecap="round"/>
                      </svg>
                      <span className="bg-white text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded transition-all flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </span>
                    </button>
                  )}
                </span>
                {(focusedColumn === null || focusedColumn === "TODO") && (
                  <span className="text-sm bg-blue-600 px-2 py-1 rounded">{todosByStatus.TODO.length}</span>
                )}
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
                      isColumnFocused={focusedColumn === null || focusedColumn === "TODO"}
                    />
                  ))
                )}
              </div>
            </div>

            {/* IN_PROGRESS Column */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 overflow-y-auto transition-all duration-300 ${
                focusedColumn === "IN_PROGRESS" 
                  ? "flex-[88]" 
                  : focusedColumn 
                  ? "flex-[6]" 
                  : "flex-1"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {focusedColumn === null || focusedColumn === "IN_PROGRESS" ? (
                    <>
                      🕐 In Progress
                      <button
                        onClick={() => handleFocusColumn("IN_PROGRESS")}
                        className="bg-white text-gray-900 hover:bg-gray-100 p-2 rounded transition-all hover:scale-110 flex items-center justify-center"
                        title={focusedColumn === "IN_PROGRESS" ? "Reset view" : "Focus this column"}
                      >
                        <span className="relative inline-block w-5 h-5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                            <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          {focusedColumn === "IN_PROGRESS" && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="block w-full h-[2px] bg-current transform rotate-45" style={{width: '130%'}}></span>
                            </span>
                          )}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleFocusColumn("IN_PROGRESS")}
                      className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                      title="Focus this column"
                    >
                      🕐
                      <span className="bg-white text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded transition-all flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </span>
                    </button>
                  )}
                </span>
                {(focusedColumn === null || focusedColumn === "IN_PROGRESS") && (
                  <span className="text-sm bg-yellow-600 px-2 py-1 rounded">{todosByStatus.IN_PROGRESS.length}</span>
                )}
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
                      isColumnFocused={focusedColumn === null || focusedColumn === "IN_PROGRESS"}
                    />
                  ))
                )}
              </div>
            </div>

            {/* DONE Column */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 overflow-y-auto transition-all duration-300 ${
                focusedColumn === "DONE" 
                  ? "flex-[88]" 
                  : focusedColumn 
                  ? "flex-[6]" 
                  : "flex-1"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "DONE")}
            >
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {focusedColumn === null || focusedColumn === "DONE" ? (
                    <>
                      🏁 Done
                      <button
                        onClick={() => handleFocusColumn("DONE")}
                        className="bg-white text-gray-900 hover:bg-gray-100 p-2 rounded transition-all hover:scale-110 flex items-center justify-center"
                        title={focusedColumn === "DONE" ? "Reset view" : "Focus this column"}
                      >
                        <span className="relative inline-block w-5 h-5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                            <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          {focusedColumn === "DONE" && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="block w-full h-[2px] bg-current transform rotate-45" style={{width: '130%'}}></span>
                            </span>
                          )}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleFocusColumn("DONE")}
                      className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                      title="Focus this column"
                    >
                      🏁
                      <span className="bg-white text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded transition-all flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M4 4 L4 8 M4 4 L8 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 4 L20 8 M20 4 L16 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 20 L4 16 M4 20 L8 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 20 L20 16 M20 20 L16 20" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </span>
                    </button>
                  )}
                </span>
                {(focusedColumn === null || focusedColumn === "DONE") && (
                  <span className="text-sm bg-green-600 px-2 py-1 rounded">{todosByStatus.DONE.length}</span>
                )}
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
                      isColumnFocused={focusedColumn === null || focusedColumn === "DONE"}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedUser && users.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No team members yet. Click the + button above to add someone!
        </div>
      )}
      </div>

      {/* Fixed Floating Add Button */}
      {selectedUser && currentUserId && (
        <button
          onClick={() => setShowAddTodoModal(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 z-40"
          title="Add new todo"
        >
          +
        </button>
      )}

      {/* Todo Form Modal */}
      {showAddTodoModal && selectedUser && currentUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Todo</h3>
              <button
                onClick={() => setShowAddTodoModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <TodoForm 
              currentUserId={currentUserId}
              selectedUserId={selectedUser.id}
              allUsers={users}
              onAdd={(todo) => {
                handleAddTodo(todo);
                setShowAddTodoModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
