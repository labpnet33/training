var e=[{title:{en:`Annex PCs get 169.254 addresses`,hi:`Annex PCs ko 169.254 addresses mil rahe hain`},ticket:{en:`College annex: "None of the annex PCs can get on the network since the router was replaced last night. Campus PCs are fine." R1 is the DHCP server for both sites; R2 is the new annex router.`,hi:`College annex: "Kal raat router badalne ke baad se annex ka koi PC network par nahi aa raha. Campus PCs theek hain." R1 dono sites ka DHCP server hai; R2 naya annex router hai.`},out:`PC3> ip dhcp
DDD
Can't find dhcp server

R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.20.1/24
  Broadcast address is 255.255.255.255
  Helper address is not set

R1# show ip dhcp pool LAN20
 Total addresses                : 254
 Leased addresses               : 0
 Excluded addresses             : 20`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Create a DHCP pool for 192.168.20.0/24 on R2`,hi:`R2 par 192.168.20.0/24 ke liye DHCP pool banao`},{en:`Add ip helper-address 10.1.12.1 on R2 Gi0/1 (the link to R1)`,hi:`R2 Gi0/1 (R1 wala link) par ip helper-address 10.1.12.1 add karo`},{en:`Add ip helper-address 10.1.12.1 on R2 Gi0/0, the interface facing the annex clients`,hi:`R2 Gi0/0, yaani annex clients ki taraf wale interface, par ip helper-address 10.1.12.1 add karo`},{en:`Remove the exclusions on R1 so LAN20 has more addresses`,hi:`R1 par exclusions hatao taaki LAN20 mein zyada addresses hon`}],a:2,w:{en:`The replacement router lost its relay configuration: "Helper address is not set". The pool on R1 is healthy (234 free), so the Discovers simply never leave the annex. The helper belongs on the client-facing interface (Gi0/0), not on the uplink. A second pool on R2 would work but duplicates the design instead of restoring it.`,hi:`Naye router ki relay configuration kho gayi: "Helper address is not set". R1 ka pool healthy hai (234 free), to Discovers annex se nikal hi nahi rahe. Helper client-facing interface (Gi0/0) par lagta hai, uplink par nahi. R2 par doosra pool chal jaata lekin design ko restore karne ki jagah duplicate karta.`}},{title:{en:`Campus PCs cannot leave their subnet`,hi:`Campus PCs apne subnet se bahar nahi ja paate`},ticket:{en:`"Since the DHCP change this morning, campus PCs can print to the local printer but cannot open anything on the server subnet." Annex users are fine.`,hi:`"Aaj subah ke DHCP change ke baad se campus PCs local printer par print kar paate hain lekin server subnet par kuch nahi khol paate." Annex users theek hain.`},out:`C:\\> ipconfig
   IPv4 Address. . . . . . . . . . . : 192.168.10.24
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.20.1

R1# show running-config | section ip dhcp pool LAN10
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 10.1.100.53
 domain-name nwk.lab`,q:{en:`What should the engineer change?`,hi:`Engineer ko kya badalna chahiye?`},o:[{en:`In pool LAN10, set default-router 192.168.10.1, then have clients renew`,hi:`Pool LAN10 mein default-router 192.168.10.1 set karo, phir clients se renew karwao`},{en:`Add ip helper-address on R1 Gi0/0`,hi:`R1 Gi0/0 par ip helper-address add karo`},{en:`Change the DNS server to 192.168.10.1`,hi:`DNS server ko 192.168.10.1 kar do`},{en:`Add a static route on R1 to 192.168.20.0/24`,hi:`R1 par 192.168.20.0/24 ka static route add karo`}],a:0,w:{en:`The LAN10 pool was copied from LAN20 and still hands out the annex gateway. A gateway outside the client's own subnet is unusable, so only local traffic works. Correct option 3 to 192.168.10.1; clients pick it up on renewal (ipconfig /renew now, or at T1).`,hi:`LAN10 pool LAN20 se copy hua tha aur ab bhi annex ka gateway de raha hai. Client ke apne subnet ke bahar ka gateway use nahi ho sakta, isliye sirf local traffic chalta hai. Option 3 ko 192.168.10.1 karo; clients ise renewal par uthayenge (abhi ipconfig /renew, ya T1 par).`}},{title:{en:`New laptops get nothing on exam day`,hi:`Exam ke din naye laptops ko kuch nahi mil raha`},ticket:{en:`"Hall 3: students who arrived after 9:30 get 169.254 addresses. Everyone who came early is fine."`,hi:`"Hall 3: 9:30 ke baad aaye students ko 169.254 addresses mil rahe hain. Jo jaldi aaye woh theek hain."`},out:`R1# show ip dhcp server statistics
Message              Received
DHCPDISCOVER         412
DHCPREQUEST          118
Message              Sent
DHCPOFFER            116
DHCPACK              116

R1# show ip dhcp pool HALL3
 Total addresses                : 126
 Leased addresses               : 116
 Excluded addresses             : 10
 Current index        IP address range                    Leased/Excluded/Total
 0.0.0.0              192.168.30.129   - 192.168.30.254    116   / 10    / 126`,q:{en:`What is the cause and the best fix?`,hi:`Kaaran kya hai aur best fix kya hai?`},o:[{en:`The relay is missing; add ip helper-address on the hall SVI`,hi:`Relay missing hai; hall SVI par ip helper-address add karo`},{en:`A rogue DHCP server is answering; enable DHCP snooping`,hi:`Rogue DHCP server jawab de raha hai; DHCP snooping enable karo`},{en:`The DNS server is down; change dns-server`,hi:`DNS server down hai; dns-server badlo`},{en:`The pool is exhausted (116 leased + 10 excluded = 126); shorten the lease and enlarge the subnet`,hi:`Pool khatam ho gaya hai (116 leased + 10 excluded = 126); lease chhoti karo aur subnet bada karo`}],a:3,w:{en:`Discovers are arriving (412), so the relay works, but Offers stopped at 116: every non-excluded address is leased and the current index is 0.0.0.0. Shorten the lease for this transient population and resize the scope (for example to a /24). DNS has nothing to do with getting an address.`,hi:`Discovers aa rahe hain (412), to relay chal raha hai, lekin Offers 116 par ruk gaye: har non-excluded address leased hai aur current index 0.0.0.0 hai. Is aate-jaate population ke liye lease chhoti karo aur scope resize karo (jaise /24). Address milne se DNS ka koi lena-dena nahi.`}},{title:{en:`Half the floor on a strange gateway`,hi:`Aadha floor ek ajeeb gateway par`},ticket:{en:`"Some users on floor 2 cannot open internal apps or the internet. Their neighbours are fine." The floor uses 192.168.10.0/24 from R1.`,hi:`"Floor 2 ke kuch users internal apps ya internet nahi khol paa rahe. Unke padosi theek hain." Floor R1 se 192.168.10.0/24 use karta hai.`},out:`C:\\> ipconfig /all
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.0.103(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.0.1
   DHCP Server . . . . . . . . . . . : 192.168.0.1
   DNS Servers . . . . . . . . . . . : 192.168.0.1`,q:{en:`What is happening and what should be done?`,hi:`Kya ho raha hai aur kya karna chahiye?`},o:[{en:`R1's pool has the wrong network; change it to 192.168.0.0/24`,hi:`R1 ke pool ka network galat hai; use 192.168.0.0/24 kar do`},{en:`An unauthorised DHCP server (192.168.0.1) is answering first; remove it and enable DHCP snooping with only the uplink trusted`,hi:`Ek unauthorised DHCP server (192.168.0.1) pehle jawab de raha hai; use hatao aur sirf uplink trusted rakh kar DHCP snooping enable karo`},{en:`The lease expired; increase the lease time`,hi:`Lease expire ho gayi; lease time badhao`},{en:`The PCs need a static route to 192.168.0.0/24`,hi:`PCs ko 192.168.0.0/24 ka static route chahiye`}],a:1,w:{en:`The DHCP Server line shows 192.168.0.1, not R1, and the subnet is not one the company uses: a consumer router plugged into a desk port is answering first. Clients take the first offer. Remove the device, have users renew, and enable DHCP snooping (trust only the uplink) so it cannot happen again.`,hi:`DHCP Server line 192.168.0.1 dikhati hai, R1 nahi, aur yeh subnet company use nahi karti: desk port mein laga ek consumer router pehle jawab de raha hai. Clients pehla offer lete hain. Device hatao, users se renew karwao, aur DHCP snooping enable karo (sirf uplink trusted) taaki dobara na ho.`}},{title:{en:`Works by IP, not by name`,hi:`IP se chalta hai, naam se nahi`},ticket:{en:`"I can open 10.1.100.80 but www.nwk.lab says the site cannot be reached." Several campus users report the same after last week's DNS server migration.`,hi:`"Main 10.1.100.80 khol sakta hoon lekin www.nwk.lab kehta hai site reach nahi ho sakti." Pichhle hafte ke DNS server migration ke baad kai campus users yahi report kar rahe hain.`},out:`C:\\> ipconfig /all
   DHCP Server . . . . . . . . . . . : 192.168.10.1
   DNS Servers . . . . . . . . . . . : 10.1.100.52

C:\\> nslookup www.nwk.lab
DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out

C:\\> nslookup www.nwk.lab 10.1.100.53
Server:  dns.nwk.lab
Address:  10.1.100.53

Name:    www.nwk.lab
Address:  10.1.100.80`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add a CNAME for www.nwk.lab`,hi:`www.nwk.lab ke liye CNAME add karo`},{en:`Add ip name-server 10.1.100.53 on R1`,hi:`R1 par ip name-server 10.1.100.53 add karo`},{en:`Change dns-server in the campus pool to 10.1.100.53, then have clients renew their lease`,hi:`Campus pool mein dns-server ko 10.1.100.53 karo, phir clients se lease renew karwao`},{en:`Open TCP 80 on the firewall`,hi:`Firewall par TCP 80 kholo`}],a:2,w:{en:`Clients still receive the retired server 10.1.100.52 through option 6. The new server 10.1.100.53 answers correctly when asked directly, so the record and path are fine. Fix the pool's dns-server and renew. ip name-server only affects the router's own lookups.`,hi:`Clients ko option 6 ke through ab bhi retired server 10.1.100.52 mil raha hai. Naya server 10.1.100.53 seedha poochne par sahi jawab deta hai, to record aur path theek hain. Pool ka dns-server theek karo aur renew karo. ip name-server sirf router ke apne lookups par asar karta hai.`}},{title:{en:`Router cannot resolve anything`,hi:`Router kuch bhi resolve nahi kar paata`},ticket:{en:`"The nightly backup job on R1 fails with 'host unknown', and every typo on the console hangs for several seconds."`,hi:`"R1 par nightly backup job 'host unknown' ke saath fail hota hai, aur console par har typo kai seconds ke liye hang karta hai."`},out:`R1# ping backup.nwk.lab
Translating "backup.nwk.lab"...domain server (255.255.255.255)
% Unrecognized host or address, or protocol not running.

R1# show hosts
Default domain is nwk.lab
Name/address lookup uses domain service
Name servers are 255.255.255.255`,q:{en:`What should be configured on R1?`,hi:`R1 par kya configure karna chahiye?`},o:[{en:`ip name-server 10.1.100.53`,hi:`ip name-server 10.1.100.53`},{en:`no ip domain-lookup`,hi:`no ip domain-lookup`},{en:`dns-server 10.1.100.53 in pool LAN10`,hi:`pool LAN10 mein dns-server 10.1.100.53`},{en:`ip helper-address 10.1.100.53 on Gi0/2`,hi:`Gi0/2 par ip helper-address 10.1.100.53`}],a:0,w:{en:`Lookup is enabled but no name server is set, so queries go to 255.255.255.255 and time out. Configuring ip name-server gives the router a real resolver. no ip domain-lookup would stop the hangs but also break the backup job. The pool option only affects DHCP clients, and a helper relays client broadcasts, not the router's own queries.`,hi:`Lookup enabled hai lekin koi name server set nahi, isliye queries 255.255.255.255 par jaati hain aur time out hoti hain. ip name-server configure karne se router ko asli resolver milta hai. no ip domain-lookup hangs rok deta lekin backup job bhi tod deta. Pool option sirf DHCP clients par asar karta hai, aur helper client broadcasts relay karta hai, router ki apni queries nahi.`}},{title:{en:`Portal opens the wrong server`,hi:`Portal galat server khol raha hai`},ticket:{en:`"www.nwk.lab shows yesterday's maintenance page. The team says the new web server at 10.1.100.80 is live."`,hi:`"www.nwk.lab kal ka maintenance page dikha raha hai. Team kehti hai 10.1.100.80 par naya web server live hai."`},out:`$ dig www.nwk.lab +noall +answer
www.nwk.lab.		3600	IN	A	10.1.100.81

$ dig @ns1.nwk.lab www.nwk.lab +noall +answer
www.nwk.lab.		3600	IN	A	10.1.100.81

$ ping -c 1 10.1.100.80
64 bytes from 10.1.100.80: icmp_seq=1 ttl=63 time=0.58 ms`,q:{en:`What is the root cause and fix?`,hi:`Root cause aur fix kya hai?`},o:[{en:`The client's DNS cache is stale; flushing it is enough`,hi:`Client ka DNS cache purana hai; flush karna kaafi hai`},{en:`The A record in the authoritative zone still points to .81; correct it to 10.1.100.80, then allow for the TTL or flush resolver caches`,hi:`Authoritative zone ka A record ab bhi .81 ko point karta hai; use 10.1.100.80 karo, phir TTL ka dhyan rakho ya resolver caches flush karo`},{en:`The DHCP pool's dns-server is wrong`,hi:`DHCP pool ka dns-server galat hai`},{en:`The web server needs a PTR record`,hi:`Web server ko PTR record chahiye`}],a:1,w:{en:`The authoritative server itself returns .81, so this is not a cache problem: the zone record was never updated. Fix the A record (and the zone serial), then remember resolvers may hold the old answer for up to 3600 seconds unless flushed. The client reaches the right DNS server, and a PTR does not affect forward lookups.`,hi:`Authoritative server khud .81 lautata hai, to yeh cache problem nahi: zone record kabhi update hi nahi hua. A record (aur zone serial) theek karo, phir yaad rakho ki resolvers flush na hone par 3600 seconds tak purana jawab rakh sakte hain. Client sahi DNS server tak pahunch raha hai, aur PTR forward lookups par asar nahi karta.`}}];export{e as default};