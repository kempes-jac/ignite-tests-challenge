import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";


let statementRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

let user_id: string;
let deposit: ICreateStatementDTO;
const mocUseId = "mocuserid";
const mocStatementId = "mocstatementid";

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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      userRepository, 
      statementRepository
    );
    deposit = {
      user_id,
      type: "deposit", 
      amount: 13, 
      description: "a deposit"
    } as ICreateStatementDTO;
  });

  it("Should be possible retrieve a statement",async () => {
    const statementSaved = await statementRepository.create(deposit);
    const statementRetrieved = await getStatementOperationUseCase.execute({
      user_id, 
      statement_id: statementSaved.id as string
    });
    expect(statementRetrieved.id).toEqual( statementSaved.id );
    expect(statementRetrieved.user_id).toEqual( statementSaved.user_id );
  });

  it("Shouldn't be possible retrieve statement of a non-registered user",() => {
    expect( async () => {
      await getStatementOperationUseCase.execute({
        user_id: mocUseId, 
        statement_id: mocStatementId
      });
    }).rejects.toBeInstanceOf( GetStatementOperationError.UserNotFound );
  });

  it("Shouldn't be possible retrieve non-registered statement",() => {
    expect( async () => {
      await getStatementOperationUseCase.execute({
        user_id, 
        statement_id: mocStatementId
      });
    }).rejects.toBeInstanceOf( GetStatementOperationError.StatementNotFound );
  });
});



