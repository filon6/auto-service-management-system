import { NavLink, useLocation } from 'react-router'
import {
  BarChart3,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavigationItem = {
  title: string
  url: string
  icon: typeof Wrench
}

const groups: { label: string; items: NavigationItem[] }[] = [
  {
    label: 'Общее',
    items: [{ title: 'Главная', url: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Справочники',
    items: [
      { title: 'Автомобили', url: '/cars', icon: CarFront },
      { title: 'Мастера', url: '/masters', icon: Users },
      { title: 'Услуги', url: '/services', icon: Wrench },
    ],
  },
  {
    label: 'Журналы',
    items: [{ title: 'Выполненные работы', url: '/works', icon: ClipboardList }],
  },
  {
    label: 'Отчёты',
    items: [{ title: 'Аналитика и отчёты', url: '/reports', icon: BarChart3 }],
  },
]

type Props = {
  onLogout: () => void
}

export function AppSidebar({ onLogout }: Props) {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <Wrench className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">AutoService</p>
            <p className="truncate text-xs opacity-60">Панель управления</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-slate-400">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<NavLink to={item.url} end={item.url === '/'} />}
                        isActive={isActive}
                        className="text-slate-300 transition-colors hover:bg-slate-700 hover:text-white data-[active=true]:bg-indigo-600 data-[active=true]:font-semibold data-[active=true]:text-white"
                      >
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-400"
            >
              <LogOut className="size-4" />
              <span>Выйти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
