import {
  FetchableMethods,
  RecordLike,
  resolveURLParams,
  toMap,
  URLSearchParamsResolvable,
} from "../util.js"
import fetch, { Headers, BodyInit, FormData } from "node-fetch"

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

// modrinth-api-types when?
export interface VersionInput {}

export interface NamedFile {
  filename: string
  data: Blob
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

  private generateHeaders() {
    const headers = new Headers()
    headers.set("User-Agent", this.brand)
    headers.set("Accept", "application/json")
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

  // This is a messy way of organising the functions,
  // but I probably won't get around to rewriting it.
  rest = {
    createVersion(
      projectId: string,
      version: VersionInput,
      files: RecordLike<string, Blob>
    ) {
      const fileMap = toMap(files)
      console.log(files)

      const namedFiles = new Map<string, NamedFile>()
      fileMap.forEach((data, filename) => {
        // Generates a unique id ("name") for the file
        const getName = () => `${filename}-${count}`
        let count = 0
        while (namedFiles.has(getName())) {
          count++
        }
        const finalName = getName()

        // Adds the file to the map, using the id as the index
        const namedFile: NamedFile = {
          data,
          filename,
        }
        debugger
        namedFiles.set(finalName, namedFile)
      })

      return namedFiles

      const formData = new FormData()

      formData.append(
        "data",
        JSON.stringify({
          file_parts,
        })
      )
    },
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
