import test from 'node:test';
import assert from 'node:assert/strict';
import type { Abi } from 'viem';
import { parseExplorerAbiResponse, resolveContractFunction } from './abiResolver';

const SAMPLE_ABI: Abi = [
  {
    type: 'function',
    name: 'createSplit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'sharesBps', type: 'uint256[]' },
    ],
    outputs: [{ name: 'splitId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getSplitPayments',
    stateMutability: 'view',
    inputs: [{ name: 'splitId', type: 'uint256' }],
    outputs: [{ name: '', type: 'tuple[]' }],
  },
  {
    type: 'function',
    name: 'pay',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'splitId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
];

test('resolveContractFunction matches primary and alias function names', () => {
  const createFn = resolveContractFunction(SAMPLE_ABI, 'createSplit');
  assert.equal(createFn?.name, 'createSplit');

  const payFn = resolveContractFunction(SAMPLE_ABI, 'paySplit');
  assert.equal(payFn?.name, 'pay');

  const historyFn = resolveContractFunction(SAMPLE_ABI, 'getPaymentsBySplit');
  assert.equal(historyFn?.name, 'getSplitPayments');

  const missing = resolveContractFunction(SAMPLE_ABI, 'updateShares');
  assert.equal(missing, null);
});

test('parseExplorerAbiResponse handles Blockscout v2 and legacy Etherscan responses', () => {
  const v2 = parseExplorerAbiResponse({ abi: SAMPLE_ABI });
  assert.equal(v2?.length, 3);

  const legacy = parseExplorerAbiResponse({ status: '1', result: JSON.stringify(SAMPLE_ABI) });
  assert.equal(legacy?.length, 3);

  const invalid = parseExplorerAbiResponse({ abi: [] });
  assert.equal(invalid, null);
});
