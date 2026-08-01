import type { GeotabApi } from './types'

// api.call()/api.multiCall() from MyGeotab's api.js return a Promise when
// no callback is passed, so we can just await them directly.
export function call<T>(api: GeotabApi, method: string, params: Record<string, unknown> = {}): Promise<T> {
  return Promise.resolve(api.call(method, params) as Promise<T>)
}

export function multiCall<T extends unknown[]>(api: GeotabApi, calls: [string, Record<string, unknown>][]): Promise<T> {
  return Promise.resolve(api.multiCall(calls) as Promise<T>)
}

export function get<T>(api: GeotabApi, typeName: string, search: Record<string, unknown> = {}): Promise<T[]> {
  return call<T[]>(api, 'Get', { typeName, search })
}
