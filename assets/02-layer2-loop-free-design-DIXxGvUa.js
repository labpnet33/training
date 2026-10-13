var e={id:`layer2`,h:{en:`Layer 2 design: STP, RSTP, MST, EtherChannel and StackWise Virtual`,hi:`Layer 2 design: STP, RSTP, MST, EtherChannel aur StackWise Virtual`},body:{en:`
<p>A Layer 2 network is like a building with many doors between rooms: if two corridors loop back on each other, people (frames) run in circles forever. Ethernet frames have no hop count, so a loop means a broadcast storm. <b>Loop-free design</b> is the art of keeping redundancy without letting frames circle.</p>

<h3>The case: Cedarbridge Health</h3>
<div class="eg"><p><b>Customer.</b> Cedarbridge Health is a regional hospital group. Its main site has three towers (North, South, Clinic), 1,800 staff, 900 networked medical devices and 400 APs. Budget is USD 900,000. Nurse-call and infusion-pump systems use a Layer 2 VLAN (VLAN 40) that must reach every floor of the North tower, which means it spans 12 closets. Downtime target: any single device or link failure must recover in under 1 second for the clinical VLANs. Constraints: change windows are rare, staff are not routing specialists, and the medical vendor does not support Layer 3 between closets for VLAN 40.</p></div>

<h3>How spanning tree variants differ</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Instances</th><th>Convergence</th><th>Design use</th></tr>
<tr><td>STP (PVST+)</td><td>802.1D, Cisco per-VLAN</td><td>One per VLAN</td><td>30 to 50 seconds</td><td>Legacy only</td></tr>
<tr><td>Rapid PVST+</td><td>802.1w, Cisco per-VLAN</td><td>One per VLAN</td><td>Typically 1 to 2 seconds, often sub-second on point-to-point links</td><td>Small and medium blocks</td></tr>
<tr><td>MST</td><td>802.1s</td><td>Few instances map many VLANs</td><td>Rapid, like RSTP</td><td>Large VLAN counts, multi-vendor</td></tr></table>
<p><b>Scalability:</b> Rapid PVST+ runs a separate instance for every VLAN, so 300 VLANs on a trunk means 300 instances, with CPU and BPDU load growing with VLAN count and port count. MST maps groups of VLANs to a few instances (for example instance 1 for VLANs 10 to 49 and instance 2 for VLANs 50 to 99), giving you load sharing with only two instances. The price is configuration discipline: switches belong to the same <b>MST region</b> only if the region name, revision number and VLAN-to-instance mapping are identical. A typo creates a second region and breaks the design. Place the root bridge deliberately: in the distribution layer, with a backup root, and align it with the first-hop gateway (chapter 3).</p>

<h3>Options for Cedarbridge</h3>
<table class="cmp"><tr><th>Option</th><th>Gain</th><th>Cost or risk</th></tr>
<tr><td><b>A. Rapid PVST+, two distribution switches, loop-free U</b></td><td>Simple, well known</td><td>Half the uplinks blocked per VLAN; STP still decides failover</td></tr>
<tr><td><b>B. MST with two instances</b></td><td>Load sharing, low CPU</td><td>Region mismatch risk; team must learn MST</td></tr>
<tr><td><b>C. StackWise Virtual pair + Multichassis EtherChannel (MEC)</b></td><td>No blocked links; failover is an EtherChannel event, not an STP event</td><td>One logical control plane; needs dual-active detection</td></tr>
<tr><td><b>D. Routed access</b></td><td>Best convergence</td><td>Breaks the VLAN 40 requirement</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="StackWise Virtual with MEC">
<rect x="150" y="20" width="340" height="80" rx="12" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="320" y="14" text-anchor="middle" class="svg-muted" font-size="12">One logical distribution switch</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="82" x2="100" y2="190"/><line x1="425" y1="82" x2="100" y2="190"/>
<line x1="215" y1="82" x2="320" y2="190"/><line x1="425" y1="82" x2="320" y2="190"/>
<line x1="215" y1="82" x2="540" y2="190"/><line x1="425" y1="82" x2="540" y2="190"/>
</g>
<line x1="260" y1="60" x2="380" y2="60" stroke="#ea580c" stroke-width="4"/>
<text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="12">SVL link</text>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="170" y="38" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="215" y="64">Dist 1</text>
<rect x="380" y="38" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="425" y="64">Dist 2</text>
<rect x="55" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="100" y="212">Access 1</text>
<rect x="275" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="320" y="212">Access 2</text>
<rect x="495" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="540" y="212">Access 3</text>
<text x="100" y="244" class="svg-muted" font-size="12">Po1 (2 links)</text>
<text x="320" y="244" class="svg-muted" font-size="12">Po2 (2 links)</text>
<text x="540" y="244" class="svg-muted" font-size="12">Po3 (2 links)</text>
</g>
<rect x="25" y="272" width="14" height="14" fill="#ddd6fe"/><text x="45" y="284" class="svg-ink" font-size="12">Distribution</text>
<rect x="150" y="272" width="14" height="14" fill="#bbf7d0"/><text x="170" y="284" class="svg-ink" font-size="12">Access</text>
<rect x="250" y="272" width="14" height="14" fill="#ea580c"/><text x="270" y="284" class="svg-ink" font-size="12">SVL link (control plane)</text>
</svg><p class="cap">Every access switch sees one neighbour. STP blocks nothing, because each EtherChannel is one logical link.</p></div>

<h3>Chosen design and why</h3>
<p>Cedarbridge chose <b>option C</b>: a StackWise Virtual pair in each tower, MEC to every closet, and Rapid PVST+ kept as a safety net. Justification: VLAN 40 stays Layer 2 (requirement), no uplink is blocked, a link or switch failure converges as an EtherChannel change (typically well under a second), and the team operates "one switch" per tower. <b>StackWise Virtual (SVL)</b> joins two supported Catalyst 9000 switches of the same model into one logical switch using StackWise Virtual links (10G or faster). One member is active, the other standby, running SSO. Catalyst 9300 stacks with StackWise cables also support cross-stack EtherChannel. On Nexus this role is played by vPC; on Catalyst campus the "vPC-less" answers are SVL, stacks, or routed access.</p>

<pre class="code"><span class="c">! Both distribution switches (domain must match; reload required)</span>
stackwise-virtual
 domain 100
!
interface FortyGigabitEthernet1/0/1
 stackwise-virtual link 1
!
<span class="c">! Dual-active detection on a dedicated link</span>
interface GigabitEthernet1/0/10
 stackwise-virtual dual-active-detection
!
<span class="c">! Multichassis EtherChannel to Access 1</span>
interface range TenGigabitEthernet1/0/2, TenGigabitEthernet2/0/2
 channel-group 1 mode active
interface Port-channel1
 switchport mode trunk
</pre>
<pre class="out">DIST# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+---------------------------------
1      Po1(<span class="hl">SU</span>)         LACP        Te1/0/2(P)   Te2/0/2(P)
</pre>

<h3>Edge protection that every Layer 2 design needs</h3>
<ul>
<li><b>PortFast and BPDU guard</b> on access ports: a rogue switch shuts the port.</li>
<li><b>Root guard</b> on distribution ports toward access: no access switch can become root.</li>
<li><b>Loop guard</b> and <b>UDLD</b>: protect against unidirectional fibre failures that silently stop BPDUs.</li>
<li><b>Storm control</b> on edge ports to cap broadcast and multicast.</li>
</ul>
<p>Two further blueprint items: <b>PoE</b> budgets (802.3af up to 15.4 W per port, 802.3at up to 30 W, 802.3bt up to 60 or 90 W) must be summed per switch and per power supply, and <b>Wake-on-LAN</b> needs a Layer 2 path or a design that forwards the magic packet, which routed access breaks unless handled.</p>

<div class="warn"><p><b>Common mistakes.</b> LACP mode "on" on one side only; mismatched MST name or revision; no dual-active detection; spanning VLANs on every trunk instead of pruning to needed VLANs; and relying on default priorities so the root lands on an access switch.</p></div>
<div class="exam"><p><b>Exam trap.</b> LACP is the open standard; PAgP is Cisco only. Both ends need compatible modes (active-passive works, passive-passive does not form). MEC requires SVL, a stack, or vPC on Nexus.</p></div>

<div class="scn"><h4>Post-mortem: both switches thought they were active</h4><p>During a fibre cut, the SVL link in the South tower failed. With no dual-active detection configured, both distribution switches became active, both claimed the same IP addresses and the same MAC identity, and the tower lost the network for 11 minutes until an engineer reloaded one switch. The fix was a dedicated fast-hello dual-active detection link, and a runbook that checks the dual-active detection status.</p><p><b>Lesson:</b> SVL gives simplicity, but the links that hold the pair together must be diverse and monitored.</p></div>
<div class="iv"><p class="q">"Why not just use Rapid PVST+ with two distribution switches?"</p><p>Answer: it works, but half the uplinks are blocked per VLAN, failover depends on STP, and the failure domain is the whole VLAN. SVL with MEC uses all links and turns failover into an EtherChannel event. Mention that STP stays on as a safety net.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rapid PVST+ and MST converge fast; MST scales better with many VLANs but needs identical region settings.</li>
<li>Place the root at distribution and protect it with root guard, BPDU guard, loop guard and UDLD.</li>
<li>EtherChannel with LACP removes STP blocking; MEC needs SVL, a switch stack, or vPC.</li>
<li>SVL needs dual-active detection to avoid split-brain.</li>
<li>If the VLAN must span closets, Layer 2 stays; contain it.</li>
</ul></div>
`,hi:`
<p>Layer 2 network aisi building hai jisme kamron ke beech bahut saare darwaze hain: agar do corridors ek dusre mein loop ban jaayein to log (frames) hamesha chakkar kaatenge. Ethernet frames mein hop count nahi hota, isliye loop ka matlab broadcast storm. <b>Loop-free design</b> woh kala hai jisme redundancy rahe lekin frames chakkar na lagayein.</p>

<h3>Case: Cedarbridge Health</h3>
<div class="eg"><p><b>Customer.</b> Cedarbridge Health ek regional hospital group hai. Uski main site mein teen towers (North, South, Clinic), 1,800 staff, 900 networked medical devices aur 400 APs hain. Budget USD 900,000 hai. Nurse-call aur infusion-pump systems Layer 2 VLAN (VLAN 40) use karte hain jo North tower ki har floor tak jaana chahiye, matlab 12 closets mein span karta hai. Downtime target: clinical VLANs ke liye koi bhi single device ya link failure 1 second se kam mein recover ho. Constraints: change windows kam hain, staff routing specialist nahi hai, aur medical vendor closets ke beech VLAN 40 ke liye Layer 3 support nahi karta.</p></div>

<h3>Spanning tree variants mein farak</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Instances</th><th>Convergence</th><th>Design use</th></tr>
<tr><td>STP (PVST+)</td><td>802.1D, Cisco per-VLAN</td><td>Har VLAN ke liye ek</td><td>30 se 50 seconds</td><td>Sirf legacy</td></tr>
<tr><td>Rapid PVST+</td><td>802.1w, Cisco per-VLAN</td><td>Har VLAN ke liye ek</td><td>Aam taur par 1 se 2 seconds, point-to-point links par aksar sub-second</td><td>Chhote aur medium blocks</td></tr>
<tr><td>MST</td><td>802.1s</td><td>Kam instances bahut VLANs map karte hain</td><td>Rapid, RSTP jaisa</td><td>Bahut VLANs, multi-vendor</td></tr></table>
<p><b>Scalability:</b> Rapid PVST+ har VLAN ke liye alag instance chalata hai, to trunk par 300 VLANs matlab 300 instances, aur CPU aur BPDU load VLAN count aur port count ke saath badhta hai. MST VLANs ke groups ko kuch instances par map karta hai (jaise instance 1 mein VLANs 10 se 49 aur instance 2 mein VLANs 50 se 99), jisse sirf do instances ke saath load sharing milti hai. Price hai configuration discipline: switches same <b>MST region</b> mein tabhi hain jab region name, revision number aur VLAN-to-instance mapping bilkul same ho. Ek typo se doosra region ban jaata hai aur design toot jaata hai. Root bridge ko soch samajh kar rakho: distribution layer mein, backup root ke saath, aur first-hop gateway ke saath align karo (chapter 3).</p>

<h3>Cedarbridge ke options</h3>
<table class="cmp"><tr><th>Option</th><th>Gain</th><th>Cost ya risk</th></tr>
<tr><td><b>A. Rapid PVST+, do distribution switches, loop-free U</b></td><td>Simple, well known</td><td>Har VLAN ke liye aadhe uplinks blocked; failover STP decide karta hai</td></tr>
<tr><td><b>B. MST, do instances</b></td><td>Load sharing, kam CPU</td><td>Region mismatch risk; team ko MST seekhna padega</td></tr>
<tr><td><b>C. StackWise Virtual pair + Multichassis EtherChannel (MEC)</b></td><td>Koi blocked link nahi; failover STP event nahi, EtherChannel event hai</td><td>Ek logical control plane; dual-active detection chahiye</td></tr>
<tr><td><b>D. Routed access</b></td><td>Best convergence</td><td>VLAN 40 requirement tod deta hai</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="StackWise Virtual with MEC">
<rect x="150" y="20" width="340" height="80" rx="12" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="320" y="14" text-anchor="middle" class="svg-muted" font-size="12">Ek logical distribution switch</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="82" x2="100" y2="190"/><line x1="425" y1="82" x2="100" y2="190"/>
<line x1="215" y1="82" x2="320" y2="190"/><line x1="425" y1="82" x2="320" y2="190"/>
<line x1="215" y1="82" x2="540" y2="190"/><line x1="425" y1="82" x2="540" y2="190"/>
</g>
<line x1="260" y1="60" x2="380" y2="60" stroke="#ea580c" stroke-width="4"/>
<text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="12">SVL link</text>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="170" y="38" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="215" y="64">Dist 1</text>
<rect x="380" y="38" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="425" y="64">Dist 2</text>
<rect x="55" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="100" y="212">Access 1</text>
<rect x="275" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="320" y="212">Access 2</text>
<rect x="495" y="190" width="90" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="540" y="212">Access 3</text>
<text x="100" y="244" class="svg-muted" font-size="12">Po1 (2 links)</text>
<text x="320" y="244" class="svg-muted" font-size="12">Po2 (2 links)</text>
<text x="540" y="244" class="svg-muted" font-size="12">Po3 (2 links)</text>
</g>
<rect x="25" y="272" width="14" height="14" fill="#ddd6fe"/><text x="45" y="284" class="svg-ink" font-size="12">Distribution</text>
<rect x="150" y="272" width="14" height="14" fill="#bbf7d0"/><text x="170" y="284" class="svg-ink" font-size="12">Access</text>
<rect x="250" y="272" width="14" height="14" fill="#ea580c"/><text x="270" y="284" class="svg-ink" font-size="12">SVL link (control plane)</text>
</svg><p class="cap">Har access switch ko ek hi neighbour dikhta hai. STP kuch block nahi karta, kyunki har EtherChannel ek logical link hai.</p></div>

<h3>Chosen design aur kyun</h3>
<p>Cedarbridge ne <b>option C</b> choose kiya: har tower mein StackWise Virtual pair, har closet tak MEC, aur Rapid PVST+ safety net ke roop mein. Justification: VLAN 40 Layer 2 rehta hai (requirement), koi uplink blocked nahi, link ya switch failure EtherChannel change ke roop mein converge hota hai (aam taur par second se bahut kam mein), aur team har tower mein "ek switch" operate karti hai. <b>StackWise Virtual (SVL)</b> same model ke do supported Catalyst 9000 switches ko StackWise Virtual links (10G ya zyada) se ek logical switch mein jodta hai. Ek member active, doosra standby hota hai, SSO chalta hai. Catalyst 9300 stacks StackWise cables ke saath cross-stack EtherChannel bhi support karte hain. Nexus par yeh role vPC nibhata hai; Catalyst campus mein "vPC-less" jawab hain SVL, stacks, ya routed access.</p>

<pre class="code"><span class="c">! Both distribution switches (domain must match; reload required)</span>
stackwise-virtual
 domain 100
!
interface FortyGigabitEthernet1/0/1
 stackwise-virtual link 1
!
<span class="c">! Dual-active detection on a dedicated link</span>
interface GigabitEthernet1/0/10
 stackwise-virtual dual-active-detection
!
<span class="c">! Multichassis EtherChannel to Access 1</span>
interface range TenGigabitEthernet1/0/2, TenGigabitEthernet2/0/2
 channel-group 1 mode active
interface Port-channel1
 switchport mode trunk
</pre>
<pre class="out">DIST# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+---------------------------------
1      Po1(<span class="hl">SU</span>)         LACP        Te1/0/2(P)   Te2/0/2(P)
</pre>

<h3>Edge protection jo har Layer 2 design mein chahiye</h3>
<ul>
<li><b>PortFast aur BPDU guard</b> access ports par: rogue switch aaye to port shut ho jaata hai.</li>
<li><b>Root guard</b> distribution se access ki taraf ke ports par: koi access switch root nahi ban sakta.</li>
<li><b>Loop guard</b> aur <b>UDLD</b>: unidirectional fibre failures se bachate hain jo chupchaap BPDUs rok dete hain.</li>
<li><b>Storm control</b> edge ports par broadcast aur multicast cap karne ke liye.</li>
</ul>
<p>Do aur blueprint items: <b>PoE</b> budgets (802.3af per port 15.4 W tak, 802.3at 30 W tak, 802.3bt 60 ya 90 W tak) har switch aur har power supply ke hisaab se jodne padte hain, aur <b>Wake-on-LAN</b> ko Layer 2 path chahiye ya aisa design jo magic packet forward kare; routed access ise tod deta hai jab tak handle na ho.</p>

<div class="warn"><p><b>Common mistakes.</b> LACP mode "on" sirf ek side par; MST name ya revision mismatch; dual-active detection nahi; trunk par har VLAN allow karna, zaroori VLANs tak prune karne ki jagah; aur default priorities par rely karna jisse root access switch par chala jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> LACP open standard hai; PAgP sirf Cisco ka hai. Dono ends ke modes compatible hone chahiye (active-passive banta hai, passive-passive nahi). MEC ke liye SVL, stack, ya Nexus par vPC chahiye.</p></div>

<div class="scn"><h4>Post-mortem: dono switches ko laga woh active hain</h4><p>Fibre cut ke dauraan South tower ka SVL link fail ho gaya. Dual-active detection configure nahi tha, isliye dono distribution switches active ho gaye, dono ne same IP addresses aur same MAC identity claim ki, aur tower 11 minute network se kata raha jab tak engineer ne ek switch reload nahi kiya. Fix tha dedicated fast-hello dual-active detection link, aur ek runbook jo dual-active detection status check karta hai.</p><p><b>Seekh:</b> SVL simplicity deta hai, lekin pair ko jodne wale links diverse aur monitored hone chahiye.</p></div>
<div class="iv"><p class="q">"Do distribution switches ke saath sirf Rapid PVST+ kyun nahi?"</p><p>Answer: chalta hai, lekin har VLAN ke liye aadhe uplinks blocked hote hain, failover STP par depend karta hai, aur failure domain poora VLAN hota hai. SVL with MEC saare links use karta hai aur failover ko EtherChannel event bana deta hai. Yeh bhi bolo ki STP safety net ke roop mein on rehta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rapid PVST+ aur MST fast converge karte hain; MST zyada VLANs ke saath better scale karta hai lekin identical region settings chahiye.</li>
<li>Root distribution par rakho aur root guard, BPDU guard, loop guard aur UDLD se protect karo.</li>
<li>LACP EtherChannel STP blocking hata deta hai; MEC ke liye SVL, switch stack, ya vPC chahiye.</li>
<li>SVL ko split-brain se bachne ke liye dual-active detection chahiye.</li>
<li>VLAN closets ke beech span karni ho to Layer 2 rehta hai; use contain karo.</li>
</ul></div>
`}};export{e as default};