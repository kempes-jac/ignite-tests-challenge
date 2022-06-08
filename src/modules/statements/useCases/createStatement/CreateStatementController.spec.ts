import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateStatementDTO } from './ICreateStatementDTO';

let connection: Connection;

let user_id: string;
let deposit: ICreateStatementDTO;
let withdraw:  ICreateStatementDTO;
let wrongStatement: ICreateStatementDTO;
let token: string;
const mocUseId = "mocuserid";


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
        amount: 13, 
        description: "a deposit"
      } as ICreateStatementDTO;
      withdraw = {
        amount: 11, 
        description: "a withdraw"
      } as ICreateStatementDTO;
      wrongStatement = {
        user_id: mocUseId,
        type: "deposit", 
        amount: 13, 
        description: "a deposit"
      } as ICreateStatementDTO;
  });

  it("Should be possible do deposit", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: deposit.amount,
        description: deposit.description
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    
    const statementData = response.body;
    expect(response.status).toEqual(201);
    expect(statementData).toHaveProperty("id");
    expect(statementData).toHaveProperty("user_id");
    expect(statementData.user_id).toEqual(user_id);
    expect(statementData).toHaveProperty("type");
    expect(statementData.type).toEqual("deposit");
  });

  it("Should be possible do withdraw", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: withdraw.amount,
        description: withdraw.description
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    
    const statementData = response.body;
    expect(response.status).toEqual(201);
    expect(statementData).toHaveProperty("id");
    expect(statementData).toHaveProperty("user_id");
    expect(statementData.user_id).toEqual(user_id);
    expect(statementData).toHaveProperty("type");
    expect(statementData.type).toEqual("withdraw");
  });

  it("Shouldn't be possible do a deposit using a non-registered user",
    async () => {
      const response = await request(app)
        .post("/api/v1/statements/deposit")
        .send({
          amount: deposit.amount,
          description: deposit.description
        })
        .set({
          Authorization: `Bearer ${token+1}`
        });
      expect(response.status).toEqual(401);
  });

  it("Shouldn't be possible do a withdraw using a non-registered user",
    async () => {
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send({
          amount: withdraw.amount,
          description: withdraw.description
        })
        .set({
          Authorization: `Bearer ${token+1}`
        });
      expect(response.status).toEqual(401);
  });

  it("Shouldn't be possible to withdraw when user have no funds",
    async () => {
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send({
          amount:  wrongStatement.amount,
          description: wrongStatement.description
        })
        .set({
          Authorization: `Bearer ${token}`
        });
      expect(response.status).toEqual(400);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});