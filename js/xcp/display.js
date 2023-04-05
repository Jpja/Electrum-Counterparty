const tip_address = 'bc1qqqj54caf4cusvycr4dmzv24pgh875xeg8d5wrq';
const tip_btc = '0'; 

const wallet_header = `<b>XCP Opreturn Builder for Electrum</b><div style="float:right;text-align: right;width:50%;">{address}<br>{utxo}</div>
<div><i>Alpha release. For testing only!</i></div>`;

const wallet_footer = `<p>Footer goes here</p>`;

function addr_short(address, start = 4, end = 2) {
  if (address == '') return '';
  let pre = (address.slice(0,4).toLowerCase() == 'bc1q') ? 4 : 1;
  return address.slice(0, pre+start) + '..' + address.slice(-end);
}

function tip_line(tip) {
  if (Number(tip) == 0) {
    return "";
  }
  return "\n" + tip_address + "," + tip;
}

/*Functions for converting between satoshis and human readable quantites
- indivisible token: 1 sat = 1 token
- divisible token: 100,000,000 sat = 1 token)
- always use sat format (BigInt) for calculation
- two display formats; display (for inputs, e.g. 41200.0)
                       displayx (for tables, e.g. 41,200.00000000)
*/


function sat_to_display(q, div) {
  q = BigInt(q);
  q = q.toString();
  if (div == 'indiv') {
    return q;
  }
  if (div = 'div') {
    q = q.padStart(9, '0');
    let fraction = q.slice(-8);
    let whole = q.slice(0,-8);
    return whole + '.' + fraction;
  }
  return 'err';
}

function sat_to_displayx(q, div, pad_indiv = '         ') {
  q = sat_to_display(q, div);
  if (q == 'err') return 'err';
  if (div == 'indiv') {
    q = BigInt(q).toLocaleString("en-US");
    q += pad_indiv; // 9 spaces    
  }
  if (div == 'div') {
    let fraction = q.split('.')[1];
    let whole = q.split('.')[0];
    whole = BigInt(whole).toLocaleString("en-US");
    q = whole + '.' + fraction;
  }
  return q;
}

function display_to_sat(q, div) {
  q = String(q);
  if (div == 'indiv') {
    return BigInt(q); 
  }
  if (div == 'div') {
    if (q.includes('.') == false) {
      q += '.0'; 
    }
    let fraction = q.split('.')[1];
    if (fraction.length > 8) return 'err';
    fraction = fraction.padEnd(8, '0');
    let whole = q.split('.')[0];
    q = whole + fraction;
    return BigInt(q);
  }
  return 'err';
}