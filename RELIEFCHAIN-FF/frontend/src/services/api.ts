import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* =========================================================
   AUTH TOKEN
========================================================= */

export const AUTH_TOKEN_KEY =
  "reliefchain-auth-token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/* =========================================================
   AXIOS REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================================
   AXIOS RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      clearAuthToken();
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   COMMON TYPES
========================================================= */

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/* =========================================================
   AUTH
========================================================= */

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: LoginUser;
};

export type CurrentUser = {
  id: string;
  email: string;
};

/* =========================================================
   CAMPAIGN
========================================================= */

export type Campaign = {
  id: string;
  title: string;
  description?: string;

  disasterId?: string;
  organizationId?: string;

  location?: string;
  severity?: string;

  targetAmount?: number;
  raisedAmount?: number;

  deadline?: string;

  requiredResources?: unknown;
  beneficiaryCount?: number;

  expectedExpenses?: unknown;
  documents?: unknown;

  status?: string;

  createdAt?: string;
  updatedAt?: string;

  disaster?: {
    id: string;
    name?: string;
    type?: string;
    severity?: string;
  };

  organization?: {
    id: string;
    name?: string;
  };
};

export type CreateCampaignRequest = {
  title: string;
  description: string;
  disasterId: string;
  organizationId: string;
  location: string;
  severity: string;
  targetAmount: number;
  deadline: string;
  requiredResources: string[];
  beneficiaryCount?: number;
  expectedExpenses?: unknown;
  documents?: unknown;
};

/* =========================================================
   DONATION
========================================================= */

export type PaymentMethod =
  | "UPI"
  | "CARD"
  | "NET_BANKING"
  | "WALLET";

export type DonationRequest = {
  campaignId: string;
  amount: number;
  paymentMethod: PaymentMethod;
};

export type Donation = {
  id: string;
  campaignId: string;
  donorId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt?: string;
};

export type DonationResponse = {
  donation: Donation;
  payment?: {
    id: string;
    method: PaymentMethod;
    amount: number;
    status: string;
    gatewayReference?: string;
    simulated?: boolean;
  };

  campaignRaisedAmount?: number;

  blockchain?: {
    transactionHash: string;
    blockNumber?: number;
    contractAddress?: string;
    network?: string;
  } | null;
};

/* =========================================================
   EXPENSE
========================================================= */

export type ExpenseRequest = {
  campaignId: string;
  amount: number;
  category: string;
  supplier?: string;
  date?: string;

  paymentMethod?: PaymentMethod;

  purpose: string;

  location?: string;

  gpsLatitude?: number;
  gpsLongitude?: number;

  evidence?: string | string[];
  evidenceUrl?: string;
};

export type Expense = {
  id: string;
  campaignId: string;
  responsiblePersonId?: string;

  amount: number;
  category: string;
  supplier?: string;

  date: string;

  paymentMethod?: string;
  purpose?: string;
  location?: string;

  gpsLatitude?: number;
  gpsLongitude?: number;

  status?: string;

  riskScore?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";

  aiReasons?: string[];

  createdAt?: string;
  updatedAt?: string;

  blockchainTx?: BlockchainTransaction[];

  alerts?: Alert[];
};

export type ExpenseCreateResponse = {
  expense: Expense;

  risk?: {
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];

    generatedAlert?: {
      alertType: string;
      message: string;
    };
  };

  evidenceHash?: string;

  blockchain?: {
    transactionHash: string;
    blockNumber?: number;
    contractAddress?: string;
    network?: string;
  } | null;
};

/* =========================================================
   BLOCKCHAIN
========================================================= */

export type BlockchainTransaction = {
  id?: string;
  transactionHash: string;
  blockNumber?: number;
  contractAddress?: string;
  network?: string;

  entityType?: string;
  entityId?: string;

  campaignId?: string;
  donationId?: string;
  expenseId?: string;
  batchId?: string;
  distributionId?: string;

  createdAt?: string;
};

/* =========================================================
   ALERT
========================================================= */

export type Alert = {
  id?: string;
  type?: string;
  message?: string;
  riskScore?: number;
  reasons?: string[];
  expenseId?: string;
  createdAt?: string;
};

/* =========================================================
   INVENTORY
========================================================= */

export type InventoryItem = {
  id: string;
  warehouseId: string;
  item: string;
  quantity: number;
  unit?: string;
  minimumRequired?: number;
  createdAt?: string;

  warehouse?: {
    id: string;
    name?: string;
    location?: string;
  };
};

export type CreateInventoryRequest = {
  warehouseId: string;
  item: string;
  quantity: number;
  unit?: string;
  minimumRequired?: number;
};

/* =========================================================
   BATCH
========================================================= */

export type Batch = {
  id: string;
  campaignId: string;
  batchCode: string;
  item: string;
  quantity: number;
  unit?: string;

  originWarehouseId?: string;
  destinationCampId?: string;

  status?: string;

  createdAt?: string;

  blockchainTx?: BlockchainTransaction[];
};

export type CreateBatchRequest = {
  campaignId: string;
  batchCode: string;
  item: string;
  quantity: number;
  unit?: string;
  originWarehouseId?: string;
  destinationCampId?: string;
};

/* =========================================================
   DISTRIBUTION
========================================================= */

export type Distribution = {
  id: string;

  beneficiaryId?: string;
  batchId?: string;
  campId?: string;

  quantity?: number;
  status?: string;

  createdAt?: string;

  beneficiary?: unknown;
  batch?: Batch;
  camp?: unknown;

  blockchainTx?: BlockchainTransaction[];
};

/* =========================================================
   API SERVICE
========================================================= */

export const apiService = {
  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  register: async (
    data: RegisterRequest
  ): Promise<RegisterResponse> => {
    const response = await api.post<
      ApiResponse<RegisterResponse>
    >("/auth/register", data);

    return response.data.data;
  },

  login: async (
    data: LoginRequest
  ): Promise<LoginResponse> => {
    const response = await api.post<
      ApiResponse<LoginResponse>
    >("/auth/login", data);

    const result = response.data.data;

    if (result?.token) {
      setAuthToken(result.token);
    }

    return result;
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    const response = await api.get<
      ApiResponse<CurrentUser>
    >("/auth/me");

    return response.data.data;
  },

  logout: (): void => {
    clearAuthToken();
    localStorage.removeItem(
      "reliefchain-authenticated"
    );
  },

  /* -------------------------------------------------------
     CAMPAIGNS
  ------------------------------------------------------- */

  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get<
      ApiResponse<Campaign[]>
    >("/campaigns");

    return response.data.data;
  },

  getCampaign: async (
    id: string
  ): Promise<Campaign> => {
    const response = await api.get<
      ApiResponse<Campaign>
    >(`/campaigns/${id}`);

    return response.data.data;
  },

  createCampaign: async (
    data: CreateCampaignRequest
  ): Promise<Campaign> => {
    const response = await api.post<
      ApiResponse<Campaign>
    >("/campaigns", data);

    return response.data.data;
  },

  /* -------------------------------------------------------
     DONATIONS
  ------------------------------------------------------- */

  createDonation: async (
    data: DonationRequest
  ): Promise<DonationResponse> => {
    const response = await api.post<
      ApiResponse<DonationResponse>
    >("/donations", data);

    return response.data.data;
  },

  getDonations: async (): Promise<Donation[]> => {
    const response = await api.get<
      ApiResponse<Donation[]>
    >("/donations");

    return response.data.data;
  },

  getDonation: async (
    id: string
  ): Promise<DonationResponse> => {
    const response = await api.get<
      ApiResponse<DonationResponse>
    >(`/donations/${id}`);

    return response.data.data;
  },

  /* -------------------------------------------------------
     EXPENSES
     IMPORTANT:
     POST /expenses automatically triggers
     Backend → Member 4 AI → blockchain.
  ------------------------------------------------------- */

  createExpense: async (
    data: ExpenseRequest
  ): Promise<ExpenseCreateResponse> => {
    const response = await api.post<
      ApiResponse<ExpenseCreateResponse>
    >("/expenses", data);

    return response.data.data;
  },

  getExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<
      ApiResponse<Expense[]>
    >("/expenses");

    return response.data.data;
  },

  getExpense: async (
    id: string
  ): Promise<Expense> => {
    const response = await api.get<
      ApiResponse<Expense>
    >(`/expenses/${id}`);

    return response.data.data;
  },

  updateExpense: async (
    id: string,
    data: Partial<Expense>
  ): Promise<Expense> => {
    const response = await api.put<
      ApiResponse<Expense>
    >(`/expenses/${id}`, data);

    return response.data.data;
  },

  /* -------------------------------------------------------
     INVENTORY
  ------------------------------------------------------- */

  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await api.get<
      ApiResponse<InventoryItem[]>
    >("/inventory");

    return response.data.data;
  },

  createInventory: async (
    data: CreateInventoryRequest
  ): Promise<InventoryItem> => {
    const response = await api.post<
      ApiResponse<InventoryItem>
    >("/inventory", data);

    return response.data.data;
  },

  updateInventory: async (
    id: string,
    data: Partial<CreateInventoryRequest>
  ): Promise<InventoryItem> => {
    const response = await api.put<
      ApiResponse<InventoryItem>
    >(`/inventory/${id}`, data);

    return response.data.data;
  },

  /* -------------------------------------------------------
     BATCHES
  ------------------------------------------------------- */

  createBatch: async (
    data: CreateBatchRequest
  ): Promise<{
    batch: Batch;
    blockchain?: BlockchainTransaction | null;
  }> => {
    const response = await api.post<
      ApiResponse<{
        batch: Batch;
        blockchain?: BlockchainTransaction | null;
      }>
    >("/batches", data);

    return response.data.data;
  },

  getBatch: async (
    id: string
  ): Promise<Batch> => {
    const response = await api.get<
      ApiResponse<Batch>
    >(`/batches/${id}`);

    return response.data.data;
  },

  transferBatch: async (
    id: string,
    status: string
  ): Promise<Batch> => {
    const response = await api.post<
      ApiResponse<Batch>
    >(`/batches/${id}/transfer`, { status });

    return response.data.data;
  },

  /* -------------------------------------------------------
     DISTRIBUTIONS
  ------------------------------------------------------- */

  getDistributions:
    async (): Promise<Distribution[]> => {
      const response = await api.get<
        ApiResponse<Distribution[]>
      >("/distributions");

      return response.data.data;
    },

  getDistribution: async (
    id: string
  ): Promise<Distribution> => {
    const response = await api.get<
      ApiResponse<Distribution>
    >(`/distributions/${id}`);

    return response.data.data;
  },

  createDistribution: async (
    data: unknown
  ): Promise<Distribution> => {
    const response = await api.post<
      ApiResponse<Distribution>
    >("/distributions", data);

    return response.data.data;
  },

  /* -------------------------------------------------------
     HEALTH
  ------------------------------------------------------- */

  health: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

/* =========================================================
   ERROR HELPER
========================================================= */

export function getApiErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (error.response?.status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (error.response?.status === 404) {
      return "Requested resource was not found.";
    }

    if (error.response?.status === 409) {
      return "This record already exists.";
    }

    if (error.response?.status === 422) {
      return "Some information is invalid. Please check the form.";
    }

    return "Unable to connect to the RELIEFCHAIN backend.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export default api;