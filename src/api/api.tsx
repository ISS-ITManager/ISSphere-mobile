import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/login", { email, password });
  localStorage.setItem("access_token", response.data.data.access_token);
  return response.data;
};

export const getUserData = () => {
  const storedData = localStorage.getItem("userData");
  if (!storedData) throw new Error("User not logged in");
  return JSON.parse(storedData);
};

export const getWorkOrders = async () => {
  const response = await api.get("/work-orders");
  return response.data;
};

export const getWorkOrderDetails = async (id: string) => {
  const response = await api.get(`/work-orders/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/asset-categories/list");
  return response.data.data;
};

export const getAssets = async (categoryId: string) => {
  const response = await api.get(`/assets/list`, {
    params: { asset_category: categoryId },
  });
  return response.data.data || [];
};

export const getGroups = async () => {
  const response = await api.get("/groups/list");
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error("Failed to fetch groups");
  }
};

export const getEntitiesByGroupId = async (groupId: number) => {
  const response = await api.get(`/entities/${groupId}`);
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error("Failed to fetch entities for group");
  }
};

export const workOrderStatusApi = {
  list: async (workOrderId: string) => {
    const response = await api.get(`/work-order-statuses/list`, {
      params: { work_order: workOrderId },
    });
    return response.data;
  },
};

export const workOrderAssetsCreateApi = {
  list: async (params: {
    work_order: string;
    action?: string;
    asset?: string;
    asset_category?: string;
  }) => {
    const response = await api.get(`/work-order-assets`, { params });
    return response.data;
  },
};

export const getWorkOrderTasks = async (workOrderId: string) => {
  const response = await api.get(`/work-order-tasks`, {
    params: { work_order_id: workOrderId },
  });
  return response.data;
};
