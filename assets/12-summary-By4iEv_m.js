var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how the ASA decides, how to express that decision as clean ACLs, and how to prove it. Use this chapter as a last revision before the labs, an interview or the SNCF / SCOR exam.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="15" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Evaluation</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">conn, un-NAT, route, ACL</text>
<rect x="220" y="15" width="200" height="60" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Syntax</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">masks, in/out/global</text>
<rect x="430" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">groups, nesting</text>
<rect x="10" y="95" width="200" height="60" rx="8" fill="#fed7aa"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">Real-IP rule</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">untranslate, then ACL</text>
<rect x="220" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">remarks, time, log, hits</text>
<rect x="430" y="95" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">Management</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">ssh, icmp, control-plane</text>
<rect x="120" y="170" width="400" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="14">Prove it: packet-tracer + hitcnt + syslog</text>
</svg><p class="cap">Six ideas, one habit: every rule is proven, not assumed.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the order for a new flow: conn lookup, un-NAT, route lookup, ACL (interface, global, implicit deny), source NAT, inspection, flow creation.</li>
<li>State the security-level defaults and what changes when an ACL is applied.</li>
<li>Write extended ACEs with subnet masks, hosts, objects, groups, port operators and ICMP types.</li>
<li>Bind ACLs inbound, outbound and globally, and replace a binding safely.</li>
<li>Build network and service objects, and network, service, protocol and icmp-type object-groups, including nesting.</li>
<li>Explain and apply the real-IP rule for static NAT, port forwarding and outbound ACLs.</li>
<li>Insert, remove and comment ACEs; build time-based and logged ACEs.</li>
<li>Read hit counts, element counts and hashes; find unused and shadowed rules.</li>
<li>Design a least-privilege DMZ policy from a flow matrix: inbound on outside, a DMZ_IN on dmz that limits what servers may start, and a DMZ-to-inside deny above broad permits.</li>
<li>Restrict management access with ssh, h&#116;tp and icmp commands and a control-plane ACL.</li>
<li>Prove any decision with packet-tracer and solve both labs.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACE</dt><dd>Access control entry: one line of an ACL.</dd>
<dt>access-group</dt><dd>Binds an ACL to an interface (in/out), globally, or to the control plane.</dd>
<dt>Implicit deny</dt><dd>The invisible final deny in every ACL; logs 106023.</dd>
<dt>Real address</dt><dd>The untranslated address of a host where it lives; what ACLs use since 8.3.</dd>
<dt>Mapped address</dt><dd>The NAT address the other side sees.</dd>
<dt>Object / object-group</dt><dd>A named single item / a named bundle of items.</dd>
<dt>Element</dt><dd>One expanded ACE after groups are unfolded.</dd>
<dt>hitcnt</dt><dd>New connections that matched an ACE since boot or clear.</dd>
<dt>Shadowed rule</dt><dd>An ACE that can never match because a broader ACE above catches its traffic.</dd>
<dt>Control-plane ACL</dt><dd>An ACL that filters traffic destined to the ASA itself on an interface.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Mask type in ASA ACLs</td><td>Subnet mask, not wildcard</td></tr>
<tr><td>Address used in ACL for a static-NAT server (8.3+)</td><td>Real (untranslated) IP</td></tr>
<tr><td>Port in ACL for a port-forward</td><td>Real (server) port</td></tr>
<tr><td>Order of interface and global ACL</td><td>Interface, then global, then implicit deny</td></tr>
<tr><td>Global ACL direction</td><td>Inbound only</td></tr>
<tr><td>ACLs per interface per direction</td><td>One</td></tr>
<tr><td>Return traffic of a permitted flow</td><td>Allowed by the conn table, not the ACL</td></tr>
<tr><td>Deny without log / ACE with log</td><td>106023 / 106100</td></tr>
<tr><td>Does an interface ACL filter SSH to the ASA?</td><td>No: use ssh commands or control-plane ACL</td></tr>
<tr><td>Time-range components</td><td>One absolute, many periodic</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! build</span>
object network WEB
 host 10.0.2.10
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
access-list OUTSIDE_IN remark CHG-2210 public services
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh log
access-group OUTSIDE_IN in interface outside
<span class="c">! verify</span>
show running-config access-group
show access-list OUTSIDE_IN
show nat
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
show logging | include 1060|1061
show conn address 10.0.2.10
<span class="c">! maintain</span>
clear access-list OUTSIDE_IN counters
clear conn address 10.0.2.10</pre>

<div class="warn"><p><b>Five mistakes to never make again.</b> Wildcard masks; public IPs in ACLs; a specific permit below a broad deny; an ACL without access-group; and a "temporary" permit ip any any.</p></div>

<div class="exam"><p><b>Last exam trap.</b> Many questions show a correct-looking ACE with zero hits. Before choosing an answer, ask three questions: is it bound, is anything above it catching the traffic, and does it use the real address and port?</p></div>

<div class="scn"><h4>The audit that passed in one afternoon</h4><p>An e-commerce company prepared for a PCI audit. Their OUTSIDE_IN had 12 ACEs, each with a remark naming a change number and owner, built on objects such as WEB, MAIL and PUBLIC-SERVERS, all referencing real addresses. For each rule, the engineer showed the auditor a packet-tracer proving it allowed only the stated flow, plus a trace proving an unlisted flow was dropped, and hit counts for the last 90 days. The auditor signed off the firewall section the same afternoon.</p><p><b>Lesson:</b> clean, commented, object-based ACLs with evidence are not just good engineering; they are what auditors and employers look for.</p></div>

<div class="iv"><p class="q">"Summarise how you would publish a DMZ web server securely on an ASA."</p><p>Strong answer: define an object for the server with static NAT; write a narrow inbound ACL on outside permitting only TCP 80/443 to the object (real IP); keep other services, like SSH, limited to specific partner or admin sources; add remarks and logging where useful; bind with access-group in; restrict management access separately; prove with packet-tracer for allowed and blocked flows and watch hit counts. Mention that NAT details are covered next and that inspection and IPS add depth later.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA access control = state first, then un-NAT, route, ACL, implicit deny.</li>
<li>ASA ACLs: subnet masks, named, bound with access-group, one per interface per direction.</li>
<li>Objects and groups make policy readable; watch expansion.</li>
<li>Real-IP rule: ACLs match untranslated addresses and ports.</li>
<li>Prove every rule with packet-tracer, hit counts and syslog; next up: NAT in depth.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki ASA kaise decide karta hai, us decision ko clean ACLs mein kaise express karna hai, aur use kaise saabit karna hai. Labs, interview ya SNCF / SCOR exam se pehle is chapter ko last revision ki tarah use karo.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="15" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Evaluation</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">conn, un-NAT, route, ACL</text>
<rect x="220" y="15" width="200" height="60" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Syntax</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">masks, in/out/global</text>
<rect x="430" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">groups, nesting</text>
<rect x="10" y="95" width="200" height="60" rx="8" fill="#fed7aa"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">Real-IP rule</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">pehle untranslate, phir ACL</text>
<rect x="220" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">remarks, time, log, hits</text>
<rect x="430" y="95" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">Management</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">ssh, icmp, control-plane</text>
<rect x="120" y="170" width="400" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="14">Saabit karo: packet-tracer + hitcnt + syslog</text>
</svg><p class="cap">Chhe ideas, ek aadat: har rule saabit hoti hai, maani nahi jaati.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Nayi flow ka order samjhao: conn lookup, un-NAT, route lookup, ACL (interface, global, implicit deny), source NAT, inspection, flow creation.</li>
<li>Security-level defaults batao aur ACL apply hone par kya badalta hai.</li>
<li>Subnet masks, hosts, objects, groups, port operators aur ICMP types ke saath extended ACEs likho.</li>
<li>ACLs ko inbound, outbound aur globally bind karo, aur binding safely replace karo.</li>
<li>Network aur service objects, aur network, service, protocol aur icmp-type object-groups banao, nesting samet.</li>
<li>Static NAT, port forwarding aur outbound ACLs ke liye real-IP rule samjhao aur apply karo.</li>
<li>ACEs insert, remove aur comment karo; time-based aur logged ACEs banao.</li>
<li>Hit counts, element counts aur hashes padho; unused aur shadowed rules dhoondho.</li>
<li>Flow matrix se least-privilege DMZ policy design karo: outside par inbound, dmz par DMZ_IN jo limit kare ki servers kya shuru kar sakte hain, aur broad permits ke upar DMZ-se-inside deny.</li>
<li>ssh, h&#116;tp aur icmp commands aur control-plane ACL se management access restrict karo.</li>
<li>Koi bhi decision packet-tracer se saabit karo aur dono labs solve karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACE</dt><dd>Access control entry: ACL ki ek line.</dd>
<dt>access-group</dt><dd>ACL ko interface (in/out) par, globally, ya control plane par bind karta hai.</dd>
<dt>Implicit deny</dt><dd>Har ACL ka invisible final deny; 106023 log karta hai.</dd>
<dt>Real address</dt><dd>Host ka untranslated address jahan woh rehta hai; 8.3 se ACLs yahi use karti hain.</dd>
<dt>Mapped address</dt><dd>NAT address jo doosri side dekhti hai.</dd>
<dt>Object / object-group</dt><dd>Ek named single item / items ka named bundle.</dd>
<dt>Element</dt><dd>Groups khulne ke baad ek expanded ACE.</dd>
<dt>hitcnt</dt><dd>Boot ya clear ke baad se ACE se match hui nayi connections.</dd>
<dt>Shadowed rule</dt><dd>Aisi ACE jo kabhi match nahi kar sakti kyunki upar ki broader ACE uska traffic pakad leti hai.</dd>
<dt>Control-plane ACL</dt><dd>Aisi ACL jo interface par khud ASA ko destined traffic filter karti hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>ASA ACLs mein mask type</td><td>Subnet mask, wildcard nahi</td></tr>
<tr><td>Static-NAT server ke liye ACL mein address (8.3+)</td><td>Real (untranslated) IP</td></tr>
<tr><td>Port-forward ke liye ACL mein port</td><td>Real (server) port</td></tr>
<tr><td>Interface aur global ACL ka order</td><td>Interface, phir global, phir implicit deny</td></tr>
<tr><td>Global ACL direction</td><td>Sirf inbound</td></tr>
<tr><td>Har interface har direction ACLs</td><td>Ek</td></tr>
<tr><td>Permitted flow ka return traffic</td><td>Conn table se allowed, ACL se nahi</td></tr>
<tr><td>Log ke bina deny / log wali ACE</td><td>106023 / 106100</td></tr>
<tr><td>Kya interface ACL ASA tak SSH filter karti hai?</td><td>Nahi: ssh commands ya control-plane ACL use karo</td></tr>
<tr><td>Time-range components</td><td>Ek absolute, kai periodic</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! banao</span>
object network WEB
 host 10.0.2.10
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
access-list OUTSIDE_IN remark CHG-2210 public services
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh log
access-group OUTSIDE_IN in interface outside
<span class="c">! verify karo</span>
show running-config access-group
show access-list OUTSIDE_IN
show nat
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
show logging | include 1060|1061
show conn address 10.0.2.10
<span class="c">! maintain karo</span>
clear access-list OUTSIDE_IN counters
clear conn address 10.0.2.10</pre>

<div class="warn"><p><b>Paanch galtiyan jo dobara kabhi mat karna.</b> Wildcard masks; ACLs mein public IPs; broad deny ke neeche specific permit; access-group ke bina ACL; aur "temporary" permit ip any any.</p></div>

<div class="exam"><p><b>Aakhri exam trap.</b> Kai questions zero hits wali sahi dikhne wali ACE dikhate hain. Answer chunne se pehle teen sawaal poocho: kya yeh bound hai, kya iske upar koi cheez traffic pakad rahi hai, aur kya yeh real address aur port use karti hai?</p></div>

<div class="scn"><h4>Woh audit jo ek dopahar mein pass hua</h4><p>Ek e-commerce company PCI audit ki taiyaari kar rahi thi. Unki OUTSIDE_IN mein 12 ACEs thi, har ek change number aur owner wale remark ke saath, WEB, MAIL aur PUBLIC-SERVERS jaise objects par bani, sab real addresses refer karti hui. Har rule ke liye engineer ne auditor ko packet-tracer dikhaya jo saabit karta tha ki woh sirf batayi gayi flow allow karti hai, plus ek trace jo saabit karta tha ki unlisted flow drop hoti hai, aur pichhle 90 din ke hit counts. Auditor ne usi dopahar firewall section sign off kar diya.</p><p><b>Seekh:</b> saboot ke saath clean, commented, object-based ACLs sirf achhi engineering nahi hain; auditors aur employers yahi dhoondhte hain.</p></div>

<div class="iv"><p class="q">"Summarise karo ki aap ASA par DMZ web server securely kaise publish karoge."</p><p>Strong answer: server ke liye static NAT wala object define karo; outside par narrow inbound ACL likho jo sirf object (real IP) tak TCP 80/443 permit kare; SSH jaisi baaki services ko specific partner ya admin sources tak limited rakho; jahan useful ho remarks aur logging jodo; access-group in se bind karo; management access alag se restrict karo; allowed aur blocked flows ke liye packet-tracer se saabit karo aur hit counts dekho. Mention karo ki NAT details agle module mein hain aur inspection aur IPS baad mein depth jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA access control = pehle state, phir un-NAT, route, ACL, implicit deny.</li>
<li>ASA ACLs: subnet masks, named, access-group se bound, har interface har direction ek.</li>
<li>Objects aur groups policy ko readable banate hain; expansion par nazar rakho.</li>
<li>Real-IP rule: ACLs untranslated addresses aur ports match karti hain.</li>
<li>Har rule packet-tracer, hit counts aur syslog se saabit karo; aage: NAT in depth.</li>
</ul></div>
`}};export{e as default};