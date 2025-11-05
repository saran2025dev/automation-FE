import React, { useState } from "react";
import { useCreateSuiteMutation } from "../../services/queries/useSuiteQuery";
import SuiteBreadcrumb from "../../common/Breadcrumb/SuiteBreadcrumb";
import { useNavigate } from "react-router-dom";

export default function SuiteList({ selectedProjectId, suites }) {
  const createSuite = useCreateSuiteMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    projectId: selectedProjectId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createSuite.mutate(formData, {
      onSuccess: () => {
        setFormData({
          name: "",
          description: "",
          isActive: true,
          projectId: selectedProjectId,
        });
      },
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg mt-8">
      <SuiteBreadcrumb />

      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl shadow-inner mb-10">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Suite Name"
            className="border p-3 rounded-lg bg-white w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg bg-white w-full"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Create Suite
          </button>
        </div>
      </form>

      {/* Suites List */}
      {suites?.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {suites.map((suite) => (
            <div
              key={suite.id}
              className="bg-white border rounded-xl p-4 shadow hover:shadow-lg transition"
              onClick={()=>{navigate(`/AutomateEditor`)}}
            >
              <h3 className="text-lg font-semibold text-gray-800">{suite.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{suite.description}</p>
              <div className="flex justify-between items-center text-sm mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    suite.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {suite.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-gray-400 text-xs">
                  Created: {new Date(suite.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No suites found for this project.</p>
      )}
    </div>
  );
}
