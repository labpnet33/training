var e={id:`svi-state`,h:{en:`SVI up/down rules, autostate and routed ports`,hi:`SVI up/down rules, autostate aur routed ports`},body:{en:`
<p>A shop sign that says "OPEN" is only honest if there is at least one staff member inside and the door is unlocked. An SVI follows the same idea: it only reports itself up if the VLAN behind it really has a live, forwarding port. This behaviour, called <b>autostate</b>, stops a switch from advertising a gateway for a VLAN that nobody can reach.</p>

<h3>When is an SVI up/up?</h3>
<p>An SVI shows <b>up/up</b> only when all three of these are true:</p>
<ol>
<li>The VLAN <b>exists</b> in the switch's VLAN database and is active (not suspended or shut down).</li>
<li>At least one Layer 2 port in that VLAN is <b>up</b> and in the spanning tree <b>forwarding</b> state. That can be an access port in the VLAN, or a trunk that allows and carries the VLAN.</li>
<li>The SVI itself is not <b>administratively shut down</b>.</li>
</ol>
<table class="cmp"><tr><th>show ip interface brief</th><th>Meaning</th><th>Fix</th></tr>
<tr><td><code>administratively down / down</code></td><td>The SVI has <code>shutdown</code></td><td><code>no shutdown</code> on the SVI</td></tr>
<tr><td><code>up / down</code></td><td>VLAN missing, or no port in the VLAN up and forwarding</td><td>Create the VLAN, connect a host, or allow the VLAN on an up trunk</td></tr>
<tr><td><code>up / up</code></td><td>Ready to route</td><td>Nothing</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SVI autostate checks from left to right">
<rect x="10" y="30" width="150" height="56" rx="8" fill="#bae6fd"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">VLAN exists</text><text x="85" y="72" text-anchor="middle" class="svg-ink" font-size="12">and is active?</text>
<rect x="185" y="30" width="170" height="56" rx="8" fill="#bae6fd"/><text x="270" y="54" text-anchor="middle" class="svg-ink" font-size="12">1+ port in VLAN up</text><text x="270" y="72" text-anchor="middle" class="svg-ink" font-size="12">and STP forwarding?</text>
<rect x="380" y="30" width="120" height="56" rx="8" fill="#bae6fd"/><text x="440" y="54" text-anchor="middle" class="svg-ink" font-size="12">SVI not</text><text x="440" y="72" text-anchor="middle" class="svg-ink" font-size="12">shut down?</text>
<rect x="525" y="30" width="105" height="56" rx="8" fill="#bbf7d0"/><text x="577" y="63" text-anchor="middle" class="svg-ink" font-size="13">up / up</text>
<line x1="160" y1="58" x2="185" y2="58" stroke="#64748b" stroke-width="2"/><line x1="355" y1="58" x2="380" y2="58" stroke="#64748b" stroke-width="2"/><line x1="500" y1="58" x2="525" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="86" x2="85" y2="130" stroke="#64748b" stroke-width="2"/><line x1="270" y1="86" x2="270" y2="130" stroke="#64748b" stroke-width="2"/><line x1="440" y1="86" x2="440" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="95" y="112" class="svg-muted" font-size="12">no</text><text x="280" y="112" class="svg-muted" font-size="12">no</text><text x="450" y="112" class="svg-muted" font-size="12">no</text>
<rect x="25" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="12">up / down</text>
<rect x="210" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="270" y="152" text-anchor="middle" class="svg-ink" font-size="12">up / down</text>
<rect x="380" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="440" y="152" text-anchor="middle" class="svg-ink" font-size="12">admin down</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">An SVI is only as up as the VLAN behind it</text>
</svg><p class="cap">Check the three conditions left to right; the first "no" predicts the status you will see.</p></div>

<p>This is why task 3 of the SVI lab only succeeds after task 2: until the trunk between DSW1 Gi0/1 and ASW1 Gi0/1 is up and carrying VLANs 10 and 20, DSW1 has no forwarding port in either VLAN and both SVIs sit at up/down.</p>
<pre class="out">DSW1# show ip interface brief | include Vlan
Vlan10                 10.1.10.1       YES manual up                    up
<span class="hl">Vlan30                 10.1.30.1       YES manual up                    down</span>

DSW1# show vlan brief | include ^30
<span class="hl">30   CAMERAS                          active</span></pre>
<p>Here VLAN 30 exists and the SVI is not shut, so the only possible reason is condition 2: no port in VLAN 30 is up and forwarding. Plug in a camera, or allow VLAN 30 on an up trunk, and the SVI comes up. Spanning tree matters too: with classic 802.1D timers a new port spends about 30 seconds in listening and learning, and the SVI waits for it. A port can be left out of the calculation with <code>switchport autostate exclude</code>, for example a monitoring port that should not hold an SVI up on its own.</p>

<h3>Routed ports: a switch port that acts like a router port</h3>
<p>By default every port on a Catalyst switch is a <b>switchport</b> (Layer 2). The command <code>no switchport</code> turns it into a <b>routed port</b>: it belongs to no VLAN, runs no spanning tree and no DTP, and takes an IP address directly, just like a router interface. Routed ports are the right choice for point-to-point links between Layer 3 devices, such as a distribution switch uplink to a router or a core switch.</p>
<p>In the SVI lab, DSW1 Gi0/7 connects to the edge router EDGE (10.1.99.2/30), which already has a route back to 10.1.0.0/16.</p>
<pre class="code">DSW1(config)# interface GigabitEthernet0/7
DSW1(config-if)# no switchport
DSW1(config-if)# ip address 10.1.99.1 255.255.255.252
DSW1(config-if)# exit
<span class="c">! Everything not local goes to EDGE</span>
DSW1(config)# ip route 0.0.0.0 0.0.0.0 10.1.99.2</pre>
<pre class="out">DSW1# show ip route | begin Gateway
<span class="hl">Gateway of last resort is 10.1.99.2 to network 0.0.0.0</span>

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.1.99.2</span>
      10.0.0.0/8 is variably subnetted, 6 subnets, 3 masks
C        10.1.10.0/24 is directly connected, Vlan10
L        10.1.10.1/32 is directly connected, Vlan10
C        10.1.20.0/24 is directly connected, Vlan20
L        10.1.20.1/32 is directly connected, Vlan20
<span class="hl">C        10.1.99.0/30 is directly connected, GigabitEthernet0/7</span>
L        10.1.99.1/32 is directly connected, GigabitEthernet0/7</pre>
<p>Now PC1 can reach PRN1 and the test address 203.0.113.1 behind EDGE. The return path matters as much as the outgoing one: EDGE's <code>ip route 10.1.0.0 255.255.0.0 10.1.99.1</code> sends replies for every campus VLAN back to DSW1. Without it, pings would leave and never come back.</p>

<div class="eg"><p><b>Worked example: SVI or routed port for the uplink?</b> You could build the DSW1 to EDGE link as VLAN 99 with an SVI 10.1.99.1 and an access port. It works, but the link now depends on VLAN 99 existing, on spanning tree forwarding and on autostate, and if the cable fails the SVI only goes down if no other port is in VLAN 99. A routed port goes down the instant the link fails, the connected route disappears at once, and no Layer 2 loop is possible. For point-to-point Layer 3 links, prefer routed ports.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>ip address</code> on a switchport; IOS rejects it until <code>no switchport</code> is entered. Adding a default route without checking the return route on the upstream router. Expecting an SVI to come up in a lab before any host is connected to its VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>up/down</code> on an SVI is <b>not</b> a shutdown problem; administratively down is. And <code>no switchport</code> does not shut the port or make it a trunk; it makes it a Layer 3 routed port.</p></div>

<div class="scn"><h4>The guest SVI that stayed down</h4><p>A resort built VLAN 70 for a conference and configured SVI 10.70.0.1 on the distribution switch the night before. It stayed up/down and the event manager panicked. The engineer checked: VLAN 70 existed and was active; the SVI was not shut; but <code>show interfaces trunk</code> showed the trunk to the conference-hall switch allowed only 10,20,999. He ran <code>switchport trunk allowed vlan add 70</code>, and the SVI came up within a second because the trunk was already forwarding.</p><p><b>Lesson:</b> for an SVI stuck at up/down, look for a live, forwarding port in that VLAN, including the allowed list on trunks.</p></div>

<div class="iv"><p class="q">"Your SVI shows up/down. What do you check?"</p><p>Strong answer: autostate. Check that the VLAN exists and is active in <code>show vlan brief</code>, that at least one access port in the VLAN is up, or a trunk allows and forwards it (<code>show interfaces trunk</code>, last list), and that spanning tree is forwarding. Administratively down would mean <code>shutdown</code>. Mention <code>switchport autostate exclude</code> as an advanced point, and that routed ports are preferred for point-to-point uplinks because they do not depend on VLAN state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SVI up/up needs: VLAN exists and active, one port in it up and STP forwarding, SVI not shut.</li>
<li>up/down = VLAN or active port problem; administratively down = <code>shutdown</code>.</li>
<li><code>no switchport</code> makes a routed port: no VLAN, no STP, an IP address directly on the port.</li>
<li>Use routed ports for point-to-point Layer 3 uplinks, with a default route out and a return route back.</li>
<li>A trunk's allowed list can keep an SVI down just as surely as a missing VLAN.</li>
</ul></div>
`,hi:`
<p>Dukaan ka "OPEN" board tabhi sach bolta hai jab andar kam se kam ek staff member ho aur darwaza khula ho. SVI bhi yahi idea follow karta hai: woh khud ko tabhi up batata hai jab uske peeche wale VLAN mein sach mein ek zinda, forwarding port ho. Yeh behaviour, jise <b>autostate</b> kehte hain, switch ko us VLAN ka gateway advertise karne se rokta hai jahan koi pahunch hi nahi sakta.</p>

<h3>SVI up/up kab hota hai?</h3>
<p>SVI <b>up/up</b> tabhi dikhata hai jab yeh teeno baatein sach hon:</p>
<ol>
<li>VLAN switch ke VLAN database mein <b>exist</b> karta hai aur active hai (suspended ya shut nahi).</li>
<li>Us VLAN ka kam se kam ek Layer 2 port <b>up</b> hai aur spanning tree <b>forwarding</b> state mein hai. Yeh VLAN ka access port ho sakta hai, ya aisa trunk jo VLAN ko allow aur carry karta ho.</li>
<li>SVI khud <b>administratively shut down</b> nahi hai.</li>
</ol>
<table class="cmp"><tr><th>show ip interface brief</th><th>Matlab</th><th>Fix</th></tr>
<tr><td><code>administratively down / down</code></td><td>SVI par <code>shutdown</code> hai</td><td>SVI par <code>no shutdown</code></td></tr>
<tr><td><code>up / down</code></td><td>VLAN missing, ya VLAN ka koi port up aur forwarding nahi</td><td>VLAN banao, host connect karo, ya up trunk par VLAN allow karo</td></tr>
<tr><td><code>up / up</code></td><td>Route karne ke liye ready</td><td>Kuch nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SVI autostate checks left se right">
<rect x="10" y="30" width="150" height="56" rx="8" fill="#bae6fd"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">VLAN exist karta</text><text x="85" y="72" text-anchor="middle" class="svg-ink" font-size="12">aur active hai?</text>
<rect x="185" y="30" width="170" height="56" rx="8" fill="#bae6fd"/><text x="270" y="54" text-anchor="middle" class="svg-ink" font-size="12">VLAN ka 1+ port up</text><text x="270" y="72" text-anchor="middle" class="svg-ink" font-size="12">aur STP forwarding?</text>
<rect x="380" y="30" width="120" height="56" rx="8" fill="#bae6fd"/><text x="440" y="54" text-anchor="middle" class="svg-ink" font-size="12">SVI shut</text><text x="440" y="72" text-anchor="middle" class="svg-ink" font-size="12">nahi hai?</text>
<rect x="525" y="30" width="105" height="56" rx="8" fill="#bbf7d0"/><text x="577" y="63" text-anchor="middle" class="svg-ink" font-size="13">up / up</text>
<line x1="160" y1="58" x2="185" y2="58" stroke="#64748b" stroke-width="2"/><line x1="355" y1="58" x2="380" y2="58" stroke="#64748b" stroke-width="2"/><line x1="500" y1="58" x2="525" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="86" x2="85" y2="130" stroke="#64748b" stroke-width="2"/><line x1="270" y1="86" x2="270" y2="130" stroke="#64748b" stroke-width="2"/><line x1="440" y1="86" x2="440" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="95" y="112" class="svg-muted" font-size="12">nahi</text><text x="280" y="112" class="svg-muted" font-size="12">nahi</text><text x="450" y="112" class="svg-muted" font-size="12">nahi</text>
<rect x="25" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="12">up / down</text>
<rect x="210" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="270" y="152" text-anchor="middle" class="svg-ink" font-size="12">up / down</text>
<rect x="380" y="130" width="120" height="34" rx="6" fill="#fed7aa"/><text x="440" y="152" text-anchor="middle" class="svg-ink" font-size="12">admin down</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">SVI utna hi up hai jitna uske peeche ka VLAN</text>
</svg><p class="cap">Teeno conditions left se right check karo; pehla "nahi" bata deta hai ki kaunsa status dikhega.</p></div>

<p>Isiliye SVI lab ka task 3 task 2 ke baad hi succeed hota hai: jab tak DSW1 Gi0/1 aur ASW1 Gi0/1 ke beech trunk up ho kar VLANs 10 aur 20 carry nahi karta, DSW1 ke paas kisi bhi VLAN mein forwarding port nahi hota aur dono SVIs up/down par baithe rehte hain.</p>
<pre class="out">DSW1# show ip interface brief | include Vlan
Vlan10                 10.1.10.1       YES manual up                    up
<span class="hl">Vlan30                 10.1.30.1       YES manual up                    down</span>

DSW1# show vlan brief | include ^30
<span class="hl">30   CAMERAS                          active</span></pre>
<p>Yahan VLAN 30 exist karta hai aur SVI shut nahi hai, isliye akela possible reason condition 2 hai: VLAN 30 ka koi port up aur forwarding nahi hai. Ek camera lagao, ya up trunk par VLAN 30 allow karo, aur SVI up ho jaata hai. Spanning tree bhi maayne rakhta hai: classic 802.1D timers ke saath naya port listening aur learning mein lagbhag 30 seconds bitata hai, aur SVI uska intezaar karta hai. Kisi port ko <code>switchport autostate exclude</code> se calculation se bahar rakha ja sakta hai, jaise monitoring port jo akele SVI ko up nahi rakhna chahiye.</p>

<h3>Routed ports: switch port jo router port jaisa kaam kare</h3>
<p>Default mein Catalyst switch ka har port <b>switchport</b> (Layer 2) hota hai. Command <code>no switchport</code> use <b>routed port</b> bana deti hai: woh kisi VLAN ka nahi hota, na spanning tree chalata hai na DTP, aur seedha IP address leta hai, bilkul router interface ki tarah. Layer 3 devices ke beech point-to-point links ke liye routed ports sahi choice hain, jaise distribution switch ka router ya core switch tak uplink.</p>
<p>SVI lab mein DSW1 Gi0/7 edge router EDGE (10.1.99.2/30) se juda hai, jiske paas 10.1.0.0/16 ka return route pehle se hai.</p>
<pre class="code">DSW1(config)# interface GigabitEthernet0/7
DSW1(config-if)# no switchport
DSW1(config-if)# ip address 10.1.99.1 255.255.255.252
DSW1(config-if)# exit
<span class="c">! Jo kuch local nahi hai woh EDGE ko jaaye</span>
DSW1(config)# ip route 0.0.0.0 0.0.0.0 10.1.99.2</pre>
<pre class="out">DSW1# show ip route | begin Gateway
<span class="hl">Gateway of last resort is 10.1.99.2 to network 0.0.0.0</span>

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.1.99.2</span>
      10.0.0.0/8 is variably subnetted, 6 subnets, 3 masks
C        10.1.10.0/24 is directly connected, Vlan10
L        10.1.10.1/32 is directly connected, Vlan10
C        10.1.20.0/24 is directly connected, Vlan20
L        10.1.20.1/32 is directly connected, Vlan20
<span class="hl">C        10.1.99.0/30 is directly connected, GigabitEthernet0/7</span>
L        10.1.99.1/32 is directly connected, GigabitEthernet0/7</pre>
<p>Ab PC1 PRN1 aur EDGE ke peeche test address 203.0.113.1 tak pahunch sakta hai. Wapsi ka raasta utna hi zaroori hai jitna jaane ka: EDGE ka <code>ip route 10.1.0.0 255.255.0.0 10.1.99.1</code> har campus VLAN ke replies ko wapas DSW1 bhejta hai. Iske bina pings chale jaate aur kabhi wapas nahi aate.</p>

<div class="eg"><p><b>Worked example: uplink ke liye SVI ya routed port?</b> Aap DSW1 se EDGE link ko VLAN 99 ke SVI 10.1.99.1 aur ek access port se bhi bana sakte ho. Chalega, lekin ab link VLAN 99 ke exist karne, spanning tree forwarding aur autostate par depend karta hai, aur agar cable fail ho to SVI tabhi down hoga jab VLAN 99 mein koi aur port na ho. Routed port link fail hote hi down hota hai, connected route turant gayab hota hai, aur koi Layer 2 loop possible nahi. Point-to-point Layer 3 links ke liye routed ports ko prefer karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Switchport par <code>ip address</code> type karna; jab tak <code>no switchport</code> na diya jaaye IOS use reject karta hai. Upstream router par return route check kiye bina default route jodna. Lab mein VLAN ka koi host connect hone se pehle SVI ke up hone ki ummeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> SVI par <code>up/down</code> shutdown problem <b>nahi</b> hai; administratively down hai. Aur <code>no switchport</code> port ko shut nahi karta ya trunk nahi banata; woh use Layer 3 routed port banata hai.</p></div>

<div class="scn"><h4>Guest SVI jo down hi raha</h4><p>Ek resort ne conference ke liye VLAN 70 banaya aur ek raat pehle distribution switch par SVI 10.70.0.1 configure kiya. Woh up/down hi raha aur event manager ghabra gaya. Engineer ne check kiya: VLAN 70 exist karta tha aur active tha; SVI shut nahi tha; lekin <code>show interfaces trunk</code> ne dikhaya ki conference-hall switch tak trunk sirf 10,20,999 allow karta tha. Usne <code>switchport trunk allowed vlan add 70</code> chalaya, aur SVI ek second mein up ho gaya kyunki trunk pehle se forwarding tha.</p><p><b>Seekh:</b> up/down par atke SVI ke liye us VLAN mein zinda, forwarding port dhoondho, trunks ki allowed list samet.</p></div>

<div class="iv"><p class="q">"Aapka SVI up/down dikha raha hai. Aap kya check karoge?"</p><p>Strong answer: autostate. <code>show vlan brief</code> mein check karo ki VLAN exist karta hai aur active hai, VLAN ka kam se kam ek access port up hai, ya koi trunk use allow aur forward karta hai (<code>show interfaces trunk</code>, aakhri list), aur spanning tree forwarding hai. Administratively down ka matlab <code>shutdown</code> hota. Advanced point ke roop mein <code>switchport autostate exclude</code> batao, aur yeh ki point-to-point uplinks ke liye routed ports prefer hote hain kyunki woh VLAN state par depend nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SVI up/up ke liye chahiye: VLAN exist aur active, usmein ek port up aur STP forwarding, SVI shut nahi.</li>
<li>up/down = VLAN ya active port ki problem; administratively down = <code>shutdown</code>.</li>
<li><code>no switchport</code> routed port banata hai: na VLAN, na STP, port par seedha IP address.</li>
<li>Point-to-point Layer 3 uplinks ke liye routed ports use karo, bahar default route aur wapas return route ke saath.</li>
<li>Trunk ki allowed list SVI ko utna hi pakka down rakh sakti hai jitna missing VLAN.</li>
</ul></div>
`}};export{e as default};