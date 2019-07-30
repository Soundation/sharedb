import {Connection, Doc} from "../client";

export interface IUndoManagerOptions {
  source?: any
  limit?: number
  composeInterval?: number
}

export interface IUndoManagerUndoOptions {
  source?: any
}

type UndoCallback = (err: any) => any

export class UndoManager {
  constructor(connection: Connection, options?: IUndoManagerOptions)
  public canUndo: () => boolean
  public undo: (options?: IUndoManagerUndoOptions, callback?: UndoCallback) => void
  public canRedo: () => boolean
  public redo: (options?: IUndoManagerUndoOptions, callback?: UndoCallback) => void
  public clear: (doc?: Doc) => void
  public destroy: () => void
}
