/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched|Etched on GitHub}
 * @preserve
 */

const {
  assign,
  create,
  freeze,
  getOwnPropertyDescriptors,
  getOwnPropertySymbols,
  keys
} = Object

const symbol = Symbol('@etchedjs/etched')

const key = Array.prototype.includes.bind(['string', 'symbol'])

export const etched = context(null, freeze({
  prototypes: freeze([freeze([])]),
  rules: freeze([])
}))

export function etch (instance, ...mixins) {
  const context = extract(instance)
  const { rules } = context
  const [parent, current] = distinct(rules
    .map(mix, [instance, ...mixins.map(object)]))

  return build(context, parent, current)
}

export function etches (model, instance) {
  const context = extract(model)
  const current = extract(instance || {}, false)
  const { prototypes = [] } = current

  return current === context ||
    prototypes.some(inherits, context.prototypes)
}

export function model (...models) {
  const prototypes = freeze(uniques([etched, ...models].map(parse)))

  const reduced = prototypes
    .flatMap(pairs)
    .reduce(rule, [spread()])
    .shift()

  const rules = freeze(uniques(entries(reduced).map(freeze)))

  const [parent, current] = distinct(rules)

  const model = build(freeze({ prototypes, rules }), parent, current)

  return etch(model, ...models)
}

function pairs (value) {
  const [first] = value

  return key(typeof first)
    ? [value]
    : value.flatMap(pairs)
}

function build (value, parent, current) {
  return frozen(context(parent, value), current)
}

function context (parent, value) {
  return frozen(null, {
    ...parent,
    [symbol]: { value }
  })
}

function dedupe (methods, method) {
  return methods.includes(method)
    ? []
    : [method]
}

function describe ([name, { set, value, get = () => value }]) {
  return freeze([name, freeze({ get, set })])
}

function distinct (descriptors) {
  return descriptors
    .reduce(merge, [{}, {}])
}

function entries (target) {
  const names = keys(target)
  const symbols = getOwnPropertySymbols(target).filter(filter)

  return [...names, ...symbols]
    .map(map, target)
}

function extract (instance, error = true) {
  const { [symbol]: context } = instance

  if (error && !context) {
    throw new ReferenceError('An instance must be etched')
  }

  return context || {}
}

function filter (current) {
  return current !== symbol
}

function fill ([descriptors, name], mixin) {
  const { [name]: value } = mixin

  return [
    [
      ...value === undefined
        ? []
        : [
          {
            get: () => value
          }
        ],
      ...descriptors
    ],
    name
  ]
}

function frozen (instance = null, descriptors = {}) {
  return freeze(create(instance, descriptors))
}

function inherits (value) {
  return value === this
    || (Array.isArray(value) && value.some(inherits, this))
}

function item (model, value, key) {
  return {
    ...model,
    [key]: value
  }
}

function map (key) {
  return [key, this[key]]
}

function merge ([parent, current], [name, rules]) {
  const { get, set } = rules.reduce(reduce)
  const descriptor = {
    enumerable: true,
    ...set
      ? { set }
      : {
        value: get()
      }
  }

  return [
    {
      ...parent,
      [name]: descriptor
    },
    set
      ? current
      : {
        ...current,
        [name]: descriptor
      }
  ]
}

function mix ([name, descriptors]) {
  const [{ set }] = descriptors

  return [
    name,
    set
      ? this.reduce(fill, [descriptors, name]).shift()
      : descriptors
  ]
}

function object (model) {
  return Array.isArray(model)
    ? model.reduce(item, {})
    : model
}

function parse (model) {
  return extract(model, false).prototypes ||
    freeze(entries(getOwnPropertyDescriptors(object(model))).map(describe))
}

function reduce (previous, { get, set }) {
  if (previous.get && !previous.set && set) {
    set(previous.get())
  }

  return previous.get
    ? previous
    : { get, set }
}

function rule ([rules, seen = {}], [name, { get, set }]) {
  const { [name]: descriptor = [] } = rules
  const { [name]: methods = [] } = seen
  const [previous] = descriptor
  const uniques = [
    ...dedupe(methods, get),
    ...dedupe(methods, set)
  ]

  if (previous && !previous.set && (set || get !== previous.get)) {
    throw new ReferenceError(`Unable to redeclare an etched constant \`${name}\``)
  }

  return [
    spread(rules, {
      [name]: freeze([
        ...uniques.length
          ? [freeze({ get, set })]
          : [],
        ...descriptor
      ])
    }),
    spread(seen, {
      [name]: [
        ...methods,
        ...uniques
      ]
    })
  ]
}

function spread (current = {}, mixin = {}) {
  return assign(create(null), current, mixin)
}

function uniques (values) {
  return [...new Set(values)]
}
