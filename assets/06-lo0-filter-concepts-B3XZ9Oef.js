var e={id:`lo0-filter-concepts`,h:{en:`Protecting the Routing Engine with a lo0 firewall filter`,hi:`lo0 firewall filter se Routing Engine ki suraksha`},body:{en:`
<p>The Routing Engine is small and critical. If someone floods it with pings or password guesses, OSPF hellos may be delayed, neighbours drop and the whole network flaps. Junos gives a standard defence: a <b>firewall filter</b> applied to the <b>loopback interface lo0</b>. This chapter explains how filters work and why lo0 is special. The next chapter builds one in the lab.</p>

<h3>An analogy: the reception desk of an office</h3>
<p>A visitor cannot just walk into the managers' office. A reception desk checks each visitor against a list: "routing partners, go in", "IT staff with a pass, go in", "deliveries, leave at the desk", "everyone else, politely refused". The reception desk is the lo0 filter and the managers' office is the RE. People walking through the building to another office (transit traffic) never pass the desk.</p>

<h3>Firewall filter anatomy</h3>
<p>A Junos firewall filter is an ordered list of <b>terms</b>. Each term has a <b>from</b> section (match conditions) and a <b>then</b> section (actions). Packets are checked against the terms from top to bottom, and the first matching term decides. If no term matches, the filter ends with an <b>implicit discard</b>: the packet is dropped.</p>
<table class="cmp"><tr><th>Part</th><th>Examples</th></tr>
<tr><td>from (match)</td><td>protocol ospf, protocol tcp, destination-port ssh, source-address 192.0.2.0/24, protocol icmp</td></tr>
<tr><td>then (action)</td><td>accept, discard (silent drop), reject (drop and send ICMP error)</td></tr>
<tr><td>then (non-terminating)</td><td>count name, log, syslog, policer, next term</td></tr></table>
<p>A filter belongs to a protocol <b>family</b> (<code>family inet</code> for IPv4, <code>inet6</code>, <code>ethernet-switching</code>) and is applied to an interface unit in the <b>input</b> or <b>output</b> direction.</p>

<h3>Why lo0 is special</h3>
<p>Every router has the loopback interface <code>lo0</code>, which is always up. On Junos, a filter applied as <b>input on lo0</b> is evaluated for all traffic destined <b>to the Routing Engine</b>, no matter which physical interface it arrived on. It is not limited to packets sent to the lo0 address. That makes it the single place to protect the control plane. Transit traffic is not affected, because it never goes to the RE.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="lo0 filter guarding the RE">
<rect x="20" y="30" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 ingress</text>
<rect x="20" y="90" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1 ingress</text>
<rect x="20" y="150" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="175" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2 ingress</text>
<rect x="230" y="60" width="170" height="100" rx="8" fill="#fde68a"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">lo0 input filter</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="11">PROTECT-RE</text><text x="315" y="135" text-anchor="middle" class="svg-muted" font-size="11">accept / discard</text>
<rect x="470" y="60" width="150" height="100" rx="8" fill="#ddd6fe"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text>
<line x1="170" y1="50" x2="230" y2="90" stroke="#dc2626" stroke-width="2"/><line x1="170" y1="110" x2="230" y2="110" stroke="#dc2626" stroke-width="2"/><line x1="170" y1="170" x2="230" y2="130" stroke="#dc2626" stroke-width="2"/>
<line x1="400" y1="110" x2="470" y2="110" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Only exception traffic (red) is filtered; transit traffic never goes up</text>
</svg><p class="cap">Packets for the RE from any port pass through the lo0 filter first.</p></div>

<h3>A good protect-the-RE filter</h3>
<p>Think "allow what the RE needs, count and discard the rest":</p>
<ol><li>Accept routing protocols you actually use (OSPF here, BGP from its neighbours).</li>
<li>Accept management (SSH) ideally only from trusted source addresses.</li>
<li>Accept ICMP, counted, and often rate-limited with a policer.</li>
<li>Last term: count and discard everything else, so you can see attempts.</li></ol>
<pre class="code">set firewall family inet filter PROTECT-RE term routing from protocol ospf
set firewall family inet filter PROTECT-RE term routing then accept
set firewall family inet filter PROTECT-RE term mgmt from protocol tcp
set firewall family inet filter PROTECT-RE term mgmt from destination-port ssh
set firewall family inet filter PROTECT-RE term mgmt then accept
set firewall family inet filter PROTECT-RE term ping from protocol icmp
set firewall family inet filter PROTECT-RE term ping then count re-icmp
set firewall family inet filter PROTECT-RE term ping then accept
set firewall family inet filter PROTECT-RE term rest then count re-drop
set firewall family inet filter PROTECT-RE term rest then discard
set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>

<div class="eg"><p><b>Worked example.</b> An OSPF hello arrives on ge-0/0/1: term <i>routing</i> matches (protocol ospf), accept. An SSH packet to port 22: first term no, term <i>mgmt</i> yes, accept. A ping to the router: term <i>ping</i> matches, counted and accepted. A Telnet attempt: no match in the first three, term <i>rest</i> counts it in re-drop and discards it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the routing-protocol term, so the implicit discard kills OSPF or BGP and the router isolates itself. Applying the filter to a physical interface when you meant lo0. Using <code>reject</code> on the RE filter, which makes the router spend CPU replying to attackers; <code>discard</code> is cheaper.</p></div>

<div class="exam"><p><b>Exam traps.</b> Terms are evaluated top-down and the first match wins. The last implicit action is discard. A lo0 filter affects traffic to the RE from any interface, not just packets sent to lo0's own address. Remember the <code>count</code> action is non-terminating; the term still needs accept or discard.</p></div>

<div class="scn"><h4>The router that locked itself in</h4><p>An engineer applied a lo0 filter with terms for SSH and ICMP only. Within a minute OSPF neighbours went down and routes vanished. The filter had no term for OSPF, so hellos fell to the implicit discard. Because he had used <code>commit confirmed 5</code>, Junos rolled the configuration back automatically and the network recovered. He added an OSPF term and tried again.</p><p><b>Lesson:</b> always allow the protocols the RE needs, and use commit confirmed for filter changes.</p></div>

<div class="iv"><p class="q">"How do you protect the control plane on a Junos router?"</p><p>Apply a firewall filter as input on lo0 that accepts the routing protocols in use, management from trusted sources and counted ICMP, then counts and discards everything else. Mention that it covers traffic to the RE from any interface, that term order matters, the implicit discard, and testing with commit confirmed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A firewall filter is an ordered list of terms; the first match wins; the end is an implicit discard.</li>
<li>Apply it as input on lo0 to guard everything going to the RE, from any interface.</li>
<li>Allow routing protocols, management and counted ICMP; count and discard the rest.</li>
<li>Count is non-terminating; accept, discard and reject terminate.</li>
<li>Use commit confirmed so a mistake rolls back by itself.</li>
</ul></div>
`,hi:`
<p>Routing Engine chhota aur critical hai. Koi ise pings ya password guesses se flood kar de to OSPF hellos late ho sakte hain, neighbours gir jaate hain aur poora network flap karta hai. Junos ek standard defence deta hai: <b>loopback interface lo0</b> par lagaya gaya <b>firewall filter</b>. Yeh chapter samjhata hai ki filters kaise kaam karte hain aur lo0 khaas kyun hai. Agla chapter lab mein ek banata hai.</p>

<h3>Analogy: office ka reception desk</h3>
<p>Koi visitor seedha managers ke office mein nahi ghus sakta. Reception desk har visitor ko list se check karta hai: "routing partners, andar jao", "pass wale IT staff, andar jao", "deliveries, desk par chhod do", "baaki sab, vinamrata se mana". Reception desk lo0 filter hai aur managers ka office RE. Building se guzar kar doosre office jaate log (transit traffic) desk se kabhi nahi guzarte.</p>

<h3>Firewall filter ka anatomy</h3>
<p>Junos firewall filter <b>terms</b> ki ordered list hai. Har term mein <b>from</b> section (match conditions) aur <b>then</b> section (actions) hota hai. Packets ko terms se upar se neeche check kiya jaata hai, aur pehla matching term faisla karta hai. Koi term match na kare to filter ek <b>implicit discard</b> par khatam hota hai: packet drop.</p>
<table class="cmp"><tr><th>Hissa</th><th>Examples</th></tr>
<tr><td>from (match)</td><td>protocol ospf, protocol tcp, destination-port ssh, source-address 192.0.2.0/24, protocol icmp</td></tr>
<tr><td>then (action)</td><td>accept, discard (silent drop), reject (drop aur ICMP error bhejo)</td></tr>
<tr><td>then (non-terminating)</td><td>count name, log, syslog, policer, next term</td></tr></table>
<p>Filter ek protocol <b>family</b> ka hota hai (IPv4 ke liye <code>family inet</code>, <code>inet6</code>, <code>ethernet-switching</code>) aur interface unit par <b>input</b> ya <b>output</b> direction mein lagta hai.</p>

<h3>lo0 khaas kyun hai</h3>
<p>Har router ke paas loopback interface <code>lo0</code> hota hai, jo hamesha up rehta hai. Junos par <b>lo0 par input</b> lagaya gaya filter un saare traffic par chalta hai jo <b>Routing Engine ke liye</b> hai, chahe woh kisi bhi physical interface se aaya ho. Yeh sirf lo0 address par bheje packets tak seemit nahi. Isliye control plane ko bachane ki yeh akeli jagah hai. Transit traffic par asar nahi hota, kyunki woh RE tak jaata hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RE ki raksha karta lo0 filter">
<rect x="20" y="30" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 ingress</text>
<rect x="20" y="90" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1 ingress</text>
<rect x="20" y="150" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="175" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2 ingress</text>
<rect x="230" y="60" width="170" height="100" rx="8" fill="#fde68a"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">lo0 input filter</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="11">PROTECT-RE</text><text x="315" y="135" text-anchor="middle" class="svg-muted" font-size="11">accept / discard</text>
<rect x="470" y="60" width="150" height="100" rx="8" fill="#ddd6fe"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text>
<line x1="170" y1="50" x2="230" y2="90" stroke="#dc2626" stroke-width="2"/><line x1="170" y1="110" x2="230" y2="110" stroke="#dc2626" stroke-width="2"/><line x1="170" y1="170" x2="230" y2="130" stroke="#dc2626" stroke-width="2"/>
<line x1="400" y1="110" x2="470" y2="110" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Sirf exception traffic (laal) filter hota hai; transit traffic upar nahi jaata</text>
</svg><p class="cap">Kisi bhi port se RE ke liye aaye packets pehle lo0 filter se guzarte hain.</p></div>

<h3>Achha protect-the-RE filter</h3>
<p>Socho "jo RE ko chahiye woh allow karo, baaki ko gino aur discard karo":</p>
<ol><li>Jo routing protocols aap use karte ho woh accept karo (yahan OSPF, BGP uske neighbours se).</li>
<li>Management (SSH) ideally sirf trusted source addresses se accept karo.</li>
<li>ICMP accept karo, counted, aur aksar policer se rate-limited.</li>
<li>Aakhri term: baaki sab ko gino aur discard karo, taaki koshishein dikhein.</li></ol>
<pre class="code">set firewall family inet filter PROTECT-RE term routing from protocol ospf
set firewall family inet filter PROTECT-RE term routing then accept
set firewall family inet filter PROTECT-RE term mgmt from protocol tcp
set firewall family inet filter PROTECT-RE term mgmt from destination-port ssh
set firewall family inet filter PROTECT-RE term mgmt then accept
set firewall family inet filter PROTECT-RE term ping from protocol icmp
set firewall family inet filter PROTECT-RE term ping then count re-icmp
set firewall family inet filter PROTECT-RE term ping then accept
set firewall family inet filter PROTECT-RE term rest then count re-drop
set firewall family inet filter PROTECT-RE term rest then discard
set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>

<div class="eg"><p><b>Worked example.</b> ge-0/0/1 par OSPF hello aaya: term <i>routing</i> match (protocol ospf), accept. Port 22 par SSH packet: pehla term nahi, term <i>mgmt</i> haan, accept. Router ko ping: term <i>ping</i> match, counted aur accepted. Telnet koshish: pehle teen mein match nahi, term <i>rest</i> use re-drop mein ginta hai aur discard kar deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Routing-protocol term bhool jaana, to implicit discard OSPF ya BGP maar deta hai aur router khud ko isolate kar leta hai. Jab lo0 chahiye tha tab filter physical interface par lagana. RE filter mein <code>reject</code> use karna, jisse router attackers ko jawab dene mein CPU kharch karta hai; <code>discard</code> sasta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Terms upar se neeche evaluate hote hain aur pehla match jeetta hai. Aakhri implicit action discard hai. lo0 filter kisi bhi interface se RE ko jaate traffic ko affect karta hai, sirf lo0 ke apne address ko bheje packets ko nahi. Yaad rakho <code>count</code> action non-terminating hai; term ko phir bhi accept ya discard chahiye.</p></div>

<div class="scn"><h4>Router jisne khud ko lock kar liya</h4><p>Ek engineer ne sirf SSH aur ICMP ke terms wala lo0 filter lagaya. Ek minute mein OSPF neighbours gir gaye aur routes gayab ho gaye. Filter mein OSPF ka term nahi tha, isliye hellos implicit discard mein gaye. Kyunki usne <code>commit confirmed 5</code> use kiya tha, Junos ne configuration khud rollback kar di aur network theek ho gaya. Usne OSPF term jodkar dobara koshish ki.</p><p><b>Lesson:</b> jo protocols RE ko chahiye unhe hamesha allow karo, aur filter changes ke liye commit confirmed use karo.</p></div>

<div class="iv"><p class="q">"Junos router par control plane ki suraksha kaise karte ho?"</p><p>lo0 par input ke roop mein firewall filter lagao jo use hone wale routing protocols, trusted sources se management aur counted ICMP accept kare, phir baaki sab ko gine aur discard kare. Zikr karo ki yeh kisi bhi interface se RE ke traffic ko cover karta hai, term order matter karta hai, implicit discard hai, aur commit confirmed se test karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall filter terms ki ordered list hai; pehla match jeetta hai; end par implicit discard.</li>
<li>RE ko jaate saare traffic ko guard karne ke liye ise lo0 par input lagao.</li>
<li>Routing protocols, management aur counted ICMP allow karo; baaki gino aur discard karo.</li>
<li>Count non-terminating hai; accept, discard aur reject terminate karte hain.</li>
<li>Commit confirmed use karo taaki galti khud rollback ho jaye.</li>
</ul></div>
`}};export{e as default};