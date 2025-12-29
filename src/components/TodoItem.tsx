"use client";

import { useState } from "react";
import type { Todo } from "./TodoList";
import CommentSection from "./CommentSection";

type TodoItemProps = {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onAddSubTodo?: (parentId: string, title: string) => void;
  currentUserId: string;
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
  onDragStart, 
  onDragOver, 
  onDrop,
  isSubTodo = false 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [showComments, setShowComments] = useState(false);
  const [showSubTodos, setShowSubTodos] = useState(true);
  const [isAddingSubTodo, setIsAddingSubTodo] = useState(false);
  const [newSubTodoTitle, setNewSubTodoTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isChildHovered, setIsChildHovered] = useState(false);

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

  const statusColors = {
    TODO: "bg-gray-800 border-gray-600",
    IN_PROGRESS: "bg-blue-900 border-blue-600",
    DONE: "bg-green-900 border-green-600",
  };

  const handleSave = () => {
    onUpdate(todo.id, { title, description });
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
      className={`${isSubTodo ? 'p-1.5' : 'p-2'} rounded-lg border-2 ${statusColors[todo.status]} transition-all cursor-move hover:shadow-lg ${isEditing ? 'cursor-default' : ''} ${isSubTodo ? 'bg-gray-900 border-opacity-50' : 'parent-todo'}`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
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
              className={`flex-1 font-semibold text-white select-text cursor-text ${isSubTodo ? 'text-xs' : 'text-base'}`}
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
              className="text-gray-300 select-text cursor-text"
            >{todo.description}</p>
          )}
          
          {/* Row 3: Dates */}
          <div className="flex items-center gap-3 text-xs text-gray-400 select-text">
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
                  className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1"
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
