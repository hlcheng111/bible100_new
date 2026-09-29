import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'bible_reader.db';
const BUNDLED = require('../../assets/bible/bible_reader.db');

/**
 * Copy pre-built SQLite from app assets into sandbox on first launch.
 */
export async function ensureBundledBibleDb(): Promise<SQLite.SQLiteDatabase> {
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
  const dir = `${FileSystem.documentDirectory}SQLite`;
  const info = await FileSystem.getInfoAsync(dbPath);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const asset = Asset.fromModule(BUNDLED);
    await asset.downloadAsync();
    if (asset.localUri) {
      await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });
    }
  }

  return SQLite.openDatabaseAsync(DB_NAME);
}
