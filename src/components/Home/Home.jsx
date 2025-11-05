import React from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiFolder, FiSearch, FiUserPlus } from "react-icons/fi";
import Modal from "../ui/Modal";
import RichTextEditor from "../ui/RichTextEditor";
import {
  useCreateProjectMutation,
  useProjectQuery,
} from "../../services/queries/useProjectQuery";
import { decrypt } from "../../hooks/crypt";
import { toast, ToastContainer } from "react-toastify";
import AssignUserDialog from "../ui/AssignUserDialog";

export default function Home() {
  const user = decrypt("User");
  const createProject = useCreateProjectMutation();
  const { data: projects = [] } = useProjectQuery(user?.id, user?.role?.name);

  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    isActive: true,
    createdBy: user?.id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate(formData, {
      onSuccess: () => {
        toast.success("Project created successfully");
        setFormData({
          name: "",
          description: "",
          isActive: true,
          createdBy: user?.id || "",
        });
        setOpen(false);
      },
      onError: () => toast.error("Error creating project"),
    });
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="min-h-screen">
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500">
                Manage your projects and test suites seamlessly.
              </p>
            </section>
          </div>

          {user?.role?.name?.toLowerCase() === "admin" && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <FiPlus /> Create Project
            </button>
          )}
        </header>

        <main className="mx-auto px-6 py-10">
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <FiFolder /> Your Projects
              </h3>
              <Link
                to="/projectview"
                className="text-sm text-blue-600 hover:underline"
              >
                View all projects
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.length > 0 ? (
                projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 truncate">
                        {project.description || "No description"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <FiSearch className="mr-1" /> View Project
                      </Link>

                      {user?.role?.name?.toLowerCase() === "admin" && (
                        <AssignUserDialog
                          project={project}
                          trigger={
                            <button
                              className="ml-3 inline-flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                              aria-label={`Assign ${project.name} to users`}
                            >
                              <FiUserPlus />
                              Assign
                            </button>
                          }
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No projects found.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              What's New
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>🧠 AI-powered suite recommendations (Coming soon)</li>
              <li>📊 Analytics dashboard for project health (In progress)</li>
              <li>🔔 Real-time notifications integration (Planned)</li>
            </ul>
          </section>
        </main>
      </div>

      {/* Create Project Modal */}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create Project"
        subTitle="Required fields are marked with an asterisk *"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="mt-1 w-full bg-white rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) =>
                setFormData((f) => ({ ...f, description: value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mark as Active</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 mb-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 rounded-md bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
