import etched from '../etched/etched.js'

/**
 * An object which represents a etched sdk message
 * @module etched/sdk/message
 * @type {module:etched}
 * @property {undefined|Object.<string,string|module:etched/sdk/file>} body
 * @property {undefined|Object.<string,string|string[]>} headers
 * @property {null|module:etched/sdk/url} url
 */
export default etched
  .with({
    url: null,
    /**
     * @param {Object.<string,string|string[]>} body
     * @return {this|{body:Object.<string,string|module:etched/sdk/file>}}
     */
    withBody (body) {
      return this.with({ body }, import.meta)
    },
    /**
     * @param {Object.<string,string|string[]>} headers
     * @return {this|{headers:Object.<string,string|string[]>}}
     */
    withHeaders (headers) {
      return this.with({ headers }, import.meta)
    },
    /**
     * @param {module:etched/sdk/url} url
     * @return {this|{url:module:etched/sdk/url}}
     */
    withUrl (url) {
      return this.with({ url }, import.meta)
    }
  })
