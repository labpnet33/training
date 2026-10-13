var e=[{title:{en:`v3 polling fails after hardening`,hi:`Hardening ke baad v3 polling fail`},ticket:{en:`After a weekend hardening, SNMPv3 polling of HYD-CORE-R1 fails. Ping works. The NOC pasted the poll command and result.`,hi:`Weekend hardening ke baad HYD-CORE-R1 ki SNMPv3 polling fail ho rahi hai. Ping chalta hai. NOC ne poll command aur result paste kiya.`},out:`NMS> ping 10.255.0.1
Reply from 10.255.0.1: bytes=64 time=2ms

NMS> snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
snmpget: Authentication failure (incorrect password, community or key)

HYD-CORE-R1# show snmp user
User name: nmsadmin
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: GF-MON`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Lower the group to noAuthNoPriv`,hi:`Group ko noAuthNoPriv par lao`},{en:`Correct the authentication password on the NMS to Auth#Key26 (case matters), then repeat the same snmpget`,hi:`NMS par authentication password Auth#Key26 theek karo (case matter karta hai), phir wahi snmpget dohrao`},{en:`Remove ACL 20`,hi:`ACL 20 hatao`},{en:`Change the privacy protocol to DES`,hi:`Privacy protocol DES karo`}],a:1,w:{en:`The agent answered and knows the user, so reachability, ACL and user name are fine. Authentication failure means the auth password or protocol differs, and the poll used Auth#key26. Lowering security or removing the ACL would weaken the hardening without fixing the cause.`,hi:`Agent ne jawab diya aur user ko jaanta hai, to reachability, ACL aur user name theek hain. Authentication failure ka matlab auth password ya protocol alag hai, aur poll ne Auth#key26 use kiya. Security kam karna ya ACL hatana hardening ko kamzor karta par cause fix nahi karta.`}},{title:{en:`Unknown user on a new router`,hi:`Naye router par unknown user`},ticket:{en:`The new Lucknow router R-LKO is configured for v3, but the NMS poll returns an error. Kabir asks what is wrong.`,hi:`Naya Lucknow router R-LKO v3 ke liye configured hai, lekin NMS poll error deta hai. Kabir poochta hai kya galat hai.`},out:`NMS> snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.3 sysName.0
snmpget: Unknown user name

LKO-EDGE-R3# show snmp group
groupname: GF-MON                          security model:v3 priv
readview : GF-VIEW                         writeview: <no writeview specified>
row status: active    access-list: 20

LKO-EDGE-R3# show snmp user
(no output)`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`The AES licence`,hi:`AES licence`},{en:`A route to the NMS`,hi:`NMS tak route`},{en:`A trap host`,hi:`Trap host`},{en:`The user nmsadmin was never created on R-LKO`,hi:`R-LKO par user nmsadmin kabhi bana hi nahi`}],a:3,w:{en:`The group exists but show snmp user is empty, so the agent has no user called nmsadmin. Create it with snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26 and poll again. A routing problem would give a timeout, not this message.`,hi:`Group exist karta hai lekin show snmp user khali hai, to agent ke paas nmsadmin naam ka user nahi hai. snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26 se banao aur dobara poll karo. Routing problem timeout deti, yeh message nahi.`}},{title:{en:`Traps configured but none arrive`,hi:`Traps configured par koi nahi aata`},ticket:{en:`Ravi shut and reopened a port on R-KCH to test traps, but the NMS trap list is empty.`,hi:`Ravi ne traps test karne ke liye R-KCH par ek port shut karke dobara khola, lekin NMS ka trap list khali hai.`},out:`KCH-EDGE-R2# show running-config | include snmp
snmp-server community GF-RO RO 20
snmp-server host 10.1.50.100 version 2c GF-TRAP

KCH-EDGE-R2# show snmp | include logging|Logging
SNMP logging: enabled
    Logging to 10.1.50.100.162, 0/10, 0 sent, 0 dropped.

NMS> show traps
SNMP trap receiver (UDP 162): 0 traps received`,q:{en:`Why were no traps sent?`,hi:`Koi trap kyun nahi bheja gaya?`},o:[{en:`No snmp-server enable traps line, so no events are selected for sending`,hi:`snmp-server enable traps line nahi hai, isliye bhejne ke liye koi events select nahi`},{en:`The community GF-RO is read-only`,hi:`Community GF-RO read-only hai`},{en:`UDP 162 is the poll port`,hi:`UDP 162 poll port hai`},{en:`The NMS is at the wrong subnet`,hi:`NMS galat subnet par hai`}],a:0,w:{en:`The host is defined (0 sent), but without snmp-server enable traps for linkdown, linkup or config the agent has nothing to send. Add the enable traps lines, and optionally trap-source Loopback0, then repeat the port test.`,hi:`Host define hai (0 sent), lekin linkdown, linkup ya config ke liye snmp-server enable traps ke bina agent ke paas bhejne ko kuch nahi. enable traps lines jodo, aur optionally trap-source Loopback0, phir port test dohrao.`}},{title:{en:`Default community found in an audit`,hi:`Audit mein default community mili`},ticket:{en:`An audit on the Kochi switch shows a laptop on the guest VLAN can read the switch with SNMP.`,hi:`Kochi switch par audit dikhata hai ki guest VLAN ka laptop SNMP se switch padh sakta hai.`},out:`laptop$ snmpwalk -v2c -c public 10.2.20.2 system
SNMPv2-MIB::sysDescr.0 = STRING: switch software
SNMPv2-MIB::sysName.0 = STRING: SW-KCH

SW-KCH# show snmp community
Community name: public
storage-type: nonvolatile   active
access: read-only`,q:{en:`What is the best remediation?`,hi:`Best remediation kya hai?`},o:[{en:`Make the community read-write`,hi:`Community ko read-write banao`},{en:`Turn off logging`,hi:`Logging band karo`},{en:`Replace it with a unique read-only community bound to an ACL permitting only the NMS, and plan v3`,hi:`Use unique read-only community se replace karo jo sirf NMS ko permit karne wali ACL se bandhi ho, aur v3 plan karo`},{en:`Use a longer name only, keep no ACL`,hi:`Sirf lamba naam rakho, ACL nahi`}],a:2,w:{en:`The default name public has no ACL, so any host that can reach UDP 161 can read the device. A unique name plus an ACL limits who can use it, and v3 authPriv removes the clear-text problem. A long name without an ACL is still exposed to anyone who sniffs it.`,hi:`Default naam public par ACL nahi hai, isliye jo bhi host UDP 161 tak pahunch sake woh device padh sakta hai. Unique naam aur ACL limit karte hain kaun use kar sakta hai, aur v3 authPriv clear-text problem hatata hai. ACL ke bina lamba naam sniff karne wale ke liye abhi bhi exposed hai.`}},{title:{en:`Access denied although the password is right`,hi:`Password sahi hai phir bhi access denied`},ticket:{en:`A junior engineer polls R-HYD as nmsadmin with correct passwords, but gets an access error.`,hi:`Ek junior engineer sahi passwords ke saath nmsadmin ke roop mein R-HYD poll karta hai, lekin access error milta hai.`},out:`NMS> snmpget -v3 -u nmsadmin -l authNoPriv -a SHA -A Auth#Key26 10.255.0.1 sysName.0
Error in packet
Reason: authorizationError (access denied to that object)

HYD-CORE-R1# show snmp group
groupname: GF-MON                          security model:v3 priv
readview : GF-VIEW`,q:{en:`What should the engineer change?`,hi:`Engineer ko kya badalna chahiye?`},o:[{en:`The SHA password`,hi:`SHA password`},{en:`The user name`,hi:`User name`},{en:`The ACL source`,hi:`ACL source`},{en:`Ask at -l authPriv with the privacy options -x AES -X Priv#Key26`,hi:`-l authPriv par poochho, privacy options -x AES -X Priv#Key26 ke saath`}],a:3,w:{en:`The user and authentication are accepted; the group GF-MON requires priv and the request used authNoPriv, below the minimum. Authorization errors point to level or view, not to passwords.`,hi:`User aur authentication accept ho gaye; group GF-MON priv maangta hai aur request authNoPriv par thi, minimum se neeche. Authorization errors level ya view ki taraf ishara karte hain, passwords ki taraf nahi.`}},{title:{en:`Which interface is down?`,hi:`Kaunsa interface down hai?`},ticket:{en:`A trap said ifIndex 3 went down on R-KCH. Priya walks the interfaces to name the port.`,hi:`Ek trap ne kaha R-KCH par ifIndex 3 down hua. Priya port ka naam jaanne ke liye interfaces walk karti hai.`},out:`NMS> snmpwalk -c GF-RO 10.255.0.2 interfaces
IF-MIB::ifNumber.0 = INTEGER: 4
IF-MIB::ifDescr.1 = STRING: GigabitEthernet0/0
IF-MIB::ifDescr.2 = STRING: GigabitEthernet0/1
IF-MIB::ifDescr.3 = STRING: GigabitEthernet0/2
IF-MIB::ifDescr.4 = STRING: Loopback0
IF-MIB::ifOperStatus.1 = INTEGER: up(1)
IF-MIB::ifOperStatus.2 = INTEGER: up(1)
IF-MIB::ifOperStatus.3 = INTEGER: down(2)
IF-MIB::ifOperStatus.4 = INTEGER: up(1)`,q:{en:`Which port is down?`,hi:`Kaunsa port down hai?`},o:[{en:`GigabitEthernet0/1`,hi:`GigabitEthernet0/1`},{en:`GigabitEthernet0/2`,hi:`GigabitEthernet0/2`},{en:`GigabitEthernet0/0`,hi:`GigabitEthernet0/0`},{en:`Loopback0`,hi:`Loopback0`}],a:1,w:{en:`ifOperStatus.3 is down(2) and ifDescr.3 is GigabitEthernet0/2. The index in the trap, the description and the status share the same instance number, so match them by index.`,hi:`ifOperStatus.3 down(2) hai aur ifDescr.3 GigabitEthernet0/2 hai. Trap ka index, description aur status ek hi instance number share karte hain, isliye unhe index se match karo.`}}];export{e as default};