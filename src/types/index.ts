// Supabase テーブルスキーマ
//
// clients
//   id: uuid PK default gen_random_uuid()
//   user_id: uuid references auth.users(id) on delete cascade
//   name: text not null
//   company: text
//   email: text
//   phone: text
//   memo: text
//   created_at: timestamptz default now()
//   RLS: user_id = auth.uid()
//
// projects
//   id: uuid PK default gen_random_uuid()
//   user_id: uuid references auth.users(id) on delete cascade
//   client_id: uuid references clients(id) on delete set null
//   title: text not null
//   status: text not null default 'active'  -- 'active' | 'completed' | 'paused'
//   rate: numeric
//   rate_type: text not null default 'fixed'  -- 'fixed' | 'hourly'
//   start_date: date
//   end_date: date
//   memo: text
//   created_at: timestamptz default now()
//   RLS: user_id = auth.uid()
//
// invoices
//   id: uuid PK default gen_random_uuid()
//   user_id: uuid references auth.users(id) on delete cascade
//   project_id: uuid references projects(id) on delete set null
//   client_id: uuid references clients(id) on delete set null
//   amount: numeric not null
//   status: text not null default 'unpaid'  -- 'unpaid' | 'invoiced' | 'paid'
//   invoice_date: date
//   due_date: date
//   paid_date: date
//   memo: text
//   created_at: timestamptz default now()
//   RLS: user_id = auth.uid()

export interface Client {
  id: string
  user_id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  memo: string | null
  created_at: string
}

export type ProjectStatus = 'active' | 'completed' | 'paused'
export type RateType = 'fixed' | 'hourly'

export interface Project {
  id: string
  user_id: string
  client_id: string | null
  title: string
  status: ProjectStatus
  rate: number | null
  rate_type: RateType
  cost: number | null
  start_date: string | null
  end_date: string | null
  memo: string | null
  created_at: string
}

export type InvoiceStatus = 'unpaid' | 'invoiced' | 'paid'
export type RecurrencePeriod = 'monthly' | 'quarterly' | 'yearly'

export interface Invoice {
  id: string
  user_id: string
  project_id: string | null
  client_id: string | null
  amount: number
  status: InvoiceStatus
  invoice_date: string | null
  due_date: string | null
  paid_date: string | null
  memo: string | null
  recurrence_period: RecurrencePeriod | null
  recurrence_next_date: string | null
  created_at: string
}

export interface ClientForm {
  name: string
  company: string
  email: string
  phone: string
  memo: string
}

export interface ProjectForm {
  client_id: string
  title: string
  status: ProjectStatus
  rate: string
  rate_type: RateType
  cost: string
  start_date: string
  end_date: string
  memo: string
}

export interface InvoiceForm {
  project_id: string
  client_id: string
  amount: string
  status: InvoiceStatus
  invoice_date: string
  due_date: string
  paid_date: string
  memo: string
  recurrence_period: RecurrencePeriod | ''
}
