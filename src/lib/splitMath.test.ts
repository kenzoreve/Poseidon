import test from 'node:test';
import assert from 'node:assert/strict';
import {
  basisPointsToPercent,
  calculatePayoutBreakdown,
  distributeEvenlyBasisPoints,
  formatPercentFromBps,
  formatTokenAmount,
  parseTokenAmount,
  percentToBasisPoints,
  shortenAddress,
  validateShareUpdate,
  validateSplitDraft,
} from './splitMath';

test('percent and basis points round-trip cleanly', () => {
  assert.equal(percentToBasisPoints('50'), 5000);
  assert.equal(percentToBasisPoints('33.33'), 3333);
  assert.equal(percentToBasisPoints('0.01'), 1);
  assert.equal(basisPointsToPercent(3333n), 33.33);
  assert.equal(formatPercentFromBps(5000n), '50%');
  assert.equal(formatPercentFromBps(3333n), '33.33%');
  assert.equal(formatPercentFromBps(2550n), '25.5%');
});

test('distributeEvenlyBasisPoints always sums to 10000', () => {
  for (const count of [1, 2, 3, 4, 6, 7]) {
    const shares = distributeEvenlyBasisPoints(count);
    assert.equal(shares.length, count);
    assert.equal(
      shares.reduce((a, b) => a + b, 0),
      10000
    );
  }
});

test('validateSplitDraft validates addresses, duplicates, and 100% sum', () => {
  const addr1 = '0x1111111111111111111111111111111111111111';
  const addr2 = '0x2222222222222222222222222222222222222222';
  const token = '0x3600000000000000000000000000000000000000';

  const valid = validateSplitDraft({
    name: 'Treasury Split',
    token,
    recipients: [
      { address: addr1, percent: '60' },
      { address: addr2, percent: '40' },
    ],
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.totalBps, 10000);

  const duplicate = validateSplitDraft({
    name: 'Treasury Split',
    token,
    recipients: [
      { address: addr1, percent: '50' },
      { address: addr1.toUpperCase().replace('0X', '0x'), percent: '50' },
    ],
  });
  assert.equal(duplicate.valid, false);
  assert.ok(duplicate.errors.recipients[1]?.address);

  const underAllocated = validateSplitDraft({
    name: 'Treasury Split',
    token,
    recipients: [
      { address: addr1, percent: '50' },
      { address: addr2, percent: '25' },
    ],
  });
  assert.equal(underAllocated.valid, false);
  assert.equal(underAllocated.remainingBps, 2500);
  assert.ok(underAllocated.errors.total);
});

test('validateShareUpdate enforces positive shares totaling 100%', () => {
  const ok = validateShareUpdate(['33.34', '33.33', '33.33']);
  assert.equal(ok.valid, true);
  assert.equal(ok.totalBps, 10000);

  const bad = validateShareUpdate(['0', '100']);
  assert.equal(bad.valid, false);
  assert.ok(bad.rowErrors[0]);
});

test('calculatePayoutBreakdown handles rounding dust cleanly', () => {
  const payouts = calculatePayoutBreakdown(1000000n, [3334n, 3333n, 3333n]);
  assert.equal(payouts[0], 333400n);
  assert.equal(payouts[1], 333300n);
  assert.equal(payouts[2], 333300n);
  assert.equal(
    payouts.reduce((a, b) => a + b, 0n),
    1000000n
  );

  // Odd unit amount (101 base units split 3 ways)
  const oddPayouts = calculatePayoutBreakdown(101n, [3333n, 3333n, 3334n]);
  assert.equal(
    oddPayouts.reduce((a, b) => a + b, 0n),
    101n
  );
});

test('token amount parsing and formatting with 6 decimals', () => {
  const raw = parseTokenAmount('125.5', 6);
  assert.equal(raw, 125500000n);
  assert.equal(formatTokenAmount(raw!, 6), '125.5');
  assert.equal(formatTokenAmount(1000000n, 6), '1');
  assert.equal(parseTokenAmount('abc', 6), null);
});

test('shortenAddress formats cleanly', () => {
  assert.equal(
    shortenAddress('0x3600000000000000000000000000000000000000'),
    '0x3600...0000'
  );
});
