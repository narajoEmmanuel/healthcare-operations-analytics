import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const reportRoot = path.join(root, "Medicare_Inpatient_Service_Payment_Analytics.Report");
const pagesRoot = path.join(reportRoot, "definition", "pages");
const visualSchema = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.12.0/schema.json";
const pageSchema = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json";

const existingExecutivePage = "6351169c07287d017504";
const pageIds = {
  executive: existingExecutivePage,
  service: hex("page-service-category-analysis", 20),
  payment: hex("page-payment-benchmarking", 20),
  priority: hex("page-review-priorities", 20),
};

const existingExecutiveVisuals = {
  title: "27a52bb54bee64010d32",
  subtitle: "1db7adfaa77a0e6a9773",
  totalDischarges: "6de38edfc9622ca66230",
  aggregatePayment: "3afb4493bcdc8eed991c",
  providerCount: "a207c77aa159964c0912",
  drgCount: "f60d0fe9eb8bb766e0e9",
};

function hex(seed, length) {
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, length);
}

function literal(value, suffix = "") {
  const encoded = typeof value === "string" ? `'${value.replaceAll("'", "''")}'` : `${value}${suffix}`;
  return { expr: { Literal: { Value: encoded } } };
}

function bool(value) {
  return { expr: { Literal: { Value: value ? "true" : "false" } } };
}

function fill(color) {
  return { solid: { color: { expr: { Literal: { Value: `'${color}'` } } } } };
}

function column(table, property) {
  return {
    Column: {
      Expression: { SourceRef: { Entity: table } },
      Property: property,
    },
  };
}

function sourceColumn(source, property) {
  return {
    Column: {
      Expression: { SourceRef: { Source: source } },
      Property: property,
    },
  };
}

function aggregation(table, property, fn = 0) {
  return {
    Aggregation: {
      Expression: column(table, property),
      Function: fn,
    },
  };
}

function sourceAggregation(source, property, fn = 0) {
  return {
    Aggregation: {
      Expression: sourceColumn(source, property),
      Function: fn,
    },
  };
}

function measure(table, property) {
  return {
    Measure: {
      Expression: { SourceRef: { Entity: table } },
      Property: property,
    },
  };
}

function projection(field, queryRef, nativeQueryRef, displayName, format) {
  const value = { field, queryRef, nativeQueryRef };
  if (displayName && displayName !== nativeQueryRef) value.displayName = displayName;
  if (format) value.format = format;
  return value;
}

function columnProjection(table, property, label, format) {
  return projection(column(table, property), `${table}.${property}`, property, label, format);
}

function aggregateProjection(table, property, label, fn = 0, format) {
  const names = ["Sum", "Average", "Count", "Min", "Max", "CountNonNull", "Median", "StdDev", "Variance"];
  const nativeNames = ["Sum", "Average", "Count", "Min", "Max", "Count", "Median", "Standard deviation", "Variance"];
  return projection(aggregation(table, property, fn), `${names[fn]}(${table}.${property})`, `${nativeNames[fn]} of ${property}`, label, format);
}

function measureProjection(table, property, label = property, format) {
  return projection(measure(table, property), `${table}.${property}`, property, label, format);
}

function position(x, y, width, height, order) {
  return { x, y, z: order, height, width, tabOrder: order };
}

function titleVco(text) {
  return {
    title: [
      {
        properties: {
          show: bool(true),
          text: literal(text),
          fontSize: literal(14, "D"),
          bold: bool(true),
          fontColor: fill("#243B53"),
        },
      },
    ],
    subTitle: [{ properties: { show: bool(false) } }],
  };
}

function textbox(name, pos, text, style = {}) {
  const textStyle = {
    fontFamily: "Segoe UI",
    fontSize: style.fontSize ?? "14px",
    color: style.color ?? "#243B53",
  };
  if (style.bold) textStyle.fontWeight = "bold";
  return {
    $schema: visualSchema,
    name,
    position: pos,
    visual: {
      visualType: "textbox",
      objects: {
        general: [
          {
            properties: {
              paragraphs: [
                {
                  textRuns: [{ value: text, textStyle }],
                  horizontalTextAlignment: style.alignment ?? "left",
                },
              ],
            },
          },
        ],
      },
      visualContainerObjects: {
        background: [{ properties: { show: bool(false) } }],
        border: [{ properties: { show: bool(false) } }],
        padding: [
          {
            properties: {
              top: literal(0, "D"),
              bottom: literal(0, "D"),
              left: literal(0, "D"),
              right: literal(0, "D"),
            },
          },
        ],
      },
    },
  };
}

function card(name, pos, measureName, options = {}) {
  const valueProperties = {
    show: bool(true),
    fontSize: literal(options.fontSize ?? 28, "D"),
    bold: bool(true),
    labelDisplayUnits: literal(options.displayUnits ?? 1, "D"),
    labelPrecision: literal(options.precision ?? 0, "L"),
  };
  if (options.customFormatString) valueProperties.customFormatString = literal(options.customFormatString);
  const labelProperties = {
    show: bool(true),
    text: literal(options.label ?? measureName),
    fontSize: literal(12, "D"),
    fontColor: fill("#52606D"),
  };
  return {
    $schema: visualSchema,
    name,
    position: pos,
    visual: {
      visualType: "cardVisual",
      query: {
        queryState: {
          Data: { projections: [measureProjection("Provider DRG Review", measureName, options.label ?? measureName)] },
        },
      },
      objects: {
        value: [{ properties: valueProperties, selector: { id: "default" } }],
        label: [{ properties: labelProperties, selector: { id: "default" } }],
        outline: [{ properties: { show: bool(false) }, selector: { id: "default" } }],
      },
      visualContainerObjects: {
        subTitle: [{ properties: { show: bool(false) } }],
      },
      drillFilterOtherVisuals: true,
    },
  };
}

function slicer(name, pos, table, property, label, strictSingleSelect = false) {
  const objects = {
    data: [{ properties: { mode: literal("Dropdown") } }],
    header: [{ properties: { show: bool(true), text: literal(label) } }],
  };
  if (strictSingleSelect) {
    objects.selection = [
      {
        properties: {
          strictSingleSelect: bool(true),
          singleSelect: bool(true),
          selectAllCheckboxEnabled: bool(false),
        },
      },
    ];
  }
  return {
    $schema: visualSchema,
    name,
    position: pos,
    visual: {
      visualType: "slicer",
      query: {
        queryState: {
          Values: { projections: [columnProjection(table, property, label)] },
        },
      },
      objects,
      visualContainerObjects: {
        subTitle: [{ properties: { show: bool(false) } }],
        padding: [
          {
            properties: {
              top: literal(8, "D"),
              bottom: literal(8, "D"),
              left: literal(8, "D"),
              right: literal(8, "D"),
            },
          },
        ],
      },
      drillFilterOtherVisuals: true,
    },
  };
}

function topNFilter(seed, table, categoryProperty, orderProperty, top) {
  const source = "d";
  const outerSource = "d1";
  return {
    filters: [
      {
        name: `Filter${hex(seed, 24)}`,
        field: column(table, categoryProperty),
        type: "TopN",
        filter: {
          Version: 2,
          From: [
            {
              Name: "subquery",
              Expression: {
                Subquery: {
                  Query: {
                    Version: 2,
                    From: [{ Name: source, Entity: table, Type: 0 }],
                    Select: [{ Column: sourceColumn(source, categoryProperty).Column, Name: "field" }],
                    OrderBy: [{ Direction: 2, Expression: sourceAggregation(source, orderProperty, 0) }],
                    Top: top,
                  },
                },
              },
              Type: 2,
            },
            { Name: outerSource, Entity: table, Type: 0 },
          ],
          Where: [
            {
              Condition: {
                In: {
                  Expressions: [sourceColumn(outerSource, categoryProperty)],
                  Table: { SourceRef: { Source: "subquery" } },
                },
              },
            },
          ],
        },
        howCreated: "User",
      },
    ],
  };
}

function barChart(name, pos, options) {
  const queryState = {
    Category: { projections: [columnProjection(options.table, options.category, options.categoryLabel)] },
    Y: { projections: options.values },
  };
  if (options.tooltips?.length) queryState.Tooltips = { projections: options.tooltips };
  const sortField = options.sortField;
  const labelProperties = {
    show: bool(true),
    labelPosition: literal("OutsideEnd"),
    optimizeLabelDisplay: bool(true),
    labelOverflow: bool(true),
    labelDisplayUnits: literal(options.labelDisplayUnits ?? 0, "D"),
    labelPrecision: literal(options.labelPrecision ?? 1, "L"),
    fontSize: literal(10, "D"),
  };
  if (options.labelCustomFormatString) labelProperties.valueCustomFormatString = literal(options.labelCustomFormatString);
  return {
    $schema: visualSchema,
    name,
    position: pos,
    visual: {
      visualType: "clusteredBarChart",
      query: {
        queryState,
        sortDefinition: {
          sort: [{ field: sortField, direction: "Descending" }],
          isDefaultSort: false,
        },
      },
      objects: {
        labels: [
          {
            properties: labelProperties,
          },
        ],
        ...(options.axisDisplayUnits ? { valueAxis: [{ properties: {
          labelDisplayUnits: literal(options.axisDisplayUnits, "D"),
          labelPrecision: literal(options.axisPrecision ?? 2, "L"),
        } }] } : {}),
      },
      visualContainerObjects: titleVco(options.title),
      drillFilterOtherVisuals: true,
    },
    filterConfig: topNFilter(options.filterSeed, options.table, options.category, options.topOrderProperty, options.top),
  };
}

function tableVisual(name, pos, table, fields, title, sort = []) {
  const sortEntries = sort.map(({ property, direction }) => ({
    field: column(table, property),
    direction,
  }));
  const query = {
    queryState: {
      Values: { projections: fields.map((f) => columnProjection(table, f.property, f.label, f.format)) },
    },
  };
  if (sortEntries.length) query.sortDefinition = { sort: sortEntries, isDefaultSort: false };
  return {
    $schema: visualSchema,
    name,
    position: pos,
    visual: {
      visualType: "tableEx",
      query,
      objects: {
        columnHeaders: [
          {
            properties: {
              columnAdjustment: literal("growToFit"),
              autoSizeColumnWidth: bool(true),
              wordWrap: bool(true),
              fontSize: literal(10, "D"),
            },
          },
        ],
        values: [
          {
            properties: {
              fontSize: literal(9, "D"),
              backColorPrimary: fill("#FFFFFF"),
              backColorSecondary: fill("#F4F6F8"),
            },
          },
        ],
      },
      visualContainerObjects: titleVco(title),
      drillFilterOtherVisuals: true,
    },
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writePage(key, displayName, visuals) {
  const pageId = pageIds[key];
  const pageDir = path.join(pagesRoot, pageId);
  writeJson(path.join(pageDir, "page.json"), {
    $schema: pageSchema,
    name: pageId,
    displayName,
    displayOption: "FitToPage",
    height: 1080,
    width: 1920,
  });
  for (const visual of visuals) {
    writeJson(path.join(pageDir, "visuals", visual.name, "visual.json"), visual);
  }
}

function v(page, label) {
  return hex(`${page}-${label}`, 20);
}

const executiveVisuals = [
  textbox(existingExecutiveVisuals.title, position(48, 24, 1200, 48, 100), "Medicare Inpatient Service & Payment Analytics", { fontSize: "26px", bold: true }),
  textbox(existingExecutiveVisuals.subtitle, position(48, 72, 1200, 32, 200), "2024 CMS hospital benchmarking | Executive Overview", { fontSize: "14px", color: "#52606D" }),
  card(existingExecutiveVisuals.totalDischarges, position(48, 128, 426, 152, 300), "Total Discharges", { displayUnits: 1000000, precision: 2 }),
  card(existingExecutiveVisuals.aggregatePayment, position(490, 128, 426, 152, 400), "Estimated Aggregate Total Payment", { displayUnits: 1000000000, precision: 2 }),
  card(existingExecutiveVisuals.providerCount, position(932, 128, 426, 152, 500), "Provider Count", { displayUnits: 1, precision: 0, customFormatString: "#,0" }),
  card(existingExecutiveVisuals.drgCount, position(1374, 128, 498, 152, 600), "DRG Count", { displayUnits: 1, precision: 0, customFormatString: "#,0" }),
  barChart(v("executive", "payment-chart"), position(48, 312, 896, 624, 700), {
    table: "DRG Benchmark",
    category: "drg_code",
    categoryLabel: "DRG Code",
    values: [aggregateProjection("DRG Benchmark", "estimated_aggregate_total_payment", "Estimated Aggregate Total Payment")],
    tooltips: [
      aggregateProjection("DRG Benchmark", "drg_description", "DRG Description", 3),
      aggregateProjection("DRG Benchmark", "total_discharges", "Total Discharges"),
      aggregateProjection("DRG Benchmark", "provider_count", "Provider Count"),
    ],
    sortField: aggregation("DRG Benchmark", "estimated_aggregate_total_payment"),
    topOrderProperty: "estimated_aggregate_total_payment",
    top: 10,
    filterSeed: "executive-payment-top10",
    labelDisplayUnits: 1000000000,
    axisDisplayUnits: 1000000000,
    labelPrecision: 2,
    title: "Top DRGs by Estimated Aggregate Payment",
  }),
  barChart(v("executive", "discharge-chart"), position(976, 312, 896, 624, 800), {
    table: "DRG Benchmark",
    category: "drg_code",
    categoryLabel: "DRG Code",
    values: [aggregateProjection("DRG Benchmark", "total_discharges", "Total Discharges")],
    tooltips: [
      aggregateProjection("DRG Benchmark", "drg_description", "DRG Description", 3),
      aggregateProjection("DRG Benchmark", "estimated_aggregate_total_payment", "Estimated Aggregate Total Payment"),
      aggregateProjection("DRG Benchmark", "provider_count", "Provider Count"),
    ],
    sortField: aggregation("DRG Benchmark", "total_discharges"),
    topOrderProperty: "total_discharges",
    top: 10,
    filterSeed: "executive-discharges-top10",
    labelDisplayUnits: 1000,
    axisDisplayUnits: 1000000,
    labelPrecision: 0,
    title: "Top DRGs by Discharge Volume",
  }),
  textbox(v("executive", "note"), position(48, 960, 1824, 64, 900), "Estimated aggregate payment is derived from total discharges × average total payment. It is not revenue, cost, margin, or profit.", { fontSize: "12px", color: "#52606D" }),
];

const serviceVisuals = [
  textbox(v("service", "title"), position(48, 24, 1000, 48, 100), "Service Category Analysis", { fontSize: "26px", bold: true }),
  textbox(v("service", "subtitle"), position(48, 72, 1000, 32, 200), "Materiality across Medicare inpatient DRGs", { fontSize: "14px", color: "#52606D" }),
  slicer(v("service", "drg-code"), position(48, 112, 220, 80, 300), "DRG Benchmark", "drg_code", "DRG Code"),
  slicer(v("service", "drg-description"), position(284, 112, 780, 80, 400), "DRG Benchmark", "drg_description", "DRG Description"),
  barChart(v("service", "discharge-chart"), position(48, 216, 896, 360, 500), {
    table: "DRG Benchmark",
    category: "drg_code",
    categoryLabel: "DRG Code",
    values: [aggregateProjection("DRG Benchmark", "total_discharges", "Total Discharges")],
    tooltips: [
      aggregateProjection("DRG Benchmark", "drg_description", "DRG Description", 3),
      aggregateProjection("DRG Benchmark", "provider_count", "Provider Count"),
      aggregateProjection("DRG Benchmark", "discharge_share_national", "National Discharge Share"),
    ],
    sortField: aggregation("DRG Benchmark", "total_discharges"),
    topOrderProperty: "total_discharges",
    top: 15,
    filterSeed: "service-discharges-top15",
    labelDisplayUnits: 1000,
    axisDisplayUnits: 1000000,
    labelPrecision: 0,
    title: "Top 15 DRGs by Total Discharges",
  }),
  barChart(v("service", "payment-chart"), position(976, 216, 896, 360, 600), {
    table: "DRG Benchmark",
    category: "drg_code",
    categoryLabel: "DRG Code",
    values: [aggregateProjection("DRG Benchmark", "estimated_aggregate_total_payment", "Estimated Aggregate Total Payment")],
    tooltips: [
      aggregateProjection("DRG Benchmark", "drg_description", "DRG Description", 3),
      aggregateProjection("DRG Benchmark", "provider_count", "Provider Count"),
      aggregateProjection("DRG Benchmark", "total_discharges", "Total Discharges"),
      aggregateProjection("DRG Benchmark", "discharge_weighted_total_payment", "Discharge-Weighted Total Payment"),
    ],
    sortField: aggregation("DRG Benchmark", "estimated_aggregate_total_payment"),
    topOrderProperty: "estimated_aggregate_total_payment",
    top: 15,
    filterSeed: "service-payment-top15",
    labelDisplayUnits: 1000000000,
    axisDisplayUnits: 1000000000,
    labelPrecision: 2,
    title: "Top 15 DRGs by Estimated Aggregate Total Payment",
  }),
  tableVisual(v("service", "benchmark-table"), position(48, 600, 1824, 424, 700), "DRG Benchmark", [
    { property: "drg_code", label: "DRG Code" },
    { property: "drg_description", label: "DRG Description" },
    { property: "provider_count", label: "Provider Count", format: "#,0" },
    { property: "total_discharges", label: "Total Discharges", format: "#,0" },
    { property: "discharge_share_national", label: "National Discharge Share", format: "0.00%" },
    { property: "estimated_aggregate_total_payment", label: "Estimated Aggregate Total Payment", format: "$#,0.00" },
    { property: "provider_average_total_payment", label: "Provider Average Total Payment", format: "$#,0.00" },
    { property: "provider_median_total_payment", label: "Provider Median Total Payment", format: "$#,0.00" },
    { property: "discharge_weighted_total_payment", label: "Discharge-Weighted Total Payment", format: "$#,0.00" },
  ], "DRG Benchmark Detail", [{ property: "estimated_aggregate_total_payment", direction: "Descending" }]),
];

const paymentVisuals = [
  textbox(v("payment", "title"), position(48, 24, 1000, 48, 100), "Payment Benchmarking", { fontSize: "26px", bold: true }),
  textbox(v("payment", "subtitle"), position(48, 72, 1000, 32, 200), "Same-DRG provider payment variation", { fontSize: "14px", color: "#52606D" }),
  slicer(v("payment", "drg-code"), position(48, 112, 220, 80, 300), "Provider DRG Review", "drg_code", "DRG Code (select one)", true),
  slicer(v("payment", "drg-description"), position(284, 112, 650, 80, 400), "Provider DRG Review", "drg_description", "DRG Description"),
  slicer(v("payment", "state"), position(950, 112, 220, 80, 500), "Provider DRG Review", "provider_state", "State"),
  slicer(v("payment", "ruca"), position(1186, 112, 300, 80, 600), "Provider DRG Review", "provider_ruca", "RUCA"),
  card(v("payment", "median-card"), position(48, 216, 352, 144, 700), "Selected DRG Median Total Payment", { displayUnits: 1, precision: 2, customFormatString: "$#,0.00", fontSize: 24 }),
  card(v("payment", "average-card"), position(416, 216, 352, 144, 800), "Average Total Payment", { displayUnits: 1, precision: 2, customFormatString: "$#,0.00", fontSize: 24 }),
  card(v("payment", "provider-card"), position(784, 216, 352, 144, 900), "Provider Count", { displayUnits: 1, precision: 0, customFormatString: "#,0", fontSize: 24 }),
  card(v("payment", "discharges-card"), position(1152, 216, 352, 144, 950), "Total Discharges", { displayUnits: 1, precision: 0, customFormatString: "#,0", fontSize: 24 }),
  card(v("payment", "payment-card"), position(1520, 216, 352, 144, 975), "Estimated Aggregate Total Payment", { displayUnits: 1, precision: 2, customFormatString: "$#,0.00", fontSize: 22 }),
  barChart(v("payment", "provider-chart"), position(48, 384, 800, 640, 1000), {
    table: "Provider DRG Review",
    category: "provider_name",
    categoryLabel: "Provider Name",
    values: [
      measureProjection("Provider DRG Review", "Average Total Payment"),
      measureProjection("Provider DRG Review", "Selected DRG Median Total Payment"),
    ],
    tooltips: [
      aggregateProjection("Provider DRG Review", "total_discharges", "Total Discharges"),
      aggregateProjection("Provider DRG Review", "estimated_aggregate_total_payment", "Estimated Aggregate Total Payment"),
      aggregateProjection("Provider DRG Review", "payment_difference_pct", "Payment Difference %", 1, "0.00%"),
    ],
    sortField: measure("Provider DRG Review", "Average Total Payment"),
    topOrderProperty: "estimated_aggregate_total_payment",
    top: 20,
    filterSeed: "payment-provider-top20",
    labelDisplayUnits: 1,
    labelPrecision: 1,
    labelCustomFormatString: '$0,.0"K"',
    title: "Provider Average Payment vs Same-DRG Median",
  }),
  textbox(v("payment", "note"), position(872, 384, 1000, 72, 1100), "Payment differences are screening signals and may reflect legitimate geographic or institutional payment adjustments.", { fontSize: "12px", color: "#52606D" }),
  tableVisual(v("payment", "detail-table"), position(872, 472, 1000, 552, 1200), "Provider DRG Review", [
    { property: "provider_ccn", label: "Provider CCN" },
    { property: "provider_name", label: "Provider Name" },
    { property: "provider_state", label: "State" },
    { property: "provider_ruca", label: "RUCA" },
    { property: "total_discharges", label: "Total Discharges", format: "#,0" },
    { property: "avg_total_payment", label: "Average Total Payment", format: "$#,0.00" },
    { property: "drg_median_total_payment", label: "DRG Median Total Payment", format: "$#,0.00" },
    { property: "state_median_total_payment", label: "State Median Total Payment", format: "$#,0.00" },
    { property: "ruca_median_total_payment", label: "RUCA Median Total Payment", format: "$#,0.00" },
    { property: "payment_difference_from_drg_median", label: "Payment Difference from DRG Median", format: "$#,0.00" },
    { property: "payment_difference_pct", label: "Payment Difference %", format: "0.00%" },
    { property: "payment_percentile_within_drg", label: "Payment Percentile within DRG", format: "0.00%" },
  ], "Provider Benchmark Detail", [{ property: "payment_difference_pct", direction: "Descending" }]),
];

const priorityVisuals = [
  textbox(v("priority", "title"), position(48, 24, 1000, 48, 100), "Review Priorities", { fontSize: "26px", bold: true }),
  textbox(v("priority", "subtitle"), position(48, 72, 1000, 32, 200), "Transparent screening for deeper financial review", { fontSize: "14px", color: "#52606D" }),
  slicer(v("priority", "priority"), position(48, 112, 280, 80, 300), "Provider DRG Review", "review_priority", "Review Priority"),
  slicer(v("priority", "state"), position(344, 112, 220, 80, 400), "Provider DRG Review", "provider_state", "State"),
  slicer(v("priority", "drg-code"), position(580, 112, 220, 80, 500), "Provider DRG Review", "drg_code", "DRG Code"),
  slicer(v("priority", "drg-description"), position(816, 112, 760, 80, 600), "Provider DRG Review", "drg_description", "DRG Description"),
  card(v("priority", "high-card"), position(48, 216, 426, 144, 700), "High Priority Count", { displayUnits: 1, precision: 0, customFormatString: "#,0" }),
  card(v("priority", "moderate-card"), position(490, 216, 426, 144, 800), "Moderate Priority Count", { displayUnits: 1, precision: 0, customFormatString: "#,0" }),
  card(v("priority", "routine-card"), position(932, 216, 426, 144, 900), "Routine Review Count", { displayUnits: 1, precision: 0, customFormatString: "#,0" }),
  card(v("priority", "share-card"), position(1374, 216, 498, 144, 1000), "High Priority Share", { displayUnits: 1, precision: 2, customFormatString: "0.00%" }),
  tableVisual(v("priority", "detail-table"), position(48, 392, 1824, 560, 1100), "Provider DRG Review", [
    { property: "provider_name", label: "Provider Name" },
    { property: "provider_state", label: "State" },
    { property: "drg_code", label: "DRG Code" },
    { property: "drg_description", label: "DRG Description" },
    { property: "total_discharges", label: "Total Discharges", format: "#,0" },
    { property: "estimated_aggregate_total_payment", label: "Estimated Aggregate Total Payment", format: "$#,0.00" },
    { property: "avg_total_payment", label: "Average Total Payment", format: "$#,0.00" },
    { property: "drg_median_total_payment", label: "DRG Median Total Payment", format: "$#,0.00" },
    { property: "payment_difference_pct", label: "Payment Difference %", format: "0.00%" },
    { property: "payment_percentile_within_drg", label: "Payment Percentile within DRG", format: "0.00%" },
    { property: "exposure_percentile", label: "Exposure Percentile", format: "0.00%" },
    { property: "discharge_percentile", label: "Discharge Percentile", format: "0.00%" },
    { property: "review_priority", label: "Review Priority" },
  ], "Provider-DRG Review Detail", [
    { property: "review_priority", direction: "Ascending" },
    { property: "estimated_aggregate_total_payment", direction: "Descending" },
  ]),
  textbox(v("priority", "note"), position(48, 968, 1824, 56, 1200), "Review priority preserves the transparent SQL classification; it is a screening category, not a validated financial, clinical, or operational score.", { fontSize: "12px", color: "#52606D" }),
];

writePage("executive", "Executive Overview", executiveVisuals);
writePage("service", "Service Category Analysis", serviceVisuals);
writePage("payment", "Payment Benchmarking", paymentVisuals);
writePage("priority", "Review Priorities", priorityVisuals);

writeJson(path.join(pagesRoot, "pages.json"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.1.0/schema.json",
  pageOrder: [pageIds.executive, pageIds.service, pageIds.payment, pageIds.priority],
  activePageName: pageIds.executive,
});

console.log(JSON.stringify({ pageIds, visualCounts: {
  executive: executiveVisuals.length,
  service: serviceVisuals.length,
  payment: paymentVisuals.length,
  priority: priorityVisuals.length,
} }, null, 2));
