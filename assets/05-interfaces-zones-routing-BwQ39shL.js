var e={id:`interfaces-zones`,h:{en:`Device management: interfaces, security zones and routing`,hi:`Device management: interfaces, security zones aur routing`},body:{en:`
<p>In a large office building, every door has a number (the physical interface), a sign that says what is behind it (the logical name) and a coloured badge zone: green for staff floors, yellow for the visitor lounge, red for the street. The security rulebook never says "door 0/1"; it says "from green to red, allow". That is the idea of <b>security zones</b>: rules are written between groups of interfaces, so you can add doors without rewriting the rulebook.</p>

<h3>Three names for every interface</h3>
<dl class="terms">
<dt>Physical name</dt><dd>The hardware port, for example GigabitEthernet0/1. Fixed by the platform.</dd>
<dt>Logical name</dt><dd>The <b>nameif</b> you know from the ASA: inside, outside, dmz. LINA uses it in routes, NAT, <code>packet-tracer</code> and captures. An interface without a logical name passes no traffic.</dd>
<dt>Security zone</dt><dd>A group of interfaces that the access control policy (and the NAT policy) can match. A zone is an object, so the same zone, for example INSIDE, can contain interfaces from many devices. Each interface belongs to at most one security zone.</dd>
</dl>
<p>Threat Defense has no security levels. Traffic between zones, and between interfaces in the same zone, is decided only by the access control policy. With the lab default action Block All Traffic, nothing passes until you write a rule.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Interfaces, names and zones on NK-FTD">
<rect x="230" y="70" width="180" height="90" rx="10" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="15">NK-FTD</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">no security levels</text>
<rect x="10" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone INSIDE</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 inside 10.0.1.1/24</text>
<rect x="440" y="20" width="190" height="56" rx="8" fill="#bae6fd"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone OUTSIDE</text><text x="535" y="60" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 outside 203.0.113.2/29</text>
<rect x="225" y="180" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="13">Zone DMZ</text><text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 dmz 10.0.2.1/24</text>
<line x1="200" y1="60" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="440" y1="60" x2="410" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="160" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">default route</text><text x="535" y="126" text-anchor="middle" class="svg-muted" font-size="12">via 203.0.113.1</text>
</svg><p class="cap">Each lab interface has a physical name, a logical name, an address and a zone.</p></div>

<h3>Configuring an interface</h3>
<p>Lab GUI: <b>Devices → Interfaces</b>, select the interface, <b>Edit</b>. The dialog <i>Edit Physical Interface</i> has Name (logical name), Security Zone, IPv4 Address in a.b.c.d/len form, and Enabled. On a real Management Center the path is <b>Devices → Device Management</b>, edit the device, <b>Interfaces</b> tab, edit the interface; the General tab holds Name, Enabled and Security Zone, and the IPv4 tab the address. Security zones are created in <b>Objects → Object Management → Interface</b>, or directly from the interface dialog.</p>
<p>The lab device is already built like this:</p>
<table class="cmp"><tr><th>Interface</th><th>Logical name</th><th>Zone</th><th>Address</th></tr>
<tr><td>GigabitEthernet0/0</td><td>outside</td><td>OUTSIDE</td><td>203.0.113.2/29</td></tr>
<tr><td>GigabitEthernet0/1</td><td>inside</td><td>INSIDE</td><td>10.0.1.1/24</td></tr>
<tr><td>GigabitEthernet0/2</td><td>dmz</td><td>DMZ</td><td>10.0.2.1/24</td></tr></table>

<p>Other interface types you will meet: subinterfaces (VLAN tagging), EtherChannels, bridge groups with a BVI for transparent or IRB designs, inline sets and passive interfaces for IPS-only deployments, and virtual tunnel interfaces for route-based VPN. The separate <b>management interface</b> carries the sftunnel and never forwards user traffic. Transparent mode and inline sets were covered in the firewall deployment module.</p>

<h3>Routing basics</h3>
<p>LINA routes exactly like the ASA: connected and local routes for every named interface, plus static routes and dynamic routing (OSPF, BGP and more) configured in the Management Center. Lab GUI: <b>Devices → Routing → Add Route</b> with Interface, Network and Gateway. Real Management Center: edit the device, <b>Routing → Static Route → Add Route</b>, where you can also attach a route-tracking SLA monitor. The lab default route is 0.0.0.0/0 via 203.0.113.1 on outside.</p>

<pre class="out">&gt; show route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        10.0.2.0 255.255.255.0 is directly connected, dmz
L        10.0.2.1 255.255.255.255 is directly connected, dmz
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside

&gt; show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
<span class="hl">GigabitEthernet0/1       inside                     0</span>
GigabitEthernet0/2       dmz                        0</pre>
<p>Every security level shows 0: on Threat Defense the level plays no role, the zones and rules do. Use <code>show interface ip brief</code> to confirm that interfaces are up with the right addresses.</p>

<div class="eg"><p><b>Worked example.</b> The company adds a second inside VLAN, 10.0.3.0/24 for printers, on subinterface GigabitEthernet0/1.30 with logical name printers. If the engineer puts it in zone INSIDE, the existing Inside-Out rule immediately applies to printers too. If printers must not browse the internet, create a new zone PRINTERS instead and write rules for it. The zone choice is a policy decision, not cosmetics.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating an interface address and zone but forgetting the logical name, or leaving the interface disabled. Without a name LINA ignores it. A second classic: a route pointing to a gateway that is not in any connected subnet; it will never be installed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Interface changes are device configuration and also need Deploy. Zones are matched by access control and NAT rules; an interface can be in only one security zone, while interface groups (used for NAT and some policies) may overlap.</p></div>

<div class="scn"><h4>The new VLAN that browsed too much</h4><p>A guest Wi-Fi VLAN was added to a branch firewall and, to save time, placed in zone INSIDE. Within a day the guests could reach the internal print server, because a rule allowed INSIDE to INSIDE for printing. The fix was a new zone GUEST with its own rule allowing only HTTP, HTTPS and DNS to OUTSIDE, followed by a deploy.</p><p><b>Lesson:</b> a zone is a trust boundary; never put a different class of users in an existing zone just because it is convenient.</p></div>

<div class="iv"><p class="q">"How do security zones on Threat Defense differ from ASA security levels?"</p><p>Security levels gave implicit permits from high to low; zones give nothing by default. Every flow between zones, or within one zone, is decided by the access control policy and its default action. Zones are objects that can span devices, an interface belongs to one zone, and rules stay readable as you add interfaces.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each interface has a physical name, a logical name (nameif), an address and a security zone.</li>
<li>No security levels: the access control policy decides everything, including same-zone traffic.</li>
<li>Lab paths: Devices → Interfaces → Edit; Devices → Routing → Add Route.</li>
<li>Verify with <code>show nameif</code>, <code>show interface ip brief</code> and <code>show route</code>.</li>
<li>Interface and routing changes take effect only after Deploy.</li>
</ul></div>
`,hi:`
<p>Ek badi office building mein har darwaze ka ek number hota hai (physical interface), ek sign jo batata hai uske peeche kya hai (logical name) aur ek rangeen badge zone: staff floors ke liye hara, visitor lounge ke liye peela, street ke liye laal. Security rulebook kabhi "door 0/1" nahi kehti; woh kehti hai "hare se laal tak, allow". Yahi <b>security zones</b> ka idea hai: rules interfaces ke groups ke beech likhi jaati hain, taaki aap rulebook dobara likhe bina naye darwaze jod sako.</p>

<h3>Har interface ke teen naam</h3>
<dl class="terms">
<dt>Physical name</dt><dd>Hardware port, jaise GigabitEthernet0/1. Platform se fixed.</dd>
<dt>Logical name</dt><dd>ASA wala <b>nameif</b> jo aap jaante ho: inside, outside, dmz. LINA ise routes, NAT, <code>packet-tracer</code> aur captures mein use karta hai. Bina logical name wala interface koi traffic pass nahi karta.</dd>
<dt>Security zone</dt><dd>Interfaces ka group jise access control policy (aur NAT policy) match kar sakti hai. Zone ek object hai, isliye same zone, jaise INSIDE, kai devices ke interfaces rakh sakta hai. Har interface zyada se zyada ek security zone mein hota hai.</dd>
</dl>
<p>Threat Defense mein security levels nahi hain. Zones ke beech, aur same zone ke interfaces ke beech ka traffic sirf access control policy decide karti hai. Lab ke default action Block All Traffic ke saath, jab tak aap rule nahi likhte kuch pass nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Interfaces, names and zones on NK-FTD">
<rect x="230" y="70" width="180" height="90" rx="10" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="15">NK-FTD</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">koi security levels nahi</text>
<rect x="10" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone INSIDE</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 inside 10.0.1.1/24</text>
<rect x="440" y="20" width="190" height="56" rx="8" fill="#bae6fd"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone OUTSIDE</text><text x="535" y="60" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 outside 203.0.113.2/29</text>
<rect x="225" y="180" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="13">Zone DMZ</text><text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 dmz 10.0.2.1/24</text>
<line x1="200" y1="60" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="440" y1="60" x2="410" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="160" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">default route</text><text x="535" y="126" text-anchor="middle" class="svg-muted" font-size="12">via 203.0.113.1</text>
</svg><p class="cap">Har lab interface ka ek physical name, ek logical name, ek address aur ek zone hai.</p></div>

<h3>Interface configure karna</h3>
<p>Lab GUI: <b>Devices → Interfaces</b>, interface select karo, <b>Edit</b>. Dialog <i>Edit Physical Interface</i> mein Name (logical name), Security Zone, a.b.c.d/len form mein IPv4 Address, aur Enabled hai. Real Management Center par path hai <b>Devices → Device Management</b>, device edit karo, <b>Interfaces</b> tab, interface edit karo; General tab mein Name, Enabled aur Security Zone hote hain, aur IPv4 tab mein address. Security zones <b>Objects → Object Management → Interface</b> mein bante hain, ya seedhe interface dialog se.</p>
<p>Lab device pehle se aise bana hai:</p>
<table class="cmp"><tr><th>Interface</th><th>Logical name</th><th>Zone</th><th>Address</th></tr>
<tr><td>GigabitEthernet0/0</td><td>outside</td><td>OUTSIDE</td><td>203.0.113.2/29</td></tr>
<tr><td>GigabitEthernet0/1</td><td>inside</td><td>INSIDE</td><td>10.0.1.1/24</td></tr>
<tr><td>GigabitEthernet0/2</td><td>dmz</td><td>DMZ</td><td>10.0.2.1/24</td></tr></table>

<p>Doosre interface types jo aapko milenge: subinterfaces (VLAN tagging), EtherChannels, transparent ya IRB designs ke liye BVI wale bridge groups, IPS-only deployments ke liye inline sets aur passive interfaces, aur route-based VPN ke liye virtual tunnel interfaces. Alag <b>management interface</b> sftunnel le jaata hai aur kabhi user traffic forward nahi karta. Transparent mode aur inline sets firewall deployment module mein cover hue the.</p>

<h3>Routing basics</h3>
<p>LINA bilkul ASA ki tarah route karta hai: har named interface ke liye connected aur local routes, plus Management Center mein configure kiye static routes aur dynamic routing (OSPF, BGP aur aur bhi). Lab GUI: <b>Devices → Routing → Add Route</b>, Interface, Network aur Gateway ke saath. Real Management Center: device edit karo, <b>Routing → Static Route → Add Route</b>, jahan aap route-tracking SLA monitor bhi attach kar sakte ho. Lab ka default route outside par 203.0.113.1 ke via 0.0.0.0/0 hai.</p>

<pre class="out">&gt; show route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        10.0.2.0 255.255.255.0 is directly connected, dmz
L        10.0.2.1 255.255.255.255 is directly connected, dmz
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside

&gt; show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
<span class="hl">GigabitEthernet0/1       inside                     0</span>
GigabitEthernet0/2       dmz                        0</pre>
<p>Har security level 0 dikhata hai: Threat Defense par level ka koi role nahi, zones aur rules ka hai. Interfaces sahi addresses ke saath up hain ya nahi, yeh confirm karne ke liye <code>show interface ip brief</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> Company printers ke liye ek doosra inside VLAN, 10.0.3.0/24, subinterface GigabitEthernet0/1.30 par logical name printers ke saath jodti hai. Agar engineer use zone INSIDE mein daalta hai, to existing Inside-Out rule turant printers par bhi lagti hai. Agar printers ko internet browse nahi karna chahiye, to iski jagah ek naya zone PRINTERS banao aur uske liye rules likho. Zone ka chunav policy decision hai, sajavat nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Interface address aur zone banana lekin logical name bhool jaana, ya interface ko disabled chhod dena. Bina naam ke LINA use ignore karta hai. Doosri classic: aisa route jo kisi connected subnet mein na hone wale gateway ki taraf point kare; woh kabhi install nahi hoga.</p></div>

<div class="exam"><p><b>Exam trap.</b> Interface changes device configuration hain aur unhe bhi Deploy chahiye. Zones access control aur NAT rules se match hote hain; ek interface sirf ek security zone mein ho sakta hai, jabki interface groups (NAT aur kuch policies ke liye) overlap kar sakte hain.</p></div>

<div class="scn"><h4>Naya VLAN jo zyada browse kar gaya</h4><p>Ek branch firewall mein guest Wi-Fi VLAN joda gaya aur samay bachane ke liye zone INSIDE mein daal diya gaya. Ek din ke andar guests internal print server tak pahunch gaye, kyunki ek rule printing ke liye INSIDE se INSIDE allow karti thi. Fix tha ek naya zone GUEST, apni rule ke saath jo OUTSIDE tak sirf HTTP, HTTPS aur DNS allow karti hai, aur uske baad deploy.</p><p><b>Seekh:</b> zone ek trust boundary hai; users ki alag class ko sirf suvidha ke liye existing zone mein kabhi mat daalo.</p></div>

<div class="iv"><p class="q">"Threat Defense ke security zones ASA security levels se kaise alag hain?"</p><p>Security levels high se low tak implicit permits dete the; zones default mein kuch nahi dete. Zones ke beech ya ek zone ke andar har flow access control policy aur uske default action se decide hota hai. Zones objects hain jo devices ke paar ja sakte hain, ek interface ek zone mein hota hai, aur interfaces jodne par bhi rules padhne layak rehti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har interface ka ek physical name, ek logical name (nameif), ek address aur ek security zone hota hai.</li>
<li>Koi security levels nahi: access control policy sab decide karti hai, same-zone traffic bhi.</li>
<li>Lab paths: Devices → Interfaces → Edit; Devices → Routing → Add Route.</li>
<li><code>show nameif</code>, <code>show interface ip brief</code> aur <code>show route</code> se verify karo.</li>
<li>Interface aur routing changes sirf Deploy ke baad lagte hain.</li>
</ul></div>
`}};export{e as default};