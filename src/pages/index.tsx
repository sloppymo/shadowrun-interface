import React, { useState, useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:5000/api";
const SESSION_ID = "demo-session"; // Replace with real session logic
const GM_USER_ID = "gm-user";
const PLAYER_USER_ID = "test-player";

function RoleSelector({ role, setRole }: { role: string; setRole: (r: string) => void }) {
  return (
    <div className="mb-4">
      <label className="mr-2 text-green-400">Role:</label>
      <select
        className="bg-black border border-green-700 text-green-300 px-2 py-1 rounded"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="player">Player</option>
        <option value="gm">GM</option>
        <option value="observer">Observer</option>
      </select>
    </div>
  );
}

function SceneSummary({ sessionId, role, userId }: { sessionId: string; role: string; userId: string }) {
  const [scene, setScene] = useState("");
  const [edit, setEdit] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/session/${sessionId}/scene`)
      .then(res => res.json())
      .then(data => setScene(data.summary || ""));
  }, [sessionId]);

  const saveScene = async () => {
    await fetch(`${API_BASE}/session/${sessionId}/scene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: input, user_id: userId }),
    });
    setScene(input);
    setEdit(false);
  };

  return (
    <div className="bg-black border border-green-800 rounded p-4 mb-4 shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-green-400 font-mono text-lg">Scene Summary</h2>
        {role === "gm" && (
          <button
            onClick={() => { setEdit(true); setInput(scene); }}
            className="text-xs text-red-400 hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      {!edit ? (
        <p className="text-green-200 mt-2 font-mono">{scene || <i>No scene set.</i>}</p>
      ) : (
        <div className="flex mt-2">
          <input
            className="flex-1 bg-black border border-green-600 text-green-200 px-2 py-1 font-mono"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            onClick={saveScene}
            className="ml-2 px-2 py-1 bg-green-800 text-black rounded font-bold"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function EntityTracker({ sessionId }: { sessionId: string }) {
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/session/${sessionId}/entities`)
      .then(res => res.json())
      .then(data => setEntities(data));
  }, [sessionId]);

  return (
    <div className="bg-black border border-green-800 rounded p-4 mb-4 shadow">
      <h2 className="text-green-400 font-mono text-lg mb-2">Active Entities</h2>
      {entities.length === 0 ? (
        <p className="text-green-200 font-mono">No entities.</p>
      ) : (
        <ul>
          {entities.map(e => (
            <li key={e.id} className="text-green-200 font-mono">
              <span className="font-bold">{e.name}</span> ({e.type}) {e.status && <>- <span className="text-red-400">{e.status}</span></>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Terminal component for command + natural language parsing
function Terminal({ sessionId, userId, role }: { sessionId: string; userId: string; role: string }) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<any[]>([]); // {type: 'user'|'system'|'error', text: string}
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // List of recognized commands
  const COMMANDS = ["help", "clear", "cls", "clr", "theme", "skin"];

  // Simple command parser
  function parseInput(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return { type: "empty" };
    if (trimmed.startsWith("/")) {
      const [cmd, ...args] = trimmed.slice(1).split(" ");
      return { type: "command", cmd: cmd.toLowerCase(), args };
    }
    // Try matching basic commands without /
    const [cmd, ...args] = trimmed.split(" ");
    if (COMMANDS.includes(cmd.toLowerCase())) {
      return { type: "command", cmd: cmd.toLowerCase(), args };
    }
    // Otherwise treat as natural language
    return { type: "nl", text: trimmed };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInput(input);
    setLines(l => [...l, { type: "user", text: input }]);
    setInput("");
    if (parsed.type === "empty") return;
    if (parsed.type === "command") {
      if (parsed.cmd && ["clear", "cls", "clr"].includes(parsed.cmd)) {
        setLines([]);
        return;
      }
      if (parsed.cmd && ["help", "?"].includes(parsed.cmd)) {
        setLines(l => [...l, {
          type: "system",
          text: `SHADOWRUN INTERFACE COMMANDS\n\nBASIC COMMANDS:\nhelp (h, ?) - Show available commands or detailed help for a specific command\nclear (cls, clr) - Clear the console output\ntheme (skin) - Change console theme\n\nSHADOWRUN COMMANDS:\n/scene, /roll, /summon, /echo, /mark, /meta, /recall, /pulse` }]);
        return;
      }
      // Add more command handling as needed
      setLines(l => [...l, { type: "error", text: `Unknown command: ${parsed.cmd || 'undefined'}\nType "help" for available commands.` }]);
      return;
    }
    // Natural language: send to backend
    setLoading(true);
    try {
      // Streaming via EventSource (SSE)
      setLines(l => [...l, { type: "system", text: "", streaming: true }]);
      let current = "";
      const eventSource = new EventSource(`${API_BASE}/chat/stream-proxy?session_id=${encodeURIComponent(sessionId || "")}&user_id=${encodeURIComponent(userId || "")}&role=${encodeURIComponent(role || "")}&input=${encodeURIComponent(parsed.text || "")}`);
      eventSource.onmessage = (event) => {
        if (event.data) {
          current += event.data;
          setLines(l => {
            const linesCopy = [...l];
            const idx = linesCopy.findIndex(line => line.streaming);
            if (idx !== -1) {
              linesCopy[idx] = { ...linesCopy[idx], text: current };
            }
            return linesCopy;
          });
        }
      };
      eventSource.onerror = () => {
        setLines(l => {
          const linesCopy = [...l];
          const idx = linesCopy.findIndex(line => line.streaming);
          if (idx !== -1) {
            linesCopy[idx] = { ...linesCopy[idx], streaming: false };
          }
          return linesCopy;
        });
        setLoading(false);
        eventSource.close();
      };
      eventSource.onopen = () => setLoading(true);
      eventSource.addEventListener("end", () => {
        setLines(l => {
          const linesCopy = [...l];
          const idx = linesCopy.findIndex(line => line.streaming);
          if (idx !== -1) {
            linesCopy[idx] = { ...linesCopy[idx], streaming: false };
          }
          return linesCopy;
        });
        setLoading(false);
        eventSource.close();
      });
    } catch (err) {
      setLines(l => [...l, { type: "error", text: "[AI backend error]" }]);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div className="bg-black border border-green-800 rounded p-4 shadow font-mono max-w-2xl mx-auto">
      <div className="h-72 overflow-y-auto mb-2 flex flex-col-reverse">
        <div>
          {lines.length === 0 && (
            <div className="text-green-700 italic">Shadowrun Interface Terminal v2.0\nEnhanced with real-time collaboration and advanced dice mechanics\nType &quot;help&quot; for available commands.\nInitializing Matrix connection...</div>
          )}
          {lines.map((l, i) => (
            <div key={i} className={
              l.type === "user" ? "text-green-300" :
                l.type === "system" ? "text-green-200" :
                  "text-red-400"
            }>
              {l.type === "user" && <span className="text-green-500">Morgan@SR &gt; </span>}{l.text.split("\n").map((line: string, idx: number) => <div key={idx}>{line}</div>)}
            </div>
          ))}
          {loading && <div className="text-green-700 italic">[AI is typing...]</div>}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex mt-2">
        <input
          ref={inputRef}
          className="flex-1 bg-black border border-green-600 text-green-200 px-2 py-1 font-mono"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          className="ml-2 px-2 py-1 bg-green-800 text-black rounded font-bold"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function HomePage() {
  const [role, setRole] = useState("player");
  const userId = role === "gm" ? GM_USER_ID : PLAYER_USER_ID;

  return (
    <div className="min-h-screen bg-black text-green-200 font-mono p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl text-green-500 font-extrabold tracking-wider">Shadowrun Multiplayer Engine</h1>
        <span className="text-green-700 text-xs font-mono ml-4">v.65a</span>
      </div>
      <div className="mb-4 text-green-300 font-mono">welcome back, anon</div>
      <RoleSelector role={role} setRole={setRole} />
      <SceneSummary sessionId={SESSION_ID} role={role} userId={userId} />
      <EntityTracker sessionId={SESSION_ID} />
      <Terminal sessionId={SESSION_ID} userId={userId} role={role} />
      <footer className="mt-12 text-xs text-green-700 text-center select-none">
        &copy; 2025 Forest Within Therapeutic Services Professional Corporation
      </footer>
    </div>
  );
}
