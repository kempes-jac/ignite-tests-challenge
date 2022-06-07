import { hash } from "bcryptjs";


import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let repository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

const mocPassword: string = 'aPassword';
const mocEmail: string = 'email@email.com';
const wrongMocEmail: string = 'wrong@email.com';
const wrongMocPassword: string = 'bPassword';

const mocUserFunc = async () => {
  return {
    name: 'Test 1',
    email: mocEmail,
    password: await hash(mocPassword, 8)
  }
}

let user: User;

describe('Authenticate User',()=>{

  beforeEach(async ()=>{
    repository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(repository);
    user = await repository.create (await mocUserFunc());

  });

  it("Should be possible authenticate a user", async ()=>{
    const { user, token } = await authenticateUserUseCase
      .execute({email: mocEmail, password: mocPassword});
    expect(token).toBeDefined();
    expect(user.email).toEqual(mocEmail);
  });

  it("Shouldn't be possible authenticate with a non-registered email", 
    () => {
      expect( async () => {
        await authenticateUserUseCase.execute({
          email: wrongMocEmail, 
          password: mocPassword
        })
      } ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  );
  
  it("Shouldn't be possible authenticate with a wrong password", 
    () => {
      expect( async () => {
        await authenticateUserUseCase.execute({
          email: mocEmail, 
          password: wrongMocPassword
        })
      } ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

});