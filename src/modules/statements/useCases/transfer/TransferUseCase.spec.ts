import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { TransferError } from "./TransferError";
import { TransferUserCase } from "./TransferUseCase";

let statementsRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let transferUseCase: TransferUserCase;
describe("Transfer", () => {

  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    transferUseCase = new TransferUserCase(
      userRepository,
      statementsRepository
    );


  });

  it("Should be possible transfer amounts between two accounts", async () => {
    const originUser = await userRepository.create({
      name: 'Origin User',
      email: 'origin@user.com',
      password: 'originPassword'
    });
    const destinationUser = await userRepository.create({
      name: 'Destination User',
      email: 'destination@user.com',
      password: 'destinationPassword'
    });
    const depositOperation = {
      user_id: originUser.id,
      type: "deposit",
      amount: 20,
      description: "a deposit"
    } as ICreateStatementDTO;
    await statementsRepository.create(depositOperation);
    const { fromTransfer, toTransfer } = await transferUseCase.execute({
      originUserId: originUser.id!,
      destinationUserId: destinationUser.id!,
      amount: 10,
      description: "mocTransfer"
    });
    
    expect(fromTransfer).toHaveProperty("id");
    expect(fromTransfer).toHaveProperty("type");
    expect(fromTransfer.type).toEqual("withdraw");
    expect(toTransfer).toHaveProperty("id");
    expect(toTransfer).toHaveProperty("type");
    expect(toTransfer.type).toEqual("deposit");

  });


  it("Shouldn't be possible transfer to a non existing account", async () => {
    const originUser = await userRepository.create({
      name: 'Origin User',
      email: 'origin@user.com',
      password: 'originPassword'
    });
    await expect(transferUseCase.execute({
      originUserId: originUser.id!,
      destinationUserId: 'fakeUser',
      amount: 10,
      description: "mocTransfer"
    })).rejects.toEqual(new TransferError.DestinationUserNotFound());
  });

  it("Shouldn't be possible transfer when the user have no funds", async () => {
    const originUser = await userRepository.create({
      name: 'Origin User',
      email: 'origin@user.com',
      password: 'originPassword'
    });
    const destinationUser = await userRepository.create({
      name: 'Destination User',
      email: 'destination@user.com',
      password: 'destinationPassword'
    });
    const depositOperation = {
      user_id: originUser.id,
      type: "deposit",
      amount: 20,
      description: "a deposit"
    } as ICreateStatementDTO;
    await statementsRepository.create(depositOperation);
    await expect(
      transferUseCase.execute({
        originUserId: originUser.id!,
        destinationUserId: destinationUser.id!,
        amount: 30,
        description: "mocTransfer"
      })
    ).rejects.toEqual(new TransferError.InsufficientFunds());
  });

});