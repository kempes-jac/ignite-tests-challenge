import request from 'supertest';
import { Connection, createConnection } from 'typeorm';



import { app } from '../../../../app';

let connection: Connection;

const mocUser = {
  name: 'Test 1',
  email: 'email@email.com',
  password: 'aPassword'
}

describe('Authenticate User - Integration test',()=>{

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app)
      .post("/api/v1/users")
      .send(mocUser);
  });


    it("Should be possible retrieve user profile", async () => {
      const authResponse = await request(app)
        .post("/api/v1/sessions")
        .send(mocUser);
      const { user, token } = authResponse.body;
      const response  = await request(app)
        .get("/api/v1/profile")
        .set({
          Authorization: `Bearer ${token}`
        });
      const userProfile = response.body;
      expect(response.status).toEqual(200);
      expect(userProfile.name).toEqual(user.name);
      expect(userProfile.email).toEqual(user.email);
    } );
    
    it("Shouldn't be possible retrieve profile of a non-existing id",async()=> {
      const authResponse = await request(app)
        .post("/api/v1/sessions")
        .send(mocUser);
      const { token } = authResponse.body;
      const response  = await request(app)
        .get("/api/v1/profile")
        .set({
          Authorization: `Bearer ${token+1}`
        });
      expect(response.status).toEqual(401);
    });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});