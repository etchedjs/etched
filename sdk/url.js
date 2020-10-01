import etched from '../etched/etched.js'

/**
 * An object which represents a etched sdk url
 * @module etched/sdk/url
 */

function append ({ name, url }, value = null) {
  if (value !== null) {
    url.searchParams.append(name, value)
  }

  return { name, url }
}

function fill (url, [name, value]) {
  return [value].flat().reduce(append, { name, url }).url
}

/**
 * @type {module:etched}
 * @property {undefined|string} hash
 * @property {null|string} origin
 * @property {undefined|string} pathname
 * @property {undefined|module:etched/sdk/params} params
 */
export default etched
  .with({
    origin: null,
    /**
     * @return {string}
     */
    toString () {
      const { hash = '', origin, pathname = '', params = {} } = this
      const url = Object.entries(params).reduce(fill, new URL(pathname, origin))

      url.hash = hash

      return `${url}`
    },
    /**
     * @param {string} hash
     * @return {this|{hash:string}}
     */
    withHash (hash) {
      return this
        .with({ hash }, import.meta)
    },
    /**
     * @param {string} origin
     * @return {this|{origin:string}}
     */
    withOrigin (origin) {
      return this
        .with({ origin }, import.meta)
    },
    /**
     * @param {string} pathname
     * @return {this|{pathname:string}}
     */
    withPathname (pathname) {
      return this
        .with({ pathname }, import.meta)
    },
    /**
     * @param {module:etched/sdk/params} params
     * @return {this|{params:module:etched/sdk/params}}
     */
    withParams (params) {
      return this
        .with({ params }, import.meta)
    }
  })
