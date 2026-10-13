var e=[{title:{en:`The interface that passes nothing`,hi:`Woh interface jo kuch pass nahi karta`},ticket:{en:`CHG-4410 added a lab network on GigabitEthernet0/3 of NK-ASA. The interface is up/up and has 10.0.9.1/24, but hosts in 10.0.9.0/24 cannot even reach their gateway, and a route pointing to the lab fails to install.`,hi:`CHG-4410 ne NK-ASA ke GigabitEthernet0/3 par lab network joda. Interface up/up hai aur uska 10.0.9.1/24 hai, lekin 10.0.9.0/24 ke hosts apne gateway tak bhi nahi pahunch pa rahe, aur lab ki taraf ka route install nahi hota.`},out:`NK-ASA# show running-config interface GigabitEthernet0/3
!
interface GigabitEthernet0/3
 no nameif
 no security-level
 ip address 10.0.9.1 255.255.255.0
NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
GigabitEthernet0/2       dmz                       50`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A no shutdown on the interface`,hi:`Interface par no shutdown`},{en:`An interface ACL permitting the lab subnet`,hi:`Lab subnet permit karne wala interface ACL`},{en:`A nameif (and a security level) on GigabitEthernet0/3`,hi:`GigabitEthernet0/3 par nameif (aur security level)`},{en:`A PAT rule for 10.0.9.0/24`,hi:`10.0.9.0/24 ke liye PAT rule`}],a:2,w:{en:`The ticket says the interface is already up/up, so shutdown is not the issue. Without a name the interface is not part of any ASA policy and passes no traffic; routes, NAT and ACLs all reference names. Add nameif lab with a suitable security-level.`,hi:`Ticket kehta hai interface pehle se up/up hai, isliye shutdown issue nahi. Naam ke bina interface kisi ASA policy ka hissa nahi aur koi traffic pass nahi karta; routes, NAT aur ACLs sab naam refer karte hain. Suitable security-level ke saath nameif lab jodo.`}},{title:{en:`Web works, ping does not`,hi:`Web chalta hai, ping nahi`},ticket:{en:`The day after the new ASA went live, users browse normally, but the helpdesk test "ping 8.8.8.8" fails from every PC in 10.0.1.0/24.`,hi:`Naya ASA live hone ke agle din users normally browse kar rahe hain, lekin 10.0.1.0/24 ke har PC se helpdesk test "ping 8.8.8.8" fail hota hai.`},out:`NK-ASA# show logging | include 106014
Sep 29 2026 10:02:11: %ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)
Sep 29 2026 10:02:12: %ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)
NK-ASA# show running-config policy-map global_policy
!
policy-map global_policy
 class inspection_default
  inspect dns preset_dns_map
  inspect ftp
  inspect sip
!`,q:{en:`What is the cleanest fix?`,hi:`Sabse saaf fix kya hai?`},o:[{en:`Permit icmp any any on the outside interface ACL`,hi:`Outside interface ACL par icmp any any permit karo`},{en:`Add inspect icmp under class inspection_default in global_policy`,hi:`global_policy mein class inspection_default ke neeche inspect icmp jodo`},{en:`Raise the outside interface to security level 100`,hi:`Outside interface ko security level 100 par le jao`},{en:`Remove the PAT rule so the PCs use their real addresses`,hi:`PAT rule hata do taaki PCs apne real addresses use karein`}],a:1,w:{en:`Type 0 is an echo reply. ICMP is not in the default inspection list, so the reply is treated as new inbound traffic from level 0 and denied. With inspect icmp, the ASA tracks each ping and admits only the matching reply; permit icmp any any would open far more.`,hi:`Type 0 echo reply hai. ICMP default inspection list mein nahi, isliye reply ko level 0 se naya inbound traffic maana jaata hai aur deny hota hai. inspect icmp ke saath ASA har ping track karta hai aur sirf matching reply andar aane deta hai; permit icmp any any kahin zyada khol dega.`}},{title:{en:`INC-7702, part 1: the DMZ flow is denied`,hi:`INC-7702, part 1: DMZ flow deny hota hai`},ticket:{en:`The web server WEB (10.0.2.10) was moved into the DMZ and has not been able to download updates from 8.8.8.8 since. Inside users are fine. No ACL is applied to any interface.`,hi:`Web server WEB (10.0.2.10) DMZ mein shift hua aur tab se 8.8.8.8 se updates download nahi kar pa raha. Inside users theek hain. Kisi interface par koi ACL applied nahi hai.`},out:`NK-ASA# packet-tracer input dmz tcp 10.0.2.10 40000 8.8.8.8 80
Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
found next-hop 203.0.113.1 using egress ifc  outside

Phase: 2
Type: ACCESS-LIST
Subtype:
Result: DROP
Config:
Implicit Rule

Result:
input-interface: dmz
output-interface: outside
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule

NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
GigabitEthernet0/2       dmz                        0`,q:{en:`What is the right first fix?`,hi:`Sahi pehla fix kya hai?`},o:[{en:`same-security-traffic permit inter-interface`,hi:`same-security-traffic permit inter-interface`},{en:`Add a default route through the dmz interface`,hi:`dmz interface ke through default route jodo`},{en:`Apply an ACL permitting ip any any inbound on outside`,hi:`outside par inbound ip any any permit karne wala ACL lagao`},{en:`Set security-level 50 on GigabitEthernet0/2`,hi:`GigabitEthernet0/2 par security-level 50 set karo`}],a:3,w:{en:`With no ACL, "Implicit Rule" means the security levels decided: dmz 0 to outside 0 is equal and denied. A DMZ belongs between inside and outside. same-security-traffic would also let the internet start connections into the DMZ, and an outside ACL does not affect traffic entering the dmz.`,hi:`Koi ACL na ho to "Implicit Rule" ka matlab security levels ne decide kiya: dmz 0 se outside 0 barabar hai aur denied. DMZ inside aur outside ke beech hona chahiye. same-security-traffic internet ko bhi DMZ mein connections shuru karne dega, aur outside ACL dmz mein aane wale traffic par asar nahi karta.`}},{title:{en:`INC-7702, part 2: allowed, but still no answer`,hi:`INC-7702, part 2: allowed, phir bhi jawab nahi`},ticket:{en:`After the DMZ was set to level 50, packet-tracer shows Action: allow for WEB to 8.8.8.8, but WEB still cannot download anything.`,hi:`DMZ ko level 50 karne ke baad packet-tracer WEB se 8.8.8.8 ke liye Action: allow dikhata hai, lekin WEB ab bhi kuch download nahi kar pa raha.`},out:`NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 1532, untranslate_hits = 41
NK-ASA# show xlate | include 10.0.2.10
NK-ASA# show conn address 10.0.2.10
1 in use, 57 most used
TCP outside  8.8.8.8:80 dmz  10.0.2.10:40000, idle 0:00:07, bytes 0, flags saA`,q:{en:`Why does WEB get no reply?`,hi:`WEB ko reply kyun nahi milta?`},o:[{en:`No NAT rule covers 10.0.2.0/24, so packets leave with a private source the ISP cannot route back`,hi:`Koi NAT rule 10.0.2.0/24 cover nahi karta, isliye packets private source ke saath nikalte hain jise ISP wapas route nahi kar sakta`},{en:`HTTP inspection is missing from the global policy`,hi:`Global policy mein HTTP inspection missing hai`},{en:`The connection table is full`,hi:`Connection table full hai`},{en:`The security level must be 100 for downloads to work`,hi:`Downloads ke liye security level 100 hona chahiye`}],a:0,w:{en:`show nat has only INSIDE-NET, there is no xlate for 10.0.2.10, and the connection sits half-open (flags saA, 0 bytes): the SYN left but no SYN-ACK came back. Add object network DMZ-NET, subnet 10.0.2.0 255.255.255.0, nat (dmz,outside) dynamic interface.`,hi:`show nat mein sirf INSIDE-NET hai, 10.0.2.10 ka koi xlate nahi, aur connection half-open hai (flags saA, 0 bytes): SYN gaya lekin SYN-ACK wapas nahi aaya. object network DMZ-NET, subnet 10.0.2.0 255.255.255.0, nat (dmz,outside) dynamic interface jodo.`}},{title:{en:`SSH connects, every login fails`,hi:`SSH connect hota hai, har login fail`},ticket:{en:`After an image upgrade on NK-ASA, the admin at 10.0.1.50 gets a password prompt over SSH, but the correct password is always rejected. Console login works.`,hi:`NK-ASA par image upgrade ke baad 10.0.1.50 wale admin ko SSH par password prompt milta hai, lekin sahi password hamesha reject hota hai. Console login chalta hai.`},out:`NK-ASA# show running-config ssh
ssh stricthostkeycheck
ssh 10.0.1.50 255.255.255.255 inside
ssh timeout 10
NK-ASA# show running-config aaa
NK-ASA# show running-config username
username admin password ***** pbkdf2 privilege 15
NK-ASA# show logging | include 605004
Sep 30 2026 09:14:02: %ASA-6-605004: Login denied from 10.0.1.50/53412 to inside:10.0.1.1/ssh for user "admin"`,q:{en:`What should you add?`,hi:`Kya jodna chahiye?`},o:[{en:`ssh 0.0.0.0 0.0.0.0 inside`,hi:`ssh 0.0.0.0 0.0.0.0 inside`},{en:`crypto key generate rsa modulus 2048`,hi:`crypto key generate rsa modulus 2048`},{en:`aaa authentication ssh console LOCAL`,hi:`aaa authentication ssh console LOCAL`},{en:`An inside ACL permitting TCP 22 to 10.0.1.1`,hi:`10.0.1.1 ki taraf TCP 22 permit karne wala inside ACL`}],a:2,w:{en:`The prompt proves the allow-list and RSA key work. show running-config aaa is empty, so SSH has no authentication method; current releases require aaa authentication ssh console. Widening the allow-list or adding an ACL changes nothing, since to-the-box access is not controlled by interface ACLs.`,hi:`Prompt saabit karta hai ki allow-list aur RSA key chal rahe hain. show running-config aaa khaali hai, isliye SSH ka koi authentication method nahi; current releases mein aaa authentication ssh console zaroori hai. Allow-list badhana ya ACL jodna kuch nahi badlega, kyunki to-the-box access interface ACLs se control nahi hota.`}},{title:{en:`The clean-up that broke the internet`,hi:`Woh clean-up jisne internet tod diya`},ticket:{en:`A junior engineer "tidied up unused lines" on NK-ASA. Minutes later every inside user lost internet access; PC1 can still ping 10.0.1.1.`,hi:`Ek junior engineer ne NK-ASA par "unused lines saaf ki". Kuch minute baad har inside user ka internet chala gaya; PC1 ab bhi 10.0.1.1 ping kar sakta hai.`},out:`NK-ASA# packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 443
Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: DROP
Config:
Additional Information:

Result:
input-interface: inside
input-status: up
input-line-status: up
Action: drop
Drop-reason: (no-route) No route to host

NK-ASA# show route | include last resort
Gateway of last resort is not set`,q:{en:`Which command restores service?`,hi:`Kaunsa command service wapas laata hai?`},o:[{en:`ip route 0.0.0.0 0.0.0.0 203.0.113.1`,hi:`ip route 0.0.0.0 0.0.0.0 203.0.113.1`},{en:`route outside 0.0.0.0 0.0.0.0 203.0.113.1`,hi:`route outside 0.0.0.0 0.0.0.0 203.0.113.1`},{en:`route inside 0.0.0.0 0.0.0.0 10.0.1.1`,hi:`route inside 0.0.0.0 0.0.0.0 10.0.1.1`},{en:`nat (inside,outside) dynamic interface`,hi:`nat (inside,outside) dynamic interface`}],a:1,w:{en:`The drop is in ROUTE-LOOKUP, before policy or NAT, and there is no gateway of last resort: the default route was deleted. ASA routes name the egress interface; ip route is IOS syntax and is rejected, and a route via inside points the wrong way.`,hi:`Drop ROUTE-LOOKUP mein hai, policy ya NAT se pehle, aur gateway of last resort nahi hai: default route delete ho gaya. ASA routes egress interface ka naam lete hain; ip route IOS syntax hai aur reject hota hai, aur inside ke through route galat taraf point karta hai.`}},{title:{en:`PAT configured, zero hits`,hi:`PAT configured, zero hits`},ticket:{en:`On a second site, the engineer configured PAT for 10.0.1.0/24, but users cannot browse and the NAT counters never move.`,hi:`Doosri site par engineer ne 10.0.1.0/24 ke liye PAT configure kiya, lekin users browse nahi kar pa rahe aur NAT counters kabhi nahi badhte.`},out:`NK-ASA2# show running-config object network INSIDE-NET
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
NK-ASA2# show nat
Auto NAT Policies (Section 2)
1 (outside) to (inside) source dynamic INSIDE-NET interface
    translate_hits = 0, untranslate_hits = 0`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`PAT needs a separate pool object; interface PAT is not supported`,hi:`PAT ko alag pool object chahiye; interface PAT supported nahi`},{en:`The object must use a host, not a subnet`,hi:`Object mein host hona chahiye, subnet nahi`},{en:`NAT only works after inspect icmp is enabled`,hi:`NAT sirf inspect icmp enable hone ke baad chalta hai`},{en:`The interfaces are reversed; it must be nat (inside,outside) dynamic interface`,hi:`Interfaces ulte hain; yeh nat (inside,outside) dynamic interface hona chahiye`}],a:3,w:{en:`In object NAT the real interface comes first and the mapped interface second. The object holds inside addresses, so the rule must read (inside,outside). As written it only matches traffic from 10.0.1.0/24 arriving on outside, which never happens, hence zero hits.`,hi:`Object NAT mein real interface pehle aata hai aur mapped interface baad mein. Object mein inside addresses hain, isliye rule (inside,outside) hona chahiye. Jaisa likha hai, yeh sirf outside par aane wale 10.0.1.0/24 traffic ko match karta hai, jo kabhi hota nahi, isliye zero hits.`}},{title:{en:`The quick fix that opened the DMZ`,hi:`Woh quick fix jisne DMZ khol diya`},ticket:{en:`During an outage, an engineer made the DMZ reach the internet by adding one global command instead of changing the DMZ level. An audit now flags the change.`,hi:`Outage ke dauran ek engineer ne DMZ level badalne ki jagah ek global command jodkar DMZ ko internet tak pahuncha diya. Ab audit ne change flag kiya hai.`},out:`NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
GigabitEthernet0/2       dmz                        0
NK-ASA# show running-config same-security-traffic
same-security-traffic permit inter-interface`,q:{en:`Why is the audit right?`,hi:`Audit sahi kyun hai?`},o:[{en:`Hosts on outside can now start connections to the DMZ without any ACL`,hi:`Outside ke hosts ab bina kisi ACL ke DMZ se connections shuru kar sakte hain`},{en:`The command disables stateful inspection on all interfaces`,hi:`Yeh command sab interfaces par stateful inspection band kar deta hai`},{en:`The command lets the DMZ start connections to the inside`,hi:`Yeh command DMZ ko inside se connections shuru karne deta hai`},{en:`The command turns off NAT for equal-level interfaces`,hi:`Yeh command barabar level wale interfaces ke liye NAT band kar deta hai`}],a:0,w:{en:`same-security-traffic permit inter-interface allows both directions between equal-level interfaces, so outside (0) to dmz (0) is now permitted by default. dmz to inside is still lower to higher and denied, and inspection and NAT are unaffected. Put the DMZ back at 50 and remove the command.`,hi:`same-security-traffic permit inter-interface barabar level wale interfaces ke beech dono directions allow karta hai, isliye outside (0) se dmz (0) ab default se permitted hai. dmz se inside ab bhi neeche se ooncha hai aur denied, aur inspection aur NAT par asar nahi. DMZ ko wapas 50 par karo aur command hatao.`}}];export{e as default};