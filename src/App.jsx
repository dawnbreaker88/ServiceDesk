import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { TooltipProvider } from './components/ui/tooltip';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import AppShell from './components/layout/AppShell';

// Employee Portal Pages
import EmployeeHome from './pages/employee/EmployeeHome';
import GetSupportPage from './pages/employee/GetSupportPage';
import MyTicketsPage from './pages/employee/MyTicketsPage';
import TicketDetailPage from './pages/employee/TicketDetailPage';
import GuidesPage from './pages/employee/GuidesPage';
import MyDevicesPage from './pages/employee/MyDevicesPage';

// Technician & Operations Pages
import TechDashboard from './pages/technician/TechDashboard';
import TechQueue from './pages/technician/TechQueue';
import TechTicketWorkstation from './pages/technician/TechTicketWorkstation';
import TechWorkLogsPage from './pages/technician/TechWorkLogsPage';

// Manager & Asset Operations Pages
import ManagerOverview from './pages/manager/ManagerOverview';
import ManagerAssets from './pages/manager/ManagerAssets';
import ManagerSlaPage from './pages/manager/ManagerSlaPage';
import TeamWorkloadPage from './pages/manager/TeamWorkloadPage';
import AuditLogsPage from './pages/manager/AuditLogsPage';

// Admin System Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSla from './pages/admin/AdminSla';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState('landing'); // 'landing' | 'login'
  const isAdmin = user?.role === 'ADMIN';
  const isManagerOrAdmin = user && ['MANAGER', 'ADMIN', 'ASSET_MANAGER'].includes(user.role);
  const isItStaff = user && ['TECHNICIAN', 'MANAGER', 'ADMIN', 'ASSET_MANAGER'].includes(user.role);

  const [activePage, setActivePage] = useState(
    isAdmin ? 'admin-overview' : isManagerOrAdmin ? 'mgr-overview' : isItStaff ? 'tech-dashboard' : 'home'
  );
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [queueTab, setQueueTab] = useState('all');
  const [supportInitialQuery, setSupportInitialQuery] = useState('');

  // Synchronize default page when user logs in with role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setActivePage('admin-overview');
      } else if (['MANAGER', 'ASSET_MANAGER'].includes(user.role)) {
        setActivePage('mgr-overview');
      } else if (user.role === 'TECHNICIAN') {
        setActivePage('tech-dashboard');
      } else {
        setActivePage('home');
      }
      setSelectedTicketId(null);
    }
  }, [user?.role]);

  // Handler to navigate to support with prefilled query
  const handleStartSupport = (query = '') => {
    setSupportInitialQuery(query);
    setActivePage('support');
  };

  // Handler to select and view a single ticket
  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActivePage(isItStaff ? 'tech-workstation' : 'ticket-detail');
  };

  // Handler for technician quick navigation from dashboard to queue
  const handleNavigateToQueue = (tab = 'all') => {
    setQueueTab(tab);
    setActivePage('tech-queue');
  };

  // If user is authenticated, render the AppShell with role-aware routing
  if (isAuthenticated && user) {
    return (
      <AppShell
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'ticket-detail' && page !== 'tech-workstation') {
            setSelectedTicketId(null);
          }
        }}
        onBackToLanding={() => setView('landing')}
      >
        {/* ─── Global Workstation Views for Any Ticket Selection ────── */}
        {activePage === 'tech-workstation' && selectedTicketId && (
          <TechTicketWorkstation
            ticketId={selectedTicketId}
            onBack={() => setActivePage(isAdmin ? 'admin-overview' : isManagerOrAdmin ? 'mgr-overview' : 'tech-queue')}
          />
        )}

        {activePage === 'ticket-detail' && selectedTicketId && (
          <TicketDetailPage
            ticketId={selectedTicketId}
            onBack={() => setActivePage('tickets')}
          />
        )}

        {/* ─── Admin Specific Views ─────────────────────────────────────── */}
        {isAdmin && (
          <>
            {activePage === 'admin-overview' && (
              <AdminOverview onNavigate={(page) => setActivePage(page)} />
            )}

            {activePage === 'admin-users' && (
              <AdminUsers />
            )}

            {activePage === 'admin-departments' && (
              <AdminDepartments />
            )}

            {activePage === 'admin-categories' && (
              <AdminCategories />
            )}

            {activePage === 'admin-sla' && (
              <AdminSla />
            )}
          </>
        )}

        {/* ─── Manager & Operations Views ───────────────────────────────── */}
        {isManagerOrAdmin && (
          <>
            {activePage === 'mgr-overview' && (
              <ManagerOverview onNavigate={(page) => setActivePage(page)} />
            )}

            {activePage === 'mgr-assets' && (
              <ManagerAssets onSelectTicket={handleSelectTicket} />
            )}

            {activePage === 'mgr-sla' && (
              <ManagerSlaPage onSelectTicket={handleSelectTicket} />
            )}

            {activePage === 'mgr-team' && (
              <TeamWorkloadPage onSelectTicket={handleSelectTicket} />
            )}

            {activePage === 'mgr-audit' && (
              <AuditLogsPage />
            )}
          </>
        )}

        {/* ─── Technician & Operations Views ────────────────────────────── */}
        {isItStaff && (
          <>
            {activePage === 'tech-dashboard' && (
              <TechDashboard
                onNavigateToQueue={handleNavigateToQueue}
                onSelectTicket={handleSelectTicket}
              />
            )}

            {activePage === 'tech-queue' && (
              <TechQueue
                initialTab={queueTab}
                onSelectTicket={handleSelectTicket}
              />
            )}

            {activePage === 'tech-worklogs' && (
              <TechWorkLogsPage onSelectTicket={handleSelectTicket} />
            )}

            {!isManagerOrAdmin && activePage === 'mgr-assets' && (
              <ManagerAssets onSelectTicket={handleSelectTicket} />
            )}
          </>
        )}

        {/* ─── Employee Portal Views ────────────────────────────────────── */}
        {!isItStaff && (
          <>
            {activePage === 'home' && (
              <EmployeeHome
                onNavigateToSupport={handleStartSupport}
                onSelectTicket={handleSelectTicket}
                onNavigateToGuides={() => setActivePage('guides')}
              />
            )}

            {activePage === 'support' && (
              <GetSupportPage
                initialQuery={supportInitialQuery}
                onTicketCreated={(newTicketId) => {
                  setSelectedTicketId(newTicketId);
                  setActivePage('ticket-detail');
                }}
              />
            )}

            {activePage === 'tickets' && (
              <MyTicketsPage
                onSelectTicket={handleSelectTicket}
                onNavigateToSupport={() => handleStartSupport('')}
              />
            )}

            {activePage === 'devices' && (
              <MyDevicesPage
                onStartSupportWithAsset={(assetName) =>
                  handleStartSupport(`Hardware issue with device: ${assetName}`)
                }
              />
            )}
          </>
        )}

        {/* ─── Shared Views (Knowledge Guides) ──────────────────────────── */}
        {activePage === 'guides' && (
          <GuidesPage onStartSupportWithGuide={handleStartSupport} />
        )}
      </AppShell>
    );
  }

  // Not authenticated
  if (view === 'login') {
    return <LoginPage onBackToLanding={() => setView('landing')} />;
  }

  return <LandingPage onNavigateToApp={() => setView('login')} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <TooltipProvider>
              <MainApp />
            </TooltipProvider>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


