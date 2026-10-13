var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Policy points on a PE"><rect x="20" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">Customer</text><rect x="250" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="13">PE</text><rect x="510" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">RR / core</text><line x1="130" y1="65" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/><text x="190" y="30" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="445" y="30" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">`+r+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`policy-and-session-security`,h:{en:`Routing policy and BGP session security in an SP network`,hi:`SP network mein routing policy aur BGP session security`},body:{en:`
<p>A service provider does not trust a single prefix that a customer sends. Between the customer and the core there is always a policy: what we accept, what we mark, what we pass on. This chapter shows the tools and the reasoning. The lab has no route-maps, so every configuration here is <b>reference configuration</b>. Addresses are documentation ranges; customer ASNs are private (64512 to 65534).</p>

<h3>Prefix filtering on customer sessions</h3>
<p>The first rule of customer BGP: accept only what the customer owns. An <b>inbound prefix-list</b> per customer is the standard tool. Also drop what should never appear on the Internet.</p>
<pre class="code"><span class="c">! Reference configuration</span>
ip prefix-list CUST1-IN seq 5 permit 172.16.1.0/24
router bgp 65000
 neighbor 192.0.2.2 remote-as 65101
 neighbor 192.0.2.2 prefix-list CUST1-IN in
 neighbor 192.0.2.2 maximum-prefix 10 80</pre>
<p><code>maximum-prefix 10 80</code> tears down (or warns at 80 percent of) the session when the customer sends more than 10 prefixes. It limits damage from an accidental full-table leak.</p>

<h3>Communities: tagging routes so policy can act on them</h3>
<p>A <b>community</b> is a 32-bit tag, written ASN:value, attached to a route. The provider decides the meaning and publishes it to customers. Typical meanings: "set LOCAL_PREF 80 (backup)", "do not advertise to peers", "advertise only in Asia". Well-known communities have fixed behaviour:</p>
<table class="cmp"><tr><th>Community</th><th>Effect</th></tr>
<tr><td>no-export</td><td>do not advertise to eBGP peers (outside the AS or confederation)</td></tr>
<tr><td>no-advertise</td><td>do not advertise to any BGP peer</td></tr>
<tr><td>local-AS</td><td>do not advertise outside the local sub-AS (confederations)</td></tr></table>
<pre class="code"><span class="c">! Reference configuration: customer tags backup routes with 65000:80</span>
ip community-list standard BACKUP permit 65000:80
route-map CUST1-IN permit 10
 match community BACKUP
 set local-preference 80
route-map CUST1-IN permit 20
 set local-preference 200
router bgp 65000
 neighbor 192.0.2.2 route-map CUST1-IN in
 neighbor 10.20.255.2 send-community both</pre>
<p>Remember <code>send-community</code>: communities are <b>not sent</b> to iBGP or eBGP neighbours by default on IOS. Without it, the policy tag never leaves the PE.</p>

@@D@@

<h3>Where policy is applied</h3>
<ul>
<li><b>Inbound from customers</b>: filter by prefix-list and AS_PATH, set LOCAL_PREF from communities, set communities that record "learned from customer in Pune".</li>
<li><b>Outbound to customers</b>: send default, full table or partial routes according to the product sold; remove internal communities.</li>
<li><b>Peers and upstreams</b>: a settlement-free peer should receive only customer routes. Never advertise one peer's routes to another peer, or you become free transit (a "route leak").</li>
</ul>

<h3>Protecting the session itself</h3>
<ul>
<li><b>MD5 / TCP-AO authentication</b>: <code>neighbor x password</code> stops an attacker from injecting resets or updates into a TCP session.</li>
<li><b>TTL security (GTSM)</b>: <code>neighbor x ttl-security hops 1</code> expects packets with TTL 255 from a directly connected peer, so remote spoofed packets are discarded.</li>
<li><b>Control-plane protection</b>: infrastructure ACLs allow TCP 179 only from configured neighbours, and rate-limit the rest.</li>
<li><b>Origin validation (RPKI)</b>: compare each route's origin AS with signed ROAs and mark it valid, invalid or not found; many providers drop invalid routes. This is an overview-level topic for the exam.</li>
</ul>

<div class="eg"><p><b>Worked example: prefix list.</b> Customer 65101 owns 172.16.1.0/24. The list above permits exactly that prefix. If the customer mistakenly advertises 172.16.0.0/16, the PE drops it. If it advertises 10 or more prefixes, <code>maximum-prefix</code> reacts. A mistake on the customer side never reaches the core.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Filtering outbound but not inbound. Forgetting <code>send-community</code>. Matching a community in a route-map that has no permit statement for the rest, so everything else is silently dropped (a route-map ends with an implicit deny).</p></div>
<div class="exam"><p><b>Exam trap.</b> LOCAL_PREF is the AS-wide knob for outbound steering, MED and AS_PATH prepend influence how <i>neighbours</i> send traffic in. no-export keeps a route inside your AS; it is not the same as no-advertise.</p></div>

<div class="scn"><h4>The leaked /16 that never left</h4><p>A customer's new router originated a /16 that it did not own. Because the PE applied a per-customer prefix-list, the route was rejected at the edge and a monitoring alarm named the neighbour. The core, and the rest of the Internet, never saw it.</p><p><b>Lesson:</b> filter at the edge, by customer, on the way in.</p></div>

<div class="iv"><p class="q">"How do you stop a customer from leaking routes or hijacking your session?"</p><p>A per-customer inbound prefix-list plus maximum-prefix protects against leaks. For the session, use MD5 or TCP-AO authentication, GTSM, and an infrastructure ACL restricting TCP 179. Add RPKI origin validation and IRR-based filters on larger peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter customer routes inbound with prefix-lists and maximum-prefix.</li>
<li>Communities tag routes; configure send-community to carry them.</li>
<li>LOCAL_PREF steers outbound traffic; MED and prepend steer inbound.</li>
<li>Authenticate sessions and use TTL security to protect TCP 179.</li>
<li>Route-maps end with an implicit deny.</li>
</ul></div>
`.replace(`@@D@@`,e(`Policy points: filter and mark on the way in from customers; control what goes into the core.`,`prefix-list + route-map in`,`send-community, next-hop-self`,`Session protection: password, ttl-security, ACL on TCP 179`)),hi:`
<p>Service provider customer ke bheje ek bhi prefix par bharosa nahi karta. Customer aur core ke beech hamesha ek policy hoti hai: kya accept karna, kya mark karna, kya aage dena. Is chapter mein tools aur reasoning hai. Lab mein route-maps nahi hain, isliye yahan ka har configuration <b>reference configuration</b> hai. Addresses documentation ranges hain; customer ASNs private hain (64512 se 65534).</p>

<h3>Customer sessions par prefix filtering</h3>
<p>Customer BGP ka pehla rule: sirf wahi accept karo jo customer ka apna hai. Har customer ke liye <b>inbound prefix-list</b> standard tool hai. Woh bhi drop karo jo Internet par kabhi nahi dikhna chahiye.</p>
<pre class="code"><span class="c">! Reference configuration</span>
ip prefix-list CUST1-IN seq 5 permit 172.16.1.0/24
router bgp 65000
 neighbor 192.0.2.2 remote-as 65101
 neighbor 192.0.2.2 prefix-list CUST1-IN in
 neighbor 192.0.2.2 maximum-prefix 10 80</pre>
<p><code>maximum-prefix 10 80</code> session ko tab gira deta hai (ya 80 percent par warn karta hai) jab customer 10 se zyada prefixes bheje. Yeh accidental full-table leak ka nuksan limit karta hai.</p>

<h3>Communities: routes ko tag karna taaki policy un par kaam kare</h3>
<p><b>Community</b> 32-bit tag hai, ASN:value likha jaata hai, route ke saath juda. Meaning provider tay karta hai aur customers ko publish karta hai. Typical meanings: "LOCAL_PREF 80 set karo (backup)", "peers ko advertise mat karo", "sirf Asia mein advertise karo". Well-known communities ka fixed behaviour hai:</p>
<table class="cmp"><tr><th>Community</th><th>Asar</th></tr>
<tr><td>no-export</td><td>eBGP peers ko advertise mat karo (AS ya confederation ke bahar)</td></tr>
<tr><td>no-advertise</td><td>kisi bhi BGP peer ko advertise mat karo</td></tr>
<tr><td>local-AS</td><td>local sub-AS ke bahar advertise mat karo (confederations)</td></tr></table>
<pre class="code"><span class="c">! Reference configuration: customer backup routes ko 65000:80 se tag karta hai</span>
ip community-list standard BACKUP permit 65000:80
route-map CUST1-IN permit 10
 match community BACKUP
 set local-preference 80
route-map CUST1-IN permit 20
 set local-preference 200
router bgp 65000
 neighbor 192.0.2.2 route-map CUST1-IN in
 neighbor 10.20.255.2 send-community both</pre>
<p><code>send-community</code> yaad rakho: IOS par communities default mein iBGP ya eBGP neighbours ko <b>nahi bheji jaati</b>. Iske bina policy tag PE se bahar jaata hi nahi.</p>

@@D@@

<h3>Policy kahan lagti hai</h3>
<ul>
<li><b>Customers se inbound</b>: prefix-list aur AS_PATH se filter karo, communities se LOCAL_PREF set karo, communities set karo jo record karein "Pune mein customer se seekha".</li>
<li><b>Customers ko outbound</b>: bechhe gaye product ke hisaab se default, full table ya partial routes bhejo; internal communities hatao.</li>
<li><b>Peers aur upstreams</b>: settlement-free peer ko sirf customer routes milne chahiye. Ek peer ke routes doosre peer ko kabhi advertise mat karo, warna aap free transit ban jaate ho ("route leak").</li>
</ul>

<h3>Session ko khud protect karna</h3>
<ul>
<li><b>MD5 / TCP-AO authentication</b>: <code>neighbor x password</code> attacker ko TCP session mein resets ya updates inject karne se rokta hai.</li>
<li><b>TTL security (GTSM)</b>: <code>neighbor x ttl-security hops 1</code> directly connected peer se TTL 255 wale packets ki ummeed rakhta hai, isliye remote spoofed packets discard hote hain.</li>
<li><b>Control-plane protection</b>: infrastructure ACLs TCP 179 sirf configured neighbours se allow karte hain, baaki rate-limit.</li>
<li><b>Origin validation (RPKI)</b>: har route ke origin AS ko signed ROAs se compare karke valid, invalid ya not found mark karo; kai providers invalid routes drop karte hain. Exam ke liye overview-level topic hai.</li>
</ul>

<div class="eg"><p><b>Worked example: prefix list.</b> Customer 65101 ke paas 172.16.1.0/24 hai. Upar ki list bilkul wahi prefix permit karti hai. Customer galti se 172.16.0.0/16 advertise kare to PE use drop karta hai. 10 ya zyada prefixes advertise kare to <code>maximum-prefix</code> react karta hai. Customer side ki galti core tak kabhi nahi pahunchti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Outbound filter karna lekin inbound nahi. <code>send-community</code> bhoolna. Route-map mein community match karna jisme baaki ke liye permit statement nahi, isliye baaki sab chupchaap drop ho jaata hai (route-map ka ant implicit deny hota hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> LOCAL_PREF outbound steering ka AS-wide knob hai, MED aur AS_PATH prepend <i>neighbours</i> ke traffic ko andar bhejne ko influence karte hain. no-export route ko aapke AS ke andar rakhta hai; yeh no-advertise ke barabar nahi hai.</p></div>

<div class="scn"><h4>Woh /16 leak jo kabhi bahar nahi gaya</h4><p>Ek customer ke naye router ne ek /16 originate kiya jo uska nahi tha. PE par per-customer prefix-list lagi thi, isliye route edge par reject ho gaya aur monitoring alarm ne neighbour ka naam bataya. Core aur baaki Internet ne use kabhi dekha hi nahi.</p><p><b>Lesson:</b> edge par, customer ke hisaab se, andar aate waqt filter karo.</p></div>

<div class="iv"><p class="q">"Customer ko routes leak karne ya aapka session hijack karne se kaise rokte ho?"</p><p>Per-customer inbound prefix-list aur maximum-prefix leaks se bachate hain. Session ke liye MD5 ya TCP-AO authentication, GTSM, aur TCP 179 ko restrict karne wala infrastructure ACL use karo. Bade peers par RPKI origin validation aur IRR-based filters jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Customer routes ko prefix-lists aur maximum-prefix se inbound filter karo.</li>
<li>Communities routes tag karti hain; carry karne ke liye send-community configure karo.</li>
<li>LOCAL_PREF outbound traffic steer karta hai; MED aur prepend inbound.</li>
<li>TCP 179 ko protect karne ke liye sessions authenticate karo aur TTL security use karo.</li>
<li>Route-maps ka ant implicit deny hota hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`Policy points: customers se aate waqt filter aur mark karo; core mein kya jaata hai control karo.`,`prefix-list + route-map in`,`send-community, next-hop-self`,`Session protection: password, ttl-security, TCP 179 par ACL`))}};export{t as default};