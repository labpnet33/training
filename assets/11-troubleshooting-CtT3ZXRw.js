var e={id:`troubleshooting`,h:{en:`Troubleshooting VLANs and trunks: the guest network ticket`,hi:`VLANs aur trunks troubleshoot karna: guest network ticket`},body:{en:`
<h3>The analogy: a courier who cannot deliver</h3>
<p>When a parcel does not arrive, a good courier manager does not guess. They check in order: was it picked up, did it reach the right sorting centre, was it loaded on the right truck, did the truck go to the right city, was the address correct? VLAN faults are found the same way: follow the frame from the host, through its access port and VLAN, across the trunk, to the gateway, and check each stage with one command.</p>

<h3>The method: CompTIA's seven steps</h3>
<p>Network+ expects a structured approach (you will study it fully in the troubleshooting module): (1) identify the problem, (2) establish a theory of probable cause, (3) test the theory, (4) establish a plan of action, (5) implement the solution or escalate, (6) verify full system functionality and add preventive measures, (7) document findings, actions and outcomes. For switching faults, step 1 is the most valuable: find out <b>who</b> is affected. One user points to a port or host; one VLAN points to the VLAN, trunk or gateway for that VLAN; everyone points to the uplink, the router or power.</p>

<h3>The VLAN checklist, host to gateway</h3>
<table class="cmp"><tr><th>Stage</th><th>Command</th><th>What a fault looks like</th></tr>
<tr><td>1. Port up?</td><td><code>show interfaces status</code></td><td>notconnect, err-disabled, inactive, half duplex</td></tr>
<tr><td>2. Right VLAN?</td><td><code>show vlan brief</code>, <code>show interfaces X switchport</code></td><td>Port listed under the wrong VLAN; VLAN missing</td></tr>
<tr><td>3. Trunk carries it?</td><td><code>show interfaces trunk</code></td><td>VLAN absent from allowed / active / forwarding lists; native mismatch</td></tr>
<tr><td>4. Gateway up?</td><td><code>show ip interface brief</code> (router or L3 switch)</td><td>Sub-interface or SVI down; wrong dot1Q number; wrong IP</td></tr>
<tr><td>5. Host settings?</td><td>host <code>ip</code>/<code>ipconfig</code>, ping gateway</td><td>Wrong subnet, mask or default gateway</td></tr>
<tr><td>6. Learned?</td><td><code>show mac address-table</code></td><td>Host MAC missing or in the wrong VLAN</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting path from host to gateway">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="80" text-anchor="middle" class="svg-ink" font-size="13">Host</text>
<rect x="140" y="50" width="110" height="50" rx="8" fill="#bae6fd"/><text x="195" y="72" text-anchor="middle" class="svg-ink" font-size="13">Access port</text><text x="195" y="90" text-anchor="middle" class="svg-muted" font-size="12">status, VLAN</text>
<rect x="280" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="330" y="72" text-anchor="middle" class="svg-ink" font-size="13">VLAN</text><text x="330" y="90" text-anchor="middle" class="svg-muted" font-size="12">exists?</text>
<rect x="410" y="50" width="100" height="50" rx="8" fill="#fde68a"/><text x="460" y="72" text-anchor="middle" class="svg-ink" font-size="13">Trunk</text><text x="460" y="90" text-anchor="middle" class="svg-muted" font-size="12">allowed?</text>
<rect x="540" y="50" width="90" height="50" rx="8" fill="#fed7aa"/><text x="585" y="72" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="585" y="90" text-anchor="middle" class="svg-muted" font-size="12">up, dot1Q</text>
<line x1="110" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="250" y1="75" x2="280" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="410" y2="75" stroke="#64748b" stroke-width="2"/><line x1="510" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-accent" font-size="12">Check each stage in order; stop at the first one that is wrong, fix it, then re-test.</text>
</svg><p class="cap">Follow the frame. Most VLAN tickets end at stage 2 or 3.</p></div>

<h3>Walkthrough: Ticket INC-2107, "the guest network is isolated"</h3>
<p><b>Ticket:</b> "Guest devices get no service at all since yesterday's switch change. Staff are fine." PC2 is the guest test laptop (192.168.20.10, gateway 192.168.20.1) on SW1 Gi0/2. PC1 (staff) is on Gi0/1. R1 has sub-interfaces .10 and .20.</p>
<p><b>Step 1, identify and scope.</b> Only guests fail; staff work through the same trunk and router. So the physical uplink and R1 as a whole are fine. The fault is specific to the guest path: the guest port, VLAN 20, or VLAN 20 on the trunk. "Yesterday's switch change" says to look at SW1 first.</p>
<p><b>Step 2, check the access port VLAN.</b></p>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   STAFF                            active    Gi0/1
20   GUEST                            active    
<span class="hl">30   PRINTERS                         active    Gi0/2</span>
1002 fddi-default                     act/unsup 
...</pre>
<p>VLAN 20 exists but has no ports, and PC2's port Gi0/2 sits in <b>VLAN 30</b> (PRINTERS). That is the answer to the lab's first question: <b>30</b>. The guest laptop has been dropped onto the printer VLAN, where there is no 192.168.20.x gateway. Fix it:</p>
<pre class="code">configure terminal
interface GigabitEthernet0/2
 switchport access vlan 20</pre>
<p><b>Step 3, re-test.</b> PC2 still cannot reach 192.168.20.1:</p>
<pre class="out">PC2&gt; ping 192.168.20.1
<span class="hl">192.168.20.1 icmp_seq=1 timeout
192.168.20.1 icmp_seq=2 timeout</span></pre>
<p>This is normal in real tickets: there can be more than one fault. Continue down the path to the trunk. You are still in configuration mode, so use <code>do</code> to run a show command:</p>
<pre class="out">SW1(config-if)#do show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,30</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,30</pre>
<p>VLAN 20 is not allowed on the trunk to R1, so guest frames never reach R1's Gi0/0.20. Someone probably typed <code>switchport trunk allowed vlan 10,30</code> when adding the printer VLAN. Fix it with <b>add</b>, so VLANs 10 and 30 stay:</p>
<pre class="code">interface GigabitEthernet0/0
 switchport trunk allowed vlan add 20
end</pre>
<p><b>Step 4, verify full functionality.</b></p>
<pre class="out">SW1#show interfaces trunk | include Gi0/0
Gi0/0       on               802.1q         trunking      1
<span class="hl">Gi0/0       10,20,30</span>
Gi0/0       10,20,30
Gi0/0       10,20,30

PC2&gt; ping 192.168.20.1
<span class="hl">84 bytes from 192.168.20.1 icmp_seq=1 ttl=255 time=1.412 ms</span>
PC2&gt; ping 192.168.10.10
84 bytes from 192.168.10.10 icmp_seq=1 ttl=63 time=2.108 ms
PC1&gt; ping 192.168.10.1
84 bytes from 192.168.10.1 icmp_seq=1 ttl=255 time=1.021 ms</pre>
<p>Guests reach their gateway, routing to staff works (TTL 63 = one router), and staff are unaffected. (In a real design, a guest-to-staff ping would then be blocked by an ACL or firewall; that is the security module's job.) <b>Step 5, preventive measures and documentation:</b> record both root causes in the ticket, save the configuration, and propose a change checklist that requires <code>show interfaces trunk</code> before and after any trunk edit and the use of <code>add</code>/<code>remove</code>.</p>

<div class="eg"><p><b>Worked example: reading symptoms.</b> "Staff fine, guests dead" means shared parts work. Candidates: (a) guest port in wrong VLAN, (b) VLAN 20 missing from the database, (c) VLAN 20 not allowed on the trunk, (d) R1's .20 sub-interface wrong or down, (e) guest host misconfigured. The ticket had (a) and (c). Checking (a) to (e) in path order finds both in four commands.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the first fix without re-testing; changing the router when the fault is on the switch; typing <code>allowed vlan 20</code> without <code>add</code> and breaking staff and printers; forgetting that trunk ports never appear in <code>show vlan brief</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> If one VLAN fails and others work over the same trunk, suspect the allowed list or the VLAN itself, not the cable. If a host gets an address from the wrong subnet, suspect its access VLAN. Always "verify full system functionality" after the fix: test the affected users and the ones who were working.</p></div>

<div class="scn"><h4>Two faults, one change window</h4><p>A retail chain pushed a template to 40 store switches to add a printer VLAN. The next morning, guest Wi-Fi was down in every store. The template contained both a wrong access VLAN for the guest AP port and an allowed-list command without <code>add</code>. The NOC fixed one store by hand using the checklist above, confirmed the two root causes, corrected the template and re-pushed it. Every store recovered within the hour.</p><p><b>Lesson:</b> a structured path (port, VLAN, trunk, gateway) finds multiple faults quickly, and the fix belongs in the template, not only on one device.</p></div>

<div class="iv"><p class="q">"A user in one VLAN cannot reach anything, but users in other VLANs on the same switch are fine. How do you troubleshoot?"</p><p>Strong answer: scope first, then follow the path. Check the user's port status and VLAN with <code>show interfaces status</code> and <code>show vlan brief</code>; confirm the VLAN exists; check <code>show interfaces trunk</code> that the VLAN is allowed, active and forwarding; check the gateway sub-interface or SVI is up with the right dot1Q and IP; check host IP and gateway. Fix one thing at a time, re-test, verify everyone, and document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first: one host, one VLAN or everyone points you to different parts of the path.</li>
<li>Follow the frame: port status, access VLAN, VLAN exists, trunk allowed/active/forwarding, gateway, host.</li>
<li>INC-2107 had two faults: Gi0/2 in VLAN 30, and VLAN 20 missing from the trunk's allowed list.</li>
<li>Fix with <code>switchport access vlan 20</code> and <code>switchport trunk allowed vlan add 20</code>.</li>
<li>Re-test after every change, verify all users, document root cause and prevention.</li>
</ul></div>
`,hi:`
<h3>Analogy: courier jo deliver nahi kar pa raha</h3>
<p>Jab parcel nahi pahunchta, achha courier manager guess nahi karta. Woh order mein check karta hai: kya pickup hua, kya sahi sorting centre pahuncha, kya sahi truck par load hua, kya truck sahi shehar gaya, kya address sahi tha? VLAN faults bhi aise hi milte hain: frame ko host se, uske access port aur VLAN se, trunk ke paar, gateway tak follow karo, aur har stage ko ek command se check karo.</p>

<h3>Method: CompTIA ke saat steps</h3>
<p>Network+ ek structured approach expect karta hai (troubleshooting module mein aap ise poora padhoge): (1) problem identify karo, (2) probable cause ki theory banao, (3) theory test karo, (4) plan of action banao, (5) solution implement karo ya escalate karo, (6) full system functionality verify karo aur preventive measures lagao, (7) findings, actions aur outcomes document karo. Switching faults ke liye step 1 sabse keemti hai: pata karo ki <b>kaun</b> affected hai. Ek user port ya host ki taraf ishara karta hai; ek VLAN us VLAN, trunk ya us VLAN ke gateway ki taraf; sab log uplink, router ya power ki taraf.</p>

<h3>VLAN checklist, host se gateway tak</h3>
<table class="cmp"><tr><th>Stage</th><th>Command</th><th>Fault kaisa dikhta hai</th></tr>
<tr><td>1. Port up?</td><td><code>show interfaces status</code></td><td>notconnect, err-disabled, inactive, half duplex</td></tr>
<tr><td>2. Sahi VLAN?</td><td><code>show vlan brief</code>, <code>show interfaces X switchport</code></td><td>Port galat VLAN ke neeche listed; VLAN missing</td></tr>
<tr><td>3. Trunk use le jaata hai?</td><td><code>show interfaces trunk</code></td><td>VLAN allowed / active / forwarding lists se gayab; native mismatch</td></tr>
<tr><td>4. Gateway up?</td><td><code>show ip interface brief</code> (router ya L3 switch)</td><td>Sub-interface ya SVI down; galat dot1Q number; galat IP</td></tr>
<tr><td>5. Host settings?</td><td>host <code>ip</code>/<code>ipconfig</code>, gateway ping</td><td>Galat subnet, mask ya default gateway</td></tr>
<tr><td>6. Learn hua?</td><td><code>show mac address-table</code></td><td>Host MAC missing ya galat VLAN mein</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Host se gateway tak troubleshooting path">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="80" text-anchor="middle" class="svg-ink" font-size="13">Host</text>
<rect x="140" y="50" width="110" height="50" rx="8" fill="#bae6fd"/><text x="195" y="72" text-anchor="middle" class="svg-ink" font-size="13">Access port</text><text x="195" y="90" text-anchor="middle" class="svg-muted" font-size="12">status, VLAN</text>
<rect x="280" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="330" y="72" text-anchor="middle" class="svg-ink" font-size="13">VLAN</text><text x="330" y="90" text-anchor="middle" class="svg-muted" font-size="12">exist karta hai?</text>
<rect x="410" y="50" width="100" height="50" rx="8" fill="#fde68a"/><text x="460" y="72" text-anchor="middle" class="svg-ink" font-size="13">Trunk</text><text x="460" y="90" text-anchor="middle" class="svg-muted" font-size="12">allowed?</text>
<rect x="540" y="50" width="90" height="50" rx="8" fill="#fed7aa"/><text x="585" y="72" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="585" y="90" text-anchor="middle" class="svg-muted" font-size="12">up, dot1Q</text>
<line x1="110" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="250" y1="75" x2="280" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="410" y2="75" stroke="#64748b" stroke-width="2"/><line x1="510" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-accent" font-size="12">Har stage order mein check karo; pehli galat stage par ruko, fix karo, phir re-test karo.</text>
</svg><p class="cap">Frame ko follow karo. Zyada tar VLAN tickets stage 2 ya 3 par khatam hote hain.</p></div>

<h3>Walkthrough: Ticket INC-2107, "guest network alag-thalag hai"</h3>
<p><b>Ticket:</b> "Kal ke switch change ke baad se guest devices ko koi service nahi mil rahi. Staff theek hain." PC2 guest test laptop hai (192.168.20.10, gateway 192.168.20.1) SW1 Gi0/2 par. PC1 (staff) Gi0/1 par hai. R1 par sub-interfaces .10 aur .20 hain.</p>
<p><b>Step 1, identify aur scope.</b> Sirf guests fail ho rahe hain; staff same trunk aur router ke through chal rahe hain. Isliye physical uplink aur poora R1 theek hai. Fault guest path tak specific hai: guest port, VLAN 20, ya trunk par VLAN 20. "Kal ka switch change" kehta hai pehle SW1 dekho.</p>
<p><b>Step 2, access port ka VLAN check karo.</b></p>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   STAFF                            active    Gi0/1
20   GUEST                            active    
<span class="hl">30   PRINTERS                         active    Gi0/2</span>
1002 fddi-default                     act/unsup 
...</pre>
<p>VLAN 20 exist karta hai lekin usmein koi port nahi, aur PC2 ka port Gi0/2 <b>VLAN 30</b> (PRINTERS) mein baitha hai. Lab ke pehle sawaal ka jawab yahi hai: <b>30</b>. Guest laptop printer VLAN mein gira diya gaya hai, jahan koi 192.168.20.x gateway nahi hai. Ise fix karo:</p>
<pre class="code">configure terminal
interface GigabitEthernet0/2
 switchport access vlan 20</pre>
<p><b>Step 3, re-test.</b> PC2 ab bhi 192.168.20.1 tak nahi pahunch pa raha:</p>
<pre class="out">PC2&gt; ping 192.168.20.1
<span class="hl">192.168.20.1 icmp_seq=1 timeout
192.168.20.1 icmp_seq=2 timeout</span></pre>
<p>Real tickets mein yeh normal hai: ek se zyada fault ho sakte hain. Path mein neeche trunk tak chalo. Aap abhi bhi configuration mode mein ho, isliye show command chalane ke liye <code>do</code> use karo:</p>
<pre class="out">SW1(config-if)#do show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,30</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,30</pre>
<p>R1 tak ke trunk par VLAN 20 allowed nahi hai, isliye guest frames kabhi R1 ke Gi0/0.20 tak pahunchte hi nahi. Shayad kisi ne printer VLAN add karte waqt <code>switchport trunk allowed vlan 10,30</code> type kiya. Ise <b>add</b> se fix karo, taaki VLANs 10 aur 30 bane rahein:</p>
<pre class="code">interface GigabitEthernet0/0
 switchport trunk allowed vlan add 20
end</pre>
<p><b>Step 4, full functionality verify karo.</b></p>
<pre class="out">SW1#show interfaces trunk | include Gi0/0
Gi0/0       on               802.1q         trunking      1
<span class="hl">Gi0/0       10,20,30</span>
Gi0/0       10,20,30
Gi0/0       10,20,30

PC2&gt; ping 192.168.20.1
<span class="hl">84 bytes from 192.168.20.1 icmp_seq=1 ttl=255 time=1.412 ms</span>
PC2&gt; ping 192.168.10.10
84 bytes from 192.168.10.10 icmp_seq=1 ttl=63 time=2.108 ms
PC1&gt; ping 192.168.10.1
84 bytes from 192.168.10.1 icmp_seq=1 ttl=255 time=1.021 ms</pre>
<p>Guests apne gateway tak pahunchte hain, staff tak routing chalti hai (TTL 63 = ek router), aur staff par koi asar nahi. (Real design mein guest-to-staff ping ko phir ACL ya firewall block karega; yeh security module ka kaam hai.) <b>Step 5, preventive measures aur documentation:</b> dono root causes ticket mein record karo, configuration save karo, aur ek change checklist propose karo jo kisi bhi trunk edit se pehle aur baad <code>show interfaces trunk</code> aur <code>add</code>/<code>remove</code> ka use zaroori banaye.</p>

<div class="eg"><p><b>Worked example: symptoms padhna.</b> "Staff theek, guests dead" ka matlab shared parts chal rahe hain. Candidates: (a) guest port galat VLAN mein, (b) VLAN 20 database se missing, (c) VLAN 20 trunk par allowed nahi, (d) R1 ka .20 sub-interface galat ya down, (e) guest host misconfigured. Ticket mein (a) aur (c) the. (a) se (e) tak path order mein check karne se chaar commands mein dono mil jaate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Pehle fix ke baad re-test kiye bina ruk jaana; fault switch par ho aur router badalna; <code>add</code> ke bina <code>allowed vlan 20</code> type karke staff aur printers tod dena; bhool jaana ki trunk ports <code>show vlan brief</code> mein kabhi nahi dikhte.</p></div>

<div class="exam"><p><b>Exam traps.</b> Agar same trunk par ek VLAN fail ho aur baaki chalein, to allowed list ya khud VLAN par shak karo, cable par nahi. Agar host ko galat subnet se address mile, to uske access VLAN par shak karo. Fix ke baad hamesha "full system functionality verify" karo: affected users aur jo chal rahe the unhe bhi test karo.</p></div>

<div class="scn"><h4>Do faults, ek change window</h4><p>Ek retail chain ne printer VLAN add karne ke liye 40 store switches par ek template push kiya. Agli subah har store mein guest Wi-Fi down tha. Template mein guest AP port ka galat access VLAN aur <code>add</code> ke bina allowed-list command dono the. NOC ne upar ki checklist use karke ek store haath se fix kiya, dono root causes confirm kiye, template theek kiya aur dobara push kiya. Ghante bhar mein har store recover ho gaya.</p><p><b>Seekh:</b> structured path (port, VLAN, trunk, gateway) kai faults jaldi dhoondh leta hai, aur fix template mein hona chahiye, sirf ek device par nahi.</p></div>

<div class="iv"><p class="q">"Ek VLAN ka user kuch bhi reach nahi kar pa raha, lekin same switch par doosre VLANs ke users theek hain. Aap kaise troubleshoot karoge?"</p><p>Strong answer: pehle scope, phir path follow karo. <code>show interfaces status</code> aur <code>show vlan brief</code> se user ka port status aur VLAN check karo; confirm karo ki VLAN exist karta hai; <code>show interfaces trunk</code> se check karo ki VLAN allowed, active aur forwarding hai; check karo ki gateway sub-interface ya SVI sahi dot1Q aur IP ke saath up hai; host ka IP aur gateway check karo. Ek baar mein ek cheez fix karo, re-test karo, sabko verify karo, aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope: ek host, ek VLAN ya sab log aapko path ke alag hisson ki taraf le jaate hain.</li>
<li>Frame follow karo: port status, access VLAN, VLAN exist karta hai, trunk allowed/active/forwarding, gateway, host.</li>
<li>INC-2107 mein do faults the: Gi0/2 VLAN 30 mein, aur VLAN 20 trunk ki allowed list se missing.</li>
<li><code>switchport access vlan 20</code> aur <code>switchport trunk allowed vlan add 20</code> se fix karo.</li>
<li>Har change ke baad re-test karo, saare users verify karo, root cause aur prevention document karo.</li>
</ul></div>
`}};export{e as default};