"use client";

import { useState } from "react";
import type { User } from "./TodoList";
import { getContrastTextColor } from "@/lib/colorUtils";

type ProfileSwitcherProps = {
  users: User[];
  currentUserId: string | null;
  onSelectUser: (userId: string) => void;
};

export default function ProfileSwitcher({
  users,
  currentUserId,
  onSelectUser,
}: ProfileSwitcherProps) {
  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <span className="text-sm text-gray-400">Logged in as:</span>
      <div className="relative">
        <select
          value={currentUserId || ""}
          onChange={(e) => onSelectUser(e.target.value)}
          style={{
            backgroundColor: currentUser?.color || "#1E3A8A",
            color: getContrastTextColor(currentUser?.color || "#1E3A8A"),
          }}
          className="px-4 py-2 rounded-lg font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
