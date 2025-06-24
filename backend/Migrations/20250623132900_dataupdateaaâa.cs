using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class dataupdateaaâa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Banks_bank_id",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_bank_id",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "bank_id",
                table: "Customers");

            migrationBuilder.AddColumn<string>(
                name: "transaction_status",
                table: "transactions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "transaction_status",
                table: "transactions");

            migrationBuilder.AddColumn<int>(
                name: "bank_id",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_bank_id",
                table: "Customers",
                column: "bank_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Banks_bank_id",
                table: "Customers",
                column: "bank_id",
                principalTable: "Banks",
                principalColumn: "bank_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
