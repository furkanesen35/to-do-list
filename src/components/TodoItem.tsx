"use client";

import { useState } from "react";
import type { Todo } from "./TodoList";

type TodoItemProps = {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, todoId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, status: Todo["status"]) => void;
};

export default function TodoItem({ todo, onUpdate, onDelete, onDragStart, onDragOver, onDrop }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");

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

  const handleStatusChange = (status: Todo["status"]) => {
    onUpdate(todo.id, { status });
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart?.(e, todo.id)}
      className={`p-4 rounded-lg border-2 ${statusColors[todo.status]} transition-all cursor-move hover:shadow-lg ${isEditing ? 'cursor-default' : ''}`}
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
          {/* Row 1: Priority and Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${priorityColors[todo.priority]}`}
            >
              {todo.priority}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-1.5 md:p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              title="Delete"
            >
              🗑️
            </button>
          </div>
          
          {/* Row 2: Title */}
          <h3 className="text-lg font-semibold text-white">{todo.title}</h3>
          
          {/* Row 3: Description */}
          {todo.description && (
            <p className="text-gray-300">{todo.description}</p>
          )}
          
          {/* Row 4: Dates */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>📅 Created: {getDateDisplay(todo.createdAt)}</span>
            {todo.dueDate && (
              <span>⏰ Due: {getDateDisplay(todo.dueDate)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
