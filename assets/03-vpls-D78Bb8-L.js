var e={id:`vpls`,h:{en:`VPLS: a virtual switch across the provider core`,hi:`VPLS: provider core ke across virtual switch`},body:{en:`
<p><b>Virtual Private LAN Service (VPLS)</b> makes the whole provider network behave like one big Ethernet switch for a customer (RFC 4762 for LDP signalling, RFC 4761 for BGP signalling). Where VPWS joins two ports, VPLS joins many. Each PE holds a <b>virtual switching instance</b> that learns MAC addresses and forwards frames between local attachment circuits and pseudowires to the other PEs.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>VSI / VFI</dt><dd>Virtual Switching Instance (Cisco calls the forwarding part a VFI): the per-customer bridge on each PE.</dd>
<dt>Full mesh of pseudowires</dt><dd>Every PE in the VPLS has a pseudowire to every other PE of that VPLS.</dd>
<dt>Split horizon</dt><dd>A frame received from a pseudowire is never sent out on another pseudowire. This is the loop-prevention rule of VPLS, because a full mesh already reaches everyone.</dd>
<dt>Bridge domain</dt><dd>The Layer 2 flooding domain; on IOS XR, a bridge domain holds the ACs and the VFI.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VPLS full mesh">
<rect x="20" y="30" width="100" height="45" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE1 (VSI)</text>
<rect x="520" y="30" width="100" height="45" rx="8" fill="#bae6fd"/><text x="570" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2 (VSI)</text>
<rect x="270" y="150" width="100" height="45" rx="8" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">PE3 (VSI)</text>
<line x1="120" y1="52" x2="520" y2="52" stroke="#64748b" stroke-width="2"/><line x1="90" y1="75" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="550" y1="75" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="44" text-anchor="middle" class="svg-accent" font-size="12">full mesh of pseudowires</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">split horizon: PW to PW is never forwarded</text>
</svg><p class="cap">Each PE has a pseudowire to every other PE in the VPLS.</p></div>

<h3>Forwarding behaviour</h3>
<ol>
<li><b>Learning.</b> When a frame arrives on an AC, the PE learns the source MAC against that AC. When it arrives on a pseudowire, the PE learns the source MAC against that pseudowire.</li>
<li><b>Known unicast.</b> Forwarded out of the one AC or pseudowire in the MAC table.</li>
<li><b>Unknown unicast, broadcast and multicast.</b> Flooded to all ACs and all pseudowires of the instance, except the one it came from. A frame from a pseudowire is flooded only to ACs, never to other pseudowires (split horizon).</li>
<li><b>Aging.</b> MAC entries expire when not refreshed, and a topology change on the access side should trigger a MAC flush (MAC withdrawal) so stale entries do not blackhole.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Three PEs, each with a customer site. Site A's host on PE1 sends a broadcast ARP. PE1 floods it to its local ACs and sends one copy to PE2 and one to PE3. PE2 delivers to its local ACs only; it does not forward to PE3 (split horizon), because PE1 already sent PE3 a copy. Each frame crosses the core once per remote PE, which is why broadcast-heavy designs are costly in a large VPLS.</p></div>

<h3>Scaling: H-VPLS</h3>
<p>A full mesh needs n(n-1)/2 pseudowires. With 20 PEs that is 190. With 100 PEs it is 4,950, plus the signalling and replication load. <b>Hierarchical VPLS (H-VPLS)</b> reduces the mesh: small edge devices (<b>MTU-s</b>, multi-tenant units) connect to a <b>PE-rs</b> hub with a spoke pseudowire or a Q-in-Q link, and only the hubs form the full mesh. Spoke pseudowires are not subject to split horizon toward the mesh in the same way: the PE-rs treats the spoke as an attachment circuit for forwarding purposes.</p>

<h3>Auto-discovery and signalling</h3>
<ul>
<li><b>LDP VPLS with manual neighbours</b>: you list each neighbour in the VFI. Simple, does not scale well.</li>
<li><b>BGP auto-discovery with LDP signalling</b> (RFC 6074 style): BGP finds the other PEs and LDP sets up the PWs, so adding a PE is a local change.</li>
<li><b>BGP VPLS</b> (RFC 4761): BGP carries the labels; it uses a route distinguisher and route targets like L3VPN.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE PE1: manual LDP VPLS</span>
l2 vfi CUST-VPLS manual
 vpn id 100
 neighbor 192.0.2.2 encapsulation mpls
 neighbor 192.0.2.3 encapsulation mpls
interface Vlan100
 xconnect vfi CUST-VPLS
interface GigabitEthernet0/0/1
 service instance 100 ethernet
  encapsulation dot1q 100
  rewrite ingress tag pop 1 symmetric
  bridge-domain 100</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR PE1</span>
l2vpn
 bridge group CUST
  bridge-domain VPLS100
   interface GigabitEthernet0/0/0/1.100
   vfi VPLS100
    neighbor 192.0.2.2 pw-id 100
    neighbor 192.0.2.3 pw-id 100</pre>
<p>Verify: bridge-domain or VFI is up, each neighbour pseudowire is up, MAC table has entries learned from the expected ACs and pseudowires, and the MAC count is below the configured limit. Commands such as <code>show l2vpn bridge-domain</code> (IOS XR) and <code>show vfi</code> or <code>show mpls l2transport vc</code> (IOS XE) are used; output is not reproduced here.</p>

<h3>Protecting the provider</h3>
<ul>
<li><b>MAC limits</b> per VSI and per AC, with a defined action (drop, shut, alarm).</li>
<li><b>Storm control</b> or broadcast and multicast rate-limits on the AC.</li>
<li><b>BPDU handling</b>: normally the provider does not participate in the customer's spanning tree; the BPDUs are tunnelled or dropped by policy.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting split horizon in a hierarchical design; no MAC limit, so one customer exhausts the table; and mixing PW types or MTUs across the mesh.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a full mesh, loop prevention is split horizon, not spanning tree. H-VPLS reduces the number of PWs by moving the mesh to the hub PEs.</p></div>

<div class="scn"><h4>A customer loop floods the VPLS</h4><p>A customer patched two switch ports together and a loop formed. The VPLS replicated the broadcast storm to every site and CPU on several PEs rose. The provider shut the AC through the MAC-move and storm-control alarms, then added a per-AC broadcast limit for all VPLS customers.</p><p><b>Lesson:</b> a VPLS extends the customer's broadcast domain, so edge protections are mandatory.</p></div>

<div class="iv"><p class="q">"How does VPLS prevent loops and how does it scale?"</p><p>Full-mesh pseudowires with split horizon prevent loops: a frame from a PW is never sent to another PW. It scales poorly because of n(n-1)/2 PWs and flooding, so H-VPLS and BGP auto-discovery are used, and EVPN replaces it in modern designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPLS = per-customer virtual bridge on each PE, joined by a pseudowire mesh.</li>
<li>Split horizon prevents loops between pseudowires.</li>
<li>MACs are learned on ACs and pseudowires; unknown traffic is flooded.</li>
<li>H-VPLS and BGP auto-discovery improve scaling.</li>
<li>MAC limits and storm control protect the provider.</li>
</ul></div>
`,hi:`
<p><b>Virtual Private LAN Service (VPLS)</b> poore provider network ko customer ke liye ek bade Ethernet switch jaisa behave karata hai (LDP signalling ke liye RFC 4762, BGP signalling ke liye RFC 4761). Jahan VPWS do ports ko jodta hai, VPLS kai ko jodta hai. Har PE par ek <b>virtual switching instance</b> hota hai jo MAC addresses learn karta hai aur local attachment circuits aur doosre PEs ke pseudowires ke beech frames forward karta hai.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>VSI / VFI</dt><dd>Virtual Switching Instance (Cisco forwarding hisse ko VFI kehta hai): har PE par per-customer bridge.</dd>
<dt>Pseudowires ka full mesh</dt><dd>VPLS ke har PE ka us VPLS ke har doosre PE tak pseudowire hota hai.</dd>
<dt>Split horizon</dt><dd>Pseudowire se aaya frame kisi doosre pseudowire par kabhi nahi bheja jaata. Yeh VPLS ka loop-prevention rule hai, kyunki full mesh pehle hi sabko reach karta hai.</dd>
<dt>Bridge domain</dt><dd>Layer 2 flooding domain; IOS XR par bridge domain mein ACs aur VFI hote hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VPLS full mesh">
<rect x="20" y="30" width="100" height="45" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE1 (VSI)</text>
<rect x="520" y="30" width="100" height="45" rx="8" fill="#bae6fd"/><text x="570" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2 (VSI)</text>
<rect x="270" y="150" width="100" height="45" rx="8" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">PE3 (VSI)</text>
<line x1="120" y1="52" x2="520" y2="52" stroke="#64748b" stroke-width="2"/><line x1="90" y1="75" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="550" y1="75" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="44" text-anchor="middle" class="svg-accent" font-size="12">pseudowires ka full mesh</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">split horizon: PW se PW kabhi forward nahi</text>
</svg><p class="cap">VPLS mein har PE ka har doosre PE tak pseudowire hota hai.</p></div>

<h3>Forwarding behaviour</h3>
<ol>
<li><b>Learning.</b> Jab AC par frame aata hai to PE source MAC ko us AC ke against learn karta hai. Pseudowire par aaye to us pseudowire ke against.</li>
<li><b>Known unicast.</b> MAC table ke ek AC ya pseudowire se bahar forward.</li>
<li><b>Unknown unicast, broadcast aur multicast.</b> Instance ke saare ACs aur saare pseudowires par flood hota hai, jahan se aaya woh chhodkar. Pseudowire se aaya frame sirf ACs par flood hota hai, doosre pseudowires par nahi (split horizon).</li>
<li><b>Aging.</b> MAC entries refresh na hone par expire ho jaati hain, aur access side topology change par MAC flush (MAC withdrawal) trigger hona chahiye taaki stale entries blackhole na karein.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Teen PEs, har ek par customer site. PE1 par Site A ka host broadcast ARP bhejta hai. PE1 use apne local ACs par flood karta hai aur ek copy PE2 aur ek PE3 ko bhejta hai. PE2 sirf apne local ACs ko deliver karta hai; woh PE3 ko forward nahi karta (split horizon), kyunki PE1 ne PE3 ko pehle hi copy bhej di. Har frame har remote PE ke liye core ko ek baar cross karta hai, isliye bade VPLS mein broadcast-heavy designs mehenge hote hain.</p></div>

<h3>Scaling: H-VPLS</h3>
<p>Full mesh ko n(n-1)/2 pseudowires chahiye. 20 PEs ke saath 190. 100 PEs ke saath 4,950, plus signalling aur replication load. <b>Hierarchical VPLS (H-VPLS)</b> mesh ko kam karta hai: chhote edge devices (<b>MTU-s</b>, multi-tenant units) <b>PE-rs</b> hub se spoke pseudowire ya Q-in-Q link se jude hote hain, aur sirf hubs full mesh banate hain. Spoke pseudowires mesh ki taraf waise split horizon ke adheen nahi hote: PE-rs forwarding ke liye spoke ko attachment circuit ki tarah treat karta hai.</p>

<h3>Auto-discovery aur signalling</h3>
<ul>
<li><b>Manual neighbours ke saath LDP VPLS</b>: VFI mein har neighbour likhte ho. Simple, achha scale nahi karta.</li>
<li><b>LDP signalling ke saath BGP auto-discovery</b> (RFC 6074 style): BGP doosre PEs dhoondta hai aur LDP PWs set up karta hai, isliye PE jodna local change hai.</li>
<li><b>BGP VPLS</b> (RFC 4761): BGP labels carry karta hai; L3VPN jaisa route distinguisher aur route targets use karta hai.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE PE1: manual LDP VPLS</span>
l2 vfi CUST-VPLS manual
 vpn id 100
 neighbor 192.0.2.2 encapsulation mpls
 neighbor 192.0.2.3 encapsulation mpls
interface Vlan100
 xconnect vfi CUST-VPLS
interface GigabitEthernet0/0/1
 service instance 100 ethernet
  encapsulation dot1q 100
  rewrite ingress tag pop 1 symmetric
  bridge-domain 100</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR PE1</span>
l2vpn
 bridge group CUST
  bridge-domain VPLS100
   interface GigabitEthernet0/0/0/1.100
   vfi VPLS100
    neighbor 192.0.2.2 pw-id 100
    neighbor 192.0.2.3 pw-id 100</pre>
<p>Verify: bridge-domain ya VFI up hai, har neighbour pseudowire up hai, MAC table mein expected ACs aur pseudowires se learn hui entries hain, aur MAC count configured limit se neeche hai. <code>show l2vpn bridge-domain</code> (IOS XR) aur <code>show vfi</code> ya <code>show mpls l2transport vc</code> (IOS XE) jaise commands use hote hain; output yahan reproduce nahi kiya.</p>

<h3>Provider ko protect karna</h3>
<ul>
<li>Per VSI aur per AC <b>MAC limits</b>, defined action ke saath (drop, shut, alarm).</li>
<li>AC par <b>storm control</b> ya broadcast aur multicast rate-limits.</li>
<li><b>BPDU handling</b>: aam taur par provider customer ke spanning tree mein hissa nahi leta; BPDUs policy se tunnel ya drop hote hain.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Hierarchical design mein split horizon bhoolna; MAC limit nahi, isliye ek customer table khatam kar deta hai; aur mesh ke across PW types ya MTUs mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Full mesh mein loop prevention split horizon hai, spanning tree nahi. H-VPLS mesh ko hub PEs par le jaakar PWs ki ginti kam karta hai.</p></div>

<div class="scn"><h4>Customer loop poore VPLS ko flood karta hai</h4><p>Customer ne do switch ports ko aapas mein patch kar diya aur loop ban gaya. VPLS ne broadcast storm har site tak replicate kiya aur kai PEs par CPU badha. Provider ne MAC-move aur storm-control alarms ke zariye AC shut kiya, phir saare VPLS customers ke liye per-AC broadcast limit jodi.</p><p><b>Lesson:</b> VPLS customer ke broadcast domain ko failaata hai, isliye edge protections mandatory hain.</p></div>

<div class="iv"><p class="q">"VPLS loops kaise rokta hai aur scale kaise karta hai?"</p><p>Split horizon ke saath full-mesh pseudowires loops rokte hain: PW se aaya frame doosre PW ko kabhi nahi bheja jaata. n(n-1)/2 PWs aur flooding ki wajah se yeh kam scale karta hai, isliye H-VPLS aur BGP auto-discovery use hote hain, aur modern designs mein EVPN ise replace karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPLS = har PE par per-customer virtual bridge, pseudowire mesh se jude hue.</li>
<li>Split horizon pseudowires ke beech loops rokta hai.</li>
<li>MACs ACs aur pseudowires par learn hote hain; unknown traffic flood hota hai.</li>
<li>H-VPLS aur BGP auto-discovery scaling sudharte hain.</li>
<li>MAC limits aur storm control provider ko protect karte hain.</li>
</ul></div>
`}};export{e as default};