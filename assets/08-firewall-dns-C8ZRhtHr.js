var e={id:`firewall-dns`,h:{en:`Firewalls and DNS in front of an application`,hi:`Application ke aage firewalls aur DNS`},body:{en:`
<p>Before any request reaches your code, two infrastructure services have already acted on it: DNS decided <i>where</i> it goes, and a firewall decided <i>whether</i> it may go. If either is wrong, the best application in the world looks broken or exposed. This chapter shows how each works, where it sits in a deployment, and how to check it.</p>

<h3>Analogy: the phone book and the gatekeeper</h3>
<p>DNS is the phone book: you know the company's name, the book gives you the number. A firewall is the gatekeeper at the compound: even if you have the right address, the gatekeeper checks whether visitors like you may enter through that particular door.</p>

<h3>The firewall: what it does and where it sits</h3>
<p>A <b>firewall</b> permits or blocks traffic according to rules. A <b>stateful</b> firewall tracks connections, so replies to allowed outgoing connections are let back in automatically, while unsolicited incoming traffic is judged by the rules. Rules match source and destination address, protocol and port, and the last rule is an implicit <b>deny</b>. The first matching rule wins, so order matters.</p>
<table class="cmp"><tr><th>Placement</th><th>Protects</th><th>Typical rule for a web application</th></tr>
<tr><td>Perimeter (edge) firewall</td><td>The whole site from the internet</td><td>Allow TCP 443 (and 80 for redirect) to the web tier only</td></tr>
<tr><td>Internal / segmentation firewall</td><td>Tiers from each other (web, app, database)</td><td>Allow web tier to app port; allow app tier to database port; nothing else</td></tr>
<tr><td>Host firewall (for example ufw)</td><td>One server, even if the network layer fails</td><td>Allow the app port from the proxy, SSH from the management network, deny the rest</td></tr>
<tr><td>Cloud security group</td><td>An instance or subnet in the cloud</td><td>Same logic, written as allow-lists</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three-tier network with firewalls">
<rect x="20" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="150" y="95" width="80" height="60" rx="8" fill="#fde68a"/><text x="190" y="120" text-anchor="middle" class="svg-ink" font-size="12">Edge</text><text x="190" y="136" text-anchor="middle" class="svg-ink" font-size="12">firewall</text>
<rect x="270" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="335" y="55" text-anchor="middle" class="svg-ink" font-size="12">DMZ</text><text x="335" y="72" text-anchor="middle" class="svg-muted" font-size="11">proxy, web, 443</text>
<rect x="270" y="160" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="185" text-anchor="middle" class="svg-ink" font-size="12">App tier</text><text x="335" y="202" text-anchor="middle" class="svg-muted" font-size="11">8080 from DMZ only</text>
<rect x="470" y="160" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="12">Database</text><text x="545" y="202" text-anchor="middle" class="svg-muted" font-size="11">5432 from app only</text>
<line x1="110" y1="125" x2="148" y2="125" stroke="#64748b" stroke-width="2"/><line x1="230" y1="110" x2="268" y2="70" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="335" y2="158" stroke="#64748b" stroke-width="2"/><line x1="400" y1="190" x2="468" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each hop allows one narrow thing. The database is never reachable from the internet.</p></div>

<h3>Firewall rules for an application: the habit</h3>
<p>Start from <b>default deny</b> for incoming traffic and add one allow rule per need, with the narrowest source you can. Remove rules that no longer have an owner. The most common real-world faults are exactly the ones in Lab 1: a rule that names the wrong <b>port</b> (an old 8080 after the move to 80), the wrong <b>protocol</b> (udp instead of tcp), or a broad <b>deny above a specific allow</b>. On a Linux host with ufw:</p>
<pre class="code">$ sudo ufw status numbered
Status: active
     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    10.30.0.0/24
[ 2] 8080/tcp                   ALLOW IN    Anywhere

$ sudo ufw delete allow 8080/tcp
$ sudo ufw allow 80/tcp
$ sudo grep "UFW BLOCK" /var/log/ufw.log | tail -1
Sep 29 09:00:39 app01 kernel: [UFW BLOCK] IN=eth0 SRC=10.30.0.50 DST=10.30.0.20 PROTO=TCP <span class="hl">DPT=80</span></pre>
<p>From the client, a dropped packet gives <b>silence</b> (curl: Timeout was reached; nc: timed out), while a reachable machine with no service on that port answers <b>refused</b>. That difference is your first diagnostic. In production you would serve the application on 443 with TLS; the lab serves port 80 because the simulator's web server speaks plain HTTP, and the logic is identical.</p>

<h3>DNS: names to addresses</h3>
<p>The <b>Domain Name System</b> translates names to addresses and holds other facts about a domain. A <b>resolver</b> (the client side, configured with a DNS server address such as the one in <code>/etc/resolv.conf</code>) asks a DNS server; the answer comes from the authoritative server for the zone or from a cache. Records you must know:</p>
<table class="cmp"><tr><th>Record</th><th>Meaning</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>Name to an IPv4 address</td><td><code>shop.nwk.example. 300 IN A 203.0.113.10</code></td></tr>
<tr><td><b>AAAA</b></td><td>Name to an IPv6 address</td><td><code>shop.nwk.example. 300 IN AAAA 2001:db8::10</code></td></tr>
<tr><td><b>CNAME</b></td><td>Alias: this name is another name</td><td><code>www.nwk.example. 300 IN CNAME shop.nwk.example.</code></td></tr>
<tr><td><b>MX</b></td><td>Mail servers for the domain, with a priority (lower is preferred)</td><td><code>nwk.example. 3600 IN MX 10 mail.nwk.example.</code></td></tr>
<tr><td><b>TXT</b></td><td>Free text, used for ownership proof and email policy (SPF, DKIM, DMARC)</td><td><code>nwk.example. 3600 IN TXT "v=spf1 mx -all"</code></td></tr>
<tr><td><b>NS</b></td><td>Which servers are authoritative for the zone</td><td><code>nwk.example. 86400 IN NS ns1.nwk.example.</code></td></tr>
</table>
<p>The number after the name is the <b>TTL</b> (time to live, in seconds): how long a resolver may cache the answer. A long TTL reduces load but makes changes slow to spread; before a migration, lower the TTL a day ahead so a change of address takes effect quickly. Two rules to remember: a CNAME cannot sit at the zone apex next to other records, and it points to a name, never to an IP address.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator): a small zone file fragment</span>
$TTL 300
shop     IN A     203.0.113.10
www      IN CNAME shop
@        IN MX 10 mail.nwk.example.
@        IN TXT   "v=spf1 mx -all"</pre>
<p>The simulator's DNS server supports A records on a router (<code>ip dns server</code> plus <code>ip host name address</code>), which is all Lab 1 needs.</p>
<pre class="out">R1# show hosts
Host                      Port  Flags      Age Type   Address(es)
app01.nwk.example         None  (perm, OK) 0   IP     10.30.0.20
shop.nwk.example          None  (perm, OK) 0   IP     <span class="hl">10.30.0.99</span>

WS01$ dig +short shop.nwk.example
10.30.0.99</pre>
<p>The highlighted address is wrong: it still points to the retired server. That is a classic stale-record fault after a migration.</p>

<h3>Split-horizon DNS (concept)</h3>
<p><b>Split-horizon</b> (split-view) DNS gives different answers to different askers for the same name. Inside the company <code>shop.nwk.example</code> may resolve to the private address 10.30.0.20, while outside it resolves to the public address 203.0.113.10. It keeps internal addressing private and lets inside users reach the service without leaving the network. The risk is inconsistency: when someone updates only one view, "it works for me" but not for others.</p>
<div class="warn"><p><b>Common mistakes.</b> Changing a record and testing at once while an old answer is still cached (check the TTL); testing with the server's IP and assuming the name works; a CNAME pointing to an IP; forgetting the AAAA record so IPv6 clients reach an old server; opening a firewall rule "any any" to find out whether the firewall is the problem.</p></div>
<div class="exam"><p><b>Exam traps.</b> A firewall that silently drops gives timeouts; a closed port on a reachable host gives refused. ping working says nothing about TCP ports. A CNAME is an alias to another name, an A record maps to an address. TTL controls caching, not the record's validity.</p></div>

<div class="scn"><h4>Half the users on the retired server</h4><p>After a weekend migration, some users of a retail shop saw the old "RETIRED" page while others saw the new store. The cause was a stale A record on the internal DNS (still pointing to the old address) while the public DNS had been updated: a split-horizon inconsistency. The fix was one record, but the lesson was process: a migration checklist item "update both views, lower the TTL a day earlier, test by name and by address from inside and outside".</p><p><b>Lesson:</b> test by name from where the users are, not only by IP from your desk.</p></div>

<div class="iv"><p class="q">"A website name does not open, but the server answers by IP. How do you troubleshoot?"</p><p>Separate name resolution from connectivity: dig or nslookup the name and compare the answer with the server's real address; check the resolver configured on the client, the TTL and caches, and whether internal and external DNS agree. If the name is right, test the port with curl or nc and read the firewall log: silence means a drop, refused means no service. Fix the record or the rule narrowly and re-test by name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls filter by address, protocol and port; default deny, narrow allows, first match wins; place them at the edge, between tiers and on hosts.</li>
<li>Timeout means a drop, refused means no listener; read the firewall log for SRC and DPT.</li>
<li>DNS records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail, priority), TXT (text, SPF), NS (zone servers).</li>
<li>TTL controls caching; lower it before a migration.</li>
<li>Split-horizon gives different answers inside and outside; keep both views consistent.</li>
</ul></div>
`,hi:`
<p>Aapke code tak koi bhi request pahunchne se pehle do infrastructure services use act kar chuki hoti hain: DNS ne decide kiya <i>kahan</i> jayegi, aur firewall ne decide kiya <i>jaa sakti hai ya nahi</i>. Dono mein se koi galat ho to duniya ki best application bhi toota hua ya exposed dikhti hai. Yeh chapter dikhata hai ki har ek kaise kaam karta hai, deployment mein kahan baithta hai, aur use kaise check karein.</p>

<h3>Analogy: phone book aur gatekeeper</h3>
<p>DNS phone book hai: aap company ka naam jaante ho, book number deti hai. Firewall compound ka gatekeeper hai: sahi address ke baad bhi gatekeeper check karta hai ki aap jaise visitors us khaas darwaze se andar aa sakte hain ya nahi.</p>

<h3>Firewall: kya karta hai aur kahan baithta hai</h3>
<p><b>Firewall</b> rules ke hisaab se traffic permit ya block karta hai. <b>Stateful</b> firewall connections track karta hai, isliye allowed outgoing connections ke replies apne aap wapas aane diye jaate hain, jabki bina maange incoming traffic ko rules judge karte hain. Rules source aur destination address, protocol aur port match karte hain, aur aakhri rule implicit <b>deny</b> hota hai. Pehla matching rule jeetta hai, isliye order matter karta hai.</p>
<table class="cmp"><tr><th>Placement</th><th>Kya protect karta hai</th><th>Web application ke liye typical rule</th></tr>
<tr><td>Perimeter (edge) firewall</td><td>Poori site ko internet se</td><td>Sirf web tier tak TCP 443 allow (aur redirect ke liye 80)</td></tr>
<tr><td>Internal / segmentation firewall</td><td>Tiers ko ek-doosre se (web, app, database)</td><td>Web tier se app port allow; app tier se database port allow; aur kuch nahi</td></tr>
<tr><td>Host firewall (jaise ufw)</td><td>Ek server, network layer fail ho tab bhi</td><td>Proxy se app port, management network se SSH allow, baaki deny</td></tr>
<tr><td>Cloud security group</td><td>Cloud mein instance ya subnet</td><td>Wahi logic, allow-lists ki tarah likha</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Firewalls ke saath three-tier network">
<rect x="20" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="150" y="95" width="80" height="60" rx="8" fill="#fde68a"/><text x="190" y="120" text-anchor="middle" class="svg-ink" font-size="12">Edge</text><text x="190" y="136" text-anchor="middle" class="svg-ink" font-size="12">firewall</text>
<rect x="270" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="335" y="55" text-anchor="middle" class="svg-ink" font-size="12">DMZ</text><text x="335" y="72" text-anchor="middle" class="svg-muted" font-size="11">proxy, web, 443</text>
<rect x="270" y="160" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="185" text-anchor="middle" class="svg-ink" font-size="12">App tier</text><text x="335" y="202" text-anchor="middle" class="svg-muted" font-size="11">8080 sirf DMZ se</text>
<rect x="470" y="160" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="12">Database</text><text x="545" y="202" text-anchor="middle" class="svg-muted" font-size="11">5432 sirf app se</text>
<line x1="110" y1="125" x2="148" y2="125" stroke="#64748b" stroke-width="2"/><line x1="230" y1="110" x2="268" y2="70" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="335" y2="158" stroke="#64748b" stroke-width="2"/><line x1="400" y1="190" x2="468" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har hop ek narrow cheez allow karta hai. Database internet se kabhi reachable nahi.</p></div>

<h3>Application ke liye firewall rules: aadat</h3>
<p>Incoming traffic ke liye <b>default deny</b> se shuru karo aur har zaroorat ke liye ek allow rule jodo, jitna narrow source ho sake. Jin rules ka koi owner nahi unhe hatao. Real-world mein sabse common faults bilkul Lab 1 jaise hain: aisa rule jo galat <b>port</b> naam leta hai (80 par move ke baad purana 8080), galat <b>protocol</b> (tcp ki jagah udp), ya specific allow ke upar broad <b>deny</b>. Linux host par ufw ke saath:</p>
<pre class="code">$ sudo ufw status numbered
Status: active
     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    10.30.0.0/24
[ 2] 8080/tcp                   ALLOW IN    Anywhere

$ sudo ufw delete allow 8080/tcp
$ sudo ufw allow 80/tcp
$ sudo grep "UFW BLOCK" /var/log/ufw.log | tail -1
Sep 29 09:00:39 app01 kernel: [UFW BLOCK] IN=eth0 SRC=10.30.0.50 DST=10.30.0.20 PROTO=TCP <span class="hl">DPT=80</span></pre>
<p>Client se, drop hua packet <b>chuppi</b> deta hai (curl: Timeout was reached; nc: timed out), jabki reachable machine jisme us port par service nahi hai <b>refused</b> deti hai. Yeh farak aapka pehla diagnostic hai. Production mein aap application TLS ke saath 443 par serve karoge; lab port 80 serve karta hai kyunki simulator ka web server plain HTTP bolta hai, aur logic bilkul wahi hai.</p>

<h3>DNS: naam se address</h3>
<p><b>Domain Name System</b> naamon ko addresses mein translate karta hai aur domain ke baare mein doosre facts rakhta hai. <b>Resolver</b> (client side, jise DNS server address mila hota hai jaise <code>/etc/resolv.conf</code> mein) DNS server se poochta hai; jawab zone ke authoritative server ya cache se aata hai. Jo records aapko aane chahiye:</p>
<table class="cmp"><tr><th>Record</th><th>Matlab</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>Naam se IPv4 address</td><td><code>shop.nwk.example. 300 IN A 203.0.113.10</code></td></tr>
<tr><td><b>AAAA</b></td><td>Naam se IPv6 address</td><td><code>shop.nwk.example. 300 IN AAAA 2001:db8::10</code></td></tr>
<tr><td><b>CNAME</b></td><td>Alias: yeh naam doosra naam hai</td><td><code>www.nwk.example. 300 IN CNAME shop.nwk.example.</code></td></tr>
<tr><td><b>MX</b></td><td>Domain ke mail servers, priority ke saath (chhota number preferred)</td><td><code>nwk.example. 3600 IN MX 10 mail.nwk.example.</code></td></tr>
<tr><td><b>TXT</b></td><td>Free text, ownership proof aur email policy (SPF, DKIM, DMARC) ke liye</td><td><code>nwk.example. 3600 IN TXT "v=spf1 mx -all"</code></td></tr>
<tr><td><b>NS</b></td><td>Zone ke liye kaunse servers authoritative hain</td><td><code>nwk.example. 86400 IN NS ns1.nwk.example.</code></td></tr>
</table>
<p>Naam ke baad ka number <b>TTL</b> hai (time to live, seconds mein): resolver jawab ko kitni der cache kar sakta hai. Lamba TTL load kam karta hai par changes dheere phailte hain; migration se pehle TTL ek din pehle kam karo taaki address ka change jaldi lage. Do rules yaad rakho: CNAME zone apex par doosre records ke saath nahi baith sakta, aur woh naam par point karta hai, IP address par kabhi nahi.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator): zone file ka chhota hissa</span>
$TTL 300
shop     IN A     203.0.113.10
www      IN CNAME shop
@        IN MX 10 mail.nwk.example.
@        IN TXT   "v=spf1 mx -all"</pre>
<p>Simulator ka DNS server router par A records support karta hai (<code>ip dns server</code> plus <code>ip host name address</code>), jo Lab 1 ke liye kaafi hai.</p>
<pre class="out">R1# show hosts
Host                      Port  Flags      Age Type   Address(es)
app01.nwk.example         None  (perm, OK) 0   IP     10.30.0.20
shop.nwk.example          None  (perm, OK) 0   IP     <span class="hl">10.30.0.99</span>

WS01$ dig +short shop.nwk.example
10.30.0.99</pre>
<p>Highlighted address galat hai: woh ab bhi retired server par point karta hai. Migration ke baad yeh classic stale-record fault hai.</p>

<h3>Split-horizon DNS (concept)</h3>
<p><b>Split-horizon</b> (split-view) DNS ek hi naam ke liye alag poochne walon ko alag jawab deta hai. Company ke andar <code>shop.nwk.example</code> private address 10.30.0.20 par resolve ho sakta hai, jabki bahar public address 203.0.113.10 par. Isse internal addressing private rehti hai aur andar ke users network chhode bina service tak pahunch jaate hain. Risk inconsistency hai: jab koi sirf ek view update kare, "mere paas to chal raha hai" par doosron ke liye nahi.</p>
<div class="warn"><p><b>Common mistakes.</b> Record badalte hi test karna jabki purana jawab cache mein hai (TTL dekho); server ke IP se test karke maan lena ki naam chalega; CNAME ko IP par point karna; AAAA record bhoolna jisse IPv6 clients purane server tak pahunchte hain; firewall problem hai ya nahi yeh jaanne ke liye "any any" rule kholna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Chupchaap drop karne wala firewall timeouts deta hai; reachable host par band port refused deta hai. Ping chalna TCP ports ke baare mein kuch nahi batata. CNAME doosre naam ka alias hai, A record address se map karta hai. TTL caching control karta hai, record ki validity nahi.</p></div>

<div class="scn"><h4>Aadhe users retired server par</h4><p>Weekend migration ke baad ek retail shop ke kuch users ko purana "RETIRED" page dikha jabki doosron ko naya store. Wajah internal DNS ka stale A record tha (ab bhi purane address par) jabki public DNS update ho chuka tha: split-horizon inconsistency. Fix ek record tha, par lesson process ka tha: migration checklist item "dono views update karo, TTL ek din pehle kam karo, andar aur bahar se naam aur address dono se test karo".</p><p><b>Lesson:</b> jahan users hain wahan se naam se test karo, sirf apne desk se IP se nahi.</p></div>

<div class="iv"><p class="q">"Website ka naam nahi khulta par server IP se jawab deta hai. Kaise troubleshoot karoge?"</p><p>Name resolution ko connectivity se alag karo: naam ko dig ya nslookup karo aur jawab ko server ke asli address se compare karo; client par configured resolver, TTL aur caches dekho, aur check karo ki internal aur external DNS agree karte hain. Naam sahi ho to curl ya nc se port test karo aur firewall log padho: chuppi matlab drop, refused matlab service nahi. Record ya rule ko narrowly fix karo aur naam se dobara test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls address, protocol aur port se filter karte hain; default deny, narrow allows, pehla match jeetta hai; edge par, tiers ke beech aur hosts par lagao.</li>
<li>Timeout matlab drop, refused matlab koi listener nahi; firewall log mein SRC aur DPT padho.</li>
<li>DNS records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail, priority), TXT (text, SPF), NS (zone servers).</li>
<li>TTL caching control karta hai; migration se pehle kam karo.</li>
<li>Split-horizon andar aur bahar alag jawab deta hai; dono views consistent rakho.</li>
</ul></div>
`}};export{e as default};