var e={id:`binding-table`,h:{en:`The binding table: entries, sources, states and ownership`,hi:`Binding table: entries, sources, states aur ownership`},body:{en:`
<p>A good society guard keeps a register: flat number, family name, car number, and when he last saw them. When someone new says "I live in flat 12", the guard checks the register. If the family in flat 12 is still around, the newcomer is refused. If the flat has been empty for months, the guard phones the old number first, and only if nobody answers does he update the register. The SISF <b>binding table</b> is that register for IPv6 addresses.</p>

<h3>What one entry contains</h3>
<ul>
<li><b>IPv6 address</b> (link-local and global addresses are separate entries),</li>
<li><b>link-layer (MAC) address</b>,</li>
<li><b>interface</b> and <b>VLAN</b> where the owner lives,</li>
<li><b>how it was learned</b> (the source code),</li>
<li><b>preference level</b> (prlvl): how trustworthy the source is,</li>
<li><b>state</b> and <b>time left</b> in that state.</li>
</ul>

<h3>Where entries come from</h3>
<table class="cmp"><tr><th>Code</th><th>Source</th><th>Example</th></tr>
<tr><td>ND</td><td>NDP messages: NS (including DAD), NA, RS with a non-zero source</td><td>PC1's NS to resolve the gateway</td></tr>
<tr><td>DH6</td><td>DHCPv6: the address in a REPLY the switch saw the client receive</td><td>A lease from R1's pool</td></tr>
<tr><td>S</td><td>Static binding typed by the administrator</td><td>A silent server or a printer</td></tr>
<tr><td>PKT</td><td>Data glean: a data packet from an unknown source, verified by the switch</td><td>A host that never sent NDP the switch saw</td></tr>
</table>
<pre class="code"><span class="c">! Static binding, IOS XE syntax</span>
device-tracking binding vlan 30 2001:db8:a30::50 interface GigabitEthernet1/0/10 0050.7966.6850
<span class="c">! Older IOS syntax</span>
ipv6 neighbor binding vlan 30 2001:db8:a30::50 interface GigabitEthernet0/4 0050.7966.6850
<span class="c">! Global lifetimes (IOS XE)</span>
device-tracking binding reachable-lifetime 300
device-tracking binding stale-lifetime 86400</pre>

<h3>Preference levels</h3>
<p>Not all sources are equal. Each entry carries flags, shown as a hex <b>prlvl</b> value:</p>
<pre class="out">0001:MAC and LLA match     0002:Orig trunk            0004:Orig access
0008:Orig trusted trunk    0010:Orig trusted access   0020:DHCP assigned
0040:Cga authenticated     0080:Cert authenticated    0100:Statically assigned</pre>
<p>So <code>0005</code> means "learned on an access port and the MAC matched the link-layer option", and <code>0025</code> adds "DHCP assigned". When two claims collide, the one with the <b>higher preference</b> wins: a static or DHCP-assigned entry beats a plain ND-learned one, and an entry from a trusted port beats one from an untrusted port.</p>

<h3>Entry states</h3>
<dl class="terms">
<dt>TENTATIVE</dt><dd>Learned from DAD; the owner is still checking the address is unique.</dd>
<dt>INCOMPLETE</dt><dd>The switch is trying to confirm the entry and has no answer yet.</dd>
<dt>REACHABLE</dt><dd>Confirmed recently. Default reachable lifetime is 300 seconds.</dd>
<dt>VERIFY</dt><dd>With <code>tracking enable</code>, the reachable timer expired and the switch is probing the owner with an NS.</dd>
<dt>STALE</dt><dd>Not confirmed recently but still kept (default up to 24 hours). The binding still exists and still counts as owned.</dd>
<dt>DOWN</dt><dd>The port went down; the entry is kept for a while in case the host returns.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Binding ownership decision">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="12">New claim for ::12</text><text x="115" y="58" text-anchor="middle" class="svg-muted" font-size="12">from Gi0/3</text>
<rect x="245" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="12">Bound elsewhere?</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">yes: Gi0/2</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="12">Owner still there?</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">REACHABLE or answers NS</text>
<line x1="210" y1="45" x2="245" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="150" width="200" height="56" rx="8" fill="#fed7aa"/><text x="430" y="172" text-anchor="middle" class="svg-ink" font-size="12">Yes: drop the claim</text><text x="430" y="190" text-anchor="middle" class="svg-muted" font-size="12">%SISF-4-IP_THEFT</text>
<rect x="60" y="150" width="220" height="56" rx="8" fill="#bbf7d0"/><text x="170" y="172" text-anchor="middle" class="svg-ink" font-size="12">No: host moved</text><text x="170" y="190" text-anchor="middle" class="svg-muted" font-size="12">update entry to Gi0/3</text>
<line x1="500" y1="70" x2="450" y2="150" stroke="#64748b" stroke-width="2"/><line x1="560" y1="70" x2="250" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">First come, first served, with a check: a live owner keeps its address; a silent one can be replaced when the host really moved.</p></div>

<h3>Ownership: first come, first served</h3>
<p>At <code>security-level guard</code> or <code>inspect</code>, the first port and MAC to claim an address own it. If another port or MAC later claims the same address in an NS or NA:</p>
<ol>
<li>If the new claim has a higher preference (for example a DHCPv6 assignment or a static entry), it replaces the old one.</li>
<li>Otherwise, if the existing owner is REACHABLE, or answers the switch's probe, the new claim is <b>dropped</b> and the switch logs <code>%SISF-4-IP_THEFT</code>.</li>
<li>If the owner does not answer, the switch treats it as a host that moved and updates the entry to the new port.</li>
</ol>
<p>This is what stops NA spoofing and DAD denial of service: a false NA for an address bound to a live host is not forwarded.</p>

<h3>Reading the table</h3>
<pre class="out">SW1# show ipv6 neighbors binding
Binding Table has 6 entries, 6 dynamic (limit 200000)
Codes: ND - learnt from Neighbor Discovery, DH6 - learnt from DHCPv6, PKT - learnt from data packet, S - Static
Preflevel flags (prlvl):
0001:MAC and link-layer option match   0004:Orig access port   0020:DHCP assigned

    IPv6 address                            Link-Layer addr Interface  vlan prlvl  age    state      Time left
<span class="hl">ND  2001:DB8:A30::11                        0050.7966.6801  Gi0/1      30   0005   12 s   REACHABLE  288 s</span>
ND  2001:DB8:A30::12                        0050.7966.6802  Gi0/2      30   0005   10 s   REACHABLE  290 s
ND  2001:DB8:A30::13                        0050.7966.6803  Gi0/3      30   0005   8 s    REACHABLE  292 s
ND  FE80::250:79FF:FE66:6801                0050.7966.6801  Gi0/1      30   0005   12 s   REACHABLE  288 s
ND  FE80::250:79FF:FE66:6802                0050.7966.6802  Gi0/2      30   0005   10 s   REACHABLE  290 s
ND  FE80::250:79FF:FE66:6803                0050.7966.6803  Gi0/3      30   0005   8 s    REACHABLE  292 s</pre>
<p>On IOS XE, <code>show device-tracking database</code> shows the same columns (it calls the first column "Network Layer Address"), and <code>show device-tracking database address 2001:db8:a30::12 details</code> or <code>... interface Gi1/0/2</code> filter it.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3, VLAN 30. PC1 (::11, Gi0/1), PC2 (::12, Gi0/2) and PC3 (::13, Gi0/3) each ping the gateway 2001:db8:a30::1. Each ping starts with an NS for the gateway, which carries the PC's source address, so snooping learns six entries: three globals and three link-locals, all prlvl 0005. Now PC3 changes its address to ::12 and pings again. Its NS claims ::12 from Gi0/3 with MAC 0050.7966.6803. The table says ::12 belongs to Gi0/2, MAC ...6802, and PC2 is REACHABLE. Decision: drop, and log <code>%SISF-4-IP_THEFT</code>. The entry for ::12 stays on Gi0/2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting a silent device to appear in the table. A server with a static address that never sends NDP (or sends it only when somebody else starts a conversation) may be missing. Add a static binding, or make sure the device generates traffic before you enable source guard.</p></div>

<div class="exam"><p><b>Exam trap.</b> STALE does <b>not</b> mean deleted. A STALE entry still owns its address; a new claim from another port triggers a probe first. Also remember the three dynamic learning sources: NDP, DHCPv6 and data glean, plus static.</p></div>

<div class="scn"><h4>The laptop that moved desks</h4><p>A user undocked her laptop on the third floor and docked it on the fifth floor, same VLAN stretched across both switches. For about a minute her IPv6 traffic failed. <code>show device-tracking database address</code> on the new switch showed nothing; the old switch still had the entry, now in DOWN state. Because the two access switches were joined by a trunk with <code>device-role switch</code>, the new claim was accepted after the switch found no answer from the old location. The delay was the probe timeout, not a fault.</p><p><b>Lesson:</b> host mobility works because ownership is confirmed by probing, not by permanent locks. Be ready to explain the short delay.</p></div>

<div class="iv"><p class="q">"How does the switch decide whether a second claim for an IPv6 address is an attack or a host that moved?"</p><p>It compares preference first: static, DHCP-assigned or trusted-port entries win over plain ND ones. For equal preference it checks whether the existing owner is still alive: if the entry is REACHABLE or the owner answers a Neighbor Solicitation probe, the new claim is dropped and IP_THEFT is logged; if the owner is silent, the entry moves. Mention first come, first served.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One entry = IPv6 address, MAC, port, VLAN, source, preference and state.</li>
<li>Sources: ND, DHCPv6 (DH6), data glean (PKT) and static (S).</li>
<li>Preference (prlvl) settles collisions: static and DHCP beat ND; trusted beats untrusted.</li>
<li>States: TENTATIVE, INCOMPLETE, REACHABLE, VERIFY, STALE, DOWN; STALE still owns the address.</li>
<li>A second claim against a live owner is dropped with %SISF-4-IP_THEFT.</li>
</ul></div>
`,hi:`
<p>Ek achha society guard register rakhta hai: flat number, family ka naam, car number, aur unhe aakhri baar kab dekha. Jab koi naya aadmi kehta hai "main flat 12 mein rehta hoon", guard register check karta hai. Agar flat 12 wali family abhi bhi hai, to naye aadmi ko mana kar diya jaata hai. Agar flat mahino se khaali hai, to guard pehle purane number par phone karta hai, aur koi jawab na de tabhi register update karta hai. SISF <b>binding table</b> IPv6 addresses ke liye yahi register hai.</p>

<h3>Ek entry mein kya hota hai</h3>
<ul>
<li><b>IPv6 address</b> (link-local aur global addresses alag entries hain),</li>
<li><b>link-layer (MAC) address</b>,</li>
<li><b>interface</b> aur <b>VLAN</b> jahan owner rehta hai,</li>
<li><b>kaise seekha gaya</b> (source code),</li>
<li><b>preference level</b> (prlvl): source kitna bharosemand hai,</li>
<li><b>state</b> aur us state mein <b>bacha hua time</b>.</li>
</ul>

<h3>Entries kahan se aati hain</h3>
<table class="cmp"><tr><th>Code</th><th>Source</th><th>Example</th></tr>
<tr><td>ND</td><td>NDP messages: NS (DAD samet), NA, non-zero source wala RS</td><td>Gateway resolve karne ke liye PC1 ka NS</td></tr>
<tr><td>DH6</td><td>DHCPv6: REPLY ka woh address jo switch ne client ko milte dekha</td><td>R1 ke pool se lease</td></tr>
<tr><td>S</td><td>Administrator ki type ki hui static binding</td><td>Silent server ya printer</td></tr>
<tr><td>PKT</td><td>Data glean: anjaan source ka data packet, switch se verify kiya hua</td><td>Aisa host jiska koi NDP switch ne nahi dekha</td></tr>
</table>
<pre class="code"><span class="c">! Static binding, IOS XE syntax</span>
device-tracking binding vlan 30 2001:db8:a30::50 interface GigabitEthernet1/0/10 0050.7966.6850
<span class="c">! Purana IOS syntax</span>
ipv6 neighbor binding vlan 30 2001:db8:a30::50 interface GigabitEthernet0/4 0050.7966.6850
<span class="c">! Global lifetimes (IOS XE)</span>
device-tracking binding reachable-lifetime 300
device-tracking binding stale-lifetime 86400</pre>

<h3>Preference levels</h3>
<p>Saare sources barabar nahi hain. Har entry flags rakhti hai, jo hex <b>prlvl</b> value ke roop mein dikhte hain:</p>
<pre class="out">0001:MAC and LLA match     0002:Orig trunk            0004:Orig access
0008:Orig trusted trunk    0010:Orig trusted access   0020:DHCP assigned
0040:Cga authenticated     0080:Cert authenticated    0100:Statically assigned</pre>
<p>Toh <code>0005</code> ka matlab "access port par seekha aur MAC link-layer option se match hua", aur <code>0025</code> "DHCP assigned" jodta hai. Jab do claims takraate hain, <b>zyada preference</b> wala jeetta hai: static ya DHCP-assigned entry plain ND-learned entry ko harati hai, aur trusted port wali entry untrusted port wali ko.</p>

<h3>Entry states</h3>
<dl class="terms">
<dt>TENTATIVE</dt><dd>DAD se seekhi; owner abhi check kar raha hai ki address unique hai.</dd>
<dt>INCOMPLETE</dt><dd>Switch entry confirm karne ki koshish kar raha hai aur abhi jawab nahi mila.</dd>
<dt>REACHABLE</dt><dd>Haal hi mein confirm hui. Default reachable lifetime 300 seconds hai.</dd>
<dt>VERIFY</dt><dd><code>tracking enable</code> ke saath, reachable timer khatam hua aur switch owner ko NS se probe kar raha hai.</dd>
<dt>STALE</dt><dd>Haal mein confirm nahi hui par rakhi gayi hai (default 24 ghante tak). Binding abhi bhi maujood hai aur owned maani jaati hai.</dd>
<dt>DOWN</dt><dd>Port down ho gaya; host wapas aaye isliye entry kuch der rakhi jaati hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Binding ownership decision">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="12">::12 ke liye naya claim</text><text x="115" y="58" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 se</text>
<rect x="245" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="12">Kahin aur bound?</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">haan: Gi0/2</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="12">Owner abhi hai?</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">REACHABLE ya NS ka jawab</text>
<line x1="210" y1="45" x2="245" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="150" width="200" height="56" rx="8" fill="#fed7aa"/><text x="430" y="172" text-anchor="middle" class="svg-ink" font-size="12">Haan: claim drop</text><text x="430" y="190" text-anchor="middle" class="svg-muted" font-size="12">%SISF-4-IP_THEFT</text>
<rect x="60" y="150" width="220" height="56" rx="8" fill="#bbf7d0"/><text x="170" y="172" text-anchor="middle" class="svg-ink" font-size="12">Nahi: host move hua</text><text x="170" y="190" text-anchor="middle" class="svg-muted" font-size="12">entry Gi0/3 par update</text>
<line x1="500" y1="70" x2="450" y2="150" stroke="#64748b" stroke-width="2"/><line x1="560" y1="70" x2="250" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">First come, first served, ek check ke saath: zinda owner apna address rakhta hai; chup owner ko tab badla ja sakta hai jab host sach mein move hua ho.</p></div>

<h3>Ownership: first come, first served</h3>
<p><code>security-level guard</code> ya <code>inspect</code> par, jo port aur MAC pehle address claim karta hai woh uska maalik hai. Agar baad mein koi doosra port ya MAC NS ya NA mein same address claim kare:</p>
<ol>
<li>Agar naye claim ki preference zyada hai (jaise DHCPv6 assignment ya static entry), to woh purani ko replace karta hai.</li>
<li>Warna, agar maujooda owner REACHABLE hai, ya switch ke probe ka jawab deta hai, to naya claim <b>drop</b> hota hai aur switch <code>%SISF-4-IP_THEFT</code> log karta hai.</li>
<li>Agar owner jawab nahi deta, to switch use move hua host maanta hai aur entry naye port par update karta hai.</li>
</ol>
<p>Yahi NA spoofing aur DAD denial of service ko rokta hai: zinda host par bound address ka jhootha NA forward nahi hota.</p>

<h3>Table padhna</h3>
<pre class="out">SW1# show ipv6 neighbors binding
Binding Table has 6 entries, 6 dynamic (limit 200000)
Codes: ND - learnt from Neighbor Discovery, DH6 - learnt from DHCPv6, PKT - learnt from data packet, S - Static
Preflevel flags (prlvl):
0001:MAC and link-layer option match   0004:Orig access port   0020:DHCP assigned

    IPv6 address                            Link-Layer addr Interface  vlan prlvl  age    state      Time left
<span class="hl">ND  2001:DB8:A30::11                        0050.7966.6801  Gi0/1      30   0005   12 s   REACHABLE  288 s</span>
ND  2001:DB8:A30::12                        0050.7966.6802  Gi0/2      30   0005   10 s   REACHABLE  290 s
ND  2001:DB8:A30::13                        0050.7966.6803  Gi0/3      30   0005   8 s    REACHABLE  292 s
ND  FE80::250:79FF:FE66:6801                0050.7966.6801  Gi0/1      30   0005   12 s   REACHABLE  288 s
ND  FE80::250:79FF:FE66:6802                0050.7966.6802  Gi0/2      30   0005   10 s   REACHABLE  290 s
ND  FE80::250:79FF:FE66:6803                0050.7966.6803  Gi0/3      30   0005   8 s    REACHABLE  292 s</pre>
<p>IOS XE par <code>show device-tracking database</code> same columns dikhata hai (pehle column ko "Network Layer Address" kehta hai), aur <code>show device-tracking database address 2001:db8:a30::12 details</code> ya <code>... interface Gi1/0/2</code> use filter karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3, VLAN 30. PC1 (::11, Gi0/1), PC2 (::12, Gi0/2) aur PC3 (::13, Gi0/3) har ek gateway 2001:db8:a30::1 ping karta hai. Har ping gateway ke liye NS se shuru hota hai, jisme PC ka source address hota hai, isliye snooping chhe entries seekhta hai: teen globals aur teen link-locals, sab prlvl 0005. Ab PC3 apna address ::12 kar leta hai aur phir ping karta hai. Uska NS Gi0/3 se MAC 0050.7966.6803 ke saath ::12 claim karta hai. Table kehti hai ::12 Gi0/2, MAC ...6802 ka hai, aur PC2 REACHABLE hai. Faisla: drop, aur <code>%SISF-4-IP_THEFT</code> log. ::12 ki entry Gi0/2 par hi rehti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Silent device ke table mein dikhne ki ummeed karna. Static address wala server jo kabhi NDP nahi bhejta (ya tabhi bhejta hai jab koi aur baatcheet shuru kare) shayad missing ho. Static binding jodo, ya source guard on karne se pehle pakka karo ki device traffic generate kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> STALE ka matlab delete <b>nahi</b> hai. STALE entry abhi bhi apne address ki maalik hai; doosre port ka naya claim pehle probe trigger karta hai. Aur teen dynamic learning sources yaad rakho: NDP, DHCPv6 aur data glean, plus static.</p></div>

<div class="scn"><h4>Laptop jisne desk badli</h4><p>Ek user ne teesri manzil par laptop undock kiya aur paanchvi manzil par dock kiya, same VLAN dono switches par stretched tha. Lagbhag ek minute tak uska IPv6 traffic fail raha. Naye switch par <code>show device-tracking database address</code> mein kuch nahi tha; purane switch par entry abhi bhi thi, ab DOWN state mein. Kyunki dono access switches <code>device-role switch</code> wale trunk se jude the, switch ko purani location se jawab na milne par naya claim accept ho gaya. Delay probe timeout tha, fault nahi.</p><p><b>Seekh:</b> host mobility isliye chalti hai kyunki ownership probing se confirm hoti hai, permanent locks se nahi. Chhote delay ko samjhane ke liye taiyaar raho.</p></div>

<div class="iv"><p class="q">"Switch kaise decide karta hai ki IPv6 address ka doosra claim attack hai ya move hua host?"</p><p>Pehle preference compare karta hai: static, DHCP-assigned ya trusted-port entries plain ND wali entries se jeetti hain. Barabar preference par check karta hai ki maujooda owner zinda hai ya nahi: agar entry REACHABLE hai ya owner Neighbor Solicitation probe ka jawab deta hai, to naya claim drop hota hai aur IP_THEFT log hota hai; agar owner chup hai, to entry move ho jaati hai. First come, first served ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek entry = IPv6 address, MAC, port, VLAN, source, preference aur state.</li>
<li>Sources: ND, DHCPv6 (DH6), data glean (PKT) aur static (S).</li>
<li>Preference (prlvl) takraav suljhati hai: static aur DHCP ND ko harate hain; trusted untrusted ko.</li>
<li>States: TENTATIVE, INCOMPLETE, REACHABLE, VERIFY, STALE, DOWN; STALE abhi bhi address ki maalik hai.</li>
<li>Zinda owner ke khilaaf doosra claim %SISF-4-IP_THEFT ke saath drop hota hai.</li>
</ul></div>
`}};export{e as default};