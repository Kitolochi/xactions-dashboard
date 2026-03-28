declare module "sql.js" {
  interface Database {
    prepare(sql: string): Statement;
    run(sql: string, params?: unknown[]): void;
    close(): void;
    export(): Uint8Array;
  }

  interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export type { Database, Statement, SqlJsStatic };
  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlJsStatic>;
}
