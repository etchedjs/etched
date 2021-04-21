/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020-2021
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched|Etched on GitHub}
 * @preserve
 */

const {
  iterator
} = Symbol

const {
  assign,
  create,
  freeze,
  fromEntries,
  getOwnPropertyDescriptors,
  getOwnPropertySymbols,
  keys
} = Object

const enumerable = true

const symbol = Symbol('@etchedjs/etched')

const registry = new WeakMap()

const get = () => {}

const set = value => {}

const prototype = frozen(null, {
  constructor: {
    value: {
      [symbol]: () => {}
    }[symbol]
  }
})

prototype.constructor.prototype = prototype
freeze(prototype.constructor)

const {
  AggregateError = (() => {
    function AggregateError (errors, message) {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AggregateError)
      }

      return assign(this, { errors, message })
    }

    AggregateError.prototype = assign(new Error(), {
      constructor: AggregateError,
      message: '',
      name: 'AggregateError'
    })

    return AggregateError
  })()
} = globalThis

export const etched = instance(init())

export function etch (instance, ...mixins) {
  try {
    etches(instance, instance)

    return aggregate(instance, mix, mixins)
  } catch (error) {
    throw new (capture(error))()
  }
}

export function etches (model, value, throwable = null) {
  if (!find(object(model))) {
    throw new TypeError('Must be etched `model`')
  }

  const context = find(object(value))

  return (context && (value === model || context.parents.includes(model))) ||
    thrower(throwable)
}

export function fulfill (instance, ...mixins) {
  try {
    etches(instance, instance)

    return aggregate(instance, all, mixins)
  } catch (error) {
    throw new (capture(error))()
  }
}

export function fulfills (model, value, throwable = null) {
  try {
    if (etches(model, value)) {
      const { fulfilled } = find(value)
      const { keys } = find(model)

      if (keys.every(key => fulfilled.includes(key))) {
        return true
      }
    }
  } catch (error) {
    throw new (capture(error))()
  }

  return thrower(throwable)
}

export function model (...models) {
  try {
    return aggregate(etched, merge, models)
  } catch (error) {
    throw new (capture(error))()
  }
}

export function namespace ({ url }, ...models) {
  const namespace = {
    [Symbol('@etchedjs/namespace')]: url
  }

  return model(namespace, ...models)
}

export const iterable = model({
  *[Symbol.iterator] () {
    for (const pair of Object.entries(this)) {
      yield pair
    }
  }
})

function aggregate (target, aggregator, [first = {}, ...rest]) {
  return reduce(map([first, ...rest], normalize), aggregator, target)
}

function all (previous, current) {
  const to = find(previous)
  const from = find(current)
  const { fulfilled, setters } = to
  const context = init(to.keys, fulfilled, previous, current)
  const errors = []

  forEach(to.keys, key => {
    const getter = from.getters[key] || to.getters[key]

    if (setters[key]) {
      try {
        const value = fill(previous, setters, key, getter || get)

        if (getter) {
          context.getters[key] = value
        }

        context.fulfilled = push(context.fulfilled, key)
      } catch (error) {
        errors.push([key, error])
      }
    }
  })

  context.setters = setters
  validate(errors)

  return instance(context)
}

function both ({ getters, keys, setters }) {
  return fromEntries(reduce(keys, (entries, key) => [
    ...entries,
    ...setters[key]
      ? [
        [
          key,
          { enumerable, set }
        ]
      ]
      : getters[key]
        ? [
          [
            key,
            {
              enumerable,
              value: getters[key]()
            }
          ]
        ]
        : []
  ], []))
}

function capture ({ constructor, errors, message }) {
  return constructor === AggregateError
    ? constructor.bind(null, errors, message)
    : constructor.bind(null, message)
}

function chain (parents, parent) {
  return reduce(find(parent).parents, push, [...parents, parent])
}

function describe (target) {
  const names = [...keys(target), ...getOwnPropertySymbols(target)]

  return {
    descriptors: map(names, descriptor, getOwnPropertyDescriptors(target)),
    keys: names
  }
}

function descriptor (key) {
  return [key, this[key]]
}

function fill (previous, setters, key, getter) {
  const value = getter()

  forEach(setters[key], setter => setter.call(previous, value))

  return getter
}

function find (instance) {
  return registry.get(instance)
}

function forEach (entries, fn) {
  const { length } = entries

  for (let key = 0; key < length; key += 1) {
    fn(entries[key])
  }
}

function frozen (prototype, descriptors = {}) {
  return freeze(create(prototype, descriptors))
}

function init (keys = [], [...fulfilled] = [], ...parents) {
  const inheritance = reduce(parents, chain, [])
  const [first] = inheritance

  return {
    keys,
    fulfilled,
    getters: assign(create(null), first
      ? find(first).getters
      : {}),
    parents: inheritance,
    setters: create(null)
  }
}

function instance (context) {
  const instance = frozen(frozen(prototype, both(context)), values(context))

  return register(instance, context)
}

function map (entries, fn, context) {
  const { length } = entries
  const results = []

  for (let key = 0; key < length; key += 1) {
    results.push(fn.call(context, entries[key]))
  }

  return results
}

function merge (previous, current) {
  const to = find(previous)
  const from = find(current)
  const names = reduce(from.keys, push, to.keys)
  const { fulfilled, setters } = to
  const context = init(names, fulfilled, previous, current)
  const errors = []

  forEach(from.keys, key => {
    const getter = from.getters[key]
    const setter = from.setters[key]

    if (setters[key] && getter) {
      try {
        context.getters[key] = fill(previous, setters, key, getter)
        context.fulfilled = push(context.fulfilled, key)
      } catch (error) {
        errors.push([key, error])
      }
    } else if (to.getters[key]) {
      if (getter && to.getters[key] !== getter) {
        const name = typeof key === 'symbol' ? `symbol` : key
        const error = new ReferenceError(`Duplicate constant \`${name}\``)

        errors.push([key, error])
      }
    } else if (setters[key] && setter) {
      context.setters[key] = reduce(setter, push, setters[key])
    } else if (getter) {
      context.getters[key] = getter
      context.fulfilled = push(context.fulfilled, key)
    } else {
      context.setters[key] = setter
    }
  })

  forEach(keys(setters), key => {
    if (!context.getters[key] && !context.setters[key]) {
      context.setters[key] = setters[key]
    }
  })

  validate(errors)

  return instance(context)
}

function mix (previous, current) {
  const to = find(previous)
  const from = find(current)
  const { fulfilled, setters } = to
  const context = init(to.keys, fulfilled, previous, current)
  const errors = []

  forEach(from.keys, key => {
    const getter = from.getters[key]

    if (setters[key] && getter) {
      try {
        context.getters[key] = fill(previous, setters, key, getter)
        context.fulfilled = push(context.fulfilled, key)
      } catch (error) {
        errors.push([key, error])
      }
    }
  })

  context.setters = setters
  validate(errors)

  return instance(context)
}

function normalize (model) {
  const target = object(model, true)

  return find(target)
    ? target
    : instance(parse(target))
}

function object (target, throwing = false) {
  if (target !== null && typeof target === 'object') {
    return target[iterator] && target.entries
      ? fromEntries(target.entries())
      : target
  }

  if (throwing) {
    throw new TypeError('Must be an object')
  }
}

function parse (target) {
  const { descriptors, keys } = describe(target)
  const context = init(keys, [], etched)

  return reduce(descriptors, parser, [context, target])
    .shift()
}

function parser ([context, target], [key, { set }]) {
  const { getters, setters } = context
  const value = target[key]

  return [
    {
      ...context,
      ...set
        ? {
          setters: {
            ...setters,
            [key]: [set]
          }
        }
        : {
          getters: {
            ...getters,
            [key]: () => value
          }
        }
    },
    target
  ]
}

function push (values, value) {
  return values.includes(value)
    ? values
    : [...values, value]
}

function reduce (entries, fn, value) {
  const { length } = entries
  let previous = value

  for (let key = 0; key < length; key += 1) {
    previous = fn(previous, entries[key], key)
  }

  return previous
}

function register (instance, context) {
  registry.set(instance, context)

  return instance
}

function thrower (throwable) {
  if (typeof throwable === 'function') {
    throw throwable()
  }

  return false
}

function validate (errors) {
  if (errors.length) {
    throw new AggregateError(errors, 'Unsafe etching')
  }
}

function values ({ getters, keys }) {
  return fromEntries(reduce(keys, (entries, key) => getters[key]
    ? [
      ...entries,
      [
        key,
        {
          enumerable,
          value: getters[key]()
        }
      ]
    ]
    : entries, []))
}
