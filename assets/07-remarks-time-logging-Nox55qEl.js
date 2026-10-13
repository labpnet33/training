var e={id:`remarks-time-log`,h:{en:`Remarks, time-based ACLs and per-ACE logging`,hi:`Remarks, time-based ACLs aur per-ACE logging`},body:{en:`
<p>An ACL that works today but nobody understands next year is a liability. This chapter covers three tools that turn an ACL into a maintainable, auditable policy: <b>remarks</b> that explain each rule, <b>time ranges</b> that switch rules on and off by the clock, and <b>per-ACE logging</b> that records who used a rule.</p>

<h3>The analogy: a visitor register with notes, visiting hours and a signature column</h3>
<p>A good society guest list says <i>why</i> a visitor is allowed ("plumber, flat 402, ticket 118"), <i>when</i> ("weekdays 9 to 6 only"), and has a column where the guard signs every time the entry is used. Remarks, time ranges and logging are exactly those three columns.</p>

<h3>Remarks: comments that live inside the ACL</h3>
<pre class="code">access-list OUTSIDE_IN remark CHG-2210 public web for WEB, owner web-team
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN remark CHG-2231 partner SSH, review every quarter
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
<span class="c">! insert a remark above a specific line</span>
access-list OUTSIDE_IN line 1 remark INC-7719 partner exception moved to top</pre>
<p>A remark sits above the ACE that follows it. It uses a line position but is not an ACE, so it has no hit counter and never matches traffic. A strong habit: every block of ACEs starts with a remark containing the change number, owner and purpose.</p>

<h3>Time-based ACLs</h3>
<p>A <code>time-range</code> defines when an ACE is active. It can have one <b>absolute</b> window (a start and/or end date) and any number of <b>periodic</b> windows (repeating days and hours). The ASA's clock must be correct, so configure NTP first.</p>
<pre class="code">time-range VENDOR-WINDOW
 absolute start 00:00 01 October 2026 end 23:59 31 December 2026
 periodic weekdays 9:00 to 18:00
<span class="c">! the vendor may SSH to WEB only during that window</span>
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object WEB eq ssh time-range VENDOR-WINDOW</pre>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN | include VENDOR
access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object WEB eq ssh <span class="hl">time-range VENDOR-WINDOW (inactive)</span> (hitcnt=0) 0x8a17c2d4</pre>
<p>Outside the window the ACE is marked <b>inactive</b> and is skipped, as if it were not there. Remember chapter 2: an SSH session opened at 17:55 continues after 18:00, because the time range only affects new connections.</p>

<h3>The inactive keyword</h3>
<p>You can also switch any ACE off by hand with <code>inactive</code>, without deleting it. This is useful for a rule you may need again, or to test whether a rule is really needed. Treat inactive lines as temporary; review and remove them.</p>

<h3>Logging per ACE</h3>
<p>By default, a <b>deny</b> ACE (and the implicit deny) generates syslog <b>106023</b> for each denied packet. Permitted traffic is not logged per ACE by default. Adding the <code>log</code> keyword changes the behaviour: the ASA generates syslog <b>106100</b> instead, with a hit count, first when the flow is seen and then summarised every interval (300 seconds by default).</p>
<table class="cmp"><tr><th>ACE option</th><th>Effect</th></tr>
<tr><td>(none) on deny</td><td>106023 per denied packet, level 4</td></tr>
<tr><td><code>log</code></td><td>106100 at level 6 (informational), interval 300 s</td></tr>
<tr><td><code>log 4 interval 60</code></td><td>106100 at level 4, summary every 60 s</td></tr>
<tr><td><code>log disable</code></td><td>no syslog for this ACE at all</td></tr>
<tr><td><code>log default</code></td><td>back to the default behaviour</td></tr>
</table>

<pre class="code"><span class="c">! log permitted partner SSH, and log every other SSH attempt at warning level</span>
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh log
access-list OUTSIDE_IN extended deny tcp any any eq ssh log 4 interval 60
<span class="c">! a visible, counted end of policy</span>
access-list OUTSIDE_IN extended deny ip any any log</pre>

<pre class="out">NK-ASA# show logging | include 1061
%ASA-6-106100: access-list OUTSIDE_IN permitted tcp outside/198.51.100.10(40000) -&gt; dmz/10.0.2.10(22) hit-cnt 1 first hit [0x2e4f1c07, 0x9d31a5e0]
<span class="hl">%ASA-4-106100: access-list OUTSIDE_IN denied tcp outside/8.8.8.8(51200) -&gt; dmz/10.0.2.10(22) hit-cnt 1 first hit [0x61c05b9e, 0x0]</span></pre>
<p>Notice two things: the log shows the <b>real</b> destination 10.0.2.10 (again the real-IP rule), and the hash values in brackets match the ACE hashes in <code>show access-list</code>, so you can tie a log line to the exact rule.</p>

<div class="eg"><p><b>Worked example.</b> Security wants a daily count of blocked SSH attempts from the internet. Add <code>deny tcp any any eq ssh log 4 interval 60</code> just below the partner permit. Every minute the ASA sends a 106100 summary with the hit count per source, which the SIEM can graph. Without <code>log</code>, the same drops would appear as noisy per-packet 106023 messages.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>log</code> on the busiest permit rule in a high-traffic firewall and flooding the syslog server; forgetting NTP, so time ranges switch at the wrong hour; and writing remarks like "temp" or "test" that explain nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the two message IDs: <b>106023</b> for a deny by an ACE without the log keyword (or by the implicit deny), <b>106100</b> for an ACE with the log keyword. A time-range has at most one absolute statement but can have several periodic statements.</p></div>

<div class="scn"><h4>The vendor who kept access for a year</h4><p>An insurance company allowed an external vendor to SSH to a DMZ server "for the migration project", without an end date. A year later the vendor's credentials leaked in an unrelated breach, and the SIEM raised an alert for SSH logins from the vendor's range. The rule had no remark, no owner and no expiry. After the incident, the team made a rule: every third-party ACE needs a remark with a change number and a <code>time-range</code> with an absolute end date, and every such ACE uses <code>log</code>.</p><p><b>Lesson:</b> temporary access must expire by itself. Remarks, time ranges and logging make that automatic and auditable.</p></div>

<div class="iv"><p class="q">"How would you give a vendor temporary access through an ASA and make sure it expires?"</p><p>Strong answer: create a <code>time-range</code> with an absolute end date (and periodic hours if needed), apply it to a narrow ACE (vendor host, specific server, specific port), add a remark with the change number and owner, and use <code>log</code> so each use creates 106100. Mention NTP for a correct clock and that existing sessions survive the end of the window, so clear connections if needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remarks document change number, owner and purpose; they never match traffic.</li>
<li>Time ranges: one absolute window plus periodic windows; they need a correct clock.</li>
<li>Outside the window the ACE shows <code>(inactive)</code>; <code>inactive</code> can also be set by hand.</li>
<li>Syslog 106023 = deny without log; 106100 = ACE with log (default level 6, interval 300 s).</li>
<li>Log lines show real addresses and ACE hashes you can match to show access-list.</li>
</ul></div>
`,hi:`
<p>Jo ACL aaj kaam karti hai lekin agle saal koi use samajh na paaye, woh ek liability hai. Yeh chapter teen tools cover karta hai jo ACL ko maintainable, auditable policy banate hain: <b>remarks</b> jo har rule samjhate hain, <b>time ranges</b> jo rules ko ghadi ke hisaab se on aur off karti hain, aur <b>per-ACE logging</b> jo record karti hai ki rule kisne use ki.</p>

<h3>Analogy: notes, visiting hours aur signature column wala visitor register</h3>
<p>Society ki achhi guest list batati hai ki visitor ko <i>kyun</i> allow kiya ("plumber, flat 402, ticket 118"), <i>kab</i> ("sirf weekdays 9 se 6"), aur ek column hota hai jahan guard har baar entry use hone par sign karta hai. Remarks, time ranges aur logging bilkul yahi teen columns hain.</p>

<h3>Remarks: ACL ke andar rehne wale comments</h3>
<pre class="code">access-list OUTSIDE_IN remark CHG-2210 public web for WEB, owner web-team
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN remark CHG-2231 partner SSH, review every quarter
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
<span class="c">! kisi specific line ke upar remark insert karo</span>
access-list OUTSIDE_IN line 1 remark INC-7719 partner exception moved to top</pre>
<p>Remark apne baad aane wali ACE ke upar baithta hai. Yeh ek line position use karta hai lekin ACE nahi hai, isliye iska koi hit counter nahi hota aur yeh kabhi traffic match nahi karta. Ek strong aadat: ACEs ka har block ek remark se shuru ho jismein change number, owner aur purpose ho.</p>

<h3>Time-based ACLs</h3>
<p><code>time-range</code> define karta hai ki ACE kab active hai. Ismein ek <b>absolute</b> window (start aur/ya end date) aur kitni bhi <b>periodic</b> windows (repeat hone wale din aur ghante) ho sakti hain. ASA ki ghadi sahi honi chahiye, isliye pehle NTP configure karo.</p>
<pre class="code">time-range VENDOR-WINDOW
 absolute start 00:00 01 October 2026 end 23:59 31 December 2026
 periodic weekdays 9:00 to 18:00
<span class="c">! vendor sirf us window mein WEB par SSH kar sakta hai</span>
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object WEB eq ssh time-range VENDOR-WINDOW</pre>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN | include VENDOR
access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object WEB eq ssh <span class="hl">time-range VENDOR-WINDOW (inactive)</span> (hitcnt=0) 0x8a17c2d4</pre>
<p>Window ke bahar ACE <b>inactive</b> mark hoti hai aur skip ho jaati hai, jaise woh hai hi nahi. Chapter 2 yaad karo: 17:55 par khula SSH session 18:00 ke baad bhi chalta hai, kyunki time range sirf nayi connections par asar karti hai.</p>

<h3>Inactive keyword</h3>
<p>Aap kisi bhi ACE ko <code>inactive</code> se haath se bhi off kar sakte ho, bina delete kiye. Yeh us rule ke liye useful hai jiski dobara zaroorat pad sakti hai, ya yeh test karne ke liye ki rule sach mein chahiye ya nahi. Inactive lines ko temporary samjho; review karo aur hatao.</p>

<h3>Har ACE ki logging</h3>
<p>Default mein, <b>deny</b> ACE (aur implicit deny) har denied packet ke liye syslog <b>106023</b> generate karti hai. Permitted traffic default mein per ACE log nahi hota. <code>log</code> keyword jodne se behaviour badalta hai: ASA uski jagah syslog <b>106100</b> generate karta hai, hit count ke saath, pehli baar jab flow dikhta hai aur phir har interval (default 300 seconds) par summary.</p>
<table class="cmp"><tr><th>ACE option</th><th>Asar</th></tr>
<tr><td>deny par (kuch nahi)</td><td>har denied packet par 106023, level 4</td></tr>
<tr><td><code>log</code></td><td>level 6 (informational) par 106100, interval 300 s</td></tr>
<tr><td><code>log 4 interval 60</code></td><td>level 4 par 106100, har 60 s summary</td></tr>
<tr><td><code>log disable</code></td><td>is ACE ke liye koi syslog nahi</td></tr>
<tr><td><code>log default</code></td><td>wapas default behaviour</td></tr>
</table>

<pre class="code"><span class="c">! permitted partner SSH log karo, aur baaki har SSH attempt warning level par log karo</span>
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh log
access-list OUTSIDE_IN extended deny tcp any any eq ssh log 4 interval 60
<span class="c">! policy ka dikhne wala, gina hua end</span>
access-list OUTSIDE_IN extended deny ip any any log</pre>

<pre class="out">NK-ASA# show logging | include 1061
%ASA-6-106100: access-list OUTSIDE_IN permitted tcp outside/198.51.100.10(40000) -&gt; dmz/10.0.2.10(22) hit-cnt 1 first hit [0x2e4f1c07, 0x9d31a5e0]
<span class="hl">%ASA-4-106100: access-list OUTSIDE_IN denied tcp outside/8.8.8.8(51200) -&gt; dmz/10.0.2.10(22) hit-cnt 1 first hit [0x61c05b9e, 0x0]</span></pre>
<p>Do cheezein notice karo: log <b>real</b> destination 10.0.2.10 dikhata hai (phir se real-IP rule), aur brackets ki hash values <code>show access-list</code> ke ACE hashes se match karti hain, isliye aap log line ko exact rule se jod sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Security ko internet se blocked SSH attempts ka daily count chahiye. Partner permit ke theek neeche <code>deny tcp any any eq ssh log 4 interval 60</code> jodo. Har minute ASA har source ke hit count ke saath 106100 summary bhejta hai, jise SIEM graph kar sakta hai. <code>log</code> ke bina, wahi drops shor machane wale per-packet 106023 messages ke roop mein dikhte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> High-traffic firewall mein sabse busy permit rule par <code>log</code> lagana aur syslog server ko flood kar dena; NTP bhool jaana, jisse time ranges galat ghante par switch hoti hain; aur "temp" ya "test" jaise remarks likhna jo kuch nahi samjhate.</p></div>

<div class="exam"><p><b>Exam trap.</b> Do message IDs yaad rakho: <b>106023</b> log keyword ke bina ACE (ya implicit deny) se deny ke liye, <b>106100</b> log keyword wali ACE ke liye. Time-range mein zyada se zyada ek absolute statement ho sakta hai lekin kai periodic statements ho sakte hain.</p></div>

<div class="scn"><h4>Woh vendor jiske paas ek saal tak access raha</h4><p>Ek insurance company ne ek external vendor ko "migration project ke liye" DMZ server par SSH karne diya, bina end date ke. Ek saal baad ek alag breach mein vendor ke credentials leak hue, aur SIEM ne vendor ki range se SSH logins ka alert diya. Rule mein na remark tha, na owner, na expiry. Incident ke baad team ne rule banaya: har third-party ACE mein change number wala remark aur absolute end date wala <code>time-range</code> hona chahiye, aur har aisi ACE <code>log</code> use kare.</p><p><b>Seekh:</b> temporary access ko khud expire hona chahiye. Remarks, time ranges aur logging ise automatic aur auditable banate hain.</p></div>

<div class="iv"><p class="q">"Aap ASA ke through vendor ko temporary access kaise doge aur kaise ensure karoge ki woh expire ho?"</p><p>Strong answer: absolute end date (aur zaroorat ho to periodic hours) wala <code>time-range</code> banao, use ek narrow ACE (vendor host, specific server, specific port) par lagao, change number aur owner ke saath remark jodo, aur <code>log</code> use karo taaki har use par 106100 bane. Sahi ghadi ke liye NTP mention karo aur yeh ki window khatam hone par existing sessions bach jaate hain, isliye zaroorat ho to connections clear karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remarks change number, owner aur purpose document karte hain; kabhi traffic match nahi karte.</li>
<li>Time ranges: ek absolute window plus periodic windows; sahi ghadi chahiye.</li>
<li>Window ke bahar ACE <code>(inactive)</code> dikhati hai; <code>inactive</code> haath se bhi set ho sakta hai.</li>
<li>Syslog 106023 = log ke bina deny; 106100 = log wali ACE (default level 6, interval 300 s).</li>
<li>Log lines real addresses aur ACE hashes dikhati hain jo show access-list se match hote hain.</li>
</ul></div>
`}};export{e as default};