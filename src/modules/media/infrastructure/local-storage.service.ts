import fs from "fs";
import path from "path";
import { IStorageService } from "../domain/media.entity";

export class LocalDiskStorageService implements IStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async upload(
    file: Buffer | Uint8Array,
    fileName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contentType: string
  ): Promise<{ url: string }> {
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(this.uploadsDir, safeName);
    await fs.promises.writeFile(filePath, file);

    return {
      url: `/uploads/${safeName}`,
    };
  }

  getPublicUrl(relativePath: string): string {
    return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  }

  async remove(fileUrl: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
