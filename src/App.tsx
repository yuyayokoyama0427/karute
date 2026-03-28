import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from './hooks/useAuth'
import { usePro } from './hooks/usePro'
import { useClients } from './hooks/useClients'
import { useProjects } from './hooks/useProjects'
import { useInvoices } from './hooks/useInvoices'
import { LoginScreen } from './components/LoginScreen'
import { BottomNav } from './components/BottomNav'
import type { Tab } from './components/BottomNav'
import { ProModal } from './components/ProModal'
import { DashboardPage } from './pages/DashboardPage'
import { ClientsPage } from './pages/ClientsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { InvoicesPage } from './pages/InvoicesPage'

function App() {
  const { user, loading, signIn, signOut } = useAuth()
  const { isPro, activate, loading: proLoading, error: proError } = usePro()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showPro, setShowPro] = useState(false)

  const { clients, add: addClient, update: updateClient, remove: removeClient, error: clientError } = useClients(user)
  const { projects, add: addProject, update: updateProject, remove: removeProject, error: projectError } = useProjects(user)
  const { invoices, add: addInvoice, update: updateInvoice, updateStatus: updateInvoiceStatus, remove: removeInvoice, error: invoiceError } = useInvoices(user)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} />
  }

  return (
    <>
      <BottomNav active={tab} onChange={setTab} />
      <div className="ml-52 min-h-screen">
      {tab === 'dashboard' && (
        <DashboardPage
          user={user}
          projects={projects}
          invoices={invoices}
          onSignOut={signOut}
        />
      )}
      {tab === 'clients' && (
        <ClientsPage
          clients={clients}
          projects={projects}
          invoices={invoices}
          isPro={isPro}
          onUpgrade={() => setShowPro(true)}
          onAdd={addClient}
          onUpdate={updateClient}
          onRemove={removeClient}
          error={clientError}
        />
      )}
      {tab === 'projects' && (
        <ProjectsPage
          projects={projects}
          clients={clients}
          isPro={isPro}
          onUpgrade={() => setShowPro(true)}
          onAdd={addProject}
          onUpdate={updateProject}
          onRemove={removeProject}
          error={projectError}
        />
      )}
      {tab === 'invoices' && (
        <InvoicesPage
          invoices={invoices}
          projects={projects}
          clients={clients}
          isPro={isPro}
          onUpgrade={() => setShowPro(true)}
          onAdd={addInvoice}
          onUpdate={updateInvoice}
          onUpdateStatus={updateInvoiceStatus}
          onRemove={removeInvoice}
          error={invoiceError}
        />
      )}

      </div>

      {showPro && (
        <ProModal
          onActivate={async key => { const ok = await activate(key); if (ok) setShowPro(false) }}
          onClose={() => setShowPro(false)}
          loading={proLoading}
          error={proError}
        />
      )}

      <Analytics />
    </>
  )
}

export default App
