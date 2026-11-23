import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Firebase operation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}

export class FirebaseDatabaseService {
  /**
   * Save or update an inquiry from the public website
   */
  static async saveInquiry(data: {
    fullName: string;
    phone: string;
    email: string;
    destinationCountry: string;
    visaType: string;
    message: string;
  }) {
    try {
      const colRef = collection(firestore, 'inquiries');
      const docRef = await withTimeout(
        addDoc(colRef, {
          ...data,
          status: 'NEW',
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp()
        })
      );
      return { id: docRef.id, ...data };
    } catch (error) {
      console.warn('[Firebase] Failed to save inquiry to Firestore (continuing with local store):', (error as Error)?.message || error);
      return null;
    }
  }

  /**
   * Sync or save an application to Firebase
   */
  static async syncApplication(application: any) {
    try {
      const docRef = doc(firestore, 'applications', application.id);
      await withTimeout(
        setDoc(docRef, {
          ...application,
          syncedAt: new Date().toISOString()
        }, { merge: true })
      );
      return true;
    } catch (error) {
      console.warn('[Firebase] Sync application failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Sync client profile to Firebase
   */
  static async syncClient(client: any) {
    try {
      const docRef = doc(firestore, 'clients', client.id);
      // Exclude encrypted secrets if storing in Firestore
      const { nidEncrypted, passportEncrypted, ...safeClientData } = client;
      await withTimeout(
        setDoc(docRef, {
          ...safeClientData,
          syncedAt: new Date().toISOString()
        }, { merge: true })
      );
      return true;
    } catch (error) {
      console.warn('[Firebase] Sync client failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Record audit event in Firebase Firestore
   */
  static async logAudit(auditData: any) {
    try {
      const colRef = collection(firestore, 'audit_logs');
      await addDoc(colRef, {
        ...auditData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Non-blocking
    }
  }

  /**
   * Retrieve all public inquiries from Firebase Firestore
   */
  static async getInquiries() {
    try {
      const colRef = collection(firestore, 'inquiries');
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn('[Firebase] Failed to fetch inquiries:', error);
      return [];
    }
  }

  /**
   * Sync an offered Destination Country post to Firebase Firestore
   */
  static async syncCountry(country: any) {
    try {
      const docRef = doc(firestore, 'countries', country.id);
      await withTimeout(
        setDoc(docRef, {
          ...country,
          syncedAt: new Date().toISOString()
        }, { merge: true })
      );
      return true;
    } catch (error) {
      console.warn('[Firebase] Sync country failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Delete an offered country from Firebase Firestore
   */
  static async deleteCountry(countryId: string) {
    try {
      const docRef = doc(firestore, 'countries', countryId);
      await withTimeout(deleteDoc(docRef));
      return true;
    } catch (error) {
      console.warn('[Firebase] Delete country failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Fetch all offered countries from Firebase Firestore
   */
  static async getOfferedCountries(): Promise<any[]> {
    try {
      const colRef = collection(firestore, 'countries');
      const snap = await withTimeout(getDocs(colRef), 3500);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn('[Firebase] Fetch offered countries fallback:', (error as Error)?.message || error);
      return [];
    }
  }

  /**
   * Sync a Visa Program post to Firebase Firestore
   */
  static async syncVisaProgram(program: any) {
    try {
      const docRef = doc(firestore, 'visa_programs', program.id);
      await withTimeout(
        setDoc(docRef, {
          ...program,
          createdAt: program.createdAt ? new Date(program.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString()
        }, { merge: true })
      );
      return true;
    } catch (error) {
      console.warn('[Firebase] Sync visa program failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Delete a Visa Program post from Firebase Firestore
   */
  static async deleteVisaProgram(programId: string) {
    try {
      const docRef = doc(firestore, 'visa_programs', programId);
      await withTimeout(deleteDoc(docRef));
      return true;
    } catch (error) {
      console.warn('[Firebase] Delete visa program failed:', (error as Error)?.message || error);
      return false;
    }
  }

  /**
   * Fetch all visa programs from Firebase Firestore
   */
  static async getVisaPrograms(): Promise<any[]> {
    try {
      const colRef = collection(firestore, 'visa_programs');
      const snap = await withTimeout(getDocs(colRef), 3500);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn('[Firebase] Fetch visa programs fallback:', (error as Error)?.message || error);
      return [];
    }
  }
}
