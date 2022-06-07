import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";


let statementRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

let user_id: string;
let deposit: ICreateStatementDTO;
let withdraw:  ICreateStatementDTO;
let wrongStatement: ICreateStatementDTO;
const mocUseId = "mocuserid";

describe('Create Statement', () => {
  
  beforeAll( async () => {
    const mocUser={name: 'Test', email: 'test@email.com', password: 'password'};
    userRepository = new InMemoryUsersRepository();
    const createUserUserCase = new CreateUserUseCase(userRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
    await createUserUserCase.execute(mocUser);
    const authData = await authenticateUserUseCase.execute({
      email: mocUser.email,
      password: mocUser.password
    });
    user_id = authData.user.id as string;
  });

  beforeEach( async () => {
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository, 
      statementRepository
    );
    deposit = {
      user_id,
      type: "deposit", 
      amount: 13, 
      description: "a deposit"
    } as ICreateStatementDTO;
    withdraw = {
      user_id,
      type: "withdraw", 
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
    const statement = await createStatementUseCase.execute(deposit);
    expect(statement).toHaveProperty("id");
  });

  it("Should be possible do withdraw", async () => {
    await createStatementUseCase.execute(deposit);
    const statement = await createStatementUseCase.execute(withdraw);
    expect(statement).toHaveProperty("id");
  });

  it("Shouldn't be possible to create a statement using a non-registered user",
    () => {
      expect( async () => {
        await createStatementUseCase.execute(wrongStatement);
      }).rejects.toBeInstanceOf( CreateStatementError.UserNotFound )
    });

    it("Shouldn't be possible to withdraw when user have no funds",
    () => {
      expect( async () => {
        await createStatementUseCase.execute(deposit);
        await createStatementUseCase.execute(withdraw);
        await createStatementUseCase.execute(withdraw);
      }).rejects.toBeInstanceOf( CreateStatementError.InsufficientFunds );
    });

});



