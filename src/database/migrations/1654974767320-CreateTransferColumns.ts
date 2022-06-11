import { table } from "console";
import {Column, MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class CreateTransferColumns1654974767320 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "statements",
            new TableColumn({
                name: "sender_id",
                type: "uuid",
                default: null,
                isNullable: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("statements", "sender_id");

    }

}
