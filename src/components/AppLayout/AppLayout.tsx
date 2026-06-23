import { Sidebar } from '../Sidebar/Sidebar';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  activePage: 'dashboard' | 'members' | 'invitations' | 'admin';
  onDashboardClick?: () => void;
  onNewClick?: () => void;
  workspaceSelector?: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ activePage, onDashboardClick, onNewClick, workspaceSelector, children }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar 
        activePage={activePage}
        onDashboardClick={onDashboardClick}
        onNewClick={onNewClick}
        workspaceSelector={workspaceSelector}
      />
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
