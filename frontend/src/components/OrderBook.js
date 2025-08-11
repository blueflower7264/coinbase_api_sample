import { useWebSocket } from '../hooks/useWebSocket';

export const OrderBook = () => {
  const wsData = useWebSocket('ws://localhost:3001');

  if (!wsData || wsData.type !== 'l2update') return <div>Loading order book...</div>;

  return (
    <div>
      <h3>Order Book Updates</h3>
      <pre>{JSON.stringify(wsData.changes, null, 2)}</pre>
    </div>
  );
};