var e={id:`dynamic-nat`,h:{en:`Dynamic NAT: pools, ACLs and pool exhaustion`,hi:`Dynamic NAT: pools, ACLs aur pool exhaustion`},body:{en:`
<p>Think of a car rental counter at a small railway station with only two cars. The first two travellers who arrive each get a car for as long as they need it. The third traveller is told "sorry, none left", and must wait until someone returns a car. Nobody shares a car, and nobody gets one reserved in advance. That is <b>dynamic NAT</b>: inside hosts borrow public addresses from a <b>pool</b>, one address per host, first come first served, and when the pool is empty the next host simply cannot get out.</p>

<h3>The three building blocks</h3>
<ol>
<li><b>A standard ACL</b> that says <i>which inside local addresses may be translated</i>. Here the ACL is a selector, not a filter: a <code>permit</code> means "translate this source", and a source that hits the implicit deny is simply not translated.</li>
<li><b>A pool</b> of inside global addresses: <code>ip nat pool NAME first last {netmask MASK | prefix-length N}</code>. The mask or prefix length is a sanity check that the range belongs to one subnet; the network and broadcast addresses of that subnet are never handed out.</li>
<li><b>The rule</b> that ties them together: <code>ip nat inside source list ACL pool NAME</code>. Without the word <code>overload</code> this is one-to-one dynamic NAT.</li>
</ol>

<h3>Lab walkthrough: a coaching centre with two public addresses</h3>
<p>In the dynamic NAT lab, three staff PCs (10.20.0.11, .12, .13) sit behind EDGE. The provider gave only 100.64.50.10 and 100.64.50.11, in the same /24 as EDGE's uplink 100.64.50.2.</p>
<pre class="code">EDGE(config)# interface g0/0
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface g0/1
EDGE(config-if)#  ip nat outside
EDGE(config-if)# exit
<span class="c">! 1. who may be translated</span>
EDGE(config)# access-list 20 permit 10.20.0.0 0.0.0.255
<span class="c">! 2. which addresses to hand out</span>
EDGE(config)# ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
<span class="c">! 3. glue them together, no overload</span>
EDGE(config)# ip nat inside source list 20 pool PUBLIC</pre>
<p>PC1 and PC2 ping the server 198.51.100.80. Each gets its own inside global address:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 100.64.50.10:1     10.20.0.11:1       198.51.100.80:1    198.51.100.80:1
<span class="hl">---  100.64.50.10       10.20.0.11         ---                ---</span>
icmp 100.64.50.11:1     10.20.0.12:1       198.51.100.80:1    198.51.100.80:1
<span class="hl">---  100.64.50.11       10.20.0.12         ---                ---</span></pre>
<p>The <code>---</code> lines are the one-to-one <b>simple</b> entries that reserve the address for that host. The icmp lines are per-flow extended entries. As long as the simple entry exists, the address belongs to that PC.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pool exhaustion">
<rect x="10" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.20.0.11</text>
<rect x="10" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">PC2 10.20.0.12</text>
<rect x="10" y="160" width="130" height="44" rx="8" fill="#fed7aa"/><text x="75" y="187" text-anchor="middle" class="svg-ink" font-size="13">PC3 10.20.0.13</text>
<rect x="250" y="70" width="150" height="84" rx="8" fill="#bae6fd"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="13">Pool PUBLIC</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">100.64.50.10 used</text><text x="325" y="137" text-anchor="middle" class="svg-muted" font-size="12">100.64.50.11 used</text>
<line x1="140" y1="42" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="112" x2="250" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="182" x2="250" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="520" y="100" text-anchor="middle" class="svg-ink" font-size="13">allocated 2 (100%)</text>
<text x="520" y="190" text-anchor="middle" class="svg-accent" font-size="13">PC3: miss, dropped</text>
</svg><p class="cap">Dynamic NAT without overload: two addresses, two hosts. The third host has nothing to borrow.</p></div>

<h3>Pool exhaustion: what happens to PC3</h3>
<p>Now PC3 pings the server. The ACL matches 10.20.0.13, but the pool has no free address. The router cannot translate, so it <b>drops</b> the packet and counts a pool miss. The ping fails with no reply at all, and the router may log an allocation failure such as <code>%NAT-6-ADDR_ALLOC_FAILURE: Address allocation failed; pool 1 may be exhausted</code>. The statistics tell the story:</p>
<pre class="out">EDGE# show ip nat statistics
Total active translations: 4 (0 static, 4 dynamic; 2 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 18  Misses: 7
Expired translations: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 20 pool PUBLIC refcount 4
 pool PUBLIC: netmask 255.255.255.0
        start 100.64.50.10 end 100.64.50.11
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Two different counters are easy to confuse. The top <b>Hits/Misses</b> count table lookups: a hit found an existing entry, a miss did not (a miss is normal for the first packet of a new flow, which then creates an entry). The <b>misses</b> on the pool line count failed <b>allocations</b>: a host that wanted an address and got none. A rising pool misses counter with <code>allocated 2 (100%)</code> is the fingerprint of exhaustion.</p>

<h3>How addresses come back</h3>
<p>A dynamic simple entry stays until it has been idle for the translation timeout, <b>24 hours by default</b> (86400 seconds). So PC1 can hold 100.64.50.10 all day, even when idle. You can shorten it with <code>ip nat translation timeout 3600</code>, or free addresses at once with <code>clear ip nat translation *</code> (dynamic entries only). The real fixes for a pool that is too small are a bigger pool or adding <code>overload</code>, which turns the rule into PAT (next chapter).</p>

<div class="eg"><p><b>Worked example.</b> A pool is written as <code>ip nat pool P 203.0.113.33 203.0.113.38 prefix-length 29</code>. The /29 subnet is 203.0.113.32 to .39, so .33 to .38 are six usable addresses, and six inside hosts can be online at once without overload. The seventh host gets a pool miss. If the uplink is 203.0.113.2/30, those pool addresses are <b>not</b> in the outside subnet, so the ISP must route 203.0.113.32/29 to your router, or replies never arrive.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing the ACL for the wrong subnet, for example <code>access-list 20 permit 10.2.0.0 0.0.0.255</code> instead of 10.20.0.0. The pool is untouched, no error appears, and hosts leave untranslated with private sources that the ISP drops. <code>show ip nat statistics</code> shows zero allocations; <code>show access-lists</code> shows zero matches.</p></div>

<div class="exam"><p><b>Exam trap.</b> Without <code>overload</code>, dynamic NAT never shares an address. If a question gives a pool of N addresses and more than N active hosts, the extra hosts fail. Also: the ACL in a NAT rule selects traffic for translation; hosts it does not permit are forwarded untranslated, not filtered.</p></div>

<div class="scn"><h4>Morning rush at the coaching centre</h4><p>Every morning around 9:30 some counsellors could not reach the CRM while others could. The NAT router used a pool of 14 addresses without overload for 30 staff. <code>show ip nat statistics</code> showed <code>allocated 14 (100%)</code> and a rising pool misses counter; entries from yesterday were still held because of the 24-hour timeout. The engineer added <code>overload</code> to the rule (after clearing the old translations), and the misses stopped.</p><p><b>Lesson:</b> dynamic one-to-one NAT scales only as far as the pool; PAT is the practical answer for users.</p></div>

<div class="iv"><p class="q">"What happens when a dynamic NAT pool runs out of addresses?"</p><p>Strong answer: new inside hosts that match the ACL cannot get a translation, so their packets are dropped; existing hosts keep working. show ip nat statistics shows allocated 100% and the pool misses counter rising, and the router can log an allocation failure. Fixes: enlarge the pool, shorten the timeout, clear stale entries, or add overload for PAT. Mention the 24-hour default timeout that keeps idle hosts holding addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic NAT = ACL (who) + pool (which addresses) + ip nat inside source list … pool … (the glue).</li>
<li>One inside host per pool address; no sharing without overload.</li>
<li>Pool empty: new hosts are dropped and the pool line shows allocated 100% and misses rising.</li>
<li>Simple dynamic entries time out after 24 hours idle by default; clear ip nat translation * frees them.</li>
<li>Pool addresses must be routed back to you, either in the outside subnet or routed by the ISP.</li>
</ul></div>
`,hi:`
<p>Ek chhote railway station ka car rental counter socho jiske paas sirf do cars hain. Pehle aane wale do travellers ko jab tak chahiye tab tak ke liye ek ek car milti hai. Teesre traveller ko kaha jaata hai "sorry, koi nahi bachi", aur use tab tak wait karna padta hai jab tak koi car wapas na kare. Koi car share nahi karta, aur kisi ki car pehle se reserve nahi hoti. Yahi <b>dynamic NAT</b> hai: inside hosts ek <b>pool</b> se public addresses udhaar lete hain, har host ko ek address, pehle aao pehle pao, aur pool khali ho jaaye to agla host bahar nikal hi nahi sakta.</p>

<h3>Teen building blocks</h3>
<ol>
<li><b>Ek standard ACL</b> jo batata hai <i>kaunse inside local addresses translate ho sakte hain</i>. Yahan ACL selector hai, filter nahi: <code>permit</code> ka matlab hai "is source ko translate karo", aur jo source implicit deny se takraata hai woh bas translate nahi hota.</li>
<li>Inside global addresses ka <b>ek pool</b>: <code>ip nat pool NAME first last {netmask MASK | prefix-length N}</code>. Mask ya prefix length ek sanity check hai ki range ek hi subnet ki hai; us subnet ke network aur broadcast addresses kabhi nahi diye jaate.</li>
<li><b>Rule</b> jo inhe jodta hai: <code>ip nat inside source list ACL pool NAME</code>. <code>overload</code> shabd ke bina yeh one-to-one dynamic NAT hai.</li>
</ol>

<h3>Lab walkthrough: do public addresses wala coaching centre</h3>
<p>Dynamic NAT lab mein teen staff PCs (10.20.0.11, .12, .13) EDGE ke peeche hain. Provider ne sirf 100.64.50.10 aur 100.64.50.11 diye, EDGE ke uplink 100.64.50.2 wale same /24 mein.</p>
<pre class="code">EDGE(config)# interface g0/0
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface g0/1
EDGE(config-if)#  ip nat outside
EDGE(config-if)# exit
<span class="c">! 1. kaun translate ho sakta hai</span>
EDGE(config)# access-list 20 permit 10.20.0.0 0.0.0.255
<span class="c">! 2. kaunse addresses dene hain</span>
EDGE(config)# ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
<span class="c">! 3. dono ko jodo, overload nahi</span>
EDGE(config)# ip nat inside source list 20 pool PUBLIC</pre>
<p>PC1 aur PC2 server 198.51.100.80 ping karte hain. Har ek ko apna inside global address milta hai:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 100.64.50.10:1     10.20.0.11:1       198.51.100.80:1    198.51.100.80:1
<span class="hl">---  100.64.50.10       10.20.0.11         ---                ---</span>
icmp 100.64.50.11:1     10.20.0.12:1       198.51.100.80:1    198.51.100.80:1
<span class="hl">---  100.64.50.11       10.20.0.12         ---                ---</span></pre>
<p><code>---</code> lines one-to-one <b>simple</b> entries hain jo us host ke liye address reserve karti hain. icmp lines per-flow extended entries hain. Jab tak simple entry hai, address us PC ka hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pool exhaustion">
<rect x="10" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.20.0.11</text>
<rect x="10" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">PC2 10.20.0.12</text>
<rect x="10" y="160" width="130" height="44" rx="8" fill="#fed7aa"/><text x="75" y="187" text-anchor="middle" class="svg-ink" font-size="13">PC3 10.20.0.13</text>
<rect x="250" y="70" width="150" height="84" rx="8" fill="#bae6fd"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="13">Pool PUBLIC</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">100.64.50.10 use mein</text><text x="325" y="137" text-anchor="middle" class="svg-muted" font-size="12">100.64.50.11 use mein</text>
<line x1="140" y1="42" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="112" x2="250" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="182" x2="250" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="520" y="100" text-anchor="middle" class="svg-ink" font-size="13">allocated 2 (100%)</text>
<text x="520" y="190" text-anchor="middle" class="svg-accent" font-size="13">PC3: miss, drop</text>
</svg><p class="cap">Overload ke bina dynamic NAT: do addresses, do hosts. Teesre host ke paas udhaar lene ko kuch nahi.</p></div>

<h3>Pool exhaustion: PC3 ke saath kya hota hai</h3>
<p>Ab PC3 server ping karta hai. ACL 10.20.0.13 ko match karta hai, par pool mein koi free address nahi. Router translate nahi kar sakta, isliye packet <b>drop</b> karta hai aur pool miss count karta hai. Ping bina kisi reply ke fail hota hai, aur router <code>%NAT-6-ADDR_ALLOC_FAILURE: Address allocation failed; pool 1 may be exhausted</code> jaisa allocation failure log kar sakta hai. Statistics poori kahani batati hain:</p>
<pre class="out">EDGE# show ip nat statistics
Total active translations: 4 (0 static, 4 dynamic; 2 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 18  Misses: 7
Expired translations: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 20 pool PUBLIC refcount 4
 pool PUBLIC: netmask 255.255.255.0
        start 100.64.50.10 end 100.64.50.11
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Do alag counters aasani se confuse ho jaate hain. Upar wale <b>Hits/Misses</b> table lookups count karte hain: hit ko existing entry mili, miss ko nahi (naye flow ke pehle packet ke liye miss normal hai, jo phir entry banata hai). Pool line ke <b>misses</b> failed <b>allocations</b> count karte hain: aisa host jise address chahiye tha aur nahi mila. <code>allocated 2 (100%)</code> ke saath badhta pool misses counter exhaustion ka fingerprint hai.</p>

<h3>Addresses wapas kaise aate hain</h3>
<p>Dynamic simple entry tab tak rehti hai jab tak woh translation timeout jitni der idle na rahe, <b>default 24 ghante</b> (86400 seconds). Isliye PC1 idle rehte hue bhi poore din 100.64.50.10 pakad sakta hai. Aap ise <code>ip nat translation timeout 3600</code> se chhota kar sakte ho, ya <code>clear ip nat translation *</code> (sirf dynamic entries) se turant addresses free kar sakte ho. Chhote pool ke asli fixes hain bada pool ya <code>overload</code> jodna, jo rule ko PAT bana deta hai (agla chapter).</p>

<div class="eg"><p><b>Worked example.</b> Pool aise likha hai: <code>ip nat pool P 203.0.113.33 203.0.113.38 prefix-length 29</code>. /29 subnet 203.0.113.32 se .39 hai, isliye .33 se .38 chhe usable addresses hain, aur bina overload chhe inside hosts ek saath online ho sakte hain. Saatven host ko pool miss milta hai. Agar uplink 203.0.113.2/30 hai, to yeh pool addresses outside subnet mein <b>nahi</b> hain, isliye ISP ko 203.0.113.32/29 aapke router ki taraf route karna hoga, warna replies kabhi nahi aayenge.</p></div>

<div class="warn"><p><b>Common galti.</b> ACL galat subnet ke liye likhna, jaise 10.20.0.0 ki jagah <code>access-list 20 permit 10.2.0.0 0.0.0.255</code>. Pool ko koi nahi chhoota, koi error nahi aata, aur hosts private sources ke saath bina translation nikalte hain jinhe ISP drop kar deta hai. <code>show ip nat statistics</code> zero allocations dikhata hai; <code>show access-lists</code> zero matches.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>overload</code> ke bina dynamic NAT kabhi address share nahi karta. Agar question N addresses ka pool aur N se zyada active hosts deta hai, extra hosts fail hote hain. Aur: NAT rule ka ACL translation ke liye traffic select karta hai; jin hosts ko woh permit nahi karta woh bina translation forward hote hain, filter nahi hote.</p></div>

<div class="scn"><h4>Coaching centre ki morning rush</h4><p>Har subah lagbhag 9:30 baje kuch counsellors CRM tak nahi pahunch paate the jabki baaki pahunch jaate. NAT router 30 staff ke liye bina overload 14 addresses ka pool use kar raha tha. <code>show ip nat statistics</code> mein <code>allocated 14 (100%)</code> aur badhta pool misses counter dikha; 24-hour timeout ki wajah se kal ki entries ab bhi pakdi hui thin. Engineer ne (purane translations clear karke) rule mein <code>overload</code> joda, aur misses ruk gaye.</p><p><b>Seekh:</b> dynamic one-to-one NAT sirf pool jitna scale karta hai; users ke liye practical jawab PAT hai.</p></div>

<div class="iv"><p class="q">"Jab dynamic NAT pool ke addresses khatam ho jaayein to kya hota hai?"</p><p>Strong answer: ACL match karne wale naye inside hosts ko translation nahi milta, isliye unke packets drop hote hain; existing hosts chalte rehte hain. show ip nat statistics allocated 100% aur badhta pool misses counter dikhata hai, aur router allocation failure log kar sakta hai. Fixes: pool bada karo, timeout chhota karo, stale entries clear karo, ya PAT ke liye overload jodo. 24-hour default timeout batao jo idle hosts ko addresses pakde rakhne deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic NAT = ACL (kaun) + pool (kaunse addresses) + ip nat inside source list … pool … (jodne wala).</li>
<li>Har pool address par ek inside host; overload ke bina sharing nahi.</li>
<li>Pool khali: naye hosts drop hote hain aur pool line allocated 100% aur badhte misses dikhati hai.</li>
<li>Simple dynamic entries default mein 24 ghante idle ke baad time out hoti hain; clear ip nat translation * inhe free karta hai.</li>
<li>Pool addresses aap tak wapas route hone chahiye, ya to outside subnet mein ya ISP ke route se.</li>
</ul></div>
`}};export{e as default};