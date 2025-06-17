using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class _123 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "from_account",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "to_account",
                table: "transactions");

            migrationBuilder.AddColumn<decimal>(
                name: "amount",
                table: "transactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "transaction_date",
                table: "transactions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "transaction_date",
                table: "transactions");

            migrationBuilder.AddColumn<int>(
                name: "from_account",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "to_account",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
