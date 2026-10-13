var e={id:`big-picture`,h:{en:`Access control on the ASA: the big picture`,hi:`ASA par access control: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to decide exactly which traffic an ASA lets through, write it as clean extended ACLs built from objects and object-groups, apply them to the right interface and direction, and prove every decision with hit counters, syslog and <code>packet-tracer</code>. You will also master the single most-tested ASA access-control fact: since software 8.3, ACLs reference the <b>real</b> (untranslated) IP address of a server, not its public one. Finally you will walk through both labs of this module: publishing the DMZ to the internet with the minimum openings, and fixing a partner exception that never matches.</p>

<p><b>Prerequisites.</b> Finish <i>Interfaces, nameif, security levels, routing &amp; PAT</i> first. You should already know what <code>nameif</code> and <code>security-level</code> do, how the NK-ASA lab edge is built (outside 203.0.113.2, inside 10.0.1.0/24, DMZ 10.0.2.0/24) and what a stateful connection table is. NAT is only used here to explain the real-IP rule; the next module, <i>Dynamic PAT, static NAT &amp; port forwarding</i>, covers NAT in depth, and <i>packet-tracer, capture, connections &amp; syslog</i> goes deeper into troubleshooting.</p>

<h3>Start with an analogy: a gated housing society</h3>
<p>Picture a gated society with three blocks. The residents' block (inside) is the most trusted, the shops block (DMZ) is half-trusted, and the main road (outside, the internet) is not trusted at all. At the gate sits a guard (the ASA).</p>
<ul>
<li>Without any guest list, the guard follows a simple default: residents may walk out to the road and to the shops, but nobody from the road may walk in. That default is the <b>security level</b> rule.</li>
<li>When the committee gives the guard a <b>guest list</b> for a gate, the guard stops using the default at that gate and follows only the list, line by line from the top. If a visitor is not on the list, the answer is no. That list is an <b>access control list (ACL)</b>, and the silent final "no" is the <b>implicit deny</b>.</li>
<li>Once a visitor is let in, the guard remembers them. When they leave and come back through the same door within the visit, nobody checks the list again. That memory is the <b>connection table</b>, which is why return traffic and established connections bypass the ACL.</li>
<li>The shop has a public signboard address, but the guest list says "Shop 10, Block DMZ". The guard first reads the signboard, works out the real shop, and then checks the list. That is the <b>real-IP rule</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NK-ASA lab topology">
<rect x="20" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="90" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="250" y="80" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">ASA1 (NK-ASA)</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">the guard</text>
<rect x="480" y="30" width="140" height="60" rx="8" fill="#fed7aa"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text><text x="550" y="75" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="250" y="185" width="140" height="55" rx="8" fill="#bae6fd"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">WEB .10  MAIL .25</text>
<line x1="160" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="105" x2="480" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="150" x2="320" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="550" y="120" text-anchor="middle" class="svg-accent" font-size="12">INET, PARTNER</text>
<text x="550" y="138" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
</svg><p class="cap">The lab edge used throughout the module. Numbers in brackets are security levels. WEB and MAIL are published as 203.0.113.3 and 203.0.113.4.</p></div>

<h3>Why access control is the heart of a firewall</h3>
<p>Routing decides <i>where</i> a packet can go. Access control decides <i>whether</i> it is allowed to go there. A firewall that permits everything is just an expensive router. In real companies the ASA ACL is also a legal and audit document: when an auditor asks "who can reach the payment server?", the answer is the ACL. That is why good ACLs are short, ordered, commented, built from named objects and proven with counters.</p>

<h3>The five building blocks of this module</h3>
<table class="cmp"><tr><th>Block</th><th>What it is</th><th>Chapter</th></tr>
<tr><td><b>Evaluation order</b></td><td>How the ASA combines security levels, the conn table, NAT and ACLs</td><td>2</td></tr>
<tr><td><b>Extended ACLs</b></td><td>The rule syntax, with subnet masks (not wildcards)</td><td>3, 4</td></tr>
<tr><td><b>Objects and groups</b></td><td>Named hosts, subnets, services and bundles of them</td><td>5</td></tr>
<tr><td><b>Real-IP rule</b></td><td>ACLs match untranslated addresses and ports</td><td>6</td></tr>
<tr><td><b>Operations</b></td><td>Remarks, time ranges, logging, hit counts, least-privilege DMZ design, packet-tracer</td><td>7 to 10</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The business wants the web server reachable from the internet. The minimum opening is two lines: TCP to the web server's <b>real</b> address 10.0.2.10 on ports 80 and 443, applied inbound on <code>outside</code>. Anything more (for example "permit ip any any" to "get it working") turns the DMZ into an open network. In this module you will learn to open exactly as much as needed, and nothing more.</p></div>

<pre class="code"><span class="c">! a preview of where this module ends up</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object MAIL eq smtp
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
access-group OUTSIDE_IN in interface outside</pre>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a higher security level alone "protects" the DMZ forever. The moment someone applies an ACL to an interface, the security-level default no longer applies in that direction. One careless <code>permit ip any any</code> line then opens everything, regardless of levels.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often mix IOS and ASA habits. On the ASA, ACLs use <b>subnet masks</b>, are applied with <code>access-group</code> (not <code>ip access-group</code>), and are written against <b>real</b> IPs. Any answer using a wildcard mask or the public NAT address in an ASA ACL is wrong.</p></div>

<div class="scn"><h4>The "temporary" any-any rule</h4><p>During a go-live weekend, an engineer could not get a new partner portal working and added <code>access-list OUTSIDE_IN extended permit ip any any</code> at line 1 "for testing". The portal worked, the change ticket was closed, and the line stayed. Three months later a vulnerability scanner found SSH, SMB and an old admin panel on DMZ servers reachable from the internet. The audit team traced it to that line, which had 4.2 million hits. The fix was to remove it and replace it with three specific rules, each with a remark and a change number.</p><p><b>Lesson:</b> open exactly what the business needs, prove it, and never leave a broad rule behind.</p></div>

<div class="iv"><p class="q">"Walk me through how an ASA decides whether to allow a new connection from the internet to a DMZ server."</p><p>Strong answer: the ASA first checks whether the packet belongs to an existing connection; if not, it untranslates the destination (static NAT), routes it, then checks the inbound ACL on the ingress interface (or the global ACL), ending with the implicit deny. Without an ACL, security levels decide, and outside (0) to DMZ (50) is denied. Mention that the ACL must use the server's real IP because untranslation happens first, and that you would prove the decision with packet-tracer and hit counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security levels are the default guest rule; an ACL on an interface replaces that default in that direction.</li>
<li>ACLs are read top-down, first match wins, and every ACL ends with an implicit deny.</li>
<li>The connection table lets return and established traffic through without re-checking the ACL.</li>
<li>Since 8.3, ACLs reference real (untranslated) addresses.</li>
<li>Good ACLs are minimal, named with objects, commented and proven with counters and packet-tracer.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap exactly decide kar paoge ki ASA kaunsa traffic jaane deta hai, use objects aur object-groups se bani clean extended ACLs ke roop mein likh paoge, sahi interface aur direction par apply kar paoge, aur har decision ko hit counters, syslog aur <code>packet-tracer</code> se saabit kar paoge. Aap ASA access control ka sabse zyada test hone wala fact bhi master karoge: software 8.3 se, ACLs server ka <b>real</b> (untranslated) IP address refer karti hain, uska public address nahi. Aakhir mein aap is module ki dono labs walk karoge: DMZ ko minimum openings ke saath internet par publish karna, aur ek partner exception theek karna jo kabhi match nahi hota.</p>

<p><b>Prerequisites.</b> Pehle <i>Interfaces, nameif, security levels, routing &amp; PAT</i> khatam karo. Aapko pehle se pata hona chahiye ki <code>nameif</code> aur <code>security-level</code> kya karte hain, NK-ASA lab edge kaise bana hai (outside 203.0.113.2, inside 10.0.1.0/24, DMZ 10.0.2.0/24) aur stateful connection table kya hoti hai. NAT yahan sirf real-IP rule samjhane ke liye use hota hai; agla module, <i>Dynamic PAT, static NAT &amp; port forwarding</i>, NAT ko depth mein cover karta hai, aur <i>packet-tracer, capture, connections &amp; syslog</i> troubleshooting mein aur gehraai tak jaata hai.</p>

<h3>Ek analogy se shuru karo: gated housing society</h3>
<p>Teen blocks wali ek gated society socho. Residents ka block (inside) sabse trusted hai, shops ka block (DMZ) aadha trusted hai, aur main road (outside, internet) bilkul trusted nahi hai. Gate par ek guard baitha hai (ASA).</p>
<ul>
<li>Bina kisi guest list ke, guard ek simple default follow karta hai: residents road par aur shops tak jaa sakte hain, lekin road se koi andar nahi aa sakta. Yeh default hi <b>security level</b> rule hai.</li>
<li>Jab committee guard ko kisi gate ke liye <b>guest list</b> deti hai, to guard us gate par default use karna band kar deta hai aur sirf list follow karta hai, upar se line by line. Agar visitor list mein nahi hai, to jawab na hai. Woh list hi <b>access control list (ACL)</b> hai, aur aakhir ka chupa hua "na" <b>implicit deny</b> hai.</li>
<li>Ek baar visitor andar aa gaya, to guard use yaad rakhta hai. Jab woh visit ke dauraan usi darwaze se bahar jaake wapas aata hai, to koi list dobara check nahi karta. Woh yaaddasht <b>connection table</b> hai, isiliye return traffic aur established connections ACL ko bypass karte hain.</li>
<li>Shop ka ek public signboard address hai, lekin guest list mein likha hai "Shop 10, Block DMZ". Guard pehle signboard padhta hai, asli shop pata karta hai, aur phir list check karta hai. Yahi <b>real-IP rule</b> hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NK-ASA lab topology">
<rect x="20" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="90" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="250" y="80" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">ASA1 (NK-ASA)</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">guard</text>
<rect x="480" y="30" width="140" height="60" rx="8" fill="#fed7aa"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text><text x="550" y="75" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="250" y="185" width="140" height="55" rx="8" fill="#bae6fd"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">WEB .10  MAIL .25</text>
<line x1="160" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="105" x2="480" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="150" x2="320" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="550" y="120" text-anchor="middle" class="svg-accent" font-size="12">INET, PARTNER</text>
<text x="550" y="138" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
</svg><p class="cap">Poore module mein use hone wala lab edge. Brackets ke numbers security levels hain. WEB aur MAIL 203.0.113.3 aur 203.0.113.4 ke roop mein published hain.</p></div>

<h3>Access control firewall ka dil kyun hai</h3>
<p>Routing decide karta hai ki packet <i>kahan</i> jaa sakta hai. Access control decide karta hai ki use wahan jaane ki <i>ijaazat</i> hai ya nahi. Jo firewall sab kuch permit karta hai woh bas ek mehenga router hai. Real companies mein ASA ki ACL ek legal aur audit document bhi hoti hai: jab auditor poochta hai "payment server tak kaun pahunch sakta hai?", to jawab ACL hai. Isiliye achhi ACLs chhoti, ordered, commented, named objects se bani aur counters se proven hoti hain.</p>

<h3>Is module ke paanch building blocks</h3>
<table class="cmp"><tr><th>Block</th><th>Yeh kya hai</th><th>Chapter</th></tr>
<tr><td><b>Evaluation order</b></td><td>ASA security levels, conn table, NAT aur ACLs ko kaise combine karta hai</td><td>2</td></tr>
<tr><td><b>Extended ACLs</b></td><td>Rule syntax, subnet masks ke saath (wildcards nahi)</td><td>3, 4</td></tr>
<tr><td><b>Objects aur groups</b></td><td>Named hosts, subnets, services aur unke bundles</td><td>5</td></tr>
<tr><td><b>Real-IP rule</b></td><td>ACLs untranslated addresses aur ports match karti hain</td><td>6</td></tr>
<tr><td><b>Operations</b></td><td>Remarks, time ranges, logging, hit counts, least-privilege DMZ design, packet-tracer</td><td>7 se 10</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Business chahta hai ki web server internet se reachable ho. Minimum opening do lines ki hai: web server ke <b>real</b> address 10.0.2.10 par ports 80 aur 443 ke liye TCP, <code>outside</code> par inbound apply. Isse zyada kuch bhi (jaise "kaam chalane ke liye" "permit ip any any") DMZ ko open network bana deta hai. Is module mein aap exactly utna kholna seekhoge jitna zaroori hai, usse zyada kuch nahi.</p></div>

<pre class="code"><span class="c">! yeh module kahan khatam hota hai uska preview</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object MAIL eq smtp
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
access-group OUTSIDE_IN in interface outside</pre>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki sirf ek higher security level DMZ ko hamesha "protect" karega. Jaise hi koi kisi interface par ACL lagata hai, us direction mein security-level default apply hona band ho jaata hai. Phir ek laparwah <code>permit ip any any</code> line levels ki parwah kiye bina sab kuch khol deti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar IOS aur ASA ki aadaton ko mix karte hain. ASA par ACLs <b>subnet masks</b> use karti hain, <code>access-group</code> se apply hoti hain (<code>ip access-group</code> se nahi), aur <b>real</b> IPs ke against likhi jaati hain. ASA ACL mein wildcard mask ya public NAT address use karne wala koi bhi answer galat hai.</p></div>

<div class="scn"><h4>"Temporary" any-any rule</h4><p>Ek go-live weekend ke dauraan, ek engineer naya partner portal chala nahi pa raha tha aur usne "testing ke liye" line 1 par <code>access-list OUTSIDE_IN extended permit ip any any</code> jod di. Portal chal gaya, change ticket close ho gaya, aur line wahin reh gayi. Teen mahine baad ek vulnerability scanner ne DMZ servers par SSH, SMB aur ek purana admin panel internet se reachable paaya. Audit team ne ise usi line tak trace kiya, jis par 4.2 million hits the. Fix tha use hataana aur teen specific rules se replace karna, har ek remark aur change number ke saath.</p><p><b>Seekh:</b> exactly utna kholo jitna business ko chahiye, use saabit karo, aur kabhi koi broad rule peeche mat chhodo.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki ASA internet se DMZ server tak nayi connection allow karne ka decision kaise leta hai."</p><p>Strong answer: ASA pehle check karta hai ki packet kisi existing connection ka hai ya nahi; agar nahi, to woh destination untranslate karta hai (static NAT), use route karta hai, phir ingress interface ki inbound ACL (ya global ACL) check karta hai, jo implicit deny par khatam hoti hai. ACL ke bina security levels decide karte hain, aur outside (0) se DMZ (50) deny hota hai. Batao ki ACL ko server ka real IP use karna chahiye kyunki untranslation pehle hota hai, aur aap decision ko packet-tracer aur hit counters se prove karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security levels default guest rule hain; interface par ACL us direction mein us default ko replace kar deti hai.</li>
<li>ACLs upar se neeche padhi jaati hain, pehla match jeetta hai, aur har ACL implicit deny par khatam hoti hai.</li>
<li>Connection table return aur established traffic ko ACL dobara check kiye bina jaane deti hai.</li>
<li>8.3 se, ACLs real (untranslated) addresses refer karti hain.</li>
<li>Achhi ACLs minimal hoti hain, objects se named, commented aur counters aur packet-tracer se proven.</li>
</ul></div>
`}};export{e as default};