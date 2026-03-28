// Vercel Cron Job: 毎日0時に繰り返し請求を自動作成
// Schedule: 0 0 * * *
// 必要な環境変数:
//   SUPABASE_URL (= VITE_SUPABASE_URL と同じ値)
//   SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard > Settings > API > service_role)

export const config = { runtime: 'nodejs' }

interface Invoice {
  id: string
  user_id: string
  project_id: string | null
  client_id: string | null
  amount: number
  memo: string | null
  due_date: string | null
  recurrence_period: 'monthly' | 'quarterly' | 'yearly'
  recurrence_next_date: string
}

function calcNextDate(period: string, from: string): string {
  const d = new Date(from)
  if (period === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (period === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (period === 'yearly') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export default async function handler(req: Request): Promise<Response> {
  // Vercel cronからのリクエストのみ許可
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return new Response('Missing env vars', { status: 500 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // 今日以前に次回作成日が来ている繰り返し請求を取得
  const res = await fetch(
    `${supabaseUrl}/rest/v1/karute_invoices?recurrence_period=not.is.null&recurrence_next_date=lte.${today}&select=*`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  )

  if (!res.ok) {
    return new Response('Failed to fetch invoices', { status: 500 })
  }

  const invoices = await res.json() as Invoice[]
  let created = 0

  for (const inv of invoices) {
    const newDueDate = inv.due_date ? calcNextDate(inv.recurrence_period, inv.due_date) : null
    const nextDate = calcNextDate(inv.recurrence_period, inv.recurrence_next_date)

    // 新しい請求を作成
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/karute_invoices`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: inv.user_id,
        project_id: inv.project_id,
        client_id: inv.client_id,
        amount: inv.amount,
        status: 'unpaid',
        invoice_date: today,
        due_date: newDueDate,
        paid_date: null,
        memo: inv.memo,
        recurrence_period: inv.recurrence_period,
        recurrence_next_date: nextDate,
      }),
    })

    if (!insertRes.ok) continue

    // 元の請求のrecurrence_next_dateを更新（次回作成日を進める）
    await fetch(`${supabaseUrl}/rest/v1/karute_invoices?id=eq.${inv.id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recurrence_next_date: nextDate }),
    })

    created++
  }

  return new Response(
    JSON.stringify({ ok: true, processed: invoices.length, created }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
