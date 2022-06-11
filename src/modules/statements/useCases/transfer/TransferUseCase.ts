import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { ITransferDTO } from "./ITransferDTO";
import { TransferError } from "./TransferError";

interface IResponse {
  fromTransfer: Statement;
  toTransfer: Statement;
}

@injectable()
class TransferUserCase {

  constructor(
    @inject("UsersRepository")
    private userRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({
    originUserId,
    destinationUserId,
    description,
    amount }: ITransferDTO): Promise<IResponse> {

    const destinationUser = await this.userRepository.findById(
      destinationUserId
    );

    if (!destinationUser) {
      throw new TransferError.DestinationUserNotFound();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id: originUserId,
      with_statement: false
    });

    if (balance.balance < amount) {
      throw new TransferError.InsufficientFunds();
    }

    const outGoingStatement = {
      type: 'withdraw',
      amount,
      description,
      user_id: originUserId,
      sender_id: destinationUserId
    } as ICreateStatementDTO;

    const fromTransfer =
      await this.statementsRepository.create(outGoingStatement);

    const inComingTransfer = {
      type: 'deposit',
      amount,
      description,
      user_id: destinationUserId,
      sender_id: originUserId
    } as ICreateStatementDTO;
    const toTransfer =
      await this.statementsRepository.create(inComingTransfer);


    return { fromTransfer, toTransfer } as IResponse;
  }
}

export { TransferUserCase }