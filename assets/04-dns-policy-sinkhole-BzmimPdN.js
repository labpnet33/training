var e={id:`dns-sinkhole`,h:{en:`The DNS policy and the sinkhole: finding the infected host`,hi:`DNS policy aur sinkhole: infected host ko dhoondhna`},body:{en:`
<p>Imagine the police learn that a criminal gang uses a certain phone number. They could simply cut the line, and callers would hear "number does not exist". Or they could quietly <b>redirect the number to a police switchboard</b>. Now every person who dials it is recorded by name, and the police know exactly who is talking to the gang. A <b>DNS sinkhole</b> does the second thing for malware. When an infected PC asks DNS for its command-and-control (C2) domain, Threat Defense answers with the address of a <b>sinkhole</b>. The PC then tries to connect to the sinkhole, and that connection names the infected machine.</p>

<h3>How the DNS policy works</h3>
<p>Malware almost always looks up a domain name before it connects, because domains are easier for attackers to move than IP addresses. The <b>DNS policy</b> inspects DNS queries that cross the device and matches the queried name against DNS lists and feeds (for example the Talos CnC and Malware categories, or your own <b>custom DNS block list</b>). Each DNS rule has an action:</p>
<table class="cmp"><tr><th>Action</th><th>What the client receives</th><th>Use</th></tr>
<tr><td>Allow (older name Whitelist)</td><td>normal answer, later DNS rules skipped</td><td>exceptions</td></tr>
<tr><td>Monitor</td><td>normal answer, event logged</td><td>pilot, visibility</td></tr>
<tr><td>Drop</td><td>nothing: the query times out</td><td>quiet blocking</td></tr>
<tr><td>Domain Not Found</td><td>NXDOMAIN</td><td>clean blocking, fast failure</td></tr>
<tr><td>Sinkhole</td><td>the IP of a sinkhole object</td><td>blocking and identifying the infected host</td></tr></table>

<p>A <b>sinkhole object</b> holds an IPv4 and an IPv6 address and a choice: <b>Log Connections to Sinkhole</b> or <b>Block and Log Connections to Sinkhole</b>. The address must be unused and must be <b>routed through the firewall</b>, usually towards the outside, otherwise the client's follow-up connection never reaches Threat Defense and nothing is logged. The DNS policy is attached in the access control policy on the <b>Security Intelligence</b> tab.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="DNS sinkhole sequence">
<rect x="20" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text>
<rect x="265" y="20" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<rect x="510" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">DNS 8.8.8.8</text>
<line x1="75" y1="64" x2="75" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="320" y1="64" x2="320" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="565" y1="64" x2="565" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="75" y1="95" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><text x="197" y="88" text-anchor="middle" class="svg-ink" font-size="12">1 query update-check.badsite.example</text>
<line x1="320" y1="135" x2="75" y2="135" stroke="#64748b" stroke-width="2"/><text x="197" y="128" text-anchor="middle" class="svg-accent" font-size="12">2 answer 192.0.2.254 (sinkhole)</text>
<line x1="75" y1="185" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="197" y="178" text-anchor="middle" class="svg-ink" font-size="12">3 TCP SYN to 192.0.2.254</text>
<rect x="335" y="165" width="180" height="44" rx="8" fill="#fde68a"/><text x="425" y="185" text-anchor="middle" class="svg-ink" font-size="12">4 block + event</text><text x="425" y="201" text-anchor="middle" class="svg-muted" font-size="12">DNS Sinkhole: 10.0.1.10</text>
<text x="440" y="110" class="svg-muted" font-size="12">real server never asked</text>
</svg><p class="cap">The firewall answers the malicious lookup itself; the follow-up connection to the sinkhole identifies the infected PC.</p></div>

<h3>Why sinkhole beats Domain Not Found</h3>
<p>Most companies have an internal DNS server. PCs ask it, and it forwards to the internet. The firewall therefore sees the <b>DNS server</b> as the source of every query. With Domain Not Found you only learn "the DNS server asked for a bad name", which is useless because it asks for everyone. With a sinkhole, the infected PC itself connects to the sinkhole address, and that connection carries the real source IP.</p>

<h3>Lab walkthrough: Security Intelligence and a DNS sinkhole against a C2 server</h3>
<pre class="code"><span class="c">! Step 1: prove the risk from PC1</span>
PC1&gt; nslookup update-check.badsite.example
PC1&gt; curl update-check.badsite.example

<span class="c">! Step 2: Management Center</span>
Objects &gt; Security Intelligence &gt; Networks: Talos-Malware = Block, Talos-CnC = Block
DNS Policy: Talos-CnC = Block, Action Sinkhole, sinkhole 192.0.2.254
Policies &gt; Access Control &gt; NK-ACP &gt; Security Intelligence: DNS Policy selected
Deploy</pre>

<pre class="out">PC1&gt; nslookup update-check.badsite.example
Server:		8.8.8.8
Address:	8.8.8.8#53

Name:	update-check.badsite.example
<span class="hl">Address: 192.0.2.254</span>

PC1&gt; curl update-check.badsite.example
curl: (28) Failed to connect to update-check.badsite.example port 80 after 2001 ms: Timeout was reached

Analysis &gt; Connections &gt; Security Intelligence Events
Type          List / Category        Action    Detail
DNS           Talos-CnC              Sinkhole  update-check.badsite.example  10.0.1.10 -&gt; 8.8.8.8
<span class="hl">DNS Sinkhole  Sinkhole-192.0.2.254   Block     10.0.1.10 contacted the sinkhole</span>
Network       Talos-Malware          Block     192.0.2.66</pre>

<p>Before the change, the same <code>nslookup</code> returned 192.0.2.66, the real C2 address. After it, the name resolves to the sinkhole, the connection fails, and the DNS Sinkhole event names <b>10.0.1.10</b> as the host to investigate. Finally confirm that <code>curl news.example</code> still works, so you blocked only the bad name.</p>

<div class="eg"><p><b>Worked example: reading the events.</b> A sinkhole event list shows 46 DNS events from 10.0.1.53 and 3 DNS Sinkhole events: 10.0.1.77 twice and 10.0.1.91 once. 10.0.1.53 is the internal DNS server forwarding queries, so it is not infected. Two PCs, .77 and .91, actually tried to reach the C2 server. Those two go to the incident response team for isolation and reimaging.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing a sinkhole address inside the LAN or one that is routed elsewhere. The client then connects to that address without crossing Threat Defense, the DNS events appear, but no DNS Sinkhole event ever names the infected host. Pick an unused address routed out through the firewall.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS policy only sees cleartext DNS that crosses the device. DNS over HTTPS (DoH) from a browser bypasses it, so block DoH applications with AppID where policy allows. And the DNS policy is selected on the <b>Security Intelligence tab</b> of the access control policy, not as a separate deploy target.</p></div>

<div class="scn"><h4>Patient zero hidden behind the DNS server</h4><p>A logistics firm enabled the DNS policy with Domain Not Found. Events showed hundreds of blocked CnC queries, all from 10.0.1.53, the domain controller running DNS. The SOC wanted to reimage the domain controller. A senior engineer changed the action to Sinkhole with an outside-routed address. Within an hour DNS Sinkhole events pointed at two laptops in the sales team. The domain controller was fine.</p><p><b>Lesson:</b> the DNS event shows who asked; the sinkhole event shows who is infected.</p></div>

<div class="iv"><p class="q">"Why would you use a DNS sinkhole instead of just blocking the domain?"</p><p>Blocking stops the lookup, but if clients use an internal resolver, the firewall only sees the resolver as the source. A sinkhole answers with a controlled address; the infected client then connects to it through the firewall, which blocks and logs that connection with the real client IP. Mention the sinkhole object (IPv4 and IPv6, log or block-and-log), that the address must route through the firewall, and the DNS policy actions Allow, Monitor, Drop, Domain Not Found and Sinkhole.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The DNS policy matches queried names against DNS feeds and lists before resolution completes.</li>
<li>Actions: Allow, Monitor, Drop, Domain Not Found, Sinkhole.</li>
<li>Sinkhole answers with a controlled IP; the follow-up connection names the infected host.</li>
<li>The sinkhole IP must be unused and routed through the firewall.</li>
<li>A DNS event's source may be your resolver; the DNS Sinkhole event's source is the real client.</li>
</ul></div>
`,hi:`
<p>Socho police ko pata chalta hai ki ek criminal gang ek khaas phone number use karti hai. Woh line kaat sakti hai, aur callers sunenge "number exist nahi karta". Ya woh chupchaap <b>number ko police switchboard par redirect</b> kar sakti hai. Ab us number ko dial karne wala har insaan naam ke saath record hota hai, aur police ko bilkul pata hota hai ki gang se kaun baat kar raha hai. <b>DNS sinkhole</b> malware ke liye doosra wala kaam karta hai. Jab infected PC apne command-and-control (C2) domain ke liye DNS se poochhta hai, Threat Defense ek <b>sinkhole</b> ka address jawab mein deta hai. Phir PC sinkhole se connect karne ki koshish karta hai, aur woh connection infected machine ka naam bata deta hai.</p>

<h3>DNS policy kaise kaam karti hai</h3>
<p>Malware lagbhag hamesha connect karne se pehle domain name lookup karta hai, kyunki attackers ke liye domains IP addresses se zyada aasaani se move hote hain. <b>DNS policy</b> device se guzarne wali DNS queries inspect karti hai aur maange gaye naam ko DNS lists aur feeds se milati hai (jaise Talos CnC aur Malware categories, ya aapki apni <b>custom DNS block list</b>). Har DNS rule ka ek action hota hai:</p>
<table class="cmp"><tr><th>Action</th><th>Client ko kya milta hai</th><th>Use</th></tr>
<tr><td>Allow (purana naam Whitelist)</td><td>normal jawab, baad ki DNS rules skip</td><td>exceptions</td></tr>
<tr><td>Monitor</td><td>normal jawab, event log</td><td>pilot, visibility</td></tr>
<tr><td>Drop</td><td>kuch nahi: query time out hoti hai</td><td>chupchaap blocking</td></tr>
<tr><td>Domain Not Found</td><td>NXDOMAIN</td><td>saaf blocking, jaldi failure</td></tr>
<tr><td>Sinkhole</td><td>sinkhole object ka IP</td><td>blocking aur infected host ki pehchan</td></tr></table>

<p><b>Sinkhole object</b> mein ek IPv4 aur ek IPv6 address aur ek choice hoti hai: <b>Log Connections to Sinkhole</b> ya <b>Block and Log Connections to Sinkhole</b>. Address unused hona chahiye aur <b>firewall se route</b> hona chahiye, aam taur par outside ki taraf, warna client ka agla connection kabhi Threat Defense tak nahi pahunchta aur kuch log nahi hota. DNS policy access control policy mein <b>Security Intelligence</b> tab par attach hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="DNS sinkhole sequence">
<rect x="20" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text>
<rect x="265" y="20" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<rect x="510" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">DNS 8.8.8.8</text>
<line x1="75" y1="64" x2="75" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="320" y1="64" x2="320" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="565" y1="64" x2="565" y2="260" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="75" y1="95" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><text x="197" y="88" text-anchor="middle" class="svg-ink" font-size="12">1 query update-check.badsite.example</text>
<line x1="320" y1="135" x2="75" y2="135" stroke="#64748b" stroke-width="2"/><text x="197" y="128" text-anchor="middle" class="svg-accent" font-size="12">2 jawab 192.0.2.254 (sinkhole)</text>
<line x1="75" y1="185" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="197" y="178" text-anchor="middle" class="svg-ink" font-size="12">3 192.0.2.254 ko TCP SYN</text>
<rect x="335" y="165" width="180" height="44" rx="8" fill="#fde68a"/><text x="425" y="185" text-anchor="middle" class="svg-ink" font-size="12">4 block + event</text><text x="425" y="201" text-anchor="middle" class="svg-muted" font-size="12">DNS Sinkhole: 10.0.1.10</text>
<text x="440" y="110" class="svg-muted" font-size="12">asli server se poocha hi nahi</text>
</svg><p class="cap">Firewall malicious lookup ka jawab khud deta hai; sinkhole ka agla connection infected PC ko pehchanta hai.</p></div>

<h3>Sinkhole Domain Not Found se behtar kyun hai</h3>
<p>Zyada tar companies ke paas internal DNS server hota hai. PCs usse poochhte hain, aur woh internet ko forward karta hai. Isliye firewall har query ka source <b>DNS server</b> dekhta hai. Domain Not Found se aapko sirf pata chalta hai "DNS server ne bura naam poocha", jo bekaar hai kyunki woh sabke liye poochhta hai. Sinkhole ke saath, infected PC khud sinkhole address se connect karta hai, aur us connection mein asli source IP hota hai.</p>

<h3>Lab walkthrough: C2 server ke khilaf Security Intelligence aur DNS sinkhole</h3>
<pre class="code"><span class="c">! Step 1: PC1 se risk saabit karo</span>
PC1&gt; nslookup update-check.badsite.example
PC1&gt; curl update-check.badsite.example

<span class="c">! Step 2: Management Center</span>
Objects &gt; Security Intelligence &gt; Networks: Talos-Malware = Block, Talos-CnC = Block
DNS Policy: Talos-CnC = Block, Action Sinkhole, sinkhole 192.0.2.254
Policies &gt; Access Control &gt; NK-ACP &gt; Security Intelligence: DNS Policy selected
Deploy</pre>

<pre class="out">PC1&gt; nslookup update-check.badsite.example
Server:		8.8.8.8
Address:	8.8.8.8#53

Name:	update-check.badsite.example
<span class="hl">Address: 192.0.2.254</span>

PC1&gt; curl update-check.badsite.example
curl: (28) Failed to connect to update-check.badsite.example port 80 after 2001 ms: Timeout was reached

Analysis &gt; Connections &gt; Security Intelligence Events
Type          List / Category        Action    Detail
DNS           Talos-CnC              Sinkhole  update-check.badsite.example  10.0.1.10 -&gt; 8.8.8.8
<span class="hl">DNS Sinkhole  Sinkhole-192.0.2.254   Block     10.0.1.10 contacted the sinkhole</span>
Network       Talos-Malware          Block     192.0.2.66</pre>

<p>Change se pehle wahi <code>nslookup</code> 192.0.2.66 lautata tha, asli C2 address. Uske baad naam sinkhole par resolve hota hai, connection fail hota hai, aur DNS Sinkhole event investigate karne ke liye <b>10.0.1.10</b> ka naam deta hai. Aakhir mein confirm karo ki <code>curl news.example</code> ab bhi chalta hai, taaki pata ho ki aapne sirf bura naam block kiya.</p>

<div class="eg"><p><b>Worked example: events padhna.</b> Ek sinkhole event list mein 10.0.1.53 se 46 DNS events aur 3 DNS Sinkhole events hain: 10.0.1.77 do baar aur 10.0.1.91 ek baar. 10.0.1.53 internal DNS server hai jo queries forward karta hai, isliye woh infected nahi hai. Do PCs, .77 aur .91, ne sach mein C2 server tak pahunchne ki koshish ki. Yeh dono isolation aur reimaging ke liye incident response team ke paas jaate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> LAN ke andar ka sinkhole address chunna ya aisa jo kahin aur route hota ho. Phir client Threat Defense ko cross kiye bina us address se connect karta hai, DNS events dikhte hain, lekin koi DNS Sinkhole event kabhi infected host ka naam nahi deta. Firewall se bahar route hone wala unused address chuno.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS policy sirf device se guzarne wala cleartext DNS dekhti hai. Browser ka DNS over HTTPS (DoH) ise bypass karta hai, isliye jahan policy allow kare wahan AppID se DoH applications block karo. Aur DNS policy access control policy ke <b>Security Intelligence tab</b> par select hoti hai, alag deploy target ki tarah nahi.</p></div>

<div class="scn"><h4>DNS server ke peeche chhupa patient zero</h4><p>Ek logistics firm ne Domain Not Found ke saath DNS policy enable ki. Events mein sainkdon blocked CnC queries thi, sab 10.0.1.53 se, jo DNS chalane wala domain controller tha. SOC domain controller ko reimage karna chahta tha. Ek senior engineer ne action ko outside-routed address ke saath Sinkhole kiya. Ek ghante mein DNS Sinkhole events ne sales team ke do laptops ki taraf ishaara kiya. Domain controller theek tha.</p><p><b>Lesson:</b> DNS event dikhata hai kisne poocha; sinkhole event dikhata hai kaun infected hai.</p></div>

<div class="iv"><p class="q">"Domain ko sirf block karne ki jagah aap DNS sinkhole kyun use karoge?"</p><p>Blocking lookup rok deti hai, lekin agar clients internal resolver use karte hain, to firewall ko source sirf resolver dikhta hai. Sinkhole controlled address se jawab deta hai; phir infected client firewall ke through usse connect karta hai, jo asli client IP ke saath us connection ko block aur log karta hai. Sinkhole object (IPv4 aur IPv6, log ya block-and-log), yeh ki address firewall se route hona chahiye, aur DNS policy actions Allow, Monitor, Drop, Domain Not Found aur Sinkhole batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DNS policy maange gaye naamon ko resolution poora hone se pehle DNS feeds aur lists se milati hai.</li>
<li>Actions: Allow, Monitor, Drop, Domain Not Found, Sinkhole.</li>
<li>Sinkhole controlled IP se jawab deta hai; agla connection infected host ka naam batata hai.</li>
<li>Sinkhole IP unused hona chahiye aur firewall se route hona chahiye.</li>
<li>DNS event ka source aapka resolver ho sakta hai; DNS Sinkhole event ka source asli client hai.</li>
</ul></div>
`}};export{e as default};