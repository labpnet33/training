var e={id:`mixed-vendor`,h:{en:`Mixed Cisco and Junos cores and safe migration to wide`,hi:`Mixed Cisco aur Junos cores aur wide par safe migration`},body:{en:`
<p>Real providers rarely buy from one vendor. A core with Cisco IOS XE and Junos routers is normal, and IS-IS is the protocol that makes it work, because it is an open standard. The differences you must know are small but sharp: defaults, command names, and where each vendor puts a setting.</p>

<h3>Analogy: two electricians, one house</h3>
<p>Two electricians wire the same house with the same wires but label the switches differently. One calls it "light 1", the other "kitchen". If you only read one label system you lose track. Your job as designer is to keep a <b>translation table</b>.</p>

<table class="cmp"><tr><th>Item</th><th>Cisco IOS XE</th><th>Junos</th></tr>
<tr><td>Default metric style</td><td>narrow</td><td>sends and reads both (until wide-metrics-only is set)</td></tr>
<tr><td>Wide only</td><td>metric-style wide</td><td>level 2 wide-metrics-only</td></tr>
<tr><td>Default interface metric</td><td>10</td><td>10 (the lab shows 10/10)</td></tr>
<tr><td>Point-to-point</td><td>isis network point-to-point</td><td>interface x point-to-point</td></tr>
<tr><td>Loopback advertised</td><td>passive-interface or isis on lo0</td><td>interface lo0.0 passive</td></tr>
<tr><td>Level restriction</td><td>is-type level-2-only</td><td>level 1 disable</td></tr>
<tr><td>Route preference</td><td>AD 115</td><td>preference 18 (L2 internal)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Migration path from narrow to wide">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 1</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="11">all narrow</text>
<rect x="245" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 2</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">transition everywhere</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 3</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="11">wide everywhere</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="95" x2="245" y2="95"/><line x1="395" y1="95" x2="470" y2="95"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">verify with show isis database detail at each step</text>
</svg><p class="cap">The standard migration: narrow, transition, wide. Verify before moving on.</p></div>

<h3>Junos side of the first lab</h3>
<p>On the lab's Juniper routers, the configuration is level 1 disabled and level 2 wide-metrics-only. Real output from JR1:</p>
<pre class="out">JR1&gt; show configuration protocols isis
interface ge-0/0/0.0 {
    point-to-point;
}
interface ge-0/0/1.0 {
    point-to-point;
}
interface lo0.0 {
    passive;
}
level 1 {
    disable;
}
level 2 {
    <span class="hl">wide-metrics-only;</span>
}

JR1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0</pre>
<p>This output was captured after the lab solution, but the Junos configuration is the same before it: only the Cisco side was wrong.</p>

<h3>Cisco side after the fix</h3>
<pre class="out">R1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0001.00
 is-type level-2-only
 <span class="hl">metric-style wide</span>

R1# show isis neighbors
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        UP    25       00
R2              L2   Gi0/1         10.2.4.1        UP    24       00</pre>
<p>(Output shortened: the Tag null line is omitted.) And Junos sees the ECMP to R2's loopback across both neighbours, with preference 18 instead of Cisco's 115:</p>
<pre class="out">JR1&gt; show route protocol isis
10.2.255.2/32      *[IS-IS/18] 00:00:56, metric 20
                    &gt;  to 10.2.1.1 via ge-0/0/0.0
                       to 10.2.2.2 via ge-0/0/1.0</pre>

<h3>A safe migration runbook</h3>
<p>Reference procedure, not simulator output: (1) on every router set <code>metric-style transition</code> (or wide transition), which both reads and sends both styles; (2) confirm the database shows both families and that routes are unchanged; (3) move router by router to <code>metric-style wide</code>; (4) when all routers are wide, confirm nothing narrow remains and remove transition. Each step must be reversible and done in a change window, and you should verify the route count before and after.</p>

<div class="eg"><p><b>Worked example.</b> Note the number of IS-IS routes on a PE before the change. It must be the same after step 2 (transition) and after step 3 on the PE. Any drop means a neighbour still reads only narrow. Compare the count at every step.</p></div>
<div class="warn"><p><b>Common mistake.</b> Moving half the routers straight from narrow to wide. The wide-only routers become invisible to the narrow ones, and the narrow ones are invisible to wide-only routers, splitting the SPF view during the change.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos reads and sends both styles by default; Cisco IOS XE sends narrow by default. So a Cisco-only core runs, a Junos addition with wide-metrics-only breaks it, and a Junos addition at default might not be noticed. Know the order of the migration steps.</p></div>

<div class="scn"><h4>The Friday wide switch</h4><p>An engineer switched ten PEs to wide on a Friday evening in one batch. Two P routers were still narrow. The PEs lost the P loopbacks and the LDP and BGP sessions flapped. Rolling back to transition on the PEs restored everything. Next time the P routers were moved to transition first.</p><p><b>Lesson:</b> transition first, everywhere, then wide.</p></div>

<div class="iv"><p class="q">"How do you migrate a live IS-IS core from narrow to wide without an outage?"</p><p>Enable transition on every router so each side sends and reads both styles. Verify the database and the route count. Then move router by router to wide, checking again at each step, and finally remove transition. Never jump half of the routers directly to wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mixed Cisco and Junos cores work because IS-IS is a standard; defaults differ.</li>
<li>IOS XE defaults to narrow; Junos wide-metrics-only is set per level.</li>
<li>Migrate narrow, transition, wide with verification at every step.</li>
<li>Route preference: Cisco 115 versus Junos 18 for L2 internal.</li>
<li>Keep a vendor translation table in your design document.</li>
</ul></div>
`,hi:`
<p>Real providers shayad hi ek hi vendor se kharidte hain. Cisco IOS XE aur Junos routers wala core normal hai, aur IS-IS woh protocol hai jo ise chalata hai, kyunki yeh open standard hai. Jo differences aapko jaanne zaroori hain woh chhote par tez hain: defaults, command names, aur har vendor setting kahan rakhta hai.</p>

<h3>Analogy: do electricians, ek ghar</h3>
<p>Do electricians ek hi ghar mein same wires se wiring karte hain par switches ko alag label karte hain. Ek kehta hai "light 1", doosra "kitchen". Agar sirf ek label system padho to track kho doge. Designer ka kaam hai ek <b>translation table</b> rakhna.</p>

<table class="cmp"><tr><th>Item</th><th>Cisco IOS XE</th><th>Junos</th></tr>
<tr><td>Default metric style</td><td>narrow</td><td>dono bhejta aur padhta hai (jab tak wide-metrics-only na ho)</td></tr>
<tr><td>Sirf wide</td><td>metric-style wide</td><td>level 2 wide-metrics-only</td></tr>
<tr><td>Default interface metric</td><td>10</td><td>10 (lab mein 10/10 dikhta hai)</td></tr>
<tr><td>Point-to-point</td><td>isis network point-to-point</td><td>interface x point-to-point</td></tr>
<tr><td>Loopback advertise</td><td>passive-interface ya lo0 par isis</td><td>interface lo0.0 passive</td></tr>
<tr><td>Level restriction</td><td>is-type level-2-only</td><td>level 1 disable</td></tr>
<tr><td>Route preference</td><td>AD 115</td><td>preference 18 (L2 internal)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Narrow se wide migration path">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 1</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="11">sab narrow</text>
<rect x="245" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 2</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">har jagah transition</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="13">Step 3</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="11">har jagah wide</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="95" x2="245" y2="95"/><line x1="395" y1="95" x2="470" y2="95"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">har step par show isis database detail se verify karo</text>
</svg><p class="cap">Standard migration: narrow, transition, wide. Aage badhne se pehle verify.</p></div>

<h3>Pehle lab ka Junos side</h3>
<p>Lab ke Juniper routers par configuration hai level 1 disabled aur level 2 wide-metrics-only. JR1 ka real output:</p>
<pre class="out">JR1&gt; show configuration protocols isis
interface ge-0/0/0.0 {
    point-to-point;
}
interface ge-0/0/1.0 {
    point-to-point;
}
interface lo0.0 {
    passive;
}
level 1 {
    disable;
}
level 2 {
    <span class="hl">wide-metrics-only;</span>
}

JR1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0</pre>
<p>Yeh output lab solution ke baad capture hua, par Junos configuration solution se pehle bhi wahi hai: sirf Cisco side galat tha.</p>

<h3>Fix ke baad Cisco side</h3>
<pre class="out">R1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0001.00
 is-type level-2-only
 <span class="hl">metric-style wide</span>

R1# show isis neighbors
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        UP    25       00
R2              L2   Gi0/1         10.2.4.1        UP    24       00</pre>
<p>(Output chhota kiya gaya: Tag null line hata di gayi.) Aur Junos R2 ke loopback tak dono neighbours par ECMP dekhta hai, preference 18 ke saath, Cisco ke 115 ke bajaye:</p>
<pre class="out">JR1&gt; show route protocol isis
10.2.255.2/32      *[IS-IS/18] 00:00:56, metric 20
                    &gt;  to 10.2.1.1 via ge-0/0/0.0
                       to 10.2.2.2 via ge-0/0/1.0</pre>

<h3>Safe migration runbook</h3>
<p>Reference procedure, simulator output nahi: (1) har router par <code>metric-style transition</code> (ya wide transition) set karo, jo dono styles padhta aur bhejta hai; (2) confirm karo ki database mein dono families hain aur routes wahi hain; (3) router-by-router <code>metric-style wide</code> par jao; (4) jab sab wide ho jaayein, confirm karo ki narrow kuch nahi bacha aur transition hata do. Har step reversible ho aur change window mein ho, aur pehle-baad route count verify karo.</p>

<div class="eg"><p><b>Worked example.</b> Change se pehle PE par IS-IS routes ki ginti note karo. Step 2 (transition) ke baad aur PE par step 3 ke baad woh wahi honi chahiye. Koi bhi girawat matlab koi neighbour abhi sirf narrow padhta hai. Har step par count compare karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Aadhe routers ko seedha narrow se wide kar dena. Wide-only routers narrow wale routers ko invisible ho jaate hain, aur narrow wale wide-only ko, change ke dauran SPF view toot jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos default mein dono styles padhta aur bhejta hai; Cisco IOS XE default mein narrow bhejta hai. To Cisco-only core chalta hai, wide-metrics-only wala Junos add karne par toot jaata hai, aur default par Junos add karne par shayad pata na chale. Migration steps ka order jaano.</p></div>

<div class="scn"><h4>Shukravaar ka wide switch</h4><p>Engineer ne shukravaar shaam ek batch mein das PEs ko wide kar diya. Do P routers abhi narrow the. PEs ne P loopbacks kho diye aur LDP aur BGP sessions flap hue. PEs par transition par rollback karne se sab wapas aa gaya. Agli baar P routers ko pehle transition mein kiya gaya.</p><p><b>Lesson:</b> pehle har jagah transition, phir wide.</p></div>

<div class="iv"><p class="q">"Live IS-IS core ko bina outage ke narrow se wide kaise migrate karoge?"</p><p>Har router par transition enable karta hoon taaki dono taraf dono styles padhe aur bheje jaayein. Database aur route count verify karta hoon. Phir router-by-router wide par jaata hoon, har step par dobara check, aur end mein transition hata deta hoon. Aadhe routers ko kabhi seedha wide nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mixed Cisco-Junos cores isliye chalte hain kyunki IS-IS standard hai; defaults alag hain.</li>
<li>IOS XE default narrow; Junos wide-metrics-only per level set hota hai.</li>
<li>Narrow, transition, wide migrate karo aur har step par verify karo.</li>
<li>Route preference: Cisco 115 versus Junos 18 (L2 internal).</li>
<li>Design document mein vendor translation table rakho.</li>
</ul></div>
`}};export{e as default};