var e={id:`markings-maps`,h:{en:`UP, DSCP and the CAPWAP tunnel: how a marking travels`,hi:`UP, DSCP aur CAPWAP tunnel: marking kaise safar karti hai`},body:{en:`
<p>A parcel travels through several companies. Each company has its own label system: one uses colours, the next uses numbers. At each hand-over somebody translates the label. If one translator is careless, the "urgent" sticker disappears and the parcel is treated as ordinary. Wireless QoS is the same: the air uses <b>User Priority (UP)</b>, the IP header uses <b>DSCP</b>, and the controller tunnel adds a second IP header. Every translation point can help or hurt.</p>

<h3>Two markings, one tunnel</h3>
<p>You know DSCP from the ENCOR QoS module: the 6-bit value in the IP header (EF is 46, AF41 is 34, CS1 is 8). On the air, a WMM frame carries the 3-bit <b>UP</b> from chapter 2. A Cisco AP in the default (local) mode sends client traffic to the controller inside a <b>CAPWAP</b> tunnel, and the tunnel packet has its own <b>outer IP header</b> with its own DSCP. So one voice packet has up to three markings: UP on air, the <b>inner DSCP</b> of the client packet, and the <b>outer DSCP</b> of the CAPWAP packet.</p>

<h3>Upstream: client to network</h3>
<ol>
<li>The client application marks DSCP. A phone marks voice as EF (46). A WMM client then derives the UP from the DSCP and picks the AC.</li>
<li>The AP receives the frame. If the AP join profile <b>trusts DSCP</b> (<code>qos-map trust-dscp</code>, the default from release 17.4 in this model), the inner DSCP is kept and copied to the outer header. If trust is off, the AP rebuilds DSCP from the UP and may lower it.</li>
<li>The CAPWAP packet crosses the switch. The switch port decides whether the outer DSCP survives (chapter 6).</li>
<li>The controller decapsulates the packet, applies the <b>input policy</b> of the policy profile, and sends the client packet on to the wired network.</li>
</ol>

<h3>Downstream: network to client</h3>
<ol>
<li>The server marks DSCP. It enters through the router port of the switch.</li>
<li>The controller applies the <b>output policy</b> (or a metal cap) and builds the CAPWAP packet; the outer DSCP is copied from the client packet.</li>
<li>The switch carries the tunnel to the AP; the controller port and AP port rules apply.</li>
<li>The AP maps DSCP to UP and picks the AC for the radio.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Markings through the tunnel">
<rect x="20" y="30" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">client</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46, UP 6</text>
<rect x="190" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">AP</text><text x="250" y="66" text-anchor="middle" class="svg-muted" font-size="12">trust-dscp</text>
<rect x="360" y="30" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="415" y="50" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="415" y="66" text-anchor="middle" class="svg-muted" font-size="12">in / out policy</text>
<rect x="520" y="30" width="100" height="44" rx="8" fill="#fed7aa"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">server</text><text x="570" y="66" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<line x1="140" y1="52" x2="190" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="360" y2="52" stroke="#64748b" stroke-width="2"/><line x1="470" y1="52" x2="520" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="110" width="280" height="50" rx="8" fill="#fde68a"/><text x="330" y="131" text-anchor="middle" class="svg-ink" font-size="13">CAPWAP packet</text><text x="330" y="149" text-anchor="middle" class="svg-muted" font-size="12">outer IP DSCP 46 | inner IP DSCP 46 | voice</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">The outer DSCP is what the campus switches see in the tunnel.</text>
</svg><p class="cap">Inside the tunnel the client DSCP is hidden: the switch reads only the outer header.</p></div>

<h3>The mapping tables of the lab model</h3>
<p>UP to DSCP (when a marking has to be built from the UP): UP 0 to 7 become DSCP 0, 8, 16, 24, 32, 40, 46, 56. DSCP to UP: 46 gives 6, 56 and above give 7, any other value uses the three high bits (DSCP divided by 8). Then UP gives the AC as in chapter 2.</p>
<table class="cmp"><tr><th>DSCP</th><th>Traffic</th><th>UP</th><th>AC</th></tr>
<tr><td>46 (EF)</td><td>voice</td><td>6</td><td>AC_VO</td></tr>
<tr><td>34 (AF41)</td><td>interactive video</td><td>4</td><td>AC_VI</td></tr>
<tr><td>24 (CS3)</td><td>signalling</td><td>3</td><td>AC_BE</td></tr>
<tr><td>0</td><td>best effort</td><td>0</td><td>AC_BE</td></tr>
<tr><td>8 (CS1)</td><td>scavenger</td><td>1</td><td>AC_BK</td></tr></table>
<div class="note"><p><b>Approximation:</b> real maps differ by release and AP profile, and RFC 8325 recommends some different pairs (for example AF41 to UP 5). The model uses fixed tables so the trace is predictable. On a real AP run <code>show dot11 qos</code> to read its own table. In the lab, the model values are the truth.</p></div>

<h3>Trust at the AP and the join profile</h3>
<p>With trust on, the AP keeps the client DSCP. With <code>no qos-map trust-dscp</code> in an AP join profile, the AP rebuilds DSCP from the UP. If the phone was WMM but the profile distrusts, you still get a sensible value. If the client had no WMM (UP 0), the DSCP collapses to 0. The default AP join profile cannot be edited in the lab: create your own profile to test.</p>
<pre class="code">ap profile AJP-LAB
 <span class="c">! trust is on by default; switch it off to test</span>
 no qos-map trust-dscp</pre>

<h3>Reading the trace</h3>
<pre class="out">PHONE1&gt; wifi qos trace
QoS trace for PHONE1 (application voice) on WLAN NK-VOICE (NK-VOICE) via AP1, policy profile PP-VOICE, WMM require

Upstream (client to server)
  1. Client PHONE1: application voice marks DSCP 46, WMM gives user priority 6 (AC_VO, voice)
  2. AP AP1: AP join profile trusts the client DSCP (qos-map trust-dscp), DSCP 46; CAPWAP outer header DSCP 46
  3. Switch (AP port, CAPWAP outer header): SW1 GigabitEthernet0/2: trust dscp, DSCP kept
  ...
Summary
  upstream on air   : AC_VO (as expected for voice)
  <span class="hl">upstream on wire  : DSCP 46 (marking kept)</span></pre>

<div class="eg"><p><b>Worked example.</b> A client sends DSCP 46 with WMM. UP = 6, AC_VO. On the downstream path the server sends 46, the controller keeps it, the outer DSCP is 46, the AP maps 46 to UP 6 and uses AC_VO. If instead the server sent DSCP 0 for the same call, the AP would use UP 0, AC_BE: the phone is prioritised upstream but not downstream. Both directions must be marked.</p></div>

<div class="warn"><p><b>Common mistakes:</b> assuming the client marking reaches the wire (the AP and every switch can change it), and forgetting that downstream marking is set by the <b>server side</b>, not by the phone.</p></div>
<div class="exam"><p><b>Exam trap:</b> the switch sees the <b>outer</b> CAPWAP DSCP on AP and controller ports, not the client DSCP. Upstream, the client DSCP reappears only after the controller decapsulates.</p></div>

<div class="scn"><h4>Unmarked guests, marked phones</h4><p>A site has an AP join profile that distrusts DSCP after a template change. Calls from non-WMM handsets keep losing priority end to end. The engineer runs the trace on a handset and sees "does not trust DSCP: DSCP is rebuilt from user priority". Restoring <code>qos-map trust-dscp</code> in a custom profile fixed the wired marking.</p><p><b>Lesson:</b> check the AP trust early in the path.</p></div>

<div class="iv"><p class="q">"Where does a voice marking get changed between the phone and the server?"</p><p>List the hops: the phone sets DSCP and UP, the AP trusts or rebuilds DSCP and copies it to the CAPWAP outer header, the switch ports trust or reset it, the controller applies input policy, and the switch and router ports may reset it again. Mention the same chain downstream.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Air uses UP; the wire uses DSCP; CAPWAP adds an outer DSCP.</li>
<li>Model maps: UP to DSCP 0, 8, 16, 24, 32, 40, 46, 56; DSCP 46 gives UP 6.</li>
<li>The AP trusts client DSCP by default; no qos-map trust-dscp breaks it.</li>
<li>Upstream and downstream are marked separately and must both be right.</li>
<li>Real maps vary: read the AP table with show dot11 qos.</li>
</ul></div>
`,hi:`
<p>Ek parcel kai companies se guzarta hai. Har company ka apna label system hai: ek rang use karti hai, agli numbers. Har hand-over par koi label translate karta hai. Agar ek translator laparwah ho, to "urgent" sticker gayab ho jaata hai aur parcel normal maan liya jaata hai. Wireless QoS bhi aisa hi hai: air <b>User Priority (UP)</b> use karta hai, IP header <b>DSCP</b>, aur controller tunnel ek doosra IP header jodta hai. Har translation point madad ya nuksan kar sakta hai.</p>

<h3>Do markings, ek tunnel</h3>
<p>DSCP aap ENCOR QoS module se jaante ho: IP header ki 6-bit value (EF 46 hai, AF41 34, CS1 8). Air par WMM frame chapter 2 wali 3-bit <b>UP</b> carry karta hai. Default (local) mode ka Cisco AP client traffic ko <b>CAPWAP</b> tunnel mein controller ko bhejta hai, aur tunnel packet ka apna <b>outer IP header</b> aur apna DSCP hota hai. Isliye ek voice packet par teen tak markings hoti hain: air par UP, client packet ka <b>inner DSCP</b>, aur CAPWAP packet ka <b>outer DSCP</b>.</p>

<h3>Upstream: client se network</h3>
<ol>
<li>Client application DSCP mark karti hai. Phone voice ko EF (46) mark karta hai. WMM client phir DSCP se UP nikalta hai aur AC chunta hai.</li>
<li>AP frame receive karta hai. Agar AP join profile <b>DSCP trust</b> karta hai (<code>qos-map trust-dscp</code>, is model mein release 17.4 se default), to inner DSCP rehta hai aur outer header mein copy hota hai. Trust off ho to AP UP se DSCP dobara banata hai aur kam kar sakta hai.</li>
<li>CAPWAP packet switch se guzarta hai. Switch port decide karta hai ki outer DSCP bachega ya nahi (chapter 6).</li>
<li>Controller packet decapsulate karta hai, policy profile ki <b>input policy</b> lagata hai, aur client packet ko wired network par bhejta hai.</li>
</ol>

<h3>Downstream: network se client</h3>
<ol>
<li>Server DSCP mark karta hai. Woh switch ke router port se andar aata hai.</li>
<li>Controller <b>output policy</b> (ya metal cap) lagata hai aur CAPWAP packet banata hai; outer DSCP client packet se copy hota hai.</li>
<li>Switch tunnel ko AP tak le jaata hai; controller port aur AP port ke rules lagte hain.</li>
<li>AP DSCP ko UP mein map karta hai aur radio ke liye AC chunta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tunnel se guzarti markings">
<rect x="20" y="30" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">client</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46, UP 6</text>
<rect x="190" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">AP</text><text x="250" y="66" text-anchor="middle" class="svg-muted" font-size="12">trust-dscp</text>
<rect x="360" y="30" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="415" y="50" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="415" y="66" text-anchor="middle" class="svg-muted" font-size="12">in / out policy</text>
<rect x="520" y="30" width="100" height="44" rx="8" fill="#fed7aa"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">server</text><text x="570" y="66" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<line x1="140" y1="52" x2="190" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="360" y2="52" stroke="#64748b" stroke-width="2"/><line x1="470" y1="52" x2="520" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="110" width="280" height="50" rx="8" fill="#fde68a"/><text x="330" y="131" text-anchor="middle" class="svg-ink" font-size="13">CAPWAP packet</text><text x="330" y="149" text-anchor="middle" class="svg-muted" font-size="12">outer IP DSCP 46 | inner IP DSCP 46 | voice</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Campus switches tunnel ke andar outer DSCP hi dekhte hain.</text>
</svg><p class="cap">Tunnel ke andar client DSCP chhupa rehta hai: switch sirf outer header padhta hai.</p></div>

<h3>Lab model ki mapping tables</h3>
<p>UP se DSCP (jab UP se marking banani ho): UP 0 se 7 ban jaate hain DSCP 0, 8, 16, 24, 32, 40, 46, 56. DSCP se UP: 46 ka 6, 56 aur usse upar ka 7, baaki values ke liye upar ke teen bits (DSCP ko 8 se divide). Phir UP se AC chapter 2 jaise.</p>
<table class="cmp"><tr><th>DSCP</th><th>Traffic</th><th>UP</th><th>AC</th></tr>
<tr><td>46 (EF)</td><td>voice</td><td>6</td><td>AC_VO</td></tr>
<tr><td>34 (AF41)</td><td>interactive video</td><td>4</td><td>AC_VI</td></tr>
<tr><td>24 (CS3)</td><td>signalling</td><td>3</td><td>AC_BE</td></tr>
<tr><td>0</td><td>best effort</td><td>0</td><td>AC_BE</td></tr>
<tr><td>8 (CS1)</td><td>scavenger</td><td>1</td><td>AC_BK</td></tr></table>
<div class="note"><p><b>Approximation:</b> real maps release aur AP profile ke hisaab se alag hote hain, aur RFC 8325 kuch alag pairs suggest karta hai (jaise AF41 se UP 5). Model fixed tables use karta hai taaki trace predictable rahe. Real AP par apni table padhne ke liye <code>show dot11 qos</code> chalao. Lab mein model ki values hi sach hain.</p></div>

<h3>AP aur join profile par trust</h3>
<p>Trust on ho to AP client DSCP rakhta hai. AP join profile mein <code>no qos-map trust-dscp</code> ho to AP UP se DSCP dobara banata hai. Agar phone WMM tha lekin profile distrust karta hai, tab bhi sensible value milti hai. Agar client mein WMM nahi tha (UP 0), to DSCP 0 par gir jaata hai. Default AP join profile lab mein edit nahi hota: test ke liye apna profile banao.</p>
<pre class="code">ap profile AJP-LAB
 <span class="c">! trust default mein on hai; test ke liye off karo</span>
 no qos-map trust-dscp</pre>

<h3>Trace padhna</h3>
<pre class="out">PHONE1&gt; wifi qos trace
QoS trace for PHONE1 (application voice) on WLAN NK-VOICE (NK-VOICE) via AP1, policy profile PP-VOICE, WMM require

Upstream (client to server)
  1. Client PHONE1: application voice marks DSCP 46, WMM gives user priority 6 (AC_VO, voice)
  2. AP AP1: AP join profile trusts the client DSCP (qos-map trust-dscp), DSCP 46; CAPWAP outer header DSCP 46
  3. Switch (AP port, CAPWAP outer header): SW1 GigabitEthernet0/2: trust dscp, DSCP kept
  ...
Summary
  upstream on air   : AC_VO (as expected for voice)
  <span class="hl">upstream on wire  : DSCP 46 (marking kept)</span></pre>

<div class="eg"><p><b>Worked example.</b> Client WMM ke saath DSCP 46 bhejta hai. UP = 6, AC_VO. Downstream path par server 46 bhejta hai, controller rakhta hai, outer DSCP 46 hai, AP 46 ko UP 6 mein map karta hai aur AC_VO use karta hai. Agar server usi call ke liye DSCP 0 bhejta, to AP UP 0, AC_BE use karta: phone upstream prioritised hai lekin downstream nahi. Dono direction mark honi chahiye.</p></div>

<div class="warn"><p><b>Common mistakes:</b> yeh maan lena ki client marking wire tak pahunchti hai (AP aur har switch use badal sakta hai), aur yeh bhoolna ki downstream marking <b>server side</b> set karta hai, phone nahi.</p></div>
<div class="exam"><p><b>Exam trap:</b> AP aur controller ports par switch <b>outer</b> CAPWAP DSCP dekhta hai, client DSCP nahi. Upstream mein client DSCP controller ke decapsulate karne ke baad hi wapas dikhta hai.</p></div>

<div class="scn"><h4>Unmarked guests, marked phones</h4><p>Ek site mein template change ke baad AP join profile DSCP distrust karta hai. Non-WMM handsets ki calls end to end priority khoti rehti hain. Engineer handset par trace chalata hai aur dekhta hai "does not trust DSCP: DSCP is rebuilt from user priority". Custom profile mein <code>qos-map trust-dscp</code> wapas lagane se wired marking theek hui.</p><p><b>Lesson:</b> path mein AP trust pehle check karo.</p></div>

<div class="iv"><p class="q">"Phone aur server ke beech voice marking kahan badal sakti hai?"</p><p>Hops gino: phone DSCP aur UP set karta hai, AP DSCP trust karta ya rebuild karta hai aur CAPWAP outer header mein copy karta hai, switch ports trust karte ya reset karte hain, controller input policy lagata hai, aur switch aur router ports phir reset kar sakte hain. Downstream mein bhi yahi chain batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Air UP use karta hai; wire DSCP; CAPWAP outer DSCP jodta hai.</li>
<li>Model maps: UP se DSCP 0, 8, 16, 24, 32, 40, 46, 56; DSCP 46 ka UP 6.</li>
<li>AP default mein client DSCP trust karta hai; no qos-map trust-dscp ise tod deta hai.</li>
<li>Upstream aur downstream alag mark hote hain aur dono sahi hone chahiye.</li>
<li>Real maps alag hote hain: AP table show dot11 qos se padho.</li>
</ul></div>
`}};export{e as default};