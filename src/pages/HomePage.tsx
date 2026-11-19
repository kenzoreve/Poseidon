import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlowingMoneyDiagram } from '../components/FlowingMoneyDiagram';
import { RippleButton } from '../components/RippleButton';
import { WaveDivider } from '../components/WaveDivider';
import { APP_CONFIG, SUPPORTED_TOKENS } from '../config/arc';
import { usePlatformStats, useTokenDetails } from '../hooks/usePoseidonContract';
import { formatTokenAmount } from '../lib/splitMath';

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    status: 'Live',
    title: 'Core splits live',
    description:
      'Create named splits in USDC or EURC with custom recipient percentages and settle every incoming payment in one transaction.',
  },
  {
    phase: 'Phase 2',
    status: 'Next',
    title: 'Multi token splits',
    description:
      'Allow a single split configuration to accept and route multiple supported Arc stablecoins without deploying separate splits.',
  },
  {
    phase: 'Phase 3',
    status: 'Planned',
    title: 'Invoices that pay into a split',
    description:
      'Generate itemized payment requests linked to any split so client settlements divide automatically upon payment.',
  },
  {
    phase: 'Phase 4',
    status: 'Planned',
    title: 'Recurring splits',
    description:
      'Schedule repeatable split distributions for ongoing contributor retainers, rent shares, and treasury allocations.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is anything held in escrow?',
    answer:
      'No. Poseidon never holds balances in custody or escrow. When a payer submits a payment, the contract reads the split percentages and transfers each recipient their share directly in that same transaction.',
  },
  {
    question: 'Can shares be changed?',
    answer:
      'Yes. The wallet that created the split can update recipient shares at any time from the Split Detail page, as long as the updated percentages still total 100%.',
  },
  {
    question: 'Who pays the gas?',
    answer:
      'The wallet submitting each action pays the network fee on Arc: the creator pays gas when creating a split or updating shares, and the payer pays gas when approving a token and paying into a split.',
  },
  {
    question: 'What happens with rounding?',
    answer:
      'Shares are stored on chain in basis points (where 100% equals 10,000 basis points). When a token amount is divided using integer math, any indivisible remainder unit is routed directly to the final recipient so nothing is ever left behind in the contract.',
  },
];

export function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const usdc = useTokenDetails(SUPPORTED_TOKENS[0].address);
  const eurc = useTokenDetails(SUPPORTED_TOKENS[1].address);

  const contractConfigured = Boolean(APP_CONFIG.contractAddress);

  return (
    <div>
      {/* Hero Section — Pearl */}
      <section className="bg-[#FFFDF8] pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm font-semibold text-[#5B7480]">
                Built on Arc · Zero escrow settlement
              </p>
              <h1 className="text-[36px] leading-[44px] sm:text-[52px] sm:leading-[60px] font-bold tracking-[-0.03em] text-[#0B4F5C] text-balance">
                Split every payment on arrival
              </h1>
              <p className="text-lg leading-7 text-[#5B7480] max-w-xl">
                Create a split with fixed recipient percentages in USDC or EURC. Every incoming
                payment divides across recipients inside the same transaction, with nothing held
                in escrow.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/create">
                  <RippleButton variant="primary">
                    <span>Create a Split</span>
                    <ArrowRight className="w-4 h-4" />
                  </RippleButton>
                </Link>
                <Link to="/pay">
                  <RippleButton variant="secondary">Pay a Split</RippleButton>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <FlowingMoneyDiagram />
            </div>
          </div>
        </div>
      </section>

      <WaveDivider from="pearl" to="sand" />

      {/* Live Contract Metrics Band — Sand */}
      <section className="bg-[#F6E9D2] py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                On Chain Telemetry
              </p>
              <h2 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] font-bold tracking-[-0.025em] text-[#0B4F5C]">
                Live protocol figures on Arc
              </h2>
            </div>
            <p className="text-sm text-[#5B7480]">
              {contractConfigured
                ? 'Values read directly from the deployed Poseidon contract'
                : 'Contract address pending deployment configuration'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="treasury-card bg-[#FFFDF8] border border-[#5B7480]/15 p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                Splits Created
              </p>
              <p className="text-[32px] leading-[38px] font-bold text-[#0B4F5C] tabular-nums">
                {statsLoading
                  ? 'Loading'
                  : stats
                    ? stats.totalSplits.toString()
                    : contractConfigured
                      ? '0'
                      : 'Not set'}
              </p>
              <p className="text-xs text-[#5B7480] mt-2">
                Total split configurations deployed
              </p>
            </div>

            <div className="treasury-card bg-[#FFFDF8] border border-[#5B7480]/15 p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                Payments Routed
              </p>
              <p className="text-[32px] leading-[38px] font-bold text-[#0B4F5C] tabular-nums">
                {statsLoading
                  ? 'Loading'
                  : stats
                    ? stats.totalPayments.toString()
                    : contractConfigured
                      ? '0'
                      : 'Not set'}
              </p>
              <p className="text-xs text-[#5B7480] mt-2">
                Single transaction settlements completed
              </p>
            </div>

            <div className="treasury-card bg-[#FFFDF8] border border-[#5B7480]/15 p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                Volume Settled
              </p>
              <p className="text-[32px] leading-[38px] font-bold text-[#0B4F5C] tabular-nums">
                {statsLoading
                  ? 'Loading'
                  : stats
                    ? formatTokenAmount(stats.totalVolume, usdc.decimals ?? 6)
                    : contractConfigured
                      ? '0'
                      : 'Not set'}
              </p>
              <p className="text-xs text-[#5B7480] mt-2">
                Cumulative units distributed across splits
              </p>
            </div>

            <div className="treasury-card bg-[#FFFDF8] border border-[#5B7480]/15 p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                Supported Tokens
              </p>
              <p className="text-[24px] leading-[38px] font-bold text-[#0B4F5C] tabular-nums">
                USDC · EURC
              </p>
              <p className="text-xs text-[#5B7480] mt-2 tabular-nums">
                {usdc.decimals !== undefined && eurc.decimals !== undefined
                  ? `Verified ${usdc.decimals} & ${eurc.decimals} decimals on Arc`
                  : 'Available on Arc'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider from="sand" to="pearl" flip />

      {/* About Section — Pearl */}
      <section id="about" className="bg-[#FFFDF8] py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
              How Poseidon Works
            </p>
            <h2 className="text-[28px] leading-[36px] sm:text-[40px] sm:leading-[48px] font-bold tracking-[-0.025em] text-[#0B4F5C] text-balance mb-4">
              One transaction and zero escrow
            </h2>
            <p className="text-base sm:text-lg text-[#5B7480] leading-relaxed">
              Traditional billing pools collect funds in an intermediate account and force recipients
              to claim later. Poseidon routes every payment directly from the payer to each
              recipient in the same block.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-8">
              <p className="text-sm font-bold text-[#0B4F5C] mb-3 tabular-nums">01. Configure</p>
              <h3 className="text-xl font-semibold text-[#0B4F5C] mb-2">
                Define recipients and shares
              </h3>
              <p className="text-[15px] text-[#5B7480] leading-relaxed">
                Name your split, choose USDC or EURC, and assign percentage shares totaling 100%.
                Percentages are stored on chain as basis points for exact math.
              </p>
            </div>

            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-8">
              <p className="text-sm font-bold text-[#0B4F5C] mb-3 tabular-nums">02. Approve</p>
              <h3 className="text-xl font-semibold text-[#0B4F5C] mb-2">
                Share a public payment link
              </h3>
              <p className="text-[15px] text-[#5B7480] leading-relaxed">
                Anyone can open your split link, inspect every recipient share before sending,
                approve the exact token allowance, and submit payment.
              </p>
            </div>

            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-8">
              <p className="text-sm font-bold text-[#0B4F5C] mb-3 tabular-nums">03. Settle</p>
              <h3 className="text-xl font-semibold text-[#0B4F5C] mb-2">
                Instant direct transfers
              </h3>
              <p className="text-[15px] text-[#5B7480] leading-relaxed">
                The contract calculates each share at execution time and transfers tokens straight
                to every recipient wallet. Nothing remains inside the contract.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider from="pearl" to="teal" />

      {/* Roadmap Section — Deep Teal */}
      <section id="roadmap" className="bg-[#0B4F5C] text-[#FFFDF8] py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6FD6B5] mb-2">
              Roadmap
            </p>
            <h2 className="text-[28px] leading-[36px] sm:text-[40px] sm:leading-[48px] font-bold tracking-[-0.025em] text-[#FFFDF8] text-balance mb-4">
              Where the current flows next
            </h2>
            <p className="text-base sm:text-lg text-[#F6E9D2]/85 leading-relaxed">
              Built on Arc with a focused progression from single-transaction splits to automated
              billing workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP_PHASES.map((item) => (
              <div
                key={item.phase}
                className="rounded-3xl bg-[#073842] border border-[#5B7480]/30 p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#6FD6B5]">
                      {item.phase}
                    </span>
                    <span className="text-xs font-semibold text-[#F6E9D2]/85">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#FFFDF8] mb-2.5">{item.title}</h3>
                  <p className="text-sm text-[#F6E9D2]/85 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider from="teal" to="sand" flip />

      {/* FAQ Section — Sand */}
      <section id="faq" className="bg-[#F6E9D2] py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
                Frequently Asked Questions
              </p>
              <h2 className="text-[28px] leading-[36px] sm:text-[40px] sm:leading-[48px] font-bold tracking-[-0.025em] text-[#0B4F5C] text-balance mb-4">
                Common questions answered plainly
              </h2>
              <p className="text-[15px] text-[#5B7480] leading-relaxed">
                Straight answers on custody, share updates, network fees, and basis point rounding.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.question}
                    className="treasury-card bg-[#FFFDF8] border border-[#5B7480]/15 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F5C] focus-visible:ring-inset"
                    >
                      <span className="text-base sm:text-lg font-semibold text-[#0B4F5C]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#0B4F5C] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-[15px] text-[#5B7480] leading-relaxed border-t border-[#5B7480]/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
