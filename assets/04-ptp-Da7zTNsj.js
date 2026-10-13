var e={id:`ptp`,h:{en:`PTP (IEEE 1588): grandmaster, BMCA, boundary and transparent clocks`,hi:`PTP (IEEE 1588): grandmaster, BMCA, boundary aur transparent clocks`},body:{en:`
<p>NTP is like setting your watch from the station clock by shouting across the platform: good to within a few milliseconds, and the echo of the crowd (network queues) adds error you cannot see. Now imagine an orchestra. Every violinist must start the note within a microsecond of the others, or the sound smears. Shouting will not do; the conductor needs a system where every relay point measures and removes its own delay. That system is the <b>Precision Time Protocol, PTP</b>, defined in <b>IEEE 1588</b> (version 2, 1588-2008, updated as 1588-2019).</p>

<h3>Why sub-microsecond matters</h3>
<ul>
<li><b>Financial trading</b>: regulators require trade timestamps traceable to UTC within 100 microseconds or better.</li>
<li><b>Mobile networks</b>: 4G/5G radios need phase alignment within about 1.5 microseconds so neighbouring cells do not interfere.</li>
<li><b>Power grid substations and industrial automation</b>: synchronised sampling of currents and motion control.</li>
<li><b>Broadcast and pro audio/video over IP</b>: every camera and microphone sample lines up (AES67, SMPTE 2110).</li>
</ul>
<p>NTP typically gives around a millisecond on a LAN and tens of milliseconds across a WAN, because it timestamps in software and cannot see switch queuing. PTP gets to tens of nanoseconds with two ideas: <b>hardware timestamping</b> at the port (the exact moment the frame hits the wire) and <b>network devices that correct for their own delay</b>.</p>

<h3>Roles and the message exchange</h3>
<dl class="terms">
<dt>Grandmaster (GM)</dt><dd>The best clock in the PTP domain, usually GPS/GNSS-fed. The root of the time tree.</dd>
<dt>Ordinary clock</dt><dd>A device with one PTP port: either a grandmaster or an end slave, such as a server NIC or a radio unit.</dd>
<dt>Boundary clock (BC)</dt><dd>A switch or router that terminates PTP: slave on one port toward the GM, master on all its other ports. Every hop resets the error.</dd>
<dt>Transparent clock (TC)</dt><dd>A switch that forwards PTP messages but measures how long each one sat inside it (the <b>residence time</b>) and adds it to the message's <b>correctionField</b>. End-to-end TC corrects Sync/Delay messages; peer-to-peer TC also measures each link's delay.</dd>
<dt>Domain</dt><dd>A number (0 to 127 for the default profile) that separates independent PTP time trees on the same network.</dd>
</dl>
<p>The delay request-response exchange: the master sends <b>Sync</b> at t1 (in two-step mode, t1 follows in a <b>Follow_Up</b>); the slave receives it at t2; the slave sends <b>Delay_Req</b> at t3; the master answers with <b>Delay_Resp</b> carrying t4. Then mean path delay = ((t2 - t1) + (t4 - t3)) / 2 and offset from master = (t2 - t1) - mean path delay. The peer delay mechanism uses <b>Pdelay_Req/Pdelay_Resp</b> between neighbours instead. Event messages use UDP 319, general messages UDP 320, or PTP runs directly over Ethernet with EtherType 0x88F7.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PTP clock types">
<rect x="20" y="90" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Grandmaster</text><text x="80" y="129" text-anchor="middle" class="svg-muted" font-size="12">GNSS, prio1 100</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">Boundary clock</text><text x="260" y="129" text-anchor="middle" class="svg-muted" font-size="12">slave | master</text>
<rect x="380" y="90" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="440" y="112" text-anchor="middle" class="svg-ink" font-size="13">Transparent</text><text x="440" y="129" text-anchor="middle" class="svg-muted" font-size="12">adds residence</text>
<rect x="540" y="90" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">Slave</text><text x="585" y="129" text-anchor="middle" class="svg-muted" font-size="12">server NIC</text>
<line x1="140" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="380" y2="115" stroke="#64748b" stroke-width="2"/><line x1="500" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="170" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync</text><text x="350" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync</text><text x="520" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync+corr</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">BC regenerates time; TC passes it through with a correction</text>
</svg><p class="cap">A boundary clock is a new master for the next hop; a transparent clock stays invisible but reports its queuing delay.</p></div>

<h3>The Best Master Clock Algorithm (BMCA)</h3>
<p>Every master-capable clock sends <b>Announce</b> messages describing its quality. Each port compares what it hears and decides whether to be master, slave or passive. The comparison order is: <b>priority1</b> (0 to 255, lower wins, default 128), <b>clockClass</b> (for example 6 = locked to GNSS, 248 = default/free-running), <b>clockAccuracy</b>, <b>offsetScaledLogVariance</b> (stability), <b>priority2</b>, and finally <b>clockIdentity</b> as the tie-breaker. It resembles an STP root election: administrators steer the result with priority1 and priority2, and the loser ports become slave or passive.</p>

<h3>Profiles</h3>
<p>1588 is a toolbox, so industries define <b>profiles</b> that fix the options: the <b>default profile</b>, <b>IEEE 802.1AS</b> (gPTP for Time Sensitive Networking and AVB), <b>ITU-T G.8275.1/G.8275.2</b> (telecom), <b>IEC 61850-9-3 and IEEE C37.238</b> (power), <b>SMPTE 2059-2</b> and <b>AES67</b> (media). Devices must run the same profile and domain to interoperate.</p>

<h3>Interpreting PTP on a Catalyst switch</h3>
<p>The exact syntax depends on platform and release, but a Catalyst access switch acting as a boundary clock looks like this:</p>
<pre class="code"><span class="c">! Catalyst 9300: boundary clock, default profile, domain 0</span>
ptp mode boundary delay-req
ptp domain 0
ptp priority1 128
ptp priority2 128
<span class="c">! (alternatives: ptp mode e2etransparent | ptp mode p2ptransparent)</span>
interface GigabitEthernet1/0/48
 description uplink toward grandmaster
 ptp enable</pre>
<pre class="out">SW-TRADE# show ptp clock
 PTP CLOCK INFO
<span class="hl">  PTP Device Type: Boundary clock</span>
  PTP Device Profile: Default Profile
  Clock Identity: 0x0:78:AB:FF:FE:12:34:56
  Clock Domain: 0
  Priority1: 128
  Priority2: 128
  Clock Quality:
        Class: 248
<span class="hl">  Offset From Master(ns): 42</span>
  Mean Path Delay(ns): 310
<span class="hl">  Steps Removed: 1</span></pre>
<p>Read it like this: the switch is a boundary clock in domain 0, it is one step from the grandmaster, and its offset is 42 nanoseconds. Class 248 is the switch's <i>own</i> quality (it is not a GNSS source), which is correct; <code>show ptp parent</code> would show the grandmaster's identity and class, and <code>show ptp port</code> lists which ports are MASTER, SLAVE or PASSIVE.</p>

<div class="eg"><p><b>Worked example.</b> Two grandmasters announce in domain 0. GM-A: priority1 128, class 6. GM-B: priority1 100, class 248 (lost its GPS antenna). BMCA compares priority1 first, so GM-B wins despite the worse class, and the whole trading floor follows a free-running clock. Setting both to priority1 128 would let clockClass decide and GM-A would win. This is why priority1 should be used deliberately, not as a random preference.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running PTP through switches that are neither boundary nor transparent clocks. They add variable queuing delay that PTP cannot see, and accuracy falls to NTP-like levels. Every hop in the path must be PTP-aware, and asymmetric links (different delay each way) must be compensated.</p></div>

<div class="exam"><p><b>Exam trap.</b> Boundary clocks <i>terminate</i> PTP and act as master downstream; transparent clocks <i>do not</i>, they only update the correctionField. The grandmaster is chosen by BMCA from Announce messages, not configured with a "grandmaster" command on the slaves. NTP uses UDP 123; PTP uses UDP 319/320 or EtherType 0x88F7.</p></div>

<div class="scn"><h4>The 5G cells that interfered at noon</h4><p>A mobile operator saw interference alarms between neighbouring cells every day around noon. The radios' PTP offset was fine at night but jumped to several microseconds at peak traffic. The aggregation switches in the path were ordinary switches with deep buffers, so Sync messages waited behind user traffic. Replacing them with PTP-aware switches running as boundary clocks under the telecom profile kept offset below 100 nanoseconds at any load.</p><p><b>Lesson:</b> PTP accuracy depends on every hop removing its own delay; one non-aware switch breaks the chain.</p></div>

<div class="iv"><p class="q">"How is PTP more accurate than NTP?"</p><p>Give three reasons: hardware timestamping at the PHY or ASIC instead of software timestamps, boundary and transparent clocks that remove switch residence and queuing delay, and a faster message rate. Then name the roles (grandmaster elected by BMCA, boundary, transparent, ordinary clocks), the Sync/Follow_Up/Delay_Req/Delay_Resp exchange, and an example use case such as 5G or trading. A senior answer mentions profiles and path asymmetry.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PTP (IEEE 1588v2) targets sub-microsecond accuracy; NTP targets milliseconds.</li>
<li>Accuracy comes from hardware timestamping plus boundary or transparent clocks at every hop.</li>
<li>BMCA elects the grandmaster from Announce messages: priority1, clockClass, accuracy, variance, priority2, identity.</li>
<li>Messages: Sync, Follow_Up, Delay_Req, Delay_Resp (Pdelay for peer-to-peer); UDP 319/320 or EtherType 0x88F7.</li>
<li>show ptp clock / parent / port: device type, offset from master, steps removed, port states.</li>
</ul></div>
`,hi:`
<p>NTP aisa hai jaise platform ke paar chillaakar station ki ghadi se apni watch set karna: kuch milliseconds tak theek, aur bheed ki goonj (network queues) aisi galti jodti hai jo aapko dikhti nahi. Ab ek orchestra socho. Har violinist ko note doosron ke ek microsecond ke andar shuru karna hai, warna awaaz bikhar jaati hai. Chillaane se kaam nahi chalega; conductor ko aisa system chahiye jahan har relay point apna delay naap kar hata de. Woh system <b>Precision Time Protocol, PTP</b> hai, jo <b>IEEE 1588</b> mein define hai (version 2, 1588-2008, 1588-2019 ke roop mein update).</p>

<h3>Sub-microsecond kyun zaroori hai</h3>
<ul>
<li><b>Financial trading</b>: regulators trade timestamps ko UTC se 100 microseconds ya behtar ke andar traceable maangte hain.</li>
<li><b>Mobile networks</b>: 4G/5G radios ko lagbhag 1.5 microseconds ke andar phase alignment chahiye taaki padosi cells interfere na karein.</li>
<li><b>Power grid substations aur industrial automation</b>: currents ka synchronised sampling aur motion control.</li>
<li><b>Broadcast aur IP par pro audio/video</b>: har camera aur microphone sample line up hota hai (AES67, SMPTE 2110).</li>
</ul>
<p>NTP aam taur par LAN par lagbhag ek millisecond aur WAN par das-bees milliseconds deta hai, kyunki woh software mein timestamp karta hai aur switch queuing nahi dekh sakta. PTP do ideas se das nanoseconds tak pahunchta hai: port par <b>hardware timestamping</b> (bilkul woh pal jab frame wire par jaata hai) aur <b>network devices jo apna delay khud correct karte hain</b>.</p>

<h3>Roles aur message exchange</h3>
<dl class="terms">
<dt>Grandmaster (GM)</dt><dd>PTP domain ki sabse achhi clock, aam taur par GPS/GNSS se. Time tree ki root.</dd>
<dt>Ordinary clock</dt><dd>Ek PTP port wala device: ya to grandmaster ya end slave, jaise server NIC ya radio unit.</dd>
<dt>Boundary clock (BC)</dt><dd>Switch ya router jo PTP terminate karta hai: GM ki taraf ek port par slave, baaki saare ports par master. Har hop error reset karta hai.</dd>
<dt>Transparent clock (TC)</dt><dd>Switch jo PTP messages forward karta hai lekin naapta hai ki har message uske andar kitni der baitha (<b>residence time</b>) aur use message ke <b>correctionField</b> mein jodta hai. End-to-end TC Sync/Delay messages correct karta hai; peer-to-peer TC har link ka delay bhi naapta hai.</dd>
<dt>Domain</dt><dd>Ek number (default profile ke liye 0 se 127) jo same network par independent PTP time trees ko alag karta hai.</dd>
</dl>
<p>Delay request-response exchange: master t1 par <b>Sync</b> bhejta hai (two-step mode mein t1 <b>Follow_Up</b> mein aata hai); slave use t2 par receive karta hai; slave t3 par <b>Delay_Req</b> bhejta hai; master t4 ke saath <b>Delay_Resp</b> se jawab deta hai. Phir mean path delay = ((t2 - t1) + (t4 - t3)) / 2 aur offset from master = (t2 - t1) - mean path delay. Peer delay mechanism iski jagah neighbours ke beech <b>Pdelay_Req/Pdelay_Resp</b> use karta hai. Event messages UDP 319, general messages UDP 320 use karte hain, ya PTP seedha Ethernet par EtherType 0x88F7 ke saath chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PTP clock types">
<rect x="20" y="90" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Grandmaster</text><text x="80" y="129" text-anchor="middle" class="svg-muted" font-size="12">GNSS, prio1 100</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">Boundary clock</text><text x="260" y="129" text-anchor="middle" class="svg-muted" font-size="12">slave | master</text>
<rect x="380" y="90" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="440" y="112" text-anchor="middle" class="svg-ink" font-size="13">Transparent</text><text x="440" y="129" text-anchor="middle" class="svg-muted" font-size="12">residence jodta</text>
<rect x="540" y="90" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">Slave</text><text x="585" y="129" text-anchor="middle" class="svg-muted" font-size="12">server NIC</text>
<line x1="140" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="380" y2="115" stroke="#64748b" stroke-width="2"/><line x1="500" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="170" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync</text><text x="350" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync</text><text x="520" y="80" text-anchor="middle" class="svg-accent" font-size="12">Sync+corr</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">BC time dobara banata hai; TC correction ke saath aage bhejta hai</text>
</svg><p class="cap">Boundary clock agle hop ke liye naya master hai; transparent clock invisible rehta hai lekin apna queuing delay report karta hai.</p></div>

<h3>Best Master Clock Algorithm (BMCA)</h3>
<p>Har master-capable clock apni quality batane wale <b>Announce</b> messages bhejti hai. Har port jo sunta hai use compare karke tay karta hai ki master, slave ya passive bane. Comparison order hai: <b>priority1</b> (0 se 255, kam jeetta hai, default 128), <b>clockClass</b> (jaise 6 = GNSS se locked, 248 = default/free-running), <b>clockAccuracy</b>, <b>offsetScaledLogVariance</b> (stability), <b>priority2</b>, aur aakhir mein tie-breaker ke roop mein <b>clockIdentity</b>. Yeh STP root election jaisa hai: administrators priority1 aur priority2 se result steer karte hain, aur haarne wale ports slave ya passive bante hain.</p>

<h3>Profiles</h3>
<p>1588 ek toolbox hai, isliye industries <b>profiles</b> define karti hain jo options fix karte hain: <b>default profile</b>, <b>IEEE 802.1AS</b> (Time Sensitive Networking aur AVB ke liye gPTP), <b>ITU-T G.8275.1/G.8275.2</b> (telecom), <b>IEC 61850-9-3 aur IEEE C37.238</b> (power), <b>SMPTE 2059-2</b> aur <b>AES67</b> (media). Interoperate karne ke liye devices ko same profile aur domain chalana chahiye.</p>

<h3>Catalyst switch par PTP interpret karna</h3>
<p>Exact syntax platform aur release par depend karta hai, lekin boundary clock ki tarah kaam karta Catalyst access switch aisa dikhta hai:</p>
<pre class="code"><span class="c">! Catalyst 9300: boundary clock, default profile, domain 0</span>
ptp mode boundary delay-req
ptp domain 0
ptp priority1 128
ptp priority2 128
<span class="c">! (alternatives: ptp mode e2etransparent | ptp mode p2ptransparent)</span>
interface GigabitEthernet1/0/48
 description uplink toward grandmaster
 ptp enable</pre>
<pre class="out">SW-TRADE# show ptp clock
 PTP CLOCK INFO
<span class="hl">  PTP Device Type: Boundary clock</span>
  PTP Device Profile: Default Profile
  Clock Identity: 0x0:78:AB:FF:FE:12:34:56
  Clock Domain: 0
  Priority1: 128
  Priority2: 128
  Clock Quality:
        Class: 248
<span class="hl">  Offset From Master(ns): 42</span>
  Mean Path Delay(ns): 310
<span class="hl">  Steps Removed: 1</span></pre>
<p>Ise aise padho: switch domain 0 mein boundary clock hai, grandmaster se ek step door hai, aur uska offset 42 nanoseconds hai. Class 248 switch ki <i>apni</i> quality hai (woh GNSS source nahi hai), jo sahi hai; <code>show ptp parent</code> grandmaster ki identity aur class dikhayega, aur <code>show ptp port</code> list karta hai ki kaunse ports MASTER, SLAVE ya PASSIVE hain.</p>

<div class="eg"><p><b>Worked example.</b> Domain 0 mein do grandmasters announce karte hain. GM-A: priority1 128, class 6. GM-B: priority1 100, class 248 (uska GPS antenna chala gaya). BMCA pehle priority1 compare karta hai, to kharab class ke bawajood GM-B jeet-ta hai, aur poora trading floor free-running clock follow karta hai. Dono ko priority1 128 karne se clockClass decide karta aur GM-A jeet-ta. Isliye priority1 soch-samajhkar use karna chahiye, random preference ki tarah nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> PTP ko aise switches se chalaana jo na boundary hain na transparent clocks. Woh variable queuing delay jodte hain jo PTP nahi dekh sakta, aur accuracy NTP jaise level par gir jaati hai. Path ka har hop PTP-aware hona chahiye, aur asymmetric links (har direction mein alag delay) compensate hone chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Boundary clocks PTP ko <i>terminate</i> karke neeche ke liye master bante hain; transparent clocks <i>nahi</i>, woh sirf correctionField update karte hain. Grandmaster BMCA se Announce messages ke basis par chuna jaata hai, slaves par kisi "grandmaster" command se configure nahi hota. NTP UDP 123 use karta hai; PTP UDP 319/320 ya EtherType 0x88F7.</p></div>

<div class="scn"><h4>5G cells jo dopahar mein interfere karte the</h4><p>Ek mobile operator ko roz dopahar ke aas paas padosi cells ke beech interference alarms dikhte the. Radios ka PTP offset raat ko theek tha lekin peak traffic par kai microseconds tak kood jaata tha. Path ke aggregation switches deep buffers wale ordinary switches the, to Sync messages user traffic ke peeche intezaar karte the. Unhe telecom profile ke under boundary clocks ki tarah chalte PTP-aware switches se badalne par kisi bhi load par offset 100 nanoseconds se neeche raha.</p><p><b>Seekh:</b> PTP accuracy is par depend karti hai ki har hop apna delay hataye; ek non-aware switch poori chain tod deta hai.</p></div>

<div class="iv"><p class="q">"PTP NTP se zyada accurate kaise hai?"</p><p>Teen wajahein do: software timestamps ki jagah PHY ya ASIC par hardware timestamping, boundary aur transparent clocks jo switch residence aur queuing delay hatate hain, aur tez message rate. Phir roles batao (BMCA se chuna grandmaster, boundary, transparent, ordinary clocks), Sync/Follow_Up/Delay_Req/Delay_Resp exchange, aur 5G ya trading jaisa use case. Senior answer profiles aur path asymmetry ka zikr karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PTP (IEEE 1588v2) ka target sub-microsecond accuracy hai; NTP ka milliseconds.</li>
<li>Accuracy hardware timestamping aur har hop par boundary ya transparent clocks se aati hai.</li>
<li>BMCA Announce messages se grandmaster chunta hai: priority1, clockClass, accuracy, variance, priority2, identity.</li>
<li>Messages: Sync, Follow_Up, Delay_Req, Delay_Resp (peer-to-peer ke liye Pdelay); UDP 319/320 ya EtherType 0x88F7.</li>
<li>show ptp clock / parent / port: device type, offset from master, steps removed, port states.</li>
</ul></div>
`}};export{e as default};