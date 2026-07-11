const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3456;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

// Vercel KV (only used when deployed on Vercel)
let kv = null;
try { kv = require("@vercel/kv").kv; } catch (_) {}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

var DEFAULT_CATEGORIES = [
  { id: "c1",  name: "\u5de5\u8d44",     type: "income",  icon: "\ud83d\udcb0" },
  { id: "c2",  name: "\u5956\u91d1",     type: "income",  icon: "\ud83c\udf81" },
  { id: "c3",  name: "\u7406\u8d22",     type: "income",  icon: "\ud83d\udcc8" },
  { id: "c4",  name: "\u517c\u804c",     type: "income",  icon: "\ud83d\udcbc" },
  { id: "c5",  name: "\u62a5\u9500",     type: "income",  icon: "\ud83d\udccb" },
  { id: "c6",  name: "\u5176\u4ed6\u6536\u5165", type: "income",  icon: "\ud83d\udcb5" },
  { id: "c7",  name: "\u9910\u996e",     type: "expense", icon: "\ud83c\udf5c" },
  { id: "c8",  name: "\u4ea4\u901a",     type: "expense", icon: "\ud83d\ude97" },
  { id: "c9",  name: "\u8d2d\u7269",     type: "expense", icon: "\ud83d\uded2" },
  { id: "c10", name: "\u4f4f\u623f",     type: "expense", icon: "\ud83c\udfe0" },
  { id: "c11", name: "\u5a31\u4e50",     type: "expense", icon: "\ud83c\udfae" },
  { id: "c12", name: "\u533b\u7597",     type: "expense", icon: "\ud83c\udfe5" },
  { id: "c13", name: "\u6559\u80b2",     type: "expense", icon: "\ud83d\udcda" },
  { id: "c14", name: "\u5176\u4ed6\u652f\u51fa", type: "expense", icon: "\ud83d\udccc" }
];

function isVercel() { return !!process.env.KV_URL && !!kv; }

async function readDB() {
  if (isVercel()) {
    var bills = await kv.get("bills") || [];
    var categories = await kv.get("categories") || DEFAULT_CATEGORIES;
    return { bills: bills, categories: categories };
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      var initial = { bills: [], categories: DEFAULT_CATEGORIES };
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch (e) {
    console.error("read DB error:", e.message);
    return { bills: [], categories: DEFAULT_CATEGORIES };
  }
}

async function writeDB(data) {
  if (isVercel()) {
    await kv.set("bills", data.bills);
    await kv.set("categories", data.categories);
    return true;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("write DB error:", e.message);
    return false;
  }
}

app.get("/api/bills", async function(_req, res) {
  var db = await readDB();
  res.json(db.bills);
});

app.post("/api/bills", async function(req, res) {
  var db = await readDB();
  var body = req.body;
  if (!body.fund || !body.type || body.amount == null || !body.date) {
    return res.status(400).json({ error: "fund/type/amount/date required" });
  }
  var bill = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    fund: body.fund,
    type: body.type,
    categoryId: body.type === "expense" ? (body.categoryId || "c14") : "",
    amount: Math.round(body.amount * 100) / 100,
    person: body.person || "",
    date: body.date,
    note: body.note || ""
  };
  db.bills.push(bill);
  await writeDB(db);
  res.status(201).json(bill);
});

app.put("/api/bills/:id", async function(req, res) {
  var db = await readDB();
  var idx = db.bills.findIndex(function(b) { return b.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "not found" });
  var body = req.body;
  var bill = db.bills[idx];
  if (body.fund !== undefined) bill.fund = body.fund;
  if (body.type !== undefined) bill.type = body.type;
  if (body.categoryId !== undefined) bill.categoryId = body.categoryId;
  if (body.amount !== undefined) bill.amount = Math.round(body.amount * 100) / 100;
  if (body.person !== undefined) bill.person = body.person;
  if (body.date !== undefined) bill.date = body.date;
  if (body.note !== undefined) bill.note = body.note;
  db.bills[idx] = bill;
  await writeDB(db);
  res.json(bill);
});

app.delete("/api/bills/:id", async function(req, res) {
  var db = await readDB();
  var idx = db.bills.findIndex(function(b) { return b.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "not found" });
  var deleted = db.bills.splice(idx, 1)[0];
  await writeDB(db);
  res.json(deleted);
});

app.get("/api/categories", async function(_req, res) {
  var db = await readDB();
  res.json(db.categories);
});

app.post("/api/categories", async function(req, res) {
  var db = await readDB();
  var body = req.body;
  if (!body.name || !body.type) return res.status(400).json({ error: "name/type required" });
  var cat = {
    id: "c" + Date.now().toString(36),
    name: body.name,
    type: body.type,
    icon: body.icon || (body.type === "income" ? "\ud83d\udcb5" : "\ud83d\udccc")
  };
  db.categories.push(cat);
  await writeDB(db);
  res.status(201).json(cat);
});

app.put("/api/categories/:id", async function(req, res) {
  var db = await readDB();
  var idx = db.categories.findIndex(function(c) { return c.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "not found" });
  var body = req.body;
  if (body.name !== undefined) db.categories[idx].name = body.name;
  if (body.type !== undefined) db.categories[idx].type = body.type;
  if (body.icon !== undefined) db.categories[idx].icon = body.icon;
  await writeDB(db);
  res.json(db.categories[idx]);
});

app.delete("/api/categories/:id", async function(req, res) {
  var db = await readDB();
  var idx = db.categories.findIndex(function(c) { return c.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "not found" });
  var used = db.bills.some(function(b) { return b.categoryId === req.params.id; });
  if (used) return res.status(400).json({ error: "category in use" });
  var deleted = db.categories.splice(idx, 1)[0];
  await writeDB(db);
  res.json(deleted);
});

app.post("/api/import", async function(req, res) {
  var db = await readDB();
  var body = req.body;
  if (body.mode === "replace") {
    db.bills = (body.bills || []).map(function(b) {
      b.id = b.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      b.createdAt = b.createdAt || new Date().toISOString();
      return b;
    });
    if (body.categories) db.categories = body.categories;
  } else {
    var existing = new Set();
    db.bills.forEach(function(b) {
      existing.add(b.date.slice(0,7) + "|" + b.fund + "|" + b.type + "|" + b.person);
    });
    (body.bills || []).forEach(function(bill) {
      var key = bill.date.slice(0,7) + "|" + bill.fund + "|" + bill.type + "|" + bill.person;
      if (!existing.has(key)) {
        bill.id = bill.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
        bill.createdAt = bill.createdAt || new Date().toISOString();
        db.bills.push(bill);
        existing.add(key);
      }
    });
  }
  await writeDB(db);
  res.json({ count: db.bills.length });
});

// Export for Vercel; also listen on PORT for local dev
module.exports = app;

if (!isVercel()) {
  app.listen(PORT, function() {
    console.log("jz v2.0 server: http://localhost:" + PORT);
    readDB();
  });
}