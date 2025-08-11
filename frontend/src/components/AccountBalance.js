import { useCoinbaseAPI } from '../hooks/useCoinbaseAPI';

export const AccountBalance = () => {
  const { data: balance } = useCoinbaseAPI('balance');

  return (
    <div>
      <h3>Your Balance</h3>
      {balance?.map(account => (
        <div key={account.id}>
          {account.currency}: {account.balance}
        </div>
      ))}
    </div>
  );
};