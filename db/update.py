db_file = 'counterparty.db' #latest Counterparty DB

import os
dir_path = os.path.dirname(os.path.realpath(__file__))
os.chdir(dir_path)

import sqlite3
con = sqlite3.connect(db_file)
cur = con.cursor()

#highest block
import datetime
for row in cur.execute('SELECT max(block_index), block_time from blocks'):
  max_block = row[0]
  max_time = row[1]
ts = datetime.datetime.fromtimestamp(max_time)
max_date = ts.strftime('%Y-%m-%d')


#subassets
out_file = 'asset_longnames.js'
out = "//Table with all subasset ID/longname pairs"
out += "\n//Data up until block " + str(max_block) + " (" + max_date + ")"
out += "\nasset_longnames = ["
for row in cur.execute('SELECT asset_id, asset_longname FROM assets WHERE asset_longname IS NOT NULL'):
  out += "['" + str(row[0]) + "','" + row[1] + "'],"
out = out[:-1]
out += "\n];"
file = open(out_file, 'w', encoding="utf-8")
file.write(out)
file.close()
print(out_file + ' ok')


#divisible assets
out_file = 'assets_div.js'
out = "//All assets locked at divisible supply"
out += "\n//Data up until block " + str(max_block) + " (" + max_date + ")"
out += "\nassets_div = ["
for row in cur.execute('SELECT DISTINCT asset, divisible FROM issuances WHERE locked = 1 and divisible = 1 and status = "valid" ORDER BY tx_index'):
  out += "'" + row[0] + "',"
out = out[:-1]
out += "\n];"
file = open(out_file, 'w', encoding="utf-8")
file.write(out)
file.close()
print(out_file + ' ok')


#indivisible assets
out_file = 'assets_indiv.js'
out = "//All assets locked at indivisible supply"
out += "\n//Data up until block " + str(max_block) + " (" + max_date + ")"
out += "\nassets_indiv = ["
for row in cur.execute('SELECT DISTINCT asset, divisible FROM issuances WHERE locked = 1 and divisible = 0 and status = "valid" ORDER BY tx_index'):
  out += "'" + row[0] + "',"
out = out[:-1]
out += "\n];"
file = open(out_file, 'w', encoding="utf-8")
file.write(out)
file.close()
print(out_file + ' ok')


con.close()