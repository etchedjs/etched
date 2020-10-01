import { traces } from './etched/etched.js'
import { requests, url } from './sdk/sdk.js'

const query = requests.node
  .withRespondWith(function () {

  })
  .withUrl(url
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
query.fetch()
  .then(response => response.text())
// .then(data => console.log(data))

 */

console.log(query.url)
