var e=[{title:{en:`Every API call says 401`,hi:`Har API call 401 kehti hai`},ticket:{en:`The NOC enabled RESTCONF on R1 and created netadmin / Rest@123 with privilege 15. The HTTPS server is running and TCP 443 answers, but every call from NMS fails with 401, even though the same user can log in over SSH.`,hi:`NOC ne R1 par RESTCONF enable kiya aur privilege 15 ke saath netadmin / Rest@123 banaya. HTTPS server chal raha hai aur TCP 443 jawab deta hai, par NMS se har call 401 ke saath fail hoti hai, jabki wahi user SSH se login kar leta hai.`},out:`NMS> rest GET 10.20.0.1/restconf/data/ietf-interfaces:interfaces -u netadmin:Rest@123
HTTP/1.1 401 Unauthorized
Server: nginx
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
        "error-message": "access denied"
      }
    ]
  }
}

R1# show running-config | include restconf|username|authentication
username netadmin privilege 15 secret 9 $9$Wn3kQq8b1s1jQE$0l4t2xHq0Yv1WbzM5p6jQv3nqWf0c1Z2p9d8r7s6t5u
restconf`,q:{en:`What is the most likely fix?`,hi:`Sabse sambhavit fix kya hai?`},o:[{en:`Raise netadmin to privilege 16`,hi:`netadmin ko privilege 16 par le jao`},{en:`Change the request from GET to POST`,hi:`Request ko GET se POST mein badlo`},{en:`Set the HTTPS server's authentication to the local user database (the "authentication local" option)`,hi:`HTTPS server ka authentication local user database par set karo ("authentication local" option)`},{en:`Enable NETCONF on TCP 830`,hi:`TCP 830 par NETCONF enable karo`}],a:2,w:{en:`The filter shows no authentication line, so the web server checks the enable password instead of the local user. Add the web server's "authentication local" option. Privilege 16 does not exist, POST would not change authentication, and NETCONF is a different API.`,hi:`Filter mein koi authentication line nahi hai, isliye web server local user ki jagah enable password check karta hai. Web server ka "authentication local" option jodo. Privilege 16 exist nahi karta, POST authentication nahi badalta, aur NETCONF ek alag API hai.`}},{title:{en:`The interface name breaks the URL`,hi:`Interface name URL tod deta hai`},ticket:{en:`A script tries to read only GigabitEthernet0/1 on R1 and gets 400 Bad Request. Reading the whole interfaces container works fine.`,hi:`Ek script R1 par sirf GigabitEthernet0/1 padhne ki koshish karti hai aur 400 Bad Request milta hai. Poora interfaces container padhna theek chalta hai.`},out:`NMS> rest GET 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0/1 -u netadmin:Rest@123
HTTP/1.1 400 Bad Request
Server: nginx
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "key value \\"GigabitEthernet0/1\\" contains an unencoded \\"/\\"; encode it as %2F, e.g. interface=GigabitEthernet0%2F1"
      }
    ]
  }
}`,q:{en:`How should the URI end?`,hi:`URI ka end kaisa hona chahiye?`},o:[{en:`.../interface=GigabitEthernet0%2F1`,hi:`.../interface=GigabitEthernet0%2F1`},{en:`.../interface/GigabitEthernet0/1`,hi:`.../interface/GigabitEthernet0/1`},{en:`.../interface="GigabitEthernet0/1"`,hi:`.../interface="GigabitEthernet0/1"`},{en:`.../interfaces?name=Gi0/1`,hi:`.../interfaces?name=Gi0/1`}],a:0,w:{en:`A "/" inside a list key would be read as a new path level, so it must be percent-encoded as %2F.`,hi:`List key ke andar ka "/" naya path level samjha jaata, isliye use %2F ki tarah percent-encode karna padta hai.`}},{title:{en:`PATCH rejected: malformed body`,hi:`PATCH reject: malformed body`},ticket:{en:`An engineer edited desc.json by hand to set a new description on Gi0/1. The PATCH is rejected immediately.`,hi:`Ek engineer ne Gi0/1 par naya description set karne ke liye desc.json haath se edit ki. PATCH turant reject ho jaata hai.`},out:`NMS> cat -n desc.json
     1  {
     2    "ietf-interfaces:description": "WAN link to Branch-A",
     3  }
NMS> rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netadmin:Rest@123 -d @desc.json
HTTP/1.1 400 Bad Request
Server: nginx
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
        "error-message": "malformed JSON body: line 3, column 1: trailing comma is not allowed before '}'"
      }
    ]
  }
}`,q:{en:`What is wrong with the file?`,hi:`File mein kya galat hai?`},o:[{en:`The key must not contain a colon`,hi:`Key mein colon nahi hona chahiye`},{en:`The description must be in single quotes`,hi:`Description single quotes mein honi chahiye`},{en:`Line 3 needs a second closing brace`,hi:`Line 3 par doosra closing brace chahiye`},{en:`The comma after the last member on line 2 is not allowed`,hi:`Line 2 par aakhri member ke baad ka comma allowed nahi hai`}],a:3,w:{en:`JSON forbids a trailing comma. The parser notices it at the "}" on line 3, but the mistake is the comma at the end of line 2. Module-qualified keys with a colon are normal in RESTCONF.`,hi:`JSON trailing comma allow nahi karta. Parser ise line 3 ke "}" par notice karta hai, par galti line 2 ke end ka comma hai. Colon wali module-qualified keys RESTCONF mein normal hain.`}},{title:{en:`Valid JSON, still 400`,hi:`Valid JSON, phir bhi 400`},ticket:{en:`enable.json passes validation, but R1 refuses it and the WAN link stays shut down.`,hi:`enable.json validation pass karti hai, par R1 use mana kar deta hai aur WAN link shut down hi rehta hai.`},out:`NMS> json validate enable.json
enable.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:interface)
NMS> json types enable.json
.                                                         object
.["ietf-interfaces:interface"]                            object
.["ietf-interfaces:interface"].name                       string
.["ietf-interfaces:interface"].enabled                    string
NMS> rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netadmin:Rest@123 -d @enable.json
HTTP/1.1 400 Bad Request
...
        "error-tag": "invalid-value",
        "error-message": "invalid value \\"true\\" for leaf enabled (expected true or false without quotes)"`,q:{en:`What change fixes the request?`,hi:`Kaunsa change request theek karta hai?`},o:[{en:`Change the method to PUT`,hi:`Method ko PUT mein badlo`},{en:`Write "enabled": true without quotes so it is a boolean`,hi:`"enabled": true bina quotes ke likho taaki woh boolean ho`},{en:`Write "enabled": "TRUE" in capitals`,hi:`"enabled": "TRUE" capitals mein likho`},{en:`Write "enabled": 1`,hi:`"enabled": 1 likho`}],a:1,w:{en:`The YANG leaf enabled is a boolean. In JSON a boolean is true or false, lowercase and unquoted; anything in quotes is a string and 1 is a number.`,hi:`YANG leaf enabled ek boolean hai. JSON mein boolean true ya false hota hai, lowercase aur bina quotes; quotes mein kuch bhi string hai aur 1 number hai.`}},{title:{en:`The description changed, the WAN died`,hi:`Description badla, WAN mar gaya`},ticket:{en:`A junior engineer changed the description of Gi0/1 through the API. The call returned 204, but right after that the branch lost its WAN link.`,hi:`Ek junior engineer ne API se Gi0/1 ka description badla. Call ne 204 diya, par uske turant baad branch ka WAN link chala gaya.`},out:`NMS> cat body.json
{"ietf-interfaces:interface": {"name": "GigabitEthernet0/1", "type": "iana-if-type:ethernetCsmacd", "description": "WAN link to Branch-A"}}
NMS> rest PUT 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netadmin:Rest@123 -d @body.json
HTTP/1.1 204 No Content

R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.20.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down`,q:{en:`Why did the link go down?`,hi:`Link down kyun hua?`},o:[{en:`A 204 response always shuts the interface`,hi:`204 response hamesha interface shut kar deta hai`},{en:`The description was too long`,hi:`Description bahut lamba tha`},{en:`PUT replaced the whole interface entry, removing the IP address and the enabled setting; PATCH should have been used`,hi:`PUT ne poori interface entry replace kar di, IP address aur enabled setting hata di; PATCH use karna chahiye tha`},{en:`RESTCONF cannot change descriptions`,hi:`RESTCONF descriptions nahi badal sakta`}],a:2,w:{en:`PUT means replace: anything not in the body is removed, so the IPv4 address disappeared and the default enabled state took over. PATCH merges only the fields you send. Fix by sending the full entry back or PATCHing the address and enabled leaf.`,hi:`PUT ka matlab replace: body mein jo nahi hai woh hat jaata hai, isliye IPv4 address gayab ho gaya aur default enabled state lag gayi. PATCH sirf bheje gaye fields merge karta hai. Poori entry wapas bhejkar ya address aur enabled leaf PATCH karke theek karo.`}},{title:{en:`Syntax check fails on line 13`,hi:`Syntax check line 13 par fail hota hai`},ticket:{en:`Lab 2: site.yml on CTRL will not even start. The syntax check prints a YAML error.`,hi:`Lab 2: CTRL par site.yml shuru bhi nahi hota. Syntax check ek YAML error print karta hai.`},out:`CTRL$ ansible-playbook -i hosts site.yml --syntax-check
ERROR! YAML syntax error while loading '/home/netops/site.yml'
  mapping values are not allowed in this context (this line is indented deeper than the key above it, which already has a value)

Error location: line 13, column 18 (the real mistake may be on this line or just above it)

The offending line:

          - vlan_id: 20
             name: ENGINEERING
                 ^ here`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Remove one space so "name:" starts in the same column as "vlan_id:"`,hi:`Ek space hatao taaki "name:" "vlan_id:" wale column se hi shuru ho`},{en:`Put ENGINEERING in double quotes`,hi:`ENGINEERING ko double quotes mein daalo`},{en:`Replace the spaces on line 13 with a tab`,hi:`Line 13 ke spaces ko tab se badlo`},{en:`Add a dash before "name:"`,hi:`"name:" se pehle dash jodo`}],a:0,w:{en:`Keys of the same mapping must start in exactly the same column. "name:" is one space deeper than "vlan_id:". Tabs are never allowed in YAML indentation, and a dash would make it a separate list item.`,hi:`Ek hi mapping ki keys bilkul same column se shuru honi chahiye. "name:" "vlan_id:" se ek space zyada andar hai. YAML indentation mein tabs kabhi allowed nahi, aur dash ise alag list item bana deta.`}},{title:{en:`Authentication failed on both switches`,hi:`Dono switches par authentication failed`},ticket:{en:`After fixing the YAML, the playbook fails to log in to SW1 and SW2. The switches were built with user ansible / password NkAuto26. The team lead says do not touch the switches.`,hi:`YAML theek karne ke baad playbook SW1 aur SW2 mein login nahi kar pata. Switches user ansible / password NkAuto26 ke saath bane the. Team lead kehta hai switches ko mat chhuo.`},out:`CTRL$ ansible access -i hosts -m ping
SW1 | FAILED! => {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}
SW2 | FAILED! => {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}
CTRL$ ansible-inventory -i hosts --host SW1
{
    "ansible_connection": "network_cli",
    "ansible_host": "10.30.0.11",
    "ansible_network_os": "ios",
    "ansible_password": "NkAuto62",
    "ansible_user": "ansible"
}`,q:{en:`What should you change?`,hi:`Aapko kya badalna chahiye?`},o:[{en:`Set the switch passwords to NkAuto62`,hi:`Switch passwords ko NkAuto62 kar do`},{en:`Change ansible_connection to local`,hi:`ansible_connection ko local kar do`},{en:`Add gather_facts: yes to the play`,hi:`Play mein gather_facts: yes jodo`},{en:`Correct ansible_password under [access:vars] in the inventory to NkAuto26`,hi:`Inventory mein [access:vars] ke neeche ansible_password ko NkAuto26 karo`}],a:3,w:{en:`Both hosts inherit the same wrong group variable (digits swapped). The ticket says fix the inventory, not the switches. The connection plugin and fact gathering are unrelated to a password failure.`,hi:`Dono hosts same galat group variable inherit karte hain (digits ulte). Ticket kehta hai inventory theek karo, switches nahi. Connection plugin aur fact gathering ka password failure se lena-dena nahi.`}},{title:{en:`Unsupported parameters`,hi:`Unsupported parameters`},ticket:{en:`Logins now work. The VLAN task changes both switches, but the NTP task fails and the play stops.`,hi:`Ab logins chal rahe hain. VLAN task dono switches badalta hai, par NTP task fail hota hai aur play ruk jaata hai.`},out:`TASK [Create the user VLANs] **************************************************
changed: [SW1]
changed: [SW2]

TASK [Use the lab NTP server] *************************************************
fatal: [SW1]: FAILED! => {"changed": false, "msg": "Unsupported parameters for (ios_config) module: line. Supported parameters include: after, backup, before, commands, defaults, diff_against, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when."}
fatal: [SW2]: FAILED! => {"changed": false, "msg": "Unsupported parameters for (ios_config) module: line. Supported parameters include: after, backup, before, commands, defaults, diff_against, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when."}

PLAY RECAP ********************************************************************
SW1                        : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0
SW2                        : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Use the ios_command module instead`,hi:`Iski jagah ios_command module use karo`},{en:`Rename the parameter line to lines in site.yml`,hi:`site.yml mein parameter line ko lines karo`},{en:`Run the playbook with --check`,hi:`Playbook ko --check ke saath chalao`},{en:`Add "ntp server" to the inventory variables`,hi:`Inventory variables mein "ntp server" jodo`}],a:1,w:{en:`The error names the bad option (line) and lists the valid ones; ios_config takes lines (plural). ios_command only runs exec commands and never configures, and --check changes nothing.`,hi:`Error galat option (line) ka naam leta hai aur valid options list karta hai; ios_config lines (plural) leta hai. ios_command sirf exec commands chalata hai aur kabhi configure nahi karta, aur --check kuch nahi badalta.`}}];export{e as default};