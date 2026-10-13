var e={id:`edge-protection`,h:{en:`PortFast, BPDU Guard, BPDU Filter, Root Guard and Loop Guard`,hi:`PortFast, BPDU Guard, BPDU Filter, Root Guard aur Loop Guard`},body:{en:`
<p>A housing society has different rules for different gates. The resident gate opens instantly for residents (PortFast) but the guard calls security if a truck tries to enter (BPDU Guard). The service gate lets delivery vans out but never lets anyone claim to be the society secretary (Root Guard). And on the internal road, if the guard at the far end stops answering his walkie-talkie, you close the road rather than assume it is clear (Loop Guard). Spanning tree's protection features are exactly these gate rules, and the exam wants you to know <b>where each one goes</b> and <b>what happens when it fires</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Where each STP protection feature is configured">
<rect x="230" y="20" width="180" height="46" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Distribution (root)</text>
<rect x="60" y="120" width="160" height="46" rx="8" fill="#bae6fd"/><text x="140" y="148" text-anchor="middle" class="svg-ink" font-size="14">Access SW-A</text>
<rect x="420" y="120" width="160" height="46" rx="8" fill="#bae6fd"/><text x="500" y="148" text-anchor="middle" class="svg-ink" font-size="14">Access SW-B</text>
<line x1="270" y1="66" x2="160" y2="120" stroke="#64748b" stroke-width="3"/><line x1="370" y1="66" x2="480" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="175" y="84" class="svg-accent" font-size="12">Root Guard</text><text x="400" y="84" class="svg-accent" font-size="12">Root Guard</text>
<line x1="220" y1="143" x2="420" y2="143" stroke="#64748b" stroke-width="2"/><text x="320" y="136" text-anchor="middle" class="svg-accent" font-size="12">Loop Guard (RP/ALT)</text>
<rect x="60" y="200" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="140" y="225" text-anchor="middle" class="svg-ink" font-size="13">PCs, phones, APs</text>
<line x1="140" y1="166" x2="140" y2="200" stroke="#64748b" stroke-width="2"/><text x="148" y="188" class="svg-accent" font-size="12">PortFast + BPDU Guard</text>
<rect x="420" y="200" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="225" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor trunk</text>
<line x1="500" y1="166" x2="500" y2="200" stroke="#64748b" stroke-width="2"/><text x="508" y="188" class="svg-accent" font-size="12">portfast trunk + guard</text>
</svg><p class="cap">Root Guard faces down from the root; Loop Guard sits on non-designated uplinks; PortFast and BPDU Guard sit on host ports.</p></div>

<h3>PortFast (edge port)</h3>
<p>Host ports should forward the moment a cable is plugged in. <b>PortFast</b> makes an access port an RSTP <b>edge</b> port: it goes straight to forwarding, is skipped during sync, and never generates a topology change when it flaps. It does <b>not</b> disable STP: if a BPDU arrives, the port immediately loses its edge status and behaves as a normal STP port.</p>
<pre class="code">SW3(config)# interface range GigabitEthernet0/5 - 7
SW3(config-if-range)# spanning-tree portfast
%Warning: portfast should only be enabled on ports connected to a single
 host. Connecting hubs, concentrators, switches, bridges, etc... to this
 interface  when portfast is enabled, can cause temporary bridging loops.
 Use with CAUTION
<span class="c">! Global form: every access (non-trunking) port becomes edge</span>
SW3(config)# spanning-tree portfast default
<span class="c">! Trunk to a server or hypervisor needs the trunk keyword</span>
SW3(config-if)# spanning-tree portfast trunk</pre>
<p>Newer IOS XE also accepts <code>spanning-tree portfast edge</code> and <code>spanning-tree portfast edge default</code>. A port where you want normal STP despite the global default takes <code>spanning-tree portfast disable</code>.</p>

<h3>BPDU Guard</h3>
<p>A PC never sends BPDUs, so a BPDU on a host port means someone connected a switch. <b>BPDU Guard</b> reacts by putting the port into <b>err-disabled</b> state: it is shut down until an administrator (or errdisable recovery) brings it back.</p>
<pre class="code">SW3(config-if-range)# spanning-tree bpduguard enable
<span class="c">! Or globally, for every port that is operationally PortFast</span>
SW3(config)# spanning-tree portfast bpduguard default
<span class="c">! Optional automatic recovery after 300 seconds</span>
SW3(config)# errdisable recovery cause bpduguard
SW3(config)# errdisable recovery interval 300</pre>

<h3>BPDU Filter</h3>
<p><b>BPDU Filter</b> stops BPDUs, and its behaviour depends on where you configure it:</p>
<ul>
<li><b>Interface level</b> (<code>spanning-tree bpdufilter enable</code>): the port neither sends nor processes BPDUs. That is effectively <b>STP disabled on that port</b>; if a loop forms through it, nothing will block it. Use only in special cases such as a provider edge where BPDUs must not cross.</li>
<li><b>Global level</b> (<code>spanning-tree portfast bpdufilter default</code>): applies to PortFast ports. They send a few BPDUs when the link comes up and then stop sending. If a BPDU is ever <b>received</b>, the port loses both PortFast and filtering and becomes a normal STP port. Much safer.</li>
</ul>
<p>If both BPDU Filter and BPDU Guard are on a port, the filter wins and the guard never sees a BPDU.</p>

<h3>Root Guard</h3>
<p><b>Root Guard</b> says "this port must stay designated; the root is never through here". Configure it on distribution ports facing access switches or customers. If a <b>superior</b> BPDU arrives, the port goes <b>root-inconsistent</b>: blocked (discarding) for that VLAN, not err-disabled. It recovers <b>by itself</b> as soon as superior BPDUs stop.</p>
<pre class="code">DSW1(config)# interface GigabitEthernet0/10
DSW1(config-if)# spanning-tree guard root</pre>

<h3>Loop Guard</h3>
<p>On a root or alternate port, BPDUs keep arriving from the designated switch. If they stop because a fibre has failed in <b>one direction</b> (a unidirectional link), normal STP would age out the information and turn the port designated and forwarding, creating a loop. <b>Loop Guard</b> puts such a port into <b>loop-inconsistent</b> (blocked) instead, and releases it automatically when BPDUs return. Configure it on non-designated switch-to-switch ports, or globally with <code>spanning-tree loopguard default</code>. A port takes one guard mode at a time (<code>spanning-tree guard loop | root | none</code>).</p>

<table class="cmp"><tr><th>Feature</th><th>Where</th><th>Trigger</th><th>Result</th><th>Recovery</th></tr>
<tr><td>PortFast</td><td>Host ports</td><td>Link up</td><td>Forward at once; no TC</td><td>Loses edge on BPDU</td></tr>
<tr><td>BPDU Guard</td><td>Host (PortFast) ports</td><td>Any BPDU</td><td>err-disabled</td><td>Manual or errdisable recovery</td></tr>
<tr><td>BPDU Filter</td><td>Rare, special edges</td><td>n/a</td><td>BPDUs not sent (and not processed at interface level)</td><td>n/a</td></tr>
<tr><td>Root Guard</td><td>Designated ports facing downstream</td><td>Superior BPDU</td><td>root-inconsistent (blocked)</td><td>Automatic</td></tr>
<tr><td>Loop Guard</td><td>Root/alternate ports</td><td>BPDUs stop</td><td>loop-inconsistent (blocked)</td><td>Automatic</td></tr>
</table>

<div class="eg"><p><b>Lab walkthrough: ROGUE meets BPDU Guard.</b> With PortFast and BPDU Guard on Gi0/5 to Gi0/7, bring up Gi0/7 where facilities patched ROGUE (priority 0, which would beat every switch):</p>
<pre class="out">SW3(config)# interface GigabitEthernet0/7
SW3(config-if)# no shutdown
%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/7 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/7, putting Gi0/7 in err-disable state

SW3# show interfaces status err-disabled

Port         Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/7        SPARE-DESK-14      err-disabled bpduguard</span>

SW3# show spanning-tree root | include VLAN0010
<span class="hl">VLAN0010         24586 5254.0023.a200         4    2   20  15  Gi0/1</span></pre>
<p>SW1 is still root for VLAN 10. Without the guard, ROGUE's BPDU (priority 10 in VLAN 10) would have been superior and ROGUE would have become root for every VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling PortFast on a switch-to-switch link "to make it come up faster", or using interface-level BPDU Filter on user ports. The first risks a temporary loop on every link-up; the second removes STP's protection completely.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the symptom to the feature: <b>err-disabled</b> = BPDU Guard; <b>root-inconsistent</b> = Root Guard; <b>loop-inconsistent</b> = Loop Guard; port quietly <b>loses PortFast</b> = PortFast (or global BPDU Filter) receiving a BPDU. Only err-disabled needs manual recovery.</p></div>

<div class="scn"><h4>The hypervisor that spoke STP</h4><p>A server team's hypervisor was connected over a trunk with <code>spanning-tree portfast trunk</code> and BPDU Guard. One afternoon the port went err-disabled and forty VMs lost their network. The log showed BPDU Guard. A tester had built a virtual machine that bridged two virtual NICs and ran a software bridge with STP enabled, so BPDUs came out of the hypervisor. The guard did its job and stopped a potential loop; the team removed the test bridge, then bounced the port with <code>shutdown</code> and <code>no shutdown</code>.</p><p><b>Lesson:</b> BPDU Guard on edge trunks is worth the occasional outage; find the BPDU source before re-enabling the port.</p></div>

<div class="iv"><p class="q">"What is the difference between BPDU Guard and Root Guard?"</p><p>Strong answer: BPDU Guard is for host ports; any BPDU at all err-disables the port, which stays down until manual or errdisable recovery. Root Guard is for designated ports toward downstream switches; it allows normal BPDUs but blocks the port as root-inconsistent if a superior BPDU arrives, and recovers automatically when those stop. Add Loop Guard (loop-inconsistent when BPDUs stop on a root or alternate port) and why interface-level BPDU Filter is dangerous.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PortFast makes host ports edge ports: instant forwarding, no TCs; a BPDU removes edge status.</li>
<li>BPDU Guard err-disables a port that receives any BPDU; recover manually or with errdisable recovery.</li>
<li>Interface BPDU Filter disables STP on the port; global BPDU Filter on PortFast ports reverts on a received BPDU.</li>
<li>Root Guard: superior BPDU gives root-inconsistent, automatic recovery; place on downstream-facing designated ports.</li>
<li>Loop Guard: missing BPDUs on root/alternate ports give loop-inconsistent, protecting against unidirectional links.</li>
</ul></div>
`,hi:`
<p>Ek housing society alag gates ke liye alag rules rakhti hai. Resident gate residents ke liye turant khulta hai (PortFast) lekin agar koi truck andar aane ki koshish kare to guard security ko bulata hai (BPDU Guard). Service gate delivery vans ko bahar jaane deta hai lekin kisi ko society secretary hone ka daava nahi karne deta (Root Guard). Aur andar ki road par, agar door wale end ka guard walkie-talkie ka jawab dena band kar de, to aap maan nahi lete ki road khaali hai, balki use band kar dete ho (Loop Guard). Spanning tree ke protection features bilkul yahi gate rules hain, aur exam chahta hai ki aapko pata ho <b>har ek kahan lagta hai</b> aur <b>fire hone par kya hota hai</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Har STP protection feature kahan configure hota hai">
<rect x="230" y="20" width="180" height="46" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Distribution (root)</text>
<rect x="60" y="120" width="160" height="46" rx="8" fill="#bae6fd"/><text x="140" y="148" text-anchor="middle" class="svg-ink" font-size="14">Access SW-A</text>
<rect x="420" y="120" width="160" height="46" rx="8" fill="#bae6fd"/><text x="500" y="148" text-anchor="middle" class="svg-ink" font-size="14">Access SW-B</text>
<line x1="270" y1="66" x2="160" y2="120" stroke="#64748b" stroke-width="3"/><line x1="370" y1="66" x2="480" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="175" y="84" class="svg-accent" font-size="12">Root Guard</text><text x="400" y="84" class="svg-accent" font-size="12">Root Guard</text>
<line x1="220" y1="143" x2="420" y2="143" stroke="#64748b" stroke-width="2"/><text x="320" y="136" text-anchor="middle" class="svg-accent" font-size="12">Loop Guard (RP/ALT)</text>
<rect x="60" y="200" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="140" y="225" text-anchor="middle" class="svg-ink" font-size="13">PCs, phones, APs</text>
<line x1="140" y1="166" x2="140" y2="200" stroke="#64748b" stroke-width="2"/><text x="148" y="188" class="svg-accent" font-size="12">PortFast + BPDU Guard</text>
<rect x="420" y="200" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="225" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor trunk</text>
<line x1="500" y1="166" x2="500" y2="200" stroke="#64748b" stroke-width="2"/><text x="508" y="188" class="svg-accent" font-size="12">portfast trunk + guard</text>
</svg><p class="cap">Root Guard root se neeche ki taraf dekhta hai; Loop Guard non-designated uplinks par baithta hai; PortFast aur BPDU Guard host ports par.</p></div>

<h3>PortFast (edge port)</h3>
<p>Host ports ko cable lagte hi forward karna chahiye. <b>PortFast</b> access port ko RSTP <b>edge</b> port bana deta hai: woh seedha forwarding mein jaata hai, sync mein skip hota hai, aur flap hone par kabhi topology change generate nahi karta. Yeh STP ko <b>band nahi</b> karta: agar BPDU aaye, port turant apna edge status kho deta hai aur normal STP port ki tarah behave karta hai.</p>
<pre class="code">SW3(config)# interface range GigabitEthernet0/5 - 7
SW3(config-if-range)# spanning-tree portfast
%Warning: portfast should only be enabled on ports connected to a single
 host. Connecting hubs, concentrators, switches, bridges, etc... to this
 interface  when portfast is enabled, can cause temporary bridging loops.
 Use with CAUTION
<span class="c">! Global form: har access (non-trunking) port edge ban jaata hai</span>
SW3(config)# spanning-tree portfast default
<span class="c">! Server ya hypervisor wale trunk ko trunk keyword chahiye</span>
SW3(config-if)# spanning-tree portfast trunk</pre>
<p>Naya IOS XE <code>spanning-tree portfast edge</code> aur <code>spanning-tree portfast edge default</code> bhi accept karta hai. Jis port par global default ke bawajood normal STP chahiye, us par <code>spanning-tree portfast disable</code> lagao.</p>

<h3>BPDU Guard</h3>
<p>PC kabhi BPDUs nahi bhejta, isliye host port par BPDU ka matlab hai kisi ne switch laga diya. <b>BPDU Guard</b> port ko <b>err-disabled</b> state mein daal kar react karta hai: woh tab tak band rehta hai jab tak administrator (ya errdisable recovery) use wapas na laaye.</p>
<pre class="code">SW3(config-if-range)# spanning-tree bpduguard enable
<span class="c">! Ya globally, har us port ke liye jo operationally PortFast hai</span>
SW3(config)# spanning-tree portfast bpduguard default
<span class="c">! Optional: 300 second baad automatic recovery</span>
SW3(config)# errdisable recovery cause bpduguard
SW3(config)# errdisable recovery interval 300</pre>

<h3>BPDU Filter</h3>
<p><b>BPDU Filter</b> BPDUs rokta hai, aur iska behaviour is baat par depend karta hai ki aap ise kahan configure karte ho:</p>
<ul>
<li><b>Interface level</b> (<code>spanning-tree bpdufilter enable</code>): port na BPDUs bhejta hai na process karta hai. Yeh effectively <b>us port par STP disabled</b> hai; agar uske through loop bane, to use koi block nahi karega. Sirf special cases mein use karo, jaise provider edge jahan BPDUs cross nahi hone chahiye.</li>
<li><b>Global level</b> (<code>spanning-tree portfast bpdufilter default</code>): PortFast ports par lagta hai. Link up hone par woh kuch BPDUs bhejte hain aur phir bhejna band kar dete hain. Agar kabhi BPDU <b>receive</b> ho, port PortFast aur filtering dono kho deta hai aur normal STP port ban jaata hai. Kahin zyada safe.</li>
</ul>
<p>Agar ek port par BPDU Filter aur BPDU Guard dono hain, to filter jeetta hai aur guard ko kabhi BPDU dikhta hi nahi.</p>

<h3>Root Guard</h3>
<p><b>Root Guard</b> kehta hai "yeh port designated hi rehna chahiye; root kabhi yahan se nahi hai". Ise access switches ya customers ki taraf wale distribution ports par configure karo. Agar <b>superior</b> BPDU aaye, port <b>root-inconsistent</b> ho jaata hai: us VLAN ke liye blocked (discarding), err-disabled nahi. Superior BPDUs rukte hi yeh <b>khud</b> recover ho jaata hai.</p>
<pre class="code">DSW1(config)# interface GigabitEthernet0/10
DSW1(config-if)# spanning-tree guard root</pre>

<h3>Loop Guard</h3>
<p>Root ya alternate port par designated switch se BPDUs aate rehte hain. Agar woh isliye ruk jaayein ki fibre <b>ek direction</b> mein fail ho gaya (unidirectional link), to normal STP information age out karke port ko designated aur forwarding bana dega, aur loop ban jaayega. <b>Loop Guard</b> aise port ko uski jagah <b>loop-inconsistent</b> (blocked) mein daalta hai, aur BPDUs wapas aate hi apne aap chhod deta hai. Ise non-designated switch-to-switch ports par configure karo, ya globally <code>spanning-tree loopguard default</code> se. Ek port par ek samay mein ek hi guard mode hota hai (<code>spanning-tree guard loop | root | none</code>).</p>

<table class="cmp"><tr><th>Feature</th><th>Kahan</th><th>Trigger</th><th>Result</th><th>Recovery</th></tr>
<tr><td>PortFast</td><td>Host ports</td><td>Link up</td><td>Turant forward; TC nahi</td><td>BPDU par edge khota hai</td></tr>
<tr><td>BPDU Guard</td><td>Host (PortFast) ports</td><td>Koi bhi BPDU</td><td>err-disabled</td><td>Manual ya errdisable recovery</td></tr>
<tr><td>BPDU Filter</td><td>Rare, special edges</td><td>n/a</td><td>BPDUs nahi bheje jaate (interface level par process bhi nahi)</td><td>n/a</td></tr>
<tr><td>Root Guard</td><td>Downstream ki taraf designated ports</td><td>Superior BPDU</td><td>root-inconsistent (blocked)</td><td>Automatic</td></tr>
<tr><td>Loop Guard</td><td>Root/alternate ports</td><td>BPDUs ruk jaayein</td><td>loop-inconsistent (blocked)</td><td>Automatic</td></tr>
</table>

<div class="eg"><p><b>Lab walkthrough: ROGUE ki mulaqat BPDU Guard se.</b> Gi0/5 se Gi0/7 par PortFast aur BPDU Guard ke saath, Gi0/7 up karo jahan facilities ne ROGUE lagaya (priority 0, jo har switch ko hara deta):</p>
<pre class="out">SW3(config)# interface GigabitEthernet0/7
SW3(config-if)# no shutdown
%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/7 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/7, putting Gi0/7 in err-disable state

SW3# show interfaces status err-disabled

Port         Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/7        SPARE-DESK-14      err-disabled bpduguard</span>

SW3# show spanning-tree root | include VLAN0010
<span class="hl">VLAN0010         24586 5254.0023.a200         4    2   20  15  Gi0/1</span></pre>
<p>SW1 abhi bhi VLAN 10 ka root hai. Guard ke bina ROGUE ka BPDU (VLAN 10 mein priority 10) superior hota aur ROGUE har VLAN ka root ban jaata.</p></div>

<div class="warn"><p><b>Common galti.</b> Switch-to-switch link par "jaldi up hone ke liye" PortFast lagana, ya user ports par interface-level BPDU Filter use karna. Pehla har link-up par temporary loop ka risk laata hai; doosra STP ki protection poori tarah hata deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom ko feature se match karo: <b>err-disabled</b> = BPDU Guard; <b>root-inconsistent</b> = Root Guard; <b>loop-inconsistent</b> = Loop Guard; port chupchaap <b>PortFast kho deta hai</b> = PortFast (ya global BPDU Filter) ko BPDU mila. Sirf err-disabled ko manual recovery chahiye.</p></div>

<div class="scn"><h4>Hypervisor jo STP bolne laga</h4><p>Server team ka hypervisor <code>spanning-tree portfast trunk</code> aur BPDU Guard wale trunk se juda tha. Ek dopahar port err-disabled ho gaya aur chaalis VMs ka network chala gaya. Log mein BPDU Guard tha. Ek tester ne ek virtual machine banayi thi jo do virtual NICs ko bridge karti thi aur STP enabled software bridge chalati thi, isliye hypervisor se BPDUs nikle. Guard ne apna kaam kiya aur ek possible loop roka; team ne test bridge hataya, phir <code>shutdown</code> aur <code>no shutdown</code> se port bounce kiya.</p><p><b>Seekh:</b> edge trunks par BPDU Guard kabhi kabhi ke outage ke laayak hai; port dobara enable karne se pehle BPDU ka source dhoondho.</p></div>

<div class="iv"><p class="q">"BPDU Guard aur Root Guard mein kya fark hai?"</p><p>Strong answer: BPDU Guard host ports ke liye hai; koi bhi BPDU port ko err-disable kar deta hai, jo manual ya errdisable recovery tak down rehta hai. Root Guard downstream switches ki taraf designated ports ke liye hai; yeh normal BPDUs allow karta hai lekin superior BPDU aane par port ko root-inconsistent ke roop mein block karta hai, aur unke rukte hi apne aap recover hota hai. Loop Guard jodo (root ya alternate port par BPDUs rukne par loop-inconsistent) aur batao ki interface-level BPDU Filter khatarnak kyun hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PortFast host ports ko edge ports banata hai: turant forwarding, koi TCs nahi; BPDU edge status hata deta hai.</li>
<li>BPDU Guard koi bhi BPDU receive karne wale port ko err-disable karta hai; manually ya errdisable recovery se recover karo.</li>
<li>Interface BPDU Filter port par STP disable karta hai; PortFast ports par global BPDU Filter BPDU receive hone par revert ho jaata hai.</li>
<li>Root Guard: superior BPDU par root-inconsistent, automatic recovery; downstream ki taraf designated ports par lagao.</li>
<li>Loop Guard: root/alternate ports par BPDUs gayab hon to loop-inconsistent, unidirectional links se protection.</li>
</ul></div>
`}};export{e as default};