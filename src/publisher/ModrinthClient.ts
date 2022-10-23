import {
  FetchableMethods,
  resolveURLParams,
  URLSearchParamsResolvable,
} from "../util.js"
import fetch, { Headers, BodyInit } from "node-fetch"

export interface ModrinthClientOptions {
  token?: string
  baseURL?: string | URL
  version?: "v2" | string
  brand?: string
}

export interface RequestOptions {
  path: string[]
  params?: URLSearchParamsResolvable
  verb?: FetchableMethods
  body?: BodyInit
}

export default class {
  token
  baseURL
  apiVersion
  brand

  createURL(...sections: string[]): URL {
    sections = sections.map((section) => encodeURIComponent(section))
    return new URL(this.baseURL.href + [this.apiVersion, ...sections].join("/"))
  }

  generateHeaders() {
    const headers = new Headers()
    headers.set("User-Agent", this.brand)
    if (this.token) headers.set("Authorization", this.token)

    return headers
  }

  async request<T>(options: string[] | RequestOptions) {
    const resolveOptions: (param: typeof options) => RequestOptions = (param) =>
      Array.isArray(param)
        ? {
            path: param,
          }
        : param

    const {
      path,
      params,
      verb: method = "GET",
      body = null,
    } = resolveOptions(options)

    const url = this.createURL(...path)
    if (params) url.search = resolveURLParams(params).toString()

    const response = await fetch(url.toString(), {
      headers: this.generateHeaders(),
      method,
      body,
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
      brand = "Capitalisation-Fixes Modrinth API Client",
    } = options

    this.token = token
    this.baseURL = new URL(baseURL)
    this.apiVersion = version
    this.brand = brand
  }
}
