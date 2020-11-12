# @etchedjs/etched

_Etches your JS objects in stone_

A utility to easily create some immutable objects by a chainable derivation, without any dependencies.


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
```

### `etch.etch(instance, ...mixins)`


Creates a new immutable instance, based on a previous one and the optional mixins.

**It only takes the values of corresponding properties to a model setter.**

#### Example

```js
const instance = etched.etch(model, {
  dynamic: 456
}) // { constant: 123, dynamic: 456 }
```

### `etched.etches(model, instance)

Provides a way to check if an instance is an extension of the provided model.

#### Example
```js
etched.etches(etched.etched, instance) // true
etched.etches(model, instance) // true
etched.etches(model, model) // true
```

### `etched.partial(constants, instance, ...mixins)

Provides a way to etch an existing instance, but preserving the provided constants.

**Constants must etch the instance**

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
const extended = etched.model(model, {
  set dynamic (value) {
    if (!Number.isSafeInteger(value)) {
      throw new ReferenceError('Must be a safe integer')
    }
  }
})

etched.etch(model, {
  dynamic: NaN
}) // ReferenceError: Must be a number

etched.etch(extended, {
  dynamic: 0.1
}) // ReferenceError: Must be a safe integer

etched.etch(model, {
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

## Licence

MIT
