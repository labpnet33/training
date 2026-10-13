var e=`<svg viewBox="0 0 640 150" role="img" aria-label="Flow troubleshooting order">
<rect x="6" y="35" width="118" height="70" rx="8" fill="#bae6fd"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="13">1 Applied?</text><text x="65" y="83" text-anchor="middle" class="svg-muted" font-size="11">monitor on interface</text>
<rect x="132" y="35" width="118" height="70" rx="8" fill="#fde68a"/><text x="191" y="63" text-anchor="middle" class="svg-ink" font-size="13">2 Cache?</text><text x="191" y="83" text-anchor="middle" class="svg-muted" font-size="11">flows being built</text>
<rect x="258" y="35" width="118" height="70" rx="8" fill="#ddd6fe"/><text x="317" y="63" text-anchor="middle" class="svg-ink" font-size="13">3 Exporter</text><text x="317" y="83" text-anchor="middle" class="svg-muted" font-size="11">dest, port, ver, src</text>
<rect x="384" y="35" width="118" height="70" rx="8" fill="#fed7aa"/><text x="443" y="63" text-anchor="middle" class="svg-ink" font-size="13">4 Network</text><text x="443" y="83" text-anchor="middle" class="svg-muted" font-size="11">route, firewall</text>
<rect x="510" y="35" width="124" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="63" text-anchor="middle" class="svg-ink" font-size="13">5 Collector</text><text x="572" y="83" text-anchor="middle" class="svg-muted" font-size="11">port, version, allow</text>
<line x1="124" y1="70" x2="132" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="258" y2="70" stroke="#64748b" stroke-width="2"/><line x1="376" y1="70" x2="384" y2="70" stroke="#64748b" stroke-width="2"/><line x1="502" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`troubleshooting-flow-capture`,h:{en:`Troubleshooting flow and capture`,hi:`Flow aur capture ka troubleshooting`},body:{en:`
<h3>The shape of the problem</h3>
<p>Flow export is one-way UDP, so when it fails there is no error, just an empty screen. Treat the system as a chain of five links and test them in order: is the monitor applied, is the cache filling, is the exporter correct, can the datagram travel, and will the collector accept it. The first link that fails is your fault. This chapter walks the lab obs-flow-2, where the Lucknow circuit shows nothing, and then the capture problems of obs-flow-3.</p>
<div class="dia">`+e+`<p class="cap">Work left to right; stop at the first broken link, fix it and test again.</p></div>

<h3>Link 1: is the monitor applied to an interface?</h3>
<pre class="code">LKO-EDGE-R3# show flow interface
LKO-EDGE-R3# show flow monitor GF-MON-FLOW</pre>
<pre class="out"><span class="c">(show flow interface prints nothing at all)</span>
Flow Monitor GF-MON-FLOW:
  Flow Record:       GF-REC
  Flow Exporter:     GF-EXPORT
  Cache:
    Status:               <span class="hl">not allocated</span>
    Inactive Timeout:     15 secs
    Active Timeout:       60 secs</pre>
<p>"Not allocated" and an empty <code>show flow interface</code> say the same thing: no interface uses the monitor. Apply it in the input direction on the interfaces that face users and the circuit:</p>
<pre class="code">LKO-EDGE-R3(config)# interface GigabitEthernet0/1
LKO-EDGE-R3(config-if)# ip flow monitor GF-MON-FLOW input</pre>

<h3>Link 2: is the cache filling?</h3>
<pre class="code">LKO-EDGE-R3# show flow monitor GF-MON-FLOW cache</pre>
<pre class="out">  Cache type:                               Normal (Platform cache)
  Cache size:                                 4096
  Current entries:                              14
  High Watermark:                               21

  Flows added:                                  96
  Flows aged:                                   82</pre>
<p>Entries and "flows added" rising mean the router sees traffic. If they stay at zero while users are active, the monitor is on the wrong interface or direction, or it uses a record that matches nothing. Fix this before looking at the exporter.</p>

<h3>Link 3: is the exporter correct?</h3>
<pre class="code">LKO-EDGE-R3# show flow exporter GF-EXPORT</pre>
<pre class="out">Flow Exporter GF-EXPORT:
  Export protocol:          NetFlow Version 5
  Transport Configuration:
    Destination IP address: <span class="hl">10.1.50.10</span>
    Source IP address:      10.0.13.2
    Source Interface:       <span class="hl">GigabitEthernet0/1</span>
    Transport Protocol:     UDP
    Destination Port:       <span class="hl">9996</span>
  Export statistics:
    144 records exported in 20 packets
    0 records dropped (no route to collector)</pre>
<p>Compare each field with the contract: collector 10.1.50.100, UDP 9995, source Loopback0, version v9 or IPFIX.</p>
<table class="cmp"><tr><th>Field</th><th>Found</th><th>Should be</th><th>Effect</th></tr>
<tr><td>Destination</td><td>10.1.50.10</td><td>10.1.50.100</td><td>records go to a different host; nothing on the collector</td></tr>
<tr><td>Port</td><td>9996</td><td>9995</td><td>the collector is not listening there; datagrams are dropped</td></tr>
<tr><td>Source</td><td>Gi0/1 (10.0.13.2)</td><td>Loopback0 (10.255.0.3)</td><td>the collector accepts only the known loopback; it rejects the sender</td></tr>
<tr><td>Version</td><td>v5</td><td>v9 or ipfix</td><td>the collector only decodes the formats it is set for</td></tr></table>
<p>Notice the trap: the statistics say "144 records exported" with no drops. That only means the router handed packets to the network. It does <b>not</b> prove the collector accepted them. Fix all four:</p>
<pre class="code">LKO-EDGE-R3(config)# flow exporter GF-EXPORT
LKO-EDGE-R3(config-flow-exporter)# destination 10.1.50.100
LKO-EDGE-R3(config-flow-exporter)# transport udp 9995
LKO-EDGE-R3(config-flow-exporter)# source Loopback0
LKO-EDGE-R3(config-flow-exporter)# export-protocol netflow-v9</pre>

<h3>Link 4: the network</h3>
<pre class="code">LKO-EDGE-R3# ping 10.1.50.100 source Loopback0</pre>
<p>A "no route to collector" counter in the exporter statistics, or a failing ping from the loopback, means a routing or ACL problem rather than flow configuration. Also check that no firewall or ACL between Lucknow and Hyderabad blocks UDP 9995.</p>

<h3>Link 5: the collector</h3>
<pre class="code">NMS# show flows</pre>
<pre class="out">Flow records received (collector UDP 9995, v9)
SRC             DST             PROTO  SPORT  DPORT  BYTES     PKTS  EXPORTER
10.3.20.21      10.1.20.10      6      52110  443    77120     96    10.255.0.3</pre>
<p>When the exporter is right but the collector shows nothing, check that it listens on the port, accepts your version and allows your exporter address. Wait a minute or two: after a configuration change records appear only after a timeout, and a v9 or IPFIX collector may need the next template.</p>

<div class="eg"><p><b>Worked example: Lucknow is blank.</b> Applied? <code>show flow interface</code> lists Gi0/1: yes. Cache? 96 flows added: yes. Exporter: destination 10.1.50.10, port 9996, source Gi0/1 and v5. Four faults in one exporter. After fixing all four, <code>show flows</code> on NMS lists 10.255.0.3 within a minute and Lucknow appears in the top-talker view. Fixing only the destination would still have left nothing, because the other three would still block.</p></div>

<h3>Troubleshooting capture and SPAN</h3>
<p>For obs-flow-3 the host on the destination port sees nothing, or too much. Check in this order:</p>
<ol>
<li><b>Session exists and is right</b>: <code>show monitor session 1</code> must list the correct source port, the direction and the destination port. A typo in either port is the usual cause.</li>
<li><b>Capture host on the destination port</b>: confirm the host cable is on the destination port, not the source port or a neighbouring one.</li>
<li><b>Filter too narrow</b>: a capture filter for host 10.2.20.99 shows nothing if the user is 10.2.20.21. Try with no filter for ten seconds.</li>
<li><b>Direction</b>: rx only will not show replies. Use both for a first look.</li>
<li><b>Oversubscription</b>: if the copy is bigger than the destination port can carry, copies are dropped silently.</li>
</ol>
<pre class="code">SW-KCH# show monitor session 1</pre>
<pre class="out">Session 1
---------
Type                     : Local Session
Source Ports             :
    Both                 : <span class="hl">Gi0/3</span>
Destination Ports        : Gi0/5
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>If the router is on Gi0/1 and the session lists Gi0/3, the host captures a quiet port. Correct it with <code>monitor session 1 source interface GigabitEthernet0/1 both</code> after removing the wrong source with <code>no monitor session 1 source interface GigabitEthernet0/3</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Trusting "records exported" on the router as proof of delivery. (2) Fixing one exporter field and stopping. (3) Looking at the collector before the cache. (4) Mirroring the wrong port. (5) Using a filter you wrote from memory instead of the real address.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Not allocated" in show flow monitor means the monitor is not applied to any interface. A collector that listens on a different UDP port silently ignores exports. Records exported on the router prove sending, not receiving.</p></div>

<div class="scn"><h4>Four small faults, one blank screen</h4><p>After a weekend change, Meena Iyer noticed Lucknow vanished from the top-talker view. The monitor was applied and the cache was filling, but the exporter had been rebuilt from an old template: a one-digit address typo, port 9996, a physical source and version 5. Priya Nair compared the exporter with the standard, fixed every field in one pass and saw records within a minute. She added the exporter block to the onboarding checklist so it is copied, not retyped.</p><p><b>Lesson:</b> compare every field with the standard, because one fix rarely cures it.</p></div>

<div class="iv"><p class="q">"NetFlow data from one router stopped arriving. What do you check?"</p><p>Strong answer: confirm the monitor is applied to the right interface and direction, confirm the cache is filling, then compare the exporter's destination, port, source interface and version with the collector. Test reachability from the loopback and look for ACLs. Finally confirm on the collector that records from that exporter appear, allowing time for timeouts and templates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test in order: applied, cache, exporter, network, collector.</li>
<li>"Not allocated" means the monitor is not applied on any interface.</li>
<li>Exporter faults come in four kinds: destination, port, source and version.</li>
<li>Records exported on the router prove sending, not delivery; verify on the collector.</li>
<li>For capture, verify session source and destination, host cable, filter, direction and load.</li>
</ul></div>
`,hi:`
<h3>Problem ki shape</h3>
<p>Flow export one-way UDP hai, to fail hone par koi error nahi aata, bas khaali screen. System ko paanch kadiyon ki chain maano aur unhe order mein test karo: monitor apply hua hai, cache bhar raha hai, exporter sahi hai, datagram travel kar sakta hai, aur collector accept karega. Pehli kadi jo fail ho wahi aapka fault hai. Yeh chapter lab obs-flow-2 chalata hai jahan Lucknow circuit kuch nahi dikhata, aur phir obs-flow-3 ki capture problems.</p>
<div class="dia">`+e+`<p class="cap">Left se right chalo; pehli toot-ti kadi par ruko, theek karo aur dobara test karo.</p></div>

<h3>Kadi 1: kya monitor interface par apply hai?</h3>
<pre class="code">LKO-EDGE-R3# show flow interface
LKO-EDGE-R3# show flow monitor GF-MON-FLOW</pre>
<pre class="out"><span class="c">(show flow interface kuch bhi print nahi karta)</span>
Flow Monitor GF-MON-FLOW:
  Flow Record:       GF-REC
  Flow Exporter:     GF-EXPORT
  Cache:
    Status:               <span class="hl">not allocated</span>
    Inactive Timeout:     15 secs
    Active Timeout:       60 secs</pre>
<p>"Not allocated" aur khaali <code>show flow interface</code> ek hi baat kehte hain: koi interface monitor use nahi karta. Users aur circuit ki taraf wale interfaces par input direction mein apply karo:</p>
<pre class="code">LKO-EDGE-R3(config)# interface GigabitEthernet0/1
LKO-EDGE-R3(config-if)# ip flow monitor GF-MON-FLOW input</pre>

<h3>Kadi 2: kya cache bhar raha hai?</h3>
<pre class="code">LKO-EDGE-R3# show flow monitor GF-MON-FLOW cache</pre>
<pre class="out">  Cache type:                               Normal (Platform cache)
  Cache size:                                 4096
  Current entries:                              14
  High Watermark:                               21

  Flows added:                                  96
  Flows aged:                                   82</pre>
<p>Entries aur "flows added" badh rahe hain to router traffic dekh raha hai. Agar users active hone par bhi yeh zero par rahein, to monitor galat interface ya direction par hai, ya aisa record use karta hai jo kuch match nahi karta. Exporter dekhne se pehle isse theek karo.</p>

<h3>Kadi 3: kya exporter sahi hai?</h3>
<pre class="code">LKO-EDGE-R3# show flow exporter GF-EXPORT</pre>
<pre class="out">Flow Exporter GF-EXPORT:
  Export protocol:          NetFlow Version 5
  Transport Configuration:
    Destination IP address: <span class="hl">10.1.50.10</span>
    Source IP address:      10.0.13.2
    Source Interface:       <span class="hl">GigabitEthernet0/1</span>
    Transport Protocol:     UDP
    Destination Port:       <span class="hl">9996</span>
  Export statistics:
    144 records exported in 20 packets
    0 records dropped (no route to collector)</pre>
<p>Har field ko contract se compare karo: collector 10.1.50.100, UDP 9995, source Loopback0, version v9 ya IPFIX.</p>
<table class="cmp"><tr><th>Field</th><th>Mila</th><th>Hona chahiye</th><th>Effect</th></tr>
<tr><td>Destination</td><td>10.1.50.10</td><td>10.1.50.100</td><td>records kisi aur host ko jaate hain; collector par kuch nahi</td></tr>
<tr><td>Port</td><td>9996</td><td>9995</td><td>collector wahan sun nahi raha; datagrams drop</td></tr>
<tr><td>Source</td><td>Gi0/1 (10.0.13.2)</td><td>Loopback0 (10.255.0.3)</td><td>collector sirf jaana-pehchana loopback accept karta hai; sender reject</td></tr>
<tr><td>Version</td><td>v5</td><td>v9 ya ipfix</td><td>collector sirf wahi formats decode karta hai jinke liye set hai</td></tr></table>
<p>Jaal dekho: statistics "144 records exported" kehte hain aur koi drop nahi. Iska matlab sirf itna hai ki router ne packets network ko de diye. Yeh <b>sabit nahi</b> karta ki collector ne accept kiye. Chaaron theek karo:</p>
<pre class="code">LKO-EDGE-R3(config)# flow exporter GF-EXPORT
LKO-EDGE-R3(config-flow-exporter)# destination 10.1.50.100
LKO-EDGE-R3(config-flow-exporter)# transport udp 9995
LKO-EDGE-R3(config-flow-exporter)# source Loopback0
LKO-EDGE-R3(config-flow-exporter)# export-protocol netflow-v9</pre>

<h3>Kadi 4: network</h3>
<pre class="code">LKO-EDGE-R3# ping 10.1.50.100 source Loopback0</pre>
<p>Exporter statistics mein "no route to collector" counter, ya loopback se fail hota ping, routing ya ACL problem dikhata hai, flow configuration nahi. Yeh bhi check karo ki Lucknow aur Hyderabad ke beech koi firewall ya ACL UDP 9995 block na kare.</p>

<h3>Kadi 5: collector</h3>
<pre class="code">NMS# show flows</pre>
<pre class="out">Flow records received (collector UDP 9995, v9)
SRC             DST             PROTO  SPORT  DPORT  BYTES     PKTS  EXPORTER
10.3.20.21      10.1.20.10      6      52110  443    77120     96    10.255.0.3</pre>
<p>Jab exporter sahi ho lekin collector kuch na dikhaye, to check karo ki woh port par sunta hai, aapka version accept karta hai aur aapka exporter address allow karta hai. Ek-do minute ruko: configuration badalne ke baad records timeout ke baad dikhte hain, aur v9 ya IPFIX collector ko agla template chahiye ho sakta hai.</p>

<div class="eg"><p><b>Worked example: Lucknow khaali hai.</b> Applied? <code>show flow interface</code> Gi0/1 list karta hai: haan. Cache? 96 flows added: haan. Exporter: destination 10.1.50.10, port 9996, source Gi0/1 aur v5. Ek exporter mein chaar faults. Chaaron theek karne ke baad NMS par <code>show flows</code> ek minute mein 10.255.0.3 list karta hai aur Lucknow top-talker view mein aa jaata hai. Sirf destination theek karne se phir bhi kuch nahi aata, kyunki baaki teen block karte rehte.</p></div>

<h3>Capture aur SPAN ka troubleshooting</h3>
<p>obs-flow-3 mein destination port ka host ya kuch nahi dekhta, ya bahut zyada. Is order mein check karo:</p>
<ol>
<li><b>Session hai aur sahi hai</b>: <code>show monitor session 1</code> mein sahi source port, direction aur destination port dikhne chahiye. Dono mein se kisi port mein typo sabse aam cause hai.</li>
<li><b>Capture host destination port par</b>: confirm karo host ka cable destination port par hai, source port ya padosi port par nahi.</li>
<li><b>Filter bahut narrow</b>: host 10.2.20.99 ka capture filter kuch nahi dikhata agar user 10.2.20.21 hai. Dus second bina filter ke try karo.</li>
<li><b>Direction</b>: sirf rx replies nahi dikhata. Pehli nazar ke liye both use karo.</li>
<li><b>Oversubscription</b>: agar copy destination port se badi hai to copies chupchaap drop hoti hain.</li>
</ol>
<pre class="code">SW-KCH# show monitor session 1</pre>
<pre class="out">Session 1
---------
Type                     : Local Session
Source Ports             :
    Both                 : <span class="hl">Gi0/3</span>
Destination Ports        : Gi0/5
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>Agar router Gi0/1 par hai aur session Gi0/3 list karta hai, to host ek shaant port capture karta hai. Galat source <code>no monitor session 1 source interface GigabitEthernet0/3</code> se hatao aur phir <code>monitor session 1 source interface GigabitEthernet0/1 both</code> se theek karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Router par "records exported" ko delivery ka saboot maanna. (2) Exporter ka ek field theek karke ruk jaana. (3) Cache se pehle collector dekhna. (4) Galat port mirror karna. (5) Asli address ki jagah yaad se likha filter use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> show flow monitor mein "not allocated" ka matlab monitor kisi interface par apply nahi hai. Jo collector doosre UDP port par sunta hai woh exports ko chupchaap ignore karta hai. Router par records exported sending sabit karte hain, receiving nahi.</p></div>

<div class="scn"><h4>Chaar chhote faults, ek khaali screen</h4><p>Weekend change ke baad Meena Iyer ne dekha ki Lucknow top-talker view se gayab ho gaya. Monitor apply tha aur cache bhar raha tha, lekin exporter purane template se dobara bana tha: ek digit ka address typo, port 9996, physical source aur version 5. Priya Nair ne exporter ko standard se compare kiya, ek hi pass mein har field theek kiya aur ek minute mein records dekhe. Usne exporter block ko onboarding checklist mein jod diya taaki woh copy ho, dobara type na ho.</p><p><b>Seekh:</b> har field ko standard se compare karo, kyunki ek fix se aksar kaam nahi banta.</p></div>

<div class="iv"><p class="q">"Ek router ka NetFlow data aana band ho gaya. Kya check karoge?"</p><p>Strong answer: confirm karo monitor sahi interface aur direction par apply hai, confirm karo cache bhar raha hai, phir exporter ka destination, port, source interface aur version collector se compare karo. Loopback se reachability test karo aur ACLs dekho. Aakhir mein collector par confirm karo ki us exporter ke records dikhte hain, timeouts aur templates ke liye waqt dekar.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein test karo: applied, cache, exporter, network, collector.</li>
<li>"Not allocated" ka matlab monitor kisi interface par apply nahi hai.</li>
<li>Exporter faults chaar tarah ke hote hain: destination, port, source aur version.</li>
<li>Router par records exported sending sabit karte hain, delivery nahi; collector par verify karo.</li>
<li>Capture ke liye session source aur destination, host cable, filter, direction aur load verify karo.</li>
</ul></div>
`}};export{t as default};