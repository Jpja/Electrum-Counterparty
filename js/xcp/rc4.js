function rc4_hex(key, datachunk) {
  //inputs are hex strings
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