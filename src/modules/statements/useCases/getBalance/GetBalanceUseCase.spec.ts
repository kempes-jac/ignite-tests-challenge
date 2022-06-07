import auth from "../../../../config/auth";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let balanceRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

let user_id: string;
const mocUseId = "mocuserid";

describe('Get Balance', () => {
  
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
    balanceRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(balanceRepository,userRepository);
    const deposit = {
      user_id,
      type: "deposit", 
      amount: 13, 
      description: "a deposit"
    } as ICreateStatementDTO;
    const withdraw = {
      user_id,
      type: "withdraw", 
      amount: 2, 
      description: "a withdraw"
    } as ICreateStatementDTO;
    balanceRepository.create(deposit);
    balanceRepository.create(withdraw)
  });

  it("Should be possible get an user balance", async () => {
    const result = await getBalanceUseCase.execute({user_id});
    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement")
    expect(result.statement).toHaveLength(2);
    expect(result.balance).toEqual(11);
  });

  it("Shouldn't be possible get balance of a non-registered user", () => {
    expect( async () => {
      await getBalanceUseCase.execute({user_id: mocUseId});
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
});