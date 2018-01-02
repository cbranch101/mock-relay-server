import getCollection from '../get-collection'

const userData = [
    {
        id: '1',
        name: 'tom',
    },
    {
        id: '2',
        name: 'larry',
    },
]

const postData = [
    {
        id: '1',
        text: 'the first post',
    },
    {
        id: '2',
        text: 'the second post',
    },
]

test('can find item by ID', async () => {
    const posts = getCollection(postData)
    const foundItem = await posts.findById('2')
    expect(foundItem).toMatchSnapshot()
})

test('can find and insert items', async () => {
    const users = getCollection(userData)
    const foundUsers = await users.find()
    expect(foundUsers).toMatchSnapshot()
    const createdUser = await users.insert({
        name: 'john',
    })
    expect(createdUser).toMatchSnapshot()
    const afterCreateUsers = await users.find()
    expect(afterCreateUsers).toMatchSnapshot()
})

test('can update users', async () => {
    const users = getCollection(userData)
    const updatedUser = await users.update('1', {
        name: 'updatedName',
    })
    expect(updatedUser).toMatchSnapshot()
    const afterUpdateUsers = await users.find()
    expect(afterUpdateUsers).toMatchSnapshot()
})
