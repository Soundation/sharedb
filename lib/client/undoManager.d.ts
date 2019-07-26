import {Connection, Doc} from "../client";

export interface IUndoManagerOptions {
  source?: string
  limit?: number
  composeInterval?: number
}

export interface IUndoManagerUndoOptions {
  source?: boolean
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
