import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProjectMutation, useProjectQuery, useProjectByUserQuery } from "../../services/queries/useProjectQuery";
import { FiPlus } from "react-icons/fi";
import Modal from "../ui/Modal";
import RichTextEditor from "../ui/RichTextEditor/Index";
import ProjectList from "./projectList";
import { decrypt } from "../../hooks/crypt";

export default function ProjectView() {
  const navigate = useNavigate();
  const user = decrypt("User");
  const createProject = useCreateProjectMutation();
  const { data: projects = [] } = useProjectQuery(user?.id, user?.role?.name);
  const { data: userProjects = [] } = useProjectByUserQuery(user?.id);
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    isActive: true,
    createdBy: ''

  });
  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate(
      formData, 
      {
        onSuccess: () => {
          setFormData({
            name: "",
            description: "",
            isActive: true,
            createdBy: formData.createdBy,
          });
          setOpen(false);
        },
        onError: () => {
          console.error("Error creating project.");
        },
      }
    );
  };

  const handleViewSuites = (id) => {
    navigate(`/projects/${id}`);
  };
  
  const handleDeleteProject = (id) => {
    console.log(id);    
  }; 

  return (
    <div className=" mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="!text-1xl font-bold text-gray-800">
          Project Management
        </h2>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <FiPlus /> Create Project
        </button>
      </div>

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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-1 text-sm bg-blue-600 text-white !rounded-sm  hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      <h3 className="!text-xl font-semibold mb-4 text-gray-700">
        All Projects
      </h3>
      <ProjectList
        projects={projects || []}
        onViewSuites={handleViewSuites}
        onDeleteProject={handleDeleteProject}
        user={user}
        userProjects={userProjects}
      />
    </div>
  );
}
