import request from 'supertest';
import { Connection, createConnection } from 'typeorm';



import { app } from '../../../../app';

let connection: Connection;

const mocUser = {
  name: 'Test 1',
  email: 'email@email.com',
  password: 'aPassword'
}
const wrongMocEmail: string = 'wrong@email.com';
const wrongMocPassword: string = 'bPassword';

describe('Authenticate User - Integration test',()=>{

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app)
      .post("/api/v1/users")
      .send(mocUser);
  });
  

  it("Should be possible authenticate a user", async ()=>{
    const response = await request(app)
      .post("/api/v1/sessions")
      .send(mocUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
  });

  it("Shouldn't be possible authenticate with a non-registered email", 
    async () => {
      const response = await request(app)
        .post("/api/v1/sessions")
        .send({email: wrongMocEmail, password: mocUser.password});
      expect(response.status).toBe(401);
    }
  );
  
  it("Shouldn't be possible authenticate with a wrong password", 
    async () => {
      const response = await request(app)
        .post("/api/v1/sessions")
        .send({email: mocUser.email, password: wrongMocPassword});
      expect(response.status).toBe(401);
    });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});