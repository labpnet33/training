var e=[{title:{en:`The invisible voice SSID`,hi:`Invisible voice SSID`},ticket:{en:`New NK-VOICE (VLAN 30) was built yesterday. PHONE1 does not see it; staff Wi-Fi works. Both APs are registered with PT-CAMPUS.`,hi:`Naya NK-VOICE (VLAN 30) kal bana. PHONE1 ko dikhta nahi; staff Wi-Fi chalta hai. Dono APs PT-CAMPUS ke saath registered hain.`},out:`WLC1# show wireless tag policy detailed PT-CAMPUS
Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 1

WLAN Profile Name                  Policy Name
NK-STAFF                           PP-STAFF

WLC1# show wireless profile policy detailed PP-VOICE
Policy Profile Name              : PP-VOICE
Status                           : DISABLED
VLAN                             : 30`,q:{en:`Which change set repairs the ticket?`,hi:`Kaunsa change set ticket repair karta hai?`},o:[{en:`no shutdown on PP-VOICE and map NK-VOICE to PP-VOICE in PT-CAMPUS`,hi:`PP-VOICE par no shutdown aur PT-CAMPUS mein NK-VOICE ko PP-VOICE se map karo`},{en:`Re-tag both APs with default-policy-tag`,hi:`Dono APs ko default-policy-tag se re-tag karo`},{en:`Change the staff key`,hi:`Staff key badlo`},{en:`Create VLAN 99`,hi:`VLAN 99 banao`}],a:0,w:{en:`There are two broken links: the map is absent and the profile is disabled. Fix both, then test PHONE1 in VLAN 30 and LAPTOP1 in VLAN 20.`,hi:`Do links toote hain: map absent hai aur profile disabled hai. Dono fix karo, phir PHONE1 ko VLAN 30 aur LAPTOP1 ko VLAN 20 mein test karo.`}},{title:{en:`Registered but silent AP`,hi:`Registered lekin chup AP`},ticket:{en:`After AP2 was reloaded the staff SSID disappeared from its corner. show ap summary says Registered.`,hi:`AP2 reload ke baad uske corner se staff SSID gayab. show ap summary Registered kehta hai.`},out:`WLC1# show ap tag summary
AP Name   Site Tag Name     Policy Tag Name      RF Tag Name     Misconfigured  Tag Source
AP1       default-site-tag  PT-CAMPUS            default-rf-tag  No             Static
AP2       default-site-tag  default-policy-tag   default-rf-tag  No             Default`,q:{en:`What is the smallest correct fix?`,hi:`Sabse chhota sahi fix kya hai?`},o:[{en:`Recreate NK-STAFF`,hi:`NK-STAFF recreate karo`},{en:`ap name AP2 policy-tag PT-CAMPUS`,hi:`ap name AP2 policy-tag PT-CAMPUS`},{en:`Change the RADIUS key`,hi:`RADIUS key badlo`},{en:`Add VLAN 20 to SW1`,hi:`SW1 mein VLAN 20 add karo`}],a:1,w:{en:`AP2 lost its static tag and fell back to the empty default-policy-tag. One command restores service.`,hi:`AP2 ka static tag gaya aur woh khaali default-policy-tag par gir gaya. Ek command service wapas laata hai.`}},{title:{en:`New AP never appears`,hi:`Naya AP kabhi nahi dikhta`},ticket:{en:`AP3 was cabled to SW1 Gi0/4 in the new wing and its LED is green. The controller lists only AP1 and AP2.`,hi:`AP3 naye wing mein SW1 Gi0/4 se cabled hai aur uski LED green hai. Controller sirf AP1 aur AP2 list karta hai.`},out:`SW1# show vlan brief
VLAN Name        Status    Ports
1    default     active    Gi0/4
10   AP-MGMT     active    Gi0/2, Gi0/3
20   STAFF       active

WLC1# show ap summary
Number of APs: 2`,q:{en:`What do you configure on SW1?`,hi:`SW1 par kya configure karte ho?`},o:[{en:`Gi0/4 trunk with all VLANs`,hi:`Gi0/4 sabhi VLANs ke saath trunk`},{en:`Gi0/4 shutdown`,hi:`Gi0/4 shutdown`},{en:`Gi0/4 as access port in VLAN 10`,hi:`Gi0/4 VLAN 10 mein access port`},{en:`Gi0/4 access in VLAN 20`,hi:`Gi0/4 VLAN 20 mein access`}],a:2,w:{en:`The AP needs the AP-MGMT VLAN to get an AP-POOL address and option 43. VLAN 20 is a client VLAN, not for the AP port.`,hi:`AP ko AP-POOL address aur option 43 ke liye AP-MGMT VLAN chahiye. VLAN 20 client VLAN hai, AP port ke liye nahi.`}},{title:{en:`AP3 joined but the laptop uses AP1`,hi:`AP3 join hua lekin laptop AP1 use karta hai`},ticket:{en:`AP3 is Registered. LAPTOP2 in the new wing connects to NK-STAFF but the controller shows it on AP1 with a weak signal and complaints continue.`,hi:`AP3 Registered hai. Naye wing mein LAPTOP2 NK-STAFF se connect hota hai lekin controller use AP1 par kamzor signal ke saath dikhata hai aur complaints jaari hain.`},out:`WLC1# show ap tag summary
AP3   default-site-tag  default-policy-tag  default-rf-tag  No  Default

WLC1# show wireless client summary
MAC Address     AP Name   WLAN  State   Protocol  Method
aabb.cc00.0002  AP1       1     Run     11n       PSK`,q:{en:`What is the likely reason AP3 is not serving the client?`,hi:`AP3 client ko serve kyun nahi kar raha, sambhavit reason?`},o:[{en:`LAPTOP2 does not support Wi-Fi`,hi:`LAPTOP2 Wi-Fi support nahi karta`},{en:`AP3 has Tag Source Default and broadcasts no WLAN`,hi:`AP3 ka Tag Source Default hai aur woh koi WLAN broadcast nahi karta`},{en:`RADIUS is down`,hi:`RADIUS down hai`},{en:`NK-STAFF is shut down`,hi:`NK-STAFF shut down hai`}],a:1,w:{en:`Assign PT-CAMPUS to AP3, then check that the client table shows AP3, VLAN 20 and State Run.`,hi:`AP3 ko PT-CAMPUS assign karo, phir check karo ki client table AP3, VLAN 20 aur State Run dikhata hai.`}},{title:{en:`Corporate users time out`,hi:`Corporate users timeout`},ticket:{en:`After RAD1 was rebuilt, alice cannot join NK-CORP. The AAA lists are complete and PP-CORP is enabled.`,hi:`RAD1 rebuild ke baad alice NK-CORP join nahi kar paati. AAA lists poori hain aur PP-CORP enabled hai.`},out:`WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 22, timeouts 22

WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client aabb.cc00.0001 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)`,q:{en:`What do you correct, given the address and ports are right?`,hi:`Address aur ports sahi hain to kya correct karte ho?`},o:[{en:`The user password for alice`,hi:`alice ka user password`},{en:`The AP country`,hi:`AP country`},{en:`The server shared secret to NkRadius1`,hi:`Server shared secret ko NkRadius1`},{en:`The policy VLAN of PP-STAFF`,hi:`PP-STAFF ka policy VLAN`}],a:2,w:{en:`All requests time out: a secret mismatch. A wrong password would show AUTH_REJECT. Repair only the RADIUS server key, then test alice and a wrong password.`,hi:`Saare requests timeout: secret mismatch. Galat password AUTH_REJECT dikhata. Sirf RADIUS server key repair karo, phir alice aur wrong password test karo.`}},{title:{en:`Monday after the weekend change`,hi:`Weekend change ke baad Monday`},ticket:{en:`Staff near AP2 cannot find NK-STAFF and NK-CORP users fail. You collected the outputs below.`,hi:`AP2 ke paas staff ko NK-STAFF nahi dikhta aur NK-CORP users fail hote hain. Neeche ke outputs aapne collect kiye.`},out:`WLC1# show ap tag summary
AP1   default-site-tag  PT-CAMPUS            default-rf-tag  No  Static
AP2   default-site-tag  default-policy-tag   default-rf-tag  No  Default

WLC1# show wireless profile policy detailed PP-CORP
Status                           : DISABLED
VLAN                             : 40

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 14`,q:{en:`How many separate defects are shown and what is the right plan?`,hi:`Kitne alag defects dikhte hain aur sahi plan kya hai?`},o:[{en:`One: rebuild everything`,hi:`Ek: sab rebuild karo`},{en:`Two: only tags and RADIUS`,hi:`Do: sirf tags aur RADIUS`},{en:`Three: AP2 tag, PP-CORP disabled, RADIUS secret; fix each on its owner and verify after each`,hi:`Teen: AP2 tag, PP-CORP disabled, RADIUS secret; har ek ko owner par fix karo aur har ek ke baad verify`},{en:`Three: reload WLC1 and re-check`,hi:`Teen: WLC1 reload karo aur dobara check`}],a:2,w:{en:`Tag source Default, policy DISABLED and all-timeout counters are three distinct defects in three layers. Rebuilding or reloading risks the working parts.`,hi:`Tag source Default, policy DISABLED aur all-timeout counters teen layers ke teen alag defects hain. Rebuild ya reload working parts ko risk mein daalta hai.`}},{title:{en:`Fix that vanished after a power event`,hi:`Power event ke baad gaya fix`},ticket:{en:`Last week you restored PP-CORP and the RADIUS key. This morning after a power cut corporate Wi-Fi fails again.`,hi:`Pichhle hafte aapne PP-CORP aur RADIUS key restore ki. Aaj power cut ke baad corporate Wi-Fi phir fail hai.`},out:`WLC1# show running-config | section wireless profile policy PP-CORP
wireless profile policy PP-CORP
 vlan 40
 shutdown

WLC1# show running-config | include radius server
radius server RAD1
 key 0 WrongSecret1`,q:{en:`What step was missed originally?`,hi:`Shuru mein kaunsa step chhoota?`},o:[{en:`write memory after verifying the fixes`,hi:`Fixes verify karne ke baad write memory`},{en:`Changing the VLAN number`,hi:`VLAN number badalna`},{en:`Disabling the WLAN`,hi:`WLAN disable karna`},{en:`Adding another AP`,hi:`Doosra AP add karna`}],a:0,w:{en:`Fixes lived only in running-config and were lost at reload. After verifying, save with write memory, then record the change.`,hi:`Fixes sirf running-config mein the aur reload par gaye. Verify ke baad write memory se save karo, phir change record karo.`}},{title:{en:`Guest rollout regression`,hi:`Guest rollout regression`},ticket:{en:`You added a corporate fix and a new guest map. Everyone connects, but the acceptance matrix has one negative test.`,hi:`Aapne corporate fix aur naya guest map jodha. Sab connect ho jaate hain, lekin acceptance matrix mein ek negative test hai.`},out:`GUEST1> wifi status
SSID        : NK-GUEST
Security    : Open
IP address  : 10.10.50.23/24 (DHCP)

GUEST1> ping 10.10.50.1
84 bytes from 10.10.50.1 icmp_seq=1 ttl=255 time=0.500 ms

GUEST1> ping 10.10.60.20
84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms

LAPTOP1> ping 10.10.60.20
84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms`,q:{en:`What should happen next?`,hi:`Agla action kya hona chahiye?`},o:[{en:`Close the ticket because everyone connects`,hi:`Ticket close karo kyunki sab connect hote hain`},{en:`Disable the staff SSID`,hi:`Staff SSID disable karo`},{en:`Raise 5 GHz power`,hi:`5 GHz power badhao`},{en:`Treat as failed: guest reaches RAD1; roll back or repair the R1 GUEST-IN ACL and retest`,hi:`Failed maano: guest RAD1 tak pahunchta hai; rollback karo ya R1 GUEST-IN ACL repair karke retest`}],a:3,w:{en:`GUEST1 must reach its gateway but not the server network. The negative test failed, so the change is not accepted until the guest ACL on R1 blocks VLAN 50 again.`,hi:`GUEST1 gateway tak pahunche lekin server network tak nahi. Negative test fail hua, isliye jab tak R1 par guest ACL VLAN 50 ko dobara block na kare change accept nahi hota.`}}];export{e as default};