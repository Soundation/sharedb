/// <reference path="sharedb.d.ts" />
import * as WS from 'ws';
import * as ShareDB from './sharedb';
import {IUndoManagerOptions, UndoManager} from "./client/undoManager";

export interface MsgEncoder {
    encode: (data: any) => any;
    decode: (data: any) => any;
    decodeAsync?: boolean;
}

export type ConnectionEvent = 'error' | 'connected' | 'connecting' | 'disconnected' | 'send' | 'receive' | 'state' | 'doc' | 'connection error' | 'closed' | 'stopped' | 'notification'

export interface ChangelogOptions {
    bucket?: number;
    sources?: boolean;
    since?:  number;
}

export class Connection<P = any> {
    public id: string;
    public canSend: boolean;
    constructor(ws: WebSocket | WS, encoder?: MsgEncoder);
    get(collectionName: string, documentID: string): Doc<P>;
    createFetchQuery(collectionName: string, query: string, options: {results?: Query[]}, callback: (err: Error, results: any) => any): Query;
    createSubscribeQuery(collectionName: string, query: string, options: {results?: Query[]}, callback: (err: Error, results: any) => any): Query;
    createUndoManager(options?: IUndoManagerOptions): UndoManager;
    send(message: any): void;
    on(event: ConnectionEvent, handler: (...args: any[]) => any): void;
    off(event: ConnectionEvent, handler: (...args: any[]) => any): void;
    addListener(event: ConnectionEvent, handler: (...args: any[]) => any): void;
    removeListener(event: ConnectionEvent, handler: (...args: any[]) => any): void;
    fetchSnapshot(collection: string, id: string, version: number | null, callback: (err: Error | null, snapshot: ShareDB.Snapshot) => any): any;
    fetchSnapshot(collection: string, id: string, callback: (err: Error | null, snapshot: ShareDB.Snapshot) => any): any;
    fetchChangelog(collection: string, id: string, options: ChangelogOptions & { sources: true }, callback: (err: Error | null, changelog: ShareDB.Changelog<ShareDB.ChangelogEntryWithSources>) => any): any;
    fetchChangelog(collection: string, id: string, options: ChangelogOptions | null, callback: (err: Error | null, changelog: ShareDB.Changelog) => any): any;
    fetchChangelog(collection: string, id: string, callback: (err: Error | null, changelog: ShareDB.Changelog) => any): any;
}
export type Doc<P = any> = ShareDB.Doc<P>;
export type Query = ShareDB.Query;
export type Error = ShareDB.Error;
export type Op = ShareDB.Op;
export type AddNumOp = ShareDB.AddNumOp;
export type ListMoveOp = ShareDB.ListMoveOp;
export type ListInsertOp = ShareDB.ListInsertOp;
export type ListDeleteOp = ShareDB.ListDeleteOp;
export type ListReplaceOp = ShareDB.ListReplaceOp;
export type StringInsertOp = ShareDB.StringInsertOp;
export type StringDeleteOp = ShareDB.StringDeleteOp;
export type ObjectInsertOp = ShareDB.ObjectInsertOp;
export type ObjectDeleteOp = ShareDB.ObjectDeleteOp;
export type ObjectReplaceOp = ShareDB.ObjectReplaceOp;
export type SubtypeOp = ShareDB.SubtypeOp;

export type Path = ShareDB.Path;
export type ShareDBSourceOptions = ShareDB.ShareDBSourceOptions;
