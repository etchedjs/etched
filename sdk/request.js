import message from './message.js'

/**
 * An object which represents a etched sdk request
 * @module etched/sdk/request
 * @type {module:etched/sdk/message}
 * @property {null|function(origin:string):Promise<module:etched/sdk/response>} fetch
 * @property {null|string} method
 * @property {undefined|function:Promise<module:etched/sdk/response>} respondWith
 */
export default message
  .with({
    method: null,
    /**
     * @param {function} fetch
     * @return {this|{fetch:function:module:etched/sdk/response}}
     */
    withFetch (fetch) {
      return this.with({ fetch }, import.meta)
    },
    /**
     * @param {string} method
     * @return {this|{method:string}}
     */
    withMethod (method) {
      return this.with({ method }, import.meta)
    },
    /**
     * @param {function} respondWith
     * @return {this|{respondWith:function:module:etched/sdk/response}}
     */
    withRespondWith (respondWith) {
      return this.with({ respondWith }, import.meta)
    }
  })
