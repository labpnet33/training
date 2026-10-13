var e={id:`lab-walkthroughs`,h:{en:`Troubleshooting workflow: the three lab tickets`,hi:`Troubleshooting workflow: teen lab tickets`},body:{en:`
<p>This chapter is the flight simulator. You apply the seven steps to the three tickets in the labs, using exactly the devices, addresses and commands you will meet there. Read it once before the labs and again afterwards; the second time you will notice how every command answers one specific question. The topology for the first two tickets is the same: PC1 (10.0.10.10/24) on SW1, router R1 with Gi0/0 10.0.10.1 toward the users and Gi0/1 10.0.20.1 toward the server SRV (10.0.20.10).</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Lab topology PC1 SW1 R1 SRV">
<rect x="10" y="45" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="60" y="64" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.10</text>
<rect x="175" y="45" width="100" height="44" rx="8" fill="#bae6fd"/><text x="225" y="72" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="340" y="45" width="120" height="44" rx="8" fill="#fde68a"/><text x="400" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 | Gi0/1</text>
<rect x="525" y="45" width="105" height="44" rx="8" fill="#ddd6fe"/><text x="577" y="64" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="577" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.10</text>
<line x1="110" y1="67" x2="175" y2="67" stroke="#64748b"/><line x1="275" y1="67" x2="340" y2="67" stroke="#64748b"/><line x1="460" y1="67" x2="525" y2="67" stroke="#64748b"/>
<text x="307" y="38" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.1</text><text x="492" y="38" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.1</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Tickets INC-3302 and INC-3319 use this topology</text>
</svg><p class="cap">User subnet 10.0.10.0/24 on the left, server subnet 10.0.20.0/24 on the right, R1 routes between them.</p></div>

<h3>Ticket 1, INC-3302: sales cannot reach the file server</h3>
<p><b>Step 1, identify.</b> The ticket says it started this morning after an overnight maintenance change (what changed: noted). Reproduce from PC1: <code>ping 10.0.10.1</code> succeeds, <code>ping 10.0.20.10</code> fails, and <code>trace 10.0.20.10</code> shows hop 1 at 10.0.10.1 followed by an unreachable message from the same router.</p>
<p><b>Step 2, theory.</b> Divide and conquer: the gateway answers, so PC1, its cable, SW1 and R1's user interface are fine. The fault is at R1 or beyond. Theory: R1 has lost its path to 10.0.20.0/24, most likely because an interface is down after the maintenance.</p>
<p><b>Step 3, test.</b> On R1:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.10.1       YES manual up                    up
<span class="hl">GigabitEthernet0/1     10.0.20.1       YES manual administratively down down</span></pre>
<p>Confirmed: Gi0/1 was shut down. <b>Step 4, plan:</b> bring it up; effect: only restores the server subnet. <b>Step 5, implement:</b> <code>configure terminal</code>, <code>interface GigabitEthernet0/1</code>, <code>no shutdown</code>, <code>end</code>.</p>
<p><b>Step 6, verify.</b> PC1 still cannot ping the server. This is why verification is a real step: there is a <b>second fault</b>. Back to step 2. R1 now has the connected route, so requests reach SRV; the replies must be failing. On SRV, <code>show ip</code> shows the gateway as <b>10.0.20.254</b>, an address nobody owns. Fix with <code>ip 10.0.20.10/24 10.0.20.1</code>. Now PC1 pings the server, and <code>curl 10.0.20.10</code> returns the file server's web page: full functionality verified, not just ping.</p>
<p><b>Step 7, document.</b> Root cause: the maintenance change left R1 Gi0/1 administratively down, and SRV had a wrong default gateway (10.0.20.254), masked until the interface came back. Lesson: after any fix, test again; one symptom can hide two faults.</p>

<h3>Ticket 2, INC-3319: the intranet works by IP only</h3>
<p><b>Step 1.</b> "web.nwk.lab does not open on PC1, but a colleague opens it by IP." The IP path is therefore fine; this is name resolution. Reproduce with <code>nslookup web.nwk.lab</code> on PC1. The query goes to 10.0.20.10 and the connection is <b>refused</b>: PC1 is asking the web server, which is not a DNS server.</p>
<p><b>Step 2 and 3.</b> Theory one: PC1 has the wrong DNS server. The ticket says R1 is the office DNS server. Test: <code>ip dns 10.0.10.1</code> on PC1, then <code>nslookup web.nwk.lab</code> again. Now a real answer comes back, but it is <b>10.0.20.99</b>, not the web server's 10.0.20.10. A second fault: the record itself is wrong.</p>
<pre class="code"><span class="c">! Step 5 on R1: replace the wrong host record</span>
R1# configure terminal
R1(config)# ip host web.nwk.lab 10.0.20.10
R1(config)# end</pre>
<p><b>Step 6.</b> On PC1, <code>nslookup web.nwk.lab</code> returns 10.0.20.10 and <code>curl web.nwk.lab</code> loads the page by name. <b>Step 7:</b> document both faults (client DNS setting, stale host record) and add a preventive measure, for example handing out the DNS server by DHCP instead of typing it by hand.</p>

<h3>Ticket 3, INC-3340: the slow link</h3>
<p>Different topology: R1 Fa0/0 (10.0.12.1) connects to SW1 Fa0/1, and SW1's management address is 10.0.12.2. The ticket says the billing app freezes while pings mostly work, and that the switch uplink was hard-coded during a cable test.</p>
<p><b>Steps 1 to 3.</b> Generate traffic and read the counters on R1:</p>
<pre class="out">R1# ping 10.0.12.2 repeat 100
Sending 100, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Success rate is 100 percent (100/100), round-trip min/avg/max = 1/2/8 ms
R1# show interfaces fa0/0
  <span class="hl">Half-duplex, 100Mb/s</span>, 100BaseTX/FX
     0 output errors, 21 collisions, 0 interface resets
     <span class="hl">0 babbles, 21 late collision, 0 deferred</span></pre>
<p>Pings succeed, yet R1 is half duplex and counts <b>late collisions</b>: the signature of a duplex mismatch. SW1 Fa0/1 is hard-coded <code>speed 100</code>, <code>duplex full</code>, so R1's autonegotiation failed and fell back to half duplex.</p>
<p><b>Steps 4 and 5.</b> Plan: return SW1 Fa0/1 to autonegotiation so both ends agree on full duplex (a brief link renegotiation is the only effect). On SW1: <code>enable</code>, <code>configure terminal</code>, <code>interface fa0/1</code>, <code>speed auto</code>, <code>duplex auto</code>, <code>end</code>.</p>
<p><b>Step 6.</b> On R1, <code>clear counters</code> (press Enter to confirm), <code>ping 10.0.12.2 repeat 100</code>, <code>show interfaces fa0/0</code>: now <b>Full-duplex</b>, packets input increasing and <b>0 late collision</b>. Preventive measure: a standard that access and uplink ports stay on auto unless both ends are changed together. <b>Step 7:</b> document the counter evidence before and after.</p>

<div class="warn"><p><b>Common mistakes in these labs.</b> Stopping after the first fix in INC-3302 without re-testing. Fixing only the DNS server setting in INC-3319 and missing the wrong record. Changing R1 in INC-3340 to hard-coded full duplex as well: it works, but it keeps the fragile configuration that caused the fault.</p></div>

<div class="exam"><p><b>Exam traps.</b> After implementing a fix, the next step is verify, and verification can reveal a second fault that sends you back to theory. "Works by IP, not by name" is DNS. Late collisions plus half duplex on one side is a duplex mismatch.</p></div>

<div class="scn"><h4>The two-fault ticket in real life</h4><p>A hospital lab system went offline after a weekend switch upgrade. The engineer found and fixed an access port left in the wrong VLAN, and the system still could not reach its database. Because she re-tested before closing the ticket, she found the second fault: the new switch lacked the DHCP relay, and the lab system's lease had expired. Two faults, one symptom, both fixed in the same visit.</p><p><b>Lesson:</b> verification is not a formality. It is how you find the fault the first fault was hiding.</p></div>

<div class="iv"><p class="q">"Tell me about a time a fix did not solve the problem."</p><p>Use the INC-3302 pattern: you fixed a clear fault (a shut interface), verification still failed, so you went back to the theory step, followed the packet in both directions, and found a second fault on the return path (a wrong server gateway). Stress that you verified with the real application, not only ping, and documented both root causes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>INC-3302: gateway answers, server does not; R1 Gi0/1 administratively down, then SRV gateway 10.0.20.254 instead of 10.0.20.1.</li>
<li>INC-3319: nslookup refused (wrong DNS server on PC1), then the record on R1 pointed to 10.0.20.99.</li>
<li>INC-3340: pings work, R1 half duplex with late collisions; set SW1 Fa0/1 back to speed auto and duplex auto.</li>
<li>Verify with the real application (curl) and with clean counters, not with one ping.</li>
<li>One symptom can hide two faults; verification sends you back to the theory step.</li>
</ul></div>
`,hi:`
<p>Yeh chapter flight simulator hai. Aap saat steps ko labs ke teen tickets par apply karte ho, exactly unhi devices, addresses aur commands ke saath jo aapko wahan milenge. Ise labs se pehle ek baar padho aur baad mein dobara; doosri baar aap notice karoge ki har command ek specific sawaal ka jawab deti hai. Pehle do tickets ki topology same hai: SW1 par PC1 (10.0.10.10/24), router R1 jiska Gi0/0 10.0.10.1 users ki taraf aur Gi0/1 10.0.20.1 server SRV (10.0.20.10) ki taraf hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Lab topology PC1 SW1 R1 SRV">
<rect x="10" y="45" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="60" y="64" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.10</text>
<rect x="175" y="45" width="100" height="44" rx="8" fill="#bae6fd"/><text x="225" y="72" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="340" y="45" width="120" height="44" rx="8" fill="#fde68a"/><text x="400" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 | Gi0/1</text>
<rect x="525" y="45" width="105" height="44" rx="8" fill="#ddd6fe"/><text x="577" y="64" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="577" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.10</text>
<line x1="110" y1="67" x2="175" y2="67" stroke="#64748b"/><line x1="275" y1="67" x2="340" y2="67" stroke="#64748b"/><line x1="460" y1="67" x2="525" y2="67" stroke="#64748b"/>
<text x="307" y="38" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.1</text><text x="492" y="38" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.1</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Tickets INC-3302 aur INC-3319 yeh topology use karte hain</text>
</svg><p class="cap">Left mein user subnet 10.0.10.0/24, right mein server subnet 10.0.20.0/24, R1 dono ke beech route karta hai.</p></div>

<h3>Ticket 1, INC-3302: sales file server tak nahi pahunch pa raha</h3>
<p><b>Step 1, identify.</b> Ticket kehta hai ki yeh aaj subah raat ke maintenance change ke baad shuru hua (kya badla: note kiya). PC1 se reproduce karo: <code>ping 10.0.10.1</code> successful, <code>ping 10.0.20.10</code> fail, aur <code>trace 10.0.20.10</code> hop 1 par 10.0.10.1 dikhata hai aur phir usi router se unreachable message.</p>
<p><b>Step 2, theory.</b> Divide and conquer: gateway jawab deta hai, isliye PC1, uski cable, SW1 aur R1 ka user interface theek hain. Fault R1 par ya uske aage hai. Theory: R1 ne 10.0.20.0/24 tak ka path kho diya hai, sabse likely isliye ki maintenance ke baad ek interface down hai.</p>
<p><b>Step 3, test.</b> R1 par:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.10.1       YES manual up                    up
<span class="hl">GigabitEthernet0/1     10.0.20.1       YES manual administratively down down</span></pre>
<p>Confirm: Gi0/1 shut down kiya gaya tha. <b>Step 4, plan:</b> ise up karo; effect: sirf server subnet wapas aata hai. <b>Step 5, implement:</b> <code>configure terminal</code>, <code>interface GigabitEthernet0/1</code>, <code>no shutdown</code>, <code>end</code>.</p>
<p><b>Step 6, verify.</b> PC1 ab bhi server ko ping nahi kar pata. Isiliye verification ek asli step hai: ek <b>doosra fault</b> hai. Step 2 par wapas. R1 ke paas ab connected route hai, isliye requests SRV tak pahunchti hain; replies fail ho rahe honge. SRV par <code>show ip</code> gateway ko <b>10.0.20.254</b> dikhata hai, aisa address jo kisi ka nahi. <code>ip 10.0.20.10/24 10.0.20.1</code> se fix karo. Ab PC1 server ko ping karta hai, aur <code>curl 10.0.20.10</code> file server ka web page laata hai: poori functionality verify hui, sirf ping nahi.</p>
<p><b>Step 7, document.</b> Root cause: maintenance change ne R1 Gi0/1 ko administratively down chhoda, aur SRV ka default gateway galat tha (10.0.20.254), jo interface wapas aane tak chhupa raha. Seekh: har fix ke baad dobara test karo; ek symptom do faults chhupa sakta hai.</p>

<h3>Ticket 2, INC-3319: intranet sirf IP se chalta hai</h3>
<p><b>Step 1.</b> "PC1 par web.nwk.lab nahi khulta, lekin colleague use IP se kholta hai." Isliye IP path theek hai; yeh name resolution hai. PC1 par <code>nslookup web.nwk.lab</code> se reproduce karo. Query 10.0.20.10 ko jaati hai aur connection <b>refused</b> hota hai: PC1 web server se poochh raha hai, jo DNS server nahi hai.</p>
<p><b>Step 2 aur 3.</b> Pehli theory: PC1 par galat DNS server hai. Ticket kehta hai R1 office DNS server hai. Test: PC1 par <code>ip dns 10.0.10.1</code>, phir dobara <code>nslookup web.nwk.lab</code>. Ab asli jawab aata hai, lekin woh <b>10.0.20.99</b> hai, web server ka 10.0.20.10 nahi. Doosra fault: record khud galat hai.</p>
<pre class="code"><span class="c">! R1 par step 5: galat host record replace karo</span>
R1# configure terminal
R1(config)# ip host web.nwk.lab 10.0.20.10
R1(config)# end</pre>
<p><b>Step 6.</b> PC1 par <code>nslookup web.nwk.lab</code> 10.0.20.10 laata hai aur <code>curl web.nwk.lab</code> naam se page load karta hai. <b>Step 7:</b> dono faults document karo (client DNS setting, purana host record) aur preventive measure jodo, jaise DNS server haath se type karne ki jagah DHCP se dena.</p>

<h3>Ticket 3, INC-3340: slow link</h3>
<p>Alag topology: R1 Fa0/0 (10.0.12.1) SW1 Fa0/1 se juda hai, aur SW1 ka management address 10.0.12.2 hai. Ticket kehta hai billing app atakti hai jabki pings zyada tar chalti hain, aur cable test ke dauraan switch uplink hard-code kiya gaya tha.</p>
<p><b>Steps 1 se 3.</b> Traffic banao aur R1 par counters padho:</p>
<pre class="out">R1# ping 10.0.12.2 repeat 100
Sending 100, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Success rate is 100 percent (100/100), round-trip min/avg/max = 1/2/8 ms
R1# show interfaces fa0/0
  <span class="hl">Half-duplex, 100Mb/s</span>, 100BaseTX/FX
     0 output errors, 21 collisions, 0 interface resets
     <span class="hl">0 babbles, 21 late collision, 0 deferred</span></pre>
<p>Pings successful hain, phir bhi R1 half duplex hai aur <b>late collisions</b> ginta hai: duplex mismatch ki pehchaan. SW1 Fa0/1 <code>speed 100</code>, <code>duplex full</code> par hard-coded hai, isliye R1 ka autonegotiation fail hua aur half duplex par gir gaya.</p>
<p><b>Steps 4 aur 5.</b> Plan: SW1 Fa0/1 ko autonegotiation par wapas lao taaki dono ends full duplex par agree karein (sirf ek chhota link renegotiation effect hai). SW1 par: <code>enable</code>, <code>configure terminal</code>, <code>interface fa0/1</code>, <code>speed auto</code>, <code>duplex auto</code>, <code>end</code>.</p>
<p><b>Step 6.</b> R1 par <code>clear counters</code> (confirm ke liye Enter dabao), <code>ping 10.0.12.2 repeat 100</code>, <code>show interfaces fa0/0</code>: ab <b>Full-duplex</b>, packets input badh rahe hain aur <b>0 late collision</b>. Preventive measure: ek standard ki access aur uplink ports auto par rahein jab tak dono ends ek saath na badle jaayein. <b>Step 7:</b> pehle aur baad ke counter evidence document karo.</p>

<div class="warn"><p><b>In labs ki common galtiyan.</b> INC-3302 mein pehle fix ke baad bina re-test kiye ruk jaana. INC-3319 mein sirf DNS server setting theek karna aur galat record miss karna. INC-3340 mein R1 ko bhi hard-coded full duplex kar dena: chalta hai, lekin woh fragile configuration bani rehti hai jisne fault paida kiya.</p></div>

<div class="exam"><p><b>Exam traps.</b> Fix implement karne ke baad agla step verify hai, aur verification doosra fault dikha sakta hai jo aapko theory par wapas bhejta hai. "IP se chalta hai, naam se nahi" DNS hai. Ek side par late collisions plus half duplex duplex mismatch hai.</p></div>

<div class="scn"><h4>Asli zindagi mein do-fault wala ticket</h4><p>Weekend ke switch upgrade ke baad ek hospital ka lab system offline ho gaya. Engineer ne galat VLAN mein chhoda gaya access port dhoondha aur theek kiya, aur system phir bhi apne database tak nahi pahunch paya. Kyunki usne ticket close karne se pehle re-test kiya, use doosra fault mila: naye switch mein DHCP relay nahi tha, aur lab system ka lease expire ho gaya tha. Do faults, ek symptom, dono ek hi visit mein fix.</p><p><b>Seekh:</b> verification formality nahi hai. Isi se aap woh fault dhoondhte ho jo pehla fault chhupa raha tha.</p></div>

<div class="iv"><p class="q">"Mujhe aisa time batao jab fix ne problem solve nahi ki."</p><p>INC-3302 pattern use karo: aapne ek saaf fault fix kiya (shut interface), verification phir bhi fail hua, isliye aap theory step par wapas gaye, packet ko dono directions mein follow kiya, aur return path par doosra fault paya (galat server gateway). Zor do ki aapne sirf ping nahi, asli application se verify kiya, aur dono root causes document kiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>INC-3302: gateway jawab deta hai, server nahi; R1 Gi0/1 administratively down, phir SRV gateway 10.0.20.1 ki jagah 10.0.20.254.</li>
<li>INC-3319: nslookup refused (PC1 par galat DNS server), phir R1 ka record 10.0.20.99 ki taraf point karta tha.</li>
<li>INC-3340: pings chalti hain, R1 late collisions ke saath half duplex; SW1 Fa0/1 ko speed auto aur duplex auto par wapas lao.</li>
<li>Ek ping se nahi, asli application (curl) aur clean counters se verify karo.</li>
<li>Ek symptom do faults chhupa sakta hai; verification aapko theory step par wapas bhejta hai.</li>
</ul></div>
`}};export{e as default};