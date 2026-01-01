"use client";

import { useState } from "react";
import type { User } from "./TodoList";
import { getContrastTextColor } from "@/lib/colorUtils";

type WelcomeModalProps = {
  show: boolean;
  users: User[];
  onSelectUser: (userId: string) => void;
  onCreateUser: (name: string, color: string) => void;
};

const COLOR_OPTIONS = [
  // Dark colors (will have white text)
  "#1E3A8A", // Dark Blue
  "#065F46", // Dark Green
  "#7C2D12", // Dark Orange
  "#701A75", // Dark Purple
  // Bright colors (will have black text)
  "#FCD34D", // Bright Yellow
  "#FCA5A5", // Bright Red/Pink
  "#67E8F9", // Bright Cyan
  "#C4B5FD", // Bright Lavender
];

export default function WelcomeModal({
  show,
  users,
  onSelectUser,
  onCreateUser,
}: WelcomeModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!show) return null;

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateUser(newName, selectedColor);
    setNewName("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Welcome to TodoList
        </h2>

        {!isCreating ? (
          <div>
            {users.length > 0 && (
              <>
                <p className="text-gray-300 mb-4">Select your profile:</p>
                <div className="space-y-2 mb-6">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      style={{ backgroundColor: user.color, color: getContrastTextColor(user.color) }}
                      className="w-full px-6 py-3 font-medium rounded-lg transition-transform hover:scale-105"
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
                <div className="text-center text-gray-400 mb-4">or</div>
              </>
            )}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              + Create New Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Your Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-full h-12 rounded-lg transition-all ${
                      selectedColor === color
                        ? "ring-4 ring-white scale-110"
                        : "hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Create Profile
              </button>
              {users.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
