import { EventEmitter } from 'events';

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [name: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

export type Path = ReadonlyArray<string|number>;
export interface Snapshot {
    id: string;
    v: number;
    type: string | null;
    data: JSONObject | undefined;
    m: SnapshotMeta | null;
}

export interface ChangelogEntry  {
    t1: number;
    t2: number;
    v1: number;
    v2: number;
    c: number;
}
export interface ChangelogEntryWithSources extends ChangelogEntry {
    src: string[];
}

export interface Changelog<T extends ChangelogEntry = ChangelogEntry> {
    id: string;
    data: T[];
}

export interface SnapshotMeta {
    ctime: number;
    mtime: number;
    // Users can use server middleware to add additional metadata to snapshots.
    [key: string]: JSONValue;
}

export interface AddNumOp { p: Path; na: number; }

export interface ListInsertOp  { p: Path; li: any; }
export interface ListDeleteOp  { p: Path; ld: any; }
export interface ListReplaceOp { p: Path; li: any; ld: any; }
export interface ListMoveOp    { p: Path; lm: any; }

export interface ObjectInsertOp  { p: Path; oi: any; }
export interface ObjectDeleteOp  { p: Path; od: any; }
export interface ObjectReplaceOp { p: Path; oi: any; od: any; }

export interface StringInsertOp { p: Path; si: string; }
export interface StringDeleteOp { p: Path; sd: string; }

export interface SubtypeOp { p: Path; t: string; o: any; }

export type Op = AddNumOp | ListInsertOp | ListDeleteOp | ListReplaceOp | ListMoveOp | ObjectInsertOp | ObjectDeleteOp | ObjectReplaceOp | StringInsertOp | StringDeleteOp | SubtypeOp;

export interface RawOp {
    src: string;
    seq: number;
    v: number;
    op: Op[];
    m: any;
    c: string;
    d: string;
}
export type OTType = 'ot-text' | 'ot-json0' | 'ot-text-tp2' | 'rich-text';
export interface Error {
    code: number;
    message: string;
}
export interface ShareDBSourceOptions { source?: any; }
// interface ShareDBCreateOptions extends ShareDBSourceOptions {}
// interface ShareDBDelOptions extends ShareDBSourceOptions {}
interface ShareDBSubmitOpOptions extends ShareDBSourceOptions {
  skipNoop?: boolean;
  undoable?: boolean;
  fixUp?: boolean;
}

export type Callback = (err: Error) => any;

export interface ShareDBSubscribeOptions {
  handleOpsSeparately?: boolean;
}

export type DocEvent = 'load' | 'create' | 'before op' | 'op' | 'del' | 'error' | 'no write pending' | 'nothing pending';

export class Doc<P = any> extends EventEmitter {
    type: string;
    id: string;
    data: any;
    presence: P;
    fetch: (callback: (err: Error) => void) => void;
    subscribe: (callback: (err: Error) => void, options?: ShareDBSubscribeOptions) => void;

    on(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    on(event: 'create', callback: (source: any) => void): this;
    on(event: 'op' | 'before op', callback: (ops: Op[], source: any) => void): this;
    on(event: 'del', callback: (data: any, source: any) => void): this;
    on(event: 'error', callback: (err: Error) => void): this;
    on(event: 'presence', callback: (source: any) => void): this;

    addListener(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    addListener(event: 'create', callback: (source: any) => void): this;
    addListener(event: 'op' | 'before op', callback: (ops: Op[], source: any) => void): this;
    addListener(event: 'del', callback: (data: any, source: any) => void): this;
    addListener(event: 'error', callback: (err: Error) => void): this;

    ingestSnapshot(snapshot: Snapshot, callback: Callback): void;
    destroy(): void;
    create(data: any, callback?: Callback): void;
    create(data: any, type?: OTType, callback?: Callback): void;
    create(data: any, type?: OTType, options?: ShareDBSourceOptions, callback?: Callback): void;
    submitOp(data: ReadonlyArray<Op>, options?: ShareDBSubmitOpOptions, callback?: Callback): void;
    del(options: ShareDBSourceOptions, callback: (err: Error) => void): void;
    whenNothingPending(callback: (err: Error) => void): void;
    submitPresence(presence: P, callback: (err: Error) => void): void;
}

export type QueryEvent = 'ready' | 'error' | 'changed' | 'insert' | 'move' | 'remove' | 'extra';
export class Query extends EventEmitter {
    ready: boolean;
    results: Doc[];
    extra: any;
    on(event: QueryEvent, callback: (...args: any[]) => any): this;
    addListener(event: QueryEvent, callback: (...args: any[]) => any): this;
    removeListener(event: QueryEvent, listener: (...args: any[]) => any): this;
    destroy(): void;
}

export type RequestAction = 'qf' | 'qs' | 'qu' | 'bf' | 'bs' | 'bu' | 'f' | 's' | 'u' | 'op' | 'nf' | 'nt' | 'nc';

export interface ClientRequest {
    /** Short name of the request's action */
    a: RequestAction;

    [propertyName: string]: JSONValue;
}
