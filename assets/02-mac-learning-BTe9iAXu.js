var e={id:`mac-learning`,h:{en:`How a switch learns and forwards frames`,hi:`Switch frames kaise learn aur forward karta hai`},body:{en:`
<h3>The analogy: a new receptionist learning where everyone sits</h3>
<p>On her first day, a receptionist has no seating chart. When a parcel arrives for "Ravi", she does not know his desk, so she announces it on the loudspeaker to the whole floor. Ravi walks over to collect it, and now she writes down "Ravi sits at desk 12". Every time someone walks past her desk, she notes where they came from. After an hour she rarely needs the loudspeaker. If someone has not been seen for a long time, she crosses them off, because they may have moved.</p>
<p>A switch does exactly this with <b>MAC addresses</b>. Its seating chart is the <b>MAC address table</b> (also called the CAM table). The loudspeaker is <b>flooding</b>. Crossing off old entries is <b>aging</b>.</p>

<h3>The four decisions a switch makes</h3>
<p>Every Ethernet frame carries a <b>source MAC</b> and a <b>destination MAC</b>. When a frame arrives on a port, the switch does two things, always in this order:</p>
<ol>
<li><b>Learn.</b> It reads the <i>source</i> MAC and records "this MAC lives on this port, in this VLAN". If the entry already exists, it refreshes the timer.</li>
<li><b>Look up the destination</b> and choose one of three actions:
<ul>
<li><b>Forward</b>: the destination MAC is in the table on a different port, so the frame goes out that one port only (known unicast).</li>
<li><b>Filter</b>: the destination is on the <i>same</i> port the frame came in on, so the switch drops it. The receiver already saw it.</li>
<li><b>Flood</b>: the destination is unknown, or it is a broadcast (<code>ffff.ffff.ffff</code>) or most multicasts, so the frame is copied out every port in the same VLAN except the one it arrived on.</li>
</ul></li>
</ol>
<p>Notice the words "in the same VLAN". A switch keeps a separate view of each VLAN. Flooding never crosses into another VLAN, and a MAC learned in VLAN 10 is useless for a frame in VLAN 20. This is the mechanism that makes a VLAN a separate broadcast domain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAC learning and flooding">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="20" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-A (Gi0/1)</text><text x="85" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a01</text>
<rect x="180" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="245" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-B (Gi0/2)</text><text x="245" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0b02</text>
<rect x="340" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="405" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-C (Gi0/3)</text><text x="405" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0c03</text>
<rect x="500" y="150" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="565" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-D (Gi0/4)</text><text x="565" y="186" text-anchor="middle" class="svg-muted" font-size="12">other VLAN</text>
<line x1="280" y1="64" x2="85" y2="150" stroke="#64748b" stroke-width="2"/><line x1="305" y1="64" x2="245" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="335" y1="64" x2="405" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="360" y1="64" x2="565" y2="150" stroke="#64748b" stroke-width="1"/>
<text x="20" y="218" class="svg-accent" font-size="12">A sends to unknown B: learn A on Gi0/1, flood (dashed) to B and C only, never to D's VLAN</text>
</svg><p class="cap">Learning uses the source MAC; flooding stays inside the VLAN.</p></div>

<h3>Collision domains and broadcast domains</h3>
<p>Two terms appear on every Network+ exam. A <b>collision domain</b> is the set of devices that could collide if they transmit at the same moment. On an old hub, every port shared one collision domain. On a switch, <b>each port is its own collision domain</b>, and with full duplex (chapter 7) collisions cannot happen at all. A <b>broadcast domain</b> is the set of devices that receive a layer 2 broadcast. On a switch with no VLANs, all ports share one broadcast domain. <b>Each VLAN is one broadcast domain.</b> Routers do not forward broadcasts, so each router interface also ends a broadcast domain.</p>

<div class="eg"><p><b>Worked example.</b> A 24-port switch has PCs on 20 ports, split across VLAN 10 (12 ports) and VLAN 20 (8 ports). How many collision domains and broadcast domains? Collision domains: 20, one per connected port. Broadcast domains: 2, one per VLAN. If the same 20 PCs were on a hub, there would be 1 collision domain and 1 broadcast domain.</p></div>

<h3>Reading the MAC address table</h3>
<p>On a Cisco-style switch the command is <code>show mac address-table</code>. Entries are <b>DYNAMIC</b> (learned from traffic) or <b>STATIC</b> (typed by an administrator or created by features such as port security). Dynamic entries age out after 300 seconds of silence by default.</p>
<pre class="out">SW1#show mac address-table
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0050.7966.0a01    DYNAMIC     Gi0/1</span>
  20    0050.7966.0b02    DYNAMIC     Gi0/2
  10    5254.0012.3401    DYNAMIC     Gi0/0
  20    5254.0012.3401    DYNAMIC     Gi0/0
Total Mac Addresses for this criterion: 4</pre>
<p>Read the highlighted line as "in VLAN 10, the host 0050.7966.0a01 is reached through Gi0/1". The router's MAC (5254.0012.3401) appears twice, once per VLAN, both on Gi0/0. That is normal for a router-on-a-stick: one physical port, one MAC, present in several VLANs over the trunk. Useful variants are <code>show mac address-table interface Gi0/1</code>, <code>show mac address-table vlan 10</code> and <code>show mac address-table address 0050.7966.0a01</code>, which answers "which port is this device on?", the first question in almost every "find the device" ticket.</p>
<pre class="code"><span class="c">! Useful table commands</span>
show mac address-table dynamic
show mac address-table aging-time
clear mac address-table dynamic
<span class="c">! Optional: change the aging timer (seconds)</span>
configure terminal
 mac address-table aging-time 300</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Expecting a host to appear in the table before it has sent anything. A silent printer is not learned until it transmits; ping it first. (2) Reading many MACs on one access port as an attack. It can be an unmanaged mini-switch under a desk, or a phone with a PC behind it. (3) Forgetting that the table is per VLAN: searching VLAN 1 for a host that lives in VLAN 20 returns nothing.</p></div>

<div class="exam"><p><b>Exam traps.</b> A switch learns from the <b>source</b> MAC, never the destination. Unknown unicast, broadcast and (by default) multicast are <b>flooded</b>. A switch <b>breaks up collision domains</b>; only VLANs and routers <b>break up broadcast domains</b>. A hub is layer 1 and repeats bits to every port; a switch is layer 2.</p></div>

<div class="scn"><h4>The switch that behaved like a hub</h4><p>Users on one floor complained of slow file transfers, and a packet capture on a random PC showed traffic between other people's machines. The engineer ran <code>show mac address-table count</code> and saw the table full at its maximum. A contractor's test tool on port Gi0/15 was generating thousands of random source MACs per second, filling the table so real hosts could not be learned, and the switch flooded almost everything as unknown unicast. The engineer shut the port, cleared the dynamic table, and later enabled port security to limit each access port to a few MACs.</p><p><b>Lesson:</b> when the MAC table cannot learn, a switch floods like a hub. Watch table counts and limit MACs per port.</p></div>

<div class="iv"><p class="q">"Walk me through what a switch does when a frame arrives."</p><p>Strong answer: it learns the source MAC against the ingress port and VLAN (or refreshes the timer), then looks up the destination MAC in that VLAN. Known unicast on another port is forwarded out that port only; if it is on the ingress port it is filtered; unknown unicast, broadcast and most multicast are flooded to all other ports in the same VLAN. Add that dynamic entries age out (300 seconds by default) and that each VLAN has its own table, which is why VLANs are separate broadcast domains.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Learn from the source MAC, then forward, filter or flood based on the destination MAC.</li>
<li>Flooding is limited to ports in the same VLAN; that is what makes a VLAN a broadcast domain.</li>
<li>Each switch port is its own collision domain; each VLAN is its own broadcast domain.</li>
<li><code>show mac address-table</code> answers "which port and VLAN is this device on?"</li>
<li>Dynamic entries age out after 300 seconds by default; a full table makes a switch flood.</li>
</ul></div>
`,hi:`
<h3>Analogy: nayi receptionist jo seekh rahi hai ki kaun kahan baithta hai</h3>
<p>Pehle din receptionist ke paas koi seating chart nahi hota. Jab "Ravi" ke liye parcel aata hai, use uski desk nahi pata, isliye woh poore floor par loudspeaker se announce karti hai. Ravi aa kar parcel le jaata hai, aur ab woh likh leti hai "Ravi desk 12 par baithta hai". Jab bhi koi uski desk ke paas se guzarta hai, woh note karti hai ki woh kahan se aaya. Ek ghante baad use loudspeaker ki zaroorat kam hi padti hai. Agar koi bahut der se nahi dikha, woh uska naam kaat deti hai, kyunki shayad woh shift ho gaya ho.</p>
<p>Switch <b>MAC addresses</b> ke saath bilkul yahi karta hai. Uska seating chart <b>MAC address table</b> hai (ise CAM table bhi kehte hain). Loudspeaker <b>flooding</b> hai. Purani entries kaatna <b>aging</b> hai.</p>

<h3>Switch ke chaar decisions</h3>
<p>Har Ethernet frame mein ek <b>source MAC</b> aur ek <b>destination MAC</b> hota hai. Jab frame kisi port par aata hai, switch do kaam karta hai, hamesha isi order mein:</p>
<ol>
<li><b>Learn.</b> Woh <i>source</i> MAC padhta hai aur record karta hai "yeh MAC is port par, is VLAN mein rehta hai". Agar entry pehle se hai, to timer refresh karta hai.</li>
<li><b>Destination look up karta hai</b> aur teen mein se ek action chunta hai:
<ul>
<li><b>Forward</b>: destination MAC table mein kisi doosre port par hai, isliye frame sirf usi ek port se bahar jaata hai (known unicast).</li>
<li><b>Filter</b>: destination <i>usi</i> port par hai jahan se frame aaya, isliye switch use drop kar deta hai. Receiver use pehle hi dekh chuka hai.</li>
<li><b>Flood</b>: destination unknown hai, ya broadcast (<code>ffff.ffff.ffff</code>) ya zyada tar multicast hai, isliye frame same VLAN ke har port par copy hota hai, sirf aane wale port ko chhodkar.</li>
</ul></li>
</ol>
<p>"Same VLAN mein" words par dhyan do. Switch har VLAN ka alag view rakhta hai. Flooding kabhi doosre VLAN mein nahi jaati, aur VLAN 10 mein seekha gaya MAC VLAN 20 ke frame ke liye bekaar hai. Yahi mechanism VLAN ko alag broadcast domain banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAC learning aur flooding">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="20" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-A (Gi0/1)</text><text x="85" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a01</text>
<rect x="180" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="245" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-B (Gi0/2)</text><text x="245" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0b02</text>
<rect x="340" y="150" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="405" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-C (Gi0/3)</text><text x="405" y="186" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0c03</text>
<rect x="500" y="150" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="565" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC-D (Gi0/4)</text><text x="565" y="186" text-anchor="middle" class="svg-muted" font-size="12">doosra VLAN</text>
<line x1="280" y1="64" x2="85" y2="150" stroke="#64748b" stroke-width="2"/><line x1="305" y1="64" x2="245" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="335" y1="64" x2="405" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="360" y1="64" x2="565" y2="150" stroke="#64748b" stroke-width="1"/>
<text x="20" y="218" class="svg-accent" font-size="12">A unknown B ko bhejta hai: A Gi0/1 par learn, flood (dashed) sirf B aur C ko, D ke VLAN mein kabhi nahi</text>
</svg><p class="cap">Learning source MAC se hoti hai; flooding VLAN ke andar hi rehti hai.</p></div>

<h3>Collision domains aur broadcast domains</h3>
<p>Do terms har Network+ exam mein aate hain. <b>Collision domain</b> un devices ka set hai jo ek hi pal mein transmit karein to collide kar sakte hain. Purane hub par har port ek hi collision domain share karta tha. Switch par <b>har port apna collision domain hai</b>, aur full duplex ke saath (chapter 7) collisions ho hi nahi sakte. <b>Broadcast domain</b> un devices ka set hai jo layer 2 broadcast receive karte hain. Bina VLANs wale switch par saare ports ek broadcast domain share karte hain. <b>Har VLAN ek broadcast domain hai.</b> Routers broadcasts forward nahi karte, isliye har router interface bhi ek broadcast domain khatam karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek 24-port switch ke 20 ports par PCs hain, VLAN 10 (12 ports) aur VLAN 20 (8 ports) mein bante hue. Kitne collision domains aur broadcast domains? Collision domains: 20, har connected port ka ek. Broadcast domains: 2, har VLAN ka ek. Agar yahi 20 PCs hub par hote, to 1 collision domain aur 1 broadcast domain hota.</p></div>

<h3>MAC address table padhna</h3>
<p>Cisco-style switch par command <code>show mac address-table</code> hai. Entries <b>DYNAMIC</b> (traffic se seekhi gayi) ya <b>STATIC</b> (administrator ne type ki ya port security jaise features ne banayi) hoti hain. Dynamic entries by default 300 seconds ki khamoshi ke baad age out ho jaati hain.</p>
<pre class="out">SW1#show mac address-table
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0050.7966.0a01    DYNAMIC     Gi0/1</span>
  20    0050.7966.0b02    DYNAMIC     Gi0/2
  10    5254.0012.3401    DYNAMIC     Gi0/0
  20    5254.0012.3401    DYNAMIC     Gi0/0
Total Mac Addresses for this criterion: 4</pre>
<p>Highlighted line ko aise padho: "VLAN 10 mein host 0050.7966.0a01 Gi0/1 ke through milta hai". Router ka MAC (5254.0012.3401) do baar dikhta hai, har VLAN mein ek baar, dono Gi0/0 par. Router-on-a-stick ke liye yeh normal hai: ek physical port, ek MAC, trunk par kai VLANs mein present. Kaam ke variants hain <code>show mac address-table interface Gi0/1</code>, <code>show mac address-table vlan 10</code> aur <code>show mac address-table address 0050.7966.0a01</code>, jo batata hai "yeh device kis port par hai?", jo lagbhag har "device dhoondo" ticket ka pehla sawaal hai.</p>
<pre class="code"><span class="c">! Kaam ke table commands</span>
show mac address-table dynamic
show mac address-table aging-time
clear mac address-table dynamic
<span class="c">! Optional: aging timer badlo (seconds)</span>
configure terminal
 mac address-table aging-time 300</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh expect karna ki host kuch bheje bina table mein aa jaayega. Chup baitha printer tab tak learn nahi hota jab tak woh transmit na kare; pehle use ping karo. (2) Ek access port par kai MACs ko attack samajhna. Woh desk ke neeche ka unmanaged mini-switch ho sakta hai, ya phone jiske peeche PC laga hai. (3) Bhool jaana ki table per VLAN hai: VLAN 20 mein rehne wale host ko VLAN 1 mein dhoondhoge to kuch nahi milega.</p></div>

<div class="exam"><p><b>Exam traps.</b> Switch <b>source</b> MAC se learn karta hai, destination se kabhi nahi. Unknown unicast, broadcast aur (by default) multicast <b>flood</b> hote hain. Switch <b>collision domains todta hai</b>; sirf VLANs aur routers <b>broadcast domains todte hain</b>. Hub layer 1 hai aur bits har port par repeat karta hai; switch layer 2 hai.</p></div>

<div class="scn"><h4>Switch jo hub ki tarah behave karne laga</h4><p>Ek floor ke users ne slow file transfers ki shikayat ki, aur ek random PC par packet capture mein doosre logon ki machines ke beech ka traffic dikha. Engineer ne <code>show mac address-table count</code> chalaya aur dekha ki table apne maximum par full thi. Port Gi0/15 par ek contractor ka test tool har second hazaaron random source MACs bana raha tha, table bhar raha tha taaki real hosts learn na ho sakein, aur switch lagbhag sab kuch unknown unicast ki tarah flood kar raha tha. Engineer ne port shut kiya, dynamic table clear ki, aur baad mein port security enable ki taaki har access port kuch hi MACs tak limit rahe.</p><p><b>Seekh:</b> jab MAC table learn nahi kar paati, switch hub ki tarah flood karta hai. Table counts dekho aur har port par MACs limit karo.</p></div>

<div class="iv"><p class="q">"Batao ki frame aane par switch kya karta hai."</p><p>Strong answer: woh source MAC ko ingress port aur VLAN ke against learn karta hai (ya timer refresh karta hai), phir us VLAN mein destination MAC look up karta hai. Doosre port par known unicast sirf usi port se forward hota hai; agar woh ingress port par hi hai to filter hota hai; unknown unicast, broadcast aur zyada tar multicast same VLAN ke baaki saare ports par flood hote hain. Yeh bhi jodo ki dynamic entries age out hoti hain (default 300 seconds) aur har VLAN ki apni table hoti hai, isiliye VLANs alag broadcast domains hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source MAC se learn karo, phir destination MAC ke basis par forward, filter ya flood karo.</li>
<li>Flooding same VLAN ke ports tak limited hai; yahi VLAN ko broadcast domain banata hai.</li>
<li>Har switch port apna collision domain hai; har VLAN apna broadcast domain hai.</li>
<li><code>show mac address-table</code> batata hai "yeh device kis port aur VLAN par hai?"</li>
<li>Dynamic entries default 300 seconds ke baad age out hoti hain; full table switch ko flood karne par majboor karti hai.</li>
</ul></div>
`}};export{e as default};