import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import { Statement } from '../../entities/Statement';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let connection: Connection;

let token: string;
let user_id: string;
let deposit: ICreateStatementDTO;
let statementData: Statement;


describe('Authenticate User - Integration test',()=>{
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

    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send(mocUser);
      
    token = authResponse.body.token;
    user_id = authResponse.body.user.id;

    deposit = {
      user_id,
      type: "deposit", 
      amount: 13, 
      description: "a deposit"
    } as ICreateStatementDTO;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: deposit.amount,
        description: deposit.description
      })
      .set({
        Authorization: `Bearer ${token}`
    });
    statementData = response.body;
  });


  it("Should be possible retrieve a statement",async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementData.id}`)
      .set({
        Authorization: `Bearer ${token}`
      });
    const retrievedStatement = response.body;
    expect(response.status).toEqual(200);
    expect(retrievedStatement.id).toEqual( statementData.id );
    expect(retrievedStatement.user_id).toEqual( statementData.user_id );
  });

  it("Shouldn't be possible retrieve statement of a non-registered user",
    async () => {
      const response = await request(app)
        .get(`/api/v1/statements/${statementData.id}`)
        .set({
          Authorization: `Bearer ${token+1}`
        });
      expect(response.status).toEqual(401);
  });

  it("Shouldn't be possible retrieve non-registered statement",async () => {
    const mocStatementId = uuidV4();
    const response = await request(app)
      .get(`/api/v1/statements/${mocStatementId}`)
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toEqual(404);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});