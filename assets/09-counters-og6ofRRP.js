var e={id:`counters`,h:{en:`Interface counters: CRC, runts, giants, collisions, drops and what they mean`,hi:`Interface counters: CRC, runts, giants, collisions, drops aur unka matlab`},body:{en:`
<p>A doctor does not diagnose by asking "do you feel bad?". She reads the numbers: temperature, blood pressure, pulse. Each abnormal number points to a small set of causes, and a <b>combination</b> of numbers points to one. Interface counters are the vital signs of a link. Learn what each one measures and which combinations belong together, and you can diagnose most physical problems without touching a cable.</p>

<h3>Where the counters live</h3>
<p>The bottom half of <code>show interfaces</code> holds them. Here is R1 in this module's lab, before the fix, with the important lines highlighted:</p>
<pre class="out">R1# show interfaces fa0/0
FastEthernet0/0 is up, line protocol is up
  Description: LAN-SW1
  Internet address is 10.0.12.1/24
     reliability 252/255, txload 1/255, rxload 1/255
<span class="hl">  Half-duplex, 100Mb/s, 100BaseTX/FX</span>
  Last clearing of "show interface" counters never
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
     1204 packets input, 139822 bytes
     Received 311 broadcasts (0 IP multicasts)
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     1377 packets output, 152004 bytes, 0 underruns
<span class="hl">     19 output errors, 37 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 19 late collision, 0 deferred</span>
     0 lost carrier, 0 no carrier</pre>
<p>And the other end, SW1 Fa0/1:</p>
<pre class="out">SW1# show interfaces fa0/1
FastEthernet0/1 is up, line protocol is up (connected)
<span class="hl">  Full-duplex, 100Mb/s, media type is 10/100BaseTX</span>
     1377 packets input, 152004 bytes, 0 no buffer
<span class="hl">     17 runts, 0 giants, 0 throttles</span>
<span class="hl">     61 input errors, 44 CRC, 0 frame, 0 overrun, 0 ignored</span>
     1204 packets output, 139822 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets
     0 babbles, 0 late collision, 0 deferred</pre>

<h3>What each counter means</h3>
<table class="cmp"><tr><th>Counter</th><th>Meaning</th><th>Typical causes</th></tr>
<tr><td>runts</td><td>Received frames smaller than 64 bytes</td><td>Frames cut off by collisions (duplex mismatch), faulty NIC</td></tr>
<tr><td>giants</td><td>Received frames larger than the maximum (1518 bytes, more with tags or jumbo)</td><td>MTU mismatch, jumbo frames not enabled, faulty NIC</td></tr>
<tr><td>input errors</td><td>Total of receive errors: runts, giants, CRC, frame, overrun, ignored, no buffer</td><td>Look at the individual counters</td></tr>
<tr><td>CRC</td><td>The FCS calculated on arrival did not match the FCS in the frame: the frame was damaged</td><td>Bad cable or connector, interference, dirty fibre, failing optic, duplex mismatch (full side)</td></tr>
<tr><td>frame</td><td>CRC error plus a frame that is not a whole number of bytes</td><td>Same as CRC: physical damage or collisions</td></tr>
<tr><td>overrun / ignored / no buffer</td><td>Frames arrived faster than the hardware or buffers could accept them</td><td>Traffic bursts, broadcast storms, overloaded device</td></tr>
<tr><td>output errors</td><td>Total of errors that stopped frames being transmitted</td><td>Look at collisions, late collisions, underruns</td></tr>
<tr><td>collisions</td><td>Frames retransmitted because of a collision</td><td>Normal only on a genuine half-duplex segment; otherwise a mismatch</td></tr>
<tr><td>late collision</td><td>Collision after the first 64 bytes</td><td><b>Duplex mismatch</b>, or a cable or segment that is too long</td></tr>
<tr><td>deferred</td><td>Frames that waited because the medium was busy</td><td>Half-duplex operation</td></tr>
<tr><td>output drops</td><td>Output queue was full, frames discarded</td><td>Congestion, for example a 1 Gbps port feeding a 100 Mbps port</td></tr>
<tr><td>interface resets / lost carrier</td><td>The interface was reset or the signal disappeared</td><td>Flapping link, loose cable, far end rebooting</td></tr>
</table>

<h3>The patterns that matter</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Counter patterns and their causes">
<rect x="20" y="15" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="12">Late collisions one side + CRC, runts other</text>
<rect x="330" y="15" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="13">Duplex mismatch</text>
<rect x="20" y="70" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="97" text-anchor="middle" class="svg-ink" font-size="12">CRC on one side, no collisions, both full</text>
<rect x="330" y="70" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="13">Cable, connector, optic, noise</text>
<rect x="20" y="125" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="152" text-anchor="middle" class="svg-ink" font-size="12">Output drops rising, high txload</text>
<rect x="330" y="125" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="152" text-anchor="middle" class="svg-ink" font-size="13">Congestion or speed step-down</text>
<rect x="20" y="180" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="207" text-anchor="middle" class="svg-ink" font-size="12">Giants</text>
<rect x="330" y="180" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="207" text-anchor="middle" class="svg-ink" font-size="13">MTU mismatch</text>
</svg><p class="cap">Read counters as combinations, on both ends of the link.</p></div>
<ul>
<li><b>Duplex mismatch</b>: the half-duplex side (R1) shows collisions and <b>late collisions</b>; the full-duplex side (SW1) shows <b>CRC</b>, <b>runts</b> and input errors. The link is up/up. CDP, if running, logs <code>%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on FastEthernet0/0 (not full duplex), with SW1 FastEthernet0/1 (full duplex).</code></li>
<li><b>Physical fault</b>: CRC and input errors growing on one side only, both ends full duplex, no collisions. The damage happens on the path <b>toward</b> the device counting the errors: suspect that direction's cable pair, connector or the far end's transmitter.</li>
<li><b>Congestion</b>: output drops rising, errors zero. Not a fault in the cable; the link is too small or traffic is bursty. QoS and bigger links are the fixes.</li>
</ul>

<h3>Make counters tell you about now</h3>
<p>Counters are cumulative since the last reload or clear. Old errors from last month look identical to new ones. So: note the values, <b>clear</b>, generate traffic, and look again.</p>
<pre class="code">R1# clear counters fastEthernet 0/0
Clear "show interface" counters on this interface [confirm]
R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0 | include collision|CRC|clearing</pre>
<p>On Catalyst switches, <code>show interfaces fa0/1 counters errors</code> gives a compact table (Align-Err, FCS-Err, Late-Col, Runts, Giants and more) that is easy to compare across ports.</p>

<div class="eg"><p><b>Worked example.</b> SW1 Gi1/0/24 to a server: both ends <code>a-full a-1000</code>. Over 10 minutes, input errors rose from 0 to 2,310, all of them CRC; collisions 0; the server's NIC shows no receive errors. The damage is on frames travelling from the server to the switch. You replace the patch cord, clear counters, and after an hour CRC is still 0. Fixed, and proved.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reacting to a large counter without checking "Last clearing". Looking at only one end of the link. Treating output drops as a cable fault. Disabling CDP to stop the duplex mismatch log, which hides the symptom and fixes nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Runts are smaller than 64 bytes; giants are larger than the maximum. Late collisions point to duplex mismatch. CRC with no collisions points to Layer 1 physical problems. Collisions of any kind on a full-duplex interface should be zero.</p></div>

<div class="scn"><h4>Voice quality that dropped when it rained</h4><p>A branch reported choppy calls, worse on rainy days. The uplink from the branch switch to the router showed thousands of CRC errors on the router side only, with both ends full duplex and no collisions. The copper run went through a damp ceiling space next to a power cable. Clearing counters and watching confirmed CRC errors climbing during a call. Replacing the run with fibre and SFPs removed the errors completely.</p><p><b>Lesson:</b> CRC without collisions is physical. Find where the damaged direction runs and fix the medium.</p></div>

<div class="iv"><p class="q">"You see CRC errors on an interface. How do you troubleshoot?"</p><p>Strong answer: first make it current with <code>clear counters</code> and traffic. Check both ends' speed and duplex; if one side has late collisions and the other CRC and runts, it is a duplex mismatch. If both are full and only one side counts CRC, it is physical in the direction toward that side: reseat or replace the patch cord, test the cable (TDR on Catalyst), clean fibre, check DOM light levels, swap the optic, try another port. Verify by clearing counters again and proving they stay at zero.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Runts are under 64 bytes, giants over the maximum, CRC means a damaged frame.</li>
<li>Late collisions on one side plus CRC and runts on the other means duplex mismatch.</li>
<li>CRC with no collisions and both ends full duplex means a physical problem.</li>
<li>Output drops mean congestion, not a bad cable.</li>
<li>Always <code>clear counters</code>, generate traffic and re-check; compare both ends.</li>
</ul></div>
`,hi:`
<p>Doctor sirf "kya aap bura mehsoos kar rahe ho?" pooch kar diagnose nahi karti. Woh numbers padhti hai: temperature, blood pressure, pulse. Har abnormal number kuch causes ki taraf ishara karta hai, aur numbers ka <b>combination</b> ek cause ki taraf. Interface counters link ke vital signs hain. Seekho ki har ek kya naapta hai aur kaunse combinations saath aate hain, aur aap zyada tar physical problems bina cable chhuye diagnose kar sakte ho.</p>

<h3>Counters kahan rehte hain</h3>
<p><code>show interfaces</code> ka neeche wala hissa unhe rakhta hai. Yeh raha is module ki lab ka R1, fix se pehle, important lines highlight ke saath:</p>
<pre class="out">R1# show interfaces fa0/0
FastEthernet0/0 is up, line protocol is up
  Description: LAN-SW1
  Internet address is 10.0.12.1/24
     reliability 252/255, txload 1/255, rxload 1/255
<span class="hl">  Half-duplex, 100Mb/s, 100BaseTX/FX</span>
  Last clearing of "show interface" counters never
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
     1204 packets input, 139822 bytes
     Received 311 broadcasts (0 IP multicasts)
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     1377 packets output, 152004 bytes, 0 underruns
<span class="hl">     19 output errors, 37 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 19 late collision, 0 deferred</span>
     0 lost carrier, 0 no carrier</pre>
<p>Aur dusra end, SW1 Fa0/1:</p>
<pre class="out">SW1# show interfaces fa0/1
FastEthernet0/1 is up, line protocol is up (connected)
<span class="hl">  Full-duplex, 100Mb/s, media type is 10/100BaseTX</span>
     1377 packets input, 152004 bytes, 0 no buffer
<span class="hl">     17 runts, 0 giants, 0 throttles</span>
<span class="hl">     61 input errors, 44 CRC, 0 frame, 0 overrun, 0 ignored</span>
     1204 packets output, 139822 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets
     0 babbles, 0 late collision, 0 deferred</pre>

<h3>Har counter ka matlab</h3>
<table class="cmp"><tr><th>Counter</th><th>Matlab</th><th>Typical causes</th></tr>
<tr><td>runts</td><td>64 bytes se chhote receive hue frames</td><td>Collisions se kate frames (duplex mismatch), kharab NIC</td></tr>
<tr><td>giants</td><td>Maximum (1518 bytes, tags ya jumbo ke saath zyada) se bade receive hue frames</td><td>MTU mismatch, jumbo frames enable nahi, kharab NIC</td></tr>
<tr><td>input errors</td><td>Receive errors ka total: runts, giants, CRC, frame, overrun, ignored, no buffer</td><td>Alag alag counters dekho</td></tr>
<tr><td>CRC</td><td>Pahunchne par calculate hua FCS frame ke FCS se match nahi hua: frame damaged tha</td><td>Kharab cable ya connector, interference, gandi fibre, fail hota optic, duplex mismatch (full side)</td></tr>
<tr><td>frame</td><td>CRC error plus aisa frame jo poore bytes ka nahi hai</td><td>CRC jaisa hi: physical damage ya collisions</td></tr>
<tr><td>overrun / ignored / no buffer</td><td>Frames itni tezi se aaye ki hardware ya buffers accept nahi kar paaye</td><td>Traffic bursts, broadcast storms, overloaded device</td></tr>
<tr><td>output errors</td><td>Un errors ka total jinhone frames transmit hone se roke</td><td>Collisions, late collisions, underruns dekho</td></tr>
<tr><td>collisions</td><td>Collision ki wajah se dobara bheje gaye frames</td><td>Sirf asli half-duplex segment par normal; warna mismatch</td></tr>
<tr><td>late collision</td><td>Pehle 64 bytes ke baad collision</td><td><b>Duplex mismatch</b>, ya bahut lamba cable ya segment</td></tr>
<tr><td>deferred</td><td>Frames jinhe intezaar karna pada kyunki medium busy tha</td><td>Half-duplex operation</td></tr>
<tr><td>output drops</td><td>Output queue bhari thi, frames discard hue</td><td>Congestion, jaise 1 Gbps port 100 Mbps port ko feed kar raha ho</td></tr>
<tr><td>interface resets / lost carrier</td><td>Interface reset hua ya signal gayab hua</td><td>Flap hota link, loose cable, far end reboot</td></tr>
</table>

<h3>Patterns jo matter karte hain</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Counter patterns aur unke causes">
<rect x="20" y="15" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="12">Ek side late collisions + dusri CRC, runts</text>
<rect x="330" y="15" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="13">Duplex mismatch</text>
<rect x="20" y="70" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="97" text-anchor="middle" class="svg-ink" font-size="12">Ek side CRC, collisions nahi, dono full</text>
<rect x="330" y="70" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="13">Cable, connector, optic, noise</text>
<rect x="20" y="125" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="152" text-anchor="middle" class="svg-ink" font-size="12">Output drops badh rahe, high txload</text>
<rect x="330" y="125" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="152" text-anchor="middle" class="svg-ink" font-size="13">Congestion ya speed step-down</text>
<rect x="20" y="180" width="290" height="45" rx="8" fill="#fde68a"/><text x="165" y="207" text-anchor="middle" class="svg-ink" font-size="12">Giants</text>
<rect x="330" y="180" width="290" height="45" rx="8" fill="#fed7aa"/><text x="475" y="207" text-anchor="middle" class="svg-ink" font-size="13">MTU mismatch</text>
</svg><p class="cap">Counters ko combinations ki tarah padho, link ke dono ends par.</p></div>
<ul>
<li><b>Duplex mismatch</b>: half-duplex side (R1) collisions aur <b>late collisions</b> dikhati hai; full-duplex side (SW1) <b>CRC</b>, <b>runts</b> aur input errors dikhati hai. Link up/up hai. CDP, agar chal raha ho, log karta hai <code>%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on FastEthernet0/0 (not full duplex), with SW1 FastEthernet0/1 (full duplex).</code></li>
<li><b>Physical fault</b>: sirf ek side par CRC aur input errors badh rahe, dono ends full duplex, collisions nahi. Damage us path par ho raha hai jo errors ginne wale device ki <b>taraf</b> aata hai: us direction ka cable pair, connector ya far end ka transmitter shak ke ghere mein hai.</li>
<li><b>Congestion</b>: output drops badh rahe, errors zero. Cable mein fault nahi; link chhota hai ya traffic bursty hai. QoS aur bade links iske fix hain.</li>
</ul>

<h3>Counters se abhi ki baat pata karo</h3>
<p>Counters last reload ya clear se cumulative hote hain. Pichhle mahine ke purane errors naye jaise hi dikhte hain. Isliye: values note karo, <b>clear</b> karo, traffic generate karo, aur phir dekho.</p>
<pre class="code">R1# clear counters fastEthernet 0/0
Clear "show interface" counters on this interface [confirm]
R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0 | include collision|CRC|clearing</pre>
<p>Catalyst switches par <code>show interfaces fa0/1 counters errors</code> ek compact table deta hai (Align-Err, FCS-Err, Late-Col, Runts, Giants aur aur bhi) jo ports ke beech compare karna aasaan banata hai.</p>

<div class="eg"><p><b>Worked example.</b> SW1 Gi1/0/24 se ek server: dono ends <code>a-full a-1000</code>. 10 minute mein input errors 0 se 2,310 ho gaye, sab CRC; collisions 0; server ka NIC koi receive errors nahi dikhata. Damage server se switch ki taraf jaane wale frames par hai. Aap patch cord badalte ho, counters clear karte ho, aur ek ghante baad bhi CRC 0 hai. Fixed, aur prove bhi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Last clearing" check kiye bina bade counter par react karna. Link ke sirf ek end ko dekhna. Output drops ko cable fault samajhna. Duplex mismatch log rokne ke liye CDP disable karna, jo symptom chhupata hai aur kuch fix nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Runts 64 bytes se chhote hain; giants maximum se bade. Late collisions duplex mismatch ki taraf ishara karte hain. Bina collisions ke CRC Layer 1 physical problems ki taraf. Full-duplex interface par kisi bhi tarah ke collisions zero hone chahiye.</p></div>

<div class="scn"><h4>Voice quality jo baarish mein girti thi</h4><p>Ek branch ne choppy calls report kiye, baarish wale dino mein aur bura. Branch switch se router tak ke uplink par sirf router side par hazaaron CRC errors the, dono ends full duplex aur koi collisions nahi. Copper run ek geeli ceiling space se power cable ke bagal se jaata tha. Counters clear karke dekhne se call ke dauraan CRC errors badhte confirm hue. Run ko fibre aur SFPs se badalne par errors poori tarah khatam ho gaye.</p><p><b>Seekh:</b> bina collisions ke CRC physical hai. Dhoondo ki damaged direction kahan se jaati hai aur medium fix karo.</p></div>

<div class="iv"><p class="q">"Interface par CRC errors dikh rahe hain. Aap kaise troubleshoot karoge?"</p><p>Strong answer: pehle <code>clear counters</code> aur traffic se use current banao. Dono ends ki speed aur duplex check karo; agar ek side par late collisions aur dusri par CRC aur runts hain, to duplex mismatch hai. Agar dono full hain aur sirf ek side CRC ginti hai, to us side ki taraf wali direction mein physical problem hai: patch cord reseat ya replace karo, cable test karo (Catalyst par TDR), fibre saaf karo, DOM light levels check karo, optic swap karo, dusra port try karo. Counters dobara clear karke aur unhe zero par rehte hue prove karke verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Runts 64 bytes se kam, giants maximum se zyada, CRC ka matlab damaged frame.</li>
<li>Ek side late collisions plus dusri side CRC aur runts ka matlab duplex mismatch.</li>
<li>Bina collisions ke CRC aur dono ends full duplex ka matlab physical problem.</li>
<li>Output drops ka matlab congestion, kharab cable nahi.</li>
<li>Hamesha <code>clear counters</code> karo, traffic generate karo aur re-check karo; dono ends compare karo.</li>
</ul></div>
`}};export{e as default};