import etched from '../etched/etched.js'

/**
 * An object which represents a etched spec error
 * @module etched/spec/error
 * @type {module:etched}
 * @property {null|string} code
 * @property {undefined|module:etched/spec/detail[]} body
 * @property {null|string} message
 * @property {undefined|module:etched/spec/detail[]} query
 * @property {undefined|string} title
 */
export default etched
  .with({
    code: null,
    message: null
  })
