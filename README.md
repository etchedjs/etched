# @etchedjs/etched

[![](https://raw.githubusercontent.com/Lcfvs/library-peer/main/badge.svg)](https://github.com/Lcfvs/library-peer#readme)

_Etches your JS objects in stone_

A utility to easily create some immutable objects, based on multiple etched inheritance.

It provides:
* Fully immutable
* Multiple etched inheritance
* Lazy-setters, only declare the wanted properties and optionally validate them
* Inherited constants, declare the properties that can't be overridden on the instances
* Reduced prototype chain, an etched object always have its model as prototype
* Auto-reconcile, based on the model, the etched objects never take any unwanted properties


## How etched resolves the (multiple) inheritance problems

### The [diamond problem](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem)

✓ The **etched** objects are immutables, then there is only one possible implementation for an instance... and the members are merged on the instance itself (no `super()`).

### The member collisions

✓ There is no way to redeclare a **member with the same name**, except if it's strictly the same member, it doesn't rely on the value.

### Mocking difficulties

✓ By design, the inheritance is based on composition, you can easily mock everything as you want.


## Install

`npm i @etchedjs/etched`

Alternatively, in a browser, you can use it from the CDN:

```js
import * as etched from 'https://unpkg.com/@etchedjs/etched@latest/etched.min.js'
```

## A concrete example

```js
import { etch, etches, model } from '@etchedjs/etched'

const entity = model({
  set id (value) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new ReferenceError('Must be a positive safe integer')
    }
  },
  set createdAt (value) {
    if (!Object.is(Date.prototype, Object.getPrototypeOf(value || {}))) {
      throw new ReferenceError('Must be a Date')
    }
  }
})

const account = model({
  set name (value) {
    if (typeof value !== 'string' || !value.length) {
      throw new TypeError('Must be a non-empty string')
    }
  },
  set score (value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 10) {
      throw new TypeError('Must be a valid score')
    }
  }
})

const accountEntity = model(entity, account)

const jack = etch(accountEntity, {
  id: 123,
  createdAt: new Date(),
  name: 'Jack',
  score: 9
})

const renamed = etch(jack, {
  name: 'Jack-Renamed',
  score: 10
})

console.log(jack) // {  id: 123, createdAt: 2020-11-12T19:54:12.979Z, name: 'Jack', score: 9 }
console.log(renamed) // {  id: 123, createdAt: 2020-11-12T19:54:12.979Z, name: 'Jack-Renamed', score: 10 }
console.log(etches(entity, accountEntity)) // true
console.log(etches(account, accountEntity)) // true
console.log(etches(entity, jack)) // true
console.log(etches(account, jack)) // true
console.log(etches(accountEntity, jack)) // true
console.log(etches(entity, renamed)) // true
console.log(etches(account, renamed)) // true
console.log(etches(accountEntity, renamed)) // true
```

## API

### etched.etched

The default instance

```js
etched.etched
// {}
```

### etched.model

`etched.model(...models)`

Creates a new immutable **model**, based on optional models.

It declares constants (direct value) and setters (to validate dynamic values)

It also acts as an instance.

#### Example
```js
const model = etched.model({
  constant: 123,
  set dynamic (value) {
    if (isNaN(value)) {
      throw new TypeError('Must be a number')
    }
  }
})
```

Produces:
```js
console.log(model)
// { constant: 123 }

console.log(Object.getPrototypeOf(model))
// { constant: 123, dynamic: Setter }
```

```js
const extended = etched.model(model, {
  set value (value) {}
})
```

Produces:
```js
console.log(model)
// { constant: 123 }

console.log(Object.getPrototypeOf(model))
// { constant: 123, dynamic: Setter, value: Setter }
```

### `etch.etch(instance, ...mixins)`


Creates a new immutable instance, based on a previous one and the optional mixins.

**It only takes the values of corresponding properties to a model setter.**

#### Example

```js
const instance = etched.etch(model, {
  dynamic: 456
})
// { constant: 123, dynamic: 456 }

const copy = etched.etch(model, instance, {
  dynamic: 789
})
// { constant: 123, dynamic: 789 }
```

### `etched.etches(model, instance, throwable = null)

Provides a way to check if an instance is an extension of the provided model.

Note: a `throwable` function returning an error can be provided to be called if the `instance` doesn't etches.

#### Example
```js
etched.etches(etched.etched, instance)
// true

etched.etches(model, instance)
// true

etched.etches(model, model)
// true

etched.etches(model, {})
// false

etched.etches(model, {}, () => new TypeError('Invalid'))
// throws TypeError: 'Invalid'
```

### `etched.fulfill(instance, ...mixins)`

Acts as `etched.etch(instance, ...mixins)` but sets **all the instance properties**.

#### Example

```js
const fullfilled = etched.fulfill(model, {
  dynamic: 789
})
// { constant: 123, dynamic: 789 }

etched.fulfill(model, {})
// Throws AggregateError: Unsafe etching
// with errors ['dynamic', TypeError: Must be a number]
```

### `etched.fulfills(model, value, throwable = null)

Provides a way to check if an instance is a fulfilling extension of the provided model.

Note: a `throwable` function returning an error can be provided to be called if the `instance` doesn't etches or doesn't fulfills the model.

#### Example
```js
etched.fulfills(etched.etched, instance)
// true

etched.fulfills(model, instance)
// true

etched.fulfills(model, model)
// true

etched.fulfills(model, {})
// false

etched.fulfills(model, {}, () => new TypeError('Invalid'))
// throws TypeError: 'Invalid'
```

## Additional notes

### Cumulative setters

The model setters are cumulative by extension.

```js
const cumulative = etched.model(model, {
  set dynamic (value) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError('Must be a safe integer')
    }
  }
})

etched.etch(model, {
  dynamic: NaN
})
// Throws AggregateError: Unsafe etching
// with errors ['dynamic', TypeError: Must be a number]

etched.etch(cumulative, {
  dynamic: 0.1
})
// Throws AggregateError: Unsafe etching
// with errors ['dynamic', TypeError: Must be a safe integer]

etched.etch(cumulative, {
  dynamic: 456
})
// { constant: 123, dynamic: 456 }
```

### Unsafe etching

A model etching can't redeclare a constant...

```js
etched.model(model, {
  constant: 456
})
// Throws AggregateError: Unsafe etching
// with errors ['constant', ReferenceError: 'Duplicate constant `constant`']

etched.model(model, {
  set constant (value) {}
})
// Throws AggregateError: Unsafe etching
// with errors ['constant', ReferenceError: 'Duplicate constant `constant`']
```

... but an extension can declare a model property **as a constant**

```js
const model = etched.model({
  set constant (value) {}
})

const extended = etched.model(model, {
  constant: 456
})
// { constant: 456 }
```


## Licence

MIT
