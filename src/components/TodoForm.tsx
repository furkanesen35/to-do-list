"use client";

import { useState } from "react";
import type { Todo, User } from "./TodoList";
import { getContrastTextColor } from "@/lib/colorUtils";

type TodoFormProps = {
  currentUserId: string;
  selectedUserId: string;
  allUsers: User[];
  onAdd: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "listOwner" | "creator">) => void;
};

export default function TodoForm({ currentUserId, selectedUserId, allUsers, onAdd }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([currentUserId]);

  const toggleAssignedUser = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      setAssignedUserIds(assignedUserIds.filter((id) => id !== userId));
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || assignedUserIds.length === 0) return;

    onAdd({
      title,
      description: description || null,
      status: "TODO",
      priority,
      listOwnerId: selectedUserId,
      createdById: currentUserId,
      assignedUserIds,
      dueDate: dueDate || null,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setAssignedUserIds([currentUserId]);
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Add New Todo
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter todo title"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter todo description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assign To *
            </label>
            <div className="flex flex-wrap gap-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAssignedUser(user.id)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
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
              type="submit"
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Todo
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
