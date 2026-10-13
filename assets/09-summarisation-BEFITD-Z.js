var e={id:`summary`,h:{en:`Summarisation basics: many subnets, one route`,hi:`Summarisation basics: bahut saare subnets, ek route`},body:{en:`
<p>Subnetting cuts a block into smaller pieces. <b>Summarisation</b> (also called <b>route aggregation</b> or <b>supernetting</b>) does the reverse: it describes several contiguous subnets with one shorter prefix, so other routers need only one route instead of many. Good addressing plans are designed so that summarisation is possible, which is why this topic belongs in an addressing module.</p>

<h3>An analogy: the sorting office</h3>
<p>The Delhi sorting office does not keep a list of every PIN code in Mumbai. It keeps one rule: "anything starting with 400 goes to the Mumbai hub". The Mumbai hub knows the details. A <b>summary route</b> is exactly that rule. A branch router tells headquarters "everything in 172.16.0.0/22 is behind me" instead of listing four /24s, and the branch router itself knows the individual subnets.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Branch advertises one summary to headquarters">
<rect x="20" y="20" width="200" height="140" rx="8" fill="#e2e8f0"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Branch LANs</text>
<rect x="40" y="54" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="70" text-anchor="middle" class="svg-ink" font-size="12">172.16.0.0/24</text>
<rect x="40" y="80" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="96" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text>
<rect x="40" y="106" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="122" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text>
<rect x="40" y="132" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="148" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="260" y="70" width="100" height="40" rx="8" fill="#fde68a"/><text x="310" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR-R1</text>
<line x1="220" y1="90" x2="260" y2="90" stroke="#64748b"/><line x1="360" y1="90" x2="480" y2="90" stroke="#64748b"/>
<text x="420" y="80" text-anchor="middle" class="svg-accent" font-size="12">172.16.0.0/22</text>
<rect x="480" y="70" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ router</text>
<text x="550" y="135" text-anchor="middle" class="svg-muted" font-size="12">1 route, not 4</text>
</svg><p class="cap">Headquarters needs only the /22. If one branch LAN flaps, the summary does not change.</p></div>

<h3>Why summarise</h3>
<ul>
<li><b>Smaller routing tables</b>: less memory and faster lookups on every router upstream.</li>
<li><b>Stability</b>: a LAN going up and down inside the summary does not ripple across the whole network.</li>
<li><b>Simpler policy</b>: one firewall object or ACL line can cover a whole site.</li>
</ul>

<h3>How to find a summary: count the common bits</h3>
<ol>
<li>List the first and last network you want to cover.</li>
<li>Write the octet where they differ in binary.</li>
<li>Count the bits that are identical from the left, across all octets. That count is the summary prefix.</li>
<li>The summary network is those common bits followed by zeros.</li>
</ol>

<div class="eg"><p><b>Worked example 1: 172.16.0.0/24 to 172.16.3.0/24.</b> They differ in the third octet: 0 = <code>000000|00</code>, 3 = <code>000000|11</code>. Common bits: 8 + 8 + 6 = 22. Summary <b>172.16.0.0/22</b> (255.255.252.0), exactly covering .0 – .3.</p>
<p><b>Worked example 2: 10.1.4.0/24 to 10.1.7.0/24.</b> 4 = <code>000001|00</code>, 7 = <code>000001|11</code>. Common: 8 + 8 + 6 = 22. Summary <b>10.1.4.0/22</b>.</p>
<p><b>Worked example 3: the lab's four /26s.</b> 192.168.50.0/26, .64/26, .128/26 and .192/26 together are the whole /24: summary <b>192.168.50.0/24</b>. That is exactly what the branch was given in the first place.</p>
<p><b>Worked example 4: the VLSM site from chapter 8.</b> Every subnet from 172.16.10.0/25 down to the /30 links sits inside <b>172.16.10.0/24</b>, so HQ needs one route for the whole site.</p></div>

<h3>The shortcut: block-size check</h3>
<p>A clean summary covers 2<sup>n</sup> contiguous networks, and its first network must be a <b>multiple of 2<sup>n</sup></b> in the changing octet. Four /24s (2<sup>2</sup>) collapse to a /22 only if the third octet starts on a multiple of 4: 0, 4, 8, 12 … So 10.1.4.0 – 10.1.7.0 summarises cleanly; 10.1.3.0 – 10.1.6.0 does not.</p>

<div class="eg"><p><b>The misaligned case: 10.1.3.0/24 to 10.1.6.0/24.</b> 3 = <code>00000|011</code>, 6 = <code>00000|110</code>: only 5 common bits in the octet, giving 10.1.0.0/21. But a /21 covers 10.1.0.0 to 10.1.7.255, eight networks, including 0, 1, 2 and 7, which are not ours. That is <b>over-summarisation</b>. The exact answer needs three routes: 10.1.3.0/24, 10.1.4.0/23 and 10.1.6.0/24.</p></div>

<h3>What it looks like on a router</h3>
<pre class="code"><span class="c">! On the HQ router: one static summary towards the branch</span>
ip route 172.16.0.0 255.255.252.0 198.51.100.2</pre>
<pre class="out">HQ#show ip route static
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">S        172.16.0.0 [1/0] via 198.51.100.2</span></pre>
<p>Dynamic protocols such as OSPF and EIGRP can generate summaries automatically at boundaries you choose; the routing module covers that.</p>

<div class="warn"><p><b>Common mistakes.</b> Picking a summary that looks right in decimal but starts on the wrong boundary, and summarising networks that are not all behind the same router. Always ask: does every address inside the summary really live in that direction?</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which is the most efficient summary of 192.168.8.0/24 to 192.168.15.0/24?" Eight networks starting at 8 (a multiple of 8): <b>192.168.8.0/21</b>. An option of 192.168.0.0/20 also covers them but includes 0 – 7 too; "most efficient" means the longest prefix that covers exactly what is asked.</p></div>

<div class="scn"><h4>The summary that swallowed a remote site</h4><p>An engineer configured a data-centre router to advertise 10.20.0.0/16 towards the WAN, because "all the DC subnets are 10.20.something". A small remote office had quietly been given 10.20.200.0/24 years earlier. Most WAN routers still had the specific /24 route for the office, but a newly installed router only learned the /16 and sent the office's traffic to the data centre, where it was dropped. The team narrowed the DC summary to 10.20.0.0/17, which covered all real DC subnets (10.20.0.x to 10.20.127.x) and excluded the office.</p><p><b>Lesson:</b> a summary claims every address inside it. Plan address blocks by location so summaries never include someone else's subnets.</p></div>

<div class="iv"><p class="q">"What is route summarisation, and what can go wrong with it?"</p><p>Strong answer: advertising one shorter prefix that covers several contiguous subnets, which shrinks routing tables and hides instability. You find it by counting the common leading bits, and the block must start on a matching boundary. The risk is over-summarisation: the summary includes addresses that are not behind that router, which can blackhole or misdirect traffic. Mention that hierarchical addressing by site is what makes clean summaries possible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A summary route covers several contiguous subnets with one shorter prefix.</li>
<li>Find it by counting identical leading bits of the first and last networks.</li>
<li>2<sup>n</sup> networks summarise cleanly only if the first is a multiple of 2<sup>n</sup>.</li>
<li>Over-summarisation claims addresses that live elsewhere and can blackhole traffic.</li>
<li>Plan addresses hierarchically (per site) so summaries are clean.</li>
</ul></div>
`,hi:`
<p>Subnetting ek block ko chhote tukdon mein kaat-ta hai. <b>Summarisation</b> (jise <b>route aggregation</b> ya <b>supernetting</b> bhi kehte hain) ulta karta hai: yeh kai lagatar subnets ko ek chhote prefix se describe karta hai, taaki doosre routers ko bahut saare routes ki jagah sirf ek route chahiye. Achhe addressing plans aise design kiye jaate hain ki summarisation possible ho, isiliye yeh topic addressing module mein aata hai.</p>

<h3>Ek analogy: sorting office</h3>
<p>Delhi ka sorting office Mumbai ke har PIN code ki list nahi rakhta. Woh ek rule rakhta hai: "400 se shuru hone wala sab Mumbai hub jaata hai". Mumbai hub details jaanta hai. <b>Summary route</b> bilkul yahi rule hai. Branch router headquarters ko chaar /24s list karne ki jagah kehta hai "172.16.0.0/22 mein sab mere peeche hai", aur branch router khud individual subnets jaanta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Branch headquarters ko ek summary advertise karti hai">
<rect x="20" y="20" width="200" height="140" rx="8" fill="#e2e8f0"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Branch LANs</text>
<rect x="40" y="54" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="70" text-anchor="middle" class="svg-ink" font-size="12">172.16.0.0/24</text>
<rect x="40" y="80" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="96" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text>
<rect x="40" y="106" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="122" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text>
<rect x="40" y="132" width="160" height="22" rx="4" fill="#bae6fd"/><text x="120" y="148" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="260" y="70" width="100" height="40" rx="8" fill="#fde68a"/><text x="310" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR-R1</text>
<line x1="220" y1="90" x2="260" y2="90" stroke="#64748b"/><line x1="360" y1="90" x2="480" y2="90" stroke="#64748b"/>
<text x="420" y="80" text-anchor="middle" class="svg-accent" font-size="12">172.16.0.0/22</text>
<rect x="480" y="70" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ router</text>
<text x="550" y="135" text-anchor="middle" class="svg-muted" font-size="12">1 route, 4 nahi</text>
</svg><p class="cap">Headquarters ko sirf /22 chahiye. Agar ek branch LAN flap kare, to summary nahi badalta.</p></div>

<h3>Summarise kyun karein</h3>
<ul>
<li><b>Chhoti routing tables</b>: upar ke har router par kam memory aur tez lookups.</li>
<li><b>Stability</b>: summary ke andar ka LAN up-down ho to poore network mein lehar nahi uthti.</li>
<li><b>Simple policy</b>: ek firewall object ya ACL line poori site cover kar sakti hai.</li>
</ul>

<h3>Summary kaise nikaalein: common bits gino</h3>
<ol>
<li>Pehla aur aakhri network list karo jise cover karna hai.</li>
<li>Jis octet mein woh alag hain use binary mein likho.</li>
<li>Left se, saare octets mein, jo bits same hain unhe gino. Wahi ginti summary prefix hai.</li>
<li>Summary network un common bits ke baad zeros hai.</li>
</ol>

<div class="eg"><p><b>Worked example 1: 172.16.0.0/24 se 172.16.3.0/24.</b> Yeh teesre octet mein alag hain: 0 = <code>000000|00</code>, 3 = <code>000000|11</code>. Common bits: 8 + 8 + 6 = 22. Summary <b>172.16.0.0/22</b> (255.255.252.0), bilkul .0 – .3 cover karta hai.</p>
<p><b>Worked example 2: 10.1.4.0/24 se 10.1.7.0/24.</b> 4 = <code>000001|00</code>, 7 = <code>000001|11</code>. Common: 8 + 8 + 6 = 22. Summary <b>10.1.4.0/22</b>.</p>
<p><b>Worked example 3: lab ke chaar /26s.</b> 192.168.50.0/26, .64/26, .128/26 aur .192/26 milkar poora /24 hain: summary <b>192.168.50.0/24</b>. Yahi branch ko shuru mein mila tha.</p>
<p><b>Worked example 4: chapter 8 ki VLSM site.</b> 172.16.10.0/25 se lekar /30 links tak har subnet <b>172.16.10.0/24</b> ke andar hai, to HQ ko poori site ke liye ek route chahiye.</p></div>

<h3>Shortcut: block-size check</h3>
<p>Saaf summary 2<sup>n</sup> lagatar networks cover karta hai, aur uska pehla network badalte octet mein <b>2<sup>n</sup> ka multiple</b> hona chahiye. Chaar /24s (2<sup>2</sup>) ek /22 mein tabhi simat-te hain jab teesra octet 4 ke multiple par shuru ho: 0, 4, 8, 12 … Isliye 10.1.4.0 – 10.1.7.0 saaf summarise hota hai; 10.1.3.0 – 10.1.6.0 nahi.</p>

<div class="eg"><p><b>Misaligned case: 10.1.3.0/24 se 10.1.6.0/24.</b> 3 = <code>00000|011</code>, 6 = <code>00000|110</code>: octet mein sirf 5 common bits, jisse 10.1.0.0/21 banta hai. Lekin /21 10.1.0.0 se 10.1.7.255 tak cover karta hai, aath networks, jinmein 0, 1, 2 aur 7 bhi hain jo hamare nahi. Yeh <b>over-summarisation</b> hai. Exact answer ke liye teen routes chahiye: 10.1.3.0/24, 10.1.4.0/23 aur 10.1.6.0/24.</p></div>

<h3>Router par yeh kaisa dikhta hai</h3>
<pre class="code"><span class="c">! HQ router par: branch ki taraf ek static summary</span>
ip route 172.16.0.0 255.255.252.0 198.51.100.2</pre>
<pre class="out">HQ#show ip route static
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">S        172.16.0.0 [1/0] via 198.51.100.2</span></pre>
<p>OSPF aur EIGRP jaise dynamic protocols aapki chuni hui boundaries par automatically summaries bana sakte hain; routing module yeh cover karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Aisa summary chunna jo decimal mein sahi dikhe lekin galat boundary par shuru ho, aur aise networks summarise karna jo sab ek hi router ke peeche nahi hain. Hamesha poocho: kya summary ke andar ka har address sach mein us direction mein rehta hai?</p></div>

<div class="exam"><p><b>Exam trap.</b> "192.168.8.0/24 se 192.168.15.0/24 ka sabse efficient summary kaunsa hai?" 8 se shuru hone wale aath networks (8 ka multiple): <b>192.168.8.0/21</b>. 192.168.0.0/20 wala option bhi inhe cover karta hai lekin 0 – 7 bhi shamil karta hai; "most efficient" ka matlab sabse lamba prefix jo bilkul utna hi cover kare jitna poocha gaya.</p></div>

<div class="scn"><h4>Summary jo ek remote site nigal gaya</h4><p>Ek engineer ne data-centre router ko WAN ki taraf 10.20.0.0/16 advertise karne ke liye configure kiya, kyunki "saare DC subnets 10.20.kuch-na-kuch hain". Ek chhote remote office ko saalon pehle chup-chaap 10.20.200.0/24 de diya gaya tha. Zyada tar WAN routers ke paas office ka specific /24 route tha, lekin ek naye router ne sirf /16 seekha aur office ka traffic data centre bhej diya, jahan woh drop ho gaya. Team ne DC summary ko 10.20.0.0/17 tak chhota kiya, jo saare asli DC subnets (10.20.0.x se 10.20.127.x) cover karta tha aur office ko bahar rakhta tha.</p><p><b>Seekh:</b> summary apne andar ke har address par daava karta hai. Address blocks location ke hisaab se plan karo taaki summaries mein kabhi kisi aur ke subnets na aayein.</p></div>

<div class="iv"><p class="q">"Route summarisation kya hai, aur ismein kya galat ho sakta hai?"</p><p>Strong answer: ek chhota prefix advertise karna jo kai lagatar subnets cover kare, jisse routing tables chhoti hoti hain aur instability chhup jaati hai. Ise common leading bits gin kar nikaalte hain, aur block matching boundary par shuru hona chahiye. Risk over-summarisation hai: summary mein aise addresses aa jaate hain jo us router ke peeche nahi hain, jo traffic ko blackhole ya galat jagah bhej sakta hai. Batao ki site ke hisaab se hierarchical addressing hi saaf summaries possible banati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summary route kai lagatar subnets ko ek chhote prefix se cover karta hai.</li>
<li>Pehle aur aakhri network ke same leading bits gin kar ise nikaalo.</li>
<li>2<sup>n</sup> networks tabhi saaf summarise hote hain jab pehla 2<sup>n</sup> ka multiple ho.</li>
<li>Over-summarisation un addresses par daava karta hai jo kahin aur hain aur traffic blackhole kar sakta hai.</li>
<li>Addresses hierarchically (har site ke hisaab se) plan karo taaki summaries saaf rahein.</li>
</ul></div>
`}};export{e as default};