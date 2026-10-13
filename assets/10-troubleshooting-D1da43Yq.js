var e={id:`troubleshoot`,h:{en:`Verification and troubleshooting workflow`,hi:`Verification aur troubleshooting workflow`},body:{en:`
<p>A good doctor does not order every test at once. She asks where it hurts, checks the obvious things first, and each answer tells her which test comes next. Inter-VLAN faults yield to the same discipline. One question splits almost every ticket in half: <b>can the host ping its own default gateway?</b></p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Inter-VLAN troubleshooting flow">
<rect x="200" y="8" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Host: IP, mask, gateway correct?</text>
<line x1="320" y1="48" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="70" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. Ping own gateway</text>
<line x1="260" y1="110" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="190" y="132" text-anchor="end" class="svg-muted" font-size="12">fails</text><text x="450" y="132" class="svg-muted" font-size="12">works</text>
<rect x="20" y="140" width="270" height="120" rx="8" fill="#fed7aa"/>
<text x="155" y="162" text-anchor="middle" class="svg-ink" font-size="13">Layer 2 side of the gateway</text>
<text x="155" y="184" text-anchor="middle" class="svg-muted" font-size="12">access port in the right VLAN?</text>
<text x="155" y="204" text-anchor="middle" class="svg-muted" font-size="12">trunk up, VLAN allowed, forwarding?</text>
<text x="155" y="224" text-anchor="middle" class="svg-muted" font-size="12">subinterface VLAN ID correct?</text>
<text x="155" y="244" text-anchor="middle" class="svg-muted" font-size="12">SVI up/up?</text>
<rect x="350" y="140" width="270" height="120" rx="8" fill="#bbf7d0"/>
<text x="485" y="162" text-anchor="middle" class="svg-ink" font-size="13">Layer 3 between VLANs</text>
<text x="485" y="184" text-anchor="middle" class="svg-muted" font-size="12">ip routing enabled?</text>
<text x="485" y="204" text-anchor="middle" class="svg-muted" font-size="12">far VLAN gateway up/up?</text>
<text x="485" y="224" text-anchor="middle" class="svg-muted" font-size="12">far host gateway and mask?</text>
<text x="485" y="244" text-anchor="middle" class="svg-muted" font-size="12">return route, ACL, host firewall?</text>
</svg><p class="cap">The gateway ping splits the problem: fail means Layer 2 up to the gateway, success means routing or the far side.</p></div>

<ol>
<li><b>Check the host.</b> <code>ipconfig</code> (Windows) or <code>show ip</code> (lab PC): is the IP in the VLAN's subnet, is the mask right, is the gateway the address in <b>its own</b> VLAN?</li>
<li><b>Ping the gateway.</b> If it fails, the fault is between the host and its gateway: access port VLAN, trunk, router subinterface binding or SVI state.</li>
<li><b>If the gateway answers, ping the other VLAN's gateway</b> (for example 192.168.20.1 from PC1). Success proves routing on the gateway device works, so look at the far host.</li>
<li><b>Check the far side:</b> is the destination host in the right VLAN with the right gateway and mask? Does a return route exist for traffic from outside? Is a host firewall dropping ICMP?</li>
<li><b>Trace</b> to see where the path stops.</li>
</ol>

<h3>The most common faults and how they look</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Command that proves it</th><th>Fix</th></tr>
<tr><td>Wrong VLAN on subinterface</td><td>One VLAN cannot reach its gateway; subinterface is up/up</td><td><code>show vlans</code> or <code>show interfaces Gi0/0.20</code> on R1</td><td>Correct <code>encapsulation dot1Q</code></td></tr>
<tr><td>Trunk does not allow the VLAN</td><td>One VLAN fails through ROAS or an SVI is up/down</td><td><code>show interfaces trunk</code></td><td><code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>Switch port not trunking</td><td>No VLAN reaches the router</td><td><code>show interfaces Gi0/0 switchport</code></td><td><code>switchport mode trunk</code></td></tr>
<tr><td>SVI down, no active port</td><td>SVI up/down</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code></td><td>Create VLAN, connect port, allow on trunk</td></tr>
<tr><td>Missing <code>ip routing</code></td><td>Own gateway pings, other VLANs do not</td><td><code>show ip route</code> prints "Default gateway is not set"</td><td><code>ip routing</code></td></tr>
<tr><td>Wrong gateway on host</td><td>One host fails, neighbours work</td><td><code>ipconfig</code></td><td>Fix gateway or DHCP pool</td></tr>
<tr><td>Parent interface shut</td><td>All subinterfaces down</td><td><code>show ip interface brief</code></td><td><code>no shutdown</code> on parent</td></tr>
<tr><td>No return route</td><td>Inter-VLAN works, internet does not</td><td><code>show ip route</code> on the edge router</td><td>Route back to the campus subnets</td></tr>
</table>

<h3>Walkthrough: the wrong encapsulation VLAN ticket</h3>
<p>Ticket: "After a change on R1, engineering (VLAN 20) cannot reach anything. HR (VLAN 10) is fine." This is the classic troubleshooting lab for this module.</p>
<pre class="out">PC2&gt; ping 192.168.20.1
<span class="hl">host (192.168.20.1) not reachable</span>

R1# show ip interface brief | include 0/0
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
<span class="hl">GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</span></pre>
<p>PC2 cannot reach its own gateway, so this is on the Layer 2 side. Yet Gi0/0.20 is up/up with the right IP, which tempts beginners to blame the PC. Check the VLAN binding:</p>
<pre class="out">R1# show interfaces GigabitEthernet0/0.20 | include line protocol|Vlan ID
GigabitEthernet0/0.20 is up, line protocol is up
<span class="hl">  Encapsulation 802.1Q Virtual LAN, Vlan ID  21.</span></pre>
<p>The subinterface listens for tag 21. SW1 sends VLAN 20 frames with tag 20, which match no subinterface and are dropped. Nothing is "down", so no alarm fires.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# end
R1# show vlans | include ID|Interface</pre>
<p>Re-test the gateway ping, then the inter-VLAN ping and trace from PC1 to PC2. Note that on some IOS versions changing the encapsulation removes the IP address from the subinterface; always re-check <code>show ip interface brief</code> after the change.</p>

<h3>The same method on a Layer 3 switch</h3>
<pre class="out">DSW1# show ip interface brief | include Vlan
Vlan10                 10.1.10.1       YES manual up                    up
<span class="hl">Vlan20                 10.1.20.1       YES manual up                    down</span>

DSW1# show interfaces trunk | begin forwarding
Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/1       1,10</span></pre>
<p>Vlan20 is up/down and VLAN 20 is missing from the forwarding list on the only trunk, so no port in VLAN 20 is active and autostate holds the SVI down. Either VLAN 20 is not allowed on the trunk, or it does not exist on ASW1. Fix whichever <code>show vlan brief</code> and <code>show interfaces trunk</code> on ASW1 reveal.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.1.10.50) pings 10.1.10.1: success. Pings 10.1.20.1: success. Pings PRN1 10.1.20.50: fails. Routing is proven (the far SVI answered), so the problem is PRN1 itself: its <code>show ip</code> reveals gateway 10.1.10.1, an address outside its subnet. Setting 10.1.20.1 fixes it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting with the router configuration before testing the host; trusting up/up as proof that a subinterface is correct; changing several things at once so you never learn which one fixed it; and forgetting to test in both directions.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibits hide the fault in a single number: a <code>Vlan ID</code> that does not match, a VLAN missing from "allowed" or "forwarding", or a host gateway in the wrong subnet. Read every line of the output, not just the status column.</p></div>

<div class="scn"><h4>The accounts VLAN after a router swap</h4><p>A builder's branch replaced its router using a hand-edited configuration. Sales (10) and Design (20) worked; Accounts (30) could reach nothing. All subinterfaces were up/up. <code>show vlans</code> revealed "Virtual LAN ID: 3" on Gi0/0.30: a typo that dropped the zero. The engineer corrected the encapsulation to 30, re-checked the IP, and Accounts came back. He then added <code>show vlans</code> to the post-change checklist.</p><p><b>Lesson:</b> the subinterface's status never tells you whether its VLAN ID is right; only <code>show vlans</code> or <code>show interfaces</code> does.</p></div>

<div class="iv"><p class="q">"Users in one VLAN cannot reach other VLANs. How do you troubleshoot?"</p><p>Strong answer: start at the host (IP, mask, gateway), then ping the gateway. If that fails, stay at Layer 2: access port VLAN, trunk allowed and forwarding lists, subinterface VLAN ID with <code>show vlans</code>, or SVI state. If the gateway answers, test the other VLAN's gateway, then the far host's settings, <code>ip routing</code>, return routes and firewalls. Use trace to localise, change one thing at a time and re-test both directions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First question: can the host ping its own gateway? It splits Layer 2 faults from Layer 3 faults.</li>
<li>A subinterface with the wrong VLAN ID stays up/up; check <code>show vlans</code> or the Vlan ID line.</li>
<li>An SVI at up/down points to the VLAN or the trunk's allowed and forwarding lists.</li>
<li>"Default gateway is not set" in <code>show ip route</code> means <code>ip routing</code> is missing.</li>
<li>One host failing among working neighbours points to that host's gateway or mask.</li>
</ul></div>
`,hi:`
<p>Achhi doctor ek saath saare tests nahi likhti. Woh poochti hai ki dard kahan hai, pehle obvious cheezein check karti hai, aur har jawab batata hai ki agla test kaunsa hoga. Inter-VLAN faults bhi isi discipline se sulajhte hain. Ek sawaal lagbhag har ticket ko aadha kar deta hai: <b>kya host apne default gateway ko ping kar sakta hai?</b></p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Inter-VLAN troubleshooting flow">
<rect x="200" y="8" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Host: IP, mask, gateway sahi?</text>
<line x1="320" y1="48" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="70" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. Apna gateway ping karo</text>
<line x1="260" y1="110" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="190" y="132" text-anchor="end" class="svg-muted" font-size="12">fail</text><text x="450" y="132" class="svg-muted" font-size="12">chalta hai</text>
<rect x="20" y="140" width="270" height="120" rx="8" fill="#fed7aa"/>
<text x="155" y="162" text-anchor="middle" class="svg-ink" font-size="13">Gateway ki Layer 2 side</text>
<text x="155" y="184" text-anchor="middle" class="svg-muted" font-size="12">access port sahi VLAN mein?</text>
<text x="155" y="204" text-anchor="middle" class="svg-muted" font-size="12">trunk up, VLAN allowed, forwarding?</text>
<text x="155" y="224" text-anchor="middle" class="svg-muted" font-size="12">subinterface VLAN ID sahi?</text>
<text x="155" y="244" text-anchor="middle" class="svg-muted" font-size="12">SVI up/up?</text>
<rect x="350" y="140" width="270" height="120" rx="8" fill="#bbf7d0"/>
<text x="485" y="162" text-anchor="middle" class="svg-ink" font-size="13">VLANs ke beech Layer 3</text>
<text x="485" y="184" text-anchor="middle" class="svg-muted" font-size="12">ip routing enabled?</text>
<text x="485" y="204" text-anchor="middle" class="svg-muted" font-size="12">dur wale VLAN ka gateway up/up?</text>
<text x="485" y="224" text-anchor="middle" class="svg-muted" font-size="12">dur wale host ka gateway aur mask?</text>
<text x="485" y="244" text-anchor="middle" class="svg-muted" font-size="12">return route, ACL, host firewall?</text>
</svg><p class="cap">Gateway ping problem ko baant deta hai: fail ka matlab gateway tak Layer 2, success ka matlab routing ya dur wali side.</p></div>

<ol>
<li><b>Host check karo.</b> <code>ipconfig</code> (Windows) ya <code>show ip</code> (lab PC): kya IP VLAN ke subnet mein hai, mask sahi hai, gateway <b>uske apne</b> VLAN ka address hai?</li>
<li><b>Gateway ping karo.</b> Fail ho to fault host aur uske gateway ke beech hai: access port VLAN, trunk, router subinterface binding ya SVI state.</li>
<li><b>Gateway jawab de to dusre VLAN ka gateway ping karo</b> (jaise PC1 se 192.168.20.1). Success saabit karta hai ki gateway device par routing chal rahi hai, isliye dur wale host ko dekho.</li>
<li><b>Dur wali side check karo:</b> kya destination host sahi VLAN mein sahi gateway aur mask ke saath hai? Bahar ke traffic ke liye return route hai? Kya host firewall ICMP drop kar raha hai?</li>
<li><b>Trace</b> karo aur dekho path kahan rukta hai.</li>
</ol>

<h3>Sabse common faults aur woh kaise dikhte hain</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Saabit karne wali command</th><th>Fix</th></tr>
<tr><td>Subinterface par galat VLAN</td><td>Ek VLAN apne gateway tak nahi pahunchta; subinterface up/up hai</td><td>R1 par <code>show vlans</code> ya <code>show interfaces Gi0/0.20</code></td><td><code>encapsulation dot1Q</code> theek karo</td></tr>
<tr><td>Trunk VLAN allow nahi karta</td><td>ROAS se ek VLAN fail ya SVI up/down</td><td><code>show interfaces trunk</code></td><td><code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>Switch port trunking nahi kar raha</td><td>Koi VLAN router tak nahi pahunchta</td><td><code>show interfaces Gi0/0 switchport</code></td><td><code>switchport mode trunk</code></td></tr>
<tr><td>SVI down, koi active port nahi</td><td>SVI up/down</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code></td><td>VLAN banao, port connect karo, trunk par allow karo</td></tr>
<tr><td><code>ip routing</code> missing</td><td>Apna gateway ping hota hai, dusre VLANs nahi</td><td><code>show ip route</code> "Default gateway is not set" print karta hai</td><td><code>ip routing</code></td></tr>
<tr><td>Host par galat gateway</td><td>Ek host fail, padosi chal rahe</td><td><code>ipconfig</code></td><td>Gateway ya DHCP pool theek karo</td></tr>
<tr><td>Parent interface shut</td><td>Saare subinterfaces down</td><td><code>show ip interface brief</code></td><td>Parent par <code>no shutdown</code></td></tr>
<tr><td>Return route nahi</td><td>Inter-VLAN chalta hai, internet nahi</td><td>Edge router par <code>show ip route</code></td><td>Campus subnets ka wapsi route</td></tr>
</table>

<h3>Walkthrough: wrong encapsulation VLAN ticket</h3>
<p>Ticket: "R1 par change ke baad engineering (VLAN 20) kuch bhi reach nahi kar pa raha. HR (VLAN 10) theek hai." Yeh is module ki classic troubleshooting lab hai.</p>
<pre class="out">PC2&gt; ping 192.168.20.1
<span class="hl">host (192.168.20.1) not reachable</span>

R1# show ip interface brief | include 0/0
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
<span class="hl">GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</span></pre>
<p>PC2 apne hi gateway tak nahi pahunch pata, isliye yeh Layer 2 side par hai. Phir bhi Gi0/0.20 sahi IP ke saath up/up hai, jisse beginners PC ko doshi thehrane lagte hain. VLAN binding check karo:</p>
<pre class="out">R1# show interfaces GigabitEthernet0/0.20 | include line protocol|Vlan ID
GigabitEthernet0/0.20 is up, line protocol is up
<span class="hl">  Encapsulation 802.1Q Virtual LAN, Vlan ID  21.</span></pre>
<p>Subinterface tag 21 sun raha hai. SW1 VLAN 20 ke frames tag 20 ke saath bhejta hai, jo kisi subinterface se match nahi karte aur drop ho jaate hain. Kuch bhi "down" nahi hai, isliye koi alarm nahi bajta.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# end
R1# show vlans | include ID|Interface</pre>
<p>Gateway ping dobara test karo, phir PC1 se PC2 tak inter-VLAN ping aur trace. Dhyan do ki kuch IOS versions par encapsulation badalne se subinterface ka IP address hat jaata hai; change ke baad hamesha <code>show ip interface brief</code> dobara check karo.</p>

<h3>Layer 3 switch par wahi method</h3>
<pre class="out">DSW1# show ip interface brief | include Vlan
Vlan10                 10.1.10.1       YES manual up                    up
<span class="hl">Vlan20                 10.1.20.1       YES manual up                    down</span>

DSW1# show interfaces trunk | begin forwarding
Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/1       1,10</span></pre>
<p>Vlan20 up/down hai aur akele trunk ki forwarding list mein VLAN 20 missing hai, isliye VLAN 20 ka koi port active nahi aur autostate SVI ko down rakhta hai. Ya to VLAN 20 trunk par allowed nahi, ya ASW1 par exist nahi karta. ASW1 par <code>show vlan brief</code> aur <code>show interfaces trunk</code> jo dikhaye use theek karo.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.1.10.50) 10.1.10.1 ko ping karta hai: success. 10.1.20.1 ko: success. PRN1 10.1.20.50 ko: fail. Routing saabit hai (dur wale SVI ne jawab diya), isliye problem khud PRN1 mein hai: uska <code>show ip</code> gateway 10.1.10.1 dikhata hai, jo uske subnet se bahar ka address hai. 10.1.20.1 set karne se theek ho jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Host test kiye bina router configuration se shuru karna; up/up ko saboot maanna ki subinterface sahi hai; ek saath kai cheezein badalna jisse kabhi pata nahi chalta ki kisne theek kiya; aur dono directions mein test karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibits fault ko ek number mein chhupate hain: match na karta <code>Vlan ID</code>, "allowed" ya "forwarding" se gayab VLAN, ya galat subnet mein host gateway. Output ki har line padho, sirf status column nahi.</p></div>

<div class="scn"><h4>Router swap ke baad accounts VLAN</h4><p>Ek builder ki branch ne hand-edited configuration se apna router replace kiya. Sales (10) aur Design (20) chal rahe the; Accounts (30) kuch reach nahi kar pa raha tha. Saare subinterfaces up/up the. <code>show vlans</code> ne Gi0/0.30 par "Virtual LAN ID: 3" dikhaya: ek typo jismein zero chhoot gaya. Engineer ne encapsulation 30 kiya, IP dobara check kiya, aur Accounts wapas aa gaya. Phir usne post-change checklist mein <code>show vlans</code> jod diya.</p><p><b>Seekh:</b> subinterface ka status kabhi nahi batata ki uska VLAN ID sahi hai; sirf <code>show vlans</code> ya <code>show interfaces</code> batata hai.</p></div>

<div class="iv"><p class="q">"Ek VLAN ke users dusre VLANs tak nahi pahunch paa rahe. Aap kaise troubleshoot karoge?"</p><p>Strong answer: host se shuru karo (IP, mask, gateway), phir gateway ping karo. Fail ho to Layer 2 par raho: access port VLAN, trunk ki allowed aur forwarding lists, <code>show vlans</code> se subinterface VLAN ID, ya SVI state. Gateway jawab de to dusre VLAN ka gateway test karo, phir dur wale host ki settings, <code>ip routing</code>, return routes aur firewalls. Trace se jagah pakdo, ek baar mein ek cheez badlo aur dono directions dobara test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla sawaal: kya host apna gateway ping kar sakta hai? Yeh Layer 2 faults ko Layer 3 faults se alag karta hai.</li>
<li>Galat VLAN ID wala subinterface up/up rehta hai; <code>show vlans</code> ya Vlan ID line check karo.</li>
<li>up/down par SVI VLAN ya trunk ki allowed aur forwarding lists ki taraf ishara karta hai.</li>
<li><code>show ip route</code> mein "Default gateway is not set" ka matlab <code>ip routing</code> missing hai.</li>
<li>Chalte padosiyon ke beech ek host ka fail hona us host ke gateway ya mask ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};