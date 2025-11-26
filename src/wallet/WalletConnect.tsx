import React, { useState, useEffect } from 'react';
import { walletManager, WalletAccount } from './walletManager';
import { formatBalance } from '../utils/formatBalance';

export const WalletConnect: React.FC = () => {
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
    const [balance, setBalance] = useState<string>('0');
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const [transactions, setTransactions] = useState<Array<{ hash: string, type: string, status: string, timestamp: number }>>([]);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const account = await walletManager.connectWallet();
            if (account) {
                setAccounts([account]);
                setSelectedAccount(account);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const account = accounts.find(a => a.address === event.target.value);
        if (account) {
            setSelectedAccount(account);
        }
    };

    const simulateTransaction = async (type: string) => {
        if (!selectedAccount) return;

        const newTx = {
            hash: '0x' + Math.random().toString(16).substr(2, 64),
            type,
            status: 'Pending',
            timestamp: Date.now()
        };

        setTransactions(prev => [newTx, ...prev]);

        // Simulate network delay
        setTimeout(() => {
            setTransactions(prev => prev.map(tx =>
                tx.hash === newTx.hash ? { ...tx, status: 'Success' } : tx
            ));
        }, 2000);
    };

    useEffect(() => {
        if (selectedAccount) {
            const fetchBalance = async () => {
                try {
                    // Fetch ONE balance
                    const bal = await walletManager.getBalance(selectedAccount.address);
                    setBalance(bal);

                    // Fetch OJZ balance (if contract deployed)
                    // Note: In a real app, we'd add another state for OJZ balance
                    // For now, we'll log it or could append it
                    import('./contractManager').then(async ({ contractManager }) => {
                        // This would require adding a getBalance method to contractManager for OJZ
                        // For MVP, we focus on the core ONE balance first
                    });
                } catch (err) {
                    console.error('Failed to fetch balance:', err);
                }
            };

            fetchBalance();
            // Poll balance every 10 seconds
            const interval = setInterval(fetchBalance, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedAccount]);

    return (
        <div className="p-4 border rounded shadow-md bg-white max-w-2xl mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {!selectedAccount ? (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Connected Account
                                </label>
                                <div className="p-2 bg-gray-100 rounded text-sm break-all">
                                    {selectedAccount.address}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-600">Balance:</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {balance} ONE
                                </p>
                            </div>

                            <div className="text-xs text-gray-500 mt-4">
                                Provider: OneWallet
                            </div>
                        </div>

                        <div className="border-l pl-6">
                            <h3 className="font-bold mb-3">Transaction Simulator</h3>
                            <div className="space-y-2 mb-4">
                                <button
                                    onClick={() => simulateTransaction('Mint OJZ')}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
                                >
                                    Mint Test Receipt (OJZ)
                                </button>
                                <button
                                    onClick={() => simulateTransaction('Plant Tree')}
                                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 text-sm"
                                >
                                    Plant Tree (NFT)
                                </button>
                            </div>

                            <h3 className="font-bold mb-2 text-sm">Recent Receipts</h3>
                            <div className="bg-gray-50 rounded p-2 h-48 overflow-y-auto text-xs">
                                {transactions.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No transactions yet</p>
                                ) : (
                                    transactions.map((tx: { hash: string, type: string, status: string, timestamp: number }) => (
                                        <div key={tx.hash} className="border-b last:border-0 py-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>{tx.type}</span>
                                                <span className={tx.status === 'Success' ? 'text-green-600' : 'text-yellow-600'}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <div className="text-gray-500 truncate" title={tx.hash}>
                                                Tx: {tx.hash}
                                            </div>
                                            <div className="text-gray-400">
                                                {new Date(tx.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
