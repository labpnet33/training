var e=[{title:{en:`Duplicate gateway after the change window`,hi:`Change window ke baad duplicate gateway`},ticket:{en:`Ticket from the Pune sales floor: "Since last night's change, users see short drops and the NOC sees duplicate-address messages for 192.168.10.1." You collect this from R1 and R2.`,hi:`Pune sales floor ka ticket: "Kal raat ke change ke baad se users ko chhote drops dikh rahe hain aur NOC ko 192.168.10.1 ke duplicate-address messages dikh rahe hain." Aap R1 aur R2 se yeh collect karte ho.`},out:`R1#show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       10   110 P Active  local           unknown         192.168.10.1

R2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       20   100   Active  local           unknown         192.168.10.1

R1#show logging | include DUPADDR
%IP-4-DUPADDR: Duplicate address 192.168.10.1 on GigabitEthernet0/0, sourced by 0000.0c07.ac14`,q:{en:`What is the root cause and fix?`,hi:`Root cause aur fix kya hai?`},o:[{en:`R2's priority is too low; raise it to 110`,hi:`R2 ki priority bahut kam hai; ise 110 karo`},{en:`R1 needs HSRP version 2 to see group 20`,hi:`Group 20 dekhne ke liye R1 ko HSRP version 2 chahiye`},{en:`R2 is in group 20; remove it and configure standby 10 ip 192.168.10.1`,hi:`R2 group 20 mein hai; use hatao aur standby 10 ip 192.168.10.1 configure karo`},{en:`Change the VIP on R2 to 192.168.10.254 so the addresses no longer clash`,hi:`R2 par VIP 192.168.10.254 kar do taaki addresses na takraayein`}],a:2,w:{en:`Each router is alone in its own group, so both are Active and answer ARP for the same VIP. The DUPADDR source 0000.0c07.ac14 is the v1 VMAC of group 20 (0x14). Putting R2 in group 10 lets it hear R1 and become Standby. Priority does not cause two Actives, and a different VIP would break the gateway for users configured with .1.`,hi:`Har router apne alag group mein akela hai, isliye dono Active hain aur same VIP ke ARP ka jawab dete hain. DUPADDR source 0000.0c07.ac14 group 20 (0x14) ka v1 VMAC hai. R2 ko group 10 mein daalne se woh R1 ko sunega aur Standby banega. Priority do Active nahi banati, aur alag VIP .1 wale users ka gateway tod dega.`}},{title:{en:`The preferred router stays Standby`,hi:`Preferred router Standby hi rehta hai`},ticket:{en:`Ticket from Kolkata branch: "R1 was rebooted for an IOS upgrade two hours ago. Design says R1 is the primary gateway, but monitoring shows all traffic still on R2."`,hi:`Kolkata branch ka ticket: "Do ghante pehle IOS upgrade ke liye R1 reboot hua. Design kehta hai R1 primary gateway hai, lekin monitoring dikhata hai ki saara traffic abhi bhi R2 par hai."`},out:`R1#show standby
GigabitEthernet0/0 - Group 10
  State is Standby
    4 state changes, last state change 01:58:12
  Virtual IP address is 192.168.10.1
  Active virtual MAC address is 0000.0c07.ac0a (MAC Not In Use)
    Local virtual MAC address is 0000.0c07.ac0a (v1 default)
  Hello time 3 sec, hold time 10 sec
  Preemption disabled
  Active router is 192.168.10.3, priority 100 (expires in 8.416 sec)
  Standby router is local
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-10" (default)`,q:{en:`What should you configure on R1?`,hi:`R1 par kya configure karna chahiye?`},o:[{en:`standby 10 preempt (ideally with a delay so routing converges first)`,hi:`standby 10 preempt (behtar hai delay ke saath taaki pehle routing converge ho)`},{en:`standby 10 priority 255 so it wins immediately`,hi:`standby 10 priority 255 taaki turant jeete`},{en:`standby version 2 so the election restarts`,hi:`standby version 2 taaki election dobara shuru ho`},{en:`Nothing; reload R2 so R1 becomes Active`,hi:`Kuch nahi; R2 reload karo taaki R1 Active bane`}],a:0,w:{en:`R1 already has the higher priority (110 vs 100) but "Preemption disabled" means it will not take over a working Active router. Any higher priority without preempt changes nothing. Changing only one router's version would split the group, and reloading R2 causes an outage and fixes nothing permanently.`,hi:`R1 ki priority pehle se zyada hai (110 vs 100) lekin "Preemption disabled" ka matlab woh chalte Active router ko nahi hatayega. Bina preempt ke koi bhi zyada priority kuch nahi badalti. Sirf ek router ka version badalne se group toot jaayega, aur R2 reload karna outage laata hai aur kuch permanently theek nahi karta.`}},{title:{en:`Half-finished migration`,hi:`Aadhi adhoori migration`},ticket:{en:`Ticket from a Surat factory: "After the engineer started the HSRP migration on DIST2 this afternoon, PCs on VLAN 10 randomly lose their gateway."`,hi:`Surat factory ka ticket: "Aaj dopahar engineer ne DIST2 par HSRP migration shuru kiya, tab se VLAN 10 ke PCs randomly gateway kho dete hain."`},out:`DIST1#show standby Vlan10
Vlan10 - Group 10
  State is Active
  Virtual IP address is 10.10.0.1
  Active virtual MAC address is 0000.0c07.ac0a (MAC In Use)
    Local virtual MAC address is 0000.0c07.ac0a (v1 default)
  Standby router is unknown

DIST2#show standby Vlan10
Vlan10 - Group 10 (version 2)
  State is Active
  Virtual IP address is 10.10.0.1
  Active virtual MAC address is 0000.0c9f.f00a (MAC In Use)
    Local virtual MAC address is 0000.0c9f.f00a (v2 default)
  Standby router is unknown`,q:{en:`Why are both switches Active?`,hi:`Dono switches Active kyun hain?`},o:[{en:`The group numbers differ`,hi:`Group numbers alag hain`},{en:`DIST2 has a higher priority and preempted`,hi:`DIST2 ki priority zyada hai aur usne preempt kiya`},{en:`The VIP is outside the subnet on DIST2`,hi:`DIST2 par VIP subnet ke bahar hai`},{en:`DIST1 runs HSRP v1 and DIST2 runs v2; they use different multicast groups and do not interoperate`,hi:`DIST1 HSRP v1 aur DIST2 v2 chala raha hai; woh alag multicast groups use karte hain aur interoperate nahi karte`}],a:3,w:{en:`The group (10) and VIP match, but DIST2 shows "(version 2)" and the v2 VMAC 0000.0c9f.f00a. v1 hellos go to 224.0.0.2 and v2 to 224.0.0.102, so neither hears the other, and both answer ARP with different MACs. Set the same version on both switches in one change window. A preempt would produce one Active, not two.`,hi:`Group (10) aur VIP match karte hain, lekin DIST2 "(version 2)" aur v2 VMAC 0000.0c9f.f00a dikhata hai. v1 hellos 224.0.0.2 par aur v2 224.0.0.102 par jaate hain, isliye koi doosre ko nahi sunta, aur dono alag MACs se ARP ka jawab dete hain. Ek change window mein dono switches par same version set karo. Preempt se ek Active banta, do nahi.`}},{title:{en:`Tracking fired but nothing moved`,hi:`Tracking chala lekin kuch nahi hila`},ticket:{en:`Ticket from a Lucknow office: "R1's uplink to CORE is down for maintenance. We added tracking last month, yet traffic still goes through R1 and hairpins back across the LAN."`,hi:`Lucknow office ka ticket: "R1 ka CORE wala uplink maintenance ke liye down hai. Humne pichle mahine tracking jodi thi, phir bhi traffic R1 se hi jaata hai aur LAN par wapas hairpin hota hai."`},out:`R1#show standby Gi0/0
GigabitEthernet0/0 - Group 10
  State is Active
  Virtual IP address is 192.168.10.1
  Preemption enabled
  Active router is local
  Standby router is 192.168.10.3, priority 100 (expires in 9.320 sec)
  Priority 90 (configured 110)
    Track object 1 state Down decrement 20

R2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       10   100   Standby 192.168.10.2    local           192.168.10.1`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A larger decrement on R1`,hi:`R1 par bada decrement`},{en:`Preempt on R2, so it can take over from the lower-priority Active`,hi:`R2 par preempt, taaki woh kam priority wale Active se kaam le sake`},{en:`Tracking must also be configured on R2`,hi:`Tracking R2 par bhi configure honi chahiye`},{en:`Faster HSRP timers`,hi:`Tez HSRP timers`}],a:1,w:{en:`Tracking worked: R1 is at 90, below R2's 100. But R2 has no P flag, so it is not allowed to take over a working Active router. Adding standby 10 preempt on R2 moves the role. A bigger decrement or faster timers would not help without preempt on the peer.`,hi:`Tracking ne kaam kiya: R1 90 par hai, R2 ke 100 se neeche. Lekin R2 par P flag nahi hai, isliye use chalte Active router se kaam lene ki ijaazat nahi. R2 par standby 10 preempt jodne se role move hoga. Peer par preempt ke bina bada decrement ya tez timers madad nahi karenge.`}},{title:{en:`Uplink down, gateway unchanged`,hi:`Uplink down, gateway wahi`},ticket:{en:`Ticket from a Bhopal campus: "When DIST1's uplink failed during a fibre cut, VLAN 40 users lost the internet. Both switches have preempt."`,hi:`Bhopal campus ka ticket: "Fibre cut ke dauraan jab DIST1 ka uplink fail hua, VLAN 40 ke users ka internet chala gaya. Dono switches par preempt hai."`},out:`DIST1#show standby Vlan40
Vlan40 - Group 40
  State is Active
  Virtual IP address is 10.40.0.1
  Preemption enabled
  Active router is local
  Standby router is 10.40.0.3, priority 100 (expires in 9.504 sec)
  Priority 105 (configured 110)
    Track object 1 state Down decrement 5

DIST2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vl40        40   100 P Standby 10.40.0.2       local           10.40.0.1`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Remove preempt from DIST1`,hi:`DIST1 se preempt hatao`},{en:`Change DIST2's priority to 105`,hi:`DIST2 ki priority 105 karo`},{en:`Use HSRP version 2`,hi:`HSRP version 2 use karo`},{en:`Increase DIST1's decrement (for example to 20) so 110 minus the decrement falls below 100`,hi:`DIST1 ka decrement badhao (jaise 20) taaki 110 minus decrement 100 se neeche aaye`}],a:3,w:{en:`The track object is Down, but a decrement of 5 only brings DIST1 to 105, still above DIST2's 100, so DIST2 correctly does not preempt. The decrement must push the priority below the peer's: 110 - 20 = 90. Setting DIST2 to 105 would create a tie, which is not a clean design.`,hi:`Track object Down hai, lekin 5 ka decrement DIST1 ko sirf 105 par laata hai, ab bhi DIST2 ke 100 se upar, isliye DIST2 sahi mein preempt nahi karta. Decrement ko priority peer se neeche dhakelni chahiye: 110 - 20 = 90. DIST2 ko 105 karne se tie banega, jo clean design nahi hai.`}},{title:{en:`HSRP perfect, users still down`,hi:`HSRP perfect, users phir bhi down`},ticket:{en:`Ticket from an insurance office: "During the failover drill R2 took over perfectly, but most laptops lost the network until R1 came back. Only the IT team's PCs kept working."`,hi:`Ek insurance office ka ticket: "Failover drill mein R2 ne perfectly kaam sambhala, lekin zyada tar laptops ka network R1 ke wapas aane tak gaya raha. Sirf IT team ke PCs chalte rahe."`},out:`R2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       10   100   Active  local           unknown         192.168.10.1

R1#show running-config | section dhcp
ip dhcp pool SALES
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.2
 dns-server 198.51.100.53`,q:{en:`What explains the outage?`,hi:`Outage ki wajah kya hai?`},o:[{en:`The DHCP pool gives out R1's real address as the gateway instead of the VIP 192.168.10.1`,hi:`DHCP pool gateway ke roop mein VIP 192.168.10.1 ki jagah R1 ka asli address de raha hai`},{en:`R2 has no preempt`,hi:`R2 par preempt nahi hai`},{en:`The DNS server is unreachable through R2`,hi:`R2 ke through DNS server unreachable hai`},{en:`The hold time is too long`,hi:`Hold time bahut lamba hai`}],a:0,w:{en:`DHCP clients received 192.168.10.2, R1's own interface address, as default router, so they never used the VIP. When R1 went down their gateway disappeared regardless of HSRP. IT PCs were statically set to .1 and survived. Change default-router to 192.168.10.1. R2 did become Active, so preempt and timers are not the issue.`,hi:`DHCP clients ko default router ke roop mein 192.168.10.2, R1 ka apna interface address, mila, isliye unhone kabhi VIP use hi nahi kiya. R1 down hote hi unka gateway HSRP ke bawajood gaayab ho gaya. IT PCs statically .1 par set the aur bach gaye. default-router ko 192.168.10.1 karo. R2 Active bana tha, isliye preempt aur timers issue nahi hain.`}},{title:{en:`Security hardening broke the pair`,hi:`Security hardening ne pair tod diya`},ticket:{en:`Ticket from a Noida data office: "After the security team 'hardened' HSRP on R2, both routers claim the gateway and users see flapping."`,hi:`Noida data office ka ticket: "Security team ne R2 par HSRP 'harden' kiya, uske baad se dono routers gateway claim karte hain aur users ko flapping dikhti hai."`},out:`R1#show logging | include HSRP
%HSRP-4-BADAUTH: Bad authentication from 192.168.10.3, group 10, remote state Active
%HSRP-4-BADAUTH: Bad authentication from 192.168.10.3, group 10, remote state Active

R1#show standby Gi0/0 | include State|Authentication|Standby router
  State is Active
  Standby router is unknown`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Disable preempt on R2`,hi:`R2 par preempt disable karo`},{en:`Change R2 to a different group number`,hi:`R2 ko alag group number par daalo`},{en:`Configure the same authentication (for example the same MD5 key-string) on R1 as on R2`,hi:`R1 par bhi R2 jaisa same authentication (jaise same MD5 key-string) configure karo`},{en:`Lower the timers so hellos arrive faster`,hi:`Timers kam karo taaki hellos jaldi aayein`}],a:2,w:{en:`BADAUTH shows R1 rejecting R2's hellos: R2 has authentication and R1 has none (no Authentication line). Each ignores the other and both go Active. Configure the same key on both routers, ideally in the same change window. A different group would make things worse; preempt and timers do not affect authentication.`,hi:`BADAUTH dikhata hai ki R1 R2 ke hellos reject kar raha hai: R2 par authentication hai aur R1 par nahi (koi Authentication line nahi). Dono ek dusre ko ignore karte hain aur dono Active ho jaate hain. Dono routers par same key configure karo, behtar hai same change window mein. Alag group halat aur bigaadega; preempt aur timers ka authentication par koi asar nahi.`}},{title:{en:`The busy inter-switch link`,hi:`Busy inter-switch link`},ticket:{en:`Ticket from a Pune manufacturing plant: "The link between DSW1 and DSW2 runs at 90% while access uplinks are half idle. HSRP roles are split as designed."`,hi:`Pune ke manufacturing plant ka ticket: "DSW1 aur DSW2 ke beech ka link 90% par chal raha hai jabki access uplinks aadhe khaali hain. HSRP roles design ke hisaab se split hain."`},out:`DSW1#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vl10        10   110 P Active  local           192.168.10.3    192.168.10.1
Vl20        20   100 P Standby 192.168.20.3    local           192.168.20.1

DSW1#show spanning-tree root
                                        Root    Hello Max Fwd
Vlan                   Root ID          Cost    Time  Age Dly  Root Port
---------------- -------------------- --------- ----- --- ---  ------------
VLAN0010         24586 5254.0012.0b02         4    2   20  15  Po1
VLAN0020         24596 5254.0012.0b02         4    2   20  15  Po1`,q:{en:`What is the best fix?`,hi:`Sabse accha fix kya hai?`},o:[{en:`Make DSW1 Active for both VLANs`,hi:`DSW1 ko dono VLANs ke liye Active banao`},{en:`Make DSW1 the STP root for VLAN 10 so the root matches the HSRP Active`,hi:`DSW1 ko VLAN 10 ka STP root banao taaki root HSRP Active se match kare`},{en:`Switch from HSRP to VRRP`,hi:`HSRP se VRRP par switch karo`},{en:`Increase the HSRP hello timer`,hi:`HSRP hello timer badhao`}],a:1,w:{en:`DSW1 is HSRP Active for VLAN 10, but DSW2 (reached via Po1) is the STP root for both VLANs. For VLAN 10, access uplinks toward DSW1 are blocked, so frames go up to DSW2 and cross Po1 to reach the virtual MAC on DSW1. spanning-tree vlan 10 root primary on DSW1 aligns the root with the gateway. Moving both VLANs to DSW1 would waste DSW2; VRRP or timers do not change the path.`,hi:`DSW1 VLAN 10 ke liye HSRP Active hai, lekin DSW2 (Po1 se pahunchta hai) dono VLANs ka STP root hai. VLAN 10 ke liye DSW1 ki taraf access uplinks blocked hain, isliye frames upar DSW2 tak jaate hain aur DSW1 par virtual MAC tak pahunchne ke liye Po1 cross karte hain. DSW1 par spanning-tree vlan 10 root primary root ko gateway ke saath align karta hai. Dono VLANs DSW1 par le jaane se DSW2 bekaar hoga; VRRP ya timers path nahi badalte.`}}];export{e as default};