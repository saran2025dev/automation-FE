import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useProjectsByAssignedUserQuery } from "../../services/queries/useProjectQuery";
import { CircleCheck, CircleAlert } from "lucide-react";

export default function AssignUserDialog({ project, trigger }) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3001/user");
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const { data: assignedUsers = [] } = useProjectsByAssignedUserQuery(
    project?.id
  );

  const assignMutation = useMutation({
    mutationFn: async ({ projectId, userIds }) => {
      return axios.post(`http://localhost:3001/project/${projectId}/assign`, {
        userIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project assigned successfully",{icon: <CircleCheck/>});
    },
    onError: () => {
      toast.error("Failed to assign project",{icon: <CircleAlert/>});
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && users.length) {
      const assignedIds = assignedUsers.map((a) => a.user.id);
      setSelectedUsers(assignedIds);
      setSelectAll(assignedIds.length === users.length);
    }
  }, [open, assignedUsers, users]);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      const exists = prev.includes(userId);
      const updated = exists
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      setSelectAll(updated.length === users.length);
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers(users.map((u) => u.id));
      setSelectAll(true);
    }
  };

  const handleAssign = async () => {
    if (!project || !selectedUsers.length) return;
    await assignMutation.mutateAsync({
      projectId: project.id,
      userIds: selectedUsers,
    });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button
            className="ml-3 inline-flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-sky-700"
            onClick={() => {
              setOpen(true);
              setSelectedUsers([]);
              setSelectAll(false);
              refetchUsers();
            }}
          >
            Assign
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-semibold text-slate-900">
                Assign Project
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Assign{" "}
                <span className="font-medium text-slate-800">
                  {project?.name ?? "—"}
                </span>{" "}
                to one or more users.
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    disabled={usersLoading || usersError || users.length === 0}
                    className="hidden"
                  />
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      selectAll
                        ? "border-sky-600 bg-sky-600"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {selectAll && (
                      <svg
                        className="h-3 w-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Select all
                  </span>
                </label>
                <span className="text-sm text-slate-500">
                  ({selectedUsers.length} selected)
                </span>
              </div>
              <div className="text-sm text-slate-500">
                Total users: {users.length}
              </div>
            </div>

            <div className="max-h-56 overflow-auto divide-y rounded border border-slate-100">
              {usersLoading && (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading users...
                </div>
              )}
              {usersError && (
                <div className="p-4 text-center text-sm text-rose-600">
                  Failed to load users
                </div>
              )}
              {!usersLoading &&
                !usersError &&
                users.map((u) => {
                  const label =
                    u.name ?? u.username ?? u.email ?? `User ${u.id}`;
                  const roleLabel =
                    typeof u.role === "string"
                      ? u.role
                      : u.role?.name ?? "Member";
                  const isSelected = selectedUsers.includes(u.id);

                  return (
                    <label
                      key={u.id}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(u.id)}
                          className="hidden"
                        />
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isSelected
                              ? "border-sky-600 bg-sky-600"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {roleLabel}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-slate-100 text-sm rounded-md hover:bg-slate-200">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleAssign}
              disabled={assignMutation.isLoading || selectedUsers.length === 0}
              className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
            >
              {assignMutation.isLoading
                ? "Assigning..."
                : `Assign (${selectedUsers.length})`}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
