var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: VLAN and zone problems`,hi:`Troubleshooting workflow: VLAN aur zone problems`},body:{en:`
<p>VLAN and zone faults have a small number of causes, and they sit in a predictable order from the wire upward. A good workflow works through that order and stops at the first layer that fails. This chapter walks one ticket, <b>"Intrazone traffic blocked"</b>, and then gives you a table for the other common symptoms. Remember that graded labs for this module are planned and not yet available; the outputs below are real captures from the simulator, and you can reproduce the switch half in ccna-vlans and the firewall half in nse4-setup.</p>
<h3>The ticket</h3>
<p>"After the network team created the LAN zone, Staff (VLAN 10) can browse the internet but cannot reach the application server in VLAN 20. It worked yesterday." Two facts matter: the internet works from VLAN 10, so VLAN 10, its address and its zone policy are fine; and it worked before the zone existed.</p>
<h3>Step 1: reproduce and confirm the VLAN path</h3>
<pre class="out">PC1&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms

PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms

PC1&gt; ping 10.10.20.10
10.10.20.10 icmp_seq=1 timeout
10.10.20.10 icmp_seq=2 timeout</pre>
<p>The gateway answers, the internet answers, only the other VLAN is dead. That already narrows it to <b>inter-VLAN policy</b> (the firewall's decision), since the layers below clearly work for VLAN 10.</p>
<h3>Step 2: confirm VLAN 20 is alive on the firewall</h3>
<p>Check that VLAN 20's interface and connected route exist and that the server's side is attached. If the server could not reach its own gateway the fault would be the switch trunk instead (chapter 3).</p>
<h3>Step 3: ask the firewall which policy applies</h3>
<pre class="code">NK-PUNE-FGT # diagnose sys session list
NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
NK-PUNE-FGT # get system zone</pre>
<pre class="out">total session 0
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; matches policy id: 0
== [ LAN-ZONE ]
name: LAN-ZONE   description:    intrazone: deny</pre>
<p>No session, policy id 0, and the zone is in the default intrazone deny: VLAN10 and VLAN20 are both members of LAN-ZONE, so the traffic is intrazone and deny drops it. This explains why it broke when the zone was created and why the internet policy (zone to port1) was unaffected.</p>
<h3>Step 4: choose the fix by design intent</h3>
<ul>
<li>If Staff and Servers should be freely reachable: <code>set intrazone allow</code>.</li>
<li>If Staff may reach only certain services: take them out of one zone and write a precise policy between them (chapter 7).</li>
</ul>
<p>For this ticket the business wants unrestricted access inside the LAN, so we set allow, then prove the fix:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
NK-PUNE-FGT (LAN-ZONE) # set intrazone allow
NK-PUNE-FGT (LAN-ZONE) # end
PC1> ping 10.10.20.10</pre>
<pre class="out">84 bytes from 10.10.20.10 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.10 icmp_seq=2 ttl=63 time=0.600 ms
84 bytes from 10.10.20.10 icmp_seq=3 ttl=63 time=0.700 ms</pre>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="The zone ticket workflow"><rect x="10" y="10" width="610" height="30" rx="9" fill="#e2e8f0"/><text x="315" y="30" text-anchor="middle" class="svg-ink" font-size="13">1. Reproduce: gateway ok, internet ok, other VLAN dead</text><rect x="10" y="47" width="610" height="30" rx="9" fill="#bae6fd"/><text x="315" y="67" text-anchor="middle" class="svg-ink" font-size="13">2. Check VLAN 20: interface, connected route, ARP</text><rect x="10" y="84" width="610" height="30" rx="9" fill="#fde68a"/><text x="315" y="104" text-anchor="middle" class="svg-ink" font-size="13">3. Ask the firewall: sessions, iprope lookup, get system zone</text><rect x="10" y="121" width="610" height="30" rx="9" fill="#bbf7d0"/><text x="315" y="141" text-anchor="middle" class="svg-ink" font-size="13">4. Fix by design intent: intrazone allow or explicit policy</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">5. Retest, record the decision in the ticket</text></svg><p class="cap">The zone ticket workflow</p></div>
<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where to look</th></tr>
<tr><td>One VLAN has no gateway, others fine</td><td>VLAN missing from the switch trunk, or vlanid mismatch</td><td><code>show interfaces trunk</code>, <code>get system arp</code></td></tr>
<tr><td>Cannot save VLAN interface</td><td>missing parent interface or duplicate VLAN ID</td><td>the error text</td></tr>
<tr><td>Blocked inside a zone</td><td>intrazone deny</td><td><code>get system zone</code>, iprope lookup</td></tr>
<tr><td>Policy refuses an interface name</td><td>interface is a zone member</td><td>use the zone</td></tr>
<tr><td>Users in a zone cannot reach the internet</td><td>no zone policy or no NAT</td><td><code>show firewall policy</code>, session list</td></tr></table>
<p>Two more real error messages from the simulator help recognise cause quickly:</p>
<pre class="out">NK-PUNE-FGT (VLAN10) # set vlanid 20
NK-PUNE-FGT (VLAN10) # end
<span class="hl">VLAN ID 20 is already used by VLAN20 on port2</span>
Command fail. Return code -15

NK-PUNE-FGT (VLAN30) # set vlanid 30
NK-PUNE-FGT (VLAN30) # next
<span class="hl">Attribute 'interface' MUST be set.</span>
Command fail. Return code 1</pre>
<div class="eg"><p><b>Worked example.</b> A colleague tries to create VLAN30 and gets "Attribute 'interface' MUST be set". The cause is not the VLAN ID but the missing parent. Reading the message literally saves ten minutes of guessing.</p></div>
<div class="warn"><p><b>Common mistake.</b> Jumping straight to "allow everything" to clear a ticket. Intrazone allow is a trust decision; make it deliberately and write it in the ticket.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn the evidence patterns: no session plus policy id 0 means nothing permits the flow; a session with a numbered policy_id means a policy permitted it; an empty ARP table on a VLAN interface points to the switch.</p></div>
<div class="scn"><h4>Same symptom, two different causes</h4><p>Two tickets arrived on the same morning: "VLAN 20 cannot reach anything" and "Staff cannot reach VLAN 20". The first was a trunk that had lost VLAN 20 (empty ARP table); the second was an intrazone deny after a zone change (no session, policy id 0). The engineer who read the evidence rather than the title fixed both in fifteen minutes.</p><p><b>Lesson:</b> similar symptoms can have different causes; let the evidence pick the layer.</p></div>
<div class="iv"><p class="q">"Walk me through troubleshooting "Staff cannot reach the Servers VLAN" after a zone was introduced."</p><p>I confirm VLAN 10 is healthy (gateway and internet work), then ask the firewall: no session and an iprope lookup of policy id 0 mean nothing permits the flow, and the zone shows intrazone deny. I choose between intrazone allow and separate interfaces with an explicit policy according to the design intent, apply it, retest and document the decision.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from the wire upward and stop at the first failing layer.</li>
<li>No session plus policy id 0 means no policy permits the flow.</li>
<li>A zone change can break previously working VLAN-to-VLAN traffic.</li>
<li>Fix by design intent and document the trust decision.</li>
</ul></div>
`,hi:`
<p>VLAN aur zone faults ke kuch hi causes hote hain, aur woh wire se upar ki taraf predictable order mein baithe hain. Achha workflow us order se guzarta hai aur pehli failing layer par rukta hai. Yeh chapter ek ticket, <b>"Intrazone traffic blocked"</b>, walk karta hai aur phir baaki aam symptoms ke liye table deta hai. Yaad rakho ki is module ke graded labs planned hain aur abhi available nahi hain; neeche ke outputs simulator se asli captures hain, aur aap switch ka half ccna-vlans mein aur firewall ka half nse4-setup mein reproduce kar sakte ho.</p>
<h3>Ticket</h3>
<p>"Network team ne LAN zone banaya, uske baad Staff (VLAN 10) internet browse kar sakta hai par VLAN 20 ke application server tak nahi pahunch sakta. Kal tak chalta tha." Do facts matter karte hain: VLAN 10 se internet chalta hai, isliye VLAN 10, uska address aur uski zone policy theek hain; aur zone se pehle chalta tha.</p>
<h3>Step 1: reproduce karo aur VLAN path confirm karo</h3>
<pre class="out">PC1&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms

PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms

PC1&gt; ping 10.10.20.10
10.10.20.10 icmp_seq=1 timeout
10.10.20.10 icmp_seq=2 timeout</pre>
<p>Gateway jawab deta hai, internet jawab deta hai, sirf doosra VLAN mara hua hai. Yeh pehle hi <b>inter-VLAN policy</b> (firewall ka faisla) tak narrow kar deta hai, kyunki neeche ki layers VLAN 10 ke liye clearly kaam karti hain.</p>
<h3>Step 2: confirm karo ki VLAN 20 firewall par alive hai</h3>
<p>Check karo ki VLAN 20 ka interface aur connected route exist karte hain aur server ki side attached hai. Server apne hi gateway tak na pahunchta to fault switch trunk hota (chapter 3).</p>
<h3>Step 3: firewall se poochho kaunsi policy lagu hoti hai</h3>
<pre class="code">NK-PUNE-FGT # diagnose sys session list
NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
NK-PUNE-FGT # get system zone</pre>
<pre class="out">total session 0
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; matches policy id: 0
== [ LAN-ZONE ]
name: LAN-ZONE   description:    intrazone: deny</pre>
<p>Session nahi, policy id 0, aur zone default intrazone deny mein hai: VLAN10 aur VLAN20 dono LAN-ZONE ke members hain, isliye traffic intrazone hai aur deny use drop karta hai. Yeh samjhata hai ki zone banate hi kyun toota aur internet policy (zone se port1) par asar kyun nahi pada.</p>
<h3>Step 4: design intent ke hisaab se fix chuno</h3>
<ul>
<li>Staff aur Servers freely reachable hone chahiye to: <code>set intrazone allow</code>.</li>
<li>Staff ko sirf kuch services tak jaana ho to: unhe ek zone se nikaalo aur beech mein precise policy likho (chapter 7).</li>
</ul>
<p>Is ticket mein business LAN ke andar unrestricted access chahta hai, isliye hum allow set karte hain, phir fix saabit karte hain:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
NK-PUNE-FGT (LAN-ZONE) # set intrazone allow
NK-PUNE-FGT (LAN-ZONE) # end
PC1> ping 10.10.20.10</pre>
<pre class="out">84 bytes from 10.10.20.10 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.10 icmp_seq=2 ttl=63 time=0.600 ms
84 bytes from 10.10.20.10 icmp_seq=3 ttl=63 time=0.700 ms</pre>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zone ticket workflow"><rect x="10" y="10" width="610" height="30" rx="9" fill="#e2e8f0"/><text x="315" y="30" text-anchor="middle" class="svg-ink" font-size="13">1. Reproduce: gateway ok, internet ok, doosra VLAN mara</text><rect x="10" y="47" width="610" height="30" rx="9" fill="#bae6fd"/><text x="315" y="67" text-anchor="middle" class="svg-ink" font-size="13">2. VLAN 20 check: interface, connected route, ARP</text><rect x="10" y="84" width="610" height="30" rx="9" fill="#fde68a"/><text x="315" y="104" text-anchor="middle" class="svg-ink" font-size="13">3. Firewall se poochho: sessions, iprope lookup, get system zone</text><rect x="10" y="121" width="610" height="30" rx="9" fill="#bbf7d0"/><text x="315" y="141" text-anchor="middle" class="svg-ink" font-size="13">4. Design intent se fix: intrazone allow ya explicit policy</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">5. Dobara test, decision ticket mein record karo</text></svg><p class="cap">Zone ticket workflow</p></div>
<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Kahan dekhein</th></tr>
<tr><td>Ek VLAN ka gateway nahi, baaki theek</td><td>VLAN switch trunk se missing, ya vlanid mismatch</td><td><code>show interfaces trunk</code>, <code>get system arp</code></td></tr>
<tr><td>VLAN interface save nahi hota</td><td>parent interface missing ya duplicate VLAN ID</td><td>error text</td></tr>
<tr><td>Zone ke andar block</td><td>intrazone deny</td><td><code>get system zone</code>, iprope lookup</td></tr>
<tr><td>Policy interface name refuse karti hai</td><td>interface zone member hai</td><td>zone use karo</td></tr>
<tr><td>Zone ke users internet tak nahi pahunchte</td><td>zone policy ya NAT nahi</td><td><code>show firewall policy</code>, session list</td></tr></table>
<p>Simulator ke do aur asli error messages cause jaldi pehchanne mein madad karte hain:</p>
<pre class="out">NK-PUNE-FGT (VLAN10) # set vlanid 20
NK-PUNE-FGT (VLAN10) # end
<span class="hl">VLAN ID 20 is already used by VLAN20 on port2</span>
Command fail. Return code -15

NK-PUNE-FGT (VLAN30) # set vlanid 30
NK-PUNE-FGT (VLAN30) # next
<span class="hl">Attribute 'interface' MUST be set.</span>
Command fail. Return code 1</pre>
<div class="eg"><p><b>Worked example.</b> Ek colleague VLAN30 banane ki koshish karta hai aur "Attribute 'interface' MUST be set" milta hai. Cause VLAN ID nahi balki missing parent hai. Message ko literally padhne se das minute ki guessing bachti hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Ticket clear karne ke liye seedha "sab allow" par kood jaana. Intrazone allow trust ka faisla hai; soch-samajhkar lo aur ticket mein likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Evidence patterns seekho: koi session nahi aur policy id 0 matlab koi cheez flow ko permit nahi karti; numbered policy_id wala session matlab policy ne permit kiya; VLAN interface par khali ARP table switch ki taraf ishara karta hai.</p></div>
<div class="scn"><h4>Same symptom, do alag causes</h4><p>Ek hi subah do tickets aaye: "VLAN 20 kuch reach nahi kar sakta" aur "Staff VLAN 20 tak nahi pahunch sakta". Pehla trunk tha jisne VLAN 20 kho diya tha (khali ARP table); doosra zone change ke baad intrazone deny tha (session nahi, policy id 0). Engineer ne title ki jagah evidence padha aur dono pandrah minute mein theek kiye.</p><p><b>Lesson:</b> milte-julte symptoms ke alag causes ho sakte hain; evidence ko layer chunne do.</p></div>
<div class="iv"><p class="q">"Zone introduce hone ke baad "Staff Servers VLAN tak nahi pahunchta" troubleshoot karna samjhao."</p><p>Main confirm karta hoon ki VLAN 10 healthy hai (gateway aur internet chalte hain), phir firewall se poochta hoon: session nahi aur iprope lookup ka policy id 0 matlab koi cheez flow ko permit nahi karti, aur zone intrazone deny dikhata hai. Design intent ke hisaab se intrazone allow aur alag interfaces ke saath explicit policy mein se chunta hoon, lagu karta hoon, retest karta hoon aur decision document karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wire se upar ki taraf kaam karo aur pehli failing layer par ruko.</li>
<li>Session nahi aur policy id 0 matlab koi policy flow ko permit nahi karti.</li>
<li>Zone change pehle chalne wale VLAN-to-VLAN traffic ko tod sakta hai.</li>
<li>Design intent se fix karo aur trust decision document karo.</li>
</ul></div>
`}};export{e as default};