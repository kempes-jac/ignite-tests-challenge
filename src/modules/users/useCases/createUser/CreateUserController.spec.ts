import request from 'supertest';
import { Connection, createConnection } from 'typeorm';



import { app } from '../../../../app';

let connection: Connection;

const mocUser = {
  name: 'Test 1',
  email: 'email@email.com',
  password: 'aPassword'
}

describe('Create User - Integration test',()=>{

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

  });
  

  it("Should be possible create a new user", async ()=>{
    const response = await request(app)
      .post("/api/v1/users")
      .send(mocUser);
    expect(response.status).toBe(201);
  });

  it("Shouldn't be possible create a user whose email is registered to another user", async () =>{
    const response = await request(app)
      .post("/api/v1/users")
      .send(mocUser);
    expect(response.status).toBe(400);
  })

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});