var e={id:`bgp-policy-steering`,h:{en:`Routing policy: steering traffic with local preference and prepending`,hi:`Routing policy: local preference aur prepending se traffic steer karna`},body:{en:`
<p>A road map shows all roads. A traffic officer decides which ones you may use. BGP knows all the paths; the <b>routing policy</b> is the traffic officer. In Junos, policy is a small program of terms: "if a route matches this, do that". Policies are attached as <b>import</b> (what we accept from a neighbour) or <b>export</b> (what we send to a neighbour). With two attributes you can steer traffic in both directions.</p>

<h3>The rule of thumb</h3>
<table class="cmp"><tr><th>Goal</th><th>Direction of traffic</th><th>Tool</th><th>Where</th></tr>
<tr><td>Choose our exit</td><td>Outbound, leaving our AS</td><td>Local preference</td><td>Import policy from the preferred ISP</td></tr>
<tr><td>Influence how others reach us</td><td>Inbound, entering our AS</td><td>AS-path prepending, MED, communities</td><td>Export policy to the less preferred ISP</td></tr></table>
<p>Local preference is certain inside your AS, because you control every router. Inbound steering is only advisory, because other ASes apply their own policy first and may ignore your hints.</p>

<h3>How a Junos policy works</h3>
<ul>
<li>A policy statement has <b>terms</b>, evaluated in order. A term has a <code>from</code> part (match conditions) and a <code>then</code> part (actions).</li>
<li>If a term has no <code>from</code>, it matches everything. A term ends the evaluation with <code>accept</code> or <code>reject</code>. Without either, the route continues to the next term, then to the default policy of the protocol.</li>
<li>The BGP default import accepts everything. The default export advertises active BGP routes (and nothing else, such as static or direct ones), so exporting locally originated routes needs a policy that says so.</li>
</ul>

<h3>Outbound: local preference</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dual homed network">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">ISP-A 64501</text>
<rect x="510" y="20" width="110" height="46" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">ISP-B 64502</text>
<line x1="130" y1="43" x2="510" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="158" text-anchor="middle" class="svg-ink" font-size="12">R1 65030</text>
<rect x="510" y="130" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="565" y="158" text-anchor="middle" class="svg-ink" font-size="12">R2 65030</text>
<line x1="75" y1="66" x2="75" y2="130" stroke="#64748b" stroke-width="2"/><line x1="565" y1="66" x2="565" y2="130" stroke="#64748b" stroke-width="2"/><line x1="130" y1="153" x2="510" y2="153" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">IBGP, same AS</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Surat Diamonds: ISP-A primary, ISP-B backup</text>
</svg><p class="cap">Dual-homed AS with two exits.</p></div>
<p>Management wants ISP-A as the primary exit for the cloud prefix 192.0.2.0/24. On R1, an import policy raises the local preference of everything learned from ISP-A:</p>
<pre class="code">set policy-options policy-statement FROM-ISPA term 1 then local-preference 200
set protocols bgp group ISP-A import FROM-ISPA</pre>
<p>Since local preference travels over IBGP, R2 also learns it. The detail output on R2 (shown in the previous chapter) changed from the EBGP path of ISP-B to the IBGP path through R1: local preference 200, and the old path became inactive with reason <b>Local Preference</b>. One policy on one router changed the exit for the whole AS.</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24
192.0.2.0/24       *[BGP/170] 00:00:30, localpref <span class="hl">200</span>, from 10.40.255.1
                      AS path: 64501 I
                    &gt;  to 10.40.12.1 via ge-0/0/1.0
                    [BGP/170] 00:01:35, localpref 100
                      AS path: 64502 I
                       to 100.68.2.1 via ge-0/0/0.0</pre>

<h3>Inbound: AS-path prepending</h3>
<p>Our own prefix 10.40.0.0/16 is announced to both ISPs, and ISP-B sees both a direct path from R2 and a path through ISP-A. We want ISP-B to send traffic for us through ISP-A, so R2 makes its direct advertisement look longer by prepending its AS twice more. Here is the policy and what R2 sends:</p>
<pre class="code">set policy-options policy-statement TO-ISPB term AGG from protocol static
set policy-options policy-statement TO-ISPB term AGG from route-filter 10.40.0.0/16 exact
set policy-options policy-statement TO-ISPB term AGG then as-path-prepend "65030 65030"
set policy-options policy-statement TO-ISPB term AGG then accept
set policy-options policy-statement TO-ISPB term REST then reject
set protocols bgp group ISP-B export TO-ISPB</pre>
<pre class="out">lab@SRT-R2&gt; show route advertising-protocol bgp 100.68.2.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.40.0.0/16            Self                                    [65030] 65030 65030 I</pre>
<p>The square brackets mark the AS that Junos always adds on an EBGP export (65030) followed by two copies from the policy. ISP-B therefore receives 65030 65030 65030, length 3. The path via ISP-A, 64501 65030, has length 2. ISP-B, on its side:</p>
<pre class="out">lab@ISP-B&gt; show route 10.40.0.0/16
10.40.0.0/16       *[BGP/170] 00:00:30, localpref 100
                      AS path: 64501 65030 I
                    &gt;  to 100.68.3.1 via ge-0/0/1.0
                    [BGP/170] 00:02:05, localpref 100
                      AS path: 65030 65030 65030 I
                       to 100.68.2.2 via ge-0/0/0.0
lab@ISP-B&gt; show route 10.40.0.0/16 detail
                Inactive reason: <span class="hl">AS path</span>
                AS path: 65030 65030 65030 I</pre>
<p>Before the policy the direct path (length 1) was active at ISP-B; afterwards it shows Inactive reason AS path, and the active path goes through ISP-A. Only the second term, <code>REST then reject</code>, stops other routes from leaking to ISP-B: the export policy lists exactly what ISP-B may hear.</p>

<h3>Other tools in the same family</h3>
<ul>
<li><b>MED</b>: <code>then metric 50</code> on an export policy tells a neighbour AS which of your links to prefer (lower wins). Honoured only if the neighbour compares MED.</li>
<li><b>Communities</b>: <code>set policy-options community CLOUD members 65030:100</code> and <code>then community add CLOUD</code> tag routes so the neighbour's policy can act (many ISPs publish tags for local preference or prepending).</li>
<li><b>Route filters</b>: <code>exact</code>, <code>orlonger</code>, <code>upto</code> select prefix ranges in <code>from route-filter</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You want R1 as the exit for cloud prefixes only, not for everything. Add a <code>from route-filter 192.0.2.0/24 exact</code> to the term that sets local preference 200 on R1's import from ISP-A. Everything else keeps 100 and follows the normal tie-breaks. Match narrowly, change little.</p></div>

<div class="warn"><p><b>Common mistake.</b> Applying the policy in the wrong direction: local preference belongs on import, and prepending belongs on export towards the neighbour you want to discourage. Another mistake is forgetting that an export policy without a final reject can allow more routes than intended.</p></div>
<div class="exam"><p><b>Exam trap.</b> Outbound control uses local preference (import); inbound control uses prepending or MED (export), and only advisory. Junos prepends the local AS automatically on EBGP export, and the policy adds extra copies. Policy applies in term order and stops at accept or reject.</p></div>

<div class="scn"><h4>Backup that was not a backup</h4><p>A company made a second ISP "backup" with a lower local preference, but customers still used it for inbound traffic because both ISPs received the prefix with the same AS path length. The fix was to prepend the company's AS on the backup advertisement. Inbound traffic moved to the primary ISP within minutes, and the backup remained available when the primary link failed.</p><p><b>Lesson:</b> local preference decides your exit; prepending decides what others see.</p></div>

<div class="iv"><p class="q">"How do you make one ISP primary for both inbound and outbound traffic?"</p><p>For outbound I set a higher local preference on routes imported from the primary ISP. For inbound I prepend my AS on the advertisements to the backup ISP, so its path looks longer. I check the result with show route detail on my router and on the ISP side where possible, and I read the Inactive reasons.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local preference on import controls outbound; prepending (or MED) on export influences inbound.</li>
<li>Policy terms run in order and stop at accept or reject.</li>
<li>The default export sends only active BGP routes; locally originated ones need a policy.</li>
<li>Always verify with show route detail and the Inactive reason.</li>
</ul></div>
`,hi:`
<p>Road map saari sadkein dikhata hai. Traffic officer tay karta hai ki aap kaun si use kar sakte ho. BGP saare paths jaanta hai; <b>routing policy</b> traffic officer hai. Junos mein policy terms ka chhota program hai: "agar route isse match kare to ye karo". Policies <b>import</b> (neighbour se kya accept karte hain) ya <b>export</b> (neighbour ko kya bhejte hain) ki tarah lagti hain. Do attributes se aap dono disha mein traffic steer kar sakte ho.</p>

<h3>Anguthe ka niyam</h3>
<table class="cmp"><tr><th>Goal</th><th>Traffic ki disha</th><th>Tool</th><th>Kahan</th></tr>
<tr><td>Apna exit chunna</td><td>Outbound, hamare AS se bahar</td><td>Local preference</td><td>Preferred ISP se import policy</td></tr>
<tr><td>Doosre hum tak kaise pahunchein ye prabhavit karna</td><td>Inbound, hamare AS mein</td><td>AS-path prepending, MED, communities</td><td>Kam pasand ISP ki taraf export policy</td></tr></table>
<p>Local preference aapke AS ke andar pakki hai, kyunki har router aapke control mein hai. Inbound steering sirf salaah hai, kyunki doosre ASes pehle apni policy lagate hain aur aapke hints ignore kar sakte hain.</p>

<h3>Junos policy kaise kaam karti hai</h3>
<ul>
<li>Policy statement mein <b>terms</b> hote hain, order mein evaluate hote hain. Term mein <code>from</code> (match conditions) aur <code>then</code> (actions) hote hain.</li>
<li>Term mein <code>from</code> na ho to wo sab kuch match karta hai. Term <code>accept</code> ya <code>reject</code> se evaluation khatam karta hai. Dono ke bina route agle term par, phir protocol ki default policy par jaata hai.</li>
<li>BGP default import sab kuch accept karta hai. Default export active BGP routes advertise karta hai (static ya direct jaise aur kuch nahi), isliye locally originated routes export karne ke liye aisi policy chahiye jo ye kahe.</li>
</ul>

<h3>Outbound: local preference</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dual homed network">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">ISP-A 64501</text>
<rect x="510" y="20" width="110" height="46" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">ISP-B 64502</text>
<line x1="130" y1="43" x2="510" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="158" text-anchor="middle" class="svg-ink" font-size="12">R1 65030</text>
<rect x="510" y="130" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="565" y="158" text-anchor="middle" class="svg-ink" font-size="12">R2 65030</text>
<line x1="75" y1="66" x2="75" y2="130" stroke="#64748b" stroke-width="2"/><line x1="565" y1="66" x2="565" y2="130" stroke="#64748b" stroke-width="2"/><line x1="130" y1="153" x2="510" y2="153" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">IBGP, same AS</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Surat Diamonds: ISP-A primary, ISP-B backup</text>
</svg><p class="cap">Do exits wala dual-homed AS.</p></div>
<p>Management cloud prefix 192.0.2.0/24 ke liye ISP-A ko primary exit chahta hai. R1 par import policy ISP-A se seekhi har cheez ki local preference badhati hai:</p>
<pre class="code">set policy-options policy-statement FROM-ISPA term 1 then local-preference 200
set protocols bgp group ISP-A import FROM-ISPA</pre>
<p>Local preference IBGP par jaati hai, isliye R2 bhi use seekhta hai. R2 par detail output (pichhle chapter mein dikhaya) ISP-B ke EBGP path se R1 ke IBGP path par badal gaya: local preference 200, aur purana path <b>Local Preference</b> karan ke saath inactive ho gaya. Ek router par ek policy ne poore AS ka exit badal diya.</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24
192.0.2.0/24       *[BGP/170] 00:00:30, localpref <span class="hl">200</span>, from 10.40.255.1
                      AS path: 64501 I
                    &gt;  to 10.40.12.1 via ge-0/0/1.0
                    [BGP/170] 00:01:35, localpref 100
                      AS path: 64502 I
                       to 100.68.2.1 via ge-0/0/0.0</pre>

<h3>Inbound: AS-path prepending</h3>
<p>Hamara apna prefix 10.40.0.0/16 dono ISPs ko announce hota hai, aur ISP-B ko R2 se seedha path aur ISP-A ke through path dono dikhte hain. Hum chahte hain ISP-B hamare liye traffic ISP-A ke through bheje, isliye R2 apna AS do baar aur jodkar apna seedha advertisement lamba dikhata hai. Policy aur R2 jo bhejta hai:</p>
<pre class="code">set policy-options policy-statement TO-ISPB term AGG from protocol static
set policy-options policy-statement TO-ISPB term AGG from route-filter 10.40.0.0/16 exact
set policy-options policy-statement TO-ISPB term AGG then as-path-prepend "65030 65030"
set policy-options policy-statement TO-ISPB term AGG then accept
set policy-options policy-statement TO-ISPB term REST then reject
set protocols bgp group ISP-B export TO-ISPB</pre>
<pre class="out">lab@SRT-R2&gt; show route advertising-protocol bgp 100.68.2.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.40.0.0/16            Self                                    [65030] 65030 65030 I</pre>
<p>Brackets wo AS dikhate hain jo Junos EBGP export par hamesha jodta hai (65030), uske baad policy ki do copies. Isliye ISP-B ko 65030 65030 65030 milta hai, length 3. ISP-A ke through path, 64501 65030, ki length 2 hai. ISP-B ki taraf:</p>
<pre class="out">lab@ISP-B&gt; show route 10.40.0.0/16
10.40.0.0/16       *[BGP/170] 00:00:30, localpref 100
                      AS path: 64501 65030 I
                    &gt;  to 100.68.3.1 via ge-0/0/1.0
                    [BGP/170] 00:02:05, localpref 100
                      AS path: 65030 65030 65030 I
                       to 100.68.2.2 via ge-0/0/0.0
lab@ISP-B&gt; show route 10.40.0.0/16 detail
                Inactive reason: <span class="hl">AS path</span>
                AS path: 65030 65030 65030 I</pre>
<p>Policy se pehle ISP-B par seedha path (length 1) active tha; baad mein uska Inactive reason AS path hai, aur active path ISP-A ke through hai. Sirf doosra term, <code>REST then reject</code>, baaki routes ko ISP-B tak leak hone se rokta hai: export policy theek wahi batati hai jo ISP-B sun sakta hai.</p>

<h3>Isi family ke doosre tools</h3>
<ul>
<li><b>MED</b>: export policy par <code>then metric 50</code> padosi AS ko batata hai ki aapka kaun sa link prefer kare (kam jeetta). Tabhi maana jaata hai jab padosi MED compare kare.</li>
<li><b>Communities</b>: <code>set policy-options community CLOUD members 65030:100</code> aur <code>then community add CLOUD</code> routes ko tag karte hain taaki padosi ki policy kaam kare (kai ISPs local preference ya prepending ke tags publish karte hain).</li>
<li><b>Route filters</b>: <code>exact</code>, <code>orlonger</code>, <code>upto</code> <code>from route-filter</code> mein prefix ranges chunte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho R1 sirf cloud prefixes ke liye exit rahe, sab kuch ke liye nahi. R1 ke ISP-A se import mein local preference 200 set karne wale term mein <code>from route-filter 192.0.2.0/24 exact</code> jodo. Baaki sab 100 par rehta hai aur normal tie-breaks follow karta hai. Narrow match karo, kam badlo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy ko galat disha mein lagana: local preference import par aur prepending us neighbour ki taraf export par jise aap discourage karna chahte ho. Ek aur galti: ye bhool jaana ki aakhir mein reject ke bina export policy zyada routes jaane de sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Outbound control local preference (import); inbound control prepending ya MED (export), aur sirf salaah. Junos EBGP export par local AS khud jodta hai, aur policy extra copies jodti hai. Policy term order mein chalti hai aur accept ya reject par rukti hai.</p></div>

<div class="scn"><h4>Backup jo backup nahi tha</h4><p>Company ne doosre ISP ko kam local preference se "backup" banaya, par customers phir bhi inbound traffic ke liye use karte rahe kyunki dono ISPs ko prefix same AS path length ke saath mila. Fix backup advertisement par company ka AS prepend karna tha. Inbound traffic kuch minute mein primary ISP par chala gaya, aur primary link fail hone par backup available raha.</p><p><b>Lesson:</b> local preference aapka exit tay karti hai; prepending tay karta hai ki doosre kya dekhte hain.</p></div>

<div class="iv"><p class="q">"Ek ISP ko inbound aur outbound dono ke liye primary kaise banate ho?"</p><p>Outbound ke liye primary ISP se import kiye routes par zyada local preference set karta hoon. Inbound ke liye backup ISP ko advertisements par apna AS prepend karta hoon, taaki uska path lamba dikhe. Natija show route detail se apne router par, aur sambhav ho to ISP ki taraf, check karta hoon, aur Inactive reasons padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import par local preference outbound control karti hai; export par prepending (ya MED) inbound ko prabhavit karta hai.</li>
<li>Policy terms order mein chalte hain aur accept ya reject par rukte hain.</li>
<li>Default export sirf active BGP routes bhejta hai; locally originated ke liye policy chahiye.</li>
<li>Hamesha show route detail aur Inactive reason se verify karo.</li>
</ul></div>
`}};export{e as default};