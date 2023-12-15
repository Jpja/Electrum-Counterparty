const dust_limit = 330;

function sat_to_btc(sat) {
  //we only care about dust
  if (sat >= 1e5) return 'err';

  //output a string with 8 decimals
  return '0.' + sat.toString().padStart(8, '0');
}


function file_to_addresses(file_hex, network='bitcoin') {
  //inputs file as hex string
  //returns electrum encoded 

  //first two bytes signal file size
  let file_size = file_hex.length / 2;
  file_size = file_size.toString(16).padStart(4, '0');
  let hex = file_size + file_hex;

  //Break hex into 32 byte chunks (64 chars)
  let chunks = hex.match(/.{1,64}/g);
  let last = chunks.length-1;
  chunks[last] = chunks[last].padEnd(64,'0');
  console.log(chunks);

  //Generate addresses from chunks
  let addresses = [];
  for (chunk of chunks) {
    addresses.push(cip33_hex_to_bech32(chunk, network));
  }
  console.log(addresses);

  return addresses;
}

function addresses_to_hex(addresses) {
  //input array of p2wsh address
  //output hex string containging

  let recreated = ''
  for (let i = 0; i < addresses.length; i++) {
    recreated += cip33_bech32toHex(addresses[i]);
  }
  let recr_size = recreated.substring(0,4);
  recr_size = parseInt(recr_size, 16);
  recr_file = recreated.substring(4, 4 + recr_size * 2);
  return recr_file;
}


//TODO: Below functions are redundant once the libraryies are upgraded

function cip33_msg_issuance(asset_name, supply, description) {
  const cntrprty = '434e545250525459';
  const issuance_id = '14'; //hex 14 = decimal 20
  const asset_id = asset_id_hex(asset_name).padStart(16, '0');
  supply = supply.toString(16).padStart(16, '0');
  const flags = '000100'; //indivisible, locked, not reset 
  description = utf8_to_hex(description);
  return cntrprty + issuance_id + asset_id + supply + flags + description;
}



function cip33_hex_to_bech32(hex, network='bitcoin') {
  if (hex.length != 64) { //P2WSH only
    console.log('hex string must be 64 chars to generate p2wsh address');
    return;
  }


  const version = 0;
  let hrp = '';
  if (network == 'bitcoin') {
    hrp = 'bc';
  }
  if (network == 'testnet') {
    hrp = 'tb';
  }
  //remove version byte ('80') from hex string
  //hex = hex.substring(2);
  //the rest follows step 3 on https://en.bitcoin.it/wiki/Bech32
  // convert hex string to binary format
  let binaryString = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16).toString(2).padStart(8, '0')).join('');
  binaryString += '0000'; //P2WSH failed needs padding

  //Split binary string into 5-bit chunks and convert to integer array
  const intArray = binaryString.match(/.{1,5}/g).map(chunk => parseInt(chunk, 2));

  //Add the witness version byte in front
  intArray.unshift(version);

  //Calculate checksum
  let chk = cip33_bech32_checksum(hrp, intArray);

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
function cip33_bech32_checksum(hrp, data) {
  var values = cip33_hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  var mod = cip33_polymod(values) ^ 1;
  var ret = [];
  for (var p = 0; p < 6; ++p) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}
function cip33_polymod(values) {
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
function cip33_hrpExpand(hrp) {
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

function cip33_bech32toHex(address) { //https://en.bitcoin.it/wiki/Bech32
  let i_max = 0;
  if ((address.length) == 42) { //
    i_max = 32;
  } else if ((address.length) == 62) { //
    i_max = 51;
  }

  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  address = address.toLowerCase();

  let data = [];
  for (let p = 4; p < address.length; ++p) {
    let d = CHARSET.indexOf(address.charAt(p));
    if (d === -1) {
      return null;
    }
    data.push(d);
  }

  let bin5 = [];
  for (let i = 0; i <= i_max; i++) {
    //binary += data[i].toString(2).padStart(5, '0'); 
    bin5.push(data[i].toString(2).padStart(5, '0'));
  }

  let binString = ''
  for (let i = 0; i < bin5.length; i++) {
    binString += bin5[i];
  }

  let bin8 = binString.match(/.{8}/g);

  let hex = '';
  for (let i = 0; i < bin8.length; i++) {
    hex += parseInt(bin8[i], 2).toString(16).padStart(2, '0');
  }
  return hex;
}

function cip33_hexToBase64(str) {
  var bString = "";
  for( var i = 0; i < str.length; i +=2) {
    bString += String.fromCharCode( parseInt( str.substr( i, 2), 16));
  }
  return btoa(bString);
}