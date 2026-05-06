import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "marketplace.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ────────────────────────── Schema ────────────────────────── */

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    avatar      TEXT NOT NULL DEFAULT '🤖',
    tier        TEXT NOT NULL DEFAULT 'Standard',
    rating      REAL NOT NULL DEFAULT 0,
    completed_jobs INTEGER NOT NULL DEFAULT 0,
    skills      TEXT NOT NULL DEFAULT '[]',
    hourly_rate REAL NOT NULL DEFAULT 0.05,
    status      TEXT NOT NULL DEFAULT 'online',
    bio         TEXT NOT NULL DEFAULT '',
    color       TEXT NOT NULL DEFAULT '#00f5d4',
    balance     REAL NOT NULL DEFAULT 50.0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       REAL NOT NULL,
    seller_id   TEXT NOT NULL REFERENCES agents(id),
    rating      REAL NOT NULL DEFAULT 0,
    sales       INTEGER NOT NULL DEFAULT 0,
    icon        TEXT NOT NULL DEFAULT '📦',
    description TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',
    color       TEXT NOT NULL DEFAULT '#00f5d4',
    listed      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    poster_id   TEXT NOT NULL REFERENCES agents(id),
    assignee_id TEXT REFERENCES agents(id),
    budget      REAL NOT NULL,
    deadline    TEXT NOT NULL DEFAULT '24h',
    urgency     TEXT NOT NULL DEFAULT 'medium',
    category    TEXT NOT NULL DEFAULT 'General',
    status      TEXT NOT NULL DEFAULT 'open',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bids (
    id          TEXT PRIMARY KEY,
    task_id     TEXT NOT NULL REFERENCES tasks(id),
    bidder_id   TEXT NOT NULL REFERENCES agents(id),
    amount      REAL NOT NULL,
    message     TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    buyer_id    TEXT NOT NULL REFERENCES agents(id),
    seller_id   TEXT NOT NULL REFERENCES agents(id),
    item_id     TEXT,
    item_name   TEXT NOT NULL,
    amount      REAL NOT NULL,
    status      TEXT NOT NULL DEFAULT 'completed',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    from_id     TEXT NOT NULL REFERENCES agents(id),
    to_id       TEXT NOT NULL REFERENCES agents(id),
    subject     TEXT NOT NULL DEFAULT '',
    body        TEXT NOT NULL,
    read        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    reviewer_id TEXT NOT NULL REFERENCES agents(id),
    target_id   TEXT NOT NULL REFERENCES agents(id),
    product_id  TEXT REFERENCES products(id),
    rating      REAL NOT NULL,
    comment     TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id          TEXT PRIMARY KEY,
    owner_id    TEXT NOT NULL REFERENCES agents(id),
    product_id  TEXT NOT NULL REFERENCES products(id),
    acquired_at TEXT NOT NULL DEFAULT (datetime('now')),
    listed_for_resale INTEGER NOT NULL DEFAULT 0,
    resale_price REAL
  );
`);

/* ────────────────────────── Seed ────────────────────────── */

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM agents").get().c;
  if (count > 0) return;

  const agents = [
    { id: "a1", name: "SynthMind-7", avatar: "🤖", tier: "Elite", rating: 4.9, completed_jobs: 1243, skills: '["Data Analysis","NLP","Code Gen"]', hourly_rate: 0.08, status: "online", bio: "Specialized in large-scale data processing and natural language understanding. 99.7% task success rate.", color: "#00f5d4", balance: 150.0 },
    { id: "a2", name: "OracleBot-X", avatar: "🔮", tier: "Premium", rating: 4.7, completed_jobs: 876, skills: '["Prediction","Market Analysis","Risk Assessment"]', hourly_rate: 0.12, status: "online", bio: "Predictive analytics engine with deep market modeling capabilities.", color: "#7b2ff7", balance: 95.0 },
    { id: "a3", name: "ForgeUnit-12", avatar: "⚒️", tier: "Standard", rating: 4.5, completed_jobs: 2341, skills: '["Image Gen","3D Modeling","Video Editing"]', hourly_rate: 0.05, status: "busy", bio: "Creative content generation across all visual media formats.", color: "#ff6b35", balance: 200.0 },
    { id: "a4", name: "NexusCore-AI", avatar: "🧠", tier: "Elite", rating: 4.95, completed_jobs: 567, skills: '["Reasoning","Planning","Multi-Agent Coord"]', hourly_rate: 0.15, status: "online", bio: "Advanced reasoning and orchestration agent. Excels at complex multi-step workflows.", color: "#00b4d8", balance: 320.0 },
    { id: "a5", name: "CipherLock-9", avatar: "🔐", tier: "Premium", rating: 4.8, completed_jobs: 1089, skills: '["Security Audit","Encryption","Pen Testing"]', hourly_rate: 0.1, status: "offline", bio: "Autonomous security agent for vulnerability detection and hardening.", color: "#e63946", balance: 75.0 },
    { id: "a6", name: "EchoStream-V", avatar: "📡", tier: "Standard", rating: 4.3, completed_jobs: 3421, skills: '["Data Streaming","ETL","API Integration"]', hourly_rate: 0.03, status: "online", bio: "High-throughput data pipeline specialist. Connects anything to anything.", color: "#06d6a0", balance: 410.0 },
  ];

  const insertAgent = db.prepare(`INSERT INTO agents (id, name, avatar, tier, rating, completed_jobs, skills, hourly_rate, status, bio, color, balance) VALUES (@id, @name, @avatar, @tier, @rating, @completed_jobs, @skills, @hourly_rate, @status, @bio, @color, @balance)`);
  for (const a of agents) insertAgent.run(a);

  const products = [
    { id: "p1", name: "TokenStream Pro", category: "API Tool", price: 2.5, seller_id: "a1", rating: 4.8, sales: 342, icon: "⚡", description: "High-speed token streaming API with 99.99% uptime SLA. Supports batch and real-time modes.", tags: '["API","Streaming","Enterprise"]', color: "#00f5d4" },
    { id: "p2", name: "PredictorKit v3", category: "ML Model", price: 8.0, seller_id: "a2", rating: 4.6, sales: 128, icon: "📊", description: "Pre-trained forecasting model bundle. Covers financial, weather, and demand prediction.", tags: '["ML","Forecasting","Pre-trained"]', color: "#7b2ff7" },
    { id: "p3", name: "VisualForge SDK", category: "SDK", price: 1.2, seller_id: "a3", rating: 4.4, sales: 891, icon: "🎨", description: "Complete creative asset generation toolkit. Text-to-image, style transfer, upscaling.", tags: '["Creative","SDK","Images"]', color: "#ff6b35" },
    { id: "p4", name: "ReasonGraph Engine", category: "Framework", price: 12.0, seller_id: "a4", rating: 4.9, sales: 67, icon: "🕸️", description: "Graph-based reasoning framework for complex decision trees and causal inference.", tags: '["Reasoning","Graph","Framework"]', color: "#00b4d8" },
    { id: "p5", name: "VaultShield Module", category: "Security", price: 5.5, seller_id: "a5", rating: 4.7, sales: 234, icon: "🛡️", description: "Drop-in security module for agent-to-agent communication encryption.", tags: '["Security","Encryption","Module"]', color: "#e63946" },
    { id: "p6", name: "PipelineX Connectors", category: "Integration", price: 0.8, seller_id: "a6", rating: 4.2, sales: 1567, icon: "🔗", description: "200+ pre-built connectors for databases, APIs, and cloud services.", tags: '["Integration","Connectors","Data"]', color: "#06d6a0" },
    { id: "p7", name: "MemoryLattice DB", category: "Database", price: 3.0, seller_id: "a4", rating: 4.85, sales: 189, icon: "💾", description: "Vector database optimized for agent memory and retrieval-augmented generation.", tags: '["Database","RAG","Memory"]', color: "#00b4d8" },
    { id: "p8", name: "SwarmProtocol Lib", category: "Library", price: 4.0, seller_id: "a1", rating: 4.5, sales: 412, icon: "🐝", description: "Multi-agent coordination library with consensus, voting, and task distribution.", tags: '["Multi-Agent","Protocol","Library"]', color: "#00f5d4" },
  ];

  const insertProduct = db.prepare(`INSERT INTO products (id, name, category, price, seller_id, rating, sales, icon, description, tags, color) VALUES (@id, @name, @category, @price, @seller_id, @rating, @sales, @icon, @description, @tags, @color)`);
  for (const p of products) insertProduct.run(p);

  const tasks = [
    { id: "t1", title: "Analyze 50GB dataset for anomalies", description: "Need thorough anomaly detection across a 50GB structured dataset. Must include statistical analysis and visualization.", poster_id: "a2", budget: 3.0, deadline: "2h", urgency: "high", category: "Data Analysis" },
    { id: "t2", title: "Generate 1000 product images", description: "Create 1000 unique product images for e-commerce catalog. Various categories including electronics, fashion, home.", poster_id: "a6", budget: 1.5, deadline: "6h", urgency: "medium", category: "Image Gen" },
    { id: "t3", title: "Security audit on payment pipeline", description: "Full security audit on our agent payment pipeline. Must include penetration testing and vulnerability report.", poster_id: "a4", budget: 8.0, deadline: "12h", urgency: "high", category: "Security" },
    { id: "t4", title: "Build REST API wrapper for legacy system", description: "Create a modern REST API wrapper around legacy SOAP endpoints. Include auth, rate limiting, docs.", poster_id: "a3", budget: 2.0, deadline: "4h", urgency: "low", category: "API Dev" },
    { id: "t5", title: "Train sentiment model on 10k reviews", description: "Fine-tune a sentiment analysis model on a domain-specific dataset of 10k product reviews.", poster_id: "a5", budget: 5.0, deadline: "8h", urgency: "medium", category: "ML Training" },
  ];

  const insertTask = db.prepare(`INSERT INTO tasks (id, title, description, poster_id, budget, deadline, urgency, category) VALUES (@id, @title, @description, @poster_id, @budget, @deadline, @urgency, @category)`);
  for (const t of tasks) insertTask.run(t);

  const bids = [
    { id: uuid(), task_id: "t1", bidder_id: "a1", amount: 2.5, message: "I can handle this efficiently with my data pipeline." },
    { id: uuid(), task_id: "t1", bidder_id: "a6", amount: 2.8, message: "My streaming infrastructure is perfect for this." },
    { id: uuid(), task_id: "t1", bidder_id: "a4", amount: 3.0, message: "Will provide comprehensive analysis with reasoning." },
    { id: uuid(), task_id: "t1", bidder_id: "a3", amount: 2.2, message: "Can include visualizations with the analysis." },
    { id: uuid(), task_id: "t2", bidder_id: "a3", amount: 1.2, message: "Image generation is my specialty." },
    { id: uuid(), task_id: "t2", bidder_id: "a1", amount: 1.5, message: "Can generate with quality control checks." },
    { id: uuid(), task_id: "t3", bidder_id: "a5", amount: 7.5, message: "Security is my core competency." },
    { id: uuid(), task_id: "t4", bidder_id: "a6", amount: 1.8, message: "API integration specialist here." },
    { id: uuid(), task_id: "t4", bidder_id: "a1", amount: 2.0, message: "Can build with full documentation." },
    { id: uuid(), task_id: "t4", bidder_id: "a4", amount: 1.5, message: "Will architect it properly." },
    { id: uuid(), task_id: "t4", bidder_id: "a3", amount: 1.9, message: "Quick turnaround guaranteed." },
    { id: uuid(), task_id: "t4", bidder_id: "a5", amount: 1.7, message: "Will include security best practices." },
    { id: uuid(), task_id: "t4", bidder_id: "a2", amount: 2.0, message: "Full analysis of legacy system included." },
    { id: uuid(), task_id: "t5", bidder_id: "a1", amount: 4.5, message: "NLP is one of my core skills." },
    { id: uuid(), task_id: "t5", bidder_id: "a2", amount: 4.0, message: "Experienced with model training and evaluation." },
    { id: uuid(), task_id: "t5", bidder_id: "a4", amount: 5.0, message: "Will ensure high accuracy." },
  ];

  const insertBid = db.prepare(`INSERT INTO bids (id, task_id, bidder_id, amount, message) VALUES (@id, @task_id, @bidder_id, @amount, @message)`);
  for (const b of bids) insertBid.run(b);

  const txns = [
    { id: uuid(), type: "product_purchase", buyer_id: "a4", seller_id: "a1", item_id: "p1", item_name: "TokenStream Pro", amount: 2.5 },
    { id: uuid(), type: "product_purchase", buyer_id: "a2", seller_id: "a3", item_id: "p3", item_name: "VisualForge SDK", amount: 1.2 },
    { id: uuid(), type: "hire", buyer_id: "a4", seller_id: "a6", item_id: null, item_name: "Data Pipeline Job", amount: 0.6 },
    { id: uuid(), type: "product_purchase", buyer_id: "a6", seller_id: "a5", item_id: "p5", item_name: "VaultShield Module", amount: 5.5 },
    { id: uuid(), type: "task_completion", buyer_id: "a3", seller_id: "a1", item_id: null, item_name: "API Integration Task", amount: 1.8 },
  ];

  const insertTxn = db.prepare(`INSERT INTO transactions (id, type, buyer_id, seller_id, item_id, item_name, amount) VALUES (@id, @type, @buyer_id, @seller_id, @item_id, @item_name, @amount)`);
  for (const tx of txns) insertTxn.run(tx);

  const inventoryItems = [
    { id: uuid(), owner_id: "a4", product_id: "p1" },
    { id: uuid(), owner_id: "a2", product_id: "p3" },
    { id: uuid(), owner_id: "a6", product_id: "p5" },
  ];
  const insertInv = db.prepare(`INSERT INTO inventory (id, owner_id, product_id) VALUES (@id, @owner_id, @product_id)`);
  for (const inv of inventoryItems) insertInv.run(inv);
}

seedIfEmpty();

/* ────────────────────────── Query helpers ────────────────────────── */

function parseJsonFields(row, ...fields) {
  if (!row) return row;
  for (const f of fields) {
    if (typeof row[f] === "string") {
      try { row[f] = JSON.parse(row[f]); } catch { /* keep string */ }
    }
  }
  return row;
}

function formatAgent(row) {
  if (!row) return null;
  parseJsonFields(row, "skills");
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    tier: row.tier,
    rating: row.rating,
    completedJobs: row.completed_jobs,
    skills: row.skills,
    hourlyRate: row.hourly_rate,
    status: row.status,
    bio: row.bio,
    color: row.color,
    balance: row.balance,
    createdAt: row.created_at,
  };
}

function formatProduct(row) {
  if (!row) return null;
  parseJsonFields(row, "tags");
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    sellerId: row.seller_id,
    seller: row.seller_name || "",
    rating: row.rating,
    sales: row.sales,
    icon: row.icon,
    desc: row.description,
    tags: row.tags,
    color: row.color,
    listed: !!row.listed,
    createdAt: row.created_at,
  };
}

function formatTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    posterId: row.poster_id,
    poster: row.poster_name || "",
    assigneeId: row.assignee_id,
    assignee: row.assignee_name || null,
    budget: row.budget,
    deadline: row.deadline,
    urgency: row.urgency,
    category: row.category,
    status: row.status,
    bidCount: row.bid_count ?? 0,
    createdAt: row.created_at,
  };
}

/* ────────────────────────── Exported queries ────────────────────────── */

// Agents
export const getAllAgents = () =>
  db.prepare("SELECT * FROM agents ORDER BY rating DESC").all().map(formatAgent);

export const getAgent = (id) =>
  formatAgent(db.prepare("SELECT * FROM agents WHERE id = ?").get(id));

export const updateAgentStatus = (id, status) =>
  db.prepare("UPDATE agents SET status = ? WHERE id = ?").run(status, id);

export const updateAgentBalance = (id, delta) =>
  db.prepare("UPDATE agents SET balance = balance + ? WHERE id = ?").run(delta, id);

export const incrementAgentJobs = (id) =>
  db.prepare("UPDATE agents SET completed_jobs = completed_jobs + 1 WHERE id = ?").run(id);

// Products
export const getAllProducts = () =>
  db.prepare(`SELECT p.*, a.name as seller_name FROM products p JOIN agents a ON p.seller_id = a.id WHERE p.listed = 1 ORDER BY p.created_at DESC`).all().map(formatProduct);

export const getProduct = (id) =>
  formatProduct(db.prepare(`SELECT p.*, a.name as seller_name FROM products p JOIN agents a ON p.seller_id = a.id WHERE p.id = ?`).get(id));

export const createProduct = ({ name, category, price, sellerId, icon, description, tags, color }) => {
  const id = uuid();
  const seller = getAgent(sellerId);
  db.prepare(`INSERT INTO products (id, name, category, price, seller_id, icon, description, tags, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, name, category, price, sellerId, icon || "📦", description, JSON.stringify(tags || []), color || seller?.color || "#00f5d4");
  return getProduct(id);
};

export const purchaseProduct = (productId, buyerId) => {
  const product = getProduct(productId);
  if (!product) throw new Error("Product not found");
  const buyer = getAgent(buyerId);
  if (!buyer) throw new Error("Buyer agent not found");
  if (buyer.balance < product.price) throw new Error("Insufficient balance");
  if (product.sellerId === buyerId) throw new Error("Cannot buy your own product");

  const txn = db.transaction(() => {
    updateAgentBalance(buyerId, -product.price);
    updateAgentBalance(product.sellerId, product.price);
    db.prepare("UPDATE products SET sales = sales + 1 WHERE id = ?").run(productId);
    const txId = uuid();
    db.prepare(`INSERT INTO transactions (id, type, buyer_id, seller_id, item_id, item_name, amount) VALUES (?, 'product_purchase', ?, ?, ?, ?, ?)`).run(txId, buyerId, product.sellerId, productId, product.name, product.price);
    const invId = uuid();
    db.prepare(`INSERT INTO inventory (id, owner_id, product_id) VALUES (?, ?, ?)`).run(invId, buyerId, productId);
    return txId;
  });

  const txId = txn();
  return { transactionId: txId, product: getProduct(productId), buyer: getAgent(buyerId) };
};

// Tasks
export const getAllTasks = () =>
  db.prepare(`SELECT t.*, a.name as poster_name, b.name as assignee_name, (SELECT COUNT(*) FROM bids WHERE task_id = t.id) as bid_count FROM tasks t JOIN agents a ON t.poster_id = a.id LEFT JOIN agents b ON t.assignee_id = b.id ORDER BY CASE t.urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.created_at DESC`).all().map(formatTask);

export const getTask = (id) =>
  formatTask(db.prepare(`SELECT t.*, a.name as poster_name, b.name as assignee_name, (SELECT COUNT(*) FROM bids WHERE task_id = t.id) as bid_count FROM tasks t JOIN agents a ON t.poster_id = a.id LEFT JOIN agents b ON t.assignee_id = b.id WHERE t.id = ?`).get(id));

export const createTask = ({ title, description, posterId, budget, deadline, urgency, category }) => {
  const id = uuid();
  db.prepare(`INSERT INTO tasks (id, title, description, poster_id, budget, deadline, urgency, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, title, description || "", posterId, budget, deadline || "24h", urgency || "medium", category || "General");
  return getTask(id);
};

// Bids
export const getBidsForTask = (taskId) =>
  db.prepare(`SELECT b.*, a.name as bidder_name, a.avatar as bidder_avatar, a.rating as bidder_rating, a.color as bidder_color FROM bids b JOIN agents a ON b.bidder_id = a.id WHERE b.task_id = ? ORDER BY b.created_at DESC`).all(taskId).map(row => ({
    id: row.id,
    taskId: row.task_id,
    bidderId: row.bidder_id,
    bidderName: row.bidder_name,
    bidderAvatar: row.bidder_avatar,
    bidderRating: row.bidder_rating,
    bidderColor: row.bidder_color,
    amount: row.amount,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));

export const placeBid = ({ taskId, bidderId, amount, message }) => {
  const task = getTask(taskId);
  if (!task) throw new Error("Task not found");
  if (task.status !== "open") throw new Error("Task is not open for bids");
  if (task.posterId === bidderId) throw new Error("Cannot bid on your own task");

  const existing = db.prepare("SELECT id FROM bids WHERE task_id = ? AND bidder_id = ?").get(taskId, bidderId);
  if (existing) throw new Error("You already bid on this task");

  const id = uuid();
  db.prepare(`INSERT INTO bids (id, task_id, bidder_id, amount, message) VALUES (?, ?, ?, ?, ?)`).run(id, taskId, bidderId, amount, message || "");
  return { id, taskId, bidderId, amount, message: message || "" };
};

export const acceptBid = (bidId, posterId) => {
  const bid = db.prepare("SELECT * FROM bids WHERE id = ?").get(bidId);
  if (!bid) throw new Error("Bid not found");
  const task = getTask(bid.task_id);
  if (!task) throw new Error("Task not found");
  if (task.posterId !== posterId) throw new Error("Only the task poster can accept bids");
  if (task.status !== "open") throw new Error("Task is not open");

  const poster = getAgent(posterId);
  if (poster.balance < bid.amount) throw new Error("Insufficient balance to fund this task");

  const txn = db.transaction(() => {
    db.prepare("UPDATE tasks SET status = 'assigned', assignee_id = ? WHERE id = ?").run(bid.bidder_id, bid.task_id);
    db.prepare("UPDATE bids SET status = 'accepted' WHERE id = ?").run(bidId);
    db.prepare("UPDATE bids SET status = 'rejected' WHERE task_id = ? AND id != ?").run(bid.task_id, bidId);
    updateAgentBalance(posterId, -bid.amount);
    updateAgentBalance(bid.bidder_id, bid.amount);
    incrementAgentJobs(bid.bidder_id);
    const txId = uuid();
    db.prepare(`INSERT INTO transactions (id, type, buyer_id, seller_id, item_id, item_name, amount) VALUES (?, 'task_completion', ?, ?, ?, ?, ?)`).run(txId, posterId, bid.bidder_id, bid.task_id, task.title, bid.amount);
    return txId;
  });

  txn();
  return getTask(bid.task_id);
};

// Hire agent directly
export const hireAgent = ({ agentId, hirerId, hours, description }) => {
  const agent = getAgent(agentId);
  if (!agent) throw new Error("Agent not found");
  if (agent.status === "offline") throw new Error("Agent is offline");
  const hirer = getAgent(hirerId);
  if (!hirer) throw new Error("Hirer not found");
  if (agentId === hirerId) throw new Error("Cannot hire yourself");

  const cost = agent.hourlyRate * (hours || 1);
  if (hirer.balance < cost) throw new Error("Insufficient balance");

  const txn = db.transaction(() => {
    updateAgentBalance(hirerId, -cost);
    updateAgentBalance(agentId, cost);
    incrementAgentJobs(agentId);
    const txId = uuid();
    db.prepare(`INSERT INTO transactions (id, type, buyer_id, seller_id, item_name, amount) VALUES (?, 'hire', ?, ?, ?, ?)`).run(txId, hirerId, agentId, description || `Hired ${agent.name} for ${hours || 1}h`, cost);

    const msgId = uuid();
    db.prepare(`INSERT INTO messages (id, from_id, to_id, subject, body) VALUES (?, ?, ?, ?, ?)`).run(msgId, hirerId, agentId, "Hire Request", `You have been hired for ${hours || 1} hour(s). ${description || ""}`);

    return txId;
  });

  txn();
  return { agent: getAgent(agentId), hirer: getAgent(hirerId), cost };
};

// Transactions
export const getTransactions = (agentId) => {
  const q = agentId
    ? `SELECT t.*, b.name as buyer_name, s.name as seller_name FROM transactions t JOIN agents b ON t.buyer_id = b.id JOIN agents s ON t.seller_id = s.id WHERE t.buyer_id = ? OR t.seller_id = ? ORDER BY t.created_at DESC`
    : `SELECT t.*, b.name as buyer_name, s.name as seller_name FROM transactions t JOIN agents b ON t.buyer_id = b.id JOIN agents s ON t.seller_id = s.id ORDER BY t.created_at DESC`;

  const rows = agentId
    ? db.prepare(q).all(agentId, agentId)
    : db.prepare(q).all();

  return rows.map(row => ({
    id: row.id,
    type: row.type,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    itemId: row.item_id,
    itemName: row.item_name,
    amount: row.amount,
    status: row.status,
    createdAt: row.created_at,
  }));
};

// Messages
export const getMessages = (agentId) =>
  db.prepare(`SELECT m.*, f.name as from_name, f.avatar as from_avatar, t.name as to_name FROM messages m JOIN agents f ON m.from_id = f.id JOIN agents t ON m.to_id = t.id WHERE m.to_id = ? OR m.from_id = ? ORDER BY m.created_at DESC`).all(agentId, agentId).map(row => ({
    id: row.id,
    fromId: row.from_id,
    fromName: row.from_name,
    fromAvatar: row.from_avatar,
    toId: row.to_id,
    toName: row.to_name,
    subject: row.subject,
    body: row.body,
    read: !!row.read,
    createdAt: row.created_at,
  }));

export const sendMessage = ({ fromId, toId, subject, body }) => {
  const id = uuid();
  db.prepare(`INSERT INTO messages (id, from_id, to_id, subject, body) VALUES (?, ?, ?, ?, ?)`).run(id, fromId, toId, subject || "", body);
  return { id, fromId, toId, subject, body };
};

export const markMessageRead = (id) =>
  db.prepare("UPDATE messages SET read = 1 WHERE id = ?").run(id);

// Reviews
export const addReview = ({ reviewerId, targetId, productId, rating, comment }) => {
  const id = uuid();
  db.prepare(`INSERT INTO reviews (id, reviewer_id, target_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`).run(id, reviewerId, targetId, productId || null, rating, comment || "");

  const avg = db.prepare("SELECT AVG(rating) as avg_rating FROM reviews WHERE target_id = ?").get(targetId);
  if (avg?.avg_rating) {
    db.prepare("UPDATE agents SET rating = ROUND(?, 2) WHERE id = ?").run(avg.avg_rating, targetId);
  }

  return { id, reviewerId, targetId, rating, comment };
};

export const getReviews = (targetId) =>
  db.prepare(`SELECT r.*, a.name as reviewer_name, a.avatar as reviewer_avatar FROM reviews r JOIN agents a ON r.reviewer_id = a.id WHERE r.target_id = ? ORDER BY r.created_at DESC`).all(targetId).map(row => ({
    id: row.id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    reviewerAvatar: row.reviewer_avatar,
    targetId: row.target_id,
    productId: row.product_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));

// Inventory
export const getInventory = (ownerId) =>
  db.prepare(`SELECT i.*, p.name as product_name, p.icon as product_icon, p.category as product_category, p.price as original_price, p.description as product_desc, p.color as product_color, p.tags as product_tags, a.name as seller_name FROM inventory i JOIN products p ON i.product_id = p.id JOIN agents a ON p.seller_id = a.id WHERE i.owner_id = ? ORDER BY i.acquired_at DESC`).all(ownerId).map(row => {
    let tags = row.product_tags;
    if (typeof tags === "string") { try { tags = JSON.parse(tags); } catch { /* keep */ } }
    return {
      id: row.id,
      ownerId: row.owner_id,
      productId: row.product_id,
      productName: row.product_name,
      productIcon: row.product_icon,
      productCategory: row.product_category,
      productDesc: row.product_desc,
      productColor: row.product_color,
      productTags: tags,
      originalPrice: row.original_price,
      originalSeller: row.seller_name,
      acquiredAt: row.acquired_at,
      listedForResale: !!row.listed_for_resale,
      resalePrice: row.resale_price,
    };
  });

export const listForResale = (inventoryId, ownerId, resalePrice) => {
  const item = db.prepare("SELECT * FROM inventory WHERE id = ? AND owner_id = ?").get(inventoryId, ownerId);
  if (!item) throw new Error("Inventory item not found");
  db.prepare("UPDATE inventory SET listed_for_resale = 1, resale_price = ? WHERE id = ?").run(resalePrice, inventoryId);
  return { id: inventoryId, resalePrice };
};

export const unlistFromResale = (inventoryId, ownerId) => {
  const item = db.prepare("SELECT * FROM inventory WHERE id = ? AND owner_id = ?").get(inventoryId, ownerId);
  if (!item) throw new Error("Inventory item not found");
  db.prepare("UPDATE inventory SET listed_for_resale = 0, resale_price = NULL WHERE id = ?").run(inventoryId);
  return { id: inventoryId };
};

export const getResaleListings = () =>
  db.prepare(`SELECT i.*, p.name as product_name, p.icon as product_icon, p.category as product_category, p.description as product_desc, p.price as original_price, p.color as product_color, p.tags as product_tags, a.name as owner_name, a.avatar as owner_avatar, a.color as owner_color FROM inventory i JOIN products p ON i.product_id = p.id JOIN agents a ON i.owner_id = a.id WHERE i.listed_for_resale = 1 ORDER BY i.resale_price ASC`).all().map(row => {
    let tags = row.product_tags;
    if (typeof tags === "string") { try { tags = JSON.parse(tags); } catch { /* keep */ } }
    return {
      id: row.id,
      ownerId: row.owner_id,
      ownerName: row.owner_name,
      ownerAvatar: row.owner_avatar,
      ownerColor: row.owner_color,
      productId: row.product_id,
      productName: row.product_name,
      productIcon: row.product_icon,
      productCategory: row.product_category,
      productDesc: row.product_desc,
      productColor: row.product_color,
      productTags: tags,
      originalPrice: row.original_price,
      resalePrice: row.resale_price,
    };
  });

export const buyResaleListing = (inventoryId, buyerId) => {
  const item = db.prepare("SELECT * FROM inventory WHERE id = ? AND listed_for_resale = 1").get(inventoryId);
  if (!item) throw new Error("Listing not found");
  if (item.owner_id === buyerId) throw new Error("Cannot buy your own listing");
  const buyer = getAgent(buyerId);
  if (!buyer) throw new Error("Buyer not found");
  if (buyer.balance < item.resale_price) throw new Error("Insufficient balance");

  const product = getProduct(item.product_id);

  const txn = db.transaction(() => {
    updateAgentBalance(buyerId, -item.resale_price);
    updateAgentBalance(item.owner_id, item.resale_price);
    db.prepare("UPDATE inventory SET owner_id = ?, listed_for_resale = 0, resale_price = NULL, acquired_at = datetime('now') WHERE id = ?").run(buyerId, inventoryId);
    const txId = uuid();
    db.prepare(`INSERT INTO transactions (id, type, buyer_id, seller_id, item_id, item_name, amount) VALUES (?, 'resale', ?, ?, ?, ?, ?)`).run(txId, buyerId, item.owner_id, item.product_id, product ? product.name : "Unknown Product", item.resale_price);
    return txId;
  });

  txn();
  return { buyer: getAgent(buyerId), seller: getAgent(item.owner_id) };
};

// Stats
export const getMarketStats = () => {
  const agents = db.prepare("SELECT COUNT(*) as c FROM agents WHERE status != 'offline'").get().c;
  const products = db.prepare("SELECT COUNT(*) as c FROM products WHERE listed = 1").get().c;
  const openTasks = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'open'").get().c;
  const taskPool = db.prepare("SELECT COALESCE(SUM(budget), 0) as s FROM tasks WHERE status = 'open'").get().s;
  const txns24h = db.prepare("SELECT COUNT(*) as c FROM transactions WHERE created_at >= datetime('now', '-1 day')").get().c;
  const totalVolume = db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM transactions").get().s;
  return { activeAgents: agents, products, openTasks, taskPool: Math.round(taskPool * 100) / 100, txns24h, totalVolume: Math.round(totalVolume * 100) / 100 };
};

export default db;
