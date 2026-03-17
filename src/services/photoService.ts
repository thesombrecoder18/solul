import * as FileSystem from 'expo-file-system/legacy';

const SOLUL_IMAGE_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}solul_images/`
  : null;

function guessExtension(uri: string): string {
  const clean = uri.split('?')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return 'jpg';
  const ext = match[1].toLowerCase();
  if (ext.length > 5) return 'jpg';
  return ext;
}

function makeFileName(ext: string): string {
  const rand = Math.random().toString(16).slice(2);
  return `img_${Date.now()}_${rand}.${ext}`;
}

async function ensureDir(): Promise<void> {
  if (!SOLUL_IMAGE_DIR) return;
  const info = await FileSystem.getInfoAsync(SOLUL_IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(SOLUL_IMAGE_DIR, { intermediates: true });
  }
}

function isManagedSolulUri(uri: string): boolean {
  return !!SOLUL_IMAGE_DIR && uri.startsWith(SOLUL_IMAGE_DIR);
}

export const photoService = {
  /**
   * Copie une image dans le dossier de l'app pour garantir la persistance.
   * Retourne une URI locale stable (FileSystem.documentDirectory).
   */
  persistImageUri: async (uri: string): Promise<string> => {
    if (!uri) return uri;
    if (isManagedSolulUri(uri)) return uri;
    if (!SOLUL_IMAGE_DIR) return uri;

    await ensureDir();
    const ext = guessExtension(uri);
    const fileName = makeFileName(ext);
    const dest = `${SOLUL_IMAGE_DIR}${fileName}`;

    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      // Fallback: si la copie échoue, on garde l'URI d'origine (MVP)
      return uri;
    }
  },

  /**
   * Supprime un fichier image seulement si c'est une URI gérée par SOLUL.
   */
  deleteIfManaged: async (uri: string | undefined | null): Promise<void> => {
    if (!uri) return;
    if (!isManagedSolulUri(uri)) return;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // ignore
    }
  },

  /**
   * Supprime un lot d'images gérées par SOLUL.
   */
  deleteManyIfManaged: async (uris: string[] | undefined | null): Promise<void> => {
    if (!uris || uris.length === 0) return;
    await Promise.all(uris.map((u) => photoService.deleteIfManaged(u)));
  },
};

