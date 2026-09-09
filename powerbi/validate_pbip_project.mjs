import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const reportRoot = path.join(root, "Medicare_Inpatient_Service_Payment_Analytics.Report");
const modelRoot = path.join(root, "Medicare_Inpatient_Service_Payment_Analytics.SemanticModel");
const pagesRoot = path.join(reportRoot, "definition", "pages");
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function walk(dir, predicate, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".pbi") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, result);
    else if (predicate(full)) result.push(full);
  }
  return result;
}

for (const file of walk(reportRoot, (p) => p.endsWith(".json"))) readJson(file);
for (const file of walk(modelRoot, (p) => p.endsWith(".json"))) readJson(file);
readJson(path.join(root, "Medicare_Inpatient_Service_Payment_Analytics.pbip"));
readJson(path.join(reportRoot, "definition.pbir"));

const tableFiles = fs.readdirSync(path.join(modelRoot, "definition", "tables"))
  .filter((name) => name.endsWith(".tmdl"));
const model = new Map();
for (const fileName of tableFiles) {
  const text = fs.readFileSync(path.join(modelRoot, "definition", "tables", fileName), "utf8");
  const tableMatch = text.match(/^table (?:'([^']+)'|([^\r\n]+))/m);
  if (!tableMatch) {
    fail(`Missing table declaration: ${fileName}`);
    continue;
  }
  const table = tableMatch[1] ?? tableMatch[2].trim();
  const columns = new Set([...text.matchAll(/^\tcolumn (?:'([^']+)'|([^\r\n]+))/gm)].map((m) => m[1] ?? m[2].trim()));
  const measures = new Set([...text.matchAll(/^\tmeasure '([^']+)'\s*=/gm)].map((m) => m[1]));
  model.set(table, { columns, measures, text });
}

for (const expected of ["DRG Benchmark", "Portfolio Overview", "Provider DRG Review"]) {
  if (!model.has(expected)) fail(`Missing semantic-model table: ${expected}`);
}

const requiredMeasures = [
  "Total Discharges",
  "Estimated Aggregate Total Payment",
  "Estimated Aggregate Medicare Payment",
  "Provider Count",
  "DRG Count",
  "Average Total Payment",
  "Average Medicare Payment",
  "Review Priority Count",
  "High Priority Count",
  "Moderate Priority Count",
  "Routine Review Count",
  "High Priority Share",
  "Selected DRG Median Total Payment",
  "Payment Difference from DRG Median",
  "Payment Difference Percent",
];
for (const measure of requiredMeasures) {
  if (!model.get("Provider DRG Review")?.measures.has(measure)) fail(`Missing measure: ${measure}`);
}

const providerText = model.get("Provider DRG Review")?.text ?? "";
for (const field of ["provider_key", "drg_key", "source_sha256"]) {
  const hiddenPattern = new RegExp(`^\\tcolumn ${field}\\r?\\n\\t\\tisHidden`, "m");
  if (!hiddenPattern.test(providerText)) fail(`Technical field is not hidden: ${field}`);
}

const relationships = fs.readFileSync(path.join(modelRoot, "definition", "relationships.tmdl"), "utf8").trim();
if (relationships) fail("Independent-view model unexpectedly contains relationships");

const pagesMetadata = readJson(path.join(pagesRoot, "pages.json"));
const expectedPageNames = ["Executive Overview", "Service Category Analysis", "Payment Benchmarking", "Review Priorities"];
const pageIds = pagesMetadata?.pageOrder ?? [];
if (pageIds.length !== 4 || new Set(pageIds).size !== 4) fail("pages.json must contain four unique page IDs");

const allVisualIds = new Set();
const pageSummary = [];
for (let i = 0; i < pageIds.length; i += 1) {
  const pageId = pageIds[i];
  const pageDir = path.join(pagesRoot, pageId);
  const page = readJson(path.join(pageDir, "page.json"));
  if (page?.name !== pageId) fail(`Page folder/name mismatch: ${pageId}`);
  if (page?.displayName !== expectedPageNames[i]) fail(`Unexpected page at ordinal ${i + 1}: ${page?.displayName}`);
  const visualFiles = walk(path.join(pageDir, "visuals"), (p) => p.endsWith("visual.json"));
  pageSummary.push({ page: page?.displayName, visuals: visualFiles.length });
  for (const visualFile of visualFiles) {
    const visual = readJson(visualFile);
    const visualFolder = path.basename(path.dirname(visualFile));
    if (visual?.name !== visualFolder) fail(`Visual folder/name mismatch: ${visualFolder}`);
    if (allVisualIds.has(visual?.name)) fail(`Duplicate visual ID across report: ${visual?.name}`);
    allVisualIds.add(visual?.name);
    const pos = visual?.position;
    if (!pos || pos.x < 0 || pos.y < 0 || pos.x + pos.width > 1920 || pos.y + pos.height > 1080) {
      fail(`Visual outside 1920x1080 canvas: ${page?.displayName}/${visual?.name}`);
    }
    validateReferences(visual, `${page?.displayName}/${visual?.name}`);
  }
}

function validateReferences(node, location) {
  if (!node || typeof node !== "object") return;
  if (node.Column?.Expression?.SourceRef?.Entity) {
    const table = node.Column.Expression.SourceRef.Entity;
    const property = node.Column.Property;
    if (!model.get(table)?.columns.has(property)) fail(`Missing column reference ${table}[${property}] in ${location}`);
  }
  if (node.Measure?.Expression?.SourceRef?.Entity) {
    const table = node.Measure.Expression.SourceRef.Entity;
    const property = node.Measure.Property;
    if (!model.get(table)?.measures.has(property)) fail(`Missing measure reference ${table}[${property}] in ${location}`);
  }
  for (const value of Object.values(node)) validateReferences(value, location);
}

const pbip = readJson(path.join(root, "Medicare_Inpatient_Service_Payment_Analytics.pbip"));
const reportArtifactPath = pbip?.artifacts?.[0]?.report?.path;
if (!reportArtifactPath || !fs.existsSync(path.join(root, reportArtifactPath))) fail("PBIP report artifact path is invalid");
const definition = readJson(path.join(reportRoot, "definition.pbir"));
const semanticPath = definition?.datasetReference?.byPath?.path;
if (!semanticPath || !fs.existsSync(path.resolve(reportRoot, semanticPath))) fail("definition.pbir semantic-model path is invalid");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "passed",
  tables: [...model.keys()],
  measures: requiredMeasures.length,
  pages: pageSummary,
  uniqueVisualIds: allVisualIds.size,
  relationships: 0,
}, null, 2));
