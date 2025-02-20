import axios from "axios";

const API_URL = import.meta.env.VITE_TEST_APP_API_URL; 

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

export const dashboardApi = {
  getTodayWO: async()=> {
    const response = await api.get('/reports/dashboard');
    return response;
  }
}
export const permissionApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/permissions?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
    return response;
  },
  permission: async () => {
    const response = await api.get(`/users/permissions`);
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
};

export const loginUser = async (
  email: string,
  password: string,
  device_token: string,
  platform: string
) => {
  const response = await api.post("/login", {
    email,
    password,
    device_token,
    platform,
  });
  localStorage.setItem("access_token", response.data.data.access_token);
  return response.data;
};

export const logout = async () => {
  const response = await api.get(`/logout`);
  return response;
};

// Fetch user data
export const getUserData = async () => {
  const storedData = localStorage.getItem("userData");
  if (!storedData) throw new Error("User not logged in");
  return JSON.parse(storedData);
};

export const getWorkOrders = async () => {
  const response = await api.get("/work-orders");
  return response.data;
};
export const getWorkOrdersPaginate = async (len) => {
  const response = await api.get(`/work-orders?paginate=${len}`);
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
  try {
    const response = await api.get(`/entities/list?group=${groupId}`);
    if (response.data.success) {
      return response.data.data; // Returns the entities data
    } else {
      throw new Error("Failed to fetch entities for group");
    }
  } catch (error) {
    console.error("Error fetching entities:", error);
    throw new Error("Error fetching entities");
  }
};
export const reportApi = {
  workOrderPending: async (data: any) => {
    const response = await api.get(
      `/reports/work-order-pending?download=false&client_id=${data.client_id}`
    );
    return response;
  },
  workOrderClosed: async (data: any) => {
    const response = await api.get(
      `/reports/work-order-closed?start_date=${data.start_date}&end_date=${data.end_date}&download=false&client_id=${data.client_id}`
    );
    return response;
  },
  workOrderAboutToBreach: async (data: any) => {
    const response = await api.get(
      `/reports/work-orders/resolution-about-to-breach`
    );
    return response;
  },
};

export const getPropertiesByEntityId = async (entityId: number) => {
  try {
    const response = await api.get(`/properties/list?entity=${entityId}`);
    if (response.data.success) {
      return response.data.data; // Returns the properties data
    } else {
      throw new Error("Failed to fetch properties for entity");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching properties");
  }
};

export const getZonesByPropertyId = async (propertyId: number) => {
  try {
    const response = await api.get(`/zones/list?property=${propertyId}`);
    if (response.data.success) {
      return response.data.data; // Returns the properties data
    } else {
      throw new Error("Failed to fetch properties for zones");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching properties");
  }
};

export const getLevelByZoneId = async (zoneId: number) => {
  try {
    const response = await api.get(`/levels/list?zone=${zoneId}`);
    if (response.data.success) {
      return response.data.data; // Returns the properties data
    } else {
      throw new Error("Failed to fetch properties for zones");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching properties");
  }
};

export const getRoomByLevelId = async (levelId: number) => {
  try {
    const response = await api.get(`/rooms/list?level=${levelId}`);
    if (response.data.success) {
      return response.data.data; // Returns the properties data
    } else {
      throw new Error("Failed to fetch properties for zones");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching properties");
  }
};

export const storeWorkOrderAssets = async (data: any) => {
  try {
    const response = await api.post("/work-order-assets", data);
    return response.data; // Return the data from the API response
  } catch (error) {
    console.error("Error storing work order assets:", error);
    throw error;
  }
};

export const getWorkOrderAssets = async (workOrderId: string) => {
  try {
    const response = await api.get(`/work-order-assets/list`, {
      params: { work_order: workOrderId }, // Pass work_order ID as a query parameter
    });
    return response.data; // Return the list of work order assets
  } catch (error) {
    console.error("Error fetching work order assets:", error);
    throw error;
  }
};

export const deleteWorkOrderAsset = async (assetId: number) => {
  try {
    await api.delete(`/work-order-assets/${assetId}`);
    return true;
  } catch (error) {
    console.error("Error deleting work order asset:", error);
    return false;
  }
};

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

export const fetchSupplies = async () => {
  try {
    const response = await api.get(`/supply-stocks/list`);
    if (response.data.success) {
      return response.data.data; // Return supplies data
    } else {
      throw new Error(response.data.message || "Failed to fetch supplies.");
    }
  } catch (error) {
    console.error("Error fetching supplies:", error);
    throw new Error("Error fetching supplies.");
  }
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

//Suppliers
export const supplierApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/suppliers?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
};

// Fetch work order tasks by work_order_id

export const getWorkOrderTasks = async (workOrderId: string) => {
  const response = await api.get(`/work-order-tasks`, {
    params: { work_order_id: workOrderId },
  });
  return response.data;
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
};

export const workOrderApi = {
  get: async (data: any) => {
    console.log(data);
    const buildQuery = (data: Record<string, any>): string => {
      return Object.entries(data)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&");
    };
    const response = await api.get(
      `/work-orders?${buildQuery({
        group: data.group,
        entity: data.entity_id,
        property: data.property_id,
        zone: data.zone_id,
        level: data.level_id,
        room: data.room_id,
        rental_type: data.rental_type_id,
        page: data.page,
        paginate: data.paginate,
        keyword: data.keyword,
      })}`
    );
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/work-orders/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.put(`/work-orders/${id}`, data);
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-orders`, data);
    return response;
  },
  workOrderStatus: async (data: any) => {
    const response = await api.post(`/work-order-statuses`, data);
    return response;
  },
  list: async (workOrderRequestId: any) => {
    const response = await api.get(
      `/work-orders/list?work_order_request=${workOrderRequestId}`
    );
    return response;
  },
  openResponseTime: async (id: any) => {
    const response = await api.get(
      `/work-orders/open-response-time?work_order=${id}`
    );
    return response;
  },
  responseTime: async (id: any) => {
    const response = await api.get(
      `/work-orders/response-time?work_order=${id}`
    );
    return response;
  },
  resolutionTime: async (id: any) => {
    const response = await api.get(
      `/work-orders/resolution-time?work_order=${id}`
    );
    return response;
  },
};

// api for work order tasks
export const workOrderTaskApi = {
  get: async (workOrderId: any) => {
    const response = await api.get(
      `/work-order-tasks?work_order_id=${workOrderId}`
    );
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
    const response = await api.get(
      `/work-order-tasks/list?work_order_request=${workOrderRequestId}`
    );
    return response;
  },
};

//api for work order task history
export const workOrderTaskHistoryApi = {
  get: async (workOrderTaskId: any) => {
    const response = await api.get(
      `/work-order-task-histories?work_order_task_id=${workOrderTaskId}`
    );
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
    const response = await api.get(
      `/work-order-task-histories/list?work_order_request=${workOrderRequestId}`
    );
    return response;
  },
  updateStatus: async (data: any) => {
    const response = await api.post(`/work-order-statuses`, data);
    return response;
  },
};

//assignee api
export const assigneeApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/assignees?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
};

//api for activity log
export const workOrderActivityLogApi = {
  list: async (id: any) => {
    const response = await api.get(
      `/work-order-activity-logs/list?work_order=${id}`
    );
    return response;
  },
};

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
};

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
};

export const workOrderSupplyApi = {
  getStock: async (data: any) => {
    const response = await api.get(
      `/work-order-supplies?supply_category=${data.supply_category}&supply=${data.supply}&supplier=${data.supplier}`
    );
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-order-supplies`, data);
    return response;
  },
  list: async (worOrkerId: any) => {
    const response = await api.get(
      `/work-order-supplies/list?work_order=${worOrkerId}`
    );
    return response;
  },
  delete: async (id: any) => {
    const response = await api.delete(`/work-order-supplies/${id}`);
    return response;
  },
};

export const workOrderExpenseApi = {
  store: async (data: any) => {
    const response = await api.post(`/work-order-expenses`, data);
    return response;
  },
  list: async (id: any) => {
    const response = await api.get(
      `/work-order-expenses/list?work_order=${id}`
    );
    return response;
  },
  delete: async (id: any) => {
    const response = await api.delete(`/work-order-expenses/${id}`);
    return response;
  },
};

export const workOrderCategoryApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/work-order-categories?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/work-order-categories`, data);
    return response;
  },
};

export const workOrderTypeApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/work-order-types?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}&work_order_category=${data.work_order_category}`
    );
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
  list: async (categoryId: any) => {
    const response = await api.get(
      `/work-order-types/list?work_order_category=${categoryId}`
    );
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/work-order-types`, data);
    return response;
  },
};

export const groupApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/groups?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
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
};

export const entityApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/entities?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/entities`, data);
    return response;
  },
  list: async (groupId: any) => {
    const response = await api.get(`/entities/list?group=${groupId}`);
    return response;
  },
};

export const propertyApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/properties?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/properties`, data);
    return response;
  },
  list: async (entityId: any) => {
    const response = await api.get(`/properties/list?entity=${entityId}`);
    return response;
  },
};

export const zoneApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/zones?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/zones`, data);
    return response;
  },
  list: async (propertyId: any) => {
    const response = await api.get(`/zones/list?property=${propertyId}`);
    return response;
  },
};

export const levelApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/levels?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/levels`, data);
    return response;
  },
  list: async (zoneId: any) => {
    const response = await api.get(`/levels/list?zone=${zoneId}`);
    return response;
  },
};

export const roomApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/rooms?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/rooms`, data);
    return response;
  },
  list: async (levelId: any) => {
    const response = await api.get(`/rooms/list?level=${levelId}`);
    return response;
  },
};

export const workOrderRequestApi = {
  get: async (len: any) => {
    const response = await api.get(
      `/work-order-requests?paginate=${len}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/work-order-requests`, data);
    return response;
  },
  storeSchedule: async (data: any) => {
    const response = await api.post(`/work-order-request-schedules`, data);
    return response;
  },
  decline: async (data: any) => {
    const response = await api.post(`/work-order-requests/decline`, data);
    return response;
  },
};

export const teamApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/teams?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/teams`, data);
    return response;
  },
};

export const serviceApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/services?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
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
  store: async (data: any) => {
    const response = await api.post(`/services`, data);
    return response;
  },
  list: async (sla_priority: any) => {
    const response = await api.get(
      `/services/list?sla_priority=${sla_priority}`
    );
    return response;
  },
};

export const serviceProviderServiceApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/provider-services?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}&service_provider=${data.service_provider_id}`
    );
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/provider-services/${id}`);
    return response;
  },
  update: async (id: any, data: any) => {
    const response = await api.post(`/provider-services/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
  store: async (data: any) => {
    const response = await api.post(`/provider-services`, data);
    return response;
  },
  list: async (serviceId: any) => {
    const response = await api.get(
      `/provider-services/list?service=${serviceId}`
    );
    return response;
  },
};

export const notificationApi = {
  get: async (limit: any) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response;
  },
  getById: async (id: any) => {
    const response = await api.get(`/notifications/${id}`);
    return response;
  },

  all: async () => {
    const response = await api.get(`/notifications`);
    return response;
  },
};

export const userApi = {
  get: async (data: any) => {
    const response = await api.get(
      `/users?paginate=${data.paginate}&page=${data.page}&keyword=${data.keyword}`
    );
    return response;
  },
  show: async (id: any) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },
};

export const uploadWorkOrderDocuments = async (
  files: File[],
  workOrderId: number,
  workOrderDocumentId: number
) => {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  formData.append("work_order_id", workOrderId.toString());
  formData.append("work_order_document_id", workOrderDocumentId.toString());

  try {
    console.log("Uploading Files:", files);
    files.forEach((file, index) =>
      console.log(`File ${index}:`, file.name, file.type, file.size)
    );

    const response = await api.post("/upload-work-order-documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload Response:", response.data);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "File upload failed");
    }
  } catch (error: any) {
    console.error("Upload error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error uploading files");
  }
};
