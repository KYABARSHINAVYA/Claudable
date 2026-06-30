"use client";

import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { title: "Projects", value: 3 },
    { title: "Containers", value: 1 },
    { title: "Sessions", value: 2 },
    { title: "Generated Apps", value: 5 },
  ];

  const projects = [
    {
      name: "Expense Tracker",
      status: "Running",
      runtime: "Gemini Container",
    },
    {
      name: "CRM Dashboard",
      status: "Idle",
      runtime: "Stopped",
    },
    {
      name: "Portfolio Builder",
      status: "Running",
      runtime: "Gemini Container",
    },
  ];

  const containers = [
    {
      id: "container-001",
      image: "node:20-bookworm",
      status: "Running",
      cpu: "14%",
      ram: "512MB",
    },
    {
      id: "container-002",
      image: "node:20-bookworm",
      status: "Idle",
      cpu: "0%",
      ram: "0MB",
    },
  ];

  const logs = [
    "[10:21:02] Container started",
    "[10:21:05] Installing dependencies",
    "[10:21:11] Creating Next.js project",
    "[10:21:20] Generating dashboard page",
    "[10:21:35] Build successful",
  ];

  return (
    <main className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          Claudable Cloud Dashboard
        </h1>

        <p className="text-gray-400 text-lg">
          Build complete AI applications entirely in the cloud.
        </p>
      </div>

      {/* Stats */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Platform Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <p className="text-gray-400">{stat.title}</p>

              <h3 className="text-4xl font-bold mt-2">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Create Project
          </Link>

          <Link
            href="/projects"
            className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg"
          >
            Resume Project
          </Link>

          <button className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg">
            View Containers
          </button>

          <button className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg">
            Downloads
          </button>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Recent Projects
        </h2>

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {project.name}
                  </h3>

                  <p className="text-gray-400">
                    Runtime: {project.runtime}
                  </p>
                </div>

                <div>
                  <span className="bg-green-600 px-4 py-2 rounded-full text-sm">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Containers */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Running Containers
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {containers.map((container) => (
            <div
              key={container.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-bold mb-2">
                {container.id}
              </h3>

              <p>Image: {container.image}</p>
              <p>Status: {container.status}</p>
              <p>CPU Usage: {container.cpu}</p>
              <p>RAM Usage: {container.ram}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Streaming Logs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Live Activity Stream
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-2 text-green-400">
              {log}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}