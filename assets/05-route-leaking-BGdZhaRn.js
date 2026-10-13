var e={id:`route-leaking`,h:{en:`Route leaking between levels and the up/down bit`,hi:`Levels ke beech route leaking aur up/down bit`},body:{en:`
<p>A Level 1 router has a tiny view of the world: its own area plus a default route toward the nearest attached border. That is exactly what you want for small access routers. The cost is that the exit may be a poor one. Route leaking is the controlled way to give Level 1 routers more detail without making them Level 2.</p>

<h3>The default behaviour</h3>
<p>Junos automatically advertises Level 1 internal routes up into Level 2. In the other direction nothing goes down by default: Level 2 routes are not copied into Level 1 LSPs. The Level 1 router sees one thing from the backbone, the Attached bit, and installs a default route toward the closest attached router. Here is R1 in the Nagpur lab before any policy:</p>
<pre class="out">lab@R1&gt; show route 172.20.4.10
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
0.0.0.0/0          *[IS-IS/15] 00:01:01, <span class="hl">metric 10</span>
                    &gt;  to 10.1.12.2 via ge-0/0/0.0</pre>
<p>The server LAN 172.20.4.0/24 has no specific route. R1 picks R2 because it is closest (metric 10), but R2's own uplink to the core has metric 100 and R3's has metric 10. Total distance through R2 is far worse. R1 cannot know, since it has only a default.</p>

<h3>Leaking with a policy</h3>
<p>You apply an export policy on each L1/L2 border that matches Level 2 routes and sends them into Level 1. The policy that the lab uses on R2 and R3 is below. This is real configuration output from the device:</p>
<pre class="out">lab@R2&gt; show configuration policy-options
policy-statement LEAK-DC {
    term dc {
        from {
            protocol isis;
            route-filter 172.20.0.0/16 orlonger;
            <span class="hl">level 2;</span>
        }
        to {
            <span class="hl">level 1;</span>
        }
        then {
            accept;
        }
    }
}</pre>
<p>Three details matter. <code>from level 2</code> restricts the match to routes learned at Level 2. <code>to level 1</code> says the result goes into the Level 1 LSP. The route-filter keeps the leak narrow: only the data-centre range, not the whole backbone table. The policy is attached with <code>set protocols isis export LEAK-DC</code>.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Leak from level 2 to level 1">
<rect x="20" y="30" width="200" height="140" rx="14" fill="#bae6fd" opacity="0.7"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">Level 1 area</text>
<rect x="420" y="30" width="200" height="140" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<circle cx="80" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="80" y="114" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="110" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="500" y="92" width="100" height="36" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="550" y="115" text-anchor="middle" class="svg-ink" font-size="12">172.20.4.0/24</text>
<line x1="102" y1="110" x2="294" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="346" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M480 78 L170 78" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-dasharray="6 4"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">leak: Level 2 to Level 1, marked Down</text>
</svg><p class="cap">The border re-advertises a backbone prefix into Level 1 with the Down bit set.</p></div>

<h3>The up/down bit</h3>
<p>If a route is leaked from Level 2 into Level 1, the border sets the <b>Down</b> bit on it. The rule is simple: a Level 1/Level 2 router must never take a route that carries the Down bit from a Level 1 LSP and re-advertise it into Level 2. That stops a loop in which a prefix goes up, down and up again. Internal Level 1 routes have the Up bit and are leaked into Level 2 normally. You can see both in the database detail of R1 after the policy:</p>
<pre class="out">lab@R1&gt; show isis database detail
R2.00-00 Sequence: 0x2, Checksum: 0xb977, Lifetime: 1148 secs
   IS neighbor: R1.00                          Metric:       10
   IP prefix: 10.1.12.0/24                     Metric:       10 Internal Up
   IP prefix: 10.1.255.2/32                    Metric:        0 Internal Up
   IP prefix: 172.20.4.0/24                    Metric:      110 Internal <span class="hl">Down</span>

R3.00-00 Sequence: 0x2, Checksum: 0x24b3, Lifetime: 1152 secs
   IS neighbor: R1.00                          Metric:       20
   IP prefix: 10.1.13.0/24                     Metric:       20 Internal Up
   IP prefix: 10.1.255.3/32                    Metric:        0 Internal Up
   IP prefix: 172.20.4.0/24                    Metric:       20 Internal <span class="hl">Down</span></pre>
<p>The sequence numbers went from 0x1 to 0x2 because both borders re-originated their LSPs. Each border now offers the server LAN with a different metric: 110 through R2, 20 through R3. The result on R1:</p>
<pre class="out">lab@R1&gt; show route protocol isis
0.0.0.0/0          *[IS-IS/15] 00:02:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.2/32      *[IS-IS/15] 00:02:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.3/32      *[IS-IS/15] 00:02:02, metric 20
                    &gt;  to 10.1.13.3 via ge-0/0/1.0
172.20.4.0/24      *[IS-IS/15] 00:00:49, metric 40
                    &gt;  to 10.1.13.3 via ge-0/0/1.0

lab@R1&gt; traceroute 172.20.4.10 no-resolve
 1  10.1.13.3 (10.1.13.3)  2.900 ms  1.300 ms  2.000 ms
 2  10.1.34.4 (10.1.34.4)  1.900 ms  2.600 ms  1.000 ms
 3  172.20.4.10 (172.20.4.10)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>The default route stays, as a fallback. The leaked prefix takes precedence by longest match and goes through R3 and R4, which is the best exit. Note the preference stays 15 because the route is still a Level 1 route in R1's table.</p>

<h3>The attached bit and leaking go together</h3>
<p>If you leak enough specific routes, Level 1 routers no longer need a default. You may then choose to ignore the Attached bit with <code>ignore-attached-bit</code> on Level 1 routers (shown here as a configuration idea, not from the simulator) so that a stray L1/L2 router cannot attract the whole area's traffic by advertising it.</p>

<div class="eg"><p><b>Worked example.</b> You want R1 to reach 172.20.4.0/24 through R3, but a tester asks why R1 still has 0.0.0.0/0. Show that both exist: the default is a fallback, and the specific route wins by longest prefix match. Delete the leak policy and R1 returns to the default only.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaking with <code>route-filter 0.0.0.0/0 orlonger</code> or without any filter. The whole Level 2 table floods into every Level 1 area and the area is no longer small. Always keep a narrow filter.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level 1 to Level 2 is automatic, but Level 2 to Level 1 needs an export policy with <code>from level 2</code> and <code>to level 1</code>. The routes arrive in Level 1 flagged Down.</p></div>

<div class="scn"><h4>Everything went through the slow border</h4><p>A retail chain had two L1/L2 borders: one on a fast fibre ring, one on a slow backup circuit. Every store router chose the closest border by metric, and half of them sent traffic to head office over the slow circuit. Leaking just the head-office prefix gave stores enough information to compare full path costs.</p><p><b>Lesson:</b> a default route chooses the nearest exit; leaking chooses the best one.</p></div>

<div class="iv"><p class="q">"Why does a leaked route carry the Down bit?"</p><p>The Down bit tells L1/L2 routers that the route came down from Level 2. They must not advertise it back up into Level 2. Without it, a prefix could cycle between levels and form a loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L1 to L2 leaking is automatic; L2 to L1 needs an export policy.</li>
<li>Use from level 2, to level 1 and a narrow route-filter.</li>
<li>Leaked routes carry the Down bit and are never re-advertised upward.</li>
<li>Specific leaked routes beat the default from the attached bit.</li>
<li>show isis database detail shows Up and Down per prefix.</li>
</ul></div>
`,hi:`
<p>Level 1 router ka duniya ka nazariya bahut chhota hota hai: apna area aur sabse nazdeeki attached border ki taraf default route. Chhote access routers ke liye bilkul yahi chahiye. Keemat yeh hai ki exit kharab ho sakta hai. Route leaking Level 1 routers ko unhe Level 2 banaye bina zyada detail dene ka niyantrit tareeka hai.</p>

<h3>Default behaviour</h3>
<p>Junos Level 1 internal routes ko apne aap Level 2 mein upar advertise karta hai. Doosri taraf default mein kuch neeche nahi jata: Level 2 routes Level 1 LSPs mein copy nahi hote. Level 1 router backbone se ek hi cheez dekhta hai, Attached bit, aur sabse nazdeeki attached router ki taraf default route install karta hai. Yeh Nagpur lab mein kisi policy se pehle R1 hai:</p>
<pre class="out">lab@R1&gt; show route 172.20.4.10
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
0.0.0.0/0          *[IS-IS/15] 00:01:01, <span class="hl">metric 10</span>
                    &gt;  to 10.1.12.2 via ge-0/0/0.0</pre>
<p>Server LAN 172.20.4.0/24 ke liye koi specific route nahi hai. R1 R2 chunta hai kyunki woh sabse nazdeek (metric 10) hai, par R2 ka apna core uplink metric 100 ka hai aur R3 ka 10 ka. R2 se total doori bahut buri hai. R1 jaan nahi sakta kyunki uske paas sirf default hai.</p>

<h3>Policy se leaking</h3>
<p>Har L1/L2 border par export policy lagate ho jo Level 2 routes ko match karke Level 1 mein bhejti hai. Lab R2 aur R3 par jo policy use karta hai woh neeche hai. Yeh device ka real configuration output hai:</p>
<pre class="out">lab@R2&gt; show configuration policy-options
policy-statement LEAK-DC {
    term dc {
        from {
            protocol isis;
            route-filter 172.20.0.0/16 orlonger;
            <span class="hl">level 2;</span>
        }
        to {
            <span class="hl">level 1;</span>
        }
        then {
            accept;
        }
    }
}</pre>
<p>Teen details maayne rakhti hain. <code>from level 2</code> match ko Level 2 se seekhe routes tak rokta hai. <code>to level 1</code> kehta hai ki result Level 1 LSP mein jaye. Route-filter leak ko patla rakhta hai: sirf data-centre range, poori backbone table nahi. Policy <code>set protocols isis export LEAK-DC</code> se lagti hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Leak from level 2 to level 1">
<rect x="20" y="30" width="200" height="140" rx="14" fill="#bae6fd" opacity="0.7"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">Level 1 area</text>
<rect x="420" y="30" width="200" height="140" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<circle cx="80" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="80" y="114" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="110" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="500" y="92" width="100" height="36" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="550" y="115" text-anchor="middle" class="svg-ink" font-size="12">172.20.4.0/24</text>
<line x1="102" y1="110" x2="294" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="346" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M480 78 L170 78" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-dasharray="6 4"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">leak: Level 2 se Level 1, Down mark</text>
</svg><p class="cap">Border ek backbone prefix ko Down bit ke saath Level 1 mein dobara advertise karta hai.</p></div>

<h3>Up/down bit</h3>
<p>Agar route Level 2 se Level 1 mein leak hota hai, to border us par <b>Down</b> bit set karta hai. Rule simple hai: Level 1/Level 2 router ko Down bit wale route ko Level 1 LSP se uthakar Level 2 mein dobara advertise nahi karna chahiye. Isse loop rukta hai jisme prefix upar, neeche aur phir upar chakkar lagata. Internal Level 1 routes par Up bit hota hai aur woh normally Level 2 mein leak hote hain. Policy ke baad R1 ke database detail mein dono dikhte hain:</p>
<pre class="out">lab@R1&gt; show isis database detail
R2.00-00 Sequence: 0x2, Checksum: 0xb977, Lifetime: 1148 secs
   IS neighbor: R1.00                          Metric:       10
   IP prefix: 10.1.12.0/24                     Metric:       10 Internal Up
   IP prefix: 10.1.255.2/32                    Metric:        0 Internal Up
   IP prefix: 172.20.4.0/24                    Metric:      110 Internal <span class="hl">Down</span>

R3.00-00 Sequence: 0x2, Checksum: 0x24b3, Lifetime: 1152 secs
   IS neighbor: R1.00                          Metric:       20
   IP prefix: 10.1.13.0/24                     Metric:       20 Internal Up
   IP prefix: 10.1.255.3/32                    Metric:        0 Internal Up
   IP prefix: 172.20.4.0/24                    Metric:       20 Internal <span class="hl">Down</span></pre>
<p>Sequence numbers 0x1 se 0x2 ho gaye kyunki dono borders ne apne LSPs dobara banaye. Ab har border server LAN alag metric se offer karta hai: R2 ke through 110, R3 ke through 20. R1 par result:</p>
<pre class="out">lab@R1&gt; show route protocol isis
0.0.0.0/0          *[IS-IS/15] 00:02:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.2/32      *[IS-IS/15] 00:02:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.3/32      *[IS-IS/15] 00:02:02, metric 20
                    &gt;  to 10.1.13.3 via ge-0/0/1.0
172.20.4.0/24      *[IS-IS/15] 00:00:49, metric 40
                    &gt;  to 10.1.13.3 via ge-0/0/1.0

lab@R1&gt; traceroute 172.20.4.10 no-resolve
 1  10.1.13.3 (10.1.13.3)  2.900 ms  1.300 ms  2.000 ms
 2  10.1.34.4 (10.1.34.4)  1.900 ms  2.600 ms  1.000 ms
 3  172.20.4.10 (172.20.4.10)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>Default route fallback ke roop mein rehta hai. Leak hua prefix longest match se jeetta hai aur R3 tatha R4 ke through jata hai, jo best exit hai. Dhyan do ki preference 15 hi rehti hai kyunki R1 ki table mein route abhi bhi Level 1 route hai.</p>

<h3>Attached bit aur leaking saath chalte hain</h3>
<p>Agar aap kaafi specific routes leak karte ho, to Level 1 routers ko default ki zaroorat nahi rehti. Tab aap Level 1 routers par <code>ignore-attached-bit</code> chun sakte ho (yahan configuration idea ke roop mein, simulator se nahi) taaki koi bhatka hua L1/L2 router apne aap ko advertise karke poore area ka traffic na kheench le.</p>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho ki R1 172.20.4.0/24 ko R3 ke through pahunche, par tester poochta hai ki R1 ke paas abhi bhi 0.0.0.0/0 kyun hai. Dikhao ki dono hain: default fallback hai, aur specific route longest prefix match se jeetta hai. Leak policy hata do to R1 sirf default par laut jata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>route-filter 0.0.0.0/0 orlonger</code> ya bina kisi filter ke leak karna. Poori Level 2 table har Level 1 area mein flood ho jati hai aur area chhota nahi rehta. Hamesha patla filter rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level 1 se Level 2 automatic hai, par Level 2 se Level 1 ke liye <code>from level 2</code> aur <code>to level 1</code> wali export policy chahiye. Routes Level 1 mein Down flag ke saath aate hain.</p></div>

<div class="scn"><h4>Sab kuch slow border se gaya</h4><p>Ek retail chain ke do L1/L2 borders the: ek fast fibre ring par, ek slow backup circuit par. Har store router metric se sabse nazdeeki border chunta tha, aur aadhe stores head office ka traffic slow circuit se bhejte the. Sirf head-office prefix leak karne se stores ko poore path costs compare karne layak information mil gayi.</p><p><b>Lesson:</b> default route nazdeeki exit chunta hai; leaking best exit chunta hai.</p></div>

<div class="iv"><p class="q">"Leak hue route par Down bit kyun hota hai?"</p><p>Down bit L1/L2 routers ko batata hai ki route Level 2 se neeche aaya hai. Unhe use wapas Level 2 mein advertise nahi karna chahiye. Iske bina prefix levels ke beech chakkar lagakar loop bana sakta tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L1 se L2 leaking automatic hai; L2 se L1 ke liye export policy chahiye.</li>
<li>from level 2, to level 1 aur patla route-filter use karo.</li>
<li>Leak hue routes Down bit ke saath hote hain aur upar dobara advertise nahi hote.</li>
<li>Specific leak hue routes attached bit ke default ko harate hain.</li>
<li>show isis database detail har prefix par Up aur Down dikhata hai.</li>
</ul></div>
`}};export{e as default};