import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

window.onload = () => {
    const connectButton = document.getElementById('connect-wallet');
    const createTokenButton = document.getElementById('createTokenButton');
    const formSection = document.getElementById('tokenForm');

    connectButton.addEventListener('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                await window.solana.connect();
                connectButton.textContent = `${window.solana.publicKey.toString()}`;
            } catch (err) {
                console.error('Failed to connect wallet', err);
            }
        } else {
            alert('Phantom Wallet no detectado');
        }
    });

    createTokenButton.addEventListener('click', async () => {
        const tokenName = document.getElementById('tokenName').value;
        const tokenSymbol = document.getElementById('tokenSymbol').value;
        const decimals = parseInt(document.getElementById('decimals').value);
        const initialSupply = parseInt(document.getElementById('initialSupply').value);
        const userWalletAddress = document.getElementById('wallet').value;

        const PROGRAM_ID = new PublicKey('BN3VkuCJUKnpBCR3KmWp6qTvft84MaUHt1BBxRD9XTBq'); // Reemplaza con la dirección de tu programa desplegado

        try {
            if (!userWalletAddress) {
                alert('Please connect your wallet.');
                return;
            }

            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const fromWallet = Keypair.generate();

            // Solicitar Airdrop de SOL para pagar la transacción (solo para desarrollo)
            const airdropSignature = await connection.requestAirdrop(
                fromWallet.publicKey,
                LAMPORTS_PER_SOL * 1 // Airdrop de 1 SOL
            );
            await connection.confirmTransaction(airdropSignature);

            // Crear el mint del token SPL
            const mint = await Token.createMint(
                connection,
                fromWallet,
                fromWallet.publicKey,
                null,
                decimals,
                PROGRAM_ID
            );

            const userTokenAccount = await mint.getOrCreateAssociatedAccountInfo(new PublicKey(userWalletAddress));

            await mint.mintTo(
                userTokenAccount.address,
                fromWallet.publicKey,
                [],
                initialSupply * Math.pow(10, decimals)
            );

            // Crear la transacción para la comisión
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromWallet.publicKey,
                    toPubkey: new PublicKey('FhyFk2Xgi4NNBFm8xeGeFXuonCCySitvtzXotc426WXF'),
                    lamports: 0.5 * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);

            console.log('Token Created:', tokenName, tokenSymbol);
            console.log('Transaction Signature:', signature);
            document.getElementById('responseMessage').innerText = `Token ${tokenName} (${tokenSymbol}) created successfully! Transaction Signature: ${signature}`;
        } catch (error) {
            console.error('Error creating token:', error);
            document.getElementById('responseMessage').innerText = 'Failed to create token. Please try again.';
        }
    });

    // Desplazar suavemente al formulario al hacer clic en el botón
    const scrollToFormButton = document.getElementById('CreateTokenBT');
    scrollToFormButton.addEventListener('click', () => {
        formSection.scrollIntoView({ behavior: 'smooth' });
    });
};
