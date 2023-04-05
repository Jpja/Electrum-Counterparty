//requires bitcoinjs

function valid_btc_addr(address) {
  try {
    bitcoinjs.address.toOutputScript(address);
    return true;
  } catch (e) {
    return false;
  }
}

function valid_xcp_addr(address) {
  //xcp addresses are a subset of btc addresses
  if (valid_btc_addr(address) == false) return false;
  
  /* XCP supports:
  - legacy, prefix '1' (p2pkh)
  - native segwit, prefix 'bc1q' and 42 char length (bech32, p2wpkh).
  - legacy multisig, prefix '3' (p2sh).
  - nested segwit, prefix '3', identical to p2sh (p2wsh-p2sh)*/
  if (address.substring(0,1) == '1') return true;
  if (address.substring(0,4).toLowerCase() == 'bc1q' && address.length == 42) return true;
  if (address.substring(0,1) == '3') return true;
  return false;  
}