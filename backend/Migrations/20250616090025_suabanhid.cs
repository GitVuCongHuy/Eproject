using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class suabanhid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Banks_bank_id1",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_bank_id1",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "bank_id1",
                table: "Customers");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Banks_bank_id",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_bank_id",
                table: "Customers");

            migrationBuilder.AddColumn<int>(
                name: "bank_id1",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_bank_id1",
                table: "Customers",
                column: "bank_id1");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Banks_bank_id1",
                table: "Customers",
                column: "bank_id1",
                principalTable: "Banks",
                principalColumn: "bank_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
