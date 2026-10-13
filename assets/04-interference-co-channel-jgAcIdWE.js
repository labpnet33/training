var e={id:`interference-co-channel`,h:{en:`Interference, co-channel contention and the wl-co-channel lab`,hi:`Interference, co-channel contention aur wl-co-channel lab`},body:{en:`
<p>Interference is anything that stops a receiver from decoding the signal it wants. In Wi-Fi it comes in three families: co-channel interference, adjacent-channel interference and non-Wi-Fi interference. They look similar to users ("it is slow") but need different fixes. This chapter explains each and then walks through the first lab.</p>

<h3>How Wi-Fi shares a channel: CSMA/CA</h3>
<p>Wi-Fi radios use <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance). Before transmitting, a radio listens. If it hears another Wi-Fi signal above a threshold, it waits a random back-off time and tries again. Because radios cannot detect collisions while transmitting, they avoid them by politeness. The result is half duplex and shared: on one channel, only one device talks at a time, whether it is an AP or a client, in your network or the neighbour's.</p>

<h3>Co-channel interference (CCI)</h3>
<p><b>Co-channel interference</b> happens when two or more APs (or clients) that can hear each other use the <b>same</b> channel. Strictly this is not damage: the radios defer to each other correctly. The cost is <b>contention</b>: each AP gets only part of the airtime. If three APs share channel 6 and all hear each other, each gets at most about one third of the airtime, before any client traffic overhead. Beacons from every AP also add up: ten APs on one channel with ten SSIDs each can consume a large share of the channel just advertising themselves.</p>
<p>The cure is a <b>channel plan</b> that reuses channels only when APs are far apart or separated by walls. In 2.4 GHz this means 1, 6, 11 in a repeating pattern. In 5 GHz there are many more channels, so the reuse distance can be large.</p>

<h3>Adjacent-channel interference (ACI)</h3>
<p><b>Adjacent-channel interference</b> happens when APs use <i>different but overlapping</i> channels, such as 1 and 3, or 6 and 8. Their energy overlaps, but the radios cannot decode each other's frames, so the polite listen-before-talk rule does not work: they hear each other only as noise and transmit over each other, corrupting frames and causing retries. ACI is therefore usually <b>worse than co-channel</b>. This is why engineers say "pick 1, 6, 11 or the same channel, never in between". The lab model follows this physics: two 2.4 GHz radios overlap when their channel numbers differ by fewer than 5; in 5 GHz only the same channel overlaps. It labels the cases co-channel or adjacent-channel overlap.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three interference types">
<rect x="10" y="20" width="200" height="150" rx="8" fill="#bae6fd"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Co-channel</text>
<circle cx="70" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="70" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<circle cx="150" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="150" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<text x="110" y="156" text-anchor="middle" class="svg-muted" font-size="11">take turns (airtime shared)</text>
<rect x="225" y="20" width="200" height="150" rx="8" fill="#fed7aa"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">Adjacent-channel</text>
<circle cx="285" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="285" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<circle cx="365" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="365" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 8</text>
<text x="325" y="156" text-anchor="middle" class="svg-muted" font-size="11">cannot decode: corrupt each other</text>
<rect x="440" y="20" width="190" height="150" rx="8" fill="#ddd6fe"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Non-Wi-Fi</text>
<circle cx="500" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="500" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<rect x="545" y="82" width="60" height="36" rx="6" fill="#fff" stroke="#64748b"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="11">Microwave</text>
<text x="535" y="156" text-anchor="middle" class="svg-muted" font-size="11">noise raises the floor</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Fixes: channel plan, power, move or remove the source</text>
</svg><p class="cap">Three interference families and what each does to the channel.</p></div>

<h3>Non-Wi-Fi interference</h3>
<p>Microwave ovens, Bluetooth, cordless phones, baby monitors, wireless cameras and some LED drivers radiate in 2.4 GHz. They cannot be "politely" shared with; they raise the noise floor and lower SNR. A spectrum analyser (or controller features such as cleanair-style interference reports) shows them. The practical fix is moving critical clients to 5 or 6 GHz and removing or relocating the source. This is a concept; the lab does not simulate non-Wi-Fi sources.</p>

<h3>The wl-co-channel lab</h3>
<p>Staff complain about slow Wi-Fi near the boundary between AP1 and AP2. An engineer pinned both 2.4 GHz radios to channel 6 during a test and forgot. LAPTOP1 is a 2.4 GHz-only device. Your plan: prove the overlap, pin non-overlapping channels, prove the client still works.</p>
<pre class="code">WLC1# show ap dot11 24ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">6</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>Both radios are on channel 6 and at the highest power level 1, so they hear each other: a co-channel pair. Fix it in privileged mode:</p>
<pre class="code">WLC1# ap name AP1 dot11 24ghz channel 1
WLC1# ap name AP2 dot11 24ghz channel 6
WLC1# show ap dot11 24ghz summary</pre>
<pre class="out">AP1                  All      0011.2233.4401  Enabled   <span class="hl">1</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>Then prove the client works: from LAPTOP1 run <code>wifi status</code> (it must show NK-STAFF on 2.4 GHz in VLAN 20) and <code>ping 10.10.60.20</code>. Note that you ran <code>ap name</code> in privileged exec mode, not in configuration mode, and that the setting is a static pin: it is stored in the controller configuration and survives, which is also what a real static channel does.</p>
<div class="note"><p><b>Not simulated in the lab:</b> real DCA would normally pick these channels for you, and a real deployment normally prefers automatic channels over manual pins. Here the channels are deterministic so that every learner sees the same fault.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Choosing channels 1 and 3 "to avoid the same channel" (that is adjacent-channel, the worst case); pinning a channel and forgetting it, so RRM can no longer repair a later interference problem; assuming a slow network must be a power problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> Co-channel interference is shared airtime (radios cooperate); adjacent-channel interference is corruption (radios do not cooperate). ACI is generally the worse one.</p></div>

<div class="scn"><h4>Channel 6 everywhere</h4><p>A small office had all three APs on channel 6 after a vendor left manual settings. Speed tests were fine when one user tested, but at 10 am calls broke up. The summary table showed one channel for all APs. After setting 1, 6 and 11, calls were clear and total throughput tripled.</p><p><b>Lesson:</b> first read the radio table. Many "mysterious slowness" tickets are visible in one command.</p></div>

<div class="iv"><p class="q">"Is co-channel or adjacent-channel interference worse, and why?"</p><p>Adjacent-channel is usually worse. Co-channel radios can decode each other and take turns, so you lose airtime but not frames. Adjacent-channel radios cannot decode each other, so they transmit over one another and cause retries. Hence use non-overlapping channels only.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Open <b>Monitoring &gt; Wireless &gt; Radios &gt; 2.4 GHz</b> to see the channel of each AP radio and to pin a new channel on the radio row, then check the client in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi is half duplex CSMA/CA: only one transmitter per channel at a time.</li>
<li>Co-channel means shared airtime; adjacent-channel means corrupted frames.</li>
<li>In 2.4 GHz use 1, 6, 11; in lab 5 GHz only the same channel overlaps.</li>
<li>Non-Wi-Fi sources raise the noise floor; move clients to 5 or 6 GHz.</li>
<li>wl-co-channel fix: AP1 on channel 1, AP2 on channel 6, then prove LAPTOP1.</li>
</ul></div>
`,hi:`
<p>Interference woh kuch bhi hai jo receiver ko us signal ko decode karne se rokta hai jo use chahiye. Wi-Fi mein yeh teen families mein aata hai: co-channel interference, adjacent-channel interference aur non-Wi-Fi interference. Users ko sab ek jaisa lagta hai ("slow hai") lekin fixes alag chahiye. Yeh chapter har ek samjhata hai aur phir pehla lab walk through karta hai.</p>

<h3>Wi-Fi channel kaise share karta hai: CSMA/CA</h3>
<p>Wi-Fi radios <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance) use karte hain. Transmit karne se pehle radio sunta hai. Agar woh threshold se upar kisi aur Wi-Fi signal ko sunta hai, to random back-off time wait karke dobara koshish karta hai. Radios transmit karte waqt collision detect nahi kar sakte, isliye woh politeness se bachte hain. Natija half duplex aur shared hai: ek channel par ek time par sirf ek device bolta hai, chahe AP ho ya client, aapke network ka ho ya padosi ka.</p>

<h3>Co-channel interference (CCI)</h3>
<p><b>Co-channel interference</b> tab hota hai jab do ya zyada APs (ya clients) jo ek dusre ko sun sakte hain, <b>same</b> channel use karte hain. Strictly yeh damage nahi hai: radios sahi tareeke se ek dusre ko defer karte hain. Cost hai <b>contention</b>: har AP ko airtime ka sirf ek hissa milta hai. Agar teen APs channel 6 share karte hain aur sab ek dusre ko sunte hain, to har ek ko client traffic overhead se pehle bhi sirf lagbhag ek tihai airtime milta hai. Har AP ke beacons bhi jud jaate hain: ek channel par das APs, har ek 10 SSIDs ke saath, sirf apna prachar karne mein channel ka bada hissa kha sakte hain.</p>
<p>Ilaaj hai ek <b>channel plan</b> jo channels tabhi reuse karta hai jab APs door hon ya deewaron se alag hon. 2.4 GHz mein iska matlab 1, 6, 11 repeating pattern mein. 5 GHz mein bahut zyada channels hain, isliye reuse distance bada ho sakta hai.</p>

<h3>Adjacent-channel interference (ACI)</h3>
<p><b>Adjacent-channel interference</b> tab hota hai jab APs <i>alag lekin overlapping</i> channels use karte hain, jaise 1 aur 3, ya 6 aur 8. Unki energy overlap karti hai, lekin radios ek dusre ke frames decode nahi kar sakte, isliye polite listen-before-talk rule kaam nahi karta: woh ek dusre ko sirf noise ki tarah sunte hain aur ek dusre ke upar transmit karte hain, frames corrupt hote hain aur retries aate hain. Isliye ACI aam taur par <b>co-channel se bura</b> hota hai. Isi liye engineers kehte hain "1, 6, 11 chuno ya same channel, beech wala kabhi nahi". Lab model isi physics ko follow karta hai: do 2.4 GHz radios overlap karte hain jab channel numbers mein 5 se kam ka farak ho; 5 GHz mein sirf same channel overlap karta hai. Yeh cases co-channel ya adjacent-channel overlap ke naam se label hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen interference types">
<rect x="10" y="20" width="200" height="150" rx="8" fill="#bae6fd"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Co-channel</text>
<circle cx="70" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="70" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<circle cx="150" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="150" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<text x="110" y="156" text-anchor="middle" class="svg-muted" font-size="11">baari baari (airtime shared)</text>
<rect x="225" y="20" width="200" height="150" rx="8" fill="#fed7aa"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">Adjacent-channel</text>
<circle cx="285" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="285" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 6</text>
<circle cx="365" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="365" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP ch 8</text>
<text x="325" y="156" text-anchor="middle" class="svg-muted" font-size="11">decode nahi: ek dusre ko corrupt</text>
<rect x="440" y="20" width="190" height="150" rx="8" fill="#ddd6fe"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Non-Wi-Fi</text>
<circle cx="500" cy="100" r="30" fill="#fff" stroke="#64748b"/><text x="500" y="104" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<rect x="545" y="82" width="60" height="36" rx="6" fill="#fff" stroke="#64748b"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="11">Microwave</text>
<text x="535" y="156" text-anchor="middle" class="svg-muted" font-size="11">noise floor badhta hai</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Fixes: channel plan, power, source ko hatao ya move karo</text>
</svg><p class="cap">Teen interference families aur har ek channel ke saath kya karti hai.</p></div>

<h3>Non-Wi-Fi interference</h3>
<p>Microwave ovens, Bluetooth, cordless phones, baby monitors, wireless cameras aur kuch LED drivers 2.4 GHz mein radiate karte hain. Inke saath "politely" share nahi kiya ja sakta; woh noise floor badhate hain aur SNR girate hain. Spectrum analyser (ya controller ke cleanair-style interference reports) unhe dikhata hai. Practical fix hai critical clients ko 5 ya 6 GHz par le jaana aur source ko hatana ya relocate karna. Yeh concept hai; lab non-Wi-Fi sources simulate nahi karta.</p>

<h3>wl-co-channel lab</h3>
<p>Staff AP1 aur AP2 ki boundary ke paas slow Wi-Fi ki shikayat karte hain. Ek engineer ne test ke dauran dono 2.4 GHz radios ko channel 6 par pin kiya aur bhool gaya. LAPTOP1 2.4 GHz-only device hai. Aapka plan: overlap prove karo, non-overlapping channels pin karo, prove karo ki client ab bhi kaam karta hai.</p>
<pre class="code">WLC1# show ap dot11 24ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">6</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>Dono radios channel 6 par hain aur highest power level 1 par, isliye woh ek dusre ko sunte hain: co-channel pair. Privileged mode mein fix karo:</p>
<pre class="code">WLC1# ap name AP1 dot11 24ghz channel 1
WLC1# ap name AP2 dot11 24ghz channel 6
WLC1# show ap dot11 24ghz summary</pre>
<pre class="out">AP1                  All      0011.2233.4401  Enabled   <span class="hl">1</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>Phir prove karo ki client kaam karta hai: LAPTOP1 se <code>wifi status</code> chalao (NK-STAFF 2.4 GHz par VLAN 20 mein dikhna chahiye) aur <code>ping 10.10.60.20</code>. Dhyan do ki aapne <code>ap name</code> privileged exec mode mein chalaya, configuration mode mein nahi, aur setting ek static pin hai: yeh controller configuration mein store hoti hai, jo asli static channel bhi karta hai.</p>
<div class="note"><p><b>Lab mein simulate nahi hota:</b> real DCA aam taur par yeh channels aapke liye khud chun leta, aur real deployment mein manual pins ki jagah automatic channels prefer kiye jaate hain. Yahan channels deterministic hain taaki har learner ko wahi fault dikhe.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Same channel se bachne ke liye" channels 1 aur 3 chunna (yeh adjacent-channel hai, sabse bura case); channel pin karke bhool jaana, jisse RRM baad ki interference problem repair nahi kar paata; yeh maan lena ki slow network power ka problem hi hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> Co-channel interference shared airtime hai (radios cooperate karte hain); adjacent-channel interference corruption hai (radios cooperate nahi karte). ACI aam taur par zyada bura hota hai.</p></div>

<div class="scn"><h4>Har jagah channel 6</h4><p>Ek chhote office mein vendor ke jaane ke baad teeno APs channel 6 par manual settings ke saath rah gaye. Jab ek user speed test karta tha to sab theek, lekin subah 10 baje calls toot jaati thi. Summary table mein sab APs ke liye ek hi channel dikha. 1, 6 aur 11 set karne ke baad calls clear ho gayi aur total throughput teen guna ho gaya.</p><p><b>Seekh:</b> pehle radio table padho. Bahut saare "mysterious slowness" tickets ek command mein dikh jaate hain.</p></div>

<div class="iv"><p class="q">"Co-channel ya adjacent-channel interference mein kaunsa bura hai, aur kyun?"</p><p>Adjacent-channel aam taur par zyada bura hai. Co-channel radios ek dusre ko decode kar sakte hain aur baari lete hain, isliye airtime jaata hai lekin frames nahi. Adjacent-channel radios ek dusre ko decode nahi kar sakte, isliye ek dusre ke upar transmit karte hain aur retries hote hain. Isliye sirf non-overlapping channels use karo.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Monitoring &gt; Wireless &gt; Radios &gt; 2.4 GHz</b> kholo, wahan har AP radio ka channel dikhta hai aur radio row par naya channel pin hota hai, phir client <b>Monitoring &gt; Wireless &gt; Clients</b> mein check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi half duplex CSMA/CA hai: ek channel par ek time par ek transmitter.</li>
<li>Co-channel matlab shared airtime; adjacent-channel matlab corrupted frames.</li>
<li>2.4 GHz mein 1, 6, 11 use karo; lab 5 GHz mein sirf same channel overlap karta hai.</li>
<li>Non-Wi-Fi sources noise floor badhate hain; clients ko 5 ya 6 GHz par le jao.</li>
<li>wl-co-channel fix: AP1 channel 1 par, AP2 channel 6 par, phir LAPTOP1 prove karo.</li>
</ul></div>
`}};export{e as default};