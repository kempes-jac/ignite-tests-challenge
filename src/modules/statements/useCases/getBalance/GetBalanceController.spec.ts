import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let connection: Connection;

let deposit: ICreateStatementDTO;
let withdraw:  ICreateStatementDTO;
let token: string;


describe('Statements - Integration test',()=>{

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

    deposit = {
        amount: 20, 
        description: "a deposit"
      } as ICreateStatementDTO;
    withdraw = {
        amount: 11, 
        description: "a withdraw"
      } as ICreateStatementDTO;
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: deposit.amount,
        description: deposit.description
      })
      .set({
        Authorization: `Bearer ${token}`
    });
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: withdraw.amount,
        description: withdraw.description
      })
      .set({
        Authorization: `Bearer ${token}`
    });
      
  });

  it("Should be possible get an user balance", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });
    const result = response.body;
    
    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement")
    expect(result.statement).toHaveLength(2);
    expect(result.balance).toEqual(9);
  });

  it("Should be possible get an user balance with transfers", async () => {
    const mocUser2 = {
      name: 'Test 2',
      email: 'email2@email.com',
      password: 'aPassword'
    }
    await request(app)
      .post("/api/v1/users")
      .send(mocUser2);
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send(mocUser2);
    const user_id2 = authResponse.body.user.id;
    const token2 = authResponse.body.token;


    await request(app)
      .post(`/api/v1/statements/transfers/${user_id2}`)
      .send({
        "amount": 2,
        "description": "moc description"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token2}`
      });
    const {statement, balance} = response.body;
    
    const transfer = statement.pop();
    
    expect(statement).toHaveLength(0);
    expect(balance).toEqual(2);
    expect(transfer).toHaveProperty('sender_id');
    expect(transfer.description).toEqual('Transferência de valor');
  });

  it("Shouldn't be possible get balance of a non-registered user", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token+1}`
      });
    expect(response.status).toEqual(401);
  })

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

});