/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched|Etched on GitHub}
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

const noop = {
  set () {}
}

export const etched = frozen(frozen(null))

export function etches (model, instance) {
  return is(prototype(model), instance)
}

export function model (instance = null, ...mixins) {
  const target = instance === null ? etched : instance
  const model = prototype(target)

  if (!etches(etched, target)) {
    throw new ReferenceError('`instance` must be etched or `null`')
  }

  const descriptors = getOwnPropertyDescriptors(model)

  return etch(frozen(frozen(target, {
    ...descriptors,
    ...mixins.reduce(declare, descriptors)
  })))
}

export function etch (instance, ...mixins) {
  const model = prototype(instance)

  if (!is(etched, model)) {
    throw new ReferenceError('`instance` must be etched')
  }

  const descriptors = getOwnPropertyDescriptors(model)
  const setters = entries(descriptors).filter(hasSetter)
  const map = mixins.map(merge, setters).flat()

  return frozen(model, map.reduce(set, descriptors))
}

function hasSetter ([, { set }]) {
  return set
}

function merge (mixin) {
  return this.map(extract, mixin)
}

function extract ([name]) {
  const { [name]: value } = this

  return value === undefined
    ? []
    : [name, value]
}

function call (fn) {
  fn(...this)
}

function is (prototype, instance) {
  return isPrototypeOf.call(prototype, instance)
}

function setter (from, to) {
  const setters = [from.set, to.set]

  return {
    set: value => setters.forEach(call, [value])
  }
}

function value (from, to, enumerable = false) {
  const { set } = to
  const { value } = from

  set(value)

  return {
    enumerable,
    value
  }
}

function set (descriptors, [name, value]) {
  const { [name]: { set } } = descriptors

  set(value)

  return {
    ...descriptors,
    [name]: {
      enumerable: true,
      value
    }
  }
}

function declare (descriptors, mixin) {
  return fromEntries(entries(getOwnPropertyDescriptors(mixin))
    .map(describe, descriptors))
}

function describe ([name, from]) {
  const { [name]: to } = this

  if (to && !to.set) {
    throw new ReferenceError('Unable to redeclare an etched constant')
  }

  return [
    name,
    !to
      ? from.set
        ? from
        : value(from, noop)
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
