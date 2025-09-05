import { getAccountTransactions } from '@/actions/accounts';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import TransactionTable from '../_component/transactionTable';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_component/AccountChart';
import DeleteAccountButtonWithModal from '../_component/DeleteAccountButtonWithModal';

const AccountPage = async ({ params }) => {
  const { id } = await params; 
  const accountData = await getAccountTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        {/* LEFT */}
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        {/* RIGHT */}
        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
          ₹{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense fallback={<BarLoader className="mt-4" width="100%" color="#06b6d4" />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transaction table */}
      <Suspense fallback={<BarLoader className="mt-4" width="100%" color="#06b6d4" />}>
        <TransactionTable transactions={transactions} />
      </Suspense>

      <div className="border-t border-gray-200 pt-6">
    <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
    <DeleteAccountButtonWithModal accountId={account.id} />
  </div>
    </div>
  );
};

export default AccountPage;
