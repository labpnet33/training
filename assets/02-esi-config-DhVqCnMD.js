var e={id:`esi-config`,h:{en:`Ethernet Segments and ESI: configuration step by step`,hi:`Ethernet Segments aur ESI: configuration step by step`},body:{en:`
<p>Imagine two postmen who both deliver to the same apartment block. For them to cooperate, they need to agree on one thing: the block's identity. If one writes "Block 7" and the other "Block 9", they think they serve different buildings and both deliver every parcel, so residents get duplicates. The <b>Ethernet Segment Identifier (ESI)</b> is that block identity: a 10-byte number that every leaf attached to the same device must configure identically.</p>

<h3>Definitions</h3>
<dl class="terms">
<dt>Ethernet Segment (ES)</dt><dd>The set of links that connect one customer device (switch or server) to one or more leaves.</dd>
<dt>ESI</dt><dd>10-byte identifier of the segment. All-zeros means "single-homed, no segment".</dd>
<dt>ESI type 0</dt><dd>Manually configured value: one type byte (00) followed by nine bytes you choose.</dd>
<dt>Redundancy mode</dt><dd><code>all-active</code> (all links forward) or <code>single-active</code> (one link at a time).</dd>
<dt>Port-channel (Po10)</dt><dd>The local LACP bundle on each leaf that faces SW-CE.</dd>
</dl>
<p>The rule that matters most: <b>the same ESI on every leaf attached to the same device, and a different ESI for each different device.</b> Use a planned numbering scheme so that a fabric of hundreds of segments stays readable.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ESI on both leaves">
<rect x="20" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">ethernet-segment 1</text><text x="115" y="90" text-anchor="middle" class="svg-accent" font-size="12">ESI 0000.1122.3344.5566.7788</text>
<rect x="430" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="12">ethernet-segment 1</text><text x="525" y="90" text-anchor="middle" class="svg-accent" font-size="12">ESI 0000.1122.3344.5566.7788</text>
<rect x="235" y="110" width="170" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">SW-CE LACP Po10</text>
<g stroke="#64748b" stroke-width="2"><line x1="115" y1="110" x2="260" y2="130"/><line x1="525" y1="110" x2="380" y2="130"/></g>
<text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">same ESI = same segment</text>
</svg><p class="cap">Equal ESIs tell the fabric that both leaves face the same customer device.</p></div>

<h3>Step 1: the Ethernet Segment on LEAF1 and LEAF2</h3>
<pre class="code"><span class="c">! Identical on LEAF1 and LEAF2</span>
l2vpn evpn ethernet-segment 1
 identifier type 0 00.11.22.33.44.55.66.77.88
 redundancy all-active
 df-election wait-time 3</pre>
<p>The number 1 after <code>ethernet-segment</code> is only a local index; the <b>identifier</b> is what must be identical. <code>df-election wait-time 3</code> gives BGP three seconds to collect all segment members before electing the DF, avoiding a premature decision.</p>

<h3>Step 2: bind the port-channel to the segment</h3>
<pre class="code"><span class="c">! LEAF1 and LEAF2, same configuration</span>
interface GigabitEthernet1/0/6
 description to SW-CE
 channel-group 10 mode active
interface Port-channel10
 description Multi-homed SW-CE
 switchport mode trunk
 switchport trunk allowed vlan 10
 evpn ethernet-segment 1</pre>

<h3>Step 3: the customer switch sees one bundle</h3>
<pre class="code"><span class="c">! SW-CE, ordinary LACP; it has no idea about EVPN</span>
interface range GigabitEthernet0/1 - 2
 channel-group 10 mode active
interface Port-channel10
 switchport mode trunk
 switchport trunk allowed vlan 10</pre>
<p>For LACP to bundle both links, both leaves must present the <b>same LACP system ID</b> to SW-CE. EVPN-aware platforms derive it from the ESI automatically. If the platform were to show two different system IDs, SW-CE would bring up only one link and the other would stay suspended.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   <span class="hl">10.255.1.12</span>

LEAF1# show l2vpn evpn ethernet-segment detail
Ethernet Segment ID: 0000.1122.3344.5566.7788
  Interface:         Port-channel10 (up)
  Redundancy mode:   all-active
  DF election:       wait-time 3 s, state Done
  Peers:             10.255.1.12 (DF for VLANs: 11)
  Local DF for VLANs: <span class="hl">10 20</span></pre>
<p>Check three things: the ESI is identical on both leaves, <b>Peers</b> lists the other leaf (found via type-4 routes), and the DF assignment is complete and consistent.</p>

<div class="eg"><p><b>Worked example: planning ESI values.</b> Fabric of 3 leaf pairs, each pair with 20 dual-homed servers. A readable scheme: <code>00.&lt;pair&gt;.&lt;server&gt;...</code> padded, e.g. pair 1 server 07 = <code>00.01.07.00.00.00.00.00.00</code>. Document it in a table; a typo later is found by diffing against the table. In our lab, <code>00.11.22.33.44.55.66.77.88</code> is deliberately easy to compare by eye.</p></div>

<div class="warn"><p><b>Common mistake.</b> Copy-pasting the ES config for a second customer device and forgetting to change the identifier. Two different devices then share one ESI, and the fabric treats them as a single bundle: floods and MAC moves between unrelated ports.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>ethernet-segment 1</code> index is local and does not need to match between leaves. The identifier (ESI) does. A candidate who matches the index but not the identifier has built no shared segment.</p></div>

<div class="scn"><h4>Two servers, one ESI</h4><p>An engineer duplicated the config of a database server's uplink for a new application server and changed only the port number. Both used ESI ...7788. After a week, the application team saw random duplicate packets, and the DBA saw broadcast ARP storms during failovers. The fix was assigning a new identifier to the second server's segment.</p><p><b>Lesson:</b> one ESI per device; keep a spreadsheet.</p></div>

<div class="iv"><p class="q">"What is an ESI and what must match?"</p><p>Strong answer: the ESI is a 10-byte identifier of an Ethernet Segment. The same ESI must be configured on all leaves attached to the same customer device, and different devices must have different ESIs. The local segment index and port-channel number can differ. Mention type 0 (manual) and that all-zeros means single-homed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ESI = 10 bytes; equal on all leaves of a device; unique per device.</li>
<li>Configuration: l2vpn evpn ethernet-segment, identifier type 0, redundancy all-active, df-election wait-time; evpn ethernet-segment under Po10.</li>
<li>The customer switch just uses LACP.</li>
<li>show l2vpn evpn ethernet-segment [detail] confirms ESI, mode, peers and DF.</li>
</ul></div>
`,hi:`
<p>Do postmen socho jo ek hi apartment block mein deliver karte hain. Cooperate karne ke liye unhe ek cheez par agree hona padta hai: block ki identity. Agar ek "Block 7" likhe aur doosra "Block 9", to dono sochte hain ki woh alag buildings serve karte hain aur har parcel dono deliver karte hain, isliye residents ko duplicates milte hain. <b>Ethernet Segment Identifier (ESI)</b> wahi block identity hai: 10-byte number jo ek hi device se attached har leaf par identically configure hona chahiye.</p>

<h3>Definitions</h3>
<dl class="terms">
<dt>Ethernet Segment (ES)</dt><dd>Un links ka set jo ek customer device (switch ya server) ko ek ya zyada leaves se jodte hain.</dd>
<dt>ESI</dt><dd>Segment ka 10-byte identifier. All-zeros ka matlab "single-homed, koi segment nahi".</dd>
<dt>ESI type 0</dt><dd>Manually configured value: ek type byte (00) aur uske baad nau bytes jo aap chunte ho.</dd>
<dt>Redundancy mode</dt><dd><code>all-active</code> (saare links forward karte hain) ya <code>single-active</code> (ek samay mein ek link).</dd>
<dt>Port-channel (Po10)</dt><dd>Har leaf par local LACP bundle jo SW-CE ki taraf hai.</dd>
</dl>
<p>Sabse zaroori rule: <b>ek hi device se attached har leaf par same ESI, aur har alag device ke liye alag ESI.</b> Planned numbering scheme use karo taaki sainkdon segments wale fabric mein bhi sab readable rahe.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ESI on both leaves">
<rect x="20" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">ethernet-segment 1</text><text x="115" y="90" text-anchor="middle" class="svg-accent" font-size="12">ESI 0000.1122.3344.5566.7788</text>
<rect x="430" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="12">ethernet-segment 1</text><text x="525" y="90" text-anchor="middle" class="svg-accent" font-size="12">ESI 0000.1122.3344.5566.7788</text>
<rect x="235" y="110" width="170" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">SW-CE LACP Po10</text>
<g stroke="#64748b" stroke-width="2"><line x1="115" y1="110" x2="260" y2="130"/><line x1="525" y1="110" x2="380" y2="130"/></g>
<text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">same ESI = same segment</text>
</svg><p class="cap">Barabar ESIs fabric ko batate hain ki dono leaves ek hi customer device ke saamne hain.</p></div>

<h3>Step 1: LEAF1 aur LEAF2 par Ethernet Segment</h3>
<pre class="code"><span class="c">! LEAF1 aur LEAF2 par identical</span>
l2vpn evpn ethernet-segment 1
 identifier type 0 00.11.22.33.44.55.66.77.88
 redundancy all-active
 df-election wait-time 3</pre>
<p><code>ethernet-segment</code> ke baad ka number 1 sirf local index hai; <b>identifier</b> hi identical hona chahiye. <code>df-election wait-time 3</code> BGP ko DF elect karne se pehle segment ke saare members collect karne ke liye teen second deta hai, taaki jaldbaazi ka decision na ho.</p>

<h3>Step 2: port-channel ko segment se bind karo</h3>
<pre class="code"><span class="c">! LEAF1 aur LEAF2, same configuration</span>
interface GigabitEthernet1/0/6
 description to SW-CE
 channel-group 10 mode active
interface Port-channel10
 description Multi-homed SW-CE
 switchport mode trunk
 switchport trunk allowed vlan 10
 evpn ethernet-segment 1</pre>

<h3>Step 3: customer switch ko ek bundle dikhta hai</h3>
<pre class="code"><span class="c">! SW-CE, normal LACP; use EVPN ka pata nahi</span>
interface range GigabitEthernet0/1 - 2
 channel-group 10 mode active
interface Port-channel10
 switchport mode trunk
 switchport trunk allowed vlan 10</pre>
<p>LACP dono links ko bundle kare, iske liye dono leaves ko SW-CE ko <b>same LACP system ID</b> dikhana hota hai. EVPN-aware platforms ise ESI se automatically derive karte hain. Agar platform do alag system IDs dikhaye to SW-CE sirf ek link up karega aur doosra suspended rahega.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   <span class="hl">10.255.1.12</span>

LEAF1# show l2vpn evpn ethernet-segment detail
Ethernet Segment ID: 0000.1122.3344.5566.7788
  Interface:         Port-channel10 (up)
  Redundancy mode:   all-active
  DF election:       wait-time 3 s, state Done
  Peers:             10.255.1.12 (DF for VLANs: 11)
  Local DF for VLANs: <span class="hl">10 20</span></pre>
<p>Teen cheezein check karo: ESI dono leaves par identical hai, <b>Peers</b> mein doosra leaf hai (type-4 routes se mila), aur DF assignment complete aur consistent hai.</p>

<div class="eg"><p><b>Worked example: ESI values plan karna.</b> 3 leaf pairs ka fabric, har pair ke 20 dual-homed servers. Readable scheme: <code>00.&lt;pair&gt;.&lt;server&gt;...</code> padded, jaise pair 1 server 07 = <code>00.01.07.00.00.00.00.00.00</code>. Ise table mein document karo; baad mein typo table se diff karke mil jaata hai. Hamare lab mein <code>00.11.22.33.44.55.66.77.88</code> jaan-boojh kar aankh se compare karne mein aasan hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Doosre customer device ke liye ES config copy-paste karna aur identifier badalna bhool jaana. Phir do alag devices ek ESI share karte hain aur fabric unhe ek bundle maanta hai: unrelated ports ke beech floods aur MAC moves.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ethernet-segment 1</code> index local hai aur leaves ke beech match karna zaroori nahi. Identifier (ESI) zaroori hai. Jo candidate index match karta hai lekin identifier nahi, usne koi shared segment nahi banaya.</p></div>

<div class="scn"><h4>Do servers, ek ESI</h4><p>Ek engineer ne database server ke uplink ka config naye application server ke liye duplicate kiya aur sirf port number badla. Dono ne ESI ...7788 use kiya. Ek hafte baad application team ko random duplicate packets dikhe, aur DBA ko failovers ke dauraan broadcast ARP storms. Fix: doosre server ke segment ko naya identifier dena.</p><p><b>Seekh:</b> ek device, ek ESI; spreadsheet rakho.</p></div>

<div class="iv"><p class="q">"ESI kya hai aur kya match hona chahiye?"</p><p>Strong answer: ESI Ethernet Segment ka 10-byte identifier hai. Same customer device se attached saare leaves par same ESI configure hona chahiye, aur alag devices ke ESIs alag. Local segment index aur port-channel number alag ho sakte hain. Type 0 (manual) ka zikr karo aur batao ki all-zeros single-homed hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ESI = 10 bytes; device ke saare leaves par barabar; har device ke liye unique.</li>
<li>Configuration: l2vpn evpn ethernet-segment, identifier type 0, redundancy all-active, df-election wait-time; Po10 ke neeche evpn ethernet-segment.</li>
<li>Customer switch sirf LACP use karta hai.</li>
<li>show l2vpn evpn ethernet-segment [detail] ESI, mode, peers aur DF confirm karta hai.</li>
</ul></div>
`}};export{e as default};