var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one paragraph</h3>
<p>Policy protects only traffic that reaches the cloud. Three methods get it there: a PAC file for browsers (Jaipur), a GRE or IPsec tunnel from the edge for a whole site (Chennai, Pune) and a client connector for a device anywhere (vikram). The connector is asked first; otherwise the site method decides. A down tunnel either blocks (fail closed) or goes direct (fail open, if the edge allows). Direct traffic has no policy, no inspection and no logs.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Which check for which symptom">
<rect x="10" y="15" width="200" height="80" rx="8" fill="#bae6fd"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="13">PAC (Jaipur)</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">URL equal, rule order,</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">DIRECT holes, edge</text>
<rect x="220" y="15" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Tunnel (Pune, Chennai)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">identity, destination,</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">circuit, MSS clamp</text>
<rect x="430" y="15" width="200" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="13">Client (vikram, laptops)</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">signed in, trusted suffix,</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">bypass list</text>
<rect x="10" y="115" width="620" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Always: read the path word, then the tunnel or client detail, then fix and verify</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">path: tunnel, proxy, client, direct or none</text>
</svg><p class="cap">One check list per method; the path word tells you which to open.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Describe explicit proxy, tunnel and agent and what each carries and covers.</li>
<li>Recite the decision order: client connector first, then site method, then failover.</li>
<li>Explain fail open versus fail closed and the edge firewall condition.</li>
<li>Read a PAC rule list: ordered, first match wins, no match is DIRECT.</li>
<li>Write the PAC URL correctly on both the portal and a PC.</li>
<li>State the IPsec up conditions and the GRE up conditions.</li>
<li>Explain MTU, MSS and why a missing clamp stalls only large downloads.</li>
<li>Explain trusted network detection and the effect on location.</li>
<li>Treat every bypass entry as a hole and justify the few you keep.</li>
<li>Complete labs zs-fwd-1, 2 and 3 and use the method on the eight tickets below.</li>
</ul>

<h3>Ticket map</h3>
<table class="cmp"><tr><th>Ticket</th><th>Symptom</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>320040</td><td>Pune web down</td><td>IPsec PSK mismatch</td><td>Same PSK on edge and credential</td></tr>
<tr><td>320050</td><td>Chennai GRE down</td><td>ISP changed the public IP</td><td>Registered IP and edge source equal the real IP</td></tr>
<tr><td>320060</td><td>Jaipur SaaS mail fails</td><td>PAC DIRECT rule, edge blocks direct</td><td>Remove the DIRECT rule</td></tr>
<tr><td>320080</td><td>Sales rule fails at Jaipur</td><td>Authentication off at location</td><td>Turn authentication on</td></tr>
<tr><td>320090</td><td>Downloads hang</td><td>MSS clamp off</td><td>Turn the clamp on</td></tr>
<tr><td>321050</td><td>Office rule stops matching</td><td>Trusted criteria typo, location remote</td><td>Correct trusted value, update policy</td></tr>
<tr><td>321080</td><td>Remote user cannot reach ERP</td><td>Bypass contains corporate domain</td><td>Remove the entry</td></tr>
<tr><td>321090</td><td>Two sites down</td><td>Wrong GRE destination and a different PAC URL</td><td>Destination to a node, same PAC URL</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PAC</dt><dd>JavaScript the browser runs to pick DIRECT or a proxy.</dd>
<dt>GRE</dt><dd>Plain tunnel, IP protocol 47, identified by registered source IP.</dd>
<dt>IPsec</dt><dd>Encrypted tunnel, IKE over UDP, identified by FQDN and PSK.</dd>
<dt>MSS clamp</dt><dd>Lowers the TCP segment size so packets fit in the tunnel.</dd>
<dt>Failover</dt><dd>What a down tunnel does: block (closed) or direct (open).</dd>
<dt>Trusted network</dt><dd>DNS suffix equals the profile's trusted value.</dd>
<dt>Bypass</dt><dd>A destination that leaves the device directly; a hole.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>No PAC match means DIRECT. PAC covers browser web traffic only.</li>
<li>GRE needs a registered static IP; IPsec needs a matching FQDN and PSK bound to the location.</li>
<li>Edge type and location method must agree; at least one circuit must be up.</li>
<li>Pages load but downloads hang means MSS or MTU.</li>
<li>Client tunnel makes the location remote.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Client checks</span>
zapp status
zapp update-policy
pac show
pac test mail.saas.example
ipconfig
curl news.example
download docs.share.example/q3-report.xlsx
nc -z 203.0.113.200 22</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Every forwarding setting decides which traffic meets policy at all. Before you click, ask: which path will each packet take after this change, and will it still reach the cloud?</p></div>

<div class="exam"><p><b>Exam trap.</b> Read for the hidden fact in the question: edge blocks direct, location is remote, or authentication is off. Each changes which answer is right.</p></div>

<div class="scn"><h4>Day one on call</h4><p>At 09:10 three tickets arrived: Chennai down, Jaipur mail down, Pune downloads stuck. The engineer opened the path word for each: none and a failed connection (tunnel), direct (PAC), and tunnel (MSS). Each ticket went to the right check list and all three closed before 10:00.</p><p><b>Lesson:</b> the path word routes the ticket.</p></div>

<div class="iv"><p class="q">"A branch lost internet after a change. How do you start?"</p><p>Strong answer: read the audit log and the location, find the method, run a client test and note the path, then the tunnel or PAC detail. Consider failover and edge firewall rules, fix the smallest thing, verify with a logged request, and write the cause in the ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forward first, then policy: unforwarded traffic is unprotected.</li>
<li>Know the three methods, their covers, and their checks.</li>
<li>Remember the model facts: PAC order, GRE and IPsec conditions, MSS, trusted suffix.</li>
<li>Bypasses and DIRECT rules are holes.</li>
<li>Use symptom, evidence, root cause, fix, verify on every ticket.</li>
</ul></div>
`,hi:`
<h3>Module ek paragraph mein</h3>
<p>Policy sirf us traffic ko protect karti hai jo cloud tak pahunchta hai. Teen methods usse wahan pahunchate hain: browsers ke liye PAC file (Jaipur), poori site ke liye edge se GRE ya IPsec tunnel (Chennai, Pune) aur kahin bhi device ke liye client connector (vikram). Connector se pehle poochha jaata hai; warna site method decide karta hai. Down tunnel ya to block karta hai (fail closed) ya direct jaata hai (fail open, agar edge allow kare). Direct traffic mein koi policy, inspection ya logs nahi hote.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Kaun sa symptom kaun sa check">
<rect x="10" y="15" width="200" height="80" rx="8" fill="#bae6fd"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="13">PAC (Jaipur)</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">URL barabar, rule order,</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">DIRECT holes, edge</text>
<rect x="220" y="15" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Tunnel (Pune, Chennai)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">identity, destination,</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">circuit, MSS clamp</text>
<rect x="430" y="15" width="200" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="13">Client (vikram, laptops)</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">signed in, trusted suffix,</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">bypass list</text>
<rect x="10" y="115" width="620" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Hamesha: path word padho, phir tunnel ya client detail, phir fix aur verify</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">path: tunnel, proxy, client, direct ya none</text>
</svg><p class="cap">Har method ki ek check list; path word batata hai kaun si kholni hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explicit proxy, tunnel aur agent describe karo aur har ek kya carry karta aur cover karta hai.</li>
<li>Decision order sunao: pehle client connector, phir site method, phir failover.</li>
<li>Fail open versus fail closed aur edge firewall ki condition samjhao.</li>
<li>PAC rule list padho: ordered, first match wins, no match DIRECT.</li>
<li>PAC URL portal aur PC dono par sahi likho.</li>
<li>IPsec up conditions aur GRE up conditions batao.</li>
<li>MTU, MSS samjhao aur batao ki clamp na ho to sirf bade downloads kyun atakte hain.</li>
<li>Trusted network detection aur location par asar samjhao.</li>
<li>Har bypass entry ko hole maano aur jo rakhte ho unka justification do.</li>
<li>Labs zs-fwd-1, 2 aur 3 poore karo aur neeche ke aath tickets par method lagao.</li>
</ul>

<h3>Ticket map</h3>
<table class="cmp"><tr><th>Ticket</th><th>Symptom</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>320040</td><td>Pune web down</td><td>IPsec PSK mismatch</td><td>Edge aur credential par same PSK</td></tr>
<tr><td>320050</td><td>Chennai GRE down</td><td>ISP ne public IP badla</td><td>Registered IP aur edge source real IP ke barabar</td></tr>
<tr><td>320060</td><td>Jaipur SaaS mail fail</td><td>PAC DIRECT rule, edge direct block karta hai</td><td>DIRECT rule hatao</td></tr>
<tr><td>320080</td><td>Jaipur par Sales rule fail</td><td>Location par authentication off</td><td>Authentication on karo</td></tr>
<tr><td>320090</td><td>Downloads atakte hain</td><td>MSS clamp off</td><td>Clamp on karo</td></tr>
<tr><td>321050</td><td>Office rule match karna band</td><td>Trusted criteria typo, location remote</td><td>Trusted value sahi karo, policy update</td></tr>
<tr><td>321080</td><td>Remote user ERP tak nahi pahunchta</td><td>Bypass mein corporate domain</td><td>Entry hatao</td></tr>
<tr><td>321090</td><td>Do sites down</td><td>Galat GRE destination aur alag PAC URL</td><td>Destination node par, same PAC URL</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PAC</dt><dd>JavaScript jo browser DIRECT ya proxy chunne ke liye chalata hai.</dd>
<dt>GRE</dt><dd>Plain tunnel, IP protocol 47, registered source IP se pehchana jaata hai.</dd>
<dt>IPsec</dt><dd>Encrypted tunnel, IKE UDP par, FQDN aur PSK se pehchana jaata hai.</dd>
<dt>MSS clamp</dt><dd>TCP segment size kam karta hai taaki packets tunnel mein fit hon.</dd>
<dt>Failover</dt><dd>Down tunnel kya karta hai: block (closed) ya direct (open).</dd>
<dt>Trusted network</dt><dd>DNS suffix profile ki trusted value ke barabar.</dd>
<dt>Bypass</dt><dd>Destination jo device se seedha nikalti hai; ek hole.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>PAC match na ho to DIRECT. PAC sirf browser web traffic cover karta hai.</li>
<li>GRE ko registered static IP chahiye; IPsec ko matching FQDN aur location se bound PSK.</li>
<li>Edge type aur location method agree karne chahiye; kam se kam ek circuit up.</li>
<li>Pages load hote hain lekin downloads atakte hain matlab MSS ya MTU.</li>
<li>Client tunnel location remote bana deta hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Client checks</span>
zapp status
zapp update-policy
pac show
pac test mail.saas.example
ipconfig
curl news.example
download docs.share.example/q3-report.xlsx
nc -z 203.0.113.200 22</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Har forwarding setting decide karti hai ki kaun sa traffic policy se milta bhi hai ya nahi. Click se pehle poochho: is change ke baad har packet kaun sa path lega, aur kya woh abhi bhi cloud tak pahunchega?</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal mein chhupa fact padho: edge direct block karta hai, location remote hai, ya authentication off hai. Har ek sahi jawab badal deta hai.</p></div>

<div class="scn"><h4>On-call ka pehla din</h4><p>09:10 par teen tickets aaye: Chennai down, Jaipur mail down, Pune downloads stuck. Engineer ne har ek ka path word kholkar dekha: none aur failed connection (tunnel), direct (PAC), aur tunnel (MSS). Har ticket sahi check list par gaya aur teeno 10:00 se pehle band ho gaye.</p><p><b>Seekh:</b> path word ticket ko route karta hai.</p></div>

<div class="iv"><p class="q">"Change ke baad branch ka internet chala gaya. Kahan se shuru karoge?"</p><p>Strong answer: audit log aur location padho, method dhoondo, client test chalao aur path note karo, phir tunnel ya PAC detail. Failover aur edge firewall rules par socho, sabse chhota cheez fix karo, logged request se verify karo, aur ticket mein cause likho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle forward, phir policy: unforwarded traffic unprotected hai.</li>
<li>Teen methods, unke covers aur unke checks jaano.</li>
<li>Model facts yaad rakho: PAC order, GRE aur IPsec conditions, MSS, trusted suffix.</li>
<li>Bypasses aur DIRECT rules holes hain.</li>
<li>Har ticket par symptom, evidence, root cause, fix, verify use karo.</li>
</ul></div>
`}};export{e as default};