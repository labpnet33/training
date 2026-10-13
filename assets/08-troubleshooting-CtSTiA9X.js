var e={id:`troubleshooting`,h:{en:`Troubleshooting IS-IS: adjacencies first, then the database, then routes`,hi:`IS-IS troubleshooting: pehle adjacencies, phir database, phir routes`},body:{en:`
<p>IS-IS faults fall into three layers, and you work from the bottom: <b>adjacency</b> (do neighbours form?), <b>database</b> (do the right LSPs exist?), and <b>routes</b> (does SPF install what you expect, with the preference you expect?). Skipping a layer wastes time. This chapter uses two faults captured on the Nagpur lab device, the same method you learned in the Start here module.</p>

<h3>Layer 1: the adjacency checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Command</th><th>Typical finding</th></tr>
<tr><td>Is the iso family on the interface?</td><td>show isis interface</td><td>Interface missing from the list</td></tr>
<tr><td>Does the NET exist, and do areas match for L1?</td><td>show isis overview</td><td>Areaid differs between neighbours</td></tr>
<tr><td>Are the levels compatible?</td><td>show isis adjacency</td><td>L column shows the wrong level, or no row</td></tr>
<tr><td>Same circuit type and metrics style?</td><td>show isis interface, show isis overview</td><td>p2p on one side only; narrow versus wide</td></tr>
<tr><td>What did the router log?</td><td>show log messages</td><td>ADJDOWN with the reason</td></tr></table>
<p>The messages that matter use the pattern RPD_ISIS_ADJUP and RPD_ISIS_ADJDOWN, with a reason such as Hold Time Expired.</p>

<h3>Fault 1: the area ID changed on a Level 1 router</h3>
<p>An engineer edits the NET on R1 and, by mistake, changes the area from 49.0001 to 49.0009. R1 is Level 1 only, so its neighbours now see a hello from a different area. After the hold time passes:</p>
<pre class="out">lab@R1&gt; show isis adjacency

lab@R1&gt; show isis overview
Instance: master
  Router ID: 10.1.255.1
  Hostname: R1
  Sysid: 0100.0125.5001
  Areaid: <span class="hl">49.0009</span>
  Level 1
    Internal route preference: 15
    External route preference: 160
    Wide metrics are enabled, Narrow metrics are enabled
  Level 2
    Disabled

lab@R1&gt; show log messages | last 6
Oct  1 23:57:31  R1 mgd[1147]: UI_COMMIT: User 'lab' requested 'commit' operation
Oct  1 23:57:49  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R2 on ge-0/0/0.0, <span class="hl">reason: Hold Time Expired</span>
Oct  1 23:57:53  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R3 on ge-0/0/1.0, reason: Hold Time Expired</pre>
<p>The adjacency table is empty. The overview shows the new area, and that Level 2 is disabled, which explains why R1 cannot fall back to a Level 2 adjacency. Look at the other side:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/1.0            R4             2 Up                   19

lab@R2&gt; show log messages | last 6
Oct  1 23:57:53  R2 rpd[1197]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R1 on ge-0/0/0.0, reason: Hold Time Expired</pre>
<p>R2 still has its Level 2 adjacency to R4, so the core is fine. It only lost the Level 1 neighbour R1. A rollback returns the NET:</p>
<pre class="out">lab@R1# rollback 1
load complete
lab@R1# commit and-quit
commit complete</pre>

<h3>Fault 2: the iso family was removed from one interface</h3>
<p>Next the engineer deletes <code>family iso</code> from R1's ge-0/0/0. The result is quieter, since R1 still has a path through R3:</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/1.0            R3             1 Up                   19

lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/1.0            1   0x2 Point to Point    Disabled                 20/10
lo0.0                 0   0x7 Passive           Disabled                   0/0</pre>
<p>The tell-tale sign: <code>show isis interface</code> no longer lists ge-0/0/0.0 at all. An interface that is up and pingable but missing from this list has no iso family or is not in the IS-IS interface list. The log carries the event:</p>
<pre class="out">lab@R1&gt; show log messages | last 6
Oct  1 23:57:49  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R2 on ge-0/0/0.0, reason: Hold Time Expired
Oct  1 23:57:53  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R3 on ge-0/0/1.0, reason: Hold Time Expired
Oct  1 23:58:38  R1 rpd[1140]: <span class="hl">RPD_ISIS_ADJUP</span>: IS-IS new L1 adjacency to R3 on ge-0/0/1.0</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting layers">
<rect x="20" y="30" width="190" height="90" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="14">1 Adjacency</text><text x="115" y="84" text-anchor="middle" class="svg-muted" font-size="11">interface, NET, levels, log</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#fde68a" stroke="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">2 Database</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">LSPs, attributes, detail</text>
<rect x="430" y="30" width="190" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="14">3 Routes</text><text x="525" y="84" text-anchor="middle" class="svg-muted" font-size="11">preference, metric, policy</text>
<line x1="210" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Work upward from the adjacency; each layer depends on the one before it.</p></div>

<h3>Layer 2 and 3: when adjacencies are fine</h3>
<p>If the adjacency is Up, read the database. <code>show isis database</code> must list the LSP of every router in the level. Compare sequence numbers on two routers: equal numbers mean a synchronised database. Use <code>show isis database detail</code> to read prefixes and check Up or Down, Internal or External. Then check routes with <code>show route protocol isis</code> and read the preference, which tells you whether the winner is internal (15 or 18), external (160 or 165) or another protocol altogether. Remember that preference 15 and 18 apply to Internal routes only.</p>
<p>A note on authentication: IS-IS can authenticate hellos (per interface) and LSPs (per level) with a key. A key mismatch gives no adjacency or LSP drops, much like OSPF. In this educational simulator the interface authentication commands are not accepted (they return a syntax error), so this chapter only gives the idea: compare the configured authentication on both sides, and expect hold-time-expired style logs with no useful reason when keys differ.</p>

<div class="eg"><p><b>Worked example.</b> A user cannot reach 172.20.4.10 from R1 after a change. Layer 1: <code>show isis adjacency</code> lists R2 and R3 at L=1 Up. Layer 2: <code>show isis database detail</code> shows 172.20.4.0/24 only from R3. Layer 3: <code>show route 172.20.4.10</code> hits the default through R2. Cause: the leak policy was removed from R2, the specific route comes only from R3 with a higher metric. You restore the policy and the route returns.</p></div>

<div class="warn"><p><b>Common mistake.</b> Debugging routing policy while the adjacency is down. A missing route is a symptom; always run the three layers in order before you touch a policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> A Level 2 adjacency with a mismatched area can look healthy while the Level 1 adjacency fails. Read the L column, not only the State column.</p></div>

<div class="scn"><h4>Half the stores lost their default</h4><p>After a core upgrade several branch routers lost their default route. Their L1 databases were fine, but no router in the area was marked Attached. The L2 adjacency on both borders had been lost to a mismatched metric style, so the borders stopped setting the Attached bit. Fixing the style restored the default everywhere.</p><p><b>Lesson:</b> a missing default in Level 1 often points at a Level 2 problem on the border.</p></div>

<div class="iv"><p class="q">"R1 and R2 are directly connected and pingable, but show isis adjacency is empty. What do you check?"</p><p>First show isis interface: is the interface listed, so is family iso configured? Then the NET and levels on both ends with show isis overview, matching area IDs for Level 1, point-to-point on both sides, metric styles, then show log messages for the adjacency events and reasons.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: adjacency, database, routes.</li>
<li>show isis interface missing an interface means family iso or the interface list.</li>
<li>Area ID mismatch breaks Level 1 only; Level 2 can stay up.</li>
<li>RPD_ISIS_ADJDOWN and ADJUP log lines carry the reason.</li>
<li>Check the Attached flag and preference when a default or a route is wrong.</li>
</ul></div>
`,hi:`
<p>IS-IS faults teen layers mein aate hain, aur aap neeche se kaam karte ho: <b>adjacency</b> (neighbours bante hain?), <b>database</b> (sahi LSPs maujood hain?), aur <b>routes</b> (SPF wahi install karta hai jo aap expect karte ho, expected preference ke saath?). Koi layer chhodna samay barbaad karta hai. Yeh chapter Nagpur lab device par capture kiye do faults use karta hai, wahi method jo aapne Start here module mein seekha.</p>

<h3>Layer 1: adjacency checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Command</th><th>Typical finding</th></tr>
<tr><td>Interface par iso family hai?</td><td>show isis interface</td><td>Interface list se gayab</td></tr>
<tr><td>NET hai, aur L1 ke liye areas match?</td><td>show isis overview</td><td>Neighbours ke beech Areaid alag</td></tr>
<tr><td>Levels compatible hain?</td><td>show isis adjacency</td><td>L column mein galat level, ya row hi nahi</td></tr>
<tr><td>Same circuit type aur metrics style?</td><td>show isis interface, show isis overview</td><td>Sirf ek side p2p; narrow versus wide</td></tr>
<tr><td>Router ne kya log kiya?</td><td>show log messages</td><td>Reason ke saath ADJDOWN</td></tr></table>
<p>Jo messages maayne rakhte hain woh RPD_ISIS_ADJUP aur RPD_ISIS_ADJDOWN pattern ke hote hain, Hold Time Expired jaise reason ke saath.</p>

<h3>Fault 1: Level 1 router par area ID badal gaya</h3>
<p>Engineer R1 par NET edit karta hai aur galti se area 49.0001 se 49.0009 kar deta hai. R1 sirf Level 1 hai, isliye uske neighbours ko ab alag area ka hello dikhta hai. Hold time guzarne ke baad:</p>
<pre class="out">lab@R1&gt; show isis adjacency

lab@R1&gt; show isis overview
Instance: master
  Router ID: 10.1.255.1
  Hostname: R1
  Sysid: 0100.0125.5001
  Areaid: <span class="hl">49.0009</span>
  Level 1
    Internal route preference: 15
    External route preference: 160
    Wide metrics are enabled, Narrow metrics are enabled
  Level 2
    Disabled

lab@R1&gt; show log messages | last 6
Oct  1 23:57:31  R1 mgd[1147]: UI_COMMIT: User 'lab' requested 'commit' operation
Oct  1 23:57:49  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R2 on ge-0/0/0.0, <span class="hl">reason: Hold Time Expired</span>
Oct  1 23:57:53  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R3 on ge-0/0/1.0, reason: Hold Time Expired</pre>
<p>Adjacency table khaali hai. Overview naya area aur Level 2 disabled dikhata hai, jo samjhata hai ki R1 Level 2 adjacency par fall back kyun nahi kar sakta. Doosri taraf dekho:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/1.0            R4             2 Up                   19

lab@R2&gt; show log messages | last 6
Oct  1 23:57:53  R2 rpd[1197]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R1 on ge-0/0/0.0, reason: Hold Time Expired</pre>
<p>R2 ki R4 se Level 2 adjacency abhi bhi hai, isliye core theek hai. Usne sirf Level 1 neighbour R1 khoya. Rollback NET wapas laata hai:</p>
<pre class="out">lab@R1# rollback 1
load complete
lab@R1# commit and-quit
commit complete</pre>

<h3>Fault 2: ek interface se iso family hat gayi</h3>
<p>Ab engineer R1 ke ge-0/0/0 se <code>family iso</code> delete karta hai. Result shaant hai, kyunki R1 ke paas R3 ke through raasta hai:</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/1.0            R3             1 Up                   19

lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/1.0            1   0x2 Point to Point    Disabled                 20/10
lo0.0                 0   0x7 Passive           Disabled                   0/0</pre>
<p>Pehchaan: <code>show isis interface</code> mein ab ge-0/0/0.0 hai hi nahi. Jo interface up aur pingable ho par is list se gayab ho usme iso family nahi hai ya woh IS-IS interface list mein nahi hai. Log event batata hai:</p>
<pre class="out">lab@R1&gt; show log messages | last 6
Oct  1 23:57:49  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R2 on ge-0/0/0.0, reason: Hold Time Expired
Oct  1 23:57:53  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R3 on ge-0/0/1.0, reason: Hold Time Expired
Oct  1 23:58:38  R1 rpd[1140]: <span class="hl">RPD_ISIS_ADJUP</span>: IS-IS new L1 adjacency to R3 on ge-0/0/1.0</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting layers">
<rect x="20" y="30" width="190" height="90" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="14">1 Adjacency</text><text x="115" y="84" text-anchor="middle" class="svg-muted" font-size="11">interface, NET, levels, log</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#fde68a" stroke="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">2 Database</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">LSPs, attributes, detail</text>
<rect x="430" y="30" width="190" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="14">3 Routes</text><text x="525" y="84" text-anchor="middle" class="svg-muted" font-size="11">preference, metric, policy</text>
<line x1="210" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Adjacency se upar ki taraf kaam karo; har layer pichhli par nirbhar hai.</p></div>

<h3>Layer 2 aur 3: jab adjacencies theek hon</h3>
<p>Adjacency Up ho to database padho. <code>show isis database</code> mein level ke har router ka LSP hona chahiye. Do routers par sequence numbers compare karo: barabar numbers matlab synchronised database. Prefixes padhne aur Up ya Down, Internal ya External dekhne ke liye <code>show isis database detail</code> use karo. Phir <code>show route protocol isis</code> se routes check karo aur preference padho, jo batati hai ki winner internal (15 ya 18), external (160 ya 165) ya bilkul doosra protocol hai. Yaad rakho ki preference 15 aur 18 sirf Internal routes par lagti hain.</p>
<p>Authentication par ek note: IS-IS hellos (per interface) aur LSPs (per level) ko key se authenticate kar sakta hai. Key mismatch se adjacency nahi banti ya LSPs drop hote hain, OSPF ki tarah. Is educational simulator mein interface authentication commands accept nahi hote (syntax error dete hain), isliye yeh chapter sirf idea deta hai: dono sides par configured authentication compare karo, aur keys alag hon to bina kaam ke reason wale hold-time-expired type logs expect karo.</p>

<div class="eg"><p><b>Worked example.</b> Change ke baad user R1 se 172.20.4.10 tak nahi pahunch pata. Layer 1: <code>show isis adjacency</code> R2 aur R3 ko L=1 Up dikhata hai. Layer 2: <code>show isis database detail</code> mein 172.20.4.0/24 sirf R3 se hai. Layer 3: <code>show route 172.20.4.10</code> R2 ke through default hit karta hai. Cause: R2 se leak policy hat gayi thi, specific route sirf R3 se ucche metric ke saath aata hai. Policy restore karte ho aur route wapas aa jata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adjacency down hote hue routing policy debug karna. Missing route ek symptom hai; policy chhune se pehle hamesha teen layers order mein chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mismatched area wali Level 2 adjacency theek dikh sakti hai jabki Level 1 adjacency fail ho. Sirf State column nahi, L column padho.</p></div>

<div class="scn"><h4>Aadhe stores ka default gaya</h4><p>Core upgrade ke baad kai branch routers ka default route chala gaya. Unke L1 databases theek the, par area mein koi router Attached mark nahi tha. Dono borders par L2 adjacency mismatched metric style se gir gayi thi, isliye borders ne Attached bit set karna band kar diya. Style theek karne se har jagah default wapas aa gaya.</p><p><b>Lesson:</b> Level 1 mein default ka gayab hona aksar border par Level 2 problem dikhata hai.</p></div>

<div class="iv"><p class="q">"R1 aur R2 seedhe jude hain aur pingable hain, par show isis adjacency khaali hai. Kya check karoge?"</p><p>Pehle show isis interface: interface listed hai, yani family iso configured hai? Phir show isis overview se dono ends par NET aur levels, Level 1 ke liye matching area IDs, dono sides par point-to-point, metric styles, phir adjacency events aur reasons ke liye show log messages.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: adjacency, database, routes.</li>
<li>show isis interface mein interface ka gayab hona family iso ya interface list ka sanket hai.</li>
<li>Area ID mismatch sirf Level 1 todta hai; Level 2 up reh sakta hai.</li>
<li>RPD_ISIS_ADJDOWN aur ADJUP log lines reason rakhti hain.</li>
<li>Default ya route galat ho to Attached flag aur preference check karo.</li>
</ul></div>
`}};export{e as default};