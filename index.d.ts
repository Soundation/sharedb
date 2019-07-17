// Type definitions for sharedb 1.0
// Project: https://github.com/share/sharedb
// Definitions by: Steve Oney <https://github.com/soney>
//                 Eric Hwang <https://github.com/ericyhwang>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

/// <reference path="lib/sharedb.d.ts" />

import * as ShareDB from './lib/sharedb';
import { EventEmitter } from 'events';

export = sharedb;

declare class sharedb<S> extends EventEmitter {

  static logger: sharedb.Logger;

  public db: sharedb.DB;
  public pubsub: sharedb.PubSub;
  public middleware: {
    [A in keyof sharedb.middleware.ActionContextMap<S>]: ((context: sharedb.middleware.ActionContextMap<S>[A], callback: sharedb.NextFn) => void)[];
  }

  constructor(options?: {db?: any, pubsub?: sharedb.PubSub, disableDocAction?: boolean, disableSpaceDelimitedActions?: boolean});
  connect: (connection?: any, req?: S) => sharedb.Connection;
  /**
   * Registers a projection that can be used from clients just like a normal collection.
   *
   * @param name name of the projection
   * @param collection name of the backing collection
   * @param fields field whitelist for the projection
   */
  addProjection(name: string, collection: string, fields: sharedb.ProjectionFields): void;
  listen(stream: any, request?: S): void;
  close(callback?: (err?: Error) => any): void;
  /**
   * Registers a server middleware function.
   *
   * @param action name of an action from https://github.com/share/sharedb#middlewares
   * @param fn listener invoked when the specified action occurs
   */
  use<A extends keyof sharedb.middleware.ActionContextMap<S>>(
      action: A,
      fn: (context: sharedb.middleware.ActionContextMap<S>[A], callback: sharedb.NextFn) => void
  ): void;
  static types: {
      register: (type: { name?: string, uri?: string, [key: string]: any}) => void;
  };
}

declare namespace sharedb {
  export interface LoggerApi {
    info: (msg: string, ...rest: any[]) => void;
    warn: (msg: string, ...rest: any[]) => void;
    error: (msg: string, ...rest: any[]) => void;
  }

  export interface PubSubOptions {
    prefix?: string;
  }

  export interface Stream {
    id: string;
  }

  export interface Logger extends LoggerApi {
    setMethods(logger: LoggerApi): void;
  }

  export abstract class DB {
    projectsSnapshots: boolean;
    disableSubscribe: boolean;
    close(callback?: () => void): void;
    commit(collection: string, id: string, op: Op, snapshot: any, options: any, callback: (...args: any[]) => any): void;
    getSnapshot(collection: string, id: string, fields: any, options: any, callback: (...args: any[]) => any): void;
    getSnapshotBulk(collection: string, ids: string, fields: any, options: any, callback: (...args: any[]) => any): void;
    getOps(collection: string, id: string, from: number, to: number, options: any, callback: (...args: any[]) => any): void;
    getOpsToSnapshot(collection: string, id: string, from: number, snapshot: number, options: any, callback: (...args: any[]) => any): void;
    getOpsBulk(collection: string, fromMap: any, toMap: any, options: any, callback: (...args: any[]) => any): void;
    getCommittedOpVersion(collection: string, id: string, snapshot: any, op: any, options: any, callback: (...args: any[]) => any): void;
    query(collection: string, query: Query, fields: any, options: any, callback: (...args: any[]) => any): void;
    queryPoll(collection: string, query: Query, options: any, callback: (...args: any[]) => any): void;
    queryPollDoc(collection: string, id: string, query: Query, options: any, callback: (...args: any[]) => any): void;
    canPollDoc(): boolean;
    skipPoll(): boolean;
  }

  export class MemoryDB extends DB { }

  export abstract class PubSub {
    private static shallowCopy(obj: any): any;
    protected prefix?: string;
    protected nextStreamId: number;
    protected streamsCount: number;
    protected streams: {
        [channel: string]: Stream;
    };
    protected subscribed: {
        [channel: string]: boolean;
    };
    protected constructor(options?: PubSubOptions);
    close(callback?: (err: Error|null) => void): void;
    publish(channels: string[], data: {[k: string]: any}, callback: (err: Error | null) => void): void;
    subscribe(channel: string, callback: (err: Error | null, stream?: Stream) => void): void;
    protected abstract _subscribe(channel: string, callback: (err: Error | null) => void): void;
    protected abstract _unsubscribe(channel: string, callback: (err: Error | null) => void): void;
    protected abstract _publish(channels: string[], data: any, callback: (err: Error | null) => void): void;
    protected _emit(channel: string, data: {[k: string]: any}): void;
    private _createStream(channel): void;
    private _removeStream(channel, stream): void;
  }

  export class Connection {
    constructor(ws: WebSocket);
    get(collectionName: string, documentID: string): ShareDB.Doc;
    createFetchQuery(collectionName: string, query: string, options: {results?: ShareDB.Query[]}, callback: (err: Error, results: any) => any): ShareDB.Query;
    createSubscribeQuery(collectionName: string, query: string, options: {results?: ShareDB.Query[]}, callback: (err: Error, results: any) => any): ShareDB.Query;
  }

  export class Agent<S> {
    clientId: string;
    connectTime: number;
    closed: boolean;
    close: (err?: Error) => void;
    session: S;
    custom: any;
  }

  export type NextFn = (err?: any) => void;
  export type Doc = ShareDB.Doc;
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

  export interface Projection {
    target: string;
    fields: ProjectionFields;
  }

  export interface ProjectionFields {
    [propertyName: string]: true;
  }

  export interface SubmitRequest {
    index: string;
    projection: Projection | undefined;
    collection: string;
    id: string;
    op: sharedb.Op;
    options: any;
    start: number;

    saveMilestoneSnapshot: boolean | null;
    suppressPublish: boolean | null;
    maxRetries: number | null;
    retries: number;

    snapshot: ShareDB.Snapshot | null;
    ops: ShareDB.Op[];
    channels: string[] | null;
  }

  namespace middleware {
    export interface ActionContextMap<S> {
      afterSubmit: SubmitContext<S>;
      apply: ApplyContext<S>;
      commit: CommitContext<S>;
      connect: ConnectContext<S>;
      doc: DocContext<S>;  // Deprecated, use 'readSnapshots' instead.
      op: OpContext<S>;
      query: QueryContext<S>;
      readSnapshots: ReadSnapshotsContext<S>;
      receive: ReceiveContext<S>;
      reply: ReplyContext<S>;
      submit: SubmitContext<S>;
    }

    export interface BaseContext<S> {
      action: keyof ActionContextMap<S>;
      agent: Agent<S>;
      backend: sharedb<S>;
    }

    export interface ApplyContext<S> extends BaseContext<S>, SubmitRequest {
    }

    export interface CommitContext<S> extends BaseContext<S>, SubmitRequest {
    }

    export interface ConnectContext<S> extends BaseContext<S> {
      stream: any;
      req: S;  // Property always exists, value may be undefined
    }

    export interface DocContext<S> extends BaseContext<S> {
      collection: string;
      id: string;
      snapshot: ShareDB.Snapshot;
    }

    export interface OpContext<S> extends BaseContext<S> {
      collection: string;
      id: string;
      op: ShareDB.Op;
    }

    export interface QueryContext<S> extends BaseContext<S> {
      index: string;
      collection: string;
      projection: Projection | undefined;
      fields: ProjectionFields | undefined;
      channel: string;
      query: ShareDB.JSONObject;
      options: ShareDB.JSONObject;
      db: sharedb.DB | null;
      snapshotProjection: Projection | null;
    }

    export interface ReadSnapshotsContext<S> extends BaseContext<S> {
      collection: string;
      snapshots: ShareDB.Snapshot[];
      snapshotType: SnapshotType;
    }

    export interface ReceiveContext<S> extends BaseContext<S> {
      data: ShareDB.JSONObject;  // ClientRequest, but before any validation
    }

    export interface ReplyContext<S> extends BaseContext<S> {
      request: ShareDB.ClientRequest;
      reply: ShareDB.JSONObject;
    }

    export type SnapshotType = 'current' | 'byVersion' | 'byTimestamp';

    export interface SubmitContext<S> extends BaseContext<S>, SubmitRequest {
    }
  }
}
