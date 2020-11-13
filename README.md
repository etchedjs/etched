# @etchedjs/etched

_Etches your JS objects in stone_

A utility to easily create some immutable objects, without any dependencies.

It provides:
* Fully immutable
* Lazy-setters, only declare the wanted properties and optionally validate them
* Inherited constants, declare the properties that can't be overridden on the instances
* Reduced prototype chain, an etched object always have its model as prototype
* Auto-reconcile, based on the model, the etched objects never take any unwanted properties


## Install

`npm i @etchedjs/etched`

Alternatively, in a browser, you can use it from the CDN:

```js
import * as etched from 'https://unpkg.com/@etchedjs/etched@latest/etched.js'
```

## Definitions

### Instance

A frozen object, based on a model object, by default: `etched.etched`

### Mixin

A mixin is an object provided to create an extension of the current instance.


## API

### etched.etched

The default instance

```js
etched.etched // {}
```

### etched.model

`etched.model([instance|null], ...mixins)`

Creates a new immutable **model**, based on optional etched instance and/or mixin.

It declares constants (direct value) and setters (to validate dynamic values)

It also acts as an instance.

#### Example
```js
const model = etched.model(null, {
  constant: 123,
  set dynamic (value) {
    if (isNaN(value)) {
      throw new ReferenceError('Must be a number')
    }
  }
}) // { constant: 123, dynamic: Setter }

const extended = etched.model(model, {
  set value (value) {}
}) // { constant: 123, dynamic: Setter, value: Setter }
```

### `etch.etch(instance, ...mixins)`


Creates a new immutable instance, based on a previous one and the optional mixins.

**It only takes the values of corresponding properties to a model setter.**

#### Example

```js
const instance = etched.etch(model, {
  dynamic: 456
}) // { constant: 123, dynamic: 456 }

const copy = etched.etch(model, instance, {
  dynamic: 789
}) // { constant: 123, dynamic: 789 }
```

### `etched.etches(model, instance)

Provides a way to check if an instance is an extension of the provided model.

#### Example
```js
etched.etches(etched.etched, instance) // true
etched.etches(model, instance) // true
etched.etches(model, model) // true
```

## Additional notes

### Cumulative setters

The model setters are cumulative by extension.

```js
const cumulative = etched.model(model, {
  set dynamic (value) {
    if (!Number.isSafeInteger(value)) {
      throw new ReferenceError('Must be a safe integer')
    }
  }
})

etched.etch(model, {
  dynamic: NaN
}) // ReferenceError: Must be a number

etched.etch(cumulative, {
  dynamic: 0.1
}) // ReferenceError: Must be a safe integer

etched.etch(cumulative, {
  dynamic: 456
}) // { constant: 123, dynamic: 456 }
```

### Unsafe etching

A model etching can't redeclare a constant.

```js
etched.model(model, {
  constant: 456
}) // ReferenceError: 'Unsafe etching'

etched.model(model, {
  set constant (value) {}
}) // ReferenceError: 'Unsafe etching'
```

## A concrete example

```js
import { etch, etches, model } from '@etchedjs/etched'

const entity = model(null, {
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

const account = model(entity, {
  set name (value) {
    if (typeof value !== 'string' || !value.length) {
      throw new ReferenceError('Must be a non-empty string')
    }
  },
  set score (value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 10) {
      throw new ReferenceError('Must be a valid score')
    }
  }
})

const jack = etch(account, {
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
console.log(etches(entity, account)) // true
console.log(etches(entity, jack)) // true
console.log(etches(account, jack)) // true
console.log(etches(entity, renamed)) // true
console.log(etches(account, renamed)) // true
```

Need to preserve the `entity` properties?

```js
const preserved = etch(account, jack, {
  id: 456, // ignored
  createdAt: new Date(), // ignored
  name: 'Jack-Renamed',
  score: 10
}, etch(entity, jack))

console.log(preserved) // {  id: 123, createdAt: 2020-11-12T19:54:12.979Z, name: 'Jack-Renamed', score: 10 }
```


## Licence

MIT
