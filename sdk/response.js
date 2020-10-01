import message from './message.js'

/**
 * An object which represents a etched sdk response
 * @module etched/sdk/response
 * @type {module:etched/sdk/message}
 * @property {null|module:etched/sdk/request} request
 */
export default message
  .with({
    request: null,
    /**
     * @param {module:etched/sdk/request} request
     * @return {this|{request:module:etched/sdk/request}}
     */
    withRequest (request) {
      return this.with({ request }, import.meta)
    }
  })
