var e=[{title:{en:`Branch PCs get 169.254 addresses`,hi:`Branch PCs ko 169.254 addresses mil rahe hain`},ticket:{en:`"Since the branch router was swapped last night, no PC at the branch can get on the network. HQ is fine." The DHCP server is 10.0.20.10 at HQ. BR Gi0/0 (192.168.30.1) faces the branch users; Gi0/1 is the WAN link to HQ.`,hi:`"Kal raat branch router badalne ke baad se branch ka koi PC network par nahi aa pa raha. HQ theek hai." DHCP server HQ par 10.0.20.10 hai. BR Gi0/0 (192.168.30.1) branch users ki taraf hai; Gi0/1 HQ ka WAN link hai.`},out:`PC5> ip dhcp
DDD
Can't find dhcp server

BR# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.30.1/24
  Broadcast address is 255.255.255.255
  Helper address is not set

BR# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.0.99.2/30
  Broadcast address is 255.255.255.255
  Helper address is 10.0.20.10`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Move ip helper-address 10.0.20.10 from Gi0/1 to Gi0/0, the client-facing interface`,hi:`ip helper-address 10.0.20.10 ko Gi0/1 se hata kar Gi0/0, yaani client-facing interface, par lagao`},{en:`Create a DHCP pool for 192.168.30.0/24 on the HQ router`,hi:`HQ router par 192.168.30.0/24 ka DHCP pool banao`},{en:`Add a second helper on Gi0/1 pointing to 10.0.20.11`,hi:`Gi0/1 par 10.0.20.11 ki taraf doosra helper add karo`},{en:`Change the branch PCs to use APIPA permanently`,hi:`Branch PCs ko permanently APIPA use karne do`}],a:0,w:{en:`The helper was configured on the WAN uplink. Discovers arrive on Gi0/0, where no helper exists, so they never leave the branch. The helper must sit on the interface that receives the client broadcasts. HQ being fine shows the server itself works.`,hi:`Helper WAN uplink par configure tha. Discovers Gi0/0 par aate hain, jahan helper nahi hai, to woh branch se nikalte hi nahi. Helper us interface par hona chahiye jo client broadcasts receive karta hai. HQ ka theek hona dikhata hai ki server khud chal raha hai.`}},{title:{en:`Guest Wi-Fi stops giving addresses by Wednesday`,hi:`Wednesday tak guest Wi-Fi addresses dena band kar deta hai`},ticket:{en:`A busy café: "Every week the guest Wi-Fi works on Monday, but by Wednesday new customers cannot connect. Rebooting the router fixes it for a while."`,hi:`Ek busy café: "Har hafte guest Wi-Fi Monday ko chalta hai, lekin Wednesday tak naye customers connect nahi kar paate. Router reboot karne se kuch der theek ho jaata hai."`},out:`R1# show ip dhcp pool GUEST
Pool GUEST :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 244
 Excluded addresses             : 10
 Pending event                  : none

R1# show running-config | section pool GUEST
ip dhcp pool GUEST
 network 192.168.50.0 255.255.255.0
 default-router 192.168.50.1
 dns-server 192.168.50.1
 lease 8`,q:{en:`What is the best long-term fix?`,hi:`Sabse achha long-term fix kya hai?`},o:[{en:`Add ip helper-address on the guest interface`,hi:`Guest interface par ip helper-address add karo`},{en:`Change the default-router to 192.168.50.254`,hi:`default-router ko 192.168.50.254 karo`},{en:`Shorten the lease to an hour or two (and consider a larger subnet), then clear stale bindings`,hi:`Lease ko ek do ghante karo (aur bada subnet consider karo), phir stale bindings clear karo`},{en:`Remove the dns-server line so clients use APIPA`,hi:`dns-server line hatao taaki clients APIPA use karein`}],a:2,w:{en:`"lease 8" is eight days. Phones that visited once keep their addresses for a week, so 244 of 244 usable addresses are leased and the pool is exhausted. A short lease recycles addresses from customers who left; a /23 would add headroom.`,hi:`"lease 8" aath din hai. Ek baar aaye phones hafte bhar apne addresses rakhte hain, to 244 mein se 244 usable addresses leased hain aur pool exhausted hai. Chhoti lease chale gaye customers ke addresses recycle karti hai; /23 aur jagah deta.`}},{title:{en:`Local printing works, nothing else does`,hi:`Local printing chalti hai, baaki kuch nahi`},ticket:{en:`"After this morning's DHCP change, office PCs can print to the local printer, but no website, email or file server works." R1 Gi0/0 is 192.168.10.1.`,hi:`"Aaj subah ke DHCP change ke baad office PCs local printer par print kar paate hain, lekin koi website, email ya file server nahi chalta." R1 Gi0/0 192.168.10.1 hai.`},out:`PC1> show ip
NAME        : PC1[1]
IP/MASK     : 192.168.10.23/24
GATEWAY     : 192.168.10.254
DNS         : 192.168.10.1
DHCP SERVER : 192.168.10.1

PC1> ping 192.168.10.1
84 bytes from 192.168.10.1 icmp_seq=1 ttl=255 time=0.8 ms

PC1> ping 10.0.20.10
host (192.168.10.254) not reachable`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The DNS server option is wrong`,hi:`DNS server option galat hai`},{en:`The pool's default-router is 192.168.10.254 instead of 192.168.10.1`,hi:`Pool ka default-router 192.168.10.1 ki jagah 192.168.10.254 hai`},{en:`The pool is exhausted`,hi:`Pool exhausted hai`},{en:`NAT overload is missing`,hi:`NAT overload missing hai`}],a:1,w:{en:`The client has a valid address and can reach R1 locally, but its gateway (option 3) points to .254, which does not exist. Everything off-subnet fails. Fix the pool with default-router 192.168.10.1; clients pick it up at renewal or after ip dhcp again.`,hi:`Client ke paas valid address hai aur woh R1 tak locally pahunchta hai, lekin uska gateway (option 3) .254 ko point karta hai, jo exist nahi karta. Subnet ke bahar sab fail hota hai. Pool ko default-router 192.168.10.1 se theek karo; clients renewal par ya dobara ip dhcp ke baad ise le lenge.`}},{title:{en:`Names fail, addresses work`,hi:`Names fail, addresses chalte hain`},ticket:{en:`"We can open 10.0.20.10 but not web.nwk.lab." The PCs use 192.168.10.1 as their DNS server. R1 has ip host entries for web.nwk.lab and files.nwk.lab.`,hi:`"Hum 10.0.20.10 khol paate hain lekin web.nwk.lab nahi." PCs DNS server ke roop mein 192.168.10.1 use karte hain. R1 par web.nwk.lab aur files.nwk.lab ki ip host entries hain.`},out:`PC1> nslookup web.nwk.lab
;; communications error to 192.168.10.1#53: connection refused

PC1> curl web.nwk.lab
curl: (6) Could not resolve host: web.nwk.lab

R1# show hosts
Host                      Port  Flags      Age Type   Address(es)
files.nwk.lab             None  (perm, OK)  0   IP    10.0.20.10
web.nwk.lab               None  (perm, OK)  0   IP    10.0.20.10`,q:{en:`What should you do on R1?`,hi:`R1 par kya karna chahiye?`},o:[{en:`Add an AAAA record for web.nwk.lab`,hi:`web.nwk.lab ke liye AAAA record add karo`},{en:`Configure ip helper-address 10.0.20.10`,hi:`ip helper-address 10.0.20.10 configure karo`},{en:`Change the records to CNAME`,hi:`Records ko CNAME mein badlo`},{en:`Enable the DNS service with ip dns server`,hi:`ip dns server se DNS service enable karo`}],a:3,w:{en:`The host table is correct, but "connection refused" means nothing is listening on UDP 53 at 192.168.10.1. The records exist; the router is simply not acting as a DNS server. ip dns server turns the service on.`,hi:`Host table sahi hai, lekin "connection refused" ka matlab hai 192.168.10.1 par UDP 53 par koi nahi sun raha. Records hain; router bas DNS server ka kaam nahi kar raha. ip dns server service on karta hai.`}},{title:{en:`One name resolves, the other does not`,hi:`Ek naam resolve hota hai, doosra nahi`},ticket:{en:`"The intranet web.nwk.lab works, but files.nwk.lab says it cannot be found." Both services run on SRV 10.0.20.10.`,hi:`"Intranet web.nwk.lab chalta hai, lekin files.nwk.lab kehta hai nahi mila." Dono services SRV 10.0.20.10 par chalti hain.`},out:`PC2> nslookup files.nwk.lab
Server:		192.168.10.1
Address:	192.168.10.1#53

** server can't find files.nwk.lab: NXDOMAIN

R1# show hosts
Host                      Port  Flags      Age Type   Address(es)
web.nwk.lab               None  (perm, OK)  0   IP    10.0.20.10`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`PC2 has no DNS server configured`,hi:`PC2 par koi DNS server configured nahi hai`},{en:`The A record for files.nwk.lab is missing on R1`,hi:`R1 par files.nwk.lab ka A record missing hai`},{en:`UDP 53 is blocked between PC2 and R1`,hi:`PC2 aur R1 ke beech UDP 53 blocked hai`},{en:`The file server is powered off`,hi:`File server band hai`}],a:1,w:{en:`The server answered (it is listed and reachable), so DNS service and connectivity are fine. NXDOMAIN means the name does not exist in its data, and show hosts confirms only web.nwk.lab. Add ip host files.nwk.lab 10.0.20.10.`,hi:`Server ne jawab diya (listed aur reachable hai), to DNS service aur connectivity theek hain. NXDOMAIN ka matlab naam uske data mein nahi hai, aur show hosts confirm karta hai ki sirf web.nwk.lab hai. ip host files.nwk.lab 10.0.20.10 add karo.`}},{title:{en:`PAT configured, no internet`,hi:`PAT configured, internet nahi`},ticket:{en:`"We configured PAT on R1 this morning but no PC can reach 8.8.8.8." Gi0/0 is the LAN (192.168.10.1), Gi0/1 is the ISP link (203.0.113.2). The default route to 203.0.113.1 is present.`,hi:`"Humne aaj subah R1 par PAT configure kiya lekin koi PC 8.8.8.8 tak nahi pahunchta." Gi0/0 LAN hai (192.168.10.1), Gi0/1 ISP link hai (203.0.113.2). 203.0.113.1 ki taraf default route hai.`},out:`R1# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0
Inside interfaces:
  GigabitEthernet0/1
Hits: 0  Misses: 0

R1# show ip nat translations
R1#`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Swap the roles: ip nat inside on Gi0/0 and ip nat outside on Gi0/1`,hi:`Roles badlo: Gi0/0 par ip nat inside aur Gi0/1 par ip nat outside`},{en:`Add a second default route`,hi:`Doosra default route add karo`},{en:`Change access-list 1 to permit any`,hi:`access-list 1 ko permit any karo`},{en:`Replace PAT with static NAT for each PC`,hi:`Har PC ke liye PAT ki jagah static NAT lagao`}],a:0,w:{en:`The statistics show the LAN as outside and the ISP link as inside. Traffic from the PCs arrives on an "outside" interface, so inside-source translation never happens (0 hits, empty table). Correct the interface roles.`,hi:`Statistics LAN ko outside aur ISP link ko inside dikhate hain. PCs ka traffic "outside" interface par aata hai, to inside-source translation kabhi nahi hota (0 hits, khaali table). Interface roles theek karo.`}},{title:{en:`Domain logins fail with clock skew`,hi:`Clock skew ke saath domain logins fail`},ticket:{en:`"Since the new firewall policy went live, branch users randomly get 'time difference too large' at login, and the branch switch logs show times hours off." The switch should sync to 10.0.20.10 and 10.0.20.11.`,hi:`"Naya firewall policy live hone ke baad se branch users ko login par randomly 'time difference too large' milta hai, aur branch switch ke logs ghanton galat time dikhate hain." Switch ko 10.0.20.10 aur 10.0.20.11 se sync hona chahiye.`},out:`SW-BR# show ntp status
Clock is unsynchronized, stratum 16, no reference clock

SW-BR# show ntp associations
  address         ref clock       st   when   poll reach  delay  offset   disp
 ~10.0.20.10      .INIT.          16      -     64     0  0.000   0.000 15937.
 ~10.0.20.11      .INIT.          16      -     64     0  0.000   0.000 15937.
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,q:{en:`What is the most likely cause?`,hi:`Sabse likely cause kya hai?`},o:[{en:`The NTP servers are stratum 1 and too accurate`,hi:`NTP servers stratum 1 hain aur bahut accurate hain`},{en:`The switch needs PTP instead of NTP`,hi:`Switch ko NTP ki jagah PTP chahiye`},{en:`DNSSEC validation is failing`,hi:`DNSSEC validation fail ho rahi hai`},{en:`The new firewall policy blocks UDP 123 to the NTP servers`,hi:`Naya firewall policy NTP servers tak UDP 123 block kar raha hai`}],a:3,w:{en:`reach 0 and .INIT. for both servers mean no NTP reply has ever arrived, so the switch is stratum 16 (unsynchronised). Both servers failing together right after a firewall change points to UDP 123 being blocked. Permit UDP 123 and the clock will synchronise.`,hi:`Dono servers ke liye reach 0 aur .INIT. ka matlab hai ki koi NTP reply kabhi nahi aaya, to switch stratum 16 (unsynchronised) hai. Firewall change ke turant baad dono servers ka ek saath fail hona UDP 123 ke block hone ki taraf ishara karta hai. UDP 123 permit karo aur clock sync ho jaayegi.`}},{title:{en:`Random IP conflict warnings`,hi:`Random IP conflict warnings`},ticket:{en:`"Some laptops pop up 'IP address conflict' and one user keeps losing the network." The finance printer was recently installed with a static address.`,hi:`"Kuch laptops par 'IP address conflict' popup aata hai aur ek user ka network baar baar jaata hai." Finance printer haal hi mein static address ke saath lagaya gaya tha.`},out:`R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
192.168.10.45     Ping               Mar 04 2026 10:12 AM

R1# show running-config | include excluded
ip dhcp excluded-address 192.168.10.1 192.168.10.20

PRINTER config: IP 192.168.10.45/24  GW 192.168.10.1  (static)`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Increase the lease time`,hi:`Lease time badhao`},{en:`Add a second DHCP server`,hi:`Doosra DHCP server add karo`},{en:`Give the printer an address inside the excluded range (or a DHCP reservation), then clear the conflict`,hi:`Printer ko excluded range ke andar address do (ya DHCP reservation), phir conflict clear karo`},{en:`Disable conflict detection on R1`,hi:`R1 par conflict detection disable karo`}],a:2,w:{en:`The printer uses .45 statically, but .45 is inside the dynamic range (.21 upward), so DHCP can hand it out. Move the printer into .1 to .20 or create a reservation for its MAC, then clear ip dhcp conflict so the address is managed cleanly.`,hi:`Printer .45 statically use karta hai, lekin .45 dynamic range (.21 se upar) ke andar hai, to DHCP use de sakta hai. Printer ko .1 se .20 mein le jao ya uske MAC ke liye reservation banao, phir clear ip dhcp conflict chalao taaki address saaf manage ho.`}}];export{e as default};