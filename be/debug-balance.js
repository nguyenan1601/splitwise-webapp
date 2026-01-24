// Quick debug script to understand balance calculation
const balances = {
  'payer-id': 0,
  'member-2': 0,
};

// Expense: payer-id paid 100
balances['payer-id'] += 100;

// Splits: payer-id owes 50, member-2 owes 50
balances['payer-id'] -= 50;
balances['member-2'] -= 50;

console.log('Expected balances:');
console.log('payer-id:', balances['payer-id']); // Should be 50
console.log('member-2:', balances['member-2']); // Should be -50
