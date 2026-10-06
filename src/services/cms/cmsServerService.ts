import { getFirestoreDb } from '@/lib/firebaseAdmin';
import {
  GlobalBrandingConfig,
  LandingSectionsData,
  LandingPageDoc,
  LegalPagesDoc,
  LegalPageData,
  LegalPagesContent,
} from '@/types/cms';
import {
  DEFAULT_BRANDING,
  DEFAULT_LANDING_SECTIONS,
  DEFAULT_LEGAL_PAGES,
} from '@/lib/cmsDefaults';

const SETTINGS_COLLECTION = 'cms_settings';
const BRANDING_DOC_ID = 'branding';
const PAGES_COLLECTION = 'cms_pages';
const LANDING_DOC_ID = 'landing';
const LEGAL_DOC_ID = 'legal';

// In-memory fallback caches for zero-downtime and test environments
let inMemoryBranding: GlobalBrandingConfig | null = null;
let inMemoryLandingDoc: LandingPageDoc | null = null;
let inMemoryLegalDoc: LegalPagesDoc | null = null;


const BRANDING_DRAFT_DOC_ID = 'branding_draft';
let inMemoryBrandingDraft: GlobalBrandingConfig | null = null;

function mergeLandingViewWithDefaults(
  savedView: Partial<LandingSectionsData> | undefined,
  defaultView: LandingSectionsData
): LandingSectionsData {
  if (!savedView) return defaultView;
  return {
    ...defaultView,
    ...savedView,
    hero: {
      ...defaultView.hero,
      ...(savedView.hero || {}),
      title_ar: savedView.hero?.title_ar || defaultView.hero.title_ar,
      title_en: savedView.hero?.title_en || defaultView.hero.title_en,
      is_visible: savedView.hero?.is_visible !== undefined ? savedView.hero.is_visible : defaultView.hero.is_visible,
    },
    top_categories: {
      ...defaultView.top_categories,
      ...(savedView.top_categories || {}),
      title_ar: savedView.top_categories?.title_ar || defaultView.top_categories.title_ar,
      title_en: savedView.top_categories?.title_en || defaultView.top_categories.title_en,
      is_visible: savedView.top_categories?.is_visible !== undefined ? savedView.top_categories.is_visible : defaultView.top_categories.is_visible,
    },
    master_craft: {
      ...defaultView.master_craft,
      ...(savedView.master_craft || {}),
      heading_ar: savedView.master_craft?.heading_ar || defaultView.master_craft.heading_ar,
      heading_en: savedView.master_craft?.heading_en || defaultView.master_craft.heading_en,
      features: (savedView.master_craft?.features && savedView.master_craft.features.length > 0) ? savedView.master_craft.features : defaultView.master_craft.features,
      is_visible: savedView.master_craft?.is_visible !== undefined ? savedView.master_craft.is_visible : defaultView.master_craft.is_visible,
    },
    why_stands_out: {
      ...defaultView.why_stands_out,
      ...(savedView.why_stands_out || {}),
      title_ar: savedView.why_stands_out?.title_ar || defaultView.why_stands_out.title_ar,
      title_en: savedView.why_stands_out?.title_en || defaultView.why_stands_out.title_en,
      cards: (savedView.why_stands_out?.cards && savedView.why_stands_out.cards.length > 0) ? savedView.why_stands_out.cards : defaultView.why_stands_out.cards,
      is_visible: savedView.why_stands_out?.is_visible !== undefined ? savedView.why_stands_out.is_visible : defaultView.why_stands_out.is_visible,
    },
    real_stories: {
      ...defaultView.real_stories,
      ...(savedView.real_stories || {}),
      title_ar: savedView.real_stories?.title_ar || defaultView.real_stories.title_ar,
      title_en: savedView.real_stories?.title_en || defaultView.real_stories.title_en,
      testimonials: (savedView.real_stories?.testimonials && savedView.real_stories.testimonials.length >= 3) ? savedView.real_stories.testimonials : defaultView.real_stories.testimonials,
      is_visible: savedView.real_stories?.is_visible !== undefined ? savedView.real_stories.is_visible : defaultView.real_stories.is_visible,
    },
    faq: {
      ...defaultView.faq,
      ...(savedView.faq || {}),
      items: (savedView.faq?.items && savedView.faq.items.length > 0) ? savedView.faq.items : defaultView.faq.items,
      is_visible: savedView.faq?.is_visible !== undefined ? savedView.faq.is_visible : defaultView.faq.is_visible,
    },
    join_future: {
      ...defaultView.join_future,
      ...(savedView.join_future || {}),
      title_ar: savedView.join_future?.title_ar || defaultView.join_future.title_ar,
      title_en: savedView.join_future?.title_en || defaultView.join_future.title_en,
      is_visible: savedView.join_future?.is_visible !== undefined ? savedView.join_future.is_visible : defaultView.join_future.is_visible,
    },
    section_order: (savedView.section_order && savedView.section_order.length >= 6) ? savedView.section_order : defaultView.section_order,
  };
}

export class CmsServerService {
  /**
   * Fetch Branding configuration (supports isPreview flag for draft preview)
   */
  static async getBranding(isPreview = false): Promise<GlobalBrandingConfig> {
    if (isPreview) {
      const draft = await this.getDraftBranding();
      if (draft) return draft;
    }
    return this.getPublishedBranding();
  }

  /**
   * Fetch Global Published Branding configuration
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
   * Fetch Draft Branding configuration
   */
  static async getDraftBranding(): Promise<GlobalBrandingConfig | null> {
    const db = getFirestoreDb();
    if (!db) {
      return inMemoryBrandingDraft || inMemoryBranding || DEFAULT_BRANDING;
    }

    try {
      const doc = await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DRAFT_DOC_ID).get();
      if (!doc.exists) {
        return inMemoryBrandingDraft;
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
      inMemoryBrandingDraft = resolved;
      return resolved;
    } catch (err) {
      console.warn('[CmsServerService] Error fetching draft branding:', err);
      return inMemoryBrandingDraft;
    }
  }

  /**
   * Save Branding Draft (for preview without publishing)
   */
  static async saveBrandingDraft(
    branding: Partial<GlobalBrandingConfig>,
    updatedBy: string
  ): Promise<GlobalBrandingConfig> {
    const db = getFirestoreDb();
    const current = (await this.getDraftBranding()) || (await this.getPublishedBranding());
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

    inMemoryBrandingDraft = merged;

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DRAFT_DOC_ID).set(merged, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Failed to save draft branding to Firestore:', err);
    }

    return merged;
  }

  /**
   * Save & Publish Branding configuration (live on production)
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
    inMemoryBrandingDraft = null;

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DOC_ID).set(merged, { merge: true });
      // Clean up draft doc once published
      await db.collection(SETTINGS_COLLECTION).doc(BRANDING_DRAFT_DOC_ID).delete().catch(() => {});
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
      const defGuest = DEFAULT_LANDING_SECTIONS.views?.guest || DEFAULT_LANDING_SECTIONS;
      const defStudent = DEFAULT_LANDING_SECTIONS.views?.student || DEFAULT_LANDING_SECTIONS;
      const defInstructor = DEFAULT_LANDING_SECTIONS.views?.instructor || DEFAULT_LANDING_SECTIONS;

      const publishedViews = {
        guest: mergeLandingViewWithDefaults(data.published?.views?.guest || (data.published as any), defGuest),
        student: mergeLandingViewWithDefaults(data.published?.views?.student, defStudent),
        instructor: mergeLandingViewWithDefaults(data.published?.views?.instructor, defInstructor),
      };

      const rawDraft = data.draft || data.published;
      const draftViews = {
        guest: mergeLandingViewWithDefaults(rawDraft?.views?.guest || (rawDraft as any), publishedViews.guest),
        student: mergeLandingViewWithDefaults(rawDraft?.views?.student, publishedViews.student),
        instructor: mergeLandingViewWithDefaults(rawDraft?.views?.instructor, publishedViews.instructor),
      };

      const resolved: LandingPageDoc = {
        status: data.status || 'published',
        publishedAt: data.publishedAt || null,
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastUpdatedBy: data.lastUpdatedBy || 'admin',
        published: {
          ...DEFAULT_LANDING_SECTIONS,
          ...(data.published || {}),
          views: publishedViews,
        },
        draft: {
          ...DEFAULT_LANDING_SECTIONS,
          ...(rawDraft || {}),
          views: draftViews,
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

    const mergedViews = {
      guest: draftData.views?.guest || currentDoc.draft?.views?.guest || currentDoc.draft,
      student: draftData.views?.student || currentDoc.draft?.views?.student || DEFAULT_LANDING_SECTIONS.views?.student || currentDoc.draft,
      instructor: draftData.views?.instructor || currentDoc.draft?.views?.instructor || DEFAULT_LANDING_SECTIONS.views?.instructor || currentDoc.draft,
    };

    const updatedDoc: LandingPageDoc = {
      ...currentDoc,
      status: 'has_draft_changes',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
      draft: {
        ...currentDoc.draft,
        ...draftData,
        views: mergedViews,
      },
    };

    inMemoryLandingDoc = updatedDoc;

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(PAGES_COLLECTION).doc(LANDING_DOC_ID).set(updatedDoc, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Error saving landing draft:', err);
      throw new Error('Failed to save draft to database');
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

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(PAGES_COLLECTION).doc(LANDING_DOC_ID).set(publishedDoc, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Error publishing landing page:', err);
      throw new Error('Failed to publish to database');
    }

    return publishedDoc;
  }

  /**
   * Fetch Legal Pages document (Privacy Policy & Terms of Service)
   */
  static async getLegalPagesDoc(): Promise<LegalPagesDoc> {
    const db = getFirestoreDb();
    if (!db) {
      return (
        inMemoryLegalDoc || {
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: 'system',
          published: DEFAULT_LEGAL_PAGES,
          draft: DEFAULT_LEGAL_PAGES,
        }
      );
    }

    try {
      const doc = await db.collection(PAGES_COLLECTION).doc(LEGAL_DOC_ID).get();
      if (!doc.exists) {
        return (
          inMemoryLegalDoc || {
            status: 'published',
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: 'system',
            published: DEFAULT_LEGAL_PAGES,
            draft: DEFAULT_LEGAL_PAGES,
          }
        );
      }

      const data = doc.data() as Partial<LegalPagesDoc>;
      const resolved: LegalPagesDoc = {
        status: data.status || 'published',
        publishedAt: data.publishedAt || null,
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastUpdatedBy: data.lastUpdatedBy || 'admin',
        published: {
          privacy: {
            ...DEFAULT_LEGAL_PAGES.privacy,
            ...(data.published?.privacy || {}),
          },
          terms: {
            ...DEFAULT_LEGAL_PAGES.terms,
            ...(data.published?.terms || {}),
          },
        },
        draft: {
          privacy: {
            ...DEFAULT_LEGAL_PAGES.privacy,
            ...(data.draft?.privacy || data.published?.privacy || {}),
          },
          terms: {
            ...DEFAULT_LEGAL_PAGES.terms,
            ...(data.draft?.terms || data.published?.terms || {}),
          },
        },
      };
      inMemoryLegalDoc = resolved;
      return resolved;
    } catch (err) {
      console.warn('[CmsServerService] Error reading legal pages doc:', err);
      return (
        inMemoryLegalDoc || {
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: 'system',
          published: DEFAULT_LEGAL_PAGES,
          draft: DEFAULT_LEGAL_PAGES,
        }
      );
    }
  }

  /**
   * Fetch specific legal page content (Privacy or Terms)
   */
  static async getLegalPage(
    page: 'privacy' | 'terms',
    isPreview = false
  ): Promise<LegalPageData> {
    const doc = await this.getLegalPagesDoc();
    if (isPreview && doc.draft) {
      return doc.draft[page] || DEFAULT_LEGAL_PAGES[page];
    }
    return doc.published?.[page] || DEFAULT_LEGAL_PAGES[page];
  }

  /**
   * Save Legal Pages Draft
   */
  static async saveLegalDraft(
    draftData: Partial<LegalPagesContent>,
    updatedBy: string
  ): Promise<LegalPagesDoc> {
    const db = getFirestoreDb();
    const currentDoc = await this.getLegalPagesDoc();

    const updatedDoc: LegalPagesDoc = {
      ...currentDoc,
      status: 'has_draft_changes',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
      draft: {
        privacy: {
          ...currentDoc.draft.privacy,
          ...(draftData.privacy || {}),
        },
        terms: {
          ...currentDoc.draft.terms,
          ...(draftData.terms || {}),
        },
      },
    };

    inMemoryLegalDoc = updatedDoc;

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(PAGES_COLLECTION).doc(LEGAL_DOC_ID).set(updatedDoc, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Error saving legal draft:', err);
      throw new Error('Failed to save legal draft to database');
    }

    return updatedDoc;
  }

  /**
   * Publish Legal Pages (copies draft into published and records history snapshot)
   */
  static async publishLegalPages(updatedBy: string): Promise<LegalPagesDoc> {
    const db = getFirestoreDb();
    const currentDoc = await this.getLegalPagesDoc();

    const snapshot = {
      id: `snapshot-${Date.now()}`,
      savedAt: new Date().toISOString(),
      savedBy: updatedBy,
      data: {
        privacy: { ...currentDoc.draft.privacy },
        terms: { ...currentDoc.draft.terms },
      },
    };

    const previousHistory = Array.isArray(currentDoc.history) ? currentDoc.history : [];
    const updatedHistory = [snapshot, ...previousHistory].slice(0, 25);

    const publishedDoc: LegalPagesDoc = {
      ...currentDoc,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
      published: {
        privacy: { ...currentDoc.draft.privacy },
        terms: { ...currentDoc.draft.terms },
      },
      history: updatedHistory,
    };

    inMemoryLegalDoc = publishedDoc;

    if (!db) {
      throw new Error('Firebase Database is not connected. CMS requires Firebase to save.');
    }

    try {
      await db.collection(PAGES_COLLECTION).doc(LEGAL_DOC_ID).set(publishedDoc, { merge: true });
    } catch (err) {
      console.error('[CmsServerService] Error publishing legal pages:', err);
      throw new Error('Failed to publish legal pages to database');
    }

    return publishedDoc;
  }
}

