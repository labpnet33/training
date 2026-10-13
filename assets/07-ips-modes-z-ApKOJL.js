var e={id:`ips-modes`,h:{en:`IPS-only interface modes: inline set, inline tap, passive and fail-open`,hi:`IPS-only interface modes: inline set, inline tap, passive aur fail-open`},body:{en:`
<p>Think of three ways to guard a gate. A <b>guard standing in the gateway</b> checks everyone and can stop anyone, but if he faints, the gate is blocked. A <b>guard in the doorway who has been told only to take notes</b> watches the same people from the same spot, but never stops anyone. A <b>guard in the CCTV room</b> watches a video copy; he can raise an alarm but cannot touch anyone, and if he falls asleep nothing at the gate changes. These are Threat Defense's <b>inline set</b>, <b>inline tap</b> and <b>passive</b> modes. The design question is always the same: how much protection do you want, and what happens to traffic when the inspection engine fails?</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Inline set, inline tap and passive placement">
<text x="110" y="22" text-anchor="middle" class="svg-ink" font-size="13">Inline set</text>
<rect x="20" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="85" y="100" width="50" height="36" rx="6" fill="#fed7aa"/><text x="110" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<rect x="140" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="170" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="50" y1="76" x2="95" y2="100" stroke="#64748b" stroke-width="2"/><line x1="125" y1="100" x2="170" y2="76" stroke="#64748b" stroke-width="2"/>
<text x="110" y="160" text-anchor="middle" class="svg-accent" font-size="12">in path, can drop</text>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Inline tap</text>
<rect x="230" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="295" y="100" width="50" height="36" rx="6" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<rect x="350" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="260" y1="76" x2="305" y2="100" stroke="#64748b" stroke-width="2"/><line x1="335" y1="100" x2="380" y2="76" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">in path, copy only</text>
<text x="530" y="22" text-anchor="middle" class="svg-ink" font-size="13">Passive</text>
<rect x="440" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="470" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="560" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="590" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="500" y1="58" x2="560" y2="58" stroke="#64748b" stroke-width="2"/>
<rect x="445" y="100" width="50" height="36" rx="6" fill="#bbf7d0"/><text x="470" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<line x1="470" y1="76" x2="470" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="530" y="118" class="svg-muted" font-size="12">SPAN copy</text>
<text x="530" y="160" text-anchor="middle" class="svg-accent" font-size="12">out of path, detect</text>
<rect x="20" y="200" width="600" height="80" rx="10" fill="#ddd6fe"/>
<text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">If Snort or the box fails:</text>
<text x="320" y="247" text-anchor="middle" class="svg-muted" font-size="12">inline set: blocks unless fail-open / hardware bypass</text>
<text x="320" y="267" text-anchor="middle" class="svg-muted" font-size="12">inline tap: link still cabled through box | passive: traffic unaffected</text>
</svg><p class="cap">Three placements, three risk profiles.</p></div>

<h3>Inline set</h3>
<p>An <b>inline set</b> is one or more <b>interface pairs</b>. Traffic entering one interface of a pair leaves the other, like a piece of cable with Snort in the middle. The interfaces have no IP or MAC address visible to the network, there is no routing and no NAT, and neighbours cannot tell the device is there. Access control and intrusion rules still apply, so the device can <b>drop</b> packets, <b>reset</b> connections and <b>block</b> flows. This is a true <b>IPS</b>.</p>
<p>Inline set options that matter for design and the exam:</p>
<dl class="terms">
<dt>Tap mode</dt><dd>Turns the inline set into an <b>inline tap</b>: cabling stays in the path, but Snort works on a copy. Rules with a drop action only produce events marked "would have dropped".</dd>
<dt>Propagate link state</dt><dd>If one interface of a pair goes down, the other is brought down too, so the routers or switches on both sides see the failure and reroute.</dd>
<dt>Strict TCP enforcement</dt><dd>Drops TCP sessions that did not start with a proper three-way handshake, and packets that do not belong to a tracked session.</dd>
<dt>Snort fail-open</dt><dd>Chooses whether traffic passes uninspected when Snort is <b>busy</b> (overloaded) or <b>down</b> (for example during a restart after a deploy). Enabled = availability first; disabled = security first.</dd>
<dt>Hardware bypass</dt><dd>On fail-to-wire (FTW) network modules, the pair is physically connected when the device loses power or software, so traffic keeps flowing. It can also be forced for maintenance.</dd>
</dl>

<h3>Passive and passive ERSPAN</h3>
<p>A <b>passive</b> interface receives a copy of traffic from a switch <b>SPAN</b> port or a network <b>TAP</b>. The device is outside the path, so it can only <b>detect</b> (IDS). It cannot drop the real packet, and its failure has zero impact on traffic. <b>Passive ERSPAN</b> receives the copy inside GRE from a remote switch, so one sensor can watch a remote site; it needs the device in routed mode.</p>
<pre class="code"><span class="c">! access switch: copy the router uplink to the sensor port</span>
monitor session 1 source interface GigabitEthernet1/0/10 both
monitor session 1 destination interface GigabitEthernet1/0/24</pre>

<h3>Configuring in the Management Center</h3>
<ol>
<li>Devices, Device Management, edit the device, Interfaces: give each port a logical name and set its mode (None for inline pairs, Passive or ERSPAN for monitoring ports).</li>
<li>Assign a <b>security zone</b> of type <b>Inline</b> to inline ports, or <b>Passive</b> to passive ports.</li>
<li>Inline Sets tab: add the set, choose the interface pairs, then the Advanced options: tap mode, propagate link state, strict TCP, Snort fail-open, bypass.</li>
<li>Save and deploy; then attach access control and intrusion policies that reference those zones.</li>
</ol>
<pre class="out">&gt; show inline-set
Inline-set INLINE1
  Mtu is 1500 bytes
<span class="hl">  Fail-open for snort down is on</span>
  Fail-open for snort busy is off
<span class="hl">  Tap mode is off</span>
  Propagate-link-state option is on
  hardware-bypass mode is disabled
  Interface-Pair[1]:
    Interface: GigabitEthernet0/2 "in-lan"
      Current-Status: UP
    Interface: GigabitEthernet0/3 "in-rtr"
      Current-Status: UP</pre>

<table class="cmp"><tr><th>Mode</th><th>In path?</th><th>Can block?</th><th>Failure impact</th><th>Use</th></tr>
<tr><td>Inline set</td><td>yes</td><td>yes</td><td>blocks unless fail-open/bypass</td><td>production IPS</td></tr>
<tr><td>Inline tap</td><td>yes (cabling)</td><td>no, "would have dropped"</td><td>as inline set cabling</td><td>test a policy before enforcing</td></tr>
<tr><td>Passive</td><td>no (SPAN/TAP)</td><td>no</td><td>none</td><td>visibility, IDS, forensics</td></tr>
<tr><td>Passive ERSPAN</td><td>no (GRE copy)</td><td>no</td><td>none</td><td>monitor remote sites</td></tr></table>

<p>On a classic ASA, the same decision existed for the FirePOWER services module: traffic was redirected to it <i>inline</i> or <i>monitor-only</i>, with <code>fail-open</code> or <code>fail-close</code>.</p>

<div class="eg"><p><b>Worked example.</b> A bank wants a new intrusion policy on its internet link. Week 1: the pair Gi0/2 and Gi0/3 is cabled between the switch and the router as an inline set in <b>tap mode</b>. Events show 1,200 "would have dropped" hits, 40 of them on the payroll login, which is a false positive fixed by tuning. Week 2: tap mode is switched off in a change window; no recabling is needed. Snort fail-open for "down" is enabled because the link is business-critical and a deploy restart must not cut it; the risk team signs off on that trade-off.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing passive mode and then expecting the device to block attacks. A SPAN copy can only be observed. If blocking is a requirement, the device must be in the path: an inline set or a routed/transparent firewall interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> Inline tap and passive both only detect, but inline tap is <b>cabled in the path</b> and becomes an enforcing IPS by switching tap mode off, while passive needs recabling. Also, propagate link state is about link failure, not Snort failure.</p></div>

<div class="scn"><h4>The deploy that stopped the factory</h4><p>A manufacturer placed an inline set between the plant network and the office network with Snort fail-open disabled. Every policy deploy restarted Snort for a few seconds, and PLC sessions timed out, halting a production line twice in one week. The team enabled fail-open for "down" and scheduled deploys in maintenance windows. Security accepted a few seconds of uninspected traffic in exchange for availability.</p><p><b>Lesson:</b> fail-open is a business decision; document who accepted the risk.</p></div>

<div class="iv"><p class="q">"Explain the difference between inline, inline tap and passive IPS deployment."</p><p>Inline set: the device is in the path as a transparent pair and can drop, reset and block; failure blocks traffic unless fail-open or hardware bypass is configured. Inline tap: same cabling, but Snort sees a copy and only logs "would have dropped"; it is used to test policies and can be turned into inline without recabling. Passive: the device gets a SPAN or TAP copy, is out of the path, can only detect and has no impact on traffic if it fails. Mention propagate link state and strict TCP enforcement as inline set options.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inline set = IPS in the path, invisible pair, can block; no routing or NAT on it.</li>
<li>Tap mode = in the path but copy-only; switch it off later to enforce without recabling.</li>
<li>Passive (SPAN/TAP) and passive ERSPAN = IDS only, zero traffic impact.</li>
<li>Snort fail-open (busy/down) and hardware bypass trade security for availability.</li>
<li>Propagate link state brings the partner port down so neighbours reroute.</li>
</ul></div>
`,hi:`
<p>Gate ki raksha ke teen tareeke socho. <b>Gateway mein khada guard</b> sabko check karta hai aur kisi ko bhi rok sakta hai, lekin agar woh behosh ho jaaye, gate band ho jaata hai. <b>Darwaaze mein khada guard jise sirf notes lene ko kaha gaya hai</b> same jagah se same logon ko dekhta hai, lekin kabhi kisi ko nahi rokta. <b>CCTV room ka guard</b> video copy dekhta hai; woh alarm utha sakta hai lekin kisi ko chhoo nahi sakta, aur agar woh so jaaye to gate par kuch nahi badalta. Yeh Threat Defense ke <b>inline set</b>, <b>inline tap</b> aur <b>passive</b> modes hain. Design ka sawaal hamesha same hai: kitni protection chahiye, aur inspection engine fail hone par traffic ka kya hota hai?</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Inline set, inline tap aur passive placement">
<text x="110" y="22" text-anchor="middle" class="svg-ink" font-size="13">Inline set</text>
<rect x="20" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="85" y="100" width="50" height="36" rx="6" fill="#fed7aa"/><text x="110" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<rect x="140" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="170" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="50" y1="76" x2="95" y2="100" stroke="#64748b" stroke-width="2"/><line x1="125" y1="100" x2="170" y2="76" stroke="#64748b" stroke-width="2"/>
<text x="110" y="160" text-anchor="middle" class="svg-accent" font-size="12">path mein, drop kar sakta</text>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Inline tap</text>
<rect x="230" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="260" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="295" y="100" width="50" height="36" rx="6" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<rect x="350" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="260" y1="76" x2="305" y2="100" stroke="#64748b" stroke-width="2"/><line x1="335" y1="100" x2="380" y2="76" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">path mein, sirf copy</text>
<text x="530" y="22" text-anchor="middle" class="svg-ink" font-size="13">Passive</text>
<rect x="440" y="40" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="470" y="63" text-anchor="middle" class="svg-ink" font-size="12">SW</text>
<rect x="560" y="40" width="60" height="36" rx="6" fill="#bae6fd"/><text x="590" y="63" text-anchor="middle" class="svg-ink" font-size="12">RTR</text>
<line x1="500" y1="58" x2="560" y2="58" stroke="#64748b" stroke-width="2"/>
<rect x="445" y="100" width="50" height="36" rx="6" fill="#bbf7d0"/><text x="470" y="123" text-anchor="middle" class="svg-ink" font-size="12">FTD</text>
<line x1="470" y1="76" x2="470" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="530" y="118" class="svg-muted" font-size="12">SPAN copy</text>
<text x="530" y="160" text-anchor="middle" class="svg-accent" font-size="12">path se bahar, detect</text>
<rect x="20" y="200" width="600" height="80" rx="10" fill="#ddd6fe"/>
<text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Agar Snort ya box fail ho:</text>
<text x="320" y="247" text-anchor="middle" class="svg-muted" font-size="12">inline set: block karta hai jab tak fail-open / hardware bypass na ho</text>
<text x="320" y="267" text-anchor="middle" class="svg-muted" font-size="12">inline tap: link ab bhi box se cabled | passive: traffic par asar nahi</text>
</svg><p class="cap">Teen placements, teen risk profiles.</p></div>

<h3>Inline set</h3>
<p><b>Inline set</b> ek ya zyada <b>interface pairs</b> hai. Pair ke ek interface mein aane wala traffic doosre se nikalta hai, jaise beech mein Snort wala cable ka tukda. Interfaces ka koi IP ya MAC address network ko dikhta nahi, koi routing aur NAT nahi hota, aur neighbours bata nahi sakte ki device wahan hai. Access control aur intrusion rules phir bhi lagte hain, isliye device packets <b>drop</b>, connections <b>reset</b> aur flows <b>block</b> kar sakta hai. Yeh asli <b>IPS</b> hai.</p>
<p>Design aur exam ke liye zaroori inline set options:</p>
<dl class="terms">
<dt>Tap mode</dt><dd>Inline set ko <b>inline tap</b> bana deta hai: cabling path mein rehti hai, lekin Snort copy par kaam karta hai. Drop action wale rules sirf "would have dropped" marked events banate hain.</dd>
<dt>Propagate link state</dt><dd>Agar pair ka ek interface down ho, to doosra bhi down kiya jaata hai, taaki dono taraf ke routers ya switches failure dekhein aur reroute karein.</dd>
<dt>Strict TCP enforcement</dt><dd>Un TCP sessions ko drop karta hai jo sahi three-way handshake se shuru nahi hue, aur un packets ko jo kisi tracked session ke nahi hain.</dd>
<dt>Snort fail-open</dt><dd>Chunta hai ki Snort <b>busy</b> (overloaded) ya <b>down</b> (jaise deploy ke baad restart ke dauraan) hone par traffic bina inspection ke pass ho ya nahi. Enabled = availability pehle; disabled = security pehle.</dd>
<dt>Hardware bypass</dt><dd>Fail-to-wire (FTW) network modules par, device ki power ya software jaane par pair physically jud jaata hai, isliye traffic chalta rehta hai. Maintenance ke liye ise force bhi kiya ja sakta hai.</dd>
</dl>

<h3>Passive aur passive ERSPAN</h3>
<p><b>Passive</b> interface switch ke <b>SPAN</b> port ya network <b>TAP</b> se traffic ki copy leta hai. Device path se bahar hai, isliye woh sirf <b>detect</b> kar sakta hai (IDS). Woh asli packet drop nahi kar sakta, aur uske fail hone ka traffic par zero asar hai. <b>Passive ERSPAN</b> remote switch se GRE ke andar copy leta hai, isliye ek sensor remote site dekh sakta hai; iske liye device routed mode mein hona chahiye.</p>
<pre class="code"><span class="c">! access switch: router uplink ko sensor port par copy karo</span>
monitor session 1 source interface GigabitEthernet1/0/10 both
monitor session 1 destination interface GigabitEthernet1/0/24</pre>

<h3>Management Center mein configure karna</h3>
<ol>
<li>Devices, Device Management, device edit karo, Interfaces: har port ko logical name do aur mode set karo (inline pairs ke liye None, monitoring ports ke liye Passive ya ERSPAN).</li>
<li>Inline ports ko <b>Inline</b> type ka <b>security zone</b> do, ya passive ports ko <b>Passive</b>.</li>
<li>Inline Sets tab: set add karo, interface pairs chuno, phir Advanced options: tap mode, propagate link state, strict TCP, Snort fail-open, bypass.</li>
<li>Save aur deploy karo; phir un zones ko refer karne wali access control aur intrusion policies lagao.</li>
</ol>
<pre class="out">&gt; show inline-set
Inline-set INLINE1
  Mtu is 1500 bytes
<span class="hl">  Fail-open for snort down is on</span>
  Fail-open for snort busy is off
<span class="hl">  Tap mode is off</span>
  Propagate-link-state option is on
  hardware-bypass mode is disabled
  Interface-Pair[1]:
    Interface: GigabitEthernet0/2 "in-lan"
      Current-Status: UP
    Interface: GigabitEthernet0/3 "in-rtr"
      Current-Status: UP</pre>

<table class="cmp"><tr><th>Mode</th><th>Path mein?</th><th>Block kar sakta?</th><th>Failure ka asar</th><th>Use</th></tr>
<tr><td>Inline set</td><td>haan</td><td>haan</td><td>fail-open/bypass na ho to block</td><td>production IPS</td></tr>
<tr><td>Inline tap</td><td>haan (cabling)</td><td>nahi, "would have dropped"</td><td>inline set cabling jaisa</td><td>enforce se pehle policy test</td></tr>
<tr><td>Passive</td><td>nahi (SPAN/TAP)</td><td>nahi</td><td>koi nahi</td><td>visibility, IDS, forensics</td></tr>
<tr><td>Passive ERSPAN</td><td>nahi (GRE copy)</td><td>nahi</td><td>koi nahi</td><td>remote sites monitor</td></tr></table>

<p>Classic ASA par FirePOWER services module ke liye yahi faisla tha: traffic use <i>inline</i> ya <i>monitor-only</i> redirect hota tha, <code>fail-open</code> ya <code>fail-close</code> ke saath.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank apne internet link par nayi intrusion policy chahta hai. Week 1: pair Gi0/2 aur Gi0/3 switch aur router ke beech <b>tap mode</b> wale inline set ki tarah cabled hai. Events 1,200 "would have dropped" hits dikhate hain, jinme 40 payroll login par hain, jo tuning se theek hua false positive hai. Week 2: change window mein tap mode band hota hai; recabling nahi chahiye. "Down" ke liye Snort fail-open enabled hai kyunki link business-critical hai aur deploy restart use kaatna nahi chahiye; risk team is trade-off par sign off karti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Passive mode chunna aur phir umeed karna ki device attacks block karega. SPAN copy sirf dekhi ja sakti hai. Agar blocking requirement hai, device path mein hona chahiye: inline set ya routed/transparent firewall interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> Inline tap aur passive dono sirf detect karte hain, lekin inline tap <b>path mein cabled</b> hai aur tap mode band karke enforcing IPS ban jaata hai, jabki passive ko recabling chahiye. Aur propagate link state link failure ke baare mein hai, Snort failure ke baare mein nahi.</p></div>

<div class="scn"><h4>Deploy jisne factory rok di</h4><p>Ek manufacturer ne plant network aur office network ke beech Snort fail-open disabled ke saath inline set lagaya. Har policy deploy Snort ko kuch seconds ke liye restart karta tha, aur PLC sessions timeout ho jaate the, jisne ek hafte mein do baar production line rok di. Team ne "down" ke liye fail-open enable kiya aur deploys maintenance windows mein schedule kiye. Security ne availability ke badle kuch seconds ka bina inspection traffic accept kiya.</p><p><b>Seekh:</b> fail-open business decision hai; document karo ki risk kisne accept kiya.</p></div>

<div class="iv"><p class="q">"Inline, inline tap aur passive IPS deployment mein fark samjhao."</p><p>Inline set: device transparent pair ki tarah path mein hai aur drop, reset aur block kar sakta hai; fail-open ya hardware bypass configured na ho to failure traffic block karta hai. Inline tap: same cabling, lekin Snort copy dekhta hai aur sirf "would have dropped" log karta hai; policies test karne ke liye use hota hai aur bina recabling ke inline banaya ja sakta hai. Passive: device ko SPAN ya TAP copy milti hai, path se bahar hai, sirf detect kar sakta hai aur fail hone par traffic par koi asar nahi. Inline set options ki tarah propagate link state aur strict TCP enforcement batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inline set = path mein IPS, invisible pair, block kar sakta hai; is par routing ya NAT nahi.</li>
<li>Tap mode = path mein lekin copy-only; baad mein band karke bina recabling enforce karo.</li>
<li>Passive (SPAN/TAP) aur passive ERSPAN = sirf IDS, traffic par zero asar.</li>
<li>Snort fail-open (busy/down) aur hardware bypass security ke badle availability dete hain.</li>
<li>Propagate link state partner port ko down karta hai taaki neighbours reroute karein.</li>
</ul></div>
`}};export{e as default};