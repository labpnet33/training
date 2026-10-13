var e={id:`uplinks-poe-dependencies`,h:{en:`Resilient uplinks, PoE and service dependency analysis`,hi:`Resilient uplinks, PoE aur service dependency analysis`},body:{en:`
<h3>The case: Harlow University library</h3>
<p>Harlow University's four-storey library hosts 3,500 students during exam week. The design review found no controller problem: the 9800 SSO pair is healthy. But on the first exam evening three separate things broke. A power dip rebooted the floor-2 switch, and only 14 of its 24 APs came back because the PoE budget was exceeded. The DHCP server ran out of addresses in the library scope. And the guest portal, which depends on a cloud service, stopped answering for 20 minutes. Students blamed Wi-Fi each time.</p>
<p>The lesson is that a wireless design is only as resilient as the weakest thing it depends on. This chapter teaches you to find those things before the students do.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>A single switch, power supply or link failure must not take a whole floor offline.</li>
<li>Exam-week capacity: 3,500 devices, many with two or three connections each.</li>
<li>Staff and exam systems must not depend on the guest portal or any cloud service.</li>
<li>Budget allows a second switch per floor, not a second cabling system.</li>
</ul>

<h3>Resilient wired uplinks</h3>
<p><b>Controller uplinks.</b> Connect the controller to the network with a port channel (a LAG, link aggregation group) so that a single link or switch-port failure does not break the controller. The AireOS controllers support LAG in static "on" mode only, with no LACP, and all ports belong to a single bundle. The Catalyst 9800 supports port channels with LACP, PAgP or static mode. To survive a whole switch failure, split the members across two switches that act as one logical switch (a stack, StackWise Virtual or VSS). In an SSO pair, each unit connects to both switches.</p>
<p><b>AP uplinks.</b> An AP normally has one wired link. You cannot make a single AP's cable redundant, so you make the <i>cell</i> redundant. Alternate the APs in an area between two access switches, so that losing one switch leaves every second AP alive. Combined with the N-1 coverage rule from the previous chapter, this keeps voice and data usable at reduced capacity.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Dependencies of a wireless network">
<rect x="250" y="110" width="140" height="60" rx="12" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">WLC SSO pair</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">+ AP and clients</text>
<rect x="20" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text>
<rect x="255" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">DNS</text>
<rect x="490" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">AAA / RADIUS</text>
<rect x="20" y="220" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="85" y="247" text-anchor="middle" class="svg-ink" font-size="13">Cisco Spaces</text>
<rect x="255" y="220" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">Switch + PoE</text>
<rect x="490" y="220" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="555" y="247" text-anchor="middle" class="svg-ink" font-size="13">NTP + PKI</text>
<line x1="150" y1="50" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="50" x2="380" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="240" x2="260" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="320" y1="220" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="490" y1="240" x2="380" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Orange = needed by every new client. Purple = optional or cloud service. Grey = platform services. Solid lines are hard dependencies; the dashed line is a soft dependency.</p></div>

<h3>PoE and power redundancy</h3>
<p>Power over Ethernet fails more quietly than a link. Add up the <b>worst-case</b> power per AP class, not the average. An AP drawing 30 W on 24 ports needs 720 W. If the switch has two supplies in a redundant arrangement, find out what the PoE budget is with <i>one</i> supply left, because that is the number that matters in a failure. The switch gives power on a first-come basis when it restarts; use PoE port priority so that critical APs power first.</p>
<pre class="code"><span class="c">! give library APs priority on the access switch</span>
interface range GigabitEthernet1/0/1 - 24
 power inline port priority high</pre>
<div class="eg"><p><b>Budget check.</b> 24 APs at 30 W worst case = 720 W. A switch with a 740 W budget works only while both supplies are healthy. With one supply it may offer around 370 W, enough for 12 APs. Harlow's 14-of-24 result matches this. Fix: move to switches with a larger budget, spread APs across two switches, and put the supplies on separate UPS feeds. Always check the real figures for your model.</p></div>

<h3>Dependency failure analysis</h3>
<table class="cmp"><tr><th>Service</th><th>Existing clients</th><th>New clients</th><th>Mitigation</th></tr>
<tr><td>DHCP</td><td>Keep their lease</td><td>Fail to get an address</td><td>Two servers, scope sized for peak, short lease for guests</td></tr>
<tr><td>DNS</td><td>Cached names work, then fail</td><td>Name lookups and some portals fail</td><td>Two resolvers on different paths; AP discovery by DNS also needs it</td></tr>
<tr><td>AAA / RADIUS</td><td>Fine until re-authentication or session timeout</td><td>802.1X fails</td><td>Two or more servers, dead-server detection, sensible timeouts</td></tr>
<tr><td>Cisco Spaces</td><td>Continue unless portal-bound</td><td>Portal login fails</td><td>Keep staff SSIDs independent; design an outage mode for guests</td></tr>
<tr><td>NTP or PKI</td><td>Often fine</td><td>Certificates fail when clocks drift</td><td>Redundant NTP, monitored certificate expiry</td></tr>
</table>
<pre class="code"><span class="c">! detect a dead RADIUS server quickly and skip it</span>
radius-server dead-criteria time 10 tries 3
radius-server deadtime 5</pre>
<pre class="out">Harlow-WLC#show aaa servers
RADIUS: id 1, priority 1, host 192.0.2.10, auth-port 1812, acct-port 1813
     <span class="hl">State: current DEAD, duration 312s, previous duration 41200s</span>
RADIUS: id 2, priority 2, host 192.0.2.11, auth-port 1812, acct-port 1813
     State: current UP, duration 41200s, previous duration 0s</pre>

<h3>The chosen design</h3>
<p>Each floor gets two access switches, with the APs alternated between them. Each switch has two supplies on different UPS feeds and PoE budget for all APs on one supply. The controller port channel is split across the two core switches. Two DHCP servers share the scope, the library scope is enlarged to the peak, and guest leases are shortened. The RADIUS list has two servers with dead-server detection. The guest portal has a documented outage mode, and exam and staff SSIDs never rely on Spaces.</p>

<div class="warn"><p><b>Post-mortem.</b> The three failures were all single points the design never listed. A written dependency table, reviewed with the customer, would have turned each into a known and tested risk.</p></div>
<div class="exam"><p><b>Exam traps.</b> AireOS LAG has no LACP; the 9800 does. A LAG split across two physically separate non-stacked switches is not supported without a logical-switch pair. Existing clients survive DHCP loss, new clients do not.</p></div>

<div class="scn"><h4>The silent session timeout</h4><p>At an engineering firm, RADIUS went down at 08:00. Nothing happened until about 09:00, when laptops started dropping one by one as their session timers expired and re-authentication failed. The team had a single RADIUS server and a 60 minute session timeout. They added a second server and tuned timers.</p><p><b>Lesson:</b> a failure may show up long after the cause. Design and test for the re-authentication moment.</p></div>

<div class="iv"><p class="q">"How would you check a wireless design for single points of failure?"</p><p>Strong answer: draw every dependency (controller, uplinks, switches, PoE and power, DHCP, DNS, AAA, cloud services, NTP and PKI), mark what each failure does to existing and new clients, and add a second path or an outage mode for each hard dependency. Then test by really failing them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split controller port channels across two switches that behave as one logical switch.</li>
<li>Make the AP cell redundant by alternating APs between switches.</li>
<li>Plan PoE for worst-case draw and for one failed supply.</li>
<li>Existing clients usually survive a service failure; new clients and re-authentication do not.</li>
<li>Keep staff and exam SSIDs independent of cloud services.</li>
</ul></div>
`,hi:`
<h3>Case: Harlow University library</h3>
<p>Harlow University ki chaar manzil ki library exam week mein 3,500 students ko host karti hai. Design review mein controller ki koi problem nahi mili: 9800 SSO pair healthy hai. Phir bhi pehli exam shaam teen alag cheezein toot gayeen. Power dip se floor-2 switch reboot hua, aur uske 24 mein se sirf 14 APs wapas aaye kyunki PoE budget exceed ho gaya. DHCP server ke library scope ke addresses khatam ho gaye. Aur guest portal, jo cloud service par depend karta hai, 20 minute jawab nahi diya. Har baar students ne Wi-Fi ko blame kiya.</p>
<p>Seekh yeh hai ki wireless design utna hi resilient hota hai jitni uski sabse kamzor dependency. Yeh chapter sikhata hai ki students se pehle inhe kaise dhoondhein.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Ek switch, power supply ya link failure poori floor ko offline na kare.</li>
<li>Exam-week capacity: 3,500 devices, kai ke paas do-teen connections.</li>
<li>Staff aur exam systems guest portal ya kisi cloud service par depend na karein.</li>
<li>Budget har floor par doosra switch allow karta hai, doosra cabling system nahi.</li>
</ul>

<h3>Resilient wired uplinks</h3>
<p><b>Controller uplinks.</b> Controller ko network se port channel (LAG, link aggregation group) se jodo taaki ek link ya switch-port failure controller ko na tode. AireOS controllers LAG sirf static "on" mode mein support karte hain, LACP ke bina, aur saare ports ek hi bundle mein hote hain. Catalyst 9800 LACP, PAgP ya static mode ke saath port channels support karta hai. Poore switch failure se bachne ke liye members ko do aise switches par baanto jo ek logical switch ki tarah kaam karte hain (stack, StackWise Virtual ya VSS). SSO pair mein har unit dono switches se judti hai.</p>
<p><b>AP uplinks.</b> AP ka aam taur par ek hi wired link hota hai. Ek AP ka cable redundant nahi bana sakte, isliye <i>cell</i> ko redundant banate hain. Ek area ke APs ko do access switches ke beech alternate karo, taaki ek switch jaane par har doosra AP zinda rahe. Pichhle chapter ke N-1 coverage rule ke saath yeh voice aur data ko kam capacity par bhi usable rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Wireless network ki dependencies">
<rect x="250" y="110" width="140" height="60" rx="12" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">WLC SSO pair</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">+ AP aur clients</text>
<rect x="20" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text>
<rect x="255" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">DNS</text>
<rect x="490" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">AAA / RADIUS</text>
<rect x="20" y="220" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="85" y="247" text-anchor="middle" class="svg-ink" font-size="13">Cisco Spaces</text>
<rect x="255" y="220" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">Switch + PoE</text>
<rect x="490" y="220" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="555" y="247" text-anchor="middle" class="svg-ink" font-size="13">NTP + PKI</text>
<line x1="150" y1="50" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="50" x2="380" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="240" x2="260" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="320" y1="220" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="490" y1="240" x2="380" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Orange = har naye client ko chahiye. Purple = optional ya cloud service. Grey = platform services. Solid lines hard dependency hain; dashed line soft dependency.</p></div>

<h3>PoE aur power redundancy</h3>
<p>Power over Ethernet link se zyada chupke se fail hota hai. Har AP class ka <b>worst-case</b> power jodo, average nahi. 24 ports par 30 W wala AP 720 W maangta hai. Agar switch mein redundant arrangement mein do supplies hain, to pata karo ki <i>ek</i> supply bachne par PoE budget kitna hai, kyunki failure mein wahi number matter karta hai. Restart par switch first-come basis par power deta hai; PoE port priority use karo taaki critical APs pehle power hon.</p>
<pre class="code"><span class="c">! access switch par library APs ko priority do</span>
interface range GigabitEthernet1/0/1 - 24
 power inline port priority high</pre>
<div class="eg"><p><b>Budget check.</b> Worst case 24 APs x 30 W = 720 W. 740 W budget wala switch tabhi chalta hai jab dono supplies healthy hon. Ek supply par woh lagbhag 370 W de sakta hai, jo 12 APs ke liye kaafi hai. Harlow ka 24 mein se 14 wala result isi se match karta hai. Fix: bade budget wale switches, APs ko do switches par baantna, aur supplies ko alag UPS feeds par lagana. Apne model ke asli figures hamesha check karo.</p></div>

<h3>Dependency failure analysis</h3>
<table class="cmp"><tr><th>Service</th><th>Existing clients</th><th>Naye clients</th><th>Mitigation</th></tr>
<tr><td>DHCP</td><td>Lease rakhte hain</td><td>Address nahi milta</td><td>Do servers, peak ke hisaab se scope, guests ke liye short lease</td></tr>
<tr><td>DNS</td><td>Cached names chalte hain, phir fail</td><td>Name lookups aur kuch portals fail</td><td>Alag paths par do resolvers; DNS se AP discovery ko bhi yeh chahiye</td></tr>
<tr><td>AAA / RADIUS</td><td>Re-authentication ya session timeout tak theek</td><td>802.1X fail</td><td>Do ya zyada servers, dead-server detection, sahi timeouts</td></tr>
<tr><td>Cisco Spaces</td><td>Portal-bound na hon to chalte hain</td><td>Portal login fail</td><td>Staff SSIDs independent rakho; guests ke liye outage mode design karo</td></tr>
<tr><td>NTP ya PKI</td><td>Aksar theek</td><td>Clock drift hone par certificates fail</td><td>Redundant NTP, certificate expiry monitor</td></tr>
</table>
<pre class="code"><span class="c">! dead RADIUS server ko jaldi detect karke skip karo</span>
radius-server dead-criteria time 10 tries 3
radius-server deadtime 5</pre>
<pre class="out">Harlow-WLC#show aaa servers
RADIUS: id 1, priority 1, host 192.0.2.10, auth-port 1812, acct-port 1813
     <span class="hl">State: current DEAD, duration 312s, previous duration 41200s</span>
RADIUS: id 2, priority 2, host 192.0.2.11, auth-port 1812, acct-port 1813
     State: current UP, duration 41200s, previous duration 0s</pre>

<h3>Chosen design</h3>
<p>Har floor ko do access switches milte hain, APs unke beech alternate. Har switch ki do supplies alag UPS feeds par, aur ek supply par saare APs ka PoE budget. Controller port channel do core switches mein split hai. Do DHCP servers scope share karte hain, library scope peak tak badhaya gaya, aur guest leases short hain. RADIUS list mein dead-server detection ke saath do servers hain. Guest portal ka documented outage mode hai, aur exam aur staff SSIDs kabhi Spaces par depend nahi karte.</p>

<div class="warn"><p><b>Post-mortem.</b> Teeno failures aise single points the jo design ne kabhi list nahi kiye. Customer ke saath review hui ek written dependency table har ek ko known aur tested risk bana deti.</p></div>
<div class="exam"><p><b>Exam traps.</b> AireOS LAG mein LACP nahi hota; 9800 mein hota hai. Do physically alag non-stacked switches par split LAG logical-switch pair ke bina supported nahi. DHCP loss mein existing clients bachte hain, naye nahi.</p></div>

<div class="scn"><h4>Chupa hua session timeout</h4><p>Ek engineering firm mein RADIUS 08:00 baje down hua. Lagbhag 09:00 tak kuch nahi hua, phir laptops ek ek karke girne lage jaise unke session timers khatam hue aur re-authentication fail hui. Team ke paas ek hi RADIUS server tha aur 60 minute ka session timeout. Unhone doosra server joda aur timers tune kiye.</p><p><b>Seekh:</b> failure uske cause ke kaafi baad dikh sakta hai. Re-authentication ke moment ke liye design aur test karo.</p></div>

<div class="iv"><p class="q">"Wireless design mein single points of failure kaise check karoge?"</p><p>Strong answer: har dependency draw karo (controller, uplinks, switches, PoE aur power, DHCP, DNS, AAA, cloud services, NTP aur PKI), mark karo ki har failure existing aur new clients par kya karti hai, aur har hard dependency ke liye doosra path ya outage mode jodo. Phir sach mein fail karke test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller port channels ko do aise switches par split karo jo ek logical switch ki tarah behave karein.</li>
<li>APs ko switches ke beech alternate karke AP cell redundant banao.</li>
<li>PoE ko worst-case draw aur ek failed supply ke liye plan karo.</li>
<li>Service failure mein existing clients aam taur par bachte hain; naye clients aur re-authentication nahi.</li>
<li>Staff aur exam SSIDs ko cloud services se independent rakho.</li>
</ul></div>
`}};export{e as default};