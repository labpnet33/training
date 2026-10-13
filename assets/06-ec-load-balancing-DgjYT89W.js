var e={id:`ec-load-balancing`,h:{en:`EtherChannel load balancing: the hash, buckets and polarisation`,hi:`EtherChannel load balancing: hash, buckets aur polarisation`},body:{en:`
<p>At a toll plaza with four lanes, the attendant does not wave cars into lanes at random. He looks at the last digit of the number plate: 0-1 lane A, 2-3 lane B, and so on. A family convoy with number plates from one showroom (all ending in 7) always ends up in the same lane. That is fair on average and keeps each convoy together, but it goes badly wrong when all the traffic comes from one convoy. An EtherChannel works exactly like that attendant.</p>

<h3>Why one flow always uses one link</h3>
<p>If frames of one conversation were sprayed across members, they could arrive out of order, and TCP treats reordering as loss. So the switch <b>never splits a flow</b>. For every frame it computes a <b>hash</b> over chosen header fields, reduces it to a small number, the <b>bucket</b>, and each bucket belongs to one member. Catalyst switches use <b>8 buckets</b> (a 3-bit result). The buckets are spread over the active members:</p>
<table class="cmp"><tr><th>Members</th><th>Buckets per member</th><th>Share of traffic (best case)</th></tr>
<tr><td>2</td><td>4 / 4</td><td>50 / 50</td></tr>
<tr><td>3</td><td>3 / 3 / 2</td><td>37.5 / 37.5 / 25</td></tr>
<tr><td>4</td><td>2 / 2 / 2 / 2</td><td>25 each</td></tr>
<tr><td>6</td><td>2 / 2 / 1 / 1 / 1 / 1</td><td>25 / 25 / 12.5 x 4</td></tr>
<tr><td>8</td><td>1 each</td><td>12.5 each</td></tr></table>
<p>That is why bundles are built with 2, 4 or 8 members: only powers of two divide the 8 buckets evenly.</p>

<h3>The methods</h3>
<p>The method is set <b>globally</b> with <code>port-channel load-balance</code> and applies to every bundle on the switch. Common options: <code>src-mac</code>, <code>dst-mac</code>, <code>src-dst-mac</code>, <code>src-ip</code>, <code>dst-ip</code>, <code>src-dst-ip</code>, and on platforms that support Layer 4 fields <code>src-port</code>, <code>dst-port</code>, <code>src-dst-port</code> or <code>src-dst-mixed-ip-port</code>. The default depends on the platform: older access switches default to <code>src-mac</code>, the Catalyst 9000 family to <code>src-dst-ip</code>.</p>
<p>Two facts matter most. First, the method is <b>local</b>: each switch hashes only what it <b>transmits</b>, so the two ends of a bundle may use different methods and the bundle still works. Second, the hash can only spread traffic if the chosen field <b>varies</b> across flows in that direction.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hash buckets to members">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="13">frame fields</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">src IP, dst IP</text>
<rect x="190" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="245" y="108" text-anchor="middle" class="svg-ink" font-size="13">hash</text><text x="245" y="125" text-anchor="middle" class="svg-muted" font-size="12">low 3 bits XOR</text>
<rect x="350" y="30" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="405" y="55" text-anchor="middle" class="svg-ink" font-size="12">buckets 0-3</text>
<rect x="350" y="150" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="405" y="175" text-anchor="middle" class="svg-ink" font-size="12">buckets 4-7</text>
<rect x="510" y="30" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="55" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<rect x="510" y="150" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="175" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2</text>
<line x1="140" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="105" x2="350" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="350" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="170" x2="510" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">How the lab switch maps a flow to a member of Po1: fields, 3-bit hash, bucket, member.</p></div>

<h3>Walking Lab 2</h3>
<p>SW2 has one server (SRV, 10.10.10.100) and sends its backup across Po1 to PC1 (10.10.10.11) and PC2 (10.10.10.12). First, what is the method?</p>
<pre class="out">SW2# show etherchannel load-balance
EtherChannel Load-Balancing Configuration:
<span class="hl">        src-mac</span>

EtherChannel Load-Balancing Addresses Used Per-Protocol:
Non-IP: Source MAC address
  IPv4: Source MAC address
  IPv6: Source MAC address</pre>
<p>Every frame SW2 sends toward SW1 carries the <b>same source MAC</b> (the server), so every frame lands in the same bucket and on the same member. Adding members would change nothing. The field that varies is the destination. Change the method on both switches (it is global configuration, not interface configuration):</p>
<pre class="code">SW1(config)# port-channel load-balance src-dst-ip
SW2(config)# port-channel load-balance src-dst-ip</pre>
<p>Then ask the switch where a flow goes. In the lab, the switch refuses an <code>ip</code> test while the method is still MAC-based, so change the method first.</p>
<pre class="out">SW2# test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.11
<span class="hl">Would select Gi0/2 of Po1</span>
SW2# test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.12
<span class="hl">Would select Gi0/1 of Po1</span></pre>

<div class="eg"><p><b>Worked example: doing the hash by hand.</b> In the lab model the bucket is the low 3 bits of source IP XOR the low 3 bits of destination IP; buckets 0-3 belong to the first member and 4-7 to the second. SRV's last octet 100 = 0110 0<b>100</b>, so its low bits are 4. PC1: 11 = 0000 1<b>011</b>, low bits 3. 4 XOR 3 = 7: bucket 7, member Gi0/2. PC2: 12 = 0000 1<b>100</b>, low bits 4. 4 XOR 4 = 0: bucket 0, member Gi0/1. The two server flows now leave on different links. Real Catalyst hardware uses its own internal hash, which is why the <code>test</code> command exists: never guess, ask the switch.</p></div>

<h3>Polarisation</h3>
<p><b>Hash polarisation</b> happens when several tiers use the same algorithm on the same fields. The access switch splits flows: bucket group "A" goes to distribution D1, group "B" to D2. D1 now receives <b>only</b> A-flows. If D1 hashes them with the same algorithm and inputs toward the core, every one of them produces an A-result again and uses the same member; D1's other uplink members sit idle. Symptoms: one member of a core bundle hot, the others nearly empty, although there are thousands of flows. Fixes:</p>
<ul>
<li>Use <b>different inputs per tier</b>, for example <code>src-dst-ip</code> at the access tier and <code>src-dst-mixed-ip-port</code> (adds Layer 4 ports) at distribution.</li>
<li>Include Layer 4 ports where the platform supports it: more entropy, more even spread.</li>
<li>For routed ECMP the same problem is solved by a per-router seed: <code>ip cef load-sharing algorithm universal</code> (the default on modern IOS) adds a unique ID to the hash on each router.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Adding a third member to "fix" a hot link. With a single-source flow nothing changes, and with many flows you now get an uneven 3/3/2 split. Fix the hash inputs first, and keep the member count a power of two.</p></div>

<div class="exam"><p><b>Exam trap.</b> The load-balance method is a global command (<code>port-channel load-balance</code>), not an interface command, and it affects only traffic the switch transmits. The two ends of a bundle may differ. One flow never uses more than one member's bandwidth.</p></div>

<div class="scn"><h4>The 40G bundle that moved 10G</h4><p>A data-centre team bundled 4x10G between two distribution switches for backups. A single backup job between two servers never exceeded 10 Gbps. The engineer explained that a backup between one source and one destination is one flow for any IP-based hash; only Layer 4 port hashing would split parallel TCP streams of the job. They changed to <code>src-dst-mixed-ip-port</code> and configured the backup tool for eight parallel streams, which spread across all four members.</p><p><b>Lesson:</b> an EtherChannel adds capacity for many flows, not speed for one flow.</p></div>

<div class="iv"><p class="q">"Your EtherChannel has four links but one is at 90 percent and the others are idle. What do you check?"</p><p>Strong answer: check <code>show etherchannel load-balance</code> and think about which field varies in that direction; a single server MAC with src-mac, or a router-to-router link with any MAC-based method, collapses to one bucket. Use <code>test etherchannel load-balance</code> to predict members, switch to an IP or IP-plus-port method, and check for polarisation if bundles are chained across tiers. Mention that one flow can never exceed one member's speed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow never splits; a hash maps it to one of 8 buckets, and buckets map to members.</li>
<li>Use 2, 4 or 8 members for an even bucket split.</li>
<li>The method is global and local to each switch; the chosen field must vary in the sending direction.</li>
<li>Verify with <code>show etherchannel load-balance</code> and predict with <code>test etherchannel load-balance</code>.</li>
<li>Polarisation: same algorithm and inputs on consecutive tiers; vary inputs or add Layer 4 fields.</li>
</ul></div>
`,hi:`
<p>Chaar lanes wale toll plaza par attendant cars ko random lanes mein nahi bhejta. Woh number plate ka aakhri digit dekhta hai: 0-1 lane A, 2-3 lane B, aur aise hi. Ek showroom se aayi number plates (sab 7 par khatam) wala family convoy hamesha ek hi lane mein jaata hai. Average par yeh fair hai aur har convoy ko saath rakhta hai, lekin jab saara traffic ek hi convoy se aaye to bahut bura hota hai. EtherChannel bilkul us attendant ki tarah kaam karta hai.</p>

<h3>Ek flow hamesha ek link kyun use karta hai</h3>
<p>Agar ek conversation ke frames members par bikhere jaayein, to woh out of order pahunch sakte hain, aur TCP reordering ko loss maanta hai. Isliye switch <b>kabhi flow ko split nahi karta</b>. Har frame ke liye woh chune hue header fields par <b>hash</b> nikalta hai, use ek chhote number, <b>bucket</b>, mein badalta hai, aur har bucket ek member ka hota hai. Catalyst switches <b>8 buckets</b> (3-bit result) use karte hain. Buckets active members mein baante jaate hain:</p>
<table class="cmp"><tr><th>Members</th><th>Har member ke buckets</th><th>Traffic ka hissa (best case)</th></tr>
<tr><td>2</td><td>4 / 4</td><td>50 / 50</td></tr>
<tr><td>3</td><td>3 / 3 / 2</td><td>37.5 / 37.5 / 25</td></tr>
<tr><td>4</td><td>2 / 2 / 2 / 2</td><td>25 har ek</td></tr>
<tr><td>6</td><td>2 / 2 / 1 / 1 / 1 / 1</td><td>25 / 25 / 12.5 x 4</td></tr>
<tr><td>8</td><td>1 har ek</td><td>12.5 har ek</td></tr></table>
<p>Isi liye bundles 2, 4 ya 8 members ke saath banaye jaate hain: sirf powers of two hi 8 buckets ko barabar baant-te hain.</p>

<h3>Methods</h3>
<p>Method <b>globally</b> <code>port-channel load-balance</code> se set hota hai aur switch ke har bundle par lagta hai. Common options: <code>src-mac</code>, <code>dst-mac</code>, <code>src-dst-mac</code>, <code>src-ip</code>, <code>dst-ip</code>, <code>src-dst-ip</code>, aur jo platforms Layer 4 fields support karte hain unpar <code>src-port</code>, <code>dst-port</code>, <code>src-dst-port</code> ya <code>src-dst-mixed-ip-port</code>. Default platform par depend karta hai: purane access switches ka default <code>src-mac</code> hai, Catalyst 9000 family ka <code>src-dst-ip</code>.</p>
<p>Do baatein sabse zyada matter karti hain. Pehli, method <b>local</b> hai: har switch sirf woh hash karta hai jo woh <b>transmit</b> karta hai, isliye bundle ke do ends alag methods use kar sakte hain aur bundle phir bhi chalta hai. Doosri, hash traffic tabhi failaa sakta hai jab chuna hua field us direction mein flows ke beech <b>badalta</b> ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hash buckets to members">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="13">frame fields</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">src IP, dst IP</text>
<rect x="190" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="245" y="108" text-anchor="middle" class="svg-ink" font-size="13">hash</text><text x="245" y="125" text-anchor="middle" class="svg-muted" font-size="12">low 3 bits XOR</text>
<rect x="350" y="30" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="405" y="55" text-anchor="middle" class="svg-ink" font-size="12">buckets 0-3</text>
<rect x="350" y="150" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="405" y="175" text-anchor="middle" class="svg-ink" font-size="12">buckets 4-7</text>
<rect x="510" y="30" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="55" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<rect x="510" y="150" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="175" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2</text>
<line x1="140" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="105" x2="350" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="350" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="170" x2="510" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab switch ek flow ko Po1 ke member par kaise map karta hai: fields, 3-bit hash, bucket, member.</p></div>

<h3>Lab 2 step by step</h3>
<p>SW2 par ek server (SRV, 10.10.10.100) hai aur woh apna backup Po1 ke paar PC1 (10.10.10.11) aur PC2 (10.10.10.12) ko bhejta hai. Pehle, method kya hai?</p>
<pre class="out">SW2# show etherchannel load-balance
EtherChannel Load-Balancing Configuration:
<span class="hl">        src-mac</span>

EtherChannel Load-Balancing Addresses Used Per-Protocol:
Non-IP: Source MAC address
  IPv4: Source MAC address
  IPv6: Source MAC address</pre>
<p>SW2 jo bhi frame SW1 ki taraf bhejta hai usme <b>same source MAC</b> (server ka) hota hai, isliye har frame same bucket aur same member par aata hai. Members jodne se kuch nahi badlega. Jo field badalta hai woh destination hai. Dono switches par method badlo (yeh global configuration hai, interface configuration nahi):</p>
<pre class="code">SW1(config)# port-channel load-balance src-dst-ip
SW2(config)# port-channel load-balance src-dst-ip</pre>
<p>Phir switch se poocho ki flow kahan jaata hai. Lab mein, jab tak method MAC-based hai, switch <code>ip</code> test mana kar deta hai, isliye pehle method badlo.</p>
<pre class="out">SW2# test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.11
<span class="hl">Would select Gi0/2 of Po1</span>
SW2# test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.12
<span class="hl">Would select Gi0/1 of Po1</span></pre>

<div class="eg"><p><b>Worked example: hash haath se nikalna.</b> Lab model mein bucket = source IP ke low 3 bits XOR destination IP ke low 3 bits; buckets 0-3 pehle member ke aur 4-7 doosre ke. SRV ka aakhri octet 100 = 0110 0<b>100</b>, to low bits 4. PC1: 11 = 0000 1<b>011</b>, low bits 3. 4 XOR 3 = 7: bucket 7, member Gi0/2. PC2: 12 = 0000 1<b>100</b>, low bits 4. 4 XOR 4 = 0: bucket 0, member Gi0/1. Ab server ke do flows alag links par nikalte hain. Real Catalyst hardware apna internal hash use karta hai, isi liye <code>test</code> command hai: kabhi guess mat karo, switch se poocho.</p></div>

<h3>Polarisation</h3>
<p><b>Hash polarisation</b> tab hota hai jab kai tiers same inputs par same algorithm use karte hain. Access switch flows baant-ta hai: bucket group "A" distribution D1 ko, group "B" D2 ko. Ab D1 ko <b>sirf</b> A-flows milte hain. Agar D1 unhe core ki taraf same algorithm aur inputs se hash kare, to har ek phir se A-result deta hai aur same member use karta hai; D1 ke baaki uplink members khaali baithe rehte hain. Symptoms: core bundle ka ek member garam, baaki lagbhag khaali, jabki hazaaron flows hain. Fixes:</p>
<ul>
<li>Har tier par <b>alag inputs</b> use karo, jaise access tier par <code>src-dst-ip</code> aur distribution par <code>src-dst-mixed-ip-port</code> (Layer 4 ports jodta hai).</li>
<li>Jahan platform support kare, Layer 4 ports shaamil karo: zyada entropy, zyada barabar spread.</li>
<li>Routed ECMP mein yahi problem per-router seed se solve hoti hai: <code>ip cef load-sharing algorithm universal</code> (modern IOS par default) har router par hash mein ek unique ID jodta hai.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Garam link "theek karne" ke liye teesra member jodna. Single-source flow ke saath kuch nahi badalta, aur kai flows ke saath ab 3/3/2 ka asamaan split milta hai. Pehle hash inputs theek karo, aur member count power of two rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Load-balance method global command hai (<code>port-channel load-balance</code>), interface command nahi, aur yeh sirf switch ke transmit kiye traffic ko affect karta hai. Bundle ke do ends alag ho sakte hain. Ek flow kabhi ek member ki bandwidth se zyada use nahi karta.</p></div>

<div class="scn"><h4>40G bundle jo 10G le jaata tha</h4><p>Ek data-centre team ne backups ke liye do distribution switches ke beech 4x10G bundle banaya. Do servers ke beech ek backup job kabhi 10 Gbps se upar nahi gaya. Engineer ne samjhaya ki ek source aur ek destination ke beech backup kisi bhi IP-based hash ke liye ek hi flow hai; sirf Layer 4 port hashing job ke parallel TCP streams ko split karegi. Unhone <code>src-dst-mixed-ip-port</code> par switch kiya aur backup tool ko aath parallel streams ke liye configure kiya, jo chaaron members par fail gaye.</p><p><b>Seekh:</b> EtherChannel kai flows ke liye capacity jodta hai, ek flow ke liye speed nahi.</p></div>

<div class="iv"><p class="q">"Aapke EtherChannel mein chaar links hain lekin ek 90 percent par hai aur baaki idle hain. Aap kya check karoge?"</p><p>Strong answer: <code>show etherchannel load-balance</code> check karo aur socho ki us direction mein kaunsa field badalta hai; src-mac ke saath ek server MAC, ya kisi bhi MAC-based method ke saath router-to-router link, ek bucket mein simat jaata hai. Members predict karne ke liye <code>test etherchannel load-balance</code> use karo, IP ya IP-plus-port method par switch karo, aur agar bundles tiers mein chain hain to polarisation check karo. Batao ki ek flow kabhi ek member ki speed se zyada nahi jaa sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow kabhi split nahi hota; hash use 8 mein se ek bucket par map karta hai, aur buckets members par.</li>
<li>Barabar bucket split ke liye 2, 4 ya 8 members use karo.</li>
<li>Method global hai aur har switch ke liye local; chuna hua field bhejne wali direction mein badalna chahiye.</li>
<li><code>show etherchannel load-balance</code> se verify karo aur <code>test etherchannel load-balance</code> se predict karo.</li>
<li>Polarisation: lagataar tiers par same algorithm aur inputs; inputs badlo ya Layer 4 fields jodo.</li>
</ul></div>
`}};export{e as default};