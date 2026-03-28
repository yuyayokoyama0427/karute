import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Project, ProjectForm } from '../types/index'

export function useProjects(user: User | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('karute_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setProjects((data ?? []) as Project[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    void fetch()
  }, [fetch])

  async function add(form: ProjectForm): Promise<boolean> {
    if (!user) return false
    setError(null)
    const { error: err } = await supabase.from('karute_projects').insert({
      user_id: user.id,
      client_id: form.client_id || null,
      title: form.title,
      status: form.status,
      rate: form.rate ? Number(form.rate) : null,
      rate_type: form.rate_type,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      memo: form.memo || null,
    })
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  async function update(id: string, form: ProjectForm): Promise<boolean> {
    setError(null)
    const { error: err } = await supabase
      .from('karute_projects')
      .update({
        client_id: form.client_id || null,
        title: form.title,
        status: form.status,
        rate: form.rate ? Number(form.rate) : null,
        rate_type: form.rate_type,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
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

  async function updateStatus(id: string, status: Project['status']): Promise<boolean> {
    setError(null)
    const { error: err } = await supabase
      .from('karute_projects')
      .update({ status })
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
    const { error: err } = await supabase.from('karute_projects').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    await fetch()
    return true
  }

  return { projects, loading, error, add, update, updateStatus, remove, refetch: fetch }
}
