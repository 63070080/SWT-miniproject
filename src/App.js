import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div>
      {/* Navigation Bar */}
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Accounts</a></li>
          <li><a href="#">Transactions</a></li>
          <li><a href="#">Transfer Money</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main>
        <h1>Welcome to Bank of React</h1>
        <p>View your account balance, transfer money, and more!</p>

        <div className="accounts">
          <h2>Your Accounts</h2>
          <ul>
            <li>Checking Account: $1,000.00</li>
            <li>Savings Account: $5,000.00</li>
            <li>Credit Card: $500.00</li>
          </ul>
        </div>

        <div className="transactions">
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>04/01/2023</td>
                <td>Deposit</td>
                <td>$500.00</td>
              </tr>
              <tr>
                <td>03/28/2023</td>
                <td>Payment</td>
                <td>$50.00</td>
              </tr>
              <tr>
                <td>03/25/2023</td>
                <td>Transfer</td>
                <td>$250.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>Bank of React &copy; 2023</p>
      </footer>
    </div>
  );
}

export default App;
