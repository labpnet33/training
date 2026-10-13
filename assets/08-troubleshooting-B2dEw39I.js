var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: ticket NK-7713, the GUI will not open`,hi:`Troubleshooting workflow: ticket NK-7713, GUI nahi khulta`},body:{en:`
<p>Good troubleshooting is a routine, not a hunch. For a FortiGate the routine is: <b>define the symptom, split the path, check the layer that the evidence points to, change one thing, retest.</b> This chapter walks the second lab, ticket NK-7713, from first read to closed ticket.</p>
<h3>The ticket</h3>
<p>"Internet works, but we cannot open the firewall GUI at the LAN gateway 10.0.1.1 and even ping to the gateway fails. A finding from last week's audit is attached: the firewall answers HTTPS and SSH from the internet." Two problems in one ticket: management is too closed on the LAN and too open on the WAN.</p>
<h3>Step 1: reproduce and split the path</h3>
<p>From PC1 ping the gateway and then the internet. If traffic to 8.8.8.8 works while the gateway ping fails, the path <i>through</i> the firewall is healthy (interfaces, route, policy, NAT) and the fault is in traffic <i>to</i> the firewall, which means allowaccess.</p>
<pre class="out">PC1&gt; ping 10.0.1.1
10.0.1.1 icmp_seq=1 timeout
10.0.1.1 icmp_seq=2 timeout
10.0.1.1 icmp_seq=3 timeout
10.0.1.1 icmp_seq=4 timeout
10.0.1.1 icmp_seq=5 timeout

PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms</pre>
<h3>Step 2: read the interface evidence</h3>
<pre class="code">NK-PUNE-FGT # show system interface port2</pre>
<pre class="out">config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess <span class="hl">ssh</span>
        set type physical
        set alias "LAN"
        set role lan
        set snmp-index 2
    next
end</pre>
<p>Only <code>ssh</code> is allowed: no <code>ping</code> and no HTTPS admin service. That explains both symptoms. Because the PC's pings to 8.8.8.8 pass through the firewall under policy 1, they are unaffected.</p>
<h3>Step 3: fix the LAN with append, close the WAN with set</h3>
<p>Use <code>append</code> so the working SSH stays; do not replace the list on the LAN. On the WAN, replacing is what you want:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # append allowaccess ping h&#116;tps
NK-PUNE-FGT (port2) # next
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # end</pre>
<h3>Step 4: retest and prove</h3>
<p>Ping the gateway again, and confirm the interface lines. The ticket closes only when both the symptom and the audit finding are verified:</p>
<pre class="out">PC1&gt; ping 10.0.1.1
84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.0.1.1 icmp_seq=2 ttl=64 time=0.600 ms

NK-PUNE-FGT # show system interface port2
        set allowaccess <span class="hl">ssh ping h&#116;tps</span>
NK-PUNE-FGT # show system interface port1
        set allowaccess <span class="hl">ping</span></pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The ticket workflow"><rect x="10" y="15" width="610" height="30" rx="9" fill="#e2e8f0"/><text x="315" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Reproduce: gateway ping fails, internet works</text><rect x="10" y="52" width="610" height="30" rx="9" fill="#bae6fd"/><text x="315" y="72" text-anchor="middle" class="svg-ink" font-size="13">2. Split: through-traffic fine, to-the-box traffic broken</text><rect x="10" y="89" width="610" height="30" rx="9" fill="#fde68a"/><text x="315" y="109" text-anchor="middle" class="svg-ink" font-size="13">3. Evidence: show system interface port2 shows allowaccess ssh only</text><rect x="10" y="126" width="610" height="30" rx="9" fill="#bbf7d0"/><text x="315" y="146" text-anchor="middle" class="svg-ink" font-size="13">4. Fix: append ping h&#116;tps on LAN, set ping on WAN</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">5. Retest and document</text></svg><p class="cap">The ticket workflow</p></div>
<h3>A general decision tree</h3>
<table class="cmp"><tr><th>Symptom</th><th>First suspect</th><th>Command</th></tr>
<tr><td>Cannot ping or open GUI on the firewall</td><td>allowaccess</td><td><code>show system interface</code></td></tr>
<tr><td>Firewall cannot reach the internet</td><td>default route, WAN address, ISP</td><td><code>get router info routing-table all</code></td></tr>
<tr><td>Firewall reaches out, PCs do not</td><td>policy or NAT</td><td><code>show firewall policy</code>, <code>diagnose sys session list</code></td></tr>
<tr><td>Interface will not save</td><td>overlapping subnet or missing attribute</td><td>the error text</td></tr>
<tr><td>Neighbour unreachable</td><td>cable, VLAN, neighbour address</td><td><code>get system arp</code></td></tr></table>
<div class="eg"><p><b>Worked example.</b> After the fix, a colleague asks why the audit finding is closed. You show port1 allowaccess ping, and the ISP side can no longer open HTTPS or SSH on 203.0.113.2. The finding is closed with evidence, not with a promise.</p></div>
<div class="warn"><p><b>Common mistake.</b> Changing several things at once. If you add allowaccess, a policy and a route together and the problem disappears, you do not know which one fixed it and you cannot explain the root cause in the ticket.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pattern to memorise: internet works through the firewall but management fails &rarr; allowaccess. Management works but users fail &rarr; policy, NAT or route.</p></div>
<div class="scn"><h4>Ticket closed with evidence</h4><p>After NK-7713 the engineer attached four items: the before and after of show system interface port2 and port1, the PC ping to the gateway, and the statement that the ISP side can no longer open management. The auditor accepted the closure in one email instead of asking for a re-test.</p><p><b>Lesson:</b> a good ticket note shows the symptom, the cause and the proof of the fix.</p></div>
<div class="iv"><p class="q">"Users on the LAN cannot open the firewall GUI. How do you troubleshoot?"</p><p>I first check whether traffic through the firewall works, to split the path. If it does, I look at allowaccess on the LAN interface for the HTTPS admin service and ping, then at the admin account's trusted hosts and the admin port in system global. I use append so I do not remove services that already work, then retest and document.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split the path: through-traffic versus to-the-box traffic.</li>
<li>Management failing while the internet works points to allowaccess.</li>
<li>Append to keep working services; set on the WAN to close it.</li>
<li>Change one thing, retest, and document with before and after.</li>
</ul></div>
`,hi:`
<p>Achhi troubleshooting routine hoti hai, andaaza nahi. FortiGate ke liye routine yeh hai: <b>symptom define karo, path ko baanto, jis layer ki taraf evidence ishara kare use check karo, ek cheez badlo, dobara test karo.</b> Yeh chapter doosre lab, ticket NK-7713, ko pehli padhai se closed ticket tak walk karta hai.</p>
<h3>Ticket</h3>
<p>"Internet chal raha hai, lekin LAN gateway 10.0.1.1 par firewall GUI nahi khulta aur gateway ko ping bhi fail hai. Pichhle hafte ke audit ki finding attached hai: firewall internet se HTTPS aur SSH ka jawab deta hai." Ek ticket mein do problems: management LAN par bahut band hai aur WAN par bahut khula.</p>
<h3>Step 1: reproduce karo aur path baanto</h3>
<p>PC1 se gateway ko aur phir internet ko ping karo. 8.8.8.8 chalta hai jabki gateway ping fail hoti hai to firewall ke <i>through</i> ka path theek hai (interfaces, route, policy, NAT) aur fault firewall <i>tak</i> ke traffic mein hai, yaani allowaccess.</p>
<pre class="out">PC1&gt; ping 10.0.1.1
10.0.1.1 icmp_seq=1 timeout
10.0.1.1 icmp_seq=2 timeout
10.0.1.1 icmp_seq=3 timeout
10.0.1.1 icmp_seq=4 timeout
10.0.1.1 icmp_seq=5 timeout

PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms</pre>
<h3>Step 2: interface ka evidence padho</h3>
<pre class="code">NK-PUNE-FGT # show system interface port2</pre>
<pre class="out">config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess <span class="hl">ssh</span>
        set type physical
        set alias "LAN"
        set role lan
        set snmp-index 2
    next
end</pre>
<p>Sirf <code>ssh</code> allowed hai: <code>ping</code> nahi aur HTTPS admin service nahi. Yeh dono symptoms samjhata hai. PC ki 8.8.8.8 ko pings firewall ke through policy 1 se guzarti hain, isliye unpar asar nahi.</p>
<h3>Step 3: LAN ko append se theek karo, WAN ko set se band karo</h3>
<p><code>append</code> use karo taaki kaam karta SSH bana rahe; LAN par list replace mat karo. WAN par replace hi chahiye:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # append allowaccess ping h&#116;tps
NK-PUNE-FGT (port2) # next
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # end</pre>
<h3>Step 4: dobara test karo aur saabit karo</h3>
<p>Gateway ko dobara ping karo aur interface lines confirm karo. Ticket tabhi close hota hai jab symptom aur audit finding dono verify ho jaayein:</p>
<pre class="out">PC1&gt; ping 10.0.1.1
84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.0.1.1 icmp_seq=2 ttl=64 time=0.600 ms

NK-PUNE-FGT # show system interface port2
        set allowaccess <span class="hl">ssh ping h&#116;tps</span>
NK-PUNE-FGT # show system interface port1
        set allowaccess <span class="hl">ping</span></pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ticket workflow"><rect x="10" y="15" width="610" height="30" rx="9" fill="#e2e8f0"/><text x="315" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Reproduce: gateway ping fail, internet chalta hai</text><rect x="10" y="52" width="610" height="30" rx="9" fill="#bae6fd"/><text x="315" y="72" text-anchor="middle" class="svg-ink" font-size="13">2. Baanto: through-traffic theek, box tak ka traffic toota</text><rect x="10" y="89" width="610" height="30" rx="9" fill="#fde68a"/><text x="315" y="109" text-anchor="middle" class="svg-ink" font-size="13">3. Evidence: show system interface port2 sirf allowaccess ssh dikhata hai</text><rect x="10" y="126" width="610" height="30" rx="9" fill="#bbf7d0"/><text x="315" y="146" text-anchor="middle" class="svg-ink" font-size="13">4. Fix: LAN par append ping h&#116;tps, WAN par set ping</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">5. Dobara test karo aur document karo</text></svg><p class="cap">Ticket workflow</p></div>
<h3>General decision tree</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehla shak</th><th>Command</th></tr>
<tr><td>Firewall par ping ya GUI nahi</td><td>allowaccess</td><td><code>show system interface</code></td></tr>
<tr><td>Firewall internet tak nahi pahunchta</td><td>default route, WAN address, ISP</td><td><code>get router info routing-table all</code></td></tr>
<tr><td>Firewall bahar jaata hai, PCs nahi</td><td>policy ya NAT</td><td><code>show firewall policy</code>, <code>diagnose sys session list</code></td></tr>
<tr><td>Interface save nahi hota</td><td>overlapping subnet ya missing attribute</td><td>error text</td></tr>
<tr><td>Neighbour unreachable</td><td>cable, VLAN, neighbour address</td><td><code>get system arp</code></td></tr></table>
<div class="eg"><p><b>Worked example.</b> Fix ke baad ek colleague poochta hai ki audit finding close kyun hai. Aap port1 allowaccess ping dikhate ho, aur ISP side ab 203.0.113.2 par HTTPS ya SSH nahi khol sakta. Finding evidence se close hui, vaade se nahi.</p></div>
<div class="warn"><p><b>Common mistake.</b> Ek saath kai cheezein badalna. Agar aap allowaccess, policy aur route saath add karte ho aur problem chali jaati hai, to aapko nahi pata kaunsi ne fix kiya aur ticket mein root cause explain nahi kar sakte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pattern yaad rakho: firewall ke through internet chalta hai par management fail &rarr; allowaccess. Management chalta hai par users fail &rarr; policy, NAT ya route.</p></div>
<div class="scn"><h4>Ticket evidence ke saath close</h4><p>NK-7713 ke baad engineer ne chaar cheezein attach kin: show system interface port2 aur port1 ka before aur after, PC ka gateway ko ping, aur yeh statement ki ISP side ab management nahi khol sakta. Auditor ne re-test maangne ki jagah ek email mein closure accept kar liya.</p><p><b>Lesson:</b> achha ticket note symptom, cause aur fix ka saboot dikhata hai.</p></div>
<div class="iv"><p class="q">"LAN ke users firewall GUI nahi khol pa rahe. Troubleshoot kaise karoge?"</p><p>Pehle check karta hoon ki firewall ke through traffic chalta hai ya nahi, path baantne ke liye. Chalta ho to LAN interface par HTTPS admin service aur ping ke liye allowaccess dekhta hoon, phir admin account ke trusted hosts aur system global mein admin port. Main append use karta hoon taaki jo services kaam kar rahi hain woh na hatein, phir retest aur document karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path baanto: through-traffic versus box tak ka traffic.</li>
<li>Internet chalte hue management fail hona allowaccess ki taraf ishara karta hai.</li>
<li>Kaam karti services rakhne ke liye append; WAN band karne ke liye set.</li>
<li>Ek cheez badlo, retest karo, aur before aur after ke saath document karo.</li>
</ul></div>
`}};export{e as default};