from flask import Flask, request, jsonify
from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.system_program import TransferParams, transfer
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import initialize_mint, mint_to
from spl.token.client import Token

app = Flask(__name__)

# Configura tu cliente de Solana
solana_client = Client("https://api.devnet.solana.com")

@app.route('/create_token', methods=['POST'])
def create_token():
    data = request.json
    token_name = data['tokenName']
    token_symbol = data['tokenSymbol']
    decimals = int(data['decimals'])
    initial_supply = int(data['initialSupply'])
    user_wallet_address = data['wallet']

    # Generar una nueva clave para el mint
    from_wallet = Keypair.generate()

    # Solicitar un airdrop para cubrir la transacción (solo para desarrollo)
    airdrop_response = solana_client.request_airdrop(from_wallet.public_key, 1_000_000_000)
    solana_client.confirm_transaction(airdrop_response['result'])

    # Crear el mint del token SPL
    token = Token.create_mint(
        solana_client,
        from_wallet,
        from_wallet.public_key,
        decimals,
        TOKEN_PROGRAM_ID
    )

    # Crear cuenta asociada para el token del usuario
    user_token_account = token.get_or_create_associated_account_info(user_wallet_address)
    token.mint_to(user_token_account.address, from_wallet.public_key, initial_supply * (10 ** decimals))

    # Transferir comisión al creador del token
    commission_amount = 0.5 * 1_000_000_000
    transfer_tx = transfer(
        TransferParams(
            from_pubkey=from_wallet.public_key,
            to_pubkey=Keypair.from_public_key(user_wallet_address).public_key,
            lamports=commission_amount
        )
    )
    solana_client.send_transaction(transfer_tx, from_wallet)

    return jsonify({
        'success': True,
        'message': f'Token {token_name} ({token_symbol}) creado con éxito!'
    })

if __name__ == '__main__':
    app.run(debug=True)
