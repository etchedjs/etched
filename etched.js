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
  getOwnPropertyDescriptors
} = Object

const symbol = Symbol('@etchedjs/etched')

export const etched = context(null, freeze({
  prototypes: freeze([freeze([])]),
  rules: freeze([])
}))

export function etch (instance, ...mixins) {
  const context = extract(instance)
  const { rules } = context
  const merged = rules
    .map(mix, [instance, ...mixins])
    .map(merge)

  return build(context, fromEntries(merged))
}

export function etches (model, instance) {
  const context = extract(model)
  const current = extract(instance || {}, false)

  return current === context
    || current.prototypes.includes(context.prototypes[0])
}

export function model (...models) {
  const prototypes = freeze([etched, ...models].map(parse).flat())

  const rules = freeze(entries(prototypes
    .flat()
    .reduce(rule, [{}])
    .shift())
    .map(freeze))

  return build(freeze({ prototypes, rules }), fromEntries(rules.map(merge)))
}

function build (value, descriptors) {
  return frozen(context(etched, value), descriptors)
}

function context (prototype, value) {
  return frozen(prototype, {
    [symbol]: { value }
  })
}

function describe ([name, { set, value, get = () => value } ]) {
  return freeze([name, freeze({ get, set })])
}

function extract (instance, error = true) {
  const { [symbol]: context } = instance

  if (error && !context) {
    throw new ReferenceError('An instance must be etched')
  }

  return context || {}
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

function merge ([name, rules]) {
  const { get, set } = rules.reduce(reduce)

  return [
    name,
    {
      enumerable: true,
      ...set
        ? { set }
        : {
          value: get()
        }
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

function parse (model) {
  return extract(model, false).prototypes
    || [freeze(entries(getOwnPropertyDescriptors(model)).map(describe))]
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
  const dedupes = [
    ...dedupe(methods, get),
    ...dedupe(methods, set)
  ]

  if (previous && !previous.set && (set || get !== previous.get)) {
    throw new ReferenceError('illegal constant')
  }

  return [
    {
      ...rules,
      [name]: freeze([
        ...dedupes.length
          ? [freeze({ get, set })]
          : [],
        ...descriptor
      ])
    },
    {
      ...seen,
      [name]: [
        ...methods,
        ...dedupes
      ]
    }
  ]
}

function dedupe (methods, method) {
  return methods.includes(method)
    ? []
    : [method]
}
