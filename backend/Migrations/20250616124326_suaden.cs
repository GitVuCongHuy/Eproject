using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class suaden : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "number_login",
                table: "Login_Attempts");

            migrationBuilder.AddColumn<int>(
                name: "number_login",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "number_login",
                table: "Customers");

            migrationBuilder.AddColumn<int>(
                name: "number_login",
                table: "Login_Attempts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
