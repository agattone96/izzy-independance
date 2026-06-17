import { auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'auth/operation-not-allowed') {
    throw new Error("Firebase sign-in provider is disabled. Please enable it in the Firebase Console.");
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function handleAuthError(error: any, action: string): never {
  console.error(`Firebase Auth Error during ${action}:`, error);
  const code = error?.code || '';
  const message = error?.message || String(error);

  if (code === 'auth/operation-not-allowed') {
    throw new Error("The requested sign-in provider is not enabled. Please navigate to Firebase Console -> Authentication -> Sign-in method and enable the Google provider or Email/Password passwordless link.");
  }
  if (code === 'auth/unauthorized-domain') {
    throw new Error(`This domain (${window.location.host}) is not authorized for OAuth/Sign-in in the Firebase Console. Please add it to your Firebase Console -> Authentication -> Settings -> Authorized domains.`);
  }
  if (code === 'auth/invalid-api-key') {
    throw new Error("The Firebase API Key configuration in firebase-applet-config.json is invalid. Please verify your Firebase project setup.");
  }
  if (code === 'auth/invalid-continue-uri') {
    throw new Error("The continuation URL in Magic Link's ActionCodeSettings is invalid or unauthorized. Check your Authorized domains.");
  }
  if (code === 'auth/popup-blocked') {
    throw new Error("Sign-in popup was blocked by your browser. Please allow popups for this site, or try entering your credentials manually.");
  }
  if (code === 'auth/popup-closed-by-user') {
    throw new Error("Sign-in popup was closed before completion. Please try again.");
  }
  
  throw new Error(`Auth Error [${code}]: ${message}`);
}
