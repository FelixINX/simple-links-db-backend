export {};

export interface Link {
  title: string
  slug: string
  destination: string
  published: boolean
  backgroundColor?: string
  textColor?: string
}

declare global {
  const MACROMETA_COLLECTION: string
  const MACROMETA_KEY: string
  const AUTH_USER: string
  const AUTH_PASS: string
  const FRONTEND_CORS: string
  const LINKSDB: KVNamespace
}

//
// Itty-router
//
type Obj = {
  [propName: string]: string
};

export interface IttyRequest {
  method: string
  params?: Obj
  query?: Obj
  url: string
  headers: Headers

  arrayBuffer?(): Promise<any>
  blob?(): Promise<any>
  formData?(): Promise<any>
  json?(): Promise<any>
  text?(): Promise<any>
}