export default function Login() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 p-10 rounded-xl border border-slate-800 w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-slate-800 border border-slate-700"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded bg-slate-800 border border-slate-700"
        />

        <button className="w-full bg-blue-600 py-3 rounded-lg">
          Sign In
        </button>
      </div>
    </main>
  );
}