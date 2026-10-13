var e={id:`hypervisor-net`,h:{en:`Hypervisor networking on UCS: vSwitches, teaming, VLANs and jumbo frames`,hi:`UCS par hypervisor networking: vSwitches, teaming, VLANs aur jumbo frames`},body:{en:`
<p>A metro city has two parallel train lines, the A line and the B line, with no track connecting them inside the city. To change lines you must go out to the junction station outside town. If you plan your commute so that you stay on one line, the trip is fast; if you board A and need to get off on B, you take the long way. On UCS, fabric A and fabric B are those two lines, and the ESXi teaming policy decides which line each type of traffic rides. In the Foundations module you met vSwitches and port groups; here you connect them correctly to UCS.</p>

<h3>What ESXi sees on a UCS blade</h3>
<p>ESXi does not know about FIs or IOMs. It sees the vNICs that the service profile defined, as physical NICs: eth0 (fabric A) appears as <b>vmnic0</b>, eth1 (fabric B) as <b>vmnic1</b>, in the order fixed by the placement policy. Each vmnic has the MAC from the pool (00:25:B5:0A:00:00 for eth0 of ESX-01), carries the VLANs listed in its vNIC template, and uses the vNIC's MTU.</p>

<h3>Standard vSwitch or distributed switch</h3>
<table class="cmp"><tr><th></th><th>vSphere Standard Switch (VSS)</th><th>vSphere Distributed Switch (VDS)</th></tr>
<tr><td>Configured</td><td>Per host</td><td>Once in vCenter, pushed to all hosts</td></tr>
<tr><td>Teaming options</td><td>Port ID, source MAC hash, IP hash, explicit failover</td><td>Same, plus <b>Route based on physical NIC load</b> (LBT) and LACP</td></tr>
<tr><td>Extras</td><td>Basic</td><td>NetFlow, port mirroring, Network I/O Control, health check</td></tr>
<tr><td>Risk</td><td>Configuration drift between hosts</td><td>Depends on vCenter for changes (not for forwarding)</td></tr>
</table>
<p>Many shops use a VSS for management (so a vCenter problem cannot cut their access) and a VDS for everything else. Either works on UCS as long as the teaming policy matches the UCS design.</p>

<h3>Teaming policies that work with fabric A/B</h3>
<p>The two vNICs of a blade land on <b>two different FIs</b> that are not a vPC pair toward the server, and in end-host mode each FI pins the vNIC independently. That rules out any teaming that needs a port-channel on the switch side:</p>
<table class="cmp"><tr><th>Teaming policy</th><th>On UCS</th></tr>
<tr><td>Route based on originating virtual port (default)</td><td><b>Recommended.</b> Each VM sticks to one vmnic; no switch config needed.</td></tr>
<tr><td>Route based on physical NIC load (VDS)</td><td>Works well; moves VMs between vmnics when one is busy.</td></tr>
<tr><td>Route based on source MAC hash</td><td>Works, rarely needed.</td></tr>
<tr><td>Route based on IP hash / LACP</td><td><b>Do not use.</b> Requires a port-channel across both vmnics, which the FIs cannot provide; causes MAC flapping and drops.</td></tr>
</table>
<p>Failure detection should be <b>link status</b>. It works because the network control policy's <b>Action on Uplink Fail = Link Down</b> makes UCS bring the vNIC link down if its FI loses all uplinks, so ESXi fails over to the other vmnic.</p>

<h3>Designing per port group</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="ESXi port groups over fabric A and B">
<rect x="20" y="10" width="600" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">ESXi host ESX-01</text>
<rect x="40" y="40" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="125" y="60" text-anchor="middle" class="svg-ink" font-size="12">MGMT: A act, B stby</text>
<rect x="235" y="40" width="170" height="30" rx="6" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">vMotion: A act, B stby</text>
<rect x="430" y="40" width="170" height="30" rx="6" fill="#bae6fd"/><text x="515" y="60" text-anchor="middle" class="svg-ink" font-size="12">VM-DATA: A + B active</text>
<rect x="110" y="110" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="180" y="133" text-anchor="middle" class="svg-ink" font-size="12">vmnic0 → FI-A</text>
<rect x="390" y="110" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="460" y="133" text-anchor="middle" class="svg-ink" font-size="12">vmnic1 → FI-B</text>
<line x1="180" y1="80" x2="180" y2="110" stroke="#64748b" stroke-width="2"/><line x1="460" y1="80" x2="460" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="185" width="240" height="40" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Leaf vPC pair (A to B path)</text>
<line x1="180" y1="146" x2="260" y2="185" stroke="#64748b" stroke-width="2"/><line x1="460" y1="146" x2="380" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pin east-west heavy traffic (vMotion) to the same fabric on every host so it stays inside one FI; spread VM traffic over both.</p></div>
<ul>
<li><b>vMotion</b>: vmnic0 active, vmnic1 standby, identical on every host. vMotion between two hosts then stays inside FI-A and never crosses the leaf switches.</li>
<li><b>Management</b>: same idea, often A active and B standby.</li>
<li><b>VM traffic</b>: both active with port ID or LBT, to use both fabrics.</li>
<li><b>IP storage</b> (NFS or iSCSI): for iSCSI, two vmkernel ports, each bound to one vmnic (port binding), so multipathing sees one path per fabric.</li>
</ul>

<h3>A VLAN has to exist in four places</h3>
<ol>
<li><b>UCSM LAN Cloud</b>: the VLAN is defined (LAN ▸ LAN Cloud ▸ VLANs), for example VM-DATA = 30.</li>
<li><b>vNIC template</b>: the VLAN is ticked on vNIC-A and vNIC-B.</li>
<li><b>FI uplinks and the upstream leaf switches</b>: the uplink port-channels carry it and the leaf trunks allow it. If a vNIC's VLAN is not carried by any uplink of its fabric, UCSM raises <b>F0283 ENM source pinning failed</b> and that vNIC has nowhere to send traffic.</li>
<li><b>ESXi port group</b>: the port group uses VLAN ID 30.</li>
</ol>
<p>If some VLANs exist only on some uplinks (for example DMZ VLANs on a separate pair of switches), that is a <b>disjoint Layer 2</b> design: assign VLANs to specific uplinks with VLAN manager / uplink VLAN membership, and make sure every VLAN of a vNIC is on the same uplink set.</p>

<h3>Jumbo frames end to end</h3>
<table class="cmp"><tr><th>Layer</th><th>Setting</th></tr>
<tr><td>ESXi vmkernel port and vSwitch/VDS</td><td>MTU 9000</td></tr>
<tr><td>UCS vNIC template</td><td>MTU 9000</td></tr>
<tr><td>UCS QoS system class used by that vNIC (Best Effort by default)</td><td>MTU 9216</td></tr>
<tr><td>Leaf port-channels to the FIs and the path to the peer</td><td>MTU 9216</td></tr>
</table>
<pre class="code"><span class="c">! Leaf-01 (vPC peer), port-channel toward FI-A</span>
interface port-channel11
  description UCS-FI-A uplinks
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  spanning-tree port type edge trunk
  mtu 9216
  vpc 11</pre>
<p>Because the FIs in end-host mode never create loops, Cisco recommends <code>spanning-tree port type edge trunk</code> on these ports so they forward immediately after a link flap.</p>
<pre class="out">[root@esx01:~] vmkping -I vmk1 -d -s 8972 10.20.0.12
PING 10.20.0.12 (10.20.0.12): 8972 data bytes
<span class="hl">8980 bytes from 10.20.0.12: icmp_seq=0 ttl=64 time=0.214 ms</span></pre>
<div class="eg"><p><b>Worked example: why 8972?</b> The test sends an ICMP payload of 8972 bytes with Don't Fragment set (-d). Add 8 bytes of ICMP header and 20 bytes of IP header: 8972 + 8 + 20 = 9000, exactly the vmkernel MTU. If any hop in the path is still at 1500, the ping fails while a normal ping works, which pinpoints an MTU problem.</p></div>

<div class="warn"><p><b>Common mistakes.</b> IP hash teaming on UCS vmnics. vMotion active on vmnic0 on some hosts and vmnic1 on others. Adding a VLAN to the port group and the vNIC template but not to the leaf trunk or FI uplink. MTU 9000 in ESXi and on the vNIC but the Best Effort class left at normal. Enabling fabric failover and ESXi teaming together without a reason.</p></div>
<div class="exam"><p><b>Exam tip.</b> Use "originating virtual port" (or LBT on a VDS) with UCS; never IP hash. A vNIC VLAN not carried by an uplink raises F0283 (ENM source pinning failed). Jumbo frames need the system class MTU too.</p></div>

<div class="scn"><h4>VMs on VLAN 30 unreachable on half the hosts</h4><p>After a new application VLAN was added, VMs on some hosts could talk and VMs on others could not; vMotion between them "fixed" and "broke" individual VMs. The engineer checked the four places: the VLAN existed in UCSM and on both vNIC templates, the port group was correct, but Admin ▸ Faults showed F0283 on fabric B: the uplink port-channel toward LEAF pair B allowed only VLANs 10 and 20. VMs whose port ID hashed to vmnic1 were black-holed. Adding VLAN 30 to the FI-B uplink VLAN list and to the leaf trunk cleared the fault and every VM worked.</p><p><b>Lesson:</b> a VLAN must exist in UCSM, on the vNIC, on the uplinks and upstream, and in the port group; a half-working VLAN usually means one fabric is missing it.</p></div>

<div class="iv"><p class="q">"Which NIC teaming policy would you use for ESXi on Cisco UCS, and why not IP hash?"</p><p>Strong answer: route based on originating virtual port (or physical NIC load on a VDS), with link-status failure detection. IP hash needs a port-channel on the switch across both vmnics, but vmnic0 goes to FI-A and vmnic1 to FI-B, which do not form a port-channel toward servers; IP hash would cause MAC flapping and drops. Add the design tip: pin vMotion to one fabric on all hosts so it stays inside a single FI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ESXi sees UCS vNICs as vmnics: eth0/fabric A = vmnic0, eth1/fabric B = vmnic1.</li>
<li>Use port ID or LBT teaming with link-status detection; never IP hash or LACP toward the FIs.</li>
<li>Keep vMotion on the same fabric on every host so it stays inside one FI.</li>
<li>A VLAN must exist in UCSM, on the vNIC, on FI uplinks and leaf trunks, and in the port group.</li>
<li>Jumbo frames: vmkernel/vSwitch 9000, vNIC 9000, system class 9216, leaf 9216; test with vmkping -d -s 8972.</li>
</ul></div>
`,hi:`
<p>Ek metro city mein do parallel train lines hain, A line aur B line, aur shehar ke andar unhe jodne wala koi track nahi. Line badalni ho to shehar ke bahar junction station tak jaana padta hai. Agar aap apna commute aise plan karo ki ek hi line par raho, to safar tez hai; agar aap A par chadho aur B par utarna ho, to lamba raasta lena padta hai. UCS par fabric A aur fabric B wahi do lines hain, aur ESXi teaming policy decide karti hai ki har type ka traffic kaunsi line par chale. Foundations module mein aap vSwitches aur port groups se mile the; yahan aap unhe UCS se sahi tarah jodte ho.</p>

<h3>UCS blade par ESXi ko kya dikhta hai</h3>
<p>ESXi FIs ya IOMs ke baare mein nahi jaanta. Use service profile mein define kiye vNICs physical NICs ki tarah dikhte hain: eth0 (fabric A) <b>vmnic0</b> ki tarah, eth1 (fabric B) <b>vmnic1</b> ki tarah, placement policy dwara fix kiye order mein. Har vmnic ke paas pool se MAC hota hai (ESX-01 ke eth0 ke liye 00:25:B5:0A:00:00), woh apne vNIC template mein listed VLANs carry karta hai, aur vNIC ka MTU use karta hai.</p>

<h3>Standard vSwitch ya distributed switch</h3>
<table class="cmp"><tr><th></th><th>vSphere Standard Switch (VSS)</th><th>vSphere Distributed Switch (VDS)</th></tr>
<tr><td>Configure kahan</td><td>Har host par</td><td>vCenter mein ek baar, saare hosts par push</td></tr>
<tr><td>Teaming options</td><td>Port ID, source MAC hash, IP hash, explicit failover</td><td>Wahi, plus <b>Route based on physical NIC load</b> (LBT) aur LACP</td></tr>
<tr><td>Extras</td><td>Basic</td><td>NetFlow, port mirroring, Network I/O Control, health check</td></tr>
<tr><td>Risk</td><td>Hosts ke beech configuration drift</td><td>Changes ke liye vCenter par depend (forwarding ke liye nahi)</td></tr>
</table>
<p>Kai companies management ke liye VSS use karti hain (taaki vCenter ki problem unka access na kaat de) aur baaki sab ke liye VDS. UCS par dono chalte hain, bas teaming policy UCS design se match honi chahiye.</p>

<h3>Fabric A/B ke saath chalne wali teaming policies</h3>
<p>Blade ke do vNICs <b>do alag FIs</b> par aate hain jo server ki taraf vPC pair nahi hain, aur end-host mode mein har FI vNIC ko independently pin karta hai. Isse har woh teaming bahar ho jaati hai jise switch side par port-channel chahiye:</p>
<table class="cmp"><tr><th>Teaming policy</th><th>UCS par</th></tr>
<tr><td>Route based on originating virtual port (default)</td><td><b>Recommended.</b> Har VM ek vmnic par tikta hai; switch config nahi chahiye.</td></tr>
<tr><td>Route based on physical NIC load (VDS)</td><td>Achha chalta hai; ek vmnic busy ho to VMs ko doosre par le jaata hai.</td></tr>
<tr><td>Route based on source MAC hash</td><td>Chalta hai, kam hi chahiye.</td></tr>
<tr><td>Route based on IP hash / LACP</td><td><b>Use mat karo.</b> Dono vmnics ke across port-channel chahiye, jo FIs nahi de sakte; MAC flapping aur drops hote hain.</td></tr>
</table>
<p>Failure detection <b>link status</b> honi chahiye. Yeh isliye kaam karta hai kyunki network control policy ka <b>Action on Uplink Fail = Link Down</b> UCS se vNIC link down karwata hai agar uske FI ke saare uplinks chale jaayein, aur ESXi doosre vmnic par failover karta hai.</p>

<h3>Har port group ka design</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Fabric A aur B par ESXi port groups">
<rect x="20" y="10" width="600" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">ESXi host ESX-01</text>
<rect x="40" y="40" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="125" y="60" text-anchor="middle" class="svg-ink" font-size="12">MGMT: A act, B stby</text>
<rect x="235" y="40" width="170" height="30" rx="6" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">vMotion: A act, B stby</text>
<rect x="430" y="40" width="170" height="30" rx="6" fill="#bae6fd"/><text x="515" y="60" text-anchor="middle" class="svg-ink" font-size="12">VM-DATA: A + B active</text>
<rect x="110" y="110" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="180" y="133" text-anchor="middle" class="svg-ink" font-size="12">vmnic0 → FI-A</text>
<rect x="390" y="110" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="460" y="133" text-anchor="middle" class="svg-ink" font-size="12">vmnic1 → FI-B</text>
<line x1="180" y1="80" x2="180" y2="110" stroke="#64748b" stroke-width="2"/><line x1="460" y1="80" x2="460" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="185" width="240" height="40" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Leaf vPC pair (A se B path)</text>
<line x1="180" y1="146" x2="260" y2="185" stroke="#64748b" stroke-width="2"/><line x1="460" y1="146" x2="380" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">East-west bhaari traffic (vMotion) ko har host par same fabric par pin karo taaki woh ek FI ke andar rahe; VM traffic ko dono par failao.</p></div>
<ul>
<li><b>vMotion</b>: vmnic0 active, vmnic1 standby, har host par same. Tab do hosts ke beech vMotion FI-A ke andar rehta hai aur kabhi leaf switches cross nahi karta.</li>
<li><b>Management</b>: wahi idea, aksar A active aur B standby.</li>
<li><b>VM traffic</b>: dono active, port ID ya LBT ke saath, taaki dono fabrics use hon.</li>
<li><b>IP storage</b> (NFS ya iSCSI): iSCSI ke liye do vmkernel ports, har ek ek vmnic se bound (port binding), taaki multipathing ko har fabric par ek path dikhe.</li>
</ul>

<h3>VLAN ko chaar jagah exist karna padta hai</h3>
<ol>
<li><b>UCSM LAN Cloud</b>: VLAN define hai (LAN ▸ LAN Cloud ▸ VLANs), jaise VM-DATA = 30.</li>
<li><b>vNIC template</b>: VLAN vNIC-A aur vNIC-B par ticked hai.</li>
<li><b>FI uplinks aur upstream leaf switches</b>: uplink port-channels use carry karte hain aur leaf trunks use allow karte hain. Agar vNIC ka VLAN uske fabric ka koi uplink carry nahi karta, to UCSM <b>F0283 ENM source pinning failed</b> raise karta hai aur us vNIC ke paas traffic bhejne ki koi jagah nahi hoti.</li>
<li><b>ESXi port group</b>: port group VLAN ID 30 use karta hai.</li>
</ol>
<p>Agar kuch VLANs sirf kuch uplinks par exist karte hain (jaise alag switch pair par DMZ VLANs), to yeh <b>disjoint Layer 2</b> design hai: VLAN manager / uplink VLAN membership se VLANs ko specific uplinks par assign karo, aur pakka karo ki vNIC ka har VLAN same uplink set par ho.</p>

<h3>Jumbo frames end to end</h3>
<table class="cmp"><tr><th>Layer</th><th>Setting</th></tr>
<tr><td>ESXi vmkernel port aur vSwitch/VDS</td><td>MTU 9000</td></tr>
<tr><td>UCS vNIC template</td><td>MTU 9000</td></tr>
<tr><td>Us vNIC dwara use ki jaane wali UCS QoS system class (default mein Best Effort)</td><td>MTU 9216</td></tr>
<tr><td>FIs tak leaf port-channels aur peer tak ka path</td><td>MTU 9216</td></tr>
</table>
<pre class="code"><span class="c">! Leaf-01 (vPC peer), FI-A ki taraf port-channel</span>
interface port-channel11
  description UCS-FI-A uplinks
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  spanning-tree port type edge trunk
  mtu 9216
  vpc 11</pre>
<p>Kyunki end-host mode mein FIs kabhi loops nahi banate, Cisco in ports par <code>spanning-tree port type edge trunk</code> recommend karta hai taaki link flap ke baad woh turant forward karein.</p>
<pre class="out">[root@esx01:~] vmkping -I vmk1 -d -s 8972 10.20.0.12
PING 10.20.0.12 (10.20.0.12): 8972 data bytes
<span class="hl">8980 bytes from 10.20.0.12: icmp_seq=0 ttl=64 time=0.214 ms</span></pre>
<div class="eg"><p><b>Worked example: 8972 kyun?</b> Test Don't Fragment set karke (-d) 8972 bytes ka ICMP payload bhejta hai. 8 bytes ICMP header aur 20 bytes IP header jodo: 8972 + 8 + 20 = 9000, bilkul vmkernel MTU. Agar path ka koi bhi hop abhi bhi 1500 par hai, to yeh ping fail hota hai jabki normal ping chalta hai, jo MTU problem ko pinpoint karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> UCS vmnics par IP hash teaming. Kuch hosts par vMotion vmnic0 par active aur kuch par vmnic1 par. Port group aur vNIC template mein VLAN jodna lekin leaf trunk ya FI uplink mein nahi. ESXi aur vNIC par MTU 9000 lekin Best Effort class normal par chhod dena. Bina wajah fabric failover aur ESXi teaming ek saath enable karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> UCS ke saath "originating virtual port" (ya VDS par LBT) use karo; IP hash kabhi nahi. Jo vNIC VLAN koi uplink carry nahi karta woh F0283 (ENM source pinning failed) raise karta hai. Jumbo frames ke liye system class MTU bhi chahiye.</p></div>

<div class="scn"><h4>Aadhe hosts par VLAN 30 ke VMs unreachable</h4><p>Naya application VLAN jodne ke baad kuch hosts ke VMs baat kar paate the aur kuch ke nahi; unke beech vMotion individual VMs ko "theek" aur "kharab" kar deta tha. Engineer ne chaaron jagah check ki: VLAN UCSM mein aur dono vNIC templates par tha, port group sahi tha, lekin Admin ▸ Faults ne fabric B par F0283 dikhaya: LEAF pair B ki taraf uplink port-channel sirf VLANs 10 aur 20 allow karta tha. Jin VMs ka port ID vmnic1 par hash hota tha woh black-hole ho rahe the. FI-B uplink VLAN list aur leaf trunk mein VLAN 30 jodne se fault clear hua aur har VM chal pada.</p><p><b>Seekh:</b> VLAN UCSM mein, vNIC par, uplinks aur upstream par, aur port group mein exist karna chahiye; aadha chalne wala VLAN aam taur par matlab ek fabric par woh missing hai.</p></div>

<div class="iv"><p class="q">"Cisco UCS par ESXi ke liye kaunsi NIC teaming policy use karoge, aur IP hash kyun nahi?"</p><p>Strong answer: route based on originating virtual port (ya VDS par physical NIC load), link-status failure detection ke saath. IP hash ko dono vmnics ke across switch par port-channel chahiye, lekin vmnic0 FI-A par jaata hai aur vmnic1 FI-B par, jo servers ki taraf port-channel nahi banate; IP hash se MAC flapping aur drops honge. Design tip jodo: saare hosts par vMotion ko ek fabric par pin karo taaki woh ek hi FI ke andar rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ESXi UCS vNICs ko vmnics ki tarah dekhta hai: eth0/fabric A = vmnic0, eth1/fabric B = vmnic1.</li>
<li>Port ID ya LBT teaming link-status detection ke saath use karo; FIs ki taraf IP hash ya LACP kabhi nahi.</li>
<li>vMotion ko har host par same fabric par rakho taaki woh ek FI ke andar rahe.</li>
<li>VLAN UCSM mein, vNIC par, FI uplinks aur leaf trunks par, aur port group mein exist karna chahiye.</li>
<li>Jumbo frames: vmkernel/vSwitch 9000, vNIC 9000, system class 9216, leaf 9216; vmkping -d -s 8972 se test karo.</li>
</ul></div>
`}};export{e as default};