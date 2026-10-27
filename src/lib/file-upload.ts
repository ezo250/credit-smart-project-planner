export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

export async function readFilesAsDataUrls(files: FileList | File[]) {
  const items = Array.from(files ?? []);

  const results = await Promise.all(
    items.map(async (file) => ({
      url: await readFileAsDataUrl(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    })),
  );

  return results;
}
