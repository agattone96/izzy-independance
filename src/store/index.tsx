import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Family, Task, TaskCompletion, Reward, RewardRequest, Invite, HistoryLog, BoundaryRule, UserRole
} from '../types/domain.types';
import { auth, db } from '../firebase';
import { BOUNDARY_RULES, SEED_TASKS, SEED_REWARDS } from '../data/seedData';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { OperationType, handleFirestoreError, handleAuthError } from '../services/firebaseError';
import { 
  calculatePointsMetrics } from '../utils/metrics';
import { validateAndParseCSVTasks, validateAndParseCSVRewards } from '../utils/csvValidator';

interface BoardContextType {
  authenticatedUser: User | null; // Real logged-in auth user
  currentUser: User | null;       // Active viewed profile
  setCurrentUser: (user: User | null) => void;
  isAuthReady: boolean;
  family: Family | null;
  users: User[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  rewardRequests: RewardRequest[];
  invites: Invite[];
  logs: HistoryLog[];
  boundaryRules: BoundaryRule[];
  
  // Auth & Profile Actions
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  handlePhoneSignIn: (phoneNumber: string, recaptchaVerifier: any) => Promise<void>;
  registerNewFamily: (parentName: string, email: string, pass: string, familyName: string, timezone: string) => Promise<void>;
  claimInviteWithAccount: (code: string, email: string, pass: string, displayName?: string) => Promise<User>;
  getInviteInfo: (code: string) => Promise<{ name: string; role: UserRole; familyName: string } | null>;
  initializeGoogleOrMagicLinkFamily: (parentName: string, familyName: string, timezone: string) => Promise<void>;
  loginAsUser: (userId: string) => void;
  createNewUser: (name: string, role: UserRole, pin?: string) => Promise<User>;
  switchProfile: (userId: string) => void;
  logout: () => void;
  inviteUser: (role: UserRole, name: string) => Promise<string>;

  // Task Actions
  completeTaskByChild: (taskId: string, childId: string, checklistState?: { [key: number]: boolean }) => Promise<void>;
  reviewTaskByParent: (completionId: string, status: 'approved' | 'needs_fix', feedback?: string) => Promise<void>;
  fixTaskByChild: (completionId: string) => Promise<void>;
  addNewTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (taskId: string, updated: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Reward Actions
  requestRewardByChild: (rewardId: string, childId: string) => Promise<{ success: boolean; message: string }>;
  processRewardRequestByParent: (requestId: string, status: 'approved' | 'denied' | 'used', feedback?: string) => Promise<void>;
  addNewReward: (reward: Omit<Reward, 'id' | 'createdAt'>) => Promise<void>;
  updateReward: (rewardId: string, updated: Partial<Reward>) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;

  // CSV Imports
  importCSVTasks: (importedTasks: Array<Partial<Task>>, mode: 'overwrite' | 'update') => Promise<{ importedCount: number; errors: string[] }>;
  importCSVRewards: (importedRewards: Array<Partial<Reward>>, mode: 'overwrite' | 'update') => Promise<{ importedCount: number; errors: string[] }>;

  // Calculus Metrics
  getPointsMetrics: (childId: string) => {
    lifetimePoints: number;
    rewardBankBalance: number;
  };

  // General Operations
  updateFamilySettings: (settings: { familyName: string; timezone?: string }) => Promise<void>;
  updateUserProfile: (userId: string, updates: { name?: string; avatar?: string; age?: number; ageGroup?: 'toddler' | 'preschool' | 'elementary' | 'teen'; pin?: string }) => Promise<void>;
  resetAllData: () => void;
  // Caregiver / Visit Mode Actions
  toggleVisitMode: () => Promise<void>;
  updateParentInstructions: (instructions: { allergies: string; bedtime: string; emergencyContacts: string; customNotes?: string }) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const SEED_FAMILY_ID = "fam_izzy_independence";

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [logs, setLogs] = useState<HistoryLog[]>([]);

  // Firebase Realtime Snapshots setup
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    // Handle Magic Link finishing
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
            console.error("Error signing in with magic link", error);
          });
      }
    }

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      // Clear previous snapshot listeners
      unsubs.forEach(unsub => unsub());
      unsubs = [];

      if (fbUser) {
        // Dynamic live listener on users/{uid} flat metadata doc
        const unsubUserDoc = onSnapshot(doc(db, 'users', fbUser.uid), (userDocSnap) => {
          // Whenever the flat user doc changes, we clear previous subcollection listeners
          // but we retain the unsubUserDoc listener itself (which is at index 0 of unsubs)
          const keepUserDocListener = unsubs[0];
          unsubs.slice(1).forEach(unsub => unsub());
          unsubs = keepUserDocListener ? [keepUserDocListener] : [];

          if (userDocSnap.exists()) {
            const userMapping = userDocSnap.data();
            const famId = userMapping.familyId;

            if (famId) {
              // 1. Family Document listener
              const unsubFamily = onSnapshot(doc(db, 'families', famId), (snap) => {
                if (snap.exists()) {
                  setFamily({ id: snap.id, ...snap.data() } as Family);
                }
              }, (err) => handleFirestoreError(err, OperationType.GET, `families/${famId}`));
              unsubs.push(unsubFamily);

              // 2. Users Subcollection listener
              const unsubUsers = onSnapshot(collection(db, 'families', famId, 'users'), (snap) => {
                const list: User[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as User);
                });
                setUsers(list);

                // Setup authenticatedUser state
                const authProfile = list.find(u => u.id === fbUser.uid);
                if (authProfile) {
                  setAuthenticatedUser(authProfile);
                  setCurrentUser(prev => {
                    const exists = list.some(u => u.id === prev?.id);
                    return exists ? prev : authProfile;
                  });
                }
                setIsAuthReady(true);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/users`));
              unsubs.push(unsubUsers);

              // 3. Tasks Subcollection listener
              const unsubTasks = onSnapshot(query(collection(db, 'families', famId, 'tasks'), orderBy('sortOrder', 'asc')), (snap) => {
                const list: Task[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as Task);
                });
                setTasks(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/tasks`));
              unsubs.push(unsubTasks);

              // 4. Completions Subcollection listener
              const unsubCompletions = onSnapshot(collection(db, 'families', famId, 'completions'), (snap) => {
                const list: TaskCompletion[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as TaskCompletion);
                });
                setCompletions(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/completions`));
              unsubs.push(unsubCompletions);

              // 5. Rewards Subcollection listener
              const unsubRewards = onSnapshot(query(collection(db, 'families', famId, 'rewards'), orderBy('sortOrder', 'asc')), (snap) => {
                const list: Reward[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as Reward);
                });
                setRewards(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/rewards`));
              unsubs.push(unsubRewards);

              // 6. RewardRequests Subcollection listener
              const unsubRequests = onSnapshot(collection(db, 'families', famId, 'rewardRequests'), (snap) => {
                const list: RewardRequest[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as RewardRequest);
                });
                setRewardRequests(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/rewardRequests`));
              unsubs.push(unsubRequests);

              // 7. Global Invites listener
              const unsubInvites = onSnapshot(query(collection(db, 'invites'), where('familyId', '==', famId)), (snap) => {
                const list: Invite[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as Invite);
                });
                setInvites(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, 'invites'));
              unsubs.push(unsubInvites);

              // 8. Logs
              const unsubLogs = onSnapshot(query(collection(db, 'families', famId, 'logs'), orderBy('timestamp', 'desc')), (snap) => {
                const list: HistoryLog[] = [];
                snap.forEach(d => {
                  list.push({ id: d.id, ...d.data() } as HistoryLog);
                });
                setLogs(list);
              }, (err) => handleFirestoreError(err, OperationType.LIST, `families/${famId}/logs`));
              unsubs.push(unsubLogs);

            } else {
              // Sign-in active but no familyId inside userDoc (setup needed)
              setAuthenticatedUser({
                id: fbUser.uid,
                name: fbUser.displayName || 'Google Parent',
                role: 'parent',
                avatar: '👩‍💼',
                email: fbUser.email || undefined,
                familyId: '',
                createdAt: new Date().toISOString()
              });
              setCurrentUser({
                id: fbUser.uid,
                name: fbUser.displayName || 'Google Parent',
                role: 'parent',
                avatar: '👩‍💼',
                email: fbUser.email || undefined,
                familyId: '',
                createdAt: new Date().toISOString()
              });
              setIsAuthReady(true);
            }
          } else {
            // New Google/Magic-link User with no `/users/{uid}` flat mapping doc yet
            setAuthenticatedUser({
              id: fbUser.uid,
              name: fbUser.displayName || 'Google Parent',
              role: 'parent',
              avatar: '👩‍💼',
              email: fbUser.email || undefined,
              familyId: '',
              createdAt: new Date().toISOString()
            });
            setCurrentUser({
              id: fbUser.uid,
              name: fbUser.displayName || 'Google Parent',
              role: 'parent',
              avatar: '👩‍💼',
              email: fbUser.email || undefined,
              familyId: '',
              createdAt: new Date().toISOString()
            });
            setIsAuthReady(true);
          }
        }, (err) => {
          console.error("Live user doc mapping listener not successful: ", err);
          setIsAuthReady(true);
        });

        // Store the user doc listener as the very first element (index 0)
        unsubs.push(unsubUserDoc);
      } else {
        setAuthenticatedUser(null);
        setCurrentUser(null);
        setFamily(null);
        setUsers([]);
        setTasks([]);
        setCompletions([]);
        setRewards([]);
        setRewardRequests([]);
        setInvites([]);
        setLogs([]);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Auth operations
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      handleAuthError(err, 'login-with-email');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      handleAuthError(err, 'login-with-google');
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      handleAuthError(err, 'send-password-reset');
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
    } catch (err) {
      handleAuthError(err, 'send-magic-link');
    }
  };

  const handleGoogleSignIn = async () => {
    return loginWithGoogle();
  };

  const handlePhoneSignIn = async (phoneNumber: string, recaptchaVerifier: any) => {
    // Phone auth requires specific setup not available in this environment. 
    console.log("Phone sign-in initiated for", phoneNumber);
    throw new Error("Phone sign-in is not configured in this environment.");
  };

  const registerNewFamily = async (parentName: string, email: string, pass: string, familyName: string, timezone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication failed");
      const uid = user.uid;
      const famId = `fam_${Date.now()}`;
      const nowIso = new Date().toISOString();

      // 1. Create family document
      const familyRef = doc(db, 'families', famId);
      await setDoc(familyRef, {
        id: famId,
        name: familyName,
        timezone: timezone,
        createdAt: nowIso,
        isActiveVisit: false,
        parentInstructions: {
          allergies: "No known food allergies. Only wholesome, high-quality ingredients.",
          bedtime: "8:30 PM",
          emergencyContacts: "911, Mom: (555) 019-2834"
        }
      });

      // 2. Create parent user inside family
      const parentUser: User = {
        id: uid,
        name: parentName,
        role: 'parent',
        avatar: '👩',
        email,
        familyId: famId,
        createdAt: nowIso
      };
      await setDoc(doc(db, 'families', famId, 'users', uid), parentUser);

      // 3. Create flat look up
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        familyId: famId,
        role: 'parent',
        name: parentName
      });

      // 4. Batch seed standard tasks and rewards
      const batch = writeBatch(db);
      SEED_TASKS.forEach((t) => {
        batch.set(doc(db, 'families', famId, 'tasks', t.id), t);
      });
      SEED_REWARDS.forEach((r) => {
        batch.set(doc(db, 'families', famId, 'rewards', r.id), r);
      });
      
      const logId = `log_${Date.now()}`;
      batch.set(doc(db, 'families', famId, 'logs', logId), {
        id: logId,
        familyId: famId,
        userId: 'system',
        userName: 'System',
        actionType: 'settings_updated',
        description: `Izzy's Independence Board initialized for ${familyName} with standard chores and rewards levels.`,
        timestamp: new Date().toISOString()
      });

      await batch.commit();
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      if (err?.code === 'auth/operation-not-allowed') {
         throw new Error("Firebase sign-in provider is disabled. Please enable it in the Firebase Console.");
      }
      handleFirestoreError(err, OperationType.WRITE, 'families');
    }
  };

  const claimInviteWithAccount = async (code: string, email: string, pass: string, displayName?: string): Promise<User> => {
    try {
      const inviteDocRef = doc(db, 'invites', code.toUpperCase());
      const inviteDoc = await getDoc(inviteDocRef);
      if (!inviteDoc.exists() || !inviteDoc.data().active) {
        throw new Error("Invalid or already claimed invite.");
      }
      const invite = inviteDoc.data() as Invite;

      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication failed");
      const uid = user.uid;
      const famId = invite.familyId;

      // Use provided name or fallback to invite name
      const finalName = displayName || invite.name;

      // 1. Deactivate invite and bind to claimant's UID
      await updateDoc(doc(db, 'invites', inviteDoc.id), {
        active: false,
        claimedByUid: uid,
        claimedAt: new Date().toISOString()
      });

      // 2. Create user inside family subcollection
      const newUser: User = {
        id: uid,
        name: finalName,
        role: invite.role,
        avatar: invite.role === 'parent' ? '👩‍💼' : invite.role === 'caregiver' ? '🧑‍⚕️' : '👧',
        email,
        familyId: famId,
        createdAt: new Date().toISOString(),
        inviteId: inviteDoc.id
      };
      await setDoc(doc(db, 'families', famId, 'users', uid), newUser);

      // 3. Create flat mapping lookup
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        familyId: famId,
        role: invite.role,
        name: finalName,
        inviteId: inviteDoc.id
      });

      // 4. Log the action
      const logId = `log_${Date.now()}`;
      await setDoc(doc(db, 'families', famId, 'logs', logId), {
        id: logId,
        familyId: famId,
        userId: uid,
        userName: finalName,
        actionType: 'settings_updated',
        description: `${finalName} joined family group as ${invite.role} via secure invite link.`,
        timestamp: new Date().toISOString()
      });

      return newUser;
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
         throw new Error("Firebase sign-in provider is disabled. Please enable it in the Firebase Console.");
      }
      handleFirestoreError(err, OperationType.WRITE, 'invites');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthenticatedUser(null);
      setCurrentUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'auth/signout');
    }
  };

  // Switch profiles is only allowed visually for authenticated Parents
  const switchProfile = (userId: string) => {
    if (!authenticatedUser || authenticatedUser.role !== 'parent') {
      alert("This area is for adults.");
      return;
    }
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const loginAsUser = (userId: string) => {
    switchProfile(userId);
  };

  // Create user (Mock local wrapper - actual should join via invite, but let's make it create inside Firestore if family is loaded)
  const createNewUser = async (name: string, role: 'parent' | 'child', pin?: string): Promise<User> => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') {
      throw new Error("Unauthorized operation: Only parents can create new users inside the family.");
    }

    const fallbackId = `user_${Date.now()}`;
    const mockUser: User = {
      id: fallbackId,
      name,
      role,
      avatar: role === 'parent' ? "👩‍💼" : "👧",
      pin,
      familyId: family?.id || SEED_FAMILY_ID,
      createdAt: new Date().toISOString()
    };
    if (family) {
      // Just set in firestore
      await setDoc(doc(db, 'families', family.id, 'users', fallbackId), mockUser);
    }
    return mockUser;
  };

  const inviteUser = async (role: UserRole, name: string): Promise<string> => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return '';
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = code;

    const newInvite: Invite = {
      id,
      familyId: family.id,
      role,
      name,
      code,
      active: true,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'invites', id), newInvite);
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Generated invite link (${code}) for prospective ${role} "${name}"`);
      return code;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'invites');
      return '';
    }
  };

  const getInviteInfo = async (code: string) => {
    const inviteDocRef = doc(db, 'invites', code.toUpperCase());
    const inviteDoc = await getDoc(inviteDocRef);
    if (!inviteDoc.exists() || !inviteDoc.data().active) {
      return null;
    }
    const invite = inviteDoc.data() as Invite;
    const familyDoc = await getDoc(doc(db, 'families', invite.familyId));
    const familyName = familyDoc.exists() ? familyDoc.data().name : 'Unknown Family';
    return { name: invite.name, role: invite.role, familyName };
  };

  const initializeGoogleOrMagicLinkFamily = async (parentName: string, familyName: string, timezone: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No active authenticated session found.");
      const uid = user.uid;
      const email = user.email || '';
      const famId = `fam_${Date.now()}`;
      const nowIso = new Date().toISOString();

      // 1. Create family document
      const familyRef = doc(db, 'families', famId);
      await setDoc(familyRef, {
        id: famId,
        name: familyName,
        timezone: timezone,
        createdAt: nowIso,
        isActiveVisit: false,
        parentInstructions: {
          allergies: "No known food allergies. Only wholesome, high-quality ingredients.",
          bedtime: "8:30 PM",
          emergencyContacts: "911, Mom: (555) 019-2834"
        }
      });

      // 2. Create parent user inside family
      const parentUser: User = {
        id: uid,
        name: parentName,
        role: 'parent',
        avatar: '👩',
        email,
        familyId: famId,
        createdAt: nowIso
      };
      await setDoc(doc(db, 'families', famId, 'users', uid), parentUser);

      // 3. Create flat lookup doc
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        familyId: famId,
        role: 'parent',
        name: parentName
      });

      // 4. Batch seed standard tasks and rewards
      const batch = writeBatch(db);
      SEED_TASKS.forEach((t) => {
        batch.set(doc(db, 'families', famId, 'tasks', t.id), t);
      });
      SEED_REWARDS.forEach((r) => {
        batch.set(doc(db, 'families', famId, 'rewards', r.id), r);
      });
      
      const logId = `log_${Date.now()}`;
      batch.set(doc(db, 'families', famId, 'logs', logId), {
        id: logId,
        familyId: famId,
        userId: 'system',
        userName: 'System',
        actionType: 'settings_updated',
        description: `Izzy's Independence Board initialized for ${familyName} with standard chores and rewards levels.`,
        timestamp: new Date().toISOString()
      });

      await batch.commit();
    } catch (err: any) {
      handleAuthError(err, 'initialize-google-family');
    }
  };

  // Helper dynamic logarithmic writer
  const addLog = async (
    userId: string, 
    userName: string, 
    actionType: HistoryLog['actionType'], 
    description: string,
    details?: string
  ) => {
    if (!family) return;
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2,5)}`;
    const newLog: HistoryLog = {
      id: logId,
      familyId: family.id,
      userId,
      userName,
      actionType,
      description,
      details: details || '',
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'families', family.id, 'logs', logId), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/logs`);
    }
  };

  // Chores/Task Actions
  const completeTaskByChild = async (taskId: string, childId: string, checklistState?: { [key: number]: boolean }) => {
    if (!family || !authenticatedUser) return;

    // Role-based Access Control: child can only complete their own tasks (uniquely keyed to their authenticated Firebase UID)
    if (authenticatedUser.role === 'child' && childId !== authenticatedUser.id) {
      throw new Error("Unauthorized operation: Children can only complete tasks for their own profiles.");
    }

    const task = tasks.find(t => t.id === taskId);
    const child = users.find(u => u.id === childId);
    if (!task || !child) return;

    // Check if progress already recorded for today (prevent duplicates)
    const todayStr = new Date().toISOString().split('T')[0];
    const alreadyCompleted = completions.some(c => 
      c.taskId === taskId && 
      c.childId === childId && 
      c.completedAt.startsWith(todayStr) &&
      c.status !== 'needs_fix'
    );

    if (alreadyCompleted) return;

    const defaultCheckstate: { [key: number]: boolean } = {};
    task.checklistItems.forEach((_, i) => {
      defaultCheckstate[i] = true;
    });

    const completionId = `comp_${Date.now()}`;
    const newCompletion: TaskCompletion = {
      id: completionId,
      taskId,
      taskKey: task.key,
      childId,
      childName: child.name,
      completedAt: new Date().toISOString(),
      pointsEarned: task.pointValue,
      status: 'pending_review',
      checklistState: checklistState || defaultCheckstate
    };

    try {
      await setDoc(doc(db, 'families', family.id, 'completions', completionId), newCompletion);
      if (authenticatedUser.role === 'caregiver') {
        await addLog(authenticatedUser.id, authenticatedUser.name, "task_completed", `Logged visit task "${task.title}" on behalf of ${child.name}. Sent for parent approval.`);
      } else {
        await addLog(childId, child.name, "task_completed", `Completed task "${task.title}" earning ${task.pointValue} pt`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/completions`);
    }
  };

  const reviewTaskByParent = async (completionId: string, status: 'approved' | 'needs_fix', feedback?: string) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const completion = completions.find(c => c.id === completionId);
    if (!completion) return;

    const action: HistoryLog['actionType'] = status === 'approved' ? 'task_approved' : 'task_needs_fix';
    const pointsAwardText = status === 'approved' ? 'points approved' : `flagged Needs-a-fix: ${feedback || ''}`;

    try {
      await updateDoc(doc(db, 'families', family.id, 'completions', completionId), {
        status,
        parentFeedback: feedback || ''
      });

      await addLog(
        authenticatedUser.id, 
        authenticatedUser.name, 
        action, 
        `Reviewed ${completion.childName}'s "${completion.taskKey}" task: ${pointsAwardText}`,
        feedback
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/completions`);
    }
  };

  const fixTaskByChild = async (completionId: string) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'child') return;
    const c = completions.find(comp => comp.id === completionId);
    if (!c) return;

    // Role-based Access Control: child can only fix their own task completion (uniquely keyed to their authenticated Firebase UID)
    if (c.childId !== authenticatedUser.id) {
      throw new Error("Unauthorized operation: Children can only fix their own task completions.");
    }

    const parentTask = tasks.find(t => t.id === c.taskId || t.key === c.taskKey);
    const restoredBonus = 0; // Bonus minutes deprecated

    try {
      await updateDoc(doc(db, 'families', family.id, 'completions', completionId), {
        status: 'pending_review',
        parentFeedback: ''
      });

      await addLog(authenticatedUser.id, authenticatedUser.name, "task_completed", `Fixed Needs-a-fix chore on "${parentTask?.title || c.taskKey}". Flag cleared.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/completions`);
    }
  };

  const addNewTask = async (newTaskProps: Omit<Task, 'id' | 'createdAt'>) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      ...newTaskProps,
      id: taskId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'families', family.id, 'tasks', taskId), newTask);
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Created task/chore layout: "${newTask.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/tasks`);
    }
  };

  const updateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    try {
      await updateDoc(doc(db, 'families', family.id, 'tasks', taskId), updatedFields);
      const target = tasks.find(t => t.id === taskId);
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Updated configuration for task: "${target?.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/tasks`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const target = tasks.find(t => t.id === taskId);
    try {
      await deleteDoc(doc(db, 'families', family.id, 'tasks', taskId));
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Deleted chore: "${target?.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/tasks`);
    }
  };

  // Reward Operations
  const requestRewardByChild = async (rewardId: string, childId: string): Promise<{ success: boolean; message: string }> => {
    if (!family || !authenticatedUser) return { success: false, message: "No family group loaded." };

    // Role-based Access Control: child can only request rewards for themselves (uniquely keyed to their authenticated Firebase UID)
    if (authenticatedUser.role === 'child' && childId !== authenticatedUser.id) {
      return { success: false, message: "Unauthorized operation: Children can only request rewards for their own profiles." };
    }

    const reward = rewards.find(r => r.id === rewardId);
    const child = users.find(u => u.id === childId);
    if (!reward || !child) return { success: false, message: "Reward or user profile not found." };

    const { rewardBankBalance } = getPointsMetrics(childId);
    if (rewardBankBalance < reward.pointCost) {
      return { 
        success: false, 
        message: `Insufficient points! You need ${reward.pointCost} points but currently have ${rewardBankBalance} available in your bank.` 
      };
    }

    const requestId = `req_${Date.now()}`;
    const newRequest: RewardRequest = {
      id: requestId,
      rewardId,
      rewardTitle: reward.title,
      childId,
      childName: child.name,
      pointCost: reward.pointCost,
      status: reward.requiresApproval ? 'pending' : 'used',
      requestedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'families', family.id, 'rewardRequests', requestId), newRequest);
      await addLog(childId, child.name, "reward_requested", `Exchanged reward request: "${reward.title}" costing ${reward.pointCost} points.`);
      return { success: true, message: reward.requiresApproval ? "Success! Request sent to parents for approval." : "Success! Reward redeemed and added to your wallet." };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewardRequests`);
      return { success: false, message: "Server transaction error." };
    }
  };

  const processRewardRequestByParent = async (requestId: string, status: 'approved' | 'denied' | 'used', feedback?: string) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const r = rewardRequests.find(req => req.id === requestId);
    if (!r) return;

    const action: HistoryLog['actionType'] = status === 'approved' ? 'reward_approved' : status === 'denied' ? 'reward_denied' : 'reward_used';

    try {
      await updateDoc(doc(db, 'families', family.id, 'rewardRequests', requestId), {
        status,
        processedAt: new Date().toISOString(),
        parentFeedback: feedback || ''
      });

      await addLog(
        authenticatedUser.id, 
        authenticatedUser.name, 
        action, 
        `Processed Reward Request for ${r.childName}'s "${r.rewardTitle}": status changed to ${status.toUpperCase()}`,
        feedback
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewardRequests`);
    }
  };

  const addNewReward = async (newRewardProps: Omit<Reward, 'id' | 'createdAt'>) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const rewardId = `reward_${Date.now()}`;
    const newReward: Reward = {
      ...newRewardProps,
      id: rewardId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'families', family.id, 'rewards', rewardId), newReward);
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Created extra family reward Option: "${newReward.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewards`);
    }
  };

  const updateReward = async (rewardId: string, updatedFields: Partial<Reward>) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    try {
      await updateDoc(doc(db, 'families', family.id, 'rewards', rewardId), updatedFields);
      const target = rewards.find(r => r.id === rewardId);
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Updated configuration for reward: "${target?.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewards`);
    }
  };

  const deleteReward = async (rewardId: string) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    const target = rewards.find(r => r.id === rewardId);
    try {
      await deleteDoc(doc(db, 'families', family.id, 'rewards', rewardId));
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Deleted reward: "${target?.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewards`);
    }
  };

  // CSV Import Mechanics
  const importCSVTasks = async (importedTasks: Array<Partial<Task>>, mode: 'overwrite' | 'update'): Promise<{ importedCount: number; errors: string[] }> => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return { importedCount: 0, errors: ["Unprivileged operator"] };
    
    const { validTasks, errors } = validateAndParseCSVTasks(importedTasks);

    if (errors.length > 0) {
      return { importedCount: 0, errors };
    }

    try {
      const batch = writeBatch(db);
      if (mode === 'overwrite') {
        tasks.forEach(t => {
          batch.delete(doc(db, 'families', family.id, 'tasks', t.id));
        });
      }
      validTasks.forEach(vt => {
        const matched = mode === 'update' ? tasks.find(t => t.key === vt.key) : null;
        const finalId = matched ? matched.id : vt.id;
        batch.set(doc(db, 'families', family.id, 'tasks', finalId), { ...vt, id: finalId });
      });

      await batch.commit();
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", mode === 'overwrite' ? `Bulk overwrite loaded ${validTasks.length} chores from CSV` : `Bulk merge unified ${validTasks.length} tasks from CSV`);
      return { importedCount: validTasks.length, errors: [] };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/tasks`);
      return { importedCount: 0, errors: ["Server import batch not successful"] };
    }
  };

  const importCSVRewards = async (importedRewards: Array<Partial<Reward>>, mode: 'overwrite' | 'update'): Promise<{ importedCount: number; errors: string[] }> => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return { importedCount: 0, errors: ["Unprivileged operator"] };

    const { validRewards, errors } = validateAndParseCSVRewards(importedRewards);

    if (errors.length > 0) {
      return { importedCount: 0, errors };
    }

    try {
      const batch = writeBatch(db);
      if (mode === 'overwrite') {
        rewards.forEach(r => {
          batch.delete(doc(db, 'families', family.id, 'rewards', r.id));
        });
      }
      validRewards.forEach(vr => {
        const matched = mode === 'update' ? rewards.find(r => r.key === vr.key) : null;
        const finalId = matched ? matched.id : vr.id;
        batch.set(doc(db, 'families', family.id, 'rewards', finalId), { ...vr, id: finalId });
      });

      await batch.commit();
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", mode === 'overwrite' ? `Bulk overwrite loaded ${validRewards.length} rewards option from CSV` : `Bulk merge synced ${validRewards.length} rewards specification from CSV`);
      return { importedCount: validRewards.length, errors: [] };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/rewards`);
      return { importedCount: 0, errors: ["Server bulk upload not successful"] };
    }
  };

  // Calculus Engines
  const getPointsMetrics = (childId: string) => {
    return calculatePointsMetrics(childId, completions, rewardRequests);
  };

  const updateFamilySettings = async (settings: { familyName: string; timezone?: string }) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    try {
      await updateDoc(doc(db, 'families', family.id), {
        name: settings.familyName,
        timezone: settings.timezone || family.timezone
      });
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Updated family settings name to: ${settings.familyName}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}`);
    }
  };

  const toggleVisitMode = async () => {
    if (!family || !authenticatedUser) return;
    if (authenticatedUser.role !== 'parent' && authenticatedUser.role !== 'caregiver') {
      alert("This action is for parents and caregivers.");
      return;
    }
    const currentStatus = !!family.isActiveVisit;
    const nextStatus = !currentStatus;
    try {
      await updateDoc(doc(db, 'families', family.id), {
        isActiveVisit: nextStatus
      });
      await addLog(
        authenticatedUser.id, 
        authenticatedUser.name, 
        "settings_updated", 
        `Toggled caregiver visit mode: status configured to ${nextStatus ? "ACTIVE" : "INACTIVE"}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}`);
    }
  };

  const updateParentInstructions = async (instructions: { allergies: string; bedtime: string; emergencyContacts: string; customNotes?: string }) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    try {
      await updateDoc(doc(db, 'families', family.id), {
        parentInstructions: instructions
      });
      await addLog(
        authenticatedUser.id,
        authenticatedUser.name,
        "settings_updated",
        "Updated caregiver visit parent instructions."
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}`);
    }
  };

  const updateUserProfile = async (userId: string, updates: { name?: string; avatar?: string; age?: number; ageGroup?: 'toddler' | 'preschool' | 'elementary' | 'teen'; pin?: string }) => {
    if (!family || !authenticatedUser || authenticatedUser.role !== 'parent') return;
    try {
      const userRef = doc(db, 'families', family.id, 'users', userId);
      await updateDoc(userRef, updates);
      
      try {
        const flatRef = doc(db, 'users', userId);
        const flatUpdates: any = {};
        if (updates.name) flatUpdates.name = updates.name;
        if (Object.keys(flatUpdates).length > 0) {
          await updateDoc(flatRef, flatUpdates);
        }
      } catch (innerErr: any) {
        if (innerErr.code !== 'not-found') {
          console.warn('Silent skip flat map update:', innerErr);
        }
      }
      
      await addLog(authenticatedUser.id, authenticatedUser.name, "settings_updated", `Updated profile configurations for member "${updates.name || userId}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `families/${family.id}/users/${userId}`);
    }
  };

  const resetAllData = () => {
    signOut(auth).then(() => {
      window.location.reload();
    });
  };

  return (
    <BoardContext.Provider value={{
      authenticatedUser,
      currentUser,
      setCurrentUser,
      isAuthReady,
      family,
      users,
      tasks,
      completions,
      rewards,
      rewardRequests,
      invites,
      logs,
      boundaryRules: BOUNDARY_RULES,
      loginWithEmail,
      loginWithGoogle,
      sendPasswordReset,
      sendMagicLink,
      handleGoogleSignIn,
      handlePhoneSignIn,
      registerNewFamily,
      claimInviteWithAccount,
      getInviteInfo,
      initializeGoogleOrMagicLinkFamily,
      loginAsUser,
      createNewUser,
      switchProfile,
      logout,
      inviteUser,
      completeTaskByChild,
      reviewTaskByParent,
      fixTaskByChild,
      addNewTask,
      updateTask,
      deleteTask,
      requestRewardByChild,
      processRewardRequestByParent,
      addNewReward,
      updateReward,
      deleteReward,
      importCSVTasks,
      importCSVRewards,
      getPointsMetrics,
      updateFamilySettings,
      updateUserProfile,
      resetAllData,
      toggleVisitMode,
      updateParentInstructions
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    console.error('useBoard attempted to be used outside of BoardProvider. Ensure your component is wrapped in AppProviders/BoardProvider.');
    throw new Error('useBoard must be utilized inside a BoardProvider');
  }
  return context;
};
