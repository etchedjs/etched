/**
 * @module etchedjs/etched
 */

const {
  create,
  entries,
  freeze,
  fromEntries,
  getOwnPropertyDescriptors,
  getPrototypeOf,
  isPrototypeOf
} = Object

const etched = {
  is (instance, model) {
    return isPrototypeOf.call(prototype(model), instance)
  },
  model (model = null, ...mixins) {
    const descriptors = getOwnPropertyDescriptors(prototype(model) || {})

    return etched.etch(frozen(frozen(model, {
      ...descriptors,
      ...mixins.reduce(declare, descriptors)
    })))
  },
  etch (instance, ...mixins) {
    const model = prototype(instance)
    const descriptors = getOwnPropertyDescriptors(model || {})

    return frozen(model, [instance, ...mixins].reduce(fill, descriptors))
  }
}

function call (fn) {
  fn(...this)
}

function setter (from, to) {
  const setters = [to.set, from.set]

  return {
    set: value => setters.forEach(call, [value])
  }
}

function value (from, to) {
  const { set } = to
  const { value } = from

  set(value)

  return {
    enumerable: true,
    value
  }
}

function assign ([name, to]) {
  const { [name]: from } = this

  return [
    name,
    from && to.set && !from.set
      ? value(from, to)
      : to
  ]
}

function fill (descriptors, mixin) {
  return fromEntries(entries(descriptors)
    .map(assign, getOwnPropertyDescriptors(mixin)))
}

function declare (descriptors, mixin) {
  return fromEntries(entries(getOwnPropertyDescriptors(mixin))
    .map(describe, descriptors))
}

function describe ([name, from]) {
  const { [name]: to } = this

  if (to && !to.set) {
    throw new ReferenceError('Unsafe etching')
  }

  return [
    name,
    !to
      ? from
      : to.set && from.set
      ? setter(from, to)
      : value(from, to)
  ]
}

function prototype (instance) {
  return instance ? getPrototypeOf(instance) : instance
}

function frozen (instance, descriptors) {
  return freeze(create(instance, descriptors))
}

export default etched
