var e={id:`ldp-config-verify`,h:{en:`Configuring and verifying LDP (Lab 1 walkthrough)`,hi:`LDP configure aur verify karna (Lab 1 walkthrough)`},body:{en:`
<p>Switching on MPLS in a core is like switching on a new service in a building that already has electricity. The wiring (the IGP) must already reach every room; you only plug the new service into each socket (each core interface) and then walk around with a tester to prove every room works. This chapter is that walk, done on the lab topology from "Lab · LDP and label switching across the core".</p>

<h3>The starting point</h3>
<p>Skyline Net already runs OSPF area 0 on four routers in a row: PE1 (Lo0 1.1.1.1) – P1 (2.2.2.2) – P2 (3.3.3.3) – PE2 (4.4.4.4). Core links are 10.0.12.0/24, 10.0.23.0/24 and 10.0.34.0/24. PC1 sits on 192.168.1.0/24 behind PE1 Gi0/0, and PC2 on 192.168.2.0/24 behind PE2 Gi0/0. Every loopback is in OSPF, which matters for LDP. Before touching MPLS, confirm with <code>show ip route ospf</code> that each router has all four /32 loopbacks.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 topology">
<rect x="10" y="150" width="80" height="36" rx="8" fill="#fde68a"/><text x="50" y="173" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10</text>
<rect x="100" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="150" y="80" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="150" y="96" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1</text>
<rect x="230" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="280" y="80" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="280" y="96" text-anchor="middle" class="svg-muted" font-size="12">2.2.2.2</text>
<rect x="360" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="80" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="410" y="96" text-anchor="middle" class="svg-muted" font-size="12">3.3.3.3</text>
<rect x="490" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="540" y="80" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="540" y="96" text-anchor="middle" class="svg-muted" font-size="12">4.4.4.4</text>
<rect x="550" y="150" width="80" height="36" rx="8" fill="#fde68a"/><text x="590" y="173" text-anchor="middle" class="svg-ink" font-size="12">PC2 .10</text>
<line x1="200" y1="82" x2="230" y2="82" stroke="#64748b" stroke-width="3"/><line x1="330" y1="82" x2="360" y2="82" stroke="#64748b" stroke-width="3"/><line x1="460" y1="82" x2="490" y2="82" stroke="#64748b" stroke-width="3"/>
<line x1="60" y1="150" x2="120" y2="104" stroke="#64748b"/><line x1="580" y1="150" x2="560" y2="104" stroke="#64748b"/>
<text x="215" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0</text><text x="345" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0</text><text x="475" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.34.0</text>
<text x="100" y="205" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text><text x="540" y="205" text-anchor="middle" class="svg-muted" font-size="12">192.168.2.0/24</text>
<text x="345" y="140" text-anchor="middle" class="svg-accent" font-size="12">mpls ip on the three thick core links only</text>
</svg><p class="cap">Lab 1: LDP on core links, never on the customer LANs.</p></div>

<h3>Step 1: global LDP settings (all four routers)</h3>
<pre class="code"><span class="c">! PE1, P1, P2 and PE2</span>
ip cef                                  <span class="c">! on by default; MPLS needs CEF</span>
mpls label protocol ldp                 <span class="c">! default on current IOS, stated for clarity</span>
mpls ldp router-id Loopback0 force      <span class="c">! stable, advertised router ID</span></pre>
<p>Why <b>force</b>? Without it, a new router ID is only used after LDP restarts (for example a reload or <code>clear mpls ldp neighbor *</code>). With <code>force</code>, the change takes effect immediately, which resets existing sessions, so use it carefully in production.</p>

<h3>Step 2: enable MPLS on the core interfaces</h3>
<pre class="code"><span class="c">! PE1</span>
interface GigabitEthernet0/1
 mpls ip
<span class="c">! P1</span>
interface GigabitEthernet0/1
 mpls ip
interface GigabitEthernet0/2
 mpls ip
<span class="c">! P2</span>
interface GigabitEthernet0/2
 mpls ip
interface GigabitEthernet0/3
 mpls ip
<span class="c">! PE2</span>
interface GigabitEthernet0/3
 mpls ip</pre>
<p>Do <b>not</b> enable it on Gi0/0 toward the PCs: hosts do not speak LDP, and the lab checks that the customer LANs stay unlabelled. An alternative on larger networks is <code>mpls ldp autoconfig</code> under <code>router ospf 1</code>, which enables LDP on every OSPF interface in area 0; you would then need to be careful with passive or customer-facing interfaces.</p>

<h3>Step 3: verify, bottom-up</h3>
<pre class="out">P1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
<span class="hl">GigabitEthernet0/1     Yes (ldp)     No       No  No     Yes</span>
<span class="hl">GigabitEthernet0/2     Yes (ldp)     No       No  No     Yes</span>

P1# show mpls ldp discovery
 Local LDP Identifier:
    2.2.2.2:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
<span class="hl">            LDP Id: 1.1.1.1:0</span>
        GigabitEthernet0/2 (ldp): xmit/recv
<span class="hl">            LDP Id: 3.3.3.3:0</span>

P1# show mpls ldp neighbor
    Peer LDP Ident: 1.1.1.1:0; Local LDP Ident 2.2.2.2:0
        TCP connection: 1.1.1.1.646 - 2.2.2.2.46120
<span class="hl">        State: Oper; Msgs sent/rcvd: 21/20; Downstream</span>
        Up time: 00:03:12
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.1
        Addresses bound to peer LDP Ident:
          10.0.12.1       192.168.1.1     1.1.1.1
    Peer LDP Ident: 3.3.3.3:0; Local LDP Ident 2.2.2.2:0
        TCP connection: 3.3.3.3.38817 - 2.2.2.2.646
<span class="hl">        State: Oper; Msgs sent/rcvd: 22/22; Downstream</span>
        Up time: 00:03:05
        LDP discovery sources:
          GigabitEthernet0/2, Src IP addr: 10.0.23.3
        Addresses bound to peer LDP Ident:
          10.0.23.3       10.0.34.3       3.3.3.3</pre>
<p>Read the TCP lines: toward PE1, P1 (2.2.2.2, higher) is active and uses a random port; toward P2, P2 (3.3.3.3, higher) is active. "Downstream" means downstream unsolicited mode. P1 must show exactly two neighbours, and PE1 and PE2 one each.</p>

<h3>Step 4: read the labels and prove the path</h3>
<pre class="out">P2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 9
        local binding:  label: 17
        remote binding: lsr: 2.2.2.2:0, label: 22
<span class="hl">        remote binding: lsr: 4.4.4.4:0, label: imp-null</span>

PE1# traceroute 4.4.4.4
<span class="hl">  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 1 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 3 msec 2 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec

PE1# show mpls forwarding-table 192.168.2.0
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">20         23         192.168.2.0/24   0             Gi0/1      10.0.12.2</span></pre>
<p>That answers the lab tasks: PE2 advertises <b>imp-null</b> for its loopback; the path to 4.4.4.4 is push at PE1, swap at P1, pop at P2; and PE1 imposes label 23 for the customer LAN 192.168.2.0/24, so a ping from PC1 to 192.168.2.10 rides the LSP.</p>

<div class="eg"><p><b>Worked example: counting sessions.</b> A core with n routers in a line has n − 1 links, so 4 routers give 3 LDP sessions. If P1 had a second parallel link to P2, you would still see <b>one</b> session between them (one per pair of LDP IDs), with two discovery sources listed under that neighbour.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>mpls ip</code> on one end of a link only; forgetting <code>force</code> and wondering why the router ID did not change; enabling MPLS on customer-facing ports; and using a loopback as router ID that OSPF does not advertise.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>mpls ip</code> is an <b>interface</b> command (also enabled globally by default). <code>mpls ldp router-id</code> is global. <code>mpls ldp autoconfig</code> is configured under the OSPF (or IS-IS) process. <code>show mpls ldp neighbor</code> State "Oper" is the healthy state.</p></div>

<div class="scn"><h4>Router ID that would not move</h4><p>An engineer added <code>mpls ldp router-id Loopback0</code> on a P router whose LDP ID was still showing an old interface address 10.0.23.2. Hours later nothing had changed, and a colleague's session troubleshooting kept pointing to 10.0.23.2. The command without <code>force</code> only applies at the next LDP restart. In a maintenance window they added <code>force</code>, the sessions reset once, and every neighbour now saw 2.2.2.2:0.</p><p><b>Lesson:</b> the LDP router ID change needs <code>force</code> or a session restart; plan it as a disruptive change.</p></div>

<div class="iv"><p class="q">"How do you enable and verify LDP on a Cisco core?"</p><p>Make sure CEF and the IGP are working and loopbacks are advertised. Globally set <code>mpls ldp router-id Loopback0 force</code>, then <code>mpls ip</code> on every core interface (or <code>mpls ldp autoconfig</code> under OSPF). Verify with show mpls interfaces, show mpls ldp discovery, show mpls ldp neighbor (State Oper), show mpls ldp bindings and show mpls forwarding-table, and finally a traceroute between PE loopbacks showing labels on every core hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP first: every loopback used as LDP router ID must be in the routing table everywhere.</li>
<li>Global: mpls label protocol ldp, mpls ldp router-id Loopback0 force. Interface: mpls ip on both ends of core links.</li>
<li>Verify in order: interfaces, discovery, neighbor (Oper), bindings, forwarding-table, traceroute.</li>
<li>One LDP session per pair of LSRs, even with parallel links.</li>
<li>Keep MPLS off customer-facing ports; in the lab PE1 must impose a numeric label for 192.168.2.0/24.</li>
</ul></div>
`,hi:`
<p>Core mein MPLS on karna ek aisi building mein nayi service on karne jaisa hai jismein pehle se bijli hai. Wiring (IGP) pehle se har kamre tak pahunchni chahiye; aap bas nayi service ko har socket (har core interface) mein plug karte ho aur phir tester lekar ghoomte ho yeh prove karne ke liye ki har kamra kaam karta hai. Yeh chapter wahi ghoomna hai, "Lab · Core mein LDP aur label switching" wali lab topology par.</p>

<h3>Starting point</h3>
<p>Skyline Net pehle se ek line mein chaar routers par OSPF area 0 chalata hai: PE1 (Lo0 1.1.1.1) – P1 (2.2.2.2) – P2 (3.3.3.3) – PE2 (4.4.4.4). Core links 10.0.12.0/24, 10.0.23.0/24 aur 10.0.34.0/24 hain. PC1 PE1 Gi0/0 ke peeche 192.168.1.0/24 par hai, aur PC2 PE2 Gi0/0 ke peeche 192.168.2.0/24 par. Har loopback OSPF mein hai, jo LDP ke liye zaroori hai. MPLS chhoone se pehle <code>show ip route ospf</code> se confirm karo ki har router ke paas chaaron /32 loopbacks hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 topology">
<rect x="10" y="150" width="80" height="36" rx="8" fill="#fde68a"/><text x="50" y="173" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10</text>
<rect x="100" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="150" y="80" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="150" y="96" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1</text>
<rect x="230" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="280" y="80" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="280" y="96" text-anchor="middle" class="svg-muted" font-size="12">2.2.2.2</text>
<rect x="360" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="80" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="410" y="96" text-anchor="middle" class="svg-muted" font-size="12">3.3.3.3</text>
<rect x="490" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="540" y="80" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="540" y="96" text-anchor="middle" class="svg-muted" font-size="12">4.4.4.4</text>
<rect x="550" y="150" width="80" height="36" rx="8" fill="#fde68a"/><text x="590" y="173" text-anchor="middle" class="svg-ink" font-size="12">PC2 .10</text>
<line x1="200" y1="82" x2="230" y2="82" stroke="#64748b" stroke-width="3"/><line x1="330" y1="82" x2="360" y2="82" stroke="#64748b" stroke-width="3"/><line x1="460" y1="82" x2="490" y2="82" stroke="#64748b" stroke-width="3"/>
<line x1="60" y1="150" x2="120" y2="104" stroke="#64748b"/><line x1="580" y1="150" x2="560" y2="104" stroke="#64748b"/>
<text x="215" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0</text><text x="345" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0</text><text x="475" y="45" text-anchor="middle" class="svg-muted" font-size="12">10.0.34.0</text>
<text x="100" y="205" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text><text x="540" y="205" text-anchor="middle" class="svg-muted" font-size="12">192.168.2.0/24</text>
<text x="345" y="140" text-anchor="middle" class="svg-accent" font-size="12">mpls ip sirf teen mote core links par</text>
</svg><p class="cap">Lab 1: core links par LDP, customer LANs par kabhi nahi.</p></div>

<h3>Step 1: global LDP settings (chaaron routers)</h3>
<pre class="code"><span class="c">! PE1, P1, P2 aur PE2</span>
ip cef                                  <span class="c">! default mein on; MPLS ko CEF chahiye</span>
mpls label protocol ldp                 <span class="c">! current IOS par default, clarity ke liye likha</span>
mpls ldp router-id Loopback0 force      <span class="c">! stable, advertised router ID</span></pre>
<p><b>force</b> kyun? Iske bina naya router ID sirf LDP restart ke baad use hota hai (jaise reload ya <code>clear mpls ldp neighbor *</code>). <code>force</code> ke saath change turant lagta hai, jo existing sessions reset karta hai, isliye production mein dhyan se use karo.</p>

<h3>Step 2: core interfaces par MPLS on karo</h3>
<pre class="code"><span class="c">! PE1</span>
interface GigabitEthernet0/1
 mpls ip
<span class="c">! P1</span>
interface GigabitEthernet0/1
 mpls ip
interface GigabitEthernet0/2
 mpls ip
<span class="c">! P2</span>
interface GigabitEthernet0/2
 mpls ip
interface GigabitEthernet0/3
 mpls ip
<span class="c">! PE2</span>
interface GigabitEthernet0/3
 mpls ip</pre>
<p>PCs ki taraf Gi0/0 par ise on <b>mat</b> karo: hosts LDP nahi bolte, aur lab check karti hai ki customer LANs unlabelled rahein. Bade networks par ek alternative <code>router ospf 1</code> ke andar <code>mpls ldp autoconfig</code> hai, jo area 0 ke har OSPF interface par LDP on kar deta hai; tab aapko passive ya customer-facing interfaces ke saath dhyan rakhna padega.</p>

<h3>Step 3: verify, neeche se upar</h3>
<pre class="out">P1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
<span class="hl">GigabitEthernet0/1     Yes (ldp)     No       No  No     Yes</span>
<span class="hl">GigabitEthernet0/2     Yes (ldp)     No       No  No     Yes</span>

P1# show mpls ldp discovery
 Local LDP Identifier:
    2.2.2.2:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
<span class="hl">            LDP Id: 1.1.1.1:0</span>
        GigabitEthernet0/2 (ldp): xmit/recv
<span class="hl">            LDP Id: 3.3.3.3:0</span>

P1# show mpls ldp neighbor
    Peer LDP Ident: 1.1.1.1:0; Local LDP Ident 2.2.2.2:0
        TCP connection: 1.1.1.1.646 - 2.2.2.2.46120
<span class="hl">        State: Oper; Msgs sent/rcvd: 21/20; Downstream</span>
        Up time: 00:03:12
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.1
        Addresses bound to peer LDP Ident:
          10.0.12.1       192.168.1.1     1.1.1.1
    Peer LDP Ident: 3.3.3.3:0; Local LDP Ident 2.2.2.2:0
        TCP connection: 3.3.3.3.38817 - 2.2.2.2.646
<span class="hl">        State: Oper; Msgs sent/rcvd: 22/22; Downstream</span>
        Up time: 00:03:05
        LDP discovery sources:
          GigabitEthernet0/2, Src IP addr: 10.0.23.3
        Addresses bound to peer LDP Ident:
          10.0.23.3       10.0.34.3       3.3.3.3</pre>
<p>TCP lines padho: PE1 ki taraf P1 (2.2.2.2, bada) active hai aur random port use karta hai; P2 ki taraf P2 (3.3.3.3, bada) active hai. "Downstream" ka matlab downstream unsolicited mode. P1 par bilkul do neighbours dikhne chahiye, aur PE1 aur PE2 par ek ek.</p>

<h3>Step 4: labels padho aur path prove karo</h3>
<pre class="out">P2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 9
        local binding:  label: 17
        remote binding: lsr: 2.2.2.2:0, label: 22
<span class="hl">        remote binding: lsr: 4.4.4.4:0, label: imp-null</span>

PE1# traceroute 4.4.4.4
<span class="hl">  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 1 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 3 msec 2 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec

PE1# show mpls forwarding-table 192.168.2.0
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">20         23         192.168.2.0/24   0             Gi0/1      10.0.12.2</span></pre>
<p>Isse lab tasks ke jawab milte hain: PE2 apne loopback ke liye <b>imp-null</b> advertise karta hai; 4.4.4.4 ka path PE1 par push, P1 par swap, P2 par pop hai; aur PE1 customer LAN 192.168.2.0/24 ke liye label 23 impose karta hai, isliye PC1 se 192.168.2.10 ka ping LSP par chalta hai.</p>

<div class="eg"><p><b>Worked example: sessions ginna.</b> Ek line mein n routers wale core mein n − 1 links hote hain, to 4 routers se 3 LDP sessions bante hain. Agar P1 ka P2 tak ek doosra parallel link hota, to bhi aapko unke beech <b>ek</b> hi session dikhta (LDP IDs ke har pair ke liye ek), us neighbour ke neeche do discovery sources ke saath.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Link ke sirf ek end par <code>mpls ip</code> configure karna; <code>force</code> bhoolna aur sochna ki router ID kyun nahi badla; customer-facing ports par MPLS on karna; aur aisa loopback router ID banana jo OSPF advertise nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>mpls ip</code> ek <b>interface</b> command hai (globally bhi default mein on hota hai). <code>mpls ldp router-id</code> global hai. <code>mpls ldp autoconfig</code> OSPF (ya IS-IS) process ke andar configure hota hai. <code>show mpls ldp neighbor</code> mein State "Oper" healthy state hai.</p></div>

<div class="scn"><h4>Router ID jo hil hi nahi raha tha</h4><p>Ek engineer ne ek P router par <code>mpls ldp router-id Loopback0</code> joda jiska LDP ID ab bhi ek purana interface address 10.0.23.2 dikha raha tha. Ghanton baad bhi kuch nahi badla, aur ek colleague ki session troubleshooting 10.0.23.2 ki taraf hi point karti rahi. <code>force</code> ke bina command sirf agle LDP restart par lagta hai. Maintenance window mein unhone <code>force</code> joda, sessions ek baar reset hue, aur ab har neighbour ko 2.2.2.2:0 dikha.</p><p><b>Seekh:</b> LDP router ID change ko <code>force</code> ya session restart chahiye; ise disruptive change ki tarah plan karo.</p></div>

<div class="iv"><p class="q">"Cisco core par LDP kaise enable aur verify karte ho?"</p><p>Pakka karo ki CEF aur IGP kaam kar rahe hain aur loopbacks advertised hain. Globally <code>mpls ldp router-id Loopback0 force</code> set karo, phir har core interface par <code>mpls ip</code> (ya OSPF ke andar <code>mpls ldp autoconfig</code>). show mpls interfaces, show mpls ldp discovery, show mpls ldp neighbor (State Oper), show mpls ldp bindings aur show mpls forwarding-table se verify karo, aur aakhir mein PE loopbacks ke beech traceroute jo har core hop par labels dikhaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle IGP: LDP router ID wala har loopback har jagah routing table mein hona chahiye.</li>
<li>Global: mpls label protocol ldp, mpls ldp router-id Loopback0 force. Interface: core links ke dono ends par mpls ip.</li>
<li>Is order mein verify karo: interfaces, discovery, neighbor (Oper), bindings, forwarding-table, traceroute.</li>
<li>LSRs ke har pair ke liye ek LDP session, parallel links ke saath bhi.</li>
<li>Customer-facing ports par MPLS off rakho; lab mein PE1 ko 192.168.2.0/24 ke liye numeric label impose karna chahiye.</li>
</ul></div>
`}};export{e as default};