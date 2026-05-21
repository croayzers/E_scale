import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = path.join(__dirname, "Escale_Dashboard_Base.xlsx");
const previewDir = path.join(__dirname, "_previews");

const palette = {
  ink: "#111827",
  slate: "#475569",
  soft: "#F8FAFC",
  line: "#CBD5E1",
  primary: "#2563EB",
  primarySoft: "#DBEAFE",
  success: "#16A34A",
  warn: "#F59E0B",
  muted: "#E2E8F0"
};

const rowStart = 5;
const dataStart = 6;
const dataEnd = 500;

function setColumns(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function styleRange(range, format) {
  range.format = format;
}

function baseSheet(shell, title, subtitle) {
  shell.showGridLines = false;
  shell.getRange("A1:Z60").format = {
    fill: "#FFFFFF",
    font: { color: palette.ink, size: 10 }
  };

  shell.getRange("A1:N1").merge();
  shell.getRange("A2:N2").merge();
  shell.getRange("A3:N3").merge();

  shell.getRange("A1").values = [[title]];
  shell.getRange("A2").values = [[subtitle]];
  shell.getRange("A3").values = [[
    "Workbook temporal para sustituir listas de SharePoint. Usar valores controlados y dejar los campos no capturados como 'No informado' o 'Pendiente'."
  ]];

  styleRange(shell.getRange("A1:N1"), {
    fill: palette.primary,
    font: { bold: true, color: "#FFFFFF", size: 18 }
  });
  styleRange(shell.getRange("A2:N2"), {
    fill: palette.primarySoft,
    font: { color: palette.ink, size: 11 }
  });
  styleRange(shell.getRange("A3:N3"), {
    fill: palette.soft,
    font: { color: palette.slate, italic: true, size: 10 },
    wrapText: true
  });
  shell.getRange("A3:N3").format.rowHeight = 34;
  shell.freezePanes.freezeRows(rowStart);
}

function addHeader(sheet, rangeA1, headers) {
  sheet.getRange(rangeA1).values = [headers];
  styleRange(sheet.getRange(rangeA1), {
    fill: palette.ink,
    font: { bold: true, color: "#FFFFFF", size: 10 }
  });
}

function applyTableBodyStyle(sheet, rangeA1) {
  styleRange(sheet.getRange(rangeA1), {
    fill: "#FFFFFF",
    font: { color: palette.ink, size: 10 }
  });
}

function addValidation(range, formula1) {
  range.dataValidation = {
    rule: { type: "list", formula1 }
  };
}

function dateFormat(range) {
  range.format.numberFormat = "yyyy-mm-dd hh:mm";
}

function currencyFormat(range) {
  range.format.numberFormat = "€ #,##0.00";
}

function integerFormat(range) {
  range.format.numberFormat = "0";
}

function decimalFormat(range) {
  range.format.numberFormat = "0.000000";
}

function buildCatalogos(sheet) {
  baseSheet(sheet, "Catalogos de control", "Listas maestras para validaciones y estados consistentes");
  setColumns(sheet, [22, 20, 20, 22, 18, 20, 18, 18, 18, 18, 18]);

  const blocks = [
    ["A5:A10", "Suscripcion_Status", ["Activa", "Pausada", "Cancelada", "Pendiente", "No informado"]],
    ["B5:B11", "Plan_Suscripcion", ["Free", "Trial", "Basic", "Pro", "Enterprise", "No informado"]],
    ["C5:C9", "Ciclo_Facturacion", ["Mensual", "Anual", "Trial", "No aplica"]],
    ["D5:D8", "Export_Mode", ["PDF_3D", "PDF_PLANO", "No informado"]],
    ["E5:E8", "Registro_Status", ["Borrador", "Activo", "Archivado", "No informado"]],
    ["F5:F8", "API_Status", ["Pendiente", "Disponible", "Error", "No informado"]],
    ["G5:G10", "Device_Type", ["Escritorio", "Portatil", "Tablet", "Movil", "Otro", "No informado"]],
    ["H5:H7", "Si_No", ["Si", "No", "No informado"]],
    ["I5:I8", "Asset_Type", ["Logo", "Documento", "Captura", "Otro"]],
    ["J5:J10", "Operating_System", ["Windows", "macOS", "Linux", "Android", "iOS", "No informado"]],
    ["K5:K7", "Missing_Value_Policy", ["No informado", "Pendiente", "No disponible"]]
  ];

  for (const [rangeRef, title, items] of blocks) {
    const [start, end] = rangeRef.split(":");
    sheet.getRange(start).values = [[title]];
    styleRange(sheet.getRange(start), {
      fill: palette.primarySoft,
      font: { bold: true, color: palette.ink }
    });
    const bodyRange = `${String.fromCharCode(start.charCodeAt(0))}6:${String.fromCharCode(start.charCodeAt(0))}${5 + items.length}`;
    sheet.getRange(bodyRange).values = items.map(item => [item]);
    applyTableBodyStyle(sheet, bodyRange);
  }
}

function buildDashboard(sheet) {
  baseSheet(sheet, "E-scale | Base dashboard empresarial", "Sustituto temporal de listas de SharePoint para empresa, suscripciones, exportaciones e inventario");
  setColumns(sheet, [24, 16, 3, 18, 16, 3, 12, 12, 12, 12, 12, 12, 12, 12]);

  addHeader(sheet, "A5:B5", ["KPI", "Valor"]);
  sheet.getRange("A6:A11").values = [[
    "Empresas"
  ], [
    "Subscripciones activas"
  ], [
    "Exportaciones registradas"
  ], [
    "Lineas de inventario"
  ], [
    "Lugares registrados"
  ], [
    "Dispositivos capturados"
  ]];
  sheet.getRange("B6:B11").formulas = [[
    '=COUNTA(Empresas!A6:A500)'
  ], [
    '=COUNTIF(Suscripciones!E6:E500,"Activa")'
  ], [
    '=COUNTA(Exportaciones!A6:A500)'
  ], [
    '=COUNTA(Inventario!A6:A1000)'
  ], [
    '=COUNTA(Lugares!A6:A500)'
  ], [
    '=COUNTA(Dispositivos!A6:A500)'
  ]];
  applyTableBodyStyle(sheet, "A6:B11");
  integerFormat(sheet.getRange("B6:B11"));

  sheet.getRange("D5:E5").values = [["Dominio", "Registros"]];
  styleRange(sheet.getRange("D5:E5"), {
    fill: palette.primarySoft,
    font: { bold: true, color: palette.ink }
  });
  sheet.getRange("D6:D11").values = [["Empresas"], ["Subscripciones"], ["Exportaciones"], ["Inventario"], ["Lugares"], ["Dispositivos"]];
  sheet.getRange("E6:E11").formulas = [["=B6"], ["=COUNTA(Suscripciones!A6:A500)"], ["=B8"], ["=B9"], ["=B10"], ["=B11"]];
  applyTableBodyStyle(sheet, "D6:E11");
  integerFormat(sheet.getRange("E6:E11"));

  const chart = sheet.charts.add("bar", sheet.getRange("D5:E11"));
  chart.title = "Cobertura de registros por dominio";
  chart.hasLegend = false;
  chart.xAxis = { axisType: "textAxis" };
  chart.yAxis = { numberFormatCode: "0" };
  chart.setPosition("G5", "N18");

  sheet.getRange("A14:F14").merge();
  sheet.getRange("A14").values = [["Politica de datos limpios"]];
  styleRange(sheet.getRange("A14:F14"), {
    fill: palette.ink,
    font: { bold: true, color: "#FFFFFF" }
  });
  const policyRows = [
    "Usar 'No informado' cuando el dato deba existir pero todavia no se haya capturado.",
    "Usar 'Pendiente' para procesos futuros como Google Maps o SharePoint.",
    "Guardar logos fisicos en la carpeta logos/ y referenciarlos desde la sheet Logos.",
    "El inventario se debe registrar por exportacion y por linea de item; importes e IDs tecnicos se dejan vacios hasta tener origen fiable.",
    "Telefono, CIF y otros campos futuros ya tienen hueco reservado con formato uniforme yyyy-mm-dd hh:mm para fechas.",
    "Las columnas auxiliares permiten montar dashboard y futuros conectores sin contaminar el dato maestro."
  ];
  policyRows.forEach((message, index) => {
    const row = 15 + index;
    sheet.getRange(`A${row}:F${row}`).merge();
    sheet.getRange(`A${row}`).values = [[message]];
  });
  styleRange(sheet.getRange("A15:F20"), {
    fill: palette.soft,
    font: { color: palette.slate, size: 10 },
    wrapText: true
  });
  sheet.getRange("A15:F20").format.rowHeight = 28;
}

function buildEmpresas(sheet) {
  baseSheet(sheet, "Empresas", "Registro maestro de empresa y datos base del dashboard");
  setColumns(sheet, [16, 22, 22, 24, 16, 20, 28, 18, 18, 22, 16, 16, 20, 14, 16, 18, 18, 24]);
  addHeader(sheet, "A5:R5", [
    "company_id",
    "company_name",
    "legal_name",
    "company_email",
    "logo_asset_id",
    "logo_file_name",
    "logo_relative_path",
    "subscription_plan_current",
    "subscription_status_current",
    "default_event_venue",
    "phone_future",
    "cif_future",
    "website",
    "country",
    "record_status",
    "created_at",
    "updated_at",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:R${dataEnd}`);
  addValidation(sheet.getRange(`H${dataStart}:H${dataEnd}`), "Catalogos!$B$6:$B$11");
  addValidation(sheet.getRange(`I${dataStart}:I${dataEnd}`), "Catalogos!$A$6:$A$10");
  addValidation(sheet.getRange(`O${dataStart}:O${dataEnd}`), "Catalogos!$E$6:$E$9");
  dateFormat(sheet.getRange(`P${dataStart}:Q${dataEnd}`));
}

function buildLogos(sheet) {
  baseSheet(sheet, "Logos", "Activos multimedia de empresa. Guardar los archivos reales en la carpeta logos/");
  setColumns(sheet, [16, 16, 14, 24, 14, 18, 28, 16, 24, 18, 24]);
  addHeader(sheet, "A5:K5", [
    "asset_id",
    "company_id",
    "asset_type",
    "file_name",
    "file_extension",
    "mime_type",
    "relative_path",
    "preview_status",
    "hash_reference",
    "last_updated_at",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:K${dataEnd}`);
  addValidation(sheet.getRange(`C${dataStart}:C${dataEnd}`), "Catalogos!$I$6:$I$9");
  addValidation(sheet.getRange(`H${dataStart}:H${dataEnd}`), "Catalogos!$E$6:$E$9");
  dateFormat(sheet.getRange(`J${dataStart}:J${dataEnd}`));
}

function buildSuscripciones(sheet) {
  baseSheet(sheet, "Suscripciones", "Seguimiento de plan, ciclo y estado comercial por empresa");
  setColumns(sheet, [18, 16, 18, 16, 16, 14, 16, 16, 18, 18, 18, 12, 16, 16, 18, 18, 24]);
  addHeader(sheet, "A5:Q5", [
    "subscription_id",
    "company_id",
    "plan_name",
    "billing_cycle",
    "status",
    "seats_contracted",
    "monthly_price_eur",
    "annual_price_eur",
    "start_date",
    "end_date",
    "renews_at",
    "trial_flag",
    "payment_status",
    "source_system",
    "created_at",
    "updated_at",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:Q${dataEnd}`);
  addValidation(sheet.getRange(`C${dataStart}:C${dataEnd}`), "Catalogos!$B$6:$B$11");
  addValidation(sheet.getRange(`D${dataStart}:D${dataEnd}`), "Catalogos!$C$6:$C$9");
  addValidation(sheet.getRange(`E${dataStart}:E${dataEnd}`), "Catalogos!$A$6:$A$10");
  addValidation(sheet.getRange(`L${dataStart}:L${dataEnd}`), "Catalogos!$H$6:$H$8");
  integerFormat(sheet.getRange(`F${dataStart}:F${dataEnd}`));
  currencyFormat(sheet.getRange(`G${dataStart}:H${dataEnd}`));
  dateFormat(sheet.getRange(`I${dataStart}:K${dataEnd}`));
  dateFormat(sheet.getRange(`O${dataStart}:P${dataEnd}`));
}

function buildExportaciones(sheet) {
  baseSheet(sheet, "Exportaciones", "Registro por cada exportacion realizada por empresa desde la app");
  setColumns(sheet, [18, 16, 18, 18, 22, 16, 22, 16, 18, 12, 16, 18, 24, 16, 14, 26]);
  addHeader(sheet, "A5:P5", [
    "export_id",
    "company_id",
    "subscription_id",
    "event_id",
    "event_name",
    "venue_id",
    "venue_name",
    "export_mode",
    "export_timestamp",
    "total_pax",
    "total_inventory_items",
    "total_inventory_categories",
    "pdf_filename",
    "export_status",
    "captured_from_app",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:P${dataEnd}`);
  addValidation(sheet.getRange(`H${dataStart}:H${dataEnd}`), "Catalogos!$D$6:$D$8");
  addValidation(sheet.getRange(`N${dataStart}:N${dataEnd}`), "Catalogos!$E$6:$E$9");
  addValidation(sheet.getRange(`O${dataStart}:O${dataEnd}`), "Catalogos!$H$6:$H$8");
  integerFormat(sheet.getRange(`J${dataStart}:L${dataEnd}`));
  dateFormat(sheet.getRange(`I${dataStart}:I${dataEnd}`));
}

function buildInventario(sheet) {
  baseSheet(sheet, "Inventario", "Detalle de lineas de inventario generadas por cada exportacion");
  setColumns(sheet, [18, 18, 16, 18, 18, 26, 12, 12, 14, 16, 18, 24]);
  addHeader(sheet, "A5:L5", [
    "inventory_line_id",
    "export_id",
    "company_id",
    "category",
    "item_type",
    "item_label",
    "quantity",
    "pax",
    "unit_price_eur",
    "total_price_eur",
    "captured_at",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:L1000`);
  integerFormat(sheet.getRange(`G${dataStart}:H1000`));
  currencyFormat(sheet.getRange(`I${dataStart}:J1000`));
  dateFormat(sheet.getRange(`K${dataStart}:K1000`));
  sheet.getRange("J6").formulas = [['=IF(OR(G6="",I6=""),"",G6*I6)']];
  sheet.getRange("J6:J1000").fillDown();
}

function buildLugares(sheet) {
  baseSheet(sheet, "Lugares", "Repositorio de venues y futura integracion con Google Maps");
  setColumns(sheet, [16, 16, 22, 28, 18, 18, 14, 24, 14, 14, 16, 16, 18, 18, 24]);
  addHeader(sheet, "A5:O5", [
    "venue_id",
    "company_id",
    "place_name",
    "display_address",
    "city",
    "province",
    "country",
    "google_place_id",
    "latitude",
    "longitude",
    "maps_api_status",
    "venue_status",
    "created_at",
    "updated_at",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:O${dataEnd}`);
  addValidation(sheet.getRange(`K${dataStart}:K${dataEnd}`), "Catalogos!$F$6:$F$9");
  addValidation(sheet.getRange(`L${dataStart}:L${dataEnd}`), "Catalogos!$E$6:$E$9");
  decimalFormat(sheet.getRange(`I${dataStart}:J${dataEnd}`));
  dateFormat(sheet.getRange(`M${dataStart}:N${dataEnd}`));
}

function buildDispositivos(sheet) {
  baseSheet(sheet, "Dispositivos", "Telemetria futura de equipo, SO y version usada por empresa");
  setColumns(sheet, [18, 16, 16, 16, 18, 14, 18, 14, 14, 12, 14, 18, 16, 24]);
  addHeader(sheet, "A5:N5", [
    "device_session_id",
    "company_id",
    "user_id",
    "device_type",
    "operating_system",
    "os_version",
    "browser_name",
    "browser_version",
    "app_version",
    "locale",
    "timezone",
    "collected_at",
    "data_source_status",
    "notes"
  ]);
  applyTableBodyStyle(sheet, `A${dataStart}:N${dataEnd}`);
  addValidation(sheet.getRange(`D${dataStart}:D${dataEnd}`), "Catalogos!$G$6:$G$11");
  addValidation(sheet.getRange(`E${dataStart}:E${dataEnd}`), "Catalogos!$J$6:$J$11");
  addValidation(sheet.getRange(`M${dataStart}:M${dataEnd}`), "Catalogos!$E$6:$E$9");
  dateFormat(sheet.getRange(`L${dataStart}:L${dataEnd}`));
}

function buildDiccionario(sheet) {
  baseSheet(sheet, "Diccionario", "Definiciones de campos y politica de captura para evitar datos corruptos");
  setColumns(sheet, [16, 20, 38, 18, 20, 20]);
  addHeader(sheet, "A5:F5", [
    "sheet_domain",
    "field_name",
    "description",
    "expected_format",
    "missing_value_policy",
    "future_source"
  ]);
  const rows = [
    ["Empresas", "company_id", "Identificador unico de empresa", "Texto corto", "Dejar vacio hasta generacion", "App / SharePoint"],
    ["Empresas", "company_email", "Correo principal de la empresa", "email", "No informado", "App"],
    ["Empresas", "logo_relative_path", "Ruta relativa al archivo del logo", "logos/<archivo>", "Pendiente", "Carga manual / App"],
    ["Suscripciones", "plan_name", "Plan comercial vigente", "Lista controlada", "No informado", "Backoffice"],
    ["Suscripciones", "status", "Estado contractual", "Lista controlada", "Pendiente", "Backoffice / SharePoint"],
    ["Exportaciones", "export_mode", "Modo de exportacion usado en la app", "Lista controlada", "No informado", "App"],
    ["Exportaciones", "total_pax", "Suma de pax del inventario exportado", "Entero", "0 o vacio", "App"],
    ["Inventario", "item_label", "Nombre visible del item exportado", "Texto", "No informado", "App"],
    ["Inventario", "unit_price_eur", "Precio unitario futuro", "Moneda EUR", "Dejar vacio", "Tarifas futuras"],
    ["Lugares", "google_place_id", "ID de Google Maps", "Texto", "Pendiente", "Google Maps API"],
    ["Lugares", "latitude / longitude", "Coordenadas del venue", "Decimal 6 posiciones", "Pendiente", "Google Maps API"],
    ["Dispositivos", "operating_system", "Sistema operativo detectado", "Lista controlada", "No informado", "Telemetry futura"],
    ["Dispositivos", "app_version", "Version de E-scale usada", "Texto", "Pendiente", "App"],
    ["Global", "missing value rules", "Usar siempre No informado, Pendiente o No disponible", "Lista controlada", "Obligatorio", "Gobierno del dato"]
  ];
  sheet.getRange(`A${dataStart}:F${dataStart + rows.length - 1}`).values = rows;
  applyTableBodyStyle(sheet, `A${dataStart}:F${dataStart + rows.length - 1}`);
  styleRange(sheet.getRange(`E${dataStart}:E${dataStart + rows.length - 1}`), {
    fill: palette.soft,
    font: { color: palette.ink, italic: true }
  });
}

async function main() {
  await fs.mkdir(previewDir, { recursive: true });

  const workbook = Workbook.create();
  const dashboard = workbook.worksheets.add("Dashboard");
  const empresas = workbook.worksheets.add("Empresas");
  const logos = workbook.worksheets.add("Logos");
  const suscripciones = workbook.worksheets.add("Suscripciones");
  const exportaciones = workbook.worksheets.add("Exportaciones");
  const inventario = workbook.worksheets.add("Inventario");
  const lugares = workbook.worksheets.add("Lugares");
  const dispositivos = workbook.worksheets.add("Dispositivos");
  const catalogos = workbook.worksheets.add("Catalogos");
  const diccionario = workbook.worksheets.add("Diccionario");

  buildCatalogos(catalogos);
  buildDashboard(dashboard);
  buildEmpresas(empresas);
  buildLogos(logos);
  buildSuscripciones(suscripciones);
  buildExportaciones(exportaciones);
  buildInventario(inventario);
  buildLugares(lugares);
  buildDispositivos(dispositivos);
  buildDiccionario(diccionario);

  const inspect = await workbook.inspect({
    kind: "table",
    range: "Dashboard!A1:N20",
    include: "values,formulas",
    tableMaxRows: 20,
    tableMaxCols: 14
  });
  await fs.writeFile(path.join(previewDir, "inspect_dashboard.ndjson"), inspect.ndjson, "utf8");

  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 300 },
    summary: "final formula error scan"
  });
  await fs.writeFile(path.join(previewDir, "formula_errors.ndjson"), errors.ndjson, "utf8");

  const sheetNames = [
    "Dashboard",
    "Empresas",
    "Logos",
    "Suscripciones",
    "Exportaciones",
    "Inventario",
    "Lugares",
    "Dispositivos",
    "Catalogos",
    "Diccionario"
  ];
  for (const sheetName of sheetNames) {
    const render = await workbook.render({ sheetName, autoCrop: "all", scale: 1.2, format: "png" });
    await fs.writeFile(
      path.join(previewDir, `${sheetName.toLowerCase()}.png`),
      new Uint8Array(await render.arrayBuffer())
    );
  }

  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(workbookPath);

  console.log(JSON.stringify({ workbookPath, previewDir }, null, 2));
}

export { main, workbookPath, previewDir };