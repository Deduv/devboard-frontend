import { useEffect, useState, useCallback, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizationInvites, createOrganizationInvite, revokeOrganizationInvite } from '../../services/api';
import { getActiveOrganizationId } from '../../services/workspaceStorage';
import { OrganizationInvite } from '../../types/invite';
import { OrganizationRole } from '../../types/member';
import { Button } from '../../components/Button/Button';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';
import { clearToken } from '../../services/authStorage';
import styles from './Invitations.module.css';

export function Invitations() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<OrganizationRole>('MEMBER');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<number | null>(null);

  const activeOrganizationId = getActiveOrganizationId();
  const listRequestIdRef = useRef(0);

  const handleLogout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  const fetchInvites = useCallback(async () => {
    if (!activeOrganizationId) {
      setLoading(false);
      return;
    }
    
    const requestId = ++listRequestIdRef.current;
    
    try {
      setLoading(true);
      setError(null);
      const res = await getOrganizationInvites(activeOrganizationId);
      if (requestId === listRequestIdRef.current) {
        setInvites(res.data);
      }
    } catch (err) {
      if (requestId === listRequestIdRef.current) {
        if (err instanceof Error && err.message.includes('WorkspaceAccessError')) {
          setError('You no longer have access to this workspace.');
        } else {
          setError('Unable to load invitations.');
        }
        if (err instanceof Error && err.message.includes('401')) {
          handleLogout();
        }
      }
    } finally {
      if (requestId === listRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [activeOrganizationId, handleLogout]);

  useEffect(() => {
    fetchInvites();
    
    return () => {
      listRequestIdRef.current += 1;
    };
  }, [fetchInvites]);

  const handleCreateInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeOrganizationId) return;
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await createOrganizationInvite(activeOrganizationId, newEmail, newRole);
      setNewEmail('');
      setNewRole('MEMBER');
      await fetchInvites();
    } catch (err) {
      if (err instanceof Error && err.message.includes('WorkspaceAccessError: 403')) {
        setFormError('You do not have permission to perform this action.');
      } else if (err instanceof Error && err.message.includes('WorkspaceAccessError: 404')) {
        setFormError('Workspace or invitation not found.');
      } else {
        setFormError('Unable to create invite. Check if email is valid and not already invited.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId: number) => {
    if (!activeOrganizationId) return;
    
    setRevokingInviteId(inviteId);
    setFormError(null);
    
    try {
      await revokeOrganizationInvite(activeOrganizationId, inviteId);
      await fetchInvites();
    } catch (err) {
      if (err instanceof Error && err.message.includes('WorkspaceAccessError: 403')) {
        setFormError('You do not have permission to perform this action.');
      } else if (err instanceof Error && err.message.includes('WorkspaceAccessError: 404')) {
        setFormError('Workspace or invitation not found.');
      } else {
        setFormError('Unable to revoke invite. Please try again later.');
      }
    } finally {
      setRevokingInviteId(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate('/members')}>
            Members
          </Button>
          Invitations
        </h1>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className={styles.main}>
        {!activeOrganizationId ? (
          <div className={styles.emptyState}>No active organization selected.</div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <>
            <div className={styles.formContainer}>
              <form className={styles.form} onSubmit={handleCreateInvite}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    className={styles.select}
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as OrganizationRole)}
                    disabled={isSubmitting}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>
                <Button type="submit" variant="primary" disabled={isSubmitting || !newEmail}>
                  Invite
                </Button>
              </form>
              {formError && <div className={styles.formError}>{formError}</div>}
            </div>

            {loading ? (
              <div className={styles.loadingState}>Loading invitations...</div>
            ) : invites.length === 0 ? (
              <div className={styles.emptyState}>No invitations found.</div>
            ) : (
              <div className={styles.grid}>
                {invites.map(invite => (
                  <div key={invite.id} className={styles.inviteCard}>
                    <div className={styles.inviteEmail}>{invite.email}</div>
                    <div className={styles.inviteMeta}>
                      Created: {new Date(invite.created_at).toLocaleDateString()}
                    </div>
                    <div className={styles.badgeRow}>
                      <div className={styles.badges}>
                        <div className={`${styles.badge} ${styles[`badge${invite.role}`] || ''}`}>
                          {invite.role}
                        </div>
                        <div className={`${styles.badge} ${styles[`status${invite.status}`] || ''}`}>
                          {invite.status}
                        </div>
                      </div>
                      {invite.status === 'PENDING' && (
                        <Button 
                          variant="secondary" 
                          onClick={() => handleRevoke(invite.id)}
                          disabled={revokingInviteId === invite.id}
                        >
                          {revokingInviteId === invite.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
