import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import { IStorageService } from "../domain/media.entity";
import { env } from "@/shared/config/env";

const BUCKET_NAME = "locales-media";

export class SupabaseStorageService implements IStorageService {
  private get storage() {
    return getSupabaseServiceClient().storage;
  }

  async upload(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string
  ): Promise<{ url: string }> {
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `uploads/${safeName}`;

    const { error } = await this.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error)
      throw new Error(`Error al subir archivo a Supabase Storage: ${error.message}`);

    const publicUrl = this.getPublicUrl(filePath);
    return { url: publicUrl };
  }

  getPublicUrl(path: string): string {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
  }

  async remove(fileUrl: string): Promise<boolean> {
    try {
      // Extract the path from the full URL
      const prefix = `${env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/${BUCKET_NAME}/`;
      let filePath: string;

      if (fileUrl.startsWith(prefix)) {
        filePath = fileUrl.slice(prefix.length);
      } else {
        // Assume it's already a relative path
        filePath = fileUrl;
      }

      const { error } = await this.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return !error;
    } catch {
      return false;
    }
  }
}
