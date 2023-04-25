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
  const msg_id = 2;
  let msg_id_hex = msg_id.toString(16).padStart(2, '0');
  let recipient_hex = address_to_hex(recipient);
  let asset_hex = asset_id_hex(asset).padStart(16, '0');
  let amount_hex = BigInt(amount).toString(16).padStart(16, '0'); 
  return prefix_hex + msg_id_hex + asset_hex + amount_hex + recipient_hex;  
}

function msg_sweep(recipient, sweep_flag) {
  const msg_id = 4;
  let msg_id_hex = msg_id.toString(16).padStart(2, '0');
  let recipient_hex = address_to_hex(recipient);
  let sweep_flag_hex = sweep_flag.toString(16).padStart(2, '0');
  //TODO: add support for memo
  return prefix_hex + msg_id_hex + recipient_hex + sweep_flag_hex;  
}


function msg_broadcast(text, ts = '', value = 0, fee = 0) {
  const msg_id = 30;
  let msg_id_hex = msg_id.toString(16).padStart(2, '0');
  //Broadcast timestamp is UNIX in seconds
  // Normal practice is to use current time
  if (ts == '') {
    ts = new Date().getTime() / 1000;
    ts = Math.round(ts);
  }
  let ts_hex = ts.toString(16).padStart(8, '0');
  //TODO: add support for value and fee
  if (value != 0 || fee != 0) {
    console.log('Broadcast function currently does not support custom "value" and "fee")');
    return;
  }
  let value_hex = value.toString(16).padStart(16, '0');
  let fee_hex = fee.toString(16).padStart(8, '0');
  let text_hex = utf8_to_hex(text);
  let text_len = text_hex.length / 2;
  let text_len_hex = text_len.toString(16).padStart(2, '0');
  return prefix_hex + msg_id_hex + ts_hex + value_hex + fee_hex + text_len_hex + text_hex;  
  //return prefix_hex + msg_id_hex + ts_hex + value_hex + fee_hex + text_len_hex + text_hex;  
}