import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let repository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const mocUser = {
  name: 'Test 1',
  email: 'email@email.com',
  password: 'aPassword'
}

describe('Create User',()=>{

  beforeEach(()=>{
    repository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(repository);
  });

  it("Should be possible create a new user", async ()=>{
    const createdUser = await createUserUseCase.execute(mocUser);
    const validPassword = await compare(mocUser.password, createdUser.password)
    expect(createdUser).toHaveProperty("id");
    expect(createdUser.email).toEqual(mocUser.email);
    expect(createdUser.name).toEqual(mocUser.name);
    expect(validPassword).toEqual(true);
  });

  it("Shouldn't be possible create a user whose email is registered to another user", async () =>{
    expect( async ()=>{
      await createUserUseCase.execute(mocUser);
      await createUserUseCase.execute(mocUser);
    }).rejects.toBeInstanceOf(CreateUserError);
  })

});