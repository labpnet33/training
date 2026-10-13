var e={id:`acls-for-routes`,h:{en:`ACLs vs prefix lists for route matching`,hi:`Route matching ke liye ACLs vs prefix lists`},body:{en:`
<p>Imagine a wedding guest list that contains only first names. "Rahul" is on the list, so every Rahul at the gate walks in: the uncle, the cousin and the neighbour's son. That is a <b>standard ACL used to match routes</b>: it sees the network address and nothing about the mask. A <b>prefix list</b> is the guest list with first name and age, so it can tell the uncle from the son. Both tools still appear everywhere in real configs and in exam output, so you must read both fluently.</p>

<h3>Packets versus routes</h3>
<p>You learned ACLs for filtering <b>packets</b>: source, destination, protocol, ports. When an ACL is referenced by a routing feature (a distribute-list, a route map's <code>match ip address</code>, a <code>distance</code> command) it filters <b>routes</b> instead, and the fields take on new meanings.</p>
<ul>
<li><b>Standard ACL</b>: the address and wildcard are compared with the route's <b>network address only</b>. The prefix length is ignored.</li>
<li><b>permit</b> means "this route matches"; <b>deny</b> means "this route does not match". Inside a route map, "does not match" sends the route to the next sequence; it does not necessarily drop it.</li>
<li>The implicit deny at the end still exists: anything not permitted does not match.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ACL vs prefix list view of a route">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">routes: 10.200.10.0/24 and 10.200.10.0/25</text>
<rect x="20" y="90" width="280" height="110" rx="10" fill="#fed7aa"/>
<text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="14">standard ACL</text>
<text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">sees only 10.200.10.0</text>
<text x="160" y="165" text-anchor="middle" class="svg-accent" font-size="12">cannot tell /24 from /25</text>
<rect x="340" y="90" width="280" height="110" rx="10" fill="#bbf7d0"/>
<text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="14">prefix list</text>
<text x="480" y="140" text-anchor="middle" class="svg-muted" font-size="12">sees 10.200.10.0 and /24</text>
<text x="480" y="165" text-anchor="middle" class="svg-accent" font-size="12">matches each exactly</text>
<line x1="160" y1="64" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="64" x2="480" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A standard ACL compares only the network address of a route; a prefix list also checks its length.</p></div>

<h3>Standard ACL examples</h3>
<pre class="code"><span class="c">! matches every route whose network address starts with 10.200</span>
access-list 10 permit 10.200.0.0 0.0.255.255
<span class="c">! matches any route whose network address is exactly 192.168.50.0, any mask</span>
access-list 20 permit 192.168.50.0 0.0.0.0
<span class="c">! "permit any" for routes</span>
access-list 30 permit any</pre>
<p>ACL 10 matches 10.200.0.0/16, 10.200.10.0/24 and 10.200.10.128/25 alike. ACL 20 matches 192.168.50.0/24 but also a summary 192.168.50.0/23 or a host route 192.168.50.0/32 if one appeared.</p>

<h3>Extended ACLs: two different meanings</h3>
<p>Extended ACLs add a second address field, and Cisco uses it differently depending on the feature. This is a favourite trap.</p>
<ul>
<li><b>In BGP filtering and in route maps used by BGP</b>, the <b>source</b> field matches the route's network and the <b>destination</b> field matches its <b>mask</b>. So an extended ACL can match length, just awkwardly.</li>
<li><b>In an IGP distribute-list</b> (EIGRP, RIP), the <b>source</b> field matches the router that sent the update and the <b>destination</b> field matches the network.</li>
</ul>
<pre class="code"><span class="c">! BGP style: exactly 10.200.10.0/24</span>
access-list 101 permit ip host 10.200.10.0 host 255.255.255.0
<span class="c">! BGP style: every /24 inside 10.200.0.0/16</span>
access-list 102 permit ip 10.200.0.0 0.0.255.255 host 255.255.255.0
<span class="c">! EIGRP distribute-list style: 192.168.50.0 only when learned from 10.1.1.1</span>
access-list 103 permit ip host 10.1.1.1 host 192.168.50.0</pre>
<p>Compare ACL 102 with the prefix list <code>10.200.0.0/16 ge 24 le 24</code>. Same result, far less readable. That is why modern configs prefer prefix lists, and why the neighbour side of a filter is usually written with <code>distribute-list prefix LIST gateway GW-LIST</code> instead.</p>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th>Feature</th><th>Standard ACL</th><th>Prefix list</th></tr>
<tr><td>Matches network bits</td><td>yes, with a wildcard</td><td>yes, with a length</td></tr>
<tr><td>Matches prefix length</td><td>no</td><td>yes, exact or ge/le range</td></tr>
<tr><td>Non-contiguous wildcards (for example odd third octets)</td><td>yes</td><td>no</td></tr>
<tr><td>Edit one line in place</td><td>named ACLs with sequence numbers</td><td>yes, always sequenced</td></tr>
<tr><td>Hit counters for routes</td><td>no useful counter</td><td>yes, hit count per entry</td></tr>
<tr><td>Accepted by <code>distance</code></td><td>yes (standard only)</td><td>no</td></tr>
<tr><td>Accepted by route maps and distribute-lists</td><td>yes</td><td>yes</td></tr></table>
<p>The <code>distance</code> command is the one place you still must use a standard ACL, as you saw in chapter 3. The other rare case is a wildcard that is not contiguous, such as "every odd /24", which a prefix list cannot express.</p>

<div class="eg"><p><b>Worked example: rewriting a legacy filter.</b> An old EIGRP config on BR1 contains <code>distribute-list 10 out ospf 1</code> with <code>access-list 10 permit 10.200.0.0 0.0.255.255</code>, intended to redistribute only Bengaluru LANs of /24 or shorter. A new /30 link 10.200.99.0/30 appears in OSPF and leaks into EIGRP, because the ACL ignores length. The replacement is:</p>
<pre class="code">ip prefix-list BLR-LANS seq 10 permit 10.200.0.0/16 le 24
router eigrp 100
 no distribute-list 10 out ospf 1
 distribute-list prefix BLR-LANS out ospf 1</pre>
<p>The /30 now fails the length test and stays out of EIGRP.</p></div>

<h3>Other match clauses that take a list</h3>
<ul>
<li><code>match ip address {ACL | prefix-list NAME}</code>: the route's network (and length, with a prefix list).</li>
<li><code>match ip next-hop {ACL | prefix-list NAME}</code>: the route's next-hop address.</li>
<li><code>match ip route-source {ACL | prefix-list NAME}</code>: the router that advertised the route.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using a deny line in an ACL to "block" a route inside a route map permit entry and expecting the route to be dropped. The deny only means "no match here"; the route falls through to the next sequence, and if that sequence permits everything, the route goes through.</p></div>

<div class="exam"><p><b>Exam trap.</b> Given <code>access-list 5 permit 172.16.0.0 0.0.255.255</code> in a distribute-list, the exam may ask whether 172.16.10.0/24 and 172.16.0.0/16 both pass. They do: a standard ACL ignores prefix length. Also expect questions about the extended ACL source and destination meanings.</p></div>

<div class="scn"><h4>Blocking a summary blocked a LAN</h4><p>A team wanted to stop the summary 10.200.0.0/16 from entering EIGRP while keeping specific subnets, and added <code>access-list 20 deny 10.200.0.0 0.0.0.0</code> plus <code>access-list 20 permit any</code> in a distribute-list. The summary disappeared, but so did the server LAN 10.200.0.0/24, because both routes share the network address 10.200.0.0. Replacing the ACL with <code>ip prefix-list NO-SUM seq 5 deny 10.200.0.0/16</code> and <code>seq 10 permit 0.0.0.0/0 le 32</code> removed only the /16.</p><p><b>Lesson:</b> when two routes share a network address and differ only in length, only a prefix list can separate them.</p></div>

<div class="iv"><p class="q">"How does a standard ACL match routes, and when would you still use an ACL instead of a prefix list?"</p><p>Strong answer: in a routing context the standard ACL compares only the route's network address with the wildcard; permit means match, deny means no match, and the mask is ignored. Prefix lists add length matching, sequence editing and hit counts, so they are the default choice. I would still use an ACL where the command requires one, such as per-prefix <code>distance</code>, or for a non-contiguous wildcard. Bonus: explain the extended ACL network and mask trick in BGP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In route filtering a standard ACL matches only the network address; the prefix length is ignored.</li>
<li>ACL permit means match and deny means no match; in a route map a non-match moves to the next sequence.</li>
<li>Extended ACLs: BGP uses source = network and destination = mask; IGP distribute-lists use source = update sender and destination = network.</li>
<li>Prefix lists match length, are easy to edit and show hit counts; prefer them.</li>
<li>The <code>distance</code> command accepts only a standard ACL.</li>
</ul></div>
`,hi:`
<p>Ek shaadi ki guest list socho jisme sirf first names hain. "Rahul" list mein hai, isliye gate par har Rahul andar aa jaata hai: uncle, cousin aur padosi ka beta. Yahi hai <b>routes match karne ke liye use hui standard ACL</b>: woh network address dekhti hai aur mask ke baare mein kuch nahi. <b>Prefix list</b> first name aur umar dono wali guest list hai, isliye woh uncle aur bete mein fark kar sakti hai. Dono tools real configs aur exam output mein har jagah dikhte hain, isliye aapko dono fluently padhne aane chahiye.</p>

<h3>Packets vs routes</h3>
<p>Aapne ACLs <b>packets</b> filter karne ke liye seekhi thi: source, destination, protocol, ports. Jab ACL kisi routing feature se reference hoti hai (distribute-list, route map ka <code>match ip address</code>, <code>distance</code> command), to woh <b>routes</b> filter karti hai, aur fields ke naye matlab ho jaate hain.</p>
<ul>
<li><b>Standard ACL</b>: address aur wildcard route ke <b>sirf network address</b> se compare hote hain. Prefix length ignore hoti hai.</li>
<li><b>permit</b> ka matlab "yeh route match karta hai"; <b>deny</b> ka matlab "yeh route match nahi karta". Route map ke andar "match nahi karta" route ko agle sequence par bhejta hai; zaroori nahi ki use drop kare.</li>
<li>End ka implicit deny ab bhi hai: jo permit nahi hua woh match nahi karta.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ACL vs prefix list view of a route">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">routes: 10.200.10.0/24 aur 10.200.10.0/25</text>
<rect x="20" y="90" width="280" height="110" rx="10" fill="#fed7aa"/>
<text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="14">standard ACL</text>
<text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">sirf 10.200.10.0 dekhti hai</text>
<text x="160" y="165" text-anchor="middle" class="svg-accent" font-size="12">/24 aur /25 mein fark nahi</text>
<rect x="340" y="90" width="280" height="110" rx="10" fill="#bbf7d0"/>
<text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="14">prefix list</text>
<text x="480" y="140" text-anchor="middle" class="svg-muted" font-size="12">10.200.10.0 aur /24 dekhti hai</text>
<text x="480" y="165" text-anchor="middle" class="svg-accent" font-size="12">har ek ko exact match</text>
<line x1="160" y1="64" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="64" x2="480" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Standard ACL route ka sirf network address compare karti hai; prefix list uski length bhi check karti hai.</p></div>

<h3>Standard ACL examples</h3>
<pre class="code"><span class="c">! har woh route jiska network address 10.200 se shuru ho</span>
access-list 10 permit 10.200.0.0 0.0.255.255
<span class="c">! koi bhi route jiska network address bilkul 192.168.50.0 ho, mask kuch bhi</span>
access-list 20 permit 192.168.50.0 0.0.0.0
<span class="c">! routes ke liye "permit any"</span>
access-list 30 permit any</pre>
<p>ACL 10, 10.200.0.0/16, 10.200.10.0/24 aur 10.200.10.128/25 teeno ko ek jaisa match karti hai. ACL 20, 192.168.50.0/24 match karti hai, lekin agar summary 192.168.50.0/23 ya host route 192.168.50.0/32 aa jaaye to unhe bhi.</p>

<h3>Extended ACLs: do alag matlab</h3>
<p>Extended ACLs ek doosra address field jodti hain, aur Cisco feature ke hisaab se ise alag tarike se use karta hai. Yeh favourite trap hai.</p>
<ul>
<li><b>BGP filtering mein aur BGP dwara use hue route maps mein</b>, <b>source</b> field route ka network match karta hai aur <b>destination</b> field uska <b>mask</b>. To extended ACL length match kar sakti hai, bas awkward tarike se.</li>
<li><b>IGP distribute-list mein</b> (EIGRP, RIP), <b>source</b> field update bhejne wale router ko match karta hai aur <b>destination</b> field network ko.</li>
</ul>
<pre class="code"><span class="c">! BGP style: bilkul 10.200.10.0/24</span>
access-list 101 permit ip host 10.200.10.0 host 255.255.255.0
<span class="c">! BGP style: 10.200.0.0/16 ke andar har /24</span>
access-list 102 permit ip 10.200.0.0 0.0.255.255 host 255.255.255.0
<span class="c">! EIGRP distribute-list style: 192.168.50.0 sirf tab jab 10.1.1.1 se seekha ho</span>
access-list 103 permit ip host 10.1.1.1 host 192.168.50.0</pre>
<p>ACL 102 ko prefix list <code>10.200.0.0/16 ge 24 le 24</code> se compare karo. Result same, readability kahin kam. Isliye modern configs prefix lists prefer karte hain, aur filter ka neighbour wala hissa aam taur par <code>distribute-list prefix LIST gateway GW-LIST</code> se likha jaata hai.</p>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th>Feature</th><th>Standard ACL</th><th>Prefix list</th></tr>
<tr><td>Network bits match karti hai</td><td>haan, wildcard ke saath</td><td>haan, length ke saath</td></tr>
<tr><td>Prefix length match karti hai</td><td>nahi</td><td>haan, exact ya ge/le range</td></tr>
<tr><td>Non-contiguous wildcards (jaise odd third octets)</td><td>haan</td><td>nahi</td></tr>
<tr><td>Ek line in-place edit</td><td>sequence numbers wali named ACLs</td><td>haan, hamesha sequenced</td></tr>
<tr><td>Routes ke liye hit counters</td><td>koi kaam ka counter nahi</td><td>haan, har entry ka hit count</td></tr>
<tr><td><code>distance</code> accept karta hai</td><td>haan (sirf standard)</td><td>nahi</td></tr>
<tr><td>Route maps aur distribute-lists accept karte hain</td><td>haan</td><td>haan</td></tr></table>
<p><code>distance</code> command woh ek jagah hai jahan aapko ab bhi standard ACL use karni padti hai, jaisa chapter 3 mein dekha. Doosra rare case hai non-contiguous wildcard, jaise "har odd /24", jo prefix list express nahi kar sakti.</p>

<div class="eg"><p><b>Worked example: legacy filter ko dobara likhna.</b> BR1 ke ek purane EIGRP config mein <code>distribute-list 10 out ospf 1</code> ke saath <code>access-list 10 permit 10.200.0.0 0.0.255.255</code> hai, jiska irada sirf /24 ya usse chhoti length wale Bengaluru LANs redistribute karna tha. OSPF mein ek naya /30 link 10.200.99.0/30 aata hai aur EIGRP mein leak ho jaata hai, kyunki ACL length ignore karti hai. Replacement yeh hai:</p>
<pre class="code">ip prefix-list BLR-LANS seq 10 permit 10.200.0.0/16 le 24
router eigrp 100
 no distribute-list 10 out ospf 1
 distribute-list prefix BLR-LANS out ospf 1</pre>
<p>Ab /30 length test fail karta hai aur EIGRP se bahar rehta hai.</p></div>

<h3>Doosre match clauses jo list lete hain</h3>
<ul>
<li><code>match ip address {ACL | prefix-list NAME}</code>: route ka network (aur prefix list ke saath length).</li>
<li><code>match ip next-hop {ACL | prefix-list NAME}</code>: route ka next-hop address.</li>
<li><code>match ip route-source {ACL | prefix-list NAME}</code>: woh router jisne route advertise kiya.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Route map ki permit entry ke andar ACL ki deny line se route "block" karna aur expect karna ki route drop ho jaayega. Deny ka matlab sirf "yahan match nahi"; route agle sequence mein gir jaata hai, aur agar woh sequence sab permit karta hai, to route nikal jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Distribute-list mein <code>access-list 5 permit 172.16.0.0 0.0.255.255</code> diya ho, to exam pooch sakta hai ki kya 172.16.10.0/24 aur 172.16.0.0/16 dono pass hote hain. Haan, dono: standard ACL prefix length ignore karti hai. Extended ACL ke source aur destination ke matlab par bhi questions expect karo.</p></div>

<div class="scn"><h4>Summary block karne se LAN block ho gaya</h4><p>Ek team summary 10.200.0.0/16 ko EIGRP mein aane se rokna chahti thi aur specific subnets rakhna chahti thi, aur usne distribute-list mein <code>access-list 20 deny 10.200.0.0 0.0.0.0</code> plus <code>access-list 20 permit any</code> jod diya. Summary gayab ho gayi, lekin server LAN 10.200.0.0/24 bhi, kyunki dono routes ka network address 10.200.0.0 hai. ACL ko <code>ip prefix-list NO-SUM seq 5 deny 10.200.0.0/16</code> aur <code>seq 10 permit 0.0.0.0/0 le 32</code> se replace karne par sirf /16 hata.</p><p><b>Seekh:</b> jab do routes ka network address same ho aur sirf length alag ho, to sirf prefix list unhe alag kar sakti hai.</p></div>

<div class="iv"><p class="q">"Standard ACL routes ko kaise match karti hai, aur aap prefix list ki jagah ACL kab use karoge?"</p><p>Strong answer: routing context mein standard ACL route ke sirf network address ko wildcard se compare karti hai; permit ka matlab match, deny ka matlab no match, aur mask ignore hota hai. Prefix lists length matching, sequence editing aur hit counts jodti hain, isliye woh default choice hain. ACL main tab use karunga jab command ko ACL chahiye, jaise per-prefix <code>distance</code>, ya non-contiguous wildcard ke liye. Bonus: BGP mein extended ACL ka network aur mask wala trick samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route filtering mein standard ACL sirf network address match karti hai; prefix length ignore hoti hai.</li>
<li>ACL permit ka matlab match aur deny ka matlab no match; route map mein non-match agle sequence par jaata hai.</li>
<li>Extended ACLs: BGP source = network aur destination = mask use karta hai; IGP distribute-lists source = update bhejne wala aur destination = network use karti hain.</li>
<li>Prefix lists length match karti hain, edit karne mein aasaan hain aur hit counts dikhati hain; inhe prefer karo.</li>
<li><code>distance</code> command sirf standard ACL accept karta hai.</li>
</ul></div>
`}};export{e as default};