var e={id:`processing`,h:{en:`Top-down, first match and the implicit deny`,hi:`Top-down, first match aur implicit deny`},body:{en:`
<p>Go back to the society gate guard. Suppose his clipboard says "1. Residents: allow. 2. Flat 402: deny, renovation noise complaint." The resident of flat 402 walks up. Rule 1 matches (he is a resident), so he walks in, and rule 2 is never read. The guard is not being careless; that is simply how the list works. <b>Order is policy.</b> This chapter teaches you to read an ACL the way the router does, so you can predict exactly what happens to any packet.</p>

<h3>The three rules of ACL processing</h3>
<ol>
<li><b>Top-down.</b> The router compares the packet with the entries in sequence-number order, lowest first.</li>
<li><b>First match wins.</b> As soon as one entry matches, the router applies that entry's action (permit or deny) and <b>stops</b>. Later entries are ignored for that packet, even if they would also match.</li>
<li><b>Implicit deny.</b> If the packet reaches the end without matching anything, it is denied by an invisible <code>deny any</code> (for extended lists, think of it as <code>deny ip any any</code>). It does not appear in <code>show access-lists</code> and it has no counter.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="ACL processing flow">
<rect x="20" y="110" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="70" y="137" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="150" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="205" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 10</text><text x="205" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="290" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="345" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 20</text><text x="345" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="430" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="485" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 30</text><text x="485" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="555" y="105" width="80" height="54" rx="8" fill="#fed7aa"/><text x="595" y="128" text-anchor="middle" class="svg-ink" font-size="12">implicit</text><text x="595" y="145" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<line x1="120" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/><line x1="260" y1="132" x2="290" y2="132" stroke="#64748b" stroke-width="2"/><line x1="400" y1="132" x2="430" y2="132" stroke="#64748b" stroke-width="2"/><line x1="540" y1="132" x2="555" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="275" y="124" text-anchor="middle" class="svg-muted" font-size="12">no</text><text x="415" y="124" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<line x1="205" y1="154" x2="205" y2="200" stroke="#64748b" stroke-width="2"/><line x1="345" y1="154" x2="345" y2="200" stroke="#64748b" stroke-width="2"/><line x1="485" y1="154" x2="485" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="200" width="390" height="44" rx="8" fill="#bbf7d0"/><text x="345" y="227" text-anchor="middle" class="svg-ink" font-size="13">yes: apply permit or deny and STOP</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="14">Top-down, first match, then stop</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Nothing matched? The invisible last line drops the packet.</text>
</svg><p class="cap">The router walks the list in order. The first matching entry decides; the implicit deny catches everything else.</p></div>

<h3>Why order matters: specific before general</h3>
<p>Because the first match wins, a <b>general</b> entry placed above a <b>specific</b> one hides it forever. The specific entry is called <b>shadowed</b>: it can never match anything. The rule of thumb is: <b>most specific entries at the top, broad entries at the bottom</b>. A host entry goes above its subnet, a subnet above its supernet, and <code>permit any</code> (if you need it) goes last.</p>
<pre class="code"><span class="c">! WRONG order: line 20 is shadowed by line 10</span>
access-list 20 permit 10.1.0.0 0.0.255.255
access-list 20 deny   host 10.1.5.99
<span class="c">! RIGHT order: the exception first, the rule second</span>
access-list 21 deny   host 10.1.5.99
access-list 21 permit 10.1.0.0 0.0.255.255</pre>
<p>In ACL 20, host 10.1.5.99 is inside 10.1.0.0/16, so line 10 permits it and line 20 never gets a chance. ACL 21 does what the policy intended.</p>

<h3>The implicit deny: friend and trap</h3>
<p>The implicit deny is a safe default: anything you did not think of is blocked. But it is also the number one cause of ACL outages, because people write a list that only denies one thing and forget that everything else is now denied too. A list with only <code>deny</code> entries blocks <b>all</b> traffic on that interface. That is why most "block X" lists end with <code>permit any</code> (standard) or <code>permit ip any any</code> (extended).</p>
<p>It also silently blocks traffic you forgot exists: OSPF hellos, DHCP relay, DNS replies, the return half of TCP sessions. Chapter 11 shows the classic "ACL kills OSPF" ticket.</p>
<p>Many engineers add an <b>explicit</b> <code>deny ip any any log</code> at the end. It behaves the same as the implicit deny, but it shows up in the output with a match counter and generates log messages, so you can see what is being dropped.</p>

<h3>Two special cases worth knowing</h3>
<ul>
<li><b>An ACL referenced but not defined</b> (or defined with no entries) on an IPv4 interface filters nothing: all traffic passes. The implicit deny only exists once the list has at least one entry. As soon as you type the first line, the implicit deny comes to life, which can cut traffic mid-change. Build the list first, then apply it; or apply it last.</li>
<li><b>Remarks</b> (<code>access-list 10 remark ...</code> or <code>remark ...</code> inside a named list) are comments. They never match packets. Use them; the next engineer will thank you.</li>
</ul>

<div class="eg"><p><b>Worked example: trace four packets.</b> HQ in the named-ACL lab starts with this list inbound on Gi0/1:</p>
<pre class="out">Extended IP access list BRANCH-IN
    10 permit tcp 10.50.0.0 0.0.255.255 host 10.60.1.25 eq smtp
    20 deny ip 10.50.8.0 0.0.0.255 any
    30 permit ip 10.50.0.0 0.0.255.255 any</pre>
<p>(a) Staff PC 10.50.1.10 pings web server 10.60.1.80: line 10 no (not TCP 25), line 20 no (not 10.50.8.x), line 30 yes: <b>permit</b>. (b) Contractor 10.50.8.10 sends mail to 10.60.1.25 port 25: line 10 matches first: <b>permit</b>. Contractors can send mail even though line 20 denies them, because line 10 is above it. (c) Contractor browses 10.60.1.80 port 80: line 10 no, line 20 yes: <b>deny</b>. (d) A packet from 192.0.2.50 (not the branch at all): no line matches, so the <b>implicit deny</b> drops it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding a new permit with <code>access-list 110 permit ...</code> to fix a problem, when the list already contains a broad deny above it. Numbered entries typed this way go to the bottom, below the deny, so the new permit never matches. Chapter 8 shows how to insert with sequence numbers.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam items love "which packets are permitted?" with a host deny placed below a subnet permit. Walk the list line by line and stop at the first match. Also remember: an ACL containing only deny statements denies everything.</p></div>

<div class="scn"><h4>The printer rule that never worked</h4><p>A school's network admin was asked to block one printer, 10.20.4.200, from the internet because it was sending spam. He added <code>access-list 30 deny host 10.20.4.200</code> to the existing ACL 30, which already held <code>permit 10.20.0.0 0.0.255.255</code>. Spam continued. <code>show access-lists 30</code> showed the permit line with thousands of matches and the new deny line with zero. The new line had gone to the end, below the broad permit. He recreated the list with the host deny first and the counters confirmed hits within a minute.</p><p><b>Lesson:</b> zero matches on a line you expect to be busy usually means an earlier line is catching the traffic first.</p></div>

<div class="iv"><p class="q">"Walk me through how a router processes an ACL."</p><p>Strong answer: entries are checked top-down in sequence order; the first match applies its permit or deny and processing stops; if nothing matches, the implicit deny drops the packet. Then add the consequences: put specific entries before general ones, end a "block X" list with a permit, remember that the implicit deny also catches routing protocols and return traffic, and use an explicit <code>deny ip any any log</code> when you want to see what is dropped.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs are processed top-down; the first matching entry decides and processing stops.</li>
<li>Every IPv4 ACL ends with an invisible deny any that has no counter.</li>
<li>Put specific entries above general ones, or they are shadowed and never match.</li>
<li>A list with only deny entries blocks everything; add a permit for the rest.</li>
<li>An undefined or empty ACL applied to an IPv4 interface filters nothing.</li>
</ul></div>
`,hi:`
<p>Society gate ke guard par wapas chalo. Maan lo uske clipboard par likha hai "1. Residents: allow. 2. Flat 402: deny, renovation ke shor ki complaint." Flat 402 ka resident aata hai. Rule 1 match hota hai (woh resident hai), isliye woh andar chala jaata hai, aur rule 2 kabhi padha hi nahi jaata. Guard laaparwah nahi hai; list aise hi kaam karti hai. <b>Order hi policy hai.</b> Yeh chapter aapko ACL waise padhna sikhata hai jaise router padhta hai, taaki aap kisi bhi packet ke saath kya hoga, bilkul sahi predict kar sako.</p>

<h3>ACL processing ke teen rules</h3>
<ol>
<li><b>Top-down.</b> Router packet ko entries se sequence-number order mein compare karta hai, sabse chhote number se shuru karke.</li>
<li><b>First match jeetta hai.</b> Jaise hi ek entry match hoti hai, router us entry ka action (permit ya deny) laga deta hai aur <b>ruk jaata hai</b>. Us packet ke liye baad ki entries ignore hoti hain, chahe woh bhi match karti hon.</li>
<li><b>Implicit deny.</b> Agar packet bina kuch match kiye end tak pahunch jaaye, to ek invisible <code>deny any</code> use deny kar deta hai (extended lists ke liye ise <code>deny ip any any</code> samjho). Yeh <code>show access-lists</code> mein nahi dikhta aur iska koi counter nahi hota.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="ACL processing flow">
<rect x="20" y="110" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="70" y="137" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="150" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="205" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 10</text><text x="205" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="290" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="345" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 20</text><text x="345" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="430" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="485" y="130" text-anchor="middle" class="svg-ink" font-size="13">Entry 30</text><text x="485" y="146" text-anchor="middle" class="svg-muted" font-size="12">match?</text>
<rect x="555" y="105" width="80" height="54" rx="8" fill="#fed7aa"/><text x="595" y="128" text-anchor="middle" class="svg-ink" font-size="12">implicit</text><text x="595" y="145" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<line x1="120" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/><line x1="260" y1="132" x2="290" y2="132" stroke="#64748b" stroke-width="2"/><line x1="400" y1="132" x2="430" y2="132" stroke="#64748b" stroke-width="2"/><line x1="540" y1="132" x2="555" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="275" y="124" text-anchor="middle" class="svg-muted" font-size="12">nahi</text><text x="415" y="124" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<line x1="205" y1="154" x2="205" y2="200" stroke="#64748b" stroke-width="2"/><line x1="345" y1="154" x2="345" y2="200" stroke="#64748b" stroke-width="2"/><line x1="485" y1="154" x2="485" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="200" width="390" height="44" rx="8" fill="#bbf7d0"/><text x="345" y="227" text-anchor="middle" class="svg-ink" font-size="13">haan: permit ya deny lagao aur RUK jao</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="14">Top-down, first match, phir stop</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Kuch match nahi hua? Invisible aakhri line packet drop karti hai.</text>
</svg><p class="cap">Router list ko order mein chalta hai. Pehli matching entry decide karti hai; baaki sab implicit deny pakad leta hai.</p></div>

<h3>Order kyun matter karta hai: specific pehle, general baad mein</h3>
<p>Kyunki first match jeetta hai, isliye <b>specific</b> entry ke upar rakhi <b>general</b> entry use hamesha ke liye chhupa deti hai. Specific entry ko <b>shadowed</b> kehte hain: woh kabhi kuch match nahi kar sakti. Rule of thumb: <b>sabse specific entries upar, broad entries neeche</b>. Host entry apne subnet ke upar, subnet apne supernet ke upar, aur <code>permit any</code> (agar chahiye) sabse aakhir mein.</p>
<pre class="code"><span class="c">! GALAT order: line 20 ko line 10 ne shadow kar diya</span>
access-list 20 permit 10.1.0.0 0.0.255.255
access-list 20 deny   host 10.1.5.99
<span class="c">! SAHI order: exception pehle, rule baad mein</span>
access-list 21 deny   host 10.1.5.99
access-list 21 permit 10.1.0.0 0.0.255.255</pre>
<p>ACL 20 mein host 10.1.5.99 10.1.0.0/16 ke andar hai, isliye line 10 use permit kar deti hai aur line 20 ko mauka hi nahi milta. ACL 21 wahi karta hai jo policy chahti thi.</p>

<h3>Implicit deny: dost bhi aur trap bhi</h3>
<p>Implicit deny ek safe default hai: jo aapne nahi socha, woh block hai. Par yahi ACL outages ki number one wajah bhi hai, kyunki log aisi list likhte hain jo sirf ek cheez deny karti hai aur bhool jaate hain ki ab baaki sab bhi deny ho gaya. Sirf <code>deny</code> entries wali list us interface par <b>saara</b> traffic block kar deti hai. Isliye zyada tar "X block karo" lists <code>permit any</code> (standard) ya <code>permit ip any any</code> (extended) par khatam hoti hain.</p>
<p>Yeh chupchaap woh traffic bhi block karta hai jiske hone ka aapko yaad hi nahi: OSPF hellos, DHCP relay, DNS replies, TCP sessions ka return half. Chapter 11 classic "ACL ne OSPF maar diya" ticket dikhata hai.</p>
<p>Kai engineers end mein ek <b>explicit</b> <code>deny ip any any log</code> jodte hain. Yeh implicit deny jaisa hi behave karta hai, par output mein match counter ke saath dikhta hai aur log messages banata hai, taaki aap dekh sako ki kya drop ho raha hai.</p>

<h3>Do special cases jo jaanne layak hain</h3>
<ul>
<li><b>ACL jo reference hua par define nahi hua</b> (ya bina entries ke define hua), IPv4 interface par kuch filter nahi karta: saara traffic pass hota hai. Implicit deny tabhi exist karta hai jab list mein kam se kam ek entry ho. Jaise hi aap pehli line type karte ho, implicit deny zinda ho jaata hai, jo change ke beech mein traffic kaat sakta hai. Pehle list banao, phir apply karo; ya apply sabse aakhir mein karo.</li>
<li><b>Remarks</b> (<code>access-list 10 remark ...</code> ya named list ke andar <code>remark ...</code>) comments hain. Yeh kabhi packets match nahi karte. Inhe use karo; agla engineer aapka shukriya karega.</li>
</ul>

<div class="eg"><p><b>Worked example: chaar packets trace karo.</b> Named-ACL lab mein HQ Gi0/1 par inbound yeh list se shuru hota hai:</p>
<pre class="out">Extended IP access list BRANCH-IN
    10 permit tcp 10.50.0.0 0.0.255.255 host 10.60.1.25 eq smtp
    20 deny ip 10.50.8.0 0.0.0.255 any
    30 permit ip 10.50.0.0 0.0.255.255 any</pre>
<p>(a) Staff PC 10.50.1.10 web server 10.60.1.80 ko ping karta hai: line 10 nahi (TCP 25 nahi), line 20 nahi (10.50.8.x nahi), line 30 haan: <b>permit</b>. (b) Contractor 10.50.8.10 10.60.1.25 ke port 25 par mail bhejta hai: line 10 pehle match hoti hai: <b>permit</b>. Contractors mail bhej sakte hain jabki line 20 unhe deny karti hai, kyunki line 10 uske upar hai. (c) Contractor 10.60.1.80 port 80 browse karta hai: line 10 nahi, line 20 haan: <b>deny</b>. (d) 192.0.2.50 se ek packet (branch ka hai hi nahi): koi line match nahi hoti, isliye <b>implicit deny</b> use drop kar deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Problem fix karne ke liye <code>access-list 110 permit ...</code> se naya permit jodna, jabki list mein uske upar pehle se ek broad deny hai. Is tarah type ki gayi numbered entries neeche jaati hain, deny ke neeche, isliye naya permit kabhi match nahi karta. Chapter 8 dikhata hai ki sequence numbers se insert kaise karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam items ko "kaunse packets permit hain?" bahut pasand hai, jahan host deny subnet permit ke neeche rakha hota hai. List ko line by line chalo aur pehle match par ruko. Yeh bhi yaad rakho: sirf deny statements wala ACL sab kuch deny karta hai.</p></div>

<div class="scn"><h4>Printer ka rule jo kabhi chala hi nahi</h4><p>Ek school ke network admin ko ek printer, 10.20.4.200, ko internet se block karne ko kaha gaya kyunki woh spam bhej raha tha. Usne existing ACL 30 mein <code>access-list 30 deny host 10.20.4.200</code> jod diya, jismein pehle se <code>permit 10.20.0.0 0.0.255.255</code> tha. Spam chalta raha. <code>show access-lists 30</code> ne permit line par hazaaron matches dikhaye aur nayi deny line par zero. Nayi line end mein chali gayi thi, broad permit ke neeche. Usne list ko host deny pehle rakh kar dobara banaya aur ek minute ke andar counters ne hits confirm kar diye.</p><p><b>Seekh:</b> jis line ko busy hona chahiye us par zero matches ka matlab aam taur par yeh hai ki koi pehle wali line traffic ko pehle pakad rahi hai.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki router ACL ko kaise process karta hai."</p><p>Strong answer: entries sequence order mein top-down check hoti hain; pehla match apna permit ya deny lagata hai aur processing ruk jaati hai; kuch match na ho to implicit deny packet drop karta hai. Phir consequences jodo: specific entries general se pehle rakho, "X block karo" list ko permit se khatam karo, yaad rakho ki implicit deny routing protocols aur return traffic ko bhi pakadta hai, aur jab dekhna ho ki kya drop ho raha hai to explicit <code>deny ip any any log</code> use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs top-down process hote hain; pehli matching entry decide karti hai aur processing ruk jaati hai.</li>
<li>Har IPv4 ACL ek invisible deny any par khatam hota hai jiska koi counter nahi.</li>
<li>Specific entries general ke upar rakho, warna woh shadowed ho jaati hain aur kabhi match nahi karti.</li>
<li>Sirf deny entries wali list sab block karti hai; baaki ke liye permit jodo.</li>
<li>IPv4 interface par apply kiya gaya undefined ya empty ACL kuch filter nahi karta.</li>
</ul></div>
`}};export{e as default};