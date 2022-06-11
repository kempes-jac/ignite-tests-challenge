import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      sender_id
    }) => (
      {
        id,
        amount: Number(amount),
        description: ((type === 'deposit' && sender_id) ? 'Transferência de valor' : description),
        type: ((type === 'deposit' && sender_id) ? 'transfer' : type),
        created_at,
        updated_at,
        sender_id
      }
    ));

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
