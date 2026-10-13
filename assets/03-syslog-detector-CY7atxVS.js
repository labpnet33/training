var e={id:`syslog-detector`,h:{en:`The syslog event detector and regular expressions`,hi:`Syslog event detector aur regular expressions`},body:{en:`
<p>Imagine a post-office sorter who reads the first line of every letter and pulls out any letter that contains the words "urgent: water leak". The sorter does not care who sent it or which floor it is for; only the phrase matters. If you tell the sorter to look for just "leak", they will also pull out letters about "data leak" and "leaky roof". The <b>syslog event detector</b> is that sorter, and the phrase is a <b>regular expression</b>.</p>

<h3>How the syslog detector works</h3>
<p>Every message that IOS generates (link changes, OSPF adjacencies, configuration changes, your own EEM messages) passes through the logging process. The syslog detector compares the text of each message with the patterns of all registered syslog applets. The pattern can match <b>anywhere</b> in the message; you do not need to match the whole line. When it matches, the applet runs and the full message text is available in the <b>_syslog_msg built-in variable</b>.</p>
<pre class="code">event syslog pattern "REGEX" [occurs N] [period SECONDS] [priority LEVEL] [maxrun SECONDS]
<span class="c">! occurs N period S  : run only after N matches inside S seconds</span>
<span class="c">! priority LEVEL     : screen messages by severity (default all)</span></pre>

<h3>Just enough regular expressions</h3>
<table class="cmp"><tr><th>Symbol</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>.</code></td><td>any single character</td><td><code>0.0</code> matches 0/0 and 0.0</td></tr>
<tr><td><code>*</code></td><td>zero or more of the previous item</td><td><code>.*</code> matches anything</td></tr>
<tr><td><code>+</code></td><td>one or more of the previous item</td><td><code>[0-9]+</code> matches 7 or 4094</td></tr>
<tr><td><code>[ ]</code></td><td>one character from a set</td><td><code>[0-3]</code></td></tr>
<tr><td><code>^ $</code></td><td>start and end of the string</td><td>rarely needed for syslog</td></tr>
<tr><td><code>|</code> and <code>( )</code></td><td>alternatives and grouping</td><td><code>(up|down)</code></td></tr>
<tr><td><code>\\</code></td><td>take the next character literally</td><td><code>0/0\\.100</code></td></tr></table>

<h3>What happens when a WAN link fails</h3>
<p>When the ISP side of the primary circuit goes down, BRANCH logs two messages for the same interface:</p>
<pre class="out">*Sep 30 02:14:05.221: %LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down
<span class="hl">*Sep 30 02:14:06.221: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down</span></pre>
<p>A lazy pattern such as <code>GigabitEthernet0/0, changed state to down</code> matches <b>both</b> lines, so the applet runs twice for one failure. Adding the mnemonic makes it run once:</p>
<pre class="code">BRANCH(config)# event manager applet UPLINK-DOWN
BRANCH(config-applet)# event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"</pre>
<p>Read the pattern left to right: the literal mnemonic <code>LINEPROTO-5-UPDOWN</code>, then <code>.*</code> (any text, here ": Line protocol on Interface "), then the interface name followed by a <b>comma</b>, then the exact phrase. The comma matters: it stops the pattern matching <code>GigabitEthernet0/0.100</code> subinterfaces or <code>GigabitEthernet0/0/0</code>. The word <code>down</code> at the end stops it matching the "changed state to up" message.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pattern filter">
<rect x="20" y="20" width="360" height="30" rx="6" fill="#bbf7d0"/><text x="30" y="40" class="svg-ink" font-size="12">LINEPROTO ... Gi0/0, changed state to down</text>
<rect x="20" y="60" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="80" class="svg-ink" font-size="12">LINK-3-UPDOWN ... Gi0/0, changed state to down</text>
<rect x="20" y="100" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="120" class="svg-ink" font-size="12">LINEPROTO ... Gi0/0, changed state to up</text>
<rect x="20" y="140" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="160" class="svg-ink" font-size="12">LINEPROTO ... Gi0/2, changed state to down</text>
<rect x="420" y="70" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="520" y="96" text-anchor="middle" class="svg-ink" font-size="13">UPLINK-DOWN pattern</text><text x="520" y="116" text-anchor="middle" class="svg-muted" font-size="12">1 match of 4</text>
<line x1="380" y1="35" x2="420" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="200" y="200" text-anchor="middle" class="svg-accent" font-size="12">green = runs the applet, grey = ignored</text>
</svg><p class="cap">Four real messages, one match: the pattern needs the mnemonic, the interface with its comma, and the word down.</p></div>

<div class="eg"><p><b>Worked example.</b> Test each message against <code>LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down</code>:</p>
<ul>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down</code> → <b>match</b>.</li>
<li><code>%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down</code> → no (mnemonic differs).</li>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up</code> → no (ends in up).</li>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down</code> → no (0/2).</li>
</ul></div>

<h3>Counting: occurs and period</h3>
<p>Some problems are only interesting when they repeat. An interface that flaps three times in a minute is a physical problem; one down event may be a planned change. Use <code>occurs</code> and <code>period</code>:</p>
<pre class="code">event manager applet GI00-FLAP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down" occurs 3 period 60
 action 1.0 syslog priority warnings msg "Gi0/0 flapped 3 times in 60 seconds"</pre>

<h3>Using the matched message</h3>
<p>Inside the actions, the full text of the matching message is in <code>$_syslog_msg</code>. You can log it, mail it or pick parts out of it with the regexp action (chapter 7).</p>
<pre class="code"> action 2.0 syslog msg "Trigger was: $_syslog_msg"</pre>

<div class="warn"><p><b>Common mistake.</b> A self-triggering loop. If an applet watches <code>LINEPROTO-5-UPDOWN.*down</code> and logs <code>$_syslog_msg</code>, its own output is <code>%HA_EM-6-LOG: NAME: Trigger was: %LINEPROTO-5-UPDOWN ... down</code>, which contains the pattern again. The applet triggers itself forever. Never let an applet's output match its own pattern.</p></div>

<div class="exam"><p><b>Exam trap.</b> The pattern is a regular expression, not plain text. A dot matches any character, so <code>0/0.1</code> also matches <code>0/0/1</code>. Also remember that a local <code>shutdown</code> on Gi0/0 produces <code>%LINK-5-CHANGED ... administratively down</code> <b>and</b> a LINEPROTO down message, so the lab applet also fires during planned maintenance.</p></div>

<div class="scn"><h4>The weekend bill</h4><p>A network engineer in Pune shut the primary interface of a branch router on Friday evening for a planned circuit migration. The LINEPROTO down message matched the backup applet, which enabled the metered 4G interface. The migration finished in an hour, but nothing shut the backup again, and the branch ran on 4G the whole weekend. The bill was eleven times the normal month. The fix was an environment variable <code>_maint</code>, checked with an <code>if</code> action at the top of the applet, and a second applet that shuts the backup when the primary returns.</p><p><b>Lesson:</b> list every message your pattern matches, including the ones your own team creates on purpose.</p></div>

<div class="iv"><p class="q">"How would you trigger an EEM applet only when GigabitEthernet0/0 loses line protocol?"</p><p>Strong answer: use the syslog detector with a specific regular expression: <code>event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"</code>. Explain why each part is there: the mnemonic avoids the duplicate LINK message, the comma avoids subinterfaces, and "down" avoids the up message. Bonus: mention <code>occurs</code>/<code>period</code> for flaps and a track event as a more robust alternative.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The syslog detector matches a regular expression anywhere in each log message.</li>
<li>A link failure logs LINK and LINEPROTO messages; include the mnemonic to fire once.</li>
<li>End the interface name with its comma to avoid subinterfaces and similar names.</li>
<li><code>occurs N period S</code> fires only after N matches in S seconds.</li>
<li>The matched text is in the _syslog_msg built-in variable; never let your output re-match your pattern.</li>
</ul></div>
`,hi:`
<p>Ek post-office sorter socho jo har letter ki pehli line padhta hai aur jis letter mein "urgent: water leak" likha ho use nikaal leta hai. Sorter ko farak nahi padta ki kisne bheja ya kis floor ke liye hai; sirf phrase matter karta hai. Agar aap sorter ko sirf "leak" dhoondhne ko kaho, to woh "data leak" aur "leaky roof" wale letters bhi nikaal lega. <b>Syslog event detector</b> wahi sorter hai, aur phrase ek <b>regular expression</b> hai.</p>

<h3>Syslog detector kaise kaam karta hai</h3>
<p>IOS jo bhi message banata hai (link changes, OSPF adjacencies, configuration changes, aapke apne EEM messages) woh logging process se guzarta hai. Syslog detector har message ke text ko saare registered syslog applets ke patterns se compare karta hai. Pattern message mein <b>kahin bhi</b> match ho sakta hai; poori line match karna zaroori nahi. Match hone par applet chalta hai aur message ka poora text <b>_syslog_msg built-in variable</b> mein milta hai.</p>
<pre class="code">event syslog pattern "REGEX" [occurs N] [period SECONDS] [priority LEVEL] [maxrun SECONDS]
<span class="c">! occurs N period S  : S second ke andar N matches ke baad hi chalo</span>
<span class="c">! priority LEVEL     : severity se messages filter karo (default all)</span></pre>

<h3>Bas utne regular expressions jitne chahiye</h3>
<table class="cmp"><tr><th>Symbol</th><th>Matlab</th><th>Example</th></tr>
<tr><td><code>.</code></td><td>koi bhi ek character</td><td><code>0.0</code> 0/0 aur 0.0 dono match karta hai</td></tr>
<tr><td><code>*</code></td><td>pichhle item ke zero ya zyada</td><td><code>.*</code> kuch bhi match karta hai</td></tr>
<tr><td><code>+</code></td><td>pichhle item ke ek ya zyada</td><td><code>[0-9]+</code> 7 ya 4094 match karta hai</td></tr>
<tr><td><code>[ ]</code></td><td>set mein se ek character</td><td><code>[0-3]</code></td></tr>
<tr><td><code>^ $</code></td><td>string ka start aur end</td><td>syslog ke liye kam hi chahiye</td></tr>
<tr><td><code>|</code> aur <code>( )</code></td><td>alternatives aur grouping</td><td><code>(up|down)</code></td></tr>
<tr><td><code>\\</code></td><td>agle character ko literally lo</td><td><code>0/0\\.100</code></td></tr></table>

<h3>WAN link fail hone par kya hota hai</h3>
<p>Jab primary circuit ki ISP side down hoti hai, BRANCH same interface ke liye do messages log karta hai:</p>
<pre class="out">*Sep 30 02:14:05.221: %LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down
<span class="hl">*Sep 30 02:14:06.221: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down</span></pre>
<p><code>GigabitEthernet0/0, changed state to down</code> jaisa aalsi pattern <b>dono</b> lines match karta hai, isliye ek failure par applet do baar chalta hai. Mnemonic jodne se woh ek baar chalta hai:</p>
<pre class="code">BRANCH(config)# event manager applet UPLINK-DOWN
BRANCH(config-applet)# event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"</pre>
<p>Pattern ko baayein se daayein padho: literal mnemonic <code>LINEPROTO-5-UPDOWN</code>, phir <code>.*</code> (koi bhi text, yahan ": Line protocol on Interface "), phir interface ka naam aur uske baad <b>comma</b>, phir exact phrase. Comma zaroori hai: yeh pattern ko <code>GigabitEthernet0/0.100</code> subinterfaces ya <code>GigabitEthernet0/0/0</code> se match hone se rokta hai. Aakhir ka shabd <code>down</code> ise "changed state to up" message se match hone se rokta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pattern filter">
<rect x="20" y="20" width="360" height="30" rx="6" fill="#bbf7d0"/><text x="30" y="40" class="svg-ink" font-size="12">LINEPROTO ... Gi0/0, changed state to down</text>
<rect x="20" y="60" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="80" class="svg-ink" font-size="12">LINK-3-UPDOWN ... Gi0/0, changed state to down</text>
<rect x="20" y="100" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="120" class="svg-ink" font-size="12">LINEPROTO ... Gi0/0, changed state to up</text>
<rect x="20" y="140" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="30" y="160" class="svg-ink" font-size="12">LINEPROTO ... Gi0/2, changed state to down</text>
<rect x="420" y="70" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="520" y="96" text-anchor="middle" class="svg-ink" font-size="13">UPLINK-DOWN pattern</text><text x="520" y="116" text-anchor="middle" class="svg-muted" font-size="12">4 mein se 1 match</text>
<line x1="380" y1="35" x2="420" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="200" y="200" text-anchor="middle" class="svg-accent" font-size="12">green = applet chalata hai, grey = ignore</text>
</svg><p class="cap">Chaar asli messages, ek match: pattern ko mnemonic, comma ke saath interface, aur shabd down chahiye.</p></div>

<div class="eg"><p><b>Worked example.</b> Har message ko <code>LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down</code> se test karo:</p>
<ul>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down</code> → <b>match</b>.</li>
<li><code>%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down</code> → nahi (mnemonic alag).</li>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up</code> → nahi (up par khatam).</li>
<li><code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down</code> → nahi (0/2).</li>
</ul></div>

<h3>Ginti: occurs aur period</h3>
<p>Kuch problems tabhi interesting hain jab woh repeat hon. Jo interface ek minute mein teen baar flap kare woh physical problem hai; ek down event planned change bhi ho sakta hai. <code>occurs</code> aur <code>period</code> use karo:</p>
<pre class="code">event manager applet GI00-FLAP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down" occurs 3 period 60
 action 1.0 syslog priority warnings msg "Gi0/0 flapped 3 times in 60 seconds"</pre>

<h3>Match hua message use karna</h3>
<p>Actions ke andar matching message ka poora text <code>$_syslog_msg</code> mein hota hai. Aap use log kar sakte ho, mail kar sakte ho ya regexp action se uske hisse nikaal sakte ho (chapter 7).</p>
<pre class="code"> action 2.0 syslog msg "Trigger was: $_syslog_msg"</pre>

<div class="warn"><p><b>Common galti.</b> Khud ko trigger karne wala loop. Agar applet <code>LINEPROTO-5-UPDOWN.*down</code> dekhta hai aur <code>$_syslog_msg</code> log karta hai, to uska apna output <code>%HA_EM-6-LOG: NAME: Trigger was: %LINEPROTO-5-UPDOWN ... down</code> hota hai, jisme pattern phir se hai. Applet hamesha ke liye khud ko trigger karta rahega. Applet ke output ko kabhi uske apne pattern se match mat hone do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Pattern regular expression hai, plain text nahi. Dot koi bhi character match karta hai, isliye <code>0/0.1</code> <code>0/0/1</code> bhi match karta hai. Yeh bhi yaad rakho ki Gi0/0 par local <code>shutdown</code> <code>%LINK-5-CHANGED ... administratively down</code> <b>aur</b> LINEPROTO down message dono banata hai, isliye lab applet planned maintenance mein bhi fire hota hai.</p></div>

<div class="scn"><h4>Weekend ka bill</h4><p>Pune ke ek network engineer ne planned circuit migration ke liye Friday shaam branch router ka primary interface shut kiya. LINEPROTO down message backup applet se match hua, jisne metered 4G interface enable kar diya. Migration ek ghante mein khatam hua, par backup ko phir se shut karne wala kuch nahi tha, aur branch poora weekend 4G par chali. Bill normal mahine ka gyarah guna aaya. Fix tha ek environment variable <code>_maint</code>, jo applet ke top par <code>if</code> action se check hota hai, aur ek doosra applet jo primary wapas aane par backup shut karta hai.</p><p><b>Seekh:</b> aapka pattern jo bhi messages match karta hai unki list banao, un messages samet jo aapki apni team jaan-boojh kar banati hai.</p></div>

<div class="iv"><p class="q">"EEM applet ko sirf tab kaise trigger karoge jab GigabitEthernet0/0 ka line protocol chala jaaye?"</p><p>Strong answer: syslog detector ko specific regular expression ke saath use karo: <code>event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"</code>. Har hissa kyun hai samjhao: mnemonic duplicate LINK message se bachata hai, comma subinterfaces se, aur "down" up message se. Bonus: flaps ke liye <code>occurs</code>/<code>period</code> aur zyada robust alternative ki tarah track event bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog detector har log message mein kahin bhi regular expression match karta hai.</li>
<li>Link failure LINK aur LINEPROTO dono messages log karta hai; ek baar fire karne ke liye mnemonic shamil karo.</li>
<li>Interface ke naam ko uske comma ke saath khatam karo taaki subinterfaces aur milte-julte naam match na hon.</li>
<li><code>occurs N period S</code> S second mein N matches ke baad hi fire hota hai.</li>
<li>Match hua text _syslog_msg built-in variable mein hota hai; apne output ko apne pattern se kabhi re-match mat hone do.</li>
</ul></div>
`}};export{e as default};