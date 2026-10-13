var e={id:`layer2-stp-vpc`,h:{en:`Layer 2 design: STP, vPC and the orphan-port problem`,hi:`Layer 2 design: STP, vPC aur orphan-port problem`},body:{en:`

<p>Imagine a hospital ward with two corridors to the same pharmacy. If a corridor is blocked, patients use the other one, and nobody notices. Spanning Tree Protocol (STP) closes one corridor on purpose to avoid loops. vPC opens both corridors safely. Chapter 1 gave you the fabric shape; this chapter designs the Layer 2 edge the way a real, imperfect customer needs it.</p>

<h3>The case: Meridian Hospital Group</h3>
<div class="eg"><p><b>Customer.</b> Meridian Hospital Group, two data rooms in one campus, 400 virtual and physical servers: patient records, imaging (PACS), pharmacy and a building system.</p><p><b>Requirements.</b> Recovery from a link or switch failure in under a second. No blocked uplinks. In-service upgrades, because clinical systems cannot stop. Legacy servers and an old PACS cluster need the same VLAN (same Layer 2 domain) across racks; they cannot be re-addressed.</p><p><b>Constraints.</b> Mixed server NICs: some LACP-capable, some single NIC. An existing Rapid PVST+ network. Staff trained in vPC, not VXLAN. Budget for one switch pair per data room.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>A. Rapid PVST+ or MST only</td><td>Simple, standard, any vendor</td><td>Blocks half the links; slow reconvergence on topology change; a loop is a campus-wide event</td></tr>
<tr><td>B. vPC pair (classic, physical peer-link)</td><td>All links active, fast failover, ISSU, familiar</td><td>Pair-only (two switches), peer-link must be sized, consistency rules</td></tr>
<tr><td>C. vPC Fabric Peering</td><td>No dedicated physical peer-link; the fabric carries it</td><td>Needs a VXLAN fabric and supported Nexus 9000 platforms</td></tr>
<tr><td>D. VXLAN EVPN with ESI multihoming</td><td>No pair limit, standards based</td><td>Larger project; see chapter 3</td></tr></table>

<h3>How vPC works, in design terms</h3>
<p>A <b>virtual Port Channel (vPC)</b> lets a device build one LACP port-channel whose members terminate on two different Nexus switches. The two switches are the <b>vPC peers</b>. They share a <b>vPC domain</b> and talk over a <b>peer-link</b>, which carries control traffic, synchronised MAC and ARP state, and any traffic that must cross between the peers. A separate <b>peer-keepalive</b> link (usually the management VRF, or a dedicated routed link; never the peer-link) tells each peer that the other is alive, which stops a split-brain after a peer-link failure. A device attached to only one peer is an <b>orphan port</b> device.</p>
<p>Key design settings: <code>peer-gateway</code> (a peer routes for the other's gateway MAC, helps odd NICs and appliances), <code>peer-switch</code> (both peers appear as one STP root), <code>auto-recovery</code> (recover after a dual power loss), <code>delay restore</code> (hold vPC ports down while a rebooted peer syncs), and <code>ip arp synchronize</code>. Place the STP root on the vPC pair and keep STP on, as a safety net: vPC removes blocked uplinks but not the need for loop protection (BPDU guard on host ports, Bridge Assurance on the peer-link).</p>
<pre class="code"><span class="c">! Nexus 9000, peer A</span>
feature vpc
feature lacp
vpc domain 10
  peer-switch
  peer-gateway
  auto-recovery
  delay restore 150
  ip arp synchronize
  role priority 100
  peer-keepalive destination 192.0.2.2 source 192.0.2.1 vrf management
interface port-channel1
  switchport mode trunk
  vpc peer-link
interface port-channel20
  switchport mode trunk
  vpc 20</pre>
<pre class="out">peer-a# show vpc
vPC domain id                     : 10
Peer status                       : peer adjacency formed ok
<span class="hl">vPC keep-alive status             : peer is alive</span>
Configuration consistency status  : success
vPC role                          : primary</pre>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="vPC pair with dual-homed server, access switch and one orphan device">
<line x1="200" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="3"/>
<line x1="200" y1="66" x2="440" y2="66" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="200" y1="45" x2="90" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="90" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="45" x2="320" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="320" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="550" y2="150" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="150" x2="320" y2="225" stroke="#64748b" stroke-width="1.6"/>
<rect x="156" y="28" width="88" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="162" y1="57" x2="238" y2="57" stroke="#0284c7" stroke-width="2"/><text x="200" y="49" text-anchor="middle" class="svg-ink" font-size="12">vPC peer A</text>
<rect x="396" y="28" width="88" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="402" y1="57" x2="478" y2="57" stroke="#0284c7" stroke-width="2"/><text x="440" y="49" text-anchor="middle" class="svg-ink" font-size="12">vPC peer B</text>
<rect x="35" y="133" width="110" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="39" y="137" width="6" height="26" fill="#94a3b8"/><text x="90" y="154" text-anchor="middle" class="svg-ink" font-size="12">Server (LACP)</text>
<rect x="265" y="133" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="271" y1="162" x2="369" y2="162" stroke="#0284c7" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text>
<rect x="495" y="133" width="110" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="499" y="137" width="6" height="26" fill="#94a3b8"/><text x="550" y="154" text-anchor="middle" class="svg-ink" font-size="12">Orphan device</text>
<rect x="285" y="208" width="70" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="289" y="212" width="6" height="26" fill="#94a3b8"/><text x="320" y="229" text-anchor="middle" class="svg-ink" font-size="12">VMs</text>
<text x="320" y="34" text-anchor="middle" class="svg-muted" font-size="12">peer-link</text>
<text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">keepalive (management VRF)</text>
<text x="552" y="196" text-anchor="middle" class="svg-muted" font-size="12">single-homed: at risk</text>
<line x1="16" y1="246" x2="624" y2="246" stroke="#e2e8f0"/><rect x="16" y="256" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="35" y="266" class="svg-muted" font-size="11">Leaf / access</text><rect x="320" y="256" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="339" y="266" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">One LACP bundle lands on two switches. The dashed line is the keepalive. The single-homed device on peer B (red) loses reach if the peer-link fails.</p></div>

<h3>Sizing the peer-link</h3>
<p>The peer-link normally carries little data, but after a vPC member failure all traffic for that server crosses it. Rule of thumb: provision at least as much peer-link bandwidth as the largest single failure you must absorb, and use at least two member links on different line cards or ASICs. Meridian: 2 x 100G, on two modules.</p>

<h3>Chosen design for Meridian</h3>
<p>Option B in each data room: one vPC pair with a 2 x 100G peer-link, a keepalive in the management VRF over an out-of-band network, root and secondary root set on the pair, LACP active to every server that supports it, and active-standby NIC teaming for the rest. All single-NIC clinical devices are replaced or moved to a dual-homed adapter. The PACS VLAN is kept in the data room. Cross-room Layer 2 is not built; it is a Layer 3 plus replication design (chapter 5).</p>

<div class="warn"><p><b>Common mistakes.</b> Running the keepalive over the peer-link (it stops protecting you). Forgetting to match VLANs, MTU or STP mode on both peers (consistency check suspends the vPC). Attaching a Layer 3 device through a vPC and expecting dynamic routing to work like normal; use separate routed links or check the supported design.</p></div>
<div class="exam"><p><b>Exam trap.</b> vPC is a loop-free Layer 2 multipathing feature, not a Layer 3 redundancy feature. A vPC domain has exactly two peers. And the peer-keepalive must never use the peer-link path.</p></div>

<div class="scn"><h4>What went wrong at Meridian</h4><p>After cutover, a cable-tray fault cut the peer-link; both members sat on the same line card. The secondary suspended its vPC member ports as designed, but two single-NIC pharmacy servers were orphan ports on the secondary, so they lost contact with the dual-homed database. The keepalive was fine, so there was no dual-active event; it was an orphan-port design flaw. The fix: dual-home the servers, spread peer-link members across two modules, and review every orphan device in a table.</p><p><b>Lesson:</b> list every orphan device before go-live; a vPC design is only as good as its weakest single-homed device.</p></div>

<div class="iv"><p class="q">"What happens if the vPC peer-link fails but the keepalive stays up?"</p><p>The secondary peer suspends its vPC member ports so traffic flows only through the primary. Orphan ports on the secondary stay up but become isolated from vPC devices. If the keepalive also fails, a dual-active situation is possible; auto-recovery and separate paths reduce that risk.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>STP blocks links; vPC makes both uplinks active and loop-free.</li>
<li>A vPC domain has two peers, a peer-link and a separate keepalive.</li>
<li>Use peer-switch, peer-gateway, auto-recovery and delay restore.</li>
<li>Inventory orphan devices; they are the usual vPC surprise.</li>
<li>Prefer Layer 3 between rooms; do not stretch STP.</li>
</ul></div>

`,hi:`

<p>Ek hospital ward socho jahan pharmacy tak do corridors jaate hain. Ek corridor band ho to patients doosra use karte hain, aur kisi ko pata nahi chalta. Spanning Tree Protocol (STP) loops se bachne ke liye ek corridor jaanbujhkar band rakhta hai. vPC dono corridors ko safely khol deta hai. Chapter 1 ne fabric ka shape diya; yeh chapter Layer 2 edge ko aise design karta hai jaise ek real, imperfect customer ko chahiye.</p>

<h3>Case: Meridian Hospital Group</h3>
<div class="eg"><p><b>Customer.</b> Meridian Hospital Group, ek campus mein do data rooms, 400 virtual aur physical servers: patient records, imaging (PACS), pharmacy aur ek building system.</p><p><b>Requirements.</b> Link ya switch failure se recovery ek second se kam mein. Koi blocked uplink nahi. In-service upgrades, kyunki clinical systems ruk nahi sakte. Legacy servers aur ek purane PACS cluster ko racks ke across same VLAN (same Layer 2 domain) chahiye; unhe re-address nahi kiya ja sakta.</p><p><b>Constraints.</b> Mixed server NICs: kuch LACP-capable, kuch single NIC. Existing Rapid PVST+ network. Staff vPC mein trained hai, VXLAN mein nahi. Har data room ke liye ek switch pair ka budget.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>A. Sirf Rapid PVST+ ya MST</td><td>Simple, standard, kisi bhi vendor ke saath</td><td>Aadhe links block; topology change par slow reconvergence; loop poore campus ka event ban jaata hai</td></tr>
<tr><td>B. vPC pair (classic, physical peer-link)</td><td>Saare links active, fast failover, ISSU, familiar</td><td>Sirf pair (do switches), peer-link size karna padta hai, consistency rules</td></tr>
<tr><td>C. vPC Fabric Peering</td><td>Dedicated physical peer-link nahi; fabric hi carry karta hai</td><td>VXLAN fabric aur supported Nexus 9000 platforms chahiye</td></tr>
<tr><td>D. ESI multihoming ke saath VXLAN EVPN</td><td>Pair limit nahi, standards based</td><td>Bada project; chapter 3 dekho</td></tr></table>

<h3>vPC kaise kaam karta hai, design ki nazar se</h3>
<p><b>Virtual Port Channel (vPC)</b> ek device ko ek hi LACP port-channel banane deta hai jiske members do alag Nexus switches par khatam hote hain. Yeh do switches <b>vPC peers</b> hain. Woh ek <b>vPC domain</b> share karte hain aur <b>peer-link</b> par baat karte hain, jo control traffic, synchronised MAC aur ARP state, aur peers ke beech cross hone wala traffic carry karta hai. Alag <b>peer-keepalive</b> link (aksar management VRF, ya dedicated routed link; peer-link kabhi nahi) har peer ko batata hai ki doosra zinda hai, jisse peer-link failure ke baad split-brain nahi hota. Sirf ek peer se juda device <b>orphan port</b> device kehlata hai.</p>
<p>Key design settings: <code>peer-gateway</code> (ek peer doosre ke gateway MAC ke liye route karta hai, odd NICs aur appliances mein madad), <code>peer-switch</code> (dono peers ek STP root jaise dikhte hain), <code>auto-recovery</code> (dual power loss ke baad recover), <code>delay restore</code> (reboot hue peer ke sync hone tak vPC ports down rakho), aur <code>ip arp synchronize</code>. STP root vPC pair par rakho aur STP ko safety net ke roop mein on rakho: vPC blocked uplinks hatata hai par loop protection ki zaroorat nahi (host ports par BPDU guard).</p>
<pre class="code"><span class="c">! Nexus 9000, peer A</span>
feature vpc
feature lacp
vpc domain 10
  peer-switch
  peer-gateway
  auto-recovery
  delay restore 150
  ip arp synchronize
  role priority 100
  peer-keepalive destination 192.0.2.2 source 192.0.2.1 vrf management
interface port-channel1
  switchport mode trunk
  vpc peer-link
interface port-channel20
  switchport mode trunk
  vpc 20</pre>
<pre class="out">peer-a# show vpc
vPC domain id                     : 10
Peer status                       : peer adjacency formed ok
<span class="hl">vPC keep-alive status             : peer is alive</span>
Configuration consistency status  : success
vPC role                          : primary</pre>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="vPC pair: dual-homed server, access switch aur ek orphan device">
<line x1="200" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="3"/>
<line x1="200" y1="66" x2="440" y2="66" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="200" y1="45" x2="90" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="90" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="45" x2="320" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="320" y2="150" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="45" x2="550" y2="150" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="150" x2="320" y2="225" stroke="#64748b" stroke-width="1.6"/>
<rect x="156" y="28" width="88" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="162" y1="57" x2="238" y2="57" stroke="#0284c7" stroke-width="2"/><text x="200" y="49" text-anchor="middle" class="svg-ink" font-size="12">vPC peer A</text>
<rect x="396" y="28" width="88" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="402" y1="57" x2="478" y2="57" stroke="#0284c7" stroke-width="2"/><text x="440" y="49" text-anchor="middle" class="svg-ink" font-size="12">vPC peer B</text>
<rect x="35" y="133" width="110" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="39" y="137" width="6" height="26" fill="#94a3b8"/><text x="90" y="154" text-anchor="middle" class="svg-ink" font-size="12">Server (LACP)</text>
<rect x="265" y="133" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="271" y1="162" x2="369" y2="162" stroke="#0284c7" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text>
<rect x="495" y="133" width="110" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="499" y="137" width="6" height="26" fill="#94a3b8"/><text x="550" y="154" text-anchor="middle" class="svg-ink" font-size="12">Orphan device</text>
<rect x="285" y="208" width="70" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="289" y="212" width="6" height="26" fill="#94a3b8"/><text x="320" y="229" text-anchor="middle" class="svg-ink" font-size="12">VMs</text>
<text x="320" y="34" text-anchor="middle" class="svg-muted" font-size="12">peer-link</text>
<text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">keepalive (management VRF)</text>
<text x="552" y="196" text-anchor="middle" class="svg-muted" font-size="12">single-homed: risk mein</text>
<line x1="16" y1="246" x2="624" y2="246" stroke="#e2e8f0"/><rect x="16" y="256" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="35" y="266" class="svg-muted" font-size="11">Leaf / access</text><rect x="320" y="256" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="339" y="266" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Ek LACP bundle do switches par utarta hai. Dashed line keepalive hai. Peer B par single-homed device (red) peer-link fail hone par reach kho deta hai.</p></div>

<h3>Peer-link ka size</h3>
<p>Peer-link normally kam data carry karta hai, lekin vPC member fail hone ke baad us server ka poora traffic ispar se guzarta hai. Rule of thumb: peer-link bandwidth utni rakho jitna sabse bada single failure absorb karna ho, aur kam se kam do member links alag line cards ya ASICs par. Meridian: 2 x 100G, do modules par.</p>

<h3>Meridian ke liye chosen design</h3>
<p>Har data room mein option B: 2 x 100G peer-link wala ek vPC pair, out-of-band network par management VRF mein keepalive, pair par root aur secondary root set, jo servers support karte hain unko LACP active, baaki ko active-standby NIC teaming. Saare single-NIC clinical devices replace ya dual-homed adapter par move. PACS VLAN data room ke andar rehta hai. Rooms ke beech Layer 2 nahi banaya; woh Layer 3 plus replication design hai (chapter 5).</p>

<div class="warn"><p><b>Common mistakes.</b> Keepalive ko peer-link par chalana (phir woh protect nahi karta). Dono peers par VLANs, MTU ya STP mode match na karna (consistency check vPC suspend kar deta hai). Layer 3 device ko vPC se jodkar normal jaisa dynamic routing expect karna; alag routed links use karo ya supported design check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> vPC loop-free Layer 2 multipathing feature hai, Layer 3 redundancy feature nahi. Ek vPC domain mein exactly do peers hote hain. Aur peer-keepalive kabhi peer-link path use nahi karta.</p></div>

<div class="scn"><h4>Meridian mein kya galat hua</h4><p>Cutover ke baad cable-tray fault ne peer-link kaat diya; dono members ek hi line card par the. Secondary ne design ke mutabiq apne vPC member ports suspend kiye, lekin do single-NIC pharmacy servers secondary par orphan ports the, isliye woh dual-homed database se kat gaye. Keepalive theek tha, isliye dual-active event nahi hua; yeh orphan-port design flaw tha. Fix: servers ko dual-home karo, peer-link members ko do modules par failao, aur har orphan device ko table mein review karo.</p><p><b>Lesson:</b> go-live se pehle har orphan device list karo; vPC design utna hi strong hai jitna uska sabse weak single-homed device.</p></div>

<div class="iv"><p class="q">"Agar vPC peer-link fail ho jaye par keepalive up rahe to kya hota hai?"</p><p>Secondary peer apne vPC member ports suspend kar deta hai taaki traffic sirf primary se jaye. Secondary par orphan ports up rehte hain par vPC devices se isolate ho jaate hain. Agar keepalive bhi fail ho to dual-active possible hai; auto-recovery aur alag paths is risk ko kam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>STP links block karta hai; vPC dono uplinks ko active aur loop-free banata hai.</li>
<li>vPC domain mein do peers, ek peer-link aur alag keepalive hota hai.</li>
<li>peer-switch, peer-gateway, auto-recovery aur delay restore use karo.</li>
<li>Orphan devices ki inventory banao; yahi usual vPC surprise hai.</li>
<li>Rooms ke beech Layer 3 ko prefer karo; STP ko stretch mat karo.</li>
</ul></div>

`}};export{e as default};