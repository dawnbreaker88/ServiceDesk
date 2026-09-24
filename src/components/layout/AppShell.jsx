import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Layers,
  BookOpen,
  Laptop,
  LogOut,
  LifeBuoy,
  LayoutDashboard,
  Clock,
  ShieldCheck,
  BarChart3,
  Users,
  Building2,
  FolderTree,
  Sun,
  Moon,
} from 'lucide-react';

export default function AppShell({ activePage, setActivePage, children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Define navigation by role
  const getNavSections = () => {
    const role = user?.role || 'EMPLOYEE';

    if (role === 'ADMIN') {
      return [
        {
          label: 'Administration',
          items: [
            { id: 'admin-overview', label: 'System Console', icon: LayoutDashboard },
            { id: 'admin-users', label: 'User Directory', icon: Users },
            { id: 'admin-departments', label: 'Departments', icon: Building2 },
            { id: 'admin-categories', label: 'Taxonomy', icon: FolderTree },
            { id: 'admin-sla', label: 'SLA Matrix', icon: ShieldCheck },
          ],
        },
        {
          label: 'Operations & Assets',
          items: [
            { id: 'tech-queue', label: 'Ticket Dispatch', icon: Layers },
            { id: 'mgr-assets', label: 'Asset Fleet', icon: Laptop },
            { id: 'mgr-audit', label: 'Audit Trail', icon: BarChart3 },
          ],
        },
      ];
    }

    if (role === 'MANAGER' || role === 'ASSET_MANAGER') {
      return [
        {
          label: 'Triage & Command',
          items: [
            { id: 'mgr-overview', label: 'Operations Overview', icon: LayoutDashboard },
            { id: 'tech-queue', label: 'Ticket Dispatch', icon: Layers },
            { id: 'mgr-assets', label: 'Asset Fleet', icon: Laptop },
            { id: 'mgr-sla', label: 'SLA Monitor', icon: ShieldCheck },
            { id: 'mgr-team', label: 'Team Capacity', icon: Users },
            { id: 'mgr-audit', label: 'Audit Trail', icon: BarChart3 },
          ],
        },
        {
          label: 'Resources',
          items: [{ id: 'guides', label: 'Knowledge Base', icon: BookOpen }],
        },
      ];
    }

    if (role === 'TECHNICIAN') {
      return [
        {
          label: 'Workstation',
          items: [
            { id: 'tech-dashboard', label: 'Command Center', icon: LayoutDashboard },
            { id: 'tech-queue', label: 'Ticket Queue', icon: Layers },
            { id: 'tech-worklogs', label: 'Work Logs', icon: Clock },
            { id: 'mgr-assets', label: 'Hardware Assets', icon: Laptop },
          ],
        },
        {
          label: 'Knowledge',
          items: [{ id: 'guides', label: 'Knowledge Base', icon: BookOpen }],
        },
      ];
    }

    // Default Employee
    return [
      {
        label: 'Support Portal',
        items: [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'support', label: 'Get Support', icon: LifeBuoy },
          { id: 'tickets', label: 'My Tickets', icon: Layers },
        ],
      },
      {
        label: 'Resources',
        items: [
          { id: 'guides', label: 'Knowledge Base', icon: BookOpen },
          { id: 'devices', label: 'My Devices', icon: Laptop },
        ],
      },
    ];
  };

  const navSections = getNavSections();
  const allNavItems = navSections.flatMap((s) => s.items);
  const currentNav = allNavItems.find((n) => n.id === activePage);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-[#fafafa] dark:bg-[#09090b] font-sans text-[#171717] dark:text-[#f4f4f5] transition-colors duration-200">
        {/* ─── Shadcn Sidebar Component ────────────────────────────────── */}
        <Sidebar collapsible="icon" className="border-r border-[#e5e5e5] dark:border-[#27272a] bg-white dark:bg-[#0c0c0e]">
          <SidebarHeader className="border-b border-[#e5e5e5] dark:border-[#27272a] p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2.5 px-1 py-0.5 overflow-hidden group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center w-full">
              <img
                src="/favicon.svg"
                alt="ServiceDesk Logo"
                className="w-7 h-7 flex-shrink-0 object-contain rounded-md"
              />
              <div className="flex flex-col group-data-[collapsible=icon]:hidden truncate">
                <span className="font-semibold text-[14px] text-[#0a0a0a] dark:text-[#f4f4f5] leading-tight tracking-tight">
                  ServiceDesk
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a1a1aa]">
                  {user?.role?.replace('_', ' ') || 'Enterprise'}
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 gap-4">
            {navSections.map((section, idx) => (
              <SidebarGroup key={idx} className="p-0">
                <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-[#a3a3a3] dark:text-[#71717a] px-2 py-1 group-data-[collapsible=icon]:hidden">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activePage === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#f5f5f5] dark:bg-[#1e1e24] text-[#0a0a0a] dark:text-[#f4f4f5] font-semibold shadow-xs border border-[#e5e5e5] dark:border-[#27272a]'
                                : 'text-[#525252] dark:text-[#a1a1aa] hover:text-[#0a0a0a] dark:hover:text-[#f4f4f5] hover:bg-[#fafafa] dark:hover:bg-[#141417]'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${
                                isActive ? 'text-[#2563eb] dark:text-[#3b82f6]' : 'text-[#737373] dark:text-[#71717a]'
                              }`}
                            />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-[#e5e5e5] dark:border-[#27272a] p-3 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center justify-between p-1.5 rounded-[8px] bg-[#fafafa] dark:bg-[#141417] border border-[#e5e5e5] dark:border-[#27272a] group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:justify-center w-full">
              <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#e5e5e5] dark:border-[#27272a] shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#0a0a0a] dark:bg-[#27272a] text-white dark:text-[#f4f4f5] flex-shrink-0 flex items-center justify-center font-semibold text-xs shadow-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                  <span className="text-[12px] font-medium text-[#0a0a0a] dark:text-[#f4f4f5] truncate leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#737373] dark:text-[#a1a1aa] leading-tight">
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-[#737373] dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-white dark:hover:bg-[#1e1e24] transition-colors cursor-pointer group-data-[collapsible=icon]:hidden"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapsed mode Sign Out button */}
            <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center w-full mt-1.5">
              <button
                onClick={logout}
                className="p-1.5 text-[#737373] dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#f5f5f5] dark:hover:bg-[#1e1e24] rounded-md transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* ─── Main Content Area (Inset) ───────────────────────────────── */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-[#fafafa] dark:bg-[#09090b]">
          {/* Header */}
          <header className="h-16 bg-white dark:bg-[#0c0c0e] border-b border-[#e5e5e5] dark:border-[#27272a] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#18181b] p-1.5 rounded text-[#525252] dark:text-[#a1a1aa]" />
              <Separator orientation="vertical" className="h-4 bg-[#e5e5e5] dark:bg-[#27272a]" />
              <span className="text-[13px] text-[#737373] dark:text-[#a1a1aa]">Workspace</span>
              <span className="text-[#a3a3a3] dark:text-[#525252]">/</span>
              <span className="text-[13px] font-medium text-[#0a0a0a] dark:text-[#f4f4f5] capitalize">
                {currentNav?.label || activePage}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-[8px] text-[#737373] hover:text-[#0a0a0a] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f5f5f5] dark:hover:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] transition-all cursor-pointer shadow-2xs"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark/light theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <span className="text-[11px] font-mono font-medium text-[#2563eb] dark:text-[#60a5fa] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-900/50">
                {user?.role}
              </span>
              <span className="text-[12px] font-mono text-[#737373] dark:text-[#a1a1aa] bg-[#f5f5f5] dark:bg-[#18181b] px-2.5 py-1 rounded border border-[#e5e5e5] dark:border-[#27272a]">
                {user?.department?.name || 'Enterprise'}
              </span>
            </div>
          </header>

          {/* Page Container */}
          <main className="flex-1 p-6 sm:p-8 max-w-[1240px] w-full mx-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
