var e=[{title:{en:`The script dies before touching any router`,hi:`Script kisi router ko chhoone se pehle hi mar jaata hai`},ticket:{en:`A teammate left collect.py on the automation host AUTO. It should poll R1 to R3 and add a managed loopback. The first run prints an error immediately. The change manager asks whether any router was modified.`,hi:`Ek teammate ne automation host AUTO par collect.py chhoda hai. Ise R1 se R3 poll karke ek managed loopback jodna chahiye. Pehla run turant error print karta hai. Change manager poochta hai ki kya koi router modify hua.`},out:`AUTO> python3 collect.py
  File "collect.py", line 12
    def parse_brief(text)
                         ^
SyntaxError: expected ':'

AUTO> nl collect.py
    10
    11
    12  def parse_brief(text)
    13      """Turn show ip interface brief output into a list of dicts."""
    14      rows = []`,q:{en:`What is the correct assessment and next step?`,hi:`Sahi assessment aur agla step kya hai?`},o:[{en:`R1 was configured before the error; roll it back, then fix line 12`,hi:`Error se pehle R1 configure ho gaya; use rollback karo, phir line 12 fix karo`},{en:`The password is wrong; fix CREDS first`,hi:`Password galat hai; pehle CREDS fix karo`},{en:`Nothing ran and no router was contacted; add the colon on line 12 and run again`,hi:`Kuch nahi chala aur kisi router se contact nahi hua; line 12 par colon jodo aur dobara chalao`},{en:`The host has Python 2; install Python 3`,hi:`Host par Python 2 hai; Python 3 install karo`}],a:2,w:{en:`Python checks the syntax of the whole file before executing any line, so a SyntaxError means no statement ran and no SSH session was opened. The fix is edit collect.py 12 def parse_brief(text): followed by a new run.`,hi:`Python koi bhi line execute karne se pehle poori file ka syntax check karta hai, isliye SyntaxError ka matlab koi statement nahi chala aur koi SSH session nahi khula. Fix hai edit collect.py 12 def parse_brief(text): aur phir naya run.`}},{title:{en:`Login refused on every router`,hi:`Har router par login mana`},ticket:{en:`After the syntax fix, collect.py fails on the first router. The network team confirms that SSH works for engineers using the netops account and the password NK@2026.`,hi:`Syntax fix ke baad collect.py pehle router par fail hota hai. Network team confirm karti hai ki netops account aur password NK@2026 se engineers ke liye SSH chalta hai.`},out:`AUTO> python3 collect.py
Traceback (most recent call last):
  File "collect.py", line 24
    conn = ConnectHandler(host=ip, **CREDS)
nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22

AUTO> nl collect.py
     5  CREDS = {
     6      "device_type": "nk_ios",
     7      "username": "netops",
     8      "password": "Nk@2026",
     9  }`,q:{en:`What should the engineer change?`,hi:`Engineer ko kya badalna chahiye?`},o:[{en:`Correct the password case in CREDS: sed -i 's/Nk@2026/NK@2026/' collect.py`,hi:`CREDS mein password ka case theek karo: sed -i 's/Nk@2026/NK@2026/' collect.py`},{en:`Permit TCP 22 from 10.99.0.100 in the vty ACL`,hi:`Vty ACL mein 10.99.0.100 se TCP 22 permit karo`},{en:`Add transport input ssh under line vty 0 4`,hi:`line vty 0 4 ke neeche transport input ssh jodo`},{en:`Generate RSA keys on R1`,hi:`R1 par RSA keys generate karo`}],a:0,w:{en:`An authentication exception means the TCP session to port 22 and the SSH exchange worked, so ACLs, transport input and RSA keys are fine. The credentials were refused: the script has Nk@2026 but the routers expect NK@2026, and passwords are case-sensitive.`,hi:`Authentication exception ka matlab port 22 tak TCP session aur SSH exchange chale, isliye ACLs, transport input aur RSA keys theek hain. Credentials mana hue: script mein Nk@2026 hai par routers NK@2026 expect karte hain, aur passwords case-sensitive hain.`}},{title:{en:`One router times out, two work`,hi:`Ek router time out, do chalte hain`},ticket:{en:`The collection script works for R1 and R2 but R3 fails every night. R3 was replaced last week and configured from an old template.`,hi:`Collection script R1 aur R2 ke liye chalta hai par R3 har raat fail hota hai. R3 pichhle hafte badla gaya tha aur purane template se configure hua tha.`},out:`nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.3:22

AUTO> ping 10.99.0.3
!!!!!
R3# show running-config | section line vty
line vty 0 4
 login local
 transport input telnet`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The password on R3 is different`,hi:`R3 par password alag hai`},{en:`The vty lines accept only Telnet, so no SSH session can be formed on port 22`,hi:`Vty lines sirf Telnet accept karti hain, isliye port 22 par koi SSH session nahi ban sakta`},{en:`R3 is unreachable from AUTO`,hi:`AUTO se R3 unreachable hai`},{en:`The user netops needs privilege 15`,hi:`User netops ko privilege 15 chahiye`}],a:1,w:{en:`Ping works, so routing is fine. A timeout means the SSH session never formed, and the vty lines only allow Telnet. Configure transport input ssh (with hostname, domain, RSA key and a local user). A password or privilege problem would appear as an authentication exception or a failed enable, not a timeout.`,hi:`Ping chalta hai, isliye routing theek hai. Timeout ka matlab SSH session kabhi bana hi nahi, aur vty lines sirf Telnet allow karti hain. transport input ssh configure karo (hostname, domain, RSA key aur local user ke saath). Password ya privilege problem authentication exception ya failed enable ki tarah dikhti, timeout ki tarah nahi.`}},{title:{en:`The VLAN job crashes on the data file`,hi:`VLAN job data file par crash hota hai`},ticket:{en:`The campus team edited vlans.json to add VLAN 30 VOICE for ACC-SW2. Since then vlans.py stops before it connects to any switch.`,hi:`Campus team ne ACC-SW2 ke liye VLAN 30 VOICE jodne ke liye vlans.json edit kiya. Tab se vlans.py kisi switch se connect hone se pehle ruk jaata hai.`},out:`AUTO> python3 vlans.py
Traceback (most recent call last):
  File "vlans.py", line 6
    data = json.load(f)
json.decoder.JSONDecodeError: Expecting value: line 19 column 7 (char 436)

AUTO> nl vlans.json
    16        "vlans": [
    17          {"id": 10, "name": "SALES"},
    18          {"id": 30, "name": "VOICE"},
    19        ],
    20        "access_ports": {"GigabitEthernet0/2": 30}`,q:{en:`Which fix is correct?`,hi:`Kaunsa fix sahi hai?`},o:[{en:`Change line 6 of vlans.py to json.loads(f)`,hi:`vlans.py ki line 6 ko json.loads(f) karo`},{en:`Remove the comma at the end of line 19`,hi:`Line 19 ke end ka comma hatao`},{en:`Quote the IDs: "id": "30"`,hi:`IDs ko quote karo: "id": "30"`},{en:`Remove the trailing comma at the end of line 18`,hi:`Line 18 ke end ka trailing comma hatao`}],a:3,w:{en:`After the comma on line 18 the parser expects another array value and finds ] at line 19, column 7. JSON forbids a trailing comma after the last item. The comma on line 19 is valid because access_ports follows. json.load is the right call for a file object.`,hi:`Line 18 ke comma ke baad parser ek aur array value expect karta hai aur line 19, column 7 par ] paata hai. JSON aakhri item ke baad trailing comma allow nahi karta. Line 19 ka comma valid hai kyunki uske baad access_ports aata hai. File object ke liye json.load hi sahi call hai.`}},{title:{en:`Catalyst Center rejects a fresh token`,hi:`Catalyst Center taaza token reject karta hai`},ticket:{en:`A new inventory script gets a token successfully but the device list call fails immediately, not after an hour.`,hi:`Ek naya inventory script safalta se token le leta hai par device list call turant fail hoti hai, ek ghante baad nahi.`},out:`POST /dna/system/api/v1/auth/token  (Basic auth)  -> 200
{"Token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NT..."}

GET /dna/intent/api/v1/network-device
request headers: {"Authorization": "Bearer eyJ0eXAiOiJKV1Qi...", "Accept": "application/json"}
-> 401 Unauthorized`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Wait for the task to finish and poll the taskId`,hi:`Task khatam hone ka intezaar karo aur taskId poll karo`},{en:`Use PUT instead of GET for the device list`,hi:`Device list ke liye GET ki jagah PUT use karo`},{en:`Send the token in the X-Auth-Token header`,hi:`Token X-Auth-Token header mein bhejo`},{en:`Request a new token every second`,hi:`Har second naya token maango`}],a:2,w:{en:`The token is valid, but Catalyst Center reads it from the X-Auth-Token header, not from Authorization: Bearer, so the request looks unauthenticated and returns 401. Expiry would only appear after about an hour; 202 and taskIds belong to write operations.`,hi:`Token valid hai, par Catalyst Center use X-Auth-Token header se padhta hai, Authorization: Bearer se nahi, isliye request unauthenticated dikhti hai aur 401 aata hai. Expiry lagbhag ek ghante baad hi dikhti; 202 aur taskIds write operations ke hain.`}},{title:{en:`SD-WAN Manager reads work, changes are forbidden`,hi:`SD-WAN Manager par reads chalte hain, changes forbidden`},ticket:{en:`A script logs in to SD-WAN Manager and lists devices fine, but every POST to attach a template fails.`,hi:`Ek script SD-WAN Manager par login karke devices theek se list karta hai, par template attach karne ka har POST fail hota hai.`},out:`POST /j_security_check -> 200   cookies: JSESSIONID=8F2C...
GET  /dataservice/device -> 200   {"header": {...}, "data": [ 14 items ]}
POST /dataservice/template/device/config/attachfeature -> 403 Forbidden
request headers: {"Content-Type": "application/json", "Cookie": "JSESSIONID=8F2C..."}`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A new JSESSIONID; log in again before every POST`,hi:`Naya JSESSIONID; har POST se pehle dobara login karo`},{en:`The X-XSRF-TOKEN header, fetched from /dataservice/client/token`,hi:`X-XSRF-TOKEN header, jo /dataservice/client/token se laaya jaata hai`},{en:`HTTP Basic authentication on each request`,hi:`Har request par HTTP Basic authentication`},{en:`verify=False on the POST`,hi:`POST par verify=False`}],a:1,w:{en:`The session is valid (the GET works), so this is not a 401 problem. SD-WAN Manager requires a cross-site request forgery token for state-changing calls: GET /dataservice/client/token and send it as X-XSRF-TOKEN. A 403 means authenticated but not allowed; a role without write permission would be the other cause to check.`,hi:`Session valid hai (GET chalta hai), isliye yeh 401 problem nahi. SD-WAN Manager state badalne wali calls ke liye cross-site request forgery token maangta hai: /dataservice/client/token GET karo aur use X-XSRF-TOKEN ki tarah bhejo. 403 ka matlab authenticated par allowed nahi; write permission ke bina role check karne wali doosri wajah hogi.`}},{title:{en:`Every router reports a single interface`,hi:`Har router ek hi interface report karta hai`},ticket:{en:`A capacity report says R2 has one interface up. On the router, show ip interface brief shows three interfaces up/up. No traceback appears.`,hi:`Ek capacity report kehti hai R2 par ek interface up hai. Router par show ip interface brief teen interfaces up/up dikhata hai. Koi traceback nahi aata.`},out:`AUTO> nl report.py
    12  def parse_brief(text):
    13      rows = []
    14      for line in text.splitlines()[1:]:
    15          parts = line.split()
    16          if len(parts) >= 6:
    17              rows.append({"intf": parts[0], "status": " ".join(parts[4:-1]), "proto": parts[-1]})
    18          return rows

AUTO> python3 report.py
R2       1 up: GigabitEthernet0/0`,q:{en:`What is the bug?`,hi:`Bug kya hai?`},o:[{en:`The header line is not skipped`,hi:`Header line skip nahi hoti`},{en:`The status comparison is case-sensitive`,hi:`Status comparison case-sensitive hai`},{en:`TextFSM is not installed`,hi:`TextFSM install nahi hai`},{en:`return rows is indented inside the for loop, so the function returns after the first line`,hi:`return rows for loop ke andar indented hai, isliye function pehli line ke baad return ho jaata hai`}],a:3,w:{en:`Line 18 sits at the loop body's indentation, so it runs during the first iteration and the function returns one row. Moving return rows back to the function level (4 spaces) fixes it. The header is skipped by [1:].`,hi:`Line 18 loop body ke indentation par hai, isliye pehle iteration mein hi chal jaati hai aur function ek row return karta hai. return rows ko function level (4 spaces) par wapas laane se fix hota hai. Header [1:] se skip hota hai.`}},{title:{en:`The second playbook run changes nothing`,hi:`Doosra playbook run kuch nahi badalta`},ticket:{en:`A junior engineer ran the Loopback100 playbook twice and is worried because the second run shows changed=0 everywhere.`,hi:`Ek junior engineer ne Loopback100 playbook do baar chalaya aur pareshaan hai kyunki doosra run har jagah changed=0 dikhata hai.`},out:`AUTO> ansible-playbook -i inventory.ini loopback.yml
PLAY RECAP *********************************************************
R1   : ok=1    changed=0    unreachable=0    failed=0    skipped=0
R2   : ok=1    changed=0    unreachable=0    failed=0    skipped=0
R3   : ok=1    changed=0    unreachable=0    failed=0    skipped=0`,q:{en:`How should this be interpreted?`,hi:`Ise kaise interpret karna chahiye?`},o:[{en:`Expected: the module is idempotent and the configuration already matches the desired state`,hi:`Expected: module idempotent hai aur configuration pehle se desired state se match karti hai`},{en:`The playbook failed silently on all routers`,hi:`Playbook saare routers par chupchaap fail hua`},{en:`The routers were unreachable over SSH`,hi:`Routers SSH par unreachable the`},{en:`An agent must be installed on the routers first`,hi:`Pehle routers par agent install karna padega`}],a:0,w:{en:`ok=1 with failed=0 and unreachable=0 means each task ran successfully; changed=0 means nothing needed changing because the first run already applied it. That is idempotency. Ansible is agentless, so no agent is involved.`,hi:`ok=1 ke saath failed=0 aur unreachable=0 ka matlab har task safalta se chala; changed=0 ka matlab kuch badalne ki zaroorat nahi thi kyunki pehle run ne pehle hi laga diya. Yahi idempotency hai. Ansible agentless hai, isliye koi agent involved nahi.`}}];export{e as default};