var e={id:`verification`,h:{en:`Verifying NAT: translations, statistics, clear and debug`,hi:`NAT verify karna: translations, statistics, clear aur debug`},body:{en:`
<p>A doctor does not guess; she reads the thermometer, the blood pressure and the report, in that order, and each one answers a different question. NAT troubleshooting is the same. Four tools answer four questions: <b>is anything being translated</b> (translations), <b>is NAT set up and working as a whole</b> (statistics), <b>can I start fresh</b> (clear), and <b>what happens to each packet right now</b> (debug). Knowing exactly what each output line means turns a vague "internet is down" ticket into a five-minute fix.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Which command answers which question">
<rect x="10" y="20" width="300" height="70" rx="8" fill="#bae6fd"/><text x="160" y="47" text-anchor="middle" class="svg-ink" font-size="13">show ip nat translations</text><text x="160" y="70" text-anchor="middle" class="svg-muted" font-size="12">Who is translated to what?</text>
<rect x="330" y="20" width="300" height="70" rx="8" fill="#bbf7d0"/><text x="480" y="47" text-anchor="middle" class="svg-ink" font-size="13">show ip nat statistics</text><text x="480" y="70" text-anchor="middle" class="svg-muted" font-size="12">Interfaces, rules, pool, misses</text>
<rect x="10" y="110" width="300" height="70" rx="8" fill="#fde68a"/><text x="160" y="137" text-anchor="middle" class="svg-ink" font-size="13">clear ip nat translation</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">Remove dynamic entries</text>
<rect x="330" y="110" width="300" height="70" rx="8" fill="#fed7aa"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="13">debug ip nat</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Live, per packet (use with care)</text>
</svg><p class="cap">Four tools, four questions. Start at the top left and move right and down.</p></div>

<h3>show ip nat translations</h3>
<p>This is the translation table. Columns: <b>Pro, Inside global, Inside local, Outside local, Outside global</b>.</p>
<ul>
<li><code>---</code> in the Pro column: a <b>simple</b> entry (address only). Static mappings and dynamic one-to-one entries look like this.</li>
<li><code>tcp</code>, <code>udp</code>, <code>icmp</code>: an <b>extended</b> entry for one flow, with address:port. PAT creates only these.</li>
<li>An <b>empty table</b> while users generate traffic means NAT never matched: check interfaces, ACL and rule.</li>
</ul>
<p>Add <code>verbose</code> to see timers, and filter on large routers:</p>
<pre class="out">BR# show ip nat translations verbose | begin 192.168.1.10
tcp  203.0.113.18:51000    192.168.1.10:51000    198.51.100.80:80      198.51.100.80:80
<span class="hl">    create 00:02:11, use 00:00:04 timeout:86400000, left 23:59:55, Map-Id(In): 1,</span>
    flags:
extended, use_count: 0, entry-id: 12, lc_entries: 0</pre>
<p><b>create</b> is how long ago the entry was built, <b>use</b> how long since a packet last used it, and <b>left</b> how long until it expires if idle.</p>

<h3>show ip nat statistics</h3>
<pre class="out">EDGE# show ip nat statistics
<span class="hl">Total active translations: 4 (0 static, 4 dynamic; 2 extended)</span>
Peak translations: 4, occurred 00:03:10 ago
<span class="hl">Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0</span>
Hits: 18  Misses: 7
Expired translations: 0
Dynamic mappings:
-- Inside Source
<span class="hl">[Id: 1] access-list 20 pool PUBLIC refcount 4</span>
 pool PUBLIC: netmask 255.255.255.0
        start 100.64.50.10 end 100.64.50.11
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Read it top to bottom as a checklist:</p>
<ol>
<li><b>Total active translations</b>: is anything happening? How many static, dynamic, extended?</li>
<li><b>Outside/Inside interfaces</b>: are the labels on the right interfaces?</li>
<li><b>Hits/Misses</b>: lookups that found an entry versus lookups that needed a new one.</li>
<li><b>Dynamic mappings</b>: which ACL is tied to which pool or interface, and whether overload is there. <b>refcount</b> is how many entries use this rule.</li>
<li><b>Pool line</b>: total, allocated and percentage, and pool <b>misses</b> (failed allocations). 100% plus rising misses = exhaustion.</li>
</ol>

<h3>clear ip nat translation</h3>
<pre class="code"><span class="c">! remove every dynamic entry (static mappings stay)</span>
EDGE# clear ip nat translation *
<span class="c">! remove one simple entry: inside GLOBAL then LOCAL</span>
EDGE# clear ip nat translation inside 100.64.50.10 10.20.0.11
<span class="c">! remove one PAT flow</span>
BR# clear ip nat translation tcp inside 203.0.113.18 51000 192.168.1.10 51000 outside 198.51.100.80 80 198.51.100.80 80
<span class="c">! reset the counters only</span>
EDGE# clear ip nat statistics</pre>
<p>Why clear? When you change a NAT rule or pool, existing entries keep the old behaviour until they expire, which for dynamic entries can be 24 hours. IOS even protects entries in use: trying to delete a busy pool gives <code>%Pool PUBLIC in use, cannot destroy</code>, and removing a rule in use asks <code>Dynamic mapping in use, do you want to delete all entries? [no]:</code>. Clear the translations first, then change the configuration. Clearing drops existing sessions, so do it in a change window in production.</p>

<h3>debug ip nat (concept)</h3>
<pre class="out">BR# debug ip nat
IP NAT debugging is on
<span class="hl">NAT: s=192.168.1.10->203.0.113.18, d=198.51.100.80 [4521]</span>
NAT*: s=198.51.100.80, d=203.0.113.18->192.168.1.10 [9127]
EDGE# debug ip nat
NAT: translation failed (A), dropping packet s=10.20.0.13 d=198.51.100.80</pre>
<p>Each line is one translated packet. <code>s=</code> is the source and <code>d=</code> the destination; the arrow shows the rewrite. Outbound, the source changes (inside local to inside global). Inbound, the destination changes back. <code>NAT*</code> means the packet was handled in the fast (CEF) path; the number in brackets is the IP identification field. A "translation failed … dropping packet" line tells you a matching host could not get a translation, as with PC3 in the dynamic lab.</p>
<p>Debugs print one line per packet. On a busy router that can overload the CPU and console. Limit it with an ACL (<code>debug ip nat 5</code> after creating access-list 5 for one host), prefer logging to the buffer, and always finish with <code>undebug all</code>.</p>

<div class="eg"><p><b>Worked example.</b> In the dynamic lab, after PC1 and PC2 succeed and PC3 fails, statistics show <code>Total active translations: 4 (0 static, 4 dynamic; 2 extended)</code>. Four = two simple entries plus two icmp flows; two of them are extended. The pool line shows <code>allocated 2 (100%), misses 5</code>: PC3's five ping attempts each failed to get an address. After <code>clear ip nat translation *</code>, total drops to 0 and the pool shows allocated 0 (0%), so PC3's next ping succeeds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting <code>clear ip nat translation *</code> to remove a wrong static entry. Static mappings are configuration; remove them with <code>no ip nat inside source static …</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which command shows which fact. Inside/outside interface list and pool usage: <b>statistics</b>. Individual mappings and ports: <b>translations</b>. Per-packet rewrites: <b>debug ip nat</b>.</p></div>

<div class="scn"><h4>The change that did not take effect</h4><p>An engineer moved a branch from dynamic NAT to PAT by removing the old rule and adding <code>overload</code>. Users still reported failures for an hour. <code>show ip nat translations</code> still showed old <code>---</code> one-to-one entries from the earlier rule, holding both pool addresses. After <code>clear ip nat translation *</code>, new PAT entries appeared and everyone could browse.</p><p><b>Lesson:</b> after changing NAT rules, clear dynamic translations (in a window) so the new behaviour applies at once.</p></div>

<div class="iv"><p class="q">"Which commands do you use to verify and troubleshoot NAT on IOS?"</p><p>Strong answer: show ip nat translations (with verbose for timers) to see mappings; show ip nat statistics to check inside and outside interfaces, active counts, hits and misses, the rule-to-pool binding and pool usage; clear ip nat translation * to remove dynamic entries after a change; debug ip nat, limited by an ACL, to watch rewrites live. Add show access-lists and show running-config | include nat to confirm the ACL and rule, and a real test from an inside host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>translations = the table; --- lines are simple entries, tcp/udp/icmp lines are flows.</li>
<li>statistics = interfaces, counts, hits/misses, rule bindings, pool allocated % and pool misses.</li>
<li>clear ip nat translation * removes dynamic entries only; clear before changing rules.</li>
<li>debug ip nat shows s= and d= rewrites per packet; limit it and turn it off.</li>
<li>Pool in use cannot be deleted until its translations are cleared.</li>
</ul></div>
`,hi:`
<p>Doctor andaaza nahi lagati; woh thermometer, blood pressure aur report padhti hai, isi order mein, aur har ek alag sawaal ka jawab deta hai. NAT troubleshooting bhi aisi hi hai. Chaar tools chaar sawaalon ke jawab dete hain: <b>kya kuch translate ho raha hai</b> (translations), <b>kya NAT overall set up hai aur chal raha hai</b> (statistics), <b>kya main fresh shuru kar sakta hoon</b> (clear), aur <b>abhi har packet ke saath kya ho raha hai</b> (debug). Har output line ka exact matlab jaanna ek vague "internet down hai" ticket ko paanch minute ke fix mein badal deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Kaunsi command kis sawaal ka jawab deti hai">
<rect x="10" y="20" width="300" height="70" rx="8" fill="#bae6fd"/><text x="160" y="47" text-anchor="middle" class="svg-ink" font-size="13">show ip nat translations</text><text x="160" y="70" text-anchor="middle" class="svg-muted" font-size="12">Kaun kis mein translate hua?</text>
<rect x="330" y="20" width="300" height="70" rx="8" fill="#bbf7d0"/><text x="480" y="47" text-anchor="middle" class="svg-ink" font-size="13">show ip nat statistics</text><text x="480" y="70" text-anchor="middle" class="svg-muted" font-size="12">Interfaces, rules, pool, misses</text>
<rect x="10" y="110" width="300" height="70" rx="8" fill="#fde68a"/><text x="160" y="137" text-anchor="middle" class="svg-ink" font-size="13">clear ip nat translation</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">Dynamic entries hatao</text>
<rect x="330" y="110" width="300" height="70" rx="8" fill="#fed7aa"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="13">debug ip nat</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Live, har packet (dhyan se)</text>
</svg><p class="cap">Chaar tools, chaar sawaal. Upar left se shuru karo aur right aur neeche jao.</p></div>

<h3>show ip nat translations</h3>
<p>Yeh translation table hai. Columns: <b>Pro, Inside global, Inside local, Outside local, Outside global</b>.</p>
<ul>
<li>Pro column mein <code>---</code>: ek <b>simple</b> entry (sirf address). Static mappings aur dynamic one-to-one entries aisi dikhti hain.</li>
<li><code>tcp</code>, <code>udp</code>, <code>icmp</code>: ek flow ki <b>extended</b> entry, address:port ke saath. PAT sirf yahi banata hai.</li>
<li>Users traffic bana rahe hon aur <b>table khali</b> ho, matlab NAT ne kabhi match nahi kiya: interfaces, ACL aur rule check karo.</li>
</ul>
<p>Timers dekhne ke liye <code>verbose</code> jodo, aur bade routers par filter karo:</p>
<pre class="out">BR# show ip nat translations verbose | begin 192.168.1.10
tcp  203.0.113.18:51000    192.168.1.10:51000    198.51.100.80:80      198.51.100.80:80
<span class="hl">    create 00:02:11, use 00:00:04 timeout:86400000, left 23:59:55, Map-Id(In): 1,</span>
    flags:
extended, use_count: 0, entry-id: 12, lc_entries: 0</pre>
<p><b>create</b> batata hai entry kitni der pehle bani, <b>use</b> aakhri packet ko use kiye kitni der hui, aur <b>left</b> idle rahe to expire hone mein kitna samay bacha.</p>

<h3>show ip nat statistics</h3>
<pre class="out">EDGE# show ip nat statistics
<span class="hl">Total active translations: 4 (0 static, 4 dynamic; 2 extended)</span>
Peak translations: 4, occurred 00:03:10 ago
<span class="hl">Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0</span>
Hits: 18  Misses: 7
Expired translations: 0
Dynamic mappings:
-- Inside Source
<span class="hl">[Id: 1] access-list 20 pool PUBLIC refcount 4</span>
 pool PUBLIC: netmask 255.255.255.0
        start 100.64.50.10 end 100.64.50.11
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Ise upar se neeche ek checklist ki tarah padho:</p>
<ol>
<li><b>Total active translations</b>: kya kuch ho raha hai? Kitne static, dynamic, extended?</li>
<li><b>Outside/Inside interfaces</b>: kya labels sahi interfaces par hain?</li>
<li><b>Hits/Misses</b>: jin lookups ko entry mili versus jin ko nayi entry chahiye thi.</li>
<li><b>Dynamic mappings</b>: kaunsa ACL kis pool ya interface se juda hai, aur overload hai ya nahi. <b>refcount</b> batata hai kitni entries yeh rule use karti hain.</li>
<li><b>Pool line</b>: total, allocated aur percentage, aur pool <b>misses</b> (failed allocations). 100% plus badhte misses = exhaustion.</li>
</ol>

<h3>clear ip nat translation</h3>
<pre class="code"><span class="c">! har dynamic entry hatao (static mappings rehti hain)</span>
EDGE# clear ip nat translation *
<span class="c">! ek simple entry hatao: pehle inside GLOBAL phir LOCAL</span>
EDGE# clear ip nat translation inside 100.64.50.10 10.20.0.11
<span class="c">! ek PAT flow hatao</span>
BR# clear ip nat translation tcp inside 203.0.113.18 51000 192.168.1.10 51000 outside 198.51.100.80 80 198.51.100.80 80
<span class="c">! sirf counters reset karo</span>
EDGE# clear ip nat statistics</pre>
<p>Clear kyun? Jab aap NAT rule ya pool badalte ho, existing entries expire hone tak purana behaviour rakhti hain, jo dynamic entries ke liye 24 ghante ho sakta hai. IOS use mein entries ko protect bhi karta hai: busy pool delete karne par <code>%Pool PUBLIC in use, cannot destroy</code> aata hai, aur use mein rule hataane par poochta hai <code>Dynamic mapping in use, do you want to delete all entries? [no]:</code>. Pehle translations clear karo, phir configuration badlo. Clear karne se existing sessions toot jaate hain, isliye production mein change window mein karo.</p>

<h3>debug ip nat (concept)</h3>
<pre class="out">BR# debug ip nat
IP NAT debugging is on
<span class="hl">NAT: s=192.168.1.10->203.0.113.18, d=198.51.100.80 [4521]</span>
NAT*: s=198.51.100.80, d=203.0.113.18->192.168.1.10 [9127]
EDGE# debug ip nat
NAT: translation failed (A), dropping packet s=10.20.0.13 d=198.51.100.80</pre>
<p>Har line ek translated packet hai. <code>s=</code> source hai aur <code>d=</code> destination; arrow rewrite dikhata hai. Outbound mein source badalta hai (inside local se inside global). Inbound mein destination wapas badalta hai. <code>NAT*</code> ka matlab packet fast (CEF) path mein handle hua; brackets ka number IP identification field hai. "translation failed … dropping packet" line batati hai ki match karne wale host ko translation nahi mila, jaise dynamic lab mein PC3 ke saath.</p>
<p>Debugs har packet ki ek line print karte hain. Busy router par isse CPU aur console overload ho sakte hain. Ise ACL se limit karo (ek host ke liye access-list 5 bana kar <code>debug ip nat 5</code>), buffer mein logging prefer karo, aur hamesha <code>undebug all</code> se khatam karo.</p>

<div class="eg"><p><b>Worked example.</b> Dynamic lab mein, PC1 aur PC2 ke succeed aur PC3 ke fail hone ke baad statistics dikhati hain <code>Total active translations: 4 (0 static, 4 dynamic; 2 extended)</code>. Chaar = do simple entries plus do icmp flows; unmein se do extended hain. Pool line <code>allocated 2 (100%), misses 5</code> dikhati hai: PC3 ki paanch ping attempts mein se har ek ko address nahi mila. <code>clear ip nat translation *</code> ke baad total 0 ho jaata hai aur pool allocated 0 (0%) dikhata hai, isliye PC3 ka agla ping succeed hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh expect karna ki <code>clear ip nat translation *</code> galat static entry hata dega. Static mappings configuration hain; unhe <code>no ip nat inside source static …</code> se hatao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jaano kaunsi command kya fact dikhati hai. Inside/outside interface list aur pool usage: <b>statistics</b>. Individual mappings aur ports: <b>translations</b>. Per-packet rewrites: <b>debug ip nat</b>.</p></div>

<div class="scn"><h4>Change jo lagu hi nahi hua</h4><p>Ek engineer ne purana rule hata kar aur <code>overload</code> jod kar branch ko dynamic NAT se PAT par shift kiya. Users ek ghante tak failures report karte rahe. <code>show ip nat translations</code> mein pehle wale rule ki purani <code>---</code> one-to-one entries ab bhi thin, jo dono pool addresses pakde hue thin. <code>clear ip nat translation *</code> ke baad nayi PAT entries dikhin aur sab browse kar paaye.</p><p><b>Seekh:</b> NAT rules badalne ke baad dynamic translations clear karo (window mein) taaki naya behaviour turant lagu ho.</p></div>

<div class="iv"><p class="q">"IOS par NAT verify aur troubleshoot karne ke liye kaunsi commands use karte ho?"</p><p>Strong answer: mappings dekhne ke liye show ip nat translations (timers ke liye verbose ke saath); inside aur outside interfaces, active counts, hits aur misses, rule-to-pool binding aur pool usage check karne ke liye show ip nat statistics; change ke baad dynamic entries hataane ke liye clear ip nat translation *; rewrites live dekhne ke liye ACL se limited debug ip nat. ACL aur rule confirm karne ke liye show access-lists aur show running-config | include nat jodo, aur inside host se asli test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>translations = table; --- lines simple entries hain, tcp/udp/icmp lines flows.</li>
<li>statistics = interfaces, counts, hits/misses, rule bindings, pool allocated % aur pool misses.</li>
<li>clear ip nat translation * sirf dynamic entries hataata hai; rules badalne se pehle clear karo.</li>
<li>debug ip nat har packet ke s= aur d= rewrites dikhata hai; ise limit karo aur band karo.</li>
<li>Use mein pool tab tak delete nahi hota jab tak uske translations clear na hon.</li>
</ul></div>
`}};export{e as default};