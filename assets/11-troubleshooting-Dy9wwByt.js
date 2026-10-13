var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the VM without a network`,hi:`Troubleshooting workflow: bina network wali VM`},body:{en:`
<p>When a tap in a flat runs dry, a good plumber does not start by digging up the street. He checks the tap, then the valve under the sink, then the flat's main valve, then the pipe in the corridor, and only then the street main. Each check takes a minute and splits the problem in half. A VM with no network deserves the same patient, layer-by-layer walk, starting <b>inside the host</b>.</p>

<h3>The six-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="VM network troubleshooting path">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 VM: power, IP, gateway</text>
<rect x="20" y="80" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">2 vNIC and port group</text>
<rect x="20" y="140" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="12">3 port group VLAN ID</text>
<rect x="20" y="200" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="225" text-anchor="middle" class="svg-ink" font-size="12">4 uplinks and team</text>
<rect x="240" y="200" width="180" height="40" rx="8" fill="#bae6fd"/><text x="330" y="225" text-anchor="middle" class="svg-ink" font-size="12">5 switch port: trunk, VLANs</text>
<rect x="460" y="200" width="160" height="40" rx="8" fill="#fed7aa"/><text x="540" y="225" text-anchor="middle" class="svg-ink" font-size="12">6 gateway / VRF</text>
<line x1="110" y1="60" x2="110" y2="80" stroke="#64748b" stroke-width="2"/><line x1="110" y1="120" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><line x1="110" y1="180" x2="110" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="220" x2="240" y2="220" stroke="#64748b" stroke-width="2"/><line x1="420" y1="220" x2="460" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">steps 1-4: hypervisor (vm list, vswitch show, nic list)</text>
<text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="12">step 5: show interfaces trunk, show vlan brief</text>
<text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">step 6: show ip interface brief, ping vrf</text>
<text x="320" y="280" text-anchor="middle" class="svg-accent" font-size="13">start in the host, walk outward</text>
</svg><p class="cap">Work from the VM outward; each step has one or two commands.</p></div>
<ol>
<li><b>The VM itself.</b> Is it powered on? Are IP, mask and default gateway correct? A VM that is powered off shows its vNIC as down.</li>
<li><b>vNIC connection.</b> Is the vNIC attached, and to which port group? (In vSphere: the "Connected" checkbox.)</li>
<li><b>Port group VLAN.</b> Does the port group's VLAN ID match the gateway's VLAN? This is the most common fault.</li>
<li><b>Uplinks and teaming.</b> Are all expected physical NICs bound to the vSwitch and up? Does the teaming policy match the switch (no port-channel for port-ID pinning)?</li>
<li><b>Physical switch port.</b> Static trunk? VLAN in the allowed list on <b>every</b> team member? VLAN created on the switch? Native VLAN consistent?</li>
<li><b>Gateway.</b> Does a subinterface or SVI exist with the right VLAN and IP? Is it in a VRF (then test with <code>ping vrf</code>)?</li>
</ol>

<h3>Worked lab: "The VM that lost its network"</h3>
<p>Ticket: after a maintenance window, APP (10.20.20.30, VLAN 20) on HV2 cannot reach its gateway 10.20.20.1, while WEB (VLAN 10) on the same host works. The fact that WEB works already tells you the host, uplink vmnic0 and SW1 Gi0/1 pass <b>some</b> traffic; suspect something VLAN-20-specific.</p>
<pre class="out">APP&gt; ping 10.20.20.1
host (10.20.20.1) not reachable

HV2:~# vm list
Name        State        vNIC     Port group        VLAN  MAC address        IPv4 address
<span class="hl">APP         Powered on   vport2   PG-App            21    52:54:00:4e:a1:02  10.20.20.30/24</span>
WEB         Powered on   vport1   PG-Web            10    52:54:00:4e:a1:01  10.10.10.11/24</pre>
<p><b>Fault 1 (step 3):</b> APP is powered on and addressed correctly, but PG-App tags VLAN <b>21</b>, while R1's subinterface is <code>dot1Q 20</code>. Fix the port group, not the VM:</p>
<pre class="code">HV2:~# vswitch portgroup set PG-App vlan 20
Port group PG-App now tags VLAN 20</pre>
<p>Ping still fails. Keep walking.</p>
<pre class="out">HV2:~# vswitch show
Switch Name      Num Ports   Used Ports  MTU     Uplinks
vSwitch0         6           3           1500    <span class="hl">vmnic0</span>
   ...
   Uplink   Link   Physical switch port        Tagging
   vmnic0   Up     SW1 Gi0/1                   802.1Q trunk
<span class="hl">   vmnic1   Unused SW1 Gi0/2                   peer port is down (tagged VLANs will be lost)</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       10,20
<span class="hl">Gi0/1       10</span></pre>
<p><b>Fault 2 (step 5):</b> the only active uplink lands on Gi0/1, which allows VLAN 10 only; VLAN 20 frames are dropped at SW1. Use <code>add</code>, so you do not remove VLAN 10 and break WEB:</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# switchport trunk allowed vlan add 20</pre>
<p><b>Fault 3 (step 4):</b> vmnic1 is "Unused" (unbound from the vSwitch) and its switch port Gi0/2 is administratively down, so HV2 has no redundancy. Also notice Gi0/2 is missing from <code>show interfaces trunk</code>: only trunks that are up are listed.</p>
<pre class="code">HV2:~# vswitch uplink add vmnic1
SW1(config)# interface g0/2
SW1(config-if)# no shutdown</pre>
<pre class="out">APP&gt; ping 10.20.20.1
<span class="hl">84 bytes from 10.20.20.1 icmp_seq=1 ttl=255 time=1.402 ms</span>
WEB&gt; ping 10.20.20.30
<span class="hl">84 bytes from 10.20.20.30 icmp_seq=1 ttl=63 time=2.260 ms</span></pre>
<p>Finally confirm the redundancy: <code>vswitch show</code> now lists <code>vmnic0, vmnic1</code> and both trunks carry 10 and 20. Test it by shutting Gi0/1 briefly in a maintenance window if the change process allows.</p>

<div class="eg"><p><b>Worked example: why "fix one, test, keep going" matters.</b> Had vmnic1 been restored first, APP might have started working <i>sometimes</i>: the host could pin APP to vmnic1 (Gi0/2 allows VLAN 20) and it would work, then a reboot or failover would pin it to vmnic0 and it would fail again. Intermittent faults on hosts are very often "one team member differs from the other".</p></div>

<h3>Quick symptom map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>All VMs on a host down, host uplink "Up"</td><td>switch port access / dynamic, not trunk</td><td><code>show interfaces trunk</code>, <code>vswitch show</code> tagging column</td></tr>
<tr><td>One VLAN fails, others work</td><td>port-group VLAN wrong, or VLAN missing from allowed list</td><td><code>vm list</code>, allowed VLANs</td></tr>
<tr><td>Works on some hosts only, or after vMotion fails</td><td>port group or trunk differs between hosts</td><td>compare hosts and their switch ports</td></tr>
<tr><td>Intermittent, MAC flapping logs</td><td>port-channel vs teaming mismatch, or duplicate MAC</td><td>teaming policy, <code>show mac address-table</code></td></tr>
<tr><td>Gateway reachable, "no route" on router</td><td>interface in a VRF, tested in global table</td><td><code>show ip route vrf NAME</code></td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Using <code>switchport trunk allowed vlan 20</code> instead of <code>... add 20</code>. That replaces the list and instantly breaks every VM in VLAN 10. On a live server trunk, always use <code>add</code> or <code>remove</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> A VM's frames are untagged at the vNIC; if a question shows the VM "sending VLAN 21", the tag came from the port group. Also: a hypervisor uplink that is up at Layer 1 does not prove the VLAN is carried; always check the trunk's allowed list.</p></div>

<div class="scn"><h4>The Friday-night template</h4><p>A new host was added to a cluster on Friday. On Monday, three VMs that DRS had moved onto it overnight were unreachable. <code>vm list</code> style checks showed correct port groups, but the new host's switch ports had been built from an access-port template. Comparing <code>show running-config interface</code> of an old host's port with the new one made the difference obvious in seconds.</p><p><b>Lesson:</b> when "some VMs fail", compare a working path with a failing path, side by side, layer by layer.</p></div>

<div class="iv"><p class="q">"A VM has no network connectivity. How do you troubleshoot it?"</p><p>Walk outward: VM power, IP, mask and gateway; vNIC connected and in the right port group; port-group VLAN ID matching the gateway VLAN; vSwitch uplinks bound and up, teaming matching the switch; physical port a static trunk with the VLAN allowed on every team member; gateway SVI or subinterface up, correct VLAN, and VRF-aware testing. Mention comparing with a working VM on the same host, and using <code>allowed vlan add</code> to avoid collateral damage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot from the VM outward: VM, vNIC, port-group VLAN, uplinks, physical trunk, gateway / VRF.</li>
<li>A working VM on the same host narrows the fault to what differs: usually the VLAN.</li>
<li>Lab faults: PG-App tagged 21 instead of 20; Gi0/1 allowed only VLAN 10; vmnic1 unbound and Gi0/2 shut down.</li>
<li>Every team member's switch port must be an identical trunk; differences cause intermittent failures.</li>
<li>Change live trunks with <code>switchport trunk allowed vlan add</code>, never a bare list.</li>
</ul></div>
`,hi:`
<p>Jab flat ka nal sookh jaata hai, achha plumber sadak khodne se shuru nahi karta. Woh nal check karta hai, phir sink ke neeche ka valve, phir flat ka main valve, phir corridor ka pipe, aur uske baad hi street ka main. Har check ek minute leta hai aur problem ko aadha kar deta hai. Bina network wali VM ko bhi yahi dheeraj wala, layer by layer walk chahiye, <b>host ke andar se</b> shuru karke.</p>

<h3>Chhe-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="VM network troubleshooting path">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 VM: power, IP, gateway</text>
<rect x="20" y="80" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">2 vNIC aur port group</text>
<rect x="20" y="140" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="12">3 port group VLAN ID</text>
<rect x="20" y="200" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="225" text-anchor="middle" class="svg-ink" font-size="12">4 uplinks aur team</text>
<rect x="240" y="200" width="180" height="40" rx="8" fill="#bae6fd"/><text x="330" y="225" text-anchor="middle" class="svg-ink" font-size="12">5 switch port: trunk, VLANs</text>
<rect x="460" y="200" width="160" height="40" rx="8" fill="#fed7aa"/><text x="540" y="225" text-anchor="middle" class="svg-ink" font-size="12">6 gateway / VRF</text>
<line x1="110" y1="60" x2="110" y2="80" stroke="#64748b" stroke-width="2"/><line x1="110" y1="120" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><line x1="110" y1="180" x2="110" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="220" x2="240" y2="220" stroke="#64748b" stroke-width="2"/><line x1="420" y1="220" x2="460" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">steps 1-4: hypervisor (vm list, vswitch show, nic list)</text>
<text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="12">step 5: show interfaces trunk, show vlan brief</text>
<text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">step 6: show ip interface brief, ping vrf</text>
<text x="320" y="280" text-anchor="middle" class="svg-accent" font-size="13">host mein shuru karo, bahar ki taraf chalo</text>
</svg><p class="cap">VM se bahar ki taraf kaam karo; har step mein ek ya do commands hain.</p></div>
<ol>
<li><b>VM khud.</b> Kya woh powered on hai? IP, mask aur default gateway sahi hain? Powered off VM apna vNIC down dikhati hai.</li>
<li><b>vNIC connection.</b> Kya vNIC attached hai, aur kis port group se? (vSphere mein: "Connected" checkbox.)</li>
<li><b>Port group VLAN.</b> Kya port group ka VLAN ID gateway ke VLAN se match karta hai? Yahi sabse common fault hai.</li>
<li><b>Uplinks aur teaming.</b> Kya saare expected physical NICs vSwitch se bound aur up hain? Kya teaming policy switch se match karti hai (port-ID pinning ke liye port-channel nahi)?</li>
<li><b>Physical switch port.</b> Static trunk? VLAN <b>har</b> team member ki allowed list mein? VLAN switch par bana hua? Native VLAN consistent?</li>
<li><b>Gateway.</b> Kya sahi VLAN aur IP ke saath subinterface ya SVI exist karta hai? Kya woh kisi VRF mein hai (tab <code>ping vrf</code> se test karo)?</li>
</ol>

<h3>Worked lab: "Jis VM ka network gayab ho gaya"</h3>
<p>Ticket: maintenance window ke baad HV2 par APP (10.20.20.30, VLAN 20) apne gateway 10.20.20.1 tak nahi pahunch pa rahi, jabki same host par WEB (VLAN 10) chal rahi hai. WEB ka chalna hi bata deta hai ki host, uplink vmnic0 aur SW1 Gi0/1 <b>kuch</b> traffic pass karte hain; kisi VLAN-20-specific cheez par shak karo.</p>
<pre class="out">APP&gt; ping 10.20.20.1
host (10.20.20.1) not reachable

HV2:~# vm list
Name        State        vNIC     Port group        VLAN  MAC address        IPv4 address
<span class="hl">APP         Powered on   vport2   PG-App            21    52:54:00:4e:a1:02  10.20.20.30/24</span>
WEB         Powered on   vport1   PG-Web            10    52:54:00:4e:a1:01  10.10.10.11/24</pre>
<p><b>Fault 1 (step 3):</b> APP powered on hai aur sahi addressed hai, par PG-App VLAN <b>21</b> tag karta hai, jabki R1 ka subinterface <code>dot1Q 20</code> hai. VM nahi, port group theek karo:</p>
<pre class="code">HV2:~# vswitch portgroup set PG-App vlan 20
Port group PG-App now tags VLAN 20</pre>
<p>Ping abhi bhi fail. Aage chalte raho.</p>
<pre class="out">HV2:~# vswitch show
Switch Name      Num Ports   Used Ports  MTU     Uplinks
vSwitch0         6           3           1500    <span class="hl">vmnic0</span>
   ...
   Uplink   Link   Physical switch port        Tagging
   vmnic0   Up     SW1 Gi0/1                   802.1Q trunk
<span class="hl">   vmnic1   Unused SW1 Gi0/2                   peer port is down (tagged VLANs will be lost)</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       10,20
<span class="hl">Gi0/1       10</span></pre>
<p><b>Fault 2 (step 5):</b> ekmatra active uplink Gi0/1 par land karta hai, jo sirf VLAN 10 allow karta hai; VLAN 20 ke frames SW1 par drop hote hain. <code>add</code> use karo, taaki VLAN 10 na hate aur WEB na toote:</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# switchport trunk allowed vlan add 20</pre>
<p><b>Fault 3 (step 4):</b> vmnic1 "Unused" hai (vSwitch se unbound) aur uska switch port Gi0/2 administratively down hai, isliye HV2 ke paas redundancy nahi hai. Yeh bhi dekho ki Gi0/2 <code>show interfaces trunk</code> mein missing hai: sirf up trunks list hote hain.</p>
<pre class="code">HV2:~# vswitch uplink add vmnic1
SW1(config)# interface g0/2
SW1(config-if)# no shutdown</pre>
<pre class="out">APP&gt; ping 10.20.20.1
<span class="hl">84 bytes from 10.20.20.1 icmp_seq=1 ttl=255 time=1.402 ms</span>
WEB&gt; ping 10.20.20.30
<span class="hl">84 bytes from 10.20.20.30 icmp_seq=1 ttl=63 time=2.260 ms</span></pre>
<p>Aakhir mein redundancy confirm karo: <code>vswitch show</code> ab <code>vmnic0, vmnic1</code> list karta hai aur dono trunks 10 aur 20 carry karte hain. Agar change process allow kare to maintenance window mein Gi0/1 ko thodi der shut karke test karo.</p>

<div class="eg"><p><b>Worked example: "ek theek karo, test karo, aage badho" kyun zaroori hai.</b> Agar vmnic1 pehle restore hota, to APP shayad <i>kabhi kabhi</i> chalne lagti: host APP ko vmnic1 par pin kar sakta tha (Gi0/2 VLAN 20 allow karta hai) aur woh chalti, phir reboot ya failover use vmnic0 par pin karta aur woh phir fail hoti. Hosts par intermittent faults bahut baar "ek team member doosre se alag hai" hote hain.</p></div>

<h3>Quick symptom map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th></tr>
<tr><td>Host ki saari VMs down, host uplink "Up"</td><td>switch port access / dynamic, trunk nahi</td><td><code>show interfaces trunk</code>, <code>vswitch show</code> tagging column</td></tr>
<tr><td>Ek VLAN fail, baaki chal rahe</td><td>port-group VLAN galat, ya allowed list se VLAN missing</td><td><code>vm list</code>, allowed VLANs</td></tr>
<tr><td>Sirf kuch hosts par chalta hai, ya vMotion ke baad fail</td><td>hosts ke beech port group ya trunk alag</td><td>hosts aur unke switch ports compare karo</td></tr>
<tr><td>Intermittent, MAC flapping logs</td><td>port-channel vs teaming mismatch, ya duplicate MAC</td><td>teaming policy, <code>show mac address-table</code></td></tr>
<tr><td>Gateway reachable, router par "no route"</td><td>interface VRF mein, global table mein test kiya</td><td><code>show ip route vrf NAME</code></td></tr></table>

<div class="warn"><p><b>Common galti.</b> <code>... add 20</code> ki jagah <code>switchport trunk allowed vlan 20</code> use karna. Yeh list ko replace kar deta hai aur VLAN 10 ki har VM ko turant tod deta hai. Live server trunk par hamesha <code>add</code> ya <code>remove</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> VM ke frames vNIC par untagged hote hain; agar question VM ko "VLAN 21 bhejte" dikhaye, to tag port group se aaya. Aur: Layer 1 par up hypervisor uplink yeh saabit nahi karta ki VLAN carry ho raha hai; hamesha trunk ki allowed list check karo.</p></div>

<div class="scn"><h4>Friday raat ka template</h4><p>Friday ko cluster mein naya host joda gaya. Monday ko teen VMs jinhe DRS ne raat mein us par move kiya tha, unreachable thi. <code>vm list</code> jaise checks ne sahi port groups dikhaye, par naye host ke switch ports access-port template se bane the. Purane host ke port aur naye ke <code>show running-config interface</code> ko compare karne se fark seconds mein saaf ho gaya.</p><p><b>Seekh:</b> jab "kuch VMs fail" hon, to chalte hue path aur fail hote path ko side by side, layer by layer compare karo.</p></div>

<div class="iv"><p class="q">"Ek VM ki network connectivity nahi hai. Aap kaise troubleshoot karoge?"</p><p>Bahar ki taraf chalo: VM power, IP, mask aur gateway; vNIC connected aur sahi port group mein; port-group VLAN ID gateway VLAN se match; vSwitch uplinks bound aur up, teaming switch se match; physical port static trunk jismein har team member par VLAN allowed ho; gateway SVI ya subinterface up, sahi VLAN, aur VRF-aware testing. Same host ki chalti VM se compare karna, aur collateral damage se bachne ke liye <code>allowed vlan add</code> use karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VM se bahar ki taraf troubleshoot karo: VM, vNIC, port-group VLAN, uplinks, physical trunk, gateway / VRF.</li>
<li>Same host par chalti VM fault ko us cheez tak narrow kar deti hai jo alag hai: aam taur par VLAN.</li>
<li>Lab faults: PG-App ne 20 ki jagah 21 tag kiya; Gi0/1 ne sirf VLAN 10 allow kiya; vmnic1 unbound aur Gi0/2 shut down.</li>
<li>Har team member ka switch port identical trunk hona chahiye; fark intermittent failures laata hai.</li>
<li>Live trunks ko <code>switchport trunk allowed vlan add</code> se badlo, kabhi bare list se nahi.</li>
</ul></div>
`}};export{e as default};