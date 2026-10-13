var e={id:`summarisation`,h:{en:`Route summarisation and supernetting`,hi:`Route summarisation aur supernetting`},body:{en:`
<p>A national mail sorting centre does not keep a list of every street in Mumbai. It keeps one rule: "every PIN code starting with 400 goes to Mumbai". Mumbai's own sorting office then deals with the streets. That single rule is a <b>summary</b>. In networking, <b>route summarisation</b> (also called <b>route aggregation</b>) replaces many specific routes with one shorter prefix that covers them all. Subnetting borrows bits to make networks smaller; summarisation gives bits back to make one bigger route.</p>

<h3>Why summarise</h3>
<ul>
<li><b>Smaller routing tables</b>: one route instead of dozens, less memory and faster lookups.</li>
<li><b>Stability</b>: if one LAN inside the summary goes up and down, routers far away do not see the change, because the summary stays.</li>
<li><b>Clean design</b>: a site or area gets one contiguous block and advertises one route.</li>
</ul>
<p>Summarisation only works well if the address plan was built for it: each site's subnets must sit together in an aligned block. That is another reason chapters 8 and 9 insist on clean block boundaries.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Four /24s summarised into one /22">
<rect x="20" y="30" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="53" text-anchor="middle" class="svg-ink" font-size="13">172.16.0.0/24</text>
<rect x="20" y="72" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="13">172.16.1.0/24</text>
<rect x="20" y="114" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="137" text-anchor="middle" class="svg-ink" font-size="13">172.16.2.0/24</text>
<rect x="20" y="156" width="140" height="30" rx="6" fill="#bae6fd"/><text x="90" y="176" text-anchor="middle" class="svg-ink" font-size="13">172.16.3.0/24</text>
<line x1="160" y1="48" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="90" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="132" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="171" x2="300" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="84" width="170" height="48" rx="8" fill="#bbf7d0"/><text x="385" y="106" text-anchor="middle" class="svg-ink" font-size="14">172.16.0.0/22</text><text x="385" y="123" text-anchor="middle" class="svg-muted" font-size="12">one route</text>
<line x1="470" y1="108" x2="540" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="540" y="84" width="80" height="48" rx="8" fill="#e2e8f0"/><text x="580" y="112" text-anchor="middle" class="svg-ink" font-size="13">HQ</text>
<text x="385" y="30" text-anchor="middle" class="svg-accent" font-size="12">22 common bits</text>
</svg><p class="cap">The branch advertises one /22 instead of four /24s. HQ needs only one route.</p></div>

<h3>Method 1: binary (always works)</h3>
<ol>
<li>Write the octet where the networks differ in binary, for the lowest and highest network.</li>
<li>Count the leading bits that are the same in all of them, plus the full octets before.</li>
<li>The summary is those common bits followed by zeros; the prefix is the count.</li>
</ol>
<div class="eg"><p><b>Worked example 1.</b> 172.16.0.0/24 to 172.16.3.0/24. Third octets: 0 = <code>000000|00</code>, 3 = <code>000000|11</code>. Six common bits in the third octet plus 16 before = <b>172.16.0.0/22</b>.</p>
<p><b>Worked example 2.</b> 10.1.4.0/24 to 10.1.7.0/24. 4 = <code>000001|00</code>, 7 = <code>000001|11</code>. Six common bits: <b>10.1.4.0/22</b>.</p>
<p><b>Worked example 3.</b> 192.168.1.64/27 and 192.168.1.96/27. Fourth octets: 64 = <code>01|000000</code>, 96 = <code>01|100000</code>. Two common bits in the fourth octet: <b>192.168.1.64/26</b>.</p></div>

<h3>Method 2: block counting (fast)</h3>
<p>If the number of networks is a power of two (2, 4, 8, 16) and the first one starts on a multiple of that number, the summary is the first network with the prefix shortened by log2 of the count. Four /24s starting at 4 (a multiple of 4): /24 − 2 = /22. Sixteen /24s from 192.168.16.0 to 192.168.31.0 (16 is a multiple of 16): /24 − 4 = <b>192.168.16.0/20</b>.</p>

<h3>When the networks are not aligned</h3>
<div class="eg"><p><b>Worked example 4.</b> 10.1.6.0/24 to 10.1.9.0/24 (four networks). 6 = <code>0000|0110</code>, 9 = <code>0000|1001</code>. Only four bits are common, so a single summary would be 10.1.0.0/20, which covers 10.1.0.0 to 10.1.15.255: <b>sixteen</b> /24s for four real ones. That is <b>over-summarisation</b>. The exact answer is two summaries: <b>10.1.6.0/23</b> (6 and 7) and <b>10.1.8.0/23</b> (8 and 9).</p></div>
<p>Over-summarisation is dangerous because routers use <b>longest prefix match</b>: a more specific route always wins, but when no more specific route exists, traffic for addresses inside the summary follows it, even if nothing lives there. Routing protocols protect the advertising router with a <b>Null0</b> discard route for the summary, which you will see in the routing modules.</p>

<h3>Supernetting</h3>
<p><b>Supernetting</b> is the original name for summarising classful networks into a prefix shorter than their class default, for example four class C networks 200.10.4.0 to 200.10.7.0 into 200.10.4.0/22. It was one of the main goals of CIDR. Today "summary", "aggregate" and "supernet" are used almost interchangeably.</p>

<h3>A summary in configuration</h3>
<p>The simplest summary is a static route on HQ pointing the whole branch block at the branch router (static routes get their own module):</p>
<pre class="code">HQ(config)# ip route 172.16.0.0 255.255.252.0 10.0.0.2</pre>
<pre class="out">HQ# show ip route static
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">S        172.16.0.0 [1/0] via 10.0.0.2</span></pre>

<h3>Practice drills (answers below)</h3>
<p>Find the best single summary, or say why there is none: <b>a)</b> 10.10.32.0/24 to 10.10.35.0/24 <b>b)</b> 172.16.64.0/24 to 172.16.79.0/24 <b>c)</b> 192.168.10.0/26, .64/26, .128/26, .192/26 <b>d)</b> 10.1.1.0/24 and 10.1.2.0/24.</p>
<div class="tip"><p><b>Answers.</b> a) 32 to 35: four networks, 32 is a multiple of 4 → <b>10.10.32.0/22</b>. b) sixteen networks from 64 (a multiple of 16) → <b>172.16.64.0/20</b>. c) four /26s filling the /24 → <b>192.168.10.0/24</b>. d) 1 = 000000|01, 2 = 000000|10: only six common bits, so the single summary 10.1.0.0/22 would also include 10.1.0.0 and 10.1.3.0. There is no exact single summary; advertise both /24s.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting a summary on a non-aligned address (10.1.6.0/22 is not a valid network; its real network is 10.1.4.0). Picking a summary that includes subnets owned by another site. Forgetting that the summary's prefix must be shorter than every route it covers.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which is the best summary?" means the <b>longest</b> prefix (the smallest block) that still covers every listed network. An option that covers them but is shorter than necessary (for example /16 instead of /22) is not the best answer.</p></div>

<div class="scn"><h4>The summary that caught a new branch's traffic</h4><p>Branch A owned 10.1.6.0/24 to 10.1.9.0/24 and advertised the lazy summary 10.1.0.0/20 to the core. Later, Branch B was given 10.1.12.0/24. Normally the more specific /24 from Branch B won. One afternoon Branch B's WAN link flapped; its /24 disappeared, and the core followed the /20 to Branch A, which dropped the traffic. Users saw timeouts instead of a clean "unreachable". The team replaced the /20 with 10.1.6.0/23 and 10.1.8.0/23 and redesigned so each branch owns an aligned block.</p><p><b>Lesson:</b> summarise only what you own, on exact boundaries. Plan site blocks so one aligned summary per site is possible.</p></div>

<div class="iv"><p class="q">"Summarise 172.16.0.0/24 through 172.16.3.0/24, and tell me what can go wrong with summarisation."</p><p>Strong answer: third octets 0 to 3 share their first six bits, so 16 + 6 = 22: 172.16.0.0/22, also found quickly because it is four networks starting on a multiple of four. Risks: over-summarising covers space you do not own and can attract or blackhole traffic; longest prefix match means specifics elsewhere still win, but only while they exist. Mention Null0 discard routes as the protection on the summarising router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A summary replaces many routes with one shorter prefix: smaller tables and more stability.</li>
<li>Binary method: count the common leading bits of the lowest and highest network.</li>
<li>Fast method: a power-of-two count of networks starting on a multiple of that count.</li>
<li>Best summary = longest prefix that covers all networks; avoid over-summarising.</li>
<li>Longest prefix match decides forwarding; summaries only catch what no specific route claims.</li>
</ul></div>
`,hi:`
<p>National mail sorting centre Mumbai ki har street ki list nahi rakhta. Woh ek rule rakhta hai: "400 se shuru hone wala har PIN code Mumbai jaata hai". Phir Mumbai ka apna sorting office streets sambhalta hai. Woh ek rule <b>summary</b> hai. Networking mein <b>route summarisation</b> (jise <b>route aggregation</b> bhi kehte hain) kai specific routes ko ek chhote prefix se replace karta hai jo un sabko cover karta hai. Subnetting networks ko chhota banane ke liye bits borrow karti hai; summarisation ek bada route banane ke liye bits wapas deti hai.</p>

<h3>Summarise kyun karein</h3>
<ul>
<li><b>Chhoti routing tables</b>: darjanon ki jagah ek route, kam memory aur tez lookups.</li>
<li><b>Stability</b>: agar summary ke andar ka ek LAN up-down hota hai, door ke routers ko change nahi dikhta, kyunki summary bani rehti hai.</li>
<li><b>Saaf design</b>: ek site ya area ko ek contiguous block milta hai aur woh ek route advertise karta hai.</li>
</ul>
<p>Summarisation tabhi achhe se kaam karta hai jab address plan iske liye bana ho: har site ke subnets ek aligned block mein saath baithne chahiye. Yeh ek aur wajah hai ki chapters 8 aur 9 saaf block boundaries par zor dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Chaar /24s ek /22 mein summarise">
<rect x="20" y="30" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="53" text-anchor="middle" class="svg-ink" font-size="13">172.16.0.0/24</text>
<rect x="20" y="72" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="13">172.16.1.0/24</text>
<rect x="20" y="114" width="140" height="36" rx="6" fill="#bae6fd"/><text x="90" y="137" text-anchor="middle" class="svg-ink" font-size="13">172.16.2.0/24</text>
<rect x="20" y="156" width="140" height="30" rx="6" fill="#bae6fd"/><text x="90" y="176" text-anchor="middle" class="svg-ink" font-size="13">172.16.3.0/24</text>
<line x1="160" y1="48" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="90" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="132" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="160" y1="171" x2="300" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="84" width="170" height="48" rx="8" fill="#bbf7d0"/><text x="385" y="106" text-anchor="middle" class="svg-ink" font-size="14">172.16.0.0/22</text><text x="385" y="123" text-anchor="middle" class="svg-muted" font-size="12">ek route</text>
<line x1="470" y1="108" x2="540" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="540" y="84" width="80" height="48" rx="8" fill="#e2e8f0"/><text x="580" y="112" text-anchor="middle" class="svg-ink" font-size="13">HQ</text>
<text x="385" y="30" text-anchor="middle" class="svg-accent" font-size="12">22 common bits</text>
</svg><p class="cap">Branch chaar /24s ki jagah ek /22 advertise karti hai. HQ ko sirf ek route chahiye.</p></div>

<h3>Method 1: binary (hamesha chalta hai)</h3>
<ol>
<li>Jis octet mein networks alag hain use sabse neeche aur sabse upar wale network ke liye binary mein likho.</li>
<li>Un leading bits ko gino jo sabmein same hain, plus pehle ke poore octets.</li>
<li>Summary woh common bits aur uske baad zeros hai; prefix woh ginti hai.</li>
</ol>
<div class="eg"><p><b>Worked example 1.</b> 172.16.0.0/24 se 172.16.3.0/24. Third octets: 0 = <code>000000|00</code>, 3 = <code>000000|11</code>. Third octet mein chhe common bits plus pehle ke 16 = <b>172.16.0.0/22</b>.</p>
<p><b>Worked example 2.</b> 10.1.4.0/24 se 10.1.7.0/24. 4 = <code>000001|00</code>, 7 = <code>000001|11</code>. Chhe common bits: <b>10.1.4.0/22</b>.</p>
<p><b>Worked example 3.</b> 192.168.1.64/27 aur 192.168.1.96/27. Fourth octets: 64 = <code>01|000000</code>, 96 = <code>01|100000</code>. Fourth octet mein do common bits: <b>192.168.1.64/26</b>.</p></div>

<h3>Method 2: block counting (tez)</h3>
<p>Agar networks ki sankhya power of two (2, 4, 8, 16) hai aur pehla network us sankhya ke multiple par shuru hota hai, to summary pehla network hai jiska prefix count ke log2 se chhota ho jaata hai. 4 (4 ka multiple) se shuru hone wale chaar /24s: /24 − 2 = /22. 192.168.16.0 se 192.168.31.0 tak solah /24s (16, 16 ka multiple hai): /24 − 4 = <b>192.168.16.0/20</b>.</p>

<h3>Jab networks aligned nahi hote</h3>
<div class="eg"><p><b>Worked example 4.</b> 10.1.6.0/24 se 10.1.9.0/24 (chaar networks). 6 = <code>0000|0110</code>, 9 = <code>0000|1001</code>. Sirf chaar bits common hain, to ek single summary 10.1.0.0/20 hogi, jo 10.1.0.0 se 10.1.15.255 cover karti hai: chaar asli ke liye <b>solah</b> /24s. Yeh <b>over-summarisation</b> hai. Exact answer do summaries hain: <b>10.1.6.0/23</b> (6 aur 7) aur <b>10.1.8.0/23</b> (8 aur 9).</p></div>
<p>Over-summarisation khatarnak hai kyunki routers <b>longest prefix match</b> use karte hain: zyada specific route hamesha jeet ta hai, par jab koi zyada specific route nahi hota, to summary ke andar ke addresses ka traffic use follow karta hai, bhale hi wahan kuch na rehta ho. Routing protocols advertise karne wale router ko summary ke liye <b>Null0</b> discard route se bachate hain, jo aap routing modules mein dekhoge.</p>

<h3>Supernetting</h3>
<p><b>Supernetting</b> classful networks ko unke class default se chhote prefix mein summarise karne ka original naam hai, jaise chaar class C networks 200.10.4.0 se 200.10.7.0 ko 200.10.4.0/22 mein. Yeh CIDR ke main goals mein se ek tha. Aaj "summary", "aggregate" aur "supernet" lagbhag ek hi matlab mein use hote hain.</p>

<h3>Configuration mein summary</h3>
<p>Sabse simple summary HQ par ek static route hai jo poore branch block ko branch router ki taraf point karta hai (static routes ka apna module hai):</p>
<pre class="code">HQ(config)# ip route 172.16.0.0 255.255.252.0 10.0.0.2</pre>
<pre class="out">HQ# show ip route static
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">S        172.16.0.0 [1/0] via 10.0.0.2</span></pre>

<h3>Practice drills (answers neeche)</h3>
<p>Sabse achhi single summary nikalo, ya batao kyun nahi hai: <b>a)</b> 10.10.32.0/24 se 10.10.35.0/24 <b>b)</b> 172.16.64.0/24 se 172.16.79.0/24 <b>c)</b> 192.168.10.0/26, .64/26, .128/26, .192/26 <b>d)</b> 10.1.1.0/24 aur 10.1.2.0/24.</p>
<div class="tip"><p><b>Answers.</b> a) 32 se 35: chaar networks, 32, 4 ka multiple hai → <b>10.10.32.0/22</b>. b) 64 (16 ka multiple) se solah networks → <b>172.16.64.0/20</b>. c) chaar /26s poora /24 bharte hain → <b>192.168.10.0/24</b>. d) 1 = 000000|01, 2 = 000000|10: sirf chhe common bits, to single summary 10.1.0.0/22 mein 10.1.0.0 aur 10.1.3.0 bhi aa jaayenge. Koi exact single summary nahi hai; dono /24s advertise karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Summary ko non-aligned address par shuru karna (10.1.6.0/22 valid network nahi hai; uska asli network 10.1.4.0 hai). Aisi summary chunna jismein doosri site ke subnets aa jaayein. Bhool jaana ki summary ka prefix har us route se chhota hona chahiye jise woh cover karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Best summary kaunsi hai?" ka matlab hai <b>sabse lamba</b> prefix (sabse chhota block) jo phir bhi har listed network cover kare. Jo option unhe cover karta hai par zaroorat se chhota hai (jaise /22 ki jagah /16), woh best answer nahi.</p></div>

<div class="scn"><h4>Woh summary jisne nayi branch ka traffic pakad liya</h4><p>Branch A ke paas 10.1.6.0/24 se 10.1.9.0/24 tha aur woh core ko aalsi summary 10.1.0.0/20 advertise karti thi. Baad mein Branch B ko 10.1.12.0/24 diya gaya. Normally Branch B ka zyada specific /24 jeet ta tha. Ek dopahar Branch B ka WAN link flap hua; uska /24 gaayab ho gaya, aur core ne /20 follow karke traffic Branch A bheja, jisne use drop kar diya. Users ko saaf "unreachable" ki jagah timeouts dikhe. Team ne /20 ko 10.1.6.0/23 aur 10.1.8.0/23 se replace kiya aur redesign kiya taaki har branch ke paas ek aligned block ho.</p><p><b>Seekh:</b> sirf woh summarise karo jo aapka hai, exact boundaries par. Site blocks aise plan karo ki har site ke liye ek aligned summary possible ho.</p></div>

<div class="iv"><p class="q">"172.16.0.0/24 se 172.16.3.0/24 tak summarise karo, aur batao summarisation mein kya galat ho sakta hai."</p><p>Strong answer: third octets 0 se 3 apne pehle chhe bits share karte hain, to 16 + 6 = 22: 172.16.0.0/22, jo tez bhi milta hai kyunki yeh chaar ke multiple par shuru hone wale chaar networks hain. Risks: over-summarising woh space cover karta hai jo aapka nahi aur traffic ko attract ya blackhole kar sakta hai; longest prefix match ka matlab hai ki kahin aur ke specifics jeet te hain, par sirf jab tak woh exist karein. Summarising router par protection ke roop mein Null0 discard routes ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summary kai routes ko ek chhote prefix se replace karti hai: chhoti tables aur zyada stability.</li>
<li>Binary method: sabse neeche aur sabse upar wale network ke common leading bits gino.</li>
<li>Tez method: networks ki power-of-two ginti jo us ginti ke multiple par shuru ho.</li>
<li>Best summary = sabse lamba prefix jo saare networks cover kare; over-summarise mat karo.</li>
<li>Forwarding longest prefix match decide karta hai; summaries sirf woh pakadti hain jo koi specific route claim nahi karta.</li>
</ul></div>
`}};export{e as default};