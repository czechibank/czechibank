import { TransactionTableView, TransactionWithUsers } from "@/components/transactions/table-view";
import type { Meta, StoryObj } from "@storybook/nextjs";

const mockUser = (name: string) => ({
  id: crypto.randomUUID(),
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  emailVerified: true,
  image: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  banExpires: null,
  banReason: null,
  banned: null,
  role: "user",
});

const BANK_ACCOUNT_ID = "acc-001";

const mockTransactions: TransactionWithUsers[] = [
  {
    id: "tx-001",
    amount: 1500,
    currency: "CZECHITOKEN",
    fromBankId: "acc-002",
    toBankId: BANK_ACCOUNT_ID,
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-03-20"),
    from: { user: mockUser("Alice Johnson") },
    to: { user: mockUser("Bob Smith") },
  },
  {
    id: "tx-002",
    amount: 300,
    currency: "CZECHITOKEN",
    fromBankId: BANK_ACCOUNT_ID,
    toBankId: "acc-003",
    createdAt: new Date("2025-03-19"),
    updatedAt: new Date("2025-03-19"),
    from: { user: mockUser("Bob Smith") },
    to: { user: mockUser("Charlie Brown") },
  },
  {
    id: "tx-003",
    amount: 750,
    currency: "CZECHITOKEN",
    fromBankId: "acc-004",
    toBankId: BANK_ACCOUNT_ID,
    createdAt: new Date("2025-03-18"),
    updatedAt: new Date("2025-03-18"),
    from: { user: mockUser("Diana Prince") },
    to: { user: mockUser("Bob Smith") },
  },
  {
    id: "tx-004",
    amount: 200,
    currency: "CZECHITOKEN",
    fromBankId: BANK_ACCOUNT_ID,
    toBankId: "acc-005",
    createdAt: new Date("2025-03-17"),
    updatedAt: new Date("2025-03-17"),
    from: { user: mockUser("Bob Smith") },
    to: { user: mockUser("Eve Wilson") },
  },
];

const meta: Meta<typeof TransactionTableView> = {
  title: "Transactions/Table",
  component: TransactionTableView,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TransactionTableView>;

export const Default: Story = {
  args: {
    transactions: mockTransactions,
    bankAccountId: BANK_ACCOUNT_ID,
    limit: 50,
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    bankAccountId: BANK_ACCOUNT_ID,
    limit: 50,
  },
};

export const SingleTransaction: Story = {
  args: {
    transactions: [mockTransactions[0]],
    bankAccountId: BANK_ACCOUNT_ID,
    limit: 50,
  },
};
