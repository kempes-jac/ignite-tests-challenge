import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO = {
  user_id: string,
  description: string,
  amount: number,
  type: string,
  sender_id?: string
}
