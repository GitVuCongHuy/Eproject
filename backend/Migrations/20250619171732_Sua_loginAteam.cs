using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Sua_loginAteam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Login_Attempts_Customers_customer_id1",
                table: "Login_Attempts");

            migrationBuilder.DropIndex(
                name: "IX_Login_Attempts_customer_id1",
                table: "Login_Attempts");

            migrationBuilder.DropColumn(
                name: "customer_id1",
                table: "Login_Attempts");

            migrationBuilder.CreateIndex(
                name: "IX_Login_Attempts_customer_id",
                table: "Login_Attempts",
                column: "customer_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Login_Attempts_Customers_customer_id",
                table: "Login_Attempts",
                column: "customer_id",
                principalTable: "Customers",
                principalColumn: "customer_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Login_Attempts_Customers_customer_id",
                table: "Login_Attempts");

            migrationBuilder.DropIndex(
                name: "IX_Login_Attempts_customer_id",
                table: "Login_Attempts");

            migrationBuilder.AddColumn<int>(
                name: "customer_id1",
                table: "Login_Attempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Login_Attempts_customer_id1",
                table: "Login_Attempts",
                column: "customer_id1");

            migrationBuilder.AddForeignKey(
                name: "FK_Login_Attempts_Customers_customer_id1",
                table: "Login_Attempts",
                column: "customer_id1",
                principalTable: "Customers",
                principalColumn: "customer_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
