import { LogicEngine } from "json-logic-engine";
import * as monaco from "monaco-editor";
import "./style.css";

const engine = new LogicEngine();

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="playground">
    <h1>JsonLogic Playground</h1>

    <div class="pane">
      <h2>Rule (JsonLogic)</h2>
      <div id="ruleEditor" class="editor"></div>
    </div>

    <div class="pane">
      <h2>Data (JSON)</h2>
      <div id="dataEditor" class="editor"></div>
    </div>

    <button id="runBtn">Run</button>

    <div class="pane">
      <h2>Result</h2>
      <pre id="result"></pre>
    </div>
  </div>
`;

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

const resultEl = document.querySelector<HTMLPreElement>("#result")!;
const runBtn = document.querySelector<HTMLButtonElement>("#runBtn")!;

runBtn.addEventListener("click", () => {
  try {
    const rule = JSON.parse(ruleEditor.getValue() || "null");
    const data = JSON.parse(dataEditor.getValue() || "null");

    const output = engine.run(rule, data);
    resultEl.textContent = JSON.stringify(output, null, 2);
  } catch (err: any) {
    resultEl.textContent = "Error: " + (err?.message ?? String(err));
  }
});

function makeResizable(
  container: HTMLElement,
  editor: monaco.editor.IStandaloneCodeEditor
) {
  const ro = new ResizeObserver(() => {
    editor.layout();
  });

  ro.observe(container);
}

makeResizable(document.getElementById("ruleEditor")!, ruleEditor);

makeResizable(document.getElementById("dataEditor")!, dataEditor);
