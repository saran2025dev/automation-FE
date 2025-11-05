import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { decrypt } from "../../hooks/crypt";

export default function Header() {
  const user = decrypt("User");
  const firstLetter = user?.username?.charAt(0)?.toUpperCase();

  return (
    <header className="flex items-center justify-between bg-white p-2 shadow-md">

      <Popover.Root>
        <Popover.Trigger asChild>
          <div className="flex items-center space-x-4 cursor-pointer ml-auto">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full font-medium flex items-center justify-center hover:bg-blue-700 transition">
              {firstLetter}
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className="bg-white rounded-lg shadow-lg p-4 w-60 z-50 border text-sm"
            side="bottom"
            align="end"
          >
            <div className="mb-3">
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser className="text-blue-500" />
                <span>
                  <strong>Name:</strong> {user?.username}
                </span>
              </div>
            </div>

            <button
              className="w-full bg-gray-500 text-white py-2 rounded  flex items-center justify-center gap-2"
              onClick={() => {
                localStorage.removeItem("User");
                window.location.href = "/login";
              }}
            >
              <FiLogOut /> Logout
            </button>

            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </header>
  );
}
