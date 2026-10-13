var e={id:`igp-ldp-auth`,h:{en:`Protecting IGP and LDP sessions: authentication and key chains`,hi:`IGP aur LDP sessions ko protect karna: authentication aur key chains`},body:{en:`
<p><b>Same problem, different protocols.</b> The SP core runs an IGP (IS-IS or OSPF) and LDP or RSVP-TE for labels. If a rogue device on a core link could form an adjacency or send fake updates, it could attract traffic or break routing. Authentication makes a router prove it holds a shared secret before its hellos, LSPs or label messages are believed. This is a cheap, high-value control in the core.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Key chain</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">key id, string, lifetime</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Interface or area</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">apply it</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hello / LSP</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">signed</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Neighbor</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">verifies</text></svg><p class="cap">A key chain feeds authentication; the neighbor verifies each message.</p></div>
<h3>Key chains and rollover</h3>
<p>A <b>key chain</b> holds several keys, each with an ID, a secret and optional accept and send lifetimes. Using lifetimes you can roll the key without an outage: first accept the new key, then start sending it, then retire the old one. Without a key chain, changing a static password on two routers at nearly the same moment causes a short flap, which in the core can be a real outage. Plan rollovers.</p>
<h3>IS-IS authentication</h3>
<p>IS-IS can authenticate hello packets (per interface and level, so adjacencies need the right key), and LSP and SNP packets (per level, so the whole database is protected). Hello authentication stops a rogue from forming an adjacency; domain or area authentication on LSPs and SNPs stops forged database updates. Classic IS-IS authentication is clear text or HMAC-MD5; IOS XE and XR also support HMAC-SHA with key chains.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE style</span>
key chain KC-ISIS
 key 1
  key-string PLACEHOLDER-KEY-1
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/0/0
 isis authentication mode md5 level-2
 isis authentication key-chain KC-ISIS level-2
router isis CORE
 authentication mode md5 level-2
 authentication key-chain KC-ISIS level-2</pre>
<p>Check the exact algorithm names for your release; some releases offer HMAC-SHA on the key chain while the mode keyword may differ. On Junos the matching idea is <code>hello-authentication-key</code> per interface and level and <code>authentication-key</code> for LSPs, which you will meet in the jncissp-isis module.</p>
<h3>OSPF authentication</h3>
<p>OSPFv2 supports simple password (do not use), MD5 and, in modern releases, HMAC-SHA through key chains (RFC 7474). OSPFv3 uses IPsec or the authentication trailer (RFC 7166). Apply it per interface or per area. Mismatched keys keep the neighbor stuck in a state such as Init or Down, with log messages about authentication failure.</p>
<h3>LDP authentication</h3>
<p>LDP discovers neighbors with UDP hellos (port 646) and exchanges labels over a TCP session (port 646). The LDP TCP session can use the same MD5 TCP option as BGP. It is configured <b>per neighbor LDP router ID</b>, not per interface. Hello discovery is not protected by this option, so combine it with an ACL that limits who may send LDP to the router, and with CoPP or LPTS. If the keys differ, the TCP session never forms and the neighbor stays discovered but without a session.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE: the neighbor is identified by its LDP router ID</span>
mpls ldp neighbor 192.0.2.2 password PLACEHOLDER-KEY-1
<span class="c">! IOS XR</span>
mpls ldp
 neighbor 192.0.2.2 password encrypted PLACEHOLDER-KEY-1
<span class="c">! Verify</span>
show mpls ldp neighbor
show mpls ldp discovery</pre>
<table class="cmp"><tr><th>Protocol</th><th>What is authenticated</th><th>Mismatch symptom</th></tr><tr><td>IS-IS</td><td>Hellos, LSPs, SNPs</td><td>No adjacency, or LSPs ignored</td></tr><tr><td>OSPF</td><td>Hellos and LSAs on the interface or area</td><td>Neighbor stuck, auth failure logged</td></tr><tr><td>LDP</td><td>TCP session, per neighbor ID</td><td>Neighbor discovered but no session</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Configuring the key on one router first on a live core. Roll out with key chain lifetimes or in a window, and keep out-of-band access ready.</p></div>
<div class="exam"><p><b>Exam trap.</b> LDP password is per neighbor LDP ID (the neighbor's router ID), and it protects the TCP session, not UDP hellos. IS-IS hello authentication is per interface and level; LSP authentication is per level.</p></div>
<div class="scn"><h4>The adjacency that formed too easily</h4><p>During an audit, a provider found that a spare port in a metro ring had no IS-IS authentication, so any router plugged in with level 2 enabled would form an adjacency. They added key-chain-based hello and LSP authentication at the next window and shut unused ports. A later test with a lab device and a wrong key showed the adjacency stuck down, which is the desired result.</p><p><b>Lesson:</b> Authentication is cheap insurance for the core.</p></div>
<div class="iv"><p class="q">"How do you roll an IGP key without an outage?"</p><p>I use a key chain with overlapping lifetimes: the new key is accepted first, then sent, then the old key is retired, so there is always a key both sides understand. I schedule it in a window, verify adjacencies after each step and keep out-of-band access.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Authenticate IS-IS, OSPF and LDP in the core to stop rogue adjacencies and forged updates.</li>
<li>Key chains with lifetimes allow safe rollover.</li>
<li>IS-IS: hellos per interface and level; LSPs and SNPs per level.</li>
<li>LDP: MD5 on the TCP session, per neighbor LDP ID; hellos are not covered.</li>
<li>Pair authentication with ACLs and CoPP or LPTS.</li></ul></div>
`,hi:`
<p><b>Wahi problem, alag protocols.</b> SP core IGP (IS-IS ya OSPF) aur labels ke liye LDP ya RSVP-TE chalata hai. Agar core link par koi rogue device adjacency bana sake ya fake updates bheje, to woh traffic kheench sakta hai ya routing tod sakta hai. Authentication router se shared secret ka saboot maangta hai, tab uske hellos, LSPs ya label messages par bharosa hota hai. Core mein yeh sasta aur high-value control hai.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Key chain</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">key id, string, lifetime</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Interface ya area</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">apply karo</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hello / LSP</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">signed</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Neighbor</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">verify karta hai</text></svg><p class="cap">Key chain authentication ko feed karti hai; neighbor har message verify karta hai.</p></div>
<h3>Key chains aur rollover</h3>
<p><b>Key chain</b> mein kai keys hoti hain, har ek ka ID, secret aur optional accept aur send lifetimes. Lifetimes se aap bina outage ke key roll kar sakte ho: pehle nayi key accept karo, phir bhejna shuru karo, phir purani retire karo. Key chain ke bina do routers par static password lagbhag ek hi pal mein badalne se chhota flap hota hai, jo core mein asli outage ban sakta hai. Rollover plan karo.</p>
<h3>IS-IS authentication</h3>
<p>IS-IS hello packets (per interface aur level, isliye adjacencies ko sahi key chahiye) aur LSP aur SNP packets (per level, isliye poora database protected) authenticate kar sakta hai. Hello authentication rogue ko adjacency banane se rokta hai; LSPs aur SNPs par domain ya area authentication forged database updates rokta hai. Classic IS-IS authentication clear text ya HMAC-MD5 hai; IOS XE aur XR HMAC-SHA ko key chains ke saath bhi support karte hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE style</span>
key chain KC-ISIS
 key 1
  key-string PLACEHOLDER-KEY-1
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/0/0
 isis authentication mode md5 level-2
 isis authentication key-chain KC-ISIS level-2
router isis CORE
 authentication mode md5 level-2
 authentication key-chain KC-ISIS level-2</pre>
<p>Apni release ke liye exact algorithm names check karo; kuch releases key chain par HMAC-SHA dete hain jabki mode keyword alag ho sakta hai. Junos mein matching idea per interface aur level <code>hello-authentication-key</code> aur LSPs ke liye <code>authentication-key</code> hai, jo aap jncissp-isis module mein dekhoge.</p>
<h3>OSPF authentication</h3>
<p>OSPFv2 simple password (use mat karo), MD5 aur modern releases mein key chains ke zariye HMAC-SHA (RFC 7474) support karta hai. OSPFv3 IPsec ya authentication trailer (RFC 7166) use karta hai. Per interface ya per area lagao. Key mismatch neighbor ko Init ya Down jaisi state mein atkaye rakhta hai aur authentication failure ke log messages aate hain.</p>
<h3>LDP authentication</h3>
<p>LDP neighbors UDP hellos (port 646) se discover karta hai aur labels TCP session (port 646) par exchange karta hai. LDP TCP session BGP wala hi MD5 TCP option use kar sakta hai. Yeh <b>per neighbor LDP router ID</b> configure hota hai, per interface nahi. Hello discovery is option se protected nahi hoti, isliye ise ACL ke saath combine karo jo limit kare ki router ko LDP kaun bhej sakta hai, aur CoPP ya LPTS ke saath. Keys alag hon to TCP session kabhi nahi banta aur neighbor discovered rehta hai par session nahi hota.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE: the neighbor is identified by its LDP router ID</span>
mpls ldp neighbor 192.0.2.2 password PLACEHOLDER-KEY-1
<span class="c">! IOS XR</span>
mpls ldp
 neighbor 192.0.2.2 password encrypted PLACEHOLDER-KEY-1
<span class="c">! Verify</span>
show mpls ldp neighbor
show mpls ldp discovery</pre>
<table class="cmp"><tr><th>Protocol</th><th>Kya authenticate hota hai</th><th>Mismatch symptom</th></tr><tr><td>IS-IS</td><td>Hellos, LSPs, SNPs</td><td>Adjacency nahi, ya LSPs ignore</td></tr><tr><td>OSPF</td><td>Interface ya area par hellos aur LSAs</td><td>Neighbor atka, auth failure log</td></tr><tr><td>LDP</td><td>TCP session, per neighbor ID</td><td>Neighbor discovered par session nahi</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Live core mein pehle sirf ek router par key lagana. Key chain lifetimes ke saath ya window mein roll out karo, aur out-of-band access taiyar rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> LDP password per neighbor LDP ID (neighbor ka router ID) hota hai, aur yeh TCP session protect karta hai, UDP hellos nahi. IS-IS hello authentication per interface aur level hai; LSP authentication per level.</p></div>
<div class="scn"><h4>Woh adjacency jo bahut aasani se ban gayi</h4><p>Audit mein ek provider ko pata chala ki metro ring ke ek spare port par IS-IS authentication nahi thi, isliye level 2 enabled koi bhi router lagane par adjacency ban jaati. Unhone agli window mein key-chain-based hello aur LSP authentication lagayi aur unused ports shut kiye. Baad ke test mein lab device galat key ke saath adjacency down hi rahi, jo wanted result hai.</p><p><b>Lesson:</b> Authentication core ke liye sasta insurance hai.</p></div>
<div class="iv"><p class="q">"IGP key bina outage ke kaise roll karte ho?"</p><p>Main overlapping lifetimes wali key chain use karta hoon: nayi key pehle accept hoti hai, phir bheji jaati hai, phir purani retire hoti hai, isliye hamesha ek key hoti hai jo dono sides samajhti hain. Window mein schedule karta hoon, har step ke baad adjacencies verify karta hoon aur out-of-band access rakhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Core mein IS-IS, OSPF aur LDP authenticate karo taaki rogue adjacencies aur forged updates rukein.</li>
<li>Lifetimes wali key chains safe rollover deti hain.</li>
<li>IS-IS: hellos per interface aur level; LSPs aur SNPs per level.</li>
<li>LDP: TCP session par MD5, per neighbor LDP ID; hellos covered nahi.</li>
<li>Authentication ko ACLs aur CoPP ya LPTS ke saath jodo.</li></ul></div>
`}};export{e as default};