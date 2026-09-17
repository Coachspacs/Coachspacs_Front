import { getFirestoreDb } from '@/lib/firebaseAdmin';
import { GlobalBrandingConfig, LandingSectionsData, LandingPageDoc } from '@/types/cms';
import { DEFAULT_BRANDING, DEFAULT_LANDING_SECTIONS } from '@/lib/cmsDefaults';

const SETTINGS_COLLECTION = 'cms_settings';
const BRANDING_DOC_ID = 'branding';
const PAGES_COLLECTION = 'cms_pages';
const LANDING_DOC_ID = 'landing';

// In-memory fallback caches for zero-downtime and test environments
let inMemoryBranding: GlobalBrandingConfig | null = null;
let inMemoryLandingDoc: LandingPageDoc | null = null;

export class CmsServerService {
  /**
   * Fetch Global Branding configuration
   */
  static async getPublishedBranding(): Promise<GlobalBrandingConfig> {
    const db = getFirestoreDb();
    if (!db) {
      return inMemoryBranding || DEFAULT_BRANDING;
    }

    try {
      const doc = await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DOC_ID).get();
      if (!doc.exists) {
        return inMemoryBranding || DEFAULT_BRANDING;
      }
      const data = doc.data() as Partial<GlobalBrandingConfig>;
      const resolved: GlobalBrandingConfig = {
        ...DEFAULT_BRANDING,
        ...data,
        colors: {
          ...DEFAULT_BRANDING.colors,
          ...(data.colors || {}),
        },
      };
      inMemoryBranding = resolved;
      return resolved;
    } catch (err) {
      console.warn('[CmsServerService] Error fetching branding from Firestore, using fallback:', err);
      return inMemoryBranding || DEFAULT_BRANDING;
    }
  }

  /**
   * Save Branding configuration
   */
  static async saveBranding(
    branding: Partial<GlobalBrandingConfig>,
    updatedBy: string
  ): Promise<GlobalBrandingConfig> {
    const db = getFirestoreDb();
    const current = await this.getPublishedBranding();
    const merged: GlobalBrandingConfig = {
      ...current,
      ...branding,
      colors: {
        ...current.colors,
        ...(branding.colors || {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    inMemoryBranding = merged;

    if (!db) {
      return merged;
    }

    try {
      await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DOC_ID).set(merged, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Failed to save branding to Firestore:', err);
      throw new Error('Failed to save branding to database');
    }

    return merged;
  }

  /**
   * Fetch Landing Page document
   */
  static async getLandingPageDoc(): Promise<LandingPageDoc> {
    const db = getFirestoreDb();
    if (!db) {
      return (
        inMemoryLandingDoc || {
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: 'system',
          published: DEFAULT_LANDING_SECTIONS,
          draft: DEFAULT_LANDING_SECTIONS,
        }
      );
    }

    try {
      const doc = await db.collection(PAGES_COLLECTION).doc(LANDING_DOC_ID).get();
      if (!doc.exists) {
        return (
          inMemoryLandingDoc || {
            status: 'published',
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: 'system',
            published: DEFAULT_LANDING_SECTIONS,
            draft: DEFAULT_LANDING_SECTIONS,
          }
        );
      }

      const data = doc.data() as Partial<LandingPageDoc>;
      const resolved: LandingPageDoc = {
        status: data.status || 'published',
        publishedAt: data.publishedAt || null,
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastUpdatedBy: data.lastUpdatedBy || 'admin',
        published: {
          ...DEFAULT_LANDING_SECTIONS,
          ...(data.published || {}),
        },
        draft: {
          ...DEFAULT_LANDING_SECTIONS,
          ...(data.draft || data.published || {}),
        },
      };
      inMemoryLandingDoc = resolved;
      return resolved;
    } catch (err) {
      console.warn('[CmsServerService] Error reading landing page doc:', err);
      return (
        inMemoryLandingDoc || {
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: 'system',
          published: DEFAULT_LANDING_SECTIONS,
          draft: DEFAULT_LANDING_SECTIONS,
        }
      );
    }
  }

  /**
   * Fetch Landing Page sections for public rendering or preview
   */
  static async getLandingSections(isPreview = false): Promise<LandingSectionsData> {
    const doc = await this.getLandingPageDoc();
    if (isPreview && doc.draft) {
      return doc.draft;
    }
    return doc.published || DEFAULT_LANDING_SECTIONS;
  }

  /**
   * Save Landing Page Draft
   */
  static async saveLandingDraft(
    draftData: Partial<LandingSectionsData>,
    updatedBy: string
  ): Promise<LandingPageDoc> {
    const db = getFirestoreDb();
    const currentDoc = await this.getLandingPageDoc();

    const updatedDoc: LandingPageDoc = {
      ...currentDoc,
      status: 'has_draft_changes',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
      draft: {
        ...currentDoc.draft,
        ...draftData,
      },
    };

    inMemoryLandingDoc = updatedDoc;

    if (db) {
      try {
        await db.collection(PAGES_COLLECTION).doc(LANDING_DOC_ID).set(updatedDoc, { merge: true });
      } catch (err) {
        console.error('[CmsServerService] Error saving landing draft:', err);
        throw new Error('Failed to save draft to database');
      }
    }

    return updatedDoc;
  }

  /**
   * Publish Landing Page (copies draft into published)
   */
  static async publishLandingPage(updatedBy: string): Promise<LandingPageDoc> {
    const db = getFirestoreDb();
    const currentDoc = await this.getLandingPageDoc();

    const publishedDoc: LandingPageDoc = {
      ...currentDoc,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
      published: {
        ...currentDoc.draft,
      },
    };

    inMemoryLandingDoc = publishedDoc;

    if (db) {
      try {
        await db.collection(PAGES_COLLECTION).doc(LANDING_DOC_ID).set(publishedDoc, { merge: true });
      } catch (err) {
        console.error('[CmsServerService] Error publishing landing page:', err);
        throw new Error('Failed to publish to database');
      }
    }

    return publishedDoc;
  }
}
