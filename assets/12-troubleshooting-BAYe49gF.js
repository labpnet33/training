var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking through the three labs`,hi:`Troubleshooting workflow: teeno labs step by step`},body:{en:`
<p>A good mechanic does not replace parts at random. He asks what the customer saw, follows the fuel or the electricity from its source to where it stops, and fixes the first broken point before testing again. Infrastructure services break in the same way: a message, a poll, a lease or a flow travels from one box to another, and it stops somewhere. Your job is to follow it.</p>

<h3>The method</h3>
<ol>
<li><b>Define the symptom</b> precisely: "no lease at all" is different from "lease but no connectivity".</li>
<li><b>Draw the path</b> of the service: who sends, on which port, to which address, and who answers.</li>
<li><b>Use counters at each hop</b>: something was sent, something arrived, something was answered.</li>
<li><b>Fix one fault at a time</b> and re-test, because tickets usually hide more than one.</li>
<li><b>Close with evidence</b>: the collector entry, the binding, the trap, the route.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Follow the service path">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="12">Sender</text>
<rect x="180" y="50" width="120" height="46" rx="8" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="12">Config right?</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">level, ACL, helper</text>
<rect x="360" y="50" width="110" height="46" rx="8" fill="#fed7aa"/><text x="415" y="70" text-anchor="middle" class="svg-ink" font-size="12">Path</text><text x="415" y="86" text-anchor="middle" class="svg-muted" font-size="12">route both ways</text>
<rect x="520" y="50" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="12">Receiver</text>
<line x1="120" y1="73" x2="180" y2="73" stroke="#64748b"/><line x1="300" y1="73" x2="360" y2="73" stroke="#64748b"/><line x1="470" y1="73" x2="520" y2="73" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Counters at every box: sent, received, answered</text>
</svg><p class="cap">Every service ticket is a path; find the first box where the counter stops.</p></div>

<h3>Lab 1: IP SLA tracking with syslog evidence</h3>
<p>Symptom: when PE1's core link (PE1 Gi0/1) fails, BR keeps sending to PE1. Build and verify in this order:</p>
<ul>
<li><code>show ip sla configuration 10</code> and <code>show ip sla statistics 10</code>: target 10.10.10.1, source Gi0/1, frequency 5, a recent start time, return code OK. If "Number of successes" never grows, the schedule is missing.</li>
<li><code>show ip route 10.10.10.1</code>: the /32 via 10.1.1.1 must exist and must not be tracked.</li>
<li><code>show track 10</code>: reachability, delay down 5 up 10, "Tracked by: Static IP Routing".</li>
<li><code>show logging</code>: trap level informational, host 10.10.10.50 "link up", source Loopback0.</li>
</ul>
<p>Then shut PE1 Gi0/1. You should see:</p>
<pre class="out">BR# show ip route static
S     10.10.10.0/24 [<span class="hl">250/0] via 10.2.2.1</span>
S     10.10.10.1/32 [1/0] via 10.1.1.1

NOC&gt; show syslog
<span class="hl">172.16.40.1  %TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</span></pre>
<p>If the track flips but the NOC shows nothing, check the trap level (6 is needed), the source interface, and whether HQ routes back to 172.16.40.0/24 (it has static routes via both PE1 and PE2 with AD 5 for the backup). After <code>no shutdown</code> the track returns Up after the 10-second delay, the primary is back via 10.1.1.1, and the collector has "Down -&gt; Up".</p>

<h3>Lab 2: Branch PCs get no (usable) DHCP lease</h3>
<p>Symptom: PCs say "Can't find dhcp server"; last week they got leases but could reach nothing. That is two symptoms, so expect at least two faults. Follow DORA from PC1 to HQ:</p>
<pre class="out">BR# show ip interface GigabitEthernet0/0 | include Helper
  <span class="hl">Helper address is not set</span>
BR# show ip interface GigabitEthernet0/1 | include Helper
  Helper address is 10.30.30.1</pre>
<p><b>Fault 1:</b> the helper is on the WAN interface. Move it to Gi0/0, where the broadcasts arrive. Now HQ receives relayed DISCOVERs from giaddr 192.168.50.1, but the client still gets nothing:</p>
<pre class="out">HQ# show ip route 192.168.50.1
<span class="hl">% Network not in table</span></pre>
<p><b>Fault 2:</b> HQ has no route to giaddr, so the OFFER cannot be sent. Add <code>ip route 192.168.50.0 255.255.255.0 10.20.20.1</code>. Leases now work, which brings back last week's symptom:</p>
<pre class="out">HQ# show run | section dhcp
ip dhcp excluded-address 192.168.50.1 192.168.50.10
ip dhcp pool BR-LAN
 network 192.168.50.0 255.255.255.0
 <span class="hl">default-router 192.168.50.254</span>
 dns-server 10.30.30.53</pre>
<p><b>Fault 3:</b> the pool hands out a gateway that does not exist. Replace it with 192.168.50.1. Renew on PC1 and PC2 (<code>ip dhcp</code>), confirm both in <code>show ip dhcp binding</code>, and ping 10.30.30.80. The giaddr question: 192.168.50.1, the IP of the interface that received the broadcast.</p>

<h3>Lab 3: NOC ticket, EDGE is dark to monitoring</h3>
<p>Symptom NK-4471: UNKNOWN in the NMS, no traps, no way to explain a traffic spike. Three services, three checks:</p>
<ul>
<li><b>Polling:</b> <code>show snmp</code> shows input growing and "Unknown community name" growing with zero responses. <code>show access-lists 20</code> permits 10.99.0.5, not 10.99.0.50. Add the correct host; the user LAN stays denied.</li>
<li><b>Traps:</b> there is no <code>snmp-server host</code> and no <code>enable traps</code>. Add <code>snmp-server enable traps snmp linkdown linkup</code> and <code>snmp-server host 10.99.0.50 version 2c NOC-TRAP</code>, bounce Loopback100, and run <code>show traps</code> on the NMS.</li>
<li><b>Flows:</b> build NOC-REC, NOC-EXP (10.99.0.50, UDP 2055) and NOC-MON (inactive timeout 10), apply it input on Gi0/0, generate pings from PC1 and PC2 to 203.0.113.80, check <code>show flow monitor NOC-MON cache format table</code> and <code>show flow exporter NOC-EXP statistics</code>, then <code>show flows</code> on the NMS. The ping flows carry IP protocol 1.</li>
</ul>

<div class="eg"><p><b>Worked example: reading counters as a timeline.</b> Before the lab 3 fix, <code>show snmp</code> shows 37 input and 37 unknown community. You add the ACL entry and poll once: input 38, unknown community still 37, Get-request PDUs 1, Response PDUs 1. One poll, one answer: the fault is proven fixed by counters, not by opinion.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the first fix in a multi-fault ticket; testing only from the router (a ping from the router uses a different source than the service); changing several things at once so you cannot tell what fixed it; forgetting to renew the client lease after fixing the pool.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions often show one output with the fault hidden in a single value: a helper on Gi0/1, a default-router .254, an ACL with .5. Read addresses digit by digit.</p></div>

<div class="scn"><h4>Three faults, one ticket</h4><p>A service desk escalated "branch Wi-Fi broken" at 09:10. The engineer found the helper on a new SVI pointed at an old server; after fixing it, leases came from the right pool but clients still failed because the new pool's default-router was the old HSRP address. Fixing that, users could browse, but the NMS still showed the branch as down: the new switch's SNMP ACL was copied from a template with a placeholder address. Each fix was verified with counters before the next.</p><p><b>Lesson:</b> keep following the path until the original symptom and every hidden one are gone.</p></div>

<div class="iv"><p class="q">"Describe your approach to a ticket where clients get a DHCP address but cannot reach anything."</p><p>Separate the two stages: the lease itself works, so the relay and server path are fine; now check the contents of the lease (gateway, mask, DNS) against the real gateway, then the gateway's routing. In the lab this was <code>default-router 192.168.50.254</code> instead of .1. Mention renewing the lease after the fix and verifying with a ping to the application server.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define the symptom, draw the service path, use counters at every hop, fix one fault at a time, close with evidence.</li>
<li>IP SLA lab: schedule, source, /32 pin, track with delay, trap level 6 from Loopback0, route back from the collector.</li>
<li>DHCP lab: helper on the receiving interface, return route to giaddr, correct default-router, renew and verify.</li>
<li>NOC lab: community ACL, trap enable plus host, FNF record, exporter, monitor applied inbound.</li>
<li>Multi-fault tickets are normal; the original symptom often hides a second one.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts random tareeke se nahi badalta. Woh poochta hai customer ne kya dekha, fuel ya bijli ko uske source se wahan tak follow karta hai jahan woh rukti hai, aur dobara test karne se pehle pehla toota point theek karta hai. Infrastructure services bhi aise hi tootti hain: ek message, poll, lease ya flow ek box se doosre tak jaata hai, aur kahin ruk jaata hai. Aapka kaam use follow karna hai.</p>

<h3>Method</h3>
<ol>
<li><b>Symptom ko sateek define karo</b>: "lease bilkul nahi" aur "lease hai par connectivity nahi" alag hain.</li>
<li><b>Service ka path banao</b>: kaun bhejta hai, kis port par, kis address ko, aur kaun jawab deta hai.</li>
<li><b>Har hop par counters use karo</b>: kuch bheja gaya, kuch pahuncha, kuch ka jawab mila.</li>
<li><b>Ek baar mein ek fault theek karo</b> aur dobara test karo, kyunki tickets aksar ek se zyada fault chhupate hain.</li>
<li><b>Saboot ke saath band karo</b>: collector entry, binding, trap, route.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Follow the service path">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="12">Sender</text>
<rect x="180" y="50" width="120" height="46" rx="8" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="12">Config sahi?</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">level, ACL, helper</text>
<rect x="360" y="50" width="110" height="46" rx="8" fill="#fed7aa"/><text x="415" y="70" text-anchor="middle" class="svg-ink" font-size="12">Path</text><text x="415" y="86" text-anchor="middle" class="svg-muted" font-size="12">dono taraf route</text>
<rect x="520" y="50" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="12">Receiver</text>
<line x1="120" y1="73" x2="180" y2="73" stroke="#64748b"/><line x1="300" y1="73" x2="360" y2="73" stroke="#64748b"/><line x1="470" y1="73" x2="520" y2="73" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Har box par counters: bheja, mila, jawab diya</text>
</svg><p class="cap">Har service ticket ek path hai; woh pehla box dhoondho jahan counter ruk jaata hai.</p></div>

<h3>Lab 1: Syslog saboot ke saath IP SLA tracking</h3>
<p>Symptom: jab PE1 ka core link (PE1 Gi0/1) fail hota hai, BR PE1 ko bhejta rehta hai. Is kram mein banao aur verify karo:</p>
<ul>
<li><code>show ip sla configuration 10</code> aur <code>show ip sla statistics 10</code>: target 10.10.10.1, source Gi0/1, frequency 5, haal ka start time, return code OK. Agar "Number of successes" kabhi nahi badhta, to schedule missing hai.</li>
<li><code>show ip route 10.10.10.1</code>: 10.1.1.1 ke through /32 hona chahiye aur tracked nahi hona chahiye.</li>
<li><code>show track 10</code>: reachability, delay down 5 up 10, "Tracked by: Static IP Routing".</li>
<li><code>show logging</code>: trap level informational, host 10.10.10.50 "link up", source Loopback0.</li>
</ul>
<p>Phir PE1 Gi0/1 shut karo. Aapko dikhna chahiye:</p>
<pre class="out">BR# show ip route static
S     10.10.10.0/24 [<span class="hl">250/0] via 10.2.2.1</span>
S     10.10.10.1/32 [1/0] via 10.1.1.1

NOC&gt; show syslog
<span class="hl">172.16.40.1  %TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</span></pre>
<p>Agar track badalta hai par NOC kuch nahi dikhata, trap level (6 chahiye), source interface, aur yeh check karo ki HQ 172.16.40.0/24 tak wapas route karta hai (uske paas PE1 aur PE2 dono ke through static routes hain, backup AD 5 ke saath). <code>no shutdown</code> ke baad track 10-second delay ke baad Up hota hai, primary 10.1.1.1 se wapas aata hai, aur collector ke paas "Down -&gt; Up" hota hai.</p>

<h3>Lab 2: Branch PCs ko (kaam ka) DHCP lease nahi mil raha</h3>
<p>Symptom: PCs kehte hain "Can't find dhcp server"; pichhle hafte unhe leases mile the par kahin nahi pahunch paate the. Yeh do symptoms hain, to kam se kam do faults expect karo. PC1 se HQ tak DORA follow karo:</p>
<pre class="out">BR# show ip interface GigabitEthernet0/0 | include Helper
  <span class="hl">Helper address is not set</span>
BR# show ip interface GigabitEthernet0/1 | include Helper
  Helper address is 10.30.30.1</pre>
<p><b>Fault 1:</b> helper WAN interface par hai. Use Gi0/0 par le jao, jahan broadcasts aate hain. Ab HQ ko giaddr 192.168.50.1 se relay hue DISCOVERs milte hain, par client ko phir bhi kuch nahi milta:</p>
<pre class="out">HQ# show ip route 192.168.50.1
<span class="hl">% Network not in table</span></pre>
<p><b>Fault 2:</b> HQ ke paas giaddr tak route nahi, isliye OFFER bheja nahi ja sakta. <code>ip route 192.168.50.0 255.255.255.0 10.20.20.1</code> jodo. Ab leases chalte hain, jisse pichhle hafte ka symptom wapas aata hai:</p>
<pre class="out">HQ# show run | section dhcp
ip dhcp excluded-address 192.168.50.1 192.168.50.10
ip dhcp pool BR-LAN
 network 192.168.50.0 255.255.255.0
 <span class="hl">default-router 192.168.50.254</span>
 dns-server 10.30.30.53</pre>
<p><b>Fault 3:</b> pool aisa gateway deta hai jo exist hi nahi karta. Use 192.168.50.1 se badlo. PC1 aur PC2 par renew karo (<code>ip dhcp</code>), <code>show ip dhcp binding</code> mein dono confirm karo, aur 10.30.30.80 ping karo. giaddr ka sawaal: 192.168.50.1, us interface ka IP jisne broadcast receive kiya.</p>

<h3>Lab 3: NOC ticket, EDGE monitoring mein andhera</h3>
<p>Symptom NK-4471: NMS mein UNKNOWN, koi traps nahi, traffic spike samjhane ka koi tareeka nahi. Teen services, teen checks:</p>
<ul>
<li><b>Polling:</b> <code>show snmp</code> mein input badh raha hai aur "Unknown community name" badh raha hai, zero responses ke saath. <code>show access-lists 20</code> 10.99.0.5 ko permit karta hai, 10.99.0.50 ko nahi. Sahi host jodo; user LAN deny hi rehta hai.</li>
<li><b>Traps:</b> na <code>snmp-server host</code> hai na <code>enable traps</code>. <code>snmp-server enable traps snmp linkdown linkup</code> aur <code>snmp-server host 10.99.0.50 version 2c NOC-TRAP</code> jodo, Loopback100 bounce karo, aur NMS par <code>show traps</code> chalao.</li>
<li><b>Flows:</b> NOC-REC, NOC-EXP (10.99.0.50, UDP 2055) aur NOC-MON (inactive timeout 10) banao, Gi0/0 par input lagao, PC1 aur PC2 se 203.0.113.80 ko pings bhejo, <code>show flow monitor NOC-MON cache format table</code> aur <code>show flow exporter NOC-EXP statistics</code> check karo, phir NMS par <code>show flows</code>. Ping flows IP protocol 1 rakhte hain.</li>
</ul>

<div class="eg"><p><b>Worked example: counters ko timeline ki tarah padhna.</b> Lab 3 fix se pehle, <code>show snmp</code> 37 input aur 37 unknown community dikhata hai. Aap ACL entry jodte ho aur ek baar poll karte ho: input 38, unknown community abhi bhi 37, Get-request PDUs 1, Response PDUs 1. Ek poll, ek jawab: fault ka theek hona counters se sabit hua, raay se nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Multi-fault ticket mein pehle fix ke baad ruk jaana; sirf router se test karna (router se ping service se alag source use karta hai); ek saath kai cheezein badalna jisse pata nahi chalta kisne theek kiya; pool theek karne ke baad client lease renew karna bhoolna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions aksar ek output dikhate hain jismein fault ek hi value mein chhupa hota hai: Gi0/1 par helper, default-router .254, .5 wala ACL. Addresses ko ek ek digit padho.</p></div>

<div class="scn"><h4>Teen faults, ek ticket</h4><p>Service desk ne 09:10 par "branch Wi-Fi kharab" escalate kiya. Engineer ne paaya ki naye SVI par helper purane server ki taraf point kar raha tha; theek karne ke baad leases sahi pool se aaye par clients phir bhi fail hue kyunki naye pool ka default-router purana HSRP address tha. Woh theek karne par users browse kar sake, par NMS branch ko abhi bhi down dikha raha tha: naye switch ka SNMP ACL placeholder address wale template se copy hua tha. Har fix agle se pehle counters se verify kiya gaya.</p><p><b>Seekh:</b> path ko tab tak follow karte raho jab tak original symptom aur har chhupa symptom khatam na ho jaaye.</p></div>

<div class="iv"><p class="q">"Us ticket ka approach batao jahan clients ko DHCP address milta hai par woh kahin nahi pahunch paate."</p><p>Do stages alag karo: lease khud chal raha hai, to relay aur server path theek hain; ab lease ke contents (gateway, mask, DNS) ko asli gateway se milao, phir gateway ki routing. Lab mein yeh .1 ki jagah <code>default-router 192.168.50.254</code> tha. Fix ke baad lease renew karna aur application server ko ping se verify karna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symptom define karo, service path banao, har hop par counters use karo, ek baar mein ek fault theek karo, saboot ke saath band karo.</li>
<li>IP SLA lab: schedule, source, /32 pin, delay ke saath track, Loopback0 se trap level 6, collector se wapas route.</li>
<li>DHCP lab: receiving interface par helper, giaddr tak return route, sahi default-router, renew aur verify.</li>
<li>NOC lab: community ACL, trap enable plus host, FNF record, exporter, inbound laga monitor.</li>
<li>Multi-fault tickets normal hain; original symptom aksar doosra chhupa leta hai.</li>
</ul></div>
`}};export{e as default};