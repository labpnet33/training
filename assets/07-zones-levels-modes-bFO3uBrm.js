var e={id:`zones-modes`,h:{en:`Zones, security levels and routed vs transparent mode`,hi:`Zones, security levels aur routed vs transparent mode`},body:{en:`
<p>An airport has areas of different trust: the public hall, the checked-in departure area, and the airside where only crew go. Moving from the public hall into departures needs a security check; moving the other way is easy. Firewalls divide a network in exactly the same way, into <b>zones</b> of different trust, and apply rules at the borders between them.</p>

<h3>The classic three zones</h3>
<ul>
<li><b>Inside:</b> users and internal servers. Highest trust.</li>
<li><b>Outside:</b> the internet. No trust.</li>
<li><b>DMZ (demilitarised zone):</b> servers that the internet must reach, such as a public web server. Medium trust. If a DMZ server is compromised, the attacker is still separated from the inside by the firewall policy.</li>
</ul>
<p>Real designs add more: a management zone, a partner zone, a guest zone, a zone per application tier. The principle stays the same: group things of the same trust, and control every path between groups.</p>

<h3>ASA security levels</h3>
<p>The ASA expresses trust as a <b>security level</b> from 0 (least trusted) to 100 (most trusted) on each interface. When you name an interface <code>inside</code>, the ASA sets level 100 automatically; any other name gets 0 until you change it. The default rules, with no ACL applied, are simple:</p>
<table class="cmp"><tr><th>Traffic direction</th><th>Default behaviour</th></tr>
<tr><td>Higher level to lower level (inside 100 to outside 0)</td><td>Allowed, and replies return through the connection table</td></tr>
<tr><td>Lower level to higher level (outside 0 to dmz 50)</td><td>Denied unless an ACL permits it</td></tr>
<tr><td>Same level to same level</td><td>Denied unless <code>same-security-traffic permit inter-interface</code></td></tr>
<tr><td>In and out of the same interface (hairpin)</td><td>Denied unless <code>same-security-traffic permit intra-interface</code></td></tr>
</table>
<p>Once you apply an ACL to an interface with <code>access-group</code>, the ACL replaces the security-level behaviour for traffic entering that interface, including an implicit deny at the end. Security levels are a starting point, not a policy.</p>
<pre class="code"><span class="c">! The lab ASA interfaces</span>
interface GigabitEthernet0/0
 nameif outside
 security-level 0
 ip address 203.0.113.2 255.255.255.248
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.0.2.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
<span class="hl">GigabitEthernet0/1       inside                   100</span>
GigabitEthernet0/2       dmz                       50</pre>

<h3>Zones on other Cisco firewalls</h3>
<p>The <b>IOS zone-based firewall</b> on routers uses named zones with no numbers: traffic between interfaces in the same zone is allowed, traffic between different zones is denied until you create a <b>zone-pair</b> with a policy that inspects, passes or drops it, and the router itself is the special <b>self</b> zone. <b>Secure Firewall Threat Defense</b> uses <b>security zones</b> as objects inside access control rules; there are no security levels, and every allowed path is an explicit rule. The idea is the same everywhere; only the syntax changes.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Routed vs transparent firewall">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Routed mode</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.0/24</text>
<rect x="125" y="36" width="70" height="44" rx="8" fill="#fed7aa"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA hop</text>
<rect x="210" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.0/29</text>
<line x1="110" y1="58" x2="125" y2="58" stroke="#64748b"/><line x1="195" y1="58" x2="210" y2="58" stroke="#64748b"/>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">two subnets, ASA is the gateway</text>
<text x="160" y="130" text-anchor="middle" class="svg-muted" font-size="12">NAT, routing, VPN, DHCP</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Transparent mode</text>
<rect x="340" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">hosts</text>
<rect x="445" y="36" width="70" height="44" rx="8" fill="#fed7aa"/><text x="480" y="56" text-anchor="middle" class="svg-ink" font-size="12">ASA</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="11">bump</text>
<rect x="530" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="580" y="63" text-anchor="middle" class="svg-ink" font-size="12">router</text>
<line x1="430" y1="58" x2="445" y2="58" stroke="#64748b"/><line x1="515" y1="58" x2="530" y2="58" stroke="#64748b"/>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">one subnet on both sides</text>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">bridge group + BVI for management</text>
<rect x="20" y="160" width="600" height="60" rx="8" fill="#e2e8f0"/>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Both modes: stateful inspection, ACLs, inspection engines</text>
<text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">transparent adds no IP hop, so hosts and routers need no changes</text>
</svg><p class="cap">Routed mode is a Layer 3 hop; transparent mode is a stateful Layer 2 "bump in the wire".</p></div>

<h3>Deployment modes: routed vs transparent</h3>
<p>In <b>routed mode</b> (the default) the ASA is a Layer 3 hop. Each interface has an IP address in a different subnet, hosts use the ASA (or a router behind it) as their gateway, and the ASA can do NAT, static and dynamic routing, DHCP and VPN termination. The lab ASA is in routed mode.</p>
<p>In <b>transparent mode</b> the ASA is a Layer 2 firewall, a <b>bump in the wire</b>. Its interfaces are placed in a <b>bridge group</b> and have no IP addresses; a <b>BVI</b> (bridge virtual interface) holds one management address in the same subnet. Hosts keep their existing gateway. It still does stateful inspection, ACLs and application inspection. You choose it when you must insert a firewall into an existing network without re-addressing anything.</p>
<pre class="code"><span class="c">! Transparent mode (changing mode erases the running configuration)</span>
firewall transparent
interface GigabitEthernet0/0
 nameif outside
 bridge-group 1
 security-level 0
interface GigabitEthernet0/1
 nameif inside
 bridge-group 1
 security-level 100
interface BVI1
 ip address 10.0.1.2 255.255.255.0
<span class="c">! Non-IP traffic such as BPDUs needs an EtherType ACL</span>
access-list L2-ALLOW ethertype permit bpdu</pre>
<p>Transparent-mode facts to remember: ARP passes (and can be inspected); non-IP traffic is dropped unless an <b>EtherType ACL</b> permits it; routing protocol packets can pass through if permitted, but the ASA does not take part in them. Threat Defense has the same routed and transparent modes plus IPS-only interface modes (inline sets and passive), covered in the sec-fw-deploy module.</p>

<div class="eg"><p><b>Worked example.</b> A hospital needs a firewall between its lab-equipment VLAN (10.20.5.0/24, gateway 10.20.5.1 on the core switch) and the core. Re-addressing 60 medical devices is not allowed. A transparent firewall is cabled between the access switch and the core, both interfaces in bridge-group 1, BVI 10.20.5.250. The devices keep gateway 10.20.5.1, and now every flow passes stateful inspection.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>firewall transparent</code> on a live box. Changing the firewall mode <b>clears the configuration</b>. Back up first, and plan the change in a window.</p></div>

<div class="exam"><p><b>Exam trap.</b> Two interfaces with the same security level cannot pass traffic by default, even if both are "trusted". And in transparent mode the BVI address is for management only; it is not the hosts' gateway.</p></div>

<div class="scn"><h4>The new DMZ that could not talk to the old DMZ</h4><p>An engineer added a second DMZ interface, dmz2, and gave it security level 50 to match dmz. Application servers in dmz2 could not reach the database in dmz, although the ACLs looked right. Syslog showed the traffic denied because both interfaces had the same level. The team chose to set dmz2 to level 40 and permit only the database port with an ACL, rather than enabling same-security traffic for everything.</p><p><b>Lesson:</b> equal security levels mean "no traffic" until you decide otherwise.</p></div>

<div class="iv"><p class="q">"When would you deploy a firewall in transparent mode?"</p><p>When you need to insert stateful inspection into an existing segment without re-addressing hosts or changing gateways: the firewall bridges two VLAN segments of the same subnet, with a BVI for management. It still enforces ACLs and inspection. Mention the trade-offs: no dynamic routing participation, EtherType ACLs for non-IP traffic, and that changing modes wipes the configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones group assets of equal trust; control every path between zones. Inside, outside, DMZ is the classic set.</li>
<li>ASA security levels: high to low allowed, low to high needs an ACL, equal levels blocked by default.</li>
<li>An applied ACL replaces the security-level default for that interface.</li>
<li>Routed mode is an L3 hop with NAT, routing and VPN; transparent is an L2 bump with a bridge group and BVI.</li>
<li>Changing firewall mode clears the configuration.</li>
</ul></div>
`,hi:`
<p>Airport mein alag trust wale areas hote hain: public hall, check-in ke baad wala departure area, aur airside jahan sirf crew jaata hai. Public hall se departures mein jaane ke liye security check chahiye; ulti taraf jaana aasaan hai. Firewalls network ko bilkul isi tarah alag trust wale <b>zones</b> mein baant-te hain, aur unke beech ki borders par rules lagate hain.</p>

<h3>Classic teen zones</h3>
<ul>
<li><b>Inside:</b> users aur internal servers. Sabse zyada trust.</li>
<li><b>Outside:</b> internet. Koi trust nahi.</li>
<li><b>DMZ (demilitarised zone):</b> woh servers jin tak internet ko pahunchna hai, jaise public web server. Medium trust. Agar DMZ server compromise ho jaaye, to attacker firewall policy ki wajah se inside se alag hi rehta hai.</li>
</ul>
<p>Real designs aur zones jodte hain: management zone, partner zone, guest zone, har application tier ke liye ek zone. Principle wahi rehta hai: same trust ki cheezon ko group karo, aur groups ke beech ke har raaste ko control karo.</p>

<h3>ASA security levels</h3>
<p>ASA trust ko har interface par 0 (sabse kam trusted) se 100 (sabse zyada trusted) tak ke <b>security level</b> se express karta hai. Jab aap interface ka naam <code>inside</code> rakhte ho, ASA apne aap level 100 set karta hai; kisi aur naam ko 0 milta hai jab tak aap badlo nahi. Default rules, bina koi ACL lagaye, simple hain:</p>
<table class="cmp"><tr><th>Traffic direction</th><th>Default behaviour</th></tr>
<tr><td>Higher level se lower level (inside 100 se outside 0)</td><td>Allowed, aur replies connection table se wapas aate hain</td></tr>
<tr><td>Lower level se higher level (outside 0 se dmz 50)</td><td>Denied jab tak ACL permit na kare</td></tr>
<tr><td>Same level se same level</td><td>Denied jab tak <code>same-security-traffic permit inter-interface</code> na ho</td></tr>
<tr><td>Ek hi interface se andar aur bahar (hairpin)</td><td>Denied jab tak <code>same-security-traffic permit intra-interface</code> na ho</td></tr>
</table>
<p>Jaise hi aap <code>access-group</code> se interface par ACL lagate ho, us interface mein aane wale traffic ke liye ACL security-level behaviour ki jagah le leta hai, end mein implicit deny ke saath. Security levels shuruaat hain, policy nahi.</p>
<pre class="code"><span class="c">! Lab ASA ke interfaces</span>
interface GigabitEthernet0/0
 nameif outside
 security-level 0
 ip address 203.0.113.2 255.255.255.248
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.0.2.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
<span class="hl">GigabitEthernet0/1       inside                   100</span>
GigabitEthernet0/2       dmz                       50</pre>

<h3>Doosre Cisco firewalls par zones</h3>
<p>Routers par <b>IOS zone-based firewall</b> bina numbers ke named zones use karta hai: same zone ke interfaces ke beech traffic allowed hai, alag zones ke beech denied hai jab tak aap aisa <b>zone-pair</b> na banao jiski policy use inspect, pass ya drop kare, aur router khud special <b>self</b> zone hai. <b>Secure Firewall Threat Defense</b> access control rules ke andar objects ki tarah <b>security zones</b> use karta hai; security levels nahi hote, aur har allowed raasta ek explicit rule hai. Idea har jagah same hai; sirf syntax badalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Routed vs transparent firewall">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Routed mode</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.0/24</text>
<rect x="125" y="36" width="70" height="44" rx="8" fill="#fed7aa"/><text x="160" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA hop</text>
<rect x="210" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.0/29</text>
<line x1="110" y1="58" x2="125" y2="58" stroke="#64748b"/><line x1="195" y1="58" x2="210" y2="58" stroke="#64748b"/>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">do subnets, ASA gateway hai</text>
<text x="160" y="130" text-anchor="middle" class="svg-muted" font-size="12">NAT, routing, VPN, DHCP</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Transparent mode</text>
<rect x="340" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">hosts</text>
<rect x="445" y="36" width="70" height="44" rx="8" fill="#fed7aa"/><text x="480" y="56" text-anchor="middle" class="svg-ink" font-size="12">ASA</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="11">bump</text>
<rect x="530" y="40" width="100" height="36" rx="8" fill="#bae6fd"/><text x="580" y="63" text-anchor="middle" class="svg-ink" font-size="12">router</text>
<line x1="430" y1="58" x2="445" y2="58" stroke="#64748b"/><line x1="515" y1="58" x2="530" y2="58" stroke="#64748b"/>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">dono taraf ek hi subnet</text>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">bridge group + management ke liye BVI</text>
<rect x="20" y="160" width="600" height="60" rx="8" fill="#e2e8f0"/>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Dono modes: stateful inspection, ACLs, inspection engines</text>
<text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">transparent koi IP hop nahi jodta, isliye hosts aur routers mein koi badlav nahi</text>
</svg><p class="cap">Routed mode ek Layer 3 hop hai; transparent mode ek stateful Layer 2 "bump in the wire" hai.</p></div>

<h3>Deployment modes: routed vs transparent</h3>
<p><b>Routed mode</b> (default) mein ASA ek Layer 3 hop hai. Har interface ka IP address alag subnet mein hota hai, hosts ASA (ya uske peeche ke router) ko gateway ki tarah use karte hain, aur ASA NAT, static aur dynamic routing, DHCP aur VPN termination kar sakta hai. Lab ASA routed mode mein hai.</p>
<p><b>Transparent mode</b> mein ASA ek Layer 2 firewall hai, ek <b>bump in the wire</b>. Uske interfaces ek <b>bridge group</b> mein rakhe jaate hain aur unke IP addresses nahi hote; ek <b>BVI</b> (bridge virtual interface) same subnet mein ek management address rakhta hai. Hosts apna purana gateway rakhte hain. Yeh phir bhi stateful inspection, ACLs aur application inspection karta hai. Aap ise tab chunte ho jab kuch bhi re-address kiye bina existing network mein firewall daalna ho.</p>
<pre class="code"><span class="c">! Transparent mode (mode badalne se running configuration mit jaati hai)</span>
firewall transparent
interface GigabitEthernet0/0
 nameif outside
 bridge-group 1
 security-level 0
interface GigabitEthernet0/1
 nameif inside
 bridge-group 1
 security-level 100
interface BVI1
 ip address 10.0.1.2 255.255.255.0
<span class="c">! BPDUs jaise non-IP traffic ko EtherType ACL chahiye</span>
access-list L2-ALLOW ethertype permit bpdu</pre>
<p>Transparent-mode ke yaad rakhne layak facts: ARP guzarta hai (aur inspect ho sakta hai); non-IP traffic drop hota hai jab tak <b>EtherType ACL</b> permit na kare; routing protocol packets permit hone par guzar sakte hain, lekin ASA unmein hissa nahi leta. Threat Defense mein bhi yahi routed aur transparent modes hain plus IPS-only interface modes (inline sets aur passive), jo sec-fw-deploy module mein cover hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital ko apne lab-equipment VLAN (10.20.5.0/24, core switch par gateway 10.20.5.1) aur core ke beech firewall chahiye. 60 medical devices ko re-address karna allowed nahi hai. Access switch aur core ke beech transparent firewall cable kiya jaata hai, dono interfaces bridge-group 1 mein, BVI 10.20.5.250. Devices gateway 10.20.5.1 hi rakhte hain, aur ab har flow stateful inspection se guzarta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Live box par <code>firewall transparent</code> chalana. Firewall mode badalne se <b>configuration clear ho jaati hai</b>. Pehle backup lo, aur change ko window mein plan karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Same security level wale do interfaces default mein traffic pass nahi kar sakte, chahe dono "trusted" hon. Aur transparent mode mein BVI address sirf management ke liye hai; woh hosts ka gateway nahi hai.</p></div>

<div class="scn"><h4>Naya DMZ jo purane DMZ se baat nahi kar pa raha tha</h4><p>Ek engineer ne doosra DMZ interface, dmz2, joda aur dmz se match karne ke liye use security level 50 diya. dmz2 ke application servers dmz ke database tak nahi pahunch paaye, jabki ACLs sahi lag rahe the. Syslog ne dikhaya ki traffic isliye deny ho raha tha kyunki dono interfaces ka level same tha. Team ne sab kuch ke liye same-security traffic enable karne ki jagah dmz2 ko level 40 par set kiya aur ACL se sirf database port permit kiya.</p><p><b>Seekh:</b> barabar security levels ka matlab "koi traffic nahi" jab tak aap kuch aur tay na karo.</p></div>

<div class="iv"><p class="q">"Aap firewall ko transparent mode mein kab deploy karoge?"</p><p>Jab hosts ko re-address kiye ya gateways badle bina existing segment mein stateful inspection daalna ho: firewall same subnet ke do VLAN segments ko bridge karta hai, management ke liye BVI ke saath. Yeh phir bhi ACLs aur inspection enforce karta hai. Trade-offs batao: dynamic routing mein hissa nahi, non-IP traffic ke liye EtherType ACLs, aur mode badalne se configuration mit jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones barabar trust ke assets ko group karte hain; zones ke beech ke har raaste ko control karo. Inside, outside, DMZ classic set hai.</li>
<li>ASA security levels: high se low allowed, low se high ko ACL chahiye, barabar levels default mein blocked.</li>
<li>Laga hua ACL us interface ke liye security-level default ki jagah le leta hai.</li>
<li>Routed mode NAT, routing aur VPN wala L3 hop hai; transparent bridge group aur BVI wala L2 bump hai.</li>
<li>Firewall mode badalne se configuration clear ho jaati hai.</li>
</ul></div>
`}};export{e as default};