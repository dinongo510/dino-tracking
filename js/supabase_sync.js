/**
 * Dino Tracking - Supabase Real-Time Cloud Sync Engine (v5.2)
 * Seamless multi-device synchronization (PC, iPhone & Android PWA) with offline-first resilience
 */

const SUPABASE_CONFIG = {
  URL: "https://eajrahcceqherykjvtyn.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhanJhaGNjZXFoZXJ5a2p2dHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjc5NjksImV4cCI6MjEwNDk0Mzk2OX0.J36Fniadu0roXBPloEhu8SmfsvrJ8wxKvMCFrwDzpgc",
  TABLE: "dino_user_data",
  DEFAULT_USER_ID: "dino_athlete_default",
  POLL_INTERVAL_MS: 30000, // Background check every 30s when app is active
  SQL_SETUP: `-- SQL MIGRATION CHO DINO TRACKING CLOUD SYNC
-- Chạy đoạn mã này trong Supabase Dashboard -> SQL Editor:

CREATE TABLE IF NOT EXISTS public.dino_user_data (
  user_id TEXT PRIMARY KEY DEFAULT 'dino_athlete_default',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT
);

-- Bật Row Level Security và cấp quyền đọc/ghi cho client anon
ALTER TABLE public.dino_user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on dino_user_data" ON public.dino_user_data;
CREATE POLICY "Allow anon all on dino_user_data" 
ON public.dino_user_data FOR ALL TO anon USING (true) WITH CHECK (true);`
};

class DinoSupabaseSync {
  constructor(storageInstance) {
    this.storage = storageInstance || (typeof window !== "undefined" ? window.dinoStorage : null);
    this.userId = localStorage.getItem("dino_cloud_user_id") || SUPABASE_CONFIG.DEFAULT_USER_ID;
    this.deviceId = this.getOrCreateDeviceId();
    this.status = "idle"; // 'idle' | 'syncing' | 'synced' | 'error' | 'table_missing' | 'offline'
    this.lastSyncedAt = localStorage.getItem("dino_cloud_last_synced") || null;
    this.pushDebounceTimer = null;
    this.pollIntervalTimer = null;
    this.isSyncing = false;
    this.hasPendingPush = false;
  }

  getOrCreateDeviceId() {
    let id = localStorage.getItem("dino_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      localStorage.setItem("dino_device_id", id);
    }
    return id;
  }

  getUserId() {
    return this.userId;
  }

  setUserId(newUserId) {
    const cleaned = (newUserId || "").trim();
    if (!cleaned) return;
    this.userId = cleaned;
    localStorage.setItem("dino_cloud_user_id", cleaned);
    this.syncNow();
  }

  // REST helper with API Key, Bearer Token and auto-retry for resilient mobile connection
  async fetchApi(path, options = {}, retries = 2) {
    const url = `${SUPABASE_CONFIG.URL}/rest/v1${path}`;
    const headers = {
      "apikey": SUPABASE_CONFIG.ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;
        const fetchOptions = {
          ...options,
          headers,
          ...(controller ? { signal: controller.signal } : {})
        };

        const res = await fetch(url, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);

        // Retry on transient server errors (502, 503, 504)
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
          console.warn(`[Supabase Sync] Transient status ${res.status}, retrying in ${(attempt + 1)}s...`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }

        return res;
      } catch (err) {
        if (attempt < retries) {
          console.warn(`[Supabase Sync] Network glitch: ${err.message}. Retrying attempt ${attempt + 1}...`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
  }

  // Set status and dispatch event to UI
  setStatus(status, message = "") {
    this.status = status;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dino:cloud-status", {
        detail: { status, message, lastSyncedAt: this.lastSyncedAt, userId: this.userId }
      }));
    }
  }

  // Initialize and perform initial sync
  async init() {
    this.setStatus("syncing", "Đang kết nối Supabase Cloud...");

    // Event listeners for automatic sync triggers
    if (typeof window !== "undefined") {
      // 1. Resume / Focus / Visibility change (e.g. switching between phone apps)
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.pullFromCloud();
        }
      });
      window.addEventListener("focus", () => {
        this.pullFromCloud();
      });

      // 2. Reconnection listener
      window.addEventListener("online", () => {
        this.setStatus("syncing", "Đã có mạng trở lại, đang đồng bộ...");
        this.syncNow();
      });

      window.addEventListener("offline", () => {
        this.setStatus("offline", "Ngoại tuyến (Lưu cục bộ)");
      });

      // 3. Periodic light background poll when active
      if (this.pollIntervalTimer) clearInterval(this.pollIntervalTimer);
      this.pollIntervalTimer = setInterval(() => {
        if (document.visibilityState === "visible" && navigator.onLine && !this.isSyncing) {
          this.pullFromCloud({ silent: true });
        }
      }, SUPABASE_CONFIG.POLL_INTERVAL_MS);
    }

    // Initial pull & sync
    await this.syncNow();
  }

  // Pull latest snapshot from Supabase with smart merge
  async pullFromCloud(options = {}) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setStatus("offline", "Ngoại tuyến (Offline)");
      return { success: false, offline: true };
    }

    if (!options.silent) {
      this.setStatus("syncing", "Đang kiểm tra Cloud...");
    }

    try {
      const res = await this.fetchApi(`/${SUPABASE_CONFIG.TABLE}?user_id=eq.${encodeURIComponent(this.userId)}&select=*`);
      
      if (res.status === 404 || res.status === 400) {
        this.setStatus("table_missing", "Chưa tạo bảng dino_user_data trên Supabase");
        return { success: false, tableMissing: true };
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const rows = await res.json();

      // Case A: Cloud has no record for this user_id -> Push initial local data to populate cloud
      if (!rows || rows.length === 0) {
        console.log("[Supabase Sync] No cloud record found. Performing initial push from local...");
        return await this.pushToCloud();
      }

      const cloudRecord = rows[0];
      const cloudData = cloudRecord.data;
      const cloudUpdatedAt = cloudRecord.updated_at ? new Date(cloudRecord.updated_at).getTime() : 0;
      const localUpdatedAt = parseInt(localStorage.getItem("dino_local_last_updated") || "0");

      // Check if cloud data is valid and structured
      const isCloudValid = cloudData && typeof cloudData === "object" && (cloudData.programs || cloudData.workoutHistory || cloudData.version);

      if (!isCloudValid) {
        // Cloud contains an empty or probe payload -> push local data to overwrite
        console.log("[Supabase Sync] Cloud data is placeholder/empty. Pushing local data...");
        return await this.pushToCloud();
      }

      // Case B: Cloud is newer or local is fresh -> import cloud snapshot
      if (cloudUpdatedAt > localUpdatedAt || localUpdatedAt === 0) {
        // Smart merge: if local has offline workouts not yet in cloud, preserve them!
        const mergedData = this.mergeSnapshots(this.storage.exportFullSnapshot(), cloudData);

        if (this.storage && this.storage.importFullSnapshot) {
          this.storage.importFullSnapshot(mergedData);
          this.lastSyncedAt = new Date().toISOString();
          localStorage.setItem("dino_cloud_last_synced", this.lastSyncedAt);
          localStorage.setItem("dino_local_last_updated", String(cloudUpdatedAt));
          this.setStatus("synced", "Đã đồng bộ từ Cloud");

          // Dispatch sync event to trigger UI refresh
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("dino:cloud-synced", { detail: { source: "pull", timestamp: this.lastSyncedAt } }));
          }
          return { success: true, updated: true };
        }
      } else if (localUpdatedAt > cloudUpdatedAt) {
        // Case C: Local is newer (logged workout offline) -> push to cloud
        console.log("[Supabase Sync] Local data is newer than cloud. Pushing...");
        return await this.pushToCloud();
      }

      this.setStatus("synced", "Dữ liệu mới nhất");
      return { success: true, updated: false };
    } catch (err) {
      console.warn("[Supabase Sync] Pull error:", err);
      this.setStatus("error", "Lỗi kết nối Cloud");
      return { success: false, error: err.message };
    }
  }

  // Merge snapshots to prevent data loss during offline cross-device sync
  mergeSnapshots(local, cloud) {
    if (!cloud) return local;
    if (!local) return cloud;

    const result = { ...cloud };

    // Merge Workout History by ID
    const localHistory = Array.isArray(local.workoutHistory) ? local.workoutHistory : [];
    const cloudHistory = Array.isArray(cloud.workoutHistory) ? cloud.workoutHistory : [];
    const historyMap = new Map();

    cloudHistory.forEach(h => { if (h && h.id) historyMap.set(h.id, h); });
    localHistory.forEach(h => { if (h && h.id && !historyMap.has(h.id)) historyMap.set(h.id, h); });

    result.workoutHistory = Array.from(historyMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Merge Running Logs by ID
    const localRuns = Array.isArray(local.runLogs) ? local.runLogs : [];
    const cloudRuns = Array.isArray(cloud.runLogs) ? cloud.runLogs : [];
    const runsMap = new Map();

    cloudRuns.forEach(r => { if (r && r.id) runsMap.set(r.id, r); });
    localRuns.forEach(r => { if (r && r.id && !runsMap.has(r.id)) runsMap.set(r.id, r); });

    result.runLogs = Array.from(runsMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Programs: Keep all programs from cloud and any unique custom programs from local
    if (Array.isArray(cloud.programs) && Array.isArray(local.programs)) {
      const progMap = new Map();
      cloud.programs.forEach(p => { if (p && p.id) progMap.set(p.id, p); });
      local.programs.forEach(p => { if (p && p.id && !progMap.has(p.id)) progMap.set(p.id, p); });
      result.programs = Array.from(progMap.values());
    }

    return result;
  }

  // Push local snapshot to Supabase (Upsert)
  async pushToCloud() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.hasPendingPush = true;
      this.setStatus("offline", "Ngoại tuyến (Lưu cục bộ)");
      return { success: false, offline: true };
    }

    try {
      this.setStatus("syncing", "Đang lưu lên Cloud...");
      const localData = this.storage ? this.storage.exportFullSnapshot() : {};
      const nowIso = new Date().toISOString();
      const nowTs = Date.now();
      localStorage.setItem("dino_local_last_updated", String(nowTs));

      const payload = {
        user_id: this.userId,
        data: localData,
        updated_at: nowIso,
        device_id: this.deviceId
      };

      const res = await this.fetchApi(`/${SUPABASE_CONFIG.TABLE}`, {
        method: "POST",
        headers: {
          "Prefer": "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 404 || res.status === 400) {
        this.setStatus("table_missing", "Chưa tạo bảng dino_user_data");
        return { success: false, tableMissing: true };
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      this.lastSyncedAt = nowIso;
      this.hasPendingPush = false;
      localStorage.setItem("dino_cloud_last_synced", this.lastSyncedAt);
      this.setStatus("synced", "Đã lưu lên Supabase Cloud");
      return { success: true };
    } catch (err) {
      console.warn("[Supabase Sync] Push error:", err);
      this.hasPendingPush = true;
      this.setStatus("error", "Lỗi tải lên Cloud");
      return { success: false, error: err.message };
    }
  }

  // Trigger debounced auto-push whenever local data changes
  triggerAutoPush() {
    if (this.pushDebounceTimer) clearTimeout(this.pushDebounceTimer);
    this.setStatus("syncing", "Đang lưu lên Cloud...");
    this.pushDebounceTimer = setTimeout(() => {
      this.pushToCloud();
    }, 1200);
  }

  // Full Two-Way Sync (Pull newest from cloud, merge, then push if needed)
  async syncNow() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.setStatus("syncing", "Đang đồng bộ...");

    try {
      const pullRes = await this.pullFromCloud();
      if (!pullRes.updated && !pullRes.tableMissing) {
        await this.pushToCloud();
      }
    } finally {
      this.isSyncing = false;
    }
  }
}

if (typeof window !== "undefined") {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.DinoSupabaseSync = DinoSupabaseSync;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DinoSupabaseSync, SUPABASE_CONFIG };
}
