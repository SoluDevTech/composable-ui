export interface IRagFilePort {
  uploadFile(
    prefix: string,
    file: File,
  ): Promise<{ object_name: string; size: number; message: string }>;
}
