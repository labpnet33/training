var e={id:`hits-optimise`,h:{en:`Hit counts, hashes and ACL optimisation`,hi:`Hit counts, hashes aur ACL optimisation`},body:{en:`
<p>Firewall ACLs grow like cupboards: things go in, nothing comes out. After a few years, a company ACL can have hundreds of lines, many unused, some shadowed, a few dangerously broad. This chapter shows how to read the ASA's own evidence (hit counts and hashes) and how to keep an ACL lean and correct.</p>

<h3>The analogy: a wardrobe clean-up</h3>
<p>You check which clothes you actually wore this year (hit counts), notice shirts hidden behind a big coat that you can never reach (shadowed rules), fold similar things together (object-groups) and throw out what nobody uses. You never throw away the winter jacket just because it is summer: some rules are used rarely but are still needed.</p>

<h3>Reading show access-list</h3>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 5 elements; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=18342) 0x1c2a31fe
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=18342) 0x0be9f6a1
access-list OUTSIDE_IN line 2 extended permit tcp any object MAIL eq smtp (hitcnt=2210) 0x4f7e2b90
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.25 eq smtp (hitcnt=2210) 0x77c1a0d3
access-list OUTSIDE_IN line 3 extended permit tcp any 10.0.2.0 255.255.255.0 eq ssh (hitcnt=611) 0x3a90e6f2
<span class="hl">access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object WEB eq ssh (hitcnt=0) 0x9e02d41b</span>
access-list OUTSIDE_IN line 5 extended permit udp any object WEB eq 5060 (hitcnt=0) 0x12ab7c55</pre>
<dl class="terms">
<dt>elements</dt><dd>The number of expanded entries after objects and groups are unfolded. This, not the number of lines, drives memory use.</dd>
<dt>name hash</dt><dd>A fingerprint of the ACL name.</dd>
<dt>hitcnt</dt><dd>How many <b>new connections</b> matched this ACE (not packets; later packets use the conn table).</dd>
<dt>ACE hash (0x…)</dt><dd>A fingerprint of the rule. The same hash appears in syslog 106100, so you can match a log line to an exact ACE.</dd>
</dl>

<h3>Three findings from the output above</h3>
<ol>
<li><b>Line 3 is too broad.</b> SSH from <i>any</i> source to the whole DMZ, with 611 hits: the internet is actively using it. That is a security finding, not an optimisation.</li>
<li><b>Line 4 is shadowed.</b> The partner's SSH to WEB is already matched by line 3 above it, so line 4 can never be hit. When line 3 is removed, line 4 becomes the real rule, so fix the order and scope together.</li>
<li><b>Line 5 has zero hits.</b> Perhaps a SIP service that was retired. Before deleting, check how long the counters have been counting.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="A shadowed ACE">
<rect x="20" y="20" width="600" height="45" rx="8" fill="#fed7aa"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">line 3: permit tcp any 10.0.2.0/24 eq ssh  (broad, catches all SSH)</text>
<rect x="120" y="85" width="400" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="13">line 4: permit tcp host 198.51.100.10 WEB eq ssh (never reached)</text>
<line x1="320" y1="65" x2="320" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="13">A specific rule below a broader rule is shadowed: hitcnt stays at 0</text>
</svg><p class="cap">First match wins. Specific rules must sit above the general rules that contain them.</p></div>

<h3>Counters and their lifetime</h3>
<p>Hit counters start at zero when the ASA boots and when you run <code>clear access-list OUTSIDE_IN counters</code>. So "zero hits" only means "unused since the last reboot or clear". Check <code>show version</code> for uptime first. A good practice is to collect counters monthly for a year before removing a rule that might serve a quarterly or yearly job.</p>
<pre class="code"><span class="c">! reset counters before a test so you see only the new hits</span>
clear access-list OUTSIDE_IN counters
<span class="c">! find rules with no hits</span>
show access-list OUTSIDE_IN | include hitcnt=0
<span class="c">! compact view of ACEs that have hits (hex hashes, counts, last-hit time)</span>
show access-list OUTSIDE_IN brief</pre>

<h3>Optimisation techniques</h3>
<ul>
<li><b>Remove</b> unused rules (after a long observation window and owner confirmation) and <b>tighten</b> broad ones.</li>
<li><b>Fix shadowing</b>: move specific rules up, or delete the redundant specific rule if the broad one is intended.</li>
<li><b>Consolidate</b> many similar ACEs into one ACE with object-groups. Ten "permit tcp any host X eq www" lines become one line with a server group.</li>
<li><b>Watch element count.</b> Nested groups multiply. <code>object-group-search access-control</code> (global config) makes the ASA search groups at run time instead of expanding them, saving memory on very large rule sets at some CPU cost.</li>
<li><b>Order for correctness first.</b> The ASA compiles the ACL into an optimised lookup structure, so moving busy rules to the top is not the performance trick it is on some older platforms. Put specific exceptions above general rules because of first match, not speed.</li>
<li><b>Swap, don't edit live.</b> For large rewrites, build a new ACL, review it, then bind it with one <code>access-group</code> command. For big ACLs, <code>asp rule-engine transactional-commit access-group</code> makes the new rules take effect only after compilation completes.</li>
</ul>
<p>The ASA also helps you avoid mess: if you add an ACE that is identical to an existing one, it warns you about a duplicate element instead of adding it silently.</p>

<div class="eg"><p><b>Worked example.</b> A firewall has 40 ACEs of the form <code>permit tcp any host 10.0.2.x eq h&#116;tps</code> for 40 web servers. Replace them with <code>object-group network WEB-FARM</code> (40 members) and one ACE <code>permit tcp any object-group WEB-FARM eq h&#116;tps</code>. The element count stays 40, but the configuration shrinks from 40 lines to 1, and adding server 41 is a one-line group change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Deleting zero-hit rules the week after a reboot; clearing counters during an investigation and losing the evidence; and "optimising" by merging rules owned by different teams into one group, which later causes the accidental-access problem from chapter 5.</p></div>

<div class="exam"><p><b>Exam trap.</b> hitcnt counts connections matched, not packets. A rule can carry megabytes of traffic with a hitcnt of 1 if it is one long session. And zero hits on a rule placed below a broader rule usually means shadowing, not "unused".</p></div>

<div class="scn"><h4>The 2,400-line ACL</h4><p>A telecom's edge ASA had an OUTSIDE_IN with 2,400 lines and more than 90,000 elements after group expansion. Changes took minutes to apply and memory alarms fired. A three-month counter review found 1,100 zero-hit lines, 140 shadowed lines and 30 rules permitting <code>any</code> to whole subnets. The team removed dead rules with owner sign-off, consolidated servers into groups, tightened the broad rules and enabled object-group-search. The ACL dropped to 600 lines and 9,000 elements.</p><p><b>Lesson:</b> hit counts and hashes are evidence; a regular clean-up keeps the firewall fast and the policy honest.</p></div>

<div class="iv"><p class="q">"How do you find and clean up unused or redundant rules on an ASA?"</p><p>Strong answer: check uptime, then collect <code>show access-list</code> hit counts over a long window; flag zero-hit rules, rules shadowed by broader ones above them, and overly broad rules; confirm with owners; remove or tighten; consolidate with object-groups; watch the element count and consider object-group-search. Mention that hitcnt counts connections and that the ACE hashes tie syslog 106100 lines to rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show access-list gives elements, name hash, per-ACE hitcnt and hash.</li>
<li>hitcnt counts new connections since boot or the last clear.</li>
<li>Zero hits below a broader rule means shadowing; fix order and scope.</li>
<li>Consolidate with groups, watch element count, consider object-group-search.</li>
<li>Order for correctness; swap in reviewed ACLs rather than editing live.</li>
</ul></div>
`,hi:`
<p>Firewall ACLs almaari ki tarah badhti hain: cheezein andar jaati hain, bahar kuch nahi aata. Kuch saalon baad company ki ACL mein sainkdon lines ho sakti hain, kai unused, kuch shadowed, kuch khatarnaak had tak broad. Yeh chapter dikhata hai ki ASA ka apna saboot (hit counts aur hashes) kaise padhein aur ACL ko lean aur sahi kaise rakhein.</p>

<h3>Analogy: wardrobe ki safai</h3>
<p>Aap check karte ho ki is saal kaunse kapde sach mein pehne (hit counts), notice karte ho ki kuch shirts ek bade coat ke peeche chhupi hain jahan aap kabhi pahunch hi nahi paate (shadowed rules), milti-julti cheezein ek saath fold karte ho (object-groups) aur jo koi use nahi karta use nikaal dete ho. Aap garmi hai isliye winter jacket nahi phenkte: kuch rules kam use hoti hain lekin phir bhi zaroori hain.</p>

<h3>show access-list padhna</h3>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 5 elements; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=18342) 0x1c2a31fe
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=18342) 0x0be9f6a1
access-list OUTSIDE_IN line 2 extended permit tcp any object MAIL eq smtp (hitcnt=2210) 0x4f7e2b90
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.25 eq smtp (hitcnt=2210) 0x77c1a0d3
access-list OUTSIDE_IN line 3 extended permit tcp any 10.0.2.0 255.255.255.0 eq ssh (hitcnt=611) 0x3a90e6f2
<span class="hl">access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object WEB eq ssh (hitcnt=0) 0x9e02d41b</span>
access-list OUTSIDE_IN line 5 extended permit udp any object WEB eq 5060 (hitcnt=0) 0x12ab7c55</pre>
<dl class="terms">
<dt>elements</dt><dd>Objects aur groups khulne ke baad expanded entries ki ginti. Memory use yahi decide karta hai, lines ki ginti nahi.</dd>
<dt>name hash</dt><dd>ACL naam ka fingerprint.</dd>
<dt>hitcnt</dt><dd>Kitni <b>nayi connections</b> is ACE se match hui (packets nahi; baad ke packets conn table use karte hain).</dd>
<dt>ACE hash (0x…)</dt><dd>Rule ka fingerprint. Wahi hash syslog 106100 mein dikhta hai, isliye aap log line ko exact ACE se match kar sakte ho.</dd>
</dl>

<h3>Upar ke output se teen findings</h3>
<ol>
<li><b>Line 3 bahut broad hai.</b> <i>Any</i> source se poore DMZ tak SSH, 611 hits ke saath: internet ise actively use kar raha hai. Yeh security finding hai, optimisation nahi.</li>
<li><b>Line 4 shadowed hai.</b> Partner ka WEB tak SSH pehle hi upar ki line 3 se match ho jaata hai, isliye line 4 kabhi hit nahi ho sakti. Jab line 3 hategi, line 4 asli rule banegi, isliye order aur scope saath mein theek karo.</li>
<li><b>Line 5 par zero hits.</b> Shayad ek SIP service jo retire ho gayi. Delete karne se pehle check karo ki counters kitne samay se gin rahe hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Shadowed ACE">
<rect x="20" y="20" width="600" height="45" rx="8" fill="#fed7aa"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">line 3: permit tcp any 10.0.2.0/24 eq ssh  (broad, saara SSH pakadti hai)</text>
<rect x="120" y="85" width="400" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="13">line 4: permit tcp host 198.51.100.10 WEB eq ssh (kabhi nahi pahunchte)</text>
<line x1="320" y1="65" x2="320" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="13">Broad rule ke neeche specific rule shadowed hai: hitcnt 0 par rehta hai</text>
</svg><p class="cap">Pehla match jeetta hai. Specific rules un general rules ke upar honi chahiye jo unhe contain karti hain.</p></div>

<h3>Counters aur unki umar</h3>
<p>Hit counters ASA boot hone par aur <code>clear access-list OUTSIDE_IN counters</code> chalane par zero se shuru hote hain. Isliye "zero hits" ka matlab sirf "pichhle reboot ya clear ke baad se unused" hai. Pehle <code>show version</code> mein uptime check karo. Achhi practice hai ki quarterly ya yearly job ke kaam aa sakne wali rule hataane se pehle ek saal tak har mahine counters collect karo.</p>
<pre class="code"><span class="c">! test se pehle counters reset karo taaki sirf naye hits dikhein</span>
clear access-list OUTSIDE_IN counters
<span class="c">! bina hits wali rules dhoondo</span>
show access-list OUTSIDE_IN | include hitcnt=0
<span class="c">! hits wali ACEs ka compact view (hex hashes, counts, last-hit time)</span>
show access-list OUTSIDE_IN brief</pre>

<h3>Optimisation techniques</h3>
<ul>
<li>Unused rules <b>hatao</b> (lambi observation window aur owner confirmation ke baad) aur broad rules ko <b>tight</b> karo.</li>
<li><b>Shadowing theek karo</b>: specific rules upar le jao, ya agar broad rule intended hai to redundant specific rule delete karo.</li>
<li>Kai milti-julti ACEs ko object-groups ke saath ek ACE mein <b>consolidate</b> karo. Das "permit tcp any host X eq www" lines server group wali ek line ban jaati hain.</li>
<li><b>Element count par nazar rakho.</b> Nested groups multiply hote hain. <code>object-group-search access-control</code> (global config) ASA ko groups expand karne ke bajaye run time par search karne deta hai, jisse bahut bade rule sets par memory bachti hai, thode CPU ki keemat par.</li>
<li><b>Pehle correctness ke liye order karo.</b> ASA ACL ko optimised lookup structure mein compile karta hai, isliye busy rules ko upar le jaana utni badi performance trick nahi hai jitni kuch purane platforms par thi. Specific exceptions ko general rules ke upar first match ki wajah se rakho, speed ki wajah se nahi.</li>
<li><b>Swap karo, live edit mat karo.</b> Bade rewrites ke liye nayi ACL banao, review karo, phir ek <code>access-group</code> command se bind karo. Badi ACLs ke liye, <code>asp rule-engine transactional-commit access-group</code> naye rules ko compilation poora hone ke baad hi effect mein laata hai.</li>
</ul>
<p>ASA gadbad se bachne mein bhi madad karta hai: agar aap existing ACE jaisi hi ACE jodte ho, to woh chupchaap jodne ke bajaye duplicate element ki warning deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek firewall mein 40 web servers ke liye <code>permit tcp any host 10.0.2.x eq h&#116;tps</code> form ki 40 ACEs hain. Unhe <code>object-group network WEB-FARM</code> (40 members) aur ek ACE <code>permit tcp any object-group WEB-FARM eq h&#116;tps</code> se replace karo. Element count 40 hi rehta hai, lekin configuration 40 lines se 1 ho jaati hai, aur server 41 jodna ek line ka group change hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Reboot ke agle hafte zero-hit rules delete karna; investigation ke dauraan counters clear karke saboot kho dena; aur alag teams ki rules ko ek group mein merge karke "optimise" karna, jo baad mein chapter 5 wali accidental-access problem paida karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> hitcnt matched connections ginta hai, packets nahi. Agar ek lamba session hai to rule megabytes traffic le ja sakti hai aur hitcnt 1 ho sakta hai. Aur broad rule ke neeche rakhi rule par zero hits ka matlab aam taur par shadowing hai, "unused" nahi.</p></div>

<div class="scn"><h4>2,400 lines wali ACL</h4><p>Ek telecom ke edge ASA par OUTSIDE_IN mein 2,400 lines aur group expansion ke baad 90,000 se zyada elements the. Changes apply hone mein minutes lagte the aur memory alarms bajte the. Teen mahine ke counter review mein 1,100 zero-hit lines, 140 shadowed lines aur poore subnets tak <code>any</code> permit karne wali 30 rules mili. Team ne owner sign-off ke saath dead rules hataayi, servers ko groups mein consolidate kiya, broad rules tight ki aur object-group-search enable kiya. ACL 600 lines aur 9,000 elements par aa gayi.</p><p><b>Seekh:</b> hit counts aur hashes saboot hain; regular safai firewall ko fast aur policy ko imaandaar rakhti hai.</p></div>

<div class="iv"><p class="q">"ASA par unused ya redundant rules kaise dhoondte aur saaf karte ho?"</p><p>Strong answer: uptime check karo, phir lambi window mein <code>show access-list</code> hit counts collect karo; zero-hit rules, upar ki broad rules se shadowed rules, aur zaroorat se zyada broad rules flag karo; owners se confirm karo; hatao ya tight karo; object-groups se consolidate karo; element count dekho aur object-group-search consider karo. Mention karo ki hitcnt connections ginta hai aur ACE hashes syslog 106100 lines ko rules se jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show access-list elements, name hash, har ACE ka hitcnt aur hash deta hai.</li>
<li>hitcnt boot ya pichhle clear ke baad se nayi connections ginta hai.</li>
<li>Broad rule ke neeche zero hits ka matlab shadowing; order aur scope theek karo.</li>
<li>Groups se consolidate karo, element count dekho, object-group-search consider karo.</li>
<li>Correctness ke liye order karo; live edit ke bajaye reviewed ACLs swap karo.</li>
</ul></div>
`}};export{e as default};