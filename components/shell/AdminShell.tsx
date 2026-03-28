'use client';

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePlan } from '@/lib/hooks/usePlan';
import { getAlerts } from '@/lib/api/billing.service';
import { PAGE_MODULE_MAP } from '@/lib/plans/module-access';
import { TrialBanner } from '@/components/plans/TrialBanner';
import { DiscoveryBanner } from '@/components/plans/DiscoveryBanner';
import {
  HomeIcon,
  CalendarIcon,
  CalendarCheckIcon,
  UsersIcon,
  DollarIcon,
  BarChartIcon,
  SettingsIcon,
  SearchIcon,
  LogOutIcon,
  UserIcon,
  LinkIcon,
  StarIcon,
  AwardIcon,
  HeartIcon,
  ClockIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  EyeIcon,
  UserPlusIcon,
  AlertTriangleIcon,
  FileTextIcon,
  PackageIcon,
  GraduationCapIcon,
  PhoneIcon,
  GlobeIcon,
  TrophyIcon,
  MessageIcon,
  LockIcon,
  ShieldIcon,
  CheckSquareIcon,
  CreditCardIcon,
} from './icons';
import { ProfileSwitcher } from '@/components/shared/ProfileSwitcher';
import { LegalFooter } from './LegalFooter';
import { isImpersonating, getImpersonationInfo, stopImpersonation } from '@/lib/api/superadmin-impersonate.service';
import { SidebarHelpSection } from './HelpSection';
import { SidebarFeedback } from '@/components/shared/SidebarFeedback';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { BetaBadge } from '@/components/beta/BetaBadge';

interface AdminShellProps {
  children: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: { href: string; label: string; icon: typeof HomeIcon; badge?: number; id?: string }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'GESTAO',
    items: [
      { href: '/admin', label: 'Dashboard', icon: HomeIcon, id: 'sidebar-link-dashboard' },
      { href: '/admin/turmas', label: 'Turmas', icon: CalendarIcon, id: 'sidebar-link-turmas' },
      { href: '/admin/alunos', label: 'Alunos', icon: UsersIcon, id: 'sidebar-link-alunos' },
      { href: '/admin/usuarios', label: 'Usuarios', icon: UserPlusIcon, id: 'sidebar-link-usuarios' },
      { href: '/admin/calendario', label: 'Calendario', icon: ClockIcon, id: 'sidebar-link-calendario' },
      { href: '/admin/graduacoes', label: 'Graduacoes', icon: AwardIcon, id: 'sidebar-link-graduacoes' },
      { href: '/admin/saude', label: 'Saude', icon: ShieldIcon, id: 'sidebar-link-saude' },
      { href: '/admin/conduta', label: 'Conduta', icon: CheckSquareIcon, id: 'sidebar-link-conduta' },
      { href: '/admin/pendencias', label: 'Pendencias', icon: AlertTriangleIcon, id: 'sidebar-link-pendencias' },
    ],
  },
  {
    label: 'COMERCIAL',
    items: [
      { href: '/admin/experimental', label: 'Experimentais', icon: UserPlusIcon, id: 'sidebar-link-experimental' },
      { href: '/admin/convites', label: 'Convites', icon: LinkIcon, id: 'sidebar-link-convites' },
      { href: '/admin/whatsapp', label: 'WhatsApp', icon: PhoneIcon, id: 'sidebar-link-whatsapp' },
      { href: '/admin/site', label: 'Meu Site', icon: GlobeIcon, id: 'sidebar-link-meu-site' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { href: '/admin/financeiro', label: 'Financeiro', icon: DollarIcon, id: 'sidebar-link-financeiro' },
      { href: '/admin/inadimplencia', label: 'Inadimplencia', icon: AlertTriangleIcon, id: 'sidebar-link-inadimplencia' },
      { href: '/admin/contratos', label: 'Contratos', icon: FileTextIcon, id: 'sidebar-link-contratos' },
    ],
  },
  {
    label: 'PEDAGOGICO',
    items: [
      { href: '/admin/pedagogico', label: 'Coord. Pedagogica', icon: GraduationCapIcon, id: 'sidebar-link-pedagogico' },
    ],
  },
  {
    label: 'CONTEUDO',
    items: [
      { href: '/admin/conteudo', label: 'Conteudo', icon: SettingsIcon, id: 'sidebar-link-conteudo' },
      { href: '/admin/eventos', label: 'Eventos', icon: CalendarCheckIcon, id: 'sidebar-link-eventos' },
      { href: '/admin/comunicados', label: 'Comunicados', icon: MegaphoneIcon, id: 'sidebar-link-comunicados' },
    ],
  },
  {
    label: 'COMPETICAO',
    items: [
      { href: '/admin/campeonatos', label: 'Campeonatos', icon: TrophyIcon, id: 'sidebar-link-campeonatos' },
    ],
  },
  {
    label: 'COMUNICACAO',
    items: [
      { href: '/admin/mensagens', label: 'Mensagens', icon: MessageIcon, id: 'sidebar-link-mensagens' },
      { href: '/admin/feedbacks', label: 'Feedbacks', icon: MessageIcon, id: 'sidebar-link-feedbacks' },
    ],
  },
  {
    label: 'LOJA',
    items: [
      { href: '/admin/loja', label: 'Loja', icon: ShoppingBagIcon, id: 'sidebar-link-loja' },
      { href: '/admin/estoque', label: 'Estoque', icon: PackageIcon, id: 'sidebar-link-estoque' },
    ],
  },
  {
    label: 'RELATORIOS',
    items: [
      { href: '/admin/relatorios', label: 'Relatorios', icon: BarChartIcon, id: 'sidebar-link-relatorios' },
      { href: '/admin/relatorio-professores', label: 'Professores', icon: GraduationCapIcon, id: 'sidebar-link-relatorio-professores' },
      { href: '/admin/retencao', label: 'Retencao', icon: HeartIcon, id: 'sidebar-link-retencao' },
      { href: '/admin/auditoria', label: 'Auditoria', icon: EyeIcon, id: 'sidebar-link-auditoria' },
    ],
  },
  {
    label: 'CONFIGURACAO',
    items: [
      { href: '/admin/plano', label: 'Meu Plano', icon: StarIcon, id: 'sidebar-link-meu-plano' },
      { href: '/admin/configuracoes/dados-bancarios', label: 'Dados Bancarios', icon: CreditCardIcon, id: 'sidebar-link-dados-bancarios' },
      { href: '/admin/configuracoes', label: 'Configuracoes', icon: SettingsIcon, id: 'sidebar-link-configuracoes' },
    ],
  },
];


const AdminShell = forwardRef<HTMLDivElement, AdminShellProps>(
  function AdminShell({ children }, ref) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, logout } = useAuth();
    const { hasAccess, isTrial, isDiscovery, trialDaysLeft, discoveryDaysLeft } = usePlan();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [billingAlertCount, setBillingAlertCount] = useState(0);
    const [impersonating, setImpersonating] = useState(false);
    const [impersonateAcademia, setImpersonateAcademia] = useState('');

    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    // ── Load billing alert count ─────────────────────────────────────
    useEffect(() => {
      getAlerts('academy-1')
        .then((alerts) => setBillingAlertCount(alerts.length))
        .catch(() => {});
    }, []);

    // ── Impersonation check ──────────────────────────────────────────
    useEffect(() => {
      const imp = isImpersonating();
      setImpersonating(imp);
      if (imp) {
        const info = getImpersonationInfo();
        if (info) setImpersonateAcademia(info.academiaNome);
      }
    }, []);

    // ── Click outside handlers ─────────────────────────────────────────

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    // ── User menu actions ──────────────────────────────────────────────

    async function handleLogout() {
      setUserMenuOpen(false);
      await logout();
    }

    const userName = profile?.display_name ?? 'Admin';
    const userRole = profile?.role ?? 'admin';

    async function handleStopImpersonation() {
      await stopImpersonation();
      setImpersonating(false);
      setImpersonateAcademia('');
      router.push('/superadmin');
    }

    return (
      <div ref={ref} className="flex min-h-screen flex-col" style={{ background: 'var(--bb-depth-1)' }}>
        {/* Impersonation Banner */}
        {impersonating && (
          <div
            className="fixed left-0 right-0 top-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold"
            style={{ background: '#f59e0b', color: '#000' }}
          >
            <span>Você está visualizando como: {impersonateAcademia} (Admin)</span>
            <button
              onClick={handleStopImpersonation}
              className="ml-2 rounded-md px-3 py-1 text-xs font-bold"
              style={{ background: 'rgba(0,0,0,0.2)', color: '#000' }}
            >
              Sair da visualização
            </button>
          </div>
        )}
        <div className="flex flex-1" style={{ marginTop: impersonating ? '40px' : '0' }}>
        {/* Sidebar - desktop */}
        <aside
          className="hidden lg:flex lg:w-64 lg:flex-col"
          style={{
            background: 'var(--bb-depth-2)',
            borderRight: '1px solid var(--bb-glass-border)',
          }}
        >
          <div
            className="flex h-14 flex-col justify-center px-6"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <BlackBeltLogo variant="navbar" mode="dark" height={28} />
            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Academia Admin
            </span>
          </div>
          <nav aria-label="Menu principal" className="flex-1 overflow-y-auto p-3">
            {sidebarGroups.map((group, gi) => (
              <div key={group.label}>
                <p
                  className="uppercase tracking-widest font-semibold"
                  style={{
                    fontSize: '10px',
                    color: 'var(--bb-ink-30)',
                    marginBottom: '4px',
                    marginTop: gi === 0 ? '0' : '16px',
                    paddingLeft: '16px',
                  }}
                >
                  {group.label}
                </p>
                <div className="flex flex-col gap-[2px]">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                    const showBadge = item.href === '/admin/plano' && billingAlertCount > 0;
                    const moduleForLink = PAGE_MODULE_MAP[item.href];
                    const isLocked = moduleForLink ? !hasAccess(moduleForLink) : false;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        id={item.id}
                        className="flex items-center gap-3 text-sm transition-colors"
                        style={{
                          padding: '10px 16px',
                          borderRadius: 'var(--bb-radius-sm)',
                          opacity: isLocked ? 0.5 : 1,
                          ...(isActive
                            ? {
                                background: 'var(--bb-brand-surface)',
                                color: 'var(--bb-brand)',
                                fontWeight: 600,
                              }
                            : {
                                color: 'var(--bb-ink-60)',
                              }),
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bb-depth-4)';
                            e.currentTarget.style.color = 'var(--bb-ink-80)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--bb-ink-60)';
                          }
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                        {isLocked && <LockIcon className="ml-auto h-3.5 w-3.5" style={{ color: 'var(--bb-ink-40)' }} />}
                        {showBadge && !isLocked && (
                          <span
                            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ background: '#F59E0B' }}
                          >
                            {billingAlertCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <SidebarHelpSection />
              <SidebarFeedback />
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside
              className="fixed left-0 top-0 bottom-0 w-64 shadow-xl"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <div
                className="flex h-14 flex-col justify-center px-6"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <BlackBeltLogo variant="navbar" mode="dark" height={28} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Academia Admin
                </span>
              </div>
              <nav aria-label="Menu principal" className="overflow-y-auto p-3">
                {sidebarGroups.map((group, gi) => (
                  <div key={group.label}>
                    <p
                      className="uppercase tracking-widest font-semibold"
                      style={{
                        fontSize: '10px',
                        color: 'var(--bb-ink-30)',
                        marginBottom: '4px',
                        marginTop: gi === 0 ? '0' : '16px',
                        paddingLeft: '16px',
                      }}
                    >
                      {group.label}
                    </p>
                    <div className="flex flex-col gap-[2px]">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                        const showBadge = item.href === '/admin/plano' && billingAlertCount > 0;
                        const moduleForLink = PAGE_MODULE_MAP[item.href];
                        const isLocked = moduleForLink ? !hasAccess(moduleForLink) : false;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            id={item.id}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 text-sm transition-colors"
                            style={{
                              padding: '10px 16px',
                              borderRadius: 'var(--bb-radius-sm)',
                              opacity: isLocked ? 0.5 : 1,
                              ...(isActive
                                ? {
                                    background: 'var(--bb-brand-surface)',
                                    color: 'var(--bb-brand)',
                                    fontWeight: 600,
                                  }
                                : {
                                    color: 'var(--bb-ink-60)',
                                  }),
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'var(--bb-depth-4)';
                                e.currentTarget.style.color = 'var(--bb-ink-80)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--bb-ink-60)';
                              }
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                            {isLocked && <LockIcon className="ml-auto h-3.5 w-3.5" style={{ color: 'var(--bb-ink-40)' }} />}
                            {showBadge && !isLocked && (
                              <span
                                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ background: '#F59E0B' }}
                              >
                                {billingAlertCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <SidebarHelpSection onItemClick={() => setSidebarOpen(false)} />
                <SidebarFeedback />
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <header
            className="sticky top-0 z-20 flex h-14 items-center justify-between px-4"
            style={{
              background: 'var(--bb-depth-2)',
              borderBottom: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--bb-ink-60)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar (Cmd+K)"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <BetaBadge />
              <ThemeToggle />

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  onClick={() => {
                    setUserMenuOpen((prev) => !prev);
                  }}
                  aria-label="Menu do usuário"
                  className="flex h-9 w-9 items-center justify-center cursor-pointer"
                >
                  <Avatar name={userName} size="sm" />
                </button>

                {userMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      boxShadow: 'var(--bb-shadow-lg)',
                      borderRadius: 'var(--bb-radius-lg)',
                      animation: 'scaleIn 0.15s ease-out',
                      transformOrigin: 'top right',
                    }}
                  >
                    {/* User info */}
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {userName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {profile?.role === 'admin' ? 'Administrador' : userRole}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/admin/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <UserIcon className="h-4 w-4" />
                        Meu perfil
                      </Link>
                      <Link
                        href="/admin/plano"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <StarIcon className="h-4 w-4" />
                        Meu Plano
                      </Link>
                      <Link
                        href="/admin/configuracoes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bb-depth-4)]"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bb-ink-80)';
                        }}
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Configurações
                      </Link>
                    </div>

                    {/* Profile Switcher */}
                    <ProfileSwitcher onSwitch={() => setUserMenuOpen(false)} />

                    {/* Separator + Switch Account + Logout */}
                    <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                      <button
                        onClick={() => { setUserMenuOpen(false); sessionStorage.setItem('bb_profile_switch', '1'); window.location.href = '/selecionar-perfil'; }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-ink-80)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <UsersIcon className="h-4 w-4" />
                        Trocar Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--bb-danger, var(--bb-brand))' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="flex-1" style={{ background: 'var(--bb-depth-1)' }}>
            {isTrial && <TrialBanner daysLeft={trialDaysLeft} />}
            {isDiscovery && <DiscoveryBanner daysLeft={discoveryDaysLeft} variant="admin" />}
            <main>{children}</main>
            <LegalFooter />
          </div>
        </div>

        {/* Command Palette (Search) */}
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} hideToggle />
      </div>
      </div>
    );
  },
);

AdminShell.displayName = 'AdminShell';

export { AdminShell };
