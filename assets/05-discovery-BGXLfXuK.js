var e={id:`discovery`,h:{en:`Fabric discovery: LLDP, DHCP, TEP pool, registration and the infra protocols`,hi:`Fabric discovery: LLDP, DHCP, TEP pool, registration aur infra protocols`},body:{en:`
<p>Picture new employees arriving at a company on joining day. At the gate, security checks each person's ID against a list (serial number), hands them an employee number and a desk (node ID and TEP address), and only after that do they get a badge that opens the next door. Nobody reaches the second floor before being checked in on the first. ACI fabric discovery works the same way: hop by hop, starting at the APIC, every switch is identified, approved and given an address before the switches behind it are even seen.</p>

<h3>Step 0: the APIC setup script</h3>
<p>On first boot, the APIC console asks for the fabric-wide values. Some of them can never be changed later without rebuilding the fabric, so choose carefully.</p>
<pre class="code">Enter the fabric name [ACI Fabric1]: ACI-Fabric1
Enter the fabric ID (1-128) [1]: 1
Enter the number of active controllers in the fabric (1-9) [3]: 3
Enter the POD ID (1-254) [1]: 1
Enter the controller ID (1-3) [1]: 1
Enter the controller name [apic1]: apic1
<span class="c">! TEP pool: one tunnel endpoint address per node; must not overlap anything routed in your DC</span>
Enter address pool for TEP addresses [10.0.0.0/16]: 10.0.0.0/16
<span class="c">! infra VLAN: used between APICs and leaves; must not clash with any VLAN you will ever need</span>
Enter the VLAN ID for infra network (2-4094): 3967
<span class="c">! GIPo pool: multicast groups for flooding inside bridge domains</span>
Enter address pool for BD multicast addresses (GIPO) [225.0.0.0/15]: 225.0.0.0/15
Out-of-band management configuration ...
Enter the IPv4 address [192.168.10.1/24]: 192.168.100.11/24</pre>

<h3>Step by step: how a switch joins</h3>
<ol>
<li><b>LLDP.</b> The leaf cabled to the APIC boots its ACI image and exchanges LLDP with the APIC. ACI-specific LLDP fields tell the leaf which infra VLAN to use.</li>
<li><b>DHCP discover.</b> The leaf sends a DHCP request on the infra VLAN. The APIC sees it and lists the switch under <b>Fabric → Inventory → Fabric Membership → Nodes Pending Registration</b> with its <b>serial number</b> and role (leaf or spine).</li>
<li><b>Registration.</b> You approve it: <b>Pod ID</b>, <b>Node ID</b> (convention: leaves from 101, spines from 201; APICs use 1 to 7) and <b>Node Name</b>.</li>
<li><b>TEP address and policy.</b> The APIC answers the DHCP request with a <b>TEP address</b> (tunnel endpoint) from the TEP pool, the switch checks its firmware, builds a secure channel to the APIC, downloads its policy and moves to state <b>active</b>.</li>
<li><b>Next hop.</b> Only an active switch relays discovery for its own fabric ports. So after LEAF101 is active, the spine behind it appears; after the spine is active, the other leaves appear.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Discovery walks outward one registered hop at a time">
<rect x="10" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="55" y="115" text-anchor="middle" class="svg-ink" font-size="13">APIC1</text>
<rect x="160" y="90" width="100" height="40" rx="8" fill="#bae6fd"/><text x="210" y="115" text-anchor="middle" class="svg-ink" font-size="13">LEAF101</text>
<rect x="320" y="90" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="115" text-anchor="middle" class="svg-ink" font-size="13">SPINE201</text>
<rect x="500" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">LEAF102</text>
<line x1="100" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="430" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="130" y="80" text-anchor="middle" class="svg-accent" font-size="13">1</text><text x="290" y="80" text-anchor="middle" class="svg-accent" font-size="13">2</text><text x="465" y="80" text-anchor="middle" class="svg-accent" font-size="13">3</text>
<text x="210" y="155" text-anchor="middle" class="svg-muted" font-size="12">register first</text>
<text x="375" y="155" text-anchor="middle" class="svg-muted" font-size="12">appears after 101</text>
<text x="555" y="155" text-anchor="middle" class="svg-muted" font-size="12">appears after 201</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">LLDP + DHCP on the infra VLAN, relayed only by active nodes</text>
</svg><p class="cap">This is exactly the order of Lab 1: LEAF101, then SPINE201, then LEAF102.</p></div>

<p>In large rollouts you can <b>pre-register</b> switches by serial number before they are even cabled (Fabric Membership → Registered Nodes → Register a node by serial). When the switch appears, it is admitted automatically with the planned ID and name.</p>

<h3>Verify with acidiag fnvread</h3>
<pre class="out">APIC1# acidiag fnvread
      ID   Pod ID       Name    Serial Number      IP Address    Role        State
--------------------------------------------------------------------------------------
     101        1    LEAF101      FDO23451A1B   10.0.72.64/32    leaf       <span class="hl">active</span>
     102        1    LEAF102      FDO23451A2C   10.0.72.65/32    leaf        active
     201        1   SPINE201      FGE38482XTN   10.0.88.95/32   spine        active

Total 3 nodes</pre>
<p>The <b>IP Address</b> column is the node's TEP, taken from the TEP pool (your values will differ). States you may see: <i>active</i> (good), <i>inactive</i> (lost contact), <i>discovering</i>, and <i>unsupported</i> (model or image not accepted).</p>

<h3>The infra protocols inside overlay-1</h3>
<p>Once nodes are active, they build the underlay in VRF <b>overlay-1</b> of tenant infra:</p>
<table class="cmp"><tr><th>Protocol</th><th>Job</th><th>Verify</th></tr>
<tr><td><b>IS-IS</b></td><td>Underlay routing: every TEP reachable from every node over the leaf-spine links (routed sub-interfaces). Also builds the multicast trees used for BD flooding.</td><td><code>show isis adjacency detail vrf overlay-1</code></td></tr>
<tr><td><b>COOP</b> (Council of Oracle Protocol)</td><td>Leaves report their local endpoints (MAC, IP, location) to the spines; the spines hold the endpoint database behind the <b>spine proxy</b> anycast address.</td><td><code>show coop internal info ip-db</code> on a spine</td></tr>
<tr><td><b>MP-BGP</b> (VPNv4/VPNv6)</td><td>Spines are route reflectors; routes learned by a border leaf on an L3Out are distributed to every leaf that needs them.</td><td><code>show bgp sessions vrf overlay-1</code></td></tr>
</table>
<p>IS-IS and COOP start automatically. MP-BGP needs one small piece of configuration: <b>System → System Settings → BGP Route Reflector</b>, where you set the fabric <b>autonomous system number</b> (for example 65001) and choose the spines that act as <b>route reflectors</b>. Without it, L3Out routes stay on the border leaf.</p>
<pre class="out">LEAF101# show isis adjacency detail vrf overlay-1
IS-IS process: isis_infra VRF:overlay-1
IS-IS adjacency database:
System ID       SNPA            Level  State  Hold Time  Interface
<span class="hl">spine201        N/A             1      UP     00:00:45   Ethernet1/49.39</span></pre>
<p>A leaf only ever has spines as IS-IS neighbours, never other leaves. Traffic between leaves is carried in <b>iVXLAN</b>, a VXLAN header that also carries the source EPG's class ID (<b>pcTag</b>), so the receiving leaf knows which EPG sent the packet.</p>

<div class="eg"><p><b>Worked example: sizing the TEP pool.</b> Every switch gets at least one TEP, vPC pairs get an extra virtual TEP, spines get proxy anycast TEPs, and APICs take addresses too. A /16 gives 65,534 addresses, which is why 10.0.0.0/16 is the common choice even for 20 switches: it costs nothing and it can never be enlarged later. The only rule that matters is that the pool must not overlap any subnet used in your data center, because TEP addresses can appear in the in-band management network.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Choosing an infra VLAN that is already used somewhere in the data center; if the infra VLAN is ever extended to hypervisors (for example for ACI Virtual Edge), a clash breaks it. 3967 is the common choice because it is rarely used elsewhere. (2) Choosing a TEP pool that overlaps a real network. (3) Registering the spine as a leaf ID (for example 102) and then "fixing" it: IDs cannot be changed without decommissioning the node and wiping it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Discovery is sequential: you cannot register LEAF102 before the spine that connects it is active, even if it is physically cabled. Also know which protocol does what: IS-IS = underlay TEP reachability, COOP = endpoint database on spines, MP-BGP = external routes with spines as route reflectors.</p></div>

<div class="scn"><h4>The spine that never appeared</h4><p>A new fabric had LEAF101 active, but after an hour neither the spine nor the second leaf appeared in Nodes Pending Registration. On LEAF101, <code>show lldp neighbors</code> listed only the APIC; the uplink eth1/49 was down. The spine had arrived from a partner with the NX-OS standalone image, and its ports were not speaking ACI LLDP. The team loaded the ACI image on the spine, reloaded it, and it appeared under Nodes Pending Registration within minutes. After registering it as node 201, LEAF102 appeared behind it.</p><p><b>Lesson:</b> when discovery stops, look at the last active node: LLDP neighbours, link state and the image on the next switch.</p></div>

<div class="iv"><p class="q">"Walk me through how a new ACI leaf joins the fabric."</p><p>Strong answer: the leaf boots the ACI image and exchanges LLDP with its neighbour (the APIC or an active spine), learns the infra VLAN and sends DHCP on it. The APIC lists it in Nodes Pending Registration by serial number. After you register it with a node ID, name and pod, the APIC assigns a TEP from the TEP pool, the switch validates firmware, downloads its policy and becomes active. It then relays discovery for its neighbours. Finish with the protocols: IS-IS for TEP reachability, COOP for endpoints and MP-BGP with spine route reflectors (after setting the fabric AS) for external routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Setup script values (fabric name, TEP pool, infra VLAN, GIPo) are chosen once; the TEP pool and infra VLAN cannot be changed later.</li>
<li>Discovery uses LLDP and DHCP on the infra VLAN and walks outward one registered hop at a time.</li>
<li>Registration = node ID + name + pod; the TEP comes from the TEP pool; verify with acidiag fnvread.</li>
<li>overlay-1 runs IS-IS (underlay), COOP (endpoint database) and MP-BGP (external routes, spines as route reflectors).</li>
<li>MP-BGP needs the BGP Route Reflector policy: fabric AS number and route reflector spines.</li>
</ul></div>
`,hi:`
<p>Joining day par company mein aane wale naye employees ki picture socho. Gate par security har insaan ki ID ek list (serial number) se check karti hai, use employee number aur desk (node ID aur TEP address) deti hai, aur uske baad hi use badge milta hai jo agla darwaza kholta hai. Pehli manzil par check-in hue bina koi doosri manzil tak nahi pahunchta. ACI fabric discovery bilkul aise hi kaam karti hai: hop by hop, APIC se shuru karke, har switch identify, approve hota hai aur address paata hai, uske peeche wale switches dikhne se bhi pehle.</p>

<h3>Step 0: APIC setup script</h3>
<p>Pehle boot par APIC console fabric-wide values poochta hai. Inmein se kuch fabric rebuild kiye bina baad mein kabhi badli nahi ja sakti, isliye dhyan se chuno.</p>
<pre class="code">Enter the fabric name [ACI Fabric1]: ACI-Fabric1
Enter the fabric ID (1-128) [1]: 1
Enter the number of active controllers in the fabric (1-9) [3]: 3
Enter the POD ID (1-254) [1]: 1
Enter the controller ID (1-3) [1]: 1
Enter the controller name [apic1]: apic1
<span class="c">! TEP pool: har node ka ek tunnel endpoint address; DC mein route hone wali kisi cheez se overlap nahi hona chahiye</span>
Enter address pool for TEP addresses [10.0.0.0/16]: 10.0.0.0/16
<span class="c">! infra VLAN: APICs aur leaves ke beech use hota hai; kisi bhi VLAN se clash nahi hona chahiye jo aapko kabhi chahiye</span>
Enter the VLAN ID for infra network (2-4094): 3967
<span class="c">! GIPo pool: bridge domains ke andar flooding ke multicast groups</span>
Enter address pool for BD multicast addresses (GIPO) [225.0.0.0/15]: 225.0.0.0/15
Out-of-band management configuration ...
Enter the IPv4 address [192.168.10.1/24]: 192.168.100.11/24</pre>

<h3>Step by step: switch kaise join karta hai</h3>
<ol>
<li><b>LLDP.</b> APIC se cabled leaf apni ACI image boot karta hai aur APIC ke saath LLDP exchange karta hai. ACI-specific LLDP fields leaf ko batate hain ki kaunsa infra VLAN use karna hai.</li>
<li><b>DHCP discover.</b> Leaf infra VLAN par DHCP request bhejta hai. APIC use dekhta hai aur switch ko uske <b>serial number</b> aur role (leaf ya spine) ke saath <b>Fabric → Inventory → Fabric Membership → Nodes Pending Registration</b> mein list karta hai.</li>
<li><b>Registration.</b> Aap use approve karte ho: <b>Pod ID</b>, <b>Node ID</b> (convention: leaves 101 se, spines 201 se; APICs 1 se 7 use karte hain) aur <b>Node Name</b>.</li>
<li><b>TEP address aur policy.</b> APIC DHCP request ka jawab TEP pool se ek <b>TEP address</b> (tunnel endpoint) ke saath deta hai, switch apna firmware check karta hai, APIC ke saath secure channel banata hai, apni policy download karta hai aur state <b>active</b> mein jaata hai.</li>
<li><b>Agla hop.</b> Sirf active switch hi apne fabric ports ke liye discovery relay karta hai. Isliye LEAF101 active hone ke baad uske peeche ka spine dikhta hai; spine active hone ke baad baaki leaves dikhte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Discovery ek-ek registered hop bahar chalti hai">
<rect x="10" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="55" y="115" text-anchor="middle" class="svg-ink" font-size="13">APIC1</text>
<rect x="160" y="90" width="100" height="40" rx="8" fill="#bae6fd"/><text x="210" y="115" text-anchor="middle" class="svg-ink" font-size="13">LEAF101</text>
<rect x="320" y="90" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="115" text-anchor="middle" class="svg-ink" font-size="13">SPINE201</text>
<rect x="500" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">LEAF102</text>
<line x1="100" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="430" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="130" y="80" text-anchor="middle" class="svg-accent" font-size="13">1</text><text x="290" y="80" text-anchor="middle" class="svg-accent" font-size="13">2</text><text x="465" y="80" text-anchor="middle" class="svg-accent" font-size="13">3</text>
<text x="210" y="155" text-anchor="middle" class="svg-muted" font-size="12">pehle register</text>
<text x="375" y="155" text-anchor="middle" class="svg-muted" font-size="12">101 ke baad dikhta hai</text>
<text x="555" y="155" text-anchor="middle" class="svg-muted" font-size="12">201 ke baad dikhta hai</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Infra VLAN par LLDP + DHCP, sirf active nodes relay karte hain</text>
</svg><p class="cap">Lab 1 ka order bilkul yahi hai: LEAF101, phir SPINE201, phir LEAF102.</p></div>

<p>Bade rollouts mein aap switches ko cable hone se pehle hi serial number se <b>pre-register</b> kar sakte ho (Fabric Membership → Registered Nodes → serial se node register karo). Jab switch dikhta hai, woh planned ID aur name ke saath apne aap admit ho jaata hai.</p>

<h3>acidiag fnvread se verify karo</h3>
<pre class="out">APIC1# acidiag fnvread
      ID   Pod ID       Name    Serial Number      IP Address    Role        State
--------------------------------------------------------------------------------------
     101        1    LEAF101      FDO23451A1B   10.0.72.64/32    leaf       <span class="hl">active</span>
     102        1    LEAF102      FDO23451A2C   10.0.72.65/32    leaf        active
     201        1   SPINE201      FGE38482XTN   10.0.88.95/32   spine        active

Total 3 nodes</pre>
<p><b>IP Address</b> column node ka TEP hai, TEP pool se liya gaya (aapki values alag hongi). States jo dikh sakti hain: <i>active</i> (achha), <i>inactive</i> (contact toot gaya), <i>discovering</i>, aur <i>unsupported</i> (model ya image accept nahi hui).</p>

<h3>overlay-1 ke andar infra protocols</h3>
<p>Nodes active hone ke baad, woh tenant infra ke VRF <b>overlay-1</b> mein underlay banate hain:</p>
<table class="cmp"><tr><th>Protocol</th><th>Kaam</th><th>Verify</th></tr>
<tr><td><b>IS-IS</b></td><td>Underlay routing: leaf-spine links (routed sub-interfaces) par har node se har TEP reachable. BD flooding ke liye multicast trees bhi banata hai.</td><td><code>show isis adjacency detail vrf overlay-1</code></td></tr>
<tr><td><b>COOP</b> (Council of Oracle Protocol)</td><td>Leaves apne local endpoints (MAC, IP, location) spines ko report karte hain; spines <b>spine proxy</b> anycast address ke peeche endpoint database rakhte hain.</td><td>Spine par <code>show coop internal info ip-db</code></td></tr>
<tr><td><b>MP-BGP</b> (VPNv4/VPNv6)</td><td>Spines route reflectors hain; border leaf ke L3Out par seekhe routes har us leaf tak jaate hain jise zaroorat hai.</td><td><code>show bgp sessions vrf overlay-1</code></td></tr>
</table>
<p>IS-IS aur COOP apne aap shuru hote hain. MP-BGP ko configuration ka ek chhota hissa chahiye: <b>System → System Settings → BGP Route Reflector</b>, jahan aap fabric ka <b>autonomous system number</b> (jaise 65001) set karte ho aur woh spines chunte ho jo <b>route reflectors</b> banenge. Iske bina L3Out routes border leaf par hi reh jaate hain.</p>
<pre class="out">LEAF101# show isis adjacency detail vrf overlay-1
IS-IS process: isis_infra VRF:overlay-1
IS-IS adjacency database:
System ID       SNPA            Level  State  Hold Time  Interface
<span class="hl">spine201        N/A             1      UP     00:00:45   Ethernet1/49.39</span></pre>
<p>Leaf ke IS-IS neighbours hamesha sirf spines hote hain, kabhi doosre leaves nahi. Leaves ke beech traffic <b>iVXLAN</b> mein jaata hai, ek VXLAN header jo source EPG ka class ID (<b>pcTag</b>) bhi le jaata hai, taaki receiving leaf ko pata ho packet kis EPG ne bheja.</p>

<div class="eg"><p><b>Worked example: TEP pool ka size.</b> Har switch ko kam se kam ek TEP milta hai, vPC pairs ko ek extra virtual TEP, spines ko proxy anycast TEPs, aur APICs bhi addresses lete hain. /16 mein 65,534 addresses hain, isliye 20 switches ke liye bhi 10.0.0.0/16 common choice hai: iski koi keemat nahi aur ise baad mein kabhi bada nahi kar sakte. Sirf ek rule matter karta hai ki pool aapke data center ke kisi subnet se overlap na kare, kyunki TEP addresses in-band management network mein dikh sakte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Aisa infra VLAN chunna jo data center mein kahin pehle se use ho raha ho; agar infra VLAN kabhi hypervisors tak extend hua (jaise ACI Virtual Edge ke liye), to clash use tod deta hai. 3967 common choice hai kyunki yeh kahin aur shayad hi use hota hai. (2) Aisa TEP pool chunna jo kisi real network se overlap kare. (3) Spine ko leaf ID (jaise 102) se register karna aur phir "fix" karna: node decommission karke wipe kiye bina IDs badle nahi ja sakte.</p></div>

<div class="exam"><p><b>Exam trap.</b> Discovery sequential hai: LEAF102 ko tab tak register nahi kar sakte jab tak use jodne wala spine active na ho, bhale woh physically cabled ho. Yeh bhi jaano kaunsa protocol kya karta hai: IS-IS = underlay TEP reachability, COOP = spines par endpoint database, MP-BGP = external routes, spines route reflectors.</p></div>

<div class="scn"><h4>Woh spine jo kabhi dikha hi nahi</h4><p>Ek naye fabric mein LEAF101 active tha, lekin ek ghante baad bhi na spine na doosra leaf Nodes Pending Registration mein dikha. LEAF101 par <code>show lldp neighbors</code> mein sirf APIC tha; uplink eth1/49 down tha. Spine ek partner se NX-OS standalone image ke saath aaya tha, aur uske ports ACI LLDP nahi bol rahe the. Team ne spine par ACI image load ki, reload kiya, aur woh kuch hi minutes mein Nodes Pending Registration mein aa gaya. Use node 201 ki tarah register karne ke baad, LEAF102 uske peeche dikh gaya.</p><p><b>Seekh:</b> jab discovery ruk jaaye, aakhri active node ko dekho: LLDP neighbours, link state aur agle switch ki image.</p></div>

<div class="iv"><p class="q">"Mujhe batao naya ACI leaf fabric mein kaise join karta hai."</p><p>Strong answer: leaf ACI image boot karta hai aur apne neighbour (APIC ya active spine) ke saath LLDP exchange karta hai, infra VLAN seekhta hai aur us par DHCP bhejta hai. APIC use serial number se Nodes Pending Registration mein list karta hai. Node ID, name aur pod ke saath register karne ke baad APIC TEP pool se TEP deta hai, switch firmware validate karta hai, apni policy download karta hai aur active ho jaata hai. Phir woh apne neighbours ke liye discovery relay karta hai. Protocols ke saath khatam karo: TEP reachability ke liye IS-IS, endpoints ke liye COOP aur external routes ke liye spine route reflectors wala MP-BGP (fabric AS set karne ke baad).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Setup script values (fabric name, TEP pool, infra VLAN, GIPo) ek baar chuni jaati hain; TEP pool aur infra VLAN baad mein badle nahi ja sakte.</li>
<li>Discovery infra VLAN par LLDP aur DHCP use karti hai aur ek-ek registered hop bahar chalti hai.</li>
<li>Registration = node ID + name + pod; TEP, TEP pool se aata hai; acidiag fnvread se verify karo.</li>
<li>overlay-1 mein IS-IS (underlay), COOP (endpoint database) aur MP-BGP (external routes, spines route reflectors) chalte hain.</li>
<li>MP-BGP ko BGP Route Reflector policy chahiye: fabric AS number aur route reflector spines.</li>
</ul></div>
`}};export{e as default};