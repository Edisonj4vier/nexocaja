// ==========================================
// Shared Types — NexoCaja
// ==========================================

// --- Roles ---
export interface Role {
  id: string;
  name: string;
  description?: string;
}

// --- Users ---
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  role: Role;
  roleId: string;
  lastLogin?: string;
  createdAt: string;
}

// --- Clients ---
export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  status: ClientStatus;
  accounts?: Account[];
  createdAt: string;
  updatedAt: string;
}

// --- Accounts ---
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface Account {
  id: string;
  accountNumber: string;
  clientId: string;
  client?: Client;
  balance: string | number;
  status: AccountStatus;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Cash Registers ---
export type CashRegisterStatus = 'OPEN' | 'CLOSED';

export interface CashRegister {
  id: string;
  userId: string;
  user?: User;
  openingBalance: string | number;
  closingBalance?: string | number | null;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt?: string | null;
  observations?: string | null;
  movements?: Movement[];
}

// --- Movements ---
export type MovementType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Movement {
  id: string;
  type: MovementType;
  amount: string | number;
  accountId: string;
  account?: Account;
  cashRegisterId: string;
  cashRegister?: CashRegister;
  userId: string;
  user?: User;
  observations?: string | null;
  createdAt: string;
}

// --- Dashboard Summary ---
export interface DashboardSummary {
  totalClients: number;
  activeAccounts: number;
  totalUsers: number;
  todayDeposits: {
    total: number;
    count: number;
  };
  todayWithdrawals: {
    total: number;
    count: number;
  };
  currentCashRegister: {
    id: string;
    status: CashRegisterStatus;
    openingBalance: number;
    currentBalance: number;
    openedAt: string;
    movementsCount: number;
  } | null;
  recentMovements: Movement[];
}

// --- Reports ---
export type ReportFormatType = 'json' | 'xlsx' | 'pdf';

export interface ReportFilter {
  format?: ReportFormatType;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: MovementType;
  accountId?: string;
  cashRegisterId?: string;
  userId?: string;
}

// --- Paginated Response ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
