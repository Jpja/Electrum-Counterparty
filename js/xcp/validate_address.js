//requires bitcoinjs

function valid_btc_addr(address, network) {
  try {
    if (network == 'bitcoin') {
      bitcoinjs.address.toOutputScript(address);
      return true;
    }
    if (network == 'testnet') {
      bitcoinjs.address.toOutputScript(address, bitcoinjs.networks.testnet);
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

function valid_xcp_addr(address, network) {
  //xcp addresses are a subset of btc addresses
  if (valid_btc_addr(address, network) == false) return false;

  /* XCP supports:
  - legacy, prefix '1' (p2pkh)
  - native segwit, prefix 'bc1q' and 42 char length (bech32, p2wpkh).
  - legacy multisig, prefix '3' (p2sh).
  - nested segwit, prefix '3', identical to p2sh (p2wsh-p2sh)*/
  if (network == 'bitcoin') {
    if (address.substring(0,1) == '1') return true;
    if (address.substring(0,4).toLowerCase() == 'bc1q' && address.length == 42) return true;
    if (address.substring(0,1) == '3') return true;
  }

  if (network == 'testnet') {
    if (address.substring(0,1) == 'm') return true;
    if (address.substring(0,1) == 'n') return true;
    //TODO: Add support for Bech32 testnet
  }

  return false;  
}