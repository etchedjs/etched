# @etchedjs/etched

_Etches your JS objects in stone_

**[PRERELEASE]** A utility to easily create some immutable objects by a chainable derivation that can be traced.


## Install

`npm i @etchedjs/etched`


## Usage

```js
import etched from '@etchedjs/etched'

const user = etched
  .with({
    withName (name) {
      return this.with({ name }, import.meta)
    }
  })

console.log(user.withName('bob'))
/*
Object {
  with(),
  withName(name),
  name: "Bob"
}
*/
```


## Examples with and without traces

Considering the following **etched** module to build a URL:

```js
import etched, { traces } from '@etchedjs/etched'

/**
 * @type {module:etched}
 * @property {undefined|string} hash
 * @property {null|string} origin
 * @property {undefined|string} pathname
 * @property {undefined|module:etched/sdk/params} params
 */
const url = etched
  .with({
    origin: null,
    /**
     * @param {string} hash
     * @return {this|{hash:string}}
     */
    withHash (hash) {
      return this
        .with({ hash }, import.meta)
    },
    /**
     * @param {string} origin
     * @return {this|{origin:string}}
     */
    withOrigin (origin) {
      return this
        .with({ origin }, import.meta)
    },
    /**
     * @param {string} pathname
     * @return {this|{pathname:string}}
     */
    withPathname (pathname) {
      return this
        .with({ pathname }, import.meta)
    },
    /**
     * @param {module:etched/sdk/params} params
     * @return {this|{params:module:etched/sdk/params}}
     */
    withParams (params) {
      return this
        .with({ params }, import.meta)
    }
  })
```


### Without traces
```js
console.log(url
  .withOrigin('http://example.org')
  .withPathname('pathname')
  .withPathname('pathname2')
  .withHash('hash')
  .withParams({
    a: [1, 2],
    b: 3
  }))

/*
Object {
  with(),
  withHash(hash),
  withOrigin(origin),
  withPathname(pathname),
  withParams(params),
  origin: "http://example.org",
  pathname: "pathname2",
  hash: "hash",
  params: { a: [1, 2], b: 3 }
}
*/
```


### With traces
```js
console.log(url
  .with(traces)
  .withOrigin('http://example.org')
  .withPathname('pathname')
  .withPathname('pathname2')
  .withHash('hash')
  .withParams({
    a: [1, 2],
    b: 3
  }))

/*
Object {
  with(),
  withHash(hash),
  withOrigin(origin),
  withPathname(pathname),
  withParams(params),
  origin: "http://example.org",
  pathname: "pathname2",
  hash: "hash",
  params: { a: [1, 2], b: 3 },
  Symbol(extensible.traces): {
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { params: { a: [1, 2], b: 3 } },
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { hash: "hash" },
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { pathname: "pathname2" },
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { pathname: "pathname" },
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { origin: "http://example.org" }
  }
}
*/
```


### With traces before a specific point
```js  
console.log(url
  .withOrigin('http://example.org')
  .withPathname('pathname')
  .withPathname('pathname2')
  .with(traces)
  .withHash('hash')
  .withParams({
    a: [1, 2],
    b: 3
  }))

/*
Object {
  with(),
  withHash(hash),
  withOrigin(origin),
  withPathname(pathname),
  withParams(params),
  origin: "http://example.org",
  pathname: "pathname2",
  hash: "hash",
  params: { a: [1, 2], b: 3 },
  Symbol(extensible.traces): {
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { params: { a: [1, 2], b: 3 } },
    Symbol(https://extensible.glitch.me/assets/js/url.js): Object { hash: "hash" }
  }
}
*/
```
