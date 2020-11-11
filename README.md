# @etchedjs/etched

_Etches your JS objects in stone_

A utility to easily create some immutable objects by a chainable derivation, without any dependencies.


## Install

`npm i @etchedjs/etched`

Alternatively, in a browser, you can use it from the CDN:

```js
import etched from 'https://unpkg.com/@etchedjs/etched@latest/etched.js'
```

## Definition of a mixin

A mixin is an object provided to create an extension of the current model/instance.


## API

### etched.model

`etched.model([instance|null], ...mixins)`

Creates a new immutable **model**, based on optional model and/or mixin.

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

### `etched.is(instance, model)

Provides a way to check if an instance is an extension of the provided model.

#### Example
```js
etched.is(instance, model) // true
etched.is(model, model) // true
```

## Additional notes

### Cumulative setters

The model setters are cumulative by extension.

```js
const extended = etched.model(model, {
  set dynamic (value) {
    if (Number.isSafeInteger()) {
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
  constant: 456
}) // ReferenceError: 'Unsafe etching'

etched.etch(model, {
  set dynamic () {
  
  }
}) // ReferenceError: 'Unsafe etching'
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
