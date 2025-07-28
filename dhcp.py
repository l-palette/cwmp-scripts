acs_address = input("Enter ACS address: ")
if 'http://' not in acs_address:
    acs_address = 'http://' + acs_address
if ":7547" not in acs_address:
    acs_address += ":7547"
hex_acs_address = ""
for i in acs_address:
    hex_acs_address += hex(ord(i))[2:]
bytes_number = len(acs_address.encode()) 

value = '0x01' + hex(bytes_number)[2:] + hex_acs_address.replace(":", "")  


print("/ip dhcp-server option")
print(f"add code=43 name=acs value={value}")
print("ip dhcp-server network set 0 dhcp-option=acs")
