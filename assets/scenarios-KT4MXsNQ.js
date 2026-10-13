var e=[{title:{en:`Floor 2 is silent after the switch swap`,hi:`Switch swap ke baad Floor 2 chup hai`},ticket:{en:`NK-7101. After SW1 was replaced, users in VLAN 10 work but the VLAN 20 PC cannot even reach its gateway 10.10.20.1. The router subinterfaces are up. You check the PC and the new switch.`,hi:`NK-7101. SW1 replace hone ke baad VLAN 10 ke users chal rahe hain lekin VLAN 20 ka PC apne gateway 10.10.20.1 tak bhi nahi pahunch pa raha. Router subinterfaces up hain. Aap PC aur naye switch ko check karte ho.`},out:`PC2# ping 10.10.20.1
host (10.10.20.1) not reachable
host (10.10.20.1) not reachable
host (10.10.20.1) not reachable

SW1# show interfaces trunk

Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
Gi0/1       10

Port        Vlans allowed and active in management domain
Gi0/1       10

SW1# show vlan brief
10   USERS                            active    Gi0/2
20   VOICE                            active    Gi0/3`,q:{en:`What is the cause and the smallest correct fix?`,hi:`Cause kya hai aur sabse chhota sahi fix kya hai?`},o:[{en:`PC2 is in the wrong VLAN; move Gi0/3 to VLAN 10`,hi:`PC2 galat VLAN mein hai; Gi0/3 ko VLAN 10 mein daalo`},{en:`The router is down; reload R1`,hi:`Router down hai; R1 reload karo`},{en:`The trunk allows only VLAN 10; add VLAN 20 with switchport trunk allowed vlan add 20`,hi:`Trunk sirf VLAN 10 allow karta hai; switchport trunk allowed vlan add 20 se VLAN 20 add karo`},{en:`The native VLAN must be changed to 20 on both ends`,hi:`Dono ends par native VLAN 20 karna hai`}],a:2,w:{en:`VLAN 20 exists and Gi0/3 is in it, but the trunk allowed list contains only VLAN 10, so VLAN 20 frames never reach the router. Add the VLAN to the list. Changing the native VLAN or the access port would not help, and a reload destroys evidence.`,hi:`VLAN 20 maujood hai aur Gi0/3 usme hai, lekin trunk allowed list mein sirf VLAN 10 hai, isliye VLAN 20 ke frames router tak nahi pahunchte. VLAN ko list mein add karo. Native VLAN ya access port badalne se madad nahi hogi, aur reload evidence khatam karta hai.`}},{title:{en:`The new joiner on the wrong VLAN`,hi:`Naya joiner galat VLAN mein`},ticket:{en:`NK-7102. A new user on port Gi0/3 gets no IP from the VLAN 20 gateway and cannot ping 10.10.20.1. Other VLAN 20 users on another switch are fine. You inspect the access switch.`,hi:`NK-7102. Port Gi0/3 par naye user ko VLAN 20 gateway se IP nahi mil raha aur woh 10.10.20.1 ko ping nahi kar pa raha. Doosre switch ke baaki VLAN 20 users theek hain. Aap access switch inspect karte ho.`},out:`SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/3, Gi0/4, Gi0/5
                                                Gi0/6, Gi0/7, Gi1/0, Gi1/1
10   USERS                            active    Gi0/2
20   VOICE                            active
1002 fddi-default                     act/unsup

SW1# show interfaces GigabitEthernet0/3 switchport
Name: Gi0/3
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Access Mode VLAN: 1 (default)`,q:{en:`Which action fixes the fault?`,hi:`Kaunsa action fault fix karta hai?`},o:[{en:`Add VLAN 20 to the trunk`,hi:`Trunk par VLAN 20 add karo`},{en:`Run switchport access vlan 20 on Gi0/3`,hi:`Gi0/3 par switchport access vlan 20 chalao`},{en:`Create VLAN 20 on the router`,hi:`Router par VLAN 20 banao`},{en:`Change the PC subnet mask`,hi:`PC ka subnet mask badlo`}],a:1,w:{en:`Gi0/3 is listed under VLAN 1 (default) and its Access Mode VLAN is 1, so the port was never assigned to VLAN 20. Assign the port. The trunk and the router are not involved because other VLAN 20 users work.`,hi:`Gi0/3 VLAN 1 (default) ke neeche listed hai aur uska Access Mode VLAN 1 hai, to port kabhi VLAN 20 mein assign hi nahi hua. Port assign karo. Trunk aur router involved nahi hain kyunki baaki VLAN 20 users chal rahe hain.`}},{title:{en:`Everyone reaches the branch, nobody reaches the Internet`,hi:`Sab branch tak pahunchte hain, Internet tak koi nahi`},ticket:{en:`NK-7103. After a maintenance window on R1, all users can ping their gateway but nothing beyond. The ISP says its link is healthy. You check R1.`,hi:`NK-7103. R1 par maintenance window ke baad saare users apne gateway ko ping kar sakte hain lekin usse aage kuch nahi. ISP kehta hai uska link healthy hai. Aap R1 check karte ho.`},out:`PC1# ping 192.0.2.1
*10.10.10.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:1, Destination host unreachable)

R1# show ip route
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.10.10.0/24 is directly connected, GigabitEthernet0/0.10
C        10.10.20.0/24 is directly connected, GigabitEthernet0/0.20
      198.51.100.0/24 is variably subnetted, 2 subnets, 2 masks
C        198.51.100.0/30 is directly connected, GigabitEthernet0/1`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A second NAT pool`,hi:`Doosra NAT pool`},{en:`A trunk allowed list entry`,hi:`Trunk allowed list entry`},{en:`A OSPF network statement for the ISP loopback`,hi:`ISP loopback ke liye OSPF network statement`},{en:`A default route: ip route 0.0.0.0 0.0.0.0 198.51.100.1`,hi:`Default route: ip route 0.0.0.0 0.0.0.0 198.51.100.1`}],a:3,w:{en:`The table says "Gateway of last resort is not set" and has no S* line. The router replies "Destination host unreachable" because it has no route toward 192.0.2.1. The next hop 198.51.100.1 is on the connected /30. The ISP link and the VLANs are fine.`,hi:`Table kehti hai "Gateway of last resort is not set" aur koi S* line nahi hai. Router "Destination host unreachable" bolta hai kyunki 192.0.2.1 ki taraf uske paas route nahi hai. Next hop 198.51.100.1 connected /30 par hai. ISP link aur VLANs theek hain.`}},{title:{en:`Sales surfs, Voice does not`,hi:`Sales surf karta hai, Voice nahi`},ticket:{en:`NK-7104. Since the PAT change, VLAN 10 users reach the Internet but VLAN 20 users get timeouts. Routing and the ISP are fine. You check NAT on R1.`,hi:`NK-7104. PAT change ke baad VLAN 10 ke users Internet tak pahunchte hain lekin VLAN 20 ke users ko timeouts aate hain. Routing aur ISP theek hain. Aap R1 par NAT check karte ho.`},out:`PC2# ping 192.0.2.1
192.0.2.1 icmp_seq=1 timeout
192.0.2.1 icmp_seq=2 timeout

R1# show ip nat statistics
Total active translations: 1 (0 static, 1 dynamic; 1 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0.10
Hits: 10  Misses: 1
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 1`,q:{en:`What do you configure?`,hi:`Aap kya configure karoge?`},o:[{en:`ip nat outside on GigabitEthernet0/0.20`,hi:`GigabitEthernet0/0.20 par ip nat outside`},{en:`A new default route toward the ISP`,hi:`ISP ki taraf naya default route`},{en:`ip nat inside on GigabitEthernet0/0.20`,hi:`GigabitEthernet0/0.20 par ip nat inside`},{en:`A second overload statement for VLAN 10`,hi:`VLAN 10 ke liye doosra overload statement`}],a:2,w:{en:`Only GigabitEthernet0/0.10 is listed as an inside interface, so traffic entering from the VLAN 20 subinterface is routed but never translated. Adding ip nat inside there fixes it. The outside interface is already correct and the access list covers 10.10.0.0/16.`,hi:`Inside interface ke roop mein sirf GigabitEthernet0/0.10 listed hai, isliye VLAN 20 subinterface se aane wala traffic route hota hai lekin translate nahi hota. Wahan ip nat inside lagane se fix ho jata hai. Outside interface pehle se sahi hai aur access list 10.10.0.0/16 cover karti hai.`}},{title:{en:`The ACL that allowed only the web`,hi:`ACL jisne sirf web allow kiya`},ticket:{en:`NK-7105. Security applied an ACL named BLOCK to the VLAN 20 subinterface. Now VLAN 20 cannot ping anything, not even its gateway, although web browsing was supposed to keep working. You check R1.`,hi:`NK-7105. Security ne VLAN 20 subinterface par BLOCK naam ki ACL lagayi. Ab VLAN 20 kuch bhi ping nahi kar sakta, apna gateway bhi nahi, jabki web browsing chalna chahiye tha. Aap R1 check karte ho.`},out:`PC2# ping 10.10.20.1
*10.10.20.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)

R1# show ip access-lists
Extended IP access list BLOCK
    10 permit tcp 10.10.20.0 0.0.0.255 any eq www

R1# show ip interface GigabitEthernet0/0.20 | include access list
  Outgoing access list is not set
  Inbound  access list is BLOCK`,q:{en:`Why does ICMP fail, and what is the right fix?`,hi:`ICMP kyun fail hota hai, aur sahi fix kya hai?`},o:[{en:`Add permit icmp (and any other needed traffic) before the implicit deny; ACL end has an invisible deny ip any any`,hi:`Implicit deny se pehle permit icmp (aur zaroori traffic) add karo; ACL ke end mein invisible deny ip any any hota hai`},{en:`Remove the ACL from the router and add it to the switch`,hi:`ACL router se hata kar switch par lagao`},{en:`Apply the ACL outbound instead of inbound`,hi:`ACL ko inbound ki jagah outbound lagao`},{en:`Change the web port to 8080`,hi:`Web port ko 8080 karo`}],a:0,w:{en:`The list has one line, permit tcp to port 80. Everything else, including ICMP to the gateway, matches the implicit deny at the end, and the router answers with "administratively prohibited". Add the required permits, and test both allowed and blocked flows.`,hi:`List mein ek hi line hai, port 80 par permit tcp. Baaki sab, gateway ko ICMP bhi, end ke implicit deny se match hota hai, aur router "administratively prohibited" se jawab deta hai. Zaroori permits add karo, aur allowed aur blocked dono flows test karo.`}},{title:{en:`Neighbours that never say hello`,hi:`Neighbours jo hello nahi bolte`},ticket:{en:`NK-7106. After enabling OSPF on R1 toward the ISP router, there is no neighbour and no OSPF route. The link is up and R1 pings 198.51.100.1. You check R1.`,hi:`NK-7106. R1 par ISP router ki taraf OSPF enable karne ke baad na neighbour hai na OSPF route. Link up hai aur R1 198.51.100.1 ko ping karta hai. Aap R1 check karte ho.`},out:`R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1# show ip protocols
Routing Protocol is "ospf 1"
  Router ID 198.51.100.2
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Routing for Networks:
    10.10.0.0 0.0.255.255 area 0
    198.51.100.0 0.0.0.3 area 0
  Passive Interface(s):
    GigabitEthernet0/0.10
    GigabitEthernet0/0.20
    GigabitEthernet0/1
  Routing Information Sources:
    Gateway         Distance      Last Update`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`The area number is wrong on R1`,hi:`R1 par area number galat hai`},{en:`The OSPF process ID must equal the area`,hi:`OSPF process ID area ke barabar hona chahiye`},{en:`The uplink is passive, so R1 sends no Hellos on GigabitEthernet0/1`,hi:`Uplink passive hai, isliye R1 GigabitEthernet0/1 par Hello nahi bhejta`},{en:`The user VLANs should be non-passive`,hi:`User VLANs non-passive hone chahiye`}],a:2,w:{en:`GigabitEthernet0/1 appears in the Passive Interface list, and the Last Update column is empty, so no neighbour was ever heard. Passive is right for user subinterfaces but wrong on the uplink. Use no passive-interface GigabitEthernet0/1.`,hi:`GigabitEthernet0/1 Passive Interface list mein hai, aur Last Update column khaali hai, to koi neighbour kabhi suna hi nahi gaya. Passive user subinterfaces ke liye sahi hai lekin uplink par galat. no passive-interface GigabitEthernet0/1 use karo.`}},{title:{en:`Two routers, two opinions on time`,hi:`Do routers, waqt par do raay`},ticket:{en:`NK-7107. A new link between R1 and the ISP router has correct addresses and OSPF on both sides, yet no adjacency forms. Nobody is passive. You compare both ends.`,hi:`NK-7107. R1 aur ISP router ke beech naye link par addresses sahi hain aur dono taraf OSPF hai, phir bhi adjacency nahi banti. Koi passive nahi hai. Aap dono ends compare karte ho.`},out:`R1# show ip ospf interface GigabitEthernet0/1 | include Timer
  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5

R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

ISP# show ip ospf interface GigabitEthernet0/0 | include Timer
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,q:{en:`Which fix is correct?`,hi:`Kaunsa fix sahi hai?`},o:[{en:`Change the OSPF area on the ISP router`,hi:`ISP router par OSPF area badlo`},{en:`Make the timers equal: remove the custom hello on R1 (or set 10 and 40 on both)`,hi:`Timers barabar karo: R1 par custom hello hatao (ya dono par 10 aur 40 set karo)`},{en:`Replace the cable`,hi:`Cable badlo`},{en:`Set the router ID manually to 1.1.1.1 on both`,hi:`Dono par router ID manually 1.1.1.1 set karo`}],a:1,w:{en:`R1 uses Hello 5 and Dead 20 while the ISP uses 10 and 40. Hellos with different intervals are ignored, so no neighbour forms. Fix it by removing the custom timer on R1 or setting the same values on both ends. Duplicate router IDs would be a different fault and are never a fix.`,hi:`R1 Hello 5 aur Dead 20 use karta hai jabki ISP 10 aur 40. Alag intervals wale Hellos ignore ho jaate hain, isliye neighbour nahi banta. R1 par custom timer hatao ya dono ends par same values set karo. Duplicate router IDs alag fault hoti hai aur fix kabhi nahi.`}},{title:{en:`Uplink down after the change window`,hi:`Change window ke baad uplink down`},ticket:{en:`NK-7108. At 22:40 an engineer finished a change on R1 and left. At 22:55 the whole branch lost Internet. Monitoring shows R1 reachable on its LAN side only. You log in and look at the interfaces.`,hi:`NK-7108. Raat 22:40 par ek engineer R1 par change khatam karke chala gaya. 22:55 par poori branch ka Internet gaya. Monitoring R1 ko sirf LAN side se reachable dikhati hai. Aap login karke interfaces dekhte ho.`},out:`R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up
GigabitEthernet0/1     198.51.100.2    YES manual administratively down down`,q:{en:`What is the immediate fix, and which process step would have limited the damage?`,hi:`Turant fix kya hai, aur kaunsa process step damage ko kam karta?`},o:[{en:`Replace the uplink cable; nothing in the process would have helped`,hi:`Uplink cable badlo; process mein kuch madad nahi karta`},{en:`Reload R1; a change ticket is not needed for an outage`,hi:`R1 reload karo; outage ke liye change ticket zaroori nahi`},{en:`Change the IP address of Gi0/1 and skip documentation`,hi:`Gi0/1 ka IP badlo aur documentation skip karo`},{en:`no shutdown on Gi0/1; the post-change verification ladder (rung 1) would have caught it before the engineer left`,hi:`Gi0/1 par no shutdown; change ke baad ki verification ladder (rung 1) engineer ke jaane se pehle ise pakad leti`}],a:3,w:{en:`Administratively down means someone typed shutdown on the uplink. The fix is no shutdown, then a ping to the ISP, then a note in the change log. Running the ladder after the change (interface table first) takes one command and would have shown the fault at 22:40, with the engineer still on site.`,hi:`Administratively down matlab kisi ne uplink par shutdown type kiya. Fix hai no shutdown, phir ISP ko ping, phir change log mein note. Change ke baad ladder chalana (pehle interface table) ek command ka kaam hai aur 22:40 par hi fault dikha deta, jab engineer site par tha.`}}];export{e as default};