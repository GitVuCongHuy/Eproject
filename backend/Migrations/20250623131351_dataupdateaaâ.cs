using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class dataupdateaaâ : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Login_Attempts");

            migrationBuilder.DropTable(
                name: "transaction_participants");

            migrationBuilder.DropTable(
                name: "transaction_Passwords");

            migrationBuilder.DropColumn(
                name: "status",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "transaction_type",
                table: "transactions");

            migrationBuilder.RenameColumn(
                name: "transaction_id",
                table: "transactions",
                newName: "TransactionId");

            migrationBuilder.RenameColumn(
                name: "transaction_date",
                table: "transactions",
                newName: "dransactionDate");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "transactions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "ReceiverAccount",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SenderAccount",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "id_banking_Receiver",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "id_banking_sender",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TransactionPassword",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "device",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AccountType",
                table: "Accounts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiverAccount",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "SenderAccount",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "id_banking_Receiver",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "id_banking_sender",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "TransactionPassword",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "device",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "AccountType",
                table: "Accounts");

            migrationBuilder.RenameColumn(
                name: "TransactionId",
                table: "transactions",
                newName: "transaction_id");

            migrationBuilder.RenameColumn(
                name: "dransactionDate",
                table: "transactions",
                newName: "transaction_date");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "transactions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "transaction_type",
                table: "transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Login_Attempts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    device = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    success = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Login_Attempts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Login_Attempts_Customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "Customers",
                        principalColumn: "customer_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transaction_participants",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    account_id = table.Column<int>(type: "int", nullable: false),
                    transaction_id = table.Column<int>(type: "int", nullable: false),
                    role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_participants", x => x.id);
                    table.ForeignKey(
                        name: "FK_transaction_participants_Accounts_account_id",
                        column: x => x.account_id,
                        principalTable: "Accounts",
                        principalColumn: "account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transaction_participants_transactions_transaction_id",
                        column: x => x.transaction_id,
                        principalTable: "transactions",
                        principalColumn: "transaction_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transaction_Passwords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    TransactionPassword = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_Passwords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transaction_Passwords_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "customer_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Login_Attempts_customer_id",
                table: "Login_Attempts",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_participants_account_id",
                table: "transaction_participants",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_participants_transaction_id",
                table: "transaction_participants",
                column: "transaction_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_Passwords_CustomerId",
                table: "transaction_Passwords",
                column: "CustomerId");
        }
    }
}
