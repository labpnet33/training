var e={id:`twice-nat`,h:{en:`Twice NAT: translating source and destination together`,hi:`Twice NAT: source aur destination ko saath translate karna`},body:{en:`
<p>Two families move into the same apartment block, and both have a son called Rahul. The watchman solves it with nicknames: to the first family, the other boy is "Rahul from 7B"; to the second family, the first boy is "Rahul from 3A". Each side speaks to a name that is unique <b>from its own point of view</b>, and the watchman quietly swaps names in both directions. That is <b>twice NAT</b>: one rule that can rewrite the source and the destination of the same packet, and can decide based on where the packet is going.</p>

<h3>The full syntax</h3>
<pre class="code"><span class="c">! Manual (twice) NAT, main keywords</span>
nat (real_ifc,mapped_ifc) [line | after-auto]
    source {static | dynamic} REAL-SRC {MAPPED-SRC | interface}
    [destination static MAPPED-DST REAL-DST]
    [service REAL-SVC MAPPED-SVC]
    [unidirectional] [no-proxy-arp] [route-lookup] [inactive] [description TEXT]</pre>
<p>Read the source part as usual, real then mapped. The destination part is the one that trips everyone: it is <b>mapped first, real second</b>. Think of it from the host on the real side: it sends to the address it knows (the mapped destination), and the ASA rewrites that to where the server really is (the real destination). When the destination is not translated, you write the same object twice, for example <code>destination static VENDOR-NET VENDOR-NET</code>, which simply means "only when going to this destination".</p>

<h3>Use 1: policy NAT, a different source only toward one destination</h3>
<p>A payment vendor at 198.51.100.0/24 allows only 203.0.113.6 through its own firewall. Everyone else should keep using interface PAT. Auto NAT cannot express "toward the vendor"; twice NAT can:</p>
<pre class="code"><span class="c">! Objects</span>
object network VENDOR-NET
 subnet 198.51.100.0 255.255.255.0
object network VENDOR-PAT
 host 203.0.113.6
<span class="c">! Section 1: inside users going to the vendor are PATed to .6</span>
nat (inside,outside) source dynamic INSIDE-NET VENDOR-PAT destination static VENDOR-NET VENDOR-NET</pre>
<p>Because this rule sits in section 1, it is checked before the INSIDE-NET interface PAT in section 2. Traffic to the vendor leaves as 203.0.113.6; traffic anywhere else falls through to the auto NAT rule and leaves as 203.0.113.2.</p>

<h3>Use 2: overlapping networks after a merger</h3>
<p>NK acquires a company whose office network is also 10.0.1.0/24, connected through a new ASA interface named <code>merger</code>. Neither side can renumber quickly. Twice NAT gives each side a unique "nickname" network:</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlapping networks with twice NAT">
<rect x="20" y="80" width="160" height="70" rx="8" fill="#bbf7d0"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="13">NK inside</text><text x="100" y="122" text-anchor="middle" class="svg-muted" font-size="12">real 10.0.1.0/24</text><text x="100" y="140" text-anchor="middle" class="svg-accent" font-size="12">seen as 192.168.101.x</text>
<rect x="250" y="80" width="140" height="70" rx="8" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">twice NAT</text>
<rect x="460" y="80" width="160" height="70" rx="8" fill="#fde68a"/><text x="540" y="104" text-anchor="middle" class="svg-ink" font-size="13">merger site</text><text x="540" y="122" text-anchor="middle" class="svg-muted" font-size="12">real 10.0.1.0/24</text><text x="540" y="140" text-anchor="middle" class="svg-accent" font-size="12">seen as 192.168.201.x</text>
<line x1="180" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">PC1 sends 10.0.1.10 to 192.168.201.20</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">merger host receives 192.168.101.10 to 10.0.1.20</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">both addresses rewritten by one rule</text>
</svg><p class="cap">Each side talks to a unique mapped network; the ASA rewrites source and destination in one step.</p></div>

<pre class="code">object network INSIDE-AS-SEEN
 subnet 192.168.101.0 255.255.255.0
object network MERGER-NET
 subnet 10.0.1.0 255.255.255.0
object network MERGER-AS-SEEN
 subnet 192.168.201.0 255.255.255.0
<span class="c">! source: real INSIDE-NET, mapped INSIDE-AS-SEEN</span>
<span class="c">! destination: mapped MERGER-AS-SEEN, real MERGER-NET</span>
nat (inside,merger) source static INSIDE-NET INSIDE-AS-SEEN destination static MERGER-AS-SEEN MERGER-NET</pre>
<p>PC1 (10.0.1.10) opens a connection to 192.168.201.20. The ASA matches the rule, rewrites the destination to the real 10.0.1.20, rewrites the source to 192.168.101.10, and sends the packet out of <code>merger</code>. The routing table could never decide this on its own (10.0.1.0/24 is also connected on inside), so the ASA uses <b>NAT divert</b>: the rule itself tells it the egress interface. Because both parts are static, merger hosts can also start connections to 192.168.101.x. The ACL on the merger interface must then use real addresses: source 10.0.1.x on their side and the real inside host as destination.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nat detail
Manual NAT Policies (Section 1)
1 (inside) to (merger) source static INSIDE-NET INSIDE-AS-SEEN destination static MERGER-AS-SEEN MERGER-NET
    translate_hits = 14, untranslate_hits = 14
    Source - Origin: 10.0.1.0/24, Translated: 192.168.101.0/24
    <span class="hl">Destination - Origin: 192.168.201.0/24, Translated: 10.0.1.0/24</span></pre>
<p><code>show xlate</code> marks twice NAT entries with the flag <code>T</code>, and static subnet-to-subnet entries also with <code>N</code> (net-to-net).</p>

<h3>The remaining keywords</h3>
<ul>
<li><b>service</b>: adds port matching or port translation to a twice NAT rule, using service objects.</li>
<li><b>unidirectional</b>: a static rule that works only for connections started from the real side; the destination cannot initiate.</li>
<li><b>inactive</b>: keeps the rule in the configuration but switches it off, handy during migrations.</li>
<li><b>description</b>: document why the rule exists; auditors love it.</li>
<li><b>no-proxy-arp</b> and <b>route-lookup</b>: covered in chapter 8 with identity NAT.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Read <code>nat (inside,dmz) source static INSIDE-NET INSIDE-NET destination static DNS-PUBLIC DNS-INTERNAL</code> where DNS-PUBLIC is 198.51.100.53 and DNS-INTERNAL is 10.0.2.53 on dmz. Source unchanged (identity), destination translated: users who query 198.51.100.53 are silently redirected to 10.0.2.53. The destination order is mapped (what users type) first, real second.</p></div>

<div class="warn"><p><b>Common mistake.</b> Swapping the destination objects, writing real before mapped. The rule is accepted, <code>show nat</code> shows it, but it never matches because hosts never send to the real remote address. Always ask: which address does my host actually send to? That one goes first.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which NAT type can translate an inside source differently depending on the destination?" Only manual (twice) NAT. Auto NAT has no destination condition. Also: twice NAT rules are in section 1 unless configured with <code>after-auto</code>.</p></div>

<div class="scn"><h4>The vendor who saw the wrong address</h4><p>A vendor whitelisted 203.0.113.6, and the engineer added a twice NAT rule to use it. The vendor still saw 203.0.113.2. <code>show nat</code> revealed the rule had been entered with <code>after-auto</code>, so it sat in section 3, below the INSIDE-NET interface PAT in section 2, which matched first. Removing and re-adding it without <code>after-auto</code> placed it in section 1 and the vendor saw .6.</p><p><b>Lesson:</b> exceptions must be evaluated before the general rule; check the section in <code>show nat</code>.</p></div>

<div class="iv"><p class="q">"Two companies with the same 10.0.1.0/24 must talk. How do you solve it on the ASA?"</p><p>Twice NAT with static source and destination: our network appears as a unique mapped subnet to them, theirs appears as another unique subnet to us, one rule on the ASA does both rewrites, and NAT divert chooses the egress interface. ACLs use real addresses. Mention DNS or host records must point users at the mapped addresses, and that renumbering is the long-term fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Twice NAT can match and translate source and destination, and ports, in one rule.</li>
<li>Source: real then mapped. Destination: mapped then real.</li>
<li>Same object twice in the destination means "only toward this destination" (policy NAT).</li>
<li>NAT divert picks the egress interface when the rule translates the destination.</li>
<li>Section 1 by default; <code>after-auto</code> moves it to section 3.</li>
</ul></div>
`,hi:`
<p>Ek apartment block mein do families shift hoti hain, aur dono ka ek beta hai jiska naam Rahul hai. Watchman nicknames se ise solve karta hai: pehli family ke liye doosra ladka "7B wala Rahul" hai; doosri family ke liye pehla ladka "3A wala Rahul" hai. Har side ek aise naam se baat karti hai jo <b>uske apne point of view se</b> unique hai, aur watchman chupchaap dono directions mein naam badal deta hai. Yahi <b>twice NAT</b> hai: ek rule jo same packet ka source aur destination dono rewrite kar sakti hai, aur packet kahan ja raha hai uske hisaab se decide kar sakti hai.</p>

<h3>Poora syntax</h3>
<pre class="code"><span class="c">! Manual (twice) NAT, main keywords</span>
nat (real_ifc,mapped_ifc) [line | after-auto]
    source {static | dynamic} REAL-SRC {MAPPED-SRC | interface}
    [destination static MAPPED-DST REAL-DST]
    [service REAL-SVC MAPPED-SVC]
    [unidirectional] [no-proxy-arp] [route-lookup] [inactive] [description TEXT]</pre>
<p>Source part ko hamesha ki tarah padho, pehle real phir mapped. Destination part woh hai jo sabko phansata hai: yeh <b>pehle mapped, phir real</b> hai. Real side ke host ki nazar se socho: woh us address par bhejta hai jo use pata hai (mapped destination), aur ASA use wahan rewrite karta hai jahan server asli mein hai (real destination). Jab destination translate nahi hota, aap same object do baar likhte ho, jaise <code>destination static VENDOR-NET VENDOR-NET</code>, jiska simple matlab hai "sirf jab is destination ki taraf ja rahe ho".</p>

<h3>Use 1: policy NAT, sirf ek destination ki taraf alag source</h3>
<p>198.51.100.0/24 par ek payment vendor apne firewall se sirf 203.0.113.6 allow karta hai. Baaki sab ko interface PAT hi use karte rehna chahiye. Auto NAT "vendor ki taraf" express nahi kar sakta; twice NAT kar sakta hai:</p>
<pre class="code"><span class="c">! Objects</span>
object network VENDOR-NET
 subnet 198.51.100.0 255.255.255.0
object network VENDOR-PAT
 host 203.0.113.6
<span class="c">! Section 1: vendor ki taraf jaane wale inside users .6 par PAT hote hain</span>
nat (inside,outside) source dynamic INSIDE-NET VENDOR-PAT destination static VENDOR-NET VENDOR-NET</pre>
<p>Kyunki yeh rule section 1 mein hai, yeh section 2 ke INSIDE-NET interface PAT se pehle check hoti hai. Vendor ki taraf traffic 203.0.113.6 ban kar nikalta hai; kahin aur ka traffic auto NAT rule par girta hai aur 203.0.113.2 ban kar nikalta hai.</p>

<h3>Use 2: merger ke baad overlapping networks</h3>
<p>NK ek company acquire karta hai jiska office network bhi 10.0.1.0/24 hai, jo <code>merger</code> naam ke naye ASA interface se juda hai. Koi bhi side jaldi renumber nahi kar sakti. Twice NAT har side ko ek unique "nickname" network deta hai:</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlapping networks with twice NAT">
<rect x="20" y="80" width="160" height="70" rx="8" fill="#bbf7d0"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="13">NK inside</text><text x="100" y="122" text-anchor="middle" class="svg-muted" font-size="12">real 10.0.1.0/24</text><text x="100" y="140" text-anchor="middle" class="svg-accent" font-size="12">192.168.101.x dikhta hai</text>
<rect x="250" y="80" width="140" height="70" rx="8" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">twice NAT</text>
<rect x="460" y="80" width="160" height="70" rx="8" fill="#fde68a"/><text x="540" y="104" text-anchor="middle" class="svg-ink" font-size="13">merger site</text><text x="540" y="122" text-anchor="middle" class="svg-muted" font-size="12">real 10.0.1.0/24</text><text x="540" y="140" text-anchor="middle" class="svg-accent" font-size="12">192.168.201.x dikhta hai</text>
<line x1="180" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">PC1 bhejta hai 10.0.1.10 se 192.168.201.20</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">merger host ko milta hai 192.168.101.10 se 10.0.1.20</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">dono addresses ek rule se rewrite</text>
</svg><p class="cap">Har side ek unique mapped network se baat karti hai; ASA ek step mein source aur destination rewrite karta hai.</p></div>

<pre class="code">object network INSIDE-AS-SEEN
 subnet 192.168.101.0 255.255.255.0
object network MERGER-NET
 subnet 10.0.1.0 255.255.255.0
object network MERGER-AS-SEEN
 subnet 192.168.201.0 255.255.255.0
<span class="c">! source: real INSIDE-NET, mapped INSIDE-AS-SEEN</span>
<span class="c">! destination: mapped MERGER-AS-SEEN, real MERGER-NET</span>
nat (inside,merger) source static INSIDE-NET INSIDE-AS-SEEN destination static MERGER-AS-SEEN MERGER-NET</pre>
<p>PC1 (10.0.1.10) 192.168.201.20 par connection kholta hai. ASA rule match karta hai, destination ko real 10.0.1.20 par rewrite karta hai, source ko 192.168.101.10 par rewrite karta hai, aur packet <code>merger</code> se bahar bhejta hai. Routing table yeh khud kabhi decide nahi kar paati (10.0.1.0/24 inside par bhi connected hai), isliye ASA <b>NAT divert</b> use karta hai: rule khud egress interface batati hai. Kyunki dono parts static hain, merger hosts bhi 192.168.101.x par connections shuru kar sakte hain. Tab merger interface ki ACL ko real addresses use karne honge: unki side par source 10.0.1.x aur destination ke roop mein real inside host.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nat detail
Manual NAT Policies (Section 1)
1 (inside) to (merger) source static INSIDE-NET INSIDE-AS-SEEN destination static MERGER-AS-SEEN MERGER-NET
    translate_hits = 14, untranslate_hits = 14
    Source - Origin: 10.0.1.0/24, Translated: 192.168.101.0/24
    <span class="hl">Destination - Origin: 192.168.201.0/24, Translated: 10.0.1.0/24</span></pre>
<p><code>show xlate</code> twice NAT entries ko flag <code>T</code> se mark karta hai, aur static subnet-to-subnet entries ko <code>N</code> (net-to-net) se bhi.</p>

<h3>Baaki keywords</h3>
<ul>
<li><b>service</b>: service objects use karke twice NAT rule mein port matching ya port translation jodta hai.</li>
<li><b>unidirectional</b>: aisi static rule jo sirf real side se shuru hue connections ke liye kaam kare; destination initiate nahi kar sakta.</li>
<li><b>inactive</b>: rule ko configuration mein rakhta hai lekin band kar deta hai, migrations mein kaam ka.</li>
<li><b>description</b>: document karo ki rule kyun hai; auditors ko yeh pasand hai.</li>
<li><b>no-proxy-arp</b> aur <b>route-lookup</b>: chapter 8 mein identity NAT ke saath cover hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> <code>nat (inside,dmz) source static INSIDE-NET INSIDE-NET destination static DNS-PUBLIC DNS-INTERNAL</code> padho jahan DNS-PUBLIC 198.51.100.53 hai aur DNS-INTERNAL dmz par 10.0.2.53 hai. Source unchanged (identity), destination translated: jo users 198.51.100.53 query karte hain woh chupchaap 10.0.2.53 par redirect ho jaate hain. Destination order pehle mapped (jo users type karte hain), phir real hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Destination objects ulat dena, yaani real ko mapped se pehle likhna. Rule accept hoti hai, <code>show nat</code> use dikhata hai, lekin woh kabhi match nahi karti kyunki hosts kabhi real remote address par bhejte hi nahi. Hamesha poochho: mera host asli mein kis address par bhejta hai? Wahi pehle jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa NAT type inside source ko destination ke hisaab se alag translate kar sakta hai?" Sirf manual (twice) NAT. Auto NAT mein koi destination condition nahi hoti. Aur: twice NAT rules section 1 mein hoti hain jab tak <code>after-auto</code> ke saath configure na ki jaayein.</p></div>

<div class="scn"><h4>Vendor jise galat address dikha</h4><p>Ek vendor ne 203.0.113.6 whitelist kiya, aur engineer ne use use karne ke liye twice NAT rule add ki. Vendor ko ab bhi 203.0.113.2 dikh raha tha. <code>show nat</code> ne dikhaya ki rule <code>after-auto</code> ke saath enter hui thi, isliye woh section 3 mein thi, section 2 ke INSIDE-NET interface PAT ke neeche, jo pehle match ho raha tha. Use hata kar bina <code>after-auto</code> ke dobara add karne se woh section 1 mein aayi aur vendor ko .6 dikhne laga.</p><p><b>Seekh:</b> exceptions general rule se pehle evaluate honi chahiye; <code>show nat</code> mein section check karo.</p></div>

<div class="iv"><p class="q">"Same 10.0.1.0/24 wali do companies ko baat karni hai. ASA par kaise solve karoge?"</p><p>Static source aur destination ke saath twice NAT: hamara network unhe ek unique mapped subnet ki tarah dikhta hai, unka network hume doosre unique subnet ki tarah, ASA par ek rule dono rewrites karti hai, aur NAT divert egress interface chunta hai. ACLs real addresses use karti hain. Batao ki DNS ya host records ko users ko mapped addresses par point karna hoga, aur long-term fix renumbering hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Twice NAT ek rule mein source aur destination, aur ports, match aur translate kar sakta hai.</li>
<li>Source: pehle real phir mapped. Destination: pehle mapped phir real.</li>
<li>Destination mein same object do baar ka matlab "sirf is destination ki taraf" (policy NAT).</li>
<li>Jab rule destination translate karti hai to NAT divert egress interface chunta hai.</li>
<li>Default mein section 1; <code>after-auto</code> ise section 3 mein le jaata hai.</li>
</ul></div>
`}};export{e as default};