var e={id:`snooping-design`,h:{en:`Snooping design: the querier, mixed versions, unknown multicast and leave latency`,hi:`Snooping design: querier, mixed versions, unknown multicast aur leave latency`},body:{en:`
<p>Switching snooping on is easy. Designing it so that it still works after five minutes, after a spanning-tree change and after someone adds an old set-top box is the real skill. This chapter lists the four design issues that cause most snooping tickets. As in chapter 6, the outputs are written examples from a Catalyst-class switch and a Junos EX; the lab simulator does not run snooping.</p>

<h3>Issue 1: a VLAN with no querier</h3>
<p>Remember how membership stays alive: hosts send one unsolicited report when they join, and then they only answer <b>queries</b>. A snooping switch ages out a member port if it has not heard a report within the membership timeout. If nobody in the VLAN sends queries, the port expires and the stream silently stops.</p>
<p>This happens in a VLAN that has no multicast router interface: for example a video wall VLAN where an encoder and the decoders are all on the same switch, with no SVI or router port running PIM.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Membership timeline without a querier">
<line x1="30" y1="120" x2="610" y2="120" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="120" r="7" fill="#22c55e"/><text x="60" y="148" text-anchor="middle" class="svg-ink" font-size="12">0 s</text><text x="60" y="165" text-anchor="middle" class="svg-muted" font-size="11">host joins</text>
<rect x="60" y="85" width="340" height="24" rx="4" fill="#bbf7d0"/><text x="230" y="102" text-anchor="middle" class="svg-ink" font-size="12">stream flows (member timer running)</text>
<circle cx="400" cy="120" r="7" fill="#ef4444"/><text x="400" y="148" text-anchor="middle" class="svg-ink" font-size="12">about 4 min</text><text x="400" y="165" text-anchor="middle" class="svg-muted" font-size="11">timer expires, no query came</text>
<rect x="400" y="85" width="200" height="24" rx="4" fill="#fecaca"/><text x="500" y="102" text-anchor="middle" class="svg-ink" font-size="12">port removed: stream stops</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">No querier means nobody asks, so nobody re-reports</text>
</svg><p class="cap">The classic symptom: it works at first, then dies after a few minutes, and a reboot of the receiver brings it back for the same few minutes.</p></div>
<p>The cure is a <b>snooping querier</b>: the switch itself sends general queries on behalf of a router. On a Catalyst-class IOS XE switch:</p>
<pre class="code">ip igmp snooping querier
ip igmp snooping querier address 10.50.0.254
ip igmp snooping vlan 50 querier
ip igmp snooping vlan 50 querier address 10.50.0.254</pre>
<pre class="out">SW1#show ip igmp snooping querier vlan 50
Vlan      IP Address               IGMP Version   Port
-------------------------------------------------------------
50        10.50.0.254              v2             <span class="hl">Switch</span></pre>
<div class="note"><p><b>Junos note.</b> The same job on an EX switch: <code>set protocols igmp-snooping vlan WALL l2-querier source-address 10.50.0.254</code>.</p></div>
<p>If a real router is also on the VLAN, the usual election applies: the <b>lowest source IP address</b> wins, so a router with a lower address silences the switch querier, and the switch's querier becomes active again if the router disappears. Give the switch querier an address that is unused and in the VLAN subnet.</p>

<h3>Issue 2: mixed IGMP versions</h3>
<p>The IGMP version that the querier speaks decides what the hosts do (chapter 4). A switch querier defaults to v2, so v3 receivers fall back to v2 and an SSM channel cannot be requested. If a LAN needs v3, the router (or the switch querier, where supported) must speak v3, and every switch in the path must be able to snoop v3 reports. Many access switches snoop v3 only "basically": they forward by group and ignore the source list. That is fine for ASM; for SSM it means the router still filters correctly, but the switch may forward more than strictly needed. Document what your platform does.</p>

<h3>Issue 3: unknown multicast and receivers that never send IGMP</h3>
<p>With snooping on, data for a group that has <b>no</b> members is not flooded; it is sent only to the mrouter ports (or dropped, depending on platform and setting). That is the point of snooping. The side effect: equipment that receives multicast <b>without ever sending an IGMP report</b> (some older IPTV set-top boxes, audio-over-IP devices, industrial gear, devices behind a failed NIC driver) gets nothing, because it never became a member.</p>
<p>Three fixes, in order of preference: make the device send IGMP (firmware or setting); add a static entry on the switch (<code>ip igmp snooping vlan 20 static 239.20.1.50 interface GigabitEthernet1/0/5</code>); or disable snooping for that VLAN and accept flooding. Also remember that control groups in 224.0.0.0/24 are always flooded, and that groups whose MAC overlaps link-local (chapter 2) are flooded too.</p>

<h3>Issue 4: leave latency and topology changes</h3>
<ul>
<li><b>Leave latency.</b> After a v2 leave, the switch sends group-specific queries before removing the port (last member query count x interval, default 2 x 1 s). During that time the stream still flows. With <code>immediate-leave</code> the delay is zero, but only for ports with one host. A fast channel-zapping IPTV access port (one set-top box per port) is the standard case for immediate leave.</li>
<li><b>Topology changes.</b> When spanning tree changes, many switches flush or flood multicast until entries are relearned, and reports are not repeated until the next query. A <b>TCN query solicit</b> option makes the switch send a general query at once so members re-report in seconds instead of minutes.</li>
</ul>

<h3>A design checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Why</th></tr>
<tr><td>Every snooping VLAN has exactly one active querier (router or switch)</td><td>Entries stay alive; no duplicate queries</td></tr>
<tr><td>Same IGMP version on the router, the switch querier and hosts that need it</td><td>Predictable fallback, SSM possible</td></tr>
<tr><td>Immediate leave only on single-host access ports</td><td>Fast zapping without cutting a second host</td></tr>
<tr><td>Group plan avoids .0.0.x and .128.0.x endings</td><td>Those groups are flooded despite snooping</td></tr>
<tr><td>Static entries documented for IGMP-less devices</td><td>No mystery forwarding</td></tr>
<tr><td>Test after every spanning-tree or uplink change</td><td>Confirm re-learning</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Turning on snooping on a VLAN with a source and receivers and no router, and forgetting the querier. Configuring a switch querier with the same address as a router's SVI. Using immediate leave toward an access point or an unmanaged switch. Adding a static snooping entry and forgetting it exists after the device is removed.</p></div>
<div class="exam"><p><b>Exam trap.</b> A snooping querier replaces a router's queries only in a VLAN without a multicast router; with a router the lowest IP wins. Snooping does not need PIM, but it needs queries. Immediate leave only works safely with one host per port. Membership expires if no report follows a missing query.</p></div>

<div class="scn"><h4>The warehouse video wall that blinked out</h4><p>Zenith Logistics put a camera encoder and eight wall decoders in one VLAN on a single switch, with no router interface. The wall worked in the morning demo and went black about four minutes later, every time. Restarting a decoder brought its tile back for another four minutes. Nobody was sending queries, so the switch aged out the members. One configuration of a snooping querier with an unused address in the VLAN fixed it, and the wall has run for months.</p><p><b>Lesson:</b> snooping without a querier is a timer bomb. If a symptom has a fixed period, think about timers first.</p></div>

<div class="iv"><p class="q">"A multicast stream in a single VLAN works for a few minutes and then stops. What do you suspect?"</p><p>Strong answer: IGMP snooping without a querier. With no multicast router in the VLAN nobody sends general queries, so the hosts never refresh their membership and the switch ages the ports out. I would check the snooping querier output, then configure a switch querier with an unused address in the subnet (or on Junos, an l2-querier source address). I would also mention checking the IGMP version the querier uses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snooping needs queries: on a VLAN without a router, configure a switch querier.</li>
<li>Fixed-period failures point to timers: membership expiry, missing queries.</li>
<li>The querier's IGMP version decides what hosts do; SSM needs v3 end to end.</li>
<li>Devices that never send IGMP need static entries or a non-snooping VLAN.</li>
<li>Immediate leave is for single-host access ports only; use TCN query solicit to recover after spanning-tree changes.</li>
</ul></div>
`,hi:`
<p>Snooping on karna aasaan hai. Asli skill hai use aise design karna ki woh paanch minute baad, spanning-tree change ke baad aur kisi ke purana set-top box jodne ke baad bhi chalti rahe. Yeh chapter woh chaar design issues batata hai jinse zyadatar snooping tickets aate hain. Chapter 6 ki tarah outputs Catalyst-class switch aur Junos EX ke likhe hue examples hain; lab simulator snooping nahi chalata.</p>

<h3>Issue 1: aisi VLAN jismein querier nahi hai</h3>
<p>Yaad karo membership zinda kaise rehti hai: join karte waqt host ek unsolicited report bhejta hai, phir woh sirf <b>queries</b> ka jawab deta hai. Snooping switch member port ko age out kar deta hai agar membership timeout ke andar report na sune. Agar VLAN mein koi queries nahi bhejta, to port expire ho jaata hai aur stream chupchaap ruk jaati hai.</p>
<p>Yeh aisi VLAN mein hota hai jismein multicast router interface nahi hota: jaise video wall VLAN jahan encoder aur decoders ek hi switch par hain, bina kisi SVI ya PIM chalane wale router port ke.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Querier ke bina membership timeline">
<line x1="30" y1="120" x2="610" y2="120" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="120" r="7" fill="#22c55e"/><text x="60" y="148" text-anchor="middle" class="svg-ink" font-size="12">0 s</text><text x="60" y="165" text-anchor="middle" class="svg-muted" font-size="11">host join karta hai</text>
<rect x="60" y="85" width="340" height="24" rx="4" fill="#bbf7d0"/><text x="230" y="102" text-anchor="middle" class="svg-ink" font-size="12">stream chal rahi hai (member timer chalu)</text>
<circle cx="400" cy="120" r="7" fill="#ef4444"/><text x="400" y="148" text-anchor="middle" class="svg-ink" font-size="12">lagbhag 4 min</text><text x="400" y="165" text-anchor="middle" class="svg-muted" font-size="11">timer expire, query nahi aayi</text>
<rect x="400" y="85" width="200" height="24" rx="4" fill="#fecaca"/><text x="500" y="102" text-anchor="middle" class="svg-ink" font-size="12">port hata: stream ruk gayi</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Querier nahi to koi poochta nahi, isliye koi dobara report nahi karta</text>
</svg><p class="cap">Classic symptom: shuru mein chalti hai, phir kuch minute baad band ho jaati hai, aur receiver reboot karne par utne hi minute ke liye wapas aa jaati hai.</p></div>
<p>Ilaaj hai <b>snooping querier</b>: switch khud router ki taraf se general queries bhejta hai. Catalyst-class IOS XE switch par:</p>
<pre class="code">ip igmp snooping querier
ip igmp snooping querier address 10.50.0.254
ip igmp snooping vlan 50 querier
ip igmp snooping vlan 50 querier address 10.50.0.254</pre>
<pre class="out">SW1#show ip igmp snooping querier vlan 50
Vlan      IP Address               IGMP Version   Port
-------------------------------------------------------------
50        10.50.0.254              v2             <span class="hl">Switch</span></pre>
<div class="note"><p><b>Junos note.</b> EX switch par yahi kaam: <code>set protocols igmp-snooping vlan WALL l2-querier source-address 10.50.0.254</code>.</p></div>
<p>Agar VLAN par asli router bhi hai, to wahi election chalta hai: <b>lowest source IP address</b> jeetta hai, isliye chhote address wala router switch querier ko chup kara deta hai, aur router gayab ho to switch ka querier wapas active ho jaata hai. Switch querier ko aisa address do jo unused ho aur VLAN subnet ka ho.</p>

<h3>Issue 2: mixed IGMP versions</h3>
<p>Querier jo IGMP version bolta hai wahi decide karta hai ki hosts kya karenge (chapter 4). Switch querier default mein v2 hota hai, isliye v3 receivers v2 par fall back hote hain aur SSM channel maangi nahi ja sakti. Agar LAN ko v3 chahiye, to router (ya jahan supported ho wahan switch querier) ko v3 bolna hoga, aur raaste ke har switch ko v3 reports snoop karne aane chahiye. Kai access switches v3 ko sirf "basically" snoop karte hain: group ke hisaab se forward karte hain aur source list ignore karte hain. ASM ke liye theek hai; SSM ke liye router phir bhi sahi filter karta hai, par switch zaroorat se zyada forward kar sakta hai. Aapka platform kya karta hai yeh document karo.</p>

<h3>Issue 3: unknown multicast aur woh receivers jo IGMP nahi bhejte</h3>
<p>Snooping on hone par jis group ka <b>koi member nahi</b> uska data flood nahi hota; woh sirf mrouter ports par jaata hai (ya platform aur setting ke hisaab se drop hota hai). Snooping ka maqsad yahi hai. Side effect: jo equipment multicast <b>bina kabhi IGMP report bheje</b> receive karta hai (kuch purane IPTV set-top boxes, audio-over-IP devices, industrial gear, kharab NIC driver wale devices) use kuch nahi milta, kyunki woh kabhi member bana hi nahi.</p>
<p>Teen fixes, pasand ke order mein: device ko IGMP bhejne wala banao (firmware ya setting); switch par static entry jodo (<code>ip igmp snooping vlan 20 static 239.20.1.50 interface GigabitEthernet1/0/5</code>); ya us VLAN par snooping disable karke flooding accept karo. Yeh bhi yaad rakho ki 224.0.0.0/24 ke control groups hamesha flood hote hain, aur jin groups ka MAC link-local se overlap karta hai (chapter 2) woh bhi flood hote hain.</p>

<h3>Issue 4: leave latency aur topology changes</h3>
<ul>
<li><b>Leave latency.</b> v2 leave ke baad switch port hatane se pehle group-specific queries bhejta hai (last member query count x interval, default 2 x 1 s). Is dauran stream bahti rehti hai. <code>immediate-leave</code> se delay zero hota hai, par sirf ek host wale ports ke liye. Fast channel-zapping wala IPTV access port (har port par ek set-top box) immediate leave ka standard case hai.</li>
<li><b>Topology changes.</b> Spanning tree badalne par kai switches multicast ko flush ya flood karte hain jab tak entries dobara seekhi na jaayein, aur agli query tak reports repeat nahi hote. <b>TCN query solicit</b> option switch ko turant general query bhejne deta hai taaki members minutes ke bajaye seconds mein dobara report karein.</li>
</ul>

<h3>Design checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Kyun</th></tr>
<tr><td>Har snooping VLAN mein theek ek active querier (router ya switch)</td><td>Entries zinda rehti hain; duplicate queries nahi</td></tr>
<tr><td>Router, switch querier aur jin hosts ko chahiye unpar same IGMP version</td><td>Predictable fallback, SSM possible</td></tr>
<tr><td>Immediate leave sirf single-host access ports par</td><td>Doosre host ko kaate bina fast zapping</td></tr>
<tr><td>Group plan mein .0.0.x aur .128.0.x endings nahi</td><td>Woh groups snooping ke bawajood flood hote hain</td></tr>
<tr><td>IGMP-less devices ke liye static entries documented</td><td>Koi mystery forwarding nahi</td></tr>
<tr><td>Har spanning-tree ya uplink change ke baad test</td><td>Re-learning confirm karne ke liye</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Aisi VLAN par snooping on karna jismein source aur receivers hain par router nahi, aur querier bhool jaana. Switch querier ko router ke SVI wala hi address dena. Access point ya unmanaged switch ki taraf immediate leave use karna. Static snooping entry jodkar bhool jaana jab device hat chuka ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Snooping querier router ki queries sirf aisi VLAN mein replace karta hai jahan multicast router nahi hai; router ho to lowest IP jeetta hai. Snooping ko PIM nahi chahiye, par queries chahiye. Immediate leave sirf ek host per port par safe hai. Query missing ho aur report na aaye to membership expire ho jaati hai.</p></div>

<div class="scn"><h4>Warehouse ki video wall jo band ho jaati thi</h4><p>Zenith Logistics ne ek camera encoder aur aath wall decoders ek hi switch ki ek VLAN mein rakhe, bina kisi router interface ke. Subah ke demo mein wall chali aur lagbhag chaar minute baad har baar kaali ho gayi. Decoder restart karne par uski tile agle chaar minute ke liye wapas aa jaati thi. Koi queries nahi bhej raha tha, isliye switch ne members ko age out kar diya. VLAN mein ek unused address ke saath snooping querier configure karne se theek ho gaya, aur wall ab mahino se chal rahi hai.</p><p><b>Lesson:</b> querier ke bina snooping ek timer bomb hai. Agar symptom ka fixed period hai, to pehle timers ke baare mein socho.</p></div>

<div class="iv"><p class="q">"Ek VLAN mein multicast stream kuch minute chalti hai phir ruk jaati hai. Aapko kis par shak hoga?"</p><p>Strong answer: querier ke bina IGMP snooping. VLAN mein multicast router nahi hai to koi general queries nahi bhejta, isliye hosts apni membership refresh nahi karte aur switch ports ko age out kar deta hai. Main snooping querier output check karunga, phir subnet ke unused address ke saath switch querier configure karunga (ya Junos par l2-querier source address). Main querier jo IGMP version use karta hai woh bhi check karne ki baat karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snooping ko queries chahiye: router-less VLAN mein switch querier configure karo.</li>
<li>Fixed-period failures timers ki taraf ishara karti hain: membership expiry, missing queries.</li>
<li>Querier ka IGMP version decide karta hai ki hosts kya karenge; SSM ko end-to-end v3 chahiye.</li>
<li>Jo devices IGMP nahi bhejte unhe static entries ya non-snooping VLAN chahiye.</li>
<li>Immediate leave sirf single-host access ports ke liye hai; spanning-tree changes ke baad recover karne ke liye TCN query solicit use karo.</li>
</ul></div>
`}};export{e as default};