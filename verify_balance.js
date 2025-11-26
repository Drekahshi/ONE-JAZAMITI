// Standalone verification script for formatBalance logic
// (Copied from src/utils/formatBalance.ts and stripped of types for Node.js execution)

const formatBalance = (balance, decimals = 12, unit = 'ONE') => {
    if (balance === undefined || balance === null) {
        return '0 ' + unit;
    }

    const balanceBigInt = BigInt(balance);
    const divisor = BigInt(10 ** decimals);

    const integerPart = balanceBigInt / divisor;
    const fractionalPart = balanceBigInt % divisor;

    // Pad fractional part with leading zeros if necessary
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0');

    // Trim trailing zeros from fractional part
    fractionalStr = fractionalStr.replace(/0+$/, '');

    if (fractionalStr.length > 0) {
        return `${integerPart}.${fractionalStr} ${unit}`;
    }

    return `${integerPart} ${unit}`;
};

// Test cases
console.log('Running formatBalance tests...');

const assert = (actual, expected, testName) => {
    if (actual === expected) {
        console.log(`[PASS] ${testName}`);
    } else {
        console.error(`[FAIL] ${testName}: Expected "${expected}", got "${actual}"`);
    }
};

assert(formatBalance('1500000000000'), '1.5 ONE', '1.5 ONE default');
assert(formatBalance('0'), '0 ONE', 'Zero balance');
assert(formatBalance(null), '0 ONE', 'Null balance');
assert(formatBalance('2000000', 6, 'USDC'), '2 USDC', 'USDC custom decimals');
assert(formatBalance('1005000000000'), '1.005 ONE', 'Fractional with zeros');

console.log('Verification complete.');
