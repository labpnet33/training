var e={id:`path-manipulation`,h:{en:`Path manipulation: weight, local preference, AS-path prepend, MED and communities`,hi:`Path manipulation: weight, local preference, AS-path prepend, MED aur communities`},body:{en:`
<p>When you leave your house you choose the door yourself. When guests come to visit, you can only put up signs ("please use the side gate") and hope they follow them. BGP is the same. <b>Outbound</b> traffic (leaving your AS) is fully under your control: you pick the exit with <b>weight</b> and <b>local preference</b>. <b>Inbound</b> traffic (entering your AS) is decided by other people's routers, so you can only give hints: <b>AS-path prepend</b>, <b>MED</b> and <b>communities</b>.</p>

<table class="cmp"><tr><th>Attribute</th><th>Steers</th><th>Scope</th><th>Default</th><th>Preferred</th></tr>
<tr><td>Weight (Cisco)</td><td>Outbound, one router</td><td>Never advertised</td><td>0 (32768 if local)</td><td>Highest</td></tr>
<tr><td>Local preference</td><td>Outbound, whole AS</td><td>iBGP peers only</td><td>100</td><td>Highest</td></tr>
<tr><td>AS-path prepend</td><td>Inbound (hint)</td><td>Everyone downstream</td><td>none</td><td>Shortest path</td></tr>
<tr><td>MED (metric)</td><td>Inbound from one neighbor AS</td><td>Neighbor AS only</td><td>0 / missing</td><td>Lowest</td></tr>
<tr><td>Community</td><td>Tag that triggers policy</td><td>As far as it is sent</td><td>none</td><td>n/a</td></tr>
</table>

<h3>Walking the lab: Orbit Retail and two providers</h3>
<p>Orbit Retail (AS 65500) has E1 connected to Lumen-X (AS 64601) and E2 connected to Vayu Net (AS 64602), with iBGP between E1 and E2 (next-hop-self already configured). Vayu Net originates 198.51.100.0/24 and its monitoring network 192.0.2.0/24; Lumen-X learns them from Vayu Net. Finance wants all outbound traffic through Lumen-X, except E2's traffic to 192.0.2.0/24.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Orbit Retail dual-homed lab">
<rect x="110" y="20" width="160" height="48" rx="8" fill="#fed7aa"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Lumen-X AS 64601</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="12">ISP1 100.64.1.1</text>
<rect x="370" y="20" width="160" height="48" rx="8" fill="#fed7aa"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Vayu Net AS 64602</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="12">ISP2 100.64.2.1</text>
<line x1="270" y1="44" x2="370" y2="44" stroke="#64748b" stroke-width="2"/>
<rect x="110" y="160" width="160" height="48" rx="8" fill="#bae6fd"/><text x="190" y="182" text-anchor="middle" class="svg-ink" font-size="13">E1 10.50.0.1</text><text x="190" y="199" text-anchor="middle" class="svg-accent" font-size="12">in: local-pref 200</text>
<rect x="370" y="160" width="160" height="48" rx="8" fill="#bae6fd"/><text x="450" y="182" text-anchor="middle" class="svg-ink" font-size="13">E2 10.50.0.2</text><text x="450" y="199" text-anchor="middle" class="svg-accent" font-size="12">in: weight 300 (192.0.2/24)</text>
<line x1="190" y1="68" x2="190" y2="160" stroke="#64748b" stroke-width="2"/><line x1="450" y1="68" x2="450" y2="160" stroke="#64748b" stroke-width="2"/><line x1="270" y1="184" x2="370" y2="184" stroke="#64748b" stroke-width="2"/>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">iBGP</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">AS 65500 Orbit Retail, PC5 behind E2 on 172.16.50.0/24</text>
</svg><p class="cap">Local preference steers the whole AS; weight creates one local exception on E2.</p></div>

<p><b>Task 1: local preference on E1.</b></p>
<pre class="code">route-map PREFER-LUMEN permit 10
 set local-preference 200
router bgp 65500
 neighbor 100.64.1.1 route-map PREFER-LUMEN in
end
clear ip bgp 100.64.1.1 soft in</pre>
<p>E1 now prefers Lumen-X (200 beats 100) and tells E2 with local preference 200 over iBGP. E2 compares its own eBGP path (LP 100) with E1's path (LP 200) and switches to E1. Note what E2 then does: its best path is now an iBGP path, which it may not re-advertise to E1, so E2 <b>withdraws</b> its Vayu Net path from E1. E1 is left with a single path.</p>
<pre class="out">E1# show ip bgp 198.51.100.0
BGP routing table entry for 198.51.100.0/24, version 12
<span class="hl">Paths: (1 available, best #1, table default)</span>
  Advertised to update-groups:
     1
  Refresh Epoch 2
  64601 64602
    100.64.1.1 from 100.64.1.1 (64.60.1.1)
<span class="hl">      Origin IGP, localpref 200, valid, external, best</span></pre>

<p><b>Task 2: weight 300 on E2 for the monitoring network only</b> (the FROM-VAYU route-map from chapter 8). Weight is checked before local preference, so on E2 the direct path to 192.0.2.0/24 (weight 300) beats E1's path (weight 0, LP 200). Everything else still follows local preference.</p>
<pre class="out">E2# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.50.0/24   0.0.0.0                  0         32768 i
 *i  192.0.2.0        10.50.0.1                     200      0 64601 64602 i
<span class="hl"> *&gt;                   100.64.2.1               0           300 64602 i</span>
<span class="hl"> *&gt;i 198.51.100.0     10.50.0.1                     200      0 64601 64602 i</span>
 *                    100.64.2.1               0             0 64602 i</pre>
<p><b>Task 3: weight stays local.</b> E1 still sends 192.0.2.0/24 to Lumen-X, because E1 never sees E2's weight; E2's path arrives at E1 with weight 0 and LP 100, losing to LP 200. And E2 keeps the Vayu Net path to 198.51.100.0/24 as a backup (<code>*</code> without <code>&gt;</code>). <b>Task 4:</b> <code>show ip route 198.51.100.0</code> on E2 shows <i>bgp 65500, distance 200</i> via 10.50.0.1, and PC5 reaches 198.51.100.1 through E1.</p>

<h3>Inbound hints: AS-path prepend and MED</h3>
<pre class="code"><span class="c">! Make the path via Vayu Net look longer to the outside world</span>
route-map TO-VAYU permit 10
 set as-path prepend 65500 65500
router bgp 65500
 neighbor 100.64.2.1 route-map TO-VAYU out
<span class="c">! MED: only compared between paths from the same neighbor AS</span>
route-map TO-LUMEN-BACKUP permit 10
 set metric 50</pre>
<p>Prepending is a hint, not a command. Providers normally give <b>customer</b> routes a higher local preference than peer routes. Vayu Net will still prefer its direct customer path <code>65500 65500 65500</code> over <code>64601 65500</code>, because local preference is checked before AS-path length. Other networks on the Internet will be influenced. <b>MED</b> is useful when you have two links to the <i>same</i> provider: send MED 10 on the primary and 50 on the backup, and the provider prefers the lower value. By default IOS compares MED only between paths from the same neighbor AS (<code>bgp always-compare-med</code> changes that) and treats a missing MED as 0 (<code>bgp bestpath med missing-as-worst</code> changes that).</p>

<h3>Communities</h3>
<p>A community is a 32-bit tag, written <code>AA:NN</code> (your AS : a value) after <code>ip bgp-community new-format</code>. It does nothing by itself; routers match it and apply policy. IOS does not send communities unless you configure <code>neighbor X send-community</code> (or <code>both</code> for standard and extended).</p>
<table class="cmp"><tr><th>Well-known community</th><th>Effect</th></tr>
<tr><td>no-export (65535:65281)</td><td>Do not advertise to eBGP peers (stay inside the AS)</td></tr>
<tr><td>no-advertise (65535:65282)</td><td>Do not advertise to any peer at all</td></tr>
<tr><td>local-AS (65535:65283)</td><td>Do not advertise outside the local sub-AS (confederations)</td></tr>
<tr><td>internet (0)</td><td>Advertise normally</td></tr>
</table>
<pre class="code">ip bgp-community new-format
route-map TAG-OUT permit 10
 set community 64602:80 additive        <span class="c">! provider-defined: "set my local-pref to 80"</span>
ip community-list standard BACKUP permit 64602:80
route-map MATCH-BACKUP permit 10
 match community BACKUP
router bgp 65500
 neighbor 100.64.2.1 send-community</pre>
<p>Many providers publish communities that let customers set local preference inside the provider network. That solves the prepending limitation above properly: tag your routes on the Vayu Net link with the provider's "backup" community and Vayu Net itself will prefer the path through Lumen-X.</p>

<div class="eg"><p><b>Worked example: no-export.</b> E1 receives 203.0.113.128/25 from Lumen-X tagged no-export, a more-specific that Lumen-X wants used only by its customer. E1 passes it to E2 over iBGP (inside the AS) but neither E1 nor E2 will send it to Vayu Net. With no-advertise instead, E1 would use it but not even tell E2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting local preference outbound towards an eBGP peer (it is never sent to eBGP). Using weight when the requirement says "the whole AS". Forgetting <code>send-community</code>, then wondering why the provider ignores your tags. <code>set community X</code> without <code>additive</code> replaces existing communities.</p></div>

<div class="exam"><p><b>Exam traps.</b> Weight and local preference: highest wins; MED and AS-path length: lowest wins. Weight is Cisco-only and local to one router. Local preference never crosses an eBGP boundary. MED is compared only between paths from the same neighbor AS by default. no-export = not outside the AS; no-advertise = to nobody.</p></div>

<div class="scn"><h4>Prepending that changed nothing</h4><p>An enterprise prepended its AS five times towards its backup provider, yet most inbound traffic still arrived over the backup link. The provider assigned local preference 120 to all customer routes, so the prepended customer path still beat the path through the internet. The provider's documentation listed a community that sets local preference 80. Tagging the routes with it moved inbound traffic to the primary link within minutes.</p><p><b>Lesson:</b> AS-path length is checked after local preference; to influence your provider, use its communities.</p></div>

<div class="iv"><p class="q">"You are dual-homed. How do you control outbound and inbound traffic?"</p><p>Outbound: local preference set inbound on the preferred provider's edge router steers the whole AS; weight only for per-router exceptions. Inbound: AS-path prepend on the backup link, MED if both links go to the same provider, and provider communities to change local preference inside the provider network. Mention limits: inbound is always a request, and providers prefer customer routes. Verify with <code>show ip bgp</code> locally and a looking glass or traceroute from outside.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbound: weight (one router) and local preference (whole AS), highest wins.</li>
<li>Inbound: AS-path prepend, MED and communities are hints to other ASes.</li>
<li>When an iBGP peer's path becomes best, a router withdraws its own eBGP path from iBGP peers.</li>
<li>Communities need <code>send-community</code>; no-export stays in the AS, no-advertise goes nowhere.</li>
<li>Providers prefer customer routes by local preference, so use their communities rather than long prepends.</li>
</ul></div>
`,hi:`
<p>Jab aap ghar se nikalte ho to darwaza khud chunte ho. Jab mehmaan aate hain, to aap sirf board laga sakte ho ("kripya side gate use karein") aur umeed kar sakte ho ki woh maanenge. BGP bhi aisa hi hai. <b>Outbound</b> traffic (aapke AS se bahar jaana) poori tarah aapke control mein hai: aap <b>weight</b> aur <b>local preference</b> se exit chunte ho. <b>Inbound</b> traffic (aapke AS mein aana) dusron ke routers decide karte hain, isliye aap sirf hints de sakte ho: <b>AS-path prepend</b>, <b>MED</b> aur <b>communities</b>.</p>

<table class="cmp"><tr><th>Attribute</th><th>Kya steer karta hai</th><th>Scope</th><th>Default</th><th>Preferred</th></tr>
<tr><td>Weight (Cisco)</td><td>Outbound, ek router</td><td>Kabhi advertise nahi</td><td>0 (local ho to 32768)</td><td>Sabse zyada</td></tr>
<tr><td>Local preference</td><td>Outbound, poora AS</td><td>Sirf iBGP peers</td><td>100</td><td>Sabse zyada</td></tr>
<tr><td>AS-path prepend</td><td>Inbound (hint)</td><td>Downstream sab</td><td>kuch nahi</td><td>Sabse chhota path</td></tr>
<tr><td>MED (metric)</td><td>Ek neighbor AS se inbound</td><td>Sirf neighbor AS</td><td>0 / missing</td><td>Sabse kam</td></tr>
<tr><td>Community</td><td>Tag jo policy trigger kare</td><td>Jahan tak bheja jaaye</td><td>kuch nahi</td><td>n/a</td></tr>
</table>

<h3>Lab walk: Orbit Retail aur do providers</h3>
<p>Orbit Retail (AS 65500) ka E1 Lumen-X (AS 64601) se aur E2 Vayu Net (AS 64602) se juda hai, E1 aur E2 ke beech iBGP (next-hop-self pehle se configured). Vayu Net 198.51.100.0/24 aur apna monitoring network 192.0.2.0/24 originate karta hai; Lumen-X unhe Vayu Net se seekhta hai. Finance chahta hai ki saara outbound traffic Lumen-X se jaaye, sirf E2 ka 192.0.2.0/24 wala traffic chhod kar.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Orbit Retail dual-homed lab">
<rect x="110" y="20" width="160" height="48" rx="8" fill="#fed7aa"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Lumen-X AS 64601</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="12">ISP1 100.64.1.1</text>
<rect x="370" y="20" width="160" height="48" rx="8" fill="#fed7aa"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Vayu Net AS 64602</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="12">ISP2 100.64.2.1</text>
<line x1="270" y1="44" x2="370" y2="44" stroke="#64748b" stroke-width="2"/>
<rect x="110" y="160" width="160" height="48" rx="8" fill="#bae6fd"/><text x="190" y="182" text-anchor="middle" class="svg-ink" font-size="13">E1 10.50.0.1</text><text x="190" y="199" text-anchor="middle" class="svg-accent" font-size="12">in: local-pref 200</text>
<rect x="370" y="160" width="160" height="48" rx="8" fill="#bae6fd"/><text x="450" y="182" text-anchor="middle" class="svg-ink" font-size="13">E2 10.50.0.2</text><text x="450" y="199" text-anchor="middle" class="svg-accent" font-size="12">in: weight 300 (192.0.2/24)</text>
<line x1="190" y1="68" x2="190" y2="160" stroke="#64748b" stroke-width="2"/><line x1="450" y1="68" x2="450" y2="160" stroke="#64748b" stroke-width="2"/><line x1="270" y1="184" x2="370" y2="184" stroke="#64748b" stroke-width="2"/>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">iBGP</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">AS 65500 Orbit Retail, E2 ke peeche 172.16.50.0/24 par PC5</text>
</svg><p class="cap">Local preference poore AS ko steer karta hai; weight E2 par ek local exception banata hai.</p></div>

<p><b>Task 1: E1 par local preference.</b></p>
<pre class="code">route-map PREFER-LUMEN permit 10
 set local-preference 200
router bgp 65500
 neighbor 100.64.1.1 route-map PREFER-LUMEN in
end
clear ip bgp 100.64.1.1 soft in</pre>
<p>Ab E1 Lumen-X prefer karta hai (200, 100 ko harata hai) aur iBGP par E2 ko local preference 200 ke saath batata hai. E2 apne eBGP path (LP 100) ko E1 ke path (LP 200) se compare karta hai aur E1 par switch kar leta hai. Dekho phir E2 kya karta hai: uska best path ab iBGP path hai, jise woh E1 ko re-advertise nahi kar sakta, isliye E2 apna Vayu Net path E1 se <b>withdraw</b> kar leta hai. E1 ke paas ek hi path bachta hai.</p>
<pre class="out">E1# show ip bgp 198.51.100.0
BGP routing table entry for 198.51.100.0/24, version 12
<span class="hl">Paths: (1 available, best #1, table default)</span>
  Advertised to update-groups:
     1
  Refresh Epoch 2
  64601 64602
    100.64.1.1 from 100.64.1.1 (64.60.1.1)
<span class="hl">      Origin IGP, localpref 200, valid, external, best</span></pre>

<p><b>Task 2: E2 par sirf monitoring network ke liye weight 300</b> (chapter 8 ka FROM-VAYU route-map). Weight local preference se pehle check hota hai, isliye E2 par 192.0.2.0/24 ka direct path (weight 300) E1 ke path (weight 0, LP 200) ko harata hai. Baaki sab ab bhi local preference follow karta hai.</p>
<pre class="out">E2# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.50.0/24   0.0.0.0                  0         32768 i
 *i  192.0.2.0        10.50.0.1                     200      0 64601 64602 i
<span class="hl"> *&gt;                   100.64.2.1               0           300 64602 i</span>
<span class="hl"> *&gt;i 198.51.100.0     10.50.0.1                     200      0 64601 64602 i</span>
 *                    100.64.2.1               0             0 64602 i</pre>
<p><b>Task 3: weight local rehta hai.</b> E1 abhi bhi 192.0.2.0/24 Lumen-X ko bhejta hai, kyunki E1 ko E2 ka weight kabhi dikhta hi nahi; E2 ka path E1 par weight 0 aur LP 100 ke saath aata hai, aur LP 200 se haar jaata hai. Aur E2 198.51.100.0/24 ka Vayu Net path backup ki tarah rakhta hai (<code>&gt;</code> ke bina <code>*</code>). <b>Task 4:</b> E2 par <code>show ip route 198.51.100.0</code> 10.50.0.1 via <i>bgp 65500, distance 200</i> dikhata hai, aur PC5 E1 ke through 198.51.100.1 tak pahunchta hai.</p>

<h3>Inbound hints: AS-path prepend aur MED</h3>
<pre class="code"><span class="c">! Vayu Net wala path bahar ki duniya ko lamba dikhao</span>
route-map TO-VAYU permit 10
 set as-path prepend 65500 65500
router bgp 65500
 neighbor 100.64.2.1 route-map TO-VAYU out
<span class="c">! MED: sirf same neighbor AS ke paths ke beech compare hota hai</span>
route-map TO-LUMEN-BACKUP permit 10
 set metric 50</pre>
<p>Prepending ek hint hai, command nahi. Providers normally <b>customer</b> routes ko peer routes se zyada local preference dete hain. Vayu Net apna direct customer path <code>65500 65500 65500</code> ko <code>64601 65500</code> se phir bhi prefer karega, kyunki local preference AS-path length se pehle check hota hai. Internet ke dusre networks influence honge. <b>MED</b> tab useful hai jab aapke <i>same</i> provider tak do links hon: primary par MED 10 aur backup par 50 bhejo, aur provider kam value prefer karega. Default mein IOS MED sirf same neighbor AS ke paths ke beech compare karta hai (<code>bgp always-compare-med</code> ise badalta hai) aur missing MED ko 0 maanta hai (<code>bgp bestpath med missing-as-worst</code> ise badalta hai).</p>

<h3>Communities</h3>
<p>Community ek 32-bit tag hai, <code>ip bgp-community new-format</code> ke baad <code>AA:NN</code> (aapka AS : ek value) likha jaata hai. Yeh khud kuch nahi karta; routers ise match karke policy lagate hain. IOS communities tab tak nahi bhejta jab tak aap <code>neighbor X send-community</code> (ya standard aur extended ke liye <code>both</code>) configure na karo.</p>
<table class="cmp"><tr><th>Well-known community</th><th>Asar</th></tr>
<tr><td>no-export (65535:65281)</td><td>eBGP peers ko advertise mat karo (AS ke andar raho)</td></tr>
<tr><td>no-advertise (65535:65282)</td><td>Kisi bhi peer ko advertise mat karo</td></tr>
<tr><td>local-AS (65535:65283)</td><td>Local sub-AS ke bahar advertise mat karo (confederations)</td></tr>
<tr><td>internet (0)</td><td>Normally advertise karo</td></tr>
</table>
<pre class="code">ip bgp-community new-format
route-map TAG-OUT permit 10
 set community 64602:80 additive        <span class="c">! provider-defined: "meri local-pref 80 set karo"</span>
ip community-list standard BACKUP permit 64602:80
route-map MATCH-BACKUP permit 10
 match community BACKUP
router bgp 65500
 neighbor 100.64.2.1 send-community</pre>
<p>Kai providers aisi communities publish karte hain jinse customers provider network ke andar local preference set kar sakein. Isse upar wali prepending ki limitation theek se solve hoti hai: Vayu Net link par apne routes ko provider ki "backup" community se tag karo aur Vayu Net khud Lumen-X wala path prefer karega.</p>

<div class="eg"><p><b>Worked example: no-export.</b> E1 Lumen-X se 203.0.113.128/25 no-export tag ke saath receive karta hai, ek more-specific jo Lumen-X chahta hai sirf uska customer use kare. E1 ise iBGP par E2 ko deta hai (AS ke andar) par na E1 na E2 ise Vayu Net ko bhejega. Iski jagah no-advertise hota, to E1 ise use karta par E2 ko bhi nahi batata.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> eBGP peer ki taraf outbound local preference set karna (woh eBGP ko kabhi nahi jaata). Jab requirement "poora AS" kahe tab weight use karna. <code>send-community</code> bhool jaana, phir sochna ki provider aapke tags kyun ignore kar raha hai. <code>additive</code> ke bina <code>set community X</code> existing communities ko replace kar deta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Weight aur local preference: sabse zyada jeetta hai; MED aur AS-path length: sabse kam jeetta hai. Weight sirf Cisco ka hai aur ek router tak local hai. Local preference kabhi eBGP boundary cross nahi karta. MED default mein sirf same neighbor AS ke paths ke beech compare hota hai. no-export = AS ke bahar nahi; no-advertise = kisi ko nahi.</p></div>

<div class="scn"><h4>Prepending jisne kuch nahi badla</h4><p>Ek enterprise ne apne backup provider ki taraf apna AS paanch baar prepend kiya, phir bhi zyada tar inbound traffic backup link se hi aata raha. Provider saare customer routes ko local preference 120 deta tha, isliye prepended customer path phir bhi internet wale path se jeet jaata tha. Provider ke documentation mein ek community thi jo local preference 80 set karti hai. Routes ko us se tag karne par minutes mein inbound traffic primary link par aa gaya.</p><p><b>Seekh:</b> AS-path length local preference ke baad check hoti hai; apne provider ko influence karna hai to uski communities use karo.</p></div>

<div class="iv"><p class="q">"Aap dual-homed ho. Outbound aur inbound traffic kaise control karoge?"</p><p>Outbound: preferred provider ke edge router par inbound set ki gayi local preference poore AS ko steer karti hai; weight sirf per-router exceptions ke liye. Inbound: backup link par AS-path prepend, dono links same provider tak hon to MED, aur provider network ke andar local preference badalne ke liye provider communities. Limits batao: inbound hamesha ek request hai, aur providers customer routes prefer karte hain. Locally <code>show ip bgp</code> se aur bahar se looking glass ya traceroute se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbound: weight (ek router) aur local preference (poora AS), sabse zyada jeetta hai.</li>
<li>Inbound: AS-path prepend, MED aur communities dusre ASes ke liye hints hain.</li>
<li>Jab iBGP peer ka path best ban jaata hai, router apna eBGP path iBGP peers se withdraw kar leta hai.</li>
<li>Communities ko <code>send-community</code> chahiye; no-export AS mein rehta hai, no-advertise kahin nahi jaata.</li>
<li>Providers customer routes ko local preference se prefer karte hain, isliye lambe prepends ki jagah unki communities use karo.</li>
</ul></div>
`}};export{e as default};