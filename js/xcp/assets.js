/*Functions for converting between asset name and id
  and for determining divisibility.
  Some functions require asset_longnames.js, assets_div.js and assets_indiv.js

  ID should always be string or BigInt. Otherwise wrong result if larger than MAX_SAFE_INTEGER (9007199254740991)
*/

function asset_name(id, longname = false) {
  id = BigInt(id);
  if (id == 0) return 'BTC';
  if (id == 1) return 'XCP';
  if (id >= 95428956661682177n) { //numerical or subasset
    if (longname) {
      //try to find longname
      //note that if asset_longnames is not up to date,
      //the numeric name is returned instead
      for (let i = 0; i <asset_longnames.length; i++) {
        if (asset_longnames[i][0] == id) return asset_longnames[i][1];
      }
    }
    return 'A' + String(id); //note: subasset if it was registered after the last update of asset_longnames
  }
  let b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let n = id;
  let name = '';
  do {
    let mod = n % 26n;
    name = b26_digits[mod] + name;
    n -= mod;
    n /= 26n;
  } while (n > 0);
  return name;
}

function asset_id(asset_name) {
  if (asset_name == "XCP") {
    return (1).toString();
  }
  if (asset_name == "BTC") { 
    return (0).toString();
  }
  if (asset_name.includes('.')) { //longname
    asset_name = longname_to_asset(asset_name);
    if (asset_name == 'unknown') return 'unknown'; 
  }
  if (asset_name.substr(0, 1) == "A") {
    return BigInt(asset_name.substr(1)).toString();
  }
  let b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let name_array = asset_name.split("");
  let n_bigint = BigInt(0);
  for (i = 0; i < name_array.length; i++) { 
    n_bigint *= BigInt(26);
    n_bigint += BigInt(b26_digits.indexOf(name_array[i]));
  }    
  return n_bigint.toString();
}

function asset_id_hex(asset_name) {
  let id = BigInt(asset_id(asset_name));
  return id.toString(16);
}

function get_divisibility(asset_name) {
  //returns 'div', 'indiv' or 'unknown'
  //unlocked assets can be reset, therefore 'unknown'
  if (asset_name == "XCP") {
    return 'div';
  }
  if (asset_name == "BTC") { 
    return 'div';
  }
  if (asset_name.includes('.')) {
    asset_name = longname_to_asset(asset_name);
  }
  if (assets_div.includes(asset_name)) return 'div';
  if (assets_indiv.includes(asset_name)) return 'indiv';
  return 'unknown';
}

//Functions for converting subassets between asset (Axx..) and longname (TOKEN.Sub)
// relies on table, returns empty string if table not up to date
function alt_name(name) {
  if (name.slice(0,1) == 'A') {
    return asset_to_longname(name);
  }
  if (name.includes('.')) {
    return longname_to_asset(name);
  }
  return '';
}

function longname_to_asset(longname) {
  for (let i = 0; i < asset_longnames.length; i++) {
    if (asset_longnames[i][1] == longname) {
      return 'A' + asset_longnames[i][0];
    }
  } 
  return '';
}

function asset_to_longname(asset) {
  for (let i = 0; i < asset_longnames.length; i++) {
    if ('A' + asset_longnames[i][0] == asset) {
      return asset_longnames[i][1];
    }
  } 
  return '';
}

//Verify asset name is valid
function valid_name(asset) {
  if (asset == 'XCP') return true;
  let first = asset.slice(0,1); 
  if (first == 'A') { //Numeric
    try {
      let id = BigInt(asset.slice(1));
      if (id < 95428956661682177n) return false;
      if (id > 18446744073709551615n) return false;
      return true;
    } catch(err) {
      return false; 
    }
  }
  //https://counterparty.io/docs/protocol_specification/#subassets
  if (asset.includes('.')) { //Subasset
    let parent = asset.split('.')[0];
    if (first.match(/[B-Z]/)) {
      if (parent.length < 4) return false;
      if (parent.length > 12) return false; //max len reduced to 12 before subassets were introduced
      if (parent.match(/[^A-Z]/)) return false;
      if (asset.length > 250) return false;
      if (asset.match(/[^a-zA-Z0-9.\-_@!]/)) return false;
      if (asset.slice(-1) == '.') return false;
      if (asset.includes('..')) return false;
    }
    return true;
  }
  if (first.match(/[B-Z]/)) { //Regular
    if (asset.length < 4) return false;
    if (asset.length > 14) return false;
    if (asset.match(/[^A-Z]/)) return false;
    return true
  }
  return false;
}