var e=[{title:{en:`No Wi-Fi near one AP`,hi:`Ek AP ke paas Wi-Fi nahi`},ticket:{en:`Users on the east side (near AP2) say no Wi-Fi networks appear. AP2 shows green in the dashboard. You are on the Catalyst 9800 web UI and the console.`,hi:`East side (AP2 ke paas) ke users kehte hain koi Wi-Fi network nahi dikhta. Dashboard mein AP2 green dikhta hai. Aap Catalyst 9800 web UI aur console par ho.`},out:`WLC1# show ap summary
Number of APs: 2

AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
--------------------------------------------------------------------------------------------------
AP1                 2      C9120AXI-D    0050.42a6.9801  0050.42a6.9800  IN  10.10.10.11     Registered
AP2                 2      C9120AXI-D    0050.43a6.9a01  0050.43a6.9a00  IN  10.10.10.12     Registered

WLC1# show ap name AP2 config general
CISCO AP Name   : AP2
AP Mode         : Monitor
Ethernet MAC    : 0050.43a6.9a01
IP Address      : 10.10.10.12
Controller      : WLC1
CAPWAP state    : Joined
Policy Tag Name : PT-CAMPUS`,q:{en:`What is the most likely cause?`,hi:`Sabse sambhav wajah kya hai?`},o:[{en:`AP2 has not joined the controller`,hi:`AP2 ne controller join nahi kiya`},{en:`AP2 received the wrong option 43`,hi:`AP2 ko galat option 43 mila`},{en:`AP2 is in monitor mode, so it serves no clients`,hi:`AP2 monitor mode mein hai, isliye koi client serve nahi karta`},{en:`The 5 GHz band is disabled globally`,hi:`5 GHz band globally disabled hai`}],a:2,w:{en:`AP2 is Registered and its CAPWAP state is Joined, so discovery and join are fine, and it carries the policy tag. The AP Mode line says Monitor: monitor-mode APs only scan. Set it back to Local (ap name AP2 mode local; GUI: Configuration > Wireless > Access Points > AP2 > General > AP Mode). Note that show ap summary on a 9800 has no Mode column.`,hi:`AP2 Registered hai aur uski CAPWAP state Joined hai, isliye discovery aur join theek hain, aur policy tag bhi hai. AP Mode line Monitor kehti hai: monitor-mode APs sirf scan karte hain. Ise wapas Local karo (ap name AP2 mode local; GUI: Configuration > Wireless > Access Points > AP2 > General > AP Mode). Dhyan do ki 9800 par show ap summary mein Mode column nahi hota.`}},{title:{en:`One laptop cannot join NK-STAFF`,hi:`Ek laptop NK-STAFF join nahi kar pata`},ticket:{en:`A manager's laptop says "cannot connect" to NK-STAFF. Colleagues next to him are fine.`,hi:`Ek manager ka laptop NK-STAFF par "cannot connect" kehta hai. Paas baithe colleagues theek hain.`},out:`WLC1# show logging
Syslog logging: enabled
%APF-4-AUTH_FAIL: Client 0050.2fe9.9a01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: MIC failure in 4-way handshake (wrong pre-shared key)

LAPTOP1> wifi connect NK-STAFF psk WrongKey123
Found "NK-STAFF" on AP1 (5 GHz, channel 36, -62 dBm)
Associating with BSSID 00:50:42:a6:98:10 ... ok
Authentication failed: 4-way handshake timeout - the passphrase does not match.`,q:{en:`What should you do?`,hi:`Aapko kya karna chahiye?`},o:[{en:`Correct the passphrase saved on the laptop; the MIC in message 2 fails because its PMK differs`,hi:`Laptop par saved passphrase theek karo; message 2 ka MIC fail hota hai kyunki uska PMK alag hai`},{en:`Increase AP1 transmit power`,hi:`AP1 ka transmit power badhao`},{en:`Map NK-STAFF to another VLAN`,hi:`NK-STAFF ko doosre VLAN se map karo`},{en:`Restart the RADIUS server`,hi:`RADIUS server restart karo`}],a:0,w:{en:`A MIC failure in the 4-way handshake on a PSK WLAN means the client derived a different PMK: the passphrase is wrong. The client associated fine, so RF and the policy VLAN are not involved, and PSK WLANs do not use RADIUS.`,hi:`PSK WLAN par 4-way handshake mein MIC failure matlab client ne alag PMK banaya: passphrase galat hai. Client ne association theek kiya, isliye RF aur policy VLAN shaamil nahi, aur PSK WLANs RADIUS use nahi karte.`}},{title:{en:`802.1X logins time out`,hi:`802.1X logins time out hote hain`},ticket:{en:`After a controller replacement, nobody can log in to NK-CORP. The controller logs only "RADIUS server not responding". Ping from the controller to RAD1 works.`,hi:`Controller badalne ke baad koi NK-CORP par login nahi kar pata. Controller sirf "RADIUS server not responding" log karta hai. Controller se RAD1 ping chalta hai.`},out:`WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 2

RAD1> aaa-server show log
Recent events:
  Oct  4 21:18:58.030  RADIUS request from 10.10.99.10 ignored: shared key mismatch
  Oct  4 21:19:28.030  RADIUS request from 10.10.99.10 ignored: shared key mismatch`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Reset alice's password on RAD1`,hi:`RAD1 par alice ka password reset karo`},{en:`Change the RADIUS port to 1813`,hi:`RADIUS port 1813 karo`},{en:`Disable WPA3 on the WLAN`,hi:`WLAN par WPA3 disable karo`},{en:`Make the shared secret on the controller match the one RAD1 has for 10.10.99.10`,hi:`Controller par shared secret ko us secret se match karo jo RAD1 ke paas 10.10.99.10 ke liye hai`}],a:3,w:{en:`The server drops requests whose shared secret does not match, so the controller sees timeouts, not rejects. Type the right secret again on the server entry (radius server RAD1, key 0 NkRadius1; GUI: Configuration > Security > AAA > Servers > RAD1). 1813 is accounting.`,hi:`Server un requests ko drop karta hai jinka shared secret match nahi karta, isliye controller ko reject nahi, timeouts dikhte hain. Server entry par sahi secret dobara type karo (radius server RAD1, key 0 NkRadius1; GUI: Configuration > Security > AAA > Servers > RAD1). 1813 accounting hai.`}},{title:{en:`Corporate users get staff addresses`,hi:`Corporate users ko staff addresses milte hain`},ticket:{en:`Employees on NK-CORP authenticate successfully but get 10.10.20.x addresses and cannot reach finance servers allowed only from 10.10.40.0/24.`,hi:`NK-CORP par employees successfully authenticate hote hain par 10.10.20.x addresses milte hain aur sirf 10.10.40.0/24 se allowed finance servers tak nahi pahunchte.`},out:`WLC1# show wlan summary
ID   Profile Name                     SSID                             Status Security
--------------------------------------------------------------------------------------
1    NK-STAFF                         NK-STAFF                         UP     [WPA2][PSK][AES]
2    NK-CORP                          NK-CORP                          UP     [WPA2][802.1x][AES]

WLC1# show wireless tag policy detailed PT-CAMPUS
WLAN Profile Name                  Policy Name
------------------------------------------------------------
NK-STAFF                           PP-STAFF
NK-CORP                            PP-CORP

WLC1# show wireless profile policy detailed PP-CORP
Policy Profile Name              : PP-CORP
Status                           : ENABLED
VLAN                             : 20
Central Switching                : ENABLED`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The RADIUS server assigns the wrong VLAN`,hi:`RADIUS server galat VLAN assign karta hai`},{en:`The policy profile PP-CORP is in VLAN 20 (staff) instead of VLAN 40`,hi:`Policy profile PP-CORP VLAN 40 ki jagah VLAN 20 (staff) mein hai`},{en:`The DHCP pool for VLAN 40 is exhausted`,hi:`VLAN 40 ka DHCP pool khatam ho gaya`},{en:`Clients are roaming at Layer 3 to another controller`,hi:`Clients Layer 3 par doosre controller par roam kar rahe hain`}],a:1,w:{en:`On a 9800 the policy profile, not the WLAN profile, carries the VLAN, and the policy tag maps NK-CORP to PP-CORP. PP-CORP says VLAN 20. Disable the policy profile, set VLAN 40, enable it again (GUI: Configuration > Tags & Profiles > Policy > PP-CORP). On AireOS this was the WLAN interface setting.`,hi:`9800 par VLAN WLAN profile nahi, policy profile rakhta hai, aur policy tag NK-CORP ko PP-CORP se map karta hai. PP-CORP VLAN 20 kehta hai. Policy profile disable karo, VLAN 40 set karo, dobara enable karo (GUI: Configuration > Tags & Profiles > Policy > PP-CORP). AireOS par yeh WLAN interface setting thi.`}},{title:{en:`New APs stuck in discovery`,hi:`Naye APs discovery mein atke`},ticket:{en:`New APs in the AP subnet never join. The DHCP pool was copied from an old site; this site has one controller, whose management address is 10.10.99.10.`,hi:`AP subnet ke naye APs kabhi join nahi karte. DHCP pool ek purani site se copy hua; is site par ek controller hai, jiska management address 10.10.99.10 hai.`},out:`R1# show running-config | section ip dhcp pool AP-POOL
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.630b

AP1> show capwap
AP IP address            : 10.10.10.11/24 (DHCP)
Static controller        : not set
DHCP option 43           : 10.10.99.11
CAPWAP state             : DISCOVERY - no controller answered

WLC1# show wireless management interface
Wireless management interface : Vlan99
IP address                    : 10.10.99.10/24`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`UDP 5247 is blocked`,hi:`UDP 5247 blocked hai`},{en:`The controller is refusing the join because of the country code`,hi:`Controller country code ki wajah se join mana kar raha hai`},{en:`Option 43 carries 10.10.99.11 (hex 0a0a.630b) but the controller is 10.10.99.10 (hex 0a0a.630a)`,hi:`Option 43 mein 10.10.99.11 (hex 0a0a.630b) hai par controller 10.10.99.10 (hex 0a0a.630a) hai`},{en:`The APs need a static IP address`,hi:`APs ko static IP address chahiye`}],a:2,w:{en:`The AP got an address and an option 43, and decoded it to 10.10.99.11, where no controller answers. Option 43 is type f1, length 4 times the number of controllers, then the addresses in hex: for 10.10.99.10 it is f104.0a0a.630a. A country-code refusal would happen at Join, after discovery succeeds; blocked UDP 5246 would show as discovery with the right controller address.`,hi:`AP ko address aur option 43 mila, aur usne use 10.10.99.11 decode kiya, jahan koi controller jawab nahi deta. Option 43 type f1, length 4 guna controllers ki sankhya, phir hex mein addresses: 10.10.99.10 ke liye f104.0a0a.630a. Country-code refusal discovery safal hone ke baad Join par hota; blocked UDP 5246 mein discovery sahi controller address ke saath dikhta.`}},{title:{en:`Calls drop between buildings`,hi:`Buildings ke beech calls drop`},ticket:{en:`Voice calls drop when users walk from building A (WLC-A, VLAN 20) to building B (WLC-B, VLAN 120). Both controllers carry the same SSID. Concept only: mobility is not simulated in the lab, so this output is illustrative (see module wl-mobility, Roaming, mobility and anchoring).`,hi:`Building A (WLC-A, VLAN 20) se building B (WLC-B, VLAN 120) jaate hi voice calls drop hoti hain. Dono controllers same SSID le jaate hain. Concept only: mobility lab mein simulate nahi hoti, isliye yeh output illustrative hai (module wl-mobility dekho, Roaming, mobility and anchoring).`},out:`WLC-B client details (phone 0050.1122.3344)
  AP Name ....................... B-2F-AP07
  Mobility Role ................. Local
  Mobility Peer IP .............. N/A
  IP Address .................... 10.20.20.57   (previously 10.10.20.31 on WLC-A)
  Policy Manager State .......... RUN

WLC-B mobility summary
  Mobility group name ........... NK-Campus
  Peer WLC-A 10.10.99.10 group NK-CAMPUS ... Control Path Down`,q:{en:`What should you fix?`,hi:`Kya theek karna chahiye?`},o:[{en:`Make the mobility group names identical so the controllers become peers; the phone will then roam as foreign and keep its IP`,hi:`Mobility group names identical karo taaki controllers peers banein; phir phone foreign ke roop mein roam karke IP rakhega`},{en:`Lower the transmit power in building B`,hi:`Building B mein transmit power kam karo`},{en:`Put both buildings in the same RF group only`,hi:`Sirf dono buildings ko same RF group mein daalo`},{en:`Disable 802.11r on the WLAN`,hi:`WLAN par 802.11r disable karo`}],a:0,w:{en:`The phone was treated as a new client (role Local, new IP) because the peers are in different groups (NK-Campus vs NK-CAMPUS) and the control path is down. Matching group names (and UDP 16666/16667 open) lets WLC-B act as foreign with WLC-A as anchor.`,hi:`Phone ko naya client maana gaya (role Local, naya IP) kyunki peers alag groups mein hain (NK-Campus vs NK-CAMPUS) aur control path down hai. Matching group names (aur UDP 16666/16667 khule) se WLC-B foreign aur WLC-A anchor ban sakte hain.`}},{title:{en:`Everyone stuck on 2.4 GHz`,hi:`Sab 2.4 GHz par atke`},ticket:{en:`The fourth floor is slow. All dual-band laptops show 2.4 GHz connections. The 5 GHz clients of the same floor used to work last week.`,hi:`Chauthi manzil slow hai. Saare dual-band laptops 2.4 GHz connections dikhate hain. Isi floor ke 5 GHz clients pichhle hafte tak chal rahe the.`},out:`WLC1# show ap dot11 5ghz summary
AP Name             Subband  Radio Mac       Status    Channel  Power Level  Width
----------------------------------------------------------------------------------
AP1                 All      0050.42a6.9810  Disabled  36       1            20 MHz
AP2                 All      0050.43a6.9a10  Disabled  40       1            20 MHz

WLC1# show ap rf-profile summary
RF Profile Name               Band    State     Max TX power
------------------------------------------------------------
CAMPUS-5                      5 GHz   Down      14 dBm

LAPTOP1> wifi status
SSID        : NK-STAFF
AP          : AP1
Band/channel: 2.4 GHz / 1`,q:{en:`Why are clients on 2.4 GHz?`,hi:`Clients 2.4 GHz par kyun hain?`},o:[{en:`The 5 GHz radios are in monitor mode`,hi:`5 GHz radios monitor mode mein hain`},{en:`Band select is pushing clients to 2.4 GHz`,hi:`Band select clients ko 2.4 GHz par dhakel raha hai`},{en:`DFS radar was detected on all 5 GHz channels`,hi:`Saare 5 GHz channels par DFS radar mila`},{en:`The 5 GHz RF profile used by the APs' RF tag is shut down, so both 5 GHz radios are Disabled`,hi:`APs ke RF tag ka 5 GHz RF profile shut down hai, isliye dono 5 GHz radios Disabled hain`}],a:3,w:{en:`Both 5 GHz radios show Status Disabled and the RF profile CAMPUS-5 is Down. In the lab model a shut RF profile turns that band off for every AP whose RF tag uses it (on a real controller, check the radio and RF profile state the same way). Enable it (ap dot11 5ghz rf-profile CAMPUS-5, no shutdown; GUI: Configuration > Tags & Profiles > RF). Band select does the opposite: it encourages 5 GHz. A per-WLAN radio policy is a real setting too, but the lab does not model it (concept only).`,hi:`Dono 5 GHz radios ka Status Disabled hai aur RF profile CAMPUS-5 Down hai. Lab model mein shut RF profile us band ko har us AP ke liye off kar deta hai jiske RF tag mein woh hai (asli controller par radio aur RF profile state isi tarah check karo). Use enable karo (ap dot11 5ghz rf-profile CAMPUS-5, no shutdown; GUI: Configuration > Tags & Profiles > RF). Band select ulta karta hai: 5 GHz ko badhava deta hai. Per-WLAN radio policy bhi asli setting hai, par lab use model nahi karti (concept only).`}}];export{e as default};