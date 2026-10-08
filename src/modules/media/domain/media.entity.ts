export type MediaType = "foto" | "glb" | "panorama";

export interface MediaItem {
  id: string;
  local_id: string;
  tipo: MediaType;
  url: string;
  orden: number;
  created_at: string;
}

export interface IMediaRepository {
  findByLocalId(localId: string): Promise<MediaItem[]>;
  create(item: Omit<MediaItem, "created_at">): Promise<MediaItem>;
  delete(id: string): Promise<boolean>;
}

export interface IStorageService {
  upload(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string
  ): Promise<{ url: string }>;
  getPublicUrl(path: string): string;
  remove(url: string): Promise<boolean>;
}
