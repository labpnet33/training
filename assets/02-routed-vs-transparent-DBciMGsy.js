var e={id:`routed-vs-transparent`,h:{en:`Design choice: routed or transparent mode`,hi:`Design choice: routed ya transparent mode`},body:{en:`
<p>Think of a toll plaza on a highway. In one design the highway ends at the plaza, and every driver must take a new exit number and follow new signs: that is a <b>routed</b> firewall, a new junction in the road. In the other design the plaza is built <i>across</i> the existing lanes: the signs, the lane numbers and the destinations stay the same, but every car still has to slow down and be checked. That is a <b>transparent</b> firewall. Both check every car. The difference is whether the road map changes.</p>

<h3>Routed mode (the default)</h3>
<p>In <b>routed mode</b> the firewall is a layer 3 hop. Every data interface has a <code>nameif</code>, a security level and its <b>own IP subnet</b>. Hosts use the firewall (or a router behind it) as their gateway, and the firewall routes between subnets using static routes or a dynamic routing protocol. This is the mode for the internet edge, because it supports everything: interface PAT, site-to-site and remote access VPN termination, DHCP server and relay, OSPF, EIGRP, BGP, multicast routing and so on. You built routed ASAs in sec-asa-basics.</p>

<h3>Transparent mode</h3>
<p>In <b>transparent mode</b> the firewall behaves like a <b>layer 2 bridge</b>. Its data interfaces have <b>no IP address</b>. Instead they are grouped into a <b>bridge group</b>: all members of one bridge group sit in the <b>same IP subnet</b>, and the firewall forwards frames between them by <b>MAC address</b>. Each bridge group has one <b>BVI</b> (bridge virtual interface) that holds a single management address in that subnet. Hosts keep their existing gateway, which is the router on the other side of the firewall. Traceroute does not show the firewall at all, because it never decrements the TTL.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Routed versus transparent addressing">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="14">Routed: three subnets</text>
<rect x="20" y="35" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text>
<rect x="265" y="35" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA</text>
<rect x="510" y="35" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="62" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<line x1="130" y1="57" x2="265" y2="57" stroke="#64748b" stroke-width="2"/><line x1="375" y1="57" x2="510" y2="57" stroke="#64748b" stroke-width="2"/>
<text x="197" y="100" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.0/24 (gw .1 = ASA)</text>
<text x="442" y="100" text-anchor="middle" class="svg-accent" font-size="12">10.0.9.0/30 transit</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">Transparent: one subnet, bridged</text>
<rect x="20" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="207" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text>
<rect x="265" y="180" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">ASA (BG 1)</text><text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="12">BVI1 10.0.1.5</text>
<rect x="510" y="180" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="207" text-anchor="middle" class="svg-ink" font-size="13">R-GW 10.0.1.1</text>
<line x1="130" y1="202" x2="265" y2="202" stroke="#64748b" stroke-width="2"/><line x1="375" y1="202" x2="510" y2="202" stroke="#64748b" stroke-width="2"/>
<text x="320" y="260" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.0/24 on both sides, PC gateway stays 10.0.1.1</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">members have no IP; forwarding by MAC</text>
</svg><p class="cap">Routed mode adds subnets and a hop; transparent mode keeps one subnet and hides the hop.</p></div>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th></th><th>Routed</th><th>Transparent</th></tr>
<tr><td>Layer</td><td>3 (router hop)</td><td>2 (bridge, "bump in the wire")</td></tr>
<tr><td>Interface addressing</td><td>one subnet per interface</td><td>members have none; one BVI address per bridge group</td></tr>
<tr><td>Hosts' gateway</td><td>firewall or a router behind it</td><td>unchanged: the router on the far side</td></tr>
<tr><td>Security levels, ACLs, inspection</td><td>yes</td><td>yes, identical rules</td></tr>
<tr><td>NAT</td><td>yes, including interface PAT</td><td>yes, but no interface PAT (members have no IP)</td></tr>
<tr><td>VPN termination</td><td>yes</td><td>only for management traffic to the box</td></tr>
<tr><td>Dynamic routing, multicast routing, DHCP relay</td><td>yes</td><td>no (routing protocols can pass <i>through</i> with an ACL)</td></tr>
<tr><td>Non-IP traffic (BPDU, IS-IS, MPLS)</td><td>never passes</td><td>can pass with an EtherType ACL</td></tr>
<tr><td>Broadcast/multicast IP (DHCP, OSPF hellos)</td><td>blocked even if an ACL permits it</td><td>passes if an extended ACL permits it</td></tr></table>

<h3>Why you would pick transparent</h3>
<ul>
<li><b>No re-addressing</b>: insert security into a live subnet without touching hosts, routers or DHCP.</li>
<li><b>Protect a server segment in place</b>: put a firewall between servers and their gateway while keeping the same VLAN and subnet.</li>
<li><b>Let two routers keep talking</b>: OSPF or BGP neighbours can form an adjacency <i>through</i> a transparent firewall, which inspects the traffic between them.</li>
<li><b>Pass non-IP protocols</b> that a router would drop.</li>
<li><b>Stealth</b>: no IP on the data path, so nothing to attack at layer 3 except the BVI, which you protect with management access rules.</li>
</ul>

<h3>How the mode is set</h3>
<p>Firewall mode is a <b>global</b> setting. On the ASA the command is <code>firewall transparent</code> (and <code>no firewall transparent</code> to return to routed). <b>Changing the mode clears the running configuration</b>, so it is the very first command of a build. In multiple context mode, each context can have its own mode. On Threat Defense you choose the mode during initial setup; to change it later you use <code>configure firewall transparent</code> or <code>configure firewall routed</code> on the device CLI, which also erases the configuration, and a managed device must be removed from the Management Center first. Device Manager (FDM) supports routed mode only.</p>
<pre class="code"><span class="c">! lab 1, first two commands on ASA1</span>
ciscoasa(config)# firewall transparent
ciscoasa(config)# hostname NK-TFW</pre>
<pre class="out">NK-TFW# show firewall
<span class="hl">Firewall mode: Transparent</span></pre>

<div class="eg"><p><b>Worked example.</b> From PC1 (10.0.1.10) run a traceroute to INET 8.8.8.8 in both designs. With a routed ASA whose inside is 10.0.1.1 and outside is 10.0.9.1, you see hop 1 = 10.0.1.1 (ASA), hop 2 = 10.0.9.2 (router), hop 3 = 203.0.113.1 (ISP). With the transparent ASA in lab 1 you see hop 1 = 10.0.1.1 (R-GW), hop 2 = 203.0.113.1 (ISP), hop 3 = 8.8.8.8. The firewall is not listed, but every packet still passed through it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring interfaces and ACLs first and then typing <code>firewall transparent</code>. Everything you configured disappears. Save a backup before changing mode on a box that already has a configuration.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Transparent firewalls cannot do NAT" is false on current ASA and Threat Defense; NAT works, only interface PAT does not. Also, a transparent firewall still needs an IP (the BVI), so "it has no IP address at all" is false.</p></div>

<div class="scn"><h4>OSPF through the firewall</h4><p>A data centre team needed to inspect traffic between a WAN router and a core router that were OSPF neighbours on 10.40.0.0/29. A routed firewall would have split the subnet and forced the firewall into the OSPF design. Instead they deployed a transparent firewall and added <code>access-list OUT_IN extended permit ospf any any</code> on the outside and a matching entry on the inside, because OSPF hellos to 224.0.0.5 come from both directions. The adjacency formed through the firewall and every data flow was inspected.</p><p><b>Lesson:</b> transparent mode lets routing protocols pass through the firewall as long as the ACLs allow them both ways.</p></div>

<div class="iv"><p class="q">"What can a routed firewall do that a transparent one cannot, and the other way round?"</p><p>Routed can terminate VPNs for through traffic, run dynamic and multicast routing, act as DHCP relay and use interface PAT. Transparent can pass non-IP traffic with EtherType ACLs, pass broadcast and multicast IP such as DHCP and routing protocol hellos with extended ACLs, and be inserted without re-addressing. Both enforce the same security levels, ACLs and inspections.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed = layer 3 hop with a subnet per interface; transparent = layer 2 bridge with one subnet per bridge group.</li>
<li>Transparent keeps hosts' gateways, hides from traceroute and still enforces full policy.</li>
<li>Transparent cannot terminate through-traffic VPNs, run dynamic routing or relay DHCP, but can pass non-IP and multicast.</li>
<li>Changing firewall mode erases the configuration on both ASA and Threat Defense.</li>
<li><code>show firewall</code> shows the current mode.</li>
</ul></div>
`,hi:`
<p>Highway par ek toll plaza socho. Ek design mein highway plaza par khatam hota hai, aur har driver ko naya exit number lena padta hai aur naye signs follow karne padte hain: yeh <b>routed</b> firewall hai, sadak mein ek naya junction. Doosre design mein plaza existing lanes ke <i>aar-paar</i> banaya jaata hai: signs, lane numbers aur destinations same rehte hain, lekin har car ko dheere hokar check hona padta hai. Yeh <b>transparent</b> firewall hai. Dono har car check karte hain. Fark sirf itna hai ki road map badalta hai ya nahi.</p>

<h3>Routed mode (default)</h3>
<p><b>Routed mode</b> mein firewall ek layer 3 hop hai. Har data interface ka <code>nameif</code>, security level aur <b>apna IP subnet</b> hota hai. Hosts firewall (ya uske peeche ke router) ko gateway use karte hain, aur firewall static routes ya dynamic routing protocol se subnets ke beech route karta hai. Internet edge ke liye yahi mode hai, kyunki yeh sab kuch support karta hai: interface PAT, site-to-site aur remote access VPN termination, DHCP server aur relay, OSPF, EIGRP, BGP, multicast routing waghera. Aapne sec-asa-basics mein routed ASAs banaye the.</p>

<h3>Transparent mode</h3>
<p><b>Transparent mode</b> mein firewall ek <b>layer 2 bridge</b> ki tarah behave karta hai. Uske data interfaces par <b>koi IP address nahi</b> hota. Iske bajaye woh ek <b>bridge group</b> mein group kiye jaate hain: ek bridge group ke saare members <b>same IP subnet</b> mein hote hain, aur firewall unke beech frames ko <b>MAC address</b> se forward karta hai. Har bridge group ka ek <b>BVI</b> (bridge virtual interface) hota hai jo us subnet mein ek management address rakhta hai. Hosts apna existing gateway rakhte hain, jo firewall ke doosri taraf ka router hai. Traceroute mein firewall bilkul nahi dikhta, kyunki woh kabhi TTL kam nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Routed banaam transparent addressing">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="14">Routed: teen subnets</text>
<rect x="20" y="35" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text>
<rect x="265" y="35" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA</text>
<rect x="510" y="35" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="62" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<line x1="130" y1="57" x2="265" y2="57" stroke="#64748b" stroke-width="2"/><line x1="375" y1="57" x2="510" y2="57" stroke="#64748b" stroke-width="2"/>
<text x="197" y="100" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.0/24 (gw .1 = ASA)</text>
<text x="442" y="100" text-anchor="middle" class="svg-accent" font-size="12">10.0.9.0/30 transit</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">Transparent: ek subnet, bridged</text>
<rect x="20" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="207" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text>
<rect x="265" y="180" width="110" height="44" rx="8" fill="#fed7aa"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">ASA (BG 1)</text><text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="12">BVI1 10.0.1.5</text>
<rect x="510" y="180" width="110" height="44" rx="8" fill="#bae6fd"/><text x="565" y="207" text-anchor="middle" class="svg-ink" font-size="13">R-GW 10.0.1.1</text>
<line x1="130" y1="202" x2="265" y2="202" stroke="#64748b" stroke-width="2"/><line x1="375" y1="202" x2="510" y2="202" stroke="#64748b" stroke-width="2"/>
<text x="320" y="260" text-anchor="middle" class="svg-accent" font-size="12">dono taraf 10.0.1.0/24, PC ka gateway 10.0.1.1 hi</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">members par IP nahi; forwarding MAC se</text>
</svg><p class="cap">Routed mode subnets aur ek hop jodta hai; transparent mode ek subnet rakhta hai aur hop chhupata hai.</p></div>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th></th><th>Routed</th><th>Transparent</th></tr>
<tr><td>Layer</td><td>3 (router hop)</td><td>2 (bridge, "bump in the wire")</td></tr>
<tr><td>Interface addressing</td><td>har interface ka ek subnet</td><td>members par nahi; har bridge group ka ek BVI address</td></tr>
<tr><td>Hosts ka gateway</td><td>firewall ya uske peeche ka router</td><td>unchanged: doosri taraf ka router</td></tr>
<tr><td>Security levels, ACLs, inspection</td><td>haan</td><td>haan, bilkul same rules</td></tr>
<tr><td>NAT</td><td>haan, interface PAT samet</td><td>haan, lekin interface PAT nahi (members par IP nahi)</td></tr>
<tr><td>VPN termination</td><td>haan</td><td>sirf box ke management traffic ke liye</td></tr>
<tr><td>Dynamic routing, multicast routing, DHCP relay</td><td>haan</td><td>nahi (routing protocols ACL ke saath <i>through</i> pass ho sakte hain)</td></tr>
<tr><td>Non-IP traffic (BPDU, IS-IS, MPLS)</td><td>kabhi pass nahi hota</td><td>EtherType ACL ke saath pass ho sakta hai</td></tr>
<tr><td>Broadcast/multicast IP (DHCP, OSPF hellos)</td><td>ACL permit kare tab bhi blocked</td><td>extended ACL permit kare to pass hota hai</td></tr></table>

<h3>Transparent kyun chunoge</h3>
<ul>
<li><b>Koi re-addressing nahi</b>: hosts, routers ya DHCP chhue bina live subnet mein security daalo.</li>
<li><b>Server segment ko wahin protect karo</b>: same VLAN aur subnet rakhte hue servers aur unke gateway ke beech firewall lagao.</li>
<li><b>Do routers ko baat karne do</b>: OSPF ya BGP neighbours transparent firewall ke <i>through</i> adjacency bana sakte hain, aur firewall unke beech ka traffic inspect karta hai.</li>
<li><b>Non-IP protocols pass karo</b> jo router drop kar deta.</li>
<li><b>Stealth</b>: data path par koi IP nahi, isliye layer 3 par attack karne ko kuch nahi siwaay BVI ke, jise aap management access rules se protect karte ho.</li>
</ul>

<h3>Mode kaise set hota hai</h3>
<p>Firewall mode ek <b>global</b> setting hai. ASA par command <code>firewall transparent</code> hai (aur routed par wapas jaane ke liye <code>no firewall transparent</code>). <b>Mode badalne se running configuration clear ho jaati hai</b>, isliye yeh build ki sabse pehli command hai. Multiple context mode mein har context ka apna mode ho sakta hai. Threat Defense par mode initial setup mein chuna jaata hai; baad mein badalne ke liye device CLI par <code>configure firewall transparent</code> ya <code>configure firewall routed</code> use hota hai, jo configuration bhi mita deta hai, aur managed device ko pehle Management Center se hatana padta hai. Device Manager (FDM) sirf routed mode support karta hai.</p>
<pre class="code"><span class="c">! lab 1, ASA1 par pehli do commands</span>
ciscoasa(config)# firewall transparent
ciscoasa(config)# hostname NK-TFW</pre>
<pre class="out">NK-TFW# show firewall
<span class="hl">Firewall mode: Transparent</span></pre>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) se INET 8.8.8.8 tak dono designs mein traceroute chalao. Routed ASA jiska inside 10.0.1.1 aur outside 10.0.9.1 hai, usme aap dekhoge hop 1 = 10.0.1.1 (ASA), hop 2 = 10.0.9.2 (router), hop 3 = 203.0.113.1 (ISP). Lab 1 ke transparent ASA ke saath aap dekhoge hop 1 = 10.0.1.1 (R-GW), hop 2 = 203.0.113.1 (ISP), hop 3 = 8.8.8.8. Firewall list mein nahi hai, lekin har packet phir bhi usi se guzra.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle interfaces aur ACLs configure karna aur phir <code>firewall transparent</code> type karna. Jo kuch configure kiya tha sab gayab ho jaata hai. Jis box par pehle se configuration hai, uska mode badalne se pehle backup save karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Transparent firewalls NAT nahi kar sakte" current ASA aur Threat Defense par galat hai; NAT chalta hai, sirf interface PAT nahi chalta. Aur transparent firewall ko bhi ek IP (BVI) chahiye, isliye "iska koi IP address hi nahi hota" galat hai.</p></div>

<div class="scn"><h4>Firewall ke through OSPF</h4><p>Ek data centre team ko ek WAN router aur ek core router ke beech ka traffic inspect karna tha jo 10.40.0.0/29 par OSPF neighbours the. Routed firewall subnet ko baant deta aur firewall ko OSPF design mein ghusa deta. Iske bajaye unhone transparent firewall deploy kiya aur outside par <code>access-list OUT_IN extended permit ospf any any</code> aur inside par matching entry jodi, kyunki 224.0.0.5 ke OSPF hellos dono directions se aate hain. Adjacency firewall ke through bani aur har data flow inspect hua.</p><p><b>Seekh:</b> transparent mode routing protocols ko firewall ke through pass hone deta hai, bas ACLs unhe dono taraf allow karein.</p></div>

<div class="iv"><p class="q">"Routed firewall kya kar sakta hai jo transparent nahi kar sakta, aur ulta?"</p><p>Routed through traffic ke liye VPNs terminate kar sakta hai, dynamic aur multicast routing chala sakta hai, DHCP relay ban sakta hai aur interface PAT use kar sakta hai. Transparent EtherType ACLs se non-IP traffic pass kar sakta hai, extended ACLs se DHCP aur routing protocol hellos jaisa broadcast aur multicast IP pass kar sakta hai, aur bina re-addressing ke daala ja sakta hai. Dono same security levels, ACLs aur inspections enforce karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed = har interface par subnet wala layer 3 hop; transparent = har bridge group ka ek subnet wala layer 2 bridge.</li>
<li>Transparent hosts ke gateways rakhta hai, traceroute se chhupta hai aur phir bhi poori policy enforce karta hai.</li>
<li>Transparent through-traffic VPNs terminate nahi kar sakta, dynamic routing nahi chala sakta, DHCP relay nahi kar sakta, lekin non-IP aur multicast pass kar sakta hai.</li>
<li>Firewall mode badalne se ASA aur Threat Defense dono par configuration mit jaati hai.</li>
<li><code>show firewall</code> current mode dikhata hai.</li>
</ul></div>
`}};export{e as default};