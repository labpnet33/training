var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an office receptionist and a notebook, and you now know how that receptionist is configured, verified and fixed on a Cisco router. Use this chapter as your last read before the exam and as a quick reference on the job. If any line below feels uncertain, go back to the chapter named next to it and redo the matching lab.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Choosing the NAT type">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">What do you need?</text>
<rect x="10" y="100" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="13">Outside must reach</text><text x="105" y="145" text-anchor="middle" class="svg-ink" font-size="13">an inside server</text>
<rect x="225" y="100" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">1:1 public per host</text><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">from a block</text>
<rect x="440" y="100" width="190" height="60" rx="8" fill="#bae6fd"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13">Many users,</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="13">few addresses</text>
<line x1="320" y1="50" x2="105" y2="100" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b"/><line x1="320" y1="50" x2="535" y2="100" stroke="#64748b"/>
<text x="105" y="190" text-anchor="middle" class="svg-accent" font-size="13">Static NAT / port fwd</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Dynamic NAT (pool)</text>
<text x="535" y="190" text-anchor="middle" class="svg-accent" font-size="13">PAT (overload)</text>
</svg><p class="cap">Pick the NAT type from the requirement, then add labels, rule and verification.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why NAT exists: IPv4 exhaustion and non-routable RFC 1918 ranges (ch 1).</li>
<li>Name the four address terms for any packet and read the columns of show ip nat translations (ch 2).</li>
<li>Mark inside and outside interfaces and explain the order of operations at a high level (ch 3).</li>
<li>Publish a server with static NAT and a single service with static port forwarding (ch 4).</li>
<li>Build dynamic NAT with an ACL and a pool, and recognise pool exhaustion (ch 5).</li>
<li>Configure PAT on an interface and on a pool, and read the port table (ch 6).</li>
<li>Write wildcard masks for NAT ACLs, including summaries like 0.0.3.255 (ch 7).</li>
<li>Use statistics, translations, clear and debug correctly (ch 8).</li>
<li>Explain NAT's limitations, CGNAT and the IPv6 view (ch 9).</li>
<li>Troubleshoot the four classic faults with a fixed workflow (ch 10).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Inside local</dt><dd>Inside host's address as seen inside; usually its private address.</dd>
<dt>Inside global</dt><dd>Address representing the inside host on the outside.</dd>
<dt>Outside global / outside local</dt><dd>Outside host's real address / how it appears inside (equal unless outside NAT).</dd>
<dt>Static NAT</dt><dd>Permanent one-to-one mapping; works both directions.</dd>
<dt>Dynamic NAT</dt><dd>One-to-one mapping from a pool, created when an inside host sends traffic.</dd>
<dt>PAT / overload</dt><dd>Many-to-one translation using ports (ICMP query ID).</dd>
<dt>Pool</dt><dd>Range of inside global addresses: ip nat pool NAME first last netmask/prefix-length.</dd>
<dt>Simple vs extended entry</dt><dd>--- address-only entry vs per-flow entry with protocol and ports.</dd>
<dt>CGNAT</dt><dd>ISP-scale PAT using 100.64.0.0/10 shared address space (NAT444).</dd>
<dt>ALG / NAT-T</dt><dd>Payload fixing for protocols like SIP and FTP / IPsec ESP wrapped in UDP 4500.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (to 172.31.255.255), 192.168.0.0/16.</li>
<li>Column order: Pro, Inside global, Inside local, Outside local, Outside global.</li>
<li>Only static NAT allows unsolicited inbound connections.</li>
<li>overload = PAT; without it, dynamic NAT is one host per address and runs out.</li>
<li>The NAT ACL selects who is translated; denied traffic goes untranslated, not dropped by NAT.</li>
<li>Static entries survive clear ip nat translation *; dynamic ones do not.</li>
<li>Default idle timeouts: simple dynamic 24 h, TCP 24 h, UDP 300 s, ICMP 60 s.</li>
<li>Inside→outside: route then translate. Outside→inside: translate then route.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! labels</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
<span class="c">! static NAT and port forwarding</span>
ip nat inside source static 172.16.10.80 203.0.113.5
ip nat inside source static tcp 172.16.10.80 80 203.0.113.6 8080
<span class="c">! dynamic NAT</span>
access-list 20 permit 10.20.0.0 0.0.0.255
ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
ip nat inside source list 20 pool PUBLIC
<span class="c">! PAT on interface / on pool</span>
access-list 1 permit 192.168.0.0 0.0.3.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
ip nat inside source list 20 pool PUBLIC overload
<span class="c">! timers and verification</span>
ip nat translation timeout 3600
show ip nat translations [verbose]
show ip nat statistics
clear ip nat translation *
debug ip nat</pre>

<div class="eg"><p><b>Final worked example.</b> Requirement: a 60-user office with one ISP address, 203.0.113.18 on g0/1, LAN 192.168.1.0/24 on g0/0, and a web server 192.168.1.50 that must be reachable on HTTPS. Answer: g0/0 inside, g0/1 outside; <code>access-list 1 permit 192.168.1.0 0.0.0.255</code>; <code>ip nat inside source list 1 interface GigabitEthernet0/1 overload</code>; <code>ip nat inside source static tcp 192.168.1.50 443 interface GigabitEthernet0/1 443</code>. Verify with statistics, then a test from inside and from outside, then show ip nat translations.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the viewpoint rules. Most exam questions give you output and ask which address is which; the terms and column order score more marks than syntax.</p></div>

<div class="exam"><p><b>Exam trap.</b> A drag-and-drop may list "inside global" for the PC's configured address. Remember: the address typed on the PC is inside local; inside global is what the internet sees.</p></div>

<div class="scn"><h4>Your first week on the NOC shift</h4><p>A new engineer at an ISP-side NOC handled three NAT tickets in one week: a clinic with inside/outside swapped after a router swap, a college whose new VLAN was missing from the NAT ACL, and a customer whose new public block was never routed. Each took minutes because he ran the same workflow: statistics, rule and ACL, translations, pool, route back.</p><p><b>Lesson:</b> the workflow, not memory of one incident, is what makes you fast.</p></div>

<div class="iv"><p class="q">"Walk me through configuring NAT for a small branch."</p><p>Strong answer: identify inside and outside interfaces and label them; for user internet access use a standard ACL matching the LAN and PAT on the outside interface with overload; for a server, add a static mapping or a static port forward; ensure the ISP routes any public block to you; verify with show ip nat statistics and show ip nat translations after a real test; mention timeouts, clearing after changes, logging for traceability, and that IPv6 would remove the need for NAT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the NAT type from the need: publish a server (static), 1:1 from a block (dynamic), many users (PAT).</li>
<li>Every NAT build = labels + rule (+ ACL and pool for dynamic/PAT) + verification.</li>
<li>Know the four terms and the column order cold.</li>
<li>Troubleshoot in order: labels, rule/ACL, translations, pool, route back.</li>
<li>NAT extends IPv4; IPv6 and stateful firewalls are the long-term design.</li>
</ul></div>
`,hi:`
<p>Aapne office receptionist aur notebook se shuru kiya tha, aur ab aap jaante ho ki woh receptionist Cisco router par kaise configure, verify aur fix hoti hai. Is chapter ko exam se pehle aakhri read aur job par quick reference ki tarah use karo. Agar neeche koi line uncertain lage, to uske saath likhe chapter par wapas jao aur matching lab dobara karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NAT type chunna">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Aapko kya chahiye?</text>
<rect x="10" y="100" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="13">Bahar se inside</text><text x="105" y="145" text-anchor="middle" class="svg-ink" font-size="13">server tak pahunchna</text>
<rect x="225" y="100" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Har host ko 1:1 public</text><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">ek block se</text>
<rect x="440" y="100" width="190" height="60" rx="8" fill="#bae6fd"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13">Bahut users,</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="13">kam addresses</text>
<line x1="320" y1="50" x2="105" y2="100" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b"/><line x1="320" y1="50" x2="535" y2="100" stroke="#64748b"/>
<text x="105" y="190" text-anchor="middle" class="svg-accent" font-size="13">Static NAT / port fwd</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Dynamic NAT (pool)</text>
<text x="535" y="190" text-anchor="middle" class="svg-accent" font-size="13">PAT (overload)</text>
</svg><p class="cap">Requirement se NAT type chuno, phir labels, rule aur verification jodo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao NAT kyun hai: IPv4 exhaustion aur non-routable RFC 1918 ranges (ch 1).</li>
<li>Kisi bhi packet ke chaar address terms batao aur show ip nat translations ke columns padho (ch 2).</li>
<li>Inside aur outside interfaces mark karo aur high level par order of operations samjhao (ch 3).</li>
<li>Static NAT se server aur static port forwarding se ek service publish karo (ch 4).</li>
<li>ACL aur pool ke saath dynamic NAT banao, aur pool exhaustion pehchano (ch 5).</li>
<li>Interface aur pool par PAT configure karo, aur port table padho (ch 6).</li>
<li>NAT ACLs ke liye wildcard masks likho, 0.0.3.255 jaise summaries samet (ch 7).</li>
<li>Statistics, translations, clear aur debug sahi use karo (ch 8).</li>
<li>NAT ki limitations, CGNAT aur IPv6 ka nazariya samjhao (ch 9).</li>
<li>Fixed workflow se chaar classic faults troubleshoot karo (ch 10).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Inside local</dt><dd>Inside host ka address jaisa andar dikhta hai; aam taur par uska private address.</dd>
<dt>Inside global</dt><dd>Woh address jo bahar inside host ko represent karta hai.</dd>
<dt>Outside global / outside local</dt><dd>Outside host ka asli address / woh andar kaisa dikhta hai (outside NAT na ho to barabar).</dd>
<dt>Static NAT</dt><dd>Permanent one-to-one mapping; dono directions mein kaam karti hai.</dd>
<dt>Dynamic NAT</dt><dd>Pool se one-to-one mapping, jo inside host ke traffic bhejne par banti hai.</dd>
<dt>PAT / overload</dt><dd>Ports (ICMP query ID) use karke many-to-one translation.</dd>
<dt>Pool</dt><dd>Inside global addresses ki range: ip nat pool NAME first last netmask/prefix-length.</dd>
<dt>Simple vs extended entry</dt><dd>--- sirf address wali entry vs protocol aur ports wali per-flow entry.</dd>
<dt>CGNAT</dt><dd>100.64.0.0/10 shared address space use karne wala ISP-scale PAT (NAT444).</dd>
<dt>ALG / NAT-T</dt><dd>SIP aur FTP jaise protocols ka payload fix karna / UDP 4500 mein wrapped IPsec ESP.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (172.31.255.255 tak), 192.168.0.0/16.</li>
<li>Column order: Pro, Inside global, Inside local, Outside local, Outside global.</li>
<li>Sirf static NAT unsolicited inbound connections allow karta hai.</li>
<li>overload = PAT; iske bina dynamic NAT har address par ek host hai aur khatam ho jaata hai.</li>
<li>NAT ACL select karta hai kaun translate hoga; denied traffic bina translation jaata hai, NAT use drop nahi karta.</li>
<li>Static entries clear ip nat translation * ke baad bhi rehti hain; dynamic nahi.</li>
<li>Default idle timeouts: simple dynamic 24 h, TCP 24 h, UDP 300 s, ICMP 60 s.</li>
<li>Inside→outside: pehle route phir translate. Outside→inside: pehle translate phir route.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! labels</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
<span class="c">! static NAT aur port forwarding</span>
ip nat inside source static 172.16.10.80 203.0.113.5
ip nat inside source static tcp 172.16.10.80 80 203.0.113.6 8080
<span class="c">! dynamic NAT</span>
access-list 20 permit 10.20.0.0 0.0.0.255
ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
ip nat inside source list 20 pool PUBLIC
<span class="c">! interface par / pool par PAT</span>
access-list 1 permit 192.168.0.0 0.0.3.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
ip nat inside source list 20 pool PUBLIC overload
<span class="c">! timers aur verification</span>
ip nat translation timeout 3600
show ip nat translations [verbose]
show ip nat statistics
clear ip nat translation *
debug ip nat</pre>

<div class="eg"><p><b>Final worked example.</b> Requirement: 60 users ka office, ek ISP address, g0/1 par 203.0.113.18, g0/0 par LAN 192.168.1.0/24, aur ek web server 192.168.1.50 jo HTTPS par reachable hona chahiye. Jawab: g0/0 inside, g0/1 outside; <code>access-list 1 permit 192.168.1.0 0.0.0.255</code>; <code>ip nat inside source list 1 interface GigabitEthernet0/1 overload</code>; <code>ip nat inside source static tcp 192.168.1.50 443 interface GigabitEthernet0/1 443</code>. Statistics se verify karo, phir andar aur bahar se test, phir show ip nat translations.</p></div>

<div class="warn"><p><b>Common galti.</b> Viewpoint rules ke bina commands ratna. Zyada tar exam questions output dete hain aur poochte hain kaunsa address kya hai; terms aur column order syntax se zyada marks dilaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Drag-and-drop mein PC ke configured address ke liye "inside global" likha ho sakta hai. Yaad rakho: PC par type kiya address inside local hai; inside global woh hai jo internet dekhta hai.</p></div>

<div class="scn"><h4>NOC shift par aapka pehla hafta</h4><p>ISP-side NOC ke ek naye engineer ne ek hafte mein teen NAT tickets handle kiye: router swap ke baad inside/outside ulta wala clinic, ek college jiska naya VLAN NAT ACL se missing tha, aur ek customer jiska naya public block kabhi route nahi hua. Har ek mein minute lage kyunki usne same workflow chalaya: statistics, rule aur ACL, translations, pool, return route.</p><p><b>Seekh:</b> aapko tez workflow banata hai, kisi ek incident ki yaad nahi.</p></div>

<div class="iv"><p class="q">"Ek chhoti branch ke liye NAT configure karna samjhao."</p><p>Strong answer: inside aur outside interfaces pehchano aur label karo; users ke internet access ke liye LAN match karne wala standard ACL aur outside interface par overload ke saath PAT; server ke liye static mapping ya static port forward jodo; pakka karo ki ISP koi bhi public block aap tak route kare; asli test ke baad show ip nat statistics aur show ip nat translations se verify karo; timeouts, changes ke baad clear karna, traceability ke liye logging, aur ki IPv6 NAT ki zaroorat hata dega, yeh sab batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zaroorat se NAT type chuno: server publish (static), block se 1:1 (dynamic), bahut users (PAT).</li>
<li>Har NAT build = labels + rule (+ dynamic/PAT ke liye ACL aur pool) + verification.</li>
<li>Chaar terms aur column order pakke yaad rakho.</li>
<li>Order mein troubleshoot karo: labels, rule/ACL, translations, pool, return route.</li>
<li>NAT IPv4 ki umar badhata hai; IPv6 aur stateful firewalls long-term design hain.</li>
</ul></div>
`}};export{e as default};