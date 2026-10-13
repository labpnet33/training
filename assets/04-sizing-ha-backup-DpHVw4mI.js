var e={id:`sizing-ha-backup`,h:{en:`Sizing, HA and backup of the FortiAnalyzer itself`,hi:`FortiAnalyzer ka sizing, HA aur backup`},body:{en:`
<p>A library has three worries that have nothing to do with the books themselves. Is the building big enough for the shelves we will need next year? What happens if the only librarian falls ill? And if there is a fire, can we rebuild the catalogue? A FortiAnalyzer holds the evidence of the whole company, so it has the same three worries: sizing, availability and backup. This chapter explains them. Most of it is <b>theory</b>: the simulator models storage and quota, but it does not model high availability, log forwarding, backup, restore or upgrades. We say so for each topic.</p>

<h3>Sizing: from logs per second to disks</h3>
<p>Sizing answers one question: how much disk will the logs of the retention period need? The arithmetic is the same everywhere.</p>
<ol>
<li>Estimate the <b>log rate</b>: logs per second from all FortiGates at the busy hour (traffic, UTM and event logs together).</li>
<li>Multiply by the <b>average log size</b> in bytes. This depends on logging mode, UTM, and the product version; measure it in your own network.</li>
<li>Multiply by seconds per day to get bytes per day.</li>
<li>Multiply by the days of <b>analytics</b> retention (searchable). Add the <b>archive</b> days (compressed, not searchable) at their smaller size.</li>
<li>Add growth for the next year and a safety margin.</li>
</ol>
<div class="eg"><p><b>Worked example (simulator numbers).</b> Suppose all Kaveri FortiGates together send 200 logs per second, and we use the simulator stand-in of 700 bytes per log. One day is 200 x 86,400 = 17,280,000 logs, about 12.1 GB. Analytics for 60 days (the default) is about 726 GB. The simulator stores the archive at a quarter of the size, so 305 more days (up to 365) cost 305 x 3.0 GB, about 922 GB. Total near 1.65 TB before growth. Real products differ: use real measured sizes, not these stand-ins.</p></div>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Sizing arithmetic">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="44" text-anchor="middle" class="svg-ink" font-size="13">Logs/sec</text><text x="65" y="62" text-anchor="middle" class="svg-muted" font-size="12">busy hour</text>
<rect x="150" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="205" y="44" text-anchor="middle" class="svg-ink" font-size="13">x size</text><text x="205" y="62" text-anchor="middle" class="svg-muted" font-size="12">bytes per log</text>
<rect x="290" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="345" y="44" text-anchor="middle" class="svg-ink" font-size="13">x days</text><text x="345" y="62" text-anchor="middle" class="svg-muted" font-size="12">analytics + archive</text>
<rect x="430" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">+ growth</text><text x="485" y="62" text-anchor="middle" class="svg-muted" font-size="12">+ margin</text>
<line x1="120" y1="48" x2="150" y2="48" stroke="#64748b" stroke-width="2"/><line x1="260" y1="48" x2="290" y2="48" stroke="#64748b" stroke-width="2"/><line x1="400" y1="48" x2="430" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="540" y="20" width="90" height="56" rx="8" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="13">Disk</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="12">per ADOM</text>
<line x1="540" y1="48" x2="540" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="10" y="120" class="svg-muted" font-size="12">Then split it by ADOM: each ADOM has its own quota, so a noisy branch cannot fill the others.</text>
</svg><p class="cap">Sizing is multiplication. Measure the inputs, do not guess them.</p></div>
<p>In the simulator you can see the result of the arithmetic on one ADOM:</p>
<pre class="out">FAZ-1 # execute fazui storage root
Storage of ADOM root on FAZ-1:
  Disk quota          : 1000 MB (default; set it in config system log quota)
  Used                : 8.48 KB (0.001 percent)   analytics 8.48 KB, archive 0 B
  <span class="hl">When the quota is full: overwrite the oldest logs</span>
  Retention           : analytics 60 days, archive 365 days
  Logs stored         : analytics 13 (traffic 7, utm 1, event 5), archive 0
  Overwritten (quota) : 0   Rejected (quota): 0</pre>
<p>If the quota is too small for the retention days, "overwrite" quietly deletes the oldest logs and the retention you promised is not real; "drop" keeps old logs but rejects new ones, which is usually worse for an investigation. Watch the Used percent and the Overwritten and Rejected counters; this is the sizing alarm.</p>

<h3>High availability (theory)</h3>
<p><b>HA</b> (high availability) means more than one FortiAnalyzer unit so that the service survives a failure of one. The real product offers HA modes in which a secondary unit keeps a copy of the data and can take over, and also lets you place a collector in front. The simulator has one unit: <code>get system status</code> prints <code>HA Mode : Stand Alone</code>, and no HA command exists. For the course, know the idea and the vocabulary only.</p>

<h3>Collector and analyzer, forwarding and aggregation (theory)</h3>
<p>Large networks split the work. A <b>collector</b> receives logs from FortiGates and stores them fast; an <b>analyzer</b> does the searching, events and reports. <b>Log forwarding</b> sends a copy of incoming logs to another system (another FortiAnalyzer, or a syslog server). <b>Aggregation</b> sends logs from a collector to an analyzer. In the simulator each device logs straight to FAZ-1 in one mode; none of these exist as commands.</p>

<h3>Backup, restore and upgrade (theory)</h3>
<p>Two different things need a backup. The <b>configuration</b> of the unit (device table, ADOMs, handlers, quota, administrators) is small and is backed up often; losing it is annoying. The <b>logs</b> are large and are the real value; they are protected by HA, by forwarding a copy elsewhere, or by disk snapshots in a virtual machine, according to the company rule. An <b>upgrade</b> changes the firmware of FAZ-1, and ADOM versions follow their own rules. None of this is modelled: in the simulator the configuration tables survive save and restore of a lab, and stored logs, events and counters are lost on purpose, so after a restore you generate traffic again.</p>

<div class="warn"><p><b>Common mistakes.</b> Sizing from the average hour instead of the busy hour. Forgetting the archive. Giving one big ADOM a tiny quota and wondering why the oldest logs vanish. Believing that a configuration backup contains the logs. Treating this theory chapter as commands you can type in the lab.</p></div>

<div class="exam"><p><b>Exam traps.</b> Analytics logs are searchable and archive logs are not. Quota is per ADOM. Overwrite deletes the oldest, drop rejects the newest. The simulator size values (700 bytes, 1000 MB, a quarter for the archive) are stand-ins. HA, forwarding, aggregation, backup and upgrade are theory here.</p></div>

<div class="scn"><h4>The audit that found a hole</h4><p>A retailer promised 90 days of searchable logs, but the quota was sized for a quiet month. During a festival sale the traffic tripled, the quota policy was overwrite, and the oldest 40 days disappeared without any alarm. The auditor asked for a day from 70 days ago and there was nothing. The team added a weekly check of the storage output and sized the quota for the busy hour.</p><p><b>Lesson:</b> retention is a promise only while the quota is big enough; monitor Used percent and Overwritten.</p></div>

<div class="iv"><p class="q">"How would you size a FortiAnalyzer for a company with 40 FortiGates?"</p><p>Measure logs per second at the busy hour and the average log size, multiply by seconds per day and by the retention days, treat the archive separately, then add growth and margin. Split the result per ADOM and set quotas. Mention that HA and a copy of the logs are a separate design decision.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sizing is log rate x log size x seconds x retention days, plus growth.</li>
<li>Quota is per ADOM; overwrite hides lost history, so monitor the storage counters.</li>
<li>HA, forwarding, collector and analyzer, backup and upgrade are theory in this simulator.</li>
<li>Back up configuration and protect logs separately; they are different problems.</li>
<li>Stored logs are lost on save and restore of a lab; the configuration is kept.</li>
</ul></div>
`,hi:`
<p>Ek library ki teen chintayein hoti hain jinka kitabon se seedha lena-dena nahi. Kya building agle saal ki shelves ke liye kaafi badi hai? Agar akela librarian bimar pad jaye to kya hoga? Aur aag lag jaye to kya hum catalogue dobara bana sakte hain? FortiAnalyzer poori company ka evidence rakhta hai, isliye uski bhi wahi teen chintayein hain: sizing, availability aur backup. Ye chapter unhe samjhata hai. Zyada hissa <b>theory</b> hai: simulator storage aur quota model karta hai, par high availability, log forwarding, backup, restore ya upgrades model nahi karta. Har topic par hum ye batate hain.</p>

<h3>Sizing: logs per second se disks tak</h3>
<p>Sizing ek sawal ka jawab deti hai: retention period ke logs ko kitni disk chahiye? Arithmetic har jagah ek hi hai.</p>
<ol>
<li><b>Log rate</b> estimate karo: busy hour mein saare FortiGates ke milke logs per second (traffic, UTM aur event logs saath).</li>
<li><b>Average log size</b> bytes mein multiply karo. Ye logging mode, UTM aur product version par depend karta hai; apne network mein measure karo.</li>
<li>Seconds per day se multiply karke bytes per day nikalo.</li>
<li><b>Analytics</b> retention ke days se multiply karo (searchable). <b>Archive</b> ke days chhote size ke saath jodo (compressed, searchable nahi).</li>
<li>Agle saal ki growth aur safety margin jodo.</li>
</ol>
<div class="eg"><p><b>Worked example (simulator numbers).</b> Maan lo Kaveri ke saare FortiGates milke 200 logs per second bhejte hain, aur hum simulator stand-in 700 bytes per log use karte hain. Ek din 200 x 86,400 = 17,280,000 logs, lagbhag 12.1 GB. 60 din (default) ka analytics lagbhag 726 GB. Simulator archive ko ek chauthai size mein store karta hai, to 305 din aur (365 tak) 305 x 3.0 GB, lagbhag 922 GB. Growth se pehle total lagbhag 1.65 TB. Real products alag hote hain: real measured sizes use karo, in stand-ins ko nahi.</p></div>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Sizing arithmetic">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="44" text-anchor="middle" class="svg-ink" font-size="13">Logs/sec</text><text x="65" y="62" text-anchor="middle" class="svg-muted" font-size="12">busy hour</text>
<rect x="150" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="205" y="44" text-anchor="middle" class="svg-ink" font-size="13">x size</text><text x="205" y="62" text-anchor="middle" class="svg-muted" font-size="12">bytes per log</text>
<rect x="290" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="345" y="44" text-anchor="middle" class="svg-ink" font-size="13">x days</text><text x="345" y="62" text-anchor="middle" class="svg-muted" font-size="12">analytics + archive</text>
<rect x="430" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">+ growth</text><text x="485" y="62" text-anchor="middle" class="svg-muted" font-size="12">+ margin</text>
<line x1="120" y1="48" x2="150" y2="48" stroke="#64748b" stroke-width="2"/><line x1="260" y1="48" x2="290" y2="48" stroke="#64748b" stroke-width="2"/><line x1="400" y1="48" x2="430" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="540" y="20" width="90" height="56" rx="8" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="13">Disk</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="12">per ADOM</text>
<line x1="540" y1="48" x2="540" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="10" y="120" class="svg-muted" font-size="12">Phir ADOM ke hisaab se baanto: har ADOM ka apna quota hai, shor machane wali branch baakiyon ko nahi bharegi.</text>
</svg><p class="cap">Sizing multiplication hai. Inputs measure karo, guess mat karo.</p></div>
<p>Simulator mein ek ADOM par arithmetic ka result dekh sakte ho:</p>
<pre class="out">FAZ-1 # execute fazui storage root
Storage of ADOM root on FAZ-1:
  Disk quota          : 1000 MB (default; set it in config system log quota)
  Used                : 8.48 KB (0.001 percent)   analytics 8.48 KB, archive 0 B
  <span class="hl">When the quota is full: overwrite the oldest logs</span>
  Retention           : analytics 60 days, archive 365 days
  Logs stored         : analytics 13 (traffic 7, utm 1, event 5), archive 0
  Overwritten (quota) : 0   Rejected (quota): 0</pre>
<p>Agar quota retention days ke liye chhota hai to "overwrite" chupchaap sabse purane logs delete kar deta hai aur jo retention aapne promise ki wo asli nahi rehti; "drop" purane logs rakhta hai par naye reject karta hai, jo investigation ke liye aksar aur bura hai. Used percent aur Overwritten, Rejected counters dekhte raho; yahi sizing ka alarm hai.</p>

<h3>High availability (theory)</h3>
<p><b>HA</b> (high availability) ka matlab hai ek se zyada FortiAnalyzer unit, taaki ek ke fail hone par service bachi rahe. Real product HA modes deta hai jisme secondary unit data ki copy rakhta hai aur take over kar sakta hai, aur aap saamne collector bhi rakh sakte ho. Simulator mein ek hi unit hai: <code>get system status</code> <code>HA Mode : Stand Alone</code> print karta hai, aur koi HA command nahi hai. Course ke liye sirf idea aur vocabulary jaano.</p>

<h3>Collector aur analyzer, forwarding aur aggregation (theory)</h3>
<p>Bade networks kaam baant dete hain. <b>Collector</b> FortiGates se logs receive karke tez store karta hai; <b>analyzer</b> searching, events aur reports karta hai. <b>Log forwarding</b> aane wale logs ki copy doosre system ko bhejti hai (doosra FortiAnalyzer, ya syslog server). <b>Aggregation</b> collector se analyzer ko logs bhejta hai. Simulator mein har device seedha FAZ-1 ko ek mode mein log karta hai; inme se koi bhi command ke roop mein nahi hai.</p>

<h3>Backup, restore aur upgrade (theory)</h3>
<p>Do alag cheezon ko backup chahiye. Unit ki <b>configuration</b> (device table, ADOMs, handlers, quota, administrators) chhoti hoti hai aur aksar backup hoti hai; ise khona pareshani hai. <b>Logs</b> bade hain aur asli keemat wahi hain; unhe HA, kahin aur copy forward karke, ya virtual machine ke disk snapshots se, company rule ke hisaab se protect kiya jaata hai. <b>Upgrade</b> FAZ-1 ka firmware badalta hai, aur ADOM versions ke apne rules hain. Inme se kuch model nahi hai: simulator mein lab save aur restore par configuration tables bachti hain, aur stored logs, events aur counters jaanboojhkar lost hote hain, isliye restore ke baad aap dobara traffic generate karte ho.</p>

<div class="warn"><p><b>Common mistakes.</b> Average hour se sizing karna, busy hour se nahi. Archive bhool jaana. Ek bade ADOM ko chhota quota dena aur sochna ki sabse purane logs kahan gaye. Maan lena ki configuration backup mein logs hote hain. Is theory chapter ko aise samajhna jaise ye commands lab mein type kar sakte ho.</p></div>

<div class="exam"><p><b>Exam traps.</b> Analytics logs searchable hain aur archive logs nahi. Quota per ADOM hai. Overwrite sabse purane delete karta hai, drop sabse naye reject karta hai. Simulator size values (700 bytes, 1000 MB, archive ke liye ek chauthai) stand-ins hain. HA, forwarding, aggregation, backup aur upgrade yahan theory hain.</p></div>

<div class="scn"><h4>Audit jisme ek hole mila</h4><p>Ek retailer ne 90 din ke searchable logs ka vaada kiya, par quota ek shant mahine ke hisaab se size hua tha. Festival sale mein traffic teen guna ho gaya, quota policy overwrite thi, aur sabse purane 40 din bina kisi alarm ke gayab ho gaye. Auditor ne 70 din purane ek din ke logs maange aur kuch nahi mila. Team ne storage output ka weekly check jodha aur quota busy hour ke hisaab se size kiya.</p><p><b>Lesson:</b> retention tabhi vaada hai jab quota kaafi bada ho; Used percent aur Overwritten monitor karo.</p></div>

<div class="iv"><p class="q">"40 FortiGates wali company ke liye FortiAnalyzer ka size kaise nikaloge?"</p><p>Busy hour ke logs per second aur average log size measure karo, seconds per day aur retention days se multiply karo, archive ko alag treat karo, phir growth aur margin jodo. Result ko ADOM ke hisaab se baanto aur quotas set karo. Bolo ki HA aur logs ki copy alag design decision hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sizing = log rate x log size x seconds x retention days, plus growth.</li>
<li>Quota per ADOM hai; overwrite khoi hui history chhupata hai, isliye storage counters monitor karo.</li>
<li>HA, forwarding, collector aur analyzer, backup aur upgrade is simulator mein theory hain.</li>
<li>Configuration backup aur logs ki protection alag problems hain.</li>
<li>Lab save aur restore par stored logs lost hote hain; configuration bachti hai.</li>
</ul></div>
`}};export{e as default};