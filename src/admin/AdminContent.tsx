import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteContent } from '@/types/content';
import { defaultContent } from '@/config/defaultContent';
import {
  loadContentRow,
  saveDraft,
  publishContent,
  discardDraft as dbDiscard,
  type ContentRow,
} from '@/lib/content';
import { useAuth } from '@/lib/auth';

interface AdminContentValue {
  row: ContentRow | null;
  draft: SiteContent;
  loading: boolean;
  error: string | null;
  saving: boolean;
  lastSaved: Date | null;
  dirty: boolean;
  update: (patch: Partial<SiteContent> | ((prev: SiteContent) => SiteContent)) => void;
  saveDraftNow: () => Promise<void>;
  publish: (note?: string) => Promise<void>;
  discard: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<AdminContentValue | undefined>(undefined);

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [row, setRow] = useState<ContentRow | null>(null);
  const [draft, setDraft] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await loadContentRow();
      if (r) {
        setRow(r);
        setDraft(r.draft);
        setDirty(false);
      } else {
        setDraft(defaultContent);
        setDirty(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar conteúdo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const update = useCallback(
    (patch: Partial<SiteContent> | ((prev: SiteContent) => SiteContent)) => {
      setDraft((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        return next;
      });
      setDirty(true);
    },
    []
  );

  const saveDraftNow = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await saveDraft(draft);
      setLastSaved(new Date());
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar rascunho.');
      throw e;
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const publish = useCallback(
    async (note = '') => {
      setSaving(true);
      setError(null);
      try {
        await publishContent(draft, note);
        setLastSaved(new Date());
        setDirty(false);
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao publicar.');
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [draft, reload]
  );

  const discard = useCallback(async () => {
    setSaving(true);
    try {
      await dbDiscard();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao descartar.');
    } finally {
      setSaving(false);
    }
  }, [reload]);

  return (
    <Ctx.Provider
      value={{
        row,
        draft,
        loading,
        error,
        saving,
        lastSaved,
        dirty,
        update,
        saveDraftNow,
        publish,
        discard,
        reload,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdminContent(): AdminContentValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminContent must be used within AdminContentProvider');
  return ctx;
}
