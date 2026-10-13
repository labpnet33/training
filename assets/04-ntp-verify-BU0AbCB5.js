var e={id:`ntp-verify`,h:{en:`Verifying NTP: status, associations and the clock`,hi:`NTP verify karna: status, associations aur clock`},body:{en:`
<p>A pilot does not trust the cockpit clock just because it shows a number. She checks the instrument that says "GPS signal locked". NTP verification is the same: <code>show clock</code> shows a number, but <code>show ntp status</code> and <code>show ntp associations</code> tell you whether that number is locked to a trustworthy source. Three commands, read in this order, answer every NTP question.</p>

<h3>Command 1: show ntp status</h3>
<p>This is the one-line verdict. First line only, for most tickets:</p>
<pre class="out">R1# show ntp status
<span class="hl">Clock is synchronized, stratum 2, reference is 10.1.1.100</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 152300 (1/100 of seconds), resolution is 4000
reference time is EA7C1E9B.6E978D50 (08:35:31.432 UTC Tue Sep 29 2026)
clock offset is 0.4120 msec, root delay is 1.80 msec
root dispersion is 3.95 msec, peer dispersion is 2.30 msec
loopfilter state is 'CTRL' (Normal Controlled Loop), drift is 0.000000000 s/s
system poll interval is 64, last update was 21 sec ago.</pre>
<ul>
<li><b>synchronized / unsynchronized</b>: the verdict.</li>
<li><b>stratum 2</b>: this router's own stratum (server stratum + 1).</li>
<li><b>reference is</b>: the server it follows.</li>
<li><b>clock offset</b>: how far from the reference, in milliseconds. Small is good.</li>
</ul>
<p>The bad version looks like this:</p>
<pre class="out">R1# show ntp status
<span class="hl">Clock is unsynchronized, stratum 16, no reference clock</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 9100 (1/100 of seconds), resolution is 4000
reference time is 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)</pre>

<h3>Command 2: show ntp associations</h3>
<p>This lists every server or peer the router knows, and how it rates each one.</p>
<pre class="out">R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.1.12.1       10.1.1.100       2     21     64   377  1.212  -0.310  1.905</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<table class="cmp"><tr><th>Field</th><th>Meaning</th></tr>
<tr><td><code>*</code></td><td><b>sys.peer</b>: the server this router is actually synchronised to. Exactly one line should have it.</td></tr>
<tr><td><code>~</code></td><td><b>configured</b>: you typed this server in the config (as opposed to learned dynamically).</td></tr>
<tr><td><code>+</code> / <code>#</code></td><td>Candidate / selected: good servers that could take over.</td></tr>
<tr><td><code>-</code> / <code>x</code></td><td>Outlier / falseticker: rejected because its time disagrees with the others.</td></tr>
<tr><td>ref clock</td><td>What the server itself follows: <code>.GPS.</code> for a stratum-1 server, an IP address for a stratum-2 or higher server, <code>.LOCL.</code> for <code>ntp master</code>, <code>.INIT.</code> when nothing has been heard yet.</td></tr>
<tr><td>st</td><td>The <b>server's</b> stratum (yours is one higher).</td></tr>
<tr><td>when / poll</td><td>Seconds since the last reply / current poll interval.</td></tr>
<tr><td>reach</td><td>Octal record of the last 8 polls. <b>377</b> = all 8 answered, <b>0</b> = none.</td></tr>
<tr><td>delay / offset / disp</td><td>Round-trip time, clock difference and dispersion (error estimate), in ms.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reach register">
<text x="20" y="30" class="svg-ink" font-size="13">reach is an 8-bit shift register, shown in octal</text>
<rect x="20" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="80" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="140" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="200" y="50" width="60" height="36" fill="#e2e8f0"/>
<rect x="260" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="320" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="380" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="440" y="50" width="60" height="36" fill="#bbf7d0"/>
<text x="50" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="110" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="170" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="230" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="290" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="350" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="410" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="470" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="560" y="74" text-anchor="middle" class="svg-accent" font-size="14">= 17</text>
<text x="20" y="120" class="svg-muted" font-size="12">each poll shifts left; newest result enters on the right (1 = answered)</text>
<text x="20" y="145" class="svg-muted" font-size="12">1, 3, 7, 17, 37, 77, 177, 377 as a new server answers every poll</text>
</svg><p class="cap">Four successful polls give 00001111 binary = 17 octal. Eight give 377.</p></div>

<div class="eg"><p><b>Worked example.</b> You just configured R1 and read reach every minute: 1, 3, 7, 17. That is 1, 2, 3 and 4 answered polls in a row, so the path is healthy and sync is coming. Another router shows reach <b>376</b>: binary 11111110, the most recent poll was lost but the seven before it were fine, a single dropped packet. A router showing reach <b>0</b> with ref clock <code>.INIT.</code> and st <b>16</b> has never heard the server at all: wrong address, no route, or UDP 123 blocked.</p></div>

<h3>Command 3: show clock and show clock detail</h3>
<pre class="out">R1# show clock detail
<span class="hl">14:05:31.402 IST Tue Sep 29 2026</span>
<span class="hl">Time source is NTP</span></pre>
<p>Watch the first character of the time:</p>
<ul>
<li><b>No symbol</b>: time is authoritative (synchronised, or set and trusted).</li>
<li><b><code>*</code></b>: time is <b>not authoritative</b>, for example never set or never synchronised: <code>*00:12:31.017 UTC Mon Mar 1 1993</code>.</li>
<li><b><code>.</code></b>: time was synchronised but NTP has since lost its server; it is probably still close.</li>
</ul>
<p><code>show clock detail</code> adds the <b>time source</b>: <code>NTP</code>, <code>user configuration</code> (from <code>clock set</code>), <code>hardware calendar</code>, or <code>No time source</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Confusing the star in <code>show ntp associations</code> (good: this is the chosen server) with the star in <code>show clock</code> (bad: time not authoritative). Same symbol, opposite meaning.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>show ntp associations</code> the <b>st</b> column is the server's stratum; your router's stratum, shown in <code>show ntp status</code>, is one higher. Reach is octal, so 377 (not 255 or 11111111) means eight good polls.</p></div>

<div class="scn"><h4>Synchronised, but to the wrong server</h4><p>A bank's audit found that one core switch was 3 seconds different from the others. <code>show ntp status</code> said synchronized, so the first engineer closed the ticket. A second engineer read <code>show ntp associations</code>: three servers configured, the preferred internal server showed <code>x</code> (falseticker) and the switch had chosen a backup internet server as <code>*</code>. The internal server's GPS antenna had been disconnected and it was drifting; the switch correctly rejected it.</p><p><b>Lesson:</b> "synchronized" is not the end of the check. Look at which server has the star and why others are rejected.</p></div>

<div class="iv"><p class="q">"Walk me through the output of show ntp associations."</p><p>Strong answer: each line is a server or peer. <code>*</code> is the sys.peer we are synchronised to, <code>~</code> means configured, <code>+</code> candidate, <code>x</code> falseticker. Ref clock is what that server follows, st is its stratum, reach is an octal register of the last eight polls where 377 is perfect and 0 means never heard, and delay, offset, dispersion are in milliseconds. Then say that <code>show ntp status</code> gives the final verdict and your own stratum.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ntp status</code> first line: synchronized or not, own stratum, reference.</li>
<li>In associations, <code>*</code> = sys.peer (synchronised to), <code>~</code> = configured, <code>x</code> = falseticker.</li>
<li>Reach is octal: 377 = 8 good polls, 0 = never heard; .INIT. with st 16 = no reply yet.</li>
<li>In <code>show clock</code>, <code>*</code> = not authoritative, <code>.</code> = was synced but lost the server.</li>
<li><code>show clock detail</code> reveals the time source.</li>
</ul></div>
`,hi:`
<p>Pilot cockpit clock par sirf isliye bharosa nahi karti ki woh ek number dikha rahi hai. Woh woh instrument check karti hai jo kehta hai "GPS signal locked". NTP verification bhi aisa hi hai: <code>show clock</code> ek number dikhata hai, lekin <code>show ntp status</code> aur <code>show ntp associations</code> batate hain ki woh number kisi bharose layak source se locked hai ya nahi. Teen commands, is order mein padhe hue, har NTP sawaal ka jawab dete hain.</p>

<h3>Command 1: show ntp status</h3>
<p>Yeh ek line ka faisla hai. Zyada tar tickets ke liye sirf pehli line:</p>
<pre class="out">R1# show ntp status
<span class="hl">Clock is synchronized, stratum 2, reference is 10.1.1.100</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 152300 (1/100 of seconds), resolution is 4000
reference time is EA7C1E9B.6E978D50 (08:35:31.432 UTC Tue Sep 29 2026)
clock offset is 0.4120 msec, root delay is 1.80 msec
root dispersion is 3.95 msec, peer dispersion is 2.30 msec
loopfilter state is 'CTRL' (Normal Controlled Loop), drift is 0.000000000 s/s
system poll interval is 64, last update was 21 sec ago.</pre>
<ul>
<li><b>synchronized / unsynchronized</b>: faisla.</li>
<li><b>stratum 2</b>: is router ka apna stratum (server stratum + 1).</li>
<li><b>reference is</b>: woh server jise yeh follow karta hai.</li>
<li><b>clock offset</b>: reference se kitna door, milliseconds mein. Chhota achha hai.</li>
</ul>
<p>Kharab version aisa dikhta hai:</p>
<pre class="out">R1# show ntp status
<span class="hl">Clock is unsynchronized, stratum 16, no reference clock</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 9100 (1/100 of seconds), resolution is 4000
reference time is 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)</pre>

<h3>Command 2: show ntp associations</h3>
<p>Yeh har server ya peer list karta hai jo router jaanta hai, aur har ek ko kaise rate karta hai.</p>
<pre class="out">R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.1.12.1       10.1.1.100       2     21     64   377  1.212  -0.310  1.905</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<table class="cmp"><tr><th>Field</th><th>Matlab</th></tr>
<tr><td><code>*</code></td><td><b>sys.peer</b>: woh server jisse yeh router sach mein synchronised hai. Exactly ek line par hona chahiye.</td></tr>
<tr><td><code>~</code></td><td><b>configured</b>: yeh server aapne config mein type kiya (dynamically seekha hua nahi).</td></tr>
<tr><td><code>+</code> / <code>#</code></td><td>Candidate / selected: achhe servers jo jagah le sakte hain.</td></tr>
<tr><td><code>-</code> / <code>x</code></td><td>Outlier / falseticker: reject kiya kyunki iska time baaki sabse match nahi karta.</td></tr>
<tr><td>ref clock</td><td>Server khud kya follow karta hai: stratum-1 server ke liye <code>.GPS.</code>, stratum-2 ya upar ke server ke liye ek IP address, <code>ntp master</code> ke liye <code>.LOCL.</code>, aur jab ab tak kuch suna nahi gaya to <code>.INIT.</code>.</td></tr>
<tr><td>st</td><td><b>Server ka</b> stratum (aapka ek zyada hai).</td></tr>
<tr><td>when / poll</td><td>Last reply ke baad ke seconds / current poll interval.</td></tr>
<tr><td>reach</td><td>Pichhle 8 polls ka octal record. <b>377</b> = aathon ka jawab aaya, <b>0</b> = kisi ka nahi.</td></tr>
<tr><td>delay / offset / disp</td><td>Round-trip time, clock ka fark aur dispersion (error estimate), ms mein.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reach register">
<text x="20" y="30" class="svg-ink" font-size="13">reach ek 8-bit shift register hai, octal mein dikhaya jaata hai</text>
<rect x="20" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="80" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="140" y="50" width="60" height="36" fill="#e2e8f0"/><rect x="200" y="50" width="60" height="36" fill="#e2e8f0"/>
<rect x="260" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="320" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="380" y="50" width="60" height="36" fill="#bbf7d0"/><rect x="440" y="50" width="60" height="36" fill="#bbf7d0"/>
<text x="50" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="110" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="170" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="230" y="74" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="290" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="350" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="410" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="470" y="74" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="560" y="74" text-anchor="middle" class="svg-accent" font-size="14">= 17</text>
<text x="20" y="120" class="svg-muted" font-size="12">har poll left shift karta hai; naya result right se aata hai (1 = jawab aaya)</text>
<text x="20" y="145" class="svg-muted" font-size="12">naya server har poll ka jawab de to 1, 3, 7, 17, 37, 77, 177, 377</text>
</svg><p class="cap">Chaar successful polls se 00001111 binary = 17 octal. Aath se 377.</p></div>

<div class="eg"><p><b>Worked example.</b> Aapne abhi R1 configure kiya aur har minute reach padha: 1, 3, 7, 17. Yaani lagataar 1, 2, 3 aur 4 polls ka jawab aaya, path healthy hai aur sync aa raha hai. Doosra router reach <b>376</b> dikhata hai: binary 11111110, sabse naya poll kho gaya lekin usse pehle ke saat theek the, ek dropped packet. Jo router reach <b>0</b>, ref clock <code>.INIT.</code> aur st <b>16</b> dikhata hai, usne server ko kabhi suna hi nahi: galat address, route nahi, ya UDP 123 blocked.</p></div>

<h3>Command 3: show clock aur show clock detail</h3>
<pre class="out">R1# show clock detail
<span class="hl">14:05:31.402 IST Tue Sep 29 2026</span>
<span class="hl">Time source is NTP</span></pre>
<p>Time ka pehla character dekho:</p>
<ul>
<li><b>Koi symbol nahi</b>: time authoritative hai (synchronised, ya set aur trusted).</li>
<li><b><code>*</code></b>: time <b>authoritative nahi</b>, jaise kabhi set ya sync nahi hua: <code>*00:12:31.017 UTC Mon Mar 1 1993</code>.</li>
<li><b><code>.</code></b>: time synchronised tha lekin NTP ne baad mein apna server kho diya; shayad abhi bhi kareeb hai.</li>
</ul>
<p><code>show clock detail</code> <b>time source</b> bhi batata hai: <code>NTP</code>, <code>user configuration</code> (<code>clock set</code> se), <code>hardware calendar</code>, ya <code>No time source</code>.</p>

<div class="warn"><p><b>Common galti.</b> <code>show ntp associations</code> ke star (achha: yahi chuna gaya server hai) ko <code>show clock</code> ke star (bura: time authoritative nahi) se confuse karna. Same symbol, ulta matlab.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ntp associations</code> mein <b>st</b> column server ka stratum hai; aapke router ka stratum, jo <code>show ntp status</code> mein dikhta hai, ek zyada hai. Reach octal hai, isliye 377 (255 ya 11111111 nahi) matlab aath achhe polls.</p></div>

<div class="scn"><h4>Synchronised, lekin galat server se</h4><p>Ek bank ke audit mein mila ki ek core switch baaki sabse 3 second alag tha. <code>show ntp status</code> ne synchronized bola, isliye pehle engineer ne ticket band kar diya. Doosre engineer ne <code>show ntp associations</code> padha: teen servers configured, preferred internal server par <code>x</code> (falseticker) tha aur switch ne ek backup internet server ko <code>*</code> chuna tha. Internal server ka GPS antenna disconnect ho gaya tha aur woh drift kar raha tha; switch ne use sahi reject kiya.</p><p><b>Seekh:</b> "synchronized" check ka end nahi hai. Dekho star kis server par hai aur baaki kyun reject hue.</p></div>

<div class="iv"><p class="q">"show ntp associations ka output samjhaiye."</p><p>Strong answer: har line ek server ya peer hai. <code>*</code> sys.peer hai jisse hum synced hain, <code>~</code> matlab configured, <code>+</code> candidate, <code>x</code> falseticker. Ref clock woh hai jo woh server follow karta hai, st uska stratum hai, reach pichhle aath polls ka octal register hai jahan 377 perfect aur 0 matlab kabhi suna nahi, aur delay, offset, dispersion milliseconds mein hain. Phir bolo ki <code>show ntp status</code> final faisla aur aapka apna stratum deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ntp status</code> pehli line: synchronized ya nahi, apna stratum, reference.</li>
<li>Associations mein <code>*</code> = sys.peer (jisse synced), <code>~</code> = configured, <code>x</code> = falseticker.</li>
<li>Reach octal hai: 377 = 8 achhe polls, 0 = kabhi suna nahi; .INIT. aur st 16 = abhi tak koi reply nahi.</li>
<li><code>show clock</code> mein <code>*</code> = authoritative nahi, <code>.</code> = sync tha par server kho gaya.</li>
<li><code>show clock detail</code> time source batata hai.</li>
</ul></div>
`}};export{e as default};