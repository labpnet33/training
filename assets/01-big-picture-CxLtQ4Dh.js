var e={id:`big-picture`,h:{en:`Firewall filters: the big picture`,hi:`Firewall filters: bada picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will write Junos stateless firewall filters term by term, count and log what they catch, apply them in the correct direction, protect the Routing Engine with a loopback filter without locking yourself out, block a noisy host, and stop spoofed source addresses with unicast reverse-path forwarding (uRPF). These are core JNCIA-Junos (JN0-106) skills.</p>
<p><b>Prerequisites.</b> You should know IPv4 addressing, TCP and UDP port numbers, the difference between a router's forwarding of user traffic and traffic addressed to the router itself, and basic Junos CLI (<code>configure</code>, <code>set</code>, <code>commit</code>, <code>show</code>). The previous module covered routing policy, which filters <b>routes</b>. Here we filter <b>packets</b>.</p>

<h3>Start with an analogy: the building reception desk</h3>
<p>A company office has a reception desk. The receptionist looks at every visitor <b>on their own</b>, with no memory of earlier visits. The rules say: "Delivery staff go to the loading dock. People with a staff badge go in. Anyone else, send away." The receptionist also keeps a tally of how many deliveries arrived, and notes the names of people turned away.</p>
<p>A Junos <b>firewall filter</b> is that receptionist. It checks each packet against rules in order, with no memory of past packets. This is what <b>stateless</b> means.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where a filter sits on a router">
<rect x="20" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="13">Users</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="11">10.20.20.0/24</text>
<rect x="240" y="40" width="160" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Junos router</text>
<rect x="255" y="75" width="130" height="30" rx="6" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">input filter</text>
<rect x="255" y="120" width="130" height="30" rx="6" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">output filter</text>
<rect x="510" y="70" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="565" y="102" text-anchor="middle" class="svg-ink" font-size="13">Servers</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="11">10.40.9.0/24</text>
<line x1="130" y1="105" x2="240" y2="105" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Input sees packets arriving; output sees packets leaving</text>
</svg><p class="cap">Filters attach to interfaces, one per direction and family.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Firewall filter</dt><dd>An ordered list of terms that match packet header fields and take an action. The Junos equivalent of an ACL.</dd>
<dt>Stateless</dt><dd>Every packet is judged alone. There is no session table, so return traffic must be permitted explicitly.</dd>
<dt>Term</dt><dd>One rule: a <code>from</code> match and a <code>then</code> action.</dd>
<dt>Family</dt><dd>The protocol family the filter works on, such as <code>inet</code> for IPv4 and <code>inet6</code> for IPv6.</dd>
<dt>Routing Engine (RE)</dt><dd>The control-plane brain of the router. It handles SSH, SNMP and routing protocols.</dd>
</dl>

<h3>Routing policy versus firewall filter</h3>
<table class="cmp"><tr><th></th><th>Routing policy</th><th>Firewall filter</th></tr>
<tr><td>Works on</td><td>Routes in the routing table</td><td>Packets on an interface</td></tr>
<tr><td>Configured under</td><td>policy-options</td><td>firewall</td></tr>
<tr><td>Applied to</td><td>A protocol import or export</td><td>An interface unit, per direction</td></tr>
<tr><td>Typical action</td><td>accept, reject, metric, tag</td><td>accept, discard, reject, count, log</td></tr></table>
<p>Students mix these up in interviews, so keep the picture clear: policy decides <b>what the router knows</b>; filters decide <b>what packets may pass</b>.</p>

<h3>Why filters matter</h3>
<p>Three jobs fill almost every real filter:</p>
<ul>
<li><b>Protect the router.</b> Only management hosts may SSH in. This is the loopback (lo0) filter.</li>
<li><b>Control traffic.</b> Block a bad host, a risky port, or a whole subnet between zones.</li>
<li><b>Measure and prove.</b> Count and log what a rule catches, so you show management the numbers.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> In Nagpur, R1 answers SSH from anywhere. Users on 10.20.20.0/24 can try to log in to the router, which is a risk. A loopback filter will allow SSH only from the NOC subnet 10.10.10.0/24, allow ping and OSPF, and discard the rest while counting the discards. You build exactly this in the lab.</p></div>

<h3>The three-line habit you will repeat all module</h3>
<pre class="code"><span class="c">! 1. build the filter</span>
set firewall family inet filter PROTECT-RE term SSH-NOC from source-address 10.10.10.0/24
set firewall family inet filter PROTECT-RE term SSH-NOC then accept
<span class="c">! 2. attach it to an interface</span>
set interfaces lo0 unit 0 family inet filter input PROTECT-RE
<span class="c">! 3. verify and watch the counters</span>
show firewall filter PROTECT-RE</pre>
<p>As with routing policy, a filter that is only defined does nothing. It must be attached to an interface unit.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting that every filter ends with an invisible <b>discard</b>. A filter with one accept term silently blocks everything else, including routing protocols. The next chapter explains this in detail.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos filters are stateless and applied per interface unit and per direction. If a question mentions "tracks sessions" or "return traffic is automatically allowed", that is a stateful security feature, not a firewall filter.</p></div>

<div class="scn"><h4>The router that accepted passwords from the whole company</h4><p>During an audit, a security team scanned an edge router and found SSH open to all user subnets. No attack had happened, but the finding blocked a compliance certificate. The network team wrote a loopback filter that allowed SSH only from two management subnets. They applied it with a safety timer, tested from a management PC and a user PC, and showed the audit tool a closed port. The certificate was issued the next week.</p><p><b>Lesson:</b> protecting the control plane is part of the job, not an optional extra.</p></div>

<div class="iv"><p class="q">"What is a stateless firewall filter, and what does stateless mean here?"</p><p>Strong answer: it is an ordered list of terms that matches packet headers (addresses, protocol, ports) and takes actions such as accept, discard, count or log. Stateless means each packet is evaluated alone, with no session table, so return traffic has to be allowed by its own term. Filters are applied to interface units in the input or output direction, and the lo0 filter protects the Routing Engine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A firewall filter is a stateless, ordered list of terms that judges each packet alone.</li>
<li>Filters work on packets; routing policies work on routes.</li>
<li>They are defined under firewall family inet filter and attached under an interface unit.</li>
<li>Three main uses: protect the router, control traffic, and count or log.</li>
<li>A filter that is not attached does nothing; every filter has an implicit discard at the end.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Junos stateless firewall filters term by term likhoge, jo pakde use count aur log karoge, sahi direction mein apply karoge, loopback filter se Routing Engine ko khud ko lock-out kiye bina bachaoge, shor machane wale host ko block karoge, aur unicast reverse-path forwarding (uRPF) se spoofed source addresses rokoge. Yeh JNCIA-Junos (JN0-106) ke core skills hain.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing, TCP aur UDP port numbers, router ke user traffic forward karne aur router ko hi address kiye traffic mein farak, aur basic Junos CLI (<code>configure</code>, <code>set</code>, <code>commit</code>, <code>show</code>) aani chahiye. Pichla module routing policy tha, jo <b>routes</b> filter karti hai. Yahan hum <b>packets</b> filter karte hain.</p>

<h3>Analogy se shuru karo: building ka reception desk</h3>
<p>Company office mein reception desk hota hai. Receptionist har visitor ko <b>akele</b> dekhta hai, pichli visits ki yaad nahi rakhta. Rules hain: "Delivery wale loading dock jaayein. Staff badge wale andar jaayein. Baaki sabko wapas bhej do." Receptionist tally bhi rakhta hai ki kitni deliveries aayin, aur jinhe wapas kiya unke naam note karta hai.</p>
<p>Junos <b>firewall filter</b> wahi receptionist hai. Yeh har packet ko order mein rules se check karta hai, pichle packets ki koi yaad nahi. Isi ko <b>stateless</b> kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where a filter sits on a router">
<rect x="20" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="13">Users</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="11">10.20.20.0/24</text>
<rect x="240" y="40" width="160" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Junos router</text>
<rect x="255" y="75" width="130" height="30" rx="6" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">input filter</text>
<rect x="255" y="120" width="130" height="30" rx="6" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">output filter</text>
<rect x="510" y="70" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="565" y="102" text-anchor="middle" class="svg-ink" font-size="13">Servers</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="11">10.40.9.0/24</text>
<line x1="130" y1="105" x2="240" y2="105" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Input aane wale packets dekhta hai; output jaane wale</text>
</svg><p class="cap">Filters interfaces par lagte hain, har direction aur family ke liye ek.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Firewall filter</dt><dd>Terms ki ordered list jo packet header fields match karti hai aur action leti hai. Junos mein ACL ka equivalent.</dd>
<dt>Stateless</dt><dd>Har packet akele judge hota hai. Session table nahi hoti, isliye return traffic ko explicitly permit karna padta hai.</dd>
<dt>Term</dt><dd>Ek rule: <code>from</code> match aur <code>then</code> action.</dd>
<dt>Family</dt><dd>Protocol family jis par filter kaam karta hai, jaise IPv4 ke liye <code>inet</code> aur IPv6 ke liye <code>inet6</code>.</dd>
<dt>Routing Engine (RE)</dt><dd>Router ka control-plane dimaag. SSH, SNMP aur routing protocols yahi sambhalta hai.</dd>
</dl>

<h3>Routing policy versus firewall filter</h3>
<table class="cmp"><tr><th></th><th>Routing policy</th><th>Firewall filter</th></tr>
<tr><td>Kis par kaam</td><td>Routing table ke routes</td><td>Interface ke packets</td></tr>
<tr><td>Configure kahan</td><td>policy-options</td><td>firewall</td></tr>
<tr><td>Apply kahan</td><td>Protocol import ya export</td><td>Interface unit, har direction</td></tr>
<tr><td>Typical action</td><td>accept, reject, metric, tag</td><td>accept, discard, reject, count, log</td></tr></table>
<p>Interviews mein students yeh mix kar dete hain, isliye picture clear rakho: policy decide karti hai <b>router kya jaanta hai</b>; filters decide karte hain <b>kaunse packets guzar sakte hain</b>.</p>

<h3>Filters kyun zaroori hain</h3>
<p>Lagbhag har real filter teen kaam karta hai:</p>
<ul>
<li><b>Router ko bachana.</b> Sirf management hosts SSH kar sakein. Yeh loopback (lo0) filter hai.</li>
<li><b>Traffic control.</b> Bad host, risky port, ya zones ke beech poora subnet block karna.</li>
<li><b>Naapna aur prove karna.</b> Rule ne jo pakda use count aur log karo, taaki management ko numbers dikha sako.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Nagpur mein R1 kahin se bhi SSH ka jawab deta hai. 10.20.20.0/24 ke users router mein login try kar sakte hain, jo risk hai. Loopback filter SSH sirf NOC subnet 10.10.10.0/24 se allow karega, ping aur OSPF allow karega, aur baaki discard karke discards count karega. Aap lab mein yahi banate ho.</p></div>

<h3>Teen-line aadat jo poore module mein dohraoge</h3>
<pre class="code"><span class="c">! 1. filter banao</span>
set firewall family inet filter PROTECT-RE term SSH-NOC from source-address 10.10.10.0/24
set firewall family inet filter PROTECT-RE term SSH-NOC then accept
<span class="c">! 2. interface par attach karo</span>
set interfaces lo0 unit 0 family inet filter input PROTECT-RE
<span class="c">! 3. verify karo aur counters dekho</span>
show firewall filter PROTECT-RE</pre>
<p>Routing policy ki tarah, sirf define kiya hua filter kuch nahi karta. Use interface unit par attach karna padta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Yeh bhool jaana ki har filter ke end mein ek invisible <b>discard</b> hota hai. Ek accept term wala filter baaki sab chupchap block kar deta hai, routing protocols bhi. Agla chapter ise detail mein samjhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos filters stateless hain aur interface unit aur direction ke hisaab se lagte hain. Agar sawal mein "sessions track karta hai" ya "return traffic apne aap allow" aaye, to woh stateful security feature hai, firewall filter nahi.</p></div>

<div class="scn"><h4>Router jo poori company se passwords leta tha</h4><p>Audit ke dauran security team ne edge router scan kiya aur saare user subnets ke liye SSH open paya. Koi attack nahi hua tha, lekin finding ne compliance certificate rok diya. Network team ne loopback filter likha jo SSH sirf do management subnets se allow karta tha. Safety timer ke saath apply kiya, management PC aur user PC se test kiya, aur audit tool ko closed port dikhaya. Certificate agle hafte mil gaya.</p><p><b>Lesson:</b> control plane ki suraksha kaam ka hissa hai, optional extra nahi.</p></div>

<div class="iv"><p class="q">"Stateless firewall filter kya hai, aur yahan stateless ka matlab kya hai?"</p><p>Strong answer: yeh terms ki ordered list hai jo packet headers (addresses, protocol, ports) match karti hai aur accept, discard, count ya log jaise actions leti hai. Stateless ka matlab har packet akele evaluate hota hai, session table nahi, isliye return traffic ko apne term se allow karna padta hai. Filters interface units par input ya output direction mein lagte hain, aur lo0 filter Routing Engine ko bachata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall filter stateless, ordered terms ki list hai jo har packet ko akele judge karti hai.</li>
<li>Filters packets par kaam karte hain; routing policies routes par.</li>
<li>Yeh firewall family inet filter ke neeche define aur interface unit ke neeche attach hote hain.</li>
<li>Teen main use: router bachana, traffic control, aur count ya log.</li>
<li>Jo filter attach nahi hua woh kuch nahi karta; har filter ke end mein implicit discard hai.</li>
</ul></div>
`}};export{e as default};