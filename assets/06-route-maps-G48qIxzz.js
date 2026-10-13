var e={id:`route-maps`,h:{en:`Route maps: match, set, sequence logic and continue`,hi:`Route maps: match, set, sequence logic aur continue`},body:{en:`
<p>Picture a government office with numbered counters. You start at counter 10. The clerk checks your documents against a list of conditions. If everything is in order, he either stamps your form and sends you out (<b>permit</b>) or tears it up (<b>deny</b>). If your documents do not match his conditions, you walk to counter 20 and try again. If no counter accepts you, the guard at the exit turns you away. That office is a <b>route map</b>: an ordered list of entries, each with conditions (<code>match</code>) and actions (<code>set</code>), used to filter routes and change their attributes.</p>

<h3>Anatomy</h3>
<pre class="code">route-map NAME {permit | deny} SEQUENCE
 match ...        <span class="c">! zero or more conditions</span>
 set ...          <span class="c">! zero or more actions, only used by permit entries</span></pre>
<p>If you omit the action and sequence, IOS creates <code>permit 10</code>. Sequence numbers let you insert entries later (use gaps of 10).</p>

<h3>The processing rules</h3>
<ol>
<li>Entries are checked in <b>ascending sequence</b> order. The <b>first entry whose conditions all succeed</b> decides; later entries are not checked (unless <code>continue</code> is used).</li>
<li>Different match <b>commands</b> in one entry are combined with <b>AND</b>: <code>match tag 90</code> plus <code>match ip address prefix-list OSPF-LANS</code> means both must be true.</li>
<li>Several <b>values in one match command</b> are combined with <b>OR</b>: <code>match tag 90 110</code> means tag 90 or tag 110. Typing the same match type twice makes IOS merge the values into one line, so it is still OR.</li>
<li>An entry with <b>no match</b> command matches every route. That is how you write "permit everything else".</li>
<li><b>permit</b> entry matched: the route is accepted and every <code>set</code> is applied. <b>deny</b> entry matched: the route is rejected.</li>
<li>No entry matched: <b>implicit deny</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Route map evaluation">
<rect x="10" y="100" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="60" y="127" text-anchor="middle" class="svg-ink" font-size="13">route</text>
<line x1="110" y1="122" x2="140" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="140" y="95" width="140" height="54" rx="8" fill="#fed7aa"/><text x="210" y="117" text-anchor="middle" class="svg-ink" font-size="13">deny 10</text><text x="210" y="136" text-anchor="middle" class="svg-muted" font-size="12">match tag 90</text>
<line x1="210" y1="95" x2="210" y2="50" stroke="#64748b" stroke-width="2"/><rect x="150" y="16" width="120" height="34" rx="8" fill="#fde68a"/><text x="210" y="38" text-anchor="middle" class="svg-ink" font-size="12">yes: rejected</text>
<line x1="280" y1="122" x2="320" y2="122" stroke="#64748b" stroke-width="2"/><text x="300" y="115" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="320" y="95" width="150" height="54" rx="8" fill="#bae6fd"/><text x="395" y="117" text-anchor="middle" class="svg-ink" font-size="13">permit 20</text><text x="395" y="136" text-anchor="middle" class="svg-muted" font-size="12">prefix-list OSPF-LANS</text>
<line x1="395" y1="95" x2="395" y2="50" stroke="#64748b" stroke-width="2"/><rect x="320" y="16" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="395" y="38" text-anchor="middle" class="svg-ink" font-size="12">yes: set tag 110</text>
<line x1="470" y1="122" x2="500" y2="122" stroke="#64748b" stroke-width="2"/><text x="485" y="115" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="500" y="95" width="130" height="54" rx="8" fill="#ddd6fe"/><text x="565" y="117" text-anchor="middle" class="svg-ink" font-size="13">implicit deny</text><text x="565" y="136" text-anchor="middle" class="svg-muted" font-size="12">not redistributed</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">route map OSPF-TO-EIGRP in lab 2, evaluated top-down</text>
</svg><p class="cap">Each route walks the entries in order; the first full match decides, and no match means implicit deny.</p></div>

<h3>Four combinations people confuse</h3>
<table class="cmp"><tr><th>Route map entry</th><th>Prefix list result for the route</th><th>Outcome</th></tr>
<tr><td>permit</td><td>permit (matches)</td><td>route accepted, sets applied</td></tr>
<tr><td>permit</td><td>deny or no entry (no match)</td><td>entry skipped, go to next sequence</td></tr>
<tr><td>deny</td><td>permit (matches)</td><td>route rejected</td></tr>
<tr><td>deny</td><td>deny or no entry (no match)</td><td>entry skipped, go to next sequence</td></tr></table>
<p>The list only answers "does it match?". The route map entry's own permit or deny decides the fate.</p>

<h3>Useful match and set clauses</h3>
<ul>
<li><b>match</b>: <code>ip address prefix-list</code>, <code>ip address ACL</code>, <code>ip next-hop</code>, <code>ip route-source</code>, <code>tag</code>, <code>interface</code>, <code>metric</code>, <code>route-type internal | external type-1 | external type-2 | local | nssa-external</code>, and in BGP <code>as-path</code> and <code>community</code>.</li>
<li><b>set</b>: <code>metric</code> (one value, or five EIGRP values), <code>metric-type type-1 | type-2</code> for OSPF, <code>tag</code>, <code>ip next-hop</code>, and in BGP <code>local-preference</code>, <code>weight</code>, <code>as-path prepend</code>, <code>community</code>.</li>
</ul>
<p>Route maps are called from <code>redistribute ... route-map</code>, <code>distribute-list route-map</code>, <code>default-information originate route-map</code>, BGP <code>neighbor ... route-map in|out</code> and policy-based routing (<code>ip policy route-map</code>, covered in the PBR module).</p>

<h3>The continue clause</h3>
<p>Normally the first matching entry ends processing. <code>continue [SEQ]</code> inside a matched permit entry tells the router to keep going to the next entry, or to a specific later sequence, so several entries can each add attributes to the same route. It is a BGP policy tool on IOS (for example set a community in one entry and local preference in another). Do not build redistribution or PBR designs on it.</p>
<pre class="code">route-map FROM-ISP permit 10
 match ip address prefix-list CUSTOMERS
 set community 65001:100
 continue 20
route-map FROM-ISP permit 20
 match as-path 10
 set local-preference 200
route-map FROM-ISP permit 30</pre>

<div class="eg"><p><b>Worked example: three routes through OSPF-TO-EIGRP on BR1 (lab 2 before the fix).</b></p>
<ul>
<li>10.200.1.0/24, O, no tag: seq 10 needs tag 90, no. Seq 20: prefix list seq 5 permits it, so it matches. Set tag 110. Redistributed into EIGRP.</li>
<li>192.168.50.0/24, O E2, tag 90: seq 10 matches, deny. Not redistributed. This is the loop protection.</li>
<li>10.200.10.0/24, O, no tag: seq 10 no, seq 20 prefix list has no entry for it, no. End of map: implicit deny. This is the missing-prefix ticket.</li>
</ul></div>

<h3>Verification</h3>
<pre class="out">BR1#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    <span class="hl">tag 90</span>
  Set clauses:
  Policy routing matches: 0 packets, 0 bytes
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    <span class="hl">ip address prefix-lists: OSPF-LANS</span>
  Set clauses:
    <span class="hl">tag 110</span>
  Policy routing matches: 0 packets, 0 bytes</pre>
<p>The "Policy routing matches" counters count <b>packets forwarded by PBR</b>, so they stay at zero for redistribution. To prove what a redistribution route map did, check prefix-list hit counts and look for the tag in the destination protocol (<code>show ip route</code> on E1 shows "Tag 110").</p>

<div class="warn"><p><b>Common mistake.</b> Writing a deny entry to block a few routes and forgetting the final <code>route-map NAME permit 30</code> with no match. The implicit deny then blocks everything else, and the destination protocol loses every redistributed route. A redistribution that references a route map name that does not exist also redistributes nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> AND versus OR. Two match lines of different types in one entry must both be true. If the question wants "tag 90 OR in prefix list X", you need two separate entries. And <code>set</code> lines in a deny entry are never applied.</p></div>

<div class="scn"><h4>The AND that should have been OR</h4><p>An engineer wanted to stop routes tagged 90 or any 10.99.0.0/16 lab prefix from entering EIGRP, and wrote one deny entry with <code>match tag 90</code> and <code>match ip address prefix-list LAB</code>. Lab routes kept leaking and so did tag-90 routes. Only routes that were both tag 90 and inside 10.99.0.0/16 were blocked, and there were none. Splitting the conditions into <code>deny 10</code> (tag) and <code>deny 20</code> (prefix list) followed by <code>permit 30</code> fixed it.</p><p><b>Lesson:</b> different match commands in one entry are AND; separate entries give you OR.</p></div>

<div class="iv"><p class="q">"Walk me through how a router processes a route map used for redistribution."</p><p>Strong answer: the route is compared with entries in ascending sequence; within an entry different match types are ANDed and values in one match are ORed; an entry without match matches all. The first full match decides: permit accepts the route and applies the sets (tag, metric, metric type), deny rejects it. If nothing matches, the implicit deny drops it. Mention that <code>continue</code> exists mainly for BGP, and that <code>show route-map</code> counters are PBR packet counters, not route counts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route maps are evaluated top-down by sequence; first full match wins; no match is an implicit deny.</li>
<li>Different match commands are AND; multiple values in one match are OR; no match line matches all.</li>
<li>The ACL or prefix list only decides "match or not"; the entry's permit or deny decides the route's fate.</li>
<li>Sets run only in permit entries: tag, metric, metric-type, next hop, BGP attributes.</li>
<li>End filtering maps with an empty permit entry; <code>continue</code> is mainly a BGP tool.</li>
</ul></div>
`,hi:`
<p>Ek sarkari office socho jisme numbered counters hain. Aap counter 10 se shuru karte ho. Clerk aapke documents ko conditions ki ek list se check karta hai. Agar sab theek hai, to woh ya to form par stamp laga kar bahar bhej deta hai (<b>permit</b>) ya use phaad deta hai (<b>deny</b>). Agar aapke documents uski conditions se match nahi karte, to aap counter 20 par jaakar phir koshish karte ho. Agar koi counter aapko accept nahi karta, to exit ka guard aapko lauta deta hai. Woh office ek <b>route map</b> hai: entries ki ordered list, har entry mein conditions (<code>match</code>) aur actions (<code>set</code>), jo routes filter karne aur unke attributes badalne ke liye use hoti hai.</p>

<h3>Anatomy</h3>
<pre class="code">route-map NAME {permit | deny} SEQUENCE
 match ...        <span class="c">! zero ya zyada conditions</span>
 set ...          <span class="c">! zero ya zyada actions, sirf permit entries use karti hain</span></pre>
<p>Agar aap action aur sequence chhod do, to IOS <code>permit 10</code> bana deta hai. Sequence numbers baad mein entries insert karne dete hain (10 ke gaps use karo).</p>

<h3>Processing rules</h3>
<ol>
<li>Entries <b>ascending sequence</b> order mein check hoti hain. <b>Jis pehli entry ki saari conditions succeed hon</b> woh decide karti hai; baad ki entries check nahi hoti (jab tak <code>continue</code> use na ho).</li>
<li>Ek entry mein alag match <b>commands</b> <b>AND</b> se jude hote hain: <code>match tag 90</code> plus <code>match ip address prefix-list OSPF-LANS</code> ka matlab dono sach hone chahiye.</li>
<li><b>Ek match command mein kai values</b> <b>OR</b> se judti hain: <code>match tag 90 110</code> ka matlab tag 90 ya tag 110. Same match type do baar type karne par IOS values ko ek line mein merge kar deta hai, isliye woh bhi OR hi hai.</li>
<li>Jis entry mein <b>koi match</b> command nahi, woh har route match karti hai. "Baaki sab permit" aise hi likha jaata hai.</li>
<li><b>permit</b> entry match hui: route accept hota hai aur har <code>set</code> lagta hai. <b>deny</b> entry match hui: route reject hota hai.</li>
<li>Koi entry match nahi hui: <b>implicit deny</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Route map evaluation">
<rect x="10" y="100" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="60" y="127" text-anchor="middle" class="svg-ink" font-size="13">route</text>
<line x1="110" y1="122" x2="140" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="140" y="95" width="140" height="54" rx="8" fill="#fed7aa"/><text x="210" y="117" text-anchor="middle" class="svg-ink" font-size="13">deny 10</text><text x="210" y="136" text-anchor="middle" class="svg-muted" font-size="12">match tag 90</text>
<line x1="210" y1="95" x2="210" y2="50" stroke="#64748b" stroke-width="2"/><rect x="150" y="16" width="120" height="34" rx="8" fill="#fde68a"/><text x="210" y="38" text-anchor="middle" class="svg-ink" font-size="12">haan: reject</text>
<line x1="280" y1="122" x2="320" y2="122" stroke="#64748b" stroke-width="2"/><text x="300" y="115" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="320" y="95" width="150" height="54" rx="8" fill="#bae6fd"/><text x="395" y="117" text-anchor="middle" class="svg-ink" font-size="13">permit 20</text><text x="395" y="136" text-anchor="middle" class="svg-muted" font-size="12">prefix-list OSPF-LANS</text>
<line x1="395" y1="95" x2="395" y2="50" stroke="#64748b" stroke-width="2"/><rect x="320" y="16" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="395" y="38" text-anchor="middle" class="svg-ink" font-size="12">haan: set tag 110</text>
<line x1="470" y1="122" x2="500" y2="122" stroke="#64748b" stroke-width="2"/><text x="485" y="115" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="500" y="95" width="130" height="54" rx="8" fill="#ddd6fe"/><text x="565" y="117" text-anchor="middle" class="svg-ink" font-size="13">implicit deny</text><text x="565" y="136" text-anchor="middle" class="svg-muted" font-size="12">redistribute nahi</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">lab 2 ka route map OSPF-TO-EIGRP, upar se neeche evaluate</text>
</svg><p class="cap">Har route entries ko order mein cross karta hai; pehla poora match decide karta hai, aur koi match na ho to implicit deny.</p></div>

<h3>Chaar combinations jinme log confuse hote hain</h3>
<table class="cmp"><tr><th>Route map entry</th><th>Route ke liye prefix list result</th><th>Outcome</th></tr>
<tr><td>permit</td><td>permit (match)</td><td>route accept, sets lagte hain</td></tr>
<tr><td>permit</td><td>deny ya koi entry nahi (no match)</td><td>entry skip, agle sequence par jaao</td></tr>
<tr><td>deny</td><td>permit (match)</td><td>route reject</td></tr>
<tr><td>deny</td><td>deny ya koi entry nahi (no match)</td><td>entry skip, agle sequence par jaao</td></tr></table>
<p>List sirf jawab deti hai "kya match hota hai?". Route map entry ka apna permit ya deny route ki kismat tay karta hai.</p>

<h3>Kaam ke match aur set clauses</h3>
<ul>
<li><b>match</b>: <code>ip address prefix-list</code>, <code>ip address ACL</code>, <code>ip next-hop</code>, <code>ip route-source</code>, <code>tag</code>, <code>interface</code>, <code>metric</code>, <code>route-type internal | external type-1 | external type-2 | local | nssa-external</code>, aur BGP mein <code>as-path</code> aur <code>community</code>.</li>
<li><b>set</b>: <code>metric</code> (ek value, ya paanch EIGRP values), OSPF ke liye <code>metric-type type-1 | type-2</code>, <code>tag</code>, <code>ip next-hop</code>, aur BGP mein <code>local-preference</code>, <code>weight</code>, <code>as-path prepend</code>, <code>community</code>.</li>
</ul>
<p>Route maps <code>redistribute ... route-map</code>, <code>distribute-list route-map</code>, <code>default-information originate route-map</code>, BGP <code>neighbor ... route-map in|out</code> aur policy-based routing (<code>ip policy route-map</code>, PBR module mein cover) se call hote hain.</p>

<h3>Continue clause</h3>
<p>Normally pehli matching entry processing khatam kar deti hai. Matched permit entry ke andar <code>continue [SEQ]</code> router ko aage agli entry par, ya kisi specific baad wale sequence par jaane ko kehta hai, taaki kai entries same route mein apne apne attributes jod sakein. IOS par yeh BGP policy tool hai (jaise ek entry mein community set karo aur doosri mein local preference). Redistribution ya PBR designs is par mat banao.</p>
<pre class="code">route-map FROM-ISP permit 10
 match ip address prefix-list CUSTOMERS
 set community 65001:100
 continue 20
route-map FROM-ISP permit 20
 match as-path 10
 set local-preference 200
route-map FROM-ISP permit 30</pre>

<div class="eg"><p><b>Worked example: BR1 par OSPF-TO-EIGRP se teen routes (lab 2, fix se pehle).</b></p>
<ul>
<li>10.200.1.0/24, O, koi tag nahi: seq 10 ko tag 90 chahiye, nahi. Seq 20: prefix list seq 5 ise permit karti hai, to match. Tag 110 set. EIGRP mein redistribute.</li>
<li>192.168.50.0/24, O E2, tag 90: seq 10 match, deny. Redistribute nahi. Yahi loop protection hai.</li>
<li>10.200.10.0/24, O, koi tag nahi: seq 10 nahi, seq 20 ki prefix list mein iski entry nahi, nahi. Map khatam: implicit deny. Yahi missing-prefix ticket hai.</li>
</ul></div>

<h3>Verification</h3>
<pre class="out">BR1#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    <span class="hl">tag 90</span>
  Set clauses:
  Policy routing matches: 0 packets, 0 bytes
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    <span class="hl">ip address prefix-lists: OSPF-LANS</span>
  Set clauses:
    <span class="hl">tag 110</span>
  Policy routing matches: 0 packets, 0 bytes</pre>
<p>"Policy routing matches" counters <b>PBR dwara forward kiye packets</b> ginte hain, isliye redistribution ke liye zero rehte hain. Redistribution route map ne kya kiya yeh prove karne ke liye prefix-list hit counts check karo aur destination protocol mein tag dhoondo (E1 par <code>show ip route</code> "Tag 110" dikhata hai).</p>

<div class="warn"><p><b>Common galti.</b> Kuch routes block karne ke liye deny entry likhna aur end mein bina match wali <code>route-map NAME permit 30</code> bhool jaana. Tab implicit deny baaki sab block kar deta hai, aur destination protocol har redistributed route kho deta hai. Jo redistribution aise route map naam ko reference kare jo exist nahi karta, woh bhi kuch redistribute nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> AND vs OR. Ek entry mein alag types ki do match lines dono sach honi chahiye. Agar question "tag 90 YA prefix list X mein" chahta hai, to aapko do alag entries chahiye. Aur deny entry ki <code>set</code> lines kabhi apply nahi hoti.</p></div>

<div class="scn"><h4>Woh AND jo OR hona chahiye tha</h4><p>Ek engineer tag 90 wale routes ya koi bhi 10.99.0.0/16 lab prefix EIGRP mein aane se rokna chahta tha, aur usne ek deny entry mein <code>match tag 90</code> aur <code>match ip address prefix-list LAB</code> likha. Lab routes leak hote rahe aur tag-90 routes bhi. Sirf woh routes block hue jo tag 90 bhi the aur 10.99.0.0/16 ke andar bhi, aur aise koi the hi nahi. Conditions ko <code>deny 10</code> (tag) aur <code>deny 20</code> (prefix list) mein baantne aur uske baad <code>permit 30</code> lagane se theek hua.</p><p><b>Seekh:</b> ek entry mein alag match commands AND hain; alag entries aapko OR deti hain.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki redistribution ke liye use hua route map router kaise process karta hai."</p><p>Strong answer: route ko ascending sequence mein entries se compare kiya jaata hai; ek entry mein alag match types AND hote hain aur ek match ki values OR; bina match wali entry sab match karti hai. Pehla poora match decide karta hai: permit route accept karke sets (tag, metric, metric type) lagata hai, deny use reject karta hai. Kuch match na ho to implicit deny use drop karta hai. Batao ki <code>continue</code> mainly BGP ke liye hai, aur <code>show route-map</code> ke counters PBR packet counters hain, route counts nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route maps sequence ke hisaab se upar se neeche evaluate hote hain; pehla poora match jeetta hai; koi match nahi to implicit deny.</li>
<li>Alag match commands AND hain; ek match mein kai values OR hain; bina match line sab match karti hai.</li>
<li>ACL ya prefix list sirf "match ya nahi" tay karti hai; entry ka permit ya deny route ki kismat tay karta hai.</li>
<li>Sets sirf permit entries mein chalte hain: tag, metric, metric-type, next hop, BGP attributes.</li>
<li>Filtering maps ko khaali permit entry se khatam karo; <code>continue</code> mainly BGP tool hai.</li>
</ul></div>
`}};export{e as default};