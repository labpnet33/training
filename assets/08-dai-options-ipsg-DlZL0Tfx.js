var e={id:`dai-options`,h:{en:`DAI validation, rate limits, ARP ACLs and IP Source Guard`,hi:`DAI validation, rate limits, ARP ACLs aur IP Source Guard`},body:{en:`
<p>A bank cashier checks the name on a cheque against the account. A careful cashier also checks that the signature matches, that the date is valid, and that nobody is presenting a hundred cheques per minute. DAI's basic check is the name against the account (sender MAC and IP against the bindings). This chapter adds the extra checks, the "hundred cheques per minute" rule, a manual list for customers who have no account record, and a related feature, <b>IP Source Guard</b>, that checks every packet, not only ARP.</p>

<h3>Optional validation checks</h3>
<p><code>ip arp inspection validate</code> adds sanity checks on top of the binding check. They catch malformed or crafted ARP packets that might otherwise slip through.</p>
<table class="cmp"><tr><th>Keyword</th><th>What it compares</th><th>Applies to</th></tr>
<tr><td><code>src-mac</code></td><td>Ethernet source MAC must equal the ARP sender MAC</td><td>Requests and replies</td></tr>
<tr><td><code>dst-mac</code></td><td>Ethernet destination MAC must equal the ARP target MAC</td><td>Replies</td></tr>
<tr><td><code>ip</code></td><td>Drops invalid addresses: 0.0.0.0, 255.255.255.255 and multicast (sender IP always, target IP in replies)</td><td>Requests and replies</td></tr>
</table>
<pre class="code">SW1(config)# ip arp inspection validate src-mac dst-mac ip   <span class="c">! all three in ONE command</span></pre>
<p>Every <code>validate</code> command <b>replaces</b> the previous one. If you type <code>validate src-mac</code> and then <code>validate ip</code>, only the ip check remains. Always list all the checks you want on a single line.</p>

<h3>DAI rate limiting</h3>
<p>Inspecting ARP uses the switch CPU. To stop an attacker (or a broken host) from overwhelming it, DAI limits ARP on untrusted ports to <b>15 packets per second by default</b>. Trusted ports have no limit. If an untrusted port exceeds its rate, it goes <b>err-disabled</b> with the reason <code>arp-inspection</code>:</p>
<pre class="out">%SW_DAI-4-PACKET_RATE_EXCEEDED: 16 packets received in 1000 milliseconds on Gi0/6.
<span class="hl">%PM-4-ERR_DISABLE: arp-inspection error detected on Gi0/6, putting Gi0/6 in err-disable state</span></pre>
<pre class="code">SW1(config)# interface g0/10
SW1(config-if)# ip arp inspection limit rate 100      <span class="c">! busy untrusted port</span>
SW1(config)# errdisable recovery cause arp-inspection  <span class="c">! optional auto-recovery</span></pre>
<p>Raise the limit on untrusted ports that legitimately carry many hosts (for example a port to a small unmanaged switch or a virtualisation host). On trunks, prefer trust if the neighbour also runs DAI.</p>

<h3>ARP ACLs for static hosts</h3>
<p>Besides static bindings, you can permit known static-IP hosts with an <b>ARP access list</b>. ARP ACLs are checked <b>before</b> the binding table.</p>
<pre class="code">SW1(config)# arp access-list FIN-STATIC
SW1(config-arp-nacl)# permit ip host 10.30.0.11 mac host 0050.7966.1e01
SW1(config-arp-nacl)# permit ip host 10.30.0.12 mac host 0050.7966.1e02
SW1(config-arp-nacl)# exit
SW1(config)# ip arp inspection filter FIN-STATIC vlan 30</pre>
<ul>
<li>A <b>permit</b> match forwards the ARP; an explicit <b>deny</b> drops it.</li>
<li>If nothing matches (the implicit deny), DAI <b>falls back</b> to the DHCP snooping bindings.</li>
<li>Add the <code>static</code> keyword (<code>ip arp inspection filter FIN-STATIC vlan 30 static</code>) and the implicit deny becomes final: no fallback to bindings.</li>
</ul>
<p>Static bindings are tied to a port; ARP ACLs are tied to a VLAN. Bindings are also reused by IP Source Guard, so many engineers prefer them.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="DAI decision order">
<rect x="10" y="60" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="12">ARP on</text><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="12">untrusted port</text>
<line x1="130" y1="88" x2="160" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="215" y="85" text-anchor="middle" class="svg-ink" font-size="12">Rate OK?</text><text x="215" y="102" text-anchor="middle" class="svg-ink" font-size="12">validate OK?</text>
<line x1="270" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="60" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="350" y="92" text-anchor="middle" class="svg-ink" font-size="12">ARP ACL</text>
<line x1="400" y1="88" x2="430" y2="88" stroke="#64748b" stroke-width="2"/><text x="415" y="80" text-anchor="middle" class="svg-muted" font-size="11">no match</text>
<rect x="430" y="60" width="100" height="56" rx="8" fill="#bae6fd"/><text x="480" y="92" text-anchor="middle" class="svg-ink" font-size="12">Bindings</text>
<line x1="530" y1="88" x2="560" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="560" y="60" width="70" height="56" rx="8" fill="#bbf7d0"/><text x="595" y="92" text-anchor="middle" class="svg-ink" font-size="12">Forward</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Any failure: drop and log (rate exceeded: err-disable)</text>
</svg><p class="cap">Rate limit and validation first, then ARP ACL, then the binding table.</p></div>

<h3>IP Source Guard: checking every packet</h3>
<p>DAI only checks ARP. A host could still send IP packets with a <b>spoofed source IP</b>, for example to hide during an attack or to impersonate a server. <b>IP Source Guard (IPSG)</b> uses the same binding table to build a per-port filter: on an untrusted access port, only IP packets whose source IP matches that port's binding are allowed. Until a binding exists, only DHCP is allowed, so the host can still get its lease.</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# ip verify source                  <span class="c">! filter by source IP</span>
<span class="c">! or, with port security enabled, filter by source IP and MAC:</span>
SW1(config-if)# ip verify source port-security</pre>
<pre class="out">SW1# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
<span class="hl">Gi0/1      ip           active       10.30.0.11                          30</span></pre>
<p>At CCNA level you need the concept: IPSG stops IP address spoofing on access ports, it depends on DHCP snooping bindings or static bindings, and it complements DAI (ARP) and port security (MAC).</p>

<div class="eg"><p><b>Worked example.</b> A finance port Gi0/6 is shared by a docking station with three laptops through a small desktop switch. Normal ARP traffic peaks around 25 packets per second at 9 a.m., so the default 15 pps err-disables the port every morning with reason arp-inspection. Setting <code>ip arp inspection limit rate 50</code> on Gi0/6 keeps protection while allowing the real peak.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing several <code>validate</code> commands and assuming they add up. (2) Leaving the default 15 pps on a busy untrusted port or an untrusted trunk, then chasing "random" err-disabled ports. (3) Adding <code>static</code> to an ARP ACL filter and forgetting DHCP clients, which now fail the implicit deny. (4) Enabling IPSG before bindings exist, which blocks the host's IP traffic.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI's default rate limit on untrusted ports is <b>15 pps</b>; exceeding it err-disables the port. Validation keywords are src-mac, dst-mac and ip, and the last validate command wins. IP Source Guard filters <b>IP</b> by source; DAI filters <b>ARP</b>; both use the snooping bindings.</p></div>

<div class="scn"><h4>Morning err-disables on the lab trunk</h4><p>A training company enabled DAI on the student VLAN. Every morning at 9 a.m. the port towards the lab's small switch went err-disabled. <code>show interfaces status err-disabled</code> showed <code>arp-inspection</code>. Thirty laptops booted at once and sent more than 15 ARP packets per second through that one untrusted port. The engineer raised the limit on that port to 100 pps and enabled <code>errdisable recovery cause arp-inspection</code> as a safety net. The problem disappeared, and a real ARP storm would still be caught.</p><p><b>Lesson:</b> size the DAI rate limit to the real number of hosts behind a port; the default assumes one host.</p></div>

<div class="iv"><p class="q">"What is the difference between DAI and IP Source Guard?"</p><p>Strong answer: both use the DHCP snooping binding table (or static bindings). DAI inspects ARP packets and drops those whose sender MAC/IP do not match, which stops ARP poisoning. IP Source Guard filters all IP traffic on a port by source IP (and optionally MAC with port security), which stops IP spoofing. Mention DAI's 15 pps default rate limit and the validate keywords as extra points.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ip arp inspection validate src-mac dst-mac ip adds sanity checks; the last validate command replaces earlier ones.</li>
<li>DAI rate-limits untrusted ports to 15 pps by default; exceeding it err-disables the port (arp-inspection).</li>
<li>ARP ACLs are checked before bindings; with the static keyword there is no fallback.</li>
<li>IP Source Guard (ip verify source) filters IP packets by source using the same bindings.</li>
<li>Port security guards MACs, DAI guards ARP, IPSG guards source IPs: together they close spoofing.</li>
</ul></div>
`,hi:`
<p>Bank cashier cheque par naam ko account se check karta hai. Ek dhyaan rakhne wala cashier yeh bhi check karta hai ki signature match karta hai, date valid hai, aur koi ek minute mein sau cheques nahi de raha. DAI ka basic check naam ko account se milana hai (sender MAC aur IP ko bindings se). Yeh chapter extra checks jodta hai, "ek minute mein sau cheques" wala rule, un customers ke liye manual list jinka account record nahi hai, aur ek related feature, <b>IP Source Guard</b>, jo sirf ARP nahi, har packet check karta hai.</p>

<h3>Optional validation checks</h3>
<p><code>ip arp inspection validate</code> binding check ke upar sanity checks jodta hai. Yeh malformed ya crafted ARP packets pakadte hain jo warna nikal sakte the.</p>
<table class="cmp"><tr><th>Keyword</th><th>Kya compare karta hai</th><th>Kis par lagta hai</th></tr>
<tr><td><code>src-mac</code></td><td>Ethernet source MAC ARP sender MAC ke barabar hona chahiye</td><td>Requests aur replies</td></tr>
<tr><td><code>dst-mac</code></td><td>Ethernet destination MAC ARP target MAC ke barabar hona chahiye</td><td>Replies</td></tr>
<tr><td><code>ip</code></td><td>Invalid addresses drop karta hai: 0.0.0.0, 255.255.255.255 aur multicast (sender IP hamesha, target IP replies mein)</td><td>Requests aur replies</td></tr>
</table>
<pre class="code">SW1(config)# ip arp inspection validate src-mac dst-mac ip   <span class="c">! teeno EK command mein</span></pre>
<p>Har <code>validate</code> command pichhle wale ko <b>replace</b> karta hai. Agar aap <code>validate src-mac</code> aur phir <code>validate ip</code> type karte ho, to sirf ip check bachta hai. Jo bhi checks chahiye unhe hamesha ek hi line mein list karo.</p>

<h3>DAI rate limiting</h3>
<p>ARP inspect karne mein switch ka CPU lagta hai. Attacker (ya kharaab host) use overwhelm na kare, isliye DAI untrusted ports par ARP ko <b>default mein 15 packets per second</b> tak limit karta hai. Trusted ports par koi limit nahi hota. Agar koi untrusted port apna rate exceed kare, to woh reason <code>arp-inspection</code> ke saath <b>err-disabled</b> ho jaata hai:</p>
<pre class="out">%SW_DAI-4-PACKET_RATE_EXCEEDED: 16 packets received in 1000 milliseconds on Gi0/6.
<span class="hl">%PM-4-ERR_DISABLE: arp-inspection error detected on Gi0/6, putting Gi0/6 in err-disable state</span></pre>
<pre class="code">SW1(config)# interface g0/10
SW1(config-if)# ip arp inspection limit rate 100      <span class="c">! busy untrusted port</span>
SW1(config)# errdisable recovery cause arp-inspection  <span class="c">! optional auto-recovery</span></pre>
<p>Un untrusted ports par limit badhao jo legitimately bahut hosts le jaate hain (jaise chhote unmanaged switch ya virtualisation host ki taraf ka port). Trunks par, agar neighbour bhi DAI chalata hai, to trust prefer karo.</p>

<h3>Static hosts ke liye ARP ACLs</h3>
<p>Static bindings ke alawa, aap known static-IP hosts ko <b>ARP access list</b> se permit kar sakte ho. ARP ACLs binding table se <b>pehle</b> check hote hain.</p>
<pre class="code">SW1(config)# arp access-list FIN-STATIC
SW1(config-arp-nacl)# permit ip host 10.30.0.11 mac host 0050.7966.1e01
SW1(config-arp-nacl)# permit ip host 10.30.0.12 mac host 0050.7966.1e02
SW1(config-arp-nacl)# exit
SW1(config)# ip arp inspection filter FIN-STATIC vlan 30</pre>
<ul>
<li><b>Permit</b> match ARP forward karta hai; explicit <b>deny</b> use drop karta hai.</li>
<li>Agar kuch match na ho (implicit deny), DAI DHCP snooping bindings par <b>fall back</b> karta hai.</li>
<li><code>static</code> keyword jodo (<code>ip arp inspection filter FIN-STATIC vlan 30 static</code>) to implicit deny final ho jaata hai: bindings par fallback nahi.</li>
</ul>
<p>Static bindings port se bandhi hoti hain; ARP ACLs VLAN se. Bindings IP Source Guard bhi reuse karta hai, isliye bahut engineers unhe prefer karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="DAI decision order">
<rect x="10" y="60" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="12">Untrusted port</text><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="12">par ARP</text>
<line x1="130" y1="88" x2="160" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="215" y="85" text-anchor="middle" class="svg-ink" font-size="12">Rate OK?</text><text x="215" y="102" text-anchor="middle" class="svg-ink" font-size="12">validate OK?</text>
<line x1="270" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="60" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="350" y="92" text-anchor="middle" class="svg-ink" font-size="12">ARP ACL</text>
<line x1="400" y1="88" x2="430" y2="88" stroke="#64748b" stroke-width="2"/><text x="415" y="80" text-anchor="middle" class="svg-muted" font-size="11">match nahi</text>
<rect x="430" y="60" width="100" height="56" rx="8" fill="#bae6fd"/><text x="480" y="92" text-anchor="middle" class="svg-ink" font-size="12">Bindings</text>
<line x1="530" y1="88" x2="560" y2="88" stroke="#64748b" stroke-width="2"/>
<rect x="560" y="60" width="70" height="56" rx="8" fill="#bbf7d0"/><text x="595" y="92" text-anchor="middle" class="svg-ink" font-size="12">Forward</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Koi bhi failure: drop aur log (rate exceed: err-disable)</text>
</svg><p class="cap">Pehle rate limit aur validation, phir ARP ACL, phir binding table.</p></div>

<h3>IP Source Guard: har packet check karna</h3>
<p>DAI sirf ARP check karta hai. Host abhi bhi <b>spoofed source IP</b> wale IP packets bhej sakta hai, jaise attack ke dauraan chhupne ya kisi server ki nakal karne ke liye. <b>IP Source Guard (IPSG)</b> wahi binding table use karke per-port filter banata hai: untrusted access port par sirf woh IP packets allowed hain jinka source IP us port ki binding se match kare. Jab tak binding nahi hoti, sirf DHCP allowed hai, taaki host apni lease le sake.</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# ip verify source                  <span class="c">! source IP se filter</span>
<span class="c">! ya, port security enabled ho to source IP aur MAC dono se filter:</span>
SW1(config-if)# ip verify source port-security</pre>
<pre class="out">SW1# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
<span class="hl">Gi0/1      ip           active       10.30.0.11                          30</span></pre>
<p>CCNA level par aapko concept chahiye: IPSG access ports par IP address spoofing rokta hai, DHCP snooping bindings ya static bindings par depend karta hai, aur DAI (ARP) aur port security (MAC) ko complement karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Finance port Gi0/6 ek docking station share karta hai jiske peeche chhote desktop switch se teen laptops hain. Subah 9 baje normal ARP traffic lagbhag 25 packets per second tak jaata hai, isliye default 15 pps har subah port ko reason arp-inspection ke saath err-disable kar deta hai. Gi0/6 par <code>ip arp inspection limit rate 50</code> set karne se protection bani rehti hai aur asli peak bhi allow hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Kai <code>validate</code> commands type karke maan lena ki woh jud jaate hain. (2) Busy untrusted port ya untrusted trunk par default 15 pps chhodna, phir "random" err-disabled ports ke peeche bhaagna. (3) ARP ACL filter mein <code>static</code> jodna aur DHCP clients ko bhool jaana, jo ab implicit deny fail karte hain. (4) Bindings banne se pehle IPSG enable karna, jo host ka IP traffic block kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Untrusted ports par DAI ka default rate limit <b>15 pps</b> hai; exceed karne par port err-disable hota hai. Validation keywords src-mac, dst-mac aur ip hain, aur aakhri validate command jeet-ta hai. IP Source Guard <b>IP</b> ko source se filter karta hai; DAI <b>ARP</b> ko; dono snooping bindings use karte hain.</p></div>

<div class="scn"><h4>Lab trunk par subah ke err-disables</h4><p>Ek training company ne student VLAN par DAI enable kiya. Har subah 9 baje lab ke chhote switch ki taraf ka port err-disabled ho jaata tha. <code>show interfaces status err-disabled</code> ne <code>arp-inspection</code> dikhaya. Tees laptops ek saath boot hote aur us ek untrusted port se 15 se zyada ARP packets per second bhejte. Engineer ne us port par limit 100 pps kiya aur safety net ke liye <code>errdisable recovery cause arp-inspection</code> enable kiya. Problem gayab ho gayi, aur asli ARP storm abhi bhi pakda jaata.</p><p><b>Seekh:</b> DAI rate limit ko port ke peeche ke asli hosts ki ginti ke hisaab se rakho; default ek host maan kar chalta hai.</p></div>

<div class="iv"><p class="q">"DAI aur IP Source Guard mein kya farak hai?"</p><p>Strong answer: dono DHCP snooping binding table (ya static bindings) use karte hain. DAI ARP packets inspect karta hai aur jinka sender MAC/IP match nahi karta unhe drop karta hai, jo ARP poisoning rokta hai. IP Source Guard port par saara IP traffic source IP se filter karta hai (aur port security ke saath optionally MAC se), jo IP spoofing rokta hai. Extra points ke liye DAI ka 15 pps default rate limit aur validate keywords batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ip arp inspection validate src-mac dst-mac ip sanity checks jodta hai; aakhri validate command pichhle walon ko replace karta hai.</li>
<li>DAI untrusted ports ko default mein 15 pps tak limit karta hai; exceed karne par port err-disable hota hai (arp-inspection).</li>
<li>ARP ACLs bindings se pehle check hote hain; static keyword ke saath fallback nahi hota.</li>
<li>IP Source Guard (ip verify source) wahi bindings use karke IP packets ko source se filter karta hai.</li>
<li>Port security MACs, DAI ARP, IPSG source IPs guard karta hai: saath mein spoofing band karte hain.</li>
</ul></div>
`}};export{e as default};