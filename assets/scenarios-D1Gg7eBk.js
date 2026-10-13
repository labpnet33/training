var e=[{title:{en:`Branch lost internet after a router swap`,hi:`Router swap ke baad branch ka internet gaya`},ticket:{en:`Branch BR: "We replaced the router last night and restored the NAT config from a text file. Nobody on either LAN can browse." Uplink is g0/1 (203.0.113.18/30).`,hi:`Branch BR: "Kal raat router replace kiya aur text file se NAT config restore kiya. Kisi bhi LAN par koi browse nahi kar paa raha." Uplink g0/1 hai (203.0.113.18/30).`},out:`BR# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0, GigabitEthernet0/2
Inside interfaces:
  GigabitEthernet0/1
Hits: 0  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 0

BR# show access-lists 1
Standard IP access list 1
    10 permit 192.168.0.0, wildcard bits 0.0.3.255`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`ACL 1 does not match 192.168.1.0/24 and 192.168.2.0/24`,hi:`ACL 1 192.168.1.0/24 aur 192.168.2.0/24 ko match nahi karta`},{en:`The overload keyword is missing from the rule`,hi:`Rule mein overload keyword missing hai`},{en:`The NAT inside and outside labels are swapped`,hi:`NAT inside aur outside labels ulte hain`},{en:`The ISP has no route to 203.0.113.18`,hi:`ISP ke paas 203.0.113.18 ka route nahi hai`}],a:2,w:{en:`The LAN interfaces g0/0 and g0/2 are listed as outside and the uplink as inside, so user traffic never crosses from inside to outside and the rule never applies (refcount 0, no translations). The ACL correctly covers 192.168.0.0–192.168.3.255, and the rule shows the interface binding. Swap the labels.`,hi:`LAN interfaces g0/0 aur g0/2 outside ki tarah aur uplink inside ki tarah listed hain, isliye user traffic kabhi inside se outside cross nahi karta aur rule kabhi apply nahi hota (refcount 0, koi translation nahi). ACL sahi tarah 192.168.0.0–192.168.3.255 cover karta hai, aur rule interface binding dikhata hai. Labels swap karo.`}},{title:{en:`Third counsellor cannot reach the CRM`,hi:`Teesra counsellor CRM tak nahi pahunch paata`},ticket:{en:`Coaching centre: "Two PCs work fine. PC3 (10.20.0.13) gets no replies from the CRM server 198.51.100.80." EDGE uses a two-address pool.`,hi:`Coaching centre: "Do PCs theek chal rahe hain. PC3 (10.20.0.13) ko CRM server 198.51.100.80 se koi reply nahi milta." EDGE do-address pool use karta hai.`},out:`EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
---  100.64.50.10       10.20.0.11         ---                ---
---  100.64.50.11       10.20.0.12         ---                ---

EDGE# show ip nat statistics
Total active translations: 2 (0 static, 2 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 42  Misses: 9
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 20 pool PUBLIC refcount 2
 pool PUBLIC: netmask 255.255.255.0
        start 100.64.50.10 end 100.64.50.11
        type generic, total addresses 2, allocated 2 (100%), misses 7

%NAT-6-ADDR_ALLOC_FAILURE: Address allocation failed; pool 1 may be exhausted [2]`,q:{en:`Which change fixes PC3 permanently with the same two addresses?`,hi:`Same do addresses ke saath kaunsa change PC3 ko permanently fix karta hai?`},o:[{en:`Add overload to the rule: ip nat inside source list 20 pool PUBLIC overload`,hi:`Rule mein overload jodo: ip nat inside source list 20 pool PUBLIC overload`},{en:`Change ACL 20 to permit any`,hi:`ACL 20 ko permit any kar do`},{en:`Run clear ip nat statistics`,hi:`clear ip nat statistics chalao`},{en:`Mark g0/1 as ip nat inside as well`,hi:`g0/1 ko bhi ip nat inside mark karo`}],a:0,w:{en:`The pool is 100% allocated and the pool misses counter plus the allocation-failure log show exhaustion. Without overload each host needs its own address. Adding overload (after clearing old translations) lets all three share the pool with ports. Changing the ACL or counters does not create addresses, and marking the uplink inside breaks NAT.`,hi:`Pool 100% allocated hai aur pool misses counter plus allocation-failure log exhaustion dikhate hain. Overload ke bina har host ko apna address chahiye. (Purane translations clear karke) overload jodne se teeno ports ke saath pool share karte hain. ACL ya counters badalne se addresses nahi bante, aur uplink ko inside mark karne se NAT toot jaata hai.`}},{title:{en:`New lab VLAN has no internet`,hi:`Naye lab VLAN ka internet nahi`},ticket:{en:`College: "The new computer lab on VLAN 30 (192.168.4.0/24) can print and reach the library server, but no website opens. Old labs are fine."`,hi:`College: "VLAN 30 (192.168.4.0/24) wala naya computer lab print kar sakta hai aur library server tak pahunchta hai, par koi website nahi khulti. Purane labs theek hain."`},out:`R1# show running-config | include ip nat
 ip nat inside
 ip nat inside
 ip nat inside
 ip nat outside
ip nat inside source list 1 interface GigabitEthernet0/1 overload

R1# show access-lists 1
Standard IP access list 1
    10 permit 192.168.0.0, wildcard bits 0.0.3.255 (15230 matches)

R1# show ip nat translations | include 192.168.4.
R1#`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Change the rule to use a pool instead of the interface`,hi:`Rule ko interface ki jagah pool use karne wala banao`},{en:`Add ip nat outside on the VLAN 30 interface`,hi:`VLAN 30 interface par ip nat outside jodo`},{en:`Clear the NAT translations so VLAN 30 can get a port`,hi:`NAT translations clear karo taaki VLAN 30 ko port mile`},{en:`Add access-list 1 permit 192.168.4.0 0.0.0.255`,hi:`access-list 1 permit 192.168.4.0 0.0.0.255 jodo`}],a:3,w:{en:`The wildcard 0.0.3.255 covers only 192.168.0.x to 192.168.3.x. 192.168.4.x does not match, so it leaves untranslated with a private source and the ISP drops it; there are no translations for it. Adding a permit for 192.168.4.0/24 fixes it. The interface is already labelled inside (three inside lines), PAT has plenty of ports, and outside would be wrong.`,hi:`Wildcard 0.0.3.255 sirf 192.168.0.x se 192.168.3.x cover karta hai. 192.168.4.x match nahi karta, isliye private source ke saath bina translation nikalta hai aur ISP use drop karta hai; uske liye koi translation nahi. 192.168.4.0/24 ke liye permit jodna fix hai. Interface pehle se inside labelled hai (teen inside lines), PAT ke paas bahut ports hain, aur outside galat hoga.`}},{title:{en:`Translations appear but pages never load`,hi:`Translations dikhte hain par pages kabhi load nahi hote`},ticket:{en:`Logistics firm: "We moved our NAT pool to the new block 100.64.60.8/29 that the provider gave us. Since then nothing on the internet loads." EDGE uplink is 100.64.50.2/24.`,hi:`Logistics firm: "Humne apna NAT pool provider ke diye naye block 100.64.60.8/29 par shift kiya. Tab se internet par kuch load nahi hota." EDGE uplink 100.64.50.2/24 hai.`},out:`EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
tcp  100.64.60.10:51544 10.20.0.11:51544   198.51.100.80:443  198.51.100.80:443
tcp  100.64.60.10:51545 10.20.0.12:51545   198.51.100.80:443  198.51.100.80:443

ISP# show ip route 100.64.60.10
% Subnet not in table

ISP# show ip route 100.64.50.2
Routing entry for 100.64.50.0/24
  Known via "connected", distance 0, metric 0 (connected, via interface)`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`The NAT ACL does not match the inside hosts`,hi:`NAT ACL inside hosts ko match nahi karta`},{en:`The ISP has no route back to the new pool, so replies are dropped`,hi:`ISP ke paas naye pool ka return route nahi, isliye replies drop hote hain`},{en:`The pool is exhausted`,hi:`Pool khatam ho gaya hai`},{en:`The inside and outside labels are swapped`,hi:`Inside aur outside labels ulte hain`}],a:1,w:{en:`Translations are being created, so labels, ACL and pool are working. The new pool is not inside the connected 100.64.50.0/24, and the ISP has no route for 100.64.60.10, so replies have nowhere to go. The provider must route 100.64.60.8/29 to EDGE (100.64.50.2).`,hi:`Translations ban rahe hain, isliye labels, ACL aur pool chal rahe hain. Naya pool connected 100.64.50.0/24 ke andar nahi hai, aur ISP ke paas 100.64.60.10 ka route nahi, isliye replies ke paas jaane ki jagah nahi. Provider ko 100.64.60.8/29 EDGE (100.64.50.2) ki taraf route karna hoga.`}},{title:{en:`Published portal unreachable after a late-night change`,hi:`Der raat ke change ke baad published portal unreachable`},ticket:{en:`E-learning company: "The course portal should be public as 203.0.113.5 since last night. Students get timeouts." Portal is 172.16.10.80.`,hi:`E-learning company: "Course portal kal raat se 203.0.113.5 ke roop mein public hona chahiye. Students ko timeouts mil rahe hain." Portal 172.16.10.80 hai.`},out:`EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
---  172.16.10.80       203.0.113.5        ---                ---

EDGE# show running-config | include ip nat
 ip nat inside
 ip nat outside
ip nat inside source static 203.0.113.5 172.16.10.80`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Add overload to the static command`,hi:`Static command mein overload jodo`},{en:`Run clear ip nat translation * to rebuild the entry`,hi:`Entry dobara banane ke liye clear ip nat translation * chalao`},{en:`Remove the line and enter ip nat inside source static 172.16.10.80 203.0.113.5`,hi:`Line hatao aur ip nat inside source static 172.16.10.80 203.0.113.5 daalo`},{en:`Change the static entry to a dynamic pool containing 203.0.113.5`,hi:`Static entry ko 203.0.113.5 wale dynamic pool mein badlo`}],a:2,w:{en:`The addresses were entered in reverse, so the private address appears in the Inside global column. The syntax is local first, then global. Static entries are not removed by clear, overload does not apply to static one-to-one mappings, and dynamic NAT would not allow inbound connections.`,hi:`Addresses ulte daale gaye, isliye private address Inside global column mein dikhta hai. Syntax pehle local, phir global hai. Clear static entries nahi hataata, overload static one-to-one mappings par lagu nahi hota, aur dynamic NAT inbound connections allow nahi karta.`}},{title:{en:`Static NAT correct, portal still blocked`,hi:`Static NAT sahi, portal phir bhi blocked`},ticket:{en:`"The static NAT line is right and show ip nat translations shows the static entry, but outside users still cannot open the portal on 203.0.113.5 port 443." An ACL was recently added on the uplink.`,hi:`"Static NAT line sahi hai aur show ip nat translations static entry dikhata hai, par outside users abhi bhi 203.0.113.5 port 443 par portal nahi khol paate." Uplink par haal hi mein ACL joda gaya.`},out:`EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.5        172.16.10.80       ---                ---

EDGE# show ip interface GigabitEthernet0/1 | include access list
  Outbound access list is not set
  Inbound  access list is FROM-ISP

EDGE# show access-lists FROM-ISP
Extended IP access list FROM-ISP
    10 permit tcp any host 172.16.10.80 eq 443
    20 deny ip any any (1874 matches)`,q:{en:`Why is the portal still unreachable?`,hi:`Portal abhi bhi unreachable kyun hai?`},o:[{en:`The static entry must be recreated with extendable`,hi:`Static entry extendable ke saath dobara banani hogi`},{en:`Inbound ACLs on outside interfaces are checked after NAT, so the rule is fine`,hi:`Outside interfaces ke inbound ACLs NAT ke baad check hote hain, isliye rule theek hai`},{en:`The portal needs PAT instead of static NAT`,hi:`Portal ko static NAT ki jagah PAT chahiye`},{en:`The inbound ACL on the outside is checked before NAT, so it must permit host 203.0.113.5, not 172.16.10.80`,hi:`Outside ka inbound ACL NAT se pehle check hota hai, isliye use host 203.0.113.5 permit karna chahiye, 172.16.10.80 nahi`}],a:3,w:{en:`Outside to inside, the inbound ACL on the outside interface sees the packet before NAT translates the destination, so the destination is still the inside global 203.0.113.5. Line 10 never matches and line 20 drops the traffic. Rewrite line 10 as permit tcp any host 203.0.113.5 eq 443.`,hi:`Outside se inside, outside interface ka inbound ACL packet ko NAT ke destination translate karne se pehle dekhta hai, isliye destination abhi bhi inside global 203.0.113.5 hai. Line 10 kabhi match nahi karti aur line 20 traffic drop karti hai. Line 10 ko permit tcp any host 203.0.113.5 eq 443 ki tarah dobara likho.`}},{title:{en:`PAT change made, users still failing`,hi:`PAT change hua, users abhi bhi fail`},ticket:{en:`"I replaced our dynamic NAT rule with the same rule plus overload an hour ago. Several users still cannot browse." The pool has two addresses.`,hi:`"Ek ghanta pehle maine dynamic NAT rule ko same rule plus overload se replace kiya. Kai users abhi bhi browse nahi kar paa rahe." Pool mein do addresses hain.`},out:`EDGE(config)# no ip nat inside source list 20 pool PUBLIC
Dynamic mapping in use, do you want to delete all entries? [no]: no
EDGE(config)# ip nat inside source list 20 pool PUBLIC overload

EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
---  100.64.50.10       10.20.0.11         ---                ---
---  100.64.50.11       10.20.0.12         ---                ---`,q:{en:`What is the best next step?`,hi:`Sabse achha agla step kya hai?`},o:[{en:`In a change window, clear ip nat translation * so the old one-to-one entries release the pool, then verify PAT entries appear`,hi:`Change window mein clear ip nat translation * chalao taaki purani one-to-one entries pool chhodein, phir verify karo ki PAT entries dikh rahi hain`},{en:`Reload the router immediately`,hi:`Router turant reload karo`},{en:`Increase the translation timeout to 48 hours`,hi:`Translation timeout 48 ghante karo`},{en:`Delete the pool and recreate it with the same addresses`,hi:`Pool delete karke same addresses ke saath dobara banao`}],a:0,w:{en:`Answering no kept the old dynamic entries, which still hold both pool addresses one-to-one and will stay for up to 24 hours idle. Clearing dynamic translations releases them so the overload rule can share the pool. A reload is disruptive and unnecessary, a longer timeout makes it worse, and IOS will refuse to delete a pool in use.`,hi:`No jawab dene se purani dynamic entries bani rahin, jo ab bhi dono pool addresses one-to-one pakde hain aur 24 ghante idle tak rahengi. Dynamic translations clear karne se woh free hoti hain taaki overload rule pool share kar sake. Reload disruptive aur ghair-zaroori hai, lamba timeout ise aur bigaadta hai, aur IOS use mein pool delete karne se mana karega.`}}];export{e as default};