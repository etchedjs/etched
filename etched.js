/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched|Etched on GitHub}
 */

const {
  assign,
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

  const map = [instance, ...mixins].map(getOwnPropertyDescriptors)
  const descriptors = getOwnPropertyDescriptors(model)

  return frozen(model, fill(descriptors, assign(...map)))
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

function set ([name, to]) {
  const { [name]: from } = this

  return [
    name,
    from && to.set && !from.set
      ? value(from, to, true)
      : to
  ]
}

function fill (descriptors, mixin) {
  return fromEntries(entries(descriptors)
    .map(set, mixin))
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
