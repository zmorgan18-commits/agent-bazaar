import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api";

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [currentAgent, setCurrentAgentState] = useState(null);
  const [agents, setAgents] = useState([]);
  const [products, setProducts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [a, p, t, s] = await Promise.all([
        api.fetchAgents(),
        api.fetchProducts(),
        api.fetchTasks(),
        api.fetchStats(),
      ]);
      setAgents(a);
      setProducts(p);
      setTasks(t);
      setStats(s);
    } catch (err) {
      console.error("Failed to refresh:", err);
    }
  }, []);

  const refreshAgent = useCallback(async () => {
    if (!currentAgent) return;
    try {
      const agent = await api.fetchAgent(currentAgent.id);
      setCurrentAgentState(agent);
    } catch (err) {
      console.error("Failed to refresh agent:", err);
    }
  }, [currentAgent]);

  const setCurrentAgent = useCallback((agent) => {
    setCurrentAgentState(agent);
    if (agent) {
      localStorage.setItem("agentBazaar_currentAgent", agent.id);
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [a, p, t, s] = await Promise.all([
          api.fetchAgents(),
          api.fetchProducts(),
          api.fetchTasks(),
          api.fetchStats(),
        ]);
        setAgents(a);
        setProducts(p);
        setTasks(t);
        setStats(s);

        const savedId = localStorage.getItem("agentBazaar_currentAgent");
        if (savedId) {
          const saved = a.find((ag) => ag.id === savedId);
          if (saved) setCurrentAgentState(saved);
        }
      } catch (err) {
        console.error("Initial load failed:", err);
      }
      setLoading(false);
    })();
  }, []);

  // Load messages when agent changes
  useEffect(() => {
    if (!currentAgent) { setMessages([]); return; }
    api.fetchMessages(currentAgent.id).then(setMessages).catch(console.error);
  }, [currentAgent]);

  // Load transactions when agent changes
  useEffect(() => {
    if (!currentAgent) { setTransactions([]); return; }
    api.fetchTransactions(currentAgent.id).then(setTransactions).catch(console.error);
  }, [currentAgent]);

  const purchaseProduct = useCallback(async (productId) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      const result = await api.purchaseProduct(productId, currentAgent.id);
      showToast(`Purchased ${result.product.name} for ${result.product.price} cr!`);
      await refresh();
      await refreshAgent();
      api.fetchTransactions(currentAgent.id).then(setTransactions);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, refreshAgent, showToast]);

  const hireAgentAction = useCallback(async (agentId, hours, description) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      const result = await api.hireAgent(agentId, currentAgent.id, hours, description);
      showToast(`Hired ${result.agent.name} for ${hours}h (${result.cost.toFixed(2)} cr)`);
      await refresh();
      await refreshAgent();
      api.fetchTransactions(currentAgent.id).then(setTransactions);
      api.fetchMessages(currentAgent.id).then(setMessages);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, refreshAgent, showToast]);

  const placeBidAction = useCallback(async (taskId, amount, message) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      await api.placeBid(taskId, currentAgent.id, amount, message);
      showToast(`Bid of ${amount} cr placed!`);
      await refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, showToast]);

  const acceptBidAction = useCallback(async (bidId) => {
    if (!currentAgent) return;
    try {
      await api.acceptBid(bidId, currentAgent.id);
      showToast("Bid accepted! Task assigned.");
      await refresh();
      await refreshAgent();
      api.fetchTransactions(currentAgent.id).then(setTransactions);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, refreshAgent, showToast]);

  const createProductAction = useCallback(async (data) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      const p = await api.createProduct({ ...data, sellerId: currentAgent.id });
      showToast(`Listed "${p.name}" on the marketplace!`);
      await refresh();
      return p;
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, showToast]);

  const createTaskAction = useCallback(async (data) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      const t = await api.createTask({ ...data, posterId: currentAgent.id });
      showToast(`Task "${t.title}" posted!`);
      await refresh();
      return t;
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, showToast]);

  const sendMessageAction = useCallback(async (toId, subject, body) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      await api.sendMessage({ fromId: currentAgent.id, toId, subject, body });
      showToast("Message sent!");
      api.fetchMessages(currentAgent.id).then(setMessages);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, showToast]);

  const addReviewAction = useCallback(async (targetId, rating, comment, productId) => {
    if (!currentAgent) { showToast("Select an agent identity first", "error"); return; }
    try {
      await api.addReview({ reviewerId: currentAgent.id, targetId, productId, rating, comment });
      showToast("Review submitted!");
      await refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [currentAgent, refresh, showToast]);

  const value = {
    currentAgent,
    setCurrentAgent,
    agents,
    products,
    tasks,
    transactions,
    messages,
    stats,
    loading,
    toast,
    showToast,
    refresh,
    refreshAgent,
    purchaseProduct,
    hireAgent: hireAgentAction,
    placeBid: placeBidAction,
    acceptBid: acceptBidAction,
    createProduct: createProductAction,
    createTask: createTaskAction,
    sendMessage: sendMessageAction,
    addReview: addReviewAction,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
