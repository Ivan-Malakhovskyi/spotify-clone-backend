import { MigrationInterface, QueryRunner } from "typeorm";

export class New1746450351744 implements MigrationInterface {
    name = 'New1746450351744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`songs\` ADD \`playlistId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`songs\` ADD CONSTRAINT \`FK_46fc694bda96d0127f5a8ec3720\` FOREIGN KEY (\`playlistId\`) REFERENCES \`playlist\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_92ca9b9b5394093adb6e5f55c4b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_92ca9b9b5394093adb6e5f55c4b\``);
        await queryRunner.query(`ALTER TABLE \`songs\` DROP FOREIGN KEY \`FK_46fc694bda96d0127f5a8ec3720\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`songs\` DROP COLUMN \`playlistId\``);
    }

}
