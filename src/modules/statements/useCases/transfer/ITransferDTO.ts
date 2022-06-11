interface ITransferDTO {
  originUserId: string,
  destinationUserId: string,
  amount: number,
  description: string
}

export { ITransferDTO }