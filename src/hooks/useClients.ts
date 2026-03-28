import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Client, ClientForm } from '../types/index'

export function useClients(user: User | null) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('karute_clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setClients((data ?? []) as Client[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    void fetch()
  }, [fetch])

  async function add(form: ClientForm): Promise<boolean> {
    if (!user) return false
    setError(null)
    const { error: err } = await supabase.from('karute_clients').insert({
      user_id: user.id,
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      memo: form.memo || null,
    })
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function update(id: string, form: ClientForm): Promise<boolean> {
    setError(null)
    const { error: err } = await supabase
      .from('karute_clients')
      .update({
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        memo: form.memo || null,
      })
      .eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function remove(id: string): Promise<boolean> {
    setError(null)
    const { error: err } = await supabase.from('karute_clients').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  return { clients, loading, error, add, update, remove, refetch: fetch }
}
