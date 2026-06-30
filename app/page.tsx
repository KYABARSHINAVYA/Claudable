"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const sampleLogs = [
    "Planning application architecture...",
    "Creating isolated Docker workspace...",
    "Starting Claude Code session...",
    "Generating frontend components...",
    "Generating backend APIs...",
    "Creating database schema...",
    "Installing dependencies...",
    "Running build checks...",
    "Application generation completed."
  ];

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index < sampleLogs.length) {
        setLogs((prev) => [...prev, sampleLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const examplePrompts = [
    "Build a CRM dashboard with Supabase authentication",
    "Build an Expense Tracker using Next.js and PostgreSQL",
    "Build a Todo application with real-time updates",
    "Build a Portfolio website with animations"
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-500">
            Claudable Cloud
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/projects")}
              className="px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              Projects
            </button>

            <button
              onClick={() => router.push("/auth/login")}
              className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Build Applications with Natural Language
        </h1>

        <p className="text-slate-400 text-xl mb-10">
          Claude Code running entirely in isolated cloud containers.
          No local setup required.
        </p>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the application you want to build..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 h-36 resize-none focus:outline-none focus:border-blue-500"
          />

          <div className="mt-5 flex justify-center">
            <button
              className="bg-blue-600 px-8 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Generate Application
            </button>
          </div>
        </div>
      </section>

      {/* Example prompts */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">
          Example Prompts
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {examplePrompts.map((item) => (
            <button
              key={item}
              onClick={() => setPrompt(item)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left hover:border-blue-500 transition"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">
          Active Projects
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "CRM Dashboard",
              status: "Running"
            },
            {
              name: "Expense Tracker",
              status: "Building"
            },
            {
              name: "Portfolio Website",
              status: "Ready"
            }
          ].map((project) => (
            <div
              key={project.name}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold">
                {project.name}
              </h3>

              <p className="text-slate-400 mt-2">
                Status: {project.status}
              </p>

              <div className="flex gap-3 mt-5">
                <button className="bg-blue-600 px-4 py-2 rounded-lg">
                  Open
                </button>

                <button className="border border-slate-700 px-4 py-2 rounded-lg">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Stream */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">
          Live Claude Execution Stream
        </h2>

        <div className="bg-black rounded-2xl border border-slate-800 p-6 font-mono text-green-400 min-h-[300px]">
          {logs.map((log, index) => (
            <div key={index} className="mb-2">
              $ {log}
            </div>
          ))}

          <span className="animate-pulse">▋</span>
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">
          Workspace Metrics
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["Active Containers", "12"],
            ["Running Sessions", "8"],
            ["Generated Projects", "143"],
            ["Storage Used", "2.1 GB"]
          ].map(([title, value]) => (
            <div
              key={title}
              className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center"
            >
              <div className="text-4xl font-bold text-blue-500">
                {value}
              </div>

              <div className="text-slate-400 mt-2">
                {title}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}