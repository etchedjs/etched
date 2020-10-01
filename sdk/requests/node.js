import fetch from 'node-fetch'
import request from '../request.js'

/**
 * @module etched/sdk/requests/node
 * @type {module:etched/sdk/request}
 * @property {function(origin:string):Promise<module:etched/sdk/response>} fetch
 */
export default request
  .withFetch(async function (origin) {
    const { body, headers, method, respondWith, url } = this

    /**
     * @todo
     */
    return origin === url.origin && respondWith
      ? this.respondWith()
      : fetch(`${url}`, { body, headers, method })
  })
