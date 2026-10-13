var e={id:`mobility-tunnels`,h:{en:`Mobility tunnels: control path, data path, keepalives and why a peer goes Down`,hi:`Mobility tunnels: control path, data path, keepalives aur peer Down kyun hota hai`},body:{en:`
<h3>Two tunnels, two jobs</h3>
<p>When you list a peer, the controllers do not just write down an address. They build two paths between them, much like a company that keeps a phone line for coordination and a courier route for parcels.</p>
<ul>
<li><b>Control path</b>: a CAPWAP control connection, UDP port 16666, protected by DTLS. It carries mobility messages: "do you know this client?", "I am handing you this client", keepalives and key sharing.</li>
<li><b>Data path</b>: a CAPWAP data tunnel, UDP port 16667. It carries the <i>client's actual traffic</i> when a client is anchored (a Layer 3 roam or a guest anchor). The data path is not encrypted by default; add <code>data-link-encryption</code> to the member line to protect it with DTLS, at a cost in CPU and throughput. Both sides must agree.</li>
</ul>
<p>A peer is usable only when <b>both</b> paths are Up. You will see "Up for control, Down for data" when, for example, the encryption setting differs on the two sides. Older AireOS "legacy mobility" used EoIP (IP protocol 97) for data; the 9800 uses CAPWAP, so a firewall between the controllers must allow UDP 16666 and 16667, not protocol 97.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Mobility control and data path">
<rect x="20" y="40" width="150" height="70" rx="8" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text>
<rect x="470" y="40" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="14">WLC2</text><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text>
<line x1="170" y1="62" x2="470" y2="62" stroke="#7c3aed" stroke-width="3"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">control path: UDP 16666, DTLS, keepalives</text>
<line x1="170" y1="92" x2="470" y2="92" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">data path: UDP 16667, client traffic</text>
<rect x="190" y="150" width="260" height="60" rx="8" fill="#fde68a"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">Firewall or NAT between them?</text><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">Allow both ports; set public-ip</text>
</svg><p class="cap">Peer Up means control and data both Up. A firewall in the middle must pass UDP 16666 and 16667.</p></div>

<h3>Keepalives, DSCP and the other global settings</h3>
<table class="cmp"><tr><th>Setting</th><th>Command</th><th>Default</th><th>Meaning</th></tr>
<tr><td>Keepalive interval</td><td><code>wireless mobility group keepalive interval &lt;1-30&gt;</code></td><td>10 s</td><td>How often a keepalive is sent on the tunnel</td></tr>
<tr><td>Keepalive count</td><td><code>wireless mobility group keepalive count &lt;3-20&gt;</code></td><td>3</td><td>Missed keepalives before the peer is declared Down</td></tr>
<tr><td>DSCP</td><td><code>wireless mobility dscp &lt;0-63&gt;</code></td><td>48</td><td>QoS marking on mobility control messages</td></tr>
<tr><td>Mobility MAC</td><td><code>wireless mobility mac-address &lt;mac&gt;</code></td><td>Derived</td><td>Identity in mobility messages; shared by an HA pair</td></tr>
</table>
<p>With 10 s and 3 missed keepalives, a failed WAN is noticed in roughly 30 seconds. Lowering the interval makes failure detection quicker but adds control traffic and can flap on a lossy WAN. DSCP 48 (CS6) gives mobility control traffic high priority; make sure the WAN QoS policy does not drop it.</p>

<h3>NAT and the public IP</h3>
<p>If a controller sits behind NAT, the other controller cannot reach its private management address. The member line carries a <code>public-ip</code>: the address the <i>peer</i> must use to reach this controller. Without NAT it equals the management IP, which is what the labs do. <b>The simulator stores and shows the public IP but does not translate; NAT between mobility peers is concept only.</b></p>

<h3>Reading the peer state</h3>
<pre class="out">WLC1# show wireless mobility peer ip 10.20.99.10

Mobility peer 10.20.99.10 (WLC2)
  Group name configured here  : NK-CAMPUS
  Public IP                   : 10.20.99.10
  <span class="hl">Control path                : Up</span>
  <span class="hl">Data path                   : Up</span>
  Data link encryption        : Disabled

WLC1# show logging | include MOBILITY
%MOBILITY-6-PEER_UP: mobility peer 10.20.99.10 (WLC2) is Up (control and data path)</pre>
<p>When the peer is not Up, the simulator adds a <i>Down reason (model hint)</i> line and the log shows <code>%MOBILITY-3-PEER_DOWN</code> with a reason. A real 9800 gives less friendly text; there you read the control path and data path state and the log, then reason from the list below.</p>

<h3>Why a peer stays Down: five causes</h3>
<table class="cmp"><tr><th>#</th><th>Cause</th><th>Typical sign</th><th>Fix on</th></tr>
<tr><td>1</td><td>Member IP is not a controller's wireless management IP</td><td>Nothing answers</td><td>The controller with the wrong IP</td></tr>
<tr><td>2</td><td>No reachability, in one direction or both</td><td>Ping to the peer fails or the return route is missing</td><td>Routers in the path</td></tr>
<tr><td>3</td><td>Peer configured on one side only</td><td>Peer visible on one controller, absent on the other</td><td>The controller missing the entry</td></tr>
<tr><td>4</td><td>Group name mismatch</td><td>Names differ between summary outputs</td><td>The controller with the wrong name</td></tr>
<tr><td>5</td><td>Data-link encryption differs</td><td>Control Up, data Down</td><td>Whichever side disagrees</td></tr>
</table>
<p>In the labs <b>wl-mob-peer-down</b> (causes 3 and 4 together) and <b>wl-mob-wan-down</b> (cause 2) you will find and fix these. The full method is in chapter 11. Notice the key lesson now: <b>a ping that works one way is not enough</b>. The peer needs the management addresses to reach each other in both directions, so a missing <i>return</i> route breaks it while the forward ping may even succeed from the other side.</p>

<div class="eg"><p><b>Worked example.</b> The peer is Down and a ping from WLC1 to 10.20.99.10 gets 0 of 5 replies, although the request does reach Delhi. R2 (Delhi) has no route back to 10.10.0.0/16, so WLC2's echo replies and its own tunnel packets never reach Mumbai. Ping from WLC2 to WLC1 fails in the same way; adding <code>ip route 10.10.0.0 255.255.0.0 172.16.1.2</code> on R2 restores both directions and the peer becomes Up within seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Opening only UDP 16666 on a firewall (the peer then shows control Up, data Down). Setting data-link-encryption on one controller only. Troubleshooting group names when the real fault is a routing change on the WAN. Setting an aggressive keepalive on a lossy WAN and creating flapping peers.</p></div>

<div class="exam"><p><b>Exam trap.</b> The 9800 mobility ports are UDP 16666 (control) and UDP 16667 (data). Legacy AireOS mobility used EoIP (IP protocol 97) for data and UDP 16666 for control. Do not give the 9800 an EoIP answer.</p></div>

<div class="scn"><h4>The Monday morning tunnel</h4><p>After a weekend firewall change, roaming between two campuses broke. Peers showed Up for control, Down for data. The firewall team had allowed UDP 16666 (they remembered it from an old document) but not 16667. Adding the data port made the peers Up and L3 roams resumed. In between, anchored guests had been disassociated because their data path vanished.</p><p><b>Lesson:</b> "control Up, data Down" almost always means a filter or an encryption mismatch, not a configuration typo.</p></div>

<div class="iv"><p class="q">"A mobility peer shows control path Up and data path Down. What do you check?"</p><p>Data-link-encryption settings on both ends (they must match), then whether UDP 16667 is allowed through firewalls and ACLs between the controllers, then MTU and PMTU along the path. Control Up proves addressing, group names and member entries are fine, so do not waste time on those.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A peer has a control path (UDP 16666, DTLS) and a data path (UDP 16667); Up means both.</li>
<li>Keepalive 10 s by 3 and DSCP 48 are defaults; the member line can add data-link-encryption.</li>
<li>Public IP exists for NAT; the simulator stores it but does not translate.</li>
<li>Five causes of Down: wrong IP, no two-way reachability, one-sided entry, group name mismatch, encryption mismatch.</li>
<li>Both directions of the path must work, not only the one you ping.</li>
</ul></div>
`,hi:`
<h3>Do tunnels, do kaam</h3>
<p>Jab aap peer list karte ho to controllers sirf ek address likh nahi lete. Woh dono ke beech do paths banate hain, bilkul us company ki tarah jo coordination ke liye phone line rakhti hai aur parcels ke liye courier route.</p>
<ul>
<li><b>Control path</b>: CAPWAP control connection, UDP port 16666, DTLS se protected. Isme mobility messages jaate hain: "kya aap is client ko jaante ho?", "main yeh client aapko hand over kar raha hoon", keepalives aur key sharing.</li>
<li><b>Data path</b>: CAPWAP data tunnel, UDP port 16667. Isme <i>client ka asli traffic</i> jaata hai jab client anchored ho (Layer 3 roam ya guest anchor). Data path default mein encrypted nahi hota; DTLS se protect karne ke liye member line mein <code>data-link-encryption</code> jodo, CPU aur throughput ki keemat par. Dono sides ko agree hona chahiye.</li>
</ul>
<p>Peer tabhi usable hai jab <b>dono</b> paths Up hon. "Up for control, Down for data" tab dikhega jab, jaise, encryption setting dono sides par alag ho. Purana AireOS "legacy mobility" data ke liye EoIP (IP protocol 97) use karta tha; 9800 CAPWAP use karta hai, isliye controllers ke beech firewall ko UDP 16666 aur 16667 allow karna hoga, protocol 97 nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Mobility control aur data path">
<rect x="20" y="40" width="150" height="70" rx="8" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text>
<rect x="470" y="40" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="14">WLC2</text><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text>
<line x1="170" y1="62" x2="470" y2="62" stroke="#7c3aed" stroke-width="3"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">control path: UDP 16666, DTLS, keepalives</text>
<line x1="170" y1="92" x2="470" y2="92" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">data path: UDP 16667, client traffic</text>
<rect x="190" y="150" width="260" height="60" rx="8" fill="#fde68a"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">Beech mein firewall ya NAT?</text><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">Dono ports allow karo; public-ip set karo</text>
</svg><p class="cap">Peer Up ka matlab control aur data dono Up. Beech ke firewall ko UDP 16666 aur 16667 pass karne honge.</p></div>

<h3>Keepalives, DSCP aur baaki global settings</h3>
<table class="cmp"><tr><th>Setting</th><th>Command</th><th>Default</th><th>Matlab</th></tr>
<tr><td>Keepalive interval</td><td><code>wireless mobility group keepalive interval &lt;1-30&gt;</code></td><td>10 s</td><td>Tunnel par keepalive kitni der mein bheja jata hai</td></tr>
<tr><td>Keepalive count</td><td><code>wireless mobility group keepalive count &lt;3-20&gt;</code></td><td>3</td><td>Kitne keepalives miss hone par peer Down declare hota hai</td></tr>
<tr><td>DSCP</td><td><code>wireless mobility dscp &lt;0-63&gt;</code></td><td>48</td><td>Mobility control messages par QoS marking</td></tr>
<tr><td>Mobility MAC</td><td><code>wireless mobility mac-address &lt;mac&gt;</code></td><td>Derived</td><td>Mobility messages mein identity; HA pair share karta hai</td></tr>
</table>
<p>10 s aur 3 missed keepalives ke saath failed WAN lagbhag 30 second mein notice hota hai. Interval kam karne se failure detection tez hota hai lekin control traffic badhta hai aur lossy WAN par flap ho sakta hai. DSCP 48 (CS6) mobility control traffic ko high priority deta hai; dhyaan rakho ki WAN QoS policy use drop na kare.</p>

<h3>NAT aur public IP</h3>
<p>Agar controller NAT ke peeche hai to doosra controller uske private management address tak nahi pahunch sakta. Member line mein <code>public-ip</code> hota hai: woh address jo <i>peer</i> ko is controller tak pahunchne ke liye use karna hai. NAT ke bina yeh management IP ke barabar hota hai, jo labs karte hain. <b>Simulator public IP store karta hai aur dikhata hai lekin translate nahi karta; mobility peers ke beech NAT concept only hai.</b></p>

<h3>Peer state padhna</h3>
<pre class="out">WLC1# show wireless mobility peer ip 10.20.99.10

Mobility peer 10.20.99.10 (WLC2)
  Group name configured here  : NK-CAMPUS
  Public IP                   : 10.20.99.10
  <span class="hl">Control path                : Up</span>
  <span class="hl">Data path                   : Up</span>
  Data link encryption        : Disabled

WLC1# show logging | include MOBILITY
%MOBILITY-6-PEER_UP: mobility peer 10.20.99.10 (WLC2) is Up (control and data path)</pre>
<p>Jab peer Up nahi hota to simulator ek <i>Down reason (model hint)</i> line jodta hai aur log mein <code>%MOBILITY-3-PEER_DOWN</code> reason ke saath dikhta hai. Asli 9800 kam friendly text deta hai; wahan aap control path aur data path state aur log padhte ho, phir neeche ki list se reason nikalte ho.</p>

<h3>Peer Down kyun rehta hai: paanch causes</h3>
<table class="cmp"><tr><th>#</th><th>Cause</th><th>Typical sign</th><th>Fix kahan</th></tr>
<tr><td>1</td><td>Member IP kisi controller ka wireless management IP nahi hai</td><td>Koi jawab nahi deta</td><td>Galat IP wala controller</td></tr>
<tr><td>2</td><td>Reachability nahi, ek ya dono directions mein</td><td>Peer ko ping fail ya return route missing</td><td>Path ke routers</td></tr>
<tr><td>3</td><td>Peer sirf ek side par configured</td><td>Ek controller par peer dikhta hai, doosre par nahi</td><td>Jis controller par entry missing hai</td></tr>
<tr><td>4</td><td>Group name mismatch</td><td>Summary outputs mein names alag</td><td>Galat naam wala controller</td></tr>
<tr><td>5</td><td>Data-link encryption alag hai</td><td>Control Up, data Down</td><td>Jo side disagree kare</td></tr>
</table>
<p>Labs <b>wl-mob-peer-down</b> (causes 3 aur 4 saath mein) aur <b>wl-mob-wan-down</b> (cause 2) mein aap yeh dhundoge aur fix karoge. Poora method chapter 11 mein hai. Abhi hi key lesson note karo: <b>ping ek taraf se chalta hai, yeh kaafi nahi hai</b>. Peer ko management addresses ka dono directions mein ek doosre tak pahunchna chahiye, isliye <i>return</i> route missing hone se peer toot jaata hai jabki doosri taraf se forward ping shayad kaam kare.</p>

<div class="eg"><p><b>Worked example.</b> Peer Down hai aur WLC1 se 10.20.99.10 ko ping mein 5 mein se 0 replies milte hain, jabki request Delhi tak pahunchti hai. R2 (Delhi) ke paas 10.10.0.0/16 ka return route nahi hai, isliye WLC2 ke echo replies aur uske apne tunnel packets Mumbai tak nahi pahunchte. WLC2 se WLC1 ko ping bhi isi tarah fail hota hai; R2 par <code>ip route 10.10.0.0 255.255.0.0 172.16.1.2</code> add karne se dono directions wapas aate hain aur peer kuch seconds mein Up ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Firewall par sirf UDP 16666 kholna (peer tab control Up, data Down dikhata hai). Data-link-encryption sirf ek controller par set karna. Jab asli fault WAN par routing change ho tab group names troubleshoot karna. Lossy WAN par aggressive keepalive set karke flapping peers banana.</p></div>

<div class="exam"><p><b>Exam trap.</b> 9800 mobility ports UDP 16666 (control) aur UDP 16667 (data) hain. Legacy AireOS mobility data ke liye EoIP (IP protocol 97) aur control ke liye UDP 16666 use karti thi. 9800 ko EoIP wala jawab mat do.</p></div>

<div class="scn"><h4>Monday subah ka tunnel</h4><p>Weekend par firewall change ke baad do campuses ke beech roaming toot gayi. Peers control Up, data Down dikha rahe the. Firewall team ne UDP 16666 allow kiya tha (purane document se yaad tha) lekin 16667 nahi. Data port add karne se peers Up ho gaye aur L3 roams wapas chalne lage. Beech mein anchored guests disassociate ho gaye the kyunki unka data path gayab ho gaya tha.</p><p><b>Lesson:</b> "control Up, data Down" ka matlab lagbhag hamesha filter ya encryption mismatch hota hai, configuration typo nahi.</p></div>

<div class="iv"><p class="q">"Mobility peer control path Up aur data path Down dikha raha hai. Aap kya check karte ho?"</p><p>Dono ends par data-link-encryption settings (match honi chahiye), phir controllers ke beech firewalls aur ACLs mein UDP 16667 allowed hai ya nahi, phir path par MTU aur PMTU. Control Up yeh prove karta hai ki addressing, group names aur member entries theek hain, isliye unpar time waste mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peer ka control path (UDP 16666, DTLS) aur data path (UDP 16667) hota hai; Up ka matlab dono.</li>
<li>Keepalive 10 s by 3 aur DSCP 48 defaults hain; member line data-link-encryption jod sakti hai.</li>
<li>Public IP NAT ke liye hai; simulator store karta hai, translate nahi.</li>
<li>Down ke paanch causes: galat IP, two-way reachability nahi, one-sided entry, group name mismatch, encryption mismatch.</li>
<li>Path ke dono directions kaam karne chahiye, sirf wahi nahi jise aap ping karte ho.</li>
</ul></div>
`}};export{e as default};