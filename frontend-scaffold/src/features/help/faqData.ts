export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const faqData: FaqItem[] = [
  {
    id: "wallet-1",
    category: "Wallet Setup",
    question: "How do I set up a Stellar wallet?",
    answer:
      "To use Stellar Tipz you need a Stellar-compatible wallet such as Freighter, Albedo, or xBull. Install the browser extension for your chosen wallet, create a new account, and securely store your seed phrase. Once installed, click 'Connect Wallet' in the top navigation to link it to Tipz.",
  },
  {
    id: "wallet-2",
    category: "Wallet Setup",
    question: "Which wallets are supported?",
    answer:
      "Stellar Tipz currently supports Freighter, Albedo, and xBull wallet extensions. We recommend Freighter for beginners as it offers the most straightforward setup experience. All wallets connect to the Stellar testnet by default during beta.",
  },
  {
    id: "wallet-3",
    category: "Wallet Setup",
    question: "My wallet connection failed. What should I do?",
    answer:
      "First, make sure your wallet extension is installed and unlocked. Refresh the page and try connecting again. If the issue persists, check that your browser is up to date and that the wallet extension has permission to interact with this site. For further help, visit our Discord community.",
  },
  {
    id: "tips-1",
    category: "Sending Tips",
    question: "How do I send a tip?",
    answer:
      "Connect your wallet, then navigate to a creator's profile page by searching their username or visiting their profile link. Enter the XLM amount you want to send and an optional message, then click 'Send Tip'. Your wallet will prompt you to approve the transaction. The tip is confirmed once the Stellar transaction is included in a ledger.",
  },
  {
    id: "tips-2",
    category: "Sending Tips",
    question: "Is there a minimum tip amount?",
    answer:
      "Yes. The smart contract enforces a minimum tip amount to prevent spam transactions. The current minimum is displayed on the tip form before you confirm. This amount can be adjusted by contract administrators.",
  },
  {
    id: "tips-3",
    category: "Sending Tips",
    question: "Can I cancel a tip after sending it?",
    answer:
      "No. Once a tip transaction is submitted and confirmed on the Stellar network it cannot be reversed. Please double-check the creator's username and the XLM amount before approving the transaction in your wallet.",
  },
  {
    id: "register-1",
    category: "Registering",
    question: "How do I register as a creator?",
    answer:
      "Connect your Stellar wallet, then click 'Register' in the navigation menu. Fill in your username (3–32 lowercase alphanumeric characters), display name, bio, and optional social links. Submit the form and approve the on-chain transaction. Your profile will be live immediately after confirmation.",
  },
  {
    id: "register-2",
    category: "Registering",
    question: "Can I change my username after registering?",
    answer:
      "Usernames are stored on-chain and cannot be changed after registration. Your username is permanently linked to your Stellar address. You can update your display name, bio, and social links at any time from your profile settings.",
  },
  {
    id: "register-3",
    category: "Registering",
    question: "How do I withdraw tips I have received?",
    answer:
      "Go to your Dashboard and click 'Withdraw'. Enter the amount you wish to withdraw and confirm the transaction in your wallet. A small protocol fee (in basis points) is deducted from each withdrawal and sent to the fee collector address. The remaining XLM is sent directly to your wallet.",
  },
  {
    id: "credit-1",
    category: "Credit Score",
    question: "What is the credit score?",
    answer:
      "The credit score is an on-chain reputation metric (0–100) that reflects a creator's engagement and activity on the platform. It is calculated from the number of tips received, total tip volume, and social engagement metrics. A higher score improves your leaderboard ranking.",
  },
  {
    id: "credit-2",
    category: "Credit Score",
    question: "How can I improve my credit score?",
    answer:
      "Your score increases as you receive more tips and grow your community engagement. Linking an active X (Twitter) account with a strong follower and engagement rate also contributes positively. Scores are updated automatically each time you receive a tip or your social metrics are refreshed.",
  },
  {
    id: "fees-1",
    category: "Fees",
    question: "What fees does Stellar Tipz charge?",
    answer:
      "Stellar Tipz charges a protocol fee expressed in basis points (bps) on withdrawals only — not on tips received. For example, a fee of 100 bps equals 1%. The current fee rate is displayed on the withdrawal form. There is also a small Stellar network transaction fee (a few stroops) for every on-chain operation.",
  },
  {
    id: "fees-2",
    category: "Fees",
    question: "Where does the fee go?",
    answer:
      "The protocol fee is sent to a designated fee collector address governed by the contract administrator. These funds are used to support platform development and operations.",
  },
];

export const faqCategories = [
  "All",
  ...Array.from(new Set(faqData.map((item) => item.category))),
];
