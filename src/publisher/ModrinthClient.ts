import { resolveURLParams, URLSearchParamsResolvable } from "../util"

export interface ModrinthClientOptions {
  token?: string
  baseURL?: string | URL
  version?: "v2" | string
}

export interface RequestOptions {
  path: string[]
  params?: URLSearchParamsResolvable
}

export default class {
  token
  baseURL
  apiVersion

  createURL(...sections: string[]): URL {
    sections = sections.map((section) => encodeURIComponent(section))
    return new URL(this.baseURL.href + [this.apiVersion, ...sections].join("/"))
  }

  async request(options: string[] | RequestOptions) {
    const resolveOptions = (param: typeof options) =>
      Array.isArray(param)
        ? {
            path: param,
          }
        : param

    const { path, params } = resolveOptions(options)

    const url = this.createURL(...path)
    if (params) url.search = resolveURLParams(params).toString()
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
