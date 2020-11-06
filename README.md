# @etchedjs/etched

_Etches your JS objects in stone_

A utility to easily create some immutable objects by a chainable derivation, without any dependencies.


## Install

`npm i @etchedjs/etched`

Alternatively, in a browser, you can use it from the CDN:

```js
import etched from 'https://unpkg.com/@etchedjs/etched@latest/etched.js'
```


## Usage

### Create a model
```js
import etched from '@etchedjs/etched'

const model = etched.model(null, {
  withLink (link) {
    return etched.with(this, { link })
  },
  withName (name) {
    return etched.with(this, { name })
  }
})
```

### Extend a model
```js
const versioned = etched.model(model, {
  withVersion (version) {
    return etched.with(this, { version })
  }
})
```

### Create a model instance _with_ using the model methods
```js
const module = model
  .withLink('https://www.npmjs.com/package/@etchedjs/etched')
  .withName('@etched/etched')

console.log(module)
/*
{
  link: "https://www.npmjs.com/package/@etchedjs/etched",
  name: "@etched/etched"
}
*/
```

### Create a model instance _from_ etched
```js
const module = etched.from(model, {
  link: 'https://www.npmjs.com/package/@etchedjs/etched',
  name: '@etched/etched'
})

console.log(module)
/*
{
  link: "https://www.npmjs.com/package/@etchedjs/etched",
  name: "@etched/etched"
}
*/
```


## API

### etched.model

Creates a new immutable **model**, based on optional prototype and/or mixin.

It also acts as an instance.

Use it to declare your `with*` methods.
```js
/**
 * @template prototype
 * @template mixin
 * @param {instance<Object>|null} [prototype=null]
 * @param {mixin<{}>} [mixin={}]
 * @return {Readonly<instance&mixin>}
 */
const model = etched.model(prototype, mixin)
```

### etched.with

Creates a new immutable instance, based on a previous one, **with** any properties passed by the props object.
```js
/**
 * @template target
 * @template props
 * @param {target<Object>} target
 * @param {props<{}>} [props={}]
 * @return {Readonly<target&props>}
 */
const instance = etched.with(target, props)
```

### etched.from

Like the `etched.with` method, it provides a new instance by calling **all** the methods related to the props properties.

```js
/**
 * @template target
 * @template props
 * @param {target<Object>} target
 * @param {props<{}>} [props={}]
 * @return {Readonly<target&props>}
 */
const instance = etched.from(target, props)
```

Example: for a props `{ value: 123 }`, it calls `instance.withValue(123)`

Just declare your model like this:

```js
const model = etched.model(null, {
  withValue (value) {
    return etched.with(this, { value })
  }
})
```
