var e={id:`ntp`,h:{en:`NTP: one clock for the whole network`,hi:`NTP: poore network ke liye ek clock`},body:{en:`
<p>Imagine ten witnesses describing an accident, each wearing a watch that shows a different time. Nobody can say which car came first. Logs from ten routers with different clocks are the same: useless for finding the cause. <b>NTP (Network Time Protocol)</b> makes every device take its time from a trusted source so that all timestamps agree.</p>

<h3>How NTP works</h3>
<p>NTP runs over <b>UDP 123</b>. A client polls a server, measures the network delay and clock offset, and gently adjusts its own clock. Servers are organised in <b>strata</b>: stratum 0 is a reference clock (GPS, atomic clock), stratum 1 servers are directly attached to it, a client of a stratum 1 server becomes stratum 2, and so on. The stratum number grows by one at every hop. Stratum 16 means "unsynchronised".</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="8" width="140" height="34" rx="8" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">Stratum 0: GPS clock</text>
<rect x="250" y="62" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Stratum 1: NK-OPS</text>
<rect x="250" y="116" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Stratum 2: R1</text>
<rect x="250" y="168" width="140" height="28" rx="8" fill="#bae6fd"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">Stratum 3: PCs</text>
<g stroke="#64748b" stroke-width="2"><line x1="320" y1="42" x2="320" y2="62"/><line x1="320" y1="96" x2="320" y2="116"/><line x1="320" y1="150" x2="320" y2="168"/></g>
<text x="520" y="135" text-anchor="middle" class="svg-muted" font-size="12">R1 polls 10.70.1.50</text>
<text x="120" y="135" text-anchor="middle" class="svg-muted" font-size="12">stratum = server + 1</text>
</svg><p class="cap">A client is one stratum above its server. Stratum 16 means not synchronised.</p></div>

<h3>Configuration</h3>
<pre class="code">set system time-zone Asia/Kolkata
set system ntp server 10.70.1.50 prefer
set system ntp server 10.70.1.51
set system ntp boot-server 10.70.1.50
set system ntp source-address 10.255.70.1</pre>
<ul>
<li><code>time-zone</code> only affects how times are <i>displayed</i>; NTP carries UTC. Use the Olson name such as <code>Asia/Kolkata</code> (UTC+5:30) or <code>UTC</code>.</li>
<li><code>server</code> adds a time source. Two or more servers are best practice; <code>prefer</code> marks the favourite.</li>
<li><code>boot-server</code> sets the clock once at boot when the offset is large (needs reachability at boot).</li>
<li><code>source-address</code> picks the address NTP packets use; the server may only accept known clients.</li>
<li>Authentication: <code>authentication-key 1 type md5 value "secret"</code>, <code>trusted-key 1</code> and <code>server 10.70.1.50 key 1</code>.</li>
<li>One-off manual setting: <code>set date ntp 10.70.1.50</code> (operational mode) or <code>set date 202610011030.00</code>.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show ntp associations
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
<span class="hl">*10.70.1.50</span>      .GPS.            1 u   12   64  377    0.812    0.104   0.052

lab@NK-CHN-EDGE&gt; show ntp status
status=0644 leap_none, sync_ntp, 1 event, freq_set,
version="ntpd 4.2.8p15", system="JUNOS23.2R1.13", leap=00, <span class="hl">stratum=2</span>,
refid=10.70.1.50, reftime=...
lab@NK-CHN-EDGE&gt; show system uptime
Current time: 2026-10-01 15:32:10 IST</pre>
<table class="cmp"><tr><th>Item</th><th>Meaning</th></tr>
<tr><td><code>*</code> before the server</td><td>synchronised to this server (system peer)</td></tr>
<tr><td><code>+</code></td><td>good candidate, a backup source</td></tr>
<tr><td><code>-</code> or blank</td><td>rejected or not used</td></tr>
<tr><td><code>st</code></td><td>the server's stratum</td></tr>
<tr><td><code>reach 377</code></td><td>octal bit-field of the last 8 polls; 377 = all 8 answered</td></tr>
<tr><td><code>offset</code></td><td>difference from the server, in milliseconds</td></tr>
<tr><td><code>refid .INIT.</code>, st 16</td><td>server never answered</td></tr></table>
<p>After you add a server, synchronisation takes a few minutes. Reach grows 1, 3, 7, 17, 37, 77, 177, 377 as polls succeed.</p>

<h3>Lab walkthrough: Chennai edge, NTP half</h3>
<pre class="code">lab@NK-CHN-EDGE# set system time-zone Asia/Kolkata
lab@NK-CHN-EDGE# set system ntp server 10.70.1.50
lab@NK-CHN-EDGE# commit
lab@NK-CHN-EDGE# run show ntp associations
lab@NK-CHN-EDGE# run show ntp status</pre>
<p>The lab asks for the stratum in <code>show ntp status</code>. NK-OPS is stratum 1 (it takes time from a GPS source), so R1 reports <b>stratum=2</b>. Seeing the <code>*</code> in the associations and <code>sync_ntp</code> in the status confirms synchronisation.</p>

<div class="eg"><p><b>Worked example.</b> R1 and R2 both poll NK-OPS. R1's clock is 7 minutes slow. After the first successful polls, NTP steps the clock when the offset is large and then slews it gradually for small offsets. After 10 minutes both routers show offsets under 5 ms, so a log line from R1 at 10:15:03 and one from R2 at 10:15:03 really happened at the same moment.</p></div>

<div class="warn"><p><b>Common mistakes.</b> One NTP server only; setting the wrong time zone and thinking the clock is wrong; blocking UDP 123 with a firewall or filter; trusting a server nobody maintains; forgetting that a very large initial offset is only corrected at boot if <code>boot-server</code> is set or with <code>set date ntp</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> NTP uses UDP 123. An asterisk means synchronised. A client's stratum is its server's stratum plus one. Stratum 16 means unsynchronised.</p></div>

<div class="scn"><h4>Certificates that were "not yet valid"</h4><p>A new router refused to bring up an IPsec tunnel: the peer's certificate was "not yet valid". The router's clock still showed the factory date from two years earlier because NTP was never configured. After <code>set system ntp boot-server</code> and a server entry, the clock corrected itself and the tunnel came up.</p><p><b>Lesson:</b> time affects security protocols and every log you will ever read.</p></div>

<div class="iv"><p class="q">"How do you confirm a Junos router is synchronised to NTP?"</p><p><code>show ntp associations</code> should show an asterisk next to a server with reach 377 and a small offset. <code>show ntp status</code> should say <code>sync_ntp</code> with a stratum one greater than the server's. If the server shows <code>.INIT.</code> and stratum 16, I check routing, the source address, and that UDP 123 is permitted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP uses UDP 123 and a stratum hierarchy; clients are one stratum above servers.</li>
<li>Configure at least two servers; mark one <code>prefer</code>; add <code>boot-server</code>.</li>
<li><code>show ntp associations</code>: <code>*</code> is the synchronised peer; reach 377 means all polls answered.</li>
<li><code>show ntp status</code> reports <code>sync_ntp</code> and the stratum.</li>
<li>Time zone changes display only; NTP itself works in UTC.</li>
</ul></div>
`,hi:`
<p>Socho ek accident ke das witnesses har ek ki ghadi alag time dikha rahi hai. Koi nahi bata sakta pehle kaunsi car aayi. Das routers ke alag clocks wale logs bhi aise hi hain: cause dhoondhne ke liye bekaar. <b>NTP (Network Time Protocol)</b> har device ko trusted source se time leta hai taaki saare timestamps match karein.</p>

<h3>NTP kaise kaam karta hai</h3>
<p>NTP <b>UDP 123</b> par chalta hai. Client server ko poll karta hai, network delay aur clock offset naapta hai, aur apni clock ko dheere se adjust karta hai. Servers <b>strata</b> mein organised hote hain: stratum 0 reference clock hai (GPS, atomic clock), stratum 1 servers uske seedhe attached hote hain, stratum 1 server ka client stratum 2 ban jaata hai, aur aise hi. Har hop par stratum number ek badhta hai. Stratum 16 ka matlab "unsynchronised".</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="8" width="140" height="34" rx="8" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">Stratum 0: GPS clock</text>
<rect x="250" y="62" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Stratum 1: NK-OPS</text>
<rect x="250" y="116" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Stratum 2: R1</text>
<rect x="250" y="168" width="140" height="28" rx="8" fill="#bae6fd"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">Stratum 3: PCs</text>
<g stroke="#64748b" stroke-width="2"><line x1="320" y1="42" x2="320" y2="62"/><line x1="320" y1="96" x2="320" y2="116"/><line x1="320" y1="150" x2="320" y2="168"/></g>
<text x="520" y="135" text-anchor="middle" class="svg-muted" font-size="12">R1 10.70.1.50 ko poll karta hai</text>
<text x="120" y="135" text-anchor="middle" class="svg-muted" font-size="12">stratum = server + 1</text>
</svg><p class="cap">Client apne server se ek stratum upar hota hai. Stratum 16 matlab synchronised nahi.</p></div>

<h3>Configuration</h3>
<pre class="code">set system time-zone Asia/Kolkata
set system ntp server 10.70.1.50 prefer
set system ntp server 10.70.1.51
set system ntp boot-server 10.70.1.50
set system ntp source-address 10.255.70.1</pre>
<ul>
<li><code>time-zone</code> sirf time ke <i>display</i> par asar daalta hai; NTP UTC carry karta hai. <code>Asia/Kolkata</code> (UTC+5:30) jaisa Olson naam ya <code>UTC</code> use karo.</li>
<li><code>server</code> time source jodta hai. Do ya zyada servers best practice hai; <code>prefer</code> favourite mark karta hai.</li>
<li><code>boot-server</code> boot par jab offset bada ho to clock ek baar set karta hai (boot par reachability chahiye).</li>
<li><code>source-address</code> NTP packets ka address chunta hai; server sirf jaane-pehchaane clients accept kar sakta hai.</li>
<li>Authentication: <code>authentication-key 1 type md5 value "secret"</code>, <code>trusted-key 1</code> aur <code>server 10.70.1.50 key 1</code>.</li>
<li>Ek baar manual setting: <code>set date ntp 10.70.1.50</code> (operational mode) ya <code>set date 202610011030.00</code>.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show ntp associations
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
<span class="hl">*10.70.1.50</span>      .GPS.            1 u   12   64  377    0.812    0.104   0.052

lab@NK-CHN-EDGE&gt; show ntp status
status=0644 leap_none, sync_ntp, 1 event, freq_set,
version="ntpd 4.2.8p15", system="JUNOS23.2R1.13", leap=00, <span class="hl">stratum=2</span>,
refid=10.70.1.50, reftime=...
lab@NK-CHN-EDGE&gt; show system uptime
Current time: 2026-10-01 15:32:10 IST</pre>
<table class="cmp"><tr><th>Item</th><th>Matlab</th></tr>
<tr><td>Server se pehle <code>*</code></td><td>is server se synchronised (system peer)</td></tr>
<tr><td><code>+</code></td><td>achha candidate, backup source</td></tr>
<tr><td><code>-</code> ya blank</td><td>rejected ya use nahi ho raha</td></tr>
<tr><td><code>st</code></td><td>server ka stratum</td></tr>
<tr><td><code>reach 377</code></td><td>pichle 8 polls ka octal bit-field; 377 = saare 8 ka jawab aaya</td></tr>
<tr><td><code>offset</code></td><td>server se difference, milliseconds mein</td></tr>
<tr><td><code>refid .INIT.</code>, st 16</td><td>server ne kabhi jawab nahi diya</td></tr></table>
<p>Server jodne ke baad synchronisation mein kuch minute lagte hain. Polls succeed hone par reach 1, 3, 7, 17, 37, 77, 177, 377 badhta hai.</p>

<h3>Lab walkthrough: Chennai edge, NTP wala hissa</h3>
<pre class="code">lab@NK-CHN-EDGE# set system time-zone Asia/Kolkata
lab@NK-CHN-EDGE# set system ntp server 10.70.1.50
lab@NK-CHN-EDGE# commit
lab@NK-CHN-EDGE# run show ntp associations
lab@NK-CHN-EDGE# run show ntp status</pre>
<p>Lab <code>show ntp status</code> mein stratum poochta hai. NK-OPS stratum 1 hai (GPS source se time leta hai), isliye R1 <b>stratum=2</b> report karta hai. Associations mein <code>*</code> aur status mein <code>sync_ntp</code> dikhna synchronisation confirm karta hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 aur R2 dono NK-OPS ko poll karte hain. R1 ki clock 7 minute slow hai. Pehle successful polls ke baad NTP bade offset par clock ko step karta hai aur chhote offsets ko dheere slew karta hai. 10 minute baad dono routers 5 ms se kam offset dikhate hain, isliye R1 ki 10:15:03 wali log line aur R2 ki 10:15:03 wali line sach mein ek hi pal ki hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf ek NTP server; galat time zone set karke socha ki clock galat hai; firewall ya filter se UDP 123 block karna; aise server par bharosa jise koi maintain nahi karta; yeh bhool jaana ki bada initial offset sirf boot par theek hota hai agar <code>boot-server</code> set ho ya <code>set date ntp</code> ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> NTP UDP 123 use karta hai. Asterisk matlab synchronised. Client ka stratum uske server ke stratum plus one hota hai. Stratum 16 matlab unsynchronised.</p></div>

<div class="scn"><h4>Certificates jo "not yet valid" the</h4><p>Naya router IPsec tunnel up karne se mana kar raha tha: peer ka certificate "not yet valid" tha. Router ki clock abhi do saal purani factory date dikha rahi thi kyunki NTP kabhi configure hi nahi hua. <code>set system ntp boot-server</code> aur server entry ke baad clock khud theek ho gayi aur tunnel up ho gaya.</p><p><b>Lesson:</b> time security protocols aur har log ko asar karta hai jo aap kabhi padhoge.</p></div>

<div class="iv"><p class="q">"Junos router NTP se synchronised hai yeh kaise confirm karte ho?"</p><p><code>show ntp associations</code> mein server ke aage asterisk, reach 377 aur chhota offset dikhna chahiye. <code>show ntp status</code> mein <code>sync_ntp</code> aur server se ek zyada stratum hona chahiye. Server <code>.INIT.</code> aur stratum 16 dikhaye to routing, source address aur UDP 123 permit hai ya nahi check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP UDP 123 aur stratum hierarchy use karta hai; clients servers se ek stratum upar hote hain.</li>
<li>Kam se kam do servers configure karo; ek ko <code>prefer</code> karo; <code>boot-server</code> jodo.</li>
<li><code>show ntp associations</code>: <code>*</code> synchronised peer hai; reach 377 matlab saare polls ka jawab.</li>
<li><code>show ntp status</code> <code>sync_ntp</code> aur stratum batata hai.</li>
<li>Time zone sirf display badalta hai; NTP khud UTC mein kaam karta hai.</li>
</ul></div>
`}};export{e as default};