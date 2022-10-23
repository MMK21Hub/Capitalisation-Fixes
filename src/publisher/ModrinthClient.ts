import {
  FetchableMethods,
  resolveURLParams,
  URLSearchParamsResolvable,
} from "../util.js"
import fetch, { Headers } from "node-fetch"

export interface ModrinthClientOptions {
  token?: string
  baseURL?: string | URL
  version?: "v2" | string
}

export interface RequestOptions {
  path: string[]
  params?: URLSearchParamsResolvable
  verb?: FetchableMethods
}

export default class {
  token
  baseURL
  apiVersion

  createURL(...sections: string[]): URL {
    sections = sections.map((section) => encodeURIComponent(section))
    return new URL(this.baseURL.href + [this.apiVersion, ...sections].join("/"))
  }

  async request<T>(options: string[] | RequestOptions) {
    const resolveOptions: (param: typeof options) => RequestOptions = (param) =>
      Array.isArray(param)
        ? {
            path: param,
          }
        : param

    const { path, params, verb: method = "GET" } = resolveOptions(options)

    const url = this.createURL(...path)
    if (params) url.search = resolveURLParams(params).toString()

    const headers = new Headers()
    if (this.token) headers.set("Authorization", this.token)

    const response = await fetch(url.toString(), {
      headers,
      method,
    })

    if (!response.ok)
      throw new Error(`HTTP request responded with ${response.status}`)

    const responseBody = await response.json()
    return responseBody as T
  }

  constructor(options: ModrinthClientOptions = {}) {
    const {
      token,
      baseURL = "https://api.modrinth.com",
      version = "v2",
    } = options

    this.token = token
    this.baseURL = new URL(baseURL)
    this.apiVersion = version
  }
}
