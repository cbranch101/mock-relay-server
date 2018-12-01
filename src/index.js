/* eslint-disable import/prefer-default-export */
import 'babel-polyfill'

import { fromGlobalId } from './id-helpers'
import getMockedConnection from './get-mocked-connection'
import getCollection from './getCollection';

export const getMockedResolvers = (connections) => {
    const mockedConnections = Object.keys(connections).reduce((memo, type) => {
        const { data } = connections[type]
        if (!data) return memo
        return {
            ...memo,
            [type]: getMockedConnection({ edges: data, type }),
        }
    }, {})
    const outputConnections = {
        ...mockedConnections,
        Node: {
            query: (query, { id }) => {
                const { type } = fromGlobalId(id)
                return mockedConnections[type].getNode(id)
            },
        },
    }
    const mockedResolvers = Object.keys(connections).reduce((memo, type) => {
        const { resolver } = connections[type]

        if (!resolver && !outputConnections[type]) return memo
        const connectionResolver = outputConnections[type] ? outputConnections[type].resolver : {}
        const unwrappedResolver = resolver ? resolver(outputConnections) : {}
        return {
            ...memo,
            [type]: {
                ...connectionResolver,
                ...unwrappedResolver,
            },
        }
    }, {})

    return {
        ...mockedResolvers,
        Query: {
            ...mockedResolvers.Query,
            node: outputConnections.Node.query,
        },
        Node: {
            __resolveType: (obj, context, info) => {
                const { type } = fromGlobalId(info.variableValues.id)
                return type
            },
        },
    }
}

export const getMockCollection = getCollection
/* eslint-enable import/prefer-default-export */
