var e={id:`troubleshooting`,h:{en:`Troubleshooting DHCP, DNS, NAT and time`,hi:`DHCP, DNS, NAT aur time ko troubleshoot karna`},body:{en:`
<p>A good doctor does not start with a brain scan. She checks pulse, temperature and blood pressure first, because those quick checks rule out most causes. Service troubleshooting works the same way: check the client's address, then the gateway, then names, then the edge, in that order. Each check takes seconds and cuts the problem in half.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Service troubleshooting flow">
<rect x="10" y="10" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Address?</text><text x="80" y="54" text-anchor="middle" class="svg-muted" font-size="12">show ip / ipconfig</text>
<rect x="170" y="10" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="240" y="34" text-anchor="middle" class="svg-ink" font-size="13">2. Gateway?</text><text x="240" y="54" text-anchor="middle" class="svg-muted" font-size="12">ping 192.168.10.1</text>
<rect x="330" y="10" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="34" text-anchor="middle" class="svg-ink" font-size="13">3. By IP vs name?</text><text x="400" y="54" text-anchor="middle" class="svg-muted" font-size="12">ping IP, nslookup</text>
<rect x="490" y="10" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="34" text-anchor="middle" class="svg-ink" font-size="13">4. Edge / NAT?</text><text x="560" y="54" text-anchor="middle" class="svg-muted" font-size="12">nat translations</text>
<line x1="150" y1="38" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="310" y1="38" x2="330" y2="38" stroke="#64748b" stroke-width="2"/><line x1="470" y1="38" x2="490" y2="38" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">169.254 = no DHCP</text><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="12">pool full?</text><text x="80" y="162" text-anchor="middle" class="svg-ink" font-size="12">helper missing?</text><text x="80" y="182" text-anchor="middle" class="svg-ink" font-size="12">wrong VLAN?</text>
<rect x="170" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="12">wrong default-router</text><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="12">IP conflict</text><text x="240" y="162" text-anchor="middle" class="svg-ink" font-size="12">wrong mask</text>
<rect x="330" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">no DNS server</text><text x="400" y="142" text-anchor="middle" class="svg-ink" font-size="12">NXDOMAIN</text><text x="400" y="162" text-anchor="middle" class="svg-ink" font-size="12">wrong record</text><text x="400" y="182" text-anchor="middle" class="svg-ink" font-size="12">hosts file / cache</text>
<rect x="490" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="12">inside/outside swapped</text><text x="560" y="142" text-anchor="middle" class="svg-ink" font-size="12">ACL mismatch</text><text x="560" y="162" text-anchor="middle" class="svg-ink" font-size="12">no overload</text><text x="560" y="182" text-anchor="middle" class="svg-ink" font-size="12">no default route</text>
</svg><p class="cap">Work left to right. The grey boxes list the usual culprits at each step.</p></div>

<h3>Step 1: does the client have a valid address? (DHCP)</h3>
<p>On a Windows client use <code>ipconfig /all</code>; in the lab use <code>show ip</code>. Read three things: the address, the gateway and the DNS server.</p>
<pre class="out">PC1&gt; ip dhcp
DDD
<span class="hl">Can't find dhcp server</span></pre>
<ul>
<li><b>169.254.x.x or "Can't find dhcp server"</b>: no Offer came back. Check that a pool exists for this subnet (<code>show ip dhcp pool</code>), that the relay is on the client-facing interface if the server is remote (<code>show ip interface</code>, "Helper address"), that the port is in the right VLAN, and that nothing blocks UDP 67/68.</li>
<li><b>Pool exhausted</b>: <code>show ip dhcp pool</code> shows leased addresses equal to the available addresses. Shorten the lease, clear stale bindings, or enlarge the subnet.</li>
<li><b>Address in the wrong subnet</b>: often a rogue DHCP server (a home router someone plugged in). Check "DHCP SERVER" on the client. DHCP snooping, covered in the security module, prevents this.</li>
<li><b>Conflicts</b>: the IOS server pings an address before offering it and records clashes.</li>
</ul>
<pre class="out">R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
<span class="hl">192.168.10.21     Ping               Mar 02 2026 09:01 AM</span></pre>
<p>A conflict means some device uses .21 statically without an exclusion. Find it, then exclude the address or move the device, and <code>clear ip dhcp conflict *</code>.</p>

<h3>Step 2: can the client reach its gateway?</h3>
<p>If the address is valid but <code>ping 192.168.10.1</code> fails, suspect a wrong <code>default-router</code> in the pool, a wrong mask, or a Layer 2 problem. If the gateway answers but remote subnets do not, it is a routing problem, not a service problem.</p>

<h3>Step 3: works by IP, fails by name? (DNS)</h3>
<p>This is the classic DNS signature. Compare <code>ping 10.0.20.10</code> with <code>ping web.nwk.lab</code>, then read the <code>nslookup</code> result carefully; each error points somewhere different.</p>
<pre class="out">PC1&gt; ping web.nwk.lab
<span class="hl">Cannot resolve web.nwk.lab (no DNS server set: ip dns &lt;server&gt;)</span>

PC2&gt; nslookup web.nwk.lab
Server:		192.168.10.1
Address:	192.168.10.1#53

<span class="hl">** server can't find web.nwk.lab: NXDOMAIN</span></pre>
<table class="cmp"><tr><th>Symptom</th><th>Meaning</th><th>Where to look</th></tr>
<tr><td>No DNS server set</td><td>The client has no resolver</td><td>DHCP option 6 or the client's static settings</td></tr>
<tr><td>Timed out / connection refused</td><td>The resolver is unreachable (timeout) or reachable but not running a DNS service (refused)</td><td><code>ip dns server</code>, ACLs blocking UDP 53, routing</td></tr>
<tr><td>NXDOMAIN</td><td>The server works but the name does not exist</td><td>The record (<code>show hosts</code>, zone file), typing errors</td></tr>
<tr><td>Wrong address returned</td><td>The record is wrong or stale</td><td>The record, TTL and caches, hosts file</td></tr>
</table>

<h3>Step 4: the edge (NAT/PAT)</h3>
<p>If internal resources work but the internet does not, go to the router doing NAT. First generate traffic, then look:</p>
<ul>
<li><code>show ip nat translations</code> is <b>empty</b>: the traffic is not being matched. Check <code>ip nat inside</code>/<code>outside</code> are on the right interfaces and that the ACL permits the client's subnet (check the wildcard). <code>show ip nat statistics</code> lists the inside and outside interfaces and the hit and miss counters.</li>
<li>Only <b>one host</b> works: <code>overload</code> is missing.</li>
<li>Translations appear but no replies: check the default route to the ISP and that the ISP routes the public address back.</li>
<li>Stuck or stale entries after a change: <code>clear ip nat translation *</code>. For live detail, <code>debug ip nat</code> shows each translation (use it carefully on busy routers).</li>
</ul>

<h3>Don't forget time</h3>
<p>If logins fail with "clock skew" errors or certificates look expired, run <code>show ntp status</code>. "Clock is unsynchronized" or stratum 16 means NTP is not working: check reachability of the servers and that UDP 123 is allowed.</p>

<div class="eg"><p><b>Worked example: running the labs in reverse.</b> Imagine each lab has been broken. Lab 1: PCs print "Can't find dhcp server"; <code>show ip dhcp pool</code> shows nothing, so the pool was never created. Lab 2: <code>nslookup</code> returns NXDOMAIN for files.nwk.lab; <code>show hosts</code> lists only web.nwk.lab, so the second <code>ip host</code> line is missing. Lab 3: PC1 cannot reach 8.8.8.8 and <code>show ip nat translations</code> is empty; <code>show ip nat statistics</code> lists Gi0/1 as the inside interface, so inside and outside were swapped.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jumping to the core network before checking the client's IP settings. (2) Using nslookup alone to prove DNS is fine: nslookup ignores the hosts file, while applications do not. (3) Checking NAT translations without generating traffic first; an idle table is always empty.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom-to-cause pairs are heavily tested: 169.254 = DHCP failure; ping by IP works but not by name = DNS; only remote VLAN clients fail DHCP = missing IP helper; internal works, internet fails = NAT or default route; many users suddenly get no address = pool exhausted.</p></div>

<div class="scn"><h4>Guests get addresses, but nothing loads</h4><p>A hotel's guest Wi-Fi gave every phone an address, but no page would load. Step 1: address valid, gateway valid, DNS server <code>192.168.50.1</code>. Step 2: gateway ping fine. Step 3: ping to 8.8.8.8 by IP worked, but names failed with timeouts. The guest router's DNS forwarder had been disabled in a firmware update. Re-enabling it fixed resolution. Because the engineer followed the steps, the problem was found in five minutes instead of blaming the ISP.</p><p><b>Lesson:</b> a structured order (address, gateway, name, edge) finds service faults quickly.</p></div>

<div class="iv"><p class="q">"Users can reach websites by IP address but not by name. How do you troubleshoot?"</p><p>Strong answer: that isolates the problem to name resolution. Check the client's DNS server (ipconfig /all, DHCP option 6), then test with nslookup: timeout means the resolver is unreachable or down, NXDOMAIN means the record is missing, a wrong address means a bad or cached record. Check the hosts file and flush the local cache on a single affected PC. On the server side, verify the service is running and UDP 53 is not blocked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: address (DHCP) → gateway → name (DNS) → edge (NAT) → time (NTP).</li>
<li>DHCP tools: <code>show ip dhcp pool</code>, <code>binding</code>, <code>conflict</code>, <code>show ip interface</code> for helpers.</li>
<li>DNS: read nslookup errors: no server, timeout, NXDOMAIN, wrong address each point elsewhere.</li>
<li>NAT: generate traffic, then <code>show ip nat translations</code> and <code>statistics</code>; check inside/outside, ACL, overload, default route.</li>
<li>Time: <code>show ntp status</code>; stratum 16 means unsynchronised.</li>
</ul></div>
`,hi:`
<p>Achhi doctor brain scan se shuru nahi karti. Woh pehle pulse, temperature aur blood pressure check karti hai, kyunki yeh quick checks zyada tar causes rule out kar dete hain. Service troubleshooting bhi aise hi kaam karti hai: pehle client ka address, phir gateway, phir names, phir edge, isi order mein. Har check seconds leta hai aur problem ko aadha kar deta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Service troubleshooting flow">
<rect x="10" y="10" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Address?</text><text x="80" y="54" text-anchor="middle" class="svg-muted" font-size="12">show ip / ipconfig</text>
<rect x="170" y="10" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="240" y="34" text-anchor="middle" class="svg-ink" font-size="13">2. Gateway?</text><text x="240" y="54" text-anchor="middle" class="svg-muted" font-size="12">ping 192.168.10.1</text>
<rect x="330" y="10" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="34" text-anchor="middle" class="svg-ink" font-size="13">3. IP vs naam?</text><text x="400" y="54" text-anchor="middle" class="svg-muted" font-size="12">ping IP, nslookup</text>
<rect x="490" y="10" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="34" text-anchor="middle" class="svg-ink" font-size="13">4. Edge / NAT?</text><text x="560" y="54" text-anchor="middle" class="svg-muted" font-size="12">nat translations</text>
<line x1="150" y1="38" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="310" y1="38" x2="330" y2="38" stroke="#64748b" stroke-width="2"/><line x1="470" y1="38" x2="490" y2="38" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">169.254 = DHCP nahi</text><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="12">pool full?</text><text x="80" y="162" text-anchor="middle" class="svg-ink" font-size="12">helper missing?</text><text x="80" y="182" text-anchor="middle" class="svg-ink" font-size="12">galat VLAN?</text>
<rect x="170" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="12">galat default-router</text><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="12">IP conflict</text><text x="240" y="162" text-anchor="middle" class="svg-ink" font-size="12">galat mask</text>
<rect x="330" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">DNS server nahi</text><text x="400" y="142" text-anchor="middle" class="svg-ink" font-size="12">NXDOMAIN</text><text x="400" y="162" text-anchor="middle" class="svg-ink" font-size="12">galat record</text><text x="400" y="182" text-anchor="middle" class="svg-ink" font-size="12">hosts file / cache</text>
<rect x="490" y="100" width="140" height="130" rx="8" fill="#e2e8f0"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="12">inside/outside ulta</text><text x="560" y="142" text-anchor="middle" class="svg-ink" font-size="12">ACL mismatch</text><text x="560" y="162" text-anchor="middle" class="svg-ink" font-size="12">overload nahi</text><text x="560" y="182" text-anchor="middle" class="svg-ink" font-size="12">default route nahi</text>
</svg><p class="cap">Left se right kaam karo. Grey boxes har step ke usual culprits list karte hain.</p></div>

<h3>Step 1: kya client ke paas valid address hai? (DHCP)</h3>
<p>Windows client par <code>ipconfig /all</code> use karo; lab mein <code>show ip</code>. Teen cheezein padho: address, gateway aur DNS server.</p>
<pre class="out">PC1&gt; ip dhcp
DDD
<span class="hl">Can't find dhcp server</span></pre>
<ul>
<li><b>169.254.x.x ya "Can't find dhcp server"</b>: koi Offer wapas nahi aaya. Check karo ki is subnet ka pool hai (<code>show ip dhcp pool</code>), server remote ho to relay client-facing interface par hai (<code>show ip interface</code>, "Helper address"), port sahi VLAN mein hai, aur kuch UDP 67/68 block nahi kar raha.</li>
<li><b>Pool exhausted</b>: <code>show ip dhcp pool</code> leased addresses ko available addresses ke barabar dikhata hai. Lease chhoti karo, stale bindings clear karo, ya subnet bada karo.</li>
<li><b>Galat subnet ka address</b>: aksar rogue DHCP server (kisi ka lagaya ghar ka router). Client par "DHCP SERVER" check karo. DHCP snooping, jo security module mein cover hai, ise rokta hai.</li>
<li><b>Conflicts</b>: IOS server address offer karne se pehle use ping karta hai aur clashes record karta hai.</li>
</ul>
<pre class="out">R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
<span class="hl">192.168.10.21     Ping               Mar 02 2026 09:01 AM</span></pre>
<p>Conflict ka matlab hai koi device bina exclusion ke .21 statically use kar raha hai. Use dhoondho, phir address exclude karo ya device move karo, aur <code>clear ip dhcp conflict *</code> chalao.</p>

<h3>Step 2: kya client apne gateway tak pahunchta hai?</h3>
<p>Agar address valid hai lekin <code>ping 192.168.10.1</code> fail hota hai, to pool mein galat <code>default-router</code>, galat mask, ya Layer 2 problem ka shak karo. Agar gateway jawab deta hai lekin remote subnets nahi, to yeh routing problem hai, service problem nahi.</p>

<h3>Step 3: IP se chalta hai, naam se fail? (DNS)</h3>
<p>Yeh classic DNS signature hai. <code>ping 10.0.20.10</code> ko <code>ping web.nwk.lab</code> se compare karo, phir <code>nslookup</code> result dhyan se padho; har error alag jagah point karta hai.</p>
<pre class="out">PC1&gt; ping web.nwk.lab
<span class="hl">Cannot resolve web.nwk.lab (no DNS server set: ip dns &lt;server&gt;)</span>

PC2&gt; nslookup web.nwk.lab
Server:		192.168.10.1
Address:	192.168.10.1#53

<span class="hl">** server can't find web.nwk.lab: NXDOMAIN</span></pre>
<table class="cmp"><tr><th>Symptom</th><th>Matlab</th><th>Kahan dekhna hai</th></tr>
<tr><td>No DNS server set</td><td>Client ke paas resolver nahi</td><td>DHCP option 6 ya client ki static settings</td></tr>
<tr><td>Timed out / connection refused</td><td>Resolver unreachable hai (timeout) ya reachable hai lekin DNS service nahi chala raha (refused)</td><td><code>ip dns server</code>, UDP 53 block karne wale ACLs, routing</td></tr>
<tr><td>NXDOMAIN</td><td>Server chal raha hai lekin naam exist nahi karta</td><td>Record (<code>show hosts</code>, zone file), typing errors</td></tr>
<tr><td>Galat address aaya</td><td>Record galat ya purana hai</td><td>Record, TTL aur caches, hosts file</td></tr>
</table>

<h3>Step 4: edge (NAT/PAT)</h3>
<p>Agar internal resources chalte hain lekin internet nahi, to NAT karne wale router par jao. Pehle traffic generate karo, phir dekho:</p>
<ul>
<li><code>show ip nat translations</code> <b>khaali</b> hai: traffic match nahi ho raha. Check karo ki <code>ip nat inside</code>/<code>outside</code> sahi interfaces par hain aur ACL client ke subnet ko permit karta hai (wildcard check karo). <code>show ip nat statistics</code> inside aur outside interfaces aur hit aur miss counters list karta hai.</li>
<li>Sirf <b>ek host</b> chalta hai: <code>overload</code> missing hai.</li>
<li>Translations dikhte hain lekin replies nahi: ISP ki taraf default route aur ISP public address wapas route karta hai ya nahi, check karo.</li>
<li>Change ke baad atki ya purani entries: <code>clear ip nat translation *</code>. Live detail ke liye <code>debug ip nat</code> har translation dikhata hai (busy routers par dhyan se use karo).</li>
</ul>

<h3>Time mat bhoolo</h3>
<p>Agar logins "clock skew" errors ke saath fail hon ya certificates expired dikhein, to <code>show ntp status</code> chalao. "Clock is unsynchronized" ya stratum 16 ka matlab NTP kaam nahi kar raha: servers ki reachability aur UDP 123 allowed hai ya nahi check karo.</p>

<div class="eg"><p><b>Worked example: labs ko ulta chalana.</b> Socho har lab tod diya gaya hai. Lab 1: PCs "Can't find dhcp server" print karte hain; <code>show ip dhcp pool</code> kuch nahi dikhata, to pool kabhi bana hi nahi. Lab 2: <code>nslookup</code> files.nwk.lab ke liye NXDOMAIN deta hai; <code>show hosts</code> sirf web.nwk.lab list karta hai, to doosri <code>ip host</code> line missing hai. Lab 3: PC1 8.8.8.8 tak nahi pahunchta aur <code>show ip nat translations</code> khaali hai; <code>show ip nat statistics</code> Gi0/1 ko inside interface list karta hai, to inside aur outside ulte the.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Client ki IP settings check kiye bina core network par kood jaana. (2) Sirf nslookup se saabit karna ki DNS theek hai: nslookup hosts file ignore karta hai, applications nahi. (3) Pehle traffic generate kiye bina NAT translations check karna; idle table hamesha khaali hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom-to-cause pairs bahut test hote hain: 169.254 = DHCP failure; IP se ping chale lekin naam se nahi = DNS; sirf remote VLAN ke clients DHCP mein fail = missing IP helper; internal chale, internet fail = NAT ya default route; bahut saare users ko achanak address na mile = pool exhausted.</p></div>

<div class="scn"><h4>Guests ko addresses milte hain, lekin kuch load nahi hota</h4><p>Ek hotel ka guest Wi-Fi har phone ko address de raha tha, lekin koi page load nahi ho raha tha. Step 1: address valid, gateway valid, DNS server <code>192.168.50.1</code>. Step 2: gateway ping theek. Step 3: IP se 8.8.8.8 ping chala, lekin names timeouts ke saath fail hue. Firmware update mein guest router ka DNS forwarder disable ho gaya tha. Use dobara enable karne se resolution theek ho gaya. Kyunki engineer ne steps follow kiye, problem ISP ko blame karne ki jagah paanch minute mein mil gayi.</p><p><b>Seekh:</b> structured order (address, gateway, naam, edge) service faults jaldi dhoondhta hai.</p></div>

<div class="iv"><p class="q">"Users websites ko IP address se khol paate hain lekin naam se nahi. Aap kaise troubleshoot karoge?"</p><p>Strong answer: isse problem name resolution tak isolate ho jaati hai. Client ka DNS server check karo (ipconfig /all, DHCP option 6), phir nslookup se test karo: timeout matlab resolver unreachable ya down, NXDOMAIN matlab record missing, galat address matlab kharab ya cached record. Ek affected PC par hosts file check karo aur local cache flush karo. Server side par verify karo ki service chal rahi hai aur UDP 53 block nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: address (DHCP) → gateway → naam (DNS) → edge (NAT) → time (NTP).</li>
<li>DHCP tools: <code>show ip dhcp pool</code>, <code>binding</code>, <code>conflict</code>, helpers ke liye <code>show ip interface</code>.</li>
<li>DNS: nslookup errors padho: no server, timeout, NXDOMAIN, galat address har ek alag jagah point karta hai.</li>
<li>NAT: traffic generate karo, phir <code>show ip nat translations</code> aur <code>statistics</code>; inside/outside, ACL, overload, default route check karo.</li>
<li>Time: <code>show ntp status</code>; stratum 16 matlab unsynchronised.</li>
</ul></div>
`}};export{e as default};