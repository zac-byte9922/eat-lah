import { AppState } from '../domain/types';
import { emptyState } from '../domain/kitchen';
import { stateSchema } from './schema';

/** The local adapter stores one atomic JSON document. A Supabase adapter must
 * instead send domain commands to authenticated, transactional PostgreSQL RPCs.
 * It must never upload a client snapshot as trusted inventory state. */
export interface KitchenRepository {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
}
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export const STORAGE_KEY = 'eat-lah-mobile:v1';
export class LocalKitchenRepository implements KitchenRepository {
  constructor(private storage: KeyValueStorage) {}
  async load(): Promise<AppState> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (raw === null) return emptyState();
    try {
      return stateSchema.parse(JSON.parse(raw));
    } catch {
      throw new Error(
        '本机资料无法读取或版本不兼容。原始资料已保留，请先导出备份再处理。',
      );
    }
  }
  async save(state: AppState) {
    const valid = stateSchema.parse(state);
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(valid));
  }
}

// Serialized write-before-publish avoids lost writes and duplicate deductions.
export class KitchenSession {
  private current: AppState | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private repository: KitchenRepository) {}
  async load() {
    this.current = await this.repository.load();
    return this.current;
  }
  update(transform: (s: AppState) => AppState): Promise<AppState> {
    const job = this.queue.then(async () => {
      if (!this.current) throw new Error('资料尚未加载。');
      const next = transform(this.current);
      if (next !== this.current) await this.repository.save(next);
      this.current = next;
      return next;
    });
    this.queue = job.catch(() => undefined);
    return job;
  }
}
