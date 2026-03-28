import type { Invoice, Client, Project } from '../types/index'

export function printInvoice(
  inv: Invoice,
  client: Client | undefined,
  project: Project | undefined,
  userName: string,
  userEmail: string,
) {
  const invoiceNo = `INV-${inv.created_at.slice(0, 10).replace(/-/g, '')}-${inv.id.slice(0, 4).toUpperCase()}`
  const issueDate = inv.invoice_date ?? new Date().toISOString().slice(0, 10)
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>請求書 ${invoiceNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif;
    font-size: 13px;
    color: #111;
    background: #fff;
    padding: 40px;
    max-width: 720px;
    margin: 0 auto;
  }
  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 4px;
    text-align: center;
    margin-bottom: 32px;
    border-bottom: 2px solid #4F46E5;
    padding-bottom: 12px;
    color: #1e1b4b;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  .meta-right {
    text-align: right;
    font-size: 12px;
    color: #555;
    line-height: 1.8;
  }
  .client-block {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 24px;
    background: #fafafa;
  }
  .client-block .label {
    font-size: 11px;
    color: #888;
    margin-bottom: 4px;
  }
  .client-block .name {
    font-size: 20px;
    font-weight: 700;
  }
  .client-block .sub {
    font-size: 12px;
    color: #555;
    margin-top: 2px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
  }
  thead th {
    background: #4F46E5;
    color: #fff;
    padding: 8px 12px;
    text-align: left;
    font-size: 12px;
  }
  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
  }
  .amount-col {
    text-align: right;
    font-weight: 600;
  }
  .total-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    margin-bottom: 24px;
  }
  .total-box {
    border: 2px solid #4F46E5;
    border-radius: 8px;
    padding: 12px 24px;
    text-align: right;
  }
  .total-box .label {
    font-size: 12px;
    color: #888;
  }
  .total-box .value {
    font-size: 24px;
    font-weight: 800;
    color: #4F46E5;
  }
  .section {
    margin-bottom: 16px;
  }
  .section h3 {
    font-size: 11px;
    color: #888;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .section p {
    font-size: 13px;
    line-height: 1.7;
    color: #333;
  }
  .footer {
    margin-top: 40px;
    border-top: 1px solid #eee;
    padding-top: 16px;
    font-size: 11px;
    color: #aaa;
    text-align: center;
  }
  @media print {
    body { padding: 20px; }
    @page { margin: 15mm; }
  }
</style>
</head>
<body>
  <h1>請 求 書</h1>

  <div class="meta">
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:4px">請求番号</div>
      <div style="font-weight:700;font-size:15px">${invoiceNo}</div>
    </div>
    <div class="meta-right">
      <div>発行日：${issueDate}</div>
      ${inv.due_date ? `<div>支払期限：<strong>${inv.due_date}</strong></div>` : ''}
    </div>
  </div>

  <div class="client-block">
    <div class="label">請求先</div>
    ${client?.company ? `<div class="name">${client.company}</div><div class="sub">${client.name} 様</div>` : `<div class="name">${client?.name ?? '—'} 様</div>`}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:60%">品目・内容</th>
        <th style="text-align:right">金額（税込）</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${project?.title ?? inv.memo ?? '業務委託費'}</td>
        <td class="amount-col">¥${inv.amount.toLocaleString('ja-JP')}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-row">
    <div class="total-box">
      <div class="label">合計金額</div>
      <div class="value">¥${inv.amount.toLocaleString('ja-JP')}</div>
    </div>
  </div>

  <div class="section">
    <h3>請求元</h3>
    <p>${userName}${userEmail ? `<br>${userEmail}` : ''}</p>
  </div>

  ${inv.memo && inv.memo !== project?.title ? `
  <div class="section">
    <h3>備考</h3>
    <p>${inv.memo}</p>
  </div>` : ''}

  <div class="footer">
    このドキュメントはKarute（karute-gray.vercel.app）で作成されました
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) return
  w.document.write(html)
  w.document.close()
}
