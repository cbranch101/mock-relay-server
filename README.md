# mock-relay-server

A tool for using simple data input to mock a GraphQL schema in a way that allow for full CRUD access

## Example

```js
import { getMockedResolvers } from 'mock-relay-server'
import { makeExecutableSchema } from 'graphql-tools'

// Your full schema in GraphQL type language
const typeDefs = `
  type User {
      id : ID!
      name: String
  }
  ...
`

// The data to initialize your mock database
const users = [
    {
        id: '1',
        name: 'User One',
    },
    {
        id: '1',
        name: 'User Two',
    },
]

const mocks = {
    User: {
        // connections are created based on any types that are provided a
        // a data key, in this case only user
        // this is your interface with the mock database
        data: users,
    },
    Query: {
        // this resolver functions similarly to resolvers in graphql-tools
        // with the only additional wrinkle that you're provided connections
        // as a way to interface with the database
        resolver: connections => ({
            getUser: async (query, { userId }) => connections.User.getNode(userId),
            getUsers: connections.User.paginate,
        }),
    },
    Mutation: {
        resolver: connections => ({
            updateUser: connections.Widget.update,
            addUser: connections.Widget.create,
            deleteUser: connections.Widget.delete,
        }),
    },
}

const resolvers = getMockedResolvers(mocks)

// at this point, you have a fully valid graphQL schema that can be
// be used to locally run queries
const schema = makeExecutableSchema({ typeDefs: [typeDefs], resolvers })

```
## Creating mocks
The mocks in `mock-relay-server` are very similar to the [resolver map](https://www.apollographql.com/docs/graphql-tools/resolvers.html) from [`graphql-tools`](https://www.apollographql.com/docs/graphql-tools/) with a couple of key differences.  First, you can provide an optional `data` key which gives you full CRUD on the array of items provided. Second, instead of providing resolver directly, it's provided on a `resolver` key that returns a function that provides you the initialized `connections` and returns the final resolver map.

## Connections API

Connections are used to make it easy to implement resolvers.  Most of the time, you should be able to use one of the helpers on a connection with out needing any configuration.

### create / update / delete
These all should all work out of the box with very little customization.  The only requirement is that the mutation that they're mocking only accepts an `input` object as a variable

### getNode
Accepts a global id(the combination of the id and the nodes type) and returns the associated node

### paginate
Accepts standard relay compliant input variables and returns the expected relay compliant connection format  
