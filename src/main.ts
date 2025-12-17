import { LogicEngine } from "json-logic-engine";
import "./style.css";

const engine = new LogicEngine();

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="playground">
    <h1>JsonLogic Playground</h1>

    <div class="pane">
      <h2>Rule (JsonLogic)</h2>
      <textarea id="rule" rows="10" spellcheck="false">
{
  "and": [
    { "<": [ { "var": "temp" }, 110 ] },
    { "==": [ { "var": "pie.filling" }, "apple" ] }
  ]
}</textarea>
    </div>

    <div class="pane">
      <h2>Data (JSON)</h2>
      <textarea id="data" rows="10" spellcheck="false">
{
  "temp": 100,
  "pie": { "filling": "apple" }
}</textarea>
    </div>

    <button id="runBtn">Run</button>

    <div class="pane">
      <h2>Result</h2>
      <pre id="result"></pre>
    </div>
  </div>
`;

const ruleEl = document.querySelector<HTMLTextAreaElement>("#rule")!;
const dataEl = document.querySelector<HTMLTextAreaElement>("#data")!;
const resultEl = document.querySelector<HTMLPreElement>("#result")!;
const runBtn = document.querySelector<HTMLButtonElement>("#runBtn")!;

runBtn.addEventListener("click", () => {
  try {
    const rule = JSON.parse(ruleEl.value || "null");
    const data = JSON.parse(dataEl.value || "null");

    const output = engine.run(rule, data);
    resultEl.textContent = JSON.stringify(output, null, 2);
  } catch (err: any) {
    resultEl.textContent = "Error: " + (err?.message ?? String(err));
  }
});
