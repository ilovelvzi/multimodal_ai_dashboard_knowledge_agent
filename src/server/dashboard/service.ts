import ExcelJS from "exceljs";
import { dashboardDatasets } from "@/lib/catalog";
import { DASHBOARD_MIME_TYPES, MAX_DASHBOARD_FILE_SIZE_BYTES } from "@/server/config/mvp";
import { createId } from "@/server/storage/fs";
import { nowIso, readStore, updateStore, type StoredDataset } from "@/server/store/mvp-store";

function getExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

export function validateDashboardFile(file: File) {
  const extension = getExtension(file.name);
  const allowedExtension = ["csv", "xlsx"].includes(extension);
  const allowedMime = DASHBOARD_MIME_TYPES.includes(file.type as (typeof DASHBOARD_MIME_TYPES)[number]) || !file.type;

  if (!allowedExtension && !allowedMime) {
    return { ok: false as const, reason: "unsupported_dataset_type" };
  }

  if (file.size > MAX_DASHBOARD_FILE_SIZE_BYTES) {
    return { ok: false as const, reason: "dataset_too_large" };
  }

  return { ok: true as const, extension };
}

type DatasetPreview = {
  rows: Array<Record<string, string | number | null>>;
  columns: string[];
};

function normalizeCell(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number(value.toFixed(4));
  }

  return String(value);
}

function parseCsv(buffer: Buffer): DatasetPreview {
  const [headerLine, ...dataLines] = buffer
    .toString("utf8")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter(Boolean);

  const columns = (headerLine ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const rows = dataLines.slice(0, 50).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(columns.map((column, index) => [column, normalizeCell(values[index]?.trim() ?? null)]));
  });

  return { rows, columns };
}

async function parseXlsx(buffer: Buffer): Promise<DatasetPreview> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { rows: [], columns: [] };
  }

  const headerRow = worksheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values) ? headerRow.values : [];
  const columns = headerValues
    .slice(1)
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  const rows = worksheet.getRows(2, 50)?.map((row) =>
    Object.fromEntries(
      columns.map((column, index) => [column, normalizeCell(row.getCell(index + 1).value)]),
    ),
  ) ?? [];

  return { rows, columns };
}

function inferColumnTypes(rows: Array<Record<string, string | number | null>>, columns: string[]) {
  return columns.map((column) => {
    const values = rows.map((row) => row[column]).filter((value) => value !== null);
    const numeric = values.every((value) => typeof value === "number" || /^-?\d+(\.\d+)?$/.test(String(value)));

    return {
      name: column,
      type: numeric ? "number" : "string",
      sample: values[0] ?? null,
      nonNullCount: values.length,
    };
  });
}

function buildDatasetReport(name: string, rows: Array<Record<string, string | number | null>>, columns: string[]) {
  const typedColumns = inferColumnTypes(rows, columns);
  const numericColumns = typedColumns.filter((column) => column.type === "number");

  return [
    `# ${name} 数据摘要`,
    "",
    `- 行数（预览范围内）：${rows.length}`,
    `- 字段数：${columns.length}`,
    `- 数值字段：${numericColumns.map((column) => column.name).join("、") || "无"}`,
    "",
    "## 字段概览",
    ...typedColumns.map((column) => `- ${column.name}: ${column.type}（非空 ${column.nonNullCount}）`),
  ].join("\n");
}

export async function uploadDashboardDataset(name: string, file: File) {
  const validation = validateDashboardFile(file);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const preview = validation.extension === "csv" ? parseCsv(buffer) : await parseXlsx(buffer);
  const reportMarkdown = buildDatasetReport(name, preview.rows, preview.columns);
  const timestamp = nowIso();

  const dataset: StoredDataset = {
    id: createId(),
    name,
    sourceType: validation.extension.toUpperCase(),
    fileName: file.name,
    schemaSnapshot: {
      rowCount: preview.rows.length,
      columns: inferColumnTypes(preview.rows, preview.columns),
    },
    metadata: {
      size: file.size,
    },
    previewRows: preview.rows.slice(0, 8),
    reportMarkdown,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await updateStore((store) => {
    store.dashboardDatasets.push(dataset);
  });

  return dataset;
}

export async function listDashboardDatasets() {
  const store = await readStore();
  const stored = store.dashboardDatasets
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    seeds: dashboardDatasets,
    uploaded: stored,
  };
}
