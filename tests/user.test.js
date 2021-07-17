const request = require('supertest');

const app = require('./../src/app');
const User = require('./../src/models/user');
const { userOneId, userOne, seedDatabase } = require('./fixtures/db');

beforeEach(seedDatabase);

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Fooname',
            email: 'baremail2@testmail.com',
            password: 'verysecret123456'
        })
        .expect(201);

    const user = await User.findById(response.body.user._id);

    expect(user).not.toBeNull();
    expect(response.body).toMatchObject({
        user: {
            name: 'Fooname',
            email: 'baremail2@testmail.com',
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('verysecret123456');
});

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    const user = await User.findById(response.body.user._id);
    
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'idont@exist.com',
            password: 'ishouldnotgetin'
        })
        .expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);

    expect(user).toBeNull();
});

test('Should not delete account for unathenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/nodejs.png')
        .expect(200);

    const user = await User.findById(userOneId);

    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Notmike'
        })
        .expect(200);

    const user = await User.findById(userOneId);

    expect(user.name).toBe('Notmike');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            _id: 'Thisshouldnotupdate'
        })
        .expect(400);
});

test('Should not signup user with invalid name/email/password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'baremail3@testmail.com',
            password: 'verysecret123456'
        })
        .expect(400);
        
    await request(app)
        .post('/users')
        .send({
            name: 'Test User',
            email: 'notcorrectemail',
            password: 'verysecret123456'
        })
        .expect(400);

    await request(app)
        .post('/users')
        .send({
            name: 'Test Elek',
            email: 'baremail4@testmail.com',
            password: 'password'
        })
        .expect(400);

    const userCount = await User.countDocuments();

    expect(userCount).toBe(2);
});

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Whoami?'
        })
        .expect(401);
});

test('Should not update user with invalid name/email/password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400);

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'notanemail'
        })
        .expect(400);

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: '2short'
        })
        .expect(400);

    const originalUser = await User.findByCredentials(userOne.email, userOne.password);
    
    expect(originalUser).not.toBeNull();
    expect(userOne.email).toBe(originalUser.email);
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)

    const userCount = await User.countDocuments();

    expect(userCount).toBe(2);
});