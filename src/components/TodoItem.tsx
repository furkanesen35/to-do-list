"use client";

import { useState } from "react";
import type { Todo, User } from "./TodoList";
import CommentSection from "./CommentSection";
import { getContrastTextColor, getTextColorForGradient } from "@/lib/colorUtils";

type TodoItemProps = {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onAddSubTodo?: (parentId: string, title: string) => void;
  currentUserId: string;
  allUsers: User[];
  onDragStart?: (e: React.DragEvent, todoId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, status: Todo["status"]) => void;
  isSubTodo?: boolean;
};

export default function TodoItem({ 
  todo, 
  onUpdate, 
  onDelete, 
  onAddSubTodo,
  currentUserId,
  allUsers,
  onDragStart, 
  onDragOver, 
  onDrop,
  isSubTodo = false 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : "");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(todo.assignedUserIds);
  const [showComments, setShowComments] = useState(false);
  const [showSubTodos, setShowSubTodos] = useState(true);
  const [isAddingSubTodo, setIsAddingSubTodo] = useState(false);
  const [newSubTodoTitle, setNewSubTodoTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isChildHovered, setIsChildHovered] = useState(false);

  const toggleAssignedUser = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      // Don't allow removing the last user
      if (assignedUserIds.length > 1) {
        setAssignedUserIds(assignedUserIds.filter((id) => id !== userId));
      }
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
  };

  const getBackgroundColor = () => {
    if (todo.assignedUserIds.length === 1) {
      // Single user - use creator's color
      return todo.creator.color;
    } else if (todo.assignedUserIds.length > 1) {
      // Multiple users - create gradient with assigned users' colors
      const assignedUsers = allUsers.filter((u) => todo.assignedUserIds.includes(u.id));
      const colors = assignedUsers.map((u) => u.color).join(", ");
      return `linear-gradient(135deg, ${colors})`;
    }
    return todo.creator.color;
  };

  const backgroundStyle = todo.assignedUserIds.length > 1
    ? { background: getBackgroundColor() }
    : { backgroundColor: getBackgroundColor() };

  const textColor = todo.assignedUserIds.length > 1
    ? getTextColorForGradient(allUsers.filter((u) => todo.assignedUserIds.includes(u.id)).map((u) => u.color))
    : getContrastTextColor(todo.creator.color);

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubTodo) {
      // Notify parent that a child is hovered
      const parentDiv = (e.currentTarget as HTMLElement).parentElement?.closest('.parent-todo');
      if (parentDiv) {
        (parentDiv as any).__childHovered = true;
      }
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubTodo) {
      const parentDiv = (e.currentTarget as HTMLElement).parentElement?.closest('.parent-todo');
      if (parentDiv) {
        (parentDiv as any).__childHovered = false;
      }
    }
    setIsHovered(false);
  };

  const getDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
      return "Today";
    } else if (date >= yesterday && date < today) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const priorityColors = {
    LOW: "bg-gray-700 text-gray-300",
    MEDIUM: "bg-blue-700 text-blue-200",
    HIGH: "bg-yellow-700 text-yellow-200",
    URGENT: "bg-red-700 text-red-200",
  };

  const handleSave = () => {
    onUpdate(todo.id, { 
      title, 
      description,
      priority,
      dueDate: dueDate || null,
      assignedUserIds,
    });
    setIsEditing(false);
  };

  const handleAddSubTodo = () => {
    if (newSubTodoTitle.trim() && onAddSubTodo) {
      onAddSubTodo(todo.id, newSubTodoTitle);
      setNewSubTodoTitle("");
      setIsAddingSubTodo(false);
    }
  };

  const commentsCount = (todo as any)._count?.comments || 0;
  const subTodos = (todo as any).subTodos || [];
  
  // Debug: log comment count for subtasks
  if (isSubTodo) {
    console.log(`[SUBTODO] ${todo.title} - _count:`, (todo as any)._count, `commentsCount: ${commentsCount}`);
  }

  const handleStatusChange = (status: Todo["status"]) => {
    onUpdate(todo.id, { status });
  };

  const shouldShowButtons = isHovered && !isChildHovered;

  return (
    <div
      onDragStart={(e) => {
        // Prevent drag if text is selected
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          e.preventDefault();
          return;
        }
        onDragStart?.(e, todo.id);
      }}
      draggable={!isEditing}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={(el) => {
        if (el && !isSubTodo) {
          const checkChild = () => {
            setIsChildHovered(!!(el as any).__childHovered);
          };
          el.addEventListener('mouseenter', checkChild, true);
          el.addEventListener('mouseleave', checkChild, true);
        }
      }}
      style={{ ...backgroundStyle, color: textColor }}
      className={`${isSubTodo ? 'p-1.5' : 'p-2'} rounded-lg border-2 border-gray-700 transition-all cursor-move hover:shadow-lg ${isEditing ? 'cursor-default' : ''} ${isSubTodo ? 'bg-opacity-80 border-opacity-50' : 'parent-todo'}`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Assigned To</label>
            <div className="flex flex-wrap gap-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAssignedUser(user.id)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    assignedUserIds.includes(user.id)
                      ? ""
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  style={{
                    backgroundColor: assignedUserIds.includes(user.id) ? user.color : undefined,
                    color: assignedUserIds.includes(user.id) ? getContrastTextColor(user.color) : undefined,
                  }}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Row 1: Title, Buttons, and Priority */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
            <h3 
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()}
              className={`flex-1 font-semibold select-text cursor-text ${isSubTodo ? 'text-xs' : 'text-base'}`}
            >{todo.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <div className={`flex items-center gap-2 transition-opacity ${shouldShowButtons ? 'opacity-100' : 'opacity-0'}`}>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-xs"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
              <button
                onClick={() => setShowComments(true)}
                className="relative w-6 h-6 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-xs"
                title="Comments"
              >
                💬
                {commentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {commentsCount}
                  </span>
                )}
              </button>
              <span
                className={`px-2 py-1 text-xs rounded-full ${priorityColors[todo.priority]}`}
              >
                {todo.priority}
              </span>
            </div>
          </div>
          
          {/* Row 2: Description */}
          {todo.description && (
            <p 
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()}
              className="select-text cursor-text"
              style={{ opacity: 0.9 }}
            >{todo.description}</p>
          )}
          
          {/* Row 3: Dates */}
          <div className="flex items-center gap-3 text-xs select-text" style={{ opacity: 0.8 }}>
            <span title={`Created: ${new Date(todo.createdAt).toLocaleString()}`}>📅 {getDateDisplay(todo.createdAt)}</span>
            {todo.dueDate && (
              <span title={`Due: ${new Date(todo.dueDate).toLocaleString()}`}>🎯 {getDateDisplay(todo.dueDate)}</span>
            )}
          </div>

          {/* Sub-todos Section (only for parent todos) */}
          {!isSubTodo && (
            <div className="mt-1 pt-1 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowSubTodos(!showSubTodos)}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ opacity: 0.8 }}
                >
                  {showSubTodos ? "▼" : "▶"} Sub-tasks ({subTodos.length})
                </button>
                <button
                  onClick={() => setIsAddingSubTodo(true)}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Add Sub-task
                </button>
              </div>

              {showSubTodos && (
                <div className="space-y-1">
                  {isAddingSubTodo && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSubTodoTitle}
                        onChange={(e) => setNewSubTodoTitle(e.target.value)}
                        placeholder="Sub-task title..."
                        className="flex-1 px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === "Enter" && handleAddSubTodo()}
                        autoFocus
                      />
                      <button
                        onClick={handleAddSubTodo}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingSubTodo(false);
                          setNewSubTodoTitle("");
                        }}
                        className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {subTodos.map((subTodo: Todo) => (
                    <TodoItem
                      key={subTodo.id}
                      todo={subTodo}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onAddSubTodo={onAddSubTodo}
                      currentUserId={currentUserId}
                      allUsers={allUsers}
                      isSubTodo={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comment Section Modal */}
      <CommentSection
        todoId={todo.id}
        currentUserId={currentUserId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
}
