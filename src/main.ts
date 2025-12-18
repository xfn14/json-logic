import { LogicEngine } from "json-logic-engine";
import * as monaco from "monaco-editor";
import "./style.css";

import jsToJsonLogic from "js-to-json-logic";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<div class="playground">
  <h1>JsonLogic Playground</h1>

  <div class="pane">
    <h2>Engine init (JavaScript)</h2>
    <div id="initEditor" class="editor"></div>
  </div>

  <div class="pane">
    <h2>Rule (JavaScript)</h2>
    <div id="jsEditor" class="editor"></div>
  </div>

  <div class="actions">
    <button id="convertBtn">Convert JS → JsonLogic</button>
  </div>

  <div class="pane">
    <h2>Converted JsonLogic</h2>
    <pre id="convertResult"></pre>
  </div>

  <div class="pane">
    <h2>Rule (JsonLogic)</h2>
    <div id="ruleEditor" class="editor"></div>
  </div>

  <div class="pane">
    <h2>Data (JSON)</h2>
    <div id="dataEditor" class="editor"></div>
  </div>

  <div class="actions">
    <button id="runBtn">Run</button>
  </div>

  <div class="pane">
    <h2>Result</h2>
    <pre id="result"></pre>
  </div>
</div>
`;

const initEditor = monaco.editor.create(
  document.getElementById("initEditor")!,
  {
    value: `const allowed = {
  nowMs: () => Date.now(),
  todayIso: () => new Date().toISOString().slice(0, 10),
  addDays: (iso, days) => {
    const d = new Date(iso);
    d.setUTCDate(d.getUTCDate() + Number(days));
    return d.toISOString().slice(0, 10);
  },
};

engine.addMethod(
  "call",
  (name, ...args) => {
    const fn = allowed[name];
    if (!fn) throw new Error(\`Function not allowed: \${String(name)}\`);
    return fn(...args);
  },
  { deterministic: false }
);
`,
    language: "javascript",
    theme: "vs-dark",
    minimap: { enabled: false },
    automaticLayout: true,
  }
);

const ruleEditor = monaco.editor.create(
  document.getElementById("ruleEditor")!,
  {
    value: `{
  "and": [
    { "<": [ { "var": "temp" }, 110 ] },
    { "==": [ { "var": "pie.filling" }, "apple" ] }
  ]
}`,
    language: "json",
    theme: "vs-dark",
    minimap: { enabled: false },
    automaticLayout: true,
  }
);

const dataEditor = monaco.editor.create(
  document.getElementById("dataEditor")!,
  {
    value: `{
  "temp": 100,
  "pie": { "filling": "apple" }
}`,
    language: "json",
    theme: "vs-dark",
    minimap: { enabled: false },
    automaticLayout: true,
  }
);

const jsEditor = monaco.editor.create(document.getElementById("jsEditor")!, {
  value: `temp < 110 && pie.filling === "apple"`,
  language: "javascript",
  theme: "vs-dark",
  minimap: { enabled: false },
  automaticLayout: true,
});

const resultEl = document.querySelector<HTMLPreElement>("#result")!;
const convertResultEl =
  document.querySelector<HTMLPreElement>("#convertResult")!;
const runBtn = document.querySelector<HTMLButtonElement>("#runBtn")!;
const convertBtn = document.querySelector<HTMLButtonElement>("#convertBtn")!;

convertBtn.addEventListener("click", () => {
  try {
    const js = jsEditor.getValue() ?? "";
    const logic = jsToJsonLogic(js);

    convertResultEl.textContent = JSON.stringify(logic, null, 2);
    ruleEditor.setValue(JSON.stringify(logic, null, 2));
  } catch (err: any) {
    convertResultEl.textContent = "Error: " + (err?.message ?? String(err));
  }
});

function buildEngine() {
  const engine = new LogicEngine();

  const initCode = initEditor.getValue() ?? "";

  const fn = new Function(
    "engine",
    "LogicEngine",
    `"use strict";\n${initCode}\n`
  ) as (engine: any, LogicEngine: any) => void;

  fn(engine, LogicEngine);
  return engine;
}

runBtn.addEventListener("click", async () => {
  try {
    const engine = buildEngine();

    const rule = JSON.parse(ruleEditor.getValue() || "null");
    const data = JSON.parse(dataEditor.getValue() || "null");

    const output = await engine.run(rule, data);
    resultEl.textContent = JSON.stringify(output, null, 2);
  } catch (err: any) {
    resultEl.textContent = "Error: " + (err?.message ?? String(err));
  }
});

function makeResizable(
  container: HTMLElement,
  editor: monaco.editor.IStandaloneCodeEditor
) {
  const ro = new ResizeObserver(() => editor.layout());
  ro.observe(container);
}

makeResizable(document.getElementById("initEditor")!, initEditor);
makeResizable(document.getElementById("ruleEditor")!, ruleEditor);
makeResizable(document.getElementById("dataEditor")!, dataEditor);
makeResizable(document.getElementById("jsEditor")!, jsEditor);
