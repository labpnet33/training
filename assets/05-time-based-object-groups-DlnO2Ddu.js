var e={id:`time-based-object-groups`,h:{en:`Time-based ACLs and object groups`,hi:`Time-based ACLs aur object groups`},body:{en:`
<p>Some office doors have a time lock: the contractor badge opens the server room only on weekdays from 9 to 6. The lock does not know the real time; it trusts the little clock inside it. If that clock is wrong, or set to the wrong time zone, the door opens at the wrong hours and nobody understands why. Time-based ACLs work exactly like that. And when the door list becomes long, the security team starts writing "all finance staff" instead of fifty names. That shortcut is an <b>object group</b>.</p>

<h3>Time-based ACLs: the building blocks</h3>
<p>A <b>time-range</b> is a named schedule. An ACL entry that references it is active only while the time-range is active; outside that window the entry is simply skipped, as if it were not there, and the packet continues down the list.</p>
<pre class="code"><span class="c">! weekdays 08:00 to 18:00, and only during October 2026</span>
time-range CONTRACTOR-HOURS
 periodic weekdays 8:00 to 18:00
 absolute start 00:00 01 October 2026 end 23:59 31 October 2026
!
ip access-list extended SRV-IN
 10 permit tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 time-range CONTRACTOR-HOURS
 20 deny   tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22
 30 permit ip any any
interface GigabitEthernet0/1
 ip access-group SRV-IN in</pre>
<ul>
<li><code>periodic</code> repeats: <code>daily</code>, <code>weekdays</code>, <code>weekend</code>, or named days such as <code>Monday Wednesday</code>.</li>
<li><code>absolute</code> is a one-time window with a start and/or end date. When both are present, the periodic schedule applies only inside the absolute window.</li>
<li>Only one <code>absolute</code> line is allowed per time-range; several <code>periodic</code> lines are allowed.</li>
</ul>

<h3>The clock dependency</h3>
<p>The router evaluates time-ranges against its own <b>local clock</b>, including the configured time zone and summer time. If the clock is wrong, the ACL is wrong. After a reload a router without a hardware calendar may start at an arbitrary default date, and <code>show clock</code> marks an unsynchronised time with an asterisk.</p>
<pre class="out">R1# show clock
<span class="hl">*</span>01:12:44.019 UTC Mon Mar 1 1993

R1# show time-range
time-range entry: CONTRACTOR-HOURS (<span class="hl">inactive</span>)
   periodic weekdays 8:00 to 18:00
   absolute start 00:00 01 October 2026 end 23:59 31 October 2026
   used in: IP ACL entry

R1# show ip access-lists SRV-IN
Extended IP access list SRV-IN
    10 permit tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 time-range CONTRACTOR-HOURS (<span class="hl">inactive</span>)
    20 deny tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 (14 matches)
    30 permit ip any any (2231 matches)</pre>
<p>The asterisk says the clock is not authoritative, the year is 1993, and the time-range is inactive, so every contractor SSH hits line 20. Fix the clock, ideally with NTP, and set the correct zone:</p>
<pre class="code">clock timezone IST 5 30
ntp server 10.10.10.123
<span class="c">! verify</span>
<span class="c">! show ntp status        -> Clock is synchronized</span>
<span class="c">! show clock            -> no asterisk, correct date</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Time-range evaluation">
<rect x="10" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">NTP / clock</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="12">+ time zone</text>
<rect x="190" y="70" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="260" y="95" text-anchor="middle" class="svg-ink" font-size="13">time-range</text><text x="260" y="114" text-anchor="middle" class="svg-muted" font-size="12">active / inactive</text>
<rect x="380" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="440" y="95" text-anchor="middle" class="svg-ink" font-size="13">ACL entry</text><text x="440" y="114" text-anchor="middle" class="svg-muted" font-size="12">used / skipped</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="105" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<line x1="140" y1="100" x2="190" y2="100" stroke="#64748b" stroke-width="2"/><line x1="330" y1="100" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="500" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Wrong clock = wrong ACL, with no error message</text>
</svg><p class="cap">A time-based entry is only as correct as the router's clock.</p></div>

<h3>Object groups: fewer lines, fewer mistakes</h3>
<p>An <b>object group</b> is a named set of addresses (network) or protocols and ports (service) that an extended ACL can reference. One ACL line then expands to every combination internally, which keeps the configuration short and makes changes safer: add a server to the group, and every ACL that uses the group follows.</p>
<pre class="code">object-group network WEB-SERVERS
 host 10.50.0.10
 host 10.50.0.11
 10.50.8.0 255.255.255.0
object-group network BRANCHES
 10.60.0.0 255.255.0.0
 range 10.70.0.1 10.70.0.50
object-group service WEB-PORTS
 tcp eq 443
 tcp eq www
!
ip access-list extended BRANCH-TO-WEB
 10 permit object-group WEB-PORTS object-group BRANCHES object-group WEB-SERVERS
 20 deny   ip object-group BRANCHES object-group WEB-SERVERS log</pre>
<p>Note the syntax: inside a network object group, networks are written with a <b>subnet mask</b>, not a wildcard. Verify with <code>show object-group</code> or <code>show object-group name WEB-SERVERS</code>, and use <code>show ip access-lists</code> for the counters, which are kept per ACL line.</p>

<div class="eg"><p><b>Worked example.</b> A new web server 10.50.0.12 is added and branches cannot reach it. <code>show object-group name WEB-SERVERS</code> lists only .10 and .11, so the new host falls to line 20 and is denied. One command fixes every ACL that uses the group: <code>object-group network WEB-SERVERS</code>, then <code>host 10.50.0.12</code>. No ACL line needs to change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a wildcard mask inside a network object group, which is read as a mask and matches the wrong range. Deleting an object group that is still referenced; IOS refuses and tells you it is in use, so check with <code>show object-group</code> first. Forgetting that a time-range with the wrong zone is off by exactly your UTC offset, for example five and a half hours in India.</p></div>

<div class="exam"><p><b>Exam trap.</b> When the time-range is inactive, the entry is <b>skipped</b>, not turned into a deny. The packet continues to the next lines and may still be permitted by a later entry. Also, time-based ACLs rely on the <b>router's</b> clock, not on the clock of the NTP server or the host.</p></div>

<div class="scn"><h4>Contractors locked out after a power cut</h4><p>After a weekend power cut, contractors could not SSH to the lab servers on Monday. <code>show time-range</code> showed CONTRACTOR-HOURS inactive, and <code>show clock</code> had an asterisk and a date years in the past. The router had no reachable NTP server because the NTP ACL on the uplink had been tightened the week before. After permitting UDP 123 from the NTP server, <code>show ntp status</code> showed synchronised, the clock jumped to the right date and the time-range turned active.</p><p><b>Lesson:</b> a time-based ACL problem is often a clock problem, and a clock problem is often an NTP reachability problem.</p></div>

<div class="iv"><p class="q">"A time-based ACL is not working during the configured hours. What do you check?"</p><p>Strong answer: first <code>show clock</code>, looking for the asterisk and the correct date, time zone and summer time; then <code>show ntp status</code> and <code>show ntp associations</code>. Then <code>show time-range</code> to see whether the range is active, and <code>show ip access-lists</code>, which marks the entry active or inactive and shows the counters. Remember that an inactive entry is skipped, so check what the following lines do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A time-range can have many <code>periodic</code> lines and one <code>absolute</code> window; entries referencing it are skipped when inactive.</li>
<li>Time-ranges follow the router's local clock, time zone and summer time; an asterisk in <code>show clock</code> is a warning sign.</li>
<li><code>show time-range</code> and <code>show ip access-lists</code> both show active or inactive.</li>
<li>Network object groups use subnet masks; service object groups hold protocols and ports.</li>
<li>Change the object group, not the ACL, when a host is added or removed.</li>
</ul></div>
`,hi:`
<p>Office ke kuch darwazon par time lock hota hai: contractor badge server room sirf weekdays mein 9 se 6 kholta hai. Lock ko asli time nahi pata; woh apne andar ki chhoti ghadi par bharosa karta hai. Agar woh ghadi galat hai, ya galat time zone par set hai, to darwaza galat ghanton mein khulta hai aur kisi ko samajh nahi aata kyun. Time-based ACLs bilkul aise hi kaam karti hain. Aur jab door list lambi ho jaati hai, security team pachaas naam likhne ki jagah "saara finance staff" likhne lagti hai. Woh shortcut hai <b>object group</b>.</p>

<h3>Time-based ACLs: building blocks</h3>
<p><b>Time-range</b> ek named schedule hai. Jo ACL entry use reference karti hai woh sirf tab active hoti hai jab time-range active ho; us window ke bahar entry bas skip ho jaati hai, jaise woh hai hi nahi, aur packet list mein aage badhta hai.</p>
<pre class="code"><span class="c">! weekdays 08:00 to 18:00, and only during October 2026</span>
time-range CONTRACTOR-HOURS
 periodic weekdays 8:00 to 18:00
 absolute start 00:00 01 October 2026 end 23:59 31 October 2026
!
ip access-list extended SRV-IN
 10 permit tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 time-range CONTRACTOR-HOURS
 20 deny   tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22
 30 permit ip any any
interface GigabitEthernet0/1
 ip access-group SRV-IN in</pre>
<ul>
<li><code>periodic</code> dohrata hai: <code>daily</code>, <code>weekdays</code>, <code>weekend</code>, ya named days jaise <code>Monday Wednesday</code>.</li>
<li><code>absolute</code> ek baar ki window hai jiski start aur/ya end date hoti hai. Jab dono hon, periodic schedule sirf absolute window ke andar lagta hai.</li>
<li>Har time-range mein sirf ek <code>absolute</code> line allowed hai; kai <code>periodic</code> lines allowed hain.</li>
</ul>

<h3>Clock par nirbharta</h3>
<p>Router time-ranges ko apni <b>local clock</b> se evaluate karta hai, configured time zone aur summer time samet. Clock galat hai to ACL galat hai. Reload ke baad bina hardware calendar wala router kisi bhi default date se shuru ho sakta hai, aur <code>show clock</code> unsynchronised time ko asterisk se mark karta hai.</p>
<pre class="out">R1# show clock
<span class="hl">*</span>01:12:44.019 UTC Mon Mar 1 1993

R1# show time-range
time-range entry: CONTRACTOR-HOURS (<span class="hl">inactive</span>)
   periodic weekdays 8:00 to 18:00
   absolute start 00:00 01 October 2026 end 23:59 31 October 2026
   used in: IP ACL entry

R1# show ip access-lists SRV-IN
Extended IP access list SRV-IN
    10 permit tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 time-range CONTRACTOR-HOURS (<span class="hl">inactive</span>)
    20 deny tcp 10.40.0.0 0.0.0.255 host 10.50.0.10 eq 22 (14 matches)
    30 permit ip any any (2231 matches)</pre>
<p>Asterisk batata hai clock authoritative nahi hai, saal 1993 hai, aur time-range inactive hai, isliye har contractor SSH line 20 se takraata hai. Clock theek karo, behtar hai NTP se, aur sahi zone set karo:</p>
<pre class="code">clock timezone IST 5 30
ntp server 10.10.10.123
<span class="c">! verify</span>
<span class="c">! show ntp status        -> Clock is synchronized</span>
<span class="c">! show clock            -> no asterisk, correct date</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Time-range evaluation">
<rect x="10" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">NTP / clock</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="12">+ time zone</text>
<rect x="190" y="70" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="260" y="95" text-anchor="middle" class="svg-ink" font-size="13">time-range</text><text x="260" y="114" text-anchor="middle" class="svg-muted" font-size="12">active / inactive</text>
<rect x="380" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="440" y="95" text-anchor="middle" class="svg-ink" font-size="13">ACL entry</text><text x="440" y="114" text-anchor="middle" class="svg-muted" font-size="12">use / skip</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="105" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<line x1="140" y1="100" x2="190" y2="100" stroke="#64748b" stroke-width="2"/><line x1="330" y1="100" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="500" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Galat clock = galat ACL, bina kisi error message ke</text>
</svg><p class="cap">Time-based entry utni hi sahi hai jitni router ki clock.</p></div>

<h3>Object groups: kam lines, kam galtiyan</h3>
<p><b>Object group</b> addresses (network) ya protocols aur ports (service) ka ek named set hai jise extended ACL reference kar sakti hai. Tab ek ACL line andar hi andar har combination mein expand ho jaati hai, jisse configuration chhota rehta hai aur changes safe hote hain: group mein server jodo, aur group use karne wali har ACL saath chalti hai.</p>
<pre class="code">object-group network WEB-SERVERS
 host 10.50.0.10
 host 10.50.0.11
 10.50.8.0 255.255.255.0
object-group network BRANCHES
 10.60.0.0 255.255.0.0
 range 10.70.0.1 10.70.0.50
object-group service WEB-PORTS
 tcp eq 443
 tcp eq www
!
ip access-list extended BRANCH-TO-WEB
 10 permit object-group WEB-PORTS object-group BRANCHES object-group WEB-SERVERS
 20 deny   ip object-group BRANCHES object-group WEB-SERVERS log</pre>
<p>Syntax dhyan se dekho: network object group ke andar networks <b>subnet mask</b> se likhe jaate hain, wildcard se nahi. <code>show object-group</code> ya <code>show object-group name WEB-SERVERS</code> se verify karo, aur counters ke liye <code>show ip access-lists</code> use karo, jo har ACL line ke hisaab se rakhe jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek naya web server 10.50.0.12 joda gaya aur branches us tak nahi pahunch paa rahi. <code>show object-group name WEB-SERVERS</code> sirf .10 aur .11 dikhata hai, isliye naya host line 20 par girta hai aur deny hota hai. Ek command group use karne wali har ACL theek kar deti hai: <code>object-group network WEB-SERVERS</code>, phir <code>host 10.50.0.12</code>. Kisi ACL line ko badalne ki zaroorat nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Network object group ke andar wildcard mask use karna, jo mask ki tarah padha jaata hai aur galat range match karta hai. Aisa object group delete karna jo abhi bhi reference ho raha hai; IOS mana karta hai aur batata hai ki woh use mein hai, isliye pehle <code>show object-group</code> se check karo. Bhool jaana ki galat zone wali time-range theek aapke UTC offset jitni aage-peeche hoti hai, jaise India mein saadhe paanch ghante.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab time-range inactive hoti hai, entry <b>skip</b> hoti hai, deny mein nahi badalti. Packet agli lines tak jaata hai aur baad ki entry se permit bhi ho sakta hai. Aur time-based ACLs <b>router</b> ki clock par chalti hain, NTP server ya host ki clock par nahi.</p></div>

<div class="scn"><h4>Power cut ke baad contractors lock out</h4><p>Weekend ke power cut ke baad Monday ko contractors lab servers par SSH nahi kar paa rahe the. <code>show time-range</code> ne CONTRACTOR-HOURS inactive dikhaya, aur <code>show clock</code> mein asterisk aur saalon purani date thi. Router ke paas koi reachable NTP server nahi tha kyunki pichhle hafte uplink par NTP ACL tight kar di gayi thi. NTP server se UDP 123 permit karne ke baad <code>show ntp status</code> ne synchronised dikhaya, clock sahi date par aa gayi aur time-range active ho gayi.</p><p><b>Seekh:</b> time-based ACL ki problem aksar clock ki problem hoti hai, aur clock ki problem aksar NTP reachability ki.</p></div>

<div class="iv"><p class="q">"Time-based ACL configured ghanton mein kaam nahi kar rahi. Aap kya check karoge?"</p><p>Strong answer: pehle <code>show clock</code>, asterisk aur sahi date, time zone aur summer time dekhte hue; phir <code>show ntp status</code> aur <code>show ntp associations</code>. Phir <code>show time-range</code> dekhna ki range active hai ya nahi, aur <code>show ip access-lists</code>, jo entry ko active ya inactive mark karta hai aur counters dikhata hai. Yaad rakho inactive entry skip hoti hai, isliye check karo ki agli lines kya karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Time-range mein kai <code>periodic</code> lines aur ek <code>absolute</code> window ho sakti hai; inactive hone par use reference karne wali entries skip hoti hain.</li>
<li>Time-ranges router ki local clock, time zone aur summer time follow karti hain; <code>show clock</code> mein asterisk chetavni hai.</li>
<li><code>show time-range</code> aur <code>show ip access-lists</code> dono active ya inactive dikhate hain.</li>
<li>Network object groups subnet masks use karte hain; service object groups protocols aur ports rakhte hain.</li>
<li>Host jodne ya hatane par ACL nahi, object group badlo.</li>
</ul></div>
`}};export{e as default};