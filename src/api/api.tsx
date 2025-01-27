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
export const permissionApi = {
  get: async (data: any) => {
    const response = await api.get(`/permissions?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/permissions/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/permissions/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/permissions`, data);
    return response;
  },
  list: async (data: any) => {
    const url = data.client_id
      ? `/permissions/list?client_id=${data.client_id}`
      : `/permissions/list`;
    const response = await api.get(url);
    return response;
  },

}

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
      // console.log("API Response:", response); // Log full response to inspect the structure
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

//Suppliers
export const supplierApi = {
  get: async (data: any) => {
    const response = await api.get(`/suppliers?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/suppliers/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/suppliers`, data);
    return response;
  },
  list: async () => {
    const response = await api.get(`/suppliers/list`);
    return response;
  },
}

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

// Fetch work order task history by work_order_task_id
export const getWorkOrderTaskHistory = async (workOrderTaskId: string) => {
  try {
    const response = await api.get(`/work-order-task-histories`, {
      params: { work_order_task_id: workOrderTaskId }, // Pass work_order_task_id as a parameter
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error fetching work order tasks history:", error);
    throw error; // Rethrow error to be handled in the component
  }
};

export const createTaskHistory = async (data) => {
  try {
    const response = await api.post("/work-order-task-histories", { data });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// api for work order tasks
export const workOrderTaskApi = {
  get: async (workOrderId: any) => {
    const response = await api.get(`/work-order-tasks?work_order_id=${workOrderId}`);
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/work-order-tasks/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/work-order-tasks/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-order-tasks`, data);
    return response;
  },
  list: async (workOrderRequestId: any) => {
    const response = await api.get(`/work-order-tasks/list?work_order_request=${workOrderRequestId}`);
    return response;
  },

}

//api for work order task history
export const workOrderTaskHistoryApi = {
  get: async (workOrderTaskId: any) => {
    const response = await api.get(`/work-order-task-histories?work_order_task_id=${workOrderTaskId}`);
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/work-order-task-histories/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/work-order-task-histories/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-order-task-histories`, data);
    return response;
  },
  list: async (workOrderRequestId: any) => {
    const response = await api.get(`/work-order-task-histories/list?work_order_request=${workOrderRequestId}`);
    return response;
  },
  updateStatus: async (data: any) => {
    const response = await api.post(`/work-order-statuses`, data);
    return response;
  },
}

//assignee api
export const assigneeApi = {
  get: async (data: any) => {
    const response = await api.get(`/assignees?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/assignees/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/assignees/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/assignees`, data);
    return response;
  },
  list: async () => {
    const response = await api.get(`/assignees/list`);
    return response;
  },
}

//api for activity log
export const workOrderActivityLogApi = {

  list: async (id: any) => {
    const response = await api.get(`/work-order-activity-logs/list?work_order=${id}`);
    return response;
  },
}

export const supplyApi = {
  show: async (id: any) => {
    const response = await api.get(`/supplies/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/supplies/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/supplies`, data);
    return response;
  },
  list: async () => {
    const response = await api.get(`/supplies/list`);
    return response;
  },
}

export const supplyCategoryApi = {
  show: async (id: any) => {
    const response = await api.get(`/supply-categories/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/supply-categories/${id}`, data);
    return response;
  },
  list: async () => {
    const response = await api.get(`/supply-categories/list`);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/supply-categories`, data);
    return response;
  },
}

export const workOrderSupplyApi = {
  getStock: async (data: any) => {
    const response = await api.get(`/work-order-supplies?supply_category=${data.supply_category}&supply=${data.supply}&supplier=${data.supplier}`);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-order-supplies`, data);
    return response;
  },
  list: async (worOrkerId: any) => {
    const response = await api.get(`/work-order-supplies/list?work_order=${worOrkerId}`);
    return response;
  },
  delete: async (id: any) => {
    const response = await api.delete(`/work-order-supplies/${id}`);
    return response;
  },
}

export const workOrderCategoryApi ={
  get: async (data: any) => {
      const response = await api.get(`/work-order-categories?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/work-order-categories/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/work-order-categories/${id}`, data);
      return response;
  },
  list: async () => {
      const response = await api.get(`/work-order-categories/list`);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/work-order-categories`, data);
      return response;
  },
}

export const workOrderTypeApi ={
  get: async (data: any) => {
      const response = await api.get(`/work-order-types?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}&work_order_category=${data.work_order_category}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/work-order-types/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/work-order-types/${id}`, data);
      return response;
  },
  list: async (categoryId : any) => {
      const response = await api.get(`/work-order-types/list?work_order_category=${categoryId}`);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/work-order-types`, data);
      return response;
  },
}

export const groupApi ={
  get: async (data: any) => {
      const response = await api.get(`/groups?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/groups/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/groups/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/groups`, data);
      return response;
  },
  list: async () => {
      const response = await api.get(`/groups/list`);
      return response;
  },
  countries: async () => {
      const response = await api.get(`/countries/list`);
      return response;
  },
}

export const entityApi ={
  get: async (data: any) => {
      const response = await api.get(`/entities?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/entities/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/entities/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/entities`, data);
      return response;
  },
  list: async (groupId : any) => {
      const response = await api.get(`/entities/list?group=${groupId}`);
      return response;
  },
}

export const propertyApi ={
  get: async (data: any) => {
      const response = await api.get(`/properties?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/properties/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/properties/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/properties`, data);
      return response;
  },
  list: async (entityId : any) => {
      const response = await api.get(`/properties/list?entity=${entityId}`);
      return response;
  },
}


export const zoneApi ={
  get: async (data: any) => {
      const response = await api.get(`/zones?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/zones/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/zones/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/zones`, data);
      return response;
  },
  list: async (propertyId : any) => {
      const response = await api.get(`/zones/list?property=${propertyId}`);
      return response;
  },
}


export const levelApi ={
  get: async (data: any) => {
      const response = await api.get(`/levels?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/levels/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/levels/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/levels`, data);
      return response;
  },
  list: async (zoneId : any) => {
      const response = await api.get(`/levels/list?zone=${zoneId}`);
      return response;
  },
}

export const roomApi ={
  get: async (data: any) => {
      const response = await api.get(`/rooms?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/rooms/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/rooms/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/rooms`, data);
      return response;
  },
  list: async (levelId : any) => {
      const response = await api.get(`/rooms/list?level=${levelId}`);
      return response;
  },
}

export const workOrderRequestApi ={
  get: async (data: any) => {
      const response = await api.get(`/work-order-requests?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/work-order-requests/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/work-order-requests/${id}`, data);
      return response;
  },
  list: async () => {
      const response = await api.get(`/work-order-requests`);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/work-order-requests`, data);
      return response;
  },
  storeSchedule: async (data : any) => {
      const response = await api.post(`/work-order-request-schedules`, data);
      return response;
  },
  decline: async (data : any) => {
      const response = await api.post(`/work-order-requests/decline`, data);
      return response;
  },
  
}


export const teamApi ={
  get: async (data: any) => {
      const response = await api.get(`/teams?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/teams/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/teams/${id}`, data);
      return response;
  },
  list: async () => {
      const response = await api.get(`/teams/list`);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/teams`, data);
      return response;
  },
}

export const serviceApi ={
  get: async (data: any) => {
      const response = await api.get(`/services?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/services/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.put(`/services/${id}`, data);
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/services`, data);
      return response;
  },
  list: async (sla_priority : any) => {
      const response = await api.get(`/services/list?sla_priority=${sla_priority}`);
      return response;
  },
}

export const serviceProviderServiceApi ={
  get: async (data: any) => {
      const response = await api.get(`/provider-services?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}&service_provider=${data.service_provider_id}`);
      return response;
  },
  show: async (id: any) => {
      const response = await api.get(`/provider-services/${id}`);
      return response;
  },
  update: async (id: any, data: any) => {
      const response = await api.post(`/provider-services/${id}`, data, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }, 
      });
      return response;
  },
  store: async (data : any) => {
      const response = await api.post(`/provider-services`, data);
      return response;
  },
  list: async (serviceId : any) => {
      const response = await api.get(`/provider-services/list?service=${serviceId}`);
      return response;
  },
}