import { useEffect, useState } from "react";
import "./App.css";
import * as solanaWeb3 from "@solana/web3.js";

declare global {
  interface Window {
    solana?: any;
  }
}

function App() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [solAmount, setSolAmount] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // check if already connected on load
  useEffect(() => {
    const init = async () => {
      const provider = window.solana;
      if (provider && provider.isPhantom && provider.isConnected) {
        setWalletAddress(provider.publicKey.toString());
        await fetchBalance(provider.publicKey);
      }
    };
    init();
  }, []);

  const fetchBalance = async (pubKey: any) => {
    try {
      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("devnet"),
        "confirmed"
      );
      const lamports = await connection.getBalance(pubKey);
      setWalletBalance(lamports / solanaWeb3.LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("balance fetch failed", err);
      setWalletBalance(null);
    }
  };

  const handleConnect = async () => {
    try {
      const provider = window.solana;
      if (!provider || !provider.isPhantom) {
        alert("Phantom wallet not found! Please install Phantom.");
        return;
      }
      const resp = await provider.connect();
      setWalletAddress(resp.publicKey.toString());
      await fetchBalance(resp.publicKey);
      setStatusMessage("Connected");
    } catch (err: any) {
      console.error("connect error", err);
      setStatusMessage("Connect failed");
    }
  };

  const handleDisconnect = async () => {
    try {
      const provider = window.solana;
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
    } catch (err) {
      console.warn("disconnect error", err);
    } finally {
      setWalletAddress("");
      setWalletBalance(null);
      setStatusMessage("Disconnected");
    }
  };

  // Generate a friendly wallet name based on address
  const getWalletDisplayName = (address: string) => {
    if (!address) return "";
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const names = [
      "Solana Seeker", "Crypto Captain", "DeFi Degen", "Token Trader", 
      "Blockchain Builder", "Web3 Warrior", "Phantom Pilot", "Solar System",
      "Digital Nomad", "Chain Champion", "Yield Farmer", "NFT Navigator"
    ];
    return names[hash % names.length];
  };

  // Copy wallet address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setStatusMessage("Address copied to clipboard!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setStatusMessage("Failed to copy address");
    }
  };

  // Fake/test invest: convert entered SOL into tokens and update status only
  const handleInvest = () => {
    const amount = Number(solAmount);
    if (!amount || amount <= 0) {
      setStatusMessage("Enter a positive SOL amount.");
      return;
    }
    const tokens = Math.floor(amount / 5); // 5 SOL per token
    setStatusMessage(`(TEST MODE) Invested ${amount} SOL → received ${tokens} token(s).`);
  };

  // Fake/test withdraw: just status
  const handleWithdraw = () => {
    setStatusMessage("(TEST MODE) Withdraw simulated (no real SOL moved).");
  };

  return (
    <div className="app-container">
      <div className="bg-gradient" />

      <div className="content">
        <h1 className="title">My Solana Pool</h1>

        {/* wallet instruction */}
        {!walletAddress && (
          <p id="wallet-instruction" className="wallet-instruction">
            Connect your wallet to participate in the decentralized pool.
          </p>
        )}

        {/* Connect / Disconnect */}
        <div id="wallet-controls" className="wallet-controls">
          {!walletAddress ? (
            <button className="connect-button" onClick={handleConnect}>
              Connect Phantom Wallet
            </button>
          ) : (
            <button className="disconnect-button" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>

        {/* App UI shown after connect */}
        <div id="app-ui" className={`app-ui ${walletAddress ? "visible" : "hidden"}`}>
          <p id="wallet-connected" className="wallet-line">
            Wallet connected: 
            <span 
              id="wallet-address" 
              className="wallet-value wallet-name"
              title={`${walletAddress} (Click to copy)`}
              onClick={copyToClipboard}
            >
              {getWalletDisplayName(walletAddress)}
            </span>
          </p>

          <p id="wallet-balance-display" className="wallet-line">
            Your balance: <span id="wallet-balance" className="wallet-value">{walletBalance !== null ? walletBalance.toFixed(4) : "—"}</span> SOL
          </p>

          <p id="status-message" className="status-message">{statusMessage}</p>

          <div className="input-area">
            <input
              type="number"
              min={0}
              value={solAmount}
              onChange={(e) => setSolAmount(Number(e.target.value))}
              className="sol-input"
              aria-label="SOL amount"
            />
            <small className="conversion-note">5 SOL = 1 Token</small>
          </div>

          <div className="action-row">
            <button id="invest-button" className="invest-button" onClick={handleInvest}>Invest</button>
            <button id="withdraw-button" className="withdraw-button" onClick={handleWithdraw}>Withdraw</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;