/*Takes an op_return message (hex string) and returns an object with properties
- prefix (shall be 'CNTRPRTY')
- type (int, e.g 2 for enhanced send)
- amount (BigInt in satoshis)
- amount_display ('err' if wallet doesn't know divisbility, else display format)
- address (encoded in the message, typically recipient)
- asset (name, for subassets this is the numeric name)
- asset_id (BigInt)
- asset_display (same as 'asset' except longaname if available)
Not all tx types have all properties
UTXO is optional. If ommitted it's assumed the msg is unencoded.
*/

function decode_tx(msg, utxo = '') {
  let info = {};
  if (utxo != '') msg = rc4_hex(utxo, msg);

  //CNTRPRTY prefix
  let prefix = hex_to_ascii(msg.slice(0,16));
  info['prefix'] = prefix;
  msg = msg.slice(16);

  //Type 
  let type = parseInt(msg.slice(0,2), 16);
  info['type'] = type;
  msg = msg.slice(2);


  if (type == 2) { //Enhanced send
    let asset_id_hex = msg.slice(0,16);
    let asset_id = BigInt('0x'+asset_id_hex).toString(10);
    let asset = asset_name(asset_id);
    info['asset'] = asset;
    info['asset_id'] = asset_id;
    info['asset_display'] = asset_name(asset_id, true);
    msg = msg.slice(16);
    let amount_hex = msg.slice(0,16);
    console.log(amount_hex);
    let amount = BigInt('0x'+amount_hex).toString(10);
    let div = get_divisibility(asset);
    info['amount'] = amount;
    info['amount_display'] = sat_to_display(amount, div);
    msg = msg.slice(16);
    let addr_hex = msg.slice(0,42);
    info['address'] = hex_to_address(addr_hex);


  }





  info['status'] = 'ok';
  return info;
}



//** ADDRESS FUNCTIONS **//
function hex_to_address(hex) { //21 byte hex encoded in cntrprty message 
  let version_byte = hex.substring(0,2);
  if (version_byte == '00' || version_byte == '05') {
    return hex_to_base58addr(hex);
  }
  if (version_byte == '80') {
    return hex_to_bech32addr(hex); 
  }
  return 'cannot decode address';
}

function hex_to_base58addr(hex) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = BigInt(58);
  let checksum = sha256(hex_to_ascii(hex));
  checksum = sha256(hex_to_ascii(checksum));
  checksum = checksum.substring(0,8);
  hex += checksum
  let decimal = BigInt('0x' + hex);
  let output = '';
  while (decimal > 0) {
    let rem = decimal % base;
    decimal = BigInt(decimal / base);
    output = ALPHABET[Number(rem)] + output;
  }
  //Leading 00's must be converted to 1's
  let numLeadingZeros = Math.floor(hex.match(/^0+/)[0].length / 2);
  for (let i = 0; i < numLeadingZeros; i++) {
    output = "1" + output;
  }
  return output;
}

function hex_to_bech32addr(hex) {
  const version = 0;
  const hrp = 'bc';

  //remove version byte ('80') from hex string
  hex = hex.substring(2);

  //the rest follows step 3 on https://en.bitcoin.it/wiki/Bech32
  // convert hex string to binary format
  const binaryString = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16).toString(2).padStart(8, '0')).join('');

  //Split binary string into 5-bit chunks and convert to integer array
  const intArray = binaryString.match(/.{1,5}/g).map(chunk => parseInt(chunk, 2));

  //Add the witness version byte in front
  intArray.unshift(version);

  //Calculate checksum
  let chk = bech32_checksum(hrp, intArray);

  //Append checksum
  intArray.push(...chk);

  //Map to bech32 charset
  const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  let addr = hrp + '1';
  for (let i = 0; i < intArray.length; i++) {
    addr += charset.charAt(intArray[i]);
  }
  return addr;
}

//Calculate bech32 checksum
//Copied from https://github.com/sipa/bech32/blob/master/ref/javascript/bech32.js
//Modified to assume BECH32 encoding (not BECH32M)
function bech32_checksum(hrp, data) {
  var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  var mod = polymod(values) ^ 1;
  var ret = [];
  for (var p = 0; p < 6; ++p) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}
function polymod(values) {
  const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  var chk = 1;
  for (var p = 0; p < values.length; ++p) {
    var top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ values[p];
    for (var i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }
  return chk;
}
function hrpExpand(hrp) {
  var ret = [];
  var p;
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function hex_to_subasset(hex) {
  const SUBASSET_DIGITS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_@!'
  let integer = BigInt('0x' + hex)
  let ret = ''
  while (integer != 0n) {
    ret = SUBASSET_DIGITS[(integer % 68n) - 1n] + ret
    integer = integer / 68n
  }
  return ret
}