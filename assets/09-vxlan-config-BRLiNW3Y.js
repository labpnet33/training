var e={id:`vxlan-config`,h:{en:`Configure and verify VXLAN: NX-OS lab and IOS XE concepts`,hi:`VXLAN configure aur verify karna: NX-OS lab aur IOS XE concepts`},body:{en:`
<p>Setting up VXLAN is like connecting two offices with a pneumatic tube system. First you make sure the pipe between the buildings is open (underlay). Then you label which department's mail goes into which tube (VLAN to VNI). Then you build the sending and receiving station (nve1) and tell it where the other station is (peer or multicast group). The configuration follows exactly that order.</p>

<h3>Step 0: underlay and loopbacks</h3>
<p>In the lab the underlay is already running: VTEP1 (Loopback0 1.1.1.1) and VTEP2 (Loopback0 2.2.2.2) advertise their loopbacks in OSPF area 0 through SPINE. Test first: <code>ping 2.2.2.2 source 1.1.1.1</code> from VTEP1. The VTEP source <b>must</b> be a loopback that the underlay routes; physical interface addresses go down with the link and break the tunnel.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VXLAN lab configuration map">
<rect x="20" y="20" width="270" height="170" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="14">VTEP1</text>
<text x="155" y="70" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0 access VLAN 10 (PC1)</text>
<text x="155" y="92" text-anchor="middle" class="svg-accent" font-size="12">vlan 10 → vn-segment 10010</text>
<text x="155" y="114" text-anchor="middle" class="svg-muted" font-size="12">nve1 source loopback0 1.1.1.1</text>
<text x="155" y="136" text-anchor="middle" class="svg-accent" font-size="12">member vni 10010</text>
<text x="155" y="158" text-anchor="middle" class="svg-accent" font-size="12">ingress-replication 2.2.2.2</text>
<rect x="350" y="20" width="270" height="170" rx="10" fill="#bae6fd"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="14">VTEP2</text>
<text x="485" y="70" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0 access VLAN 10 (PC2)</text>
<text x="485" y="92" text-anchor="middle" class="svg-accent" font-size="12">vlan 10 → vn-segment 10010</text>
<text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="12">nve1 source loopback0 2.2.2.2</text>
<text x="485" y="136" text-anchor="middle" class="svg-accent" font-size="12">member vni 10010</text>
<text x="485" y="158" text-anchor="middle" class="svg-accent" font-size="12">ingress-replication 1.1.1.1</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="3"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">VNI must match; each VTEP lists the other as peer</text>
</svg><p class="cap">The lab configuration on one page: mirror images with swapped peer addresses.</p></div>

<h3>Step 1 to 3: NX-OS configuration (the lab)</h3>
<pre class="code"><span class="c">! 1. enable the features</span>
VTEP1(config)# feature nv overlay
VTEP1(config)# feature vn-segment-vlan-based
<span class="c">! 2. map the local VLAN to the fabric-wide VNI</span>
VTEP1(config)# vlan 10
VTEP1(config-vlan)#  vn-segment 10010
<span class="c">! 3. the NVE interface: source, member VNI, BUM method</span>
VTEP1(config)# interface nve1
VTEP1(config-if-nve)#  source-interface loopback0
VTEP1(config-if-nve)#  member vni 10010 ingress-replication 2.2.2.2
VTEP1(config-if-nve)#  no shutdown</pre>
<div class="note"><p><b>Syntax note.</b> The lab accepts the one-line form above. On a real Nexus the static peer is entered in sub-mode: <code>member vni 10010</code>, then <code>ingress-replication protocol static</code>, then <code>peer-ip 2.2.2.2</code>. Same meaning, same verification output.</p></div>
<p>VTEP2 mirrors it with <code>member vni 10010 ingress-replication 1.1.1.1</code>. With an underlay multicast design the member line becomes <code>member vni 10010 mcast-group 239.1.1.10</code>, and PIM must run in the underlay. With BGP EVPN, you add <code>host-reachability protocol bgp</code> under nve1 and replace the static peer with <code>ingress-replication protocol bgp</code>.</p>

<h3>IOS XE: the same ideas, different words</h3>
<p>On Catalyst 9000 switches, VXLAN is normally deployed with BGP EVPN or inside SD-Access (where Catalyst Center generates the LISP and VXLAN configuration). The building blocks look like this at concept level:</p>
<pre class="code"><span class="c">! Catalyst 9000, VXLAN with BGP EVPN (concept level)</span>
l2vpn evpn
 replication-type ingress
 router-id Loopback0
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
vlan configuration 10
 member evpn-instance 10 vni 10010
interface nve1
 no ip address
 source-interface Loopback0
 host-reachability protocol bgp
 member vni 10010 ingress-replication
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 address-family l2vpn evpn
  neighbor 2.2.2.2 activate
  neighbor 2.2.2.2 send-community both</pre>
<p>On IOS XE routers (for example Catalyst 8000 or ASR 1000) a VNI is attached to a <b>bridge-domain</b> together with an Ethernet service instance, and nve1 carries <code>member vni 10010 mcast-group 239.1.1.10</code>. The exam will not ask you to type these; it expects you to recognise VNI, VTEP source loopback, nve interface and the BUM method in any syntax.</p>

<h3>Step 4: verification (NX-OS output from the lab)</h3>
<pre class="out">VTEP1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      2.2.2.2          Up    DP        00:03:12 n/a</span>

VTEP1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP

Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span></pre>
<p>"DP" in LearnType and Mode means data-plane learning (flood and learn). With BGP EVPN it would say "CP". "UnicastStatic" means static ingress replication.</p>
<pre class="out">VTEP1# show mac address-table vlan 10
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     5254.0012.0011   dynamic  0         F      F    Gi1/0
<span class="hl">*   10     5254.0012.0012   dynamic  0         F      F    nve1(2.2.2.2)</span></pre>
<p>The second line is the proof of flood and learn: PC2's MAC is reached through nve1 toward VTEP 2.2.2.2.</p>

<div class="eg"><p><b>Worked example: VLAN numbers may differ.</b> VTEP1 maps VLAN 10 to VNI 10010. VTEP2 could map VLAN 210 to VNI 10010 and PC2 would still be in the same Layer 2 segment, because the VNI is what travels on the wire; the VLAN is only local. The reverse is fatal: VLAN 10 mapped to VNI 10010 on one side and 10020 on the other gives two separate segments.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>no shutdown</code> on nve1 (it is shut by default on NX-OS), or pointing <code>source-interface</code> at a loopback that is not advertised in the underlay. Both give an empty <code>show nve peers</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>vn-segment</code> is configured under the <b>VLAN</b>; <code>member vni</code> is configured under <b>nve1</b>. The VTEP address comes from <code>source-interface</code>, never from the access port. And you need <b>both</b> features: <code>nv overlay</code> and <code>vn-segment-vlan-based</code>.</p></div>

<div class="scn"><h4>The new leaf that nobody could see</h4><p>A new leaf was added to a flood-and-learn fabric of six VTEPs. Its servers could reach each other but nothing else. <code>show nve peers</code> on the new leaf listed all six peers, yet no other VTEP listed the new one. The engineer had added the new leaf's loopback to its own ingress-replication list but not to the lists of the six existing VTEPs, so BUM from them never reached it and ARP failed. Adding the peer everywhere fixed it; the team later migrated to BGP EVPN so route type 3 builds the lists automatically.</p><p><b>Lesson:</b> static ingress replication must be symmetric on every VTEP. That operational burden is a key reason to use a control plane.</p></div>

<div class="iv"><p class="q">"Walk me through a minimal VXLAN configuration on a Nexus switch and how you verify it."</p><p>Strong answer: enable feature nv overlay and vn-segment-vlan-based, map the VLAN with vn-segment, create nve1 with source-interface loopback0, add member vni with either ingress-replication peers or a multicast group, and no shutdown. Verify with show nve peers (peer Up), show nve vni (VNI Up, mode DP or CP), show mac address-table (remote MACs on nve1 with the peer IP), and check underlay MTU with a DF-bit ping between loopbacks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay loopbacks, features, VLAN-to-VNI mapping, nve1, peers or group.</li>
<li>NX-OS: <code>vn-segment</code> under the VLAN, <code>member vni</code> under nve1, <code>source-interface loopback0</code>.</li>
<li>BUM: <code>ingress-replication &lt;peer&gt;</code>, <code>mcast-group &lt;group&gt;</code> or <code>ingress-replication protocol bgp</code>.</li>
<li>Verify: show nve peers, show nve vni, show mac address-table (remote MAC on nve1).</li>
<li>VNI must match end to end; local VLAN numbers may differ.</li>
</ul></div>
`,hi:`
<p>VXLAN setup karna do offices ko pneumatic tube system se jodne jaisa hai. Pehle pakka karo ki buildings ke beech pipe khuli hai (underlay). Phir label lagao ki kaunse department ki daak kaunsi tube mein jaayegi (VLAN se VNI). Phir sending aur receiving station banao (nve1) aur use batao doosra station kahan hai (peer ya multicast group). Configuration bilkul isi order mein chalti hai.</p>

<h3>Step 0: underlay aur loopbacks</h3>
<p>Lab mein underlay pehle se chal raha hai: VTEP1 (Loopback0 1.1.1.1) aur VTEP2 (Loopback0 2.2.2.2) SPINE ke through OSPF area 0 mein apne loopbacks advertise karte hain. Pehle test karo: VTEP1 se <code>ping 2.2.2.2 source 1.1.1.1</code>. VTEP source <b>zaroor</b> ek aisa loopback hona chahiye jise underlay route kare; physical interface ke addresses link ke saath down ho jaate hain aur tunnel tod dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VXLAN lab configuration map">
<rect x="20" y="20" width="270" height="170" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="14">VTEP1</text>
<text x="155" y="70" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0 access VLAN 10 (PC1)</text>
<text x="155" y="92" text-anchor="middle" class="svg-accent" font-size="12">vlan 10 → vn-segment 10010</text>
<text x="155" y="114" text-anchor="middle" class="svg-muted" font-size="12">nve1 source loopback0 1.1.1.1</text>
<text x="155" y="136" text-anchor="middle" class="svg-accent" font-size="12">member vni 10010</text>
<text x="155" y="158" text-anchor="middle" class="svg-accent" font-size="12">ingress-replication 2.2.2.2</text>
<rect x="350" y="20" width="270" height="170" rx="10" fill="#bae6fd"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="14">VTEP2</text>
<text x="485" y="70" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0 access VLAN 10 (PC2)</text>
<text x="485" y="92" text-anchor="middle" class="svg-accent" font-size="12">vlan 10 → vn-segment 10010</text>
<text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="12">nve1 source loopback0 2.2.2.2</text>
<text x="485" y="136" text-anchor="middle" class="svg-accent" font-size="12">member vni 10010</text>
<text x="485" y="158" text-anchor="middle" class="svg-accent" font-size="12">ingress-replication 1.1.1.1</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="3"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">VNI match hona chahiye; har VTEP doosre ko peer banata hai</text>
</svg><p class="cap">Ek page par lab configuration: mirror images, peer addresses badle hue.</p></div>

<h3>Step 1 se 3: NX-OS configuration (lab)</h3>
<pre class="code"><span class="c">! 1. features chalu karo</span>
VTEP1(config)# feature nv overlay
VTEP1(config)# feature vn-segment-vlan-based
<span class="c">! 2. local VLAN ko fabric-wide VNI se map karo</span>
VTEP1(config)# vlan 10
VTEP1(config-vlan)#  vn-segment 10010
<span class="c">! 3. NVE interface: source, member VNI, BUM method</span>
VTEP1(config)# interface nve1
VTEP1(config-if-nve)#  source-interface loopback0
VTEP1(config-if-nve)#  member vni 10010 ingress-replication 2.2.2.2
VTEP1(config-if-nve)#  no shutdown</pre>
<div class="note"><p><b>Syntax note.</b> Lab upar wala one-line form accept karta hai. Asli Nexus par static peer sub-mode mein diya jaata hai: <code>member vni 10010</code>, phir <code>ingress-replication protocol static</code>, phir <code>peer-ip 2.2.2.2</code>. Matlab wahi, verification output wahi.</p></div>
<p>VTEP2 ise <code>member vni 10010 ingress-replication 1.1.1.1</code> ke saath mirror karta hai. Underlay multicast design mein member line <code>member vni 10010 mcast-group 239.1.1.10</code> ban jaati hai, aur underlay mein PIM chalna chahiye. BGP EVPN ke saath aap nve1 ke neeche <code>host-reachability protocol bgp</code> jodte ho aur static peer ko <code>ingress-replication protocol bgp</code> se badalte ho.</p>

<h3>IOS XE: same ideas, alag shabd</h3>
<p>Catalyst 9000 switches par VXLAN normally BGP EVPN ke saath ya SD-Access ke andar deploy hota hai (jahan Catalyst Center LISP aur VXLAN configuration generate karta hai). Concept level par building blocks aise dikhte hain:</p>
<pre class="code"><span class="c">! Catalyst 9000, BGP EVPN ke saath VXLAN (concept level)</span>
l2vpn evpn
 replication-type ingress
 router-id Loopback0
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
vlan configuration 10
 member evpn-instance 10 vni 10010
interface nve1
 no ip address
 source-interface Loopback0
 host-reachability protocol bgp
 member vni 10010 ingress-replication
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 address-family l2vpn evpn
  neighbor 2.2.2.2 activate
  neighbor 2.2.2.2 send-community both</pre>
<p>IOS XE routers (jaise Catalyst 8000 ya ASR 1000) par VNI ek <b>bridge-domain</b> se Ethernet service instance ke saath juda hota hai, aur nve1 par <code>member vni 10010 mcast-group 239.1.1.10</code> hota hai. Exam aapse yeh type nahi karwayega; woh chahta hai ki aap kisi bhi syntax mein VNI, VTEP source loopback, nve interface aur BUM method pehchan lo.</p>

<h3>Step 4: verification (lab ka NX-OS output)</h3>
<pre class="out">VTEP1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      2.2.2.2          Up    DP        00:03:12 n/a</span>

VTEP1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP

Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span></pre>
<p>LearnType aur Mode mein "DP" ka matlab data-plane learning (flood and learn). BGP EVPN ke saath "CP" hota. "UnicastStatic" ka matlab static ingress replication.</p>
<pre class="out">VTEP1# show mac address-table vlan 10
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     5254.0012.0011   dynamic  0         F      F    Gi1/0
<span class="hl">*   10     5254.0012.0012   dynamic  0         F      F    nve1(2.2.2.2)</span></pre>
<p>Doosri line flood and learn ka saboot hai: PC2 ka MAC nve1 ke through VTEP 2.2.2.2 ki taraf pahunchta hai.</p>

<div class="eg"><p><b>Worked example: VLAN numbers alag ho sakte hain.</b> VTEP1 VLAN 10 ko VNI 10010 se map karta hai. VTEP2 VLAN 210 ko VNI 10010 se map kar sakta hai aur PC2 phir bhi same Layer 2 segment mein hoga, kyunki wire par VNI jaata hai; VLAN sirf local hai. Ulta jaanleva hai: ek side VLAN 10 VNI 10010 par aur doosri side 10020 par, to do alag segments ban jaate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> nve1 par <code>no shutdown</code> bhool jaana (NX-OS par default mein shut hota hai), ya <code>source-interface</code> ko aise loopback par point karna jo underlay mein advertise nahi hai. Dono se <code>show nve peers</code> khaali aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>vn-segment</code> <b>VLAN</b> ke neeche configure hota hai; <code>member vni</code> <b>nve1</b> ke neeche. VTEP address <code>source-interface</code> se aata hai, access port se kabhi nahi. Aur aapko <b>dono</b> features chahiye: <code>nv overlay</code> aur <code>vn-segment-vlan-based</code>.</p></div>

<div class="scn"><h4>Naya leaf jise koi nahi dekh paaya</h4><p>Chhe VTEPs ke flood-and-learn fabric mein ek naya leaf joda gaya. Uske servers ek doosre tak pahunch rahe the lekin aur kahin nahi. Naye leaf par <code>show nve peers</code> ne saare chhe peers dikhaye, phir bhi kisi aur VTEP ne naye ko list nahi kiya. Engineer ne naye leaf ka loopback uski apni ingress-replication list mein joda tha lekin chhe purane VTEPs ki lists mein nahi, isliye unka BUM kabhi usse nahi pahuncha aur ARP fail hua. Har jagah peer jodne se theek hua; baad mein team BGP EVPN par gayi taaki route type 3 lists apne aap banaye.</p><p><b>Seekh:</b> static ingress replication har VTEP par symmetric honi chahiye. Yahi operational bojh control plane use karne ki badi wajah hai.</p></div>

<div class="iv"><p class="q">"Nexus switch par minimal VXLAN configuration aur use verify karna samjhao."</p><p>Strong answer: feature nv overlay aur vn-segment-vlan-based chalu karo, VLAN ko vn-segment se map karo, source-interface loopback0 ke saath nve1 banao, ingress-replication peers ya multicast group ke saath member vni jodo, aur no shutdown. Verify karo show nve peers (peer Up), show nve vni (VNI Up, mode DP ya CP), show mac address-table (peer IP ke saath nve1 par remote MACs) se, aur loopbacks ke beech DF-bit ping se underlay MTU check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay loopbacks, features, VLAN-se-VNI mapping, nve1, peers ya group.</li>
<li>NX-OS: VLAN ke neeche <code>vn-segment</code>, nve1 ke neeche <code>member vni</code>, <code>source-interface loopback0</code>.</li>
<li>BUM: <code>ingress-replication &lt;peer&gt;</code>, <code>mcast-group &lt;group&gt;</code> ya <code>ingress-replication protocol bgp</code>.</li>
<li>Verify: show nve peers, show nve vni, show mac address-table (nve1 par remote MAC).</li>
<li>VNI end to end match hona chahiye; local VLAN numbers alag ho sakte hain.</li>
</ul></div>
`}};export{e as default};