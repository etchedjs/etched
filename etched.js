const {
  create,
  entries,
  freeze,
  getOwnPropertyDescriptors,
  hasOwnProperty
} = Object

const has = (instance, key) => hasOwnProperty.call(instance, key)

function call (instance, [key, value]) {
  const [first, ...rest] = key
  const name = `with${first.toUpperCase()}${rest.join('')}`
  const { [name]: method } = instance

  return !has(instance, name) && typeof method === 'function'
    ? instance[name](value)
    : instance
}

function extend (target, props = {}) {
  return freeze(create(target, getOwnPropertyDescriptors(props)))
}

function fork (method, instance, props) {
  const pairs = entries(props)

  return pairs.length
    ? pairs.reduce(method, instance)
    : extend(instance, instance)
}

function set (instance, [key, value]) {
  const { [key]: current = null } = instance

  return extend(instance, {
    ...instance,
    ...(current === null || has(instance, key)) && {
      [key]: value
    }
  })
}

/**
 * @type {Readonly<Object>}
 */
export default freeze({
  /**
   * @template instance
   * @template props
   * @param {instance<Object>} instance
   * @param {props<{}>} [props={}]
   * @return {Readonly<instance&props>}
   */
  from (instance, props = {}) {
    return fork(call, instance, props)
  },
  /**
   * @template prototype
   * @template mixin
   * @param {instance<Object>|null} [prototype=null]
   * @param {mixin<{}>} [mixin={}]
   * @return {Readonly<instance&mixin>}
   */
  model (prototype = null, mixin = {}) {
    return extend(extend(prototype, mixin))
  },
  /**
   * @template instance
   * @template props
   * @param {instance<Object>} instance
   * @param {props<{}>} [props={}]
   * @return {Readonly<instance&props>}
   */
  with (instance, props = {}) {
    return fork(set, instance, props)
  }
})
