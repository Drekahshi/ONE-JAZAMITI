import { Harmony } from '@harmony-js/core';
import { ChainID, ChainType } from '@harmony-js/utils';

// Initialize Harmony (Testnet)
export const hmy = new Harmony(
    'https://api.s0.b.hmny.io',
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyTestnet,
    },
);

export interface WalletAccount {
    address: string;
    name: string;
    isOneWallet: boolean;
}

class WalletManager {
    private account: WalletAccount | null = null;

    async connectWallet(): Promise<WalletAccount | null> {
        // Check for OneWallet extension
        // @ts-ignore
        if (window.onewallet) {
            try {
                // @ts-ignore
                const account = await window.onewallet.getAccount();
                this.account = {
                    address: account.address,
                    name: account.name || 'OneWallet User',
                    isOneWallet: true
                };
                return this.account;
            } catch (err) {
                console.error('Failed to connect OneWallet:', err);
                throw new Error('User rejected connection');
            }
        } else {
            console.warn('OneWallet not found');
            throw new Error('OneWallet extension not found. Please install it.');
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            const response = await hmy.blockchain.getBalance({ address });
            // Convert Wei to ONE (1e18)
            const balance = hmy.utils.hexToNumber(response.result) / 1e18;
            return balance.toFixed(4);
        } catch (err) {
            console.error('Failed to get balance:', err);
            return '0.0000';
        }
    }

    getAccount(): WalletAccount | null {
        return this.account;
    }
}

export const walletManager = new WalletManager();
