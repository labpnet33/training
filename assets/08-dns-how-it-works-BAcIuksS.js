var e={id:`dns-how`,h:{en:`How DNS works: hierarchy, recursion and caching`,hi:`DNS kaise kaam karta hai: hierarchy, recursion aur caching`},body:{en:`
<p>Imagine you need the phone number of a shop in another city. You ask your well-connected friend. Your friend does not know it, but knows who runs the national directory; the national directory points to the city directory; the city directory points to the market association; the association gives the number. Your friend tells you the answer and writes it down so that next time they can answer instantly. That friend is a <b>recursive resolver</b>, and that chain of directories is the <b>DNS hierarchy</b>.</p>

<h3>Names are a tree, read right to left</h3>
<p>A name like <code>www.sales.corp.example.</code> is read from the right. The trailing dot is the <b>root</b>. Then comes the <b>top-level domain (TLD)</b>, here <code>example</code>; real ones are <code>com</code>, <code>org</code>, <code>in</code> and so on. Then the <b>second-level domain</b> an organisation registers, <code>corp.example</code>, then optional subdomains (<code>sales</code>), and finally the host label <code>www</code>. The full name with every label is a <b>fully qualified domain name (FQDN)</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DNS hierarchy tree">
<rect x="270" y="10" width="100" height="34" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">root  .</text>
<rect x="80" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="130" y="97" text-anchor="middle" class="svg-ink" font-size="13">com</text>
<rect x="270" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">example</text>
<rect x="460" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="510" y="97" text-anchor="middle" class="svg-ink" font-size="13">in</text>
<rect x="250" y="140" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="13">corp.example</text>
<rect x="160" y="190" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="230" y="212" text-anchor="middle" class="svg-ink" font-size="13">www</text>
<rect x="340" y="190" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="410" y="212" text-anchor="middle" class="svg-ink" font-size="13">mail</text>
<line x1="320" y1="44" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="109" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="230" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="410" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="580" y="32" text-anchor="end" class="svg-muted" font-size="12">root servers</text>
<text x="630" y="97" text-anchor="end" class="svg-muted" font-size="12">TLD servers</text>
<text x="630" y="162" text-anchor="end" class="svg-muted" font-size="12">authoritative</text>
</svg><p class="cap">Each level only knows who is responsible for the level below it; nobody holds the whole tree.</p></div>

<h3>The four kinds of DNS server</h3>
<dl class="terms">
<dt>Stub resolver</dt><dd>The small DNS client inside every PC, phone and router. It asks one question and expects a final answer.</dd>
<dt>Recursive resolver</dt><dd>The server the client is configured with (DHCP option 6, 10.1.100.53 in our lab). It does the legwork: walks the tree, collects the answer, caches it.</dd>
<dt>Root and TLD servers</dt><dd>The root is served by 13 named server identities (a to m) run as hundreds of anycast instances worldwide. They do not know www.corp.example; they know who runs <code>example</code>. TLD servers know who is authoritative for <code>corp.example</code>.</dd>
<dt>Authoritative server</dt><dd>Holds the actual <b>zone</b> (the records) for a domain and gives definitive answers for it.</dd>
</dl>

<h3>Recursive vs iterative queries</h3>
<p>These two words describe <b>who does the work</b>:</p>
<ul>
<li>A <b>recursive query</b> says "give me the final answer or an error". Clients send recursive queries to their resolver. The resolver must chase the answer.</li>
<li>An <b>iterative query</b> says "tell me the best you know". The resolver sends iterative queries to root, TLD and authoritative servers. Each answers with either the record or a <b>referral</b> ("I don't know, ask these servers").</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Recursive and iterative DNS resolution">
<rect x="10" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="180" y="100" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="125" text-anchor="middle" class="svg-ink" font-size="13">Resolver</text>
<rect x="450" y="10" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="33" text-anchor="middle" class="svg-ink" font-size="13">Root</text>
<rect x="450" y="100" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="123" text-anchor="middle" class="svg-ink" font-size="13">example TLD</text>
<rect x="450" y="190" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="213" text-anchor="middle" class="svg-ink" font-size="13">corp.example auth</text>
<line x1="100" y1="120" x2="180" y2="120" stroke="#64748b" stroke-width="2"/><text x="140" y="95" text-anchor="middle" class="svg-accent" font-size="12">1 recursive</text><text x="140" y="160" text-anchor="middle" class="svg-accent" font-size="12">8 answer</text>
<line x1="300" y1="110" x2="450" y2="28" stroke="#64748b" stroke-width="2"/><text x="360" y="55" class="svg-muted" font-size="12">2-3 referral</text>
<line x1="300" y1="120" x2="450" y2="118" stroke="#64748b" stroke-width="2"/><text x="360" y="112" class="svg-muted" font-size="12">4-5 referral</text>
<line x1="300" y1="130" x2="450" y2="208" stroke="#64748b" stroke-width="2"/><text x="360" y="190" class="svg-muted" font-size="12">6-7 A record</text>
</svg><p class="cap">The client asks once (recursive); the resolver walks the tree with iterative queries and caches every step.</p></div>

<div class="eg"><p><b>Worked example: resolving www.corp.example for the first time.</b> (1) PC1 asks 10.1.100.53 recursively. (2) The resolver asks a root server; (3) root refers it to the <code>example</code> TLD servers. (4) It asks a TLD server; (5) the TLD refers it to ns1.corp.example. (6) It asks ns1.corp.example; (7) ns1 answers "A 203.0.113.80, TTL 3600". (8) The resolver returns the answer to PC1 and caches it. Five minutes later PC2 asks the same name: the resolver answers straight from cache in about a millisecond, marked as non-authoritative.</p></div>

<h3>TTL and caching</h3>
<p>Every record carries a <b>TTL (time to live)</b> in seconds, chosen by the zone owner. Resolvers and clients may cache the answer for that long. Caching is why DNS is fast and scales to the whole internet, and also why changes take time: if a record had TTL 86400 (one day), some users may see the old address for up to a day after you change it. Failed lookups are cached too (<b>negative caching</b>), for a period set in the zone's SOA record.</p>
<p>Caches exist at several layers: the resolver, the operating system (Windows DNS Client service; systemd-resolved on Linux), and often the browser. That is why the fix for "the new address still does not work" is often <code>ipconfig /flushdns</code>, plus waiting out the TTL on resolvers you do not control.</p>

<h3>Transport</h3>
<p>Ordinary queries use <b>UDP 53</b>: one small question, one small answer, no handshake. <b>TCP 53</b> is used for <b>zone transfers</b> between primary and secondary authoritative servers, and when an answer is too large for UDP (the server sets the truncated flag and the client retries over TCP). Firewalls and ACLs must allow both.</p>

<div class="warn"><p><b>Common mistakes.</b> Calling the resolver "the DNS" and assuming it holds all records; it holds a cache and knows how to ask. Lowering a TTL <i>at the moment</i> of a change (too late; lower it a day before). Allowing only UDP 53 through a firewall and breaking large responses or zone transfers.</p></div>
<div class="exam"><p><b>Exam trap.</b> Client to resolver = recursive; resolver to root/TLD/authoritative = iterative. DNS uses UDP 53 for queries and TCP 53 for zone transfers and large replies. The DNS server a client uses comes from DHCP option 6 or static configuration.</p></div>

<div class="scn"><h4>The migration that half worked</h4><p>A company moved its web portal to a new data center at 10 p.m. and updated the A record. By morning, staff at head office reached the new server, but branch users hit the old one, now switched off. The old record had TTL 86400; the branch resolvers had cached it at 7 p.m. and would keep it until 7 p.m. the next day. The team pointed the branch resolvers' forwarder at head office and flushed their caches, and wrote a rule into the change template: lower the TTL to 300 seconds 48 hours before any move.</p><p><b>Lesson:</b> DNS changes are only as fast as the TTL of the old record allows.</p></div>

<div class="iv"><p class="q">"Explain the difference between a recursive and an iterative DNS query."</p><p>A recursive query asks for a complete answer; clients send it to their resolver, which must return the record or an error. An iterative query asks for the best available information; the resolver sends these to root, TLD and authoritative servers, following referrals down the tree. Add caching and TTL: the resolver stores each answer for its TTL, which makes repeat lookups fast and explains why changes propagate slowly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DNS names form a tree read right to left: root, TLD, domain, subdomain, host.</li>
<li>Stub resolvers ask a recursive resolver; it queries root, TLD and authoritative servers iteratively.</li>
<li>Authoritative servers hold zones; resolvers hold caches.</li>
<li>TTL sets how long answers are cached; lower it before planned changes.</li>
<li>UDP 53 for queries; TCP 53 for zone transfers and large answers.</li>
</ul></div>
`,hi:`
<p>Socho aapko doosre shehar ki ek dukaan ka phone number chahiye. Aap apne well-connected dost se poochte ho. Dost ko number nahi pata, lekin use pata hai national directory kaun chalata hai; national directory city directory ki taraf bhejti hai; city directory market association ki taraf; association number de deti hai. Dost aapko jawab batata hai aur likh leta hai taaki agli baar turant bata sake. Woh dost <b>recursive resolver</b> hai, aur directories ki woh chain <b>DNS hierarchy</b> hai.</p>

<h3>Names ek tree hain, right se left padhe jaate hain</h3>
<p><code>www.sales.corp.example.</code> jaisa naam right se padha jaata hai. Aakhri dot <b>root</b> hai. Phir aata hai <b>top-level domain (TLD)</b>, yahan <code>example</code>; asli wale <code>com</code>, <code>org</code>, <code>in</code> waghera hain. Phir <b>second-level domain</b> jo organisation register karti hai, <code>corp.example</code>, phir optional subdomains (<code>sales</code>), aur aakhir mein host label <code>www</code>. Har label ke saath poora naam <b>fully qualified domain name (FQDN)</b> kehlata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DNS hierarchy tree">
<rect x="270" y="10" width="100" height="34" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">root  .</text>
<rect x="80" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="130" y="97" text-anchor="middle" class="svg-ink" font-size="13">com</text>
<rect x="270" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">example</text>
<rect x="460" y="75" width="100" height="34" rx="8" fill="#bae6fd"/><text x="510" y="97" text-anchor="middle" class="svg-ink" font-size="13">in</text>
<rect x="250" y="140" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="13">corp.example</text>
<rect x="160" y="190" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="230" y="212" text-anchor="middle" class="svg-ink" font-size="13">www</text>
<rect x="340" y="190" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="410" y="212" text-anchor="middle" class="svg-ink" font-size="13">mail</text>
<line x1="320" y1="44" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="109" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="230" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="410" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="580" y="32" text-anchor="end" class="svg-muted" font-size="12">root servers</text>
<text x="630" y="97" text-anchor="end" class="svg-muted" font-size="12">TLD servers</text>
<text x="630" y="162" text-anchor="end" class="svg-muted" font-size="12">authoritative</text>
</svg><p class="cap">Har level ko sirf yeh pata hai ki uske neeche wale level ka zimmedaar kaun hai; poora tree kisi ke paas nahi.</p></div>

<h3>Chaar tarah ke DNS servers</h3>
<dl class="terms">
<dt>Stub resolver</dt><dd>Har PC, phone aur router ke andar chhota DNS client. Yeh ek sawaal poochta hai aur final jawab expect karta hai.</dd>
<dt>Recursive resolver</dt><dd>Woh server jo client mein configured hai (DHCP option 6, hamare lab mein 10.1.100.53). Yeh mehnat karta hai: tree mein chalta hai, jawab ikattha karta hai, cache karta hai.</dd>
<dt>Root aur TLD servers</dt><dd>Root 13 named server identities (a se m) serve karti hain jo duniya bhar mein sainkdon anycast instances ke roop mein chalti hain. Unhe www.corp.example nahi pata; unhe pata hai <code>example</code> kaun chalata hai. TLD servers ko pata hai <code>corp.example</code> ke liye authoritative kaun hai.</dd>
<dt>Authoritative server</dt><dd>Domain ka asli <b>zone</b> (records) rakhta hai aur uske liye definitive jawab deta hai.</dd>
</dl>

<h3>Recursive vs iterative queries</h3>
<p>Yeh do shabd batate hain <b>kaam kaun karta hai</b>:</p>
<ul>
<li><b>Recursive query</b> kehti hai "mujhe final answer do ya error". Clients apne resolver ko recursive queries bhejte hain. Resolver ko jawab dhoondhna padta hai.</li>
<li><b>Iterative query</b> kehti hai "jo best pata hai woh batao". Resolver root, TLD aur authoritative servers ko iterative queries bhejta hai. Har ek ya to record deta hai ya <b>referral</b> ("mujhe nahi pata, in servers se poocho").</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Recursive aur iterative DNS resolution">
<rect x="10" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="180" y="100" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="125" text-anchor="middle" class="svg-ink" font-size="13">Resolver</text>
<rect x="450" y="10" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="33" text-anchor="middle" class="svg-ink" font-size="13">Root</text>
<rect x="450" y="100" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="123" text-anchor="middle" class="svg-ink" font-size="13">example TLD</text>
<rect x="450" y="190" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="213" text-anchor="middle" class="svg-ink" font-size="13">corp.example auth</text>
<line x1="100" y1="120" x2="180" y2="120" stroke="#64748b" stroke-width="2"/><text x="140" y="95" text-anchor="middle" class="svg-accent" font-size="12">1 recursive</text><text x="140" y="160" text-anchor="middle" class="svg-accent" font-size="12">8 jawab</text>
<line x1="300" y1="110" x2="450" y2="28" stroke="#64748b" stroke-width="2"/><text x="360" y="55" class="svg-muted" font-size="12">2-3 referral</text>
<line x1="300" y1="120" x2="450" y2="118" stroke="#64748b" stroke-width="2"/><text x="360" y="112" class="svg-muted" font-size="12">4-5 referral</text>
<line x1="300" y1="130" x2="450" y2="208" stroke="#64748b" stroke-width="2"/><text x="360" y="190" class="svg-muted" font-size="12">6-7 A record</text>
</svg><p class="cap">Client ek baar poochta hai (recursive); resolver iterative queries se tree mein chalta hai aur har step cache karta hai.</p></div>

<div class="eg"><p><b>Worked example: pehli baar www.corp.example resolve karna.</b> (1) PC1 10.1.100.53 se recursively poochta hai. (2) Resolver ek root server se poochta hai; (3) root use <code>example</code> TLD servers ki taraf refer karta hai. (4) Woh TLD server se poochta hai; (5) TLD use ns1.corp.example ki taraf refer karta hai. (6) Woh ns1.corp.example se poochta hai; (7) ns1 jawab deta hai "A 203.0.113.80, TTL 3600". (8) Resolver PC1 ko jawab lautata hai aur cache karta hai. Paanch minute baad PC2 same naam poochta hai: resolver seedha cache se lagbhag ek millisecond mein jawab deta hai, non-authoritative mark karke.</p></div>

<h3>TTL aur caching</h3>
<p>Har record ek <b>TTL (time to live)</b> seconds mein carry karta hai, jo zone owner chunta hai. Resolvers aur clients jawab ko utni der cache kar sakte hain. Caching ki wajah se DNS tez hai aur poore internet tak scale hota hai, aur isi wajah se changes mein time lagta hai: agar record ka TTL 86400 (ek din) tha, to change ke baad kuch users ko ek din tak purana address dikh sakta hai. Fail hue lookups bhi cache hote hain (<b>negative caching</b>), zone ke SOA record mein set period ke liye.</p>
<p>Caches kai layers par hote hain: resolver, operating system (Windows DNS Client service; Linux par systemd-resolved), aur aksar browser. Isiliye "naya address ab bhi kaam nahi karta" ka fix aksar <code>ipconfig /flushdns</code> hota hai, saath mein un resolvers par TTL khatam hone ka wait jo aapke control mein nahi.</p>

<h3>Transport</h3>
<p>Normal queries <b>UDP 53</b> use karti hain: ek chhota sawaal, ek chhota jawab, koi handshake nahi. <b>TCP 53</b> primary aur secondary authoritative servers ke beech <b>zone transfers</b> ke liye use hota hai, aur jab jawab UDP ke liye bahut bada ho (server truncated flag set karta hai aur client TCP par retry karta hai). Firewalls aur ACLs ko dono allow karne chahiye.</p>

<div class="warn"><p><b>Common galtiyan.</b> Resolver ko "the DNS" kehna aur maan lena ki uske paas saare records hain; uske paas cache hai aur poochna aata hai. Change ke <i>waqt hi</i> TTL kam karna (bahut der ho chuki; ek din pehle kam karo). Firewall se sirf UDP 53 allow karna aur bade responses ya zone transfers tod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Client se resolver = recursive; resolver se root/TLD/authoritative = iterative. DNS queries ke liye UDP 53 aur zone transfers aur bade replies ke liye TCP 53 use karta hai. Client jo DNS server use karta hai woh DHCP option 6 ya static configuration se aata hai.</p></div>

<div class="scn"><h4>Migration jo aadha chala</h4><p>Ek company ne raat 10 baje apna web portal naye data center mein shift kiya aur A record update kiya. Subah tak head office ka staff naye server tak pahunch raha tha, lekin branch users purane par ja rahe the, jo ab band tha. Purane record ka TTL 86400 tha; branch resolvers ne use shaam 7 baje cache kiya tha aur agle din shaam 7 baje tak rakhte. Team ne branch resolvers ka forwarder head office par point kiya aur unke caches flush kiye, aur change template mein ek rule likha: kisi bhi move se 48 ghante pehle TTL 300 seconds kar do.</p><p><b>Seekh:</b> DNS changes utne hi tez hain jitna purane record ka TTL allow karta hai.</p></div>

<div class="iv"><p class="q">"Recursive aur iterative DNS query mein farak samjhao."</p><p>Recursive query poora jawab maangti hai; clients ise apne resolver ko bhejte hain, jise record ya error lautana hi padta hai. Iterative query best available information maangti hai; resolver ise root, TLD aur authoritative servers ko bhejta hai, tree mein neeche referrals follow karte hue. Caching aur TTL add karo: resolver har jawab uske TTL tak store karta hai, jisse repeat lookups tez hote hain aur yeh bhi samajh aata hai ki changes dheere kyun failte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DNS names ek tree banate hain jo right se left padha jaata hai: root, TLD, domain, subdomain, host.</li>
<li>Stub resolvers recursive resolver se poochte hain; woh root, TLD aur authoritative servers se iteratively poochta hai.</li>
<li>Authoritative servers zones rakhte hain; resolvers caches rakhte hain.</li>
<li>TTL tay karta hai jawab kitni der cache rahega; planned changes se pehle ise kam karo.</li>
<li>Queries ke liye UDP 53; zone transfers aur bade jawabon ke liye TCP 53.</li>
</ul></div>
`}};export{e as default};