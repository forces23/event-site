import { create } from "zustand";
import axios from "axios";
import type { PhotoDocument } from "@/types";

interface GalleryStore {
  photos: PhotoDocument[];
  isLoading: boolean;
  lastFetched: Date | null;
  fetchPhotos: () => Promise<void>;
  addPhotos: (photos: PhotoDocument[]) => void;
  removePhoto: (id: string) => void;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  photos: [],
  isLoading: false,
  lastFetched: null,

  fetchPhotos: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await axios.get<{ photos: PhotoDocument[] }>("/api/gallery");
      set({ photos: data.photos, lastFetched: new Date() });
    } catch {
      // Silently fail — gallery stays as-is
    } finally {
      set({ isLoading: false });
    }
  },

  addPhotos: (incoming) =>
    set((state) => {
      const existingIds = new Set(state.photos.map((p) => p._id));
      const newPhotos = incoming.filter((p) => !existingIds.has(p._id));
      return { photos: [...newPhotos, ...state.photos] };
    }),

  removePhoto: (id) =>
    set((state) => ({ photos: state.photos.filter((p) => p._id !== id) })),
}));
