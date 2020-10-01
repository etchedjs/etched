import etched from '../etched/etched.js'

/**
 * An object which represents a etched spec document
 * @module etched/spec/document
 * @type {module:etched}
 * @property {null|string} href
 * @property {undefined|module:etched/spec/link[]} links
 * @property {undefined|module:etched/spec/script[]} scripts
 * @property {null|string} version
 */
export default etched
  .with({
    href: null,
    version: null
  })
