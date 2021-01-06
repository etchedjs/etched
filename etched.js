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
  keys
} = Object

const enumerable = true

const symbol = Symbol('@etchedjs/etched')

const registry = new WeakMap()

const set = {
  [symbol]: value => {}
}[symbol]

const { AggregateError } = globalThis

if (!AggregateError || new AggregateError([])) {
  (() => {
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
}

export const etched = instance(init())

export function etch (instance, ...mixins) {
  try {
    etches(instance, instance)

    return aggregate(instance, mix, mixins)
  } catch (error) {
    throw new (throwable(error))()
  }
}

export function etches (model, value, throwable = null) {
  if (!find(object(model))) {
    throw new TypeError('Must be etched `model`')
  }

  const context = find(object(value))

  if (context && (value === model || context.parents.includes(model))) {
    return true
  }

  if (typeof throwable === 'function') {
    throw throwable()
  }

  return false
}

export function model (...models) {
  try {
    return aggregate(etched, merge, models)
  } catch (error) {
    throw new (throwable(error))()
  }
}

function aggregate (target, aggregator, [first = {}, ...rest]) {
  return [first, ...rest]
    .map(normalize)
    .reduce(aggregator, target)
}

function both ({ getters, keys, setters }) {
  return fromEntries(keys.reduce((entries, key) => [
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

function chain (parents, parent) {
  return find(parent).parents
    .reduce(push, [...parents, parent])
}

function describe (target) {
  const names = keys(target)

  return {
    descriptors: names.map(descriptor, getOwnPropertyDescriptors(target)),
    keys: names
  }
}

function descriptor (key) {
  return [key, this[key]]
}

function fill (previous, setters, key, getter) {
  const value = getter()

  setters[key].forEach(setter => setter.call(previous, value))

  return getter
}

function find (instance) {
  return registry.get(instance)
}

function frozen (prototype, descriptors = {}) {
  return freeze(create(prototype, descriptors))
}

function init (keys = [], ...parents) {
  const inheritance = parents.reduce(chain, [])
  const [first] = inheritance

  return {
    keys,
    getters: first
      ? { ...find(first).getters }
      : {},
    parents: inheritance,
    setters: {}
  }
}

function instance (context) {
  const prototype = frozen(null, both(context))
  const instance = frozen(prototype, values(context))

  return register(instance, context)
}

function merge (previous, current) {
  const to = find(previous)
  const from = find(current)
  const context = init(from.keys.reduce(push, to.keys), previous, current)
  const { setters } = to
  const errors = []

  from.keys.forEach(key => {
    const getter = from.getters[key]
    const setter = from.setters[key]

    if (setters[key] && getter) {
      try {
        context.getters[key] = fill(previous, setters, key, getter)
      } catch (error) {
        errors.push([key, error])
      }
    } else if (to.getters[key]) {
      if (to.getters[key] !== getter) {
        const error = new ReferenceError(`Duplicate constant \`${key}\``)
        errors.push([key, error])
      }
    } else if (setters[key] && setter) {
      context.setters[key] = setter.reduce(push, setters[key])
    } else if (getter) {
      context.getters[key] = getter
    } else {
      context.setters[key] = setter
    }
  })

  keys(setters).forEach(key => {
    if (!context.getters[key] && !context.setters[key]) {
      context.setters[key] = setters[key]
    }
  })

  return validate(context, errors)
}

function mix (previous, current) {
  const to = find(previous)
  const from = find(current)
  const context = init(from.keys.reduce(push, to.keys), previous, current)
  const { setters } = to
  const errors = []

  from.keys.forEach(key => {
    const getter = from.getters[key]

    if (setters[key] && getter) {
      try {
        context.getters[key] = fill(previous, setters, key, getter)
      } catch (error) {
        errors.push([key, error])
      }
    }
  })

  context.setters = setters

  return validate(context, errors)
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
  const context = init(keys, etched)

  return descriptors
    .reduce(parser, [context, target])
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

function register (instance, context) {
  registry.set(instance, context)

  return instance
}

function throwable ({ constructor, errors, message }) {
  return constructor === AggregateError
    ? constructor.bind(null, errors, message)
    : constructor.bind(null, message)
}

function validate (context, errors) {
  if (errors.length) {
    throw new AggregateError(errors, 'Unsafe etching')
  }

  return instance(context)
}

function values ({ getters, keys }) {
  return fromEntries(keys.reduce((entries, key) => getters[key]
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
