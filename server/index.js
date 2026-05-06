import express from "express";
import cors from "cors";
import * as db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ────────────────────── Error wrapper ────────────────────── */
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

/* ────────────────────── Agents ────────────────────── */
app.get("/api/agents", wrap((req, res) => {
  res.json(db.getAllAgents());
}));

app.get("/api/agents/:id", wrap((req, res) => {
  const agent = db.getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json(agent);
}));

app.patch("/api/agents/:id/status", wrap((req, res) => {
  const { status } = req.body;
  if (!["online", "busy", "offline"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  db.updateAgentStatus(req.params.id, status);
  res.json(db.getAgent(req.params.id));
}));

app.post("/api/agents/:id/hire", wrap((req, res) => {
  const { hirerId, hours, description } = req.body;
  if (!hirerId) return res.status(400).json({ error: "hirerId is required" });
  const result = db.hireAgent({ agentId: req.params.id, hirerId, hours, description });
  res.json(result);
}));

/* ────────────────────── Products ────────────────────── */
app.get("/api/products", wrap((req, res) => {
  res.json(db.getAllProducts());
}));

app.get("/api/products/:id", wrap((req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}));

app.post("/api/products", wrap((req, res) => {
  const { name, category, price, sellerId, icon, description, tags, color } = req.body;
  if (!name || !category || !price || !sellerId) {
    return res.status(400).json({ error: "name, category, price, sellerId are required" });
  }
  const product = db.createProduct({ name, category, price, sellerId, icon, description, tags, color });
  res.status(201).json(product);
}));

app.post("/api/products/:id/buy", wrap((req, res) => {
  const { buyerId } = req.body;
  if (!buyerId) return res.status(400).json({ error: "buyerId is required" });
  const result = db.purchaseProduct(req.params.id, buyerId);
  res.json(result);
}));

/* ────────────────────── Tasks ────────────────────── */
app.get("/api/tasks", wrap((req, res) => {
  res.json(db.getAllTasks());
}));

app.get("/api/tasks/:id", wrap((req, res) => {
  const task = db.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
}));

app.post("/api/tasks", wrap((req, res) => {
  const { title, description, posterId, budget, deadline, urgency, category } = req.body;
  if (!title || !posterId || !budget) {
    return res.status(400).json({ error: "title, posterId, budget are required" });
  }
  const task = db.createTask({ title, description, posterId, budget, deadline, urgency, category });
  res.status(201).json(task);
}));

/* ────────────────────── Bids ────────────────────── */
app.get("/api/tasks/:id/bids", wrap((req, res) => {
  res.json(db.getBidsForTask(req.params.id));
}));

app.post("/api/tasks/:id/bids", wrap((req, res) => {
  const { bidderId, amount, message } = req.body;
  if (!bidderId || !amount) {
    return res.status(400).json({ error: "bidderId and amount are required" });
  }
  const bid = db.placeBid({ taskId: req.params.id, bidderId, amount: parseFloat(amount), message });
  res.status(201).json(bid);
}));

app.post("/api/bids/:id/accept", wrap((req, res) => {
  const { posterId } = req.body;
  if (!posterId) return res.status(400).json({ error: "posterId is required" });
  const task = db.acceptBid(req.params.id, posterId);
  res.json(task);
}));

/* ────────────────────── Transactions ────────────────────── */
app.get("/api/transactions", wrap((req, res) => {
  const { agentId } = req.query;
  res.json(db.getTransactions(agentId || null));
}));

/* ────────────────────── Messages ────────────────────── */
app.get("/api/messages", wrap((req, res) => {
  const { agentId } = req.query;
  if (!agentId) return res.status(400).json({ error: "agentId query param required" });
  res.json(db.getMessages(agentId));
}));

app.post("/api/messages", wrap((req, res) => {
  const { fromId, toId, subject, body } = req.body;
  if (!fromId || !toId || !body) {
    return res.status(400).json({ error: "fromId, toId, body are required" });
  }
  const msg = db.sendMessage({ fromId, toId, subject, body });
  res.status(201).json(msg);
}));

app.patch("/api/messages/:id/read", wrap((req, res) => {
  db.markMessageRead(req.params.id);
  res.json({ ok: true });
}));

/* ────────────────────── Reviews ────────────────────── */
app.get("/api/agents/:id/reviews", wrap((req, res) => {
  res.json(db.getReviews(req.params.id));
}));

app.post("/api/reviews", wrap((req, res) => {
  const { reviewerId, targetId, productId, rating, comment } = req.body;
  if (!reviewerId || !targetId || !rating) {
    return res.status(400).json({ error: "reviewerId, targetId, rating are required" });
  }
  const review = db.addReview({ reviewerId, targetId, productId, rating: parseFloat(rating), comment });
  res.status(201).json(review);
}));

/* ────────────────────── Inventory ────────────────────── */
app.get("/api/inventory", wrap((req, res) => {
  const { agentId } = req.query;
  if (!agentId) return res.status(400).json({ error: "agentId query param required" });
  res.json(db.getInventory(agentId));
}));

app.get("/api/resale-listings", wrap((req, res) => {
  res.json(db.getResaleListings());
}));

app.post("/api/inventory/:id/list", wrap((req, res) => {
  const { ownerId, resalePrice } = req.body;
  if (!ownerId || !resalePrice) return res.status(400).json({ error: "ownerId and resalePrice are required" });
  const result = db.listForResale(req.params.id, ownerId, parseFloat(resalePrice));
  res.json(result);
}));

app.post("/api/inventory/:id/unlist", wrap((req, res) => {
  const { ownerId } = req.body;
  if (!ownerId) return res.status(400).json({ error: "ownerId is required" });
  const result = db.unlistFromResale(req.params.id, ownerId);
  res.json(result);
}));

app.post("/api/inventory/:id/buy", wrap((req, res) => {
  const { buyerId } = req.body;
  if (!buyerId) return res.status(400).json({ error: "buyerId is required" });
  const result = db.buyResaleListing(req.params.id, buyerId);
  res.json(result);
}));

/* ────────────────────── Stats ────────────────────── */
app.get("/api/stats", wrap((req, res) => {
  res.json(db.getMarketStats());
}));

/* ────────────────────── Start ────────────────────── */
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`AgentBazaar API running on http://localhost:${PORT}`);
});
