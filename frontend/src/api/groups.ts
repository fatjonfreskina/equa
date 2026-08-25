import client from './client'

export interface Member {
  id: number
  name: string
  email?: string
}

export interface Split {
  member_id: number
  share_amount: number
}

export interface Expense {
  id: number
  paid_by_member_id: number
  description: string
  amount: number
  created_at: string
  splits: Split[]
}

export interface Group {
  id: string
  name: string
  description?: string
  currency: string
  status: 'active' | 'closing' | 'closed'
  created_at: string
  members: Member[]
  expenses: Expense[]
}

export interface Balance {
  from_member_id: number
  from_member_name: string
  to_member_id: number
  to_member_name: string
  amount: string
}

export interface Settlement {
  id: number
  from_member_id: number
  to_member_id: number
  amount: string
  status: 'pending' | 'confirmed' | 'cancelled'
  reported_by_member_id?: number | null
  reported_at?: string | null
  confirmed_by_member_id?: number | null
  confirmed_at?: string | null
}

export const groupsApi = {
  create: (data: {
    name: string
    description?: string
    currency: string
    members: { name: string; email?: string }[]
  }) => client.post<Group>('/groups/', data),

  get: (id: string) => client.get<Group>(`/groups/${id}`),

  updateStatus: (id: string, status: Group['status']) =>
    client.patch<Group>(`/groups/${id}/status`, { status }),

  delete: (id: string) => client.delete(`/groups/${id}`),

  getBalances: (id: string) => client.get<Balance[]>(`/groups/${id}/balances/`),

  getSettlements: (id: string) => client.get<Settlement[]>(`/groups/${id}/settlements/`),

  reportSettlement: (groupId: string, settlementId: number, memberId: number) =>
    client.patch<Settlement>(`/groups/${groupId}/settlements/${settlementId}/report`, {
      member_id: memberId,
    }),

  confirmSettlement: (groupId: string, settlementId: number, memberId: number) =>
    client.patch<Settlement>(`/groups/${groupId}/settlements/${settlementId}/confirm`, {
      member_id: memberId,
    }),

  addExpenseEqual: (
    groupId: string,
    data: {
      paid_by_member_id: number
      description: string
      amount: number
    },
  ) => client.post<Expense>(`/groups/${groupId}/expenses/equal`, data),

  addExpenseSubset: (
    groupId: string,
    data: {
      paid_by_member_id: number
      description: string
      amount: number
      member_ids: number[]
    },
  ) => client.post<Expense>(`/groups/${groupId}/expenses/subset`, data),

  addExpense: (
    groupId: string,
    data: {
      paid_by_member_id: number
      description: string
      amount: number
      splits: Split[]
    },
  ) => client.post<Expense>(`/groups/${groupId}/expenses/`, data),

  updateExpense: (
    groupId: string,
    expenseId: number,
    data: {
      paid_by_member_id: number
      description: string
      amount: number
      splits: Split[]
    },
  ) => client.put<Expense>(`/groups/${groupId}/expenses/${expenseId}`, data),

  deleteMember: (groupId: string, memberId: number) =>
    client.delete(`/groups/${groupId}/members/${memberId}`),

  deleteExpense: (groupId: string, expenseId: number) =>
    client.delete(`/groups/${groupId}/expenses/${expenseId}`),

  addMember: (groupId: string, data: { name: string; email?: string }) =>
    client.post<Member>(`/groups/${groupId}/members/`, data),

  updateMember: (groupId: string, memberId: number, data: { name?: string; email?: string }) =>
    client.patch<Member>(`/groups/${groupId}/members/${memberId}`, data),
}
