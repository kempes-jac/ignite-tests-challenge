import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferError {
  export class OriginUserNotFound extends AppError {
    constructor() {
      super('Origin user not found', 404);
    }
  }

  export class DestinationUserNotFound extends AppError {
    constructor() {
      super('Destination user not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
