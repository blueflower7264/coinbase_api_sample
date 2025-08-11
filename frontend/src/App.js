import { PriceChart } from './components/PriceChart';
import { OrderBook } from './components/OrderBook';
import { AccountBalance } from './components/AccountBalance';

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Crypto Dashboard</h1>
      <PriceChart product="BTC-USD" startTime="2025-08-10T02:00:00Z" endTime="2025-08-10T10:20:00Z"/>
      <OrderBook />
      <AccountBalance />
    </div>
  );
}

export default App;
