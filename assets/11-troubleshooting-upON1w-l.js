var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: "no address" and "works by IP only"`,hi:`Troubleshooting workflow: "address nahi" aur "sirf IP se chalta hai"`},body:{en:`
<p>A good mechanic does not replace parts at random. They follow the fuel from the tank to the engine and find exactly where it stops. DHCP and DNS faults are the same: the request travels a known path, client to switch to relay to server and back. Follow it in order and the fault has nowhere to hide. This chapter gives you two workflows and walks through the module's troubleshoot lab.</p>

<h3>Workflow 1: "I have no address"</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="No address troubleshooting flow">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1 Client: 169.254?</text><text x="105" y="50" text-anchor="middle" class="svg-muted" font-size="12">ipconfig /all, link up</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2 Access port</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">VLAN, err-disabled, snooping</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3 Local or remote?</text><text x="535" y="50" text-anchor="middle" class="svg-muted" font-size="12">who else is affected</text>
<rect x="10" y="110" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="13">4 Relay</text><text x="105" y="150" text-anchor="middle" class="svg-muted" font-size="12">helper on client side</text>
<rect x="225" y="110" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">5 Path both ways</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">routes, ACL on UDP 67</text>
<rect x="440" y="110" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="132" text-anchor="middle" class="svg-ink" font-size="13">6 Server</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">stats, pool, exclusions</text>
<rect x="160" y="195" width="320" height="46" rx="8" fill="#fed7aa"/><text x="320" y="216" text-anchor="middle" class="svg-ink" font-size="13">7 Got an address? Check gateway and DNS</text><text x="320" y="233" text-anchor="middle" class="svg-muted" font-size="12">ping gateway, then beyond, then by name</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="60" x2="105" y2="110" stroke="#64748b" stroke-width="2"/><line x1="200" y1="135" x2="225" y2="135" stroke="#64748b" stroke-width="2"/><line x1="415" y1="135" x2="440" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="160" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Follow the Discover: client, access port, relay, path, server; then check what the lease contains.</p></div>
<ol>
<li><b>Client.</b> Does it have 169.254.x.x, or "Can't find dhcp server"? Is the link up? A static address configured by mistake?</li>
<li><b>Access port.</b> Right VLAN? Port up, not err-disabled? If DHCP snooping is on, is the uplink toward the server trusted? (Layer 2 security module.)</li>
<li><b>Scope of the problem.</b> One user, one subnet, or everybody? If local clients on the server's own subnet work and remote ones fail, suspect the relay or the path. If everyone fails, suspect the server.</li>
<li><b>Relay.</b> <code>show ip interface GIGx/x | include Helper</code> on the client's gateway. Present? Correct address? On the client-facing interface?</li>
<li><b>Path.</b> Can the relay ping the helper address? Does the server have a route back to the client subnet (the giaddr)? Any ACL dropping UDP 67?</li>
<li><b>Server.</b> <code>show ip dhcp server statistics</code> (are Discovers arriving?), <code>show ip dhcp pool</code> (is anything available?), <code>show ip dhcp conflict</code>, and <code>show running-config | include service dhcp</code>.</li>
<li><b>Lease contents.</b> Once an address arrives, confirm gateway and DNS: ping the gateway, an address beyond it, then a name.</li>
</ol>

<h3>Lab walkthrough: "Clients get no address"</h3>
<p>The ticket: on Monday morning no PC on the campus or in the annex gets an address. R1 is the DHCP server for both subnets; the addressing plan reserves only .1–.10 of the campus subnet. Both the campus (local) and the annex (relayed) fail, which hints at <b>two separate faults</b>. Start on the server.</p>
<pre class="out">R1# show ip dhcp pool CAMPUS

Pool CAMPUS :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 0
 <span class="hl">Excluded addresses             : 254</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased/Excluded/Total
 <span class="hl">0.0.0.0</span>              192.168.10.1     - 192.168.10.254    0     / 254   / 254</pre>
<p>Excluded equals Total and the current index is 0.0.0.0: nothing can ever be leased. The running-config shows <code>ip dhcp excluded-address 192.168.10.1 192.168.10.254</code>. Fix it to match the plan:</p>
<pre class="code">R1(config)# no ip dhcp excluded-address 192.168.10.1 192.168.10.254
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10</pre>
<p>Now <code>ip dhcp</code> on PC1 and PC2 returns 192.168.10.11 and .12. The annex still fails, so the second fault is between the annex and R1. Look at the relay:</p>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.20.1/24
  <span class="hl">Helper address is 10.1.21.1</span></pre>
<p>R1's address on the R1–R2 link is 10.1.<b>12</b>.1; the helper says 10.1.<b>21</b>.1, a typo that points into nowhere. Remove the wrong helper and add the right one:</p>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip helper-address 10.1.21.1
R2(config-if)# ip helper-address 10.1.12.1</pre>
<pre class="out">PC3&gt; ip dhcp
<span class="hl">DDORA IP 192.168.20.2/24 GW 192.168.20.1</span>
PC3&gt; ping 192.168.10.11
84 bytes from 192.168.10.11 icmp_seq=1 ttl=62 time=0.700 ms</pre>
<p>Both faults fixed, every PC online. Note in passing: the ANNEX pool has no exclusion at all, so its first client got .2. That is not today's fault, but you would raise it with the team, because a printer or switch later placed at .2 would conflict.</p>

<h3>Workflow 2: "It works by IP but not by name"</h3>
<ol>
<li><b>Prove it.</b> <code>ping 10.1.100.80</code> works; <code>ping www.nwk.lab</code> says it cannot resolve the name. Routing is fine; the problem is name resolution.</li>
<li><b>Which DNS server does the client use?</b> <code>ipconfig /all</code> or <code>resolvectl status</code>. Missing or wrong? Fix the pool's <code>dns-server</code> and renew.</li>
<li><b>Can the client reach it?</b> <code>ping 10.1.100.53</code>. Then <code>nslookup www.nwk.lab 10.1.100.53</code>. A timeout means the server is unreachable on UDP 53 (routing, ACL, firewall, service down).</li>
<li><b>What does it answer?</b> NXDOMAIN means the record is missing or you asked for the wrong name (check the domain suffix, option 15). A wrong address means a wrong record or a stale cache.</li>
<li><b>Local overrides.</b> If nslookup is right but ping or the browser is wrong, check the hosts file and flush the local cache (<code>ipconfig /flushdns</code>).</li>
</ol>

<h4>Diagnosing a wrong DNS record</h4>
<pre class="out">$ dig www.nwk.lab +noall +answer
<span class="hl">www.nwk.lab.		3600	IN	A	10.1.100.81</span>
$ ping -c 1 10.1.100.80
64 bytes from 10.1.100.80: icmp_seq=1 ttl=63 time=0.61 ms</pre>
<p>The web server really lives at 10.1.100.80, but DNS says .81. Ask the authoritative server directly (<code>dig @ns1.nwk.lab www.nwk.lab</code>): if it also says .81, the zone record is wrong; fix it and increase the zone serial. If the authoritative server says .80 but the resolver says .81, the resolver is serving a cached old answer until the TTL (3600 s) expires; flush the resolver cache if you control it, then the client cache.</p>

<div class="eg"><p><b>Worked example: which workflow?</b> Ticket A: "Laptop shows 169.254.12.7." That is workflow 1, the DHCP exchange failed. Ticket B: "Laptop has 192.168.10.23, can open 10.1.100.80, but not www.nwk.lab." That is workflow 2, DHCP worked, DNS did not. Ticket C: "Laptop has 192.168.10.23 but cannot reach anything outside its subnet." DHCP worked, but the lease's gateway (option 3) is wrong or the gateway interface is down.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rebooting the DHCP server before looking at its statistics. Fixing only the first fault and closing the ticket while the annex is still down. Blaming DNS when the client has a 169.254 address. Changing a DNS record and forgetting cached copies.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local subnet works, remote fails: relay or return route. All subnets fail: server (service dhcp, pool, exclusions). Address but no internet: gateway option. Works by IP only: DNS option, reachability of UDP 53, or the record itself.</p></div>

<div class="scn"><h4>The Monday morning ticket, done properly</h4><p>A junior engineer received the "no addresses anywhere" ticket and restarted R1 first. Nothing changed. The senior engineer asked one question: "Did the Discovers arrive?" <code>show ip dhcp server statistics</code> showed Discovers from the campus but none from the annex, splitting the problem in two. The pool check found the exclusion covering the whole campus subnet; the relay check found the 10.1.21.1 typo. Twelve minutes, two precise changes, and a note in the change log.</p><p><b>Lesson:</b> the statistics counter tells you which half of the path to look at. Measure first, change second.</p></div>

<div class="iv"><p class="q">"A user can ping 8.8.8.8 but cannot open any website. How do you troubleshoot?"</p><p>It works by IP, so routing and NAT are fine; focus on DNS. Check the client's DNS servers with <code>ipconfig /all</code>, ping the DNS server, run <code>nslookup</code> against it and against a known-good resolver, read the result (timeout vs NXDOMAIN vs wrong address), check for an ACL/firewall blocking UDP 53, and finally the hosts file and local cache. Name each tool's evidence rather than guessing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"No address": follow the Discover from client to access port, relay, path and server, in order.</li>
<li>Server statistics show whether Discovers arrive; the pool shows whether anything is left to give.</li>
<li>Lab faults: exclusion covering the whole campus subnet, and helper typo 10.1.21.1 instead of 10.1.12.1.</li>
<li>"Works by IP only": check the client's DNS server, reachability on UDP 53, the answer, then local overrides.</li>
<li>A wrong answer can be a wrong record or a stale cache; compare the authoritative answer with the resolver's.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts random nahi badalta. Woh fuel ko tank se engine tak follow karta hai aur theek wahi jagah dhoondhta hai jahan woh rukta hai. DHCP aur DNS faults bhi aise hi hain: request ek jaane-pehchaane path par chalti hai, client se switch, relay, server aur wapas. Ise order mein follow karo to fault ko chhupne ki jagah nahi milti. Yeh chapter aapko do workflows deta hai aur module ke troubleshoot lab ko step by step karta hai.</p>

<h3>Workflow 1: "Mere paas address nahi hai"</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Address nahi troubleshooting flow">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1 Client: 169.254?</text><text x="105" y="50" text-anchor="middle" class="svg-muted" font-size="12">ipconfig /all, link up</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2 Access port</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">VLAN, err-disabled, snooping</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3 Local ya remote?</text><text x="535" y="50" text-anchor="middle" class="svg-muted" font-size="12">aur kaun affected hai</text>
<rect x="10" y="110" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="13">4 Relay</text><text x="105" y="150" text-anchor="middle" class="svg-muted" font-size="12">client side par helper</text>
<rect x="225" y="110" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">5 Path dono taraf</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">routes, UDP 67 par ACL</text>
<rect x="440" y="110" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="132" text-anchor="middle" class="svg-ink" font-size="13">6 Server</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">stats, pool, exclusions</text>
<rect x="160" y="195" width="320" height="46" rx="8" fill="#fed7aa"/><text x="320" y="216" text-anchor="middle" class="svg-ink" font-size="13">7 Address mila? Gateway aur DNS check karo</text><text x="320" y="233" text-anchor="middle" class="svg-muted" font-size="12">gateway ping, phir aage, phir naam se</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="60" x2="105" y2="110" stroke="#64748b" stroke-width="2"/><line x1="200" y1="135" x2="225" y2="135" stroke="#64748b" stroke-width="2"/><line x1="415" y1="135" x2="440" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="160" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Discover ko follow karo: client, access port, relay, path, server; phir dekho lease mein kya hai.</p></div>
<ol>
<li><b>Client.</b> Kya uske paas 169.254.x.x hai, ya "Can't find dhcp server"? Link up hai? Galti se static address configure to nahi?</li>
<li><b>Access port.</b> Sahi VLAN? Port up hai, err-disabled nahi? Agar DHCP snooping on hai, to server ki taraf ka uplink trusted hai? (Layer 2 security module.)</li>
<li><b>Problem ka scope.</b> Ek user, ek subnet, ya sab? Agar server ke apne subnet ke local clients chal rahe hain aur remote fail, to relay ya path par shak karo. Agar sab fail, to server par shak karo.</li>
<li><b>Relay.</b> Client ke gateway par <code>show ip interface GIGx/x | include Helper</code>. Hai? Sahi address? Client-facing interface par?</li>
<li><b>Path.</b> Kya relay helper address ping kar sakta hai? Kya server ke paas client subnet (giaddr) ka wapas route hai? Koi ACL UDP 67 drop to nahi kar raha?</li>
<li><b>Server.</b> <code>show ip dhcp server statistics</code> (Discovers aa rahe hain?), <code>show ip dhcp pool</code> (kuch available hai?), <code>show ip dhcp conflict</code>, aur <code>show running-config | include service dhcp</code>.</li>
<li><b>Lease ka content.</b> Address aane ke baad gateway aur DNS confirm karo: gateway ping karo, uske aage ka address, phir ek naam.</li>
</ol>

<h3>Lab walkthrough: "Clients ko address nahi mil raha"</h3>
<p>Ticket: Monday subah campus aur annex ke kisi bhi PC ko address nahi milta. R1 dono subnets ka DHCP server hai; addressing plan campus subnet ke sirf .1–.10 reserve karta hai. Campus (local) aur annex (relayed) dono fail hain, jo <b>do alag faults</b> ki taraf ishara karta hai. Server se shuru karo.</p>
<pre class="out">R1# show ip dhcp pool CAMPUS

Pool CAMPUS :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 0
 <span class="hl">Excluded addresses             : 254</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased/Excluded/Total
 <span class="hl">0.0.0.0</span>              192.168.10.1     - 192.168.10.254    0     / 254   / 254</pre>
<p>Excluded Total ke barabar hai aur current index 0.0.0.0 hai: kuch bhi kabhi lease nahi ho sakta. Running-config mein <code>ip dhcp excluded-address 192.168.10.1 192.168.10.254</code> dikhta hai. Plan ke hisaab se theek karo:</p>
<pre class="code">R1(config)# no ip dhcp excluded-address 192.168.10.1 192.168.10.254
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10</pre>
<p>Ab PC1 aur PC2 par <code>ip dhcp</code> 192.168.10.11 aur .12 deta hai. Annex ab bhi fail hai, to doosra fault annex aur R1 ke beech hai. Relay dekho:</p>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.20.1/24
  <span class="hl">Helper address is 10.1.21.1</span></pre>
<p>R1–R2 link par R1 ka address 10.1.<b>12</b>.1 hai; helper kehta hai 10.1.<b>21</b>.1, ek typo jo kahin nahi point karta. Galat helper hatao aur sahi add karo:</p>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip helper-address 10.1.21.1
R2(config-if)# ip helper-address 10.1.12.1</pre>
<pre class="out">PC3&gt; ip dhcp
<span class="hl">DDORA IP 192.168.20.2/24 GW 192.168.20.1</span>
PC3&gt; ping 192.168.10.11
84 bytes from 192.168.10.11 icmp_seq=1 ttl=62 time=0.700 ms</pre>
<p>Dono faults theek, har PC online. Saath mein dhyan do: ANNEX pool mein koi exclusion hai hi nahi, isliye uske pehle client ko .2 mila. Yeh aaj ka fault nahi hai, lekin aap team ke saath ise uthaoge, kyunki baad mein .2 par laga koi printer ya switch conflict karega.</p>

<h3>Workflow 2: "IP se chalta hai lekin naam se nahi"</h3>
<ol>
<li><b>Saabit karo.</b> <code>ping 10.1.100.80</code> chalta hai; <code>ping www.nwk.lab</code> kehta hai naam resolve nahi hua. Routing theek hai; problem name resolution hai.</li>
<li><b>Client kaunsa DNS server use karta hai?</b> <code>ipconfig /all</code> ya <code>resolvectl status</code>. Missing ya galat? Pool ka <code>dns-server</code> theek karo aur renew karo.</li>
<li><b>Client us tak pahunch sakta hai?</b> <code>ping 10.1.100.53</code>. Phir <code>nslookup www.nwk.lab 10.1.100.53</code>. Timeout ka matlab server UDP 53 par unreachable hai (routing, ACL, firewall, service down).</li>
<li><b>Woh kya jawab deta hai?</b> NXDOMAIN ka matlab record missing hai ya aapne galat naam poocha (domain suffix, option 15 check karo). Galat address ka matlab galat record ya purana cache.</li>
<li><b>Local overrides.</b> Agar nslookup sahi hai lekin ping ya browser galat, to hosts file check karo aur local cache flush karo (<code>ipconfig /flushdns</code>).</li>
</ol>

<h4>Galat DNS record diagnose karna</h4>
<pre class="out">$ dig www.nwk.lab +noall +answer
<span class="hl">www.nwk.lab.		3600	IN	A	10.1.100.81</span>
$ ping -c 1 10.1.100.80
64 bytes from 10.1.100.80: icmp_seq=1 ttl=63 time=0.61 ms</pre>
<p>Web server asal mein 10.1.100.80 par hai, lekin DNS .81 kehta hai. Authoritative server se seedha poocho (<code>dig @ns1.nwk.lab www.nwk.lab</code>): agar woh bhi .81 kehta hai, to zone record galat hai; use theek karo aur zone serial badhao. Agar authoritative server .80 kehta hai lekin resolver .81, to resolver TTL (3600 s) khatam hone tak purana cached jawab de raha hai; agar aapke control mein hai to resolver cache flush karo, phir client cache.</p>

<div class="eg"><p><b>Worked example: kaunsa workflow?</b> Ticket A: "Laptop 169.254.12.7 dikhata hai." Yeh workflow 1 hai, DHCP exchange fail hua. Ticket B: "Laptop ke paas 192.168.10.23 hai, 10.1.100.80 khul jaata hai, lekin www.nwk.lab nahi." Yeh workflow 2 hai, DHCP chala, DNS nahi. Ticket C: "Laptop ke paas 192.168.10.23 hai lekin apne subnet ke bahar kuch nahi pahunchta." DHCP chala, lekin lease ka gateway (option 3) galat hai ya gateway interface down hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> DHCP server ke statistics dekhne se pehle use reboot karna. Sirf pehla fault theek karke ticket band karna jabki annex abhi bhi down hai. Client ke paas 169.254 address hone par DNS ko blame karna. DNS record badalna aur cached copies bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local subnet chalta hai, remote fail: relay ya return route. Saare subnets fail: server (service dhcp, pool, exclusions). Address hai lekin internet nahi: gateway option. Sirf IP se chalta hai: DNS option, UDP 53 ki reachability, ya record khud.</p></div>

<div class="scn"><h4>Monday subah ka ticket, sahi tarike se</h4><p>Ek junior engineer ko "kahin bhi address nahi" wala ticket mila aur usne pehle R1 restart kiya. Kuch nahi badla. Senior engineer ne ek sawaal poocha: "Discovers pahunche?" <code>show ip dhcp server statistics</code> ne campus se Discovers dikhaye lekin annex se ek bhi nahi, jisse problem do hisson mein bat gayi. Pool check mein exclusion poore campus subnet ko cover karta mila; relay check mein 10.1.21.1 typo mila. Baarah minute, do sateek changes, aur change log mein ek note.</p><p><b>Seekh:</b> statistics counter batata hai path ke kaunse aadhe hisse ko dekhna hai. Pehle naapo, phir badlo.</p></div>

<div class="iv"><p class="q">"User 8.8.8.8 ping kar sakta hai lekin koi website nahi khol paata. Kaise troubleshoot karoge?"</p><p>IP se chalta hai, to routing aur NAT theek hain; DNS par focus karo. <code>ipconfig /all</code> se client ke DNS servers check karo, DNS server ping karo, us par aur ek known-good resolver par <code>nslookup</code> chalao, result padho (timeout vs NXDOMAIN vs galat address), UDP 53 block karne wala ACL/firewall check karo, aur aakhir mein hosts file aur local cache. Andaza lagane ki jagah har tool ka saboot batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"Address nahi": Discover ko client se access port, relay, path aur server tak, order mein follow karo.</li>
<li>Server statistics batate hain Discovers aa rahe hain ya nahi; pool batata hai dene ko kuch bacha hai ya nahi.</li>
<li>Lab faults: poore campus subnet ko cover karta exclusion, aur 10.1.12.1 ki jagah helper typo 10.1.21.1.</li>
<li>"Sirf IP se chalta hai": client ka DNS server, UDP 53 par reachability, jawab, phir local overrides check karo.</li>
<li>Galat jawab galat record ya purana cache ho sakta hai; authoritative jawab ko resolver ke jawab se compare karo.</li>
</ul></div>
`}};export{e as default};