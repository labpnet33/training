var e={id:`switching`,h:{en:`How a switch forwards frames: MAC learning, aging, flooding and the MAC table`,hi:`Switch frames kaise forward karta hai: MAC learning, aging, flooding aur MAC table`},body:{en:`
<p>A new postman joins a housing society. On day one he knows nobody, so every letter for an unknown name gets a copy dropped at every door. But each time someone hands him an outgoing letter, he notes "Mr Rao lives at flat 12". After a week his notebook is full and every letter goes to exactly one door. If a family moves out and nobody sees them for a while, he crosses the entry out. That notebook is a switch's <b>MAC address table</b>, and the postman's habits are exactly how a switch works.</p>

<h3>The three decisions a switch makes</h3>
<p>For every frame that arrives, an Ethernet switch does two things:</p>
<ol>
<li><b>Learn</b>: it reads the <b>source</b> MAC address and records "this MAC is reachable on this port, in this VLAN" in the MAC table (also called the CAM table).</li>
<li><b>Forward</b>: it looks up the <b>destination</b> MAC and makes one of three decisions:
<ul>
<li><b>Forward</b>: the destination is known on a different port, so send the frame out of that one port only. This is <b>known unicast</b>.</li>
<li><b>Filter</b>: the destination is known on the <b>same</b> port the frame arrived on, so drop it; the receiver already heard it.</li>
<li><b>Flood</b>: the destination is unknown (<b>unknown unicast</b>), or it is a <b>broadcast</b> (ffff.ffff.ffff), or a multicast the switch has no specific information about. Send a copy out of <b>every port in the same VLAN except the one it arrived on</b>.</li>
</ul></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Switch learning and flooding">
<rect x="230" y="90" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">MAC table, VLAN 1</text>
<rect x="30" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 Fa0/0</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.0001</text>
<rect x="30" y="180" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC-A</text><text x="105" y="216" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.000a</text>
<rect x="460" y="180" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC-B</text><text x="535" y="216" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.000b</text>
<line x1="180" y1="42" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="215" y="80" class="svg-accent" font-size="12">Fa0/1</text>
<line x1="180" y1="200" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="200" y="165" class="svg-accent" font-size="12">Fa0/2</text>
<line x1="460" y1="200" x2="390" y2="150" stroke="#64748b" stroke-width="2"/><text x="420" y="165" class="svg-accent" font-size="12">Fa0/3</text>
<text x="500" y="60" text-anchor="middle" class="svg-muted" font-size="12">learn source, look up destination</text>
<text x="500" y="80" text-anchor="middle" class="svg-muted" font-size="12">unknown or broadcast: flood</text>
</svg><p class="cap">SW1 learns each sender's MAC on its port and floods only when it must.</p></div>

<h3>Aging: the table keeps itself fresh</h3>
<p>Dynamic MAC entries do not live forever. Each entry has a timer that resets every time the switch sees a frame <b>from</b> that MAC. If the timer reaches the <b>aging time</b>, <b>300 seconds</b> by default on Cisco switches, the entry is removed. This keeps the table from filling up with devices that left, and lets a device that moved to another port be relearned quickly. If a MAC suddenly appears on a new port, the switch simply updates the entry to the new port.</p>
<p>The table has a hardware size limit. When it is full, new MACs cannot be learned, so frames to them are flooded. Attackers can abuse this (MAC flooding), which is why the Layer 2 security module teaches port security.</p>

<h3>Seeing it on SW1</h3>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    0200.0c12.0001    DYNAMIC     Fa0/1</span>
   1    0200.0c12.000a    DYNAMIC     Fa0/2
   1    0200.0c12.000b    DYNAMIC     Fa0/3
Total Mac Addresses for this criterion: 3

SW1# show mac address-table aging-time
Global Aging Time:  300</pre>
<p>Other useful commands:</p>
<pre class="code">SW1# show mac address-table address 0200.0c12.000b     <span class="c">! where is this MAC?</span>
SW1# show mac address-table interface fa0/1           <span class="c">! who is behind this port?</span>
SW1# show mac address-table count
SW1# clear mac address-table dynamic                  <span class="c">! relearn everything</span>
SW1(config)# mac address-table aging-time 600         <span class="c">! change the timer (seconds)</span></pre>
<p>Note: on some older IOS versions the command is written <code>show mac-address-table</code> with a hyphen.</p>

<div class="eg"><p><b>Worked example.</b> SW1's table is empty. PC-A (Fa0/2) pings R1 (10.0.12.1). First PC-A sends an ARP request to broadcast ffff.ffff.ffff. SW1 learns 0200.0c12.000a on Fa0/2, and floods the broadcast out Fa0/1 and Fa0/3. R1 replies with a unicast ARP reply to 0200.0c12.000a. SW1 learns 0200.0c12.0001 on Fa0/1, finds PC-A in the table, and forwards the reply out Fa0/2 only. PC-B never sees the reply. From now on, the ping packets go port to port without flooding.</p></div>

<h3>Store-and-forward and cut-through</h3>
<p>Switches differ in when they start sending a frame:</p>
<ul>
<li><b>Store-and-forward</b>: receive the whole frame, check the FCS, then forward. Frames with CRC errors are <b>dropped</b> here. Most Catalyst access switches work this way.</li>
<li><b>Cut-through</b>: start forwarding as soon as the destination MAC is read, for lowest latency (common in data center switches). Damaged frames can be forwarded before the bad FCS is seen, so CRC errors may show up on a <b>different</b> switch from the one with the bad cable.</li>
<li><b>Fragment-free</b>: a middle ground that waits for the first 64 bytes, where collisions normally appear.</li>
</ul>

<h3>Why this bridges to the next modules</h3>
<p>Everything above happens <b>per VLAN</b>: the MAC table is keyed by VLAN and MAC, and flooding stays inside one VLAN. The VLAN module builds on that. Flooding is also why Layer 2 loops are deadly: a broadcast would circle forever, so the STP module teaches how switches block redundant paths. And a MAC that keeps jumping between two ports is a classic loop symptom you will learn to spot there.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking a switch learns from the destination address; it learns only from the <b>source</b>. Thinking switches flood unknown unicast to all VLANs; flooding stays within the VLAN. Forgetting that the table ages out, so a silent device (a printer that only receives) can cause repeated flooding.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learn from source, forward on destination. Unknown unicast, broadcast and unknown multicast are flooded out all ports in the VLAN except the incoming port. Default aging time is 300 seconds. A frame whose destination is on the incoming port is filtered (dropped).</p></div>

<div class="scn"><h4>The printer that caused flooding</h4><p>A network team noticed that every PC in VLAN 10 was receiving large print jobs meant for one printer. The printer only received data and rarely sent anything, so its MAC entry aged out after 300 seconds, and every job became unknown unicast and was flooded. The engineer confirmed with <code>show mac address-table address</code> that the printer's MAC was often missing. The fix was to make sure the printer sent regular traffic (its SNMP and ARP activity was re-enabled). Some teams instead add a static entry, which then must be maintained by hand.</p><p><b>Lesson:</b> flooding is normal for a moment, but repeated flooding to one destination means the switch keeps forgetting it.</p></div>

<div class="iv"><p class="q">"Explain how a switch builds its MAC address table and forwards a frame."</p><p>Strong answer: on every received frame it learns the source MAC against the ingress port and VLAN, resetting the aging timer (300 s default). It then looks up the destination: known on another port, forward out that port; known on the same port, filter; unknown unicast, broadcast or unknown multicast, flood to all ports in the VLAN except the ingress. Mention <code>show mac address-table</code>, the per-VLAN scope, store-and-forward dropping CRC-bad frames, and that loops make flooding dangerous, which is why STP exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch learns source MACs per port and per VLAN into the MAC (CAM) table.</li>
<li>Known unicast is forwarded, same-port destinations are filtered, unknown unicast and broadcasts are flooded within the VLAN.</li>
<li>Dynamic entries age out after 300 seconds by default.</li>
<li>Store-and-forward drops frames with bad FCS; cut-through can pass them on.</li>
<li>Verify with <code>show mac address-table</code>; VLANs and STP build directly on this behaviour.</li>
</ul></div>
`,hi:`
<p>Ek housing society mein naya postman aata hai. Pehle din woh kisi ko nahi jaanta, isliye kisi anjaan naam ki har chitthi ki ek copy har darwaaze par daal deta hai. Lekin jab bhi koi use bahar jaane wali chitthi deta hai, woh note karta hai "Mr Rao flat 12 mein rehte hain". Ek hafte mein uski notebook bhar jaati hai aur har chitthi bilkul ek darwaaze par jaati hai. Agar koi family shift ho jaaye aur kaafi der tak nahi dikhe, to woh entry kaat deta hai. Woh notebook switch ki <b>MAC address table</b> hai, aur postman ki aadatein bilkul waise hi hain jaise switch kaam karta hai.</p>

<h3>Switch ke teen faisle</h3>
<p>Har aane wale frame ke liye Ethernet switch do kaam karta hai:</p>
<ol>
<li><b>Learn</b>: woh <b>source</b> MAC address padhta hai aur MAC table (jise CAM table bhi kehte hain) mein record karta hai "yeh MAC is port par, is VLAN mein milta hai".</li>
<li><b>Forward</b>: woh <b>destination</b> MAC dhoondta hai aur teen mein se ek faisla karta hai:
<ul>
<li><b>Forward</b>: destination kisi dusre port par known hai, to frame sirf usi ek port se bhejo. Yeh <b>known unicast</b> hai.</li>
<li><b>Filter</b>: destination usi port par known hai jahan se frame aaya, to drop karo; receiver ne pehle hi sun liya.</li>
<li><b>Flood</b>: destination unknown hai (<b>unknown unicast</b>), ya <b>broadcast</b> hai (ffff.ffff.ffff), ya aisa multicast jiske baare mein switch ke paas specific jaankari nahi. <b>Usi VLAN ke har port se, aane wale port ko chhod kar</b>, ek copy bhejo.</li>
</ul></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Switch learning aur flooding">
<rect x="230" y="90" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">MAC table, VLAN 1</text>
<rect x="30" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 Fa0/0</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.0001</text>
<rect x="30" y="180" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC-A</text><text x="105" y="216" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.000a</text>
<rect x="460" y="180" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC-B</text><text x="535" y="216" text-anchor="middle" class="svg-muted" font-size="12">0200.0c12.000b</text>
<line x1="180" y1="42" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="215" y="80" class="svg-accent" font-size="12">Fa0/1</text>
<line x1="180" y1="200" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="200" y="165" class="svg-accent" font-size="12">Fa0/2</text>
<line x1="460" y1="200" x2="390" y2="150" stroke="#64748b" stroke-width="2"/><text x="420" y="165" class="svg-accent" font-size="12">Fa0/3</text>
<text x="500" y="60" text-anchor="middle" class="svg-muted" font-size="12">source seekho, destination dhoondo</text>
<text x="500" y="80" text-anchor="middle" class="svg-muted" font-size="12">unknown ya broadcast: flood</text>
</svg><p class="cap">SW1 har sender ka MAC uske port par seekhta hai aur sirf zaroorat par flood karta hai.</p></div>

<h3>Aging: table khud ko fresh rakhti hai</h3>
<p>Dynamic MAC entries hamesha nahi rehti. Har entry ka ek timer hota hai jo har baar reset hota hai jab switch us MAC <b>se</b> frame dekhta hai. Agar timer <b>aging time</b> tak pahunch jaaye, Cisco switches par default <b>300 second</b>, to entry hata di jaati hai. Isse table chale gaye devices se nahi bharti, aur dusre port par shift hua device jaldi relearn ho jaata hai. Agar koi MAC achanak naye port par dikhe, to switch bas entry ko naye port par update kar deta hai.</p>
<p>Table ki ek hardware size limit hoti hai. Jab woh bhar jaati hai, naye MACs seekhe nahi ja sakte, isliye unke frames flood hote hain. Attackers iska galat fayda utha sakte hain (MAC flooding), isiliye Layer 2 security module port security sikhata hai.</p>

<h3>SW1 par dekhna</h3>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    0200.0c12.0001    DYNAMIC     Fa0/1</span>
   1    0200.0c12.000a    DYNAMIC     Fa0/2
   1    0200.0c12.000b    DYNAMIC     Fa0/3
Total Mac Addresses for this criterion: 3

SW1# show mac address-table aging-time
Global Aging Time:  300</pre>
<p>Aur kaam ke commands:</p>
<pre class="code">SW1# show mac address-table address 0200.0c12.000b     <span class="c">! yeh MAC kahan hai?</span>
SW1# show mac address-table interface fa0/1           <span class="c">! is port ke peeche kaun hai?</span>
SW1# show mac address-table count
SW1# clear mac address-table dynamic                  <span class="c">! sab kuch dobara seekho</span>
SW1(config)# mac address-table aging-time 600         <span class="c">! timer badlo (seconds)</span></pre>
<p>Note: kuch purane IOS versions par command hyphen ke saath <code>show mac-address-table</code> likha jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> SW1 ki table khaali hai. PC-A (Fa0/2) R1 (10.0.12.1) ko ping karta hai. Pehle PC-A broadcast ffff.ffff.ffff par ARP request bhejta hai. SW1 Fa0/2 par 0200.0c12.000a seekhta hai, aur broadcast ko Fa0/1 aur Fa0/3 se flood karta hai. R1 0200.0c12.000a ko unicast ARP reply bhejta hai. SW1 Fa0/1 par 0200.0c12.0001 seekhta hai, table mein PC-A ko paata hai, aur reply sirf Fa0/2 se forward karta hai. PC-B ko reply kabhi nahi dikhta. Ab se ping packets bina flooding ke port se port jaate hain.</p></div>

<h3>Store-and-forward aur cut-through</h3>
<p>Switches is baat mein alag hain ki frame bhejna kab shuru karte hain:</p>
<ul>
<li><b>Store-and-forward</b>: poora frame receive karo, FCS check karo, phir forward karo. CRC errors wale frames yahan <b>drop</b> hote hain. Zyada tar Catalyst access switches aise kaam karte hain.</li>
<li><b>Cut-through</b>: destination MAC padhte hi forward karna shuru karo, sabse kam latency ke liye (data center switches mein common). Kharab FCS dikhne se pehle damaged frames forward ho sakte hain, isliye CRC errors kharab cable wale switch ke bajaye <b>dusre</b> switch par dikh sakte hain.</li>
<li><b>Fragment-free</b>: beech ka raasta jo pehle 64 bytes ka intezaar karta hai, jahan collisions aam taur par dikhte hain.</li>
</ul>

<h3>Yeh agle modules se kaise judta hai</h3>
<p>Upar ki har cheez <b>per VLAN</b> hoti hai: MAC table VLAN aur MAC se keyed hai, aur flooding ek VLAN ke andar rehti hai. VLAN module isi par banta hai. Flooding hi wajah hai ki Layer 2 loops jaanleva hain: ek broadcast hamesha ghoomta rahega, isliye STP module sikhata hai ki switches redundant paths kaise block karte hain. Aur do ports ke beech baar baar koodta MAC ek classic loop symptom hai jise pehchanna aap wahan seekhoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki switch destination address se seekhta hai; woh sirf <b>source</b> se seekhta hai. Yeh sochna ki switches unknown unicast ko saare VLANs mein flood karte hain; flooding VLAN ke andar rehti hai. Bhool jaana ki table age out hoti hai, isliye ek chup device (printer jo sirf receive karta hai) baar baar flooding karwa sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Source se seekho, destination par forward karo. Unknown unicast, broadcast aur unknown multicast VLAN ke saare ports se, aane wale port ko chhod kar, flood hote hain. Default aging time 300 second hai. Jis frame ka destination aane wale port par hi hai woh filter (drop) hota hai.</p></div>

<div class="scn"><h4>Woh printer jisne flooding karwayi</h4><p>Ek network team ne dekha ki VLAN 10 ka har PC ek printer ke liye bane bade print jobs receive kar raha tha. Printer sirf data receive karta tha aur bahut kam kuch bhejta tha, isliye uski MAC entry 300 second ke baad age out ho jaati thi, aur har job unknown unicast ban kar flood hota tha. Engineer ne <code>show mac address-table address</code> se confirm kiya ki printer ka MAC aksar missing tha. Fix yeh tha ki printer regular traffic bheje (uski SNMP aur ARP activity dobara enable ki gayi). Kuch teams iske bajaye static entry jodti hain, jise phir haath se maintain karna padta hai.</p><p><b>Seekh:</b> thodi der flooding normal hai, lekin ek destination par baar baar flooding ka matlab switch use bhoolta rehta hai.</p></div>

<div class="iv"><p class="q">"Samjhao switch apni MAC address table kaise banata hai aur frame kaise forward karta hai."</p><p>Strong answer: har receive hue frame par woh source MAC ko ingress port aur VLAN ke against seekhta hai, aging timer reset karta hai (default 300 s). Phir destination dhoondta hai: dusre port par known, us port se forward; same port par known, filter; unknown unicast, broadcast ya unknown multicast, VLAN ke saare ports par ingress ko chhod kar flood. <code>show mac address-table</code>, per-VLAN scope, store-and-forward ka CRC-bad frames drop karna, aur yeh ki loops flooding ko khatarnaak banate hain, isiliye STP hai, in sabka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch source MACs ko per port aur per VLAN MAC (CAM) table mein seekhta hai.</li>
<li>Known unicast forward hota hai, same-port destinations filter hote hain, unknown unicast aur broadcasts VLAN ke andar flood hote hain.</li>
<li>Dynamic entries default mein 300 second ke baad age out hoti hain.</li>
<li>Store-and-forward kharab FCS wale frames drop karta hai; cut-through unhe aage bhej sakta hai.</li>
<li><code>show mac address-table</code> se verify karo; VLANs aur STP seedhe isi behaviour par bante hain.</li>
</ul></div>
`}};export{e as default};