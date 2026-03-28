import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Invoice, InvoiceForm, InvoiceStatus } from '../types/index'

export function useInvoices(user: User | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('karute_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setInvoices((data ?? []) as Invoice[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    void fetch()
  }, [fetch])

  function calcNextDate(period: string, from: string): string {
    const d = new Date(from)
    if (period === 'monthly') d.setMonth(d.getMonth() + 1)
    else if (period === 'quarterly') d.setMonth(d.getMonth() + 3)
    else if (period === 'yearly') d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
  }

  async function add(form: InvoiceForm): Promise<boolean> {
    if (!user) return false
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    const { error: err } = await supabase.from('karute_invoices').insert({
      user_id: user.id,
      project_id: form.project_id || null,
      client_id: form.client_id || null,
      amount: Number(form.amount),
      status: form.status,
      invoice_date: form.invoice_date || null,
      due_date: form.due_date || null,
      paid_date: form.paid_date || null,
      memo: form.memo || null,
      recurrence_period: form.recurrence_period || null,
      recurrence_next_date: form.recurrence_period
        ? calcNextDate(form.recurrence_period, form.due_date || today)
        : null,
    })
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function update(id: string, form: InvoiceForm): Promise<boolean> {
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    const { error: err } = await supabase
      .from('karute_invoices')
      .update({
        project_id: form.project_id || null,
        client_id: form.client_id || null,
        amount: Number(form.amount),
        status: form.status,
        invoice_date: form.invoice_date || null,
        due_date: form.due_date || null,
        paid_date: form.paid_date || null,
        memo: form.memo || null,
        recurrence_period: form.recurrence_period || null,
        recurrence_next_date: form.recurrence_period
          ? calcNextDate(form.recurrence_period, form.due_date || today)
          : null,
      })
      .eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function updateStatus(id: string, status: InvoiceStatus): Promise<boolean> {
    setError(null)
    const updates: Record<string, string> = { status }
    if (status === 'paid') {
      updates['paid_date'] = new Date().toISOString().slice(0, 10)
    }
    const { error: err } = await supabase.from('karute_invoices').update(updates).eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function remove(id: string): Promise<boolean> {
    setError(null)
    const { error: err } = await supabase.from('karute_invoices').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  return { invoices, loading, error, add, update, updateStatus, remove, refetch: fetch }
}
