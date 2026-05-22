import { create } from "zustand";

interface PublicSettingsStore {
  wishlistEnabled:    boolean;
  herGalleryEnabled:  boolean;
  registryUrl:        string;
  fetched:            boolean;
  fetchSettings:      () => Promise<void>;
}

export const useSettingsStore = create<PublicSettingsStore>((set, get) => ({
  wishlistEnabled:   true,
  herGalleryEnabled: true,
  registryUrl:       "",
  fetched:           false,

  fetchSettings: async () => {
    if (get().fetched) return;
    try {
      const res = await fetch("/api/settings");
      const d   = await res.json() as {
        wishlist_enabled?:    boolean;
        her_gallery_enabled?: boolean;
        registry_url?:        string;
      };
      set({
        wishlistEnabled:   d.wishlist_enabled   ?? true,
        herGalleryEnabled: d.her_gallery_enabled ?? true,
        registryUrl:       d.registry_url        ?? "",
        fetched:           true,
      });
    } catch {
      set({ fetched: true });
    }
  },
}));
