// Minimal shapes for the MyGeotab entities this add-in reads.
// Only the fields we actually use are declared — the real API responses
// carry many more properties.

export interface GeotabIdRef {
  id: string
}

export interface GeotabUser extends GeotabIdRef {
  name: string
  firstName?: string
  lastName?: string
  isDriver?: boolean
  activeFrom?: string
  activeTo?: string
}

export interface GeotabDevice extends GeotabIdRef {
  name: string
  serialNumber?: string
}

export interface GeotabTrip extends GeotabIdRef {
  device: GeotabIdRef
  driver?: GeotabIdRef
  start: string
  stop?: string
  distance?: number
  maximumSpeed?: number
  drivingDuration?: string
  stopDuration?: string
  idlingDuration?: string
  stopPointX?: number
  stopPointY?: number
}

export interface GeotabDeviceStatusInfo {
  device: GeotabIdRef
  driver?: GeotabIdRef
  dateTime: string
  isDriving: boolean
  speed: number
  latitude?: number
  longitude?: number
}

export interface GeotabRule extends GeotabIdRef {
  name: string
}

export interface GeotabExceptionEvent extends GeotabIdRef {
  device?: GeotabIdRef
  driver?: GeotabIdRef
  rule: GeotabIdRef
  activeFrom: string
  activeTo?: string
  distance?: number
  duration?: string
}

// Callback-style shape exposed by the api.js object MyGeotab hands to
// initialize()/focus(). We only rely on `call` and `multiCall`.
export interface GeotabApi {
  call: <T = unknown>(
    method: string,
    params: Record<string, unknown>,
    callback?: (result: T) => void,
    errorCallback?: (error: unknown) => void,
  ) => Promise<T> | void
  multiCall: <T = unknown[]>(
    calls: [string, Record<string, unknown>][],
    callback?: (result: T) => void,
    errorCallback?: (error: unknown) => void,
  ) => Promise<T> | void
}

export interface GeotabState {
  getState?: () => Promise<Record<string, unknown>>
  [key: string]: unknown
}
