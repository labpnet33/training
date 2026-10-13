var e={id:`prefix-lists`,h:{en:`Prefix lists: ge, le and many drills`,hi:`Prefix lists: ge, le aur bahut saari drills`},body:{en:`
<p>Think of a courier company that sorts parcels with two questions. First: "is the address inside PIN area 5600xx?" Second: "is it a whole building, a floor, or a single flat?" A <b>prefix list</b> asks the same two questions about a route. The first is about the <b>network bits</b> (which area), the second is about the <b>prefix length</b> (how specific). Every route map, distribute-list and BGP filter you write in this module will lean on prefix lists, so we practise them until they are automatic.</p>

<h3>Syntax</h3>
<pre class="code">ip prefix-list NAME [seq N] {permit | deny} PREFIX/LEN [ge G] [le L]
ipv6 prefix-list NAME [seq N] {permit | deny} PREFIX/LEN [ge G] [le L]</pre>
<p>A route matches an entry only if <b>both</b> tests pass:</p>
<ol>
<li><b>Network test:</b> the first LEN bits of the route equal the first LEN bits of PREFIX.</li>
<li><b>Length test:</b> the route's own prefix length is inside the allowed range.</li>
</ol>
<table class="cmp"><tr><th>You write</th><th>Allowed route lengths</th></tr>
<tr><td>no ge, no le</td><td>exactly LEN</td></tr>
<tr><td>le L only</td><td>LEN up to L</td></tr>
<tr><td>ge G only</td><td>G up to 32 (128 for IPv6)</td></tr>
<tr><td>ge G le L</td><td>G up to L</td></tr></table>
<p>The values must satisfy <b>LEN &lt; G &le; L &le; 32</b>; IOS rejects an entry that breaks this rule. The list is read in sequence order (default steps of 5), the <b>first matching entry decides</b>, and every list ends with an <b>implicit deny</b> for anything not matched.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Prefix length ranges">
<line x1="40" y1="180" x2="600" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="40" y="200" text-anchor="middle" class="svg-muted" font-size="12">/0</text><text x="180" y="200" text-anchor="middle" class="svg-muted" font-size="12">/8</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">/16</text><text x="460" y="200" text-anchor="middle" class="svg-muted" font-size="12">/24</text><text x="600" y="200" text-anchor="middle" class="svg-muted" font-size="12">/32</text>
<circle cx="320" cy="40" r="7" fill="#fde68a" stroke="#64748b"/><text x="340" y="45" class="svg-ink" font-size="13">10.200.0.0/16 (exact)</text>
<rect x="320" y="70" width="140" height="18" rx="6" fill="#bae6fd"/><text x="470" y="84" class="svg-ink" font-size="13">/16 le 24</text>
<rect x="460" y="105" width="140" height="18" rx="6" fill="#bbf7d0"/><text x="450" y="119" text-anchor="end" class="svg-ink" font-size="13">/16 ge 24</text>
<rect x="460" y="140" width="6" height="18" fill="#ddd6fe" stroke="#64748b"/><text x="450" y="154" text-anchor="end" class="svg-ink" font-size="13">/16 ge 24 le 24</text>
</svg><p class="cap">For 10.200.0.0/16 the network test is always "first 16 bits are 10.200"; ge and le only move the allowed length window.</p></div>

<h3>Drills: match or not?</h3>
<table class="cmp"><tr><th>Entry</th><th>Matches</th><th>Does not match</th></tr>
<tr><td>10.200.1.0/24</td><td>10.200.1.0/24</td><td>10.200.10.0/24, 10.200.1.0/25</td></tr>
<tr><td>10.200.0.0/16 le 24</td><td>10.200.0.0/16, 10.200.64.0/18, 10.200.10.0/24</td><td>10.200.10.128/25, 10.201.0.0/24</td></tr>
<tr><td>10.200.0.0/16 ge 24</td><td>10.200.10.0/24, 10.200.10.1/32</td><td>10.200.0.0/16, 10.200.0.0/20</td></tr>
<tr><td>10.200.0.0/16 ge 24 le 24</td><td>every /24 inside 10.200.0.0/16</td><td>any /25 to /32, the /16 itself</td></tr>
<tr><td>0.0.0.0/0</td><td>the default route only</td><td>everything else</td></tr>
<tr><td>0.0.0.0/0 le 32</td><td>every IPv4 route ("permit any")</td><td>nothing</td></tr>
<tr><td>0.0.0.0/0 ge 32</td><td>every /32 host route</td><td>anything shorter than /32</td></tr>
<tr><td>172.16.0.0/20 le 24</td><td>172.16.10.0/24 (third octet 0 to 15)</td><td>172.16.20.0/24, 172.16.0.0/16</td></tr>
<tr><td>192.168.50.0/24 ge 25 le 26</td><td>192.168.50.128/25, 192.168.50.64/26</td><td>192.168.50.0/24, 192.168.50.0/27</td></tr>
<tr><td>0.0.0.0/1 ge 8 le 8</td><td>classful class A networks such as 10.0.0.0/8</td><td>10.1.0.0/16, 172.16.0.0/16</td></tr>
<tr><td>128.0.0.0/2 ge 16 le 16</td><td>class B networks such as 172.16.0.0/16</td><td>172.16.10.0/24</td></tr>
<tr><td>192.0.0.0/3 ge 24 le 24</td><td>class C networks such as 192.168.50.0/24</td><td>192.168.0.0/16</td></tr></table>

<div class="eg"><p><b>Worked example: 172.16.0.0/20 le 24 against 172.16.20.0/24.</b> Write the third octet in binary. /20 fixes the first 4 bits of the third octet. 0 is 0000 0000, so the list requires the third octet to start with 0000, meaning values 0 to 15. 20 is 0001 0100: it starts with 0001, so the network test fails before the length test is even checked. 172.16.10.0/24 has 10 = 0000 1010, passes the network test, and its length 24 is inside 20 to 24, so it matches.</p></div>

<h3>Lab 2: the list that was too exact</h3>
<p>In the troubleshooting lab, route map OSPF-TO-EIGRP permits only routes matching prefix list OSPF-LANS, which contains a single entry.</p>
<pre class="out">BR1#show ip prefix-list detail OSPF-LANS
Prefix-list with the last deletion/insertion: OSPF-LANS
ip prefix-list OSPF-LANS:
   count: 1, range entries: 0, sequences: 5 - 5, refcount: 2
   <span class="hl">seq 5 permit 10.200.1.0/24 (hit count: 14, refcount: 1)</span></pre>
<p>With no ge or le, only 10.200.1.0/24 passes. 10.200.2.0/24 and the users' LAN 10.200.10.0/24 fail the network test and fall to the implicit deny, so E1 never learns them. The fix adds a range entry; nothing needs to be removed.</p>
<pre class="code">ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24
<span class="c">! the transit links 10.2.1.0/24 and 10.2.2.0/24 still do not match, by design</span></pre>
<pre class="out">BR1#show ip prefix-list detail OSPF-LANS
ip prefix-list OSPF-LANS:
   count: 2, <span class="hl">range entries: 1</span>, sequences: 5 - 10, refcount: 3
   seq 5 permit 10.200.1.0/24 (hit count: 16, refcount: 1)
   <span class="hl">seq 10 permit 10.200.0.0/16 le 24 (hit count: 4, refcount: 1)</span></pre>
<p>The <b>hit count</b> column is the best live evidence that an entry is matching routes. You can reset it with <code>clear ip prefix-list OSPF-LANS</code>.</p>

<h3>Editing safely</h3>
<ul>
<li>Insert between entries by choosing a free sequence number, for example <code>seq 7</code>.</li>
<li>Remove one entry with <code>no ip prefix-list OSPF-LANS seq 5</code>. <code>no ip prefix-list OSPF-LANS</code> removes the entire list, and every route map referencing it then matches nothing.</li>
<li>A prefix list that is referenced but does not exist behaves differently per feature; never rely on it. Create the list first, then reference it.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Writing <code>permit 10.200.0.0/16</code> and expecting it to cover the /24s inside. Without le, it matches only the /16 itself. The second classic is ending a deny-style list without <code>permit 0.0.0.0/0 le 32</code>, which silently blocks everything else.</p></div>

<div class="exam"><p><b>Exam trap.</b> Prefix lists compare the <b>prefix length of the route</b>, not a wildcard. An ACL entry like <code>permit 10.200.0.0 0.0.255.255</code> matches any route whose network address starts with 10.200 regardless of mask; <code>10.200.0.0/16</code> in a prefix list matches only that exact /16. Also know that <code>0.0.0.0/0</code> alone means only the default route.</p></div>

<div class="scn"><h4>The deny list that ate the network</h4><p>To stop a lab network leaking into production, an engineer created <code>ip prefix-list NO-LAB seq 5 deny 10.99.0.0/16 le 32</code> and applied it with <code>distribute-list prefix NO-LAB out</code> under EIGRP on a distribution router. Within seconds every access router lost all routes learned through it. The list had no permit entry, so the implicit deny blocked everything. Adding <code>seq 100 permit 0.0.0.0/0 le 32</code> restored service.</p><p><b>Lesson:</b> a list meant to deny a few routes must end with an explicit permit-any.</p></div>

<div class="iv"><p class="q">"Write a prefix list that matches all /24 to /28 subnets inside 10.0.0.0/8, and explain why a prefix list is better than an ACL for this."</p><p>Strong answer: <code>ip prefix-list SUBS permit 10.0.0.0/8 ge 24 le 28</code>. The /8 fixes the network bits, ge and le set the length window. A standard ACL can only test the network address, not the route's mask, so it cannot tell 10.1.1.0/24 from 10.1.1.0/30. Mention sequence numbers for easy editing, the implicit deny, and hit counts in <code>show ip prefix-list detail</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A prefix list tests network bits (first LEN bits) and prefix length (exact, or a ge/le window).</li>
<li>Rule: LEN &lt; ge &le; le &le; 32; no ge/le means exact length.</li>
<li>First match wins, sequence numbers allow editing, and an implicit deny ends every list.</li>
<li><code>0.0.0.0/0</code> is the default route only; <code>0.0.0.0/0 le 32</code> is everything.</li>
<li>Use <code>show ip prefix-list detail</code> hit counts to prove which entry matches.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho jo parcels ko do sawaalon se sort karti hai. Pehla: "kya address PIN area 5600xx ke andar hai?" Doosra: "kya yeh poori building hai, ek floor, ya ek flat?" <b>Prefix list</b> ek route ke baare mein yahi do sawaal poochti hai. Pehla <b>network bits</b> ke baare mein hai (kaunsa area), doosra <b>prefix length</b> ke baare mein (kitna specific). Is module mein aap jo bhi route map, distribute-list aur BGP filter likhoge woh prefix lists par tika hoga, isliye hum inki practice tab tak karenge jab tak yeh automatic na ho jaayein.</p>

<h3>Syntax</h3>
<pre class="code">ip prefix-list NAME [seq N] {permit | deny} PREFIX/LEN [ge G] [le L]
ipv6 prefix-list NAME [seq N] {permit | deny} PREFIX/LEN [ge G] [le L]</pre>
<p>Route ek entry se tabhi match karta hai jab <b>dono</b> tests pass hon:</p>
<ol>
<li><b>Network test:</b> route ke pehle LEN bits PREFIX ke pehle LEN bits ke barabar hon.</li>
<li><b>Length test:</b> route ki apni prefix length allowed range ke andar ho.</li>
</ol>
<table class="cmp"><tr><th>Aap likhte ho</th><th>Allowed route lengths</th></tr>
<tr><td>na ge, na le</td><td>bilkul LEN</td></tr>
<tr><td>sirf le L</td><td>LEN se L tak</td></tr>
<tr><td>sirf ge G</td><td>G se 32 tak (IPv6 ke liye 128)</td></tr>
<tr><td>ge G le L</td><td>G se L tak</td></tr></table>
<p>Values ko <b>LEN &lt; G &le; L &le; 32</b> satisfy karna chahiye; IOS is rule ko todne wali entry reject kar deta hai. List sequence order mein padhi jaati hai (default 5 ke steps), <b>pehli matching entry decide karti hai</b>, aur har list ke end mein match na hone wali har cheez ke liye <b>implicit deny</b> hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Prefix length ranges">
<line x1="40" y1="180" x2="600" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="40" y="200" text-anchor="middle" class="svg-muted" font-size="12">/0</text><text x="180" y="200" text-anchor="middle" class="svg-muted" font-size="12">/8</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">/16</text><text x="460" y="200" text-anchor="middle" class="svg-muted" font-size="12">/24</text><text x="600" y="200" text-anchor="middle" class="svg-muted" font-size="12">/32</text>
<circle cx="320" cy="40" r="7" fill="#fde68a" stroke="#64748b"/><text x="340" y="45" class="svg-ink" font-size="13">10.200.0.0/16 (exact)</text>
<rect x="320" y="70" width="140" height="18" rx="6" fill="#bae6fd"/><text x="470" y="84" class="svg-ink" font-size="13">/16 le 24</text>
<rect x="460" y="105" width="140" height="18" rx="6" fill="#bbf7d0"/><text x="450" y="119" text-anchor="end" class="svg-ink" font-size="13">/16 ge 24</text>
<rect x="460" y="140" width="6" height="18" fill="#ddd6fe" stroke="#64748b"/><text x="450" y="154" text-anchor="end" class="svg-ink" font-size="13">/16 ge 24 le 24</text>
</svg><p class="cap">10.200.0.0/16 ke liye network test hamesha "pehle 16 bits 10.200 hain" hai; ge aur le sirf allowed length window ko khiskaate hain.</p></div>

<h3>Drills: match ya nahi?</h3>
<table class="cmp"><tr><th>Entry</th><th>Match karta hai</th><th>Match nahi karta</th></tr>
<tr><td>10.200.1.0/24</td><td>10.200.1.0/24</td><td>10.200.10.0/24, 10.200.1.0/25</td></tr>
<tr><td>10.200.0.0/16 le 24</td><td>10.200.0.0/16, 10.200.64.0/18, 10.200.10.0/24</td><td>10.200.10.128/25, 10.201.0.0/24</td></tr>
<tr><td>10.200.0.0/16 ge 24</td><td>10.200.10.0/24, 10.200.10.1/32</td><td>10.200.0.0/16, 10.200.0.0/20</td></tr>
<tr><td>10.200.0.0/16 ge 24 le 24</td><td>10.200.0.0/16 ke andar har /24</td><td>koi bhi /25 se /32, khud /16</td></tr>
<tr><td>0.0.0.0/0</td><td>sirf default route</td><td>baaki sab kuch</td></tr>
<tr><td>0.0.0.0/0 le 32</td><td>har IPv4 route ("permit any")</td><td>kuch nahi</td></tr>
<tr><td>0.0.0.0/0 ge 32</td><td>har /32 host route</td><td>/32 se chhoti koi bhi length</td></tr>
<tr><td>172.16.0.0/20 le 24</td><td>172.16.10.0/24 (third octet 0 se 15)</td><td>172.16.20.0/24, 172.16.0.0/16</td></tr>
<tr><td>192.168.50.0/24 ge 25 le 26</td><td>192.168.50.128/25, 192.168.50.64/26</td><td>192.168.50.0/24, 192.168.50.0/27</td></tr>
<tr><td>0.0.0.0/1 ge 8 le 8</td><td>classful class A networks jaise 10.0.0.0/8</td><td>10.1.0.0/16, 172.16.0.0/16</td></tr>
<tr><td>128.0.0.0/2 ge 16 le 16</td><td>class B networks jaise 172.16.0.0/16</td><td>172.16.10.0/24</td></tr>
<tr><td>192.0.0.0/3 ge 24 le 24</td><td>class C networks jaise 192.168.50.0/24</td><td>192.168.0.0/16</td></tr></table>

<div class="eg"><p><b>Worked example: 172.16.0.0/20 le 24 vs 172.16.20.0/24.</b> Third octet ko binary mein likho. /20 third octet ke pehle 4 bits fix karta hai. 0 hai 0000 0000, isliye list maangti hai ki third octet 0000 se shuru ho, yaani values 0 se 15. 20 hai 0001 0100: yeh 0001 se shuru hota hai, isliye length test check hone se pehle hi network test fail ho jaata hai. 172.16.10.0/24 mein 10 = 0000 1010 hai, network test pass karta hai, aur uski length 24, 20 se 24 ke andar hai, isliye match hota hai.</p></div>

<h3>Lab 2: woh list jo zaroorat se zyada exact thi</h3>
<p>Troubleshooting lab mein route map OSPF-TO-EIGRP sirf un routes ko permit karta hai jo prefix list OSPF-LANS se match karte hain, jisme sirf ek entry hai.</p>
<pre class="out">BR1#show ip prefix-list detail OSPF-LANS
Prefix-list with the last deletion/insertion: OSPF-LANS
ip prefix-list OSPF-LANS:
   count: 1, range entries: 0, sequences: 5 - 5, refcount: 2
   <span class="hl">seq 5 permit 10.200.1.0/24 (hit count: 14, refcount: 1)</span></pre>
<p>ge ya le na hone se sirf 10.200.1.0/24 pass hota hai. 10.200.2.0/24 aur users ka LAN 10.200.10.0/24 network test fail karte hain aur implicit deny mein gir jaate hain, isliye E1 unhe kabhi nahi seekhta. Fix ek range entry jodta hai; kuch hatane ki zaroorat nahi.</p>
<pre class="code">ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24
<span class="c">! transit links 10.2.1.0/24 aur 10.2.2.0/24 ab bhi match nahi karte, design ke hisaab se</span></pre>
<pre class="out">BR1#show ip prefix-list detail OSPF-LANS
ip prefix-list OSPF-LANS:
   count: 2, <span class="hl">range entries: 1</span>, sequences: 5 - 10, refcount: 3
   seq 5 permit 10.200.1.0/24 (hit count: 16, refcount: 1)
   <span class="hl">seq 10 permit 10.200.0.0/16 le 24 (hit count: 4, refcount: 1)</span></pre>
<p><b>Hit count</b> column is baat ka sabse accha live saboot hai ki koi entry routes match kar rahi hai. Ise <code>clear ip prefix-list OSPF-LANS</code> se reset kar sakte ho.</p>

<h3>Safely edit karna</h3>
<ul>
<li>Entries ke beech insert karne ke liye khaali sequence number chuno, jaise <code>seq 7</code>.</li>
<li>Ek entry <code>no ip prefix-list OSPF-LANS seq 5</code> se hatao. <code>no ip prefix-list OSPF-LANS</code> poori list hata deta hai, aur usse reference karne wala har route map phir kuch match nahi karta.</li>
<li>Jo prefix list reference hai lekin exist nahi karti, woh har feature mein alag behave karti hai; is par kabhi bharosa mat karo. Pehle list banao, phir reference karo.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> <code>permit 10.200.0.0/16</code> likhna aur expect karna ki yeh andar ke /24s cover karega. le ke bina yeh sirf khud /16 match karta hai. Doosri classic galti hai deny-style list ko <code>permit 0.0.0.0/0 le 32</code> ke bina khatam karna, jo baaki sab kuch chupchaap block kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Prefix lists <b>route ki prefix length</b> compare karti hain, wildcard nahi. <code>permit 10.200.0.0 0.0.255.255</code> jaisi ACL entry har us route ko match karti hai jiska network address 10.200 se shuru ho, mask kuch bhi ho; prefix list mein <code>10.200.0.0/16</code> sirf wahi exact /16 match karta hai. Yeh bhi jaano ki akela <code>0.0.0.0/0</code> ka matlab sirf default route hai.</p></div>

<div class="scn"><h4>Woh deny list jo network kha gayi</h4><p>Ek lab network ko production mein leak hone se rokne ke liye ek engineer ne <code>ip prefix-list NO-LAB seq 5 deny 10.99.0.0/16 le 32</code> banayi aur ek distribution router par EIGRP ke neeche <code>distribute-list prefix NO-LAB out</code> se lagayi. Kuch hi seconds mein har access router ne uske through seekhe saare routes kho diye. List mein koi permit entry nahi thi, isliye implicit deny ne sab kuch block kar diya. <code>seq 100 permit 0.0.0.0/0 le 32</code> jodne se service wapas aayi.</p><p><b>Seekh:</b> kuch routes deny karne wali list explicit permit-any ke saath khatam honi chahiye.</p></div>

<div class="iv"><p class="q">"Ek prefix list likho jo 10.0.0.0/8 ke andar saare /24 se /28 subnets match kare, aur samjhao ki iske liye prefix list ACL se behtar kyun hai."</p><p>Strong answer: <code>ip prefix-list SUBS permit 10.0.0.0/8 ge 24 le 28</code>. /8 network bits fix karta hai, ge aur le length window set karte hain. Standard ACL sirf network address test kar sakti hai, route ka mask nahi, isliye woh 10.1.1.0/24 aur 10.1.1.0/30 mein fark nahi kar sakti. Aasaan editing ke liye sequence numbers, implicit deny, aur <code>show ip prefix-list detail</code> mein hit counts ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prefix list network bits (pehle LEN bits) aur prefix length (exact, ya ge/le window) test karti hai.</li>
<li>Rule: LEN &lt; ge &le; le &le; 32; ge/le na ho to exact length.</li>
<li>Pehla match jeetta hai, sequence numbers editing aasaan banate hain, aur har list implicit deny par khatam hoti hai.</li>
<li><code>0.0.0.0/0</code> sirf default route hai; <code>0.0.0.0/0 le 32</code> sab kuch hai.</li>
<li><code>show ip prefix-list detail</code> ke hit counts se prove karo ki kaunsi entry match kar rahi hai.</li>
</ul></div>
`}};export{e as default};