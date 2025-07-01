using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
<<<<<<<< HEAD:backend/Migrations/20250624171129_ghichu.cs
    public partial class ghichu : Migration
========
    public partial class request : Migration
>>>>>>>> 85603ca19b5c9fc00735921e8b1e9231e6d2d402:backend/Migrations/20250629143149_request.cs
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bank_Transaction",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SenderAccount = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    id_banking_sender = table.Column<int>(type: "int", nullable: true),
                    ReceiverAccount = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    id_banking_Receiver = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    transactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    transaction_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bank_Transaction", x => x.TransactionId);
                });

            migrationBuilder.CreateTable(
                name: "Banks",
                columns: table => new
                {
                    bank_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    bank_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banks", x => x.bank_id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    customer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mobile = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    number_login = table.Column<int>(type: "int", nullable: false),
                    locked = table.Column<bool>(type: "bit", nullable: false),
                    authentication_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    device = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransactionPassword = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    citizen_identification_card = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.customer_id);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    account_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    CardNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CardType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreditIssuedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.account_id);
                    table.ForeignKey(
                        name: "FK_Accounts_Customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "Customers",
                        principalColumn: "customer_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Service_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    request_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    request_detail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    request_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Service_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_Service_requests_Customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "Customers",
                        principalColumn: "customer_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cheques",
                columns: table => new
                {
                    ChequeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IssuedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cheques", x => x.ChequeId);
                    table.ForeignKey(
                        name: "FK_Cheques_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "statements",
                columns: table => new
                {
                    statement_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    account_id = table.Column<int>(type: "int", nullable: false),
                    accountsaccount_id = table.Column<int>(type: "int", nullable: false),
                    PeriodType = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    StartDate = table.Column<DateTime>(type: "date", nullable: false),
                    EndDate = table.Column<DateTime>(type: "date", nullable: false),
                    GeneratedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_statements", x => x.statement_id);
                    table.ForeignKey(
                        name: "FK_statements_Accounts_accountsaccount_id",
                        column: x => x.accountsaccount_id,
                        principalTable: "Accounts",
                        principalColumn: "account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_customer_id",
                table: "Accounts",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_AccountId",
                table: "Cheques",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Service_requests_customer_id",
                table: "Service_requests",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_statements_accountsaccount_id",
                table: "statements",
                column: "accountsaccount_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bank_Transaction");

            migrationBuilder.DropTable(
                name: "Banks");

            migrationBuilder.DropTable(
                name: "Cheques");

            migrationBuilder.DropTable(
                name: "Service_requests");

            migrationBuilder.DropTable(
                name: "statements");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
