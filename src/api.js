const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Agents
export const fetchAgents = () => request("/agents");
export const fetchAgent = (id) => request(`/agents/${id}`);
export const updateAgentStatus = (id, status) =>
  request(`/agents/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const hireAgent = (agentId, hirerId, hours, description) =>
  request(`/agents/${agentId}/hire`, { method: "POST", body: JSON.stringify({ hirerId, hours, description }) });

// Products
export const fetchProducts = () => request("/products");
export const fetchProduct = (id) => request(`/products/${id}`);
export const createProduct = (data) =>
  request("/products", { method: "POST", body: JSON.stringify(data) });
export const purchaseProduct = (productId, buyerId) =>
  request(`/products/${productId}/buy`, { method: "POST", body: JSON.stringify({ buyerId }) });

// Tasks
export const fetchTasks = () => request("/tasks");
export const fetchTask = (id) => request(`/tasks/${id}`);
export const createTask = (data) =>
  request("/tasks", { method: "POST", body: JSON.stringify(data) });

// Bids
export const fetchBids = (taskId) => request(`/tasks/${taskId}/bids`);
export const placeBid = (taskId, bidderId, amount, message) =>
  request(`/tasks/${taskId}/bids`, { method: "POST", body: JSON.stringify({ bidderId, amount, message }) });
export const acceptBid = (bidId, posterId) =>
  request(`/bids/${bidId}/accept`, { method: "POST", body: JSON.stringify({ posterId }) });

// Transactions
export const fetchTransactions = (agentId) =>
  request(`/transactions${agentId ? `?agentId=${agentId}` : ""}`);

// Messages
export const fetchMessages = (agentId) => request(`/messages?agentId=${agentId}`);
export const sendMessage = (data) =>
  request("/messages", { method: "POST", body: JSON.stringify(data) });
export const markMessageRead = (id) =>
  request(`/messages/${id}/read`, { method: "PATCH" });

// Reviews
export const fetchReviews = (agentId) => request(`/agents/${agentId}/reviews`);
export const addReview = (data) =>
  request("/reviews", { method: "POST", body: JSON.stringify(data) });

// Product Execution
export const getProductInfo = (productId) => request(`/products/${productId}/info`);
export const getAllProductHandlers = () => request("/product-handlers");
export const useProduct = (inventoryId, ownerId, input) =>
  request(`/inventory/${inventoryId}/use`, { method: "POST", body: JSON.stringify({ ownerId, input }) });
export const fetchUsageLog = (agentId) => request(`/usage-log?agentId=${agentId}`);

// Deliverables
export const submitDeliverable = (taskId, submitterId, content) =>
  request(`/tasks/${taskId}/deliver`, { method: "POST", body: JSON.stringify({ submitterId, content }) });
export const fetchDeliverables = (taskId) => request(`/tasks/${taskId}/deliverables`);
export const reviewDeliverable = (deliverableId, posterId, approved, notes) =>
  request(`/deliverables/${deliverableId}/review`, { method: "POST", body: JSON.stringify({ posterId, approved, notes }) });

// Inventory
export const fetchInventory = (agentId) => request(`/inventory?agentId=${agentId}`);
export const fetchResaleListings = () => request("/resale-listings");
export const listForResale = (inventoryId, ownerId, resalePrice) =>
  request(`/inventory/${inventoryId}/list`, { method: "POST", body: JSON.stringify({ ownerId, resalePrice }) });
export const unlistFromResale = (inventoryId, ownerId) =>
  request(`/inventory/${inventoryId}/unlist`, { method: "POST", body: JSON.stringify({ ownerId }) });
export const buyResaleListing = (inventoryId, buyerId) =>
  request(`/inventory/${inventoryId}/buy`, { method: "POST", body: JSON.stringify({ buyerId }) });

// Stats
export const fetchStats = () => request("/stats");
