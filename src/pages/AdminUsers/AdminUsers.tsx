import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingUsers, approveUser } from '../../services/api';
import { User } from '../../types/user';
import { Button } from '../../components/Button/Button';
import { clearToken } from '../../services/authStorage';
import styles from './AdminUsers.module.css';
import { AppLayout } from '../../components/AppLayout/AppLayout';
export function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<number | null>(null);

  const listRequestIdRef = useRef(0);

  const handleLogout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    const requestId = ++listRequestIdRef.current;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await getPendingUsers();
      if (requestId === listRequestIdRef.current) {
        setUsers(res.data);
      }
    } catch (err) {
      if (requestId === listRequestIdRef.current) {
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            setError('Sessão expirada. Faça login novamente.');
            handleLogout();
          } else if (err.message.includes('403')) {
            setError('Você não tem permissão ou ainda não foi aprovado.');
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            setError('Backend indisponível. Verifique sua conexão.');
          } else {
            setError('Não foi possível carregar os usuários pendentes.');
          }
        } else {
          setError('Não foi possível carregar os usuários pendentes.');
        }
      }
    } finally {
      if (requestId === listRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUsers();
    return () => {
      listRequestIdRef.current += 1;
    };
  }, [fetchUsers]);

  const handleApprove = async (userId: number) => {
    setApprovingUserId(userId);
    setError(null);
    setSuccess(null);
    
    try {
      await approveUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess('User approved successfully.');
    } catch (err) {
      if (err instanceof Error && err.message.includes('AdminAccessError: 403')) {
        setError('You do not have permission to access this page.');
      } else if (err instanceof Error && err.message.includes('AdminAccessError: 404')) {
        setError('User no longer pending or not found.');
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        setError('Failed to approve user.');
      }
    } finally {
      setApprovingUserId(null);
    }
  };

  return (
    <AppLayout activePage="admin">

      <div className={styles.main}>
        {success && <div className={styles.successMessage}>{success}</div>}
        {error ? (
          <div className={styles.errorState}>{error}</div>
        ) : loading ? (
          <div className={styles.loadingState}>Loading pending users...</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>✓</div>
            <h3>All Caught Up!</h3>
            <p>No pending users waiting for approval.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {users.map(user => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userName}>{user.name || 'No Name'}</div>
                <div className={styles.userEmail}>{user.email}</div>
                <div className={styles.userMeta}>
                  Registered: {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className={styles.badgeRow}>
                  <div className={`${styles.badge} ${styles[`status${user.status}`] || ''}`}>
                    {user.status}
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => handleApprove(user.id)}
                    disabled={approvingUserId === user.id}
                  >
                    {approvingUserId === user.id ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
