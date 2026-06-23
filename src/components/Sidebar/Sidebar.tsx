import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../../services/authStorage';
import { Button } from '../Button/Button';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activePage: 'dashboard' | 'members' | 'invitations' | 'admin';
  onDashboardClick?: () => void;
  onNewClick?: () => void;
  workspaceSelector?: React.ReactNode;
}

const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
  ),
  members: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  invitations: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
  ),
  admin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  ),
  collapse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  ),
  expand: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  )
};

export function Sidebar({ activePage, onDashboardClick, onNewClick, workspaceSelector }: SidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <button 
        className={styles.collapseToggle} 
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? ICONS.expand : ICONS.collapse}
      </button>

      <div className={styles.brandArea}>
        <h1 className={styles.brandName}>{isCollapsed ? 'm' : 'mutum'}</h1>
        {!isCollapsed && <p className={styles.tagline}>ORGANIZE. PLAN. EVOLVE.</p>}
      </div>

      <nav className={styles.nav}>
        <button 
          className={`${styles.navItem} ${activePage === 'dashboard' ? styles.active : ''}`}
          onClick={() => {
            if (activePage === 'dashboard' && onDashboardClick) onDashboardClick();
            else navigate('/dashboard');
          }}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <span className={styles.icon}>{ICONS.dashboard}</span>
          {!isCollapsed && <span className={styles.label}>Dashboard</span>}
        </button>
        <button 
          className={`${styles.navItem} ${activePage === 'members' ? styles.active : ''}`}
          onClick={() => navigate('/members')}
          title={isCollapsed ? "Members" : undefined}
        >
          <span className={styles.icon}>{ICONS.members}</span>
          {!isCollapsed && <span className={styles.label}>Members</span>}
        </button>
        <button 
          className={`${styles.navItem} ${activePage === 'invitations' ? styles.active : ''}`}
          onClick={() => navigate('/invitations')}
          title={isCollapsed ? "Invitations" : undefined}
        >
          <span className={styles.icon}>{ICONS.invitations}</span>
          {!isCollapsed && <span className={styles.label}>Invitations</span>}
        </button>
        <button 
          className={`${styles.navItem} ${activePage === 'admin' ? styles.active : ''}`}
          onClick={() => navigate('/admin/users')}
          title={isCollapsed ? "Admin Users" : undefined}
        >
          <span className={styles.icon}>{ICONS.admin}</span>
          {!isCollapsed && <span className={styles.label}>Admin</span>}
        </button>
      </nav>

      {(workspaceSelector || onNewClick) && (
        <div className={styles.workspacesSection}>
          {!isCollapsed && <h2 className={styles.sectionLabel}>WORKSPACES</h2>}
          
          {!isCollapsed && workspaceSelector && (
            <div className={styles.workspaceArea}>
              {workspaceSelector}
            </div>
          )}

          {onNewClick && (
            <div className={styles.newActionArea}>
              <Button variant="primary" onClick={onNewClick} className={styles.newButton} title={isCollapsed ? "New Project/Task" : undefined}>
                {isCollapsed ? '+' : '+ New'}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={handleLogout} title={isCollapsed ? "Logout" : undefined}>
          <span className={styles.icon}>{ICONS.logout}</span>
          {!isCollapsed && <span className={styles.label}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
