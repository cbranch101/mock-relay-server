import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import { graphql } from 'graphql'

import testSchema from '../test-schema'
import { getMockedResolvers } from '../index'

const getSchema = (mocks, resolvers) => {
    const schema = makeExecutableSchema({
        typeDefs: [testSchema],
        resolvers,
    })
    addMockFunctionsToSchema({ schema, mocks, preserveResolvers: true })
    return schema
}

const getTestClient = (resolvers = {}) => {
    const schema = getSchema({}, resolvers)
    return {
        query: (query, vars) => graphql(schema, query, {}, {}, vars),
    }
}

const widgets = [
    {
        id: 'one',
        name: 'widget one',
        cost: 10,
    },
    {
        id: 'two',
        name: 'widget two',
        cost: 10,
    },
    {
        id: 'three',
        name: 'widget three',
        cost: 10,
    },
]

const widgetListQuery = `
  query Viewer($userId: ID, $first: Int, $after: String, $offset: Int){
    viewer(userId: $userId){
      user {
        name
        company{
          name
          averageCost
          widgetList(first: $first, after: $after, offset: $offset){
            edges{
              node{
                id
                name
              }
            }
          }
        }
      }
    }
  }
`

const companies = [
    {
        id: 'one',
        name: 'Company One',
        averageCost: 100,
    },
]

const users = [
    {
        id: 'one',
        name: 'Clay Branch',
        company_id: 'one',
    },
]

const baseResolvers = {
    Query: {
        resolver: connections => ({
            viewer: async (query, { userId }) => {
                const user = await connections.User.getNode(userId)
                return { user }
            },
        }),
    },
    Widget: {
        data: widgets,
    },
    Company: {
        data: companies,
        resolver: connections => ({
            widgetList: connections.Widget.paginate,
        }),
    },
    User: {
        data: users,
        resolver: connections => ({
            company: user => connections.Company.getNode(user.company_id),
        }),
    },
}
test('can mock queries', async () => {
    const resolvers = getMockedResolvers(baseResolvers)

    const testClient = getTestClient(resolvers)
    const result = await testClient.query(widgetListQuery, {
        userId: 'User__one',
        offset: 1,
        first: 1,
    })

    expect(result).toMatchSnapshot()
})

test('can mock update mutations', async () => {
    const resolvers = getMockedResolvers({
        ...baseResolvers,
        Mutation: {
            resolver: connections => ({
                updateWidget: connections.Widget.update,
            }),
        },
    })

    const testClient = getTestClient(resolvers)

    const mutation = `
      mutation UpdateWidget($input: UpdateWidgetInput) {
        updateWidget(input:$input) {
            name
            id
            cost
            clientMutationId
        }
      }
    `
    const mutationResult = await testClient.query(mutation, {
        input: {
            id: 'Widget__one',
            clientMutationId: 'mutationId',
            name: 'Updated Name',
        },
    })

    expect(mutationResult).toMatchSnapshot()
    const queryResult = await testClient.query(widgetListQuery, {
        userId: 'User__one',
    })

    expect(queryResult).toMatchSnapshot()
})
test('can query for a single item', async () => {
    const resolvers = getMockedResolvers(baseResolvers)
    const testClient = getTestClient(resolvers)

    const query = `
      query SingleItemQuery($id: ID) {
          node(id: $id) {
              id
              ... on Widget {
                  name
                  cost
              }
          }
      }
    `
    const queryResult = await testClient.query(query, {
        id: 'Widget__one',
    })

    expect(queryResult).toMatchSnapshot()
})

test('can mock create mutations', async () => {
    const resolvers = getMockedResolvers({
        ...baseResolvers,
        Mutation: {
            resolver: connections => ({
                addWidget: connections.Widget.create,
            }),
        },
    })

    const testClient = getTestClient(resolvers)

    const mutation = `
      mutation($input: AddWidgetInput!) {
          addWidget(input: $input) {
              id
              name
              cost
          }
      }
    `
    const mutationResult = await testClient.query(mutation, {
        input: {
            clientMutationId: 'mutationId',
            name: 'Updated Name',
            cost: 10,
        },
    })

    expect(mutationResult).toMatchSnapshot()

    const queryResult = await testClient.query(widgetListQuery, {
        userId: 'User__one',
    })

    expect(queryResult).toMatchSnapshot()
})

test('can mock delete mutations', async () => {
    const resolvers = getMockedResolvers({
        ...baseResolvers,
        Mutation: {
            resolver: connections => ({
                deleteWidget: connections.Widget.delete,
            }),
        },
    })

    const testClient = getTestClient(resolvers)

    const mutation = `
      mutation($input: DeleteWidgetInput!) {
          deleteWidget(input: $input) {
              id
              name
              cost
          }
      }
    `
    const mutationResult = await testClient.query(mutation, {
        input: {
            id: 'Widget__one',
        },
    })
    expect(mutationResult).toMatchSnapshot()
    const queryResult = await testClient.query(widgetListQuery, {
        userId: 'User__one',
    })
    expect(queryResult).toMatchSnapshot()
})
