var e={id:`match-conditions`,h:{en:`Match conditions: protocol, prefix-list, interface, tag`,hi:`Match conditions: protocol, prefix-list, interface, tag`},body:{en:`
<p>A policy is only as precise as its <code>from</code> statement. This chapter shows the match conditions you will meet in labs and on the exam, and when to choose each one.</p>

<h3>Analogy: the sorting office</h3>
<p>In a post office, parcels are sorted by different labels: the courier company (protocol), the street list (prefix-list), the entry door (interface) or a coloured sticker (tag). You choose the label that identifies exactly the parcels you want. In policy, you choose the match that identifies exactly the routes you want, and nothing more.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Match conditions toolbox">
<rect x="230" y="85" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">from ...</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">the route under test</text>
<rect x="20" y="15" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">protocol static</text>
<rect x="20" y="90" width="150" height="40" rx="6" fill="#ddd6fe"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">route-filter</text>
<rect x="20" y="165" width="150" height="40" rx="6" fill="#fde68a"/><text x="95" y="190" text-anchor="middle" class="svg-ink" font-size="13">prefix-list</text>
<rect x="470" y="15" width="150" height="40" rx="6" fill="#fed7aa"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="13">interface / neighbor</text>
<rect x="470" y="90" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">tag / metric</text>
<rect x="470" y="165" width="150" height="40" rx="6" fill="#bae6fd"/><text x="545" y="190" text-anchor="middle" class="svg-ink" font-size="13">area / community</text>
<line x1="170" y1="35" x2="230" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="230" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="185" x2="230" y2="125" stroke="#64748b" stroke-width="1.5"/>
<line x1="470" y1="35" x2="410" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="470" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="470" y1="185" x2="410" y2="125" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Combine conditions inside one term. All of them must be true.</p></div>

<h3>The common conditions</h3>
<table class="cmp"><tr><th>Condition</th><th>Meaning</th><th>Typical use</th></tr>
<tr><td><code>protocol static</code></td><td>Route was learned or created by that source: static, direct, ospf, bgp, rip, aggregate, local</td><td>"Export only statics"</td></tr>
<tr><td><code>route-filter</code></td><td>Prefix and length match (next chapter)</td><td>Precise control of address ranges</td></tr>
<tr><td><code>prefix-list</code></td><td>A named list of prefixes defined once under policy-options, matched <b>exactly</b></td><td>Reuse one list in many policies</td></tr>
<tr><td><code>interface ge-0/0/1.0</code></td><td>Route whose next hop or origin is that interface</td><td>"Only routes behind this interface"</td></tr>
<tr><td><code>neighbor 10.1.1.2</code></td><td>Route learned from that neighbour</td><td>BGP and RIP filtering</td></tr>
<tr><td><code>tag 410</code></td><td>The route carries that tag</td><td>Mark routes in one policy, match them in another</td></tr>
<tr><td><code>metric 20</code>, <code>area 0.0.0.0</code></td><td>OSPF metric or area of the route</td><td>Filtering OSPF routes you re-export</td></tr></table>

<h3>Prefix-list: define once, use many times</h3>
<p>A prefix-list is a named set of prefixes. Because you define it separately, you can change the list without touching any policy.</p>
<pre class="code"><span class="c">! define the list</span>
set policy-options prefix-list MGMT-NETS 192.168.99.0/24
set policy-options prefix-list MGMT-NETS 192.168.100.0/24
<span class="c">! use it in a term</span>
set policy-options policy-statement NO-MGMT term BLOCK from prefix-list MGMT-NETS
set policy-options policy-statement NO-MGMT term BLOCK then reject</pre>
<p>By default <code>from prefix-list</code> matches the listed prefixes <b>exactly</b>, so a more specific route such as 192.168.99.128/25 would not match. If you need match types, use <code>prefix-list-filter MGMT-NETS orlonger</code>, which is a prefix-list with a route-filter match type. Do not confuse prefix-list with the firewall-filter keywords <code>source-prefix-list</code> and <code>destination-prefix-list</code>, which are used for packets.</p>

<h3>Combining conditions: AND versus OR</h3>
<ul>
<li>Different condition types in one term are ANDed: <code>protocol static</code> AND <code>route-filter ...</code>.</li>
<li>Several values of one type are ORed: <code>protocol [ static direct ]</code> means static OR direct.</li>
<li>Several route-filter lines in one term are ORed too, with the longest-match rule that you will meet in the next chapter.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You want to export statics that are inside 172.20.0.0/16 but never the management network. You can write it two ways.</p>
<pre class="code"><span class="c">! way 1: two terms, block first</span>
set policy-options policy-statement PARTNER-OUT term NO-MGMT from prefix-list MGMT-NETS
set policy-options policy-statement PARTNER-OUT term NO-MGMT then reject
set policy-options policy-statement PARTNER-OUT term PARTNERS from protocol static
set policy-options policy-statement PARTNER-OUT term PARTNERS from route-filter 172.20.0.0/16 orlonger
set policy-options policy-statement PARTNER-OUT term PARTNERS then accept</pre>
<p>Way 2 is a single term that only accepts the allowed range. In the lab you use way 2, because 192.168.99.0/24 is simply not inside 172.20.0.0/16. Way 1 is safer when the allowed range is wide and the exceptions are specific.</p></div>

<h3>Tags: passing a note between policies</h3>
<p>A <b>tag</b> is a 32-bit number attached to a route. It travels with OSPF external routes and static routes. One policy can set it (<code>then tag 300</code>) and a policy on another router can match it (<code>from tag 300</code>). Engineers use tags to mark "this came from the partner" so later policies and troubleshooting can recognise it.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>from protocol</code>. A route-filter alone matches routes of every protocol: a directly connected network inside the same range, an OSPF route, a static route. Add <code>protocol static</code> whenever you mean "only statics".</p></div>
<div class="exam"><p><b>Exam trap.</b> A prefix-list in a routing policy is an exact-match list. For "this prefix or longer" you need a route-filter, or <code>prefix-list-filter</code> with a match type.</p></div>

<div class="scn"><h4>The tag that saved a Friday</h4><p>A network team had three policies on a hub router, written by three people over two years. One Friday a prefix kept reappearing on a branch router after being removed. Because every export policy set a tag (100 for statics, 200 for direct, 300 for partner routes), the engineer simply ran <code>show route 172.30.5.0/24 detail</code> on the branch and saw Tag: 300. That told them the route came through the partner policy, not the statics policy. They fixed the right policy within minutes.</p><p><b>Lesson:</b> tags are cheap labels that make route origin visible during troubleshooting.</p></div>

<div class="iv"><p class="q">"When would you use a prefix-list instead of a route-filter?"</p><p>Strong answer: use a prefix-list when the same group of prefixes is needed in several policies or in firewall filters and you want one place to edit it. Use a route-filter when you need a match type such as orlonger or upto, or a one-off match inside a single term. Point out that prefix-lists match exactly unless used with prefix-list-filter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>from conditions include protocol, route-filter, prefix-list, interface, neighbor, tag, metric and area.</li>
<li>Different condition types are ANDed; several values of one type are ORed.</li>
<li>A prefix-list is defined once under policy-options and matches exactly.</li>
<li>Always add from protocol when you mean one source of routes.</li>
<li>Tags are labels that survive on routes and help later policies and troubleshooting.</li>
</ul></div>
`,hi:`
<p>Policy utni hi precise hoti hai jitna uska <code>from</code> statement. Yeh chapter woh match conditions dikhata hai jo aapko labs aur exam mein milenge, aur kab kaunsi choose karni hai.</p>

<h3>Analogy: sorting office</h3>
<p>Post office mein parcels alag labels se sort hote hain: courier company (protocol), street list (prefix-list), entry door (interface) ya coloured sticker (tag). Aap woh label chunte ho jo bilkul wahi parcels pehchane jo chahiye. Policy mein aap woh match chunte ho jo bilkul wahi routes pehchane jo chahiye, usse zyada nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Match conditions toolbox">
<rect x="230" y="85" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">from ...</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">test hone wala route</text>
<rect x="20" y="15" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">protocol static</text>
<rect x="20" y="90" width="150" height="40" rx="6" fill="#ddd6fe"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">route-filter</text>
<rect x="20" y="165" width="150" height="40" rx="6" fill="#fde68a"/><text x="95" y="190" text-anchor="middle" class="svg-ink" font-size="13">prefix-list</text>
<rect x="470" y="15" width="150" height="40" rx="6" fill="#fed7aa"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="13">interface / neighbor</text>
<rect x="470" y="90" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">tag / metric</text>
<rect x="470" y="165" width="150" height="40" rx="6" fill="#bae6fd"/><text x="545" y="190" text-anchor="middle" class="svg-ink" font-size="13">area / community</text>
<line x1="170" y1="35" x2="230" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="230" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="185" x2="230" y2="125" stroke="#64748b" stroke-width="1.5"/>
<line x1="470" y1="35" x2="410" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="470" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="470" y1="185" x2="410" y2="125" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Ek term ke andar conditions combine karo. Sab true honi chahiye.</p></div>

<h3>Common conditions</h3>
<table class="cmp"><tr><th>Condition</th><th>Matlab</th><th>Typical use</th></tr>
<tr><td><code>protocol static</code></td><td>Route us source se aaya ya bana: static, direct, ospf, bgp, rip, aggregate, local</td><td>"Sirf statics export karo"</td></tr>
<tr><td><code>route-filter</code></td><td>Prefix aur length match (agla chapter)</td><td>Address ranges par precise control</td></tr>
<tr><td><code>prefix-list</code></td><td>policy-options ke neeche ek baar define ki hui naam wali prefixes ki list, <b>exact</b> match</td><td>Ek list ko kai policies mein reuse karo</td></tr>
<tr><td><code>interface ge-0/0/1.0</code></td><td>Woh route jiska next hop ya origin woh interface hai</td><td>"Sirf is interface ke peeche ke routes"</td></tr>
<tr><td><code>neighbor 10.1.1.2</code></td><td>Us neighbour se seekha route</td><td>BGP aur RIP filtering</td></tr>
<tr><td><code>tag 410</code></td><td>Route par woh tag laga hai</td><td>Ek policy mein mark karo, doosri mein match karo</td></tr>
<tr><td><code>metric 20</code>, <code>area 0.0.0.0</code></td><td>OSPF metric ya route ka area</td><td>Re-export hone wale OSPF routes ko filter karna</td></tr></table>

<h3>Prefix-list: ek baar define, kai baar use</h3>
<p>Prefix-list prefixes ka naam wala set hai. Kyunki aap use alag define karte ho, kisi policy ko chhue bina list badal sakte ho.</p>
<pre class="code"><span class="c">! list define karo</span>
set policy-options prefix-list MGMT-NETS 192.168.99.0/24
set policy-options prefix-list MGMT-NETS 192.168.100.0/24
<span class="c">! term mein use karo</span>
set policy-options policy-statement NO-MGMT term BLOCK from prefix-list MGMT-NETS
set policy-options policy-statement NO-MGMT term BLOCK then reject</pre>
<p>Default mein <code>from prefix-list</code> listed prefixes ko <b>exactly</b> match karta hai, isliye 192.168.99.128/25 jaisa more specific route match nahi hoga. Match types chahiye to <code>prefix-list-filter MGMT-NETS orlonger</code> use karo, jo prefix-list ke saath route-filter ka match type hai. Prefix-list ko firewall-filter keywords <code>source-prefix-list</code> aur <code>destination-prefix-list</code> se confuse mat karo, woh packets ke liye hote hain.</p>

<h3>Conditions combine karna: AND versus OR</h3>
<ul>
<li>Ek term mein alag condition types AND hote hain: <code>protocol static</code> AND <code>route-filter ...</code>.</li>
<li>Ek type ki kai values OR hoti hain: <code>protocol [ static direct ]</code> matlab static YA direct.</li>
<li>Ek term mein kai route-filter lines bhi OR hoti hain, longest-match rule ke saath jo aap agle chapter mein dekhoge.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aap 172.20.0.0/16 ke andar ke statics export karna chahte ho lekin management network kabhi nahi. Do tareeke se likh sakte ho.</p>
<pre class="code"><span class="c">! tareeka 1: do terms, pehle block</span>
set policy-options policy-statement PARTNER-OUT term NO-MGMT from prefix-list MGMT-NETS
set policy-options policy-statement PARTNER-OUT term NO-MGMT then reject
set policy-options policy-statement PARTNER-OUT term PARTNERS from protocol static
set policy-options policy-statement PARTNER-OUT term PARTNERS from route-filter 172.20.0.0/16 orlonger
set policy-options policy-statement PARTNER-OUT term PARTNERS then accept</pre>
<p>Tareeka 2 ek hi term hai jo sirf allowed range accept karta hai. Lab mein aap tareeka 2 use karte ho, kyunki 192.168.99.0/24 172.20.0.0/16 ke andar hai hi nahi. Jab allowed range badi ho aur exceptions specific hon to tareeka 1 zyada safe hai.</p></div>

<h3>Tags: policies ke beech note pass karna</h3>
<p><b>Tag</b> route par laga 32-bit number hai. Yeh OSPF external routes aur static routes ke saath travel karta hai. Ek policy use set kar sakti hai (<code>then tag 300</code>) aur doosre router ki policy use match kar sakti hai (<code>from tag 300</code>). Engineers tags se mark karte hain "yeh partner se aaya", taaki baad ki policies aur troubleshooting use pehchan sakein.</p>

<div class="warn"><p><b>Common mistake.</b> <code>from protocol</code> bhool jaana. Akela route-filter har protocol ke routes match karta hai: usi range ka directly connected network, OSPF route, static route. Jab "sirf statics" chahiye to <code>protocol static</code> jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Routing policy mein prefix-list exact-match list hai. "Yeh prefix ya usse lamba" ke liye route-filter chahiye, ya match type ke saath <code>prefix-list-filter</code>.</p></div>

<div class="scn"><h4>Tag ne Friday bacha liya</h4><p>Ek network team ke hub router par teen policies thi, do saal mein teen logon ne likhi. Ek Friday ek prefix hatane ke baad bhi branch router par baar-baar wapas aa raha tha. Kyunki har export policy tag set karti thi (statics ke liye 100, direct ke liye 200, partner routes ke liye 300), engineer ne branch par <code>show route 172.30.5.0/24 detail</code> chalaya aur Tag: 300 dekha. Isse pata chala ki route partner policy se aaya, statics policy se nahi. Unhone sahi policy kuch minutes mein theek kar di.</p><p><b>Lesson:</b> tags sasti labels hain jo troubleshooting mein route ka origin dikhati hain.</p></div>

<div class="iv"><p class="q">"Route-filter ki jagah prefix-list kab use karoge?"</p><p>Strong answer: jab prefixes ka wahi group kai policies ya firewall filters mein chahiye aur aap edit karne ki ek hi jagah chahte ho, tab prefix-list. Jab orlonger ya upto jaisa match type chahiye, ya ek term mein one-off match chahiye, tab route-filter. Bolo ki prefix-list exact match karti hai jab tak prefix-list-filter ke saath use na ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>from conditions mein protocol, route-filter, prefix-list, interface, neighbor, tag, metric aur area aate hain.</li>
<li>Alag condition types AND hote hain; ek type ki kai values OR.</li>
<li>Prefix-list policy-options ke neeche ek baar define hoti hai aur exactly match karti hai.</li>
<li>Jab ek source ke routes chahiye to hamesha from protocol jodo.</li>
<li>Tags routes par bane rehne wale labels hain jo baad ki policies aur troubleshooting mein madad karte hain.</li>
</ul></div>
`}};export{e as default};