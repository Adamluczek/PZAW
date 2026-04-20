import session from "express-session";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

class SQLiteSessionStore extends session.Store {
  constructor(options = {}) {
    super();

    const dbUrl =
      options.dbPath || new URL("../sessions.sqlite", import.meta.url);
    const resolvedPath = dbUrl instanceof URL ? fileURLToPath(dbUrl) : dbUrl;

    this.ttl = options.ttl || 1000 * 60 * 60;
    this.db = new DatabaseSync(resolvedPath);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        expired INTEGER NOT NULL,
        sess TEXT NOT NULL
      );
    `);

    this.getStmt = this.db.prepare(
      "SELECT sess, expired FROM sessions WHERE sid = ?;",
    );
    this.upsertStmt = this.db.prepare(`
      INSERT INTO sessions (sid, expired, sess)
      VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET
        expired = excluded.expired,
        sess = excluded.sess;
    `);
    this.deleteStmt = this.db.prepare("DELETE FROM sessions WHERE sid = ?;");
    this.deleteExpiredStmt = this.db.prepare(
      "DELETE FROM sessions WHERE expired <= ?;",
    );
  }

  cleanupExpiredSessions() {
    this.deleteExpiredStmt.run(Date.now());
  }

  get(sid, callback) {
    try {
      this.cleanupExpiredSessions();
      const row = this.getStmt.get(sid);

      if (!row) {
        return callback?.(null, null);
      }

      return callback?.(null, JSON.parse(row.sess));
    } catch (err) {
      return callback?.(err);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const expires = sessionData?.cookie?.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + this.ttl;

      this.upsertStmt.run(sid, expires, JSON.stringify(sessionData));
      return callback?.(null);
    } catch (err) {
      return callback?.(err);
    }
  }

  destroy(sid, callback) {
    try {
      this.deleteStmt.run(sid);
      return callback?.(null);
    } catch (err) {
      return callback?.(err);
    }
  }

  touch(sid, sessionData, callback) {
    return this.set(sid, sessionData, callback);
  }
}

export default SQLiteSessionStore;
