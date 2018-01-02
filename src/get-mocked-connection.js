import _ from 'lodash'
import { connectionFromArray } from 'graphql-relay'

import getCollection from './get-collection'
import { fromGlobalId, toGlobalId } from './id-helpers'

const getConnection = async (args, collection) => {
    const foundItems = await collection.find(items => items.sort((a, b) => (a > b ? 1 : -1)))
    const droppedItems = _.drop(foundItems, args.offset || 0)
    const connection = connectionFromArray(droppedItems, args)
    return {
        ...connection,
        totalResults: foundItems.length,
    }
}

export default ({ edges, type }) => {
    const indexedEdges = edges.reduce(
        (memo, node) => ({
            ...memo,
            [node.id]: node,
        }),
        {},
    )
    const collection = getCollection(indexedEdges)
    const resolver = {
        id: obj => toGlobalId(obj.id, type),
    }

    return {
        paginate: (query, args) => getConnection(args, collection, type),
        getNode: (globalId) => {
            const { type: localType, id: localId } = fromGlobalId(globalId)
            const id = localId || localType
            return collection.findById(id).then(node => ({
                ...node,
                __typename: type,
            }))
        },
        create: (query, { input }) => {
            const { clientMutationId, ...fields } = input
            return collection.insert(fields).then(newItem => ({
                ...newItem,
                clientMutationId,
            }))
        },
        delete: (query, { input }) => {
            const { clientMutationId, id: globalId } = input
            const { id } = fromGlobalId(globalId)

            return collection.delete(id).then(deletedItem => ({
                ...deletedItem,
                clientMutationId,
            }))
        },
        update: (mutation, { input }) => {
            const { clientMutationId, id: globalId, ...fields } = input
            const { id } = fromGlobalId(globalId)
            return collection.update(id, { ...fields }).then(item => ({
                ...item,
                clientMutationId,
            }))
        },
        resolver,
    }
}
