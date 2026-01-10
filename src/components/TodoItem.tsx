"use client";

import { useState } from "react";
import type { Todo, User } from "./TodoList";
import CommentSection from "./CommentSection";
import {
  getContrastTextColor,
  getTextColorForGradient,
} from "@/lib/colorUtils";

type TodoItemProps = {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onAddSubTodo?: (
    parentId: string,
    title: string,
    description: string,
    priority: string,
    dueDate: string,
    assignedUserIds: string[]
  ) => void;
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
  isSubTodo = false,
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >(todo.priority);
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
  );
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    todo.assignedUserIds
  );
  const [showComments, setShowComments] = useState(false);
  const [showSubTodos, setShowSubTodos] = useState(true);
  const [isAddingSubTodo, setIsAddingSubTodo] = useState(false);
  const [newSubTodoTitle, setNewSubTodoTitle] = useState("");
  const [newSubTodoDescription, setNewSubTodoDescription] = useState("");
  const [newSubTodoPriority, setNewSubTodoPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [newSubTodoDueDate, setNewSubTodoDueDate] = useState("");
  const [newSubTodoAssignedUserIds, setNewSubTodoAssignedUserIds] = useState<
    string[]
  >(currentUserId ? [currentUserId] : []);
  const [isHovered, setIsHovered] = useState(false);
  const [isChildHovered, setIsChildHovered] = useState(false);

  const toggleSubTodoAssignedUser = (userId: string) => {
    if (newSubTodoAssignedUserIds.includes(userId)) {
      if (newSubTodoAssignedUserIds.length > 1) {
        setNewSubTodoAssignedUserIds(
          newSubTodoAssignedUserIds.filter((id) => id !== userId)
        );
      }
    } else {
      setNewSubTodoAssignedUserIds([...newSubTodoAssignedUserIds, userId]);
    }
  };

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
    // Fallback color if creator doesn't exist
    const fallbackColor = "#1E3A8A";
    
    // Debug logging
    if (isSubTodo) {
      console.log(`[SUBTASK COLOR] ${todo.title}:`, {
        creatorExists: !!todo.creator,
        creatorColor: todo.creator?.color,
        assignedUserIds: todo.assignedUserIds,
        willUseColor: todo.creator?.color || fallbackColor
      });
    }

    if (todo.assignedUserIds.length === 1) {
      // Single user - use creator's color
      return todo.creator?.color || fallbackColor;
    } else if (todo.assignedUserIds.length > 1) {
      // Multiple users - create gradient with assigned users' colors
      const assignedUsers = allUsers.filter((u) =>
        todo.assignedUserIds.includes(u.id)
      );
      if (assignedUsers.length === 0) return fallbackColor;
      const colors = assignedUsers.map((u) => u.color).join(", ");
      return `linear-gradient(135deg, ${colors})`;
    }
    return todo.creator?.color || fallbackColor;
  };

  const backgroundStyle =
    todo.assignedUserIds.length > 1
      ? { background: getBackgroundColor() }
      : { backgroundColor: getBackgroundColor() };

  const textColor =
    todo.assignedUserIds.length > 1
      ? getTextColorForGradient(
          allUsers
            .filter((u) => todo.assignedUserIds.includes(u.id))
            .map((u) => u.color)
        )
      : getContrastTextColor(todo.creator?.color || "#1E3A8A");

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubTodo) {
      // Notify parent that a child is hovered
      const parentDiv = (e.currentTarget as HTMLElement).parentElement?.closest(
        ".parent-todo"
      );
      if (parentDiv) {
        (parentDiv as any).__childHovered = true;
      }
    }
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubTodo) {
      const parentDiv = (e.currentTarget as HTMLElement).parentElement?.closest(
        ".parent-todo"
      );
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
    if (newSubTodoTitle.trim() && onAddSubTodo && currentUserId) {
      // Filter out any invalid user IDs
      const validAssignedUserIds = newSubTodoAssignedUserIds.filter(id => id && id !== "undefined");
      
      if (validAssignedUserIds.length === 0) return;
      
      onAddSubTodo(
        todo.id,
        newSubTodoTitle,
        newSubTodoDescription,
        newSubTodoPriority,
        newSubTodoDueDate,
        validAssignedUserIds
      );
      setNewSubTodoTitle("");
      setNewSubTodoDescription("");
      setNewSubTodoPriority("MEDIUM");
      setNewSubTodoDueDate("");
      setNewSubTodoAssignedUserIds(currentUserId ? [currentUserId] : []);
      setIsAddingSubTodo(false);
    }
  };

  const commentsCount = (todo as any)._count?.comments || 0;
  const subTodos = (todo as any).subTodos || [];

  // Debug: log comment count for subtasks
  if (isSubTodo) {
    console.log(
      `[SUBTODO] ${todo.title} - _count:`,
      (todo as any)._count,
      `commentsCount: ${commentsCount}`
    );
  }

  const handleStatusChange = (status: Todo["status"]) => {
    onUpdate(todo.id, { status });
  };

  const shouldShowButtons = isHovered && !isChildHovered;

  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragHandleStart = (e: React.DragEvent) => {
    console.log("🟢 Drag started for todo:", todo.id, todo.title);
    e.stopPropagation();
    setIsDragging(true);
    onDragStart?.(e, todo.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("todoId", todo.id);
    e.dataTransfer.setData("currentParentId", todo.parentId || "");
  };

  const handleDragHandleEnd = () => {
    console.log("🔴 Drag ended for todo:", todo.id, todo.title);
    setIsDragging(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("todoId");
    if (draggedId !== todo.id) {
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDropOnTask = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const draggedId = e.dataTransfer.getData("todoId");
    console.log("⬇️ Drop on task:", todo.id, "draggedId:", draggedId);
    if (draggedId && draggedId !== todo.id) {
      console.log("🔄 Making", draggedId, "a subtask of", todo.id);
      // Make dragged task a subtask of this task
      await onUpdate(draggedId, { parentId: todo.id });
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOnTask}
      ref={(el) => {
        if (el && !isSubTodo) {
          const checkChild = () => {
            setIsChildHovered(!!(el as any).__childHovered);
          };
          el.addEventListener("mouseenter", checkChild, true);
          el.addEventListener("mouseleave", checkChild, true);
        }
      }}
      style={{ ...backgroundStyle, color: textColor }}
      className={`${
        isSubTodo ? "p-1.5" : "p-2"
      } rounded-lg border-2 transition-all ${
        isEditing ? "cursor-default" : ""
      } ${isSubTodo ? "bg-opacity-80 border-opacity-50" : "parent-todo"} ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${
        isDropTarget
          ? "border-yellow-400 border-4 shadow-xl"
          : "border-gray-700"
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Priority
              </label>
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
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Assigned To
            </label>
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
                    backgroundColor: assignedUserIds.includes(user.id)
                      ? user.color
                      : undefined,
                    color: assignedUserIds.includes(user.id)
                      ? getContrastTextColor(user.color)
                      : undefined,
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
          {/* Row 1: Title, Buttons, and Priority - Always Visible */}
          <div className="flex items-center justify-between gap-2">
            {/* Expand/Collapse Icon */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-600 rounded transition-colors text-xs"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? "▼" : "▶"}
            </button>

            <h3
              className={`flex-1 font-semibold select-text cursor-text truncate ${
                isSubTodo ? "text-xs" : "text-sm"
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {todo.title}
            </h3>
            
            {/* Priority Badge - Always Visible */}
            <span
              className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                priorityColors[todo.priority]
              }`}
            >
              {todo.priority}
            </span>

            {/* Assigned Users - Always Visible as Small Icons */}
            <div className="flex -space-x-1 flex-shrink-0">
              {assignedUserIds.slice(0, 3).map((userId) => {
                const user = allUsers.find((u) => u.id === userId);
                return user ? (
                  <div
                    key={userId}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gray-800"
                    style={{
                      backgroundColor: user.color,
                      color: getContrastTextColor(user.color),
                    }}
                    title={user.name}
                  >
                    {user.name.charAt(0)}
                  </div>
                ) : null;
              })}
              {assignedUserIds.length > 3 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-600 border-2 border-gray-800">
                  +{assignedUserIds.length - 3}
                </div>
              )}
            </div>

            {/* Action Buttons - Always Visible on Hover */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div
                className={`flex items-center gap-1 transition-opacity ${
                  shouldShowButtons ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  draggable
                  onDragStart={handleDragHandleStart}
                  onDragEnd={handleDragHandleEnd}
                  className="w-6 h-6 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded transition-colors cursor-grab active:cursor-grabbing"
                  title="Drag to move or nest task"
                >
                  <span className="text-xs leading-none">⋮⋮</span>
                </div>
                {todo.parentId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(todo.id, { parentId: null });
                    }}
                    className="w-6 h-6 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-xs pointer-events-auto"
                    title="Promote to independent task"
                  >
                    ⬆️
                  </button>
                )}
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
            </div>
          </div>

          {/* Expanded Content - Only shown when isExpanded is true */}
          {isExpanded && (
            <>
              {/* Row 2: Description */}
              {todo.description && (
                <p className="select-text cursor-text ml-7" style={{ opacity: 0.9 }}>
                  {todo.description}
                </p>
              )}

              {/* Row 3: Dates */}
              <div
                className="flex items-center gap-3 text-xs select-text ml-7"
                style={{ opacity: 0.8 }}
              >
                <span
                  title={`Created: ${new Date(todo.createdAt).toLocaleString()}`}
                >
                  📅 {getDateDisplay(todo.createdAt)}
                </span>
                {todo.dueDate && (
                  <span title={`Due: ${new Date(todo.dueDate).toLocaleString()}`}>
                    🎯 {getDateDisplay(todo.dueDate)}
                  </span>
                )}
              </div>

              {/* Sub-todos Section (only for parent todos) */}
              {!isSubTodo && (
                <div className="mt-1 pt-1 ml-7 border-t border-gray-700">
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
                    <div className="p-3 mb-2 bg-gray-900 rounded-lg border border-gray-600 space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={newSubTodoTitle}
                          onChange={(e) => setNewSubTodoTitle(e.target.value)}
                          placeholder="Sub-task title..."
                          className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newSubTodoDescription}
                          onChange={(e) =>
                            setNewSubTodoDescription(e.target.value)
                          }
                          placeholder="Description..."
                          className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Priority
                          </label>
                          <select
                            value={newSubTodoPriority}
                            onChange={(e) =>
                              setNewSubTodoPriority(e.target.value as any)
                            }
                            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={newSubTodoDueDate}
                            onChange={(e) =>
                              setNewSubTodoDueDate(e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Assign To
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {allUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleSubTodoAssignedUser(user.id)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                newSubTodoAssignedUserIds.includes(user.id)
                                  ? ""
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                              style={{
                                backgroundColor:
                                  newSubTodoAssignedUserIds.includes(user.id)
                                    ? user.color
                                    : undefined,
                                color: newSubTodoAssignedUserIds.includes(
                                  user.id
                                )
                                  ? getContrastTextColor(user.color)
                                  : undefined,
                              }}
                            >
                              {user.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddSubTodo}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          Add Sub-task
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingSubTodo(false);
                            setNewSubTodoTitle("");
                            setNewSubTodoDescription("");
                            setNewSubTodoPriority("MEDIUM");
                            setNewSubTodoDueDate("");
                            setNewSubTodoAssignedUserIds([currentUserId]);
                          }}
                          className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
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
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      isSubTodo={true}
                    />
                  ))}
                    </div>
                  )}
                </div>
              )}
            </>
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
