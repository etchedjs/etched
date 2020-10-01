import etched from '../etched/etched.js'

/**
 * An object which represents a etched spec query
 * @module etched/spec/query
 * @type {module:etched}
 * @property {undefined|Object.<string,module:etched/spec/hint>} body
 * @property {null|string} href
 * @property {null|string} label
 * @property {undefined|string} method
 * @property {null|string} name
 * @property {undefined|Object.<string,module:etched/spec/hint>} params
 * @property {undefined|string} rel
 */
export default etched
  .with({
    href: null,
    label: null,
    name: null
  })
