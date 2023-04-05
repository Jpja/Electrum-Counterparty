//Return op-return data as hex, unencoded

//Amount must be in satoshis (i.e. for divisible assets amount is 100M x display amount)
//For subassets it's best practice to use the numeric name. Longnames will work only if the wallet is updated after asset was created.


const prefix = 'CNTRPRTY';
prefix_hex = ascii_to_hex(prefix); //434e545250525459

/*
 const msg_type = [];
      msg_type[0]  = 'Classic Send';
      msg_type[2]  = 'Enhanced Send';
      msg_type[4]  = 'Sweep';
      msg_type[10] = 'DEX Order';
      msg_type[11] = 'Btcpay';
      msg_type[12] = 'Dispenser';
      msg_type[20] = 'Issuance';
      msg_type[21] = 'Issuance (Subasset)';
      msg_type[30] = 'Broadcast';
      msg_type[50] = 'Dividend';
*/

function msg_enhanced_send(recipient, asset, amount) {
  const type = 2;
  let type_hex = type.toString(16).padStart(2, '0');
  let recipient_hex = address_to_hex(recipient);
  let asset_hex = asset_id_hex(asset).padStart(16, '0');
  let amount_hex = BigInt(amount).toString(16).padStart(16, '0'); 
  return prefix_hex + type_hex + asset_hex + amount_hex + recipient_hex;  
}