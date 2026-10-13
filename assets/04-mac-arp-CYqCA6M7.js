var e={id:`mac-arp`,h:{en:`Inside the bridge: MAC table, discovery and ARP inspection`,hi:`Bridge ke andar: MAC table, discovery aur ARP inspection`},body:{en:`
<p>A hotel concierge who sits between two wings keeps a notebook: "Mr Sharma, west wing; Ms Rao, east wing." When a parcel arrives for someone not in the notebook, a normal porter would shout down both corridors. This concierge is more careful: she phones the person first, notes which wing answers, and only then sends parcels. That notebook is the transparent firewall's <b>MAC address table</b>, and the phone call is its <b>discovery</b> process.</p>

<h3>How a frame crosses a transparent firewall</h3>
<ol>
<li>A frame arrives on a member interface, for example <code>inside</code>. The firewall <b>learns the source MAC</b> on that interface.</li>
<li>If the packet starts a new connection, it goes through the <b>same policy</b> as in routed mode: security levels, ACLs, NAT if configured, inspection. Allowed connections are added to the connection table.</li>
<li>The firewall looks up the <b>destination MAC</b> in its table for that bridge group. If it is known on another member, the frame goes out there.</li>
<li>If the destination MAC is unknown, the firewall <b>does not flood</b>. It drops that packet and sends an <b>ARP request</b> (destination in the bridged subnet) or a <b>ping</b> (remote destination, to make the router answer) from the BVI address, then learns which interface replied. The next packet is forwarded.</li>
<li>Return traffic of an existing connection is matched in the connection table and forwarded without a new policy check.</li>
</ol>
<p>Broadcast frames (such as ARP requests) are sent out of all other members of the bridge group, because ARP is allowed through by default.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAC learning in the transparent firewall">
<rect x="20" y="80" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="116" text-anchor="middle" class="svg-muted" font-size="12">5254.0010.0a0a</text>
<rect x="240" y="60" width="160" height="90" rx="10" fill="#fed7aa"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">NK-TFW MAC table</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">inside: 0a0a, 1414</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">outside: 0101, fafa</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">aging 5 min</text>
<rect x="510" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">R-GW</text><text x="565" y="116" text-anchor="middle" class="svg-muted" font-size="12">5254.0010.0101</text>
<line x1="130" y1="102" x2="240" y2="102" stroke="#64748b" stroke-width="2"/><line x1="400" y1="102" x2="510" y2="102" stroke="#64748b" stroke-width="2"/>
<text x="185" y="92" text-anchor="middle" class="svg-muted" font-size="12">inside</text><text x="455" y="92" text-anchor="middle" class="svg-muted" font-size="12">outside</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">unknown destination MAC: drop first packet,</text>
<text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">ARP or ping from BVI 10.0.1.5, learn, then forward</text>
</svg><p class="cap">The firewall learns where each MAC lives and discovers unknown ones instead of flooding.</p></div>

<h3>Reading the MAC address table (lab task 5)</h3>
<p>After PC1 pings 10.0.1.1, the table shows which side each host is on. R-GW sits beyond Gi0/0, so its MAC is learned on <code>outside</code>.</p>
<pre class="out">NK-TFW# show mac-address-table
interface                   mac  address          type      Age(min)   bridge-group
---------------------------------------------------------------------------------------
inside                      5254.0010.0a0a        dynamic   4          1
inside                      5254.0010.1414        dynamic   5          1
<span class="hl">outside                     5254.0010.0101        dynamic   5          1</span>
outside                     5254.0010.fafa        dynamic   3          1</pre>
<p>Useful knobs:</p>
<pre class="code"><span class="c">! dynamic entries age out after 5 minutes by default</span>
mac-address-table aging-time 10
<span class="c">! pin a critical MAC to an interface</span>
mac-address-table static outside 5254.0010.0101
<span class="c">! stop learning on an interface (then only static entries work)</span>
mac-learn inside disable</pre>

<h3>ARP inspection</h3>
<p>ARP has no authentication: any host can claim "10.0.1.1 is at my MAC", and neighbours believe it. In a hostile or shared segment this lets a host insert itself into other hosts' traffic. A transparent firewall sits right in the ARP path, so it can check ARP against a list of trusted bindings. <b>ARP inspection</b> is off by default. When you enable it on an interface, every ARP packet arriving there is compared with the <b>static ARP entries</b>:</p>
<ul>
<li>IP, MAC and interface all match a static entry: the ARP passes.</li>
<li>The IP matches but the MAC or interface does not: the ARP is <b>dropped</b> and logged.</li>
<li>The IP is not in the static table: the firewall either <b>floods</b> the ARP (default) or drops it with <code>no-flood</code>.</li>
</ul>
<pre class="code"><span class="c">! protect the gateway's binding on the router side</span>
arp outside 10.0.1.1 5254.0010.0101
arp-inspection outside enable no-flood
arp-inspection inside enable</pre>
<pre class="out">NK-TFW# show arp-inspection
interface                arp-inspection  miss
----------------------------------------------------
inside                   enabled         flood
<span class="hl">outside                  enabled         no-flood</span>

NK-TFW# show logging | include 322002
%ASA-3-322002: ARP inspection check failed for arp response received from host 5254.0010.9999 on interface inside. This host is advertising MAC Address 5254.0010.9999 for IP Address 10.0.1.1, which is statically bound to MAC Address 5254.0010.0101</pre>

<div class="eg"><p><b>Worked example.</b> With <code>no-flood</code> on outside and only one static entry (10.0.1.1), an ARP from MON (10.0.1.250) arriving on outside has no static entry and is dropped, so MON can no longer reach anything through the firewall. Either add <code>arp outside 10.0.1.250 &lt;MON MAC&gt;</code> or keep the default <code>flood</code> for unknown entries and use static entries only for the addresses you must protect, such as the gateway.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>arp-inspection ... no-flood</code> with an incomplete static table. Every host without an entry silently loses connectivity. Start with <code>flood</code> and static entries for gateways and servers, then tighten.</p></div>

<div class="exam"><p><b>Exam trap.</b> In transparent mode ARP passes in both directions <b>without</b> an ACL. ARP inspection is the tool to control it, not an EtherType ACL. Also, the firewall does not flood unknown unicast; it discovers the location with ARP or ping from the BVI.</p></div>

<div class="scn"><h4>The gateway that moved</h4><p>An operations team saw users in a lab segment lose their sessions every few minutes. On the transparent firewall, <code>show mac-address-table</code> showed the gateway's IP traffic going to a MAC on the <i>inside</i> interface, while the real router was on outside. A misconfigured test VM was answering ARP for 10.0.1.1. The team removed the VM, added a static ARP entry for the gateway and enabled ARP inspection on inside; syslog 322002 later caught a second VM built from the same template.</p><p><b>Lesson:</b> the transparent firewall's MAC table and ARP inspection are excellent tools for detecting and stopping ARP-based impersonation.</p></div>

<div class="iv"><p class="q">"What does a transparent firewall do with a frame for an unknown destination MAC?"</p><p>It does not flood like a switch. It drops that packet and sends an ARP request from the BVI if the destination IP is in the bridged subnet, or a ping towards the destination if it is remote, so that the reply shows which interface leads there. It then learns the MAC and forwards later packets. This is why the BVI address is mandatory.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The firewall learns source MACs per interface and per bridge group; entries age out after 5 minutes by default.</li>
<li>Unknown destination MACs are discovered with ARP or ping from the BVI, not flooded.</li>
<li><code>show mac-address-table</code> shows on which nameif each MAC was learned.</li>
<li>ARP passes by default; ARP inspection checks it against static <code>arp</code> entries.</li>
<li>Unmatched ARP is flooded by default or dropped with <code>no-flood</code>; mismatches are dropped and logged as 322002.</li>
</ul></div>
`,hi:`
<p>Do wings ke beech baitha hotel concierge ek notebook rakhta hai: "Mr Sharma, west wing; Ms Rao, east wing." Jab kisi aise insaan ka parcel aata hai jo notebook mein nahi hai, normal porter dono corridors mein chillaayega. Yeh concierge zyada savdhaan hai: woh pehle us insaan ko phone karti hai, note karti hai ki kaunsa wing jawab deta hai, aur tab parcel bhejti hai. Woh notebook transparent firewall ki <b>MAC address table</b> hai, aur phone call uska <b>discovery</b> process hai.</p>

<h3>Frame transparent firewall kaise paar karta hai</h3>
<ol>
<li>Frame kisi member interface par aata hai, jaise <code>inside</code>. Firewall us interface par <b>source MAC seekhta hai</b>.</li>
<li>Agar packet naya connection shuru karta hai, to woh routed mode jaisi hi <b>same policy</b> se guzarta hai: security levels, ACLs, configured ho to NAT, inspection. Allowed connections connection table mein jud jaate hain.</li>
<li>Firewall us bridge group ki table mein <b>destination MAC</b> dhoondhta hai. Agar woh kisi doosre member par known hai, frame wahan se nikalta hai.</li>
<li>Agar destination MAC unknown hai, firewall <b>flood nahi karta</b>. Woh packet drop karta hai aur BVI address se <b>ARP request</b> (bridged subnet ka destination) ya <b>ping</b> (remote destination, taaki router jawab de) bhejta hai, phir seekhta hai ki kis interface ne reply kiya. Agla packet forward hota hai.</li>
<li>Existing connection ka return traffic connection table mein match hota hai aur bina nayi policy check ke forward hota hai.</li>
</ol>
<p>Broadcast frames (jaise ARP requests) bridge group ke baaki saare members se bheje jaate hain, kyunki ARP default se allowed hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Transparent firewall mein MAC learning">
<rect x="20" y="80" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="116" text-anchor="middle" class="svg-muted" font-size="12">5254.0010.0a0a</text>
<rect x="240" y="60" width="160" height="90" rx="10" fill="#fed7aa"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">NK-TFW MAC table</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">inside: 0a0a, 1414</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">outside: 0101, fafa</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">aging 5 min</text>
<rect x="510" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">R-GW</text><text x="565" y="116" text-anchor="middle" class="svg-muted" font-size="12">5254.0010.0101</text>
<line x1="130" y1="102" x2="240" y2="102" stroke="#64748b" stroke-width="2"/><line x1="400" y1="102" x2="510" y2="102" stroke="#64748b" stroke-width="2"/>
<text x="185" y="92" text-anchor="middle" class="svg-muted" font-size="12">inside</text><text x="455" y="92" text-anchor="middle" class="svg-muted" font-size="12">outside</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">unknown destination MAC: pehla packet drop,</text>
<text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">BVI 10.0.1.5 se ARP ya ping, seekho, phir forward</text>
</svg><p class="cap">Firewall seekhta hai ki har MAC kahan rehta hai aur unknown ko flood karne ke bajaye discover karta hai.</p></div>

<h3>MAC address table padhna (lab task 5)</h3>
<p>PC1 ke 10.0.1.1 ping karne ke baad table dikhati hai ki har host kis taraf hai. R-GW Gi0/0 ke aage hai, isliye uska MAC <code>outside</code> par seekha jaata hai.</p>
<pre class="out">NK-TFW# show mac-address-table
interface                   mac  address          type      Age(min)   bridge-group
---------------------------------------------------------------------------------------
inside                      5254.0010.0a0a        dynamic   4          1
inside                      5254.0010.1414        dynamic   5          1
<span class="hl">outside                     5254.0010.0101        dynamic   5          1</span>
outside                     5254.0010.fafa        dynamic   3          1</pre>
<p>Kaam ke knobs:</p>
<pre class="code"><span class="c">! dynamic entries default mein 5 minute baad age out hoti hain</span>
mac-address-table aging-time 10
<span class="c">! critical MAC ko ek interface par pin karo</span>
mac-address-table static outside 5254.0010.0101
<span class="c">! interface par learning band karo (tab sirf static entries chalti hain)</span>
mac-learn inside disable</pre>

<h3>ARP inspection</h3>
<p>ARP mein koi authentication nahi hai: koi bhi host keh sakta hai "10.0.1.1 mere MAC par hai", aur neighbours maan lete hain. Hostile ya shared segment mein isse ek host doosre hosts ke traffic mein ghus sakta hai. Transparent firewall bilkul ARP path mein baithta hai, isliye woh ARP ko trusted bindings ki list se check kar sakta hai. <b>ARP inspection</b> default mein off hai. Jab aap ise interface par enable karte ho, wahan aane wala har ARP packet <b>static ARP entries</b> se compare hota hai:</p>
<ul>
<li>IP, MAC aur interface teeno static entry se match: ARP pass hota hai.</li>
<li>IP match karta hai lekin MAC ya interface nahi: ARP <b>drop</b> aur log hota hai.</li>
<li>IP static table mein nahi hai: firewall ya to ARP ko <b>flood</b> karta hai (default) ya <code>no-flood</code> ke saath drop karta hai.</li>
</ul>
<pre class="code"><span class="c">! router side par gateway ki binding protect karo</span>
arp outside 10.0.1.1 5254.0010.0101
arp-inspection outside enable no-flood
arp-inspection inside enable</pre>
<pre class="out">NK-TFW# show arp-inspection
interface                arp-inspection  miss
----------------------------------------------------
inside                   enabled         flood
<span class="hl">outside                  enabled         no-flood</span>

NK-TFW# show logging | include 322002
%ASA-3-322002: ARP inspection check failed for arp response received from host 5254.0010.9999 on interface inside. This host is advertising MAC Address 5254.0010.9999 for IP Address 10.0.1.1, which is statically bound to MAC Address 5254.0010.0101</pre>

<div class="eg"><p><b>Worked example.</b> Outside par <code>no-flood</code> aur sirf ek static entry (10.0.1.1) ke saath, outside par aane wale MON (10.0.1.250) ke ARP ki koi static entry nahi hai aur woh drop hota hai, isliye MON ab firewall ke through kuch bhi nahi pahunch paata. Ya to <code>arp outside 10.0.1.250 &lt;MON MAC&gt;</code> jodo, ya unknown entries ke liye default <code>flood</code> rakho aur static entries sirf un addresses ke liye use karo jinhe protect karna zaroori hai, jaise gateway.</p></div>

<div class="warn"><p><b>Common galti.</b> Adhoori static table ke saath <code>arp-inspection ... no-flood</code> enable karna. Jis host ki entry nahi hai uski connectivity chupchaap chali jaati hai. <code>flood</code> aur gateways aur servers ki static entries se shuru karo, phir tight karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Transparent mode mein ARP dono directions mein <b>bina</b> ACL ke pass hota hai. Use control karne ka tool ARP inspection hai, EtherType ACL nahi. Aur firewall unknown unicast flood nahi karta; woh BVI se ARP ya ping karke location discover karta hai.</p></div>

<div class="scn"><h4>Gateway jo khisak gaya</h4><p>Ek operations team ne dekha ki lab segment ke users ke sessions har kuch minute mein toot jaate the. Transparent firewall par <code>show mac-address-table</code> ne dikhaya ki gateway ka IP traffic <i>inside</i> interface ke ek MAC par ja raha tha, jabki asli router outside par tha. Ek misconfigured test VM 10.0.1.1 ke liye ARP ka jawab de raha tha. Team ne VM hataya, gateway ki static ARP entry jodi aur inside par ARP inspection enable kiya; syslog 322002 ne baad mein usi template se bana doosra VM pakda.</p><p><b>Seekh:</b> transparent firewall ki MAC table aur ARP inspection ARP-based impersonation pakadne aur rokne ke behtareen tools hain.</p></div>

<div class="iv"><p class="q">"Transparent firewall unknown destination MAC wale frame ke saath kya karta hai?"</p><p>Woh switch ki tarah flood nahi karta. Woh packet drop karta hai aur agar destination IP bridged subnet mein hai to BVI se ARP request bhejta hai, ya remote hai to destination ki taraf ping bhejta hai, taaki reply dikha de ki kaunsa interface wahan le jaata hai. Phir woh MAC seekhta hai aur baad ke packets forward karta hai. Isiliye BVI address zaroori hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall har interface aur har bridge group ke hisaab se source MACs seekhta hai; entries default mein 5 minute baad age out hoti hain.</li>
<li>Unknown destination MACs BVI se ARP ya ping karke discover hote hain, flood nahi hote.</li>
<li><code>show mac-address-table</code> dikhata hai ki har MAC kis nameif par seekha gaya.</li>
<li>ARP default se pass hota hai; ARP inspection use static <code>arp</code> entries se check karta hai.</li>
<li>Unmatched ARP default mein flood hota hai ya <code>no-flood</code> se drop; mismatches drop hokar 322002 log hote hain.</li>
</ul></div>
`}};export{e as default};