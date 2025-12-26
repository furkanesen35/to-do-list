"use client";

import { useState } from "react";
import type { User } from "./TodoList";

type UserTabsProps = {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onAddUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (userId: string, name: string) => void;
};

export default function UserTabs({
  users,
  selectedUserId,
  onSelectUser,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
}: UserTabsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddUser(newName);
    setNewName("");
    setShowAddForm(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
  };

  const handleSaveEdit = (userId: string) => {
    if (!editName.trim()) return;
    onUpdateUser(userId, editName);
    setEditingUserId(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {users.map((user) => (
          <div
            key={user.id}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              selectedUserId === user.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <button
              onClick={() => onSelectUser(user.id)}
              className="font-medium"
            >
              {user.name}
            </button>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditUser(user);
                }}
                className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                title="Edit user"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteUser(user.id);
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                title="Delete user"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          title="Add new person"
        >
          + Add Person
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Add New Person</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter name"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {editingUserId && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Edit Person</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter name"
              required
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleSaveEdit(editingUserId)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingUserId(null)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
