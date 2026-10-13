var e=[{title:{en:`SITE-B will not register`,hi:`SITE-B register nahi ho rahi`},ticket:{en:`INC-7101: After last night's LISP rollout, hosts in 10.2.2.0/24 behind XTR2 are unreachable. MSMR shows SITE-B as never registered. The underlay ping from XTR2 to 100.64.3.2 works.`,hi:`INC-7101: Kal raat ke LISP rollout ke baad XTR2 ke peeche 10.2.2.0/24 ke hosts unreachable hain. MSMR SITE-B ko never registered dikhata hai. XTR2 se 100.64.3.2 tak underlay ping chalti hai.`},out:`MSMR# show lisp site name SITE-B
Site name: SITE-B
Allowed configured locators: any
Allowed EID-prefixes:
  EID-prefix: 10.2.2.0/24
    Registration errors:
      Authentication failures:   14
      Allowed locators mismatch: 0

XTR2# show running-config | section lisp
router lisp
 service ipv4
  itr map-resolver 100.64.3.2
  itr
  etr map-server 100.64.3.2 key NK-L1SP
  etr
  database-mapping 10.2.2.0/24 100.64.2.2 priority 1 weight 100`,q:{en:`What is the root cause and the correct fix?`,hi:`Root cause aur sahi fix kya hai?`},o:[{en:`The EID prefix is missing from SITE-B; add eid-prefix 10.2.2.0/24 on MSMR`,hi:`SITE-B se EID prefix gayab hai; MSMR par eid-prefix 10.2.2.0/24 jodo`},{en:`XTR2 is not an ETR; add the etr command`,hi:`XTR2 ETR nahi hai; etr command jodo`},{en:`The key on XTR2 (NK-L1SP) does not match the site key; re-enter etr map-server 100.64.3.2 key NK-LISP on XTR2`,hi:`XTR2 ki key (NK-L1SP) site key se match nahi karti; XTR2 par etr map-server 100.64.3.2 key NK-LISP dobara likho`},{en:`The RLOC 100.64.2.2 is unreachable from MSMR`,hi:`RLOC 100.64.2.2 MSMR se unreachable hai`}],a:2,w:{en:`Rising authentication failures prove the Map-Registers arrive and match a site prefix, but the HMAC fails. XTR2 uses a digit 1 instead of the letter I. Fix the outlier xTR, not the map-server key that other sites use.`,hi:`Badhte authentication failures sabit karte hain ki Map-Registers pahunch rahe hain aur site prefix match kar rahe hain, lekin HMAC fail hota hai. XTR2 letter I ki jagah digit 1 use karta hai. Outlier xTR theek karo, map-server key nahi jo baaki sites use karti hain.`}},{title:{en:`Silent ETR, no errors`,hi:`Chup ETR, koi error nahi`},ticket:{en:`INC-7102: SITE-A (10.1.1.0/24 behind XTR1) never registers. Unlike SITE-B, the map-server shows zero authentication failures for SITE-A. The key on XTR1 is correct.`,hi:`INC-7102: SITE-A (XTR1 ke peeche 10.1.1.0/24) kabhi register nahi hoti. SITE-B ke ulat, map-server SITE-A ke liye zero authentication failures dikhata hai. XTR1 par key sahi hai.`},out:`XTR1# show ip lisp database
LISP ETR IPv4 Mapping Database for EID-table default (IID 0), LSBs: 0x0, 1 entries

10.1.1.0/24
  Locator       Pri/Wgt  Source     State
  100.64.1.20     1/100  cfg-addr   site-other, report-reachable

XTR1# show ip interface brief | include GigabitEthernet0/0
GigabitEthernet0/0     100.64.1.2      YES manual up                    up`,q:{en:`Why is SITE-A not registering?`,hi:`SITE-A register kyun nahi ho rahi?`},o:[{en:`The database-mapping uses locator 100.64.1.20, which is not an address on XTR1, so the ETR has no local locator to register; change it to 100.64.1.2`,hi:`Database-mapping locator 100.64.1.20 use karta hai, jo XTR1 ka address nahi hai, isliye ETR ke paas register karne ko local locator nahi; ise 100.64.1.2 karo`},{en:`Priority 1 is invalid; it must be 255`,hi:`Priority 1 invalid hai; 255 honi chahiye`},{en:`The map-server needs accept-more-specifics for 10.1.1.0/24`,hi:`Map-server ko 10.1.1.0/24 ke liye accept-more-specifics chahiye`},{en:`The ITR role is disabled on XTR1`,hi:`XTR1 par ITR role disabled hai`}],a:0,w:{en:`"site-other" means the locator is not one of this router's own addresses. An ETR does not register a mapping without a local locator, so the MS never receives anything and logs no error. Remove the wrong mapping and add database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100. Priority 255 would mean "never use".`,hi:`"site-other" ka matlab locator is router ka apna address nahi hai. ETR bina local locator ke mapping register nahi karta, isliye MS ko kuch nahi milta aur koi error log nahi hota. Galat mapping hatao aur database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100 jodo. Priority 255 ka matlab hoga "kabhi use mat karo".`}},{title:{en:`The first pings always fail`,hi:`Pehle pings hamesha fail hote hain`},ticket:{en:`A trainee reports that after configuring LISP, the first two pings from PC1 to PC2 time out and the rest succeed. They want to open a TAC case. Both sites are registered.`,hi:`Ek trainee report karta hai ki LISP configure karne ke baad PC1 se PC2 ke pehle do pings time out hote hain aur baaki chal jaate hain. Woh TAC case kholna chahta hai. Dono sites registered hain.`},out:`PC1> ping 10.2.2.10
Request timed out.
Request timed out.
Reply from 10.2.2.10: bytes=32 time=3ms TTL=62
Reply from 10.2.2.10: bytes=32 time=2ms TTL=62

XTR1# show ip lisp map-cache
LISP IPv4 Mapping Cache for EID-table default (IID 0), 2 entries

0.0.0.0/0, uptime: 00:15:10, expires: never, via static-send-map-request
  Negative cache entry, action: send-map-request
10.2.2.0/24, uptime: 00:00:06, expires: 23:59:53, via map-reply, complete
  Locator     Uptime    State      Pri/Wgt     Encap-IID
  100.64.2.2  00:00:06  up           1/100       -`,q:{en:`What is the correct explanation?`,hi:`Sahi explanation kya hai?`},o:[{en:`The underlay OSPF is flapping`,hi:`Underlay OSPF flap kar raha hai`},{en:`The map-server key is intermittently wrong`,hi:`Map-server key beech beech mein galat hoti hai`},{en:`CORE needs a route to 10.2.2.0/24`,hi:`CORE ko 10.2.2.0/24 ka route chahiye`},{en:`Expected behaviour: LISP is pull-based, so the first packets are dropped while both xTRs send Map-Requests and receive Map-Replies`,hi:`Expected behaviour: LISP pull-based hai, isliye pehle packets drop hote hain jab tak dono xTRs Map-Requests bhejte aur Map-Replies paate hain`}],a:3,w:{en:`The map-cache entry is 6 seconds old and came via map-reply. On a miss the ITR drops the packet and resolves; the echo reply triggers resolution on XTR2 as well. CORE must not have EID routes. No TAC case needed.`,hi:`Map-cache entry 6 second purani hai aur map-reply se aayi. Miss par ITR packet drop karke resolve karta hai; echo reply XTR2 par bhi resolution trigger karta hai. CORE ke paas EID routes nahi hone chahiye. TAC case ki zaroorat nahi.`}},{title:{en:`Registered, but nothing resolves`,hi:`Registered, lekin kuch resolve nahi hota`},ticket:{en:`INC-7104: Both sites show registered on MSMR, yet PC1 still cannot reach PC2 after many pings. XTR1's map-cache contains only the default entry.`,hi:`INC-7104: MSMR par dono sites registered dikhti hain, phir bhi kai pings ke baad PC1 PC2 tak nahi pahunchta. XTR1 ke map-cache mein sirf default entry hai.`},out:`XTR1# show ip lisp
  Instance ID:                         0
  Router-lisp ID:                      0
  Locator table:                       default
  EID table:                           default
  Ingress Tunnel Router (ITR):         disabled
  Egress Tunnel Router (ETR):          enabled
  Map Server (MS):                     disabled
  Map Resolver (MR):                   disabled
  ITR Map-Resolver(s):                 100.64.3.2
  ETR Map-Server(s):                   100.64.3.2 (00:00:18)`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Change the map-resolver address to the ETR of SITE-B`,hi:`Map-resolver address ko SITE-B ke ETR par badlo`},{en:`Enable the ITR role with the bare itr command under service ipv4; the map-resolver address alone does not enable it`,hi:`service ipv4 ke neeche akeli itr command se ITR role enable karo; sirf map-resolver address use enable nahi karta`},{en:`Add a static route for 10.2.2.0/24 on CORE`,hi:`CORE par 10.2.2.0/24 ka static route jodo`},{en:`Increase the map-cache TTL`,hi:`Map-cache TTL badhao`}],a:1,w:{en:`The ETR works, so the site registers. But ITR is disabled: XTR1 never sends Map-Requests, so its map-cache never learns 10.2.2.0/24. "itr map-resolver 100.64.3.2" stores the address; "itr" turns the role on.`,hi:`ETR chalta hai, isliye site register hoti hai. Lekin ITR disabled hai: XTR1 kabhi Map-Requests nahi bhejta, isliye uska map-cache kabhi 10.2.2.0/24 nahi seekhta. "itr map-resolver 100.64.3.2" address store karta hai; "itr" role chalu karta hai.`}},{title:{en:`Same VLAN, different segment`,hi:`Same VLAN, alag segment`},ticket:{en:`INC-7105: PC1 (192.168.10.11) on VTEP1 and PC2 (192.168.10.12) on VTEP2 are both in VLAN 10 but cannot ping. nve1 is up on both switches and the loopbacks ping each other.`,hi:`INC-7105: VTEP1 par PC1 (192.168.10.11) aur VTEP2 par PC2 (192.168.10.12) dono VLAN 10 mein hain lekin ping nahi hota. Dono switches par nve1 up hai aur loopbacks ek doosre ko ping karte hain.`},out:`VTEP1# show nve vni
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
nve1      10010    UnicastStatic     Up    DP   L2 [10]

VTEP2# show nve vni
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
nve1      10100    UnicastStatic     Up    DP   L2 [10]`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The VLAN numbers must be different on each VTEP`,hi:`Har VTEP par VLAN numbers alag hone chahiye`},{en:`The hosts need a default gateway`,hi:`Hosts ko default gateway chahiye`},{en:`VLAN 10 maps to VNI 10010 on VTEP1 but 10100 on VTEP2; the VNI must match, so fix vn-segment and member vni on VTEP2`,hi:`VLAN 10 VTEP1 par VNI 10010 se aur VTEP2 par 10100 se map hai; VNI match hona chahiye, isliye VTEP2 par vn-segment aur member vni theek karo`},{en:`Ingress replication cannot be used with two VTEPs`,hi:`Do VTEPs ke saath ingress replication use nahi ho sakta`}],a:2,w:{en:`The VNI is the segment identity on the wire. VTEP2 drops frames for VNI 10010 because it only hosts 10100. Under vlan 10 set vn-segment 10010, and under nve1 replace member vni 10100 with member vni 10010 ingress-replication 1.1.1.1.`,hi:`Wire par segment ki pehchaan VNI hai. VTEP2 VNI 10010 ke frames drop karta hai kyunki woh sirf 10100 host karta hai. vlan 10 ke neeche vn-segment 10010 set karo, aur nve1 ke neeche member vni 10100 ki jagah member vni 10010 ingress-replication 1.1.1.1 lagao.`}},{title:{en:`No NVE peers at all`,hi:`Koi NVE peer hi nahi`},ticket:{en:`INC-7106: After configuring VXLAN, show nve peers is empty on VTEP1 and PC1 cannot reach PC2. nve1 is administratively up and member vni 10010 ingress-replication 2.2.2.2 is configured.`,hi:`INC-7106: VXLAN configure karne ke baad VTEP1 par show nve peers khaali hai aur PC1 PC2 tak nahi pahunchta. nve1 administratively up hai aur member vni 10010 ingress-replication 2.2.2.2 configured hai.`},out:`VTEP1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------

VTEP1# show ip route 2.2.2.2
% Network not in table

VTEP2# show running-config | section ospf
router ospf 1
 router-id 2.2.2.2
 network 10.0.2.2 0.0.0.0 area 0`,q:{en:`What is the most likely cause?`,hi:`Sabse sambhavit cause kya hai?`},o:[{en:`The VNI is too large`,hi:`VNI bahut bada hai`},{en:`VTEP1 needs a multicast group instead`,hi:`VTEP1 ko iski jagah multicast group chahiye`},{en:`PC2 has the wrong IP address`,hi:`PC2 ka IP address galat hai`},{en:`VTEP2 does not advertise its Loopback0 (2.2.2.2) in OSPF, so the VTEP address is unreachable in the underlay`,hi:`VTEP2 apna Loopback0 (2.2.2.2) OSPF mein advertise nahi karta, isliye underlay mein VTEP address unreachable hai`}],a:3,w:{en:`The router-id is not a network statement. Add network 2.2.2.2 0.0.0.0 area 0 on VTEP2. VTEP source addresses must be loopbacks that the underlay routes; always test with ping 2.2.2.2 source 1.1.1.1 first.`,hi:`Router-id network statement nahi hai. VTEP2 par network 2.2.2.2 0.0.0.0 area 0 jodo. VTEP source addresses aise loopbacks hone chahiye jinhe underlay route kare; hamesha pehle ping 2.2.2.2 source 1.1.1.1 se test karo.`}},{title:{en:`Pings fine, copies stall`,hi:`Pings theek, copies atakti hain`},ticket:{en:`INC-7107: Users in VNI 10010 can ping across the fabric and open small web pages, but file copies between the two racks stall. SPINE was replaced this morning.`,hi:`INC-7107: VNI 10010 ke users fabric ke paar ping kar sakte hain aur chhote web pages khol sakte hain, lekin do racks ke beech file copies atak jaati hain. SPINE aaj subah replace hua.`},out:`VTEP1# ping 2.2.2.2 source 1.1.1.1 packet-size 1400 df-bit count 3
3 packets transmitted, 3 packets received, 0.00% packet loss
VTEP1# ping 2.2.2.2 source 1.1.1.1 packet-size 1560 df-bit count 3
3 packets transmitted, 0 packets received, 100.00% packet loss

SPINE# show interface GigabitEthernet0/1 | include MTU
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change the VXLAN UDP port to 4790`,hi:`VXLAN UDP port ko 4790 karo`},{en:`Raise the MTU on the new SPINE's underlay interfaces to at least 1550 (jumbo preferred), because VXLAN adds 50 bytes`,hi:`Naye SPINE ke underlay interfaces par MTU kam se kam 1550 karo (jumbo behtar), kyunki VXLAN 50 bytes jodta hai`},{en:`Disable ingress replication`,hi:`Ingress replication disable karo`},{en:`Reduce the VNI to a 12-bit value`,hi:`VNI ko 12-bit value tak ghatao`}],a:1,w:{en:`Small packets fit, full-size frames plus 50 bytes do not. The replaced SPINE came up with the default 1500 MTU. Set the MTU on every underlay link consistently; the DF-bit ping at 1560 should then succeed.`,hi:`Chhote packets fit hote hain, full-size frames plus 50 bytes nahi. Replace hua SPINE default 1500 MTU ke saath aaya. Har underlay link par MTU ek jaisa set karo; phir 1560 wali DF-bit ping chalni chahiye.`}},{title:{en:`ARP works one way only`,hi:`ARP sirf ek taraf chalta hai`},ticket:{en:`INC-7108: PC2 learns PC1's MAC, but pings started from PC2 to PC1 fail. Two engineers configured the VTEPs separately.`,hi:`INC-7108: PC2 PC1 ka MAC seekh leta hai lekin PC2 se shuru hone wale pings fail hote hain. Do engineers ne VTEPs alag alag configure kiye.`},out:`VTEP1# show running-config interface nve1
interface nve1
  no shutdown
  source-interface loopback0
  member vni 10010
    ingress-replication protocol static
      peer-ip 2.2.2.2

VTEP2# show running-config interface nve1
interface nve1
  no shutdown
  source-interface loopback0
  member vni 10010 mcast-group 239.1.1.10`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`The VTEPs use different BUM replication methods for the same VNI: VTEP2 floods to a multicast group that VTEP1 never joins; configure the same method on both`,hi:`VTEPs same VNI ke liye alag BUM replication methods use karte hain: VTEP2 us multicast group ko flood karta hai jise VTEP1 kabhi join nahi karta; dono par same method lagao`},{en:`VTEP1 must use loopback1`,hi:`VTEP1 ko loopback1 use karna chahiye`},{en:`The VNI must be different on each VTEP`,hi:`Har VTEP par VNI alag hona chahiye`},{en:`PC1 has a firewall that blocks ARP`,hi:`PC1 par firewall hai jo ARP block karta hai`}],a:0,w:{en:`BUM from VTEP1 reaches VTEP2 by unicast, so PC2 learns PC1. BUM from VTEP2 goes to 239.1.1.10, which VTEP1 has not joined (and the underlay may not even run PIM), so ARPs from PC2 never arrive. Use ingress replication with peer 1.1.1.1 on VTEP2, or multicast on both.`,hi:`VTEP1 ka BUM unicast se VTEP2 tak pahunchta hai, isliye PC2 PC1 ko seekhta hai. VTEP2 ka BUM 239.1.1.10 ko jaata hai, jise VTEP1 ne join nahi kiya (aur underlay mein shayad PIM chalta hi nahi), isliye PC2 ke ARPs kabhi nahi pahunchte. VTEP2 par peer 1.1.1.1 ke saath ingress replication lagao, ya dono par multicast.`}}];export{e as default};