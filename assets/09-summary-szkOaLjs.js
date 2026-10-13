var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You have built and operated a carrier-style IS-IS core on Junos next to IOS.</b> The checklist below summarises the JN0-364 IS-IS skills you should now have. Practise it again in the simulator labs jncissp-isis-core-build and jncissp-isis-overload, and revisit jncis-isis, jncip-isis and spcor-isis-design for more depth.</p>
<h3>Can-do checklist</h3>
<ul><li>Enable IS-IS on a Junos router: family iso on units, NET on lo0, interfaces under protocols isis.</li>
<li>Build a level-2-only core: level 1 disable, point-to-point links, lo0 passive.</li>
<li>Use wide-metrics-only and match it with metric-style wide on IOS.</li>
<li>Read show route and say the preference (L2 internal 18) and the metric.</li>
<li>Drain a router with overload and read the OL flag (0/0/1) on IOS.</li>
<li>Translate commands between Junos and IOS.</li>
<li>Troubleshoot in layers.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>NET</dt><dd>Network Entity Title: area plus system ID plus NSEL, an ISO address on lo0.</dd><dt>family iso</dt><dd>Junos statement that enables ISO frames on a unit.</dd><dt>Passive</dt><dd>Advertise the prefix without sending hellos.</dd><dt>Wide metrics</dt><dd>24-bit link and 32-bit path metrics in newer TLVs.</dd><dt>Preference</dt><dd>Junos value that chooses between routing protocols; L2 internal IS-IS is 18.</dd><dt>Overload bit</dt><dd>LSP flag that tells routers not to use this router for transit.</dd><dt>ATT/P/OL</dt><dd>IOS database column: Attached, Partition, Overload.</dd></dl>
<h3>Most tested facts</h3>
<ul><li>IS-IS only runs on Junos interfaces with family iso; the NET is configured on lo0.</li>
<li>Junos preferences: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165. IOS: 115.</li>
<li>Junos default interface metric 10 and sends both narrow and wide TLVs.</li>
<li>wide-metrics-only needs the IOS neighbour on metric-style wide (or transition).</li>
<li>Overload: set protocols isis overload (optional timeout); IOS set-overload-bit; visible as OL.</li></ul>
<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Junos</span>
show isis adjacency
show isis interface
show isis database
show route 10.30.255.1
set protocols isis overload
<span class="c">! IOS</span>
show isis neighbors
show isis database
show ip route isis
show ip route 10.31.255.13</pre>
<div class="eg"><p><b>Worked example.</b> Exam-style question: "Which preference does Junos assign to an IS-IS level-2 internal route?" Answer: 18. "How do you stop transit through a router while keeping it reachable?" Answer: set protocols isis overload.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix preference with metric, do not forget family iso, and do not assume IOS and Junos defaults match.</p></div>
<div class="scn"><h4>A routine maintenance night</h4><p>A carrier cycled through its core routers one by one. For each: set overload, verify the OL flag and the new transit path on a neighbour, upgrade, wait for adjacencies and LSPs, remove overload. Nothing was dropped and the same checklist ran for all routers.</p><p><b>Lesson:</b> A repeatable checklist beats improvisation.</p></div>
<div class="iv"><p class="q">"Summarise how you would roll out IS-IS on a new Juniper core router in an IOS network."</p><p>family iso on core units and lo0 with a unique NET, protocols isis with point-to-point core links and lo0 passive, level 1 disabled, wide-metrics-only after confirming IOS neighbours use wide metrics, authentication keys on both ends, then verify adjacencies, database and routes, and test overload for maintenance.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>You can build a level-2 Junos core with an IOS neighbour.</li>
<li>Know preferences, wide metrics and the overload bit.</li>
<li>Read both vendors' show output.</li>
<li>Troubleshoot by layers.</li>
<li>Use the labs to practise the commands.</li></ul></div>
`,hi:`
<p><b>Aapne Junos par IOS ke bagal mein carrier-style IS-IS core banaya aur chalaya.</b> Neeche ki checklist JN0-364 IS-IS skills ka summary hai jo ab aapke paas honi chahiye. Ise simulator labs jncissp-isis-core-build aur jncissp-isis-overload mein dobara practise karo, aur zyada depth ke liye jncis-isis, jncip-isis aur spcor-isis-design dekho.</p>
<h3>Can-do checklist</h3>
<ul><li>Junos router par IS-IS enable karo: units par family iso, lo0 par NET, interfaces protocols isis ke neeche.</li>
<li>Level-2-only core banao: level 1 disable, point-to-point links, lo0 passive.</li>
<li>wide-metrics-only use karo aur IOS par metric-style wide se match karo.</li>
<li>show route padho aur preference (L2 internal 18) aur metric batao.</li>
<li>Overload se router drain karo aur IOS par OL flag (0/0/1) padho.</li>
<li>Junos aur IOS ke beech commands translate karo.</li>
<li>Layers mein troubleshoot karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>NET</dt><dd>Network Entity Title: area plus system ID plus NSEL, lo0 par ISO address.</dd><dt>family iso</dt><dd>Junos statement jo unit par ISO frames enable karta hai.</dd><dt>Passive</dt><dd>Hellos bheje bina prefix advertise karo.</dd><dt>Wide metrics</dt><dd>Naye TLVs mein 24-bit link aur 32-bit path metrics.</dd><dt>Preference</dt><dd>Junos value jo routing protocols ke beech chunti hai; L2 internal IS-IS 18 hai.</dd><dt>Overload bit</dt><dd>LSP flag jo routers ko batata hai ki is router ko transit ke liye use na karo.</dd><dt>ATT/P/OL</dt><dd>IOS database column: Attached, Partition, Overload.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul><li>IS-IS sirf family iso wale Junos interfaces par chalta hai; NET lo0 par configure hota hai.</li>
<li>Junos preferences: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165. IOS: 115.</li>
<li>Junos default interface metric 10 aur narrow aur wide dono TLVs bhejta hai.</li>
<li>wide-metrics-only ke liye IOS neighbour metric-style wide (ya transition) par hona chahiye.</li>
<li>Overload: set protocols isis overload (optional timeout); IOS set-overload-bit; OL ke roop mein dikhta hai.</li></ul>
<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Junos</span>
show isis adjacency
show isis interface
show isis database
show route 10.30.255.1
set protocols isis overload
<span class="c">! IOS</span>
show isis neighbors
show isis database
show ip route isis
show ip route 10.31.255.13</pre>
<div class="eg"><p><b>Worked example.</b> Exam-style sawaal: "Junos IS-IS level-2 internal route ko kaunsi preference deta hai?" Jawab: 18. "Router ko reachable rakhte hue uske through transit kaise rokte ho?" Jawab: set protocols isis overload.</p></div>
<div class="exam"><p><b>Exam trap.</b> Preference ko metric se mat milao, family iso mat bhoolo, aur mat maano ki IOS aur Junos ke defaults match karte hain.</p></div>
<div class="scn"><h4>Ek routine maintenance raat</h4><p>Ek carrier ne apne core routers ko ek ek karke cycle kiya. Har ek ke liye: overload set karo, neighbour par OL flag aur naya transit path verify karo, upgrade karo, adjacencies aur LSPs ka intezaar karo, overload hatao. Kuch drop nahi hua aur saare routers ke liye wahi checklist chali.</p><p><b>Lesson:</b> Repeatable checklist improvisation se behtar hai.</p></div>
<div class="iv"><p class="q">"IOS network mein naye Juniper core router par IS-IS kaise roll out karoge, summarise karo."</p><p>Core units aur lo0 par family iso unique NET ke saath, protocols isis mein point-to-point core links aur lo0 passive, level 1 disabled, IOS neighbours ke wide metrics use karne ki confirmation ke baad wide-metrics-only, dono ends par authentication keys, phir adjacencies, database aur routes verify karo, aur maintenance ke liye overload test karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Aap IOS neighbour ke saath level-2 Junos core bana sakte ho.</li>
<li>Preferences, wide metrics aur overload bit jaano.</li>
<li>Dono vendors ka show output padho.</li>
<li>Layers se troubleshoot karo.</li>
<li>Commands practise karne ke liye labs use karo.</li></ul></div>
`}};export{e as default};