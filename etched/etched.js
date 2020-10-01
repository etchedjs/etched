const { freeze } = Object
const symbol = Symbol('@etched/etched.traces')

/**
 * @module etched
 */

const etched = {
  /**
   * @template {Object} properties
   * @param {properties} [properties]
   * @param {{url:string}} [url]
   * @return {Readonly<default|properties|traces>}
   */
  with ({ ...properties } = {}, { url } = {}) {
    const { [symbol]: traces, ...rest } = this

    return freeze({
      ...rest,
      ...properties,
      ...traces && url && {
        [symbol]: freeze({
          [Symbol(url)]: freeze(properties),
          ...traces || {}
        })
      }
    })
  }
}

/**
 * @typedef {Readonly<Object.<symbol,Object>>} traces
 * @type {traces}
 */
export const traces = etched.with({
  [symbol]: freeze({})
})

export default etched.with()
