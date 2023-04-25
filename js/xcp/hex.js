function hex_to_ascii(hex) {
  hex = hex.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function ascii_to_hex(str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n ++) 
  {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join('');
}

function utf8_to_hex(str) {
  const encoder = new TextEncoder('UTF-8');
  let bytes = encoder.encode(str);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hex2aq(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    let int = parseInt(hex.substr(i, 2), 16);
    if (int >= 32 && int <= 126) {
      str += String.fromCharCode(int);
    } else {
      str += '?';
    }
  }
  return str;
}

function hex_to_utf8(s)
{
  return decodeURIComponent(
    s.replace(/\s+/g, '') // remove spaces
    .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  );
}

function xcp_rc4(key, datachunk) {
  return bin2hex(rc4(hex2bin(key), hex2bin(datachunk)));
}

function hex2bin(hex) {
  var bytes = [];
  var str;
  for (var i = 0; i < hex.length - 1; i += 2) {
    var ch = parseInt(hex.substr(i, 2), 16);
    bytes.push(ch);
  }
  str = String.fromCharCode.apply(String, bytes);
  return str;
};

function bin2hex(s) {
  // http://kevin.vanzonneveld.net
  var i, l, o = "",
      n;
  s += "";
  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i).toString(16);
    o += n.length < 2 ? "0" + n : n;
  }
  return o;
}; 

function rc4(key, str) {
  //https://gist.github.com/farhadi/2185197
  var s = [], j = 0, x, res = '';
  for (var i = 0; i < 256; i++) {
    s[i] = i;
  }
  for (i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  i = 0;
  j = 0;
  for (var y = 0; y < str.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

function hexToDec(s) {
  var i, j, digits = [0], carry;
  for (i = 0; i < s.length; i += 1) {
    carry = parseInt(s.charAt(i), 16);
    for (j = 0; j < digits.length; j += 1) {
      digits[j] = digits[j] * 16 + carry;
      carry = digits[j] / 10 | 0;
      digits[j] %= 10;
    }
    while (carry > 0) {
      digits.push(carry % 10);
      carry = carry / 10 | 0;
    }
  }
  return digits.reverse().join('');
}

function asset_name(id) {
  if (id == 0) return 'BTC';
  if (id == 1) return 'XCP';
  if (id >= 95428956661682177) return 'numerical or sub-asset';
  if (id > 9007199254740991) return 'max int error'; //a few very long asset names. would need bigint
  let b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let n = id;
  let name = '';
  do {
    let mod = n % 26;
    name = b26_digits[mod] + name;
    n -= mod;
    n /= 26;
  } while (n > 0);
  return name;
}

function print_ts(ts) {
  //integer timestamp to ISO string
  let d = new Date(ts*1000);
  return d.toISOString();  
}

function bytes_to_hex(byteArray) {
  //Input byte array, returns hex string
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}



//ADDRESS FUNCTIONS

function address_to_hex(address) {
  if (address[0] == "1") {
    return '00' + bytes_to_hex(bitcoinjs.address.fromBase58Check(address).hash);
  }
  if (address[0] == "3") {
    return '05' + bytes_to_hex(bitcoinjs.address.fromBase58Check(address).hash);
  }
  if (address.toLowerCase().substr(0,4) == "bc1q" && address.length == 42) {
    return '80' + bech32toHex(address);
  }
  if (address[0] == "m" || address[0] == "n") { //testnet
    return '6f' + bytes_to_hex(bitcoinjs.address.fromBase58Check(address, bitcoinjs.networks.testnet).hash);
  }

  console.log('Unable to convert address to hex'); return;
}

function bech32toHex(address) { //https://en.bitcoin.it/wiki/Bech32
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
  for (let i = 0; i <= 32; i++) {
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