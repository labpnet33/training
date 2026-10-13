var e={id:`teaming-vmotion`,h:{en:`NIC teaming, distributed switches and live migration`,hi:`NIC teaming, distributed switches aur live migration`},body:{en:`
<p>A busy shop never has just one door. If the main entrance is blocked for repairs, customers walk in through the side door and hardly notice. And when the shop moves to a bigger building across the street, a good owner keeps the same phone number and puts up a sign, so regular customers still find it. A virtualized host needs both ideas: several doors to the network (<b>NIC teaming</b>) and a way to move a running VM without customers noticing (<b>live migration</b>).</p>

<h3>NIC teaming</h3>
<p>A host with 30 VMs behind one physical NIC has a single point of failure: one bad cable or switch port and all 30 servers disappear. <b>NIC teaming</b> binds two or more physical NICs (uplinks) to the same virtual switch. Best practice is to cable them to <b>two different physical switches</b>, so the host survives the loss of a NIC, a cable or a whole switch.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NIC teaming to two switches">
<rect x="110" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="185" y="45" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text>
<rect x="380" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="455" y="45" text-anchor="middle" class="svg-ink" font-size="13">SW2 (or SW1 Gi0/2)</text>
<line x1="185" y1="60" x2="240" y2="130" stroke="#64748b" stroke-width="3"/><line x1="455" y1="60" x2="400" y2="130" stroke="#64748b" stroke-width="3"/>
<text x="170" y="100" class="svg-muted" font-size="12">vmnic0</text><text x="430" y="100" class="svg-muted" font-size="12">vmnic1</text>
<rect x="160" y="130" width="320" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">vSwitch0: team of 2 uplinks</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">each VM pinned to one uplink</text>
<rect x="160" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="210" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM A</text>
<rect x="270" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM B</text>
<rect x="380" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="430" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM C</text>
</svg><p class="cap">Two uplinks to two switches: if one path fails, the VMs pinned to it move to the surviving uplink.</p></div>

<h3>Load-balancing policies (VMware names)</h3>
<table class="cmp"><tr><th>Policy</th><th>How it spreads traffic</th><th>Physical switch config</th></tr>
<tr><td>Route based on originating virtual port (default)</td><td>Each vNIC is pinned to one uplink; different VMs use different uplinks</td><td>Normal trunks, <b>no</b> EtherChannel</td></tr>
<tr><td>Route based on source MAC hash</td><td>Uplink chosen from the VM's MAC</td><td>Normal trunks, no EtherChannel</td></tr>
<tr><td>Route based on IP hash</td><td>Per flow, from source and destination IP</td><td><b>Static EtherChannel</b> (<code>channel-group N mode on</code>) on one switch or stack</td></tr>
<tr><td>Explicit failover order</td><td>Active uplink(s) used; standby only after a failure</td><td>Normal trunks</td></tr></table>
<p>With the default policy each VM's MAC always appears on exactly one switch port, so the physical switches see no flapping and no EtherChannel is needed. IP hash is the only mode that needs a port-channel, because the same MAC can then appear on both links at once. The standard vSwitch does not speak LACP; the <b>distributed switch</b> (below) does.</p>
<p>Failure detection is usually <b>link status</b>. When an uplink fails, its VMs move to a surviving uplink, and with "notify switches" enabled the host sends a frame sourced from each moved VM's MAC so that the physical switches update their MAC tables immediately.</p>

<h3>Checking the team in the lab</h3>
<p>In the troubleshooting lab, HV2 has two physical NICs, but someone unbound one from the vSwitch and the matching switch port is shut down:</p>
<pre class="out">HV2:~# nic list
Name    Link Status  Speed  Duplex  MAC Address        vSwitch    Connected to
vmnic0  Up           1000   Full    52:54:00:9c:10:00  vSwitch0   SW1 Gi0/1
<span class="hl">vmnic1  Down         0      -       52:54:00:9c:10:01  -          SW1 Gi0/2</span></pre>
<pre class="code"><span class="c">! bind the NIC back to the virtual switch</span>
HV2:~# vswitch uplink add vmnic1
<span class="c">! and bring the physical port up</span>
SW1(config)# interface g0/2
SW1(config-if)# no shutdown</pre>
<p>Afterwards <code>vswitch show</code> lists <code>vmnic0, vmnic1</code> as uplinks and both show Link Up with "802.1Q trunk". Remember that Gi0/2 must allow exactly the same VLANs as Gi0/1, or a VM that fails over to vmnic1 loses its VLAN.</p>

<h3>Standard vs distributed virtual switch</h3>
<p>A <b>standard vSwitch</b> is configured separately on each host. With 20 hosts, one typo in one port group on one host breaks every VM that lands there. A <b>distributed switch</b> (VMware vDS) is configured once in the central manager and pushed to all hosts, adds LACP, NetFlow, port mirroring and consistent port groups across the cluster.</p>

<h3>Live migration (vMotion)</h3>
<p><b>Live migration</b>, called <b>vMotion</b> by VMware and Live Migration by Hyper-V, moves a <b>running</b> VM from one host to another with no reboot and typically less than a second of pause. The hypervisor copies the VM's memory to the destination over a dedicated migration network while the VM keeps running, copies the last changed pages, then switches execution to the new host. Uses: patch or replace a host without downtime, and balance load (VMware DRS). Related: <b>HA</b> restarts VMs on another host after a host crash; that is a restart, not a live move.</p>
<p>Network requirements you must remember:</p>
<ul>
<li>The VM keeps its IP and MAC, so the <b>same VLAN / port group must exist on the destination host</b> and on its uplink trunks.</li>
<li>After the move, the destination host sends a frame (RARP on VMware) from the VM's MAC, so every switch moves that MAC to the new port.</li>
<li>Storage must be reachable from both hosts (shared storage), unless storage is migrated too.</li>
<li>The migration network itself needs bandwidth (10 Gbps or more is typical) and is kept separate from VM traffic.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> WEB (MAC 5254.003a.7c11, VLAN 10) moves from host A on SW1 Gi0/1 to host B on SW2 Gi0/5. Before: SW1 learned the MAC on Gi0/1. Host B sends a RARP from 5254.003a.7c11 tagged VLAN 10; SW2 learns it on Gi0/5, the frame floods through VLAN 10, and SW1 now learns the MAC on its uplink toward SW2. Users' TCP sessions continue. If host B's trunk did not allow VLAN 10, WEB would be running but unreachable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Building a port-channel on the physical switch toward a host that uses the default "originating virtual port" policy. The switch hashes return traffic onto either link, but the host expects each VM only on its pinned uplink, so traffic is dropped or duplicated. Match the switch to the teaming policy.</p></div>

<div class="exam"><p><b>Exam trap.</b> Live migration keeps the VM's IP and MAC; it is a Layer 2 move. That is why the VLAN must be stretched to every host in the cluster. HA is not live migration: HA reboots the VM elsewhere after a failure.</p></div>

<div class="scn"><h4>vMotion worked, the application did not</h4><p>During host patching, ten VMs were live-migrated to host ESX7. Nine were fine; the payroll VM stopped answering. It was still running and its console showed the correct IP. The engineer compared trunks: the port facing ESX7 allowed VLANs 10-30, while payroll lived in VLAN 45, added last month to the other hosts only. Adding VLAN 45 to ESX7's trunk restored it instantly.</p><p><b>Lesson:</b> every host in a cluster must present identical port groups and identical trunk allowed lists.</p></div>

<div class="iv"><p class="q">"What does the physical switch need to know about a host's NIC teaming?"</p><p>Ask which load-balancing policy the host uses. Default port-ID or MAC-hash pinning needs ordinary identical trunks and no EtherChannel, ideally to two switches. IP hash needs a static EtherChannel on one switch or stack; LACP needs a distributed switch. Mention that all team members must allow the same VLANs, that link-state is the usual failure detection, and that "notify switches" updates MAC tables after a failover or vMotion.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIC teaming binds several uplinks to one vSwitch for redundancy, ideally to two physical switches.</li>
<li>Default VMware teaming pins each VM to one uplink and needs no EtherChannel; IP hash needs a static port-channel.</li>
<li>All team members' switch ports must be identical trunks with the same allowed VLANs.</li>
<li>A distributed switch is configured once and applied to every host; it adds LACP and consistency.</li>
<li>Live migration (vMotion) moves a running VM with its IP and MAC; the VLAN must exist on the destination, and a RARP updates switch MAC tables.</li>
</ul></div>
`,hi:`
<p>Busy dukaan mein kabhi ek hi darwaza nahi hota. Agar main entrance repair ke liye band ho, to customers side door se andar aa jaate hain aur mushkil se notice karte hain. Aur jab dukaan saamne wali badi building mein shift hoti hai, to achha maalik same phone number rakhta hai aur board lagata hai, taaki regular customers phir bhi use dhoondh lein. Virtualized host ko dono ideas chahiye: network tak kai darwaze (<b>NIC teaming</b>) aur chalti VM ko bina customers ke notice kiye move karne ka tarika (<b>live migration</b>).</p>

<h3>NIC teaming</h3>
<p>Ek physical NIC ke peeche 30 VMs wale host mein single point of failure hota hai: ek kharab cable ya switch port aur saare 30 servers gayab. <b>NIC teaming</b> do ya zyada physical NICs (uplinks) ko same virtual switch se bind karta hai. Best practice hai unhe <b>do alag physical switches</b> se cable karna, taaki host ek NIC, ek cable ya poore switch ke jaane par bhi zinda rahe.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do switches tak NIC teaming">
<rect x="110" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="185" y="45" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text>
<rect x="380" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="455" y="45" text-anchor="middle" class="svg-ink" font-size="13">SW2 (ya SW1 Gi0/2)</text>
<line x1="185" y1="60" x2="240" y2="130" stroke="#64748b" stroke-width="3"/><line x1="455" y1="60" x2="400" y2="130" stroke="#64748b" stroke-width="3"/>
<text x="170" y="100" class="svg-muted" font-size="12">vmnic0</text><text x="430" y="100" class="svg-muted" font-size="12">vmnic1</text>
<rect x="160" y="130" width="320" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">vSwitch0: 2 uplinks ki team</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">har VM ek uplink par pinned</text>
<rect x="160" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="210" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM A</text>
<rect x="270" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM B</text>
<rect x="380" y="200" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="430" y="221" text-anchor="middle" class="svg-ink" font-size="12">VM C</text>
</svg><p class="cap">Do switches tak do uplinks: ek path fail ho to us par pinned VMs bache hue uplink par chali jaati hain.</p></div>

<h3>Load-balancing policies (VMware naam)</h3>
<table class="cmp"><tr><th>Policy</th><th>Traffic kaise failta hai</th><th>Physical switch config</th></tr>
<tr><td>Route based on originating virtual port (default)</td><td>Har vNIC ek uplink par pinned; alag VMs alag uplinks use karti hain</td><td>Normal trunks, EtherChannel <b>nahi</b></td></tr>
<tr><td>Route based on source MAC hash</td><td>Uplink VM ke MAC se chuna jaata hai</td><td>Normal trunks, EtherChannel nahi</td></tr>
<tr><td>Route based on IP hash</td><td>Per flow, source aur destination IP se</td><td>Ek switch ya stack par <b>static EtherChannel</b> (<code>channel-group N mode on</code>)</td></tr>
<tr><td>Explicit failover order</td><td>Active uplink(s) use hote hain; standby sirf failure ke baad</td><td>Normal trunks</td></tr></table>
<p>Default policy mein har VM ka MAC hamesha bilkul ek switch port par dikhta hai, isliye physical switches ko koi flapping nahi dikhti aur EtherChannel ki zaroorat nahi. IP hash hi akela mode hai jise port-channel chahiye, kyunki tab same MAC ek saath dono links par dikh sakta hai. Standard vSwitch LACP nahi bolta; <b>distributed switch</b> (neeche) bolta hai.</p>
<p>Failure detection aam taur par <b>link status</b> hota hai. Jab uplink fail hota hai, uski VMs bache hue uplink par chali jaati hain, aur "notify switches" enabled ho to host har moved VM ke MAC se ek frame bhejta hai taaki physical switches apni MAC tables turant update karein.</p>

<h3>Lab mein team check karna</h3>
<p>Troubleshooting lab mein HV2 ke do physical NICs hain, par kisi ne ek ko vSwitch se unbind kar diya aur matching switch port shut down hai:</p>
<pre class="out">HV2:~# nic list
Name    Link Status  Speed  Duplex  MAC Address        vSwitch    Connected to
vmnic0  Up           1000   Full    52:54:00:9c:10:00  vSwitch0   SW1 Gi0/1
<span class="hl">vmnic1  Down         0      -       52:54:00:9c:10:01  -          SW1 Gi0/2</span></pre>
<pre class="code"><span class="c">! NIC ko wapas virtual switch se bind karo</span>
HV2:~# vswitch uplink add vmnic1
<span class="c">! aur physical port up karo</span>
SW1(config)# interface g0/2
SW1(config-if)# no shutdown</pre>
<p>Uske baad <code>vswitch show</code> uplinks mein <code>vmnic0, vmnic1</code> dikhata hai aur dono Link Up aur "802.1Q trunk" dikhate hain. Yaad rakho ki Gi0/2 ko bilkul wahi VLANs allow karne chahiye jo Gi0/1 karta hai, warna vmnic1 par fail over karne wali VM apna VLAN kho degi.</p>

<h3>Standard vs distributed virtual switch</h3>
<p><b>Standard vSwitch</b> har host par alag se configure hota hai. 20 hosts ke saath, ek host ke ek port group mein ek typo wahan pahunchne wali har VM ko tod deta hai. <b>Distributed switch</b> (VMware vDS) central manager mein ek baar configure hota hai aur saare hosts par push hota hai, aur LACP, NetFlow, port mirroring aur poore cluster mein consistent port groups jodta hai.</p>

<h3>Live migration (vMotion)</h3>
<p><b>Live migration</b>, jise VMware <b>vMotion</b> aur Hyper-V Live Migration kehta hai, <b>chalti</b> VM ko ek host se doosre host par bina reboot ke move karta hai, aam taur par ek second se kam pause ke saath. Hypervisor dedicated migration network par VM ki memory destination par copy karta hai jabki VM chalti rehti hai, aakhri badle pages copy karta hai, phir execution naye host par switch kar deta hai. Uses: bina downtime ke host patch ya replace karna, aur load balance karna (VMware DRS). Related: <b>HA</b> host crash ke baad VMs ko doosre host par restart karta hai; yeh restart hai, live move nahi.</p>
<p>Network requirements jo aapko yaad rakhni hain:</p>
<ul>
<li>VM apna IP aur MAC rakhti hai, isliye <b>destination host par same VLAN / port group exist karna chahiye</b> aur uske uplink trunks par bhi.</li>
<li>Move ke baad destination host VM ke MAC se ek frame (VMware par RARP) bhejta hai, taaki har switch us MAC ko naye port par le jaaye.</li>
<li>Storage dono hosts se reachable honi chahiye (shared storage), jab tak storage bhi migrate na ho.</li>
<li>Migration network ko khud bandwidth chahiye (10 Gbps ya zyada typical hai) aur ise VM traffic se alag rakha jaata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> WEB (MAC 5254.003a.7c11, VLAN 10) SW1 Gi0/1 wale host A se SW2 Gi0/5 wale host B par move hoti hai. Pehle: SW1 ne MAC Gi0/1 par learn kiya tha. Host B 5254.003a.7c11 se VLAN 10 tagged RARP bhejta hai; SW2 use Gi0/5 par learn karta hai, frame VLAN 10 mein flood hota hai, aur SW1 ab MAC ko SW2 ki taraf wale uplink par learn karta hai. Users ke TCP sessions chalte rehte hain. Agar host B ka trunk VLAN 10 allow nahi karta, to WEB chal rahi hoti par unreachable hoti.</p></div>

<div class="warn"><p><b>Common galti.</b> Default "originating virtual port" policy use karne wale host ki taraf physical switch par port-channel banana. Switch return traffic ko kisi bhi link par hash karta hai, par host har VM ko sirf uske pinned uplink par expect karta hai, isliye traffic drop ya duplicate hota hai. Switch ko teaming policy se match karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Live migration VM ka IP aur MAC rakhta hai; yeh Layer 2 move hai. Isi liye VLAN ko cluster ke har host tak stretch karna padta hai. HA live migration nahi hai: HA failure ke baad VM ko kahin aur reboot karta hai.</p></div>

<div class="scn"><h4>vMotion chala, application nahi</h4><p>Host patching ke dauraan das VMs host ESX7 par live-migrate hui. Nau theek thi; payroll VM ne jawab dena band kar diya. Woh abhi bhi chal rahi thi aur uska console sahi IP dikha raha tha. Engineer ne trunks compare kiye: ESX7 ki taraf wala port VLANs 10-30 allow karta tha, jabki payroll VLAN 45 mein thi, jo pichhle mahine sirf baaki hosts par joda gaya tha. ESX7 ke trunk par VLAN 45 jodne se woh turant wapas aa gayi.</p><p><b>Seekh:</b> cluster ke har host ko identical port groups aur identical trunk allowed lists present karni chahiye.</p></div>

<div class="iv"><p class="q">"Physical switch ko host ki NIC teaming ke baare mein kya pata hona chahiye?"</p><p>Poochho ki host kaunsi load-balancing policy use karta hai. Default port-ID ya MAC-hash pinning ko ordinary identical trunks chahiye aur koi EtherChannel nahi, ideally do switches tak. IP hash ko ek switch ya stack par static EtherChannel chahiye; LACP ko distributed switch chahiye. Mention karo ki team ke saare members same VLANs allow karein, link-state aam failure detection hai, aur "notify switches" failover ya vMotion ke baad MAC tables update karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIC teaming redundancy ke liye kai uplinks ko ek vSwitch se bind karta hai, ideally do physical switches tak.</li>
<li>Default VMware teaming har VM ko ek uplink par pin karti hai aur EtherChannel nahi chahiye; IP hash ko static port-channel chahiye.</li>
<li>Team ke saare members ke switch ports same allowed VLANs wale identical trunks hone chahiye.</li>
<li>Distributed switch ek baar configure hokar har host par apply hota hai; yeh LACP aur consistency jodta hai.</li>
<li>Live migration (vMotion) chalti VM ko uske IP aur MAC ke saath move karta hai; VLAN destination par exist karna chahiye, aur RARP switch MAC tables update karta hai.</li>
</ul></div>
`}};export{e as default};