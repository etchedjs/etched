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

const symbol = Symbol('@etchedjs/etched')

const noop = {
  set () {}
}

const prototype = frozen(null, {
  [symbol]: {
    value: freeze([])
  }
})

export function etch (instance, ...mixins) {
  if (!is(prototype, instance)) {
    throw new ReferenceError('`instance` must be etched')
  }

  const model = getPrototypeOf(instance)
  const descriptors = getOwnPropertyDescriptors(model)
  const setters = entries(descriptors).filter(settable)
  const map = [instance, ...mixins]
    .map(entry, setters)
    .flat()
    .filter(Boolean)

  return frozen(model, {
    ...fromEntries(map)
  })
}

export const etched = frozen(prototype)

export function etches (model, instance) {
  return is(prototype, model)
    && is(prototype, instance)
    && matches.call(model[symbol], instance)
}

export function model (...models) {
  const value = freeze(models.map(mixin))

  const descriptors = [...new Set(value.reduce(flatten, []))]
    .map(getPrototypeOf)
    .reduce(merge, {})

  const model = frozen(prototype, {
    ...descriptors,
    [symbol]: {
      value,
      enumerable: true
    }
  })

  return frozen(model, descriptors)
}

function describe (current, [name, { value, ...descriptor }]) {
  const { [name]: { set } = noop } = current
  let result = {}

  if (descriptor.set) {
    result.enumerable = true

    if (set) {
      result.set = value => [descriptor.set, set].forEach(call, [value])
    } else {
      result.set = descriptor.set
    }
  } else if (set) {
    result.value = value
  } else  {
    throw new ReferenceError('Unable to redeclare an etched constant')
  }

  return {
    ...current,
    [name]: result
  }
}

function call (fn) {
  fn(...this)
}

function entry (mixin) {
  return this.map(extract, mixin)
}

function extract ([name, { set }]) {
  const { [name]: value } = this

  if (value !== undefined) {
    set(value)

    return [name, {
      enumerable: true,
      value
    }]
  }
}

function flatten (models, instance) {
  const { [symbol]: inherited = [] } = instance

  return inherited.reduce(flatten, [
    ...inherited,
    ...models
  ])
}

function frozen (instance = null, descriptors = {}) {
  return freeze(create(instance, descriptors))
}

function is (prototype, instance) {
  return isPrototypeOf.call(prototype, instance)
}

function matches (instance) {
  const { [symbol]: models = [] } = instance

  return models === this || models.some(matches, this)
}

function merge (current, prototype) {
  const { [symbol]: e, ...rest } = getOwnPropertyDescriptors(prototype)

  return entries(rest)
    .reduce(describe, current)
}

function mixin (mixin) {
  return is(prototype, mixin)
    ? mixin
    : frozen(frozen(prototype, {
      ...getOwnPropertyDescriptors(mixin),
      [symbol]: {
        value: []
      }
    }))
}

function settable ([, { set }]) {
  return set
}
