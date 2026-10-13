var e={id:`l2-filters`,h:{en:`Ethernet-switching firewall filters`,hi:`Ethernet-switching firewall filters`},body:{en:`
<p><b>What a Layer 2 filter is.</b> Everything so far reacted to protocol behaviour. Sometimes you simply need a rule: "never accept frames from this MAC address", "drop this VLAN's SSH traffic", "count ICMP on this port". A <b>firewall filter</b> is an ordered list of <b>terms</b>. Each term has <b>from</b> conditions and a <b>then</b> action. Packets are compared against the terms from top to bottom, and the first matching term decides. On a switch, filters of <code>family ethernet-switching</code> work on frames inside a VLAN and can match both Layer 2 and Layer 3 fields.</p>
<p>Think of a security guard with a numbered checklist. He reads the list from the top, applies the first rule that fits the visitor, and goes home. If no rule fits, a final hidden rule says "send away". In Junos that hidden rule is the <b>implicit discard</b> at the end of every filter.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Filter terms evaluated top to bottom">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Frame in</text>
<rect x="200" y="10" width="250" height="40" rx="8" fill="#fed7aa"/><text x="325" y="35" text-anchor="middle" class="svg-ink" font-size="13">term block-cam: MAC 00:ca:fe... then discard</text>
<rect x="200" y="65" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">term allow-arp: ether-type arp then accept</text>
<rect x="200" y="120" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="13">term allow-ip: ether-type ipv4 then accept</text>
<rect x="200" y="170" width="250" height="26" rx="8" fill="#fecaca"/><text x="325" y="188" text-anchor="middle" class="svg-ink" font-size="12">implicit discard (nothing matched)</text>
<line x1="140" y1="40" x2="200" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">first match wins</text>
</svg><p class="cap">Order matters: the specific block comes before the general allow.</p></div>

<h3>Match conditions you can use</h3>
<table class="cmp"><tr><th>Match</th><th>Example</th></tr>
<tr><td>source-mac-address, destination-mac-address</td><td>00:ca:fe:00:00:01 (a /24 style prefix matches an OUI)</td></tr>
<tr><td>ether-type</td><td>arp, ipv4, ipv6, 0x88cc (LLDP)</td></tr>
<tr><td>vlan</td><td>name or ID</td></tr>
<tr><td>ip-source-address, ip-destination-address, ip-protocol</td><td>10.1.20.0/24, icmp, tcp</td></tr>
<tr><td>source-port, destination-port</td><td>ssh, 80</td></tr></table>
<p>Typical actions: <code>accept</code>, <code>discard</code>, <code>count NAME</code>, <code>log</code>, <code>loss-priority</code>, <code>forwarding-class</code>. A term with no <code>from</code> matches everything.</p>

<h3>Writing and applying a filter</h3>
<pre class="code">set firewall family ethernet-switching filter PROTECT term block-cam from source-mac-address 00:ca:fe:00:00:01
set firewall family ethernet-switching filter PROTECT term block-cam then discard
set firewall family ethernet-switching filter PROTECT term block-cam then count cam-drops
set firewall family ethernet-switching filter PROTECT term allow-arp from ether-type arp
set firewall family ethernet-switching filter PROTECT term allow-arp then accept
set firewall family ethernet-switching filter PROTECT term allow-ip from ether-type ipv4
set firewall family ethernet-switching filter PROTECT term allow-ip then accept
<span class="c">! apply to a whole VLAN (a VLAN filter) ...</span>
set vlans LAB forwarding-options filter input PROTECT
<span class="c">! ... or to one port (a port filter)</span>
set interfaces ge-0/0/1 unit 0 family ethernet-switching filter input PORT-IN</pre>
<table class="cmp"><tr><th>Applied to</th><th>Typical use</th></tr>
<tr><td>Port (<code>interface ... filter input</code>)</td><td>Rules for one device or user port</td></tr>
<tr><td>VLAN (<code>vlans ... forwarding-options filter input</code>)</td><td>Rules for everything entering that VLAN on any port, such as blocking a MAC or protocol</td></tr>
<tr><td>Router (<code>family inet</code>, on irb)</td><td>Layer 3 traffic after routing (not this chapter)</td></tr></table>

<h3>Counters and verification</h3>
<pre class="out">lab@ACC&gt; show firewall
Filter: PROTECT
Counters:
Name                                                Bytes              Packets
<span class="hl">cam-drops</span>                                             384                    6

lab@ACC&gt; show configuration firewall family ethernet-switching
filter PROTECT {
    term block-cam {
        from {
            source-mac-address 00:ca:fe:00:00:01;
        }
        then {
            discard;
            count cam-drops;
        }
    }
    ...</pre>
<p>A counter that rises tells you the term matches real traffic. A counter that stays at zero means the term never matches: wrong value, wrong place, or an earlier term catches the traffic first. Note that a term that ends with <code>accept</code> does not count by itself; add <code>count</code> if you want numbers.</p>

<h3>The implicit-discard trap</h3>
<p>This is the single most common filter mistake. Consider a filter with only <code>from ether-type ipv4 then accept</code>. Hosts need to resolve the gateway's MAC with ARP before they can send IPv4. ARP frames have <code>ether-type arp</code>, they match nothing, and they fall into the implicit discard. No ARP, no IPv4, and the ping fails even though the filter "allows IPv4". The fix is a second term that accepts ARP (as above) or a final term with no <code>from</code> that accepts the rest.</p>
<p>Other frames that disappear the same way: spanning tree BPDUs and LLDP are handled by the control plane and are not filtered by these filters on most platforms, but DHCP, IPv6 neighbour discovery and VRRP are. When you write a "permit list" filter, think of every protocol you need.</p>

<div class="eg"><p><b>Worked example.</b> A decommissioned IP camera (MAC 00:ca:fe:00:00:01) keeps trying to reach the LAB VLAN. You add term block-cam first, then count it. After one hour <code>show firewall</code> shows 6 packets, proving the camera is still plugged in somewhere. The filter protects the VLAN regardless of which port the camera is moved to, because it is applied to the VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting the broad accept term first. A term that accepts everything above the block term makes the block term unreachable and the counter stays at zero. Specific rules first, general rules last.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks what happens to traffic that matches no term: it is silently discarded. Also know that <code>family ethernet-switching</code> filters are applied with <code>filter input</code> on ports or VLANs, whereas <code>family inet</code> filters apply on Layer 3 interfaces such as irb.</p></div>

<div class="scn"><h4>The filter that killed the lab</h4><p>A security engineer wrote a VLAN filter "to permit only IPv4 for the lab". Within seconds every PC lost its gateway. The cause was missing ARP. Adding a term for ether-type arp before the IPv4 term restored traffic, and the camera block still worked. The engineer then tested each new filter on one port first using a <code>commit confirmed</code>.</p><p><b>Lesson:</b> every permit-list filter needs ARP (and often DHCP) permitted explicitly.</p></div>
<div class="iv"><p class="q">"What happens to a frame that matches no term in a Junos filter?"</p><p>It is discarded by the implicit discard at the end. This is why a filter that accepts only IPv4 on a switch breaks ARP, and why a good filter ends with an explicit accept term or lists every protocol needed. Mention that terms are evaluated top to bottom and the first match wins.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Terms have from and then; first match wins; implicit discard at the end.</li>
<li>Apply with <code>filter input</code> on a port or on a VLAN (<code>forwarding-options</code>).</li>
<li>Match MAC, ether-type, VLAN, IP and port fields; add <code>count</code> to prove a rule works.</li>
<li>Permit-list filters must allow ARP.</li>
<li><code>show firewall</code> displays the counters.</li>
</ul></div>
`,hi:`
<p><b>Layer 2 filter kya hai.</b> Ab tak ki cheezein protocol behaviour par react karti thi. Kabhi bas ek rule chahiye: "is MAC address ke frames kabhi accept mat karo", "is VLAN ka SSH traffic drop karo", "is port par ICMP count karo". <b>Firewall filter</b> <b>terms</b> ki ordered list hai. Har term mein <b>from</b> conditions aur ek <b>then</b> action hota hai. Packets ko terms se upar se neeche tak milaya jaata hai aur pehla matching term faisla karta hai. Switch par <code>family ethernet-switching</code> ke filters VLAN ke andar frames par kaam karte hain aur Layer 2 aur Layer 3 dono fields match kar sakte hain.</p>
<p>Ek security guard socho jiske paas numbered checklist hai. Woh list upar se padhta hai, visitor par jo pehla rule fit ho wo lagata hai aur ghar jaata hai. Koi rule fit na ho to aakhri chhupa hua rule kehta hai "bhej do". Junos mein woh chhupa rule har filter ke end ka <b>implicit discard</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Filter terms upar se neeche evaluate hote hain">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Frame in</text>
<rect x="200" y="10" width="250" height="40" rx="8" fill="#fed7aa"/><text x="325" y="35" text-anchor="middle" class="svg-ink" font-size="13">term block-cam: MAC 00:ca:fe... then discard</text>
<rect x="200" y="65" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">term allow-arp: ether-type arp then accept</text>
<rect x="200" y="120" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="13">term allow-ip: ether-type ipv4 then accept</text>
<rect x="200" y="170" width="250" height="26" rx="8" fill="#fecaca"/><text x="325" y="188" text-anchor="middle" class="svg-ink" font-size="12">implicit discard (kuch match nahi hua)</text>
<line x1="140" y1="40" x2="200" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">pehla match jeetta hai</text>
</svg><p class="cap">Order matter karta hai: specific block general allow se pehle.</p></div>

<h3>Kaunse match conditions use kar sakte ho</h3>
<table class="cmp"><tr><th>Match</th><th>Example</th></tr>
<tr><td>source-mac-address, destination-mac-address</td><td>00:ca:fe:00:00:01 (/24 jaisa prefix OUI match karta hai)</td></tr>
<tr><td>ether-type</td><td>arp, ipv4, ipv6, 0x88cc (LLDP)</td></tr>
<tr><td>vlan</td><td>naam ya ID</td></tr>
<tr><td>ip-source-address, ip-destination-address, ip-protocol</td><td>10.1.20.0/24, icmp, tcp</td></tr>
<tr><td>source-port, destination-port</td><td>ssh, 80</td></tr></table>
<p>Aam actions: <code>accept</code>, <code>discard</code>, <code>count NAME</code>, <code>log</code>, <code>loss-priority</code>, <code>forwarding-class</code>. Jis term mein <code>from</code> nahi hota woh sab kuch match karta hai.</p>

<h3>Filter likhna aur lagana</h3>
<pre class="code">set firewall family ethernet-switching filter PROTECT term block-cam from source-mac-address 00:ca:fe:00:00:01
set firewall family ethernet-switching filter PROTECT term block-cam then discard
set firewall family ethernet-switching filter PROTECT term block-cam then count cam-drops
set firewall family ethernet-switching filter PROTECT term allow-arp from ether-type arp
set firewall family ethernet-switching filter PROTECT term allow-arp then accept
set firewall family ethernet-switching filter PROTECT term allow-ip from ether-type ipv4
set firewall family ethernet-switching filter PROTECT term allow-ip then accept
<span class="c">! poore VLAN par lagao (VLAN filter) ...</span>
set vlans LAB forwarding-options filter input PROTECT
<span class="c">! ... ya ek port par (port filter)</span>
set interfaces ge-0/0/1 unit 0 family ethernet-switching filter input PORT-IN</pre>
<table class="cmp"><tr><th>Kahan lagaya</th><th>Aam use</th></tr>
<tr><td>Port (<code>interface ... filter input</code>)</td><td>Ek device ya user port ke rules</td></tr>
<tr><td>VLAN (<code>vlans ... forwarding-options filter input</code>)</td><td>Us VLAN mein kisi bhi port se aane wali har cheez ke rules, jaise MAC ya protocol block karna</td></tr>
<tr><td>Router (<code>family inet</code>, irb par)</td><td>Routing ke baad Layer 3 traffic (is chapter mein nahi)</td></tr></table>

<h3>Counters aur verification</h3>
<pre class="out">lab@ACC&gt; show firewall
Filter: PROTECT
Counters:
Name                                                Bytes              Packets
<span class="hl">cam-drops</span>                                             384                    6

lab@ACC&gt; show configuration firewall family ethernet-switching
filter PROTECT {
    term block-cam {
        from {
            source-mac-address 00:ca:fe:00:00:01;
        }
        then {
            discard;
            count cam-drops;
        }
    }
    ...</pre>
<p>Badhta hua counter batata hai ki term asli traffic se match ho raha hai. Zero par ruka counter matlab term kabhi match nahi karta: value galat, jagah galat, ya pehle wala term traffic pakad leta hai. Dhyan do ki <code>accept</code> par khatam hone wala term khud count nahi karta; numbers chahiye to <code>count</code> jodo.</p>

<h3>Implicit-discard trap</h3>
<p>Filter ki sabse common galti yahi hai. Aise filter ko socho jisme sirf <code>from ether-type ipv4 then accept</code> hai. Hosts ko IPv4 bhejne se pehle ARP se gateway ka MAC resolve karna padta hai. ARP frames ka <code>ether-type arp</code> hota hai, kisi se match nahi karte aur implicit discard mein gir jaate hain. ARP nahi, IPv4 nahi, aur ping fail ho jaati hai jabki filter "IPv4 allow karta hai". Fix: ARP accept karne wala doosra term (upar jaisa) ya aakhri term jisme <code>from</code> na ho aur baaki sab accept kare.</p>
<p>Isi tarah gayab hone wale doosre frames: spanning tree BPDUs aur LLDP control plane handle karta hai aur zyaadatar platforms par in filters se filter nahi hote, lekin DHCP, IPv6 neighbour discovery aur VRRP hote hain. "Permit list" filter likhte waqt har zaroori protocol ke baare mein socho.</p>

<div class="eg"><p><b>Worked example.</b> Band kiya gaya IP camera (MAC 00:ca:fe:00:00:01) LAB VLAN tak pahunchne ki koshish karta rehta hai. Aap term block-cam sabse pehle lagate ho aur count karte ho. Ek ghante baad <code>show firewall</code> 6 packets dikhata hai, jisse saabit hota hai ki camera kahin laga hua hai. Filter VLAN par laga hai, isliye camera kisi bhi port par chala jaaye VLAN surakshit rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Broad accept term sabse upar rakhna. Block term ke upar sab kuch accept karne wala term block ko unreachable bana deta hai aur counter zero rehta hai. Specific rules pehle, general rules baad mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai jo traffic kisi term se match na ho uska kya hota hai: woh chupchaap discard hota hai. Yeh bhi jaano ki <code>family ethernet-switching</code> filters ports ya VLANs par <code>filter input</code> se lagte hain, jabki <code>family inet</code> filters irb jaise Layer 3 interfaces par.</p></div>

<div class="scn"><h4>Filter jisne lab ko maar diya</h4><p>Ek security engineer ne "lab ke liye sirf IPv4 permit" karne ka VLAN filter likha. Kuch seconds mein har PC ka gateway chala gaya. Wajah ARP ka missing hona thi. IPv4 term se pehle ether-type arp ka term jodne se traffic wapas aaya, aur camera block bhi chalta raha. Phir engineer ne har naya filter pehle ek port par <code>commit confirmed</code> se test karna shuru kiya.</p><p><b>Lesson:</b> har permit-list filter mein ARP (aur aksar DHCP) explicitly permit karna zaroori hai.</p></div>
<div class="iv"><p class="q">"Junos filter mein jo frame kisi term se match na ho uska kya hota hai?"</p><p>Woh end ke implicit discard se discard hota hai. Isi liye switch par sirf IPv4 accept karne wala filter ARP tod deta hai, aur achha filter explicit accept term par khatam hota hai ya har zaroori protocol list karta hai. Yeh bhi batao ki terms upar se neeche evaluate hote hain aur pehla match jeetta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Terms mein from aur then; pehla match jeetta hai; end mein implicit discard.</li>
<li>Port ya VLAN (<code>forwarding-options</code>) par <code>filter input</code> se lagao.</li>
<li>MAC, ether-type, VLAN, IP aur port fields match karo; rule kaam kar raha hai saabit karne ko <code>count</code> jodo.</li>
<li>Permit-list filters ko ARP allow karna hi padta hai.</li>
<li><code>show firewall</code> counters dikhata hai.</li>
</ul></div>
`}};export{e as default};