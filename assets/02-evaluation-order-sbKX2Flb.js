var e={id:`evaluation`,h:{en:`How the ASA evaluates traffic: levels, ACLs, state and implicit deny`,hi:`ASA traffic ko kaise evaluate karta hai: levels, ACLs, state aur implicit deny`},body:{en:`
<p>Before writing a single ACL line you must know <i>when</i> the ASA looks at an ACL, and when it does not. Most "the rule is correct but it does not work" tickets come from a wrong mental model of this order.</p>

<h3>The analogy: a toll plaza with a FASTag lane</h3>
<p>A car that already has a valid tag for this trip drives through the fast lane without stopping. A new car goes to the manual booth, where the operator checks where it is going, whether it is allowed, and then issues a tag. On the ASA, the fast lane is the <b>connection table</b> (the "fast path"), and the manual booth is the <b>slow path</b> where NAT, routing and ACLs are checked for the <b>first packet</b> of a new connection.</p>

<h3>Step by step: what happens to a packet</h3>
<ol>
<li><b>Existing connection?</b> The ASA looks up the connection table. If the packet belongs to a known connection (either direction), it is forwarded after basic TCP state checks. <b>No ACL is checked.</b></li>
<li><b>Un-NAT.</b> For a new flow, if the destination matches a static NAT (for example 203.0.113.3), the ASA translates it back to the real address (10.0.2.10). This also selects the egress interface.</li>
<li><b>Route lookup.</b> Otherwise the routing table picks the egress interface.</li>
<li><b>Access check.</b> The inbound ACL on the ingress interface is checked; if there is none, the global ACL; if nothing matches, the implicit deny. If no ACL applies at all, the security levels decide. An outbound ACL on the egress interface is checked too, if one exists.</li>
<li><b>NAT</b> of the source (for example PAT to the outside interface), <b>inspection</b> (ICMP, FTP, DNS and so on), and finally <b>flow creation</b>: the connection is added to the table.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ASA packet processing order">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="65" y="60" text-anchor="middle" class="svg-muted" font-size="12">ingress ifc</text>
<rect x="140" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="42" text-anchor="middle" class="svg-ink" font-size="13">Conn table?</text><text x="195" y="60" text-anchor="middle" class="svg-muted" font-size="12">yes: fast path</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">Un-NAT</text><text x="325" y="60" text-anchor="middle" class="svg-muted" font-size="12">mapped to real</text>
<rect x="400" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="455" y="60" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text>
<rect x="530" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">ACL check</text><text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">real IPs</text>
<rect x="400" y="130" width="110" height="50" rx="8" fill="#fed7aa"/><text x="455" y="152" text-anchor="middle" class="svg-ink" font-size="13">Source NAT</text><text x="455" y="170" text-anchor="middle" class="svg-muted" font-size="12">PAT, static</text>
<rect x="270" y="130" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">Inspection</text><text x="325" y="170" text-anchor="middle" class="svg-muted" font-size="12">icmp, ftp, dns</text>
<rect x="140" y="130" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="152" text-anchor="middle" class="svg-ink" font-size="13">Flow created</text><text x="195" y="170" text-anchor="middle" class="svg-muted" font-size="12">conn added</text>
<line x1="120" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="510" y1="45" x2="530" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="70" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><line x1="400" y1="155" x2="380" y2="155" stroke="#64748b" stroke-width="2"/><line x1="270" y1="155" x2="250" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="580" y="100" text-anchor="middle" class="svg-accent" font-size="12">deny: drop</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Only the first packet of a new connection takes this slow path</text>
</svg><p class="cap">The slow path for a new connection. Un-NAT happens before the ACL check, which is why ACLs use real addresses.</p></div>

<h3>Security levels: the default when no ACL applies</h3>
<table class="cmp"><tr><th>Direction</th><th>Without an ACL</th><th>Example in the lab</th></tr>
<tr><td>Higher to lower level</td><td>Permitted (implicit permit)</td><td>inside (100) to outside (0)</td></tr>
<tr><td>Lower to higher level</td><td>Denied</td><td>outside (0) to dmz (50)</td></tr>
<tr><td>Same level, different interfaces</td><td>Denied unless <code>same-security-traffic permit inter-interface</code></td><td>two DMZs both at 50</td></tr>
<tr><td>In and out of the same interface</td><td>Denied unless <code>same-security-traffic permit intra-interface</code></td><td>hairpin, VPN U-turn</td></tr>
</table>
<p>The important rule: <b>once an ACL is applied inbound on an interface, the security-level default no longer applies to traffic entering that interface.</b> If you apply an inbound ACL to <code>inside</code> that only permits DNS, users lose web access even though inside is level 100. The ACL now decides, and the implicit deny drops everything else.</p>

<h3>The implicit deny</h3>
<p>Every ACL ends with an invisible <code>deny ip any any</code>. It does not appear in <code>show running-config</code>, and it has no hit counter. When traffic is dropped by it, the ASA logs syslog message <b>106023</b> ("Deny tcp src … by access-group") at level 4. If you need to count those drops, add an explicit <code>deny ip any any log</code> as the last line.</p>

<h3>Established connections and return traffic</h3>
<p>Because the conn table is checked first, return traffic never needs its own ACL line. A user on inside opens a web page; the reply from the internet matches the connection and passes, even though OUTSIDE_IN would never permit it. The same fact has a side effect: <b>removing a permit line does not cut existing connections.</b> They keep flowing until they close or time out, or until you run <code>clear conn</code> for that address.</p>

<div class="eg"><p><b>Worked example.</b> The lab starts with no ACLs. PC1 (10.0.1.10) browses to INET 8.8.8.8: inside (100) to outside (0) is permitted, PAT translates the source, the reply matches the connection. INET tries to reach WEB at 203.0.113.3: un-NAT finds 10.0.2.10 on dmz, but outside (0) to dmz (50) is lower to higher, so it is dropped. After you apply OUTSIDE_IN with a permit for WEB on port 80, that new connection is allowed; PC1's browsing is untouched because inside has no ACL.</p></div>

<pre class="code"><span class="c">! check which ACLs are bound, and to what</span>
show running-config access-group
<span class="c">! see live connections that bypass the ACL</span>
show conn address 10.0.2.10
<span class="c">! remove sessions after tightening a rule</span>
clear conn address 10.0.2.10</pre>

<pre class="out">NK-ASA# show running-config access-group
<span class="hl">access-group OUTSIDE_IN in interface outside</span>
NK-ASA# show conn address 10.0.2.10
1 in use, 3 most used
TCP outside  8.8.8.8:51522 dmz  10.0.2.10:80, idle 0:00:04, bytes 1840, flags UIO</pre>

<div class="warn"><p><b>Common mistake.</b> Applying an inbound ACL to <code>inside</code> "to block one site" and forgetting to add a final permit. Everyone loses internet access, because the implicit deny now catches all their traffic.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which traffic is checked against the ACL?" Only the first packet of a new connection. Return traffic of a permitted connection is allowed by state, not by the ACL. Also remember that ICMP replies are only treated statefully when <code>inspect icmp</code> is enabled.</p></div>

<div class="scn"><h4>The rule was removed, but the session stayed</h4><p>Security asked a bank's firewall team to block a vendor's SSH access to a DMZ jump server at 18:00. The engineer removed the permit line at 18:00 sharp, but the vendor's SSH session stayed open until 21:30. The auditor flagged it. <code>show conn address 10.0.2.40</code> showed the session still established. The ACL was never consulted again after the first packet.</p><p><b>Lesson:</b> when revoking access, remove the rule and then <code>clear conn</code> for that host, and verify the conn table is empty.</p></div>

<div class="iv"><p class="q">"If you remove a permit rule on the ASA, does the user lose access immediately?"</p><p>Strong answer: no, not for existing sessions. The ASA checks the ACL only for the first packet of a new connection; later packets match the conn table. New connections are denied immediately, but existing ones continue until they close or time out, so you run <code>clear conn address</code> (or <code>clear conn</code> with filters) to enforce the change. Mention verifying with <code>show conn</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order for a new flow: conn lookup, un-NAT, route, ACL, source NAT, inspection, flow creation.</li>
<li>Without an ACL, higher to lower is allowed and lower to higher is denied; same level needs same-security-traffic.</li>
<li>An inbound ACL replaces the security-level default for that interface.</li>
<li>Every ACL ends with an implicit deny (syslog 106023), which has no counter.</li>
<li>Established and return traffic bypass the ACL; use clear conn to enforce a removal.</li>
</ul></div>
`,hi:`
<p>ACL ki ek bhi line likhne se pehle aapko pata hona chahiye ki ASA ACL ko <i>kab</i> dekhta hai, aur kab nahi. Zyada tar "rule sahi hai lekin kaam nahi karti" tickets is order ke galat mental model se aate hain.</p>

<h3>Analogy: FASTag lane wala toll plaza</h3>
<p>Jis gaadi ke paas is trip ka valid tag pehle se hai, woh bina ruke fast lane se nikal jaati hai. Nayi gaadi manual booth par jaati hai, jahan operator check karta hai ki woh kahan jaa rahi hai, kya use ijaazat hai, aur phir tag deta hai. ASA par fast lane <b>connection table</b> hai ("fast path"), aur manual booth <b>slow path</b> hai jahan nayi connection ke <b>pehle packet</b> ke liye NAT, routing aur ACLs check hote hain.</p>

<h3>Step by step: packet ke saath kya hota hai</h3>
<ol>
<li><b>Existing connection?</b> ASA connection table dekhta hai. Agar packet kisi known connection ka hai (kisi bhi direction mein), to basic TCP state checks ke baad forward ho jaata hai. <b>Koi ACL check nahi hoti.</b></li>
<li><b>Un-NAT.</b> Nayi flow ke liye, agar destination kisi static NAT se match karta hai (jaise 203.0.113.3), to ASA use wapas real address (10.0.2.10) mein translate karta hai. Isi se egress interface bhi select hota hai.</li>
<li><b>Route lookup.</b> Warna routing table egress interface chunti hai.</li>
<li><b>Access check.</b> Ingress interface ki inbound ACL check hoti hai; agar nahi hai, to global ACL; agar kuch match nahi hota, to implicit deny. Agar koi ACL apply hi nahi hai, to security levels decide karte hain. Egress interface par outbound ACL ho to woh bhi check hoti hai.</li>
<li>Source ka <b>NAT</b> (jaise outside interface par PAT), <b>inspection</b> (ICMP, FTP, DNS waghera), aur aakhir mein <b>flow creation</b>: connection table mein jud jaati hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ASA packet processing ka order">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="13">Packet andar</text><text x="65" y="60" text-anchor="middle" class="svg-muted" font-size="12">ingress ifc</text>
<rect x="140" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="42" text-anchor="middle" class="svg-ink" font-size="13">Conn table?</text><text x="195" y="60" text-anchor="middle" class="svg-muted" font-size="12">haan: fast path</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">Un-NAT</text><text x="325" y="60" text-anchor="middle" class="svg-muted" font-size="12">mapped se real</text>
<rect x="400" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="455" y="60" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text>
<rect x="530" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">ACL check</text><text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">real IPs</text>
<rect x="400" y="130" width="110" height="50" rx="8" fill="#fed7aa"/><text x="455" y="152" text-anchor="middle" class="svg-ink" font-size="13">Source NAT</text><text x="455" y="170" text-anchor="middle" class="svg-muted" font-size="12">PAT, static</text>
<rect x="270" y="130" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">Inspection</text><text x="325" y="170" text-anchor="middle" class="svg-muted" font-size="12">icmp, ftp, dns</text>
<rect x="140" y="130" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="152" text-anchor="middle" class="svg-ink" font-size="13">Flow bani</text><text x="195" y="170" text-anchor="middle" class="svg-muted" font-size="12">conn judi</text>
<line x1="120" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="510" y1="45" x2="530" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="70" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><line x1="400" y1="155" x2="380" y2="155" stroke="#64748b" stroke-width="2"/><line x1="270" y1="155" x2="250" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="580" y="100" text-anchor="middle" class="svg-accent" font-size="12">deny: drop</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Sirf nayi connection ka pehla packet yeh slow path leta hai</text>
</svg><p class="cap">Nayi connection ka slow path. Un-NAT ACL check se pehle hota hai, isiliye ACLs real addresses use karti hain.</p></div>

<h3>Security levels: jab koi ACL apply nahi hoti tab ka default</h3>
<table class="cmp"><tr><th>Direction</th><th>ACL ke bina</th><th>Lab mein example</th></tr>
<tr><td>Higher se lower level</td><td>Permitted (implicit permit)</td><td>inside (100) se outside (0)</td></tr>
<tr><td>Lower se higher level</td><td>Denied</td><td>outside (0) se dmz (50)</td></tr>
<tr><td>Same level, alag interfaces</td><td>Denied jab tak <code>same-security-traffic permit inter-interface</code> na ho</td><td>do DMZ dono 50 par</td></tr>
<tr><td>Same interface se andar aur bahar</td><td>Denied jab tak <code>same-security-traffic permit intra-interface</code> na ho</td><td>hairpin, VPN U-turn</td></tr>
</table>
<p>Important rule: <b>jaise hi kisi interface par inbound ACL apply hoti hai, us interface mein ghusne wale traffic par security-level default apply nahi hota.</b> Agar aap <code>inside</code> par aisi inbound ACL lagate ho jo sirf DNS permit karti hai, to users web access kho dete hain, bhale hi inside level 100 hai. Ab ACL decide karti hai, aur implicit deny baaki sab drop kar deta hai.</p>

<h3>Implicit deny</h3>
<p>Har ACL ek invisible <code>deny ip any any</code> par khatam hoti hai. Yeh <code>show running-config</code> mein nahi dikhta, aur iska koi hit counter nahi hota. Jab traffic isse drop hota hai, to ASA level 4 par syslog message <b>106023</b> ("Deny tcp src … by access-group") log karta hai. Agar un drops ko ginna hai, to aakhri line ke roop mein explicit <code>deny ip any any log</code> jodo.</p>

<h3>Established connections aur return traffic</h3>
<p>Kyunki conn table pehle check hoti hai, return traffic ko kabhi apni ACL line nahi chahiye. Inside ka user ek web page kholta hai; internet se reply connection se match karta hai aur nikal jaata hai, bhale hi OUTSIDE_IN use kabhi permit nahi karti. Isi fact ka ek side effect hai: <b>permit line hataane se existing connections nahi kat-ti.</b> Woh tab tak chalti rehti hain jab tak close ya time out na ho, ya jab tak aap us address ke liye <code>clear conn</code> na chalao.</p>

<div class="eg"><p><b>Worked example.</b> Lab bina ACLs ke shuru hoti hai. PC1 (10.0.1.10) INET 8.8.8.8 par browse karta hai: inside (100) se outside (0) permitted hai, PAT source translate karta hai, reply connection se match karta hai. INET 203.0.113.3 par WEB tak pahunchne ki koshish karta hai: un-NAT dmz par 10.0.2.10 dhoondhta hai, lekin outside (0) se dmz (50) lower se higher hai, isliye drop hota hai. Jab aap port 80 par WEB ke permit ke saath OUTSIDE_IN apply karte ho, to woh nayi connection allow ho jaati hai; PC1 ki browsing par koi asar nahi kyunki inside par koi ACL nahi hai.</p></div>

<pre class="code"><span class="c">! check karo kaunsi ACLs kahan bound hain</span>
show running-config access-group
<span class="c">! live connections dekho jo ACL ko bypass karti hain</span>
show conn address 10.0.2.10
<span class="c">! rule tight karne ke baad sessions hatao</span>
clear conn address 10.0.2.10</pre>

<pre class="out">NK-ASA# show running-config access-group
<span class="hl">access-group OUTSIDE_IN in interface outside</span>
NK-ASA# show conn address 10.0.2.10
1 in use, 3 most used
TCP outside  8.8.8.8:51522 dmz  10.0.2.10:80, idle 0:00:04, bytes 1840, flags UIO</pre>

<div class="warn"><p><b>Common galti.</b> "Ek site block karne ke liye" <code>inside</code> par inbound ACL lagana aur aakhir mein permit jodna bhool jaana. Sabka internet access chala jaata hai, kyunki ab implicit deny unka saara traffic pakad leta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa traffic ACL ke against check hota hai?" Sirf nayi connection ka pehla packet. Permitted connection ka return traffic state se allow hota hai, ACL se nahi. Yeh bhi yaad rakho ki ICMP replies sirf tab statefully treat hote hain jab <code>inspect icmp</code> enabled ho.</p></div>

<div class="scn"><h4>Rule hat gayi, lekin session reh gaya</h4><p>Security ne ek bank ki firewall team se kaha ki 18:00 baje ek vendor ka DMZ jump server par SSH access block karo. Engineer ne theek 18:00 par permit line hata di, lekin vendor ka SSH session 21:30 tak khula raha. Auditor ne ise flag kiya. <code>show conn address 10.0.2.40</code> ne session abhi bhi established dikhaya. Pehle packet ke baad ACL se dobara kabhi poocha hi nahi gaya.</p><p><b>Seekh:</b> access revoke karte waqt rule hatao aur phir us host ke liye <code>clear conn</code> chalao, aur verify karo ki conn table khaali hai.</p></div>

<div class="iv"><p class="q">"Agar aap ASA par permit rule hata do, to kya user ka access turant chala jaata hai?"</p><p>Strong answer: nahi, existing sessions ke liye nahi. ASA ACL sirf nayi connection ke pehle packet ke liye check karta hai; baad ke packets conn table se match hote hain. Nayi connections turant deny hoti hain, lekin purani close ya time out hone tak chalti rehti hain, isliye change enforce karne ke liye aap <code>clear conn address</code> (ya filters ke saath <code>clear conn</code>) chalate ho. <code>show conn</code> se verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nayi flow ka order: conn lookup, un-NAT, route, ACL, source NAT, inspection, flow creation.</li>
<li>ACL ke bina, higher se lower allowed aur lower se higher denied hai; same level ke liye same-security-traffic chahiye.</li>
<li>Inbound ACL us interface ke liye security-level default ko replace kar deti hai.</li>
<li>Har ACL implicit deny (syslog 106023) par khatam hoti hai, jiska koi counter nahi hota.</li>
<li>Established aur return traffic ACL ko bypass karta hai; removal enforce karne ke liye clear conn use karo.</li>
</ul></div>
`}};export{e as default};