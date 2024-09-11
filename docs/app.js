

const connectWalletButton = document.getElementById('connect-wallet');

connectWalletButton.addEventListener('click', async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      connectWalletButton.textContent = response.publicKey.toString();
      console.log('Connected to wallet:', response.publicKey.toString());
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    }
  } else {
    alert('Please install a Solana wallet extension.');
  }


});
