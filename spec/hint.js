import etched from '../etched/etched.js'

/**
 * An object which represents a etched spec hint
 * @module etched/spec/hint
 * @type {module:etched}
 * @property {null|string} label
 * @property {undefined|string|string[]} list
 * @property {undefined|string} multiple
 * @property {undefined|string} readonly
 * @property {undefined|string} required
 * @property {null|string} type
 * @property {undefined|string} value
 */
export default etched
  .with({
    name: null,
    label: null,
    type: null
  })
