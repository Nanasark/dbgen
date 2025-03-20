"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface ProjectsListProps {
  onNewProject: () => void
  onSelectProject: (projectName: string) => void
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onNewProject, onSelectProject }) => {
  const projects = [
    "Employee Management Database",
    "Permissions & Access Control Schema",
    "Customer Orders & Payments Schema",
    "Product & Cart Schema",
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-8">Database Schema for User Roles</h1>

      <div className="w-full max-w-md space-y-4">
        {projects.map((project) => (
          <Button
            key={project}
            variant="ghost"
            className="w-full justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-6 text-lg"
            onClick={() => onSelectProject(project)}
          >
            {project}
          </Button>
        ))}
      </div>

      <div className="mt-12">
        <Button
          className="rounded-full px-8 py-6 bg-black hover:bg-gray-800 text-white flex items-center gap-2"
          onClick={onNewProject}
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Project</span>
        </Button>
      </div>
    </div>
  )
}

export default ProjectsList

