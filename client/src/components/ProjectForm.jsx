import { Plus, Trash2 } from 'lucide-react';
import React from 'react'

const ProjectForm = ({ data = [], onChange }) => {

    const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
      live_link: "",
      technologies: "",
    };

    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Projects
          </h3>
          <p className="text-sm text-gray-500">Add your Projects</p>
        </div>

        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {data.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
            Click "Add Project" to start listing your portfolio projects.
          </div>
        ) : (
          data.map((project, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">

                <h4>Project #{index + 1}</h4>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Input Fields for a Single Project */}
              <div className="grid gap-3">
                <input
                  value={project.name || ""}
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  type="text"
                  placeholder="Project Name"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <input
                  value={project.type || ""}
                  onChange={(e) => updateProject(index, "type", e.target.value)}
                  type="text"
                  placeholder="Role / Project Type (e.g., Lead Developer)"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <input
                  value={project.live_link || ""}
                  onChange={(e) =>
                    updateProject(index, "live_link", e.target.value)
                  }
                  type="url"
                  placeholder="Live Link / GitHub URL"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <input
                  value={project.technologies || ""}
                  onChange={(e) =>
                    updateProject(index, "technologies", e.target.value)
                  }
                  type="text"
                  placeholder="Technologies Used (e.g., React, Node.js, AWS)"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <textarea
                  rows={4}
                  value={project.description || ""}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  placeholder="Describe your project, your contributions, and the outcomes..."
                  className="w-full px-3 py-2 text-sm rounded-lg resize-none border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectForm
