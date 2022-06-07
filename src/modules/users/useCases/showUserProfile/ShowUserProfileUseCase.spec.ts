import { hash } from "bcryptjs";


import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let repository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

const mocPassword: string = 'aPassword';
const mocEmail: string = 'email@email.com';

const mocUserFunc = async () => {
  return {
    name: 'Test 1',
    email: mocEmail,
    password: await hash(mocPassword, 8)
  }
}

const wrongMocId = 'mocid';

let newUser;

describe('Show User Profile',()=>{

  beforeEach(async ()=>{
    repository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(repository);
    showUserProfileUseCase = new ShowUserProfileUseCase(repository);
    newUser = await repository.create (await mocUserFunc());
  });

  it("Should be possible retrieve user profile", async () => {
    const { user, token } = await authenticateUserUseCase
      .execute({email: mocEmail, password: mocPassword});
    const retrievedUser = await showUserProfileUseCase
      .execute(user.id as string);
    expect(retrievedUser.name).toEqual(user.name);
    expect(retrievedUser.email).toEqual(user.email);
  } );
  
  it("Shouldn't be possible retrieve profile of a non-existing id", () => {
    expect( async () => {
      await authenticateUserUseCase
        .execute({email: mocEmail, password: mocPassword});
      await showUserProfileUseCase.execute(wrongMocId);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});