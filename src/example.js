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
