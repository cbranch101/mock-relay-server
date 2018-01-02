export const toGlobalId = (id, type) => `${type}__${id}`
export const fromGlobalId = (globalId) => {
    const [type, id] = globalId.split('__')
    return {
        type,
        id,
    }
}
