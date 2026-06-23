import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizationMembers } from '../../services/api';
import { getActiveOrganizationId } from '../../services/workspaceStorage';
import { OrganizationMember } from '../../types/member';
import { clearToken } from '../../services/authStorage';
import styles from './Members.module.css';
import { AppLayout } from '../../components/AppLayout/AppLayout';

export function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const activeOrganizationId = getActiveOrganizationId();

  const handleLogout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      if (!activeOrganizationId) {
        if (isMounted) setLoading(false);
        return;
      }
      
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        const res = await getOrganizationMembers(activeOrganizationId);
        if (isMounted) {
          setMembers(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof Error && err.message.includes('WorkspaceAccessError')) {
            setError('You no longer have access to this workspace.');
          } else {
            setError('Unable to load organization members.');
          }
          if (err instanceof Error && err.message.includes('401')) {
            handleLogout();
          }
          setLoading(false);
        }
      }
    };
    
    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [activeOrganizationId, handleLogout]);

  return (
    <AppLayout activePage="members">

      <div className={styles.main}>
        {!activeOrganizationId ? (
          <div className={styles.emptyState}>No active organization selected.</div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : loading ? (
          <div className={styles.loadingState}>Loading members...</div>
        ) : members.length === 0 ? (
          <div className={styles.emptyState}>No members found.</div>
        ) : (
          <div className={styles.grid}>
            {members.map(member => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberName}>{member.name || member.email || `User ID: ${member.user_id}`}</div>
                <div className={styles.memberEmail}>{member.email || 'No email provided'} &bull; Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
                <div className={`${styles.memberRole} ${styles[`role${member.role}`] || ''}`}>
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
