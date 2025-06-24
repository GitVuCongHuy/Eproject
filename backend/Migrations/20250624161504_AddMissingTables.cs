using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_transactions",
                table: "transactions");

            migrationBuilder.RenameTable(
                name: "transactions",
                newName: "Transaction");

            migrationBuilder.RenameColumn(
                name: "dransactionDate",
                table: "Transaction",
                newName: "transactionDate");

            migrationBuilder.AddColumn<string>(
                name: "citizen_identification_card",
                table: "Customers",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CardType",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreditIssuedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transaction",
                table: "Transaction",
                column: "TransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Transaction",
                table: "Transaction");

            migrationBuilder.DropColumn(
                name: "citizen_identification_card",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CardType",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "CreditIssuedDate",
                table: "Accounts");

            migrationBuilder.RenameTable(
                name: "Transaction",
                newName: "transactions");

            migrationBuilder.RenameColumn(
                name: "transactionDate",
                table: "transactions",
                newName: "dransactionDate");

            migrationBuilder.AddPrimaryKey(
                name: "PK_transactions",
                table: "transactions",
                column: "TransactionId");
        }
    }
}
