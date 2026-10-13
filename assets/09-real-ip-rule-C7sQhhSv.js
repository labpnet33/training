var e={id:`real-ip-rule`,h:{en:`The real-IP rule: how NAT and ACLs work together`,hi:`Real-IP rule: NAT aur ACLs saath kaise kaam karte hain`},body:{en:`
<p>Picture a secure office building. A visitor arrives asking for "Reception, extension 2222". The front desk first looks up who that really is, "Priya, desk 22 on floor 3", and only then asks the security guard whether this visitor may go to Priya's desk. The guard's list is written in real names and real desks, never in reception extensions. On the ASA, the front desk is <b>UN-NAT</b>, the guard is the <b>ACL</b>, and since software 8.3 the guard's list always uses <b>real addresses and real ports</b>.</p>

<h3>The order of operations for a new connection</h3>
<p>When the first packet of a new connection arrives, the ASA works through a fixed sequence. The steps that matter for NAT are:</p>
<ol>
<li><b>Existing connection check.</b> If the packet belongs to a known conn, it is fast-pathed and NAT and ACL are not re-evaluated.</li>
<li><b>UN-NAT.</b> If the destination is a mapped address of a static rule, it is untranslated to the real address (and port), and the egress interface is chosen by NAT divert or route lookup.</li>
<li><b>ACCESS-LIST.</b> The interface ACL is checked against the now <b>real</b> destination.</li>
<li><b>NAT.</b> The source is translated if a rule matches, and the reverse direction is checked (the rpf-check subtype in packet-tracer).</li>
<li><b>Inspection, flow creation</b> and forwarding.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Order of operations">
<rect x="10" y="70" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="12">packet in</text><text x="65" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 203.0.113.3</text>
<rect x="140" y="70" width="110" height="56" rx="8" fill="#fed7aa"/><text x="195" y="94" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT</text><text x="195" y="112" text-anchor="middle" class="svg-muted" font-size="12">to 10.0.2.10</text>
<rect x="270" y="70" width="110" height="56" rx="8" fill="#fde68a"/><text x="325" y="94" text-anchor="middle" class="svg-ink" font-size="12">ACCESS-LIST</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">real IP</text>
<rect x="400" y="70" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="455" y="94" text-anchor="middle" class="svg-ink" font-size="12">NAT</text><text x="455" y="112" text-anchor="middle" class="svg-muted" font-size="12">source, rpf</text>
<rect x="530" y="70" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="580" y="94" text-anchor="middle" class="svg-ink" font-size="12">flow</text><text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="12">to dmz</text>
<line x1="120" y1="98" x2="140" y2="98" stroke="#64748b" stroke-width="2"/><line x1="250" y1="98" x2="270" y2="98" stroke="#64748b" stroke-width="2"/><line x1="380" y1="98" x2="400" y2="98" stroke="#64748b" stroke-width="2"/><line x1="510" y1="98" x2="530" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">by the time the ACL runs, the public address is gone</text>
</svg><p class="cap">UN-NAT runs before the ACL, so the ACL can only match the real address.</p></div>

<h3>What the ACL must say, flow by flow</h3>
<table class="cmp"><tr><th>Flow</th><th>NAT</th><th>ACL entry</th></tr>
<tr><td>Internet to WEB on 203.0.113.3:80</td><td>static NAT</td><td><code>permit tcp any object WEB eq www</code> (10.0.2.10)</td></tr>
<tr><td>Partner to 203.0.113.2:2222</td><td>static PAT ssh to 2222</td><td><code>permit tcp host 198.51.100.10 object JUMP eq ssh</code> (port 22)</td></tr>
<tr><td>PC1 outbound, inside ACL</td><td>interface PAT</td><td>source 10.0.1.10 (real), never 203.0.113.2</td></tr>
<tr><td>Merger host to 192.168.101.10</td><td>twice NAT</td><td>destination the real inside host 10.0.1.10</td></tr></table>
<p>The pattern never changes: on any interface, in any direction, write the ACL for what the hosts <b>really</b> are.</p>

<h3>Objects make the rule effortless</h3>
<p>Because NAT and ACL both reference <code>object WEB</code>, you never type an address twice. If WEB is renumbered to 10.0.2.11, you change <code>host</code> in the object once, and both the translation and the permit follow. <code>show access-list</code> expands the object so you can see the real address it matched:</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 2 elements; name hash: 0x7a2d1c3b
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=31) 0x3f1e22a0
<span class="hl">  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=31) 0x3f1e22a0</span>
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps (hitcnt=12) 0x51c09e7d
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=12) 0x51c09e7d</pre>

<h3>Where the old habit comes from</h3>
<p>Before 8.3 the ACL was checked <b>before</b> untranslation, so PIX and early ASA configurations permitted the public address: <code>permit tcp any host 203.0.113.3 eq www</code>. When such a line is copied into a modern ASA, it is accepted without error, because 203.0.113.3 is a perfectly valid address. It simply never matches, since no packet still carries 203.0.113.3 when the ACL runs. The Implicit Rule at the end of the ACL drops the traffic. This is exactly the ticket lab you will solve in chapter 11.</p>

<h3>What captures show</h3>
<p>A packet capture sees addresses as they are <b>on that wire</b>. A capture on outside shows 203.0.113.3; a capture on dmz shows 10.0.2.10. Comparing the two is the classic way to prove NAT, which the sec-asa-tshoot module practises in depth.</p>

<div class="eg"><p><b>Worked example.</b> A migrated ACL contains <code>permit tcp any host 203.0.113.3 eq www (hitcnt=0)</code> while <code>show nat</code> shows <code>untranslate_hits = 57</code> for WEB. Fifty-seven connections were untranslated and then dropped, because the permit never matched. Replace it with <code>permit tcp any object WEB eq www</code>, remove the old line, test again: hitcnt climbs, the site loads.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Fixing" a failing publish by permitting <code>any any</code>. The site works, but so does every other port on every translated server. Find the real-IP mistake instead and keep the ACL tight.</p></div>

<div class="exam"><p><b>Exam trap.</b> "An inbound ACL for a statically NATed server should reference the mapped address." False on ASA 8.3 and later, and false on Threat Defense. The same question about PIX 7 or ASA 8.2 would be true, which is why the exam likes it.</p></div>

<div class="scn"><h4>Forty servers and one missed line</h4><p>A bank migrated forty published servers from an old firewall. The team converted the NAT carefully but pasted the ACL unchanged. Thirty-nine servers had permits with public IPs and all failed at the 6 a.m. cutover. <code>packet-tracer</code> on one flow showed UN-NAT succeeding and the ACCESS-LIST phase dropping on the Implicit Rule. A script rewrote each public address to the matching object, and every service came back within minutes.</p><p><b>Lesson:</b> migrations must convert ACL addresses to real addresses, not just NAT syntax.</p></div>

<div class="iv"><p class="q">"On an ASA, does the ACL use real or mapped addresses, and why?"</p><p>Real, since 8.3. The ASA untranslates the destination before it evaluates the interface ACL, so by then only the real address and real port exist. Give the example of static PAT 2222 to 22 where the ACL permits eq ssh, and mention that objects shared by NAT and ACL keep both correct.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order for a new flow: UN-NAT, ACCESS-LIST, NAT, flow creation.</li>
<li>ACLs match real addresses and real ports, on every interface and in every direction.</li>
<li>Pre-8.3 ACLs with public addresses are accepted but never match; the Implicit Rule drops the traffic.</li>
<li>Reuse the same object in NAT and ACL; <code>show access-list</code> expands it to the real IP.</li>
<li>Captures show the addresses on that wire: mapped on outside, real on dmz.</li>
</ul></div>
`,hi:`
<p>Ek secure office building socho. Ek visitor aata hai aur "Reception, extension 2222" maangta hai. Front desk pehle dekhta hai ki woh asli mein kaun hai, "Priya, floor 3 par desk 22", aur tabhi security guard se poochta hai ki kya yeh visitor Priya ki desk tak ja sakta hai. Guard ki list asli naamon aur asli desks mein likhi hai, reception extensions mein kabhi nahi. ASA par front desk <b>UN-NAT</b> hai, guard <b>ACL</b> hai, aur software 8.3 se guard ki list hamesha <b>real addresses aur real ports</b> use karti hai.</p>

<h3>Naye connection ke liye order of operations</h3>
<p>Jab naye connection ka pehla packet aata hai, ASA ek fixed sequence se guzarta hai. NAT ke liye jo steps matter karte hain:</p>
<ol>
<li><b>Existing connection check.</b> Agar packet kisi known conn ka hai, to woh fast-path hota hai aur NAT aur ACL dobara evaluate nahi hote.</li>
<li><b>UN-NAT.</b> Agar destination kisi static rule ka mapped address hai, to woh real address (aur port) par untranslate hota hai, aur egress interface NAT divert ya route lookup se chuna jaata hai.</li>
<li><b>ACCESS-LIST.</b> Interface ACL ab <b>real</b> ho chuke destination ke against check hoti hai.</li>
<li><b>NAT.</b> Agar koi rule match kare to source translate hota hai, aur reverse direction check hoti hai (packet-tracer mein rpf-check subtype).</li>
<li><b>Inspection, flow creation</b> aur forwarding.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Order of operations">
<rect x="10" y="70" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="12">packet andar</text><text x="65" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 203.0.113.3</text>
<rect x="140" y="70" width="110" height="56" rx="8" fill="#fed7aa"/><text x="195" y="94" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT</text><text x="195" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10 par</text>
<rect x="270" y="70" width="110" height="56" rx="8" fill="#fde68a"/><text x="325" y="94" text-anchor="middle" class="svg-ink" font-size="12">ACCESS-LIST</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">real IP</text>
<rect x="400" y="70" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="455" y="94" text-anchor="middle" class="svg-ink" font-size="12">NAT</text><text x="455" y="112" text-anchor="middle" class="svg-muted" font-size="12">source, rpf</text>
<rect x="530" y="70" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="580" y="94" text-anchor="middle" class="svg-ink" font-size="12">flow</text><text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="12">dmz ki taraf</text>
<line x1="120" y1="98" x2="140" y2="98" stroke="#64748b" stroke-width="2"/><line x1="250" y1="98" x2="270" y2="98" stroke="#64748b" stroke-width="2"/><line x1="380" y1="98" x2="400" y2="98" stroke="#64748b" stroke-width="2"/><line x1="510" y1="98" x2="530" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">ACL chalne tak public address ja chuka hota hai</text>
</svg><p class="cap">UN-NAT ACL se pehle chalta hai, isliye ACL sirf real address match kar sakti hai.</p></div>

<h3>ACL ko kya kehna chahiye, flow dar flow</h3>
<table class="cmp"><tr><th>Flow</th><th>NAT</th><th>ACL entry</th></tr>
<tr><td>Internet se WEB tak 203.0.113.3:80 par</td><td>static NAT</td><td><code>permit tcp any object WEB eq www</code> (10.0.2.10)</td></tr>
<tr><td>Partner se 203.0.113.2:2222</td><td>static PAT ssh se 2222</td><td><code>permit tcp host 198.51.100.10 object JUMP eq ssh</code> (port 22)</td></tr>
<tr><td>PC1 outbound, inside ACL</td><td>interface PAT</td><td>source 10.0.1.10 (real), kabhi 203.0.113.2 nahi</td></tr>
<tr><td>Merger host se 192.168.101.10</td><td>twice NAT</td><td>destination real inside host 10.0.1.10</td></tr></table>
<p>Pattern kabhi nahi badalta: kisi bhi interface par, kisi bhi direction mein, ACL us cheez ke liye likho jo hosts <b>asli mein</b> hain.</p>

<h3>Objects rule ko aasaan bana dete hain</h3>
<p>Kyunki NAT aur ACL dono <code>object WEB</code> reference karte hain, aap kabhi address do baar type nahi karte. Agar WEB ko 10.0.2.11 par renumber kiya jaaye, aap object mein <code>host</code> ek baar badalte ho, aur translation aur permit dono follow karte hain. <code>show access-list</code> object ko expand karta hai taaki aap dekh sako ki usne kaunsa real address match kiya:</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 2 elements; name hash: 0x7a2d1c3b
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=31) 0x3f1e22a0
<span class="hl">  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=31) 0x3f1e22a0</span>
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps (hitcnt=12) 0x51c09e7d
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=12) 0x51c09e7d</pre>

<h3>Purani aadat kahan se aati hai</h3>
<p>8.3 se pehle ACL untranslation se <b>pehle</b> check hoti thi, isliye PIX aur shuruaati ASA configurations public address permit karti thi: <code>permit tcp any host 203.0.113.3 eq www</code>. Jab aisi line modern ASA mein copy hoti hai, woh bina error ke accept hoti hai, kyunki 203.0.113.3 ek bilkul valid address hai. Bas woh kabhi match nahi karti, kyunki ACL chalte waqt kisi packet par 203.0.113.3 bacha hi nahi hota. ACL ke end ki Implicit Rule traffic drop kar deti hai. Bilkul yahi ticket lab aap chapter 11 mein solve karoge.</p>

<h3>Captures kya dikhate hain</h3>
<p>Packet capture addresses waise dekhta hai jaise woh <b>us wire par</b> hain. Outside par capture 203.0.113.3 dikhata hai; dmz par capture 10.0.2.10 dikhata hai. Dono ko compare karna NAT saabit karne ka classic tarika hai, jise sec-asa-tshoot module depth mein practise karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek migrate hui ACL mein <code>permit tcp any host 203.0.113.3 eq www (hitcnt=0)</code> hai jabki <code>show nat</code> WEB ke liye <code>untranslate_hits = 57</code> dikhata hai. Sattavan connections untranslate hue aur phir drop hue, kyunki permit kabhi match nahi hua. Use <code>permit tcp any object WEB eq www</code> se badlo, purani line hatao, phir test karo: hitcnt badhta hai, site load hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Fail hote publish ko <code>any any</code> permit karke "theek" karna. Site chal jaati hai, lekin har translated server ka har doosra port bhi khul jaata hai. Real-IP galti dhoondho aur ACL tight rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Statically NAT kiye server ki inbound ACL ko mapped address reference karna chahiye." ASA 8.3 aur baad mein false, aur Threat Defense par bhi false. PIX 7 ya ASA 8.2 ke baare mein yahi sawaal true hota, isliye exam ise pasand karta hai.</p></div>

<div class="scn"><h4>Chaalis servers aur ek chhooti line</h4><p>Ek bank ne ek purane firewall se chaalis published servers migrate kiye. Team ne NAT dhyan se convert kiya lekin ACL bina badle paste kar di. Untaalis servers ke permits mein public IPs the aur subah 6 baje ke cutover par sab fail hue. Ek flow par <code>packet-tracer</code> ne UN-NAT succeed hote aur ACCESS-LIST phase ko Implicit Rule par drop karte dikhaya. Ek script ne har public address ko matching object se badla, aur har service kuch minute mein wapas aa gayi.</p><p><b>Seekh:</b> migrations mein sirf NAT syntax nahi, ACL addresses ko bhi real addresses mein convert karna hota hai.</p></div>

<div class="iv"><p class="q">"ASA par ACL real ya mapped addresses use karti hai, aur kyun?"</p><p>Real, 8.3 se. ASA interface ACL evaluate karne se pehle destination untranslate karta hai, isliye tab tak sirf real address aur real port exist karte hain. Static PAT 2222 se 22 ka example do jahan ACL eq ssh permit karti hai, aur batao ki NAT aur ACL mein shared objects dono ko sahi rakhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naye flow ka order: UN-NAT, ACCESS-LIST, NAT, flow creation.</li>
<li>ACLs har interface par aur har direction mein real addresses aur real ports match karti hain.</li>
<li>Public addresses wali pre-8.3 ACLs accept hoti hain lekin kabhi match nahi karti; Implicit Rule traffic drop karti hai.</li>
<li>NAT aur ACL mein same object reuse karo; <code>show access-list</code> use real IP mein expand karta hai.</li>
<li>Captures us wire ke addresses dikhate hain: outside par mapped, dmz par real.</li>
</ul></div>
`}};export{e as default};