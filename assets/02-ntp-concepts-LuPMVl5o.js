var e={id:`ntp-concepts`,h:{en:`How NTP works: stratum, modes and UTC`,hi:`NTP kaise kaam karta hai: stratum, modes aur UTC`},body:{en:`
<p>Picture an old railway network before radio. The main station in the capital has a very accurate clock. Every morning a messenger from each district station travels to the capital, notes the time, and carries it home. Smaller village halts then copy the time from their district station. The further a halt is from the capital, the more hand-offs its time has gone through, and the less anyone trusts it. <b>NTP</b> (Network Time Protocol) is that system, done automatically over UDP port 123 with millisecond accuracy, and it even measures how long the messenger took on the road.</p>

<h3>Two clocks inside a router</h3>
<p>A Cisco router has two time sources of its own:</p>
<dl class="terms">
<dt>Software clock (system clock)</dt><dd>The clock IOS actually uses for logs, certificates and <code>show clock</code>. It starts at boot and is what NTP disciplines.</dd>
<dt>Hardware calendar</dt><dd>A battery-backed chip on many routers and larger switches that keeps time while the device is off. At boot the software clock is loaded from it. Many small switches and virtual routers have no calendar, so they start at a default date (often 1993 or 2002) after every reload.</dd>
</dl>
<p>Neither is accurate on its own: crystals drift by seconds per day. NTP fixes this by comparing the software clock with a better one again and again.</p>

<h3>Stratum: distance from the reference</h3>
<p><b>Stratum</b> is a number that says how many NTP hops a device is from a true reference clock. Lower is better.</p>
<ul>
<li><b>Stratum 0</b>: the reference itself, such as a GPS receiver or an atomic clock. It is not on the network; it is wired to a server.</li>
<li><b>Stratum 1</b>: a server directly connected to a stratum-0 source. Also called a primary time server.</li>
<li><b>Stratum 2</b>: a device that learns time from a stratum-1 server over the network. Its clients become stratum 3, and so on up to 15.</li>
<li><b>Stratum 16</b>: means <b>unsynchronised</b>. A device at stratum 16 has no valid time to give, and no NTP client will synchronise to it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">GPS clock (st 0)</text>
<rect x="240" y="82" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="101" text-anchor="middle" class="svg-ink" font-size="13">NMS 10.1.1.100</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">stratum 1</text>
<rect x="240" y="160" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="13">R1 10.1.1.1</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">stratum 2</text>
<rect x="130" y="240" width="160" height="44" rx="8" fill="#bae6fd"/><text x="210" y="259" text-anchor="middle" class="svg-ink" font-size="13">R2 10.1.12.2</text><text x="210" y="276" text-anchor="middle" class="svg-muted" font-size="12">stratum 3</text>
<rect x="350" y="240" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="430" y="259" text-anchor="middle" class="svg-ink" font-size="13">Switches</text><text x="430" y="276" text-anchor="middle" class="svg-muted" font-size="12">stratum 3</text>
<line x1="320" y1="52" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="320" y1="126" x2="320" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="204" x2="220" y2="240" stroke="#64748b" stroke-width="2"/><line x1="350" y1="204" x2="420" y2="240" stroke="#64748b" stroke-width="2"/>
<text x="520" y="110" class="svg-accent" font-size="12">each hop adds 1</text>
</svg><p class="cap">The lab hierarchy: the NMS is stratum 1, R1 becomes stratum 2, R2 learns from R1 and becomes stratum 3.</p></div>

<h3>How one NTP exchange measures time</h3>
<p>The client does not simply ask "what time is it?", because the answer would be old by the time it arrived. Four timestamps are recorded:</p>
<ol>
<li><b>T1</b>: client sends the request (client clock).</li>
<li><b>T2</b>: server receives it (server clock).</li>
<li><b>T3</b>: server sends the reply (server clock).</li>
<li><b>T4</b>: client receives the reply (client clock).</li>
</ol>
<p>From these the client calculates the <b>round-trip delay</b> = (T4 − T1) − (T3 − T2) and the <b>offset</b> = ((T2 − T1) + (T3 − T4)) / 2. The offset is how far its own clock is from the server's. NTP then corrects the clock. Small errors are <b>slewed</b> (the clock runs slightly faster or slower until it catches up, so time never jumps backwards); large errors are <b>stepped</b> (set at once).</p>

<div class="eg"><p><b>Worked example.</b> R1's clock is 2 seconds slow. T1 = 10:00:00.000 (R1), T2 = 10:00:02.010 (server), T3 = 10:00:02.011 (server), T4 = 10:00:00.021 (R1).<br>Delay = (0.021 − 0.000) − (2.011 − 2.010) = 0.021 − 0.001 = <b>0.020 s</b> (20 ms round trip).<br>Offset = ((2.010 − 0.000) + (2.011 − 0.021)) / 2 = (2.010 + 1.990) / 2 = <b>2.000 s</b>. R1 must move its clock forward 2 seconds. The network delay cancels out because it is counted in both directions.</p></div>
<p>The client does this repeatedly. The <b>poll interval</b> starts at 64 seconds and grows up to 1024 seconds as the clock becomes stable. NTP needs several good samples before it declares itself synchronised, which is why sync takes a minute or more on real devices (in the simulator about 15 to 20 seconds).</p>

<h3>NTP modes on Cisco IOS</h3>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>What it does</th></tr>
<tr><td>Client / server</td><td><code>ntp server 10.1.1.100</code></td><td>This router is a client of that server. It never gives time back to it.</td></tr>
<tr><td>Server</td><td>(automatic)</td><td>Once synchronised, a Cisco router answers NTP requests from others at its own stratum + 1.</td></tr>
<tr><td>Master (own clock)</td><td><code>ntp master [stratum]</code></td><td>Trust the local clock and serve it, default stratum 8. For labs and isolated networks.</td></tr>
<tr><td>Symmetric active (peer)</td><td><code>ntp peer 10.1.12.2</code></td><td>Two devices at the same level synchronise each other; either can provide time if the other loses its source.</td></tr>
<tr><td>Broadcast client</td><td><code>ntp broadcast client</code> (interface)</td><td>Listens for time broadcast on a LAN. Rare today.</td></tr></table>

<h3>NTP always speaks UTC</h3>
<p>NTP carries <b>Coordinated Universal Time</b> only. There is no time zone in an NTP packet. A router in Pune and a router in London synchronised to the same server hold exactly the same internal time. The time zone is a <b>display setting</b> on each device (<code>clock timezone IST 5 30</code>), covered in the next chapter.</p>

<p><b>Versions.</b> NTPv3 and NTPv4 are both common; NTPv4 adds IPv6 support and better algorithms and is backward compatible. <b>SNTP</b> (Simple NTP) is a client-only subset found on some small switches: it can receive time but never serve it and uses simpler filtering.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>ntp master</code> on a router that also has <code>ntp server</code> pointing to a real source "as a backup" without understanding stratum. With <code>ntp master 3</code> the router may prefer its own free-running clock. If you need a fallback, use a high number such as <code>ntp master 10</code> so any real source wins.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stratum is not hop count in routing terms and not a quality score in seconds. It only counts NTP levels from the reference. Lower stratum is preferred. Stratum 16 = unsynchronised. Default stratum for <code>ntp master</code> is 8.</p></div>

<div class="scn"><h4>The router that told everyone the wrong time</h4><p>A branch engineer tested NTP by typing <code>ntp master 1</code> on the branch router, which had a manually set clock 40 minutes slow. He forgot to remove it. Four branch switches, pointed at the router, happily synchronised to stratum 2 and served the wrong time to IP phones. The headquarters syslog server showed branch events 40 minutes early. <code>show ntp associations</code> on a switch showed the reference clock <code>.LOCL.</code>, meaning a local, undisciplined clock.</p><p><b>Lesson:</b> <code>ntp master</code> makes a device an authority whether its clock is right or not. Only use it in labs or where no real source exists.</p></div>

<div class="iv"><p class="q">"What is NTP stratum and what does stratum 16 mean?"</p><p>Strong answer: stratum is the distance in NTP levels from a reference clock. Stratum 0 is the GPS or atomic source, stratum 1 is a server attached to it, each client is one higher than its server, up to 15. Stratum 16 means unsynchronised, so nobody syncs to that device. Add that NTP runs on UDP 123, carries UTC, and that a Cisco router serves time at its stratum + 1 once synchronised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP (UDP 123) corrects the software clock using four timestamps to compute offset and delay.</li>
<li>Stratum 0 is the reference, 1 is attached to it, each client adds 1; 16 = unsynchronised.</li>
<li><code>ntp server</code> = client; a synchronised Cisco router also serves time; <code>ntp master</code> trusts the local clock (default stratum 8); <code>ntp peer</code> = symmetric.</li>
<li>NTP carries only UTC; time zones are local display settings.</li>
<li>Poll interval grows from 64 to 1024 s; synchronisation takes several polls.</li>
</ul></div>
`,hi:`
<p>Radio se pehle ka ek purana railway network socho. Capital ke main station par ek bahut accurate clock hai. Har subah har district station ka ek messenger capital jaata hai, time note karta hai, aur ghar le aata hai. Chhote village halts phir apne district station se time copy karte hain. Halt capital se jitna door, uske time ne utne zyada hand-offs dekhe, aur us par utna kam bharosa. <b>NTP</b> (Network Time Protocol) yahi system hai, UDP port 123 par automatically, millisecond accuracy ke saath, aur yeh yeh bhi naapta hai ki messenger ko raaste mein kitna time laga.</p>

<h3>Router ke andar do clocks</h3>
<p>Cisco router ke paas apne do time sources hote hain:</p>
<dl class="terms">
<dt>Software clock (system clock)</dt><dd>Woh clock jo IOS logs, certificates aur <code>show clock</code> ke liye sach mein use karta hai. Yeh boot par start hoti hai aur NTP isi ko discipline karta hai.</dd>
<dt>Hardware calendar</dt><dd>Kai routers aur bade switches par battery-backed chip jo device band hone par bhi time rakhta hai. Boot par software clock isse load hoti hai. Kai chhote switches aur virtual routers mein calendar nahi hota, isliye woh har reload ke baad default date (aksar 1993 ya 2002) se start hote hain.</dd>
</dl>
<p>Dono mein se koi akele accurate nahi: crystals din mein kuch seconds drift karte hain. NTP software clock ko baar baar ek behtar clock se compare karke ise theek karta hai.</p>

<h3>Stratum: reference se doori</h3>
<p><b>Stratum</b> ek number hai jo batata hai ki device asli reference clock se kitne NTP hops door hai. Kam number behtar hai.</p>
<ul>
<li><b>Stratum 0</b>: khud reference, jaise GPS receiver ya atomic clock. Yeh network par nahi hota; ek server se wire se juda hota hai.</li>
<li><b>Stratum 1</b>: server jo seedha stratum-0 source se juda hai. Ise primary time server bhi kehte hain.</li>
<li><b>Stratum 2</b>: device jo network par stratum-1 server se time seekhta hai. Uske clients stratum 3 bante hain, aur aise hi 15 tak.</li>
<li><b>Stratum 16</b>: matlab <b>unsynchronised</b>. Stratum 16 wale device ke paas dene ke liye valid time nahi hota, aur koi NTP client usse sync nahi karega.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">GPS clock (st 0)</text>
<rect x="240" y="82" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="101" text-anchor="middle" class="svg-ink" font-size="13">NMS 10.1.1.100</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">stratum 1</text>
<rect x="240" y="160" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="13">R1 10.1.1.1</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">stratum 2</text>
<rect x="130" y="240" width="160" height="44" rx="8" fill="#bae6fd"/><text x="210" y="259" text-anchor="middle" class="svg-ink" font-size="13">R2 10.1.12.2</text><text x="210" y="276" text-anchor="middle" class="svg-muted" font-size="12">stratum 3</text>
<rect x="350" y="240" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="430" y="259" text-anchor="middle" class="svg-ink" font-size="13">Switches</text><text x="430" y="276" text-anchor="middle" class="svg-muted" font-size="12">stratum 3</text>
<line x1="320" y1="52" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="320" y1="126" x2="320" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="204" x2="220" y2="240" stroke="#64748b" stroke-width="2"/><line x1="350" y1="204" x2="420" y2="240" stroke="#64748b" stroke-width="2"/>
<text x="520" y="110" class="svg-accent" font-size="12">har hop +1 jodta hai</text>
</svg><p class="cap">Lab hierarchy: NMS stratum 1 hai, R1 stratum 2 banta hai, R2 R1 se seekhta hai aur stratum 3 banta hai.</p></div>

<h3>Ek NTP exchange time kaise naapta hai</h3>
<p>Client seedha "kitne baje hain?" nahi poochta, kyunki jawab pahunchte pahunchte purana ho jaayega. Chaar timestamps record hote hain:</p>
<ol>
<li><b>T1</b>: client request bhejta hai (client clock).</li>
<li><b>T2</b>: server use receive karta hai (server clock).</li>
<li><b>T3</b>: server reply bhejta hai (server clock).</li>
<li><b>T4</b>: client reply receive karta hai (client clock).</li>
</ol>
<p>Inse client <b>round-trip delay</b> = (T4 − T1) − (T3 − T2) aur <b>offset</b> = ((T2 − T1) + (T3 − T4)) / 2 calculate karta hai. Offset batata hai ki uski apni clock server se kitni door hai. Phir NTP clock ko correct karta hai. Chhoti errors ko <b>slew</b> kiya jaata hai (clock thodi tez ya dheemi chalti hai jab tak catch up na kare, isliye time kabhi peeche nahi koodta); badi errors ko <b>step</b> kiya jaata hai (ek dum set).</p>

<div class="eg"><p><b>Worked example.</b> R1 ki clock 2 second peeche hai. T1 = 10:00:00.000 (R1), T2 = 10:00:02.010 (server), T3 = 10:00:02.011 (server), T4 = 10:00:00.021 (R1).<br>Delay = (0.021 − 0.000) − (2.011 − 2.010) = 0.021 − 0.001 = <b>0.020 s</b> (20 ms round trip).<br>Offset = ((2.010 − 0.000) + (2.011 − 0.021)) / 2 = (2.010 + 1.990) / 2 = <b>2.000 s</b>. R1 ko apni clock 2 second aage karni hogi. Network delay cancel ho jaata hai kyunki woh dono directions mein gina jaata hai.</p></div>
<p>Client yeh baar baar karta hai. <b>Poll interval</b> 64 seconds se start hota hai aur clock stable hone par 1024 seconds tak badhta hai. NTP ko synchronised declare karne se pehle kai achhe samples chahiye, isliye real devices par sync mein ek minute ya zyada lagta hai (simulator mein lagbhag 15 se 20 seconds).</p>

<h3>Cisco IOS par NTP modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>Kya karta hai</th></tr>
<tr><td>Client / server</td><td><code>ntp server 10.1.1.100</code></td><td>Yeh router us server ka client hai. Use kabhi time wapas nahi deta.</td></tr>
<tr><td>Server</td><td>(automatic)</td><td>Sync hone ke baad Cisco router dusron ki NTP requests ka jawab apne stratum + 1 par deta hai.</td></tr>
<tr><td>Master (apni clock)</td><td><code>ntp master [stratum]</code></td><td>Local clock par bharosa karo aur use serve karo, default stratum 8. Labs aur isolated networks ke liye.</td></tr>
<tr><td>Symmetric active (peer)</td><td><code>ntp peer 10.1.12.2</code></td><td>Same level ke do devices ek dusre ko sync karte hain; agar ek ka source kho jaaye to doosra time de sakta hai.</td></tr>
<tr><td>Broadcast client</td><td><code>ntp broadcast client</code> (interface)</td><td>LAN par broadcast time sunta hai. Aaj kal rare.</td></tr></table>

<h3>NTP hamesha UTC bolta hai</h3>
<p>NTP sirf <b>Coordinated Universal Time</b> le jaata hai. NTP packet mein koi time zone nahi hota. Pune ka router aur London ka router, dono same server se synced, andar se bilkul same time rakhte hain. Time zone har device par ek <b>display setting</b> hai (<code>clock timezone IST 5 30</code>), jo agle chapter mein hai.</p>

<p><b>Versions.</b> NTPv3 aur NTPv4 dono common hain; NTPv4 IPv6 support aur behtar algorithms jodta hai aur backward compatible hai. <b>SNTP</b> (Simple NTP) ek client-only subset hai jo kuch chhote switches par milta hai: yeh time le sakta hai par kabhi serve nahi karta aur simple filtering use karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Jis router par pehle se real source ki taraf <code>ntp server</code> hai, us par "backup ke liye" <code>ntp master</code> laga dena, stratum samjhe bina. <code>ntp master 3</code> ke saath router apni free-running clock ko prefer kar sakta hai. Agar fallback chahiye, to <code>ntp master 10</code> jaisa bada number use karo taaki koi bhi real source jeete.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stratum routing wala hop count nahi hai aur seconds mein quality score bhi nahi. Yeh sirf reference se NTP levels ginta hai. Kam stratum prefer hota hai. Stratum 16 = unsynchronised. <code>ntp master</code> ka default stratum 8 hai.</p></div>

<div class="scn"><h4>Woh router jisne sabko galat time bataya</h4><p>Ek branch engineer ne NTP test karne ke liye branch router par <code>ntp master 1</code> type kiya, jiski manually set clock 40 minute peeche thi. Woh ise hatana bhool gaya. Router ki taraf point kiye chaar branch switches khushi se stratum 2 par sync ho gaye aur IP phones ko galat time serve kiya. Headquarters ke syslog server par branch events 40 minute pehle dikhe. Switch par <code>show ntp associations</code> mein reference clock <code>.LOCL.</code> dikha, yaani local, bina discipline wali clock.</p><p><b>Seekh:</b> <code>ntp master</code> device ko authority bana deta hai, uski clock sahi ho ya na ho. Ise sirf labs mein ya jahan koi real source na ho wahin use karo.</p></div>

<div class="iv"><p class="q">"NTP stratum kya hai aur stratum 16 ka matlab kya hai?"</p><p>Strong answer: stratum reference clock se NTP levels mein doori hai. Stratum 0 GPS ya atomic source hai, stratum 1 usse juda server, har client apne server se ek zyada, 15 tak. Stratum 16 matlab unsynchronised, isliye us device se koi sync nahi karta. Jodo ki NTP UDP 123 par chalta hai, UTC le jaata hai, aur sync hone ke baad Cisco router apne stratum + 1 par time serve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP (UDP 123) chaar timestamps se offset aur delay nikal kar software clock correct karta hai.</li>
<li>Stratum 0 reference hai, 1 usse juda, har client +1; 16 = unsynchronised.</li>
<li><code>ntp server</code> = client; synced Cisco router time serve bhi karta hai; <code>ntp master</code> local clock par bharosa karta hai (default stratum 8); <code>ntp peer</code> = symmetric.</li>
<li>NTP sirf UTC le jaata hai; time zones local display settings hain.</li>
<li>Poll interval 64 se 1024 s tak badhta hai; sync mein kai polls lagte hain.</li>
</ul></div>
`}};export{e as default};