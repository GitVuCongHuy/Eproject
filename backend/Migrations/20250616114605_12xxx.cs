using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class _12xxx : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_transaction_participants_account_id",
                table: "transaction_participants",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_participants_transaction_id",
                table: "transaction_participants",
                column: "transaction_id");

            migrationBuilder.AddForeignKey(
                name: "FK_transaction_participants_Accounts_account_id",
                table: "transaction_participants",
                column: "account_id",
                principalTable: "Accounts",
                principalColumn: "account_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_transaction_participants_transactions_transaction_id",
                table: "transaction_participants",
                column: "transaction_id",
                principalTable: "transactions",
                principalColumn: "transaction_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_transaction_participants_Accounts_account_id",
                table: "transaction_participants");

            migrationBuilder.DropForeignKey(
                name: "FK_transaction_participants_transactions_transaction_id",
                table: "transaction_participants");

            migrationBuilder.DropIndex(
                name: "IX_transaction_participants_account_id",
                table: "transaction_participants");

            migrationBuilder.DropIndex(
                name: "IX_transaction_participants_transaction_id",
                table: "transaction_participants");
        }
    }
}
