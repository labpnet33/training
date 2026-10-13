var e=[{title:{en:`Bengaluru cannot reach the Mumbai server`,hi:`Bengaluru Mumbai server tak nahi pahunch pa raha`},ticket:{en:`Ticket 3201: Since 09:05 Bengaluru staff cannot open the file server 10.1.20.10 in Mumbai. Delhi is fine. Bengaluru internet works.`,hi:`Ticket 3201: 09:05 se Bengaluru staff Mumbai ke file server 10.1.20.10 ko nahi khol pa raha. Delhi theek hai. Bengaluru ka internet chalta hai.`},out:`Site-to-site VPN  (network: Bengaluru Branch)
Mode : spoke      Hubs : (none listed)
VLAN  Name      Subnet         Use VPN
10    Staff     10.2.10.0/24   yes
Tunnel table: no hubs configured

Alerts and events
09:05  event  Imran removed hub MX-MUM from the hub list (MX-BLR)`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Replace the Bengaluru ISP circuit`,hi:`Bengaluru ISP circuit badlo`},{en:`Set Bengaluru to mode hub`,hi:`Bengaluru ko mode hub set karo`},{en:`Add MX-MUM back to the spoke hub list and save`,hi:`MX-MUM ko spoke hub list mein wapas jodo aur save karo`},{en:`Enable Guest VLAN 30 for VPN`,hi:`Guest VLAN 30 ko VPN ke liye enable karo`}],a:2,w:{en:`The spoke has no hub to build to. The log shows who removed it. Restoring the hub list lets the tunnel form.`,hi:`Spoke ke paas banane ke liye koi hub nahi hai. Log batata hai kisne hataya. Hub list restore karne se tunnel ban jaata hai.`}},{title:{en:`Delhi tunnel stays down`,hi:`Delhi tunnel down hi rehta hai`},ticket:{en:`Ticket 3202: The Delhi tunnel to Mumbai has never come up since the new ISP-B circuit was installed. Configuration looks right.`,hi:`Ticket 3202: Naya ISP-B circuit lagne ke baad se Delhi ka Mumbai tak tunnel kabhi up nahi hua. Configuration theek dikhti hai.`},out:`Uplinks  (network: Delhi Branch)
wan1  BB-DEL-01  ISP-B  203.0.113.30/24  up  active

Site-to-site VPN  (network: Delhi Branch)
Mode : spoke   Hubs : 1 MX-MUM
VLAN 10  10.3.10.0/24  Use VPN yes
Hub      Hub address      Tunnel   Detail
MX-MUM   198.51.100.10    down     no response from peer: outbound UDP blocked upstream?
Licence  : valid`,q:{en:`What is the most likely cause and next step?`,hi:`Sabse likely cause aur agla step kya hai?`},o:[{en:`Outbound UDP is blocked on the circuit: ask the ISP or upstream owner to allow it`,hi:`Circuit par outbound UDP block hai: ISP ya upstream owner se allow karne ko kaho`},{en:`The licence has expired: renew it`,hi:`Licence expire ho gaya: renew karo`},{en:`Subnet conflict: renumber VLAN 10`,hi:`Subnet conflict: VLAN 10 renumber karo`},{en:`The hub is set to none`,hi:`Hub none par set hai`}],a:0,w:{en:`Uplink, mode, list, subnets and licence are fine and the detail says no response from peer. That points upstream.`,hi:`Uplink, mode, list, subnets aur licence theek hain aur detail "no response from peer" kehti hai. Yeh upstream ki taraf ishara karta hai.`}},{title:{en:`Every tunnel down at month start`,hi:`Mahine ki shuruaat par har tunnel down`},ticket:{en:`Ticket 3203: At 00:00 all spokes lost the tunnel to Mumbai. Nobody changed anything. Uplinks are up.`,hi:`Ticket 3203: 00:00 par saare spokes ne Mumbai tak tunnel kho diya. Kisi ne kuch nahi badla. Uplinks up hain.`},out:`Overview  (organization: Bharat Retail Co)
Licence : expired 00:00

Site-to-site VPN  (hub: MX-MUM)
Spoke    Tunnel   Detail
MX-BLR   down     licence invalid or expired
MX-DEL   down     licence invalid or expired

Alerts and events
00:00  alert  Organization licence expired
(no change entries since 17:42 yesterday)`,q:{en:`Which action restores the tunnels?`,hi:`Kaunsa action tunnels restore karta hai?`},o:[{en:`Reorder the hub list`,hi:`Hub list ka order badlo`},{en:`Switch the hub to wan2`,hi:`Hub ko wan2 par switch karo`},{en:`Renumber the branch subnets`,hi:`Branch subnets renumber karo`},{en:`Renew the organization licence`,hi:`Organization licence renew karo`}],a:3,w:{en:`All tunnels failed together with no change and the detail names the licence. No VPN setting needs touching.`,hi:`Saare tunnels ek saath fail hue, koi change nahi, aur detail licence ka naam leti hai. Kisi VPN setting ko chhune ki zaroorat nahi.`}},{title:{en:`Pune store overlaps Bengaluru`,hi:`Pune store Bengaluru se overlap karta hai`},ticket:{en:`Ticket 3204: A new Pune store joined the VPN. Bengaluru staff now reach Mumbai only sometimes.`,hi:`Ticket 3204: Naya Pune store VPN mein juda. Bengaluru staff ab Mumbai tak sirf kabhi kabhi pahunchta hai.`},out:`Site-to-site VPN  (hub: MX-MUM)
Spoke     VLAN  Subnet         Use VPN  Status
MX-BLR    10    10.2.10.0/24   yes      conflict with MX-PUN VLAN 10
MX-PUN    10    10.2.10.0/24   yes      conflict with MX-BLR VLAN 10`,q:{en:`What should you do?`,hi:`Aapko kya karna chahiye?`},o:[{en:`Add another hub`,hi:`Ek aur hub jodo`},{en:`Give Pune a unique subnet such as 10.4.10.0/24, or remove it from the VPN`,hi:`Pune ko unique subnet jaise 10.4.10.0/24 do, ya use VPN se hatao`},{en:`Reboot the Bengaluru MX`,hi:`Bengaluru MX reboot karo`},{en:`Disable the firewall`,hi:`Firewall disable karo`}],a:1,w:{en:`The same subnet exists at two sites, so it cannot be routed. Renumber one site.`,hi:`Ek hi subnet do sites par hai, isliye route nahi ho sakta. Ek site renumber karo.`}},{title:{en:`Tunnels do not return after failover`,hi:`Failover ke baad tunnels wapas nahi aate`},ticket:{en:`Ticket 3205: wan1 at Mumbai failed at 02:14. Web browsing at HQ works, but the branches have had no VPN since.`,hi:`Ticket 3205: Mumbai ka wan1 02:14 par fail hua. HQ par web browsing chalti hai, lekin tab se branches ke paas VPN nahi hai.`},out:`Uplinks  (network: Mumbai HQ)
wan1  ILL-MUM-01  ISP-A  198.51.100.10/24  down
wan2  BB-MUM-02   ISP-B  203.0.113.10/24   up   active

Site-to-site VPN  (hub: MX-MUM, address 203.0.113.10)
Spoke    Tunnel   Detail
MX-BLR   down     no response from peer: outbound UDP blocked upstream?
MX-DEL   down     no response from peer: outbound UDP blocked upstream?`,q:{en:`What explains this?`,hi:`Isse kya explain hota hai?`},o:[{en:`The spokes are in mode none`,hi:`Spokes mode none mein hain`},{en:`Guest VLAN is in the VPN`,hi:`Guest VLAN VPN mein hai`},{en:`The backup circuit BB-MUM-02 filters outbound UDP, so tunnels cannot form on wan2`,hi:`Backup circuit BB-MUM-02 outbound UDP filter karta hai, isliye wan2 par tunnels nahi ban sakte`},{en:`The licence expired`,hi:`Licence expire ho gaya`}],a:2,w:{en:`Failover worked for web traffic, but the tunnels follow the active uplink and need outbound UDP on that circuit too. Test backups with the VPN.`,hi:`Failover web traffic ke liye chala, lekin tunnels active uplink ko follow karte hain aur us circuit par bhi outbound UDP chahiye. Backups ko VPN ke saath test karo.`}},{title:{en:`Both spokes lost the hub at once`,hi:`Dono spokes ne ek saath hub kho diya`},ticket:{en:`Ticket 3206: At 11:20 both Bengaluru and Delhi lost the tunnel. Uplinks are up and the licence is valid.`,hi:`Ticket 3206: 11:20 par Bengaluru aur Delhi dono ne tunnel kho diya. Uplinks up hain aur licence valid hai.`},out:`Site-to-site VPN  (network: Mumbai HQ)
Mode : none

Spoke    Tunnel   Detail
MX-BLR   down     hub has mode none
MX-DEL   down     hub has mode none

Alerts and events
11:20  event  Priya changed MX-MUM VPN mode hub to none`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change both spokes to hub`,hi:`Dono spokes ko hub karo`},{en:`Set MX-MUM back to mode hub (with its subnets) and save`,hi:`MX-MUM ko wapas mode hub (apne subnets ke saath) set karo aur save karo`},{en:`Replace the Delhi circuit`,hi:`Delhi circuit badlo`},{en:`Add a firewall allow rule`,hi:`Firewall allow rule jodo`}],a:1,w:{en:`Both spokes failing at once points to the hub. The log shows the mode was changed to none.`,hi:`Dono spokes ka ek saath fail hona hub ki taraf ishara karta hai. Log dikhata hai mode none kar diya gaya tha.`}}];export{e as default};