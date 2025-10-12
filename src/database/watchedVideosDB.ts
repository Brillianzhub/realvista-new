import * as SQLite from 'expo-sqlite';

// Open or create the database
const db = SQLite.openDatabaseSync('realvista.db');

// Initialize the table
export async function initWatchedTable() {
    try {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS watched_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT UNIQUE
      );
    `);
    } catch (error) {
        console.error('Error initializing watched_videos table:', error);
    }
}

// Add a watched video
export async function addWatchedVideo(videoId: string) {
    try {
        await db.runAsync('INSERT OR IGNORE INTO watched_videos (video_id) VALUES (?);', [videoId]);
    } catch (error) {
        console.error('Error adding watched video:', error);
    }
}

// Remove a watched video
export async function removeWatchedVideo(videoId: string) {
    try {
        await db.runAsync('DELETE FROM watched_videos WHERE video_id = ?;', [videoId]);
    } catch (error) {
        console.error('Error removing watched video:', error);
    }
}

// Check if a video is watched
export async function isVideoWatched(videoId: string): Promise<boolean> {
    try {
        const result = await db.getFirstAsync('SELECT * FROM watched_videos WHERE video_id = ?;', [videoId]);
        return !!result;
    } catch (error) {
        console.error('Error checking watched video:', error);
        return false;
    }
}

// Get all watched videos
export async function getAllWatchedVideos(): Promise<string[]> {
    try {
        const rows = await db.getAllAsync('SELECT video_id FROM watched_videos;');
        return rows.map((r: any) => r.video_id);
    } catch (error) {
        console.error('Error fetching watched videos:', error);
        return [];
    }
}
