import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to include the token in each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Get token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login function
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/login", { email, password });
    const accessToken = response.data.data.access_token; // Assuming token is in response.data.data.access_token
    localStorage.setItem("access_token", accessToken); // Save token to localStorage
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch user data
export const getUserData = async () => {
  const storedData = localStorage.getItem("userData");
  if (!storedData) {
    throw new Error("User not logged in");
  }
  return JSON.parse(storedData); // Parse the user data from localStorage
};

// Fetch work orders for the user
export const getWorkOrders = async (userId: string) => {
  try {
    const response = await api.get(`/work-orders`); // Assuming the endpoint takes the user ID
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWorkOrderDetails = async (id: string) => {
  try {
    const response = await api.get(`/work-orders/${id}`); // Use the axios instance
    return response.data; // Axios automatically parses JSON responses
  } catch (error) {
    console.error("Error fetching work order details:", error);
    throw error;
  }
};

// Fetch categories for assets
export const getCategories = async () => {
  try {
    const response = await api.get("/asset-categories/list"); // Assuming this is the correct endpoint
    return response.data.data; // Correct the path to access the categories array
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Rethrow error to be handled in the component
  }
};

// Fetch assets by category
export const getAssets = async (categoryId: string) => {
  try {
    const response = await api.get(`/assets/list?asset_category=${categoryId}`);
    console.log("Fetched Assets Response:", response); // Log the full response to debug

    if (response && response.data && response.data.data) {
      return response.data.data; // Correctly access the assets
    } else {
      console.error("Assets not found in response:", response);
      return []; // Return an empty array if assets are not found
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

// Update the workOrderStatusApi to use the new endpoint
export const workOrderStatusApi = {
  list: async (workOrderId: string) => {
    try {
      const response = await api.get(`/work-order-statuses/list`, {
        params: { work_order: workOrderId }, // Pass workOrderId as the parameter
      });
      console.log("API Response:", response); // Log full response to inspect the structure
      return response.data; // Return the full response data
    } catch (error) {
      console.error("Error fetching work order statuses:", error);
      throw error;
    }
  },
};

export const workOrderAssetsCreateApi = {
  list: async ({ workOrderId, action, asset, assetCategory }) => {
    try {
      const response = await api.get(`/work-order-assets`, {
        params: {
          work_order: workOrderId,
          action: action,
          asset: asset,
          asset_category: assetCategory,
        },
      });
      return response.data; // Ensure response has a success property to check
    } catch (error) {
      console.error("Error fetching work order assets:", error);
      throw error;
    }
  },
};

// Fetch work order tasks by work_order_id
export const getWorkOrderTasks = async (workOrderId: string) => {
  try {
    const response = await api.get(`/work-order-tasks`, {
      params: { work_order_id: workOrderId }, // Pass work_order_id as a parameter
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error fetching work order tasks:", error);
    throw error; // Rethrow error to be handled in the component
  }
};
