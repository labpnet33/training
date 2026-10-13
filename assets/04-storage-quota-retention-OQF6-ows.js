var e={id:`storage-quota-retention`,h:{en:`Storage: analytics, archive, quota and retention`,hi:`Storage: analytics, archive, quota aur retention`},body:{en:`
<p>A bank keeps this month's cheque slips in a drawer at the counter, because customers ask for them often. Older slips go to a basement store: still safe, but slow to reach and nobody searches them casually. After seven years the very old boxes are shredded. FortiAnalyzer treats logs the same way, with two storage areas and a clock.</p>

<h3>Analytics and archive</h3>
<dl class="terms">
<dt>Analytics logs</dt><dd>The recent, indexed logs. Log View searches them and reports are built from them. They take the full space.</dd>
<dt>Archive logs</dt><dd>Older logs kept in compressed form. They are not searchable in Log View and not used by reports, but they are still on disk for evidence. In the simulator an archived log uses a quarter of its original size (a stand-in; real ratios vary).</dd>
<dt>Analytics retention</dt><dd>Number of days a log stays searchable. Default in the simulator: 60. After that it moves to the archive.</dd>
<dt>Archive retention</dt><dd>Days a log stays in the archive before it is deleted. Default: 365, and never less than the analytics value.</dd>
<dt>Quota</dt><dd>The disk space an ADOM may use. The simulator default is 1000 MB.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Life of a log: analytics, archive, deleted">
<rect x="20" y="40" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">searchable, in reports</text>
<rect x="225" y="40" width="190" height="70" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">Archive</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">not searchable, 25 percent size</text>
<rect x="430" y="40" width="190" height="70" rx="8" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="13">Deleted</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">gone for good</text>
<line x1="210" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="218" y="30" text-anchor="middle" class="svg-accent" font-size="12">after 60 days</text><text x="423" y="30" text-anchor="middle" class="svg-accent" font-size="12">after 365 days</text>
</svg><p class="cap">Default clock of the simulator. Both numbers are settings per ADOM.</p></div>

<h3>Quota: overwrite or drop</h3>
<p>If logs arrive faster than retention frees space, the quota fills. The unit then follows its <code>quota-policy</code>: <b>overwrite</b> (default) deletes the oldest logs, archive first, until the new log fits; <b>drop</b> refuses the new log and keeps the old ones. Overwrite keeps the newest evidence and sacrifices history. Drop keeps history and sacrifices what is happening now. Most teams choose overwrite for operations and add disk before the quota fills.</p>

<h3>Reading the storage output</h3>
<p>The stand-in command <code>execute fazui storage &lt;adom&gt;</code> shows everything on one screen (in the real product these numbers are on the GUI storage and ADOM pages). After a few web sessions from the branch PCs, with default settings:</p>
<pre class="out">FAZ-1 # execute fazui storage Kaveri
Storage of ADOM Kaveri on FAZ-1:
  Disk quota          : 1000 MB (default; set it in config system log quota)
  Used                : 2.73 KB (0 percent)   analytics 2.73 KB, archive 0 B
  When the quota is full: overwrite the oldest logs
  <span class="hl">Retention           : analytics 60 days, archive 365 days</span>
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 4
  Overwritten (quota) : 0   Rejected (quota): 0
  Oldest analytics log: 2026-10-12 20:43:40</pre>
<p>Each stored log is counted at an estimated size (<code>est-log-size</code>, 700 bytes in the simulator). Traffic logs count once, UTM logs 1.4 times and event logs 0.8 times. "Received so far" counts every log that arrived, even one that was overwritten or rejected, so it is the number to compare with the device counters.</p>

<h3>Setting the values</h3>
<p>The ADOM values live in <code>config system log quota</code> (key = ADOM name) and the policy in <code>config system log settings</code>. Both are simulator stand-ins for ADOM properties and system settings that are GUI pages in the real product. A value of 0 for retention means "use the default".</p>
<pre class="code">config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end
config system log settings
    set quota-policy overwrite
end</pre>

<div class="eg"><p><b>Worked example: how much disk?</b> Assume Retail produces 5 million logs a day and the average log takes 700 bytes. That is about 3.5 GB a day. Thirty days of analytics need about 105 GB. The archive covers days 31 to 180, that is 150 days; at a quarter of the size it needs 150 x 3.5 GB x 0.25, about 131 GB. Total about 236 GB; add a safety margin of 20 to 30 percent and you ask for around 300 GB. Real sizes depend on the log mix, so measure a week of production and recalculate.</p></div>

<h3>What a full quota looks like</h3>
<p>To fill a tiny quota the lab raises <code>est-log-size</code> to 250000 bytes and sets a quota of 1 MB, so only four logs fit. The next logs push the oldest out:</p>
<pre class="out">FAZ-1 # execute fazui storage root
  Disk quota          : 1 MB
  Used                : 976.56 KB (95.367 percent)   analytics 976.56 KB, archive 0 B
  When the quota is full: overwrite the oldest logs
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 7
  <span class="hl">Overwritten (quota) : 3</span>   Rejected (quota): 0</pre>
<p>With <code>quota-policy drop</code> the counter "Rejected (quota)" grows instead, and Overwritten stays where it was.</p>

<div class="note"><p><b>Retention and the lab.</b> Days do not pass by themselves in a simulator session, so you cannot watch a log age. The author's test harness moved the simulated wall clock forward by 61 days. This is real captured output of that test, shown as theory of what happens, not something you can repeat in a lab:</p>
<pre class="out">  Used                : 244.14 KB (0.024 percent)   analytics 0 B, archive 244.14 KB
  Logs stored         : analytics 0 (traffic 0, utm 0, event 0), <span class="hl">archive 4</span>
  Oldest analytics log: -</pre></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting archive retention below analytics retention; the unit never uses less than analytics. (2) Believing archived logs can be searched in Log View. (3) Reading "Used 0 percent" as proof that nothing is wrong; check the Overwritten and Rejected counters too. (4) Forgetting that the quota is per ADOM, not for the whole disk.</p></div>

<div class="exam"><p><b>Exam traps.</b> Moves to the archive after the analytics days, deleted after the archive days. Overwrite deletes old logs, drop rejects new logs. A quota change is per ADOM.</p></div>

<div class="scn"><h4>The audit that found a hole</h4><p>A retailer's quota was 20 GB with overwrite policy. During a sale month the logs filled 20 GB in three weeks, so the oldest week vanished. An auditor asked for the first week and nothing was left. The engineer had looked only at "Used 80 percent" every Monday. After the incident the team watched the Overwritten counter, sized the disk for 30 days and set an alert at 70 percent.</p><p><b>Lesson:</b> a non-zero Overwritten counter means history is already gone.</p></div>

<div class="iv"><p class="q">"What is the difference between analytics and archive logs?"</p><p>Analytics logs are indexed, searchable and used by reports; archive logs are compressed, older, kept for evidence and not searchable. Retention moves logs from one to the other and then deletes them; the quota is the safety limit when the disk fills before the clock does.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics logs are searchable; archive logs are not; deletion comes last.</li>
<li>Retention is a clock in days; the quota is a size limit; both are per ADOM.</li>
<li>Overwrite removes the oldest logs; drop rejects the newest.</li>
<li>Estimate disk as logs per day x average size x days, and archive at a fraction of that.</li>
<li>In the lab you can see quota effects but not aging; aging is explained as theory.</li>
</ul></div>
`,hi:`
<p>Bank is mahine ke cheque slips counter ki drawer mein rakhta hai, kyunki customers unhe aksar maangte hain. Purane slips basement store mein jate hain: safe hain, par pahunchna slow hai aur koi unhe casually search nahi karta. Saat saal baad bahut purane boxes shred ho jate hain. FortiAnalyzer logs ke saath wahi karta hai: do storage areas aur ek clock.</p>

<h3>Analytics aur archive</h3>
<dl class="terms">
<dt>Analytics logs</dt><dd>Recent, indexed logs. Log View inhe search karta hai aur reports inhi se bante hain. Ye poori space lete hain.</dd>
<dt>Archive logs</dt><dd>Purane logs compressed form mein. Ye Log View mein searchable nahi hote aur reports mein use nahi hote, par evidence ke liye disk par rehte hain. Simulator mein archived log original size ka chauthai hissa leta hai (stand-in; real ratios alag hote hain).</dd>
<dt>Analytics retention</dt><dd>Log kitne din searchable rehta hai. Simulator default: 60. Uske baad wo archive mein jata hai.</dd>
<dt>Archive retention</dt><dd>Log delete hone se pehle archive mein kitne din rehta hai. Default: 365, aur analytics value se kam kabhi nahi.</dd>
<dt>Quota</dt><dd>Ek ADOM kitni disk space use kar sakta hai. Simulator default 1000 MB hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Log ki zindagi: analytics, archive, deleted">
<rect x="20" y="40" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">searchable, reports mein</text>
<rect x="225" y="40" width="190" height="70" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">Archive</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">searchable nahi, 25 percent size</text>
<rect x="430" y="40" width="190" height="70" rx="8" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="13">Deleted</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">hamesha ke liye gaya</text>
<line x1="210" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="218" y="30" text-anchor="middle" class="svg-accent" font-size="12">60 din baad</text><text x="423" y="30" text-anchor="middle" class="svg-accent" font-size="12">365 din baad</text>
</svg><p class="cap">Simulator ki default clock. Dono numbers per ADOM settings hain.</p></div>

<h3>Quota: overwrite ya drop</h3>
<p>Agar logs retention se tez aate hain to quota bhar jata hai. Tab unit apni <code>quota-policy</code> follow karta hai: <b>overwrite</b> (default) sabse purane logs delete karta hai, pehle archive, jab tak naya log fit na ho; <b>drop</b> naya log refuse karta hai aur purane rakhta hai. Overwrite sabse naya evidence rakhta hai aur history ki qurbani deta hai. Drop history rakhta hai aur abhi jo ho raha hai uski qurbani deta hai. Zyadatar teams operations ke liye overwrite chunti hain aur quota bharne se pehle disk badhati hain.</p>

<h3>Storage output padhna</h3>
<p>Stand-in command <code>execute fazui storage &lt;adom&gt;</code> sab kuch ek screen par dikhata hai (real product mein ye numbers GUI ke storage aur ADOM pages par hote hain). Branch PCs se kuch web sessions ke baad, default settings ke saath:</p>
<pre class="out">FAZ-1 # execute fazui storage Kaveri
Storage of ADOM Kaveri on FAZ-1:
  Disk quota          : 1000 MB (default; set it in config system log quota)
  Used                : 2.73 KB (0 percent)   analytics 2.73 KB, archive 0 B
  When the quota is full: overwrite the oldest logs
  <span class="hl">Retention           : analytics 60 days, archive 365 days</span>
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 4
  Overwritten (quota) : 0   Rejected (quota): 0
  Oldest analytics log: 2026-10-12 20:43:40</pre>
<p>Har stored log estimated size par ginta hai (<code>est-log-size</code>, simulator mein 700 bytes). Traffic logs ek baar, UTM logs 1.4 guna aur event logs 0.8 guna ginte hain. "Received so far" har aaye hue log ko ginta hai, chahe wo overwrite ya reject ho gaya ho, isliye device counters se compare karne ke liye yahi number hai.</p>

<h3>Values set karna</h3>
<p>ADOM values <code>config system log quota</code> mein hain (key = ADOM naam) aur policy <code>config system log settings</code> mein. Dono simulator stand-ins hain un ADOM properties aur system settings ke, jo real product mein GUI pages hain. Retention mein 0 ka matlab "default use karo".</p>
<pre class="code">config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end
config system log settings
    set quota-policy overwrite
end</pre>

<div class="eg"><p><b>Worked example: kitni disk?</b> Maano Retail roz 5 million logs banata hai aur average log 700 bytes ka hai. Yaani lagbhag 3.5 GB roz. Tees din ke analytics ko lagbhag 105 GB chahiye. Archive din 31 se 180 tak, yaani 150 din, cover karta hai; chauthai size par 150 x 3.5 GB x 0.25, lagbhag 131 GB. Total lagbhag 236 GB; 20 se 30 percent safety margin jodo aur aap lagbhag 300 GB maangoge. Real sizes log mix par depend karte hain, isliye production ka ek hafta measure karo aur dobara calculate karo.</p></div>

<h3>Full quota kaisa dikhta hai</h3>
<p>Chhote quota ko bharne ke liye lab <code>est-log-size</code> ko 250000 bytes karta hai aur quota 1 MB, to sirf chaar logs fit hote hain. Agle logs sabse purane ko bahar dhakelte hain:</p>
<pre class="out">FAZ-1 # execute fazui storage root
  Disk quota          : 1 MB
  Used                : 976.56 KB (95.367 percent)   analytics 976.56 KB, archive 0 B
  When the quota is full: overwrite the oldest logs
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 7
  <span class="hl">Overwritten (quota) : 3</span>   Rejected (quota): 0</pre>
<p><code>quota-policy drop</code> ke saath "Rejected (quota)" counter badhta hai, aur Overwritten wahin rehta hai.</p>

<div class="note"><p><b>Retention aur lab.</b> Simulator session mein din apne aap nahi guzarte, isliye aap log ko age hota nahi dekh sakte. Author ke test harness ne simulated wall clock ko 61 din aage badhaya. Ye us test ka real captured output hai, theory ke roop mein dikhaya gaya ki kya hota hai, lab mein repeat karne wali cheez nahi:</p>
<pre class="out">  Used                : 244.14 KB (0.024 percent)   analytics 0 B, archive 244.14 KB
  Logs stored         : analytics 0 (traffic 0, utm 0, event 0), <span class="hl">archive 4</span>
  Oldest analytics log: -</pre></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Archive retention ko analytics retention se kam set karna; unit analytics se kam kabhi use nahi karta. (2) Maanna ki archived logs Log View mein search ho sakte hain. (3) "Used 0 percent" ko sab theek hone ka saboot samajhna; Overwritten aur Rejected counters bhi dekho. (4) Bhool jana ki quota per ADOM hai, poori disk ka nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Analytics din ke baad archive mein jata hai, archive din ke baad delete hota hai. Overwrite purane logs delete karta hai, drop naye logs reject karta hai. Quota change per ADOM hota hai.</p></div>

<div class="scn"><h4>Audit ne chhed dhoondha</h4><p>Ek retailer ka quota 20 GB tha aur policy overwrite. Sale ke mahine mein logs teen hafte mein 20 GB bhar gaye, to sabse purana hafta gayab ho gaya. Auditor ne pehla hafta manga aur kuch nahi bacha tha. Engineer har Monday sirf "Used 80 percent" dekhta tha. Incident ke baad team ne Overwritten counter dekhna shuru kiya, 30 din ke liye disk size ki aur 70 percent par alert lagaya.</p><p><b>Lesson:</b> Overwritten counter non-zero hai to history pehle hi ja chuki hai.</p></div>

<div class="iv"><p class="q">"Analytics aur archive logs mein kya fark hai?"</p><p>Analytics logs indexed, searchable aur reports mein use hote hain; archive logs compressed, purane, evidence ke liye rakhe jate hain aur searchable nahi hote. Retention logs ko ek se doosre mein le jati hai aur phir delete karti hai; quota safety limit hai jab disk clock se pehle bhar jaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics logs searchable hain; archive logs nahi; delete sabse aakhir mein.</li>
<li>Retention din ki clock hai; quota size ki limit; dono per ADOM hain.</li>
<li>Overwrite sabse purane logs hatata hai; drop sabse naye reject karta hai.</li>
<li>Disk estimate: logs per day x average size x days, aur archive uska ek hissa.</li>
<li>Lab mein quota ka asar dikhta hai par aging nahi; aging theory ke roop mein samjhayi gayi hai.</li>
</ul></div>
`}};export{e as default};