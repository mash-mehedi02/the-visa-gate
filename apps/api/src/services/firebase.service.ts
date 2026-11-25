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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Firebase operation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}

// ─── Generic Firestore helpers ──────────────────────────────────────────────

async function saveCollection(collectionName: string, items: any[]): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const batch = writeBatch(firestore);
    for (const item of items) {
      if (!item.id) continue;
      const docRef = doc(firestore, collectionName, item.id);
      // Serialize dates to ISO strings for Firestore
      const serialized = serializeForFirestore(item);
      batch.set(docRef, { ...serialized, _syncedAt: new Date().toISOString() }, { merge: true });
    }
    await withTimeout(batch.commit(), 10000);
  } catch (error) {
    console.warn(`[Firebase] saveCollection(${collectionName}) failed:`, (error as Error)?.message);
  }
}

async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(firestore, collectionName, id);
    const serialized = serializeForFirestore(data);
    await withTimeout(setDoc(docRef, { ...serialized, _syncedAt: new Date().toISOString() }, { merge: true }), 5000);
  } catch (error) {
    console.warn(`[Firebase] saveDocument(${collectionName}/${id}) failed:`, (error as Error)?.message);
  }
}

async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(firestore, collectionName, id);
    await withTimeout(deleteDoc(docRef), 5000);
  } catch (error) {
    console.warn(`[Firebase] deleteDocument(${collectionName}/${id}) failed:`, (error as Error)?.message);
  }
}

async function loadCollection(collectionName: string): Promise<any[]> {
  try {
    const colRef = collection(firestore, collectionName);
    const snap = await withTimeout(getDocs(colRef), 8000);
    return snap.docs.map(d => {
      const data = d.data();
      delete data._syncedAt;
      return { id: d.id, ...data };
    });
  } catch (error) {
    console.warn(`[Firebase] loadCollection(${collectionName}) failed:`, (error as Error)?.message);
    return [];
  }
}

function serializeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeForFirestore);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeForFirestore(value);
    }
    return result;
  }
  return obj;
}

// ─── Persistence API ─────────────────────────────────────────────────────────

export class FirebasePersistence {
  static async isInitialized(): Promise<boolean> {
    try {
      const docRef = doc(firestore, 'tvg_meta', 'state');
      const snap = await withTimeout(getDoc(docRef), 4000);
      return snap.exists() && snap.data()?.initialized === true;
    } catch {
      return false;
    }
  }

  static async markInitialized(): Promise<void> {
    try {
      const docRef = doc(firestore, 'tvg_meta', 'state');
      await withTimeout(setDoc(docRef, { initialized: true, updatedAt: new Date().toISOString() }, { merge: true }), 4000);
    } catch {}
  }

  /**
   * Save ALL transactional data to Firebase Firestore.
   * Called after every write operation (like saveToDisk).
   */
  static async saveAll(data: {
    users?: any[];
    clients?: any[];
    staff?: any[];
    applications?: any[];
    applicationSteps?: any[];
    stepHistory?: any[];
    documents?: any[];
    payments?: any[];
    bookings?: any[];
    countries?: any[];
    visaPrograms?: any[];
    visaCategories?: any[];
    workflowTemplates?: any[];
  }): Promise<void> {
    const tasks: Promise<void>[] = [];
    if (data.users) tasks.push(saveCollection('tvg_users', data.users));
    if (data.clients) tasks.push(saveCollection('tvg_clients', data.clients));
    if (data.staff) tasks.push(saveCollection('tvg_staff', data.staff));
    if (data.applications) tasks.push(saveCollection('tvg_applications', data.applications));
    if (data.applicationSteps) tasks.push(saveCollection('tvg_application_steps', data.applicationSteps));
    if (data.stepHistory) tasks.push(saveCollection('tvg_step_history', data.stepHistory));
    if (data.documents) tasks.push(saveCollection('tvg_documents', data.documents));
    if (data.payments) tasks.push(saveCollection('tvg_payments', data.payments));
    if (data.bookings) tasks.push(saveCollection('tvg_bookings', data.bookings));
    if (data.countries) tasks.push(saveCollection('tvg_countries', data.countries));
    if (data.visaPrograms) tasks.push(saveCollection('tvg_visa_programs', data.visaPrograms));
    if (data.visaCategories) tasks.push(saveCollection('tvg_visa_categories', data.visaCategories));
    if (data.workflowTemplates) tasks.push(saveCollection('tvg_workflow_templates', data.workflowTemplates));
    await Promise.allSettled(tasks);
  }

  /** Save a single record (fast, non-blocking per-operation sync) */
  static async saveRecord(collection: string, id: string, data: any): Promise<void> {
    await saveDocument(collection, id, data);
  }

  /** Delete a single record */
  static async deleteRecord(collection: string, id: string): Promise<void> {
    await deleteDocument(collection, id);
  }

  /**
   * Load ALL transactional data from Firebase Firestore on startup.
   * Returns empty arrays for any collection that fails or is empty.
   */
  static async loadAll(): Promise<{
    users: any[];
    clients: any[];
    staff: any[];
    applications: any[];
    applicationSteps: any[];
    stepHistory: any[];
    documents: any[];
    payments: any[];
    bookings: any[];
    countries: any[];
    visaPrograms: any[];
    visaCategories: any[];
    workflowTemplates: any[];
  }> {
    console.log('[Firebase] Loading persistent data from Firestore...');
    const [
      users, clients, staff, applications, applicationSteps,
      stepHistory, documents, payments, bookings,
      countries, visaPrograms, visaCategories, workflowTemplates
    ] = await Promise.allSettled([
      loadCollection('tvg_users'),
      loadCollection('tvg_clients'),
      loadCollection('tvg_staff'),
      loadCollection('tvg_applications'),
      loadCollection('tvg_application_steps'),
      loadCollection('tvg_step_history'),
      loadCollection('tvg_documents'),
      loadCollection('tvg_payments'),
      loadCollection('tvg_bookings'),
      loadCollection('tvg_countries'),
      loadCollection('tvg_visa_programs'),
      loadCollection('tvg_visa_categories'),
      loadCollection('tvg_workflow_templates'),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

    const result = { users, clients, staff, applications, applicationSteps, stepHistory, documents, payments, bookings, countries, visaPrograms, visaCategories, workflowTemplates };
    const clientCount = (clients as any[]).length;
    const appCount = (applications as any[]).length;
    console.log(`[Firebase] Loaded from Firestore: ${clientCount} clients, ${appCount} applications, ${(documents as any[]).length} documents.`);
    return result as any;
  }
}

// ─── Legacy methods (kept for backward compatibility) ─────────────────────────

export class FirebaseDatabaseService {
  static async saveInquiry(data: {
    fullName: string; phone: string; email: string;
    destinationCountry: string; visaType: string; message: string;
  }) {
    try {
      const colRef = collection(firestore, 'inquiries');
      const docRef = await withTimeout(addDoc(colRef, {
        ...data, status: 'NEW',
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }));
      return { id: docRef.id, ...data };
    } catch (error) {
      console.warn('[Firebase] Failed to save inquiry:', (error as Error)?.message);
      return null;
    }
  }

  static async syncApplication(application: any) {
    return saveDocument('applications', application.id, application).then(() => true).catch(() => false);
  }

  static async syncClient(client: any) {
    const { nidEncrypted, passportEncrypted, ...safeClientData } = client;
    return saveDocument('clients', client.id, safeClientData).then(() => true).catch(() => false);
  }

  static async logAudit(auditData: any) {
    try {
      const colRef = collection(firestore, 'audit_logs');
      await addDoc(colRef, { ...auditData, timestamp: new Date().toISOString() });
    } catch {}
  }

  static async getInquiries() {
    try {
      const colRef = collection(firestore, 'inquiries');
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
      const snap = await withTimeout(getDocs(q));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  }

  static async syncCountry(country: any) {
    return saveDocument('countries', country.id, country).then(() => true).catch(() => false);
  }

  static async deleteCountry(countryId: string) {
    return deleteDocument('countries', countryId).then(() => true).catch(() => false);
  }

  static async getOfferedCountries(): Promise<any[]> {
    return loadCollection('countries');
  }

  static async syncVisaProgram(program: any) {
    return saveDocument('visa_programs', program.id, program).then(() => true).catch(() => false);
  }

  static async deleteVisaProgram(programId: string) {
    return deleteDocument('visa_programs', programId).then(() => true).catch(() => false);
  }

  static async getVisaPrograms(): Promise<any[]> {
    return loadCollection('visa_programs');
  }
}
