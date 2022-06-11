import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferUserCase } from "./TransferUseCase";


class TransferController {

  async handle(request: Request, response: Response): Promise<Response> {
    const { id: destinationUserId } = request.params;
    const { id: originUserId } = request.user;
    const { amount, description } = request.body;
    const transferUseCase = container.resolve(TransferUserCase);

    await transferUseCase.execute({ 
      amount, 
      description, 
      originUserId, 
      destinationUserId 
    });

    return response.status(201).send();
  }
}

export { TransferController }

