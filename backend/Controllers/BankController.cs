using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;




[ApiController]
[Route("backend/[controller]")]

public class BankController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BankController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/bank
    [HttpGet]
    public async Task<IActionResult> GetBank()
    {
        var bank = await _context.Banks.FirstOrDefaultAsync();
        if (bank == null)
            return NotFound("No bank found.");
        return Ok(bank);
    }

    // POST: api/bank
    [HttpPost]
    public async Task<IActionResult> CreateBank([FromBody] Bank bank)
    {
        if (await _context.Banks.AnyAsync())
            return BadRequest("A bank already exists. Only one is allowed.");

        _context.Banks.Add(bank);
        await _context.SaveChangesAsync();
        return Ok(bank);
    }

  
   [HttpPut]
    public async Task<IActionResult> UpdateBank([FromBody] Bank updatedBank)
    {
        var bank = await _context.Banks.FirstOrDefaultAsync(); // không cần dùng id nữa
        if (bank == null)
            return NotFound("Bank not found.");

        bank.bank_name = updatedBank.bank_name;
        bank.address = updatedBank.address;
        bank.BankType = updatedBank.BankType;
        bank.ContactNumber = updatedBank.ContactNumber;
        bank.TotalBalance = updatedBank.TotalBalance;

        await _context.SaveChangesAsync();
        return Ok(bank);
    }

 
   
}
