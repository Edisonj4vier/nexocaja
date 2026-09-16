// ==========================================
// Shared Types — NexoCaja Core Financiero
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

// --- Clients / Socios ---
export type PersonType = 'NATURAL' | 'LEGAL';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';

export interface Client {
  id: string;
  personType?: PersonType;
  memberCode?: string;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  province?: string;
  city?: string;
  parish?: string;
  addressReference?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  
  // Socioeconomic
  occupation?: string;
  profession?: string;
  employerCompany?: string;
  monthlyIncome?: number | string;
  economicActivity?: string;
  workAddress?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // Member info
  memberType?: string;
  affiliationDate?: string;
  totalContributions?: number | string;
  agency?: string;

  // Status & Audit
  status: ClientStatus;
  statusReason?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;

  accounts?: Account[];
  _count?: {
    accounts: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Financial Products ---
export type ProductType = 'SAVINGS' | 'PROGRAMMED_SAVINGS' | 'TERM_DEPOSIT' | 'CONTRIBUTION';

export interface FinancialProduct {
  id: string;
  code: string;
  name: string;
  type: ProductType;
  interestRate: number | string;
  interestPeriodicity: string;
  minOpeningAmount: number | string;
  minBalance: number | string;
  accountingAccount?: string;
  accountingInterest?: string;
  accountingCash?: string;
  status: string;
}

// --- Beneficiaries ---
export interface Beneficiary {
  id?: string;
  accountId?: string;
  fullName: string;
  identificationNumber?: string;
  relationship: string;
  percentage: number;
}

// --- Accounts ---
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'CLOSED' | 'FROZEN';

export interface Account {
  id: string;
  accountNumber: string;
  clientId: string;
  client?: Client;
  productId?: string;
  product?: FinancialProduct;
  currency?: string;
  openingAmount?: number | string;
  interestRate?: number | string;
  agency?: string;
  balance: string | number;
  status: AccountStatus;
  statusReason?: string;
  openedAt: string;
  closedAt?: string | null;
  beneficiaries?: Beneficiary[];
  movements?: Movement[];
  _count?: {
    movements: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Socio 360 Summary ---
export interface Client360 extends Client {
  accounts: Account[];
  summary: {
    totalSavings: number;
    totalContributions: number;
    accountsCount: number;
    activeAccountsCount: number;
    recentMovementsCount: number;
  };
  recentMovements: Movement[];
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

// --- Dashboard ---
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
