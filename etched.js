/**
 * @module etchedjs/etched
 */

/**
 * @typedef {{}} Model
 */

/**
 * @typedef {Readonly,{}<string|symbol|set,*>} Etched
 * @augments Model
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

/**
 * @type {Etched}
 */
export const etched = frozen(frozen(null))

/**
 *
 * @param {Etched} instance
 * @param {Model} model
 * @return {Boolean}
 */
export function etches (model, instance) {
  return is(prototype(model), instance)
}

/**
 * @template {Etched|null} Prototype
 * @template {{}<string|Symbol|set,*>} Mixin
 * @param {Prototype} instance
 * @param {...Mixin} mixins
 * @return {Etched#prototype,Etched,Prototype,Mixin}
 * @throws
 */
export function model (instance = null, ...mixins) {
  const target = instance === null ? etched : instance
  const model = prototype(target)

  if (!etches(etched, target)) {
    throw new ReferenceError('Instance must be etched or null')
  }

  const descriptors = getOwnPropertyDescriptors(model)

  return etch(frozen(frozen(target, {
    ...descriptors,
    ...mixins.reduce(declare, descriptors)
  })))
}

/**
 * @template {Etched} Prototype
 * @template {{}} Mixin
 * @param {Prototype} instance
 * @param {...Mixin} mixins
 * @return {Prototype#prototype,Prototype,Mixin}
 * @throws
 */
export function etch (instance, ...mixins) {
  const model = prototype(instance)

  if (!is(etched, model)) {
    throw new ReferenceError('Instance must be etched')
  }

  const descriptors = getOwnPropertyDescriptors(model || {})

  return frozen(model, [instance, ...mixins].reduce(fill, descriptors))
}

function call (fn) {
  fn(...this)
}

function is (prototype, instance) {
  return isPrototypeOf.call(prototype, instance)
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
