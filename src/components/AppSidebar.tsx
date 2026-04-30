import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import logo from '@/assets/logo.png';
import mothersDay from '@/assets/mothers-day.png';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Pacientes', url: '/pacientes', icon: Users },
  { title: 'Dentistas', url: '/dentistas', icon: Stethoscope },
  { title: 'Consultas', url: '/consultas', icon: Calendar },
  { title: 'Horários', url: '/horarios', icon: Clock },
  { title: 'Procedimentos', url: '/procedimentos', icon: FileText },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Prontuário', url: '/prontuario', icon: ClipboardList },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && (
              <div className="flex items-center gap-2 px-1 py-2">
                <img src={logo} alt="Dra. Roberta Machado" className="h-10 w-auto" />
              </div>
            )}
            {collapsed && <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && (
          <div className="mt-4 flex flex-col items-center px-3 pb-2">
            <img
              src={mothersDay}
              alt="Homenagem ao Dia das Mães"
              className="h-24 w-auto opacity-95 drop-shadow-md"
            />
            <span className="mt-2 text-center text-xs font-medium text-sidebar-foreground/80">
              Feliz Dia das Mães 💐
            </span>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="hover:bg-sidebar-accent">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
