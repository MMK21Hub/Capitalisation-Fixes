export interface ModrinthClientOptions {
  token?: string
  baseURL?: string | URL
  version?: "v2" | string
}

export default class {
  token
  baseURL
  apiVersion

  createURL(...sections: string[]): URL {
    return new URL(this.baseURL.href + [this.apiVersion, ...sections].join("/"))
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
