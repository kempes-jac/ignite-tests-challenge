import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import { Statement } from '../../entities/Statement';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let connection: Connection;

let token: string;
let user_id1: string;
let user_id2: string;


describe("Transfer Controller",()=>{
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();


    const mocUser = {
      name: 'Test 1',
      email: 'email@email.com',
      password: 'aPassword'
    }
    await request(app)
      .post("/api/v1/users")
      .send(mocUser);
    const auth1Response = await request(app)
      .post("/api/v1/sessions")
      .send(mocUser);
    user_id1 = auth1Response.body.user.id;
    token = auth1Response.body.token;

    const mocUser2 = {
      name: 'Test 2',
      email: 'email2@email.com',
      password: 'aPassword'
    }
    await request(app)
      .post("/api/v1/users")
      .send(mocUser2);
    const auth2Response = await request(app)
      .post("/api/v1/sessions")
      .send(mocUser2);
    user_id2 = auth2Response.body.user.id;


    
  });


  it("Should be possible transfer amounts between two accounts", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 400,
        description: "A fake deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    
    const response = await request(app)
      .post(`/api/v1/statements/transfers/${user_id2}`)
      .send({
        "amount": 30,
        "description": "moc description"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
      
    expect(response.status).toEqual(201);
  });

  it("Shouldn't be possible transfer to a non existing account", async ()=>{
    const response = await request(app)
      .post(`/api/v1/statements/transfers/${uuidV4()}`)
      .send({
        "amount": 30,
        "description": "moc description"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
      
    expect(response.status).toEqual(404);
  });

  it("Shouldn't be possible transfer when the user have no funds",async ()=>{
    const response = await request(app)
      .post(`/api/v1/statements/transfers/${user_id2}`)
      .send({
        "amount": 3800,
        "description": "moc description"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    expect(response.status).toEqual(400);
  });

  afterAll(async ()=>{
    await connection.dropDatabase();
    await connection.close();
  })
});
