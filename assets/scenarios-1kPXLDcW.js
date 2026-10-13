var e=[{title:{en:`ARP for the gateway, and silence`,hi:`Gateway ke liye ARP, aur khamoshi`},ticket:{en:`Ticket from Shreya Logistics: "A newly patched desk PC (10.5.5.23/24, gateway 10.5.5.1) cannot reach anything, not even the gateway. Other PCs on the same switch are fine." You capture on the PC's switch port and check the switch.`,hi:`Shreya Logistics ka ticket: "Naya patch kiya desk PC (10.5.5.23/24, gateway 10.5.5.1) kisi tak nahi pahunchta, gateway tak bhi nahi. Usi switch ke baaki PCs theek hain." Aap PC ke switch port par capture karte ho aur switch check karte ho.`},out:`Capture on SW2 Gi1/0/7 (desk PC), display filter: arp
No.  Time      Source             Destination  Protocol Info
 1   0.000000  52:54:00:7a:10:23  Broadcast    ARP      Who has 10.5.5.1? Tell 10.5.5.23
 2   1.001000  52:54:00:7a:10:23  Broadcast    ARP      Who has 10.5.5.1? Tell 10.5.5.23
 3   2.002000  52:54:00:7a:10:23  Broadcast    ARP      Who has 10.5.5.1? Tell 10.5.5.23
 4   3.003000  52:54:00:7a:10:23  Broadcast    ARP      Who has 10.5.5.1? Tell 10.5.5.23

SW2#show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi1/0/1, Gi1/0/2
10   USERS                            active    Gi1/0/3, Gi1/0/4, Gi1/0/5, Gi1/0/6
20   PRINTERS                         active    Gi1/0/7, Gi1/0/8`,q:{en:`What is the most likely cause?`,hi:`Sabse likely wajah kya hai?`},o:[{en:`An ACL on the gateway is blocking ICMP from the PC`,hi:`Gateway par ACL PC ka ICMP block kar raha hai`},{en:`Gi1/0/7 is in VLAN 20, so the ARP broadcast never reaches the VLAN 10 gateway; move the port to VLAN 10`,hi:`Gi1/0/7 VLAN 20 mein hai, isliye ARP broadcast VLAN 10 gateway tak kabhi nahi pahunchta; port ko VLAN 10 mein daalo`},{en:`The PC has the wrong subnet mask`,hi:`PC ka subnet mask galat hai`},{en:`Another device has the same IP as the PC`,hi:`Kisi aur device ka IP PC jaisa hi hai`}],a:1,w:{en:`The PC correctly ARPs for its gateway, but no reply ever comes. The port sits in VLAN 20 (PRINTERS) while the users and their gateway are in VLAN 10, so the broadcast is flooded only inside VLAN 20. ARP is not IP, so an IP ACL cannot stop it; the mask is fine because the PC ARPs for the gateway, not for remote hosts; a duplicate IP would produce replies, not silence.`,hi:`PC sahi tarah apne gateway ke liye ARP karta hai, lekin reply kabhi nahi aata. Port VLAN 20 (PRINTERS) mein hai jabki users aur unka gateway VLAN 10 mein hain, isliye broadcast sirf VLAN 20 ke andar flood hota hai. ARP IP nahi hai, isliye IP ACL use nahi rok sakta; mask theek hai kyunki PC gateway ke liye ARP karta hai, remote hosts ke liye nahi; duplicate IP replies paida karta, khamoshi nahi.`}},{title:{en:`Refused by the edge router`,hi:`Edge router ne mana kiya`},ticket:{en:`Ticket from the NOC: "After the edge router EDGE1 was replaced, we cannot SSH to it from the NOC PC (10.20.0.50). Ping to 10.20.0.1 works. The config was pasted from the old router." You capture on the NOC PC's link and check EDGE1 from the console.`,hi:`NOC ka ticket: "Edge router EDGE1 badalne ke baad hum NOC PC (10.20.0.50) se us par SSH nahi kar pa rahe. 10.20.0.1 ka ping chalta hai. Config purane router se paste ki gayi thi." Aap NOC PC ke link par capture karte ho aur console se EDGE1 check karte ho.`},out:`Capture on NOC-PC link, display filter: tcp
No.  Time      Source       Destination  Protocol Info
 1   0.000000  10.20.0.50   10.20.0.1    TCP      50811 → 22 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM
 2   0.000900  10.20.0.1    10.20.0.50   TCP      22 → 50811 [RST, ACK] Seq=0 Ack=1 Win=0 Len=0

EDGE1#show ip ssh
SSH Disabled - version 1.99
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).

EDGE1#show running-config | section line vty
line vty 0 4
 login local
 transport input ssh`,q:{en:`What fixes the problem?`,hi:`Problem kya fix karega?`},o:[{en:`Permit TCP 22 in the ACLs between the NOC and EDGE1`,hi:`NOC aur EDGE1 ke beech ACLs mein TCP 22 permit karo`},{en:`Change the vty lines to transport input telnet ssh`,hi:`Vty lines ko transport input telnet ssh karo`},{en:`Add a route on the NOC PC toward 10.20.0.1`,hi:`NOC PC par 10.20.0.1 ki taraf route jodo`},{en:`Generate RSA keys on EDGE1 (crypto key generate rsa modulus 2048) with the hostname and domain name set`,hi:`Hostname aur domain name set karke EDGE1 par RSA keys generate karo (crypto key generate rsa modulus 2048)`}],a:3,w:{en:`The RST comes from 10.20.0.1 port 22, so the SYN reached the router: path and ACLs are fine, and the ping proves routing. The vty lines already accept SSH. show ip ssh says SSH is disabled because no RSA keys exist: pasting a config does not copy keys. Generating the keys enables SSH version 2. Adding Telnet would only make it less secure.`,hi:`RST 10.20.0.1 port 22 se aata hai, isliye SYN router tak pahuncha: path aur ACLs theek hain, aur ping routing prove karta hai. Vty lines pehle se SSH accept karti hain. show ip ssh kehta hai SSH disabled hai kyunki RSA keys nahi hain: config paste karne se keys copy nahi hoti. Keys generate karne se SSH version 2 enable hota hai. Telnet jodna sirf security kam karta.`}},{title:{en:`HTTPS blocked, and the router says so`,hi:`HTTPS block, aur router batata hai`},ticket:{en:`Ticket from Kavya Pharma: "Since this morning branch users cannot open the ordering portal 198.51.100.10 over HTTPS. The web team says the server is healthy." You capture on a user's port and look at R1, the branch gateway (10.1.1.1).`,hi:`Kavya Pharma ka ticket: "Aaj subah se branch users ordering portal 198.51.100.10 HTTPS par nahi khol pa rahe. Web team kehti hai server healthy hai." Aap ek user ke port par capture karte ho aur branch gateway R1 (10.1.1.1) dekhte ho.`},out:`Capture on user port, display filter: ip.addr == 198.51.100.10 || icmp
No.  Time      Source        Destination     Protocol Info
 1   0.000000  10.1.1.45     198.51.100.10   TCP      52301 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
 2   0.001200  10.1.1.1      10.1.1.45       ICMP     Destination unreachable (Communication administratively prohibited)
 3   1.004000  10.1.1.45     198.51.100.10   TCP      [TCP Retransmission] 52301 → 443 [SYN] Seq=0 Win=64240 Len=0

R1#show access-lists WEB-OUT
Extended IP access list WEB-OUT
    10 permit tcp 10.1.1.0 0.0.0.255 host 198.51.100.10 eq www (1520 matches)
    20 deny tcp any host 198.51.100.10 eq 443 (37 matches)
    30 permit ip any any (98211 matches)`,q:{en:`What is the cause and fix?`,hi:`Wajah aur fix kya hai?`},o:[{en:`Line 20 of WEB-OUT on R1 denies HTTPS; add a permit for the branch subnet to port 443 before it (or remove the deny)`,hi:`R1 par WEB-OUT ki line 20 HTTPS deny karti hai; usse pehle branch subnet ke liye port 443 ka permit jodo (ya deny hatao)`},{en:`The web server is not listening on 443`,hi:`Web server 443 par listen nahi kar raha`},{en:`R1 has no route to 198.51.100.10`,hi:`R1 ke paas 198.51.100.10 ka route nahi hai`},{en:`The user PC firewall blocks outgoing HTTPS`,hi:`User PC ka firewall outgoing HTTPS block karta hai`}],a:0,w:{en:`ICMP type 3 code 13 (administratively prohibited) comes from 10.1.1.1, R1 itself, and the deny line's counter is increasing. A server that was not listening would answer with RST, a missing route would give network unreachable (code 0), and a local firewall would stop the SYN before it left the PC.`,hi:`ICMP type 3 code 13 (administratively prohibited) 10.1.1.1 se, yaani khud R1 se aata hai, aur deny line ka counter badh raha hai. Listen na karne wala server RST se jawab deta, missing route network unreachable (code 0) deta, aur local firewall SYN ko PC se nikalne se pehle hi rok deta.`}},{title:{en:`Hellos that never become neighbours`,hi:`Hellos jo kabhi neighbours nahi bante`},ticket:{en:`Ticket from the WAN team: "New link R4-R5 is up and pings across it work, but OSPF never forms. Timers were checked and are default." You capture on the link.`,hi:`WAN team ka ticket: "Naya link R4-R5 up hai aur uske paar ping chalta hai, lekin OSPF kabhi nahi banta. Timers check kiye, default hain." Aap link par capture karte ho.`},out:`Capture on R4 Gi0/0 ↔ R5 Gi0/0, display filter: ospf
No.  Time       Source     Destination  Protocol Info
 1   0.000000   10.0.45.1  224.0.0.5    OSPF     Hello Packet
 2   2.310000   10.0.45.2  224.0.0.5    OSPF     Hello Packet
 3   10.000000  10.0.45.1  224.0.0.5    OSPF     Hello Packet

Frame 1 (from R4): Source OSPF Router: 4.4.4.4   Area ID: 0.0.0.0 (Backbone)   Auth Type: Null (0)
                   Network Mask: 255.255.255.252   Hello Interval [sec]: 10   Router Dead Interval [sec]: 40
                   Active Neighbor: (none)
Frame 2 (from R5): Source OSPF Router: 5.5.5.5   Area ID: 0.0.0.0 (Backbone)   Auth Type: Cryptographic (2)
                   Network Mask: 255.255.255.252   Hello Interval [sec]: 10   Router Dead Interval [sec]: 40
                   Active Neighbor: (none)`,q:{en:`Why is there no adjacency?`,hi:`Adjacency kyun nahi hai?`},o:[{en:`The hello and dead intervals differ`,hi:`Hello aur dead intervals alag hain`},{en:`The routers are in different areas`,hi:`Routers alag areas mein hain`},{en:`Authentication is configured on R5 only; configure the same authentication and key on R4`,hi:`Authentication sirf R5 par configured hai; R4 par same authentication aur key configure karo`},{en:`The router IDs must match`,hi:`Router IDs match hone chahiye`}],a:2,w:{en:`Both routers send Hellos and neither lists the other: a parameter mismatch. Area, mask and timers are identical; only Auth Type differs, Null on R4 and Cryptographic on R5. Router IDs must be different, not equal. Matching the authentication type and key on R4 brings the neighbours up.`,hi:`Dono routers Hellos bhejte hain aur koi dusre ko list nahi karta: parameter mismatch. Area, mask aur timers same hain; sirf Auth Type alag hai, R4 par Null aur R5 par Cryptographic. Router IDs alag hone chahiye, same nahi. R4 par authentication type aur key match karne se neighbours up ho jaate hain.`}},{title:{en:`A new VLAN with no addresses`,hi:`Naya VLAN jismein addresses nahi`},ticket:{en:`Ticket from Arjun Motors: "We created VLAN 30 for the new sales team yesterday. Their laptops show 169.254 addresses. VLAN 20 users get addresses from the same DHCP server 10.1.1.5 without problems." You capture on a sales port and check the distribution switch DSW1.`,hi:`Arjun Motors ka ticket: "Humne kal nayi sales team ke liye VLAN 30 banaya. Unke laptops 169.254 addresses dikhate hain. VLAN 20 ke users ko usi DHCP server 10.1.1.5 se bina problem addresses milte hain." Aap sales port par capture karte ho aur distribution switch DSW1 check karte ho.`},out:`Capture on SW3 Gi1/0/14 (sales laptop), display filter: dhcp
No.  Time       Source   Destination      Protocol Info
 1   0.000000   0.0.0.0  255.255.255.255  DHCP     DHCP Discover - Transaction ID 0x5d1e22a0
 2   4.012000   0.0.0.0  255.255.255.255  DHCP     DHCP Discover - Transaction ID 0x5d1e22a0
 3   12.030000  0.0.0.0  255.255.255.255  DHCP     DHCP Discover - Transaction ID 0x5d1e22a0

DSW1#show running-config interface Vlan30
Building configuration...

Current configuration : 61 bytes
!
interface Vlan30
 ip address 10.30.0.1 255.255.255.0
end

DSW1#show running-config interface Vlan20 | include helper
 ip helper-address 10.1.1.5`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Configure ip helper-address 10.1.1.5 on the DHCP server's interface`,hi:`DHCP server ke interface par ip helper-address 10.1.1.5 configure karo`},{en:`Give the laptops static addresses in 169.254.0.0/16`,hi:`Laptops ko 169.254.0.0/16 mein static addresses do`},{en:`Add ip helper-address 10.1.1.5 under interface Vlan30 on DSW1 (and make sure the server has a scope for 10.30.0.0/24)`,hi:`DSW1 par interface Vlan30 ke neeche ip helper-address 10.1.1.5 jodo (aur pakka karo ki server par 10.30.0.0/24 ka scope hai)`},{en:`Change the DHCP client port on the laptops to 67`,hi:`Laptops par DHCP client port 67 karo`}],a:2,w:{en:`Discovers repeat with no Offer, and the VLAN 30 SVI, unlike VLAN 20, has no helper, so the broadcasts never leave the VLAN. The helper goes on the client-facing interface, where it converts the Discover into a unicast to 10.1.1.5 with giaddr 10.30.0.1. Clients always use port 68; 169.254 is only the fallback when DHCP fails.`,hi:`Discovers bina Offer ke repeat hote hain, aur VLAN 30 SVI par, VLAN 20 ke ulat, koi helper nahi hai, isliye broadcasts kabhi VLAN se bahar nahi jaate. Helper client-facing interface par lagta hai, jahan woh Discover ko giaddr 10.30.0.1 ke saath 10.1.1.5 ke liye unicast mein badalta hai. Clients hamesha port 68 use karte hain; 169.254 sirf DHCP fail hone par fallback hai.`}},{title:{en:`The traceroute that bounces`,hi:`Woh traceroute jo uchhalta hai`},ticket:{en:`Ticket from the network team: "After yesterday's change, R1 cannot reach the partner network 203.0.113.0/24. A capture on the R1-R2 link shows many ICMP Time-to-live exceeded messages." You run a traceroute and check both routers.`,hi:`Network team ka ticket: "Kal ke change ke baad R1 partner network 203.0.113.0/24 tak nahi pahunchta. R1-R2 link par capture mein bahut saare ICMP Time-to-live exceeded messages dikhte hain." Aap traceroute chalate ho aur dono routers check karte ho.`},out:`R1#traceroute 203.0.113.50
Type escape sequence to abort.
Tracing the route to 203.0.113.50
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
  2 10.0.12.1 1 msec 1 msec 1 msec
  3 10.0.12.2 2 msec 1 msec 1 msec
  4 10.0.12.1 2 msec 2 msec 1 msec

R1#show ip route 203.0.113.50
Routing entry for 203.0.113.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
      Route metric is 0, traffic share count is 1

R2#show ip route 203.0.113.50
Routing entry for 0.0.0.0/0, supernet
  Known via "static", distance 1, metric 0, candidate default path
  Routing Descriptor Blocks:
  * 10.0.12.1
      Route metric is 0, traffic share count is 1`,q:{en:`What is happening?`,hi:`Kya ho raha hai?`},o:[{en:`A routing loop: R1 sends 203.0.113.0/24 to R2, whose default route points back to R1; give R2 a correct route toward the partner`,hi:`Routing loop: R1 203.0.113.0/24 ko R2 ko bhejta hai, jiska default route wapas R1 ki taraf hai; R2 ko partner ki taraf sahi route do`},{en:`The partner firewall blocks traceroute`,hi:`Partner firewall traceroute block karta hai`},{en:`An ACL on R2 denies the traffic`,hi:`R2 par ACL traffic deny karta hai`},{en:`R1's TTL is set too low`,hi:`R1 ka TTL bahut kam set hai`}],a:0,w:{en:`The hops alternate 10.0.12.2 and 10.0.12.1 and the capture is full of type 11 messages: packets circle until TTL expires. R1's static route points to R2, and R2 has no specific route, so its default sends everything back to R1. A firewall would give asterisks, and an ACL would give code 13 unreachables, not a bouncing path.`,hi:`Hops 10.0.12.2 aur 10.0.12.1 alternate karte hain aur capture type 11 messages se bhara hai: packets TTL khatam hone tak ghoomte hain. R1 ka static route R2 ki taraf hai, aur R2 ke paas specific route nahi hai, isliye uska default sab kuch wapas R1 ko bhejta hai. Firewall asterisks deta, aur ACL code 13 unreachables deta, uchhalta path nahi.`}},{title:{en:`The payroll portal that moved`,hi:`Payroll portal jo shift ho gaya`},ticket:{en:`Ticket from HR: "Since Monday nobody can open payroll.corp.example; the browser spins and times out. The server team says the new server is running." You capture on an HR user's port.`,hi:`HR ka ticket: "Monday se koi payroll.corp.example nahi khol pa raha; browser ghoomta hai aur timeout hota hai. Server team kehti hai naya server chal raha hai." Aap ek HR user ke port par capture karte ho.`},out:`Capture on SW5 Gi1/0/8 (HR user), display filter: dns || tcp.port == 443
No.  Time      Source        Destination   Protocol Info
 1   0.000000  10.60.1.25    10.1.1.53     DNS      Standard query 0x2f41 A payroll.corp.example
 2   0.003100  10.1.1.53     10.60.1.25    DNS      Standard query response 0x2f41 A payroll.corp.example A 198.51.100.7
 3   0.004000  10.60.1.25    198.51.100.7  TCP      52114 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
 4   1.005000  10.60.1.25    198.51.100.7  TCP      [TCP Retransmission] 52114 → 443 [SYN] Seq=0 Win=64240 Len=0
 5   3.009000  10.60.1.25    198.51.100.7  TCP      [TCP Retransmission] 52114 → 443 [SYN] Seq=0 Win=64240 Len=0

Change CHG-2291 (Saturday 22:00): payroll application migrated from 198.51.100.7 to 198.51.100.40; old server powered off.`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The DNS server is unreachable`,hi:`DNS server unreachable hai`},{en:`A firewall is dropping HTTPS to the new server`,hi:`Firewall naye server ka HTTPS drop kar raha hai`},{en:`The new server refuses port 443`,hi:`Naya server port 443 refuse karta hai`},{en:`The DNS A record still points to the old, powered-off server 198.51.100.7; update it to 198.51.100.40`,hi:`DNS A record ab bhi purane, band server 198.51.100.7 ki taraf hai; ise 198.51.100.40 par update karo`}],a:3,w:{en:`DNS works (query and response in 3 ms) but returns the old address. The SYNs go to 198.51.100.7, which is switched off, so they time out. No traffic ever goes to .40, so neither a firewall nor the new server is involved yet; a refusing server would send RST. Fix the record (and flush client caches or wait for the TTL).`,hi:`DNS chalta hai (query aur response 3 ms mein) lekin purana address lautata hai. SYNs 198.51.100.7 ko jaate hain, jo band hai, isliye timeout hote hain. .40 ko kabhi koi traffic nahi jaata, isliye na firewall na naya server abhi shamil hai; refuse karne wala server RST bhejta. Record theek karo (aur client caches flush karo ya TTL ka intezaar karo).`}}];export{e as default};