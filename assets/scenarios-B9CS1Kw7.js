var e=[{title:{en:`Two public servers, one public IP`,hi:`Do public servers, ek public IP`},ticket:{en:`A small branch has only its outside interface address 203.0.113.2. It must publish HTTPS (443) on WEB and SSH on the jump host. The ISP blocks inbound 22, so SSH must be reached on 2222. ASDM and remote-access VPN on the outside interface are disabled.`,hi:`Ek chhoti branch ke paas sirf outside interface address 203.0.113.2 hai. Use WEB par HTTPS (443) aur jump host par SSH publish karna hai. ISP inbound 22 block karta hai, isliye SSH 2222 par pahunchna chahiye. Outside interface par ASDM aur remote-access VPN disabled hain.`},out:`Public IP : 203.0.113.2 (outside interface, no spare addresses)
WEB   10.0.2.10  needs tcp/443
JUMP  10.0.2.20  needs tcp/22, published as 2222
Existing: object network DMZ-NET / nat (dmz,outside) dynamic interface`,q:{en:`Which configuration fits?`,hi:`Kaunsi configuration fit hai?`},o:[{en:`Two static NAT rules, WEB and JUMP both to 203.0.113.2`,hi:`Do static NAT rules, WEB aur JUMP dono 203.0.113.2 par`},{en:`It is impossible without buying a second public IP`,hi:`Doosra public IP khareede bina yeh impossible hai`},{en:`Static PAT: WEB with static interface service tcp 443 443, JUMP with static interface service tcp ssh 2222, and an ACL for the real ports`,hi:`Static PAT: WEB ke saath static interface service tcp 443 443, JUMP ke saath static interface service tcp ssh 2222, aur real ports ke liye ACL`},{en:`Only the existing dynamic PAT for DMZ-NET, plus an ACL permitting 443 and 2222 to 203.0.113.2`,hi:`Sirf existing DMZ-NET dynamic PAT, aur 203.0.113.2 par 443 aur 2222 permit karne wali ACL`}],a:2,w:{en:`Static PAT shares one address by port, so both services can live on the interface address. Two full static NATs to the same address conflict. Dynamic PAT only handles connections the server starts, so the internet can never open one toward it. The ACL must permit object WEB eq 443 and object JUMP eq ssh, the real ports. On a live box, check that no ASA service already listens on the mapped port.`,hi:`Static PAT ek address ko port se share karta hai, isliye dono services interface address par reh sakti hain. Ek hi address par do full static NATs conflict karte hain. Dynamic PAT sirf server ke shuru kiye connections handle karta hai, isliye internet kabhi uski taraf connection nahi khol sakta. ACL ko object WEB eq 443 aur object JUMP eq ssh, yaani real ports, permit karne chahiye. Live box par check karo ki koi ASA service pehle se mapped port par listen na kar rahi ho.`}},{title:{en:`The counters tell the story`,hi:`Counters kahani bataate hain`},ticket:{en:`Customers report the new portal is down. The server team says the service is up. You start with NAT.`,hi:`Customers report karte hain ki naya portal down hai. Server team kehti hai service up hai. Aap NAT se shuru karte ho.`},out:`NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static PORTAL 203.0.113.6
    translate_hits = 0, untranslate_hits = 0

customer$ nslookup portal.example.com
Name:    portal.example.com
Address: 203.0.113.5`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`NAT maps the portal to 203.0.113.6 but public DNS sends customers to 203.0.113.5`,hi:`NAT portal ko 203.0.113.6 par map karta hai lekin public DNS customers ko 203.0.113.5 par bhejta hai`},{en:`The outside ACL is missing a permit for the portal`,hi:`Outside ACL mein portal ka permit missing hai`},{en:`The portal server is down`,hi:`Portal server down hai`},{en:`The static rule must be moved to section 1`,hi:`Static rule ko section 1 mein le jaana hoga`}],a:0,w:{en:`untranslate_hits = 0 means no packet for 203.0.113.6 ever reached the ASA; customers are sending to .5. A missing ACL would still show untranslate hits, because UN-NAT runs before the ACL. Fix the DNS record (or the mapped address) so both agree.`,hi:`untranslate_hits = 0 ka matlab 203.0.113.6 ke liye koi packet ASA tak pahuncha hi nahi; customers .5 par bhej rahe hain. Missing ACL hoti to bhi untranslate hits dikhte, kyunki UN-NAT ACL se pehle chalta hai. DNS record (ya mapped address) theek karo taaki dono match karein.`}},{title:{en:`The partner still cannot SSH on 2222`,hi:`Partner ab bhi 2222 par SSH nahi kar pa raha`},ticket:{en:`CHG-3318 published the jump host for partner 198.51.100.10 on 203.0.113.2 port 2222. The partner gets a timeout.`,hi:`CHG-3318 ne jump host ko partner 198.51.100.10 ke liye 203.0.113.2 port 2222 par publish kiya. Partner ko timeout milta hai.`},out:`NK-ASA# show running-config access-list OUTSIDE_IN
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq 2222

NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.2 2222
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Additional Information:
NAT divert to egress interface dmz
Untranslate 203.0.113.2/2222 to 10.0.2.20/22

Phase: 2
Type: ACCESS-LIST
Subtype:
Result: DROP
Config:
Implicit Rule

Result:
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change the NAT to service tcp 2222 2222`,hi:`NAT ko service tcp 2222 2222 kar do`},{en:`Permit tcp host 198.51.100.10 object JUMP eq ssh, then remove the eq 2222 line`,hi:`tcp host 198.51.100.10 object JUMP eq ssh permit karo, phir eq 2222 wali line hatao`},{en:`Permit tcp host 198.51.100.10 host 203.0.113.2 eq 2222`,hi:`tcp host 198.51.100.10 host 203.0.113.2 eq 2222 permit karo`},{en:`Disable proxy ARP on outside`,hi:`Outside par proxy ARP disable karo`}],a:1,w:{en:`UN-NAT has already turned the packet into 10.0.2.20 port 22 before the ACL runs, so the ACL must use the real address and real port. Changing the NAT would make the server listen on the wrong port; permitting the mapped address or mapped port never matches. Add the correct line first so OUTSIDE_IN is never empty.`,hi:`ACL chalne se pehle hi UN-NAT packet ko 10.0.2.20 port 22 bana chuka hai, isliye ACL ko real address aur real port use karna chahiye. NAT badalne se server galat port par hoga; mapped address ya mapped port permit karna kabhi match nahi karta. Pehle sahi line jodo taaki OUTSIDE_IN kabhi khali na ho.`}},{title:{en:`VPN up, no traffic`,hi:`VPN up, traffic nahi`},ticket:{en:`The site-to-site tunnel to BRANCH (192.168.50.0/24) shows as up, but no encrypted packets are counted. PC1 10.0.1.10 cannot reach 192.168.50.10.`,hi:`BRANCH (192.168.50.0/24) ka site-to-site tunnel up dikhta hai, lekin koi encrypted packet count nahi hota. PC1 10.0.1.10, 192.168.50.10 tak nahi pahunch pata.`},out:`NK-ASA# packet-tracer input inside icmp 10.0.1.10 8 0 192.168.50.10
...
Phase: 4
Type: NAT
Subtype:
Result: ALLOW
Config:
object network INSIDE-NET
 nat (inside,outside) dynamic interface
Additional Information:
Dynamic translate 10.0.1.10/0 to 203.0.113.2/0

NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 5321, untranslate_hits = 12`,q:{en:`What should you add?`,hi:`Aapko kya jodna chahiye?`},o:[{en:`A static NAT for PC1 to 203.0.113.4`,hi:`PC1 ke liye 203.0.113.4 par static NAT`},{en:`An ACL on outside permitting 192.168.50.0/24`,hi:`Outside par 192.168.50.0/24 permit karne wali ACL`},{en:`The same identity rule with after-auto`,hi:`Wahi identity rule after-auto ke saath`},{en:`nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup`,hi:`nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup`}],a:3,w:{en:`The interface PAT changes the source to 203.0.113.2, so the traffic no longer matches the crypto ACL (10.0.1.0/24 to 192.168.50.0/24) and is never encrypted. Identity twice NAT at line 1 of section 1 keeps the addresses unchanged. With after-auto it would sit in section 3, below the PAT, and never match.`,hi:`Interface PAT source ko 203.0.113.2 bana deta hai, isliye traffic ab crypto ACL (10.0.1.0/24 se 192.168.50.0/24) se match nahi karta aur kabhi encrypt nahi hota. Section 1 ki line 1 par identity twice NAT addresses ko waisa hi rakhta hai. after-auto ke saath woh section 3 mein, PAT ke neeche hoga, aur kabhi match nahi karega.`}},{title:{en:`The mail server leaves with the wrong address`,hi:`Mail server galat address se bahar jaata hai`},ticket:{en:`Since last night, partners reject mail from MAIL (10.0.2.40, static NAT 203.0.113.5) with "sender IP not authorised". Nobody changed the MAIL object.`,hi:`Kal raat se partners MAIL (10.0.2.40, static NAT 203.0.113.5) ki mail "sender IP not authorised" ke saath reject karte hain. MAIL object kisi ne nahi badla.`},out:`NK-ASA# show nat
Manual NAT Policies (Section 1)
1 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 1840, untranslate_hits = 0
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static MAIL 203.0.113.5
    translate_hits = 0, untranslate_hits = 96

NK-ASA# show xlate local 10.0.2.40
TCP PAT from dmz:10.0.2.40/41822 to outside:203.0.113.2/41822 flags ri idle 0:00:04 timeout 0:00:30`,q:{en:`What is the best fix?`,hi:`Best fix kya hai?`},o:[{en:`Change the MAIL static to 203.0.113.2`,hi:`MAIL static ko 203.0.113.2 kar do`},{en:`Delete the MAIL object and re-create it`,hi:`MAIL object delete karke dobara banao`},{en:`Re-add the section 1 DMZ-NET rule with after-auto, then clear xlate local 10.0.2.40`,hi:`Section 1 ki DMZ-NET rule ko after-auto ke saath dobara jodo, phir clear xlate local 10.0.2.40`},{en:`Add an outside ACL permitting 10.0.2.40`,hi:`10.0.2.40 permit karne wali outside ACL jodo`}],a:2,w:{en:`A manual dynamic rule in section 1 matches before every auto NAT static, so MAIL's outbound traffic is PATed to 203.0.113.2 (translate_hits = 0 on the static). Inbound still works because untranslate uses the static. Moving the catch-all to section 3 with after-auto restores the order; clearing the xlate forces new connections to use the static.`,hi:`Section 1 ki manual dynamic rule har auto NAT static se pehle match karti hai, isliye MAIL ka outbound traffic 203.0.113.2 par PAT hota hai (static par translate_hits = 0). Inbound ab bhi kaam karta hai kyunki untranslate static use karta hai. Catch-all ko after-auto ke saath section 3 mein le jaane se order wapas theek hota hai; xlate clear karne se naye connections static use karte hain.`}},{title:{en:`The new public block is unreachable`,hi:`Naya public block unreachable hai`},ticket:{en:`The ISP assigned an extra block 192.0.2.0/28 for new servers. You configured object APP (10.0.2.60) with static NAT to 192.0.2.10. Nothing arrives from the internet.`,hi:`ISP ne naye servers ke liye extra block 192.0.2.0/28 diya. Aapne object APP (10.0.2.60) ko 192.0.2.10 par static NAT ke saath configure kiya. Internet se kuch nahi aata.`},out:`NK-ASA# show nat detail
Auto NAT Policies (Section 2)
3 (dmz) to (outside) source static APP 192.0.2.10
    translate_hits = 0, untranslate_hits = 0
    Source - Origin: 10.0.2.60/32, Translated: 192.0.2.10/32

ISP-RTR# show ip route 192.0.2.10
% Network not in table

ISP-RTR# show ip route connected
C    203.0.113.0/29 is directly connected, GigabitEthernet0/1`,q:{en:`Why does the traffic never reach the ASA?`,hi:`Traffic kabhi ASA tak kyun nahi pahunchta?`},o:[{en:`The ACL on outside is missing`,hi:`Outside par ACL missing hai`},{en:`The ISP router has no route for 192.0.2.0/28 toward the ASA outside address 203.0.113.2`,hi:`ISP router ke paas 192.0.2.0/28 ka ASA outside address 203.0.113.2 ki taraf koi route nahi hai`},{en:`Static NAT only works with addresses in the outside subnet`,hi:`Static NAT sirf outside subnet ke addresses ke saath kaam karta hai`},{en:`The rule needs no-proxy-arp`,hi:`Rule ko no-proxy-arp chahiye`}],a:1,w:{en:`Mapped addresses inside the outside subnet are reached by ARP, and the ASA answers with proxy ARP. An address from another block is not on the ISP's connected segment, so the ISP must route 192.0.2.0/28 to 203.0.113.2. The ASA's NAT is correct; the zero untranslate hits show the packets never arrive.`,hi:`Outside subnet ke andar ke mapped addresses ARP se reach hote hain, aur ASA proxy ARP se jawab deta hai. Doosre block ka address ISP ke connected segment par nahi hai, isliye ISP ko 192.0.2.0/28 ko 203.0.113.2 ki taraf route karna hoga. ASA ka NAT sahi hai; zero untranslate hits dikhate hain ki packets kabhi pahunchte hi nahi.`}},{title:{en:`Some users cannot browse at peak time`,hi:`Peak time par kuch users browse nahi kar paate`},ticket:{en:`Every morning around 10:00 new users in 10.0.1.0/24 cannot open any website, while users who logged in earlier are fine.`,hi:`Har subah lagbhag 10:00 baje 10.0.1.0/24 ke naye users koi website nahi khol paate, jabki pehle login karne wale users theek hain.`},out:`NK-ASA# show running-config object network INSIDE-NET
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic NAT-POOL

NK-ASA# show running-config object network NAT-POOL
object network NAT-POOL
 range 203.0.113.4 203.0.113.6

NK-ASA# show logging | include 305006
%ASA-3-305006: regular translation creation failed for tcp src inside:10.0.1.87/52110 dst outside:198.51.100.80/443`,q:{en:`What is the most efficient fix?`,hi:`Sabse efficient fix kya hai?`},o:[{en:`Increase timeout xlate to one day`,hi:`timeout xlate ko ek din kar do`},{en:`Move the rule to section 1`,hi:`Rule ko section 1 mein le jao`},{en:`Add a static NAT for every user`,hi:`Har user ke liye static NAT jodo`},{en:`Change the rule to nat (inside,outside) dynamic NAT-POOL interface, or use a PAT pool`,hi:`Rule ko nat (inside,outside) dynamic NAT-POOL interface kar do, ya PAT pool use karo`}],a:3,w:{en:`A range as the mapped object means dynamic NAT: one public address per active host, so only three users fit. The interface keyword adds PAT fallback when the pool is empty; a PAT pool lets each address carry thousands of ports. A longer timeout makes exhaustion worse, and moving the rule changes nothing about capacity.`,hi:`Mapped object mein range ka matlab dynamic NAT: har active host ko ek public address, isliye sirf teen users fit hote hain. Interface keyword pool khali hone par PAT fallback deta hai; PAT pool har address ko hazaaron ports dene deta hai. Lamba timeout exhaustion ko aur bura karta hai, aur rule move karne se capacity mein kuch nahi badalta.`}}];export{e as default};