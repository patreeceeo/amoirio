import {World} from "./World"

export type Dict<T> = { [_ in string]?: T }

export type CreateSystemFunctionType = (world: World) => Promise<void>

