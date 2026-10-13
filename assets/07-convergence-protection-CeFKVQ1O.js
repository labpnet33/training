var e={id:`convergence-protection`,h:{en:`Convergence, protection and stability of the IS-IS core`,hi:`IS-IS core ki convergence, protection aur stability`},body:{en:`
<p>When a link fails, the network is wrong until every router has finished four steps: <b>detect</b> the failure, <b>flood</b> a new LSP, run <b>SPF</b>, and <b>update the RIB and FIB</b>. Provider design is about making each step fast, and, just as important, keeping them from running wild when something is flapping. Fast and stable pull in opposite directions; the art is the balance.</p>

<h3>Analogy: a fire alarm</h3>
<p>A good alarm detects smoke quickly (detection), tells every floor (flooding), and the wardens work out the best exit (SPF) and open the doors (FIB). But if the alarm rings for every toaster, people stop trusting it. Throttles and dampening are the toaster filters.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The four convergence steps">
<rect x="10" y="50" width="135" height="64" rx="10" fill="#fecaca"/><text x="77" y="78" text-anchor="middle" class="svg-ink" font-size="13">1 Detect</text><text x="77" y="98" text-anchor="middle" class="svg-muted" font-size="10">BFD, loss of signal</text>
<rect x="170" y="50" width="135" height="64" rx="10" fill="#fed7aa"/><text x="237" y="78" text-anchor="middle" class="svg-ink" font-size="13">2 Flood</text><text x="237" y="98" text-anchor="middle" class="svg-muted" font-size="10">new LSP everywhere</text>
<rect x="330" y="50" width="135" height="64" rx="10" fill="#bae6fd"/><text x="397" y="78" text-anchor="middle" class="svg-ink" font-size="13">3 SPF</text><text x="397" y="98" text-anchor="middle" class="svg-muted" font-size="10">recompute paths</text>
<rect x="490" y="50" width="135" height="64" rx="10" fill="#bbf7d0"/><text x="557" y="78" text-anchor="middle" class="svg-ink" font-size="13">4 RIB and FIB</text><text x="557" y="98" text-anchor="middle" class="svg-muted" font-size="10">program hardware</text>
<g stroke="#64748b" stroke-width="2"><line x1="145" y1="82" x2="170" y2="82"/><line x1="305" y1="82" x2="330" y2="82"/><line x1="465" y1="82" x2="490" y2="82"/></g>
</svg><p class="cap">Every router runs these four steps after a topology change. Tune each one.</p></div>

<h3>Detection</h3>
<p>IS-IS hellos with the default hold time take tens of seconds to notice a silent failure, which is too slow. <b>BFD</b> detects a failed forwarding path in well under a second and tells IS-IS to drop the adjacency at once. On point-to-point links, also make the failure visible by using point-to-point network type, as the lab does on every interface (<code>isis network point-to-point</code> on Cisco, <code>point-to-point</code> on Junos). That removes the DIS election and speeds adjacency work.</p>

<h3>Flooding and SPF throttles</h3>
<p>If every flap triggers an immediate SPF, a flapping link can overload the CPU. Exponential backoff solves this: the first event is processed quickly, repeated events within a window wait longer. The knobs are LSP generation interval, SPF interval and PRC interval on IOS XE (each with initial, secondary and maximum waits), and <code>spf-options</code> with delay, holddown and rapid-runs on Junos. Smaller initial values mean faster convergence; larger maximums mean more stability.</p>

<h3>Protection: do not wait for SPF</h3>
<p><b>Loop-free alternate (LFA)</b> and <b>TI-LFA</b> (with segment routing) precompute a backup next hop, so on failure the FIB switches immediately, in tens of milliseconds, and SPF runs later. LFA depends on topology: not every prefix has a loop-free alternate. TI-LFA covers almost all topologies by using a short label stack to reach a safe point.</p>

<h3>Reference configuration (not simulator output)</h3>
<p>The simulator does not implement these knobs, so they are shown as plain reference configuration. Verify exact syntax and defaults on your software release.</p>
<pre class="code">! IOS XE reference
router isis
 bfd all-interfaces
 spf-interval 5 50 200
 lsp-gen-interval 5 50 200
 prc-interval 5 50 200
 fast-reroute per-prefix level-2 all
 set-overload-bit on-startup 120

! Junos reference
protocols {
    isis {
        spf-options {
            delay 50;
            holddown 5000;
            rapid-runs 3;
        }
    }
}</pre>

<h3>Protecting from the inside</h3>
<ul>
<li><b>Authentication:</b> use IS-IS authentication (hello and LSP) so a rogue router cannot form an adjacency. Hash type and syntax differ by vendor, so keep consistent keys on both sides.</li>
<li><b>Overload bit:</b> set it when a router boots or is under maintenance, so others avoid transiting through it until it has converged.</li>
<li><b>Passive interfaces:</b> advertise loopbacks and customer-facing links without forming adjacencies on them, as the lab does with <code>lo0.0</code> as passive on Junos.</li>
<li><b>Stable LSDB:</b> unique system IDs, unique NETs, and consistent MTU on all links.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Without BFD, a silent optical fault holds the adjacency up until the hold time expires, tens of seconds on default timers, while traffic is blackholed. With BFD the adjacency drops in the sub-second range and the second path takes over, and with LFA the FIB has already prepared the alternate next hop.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting aggressive throttle values everywhere without CPU headroom. A flapping interface then causes an SPF storm on every router. Also avoid running BFD at timers lower than the hardware can reliably handle.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the four steps of convergence and which feature fixes which: BFD for detection, throttles for SPF and flooding, LFA or TI-LFA for pre-computed protection, overload bit for graceful insertion and removal.</p></div>

<div class="scn"><h4>The flapping optic</h4><p>A degrading optic flapped a core link every few seconds. All routers recomputed SPF on every flap and the control plane became slow. Exponential backoff throttles limited the SPF rate, and the NOC shut the link and replaced the optic.</p><p><b>Lesson:</b> throttle for stability, and fix the root cause.</p></div>

<div class="iv"><p class="q">"What contributes to IS-IS convergence time and how do you reduce it?"</p><p>Detection, flooding, SPF and FIB programming. I shorten detection with BFD, tune LSP and SPF throttles with exponential backoff, and remove most of the SPF dependency with LFA or TI-LFA so the backup is already programmed. I protect stability with authentication and the overload bit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Convergence is detect, flood, SPF, RIB and FIB.</li>
<li>BFD speeds detection; point-to-point links avoid DIS delay.</li>
<li>Throttles with exponential backoff trade speed for stability.</li>
<li>LFA and TI-LFA precompute backups so failover does not wait for SPF.</li>
<li>Overload bit and authentication protect the domain during change.</li>
</ul></div>
`,hi:`
<p>Jab link fail hota hai, network tab tak galat rehta hai jab tak har router chaar steps pure na kar le: failure <b>detect</b> karna, naya LSP <b>flood</b> karna, <b>SPF</b> chalana, aur <b>RIB aur FIB update</b> karna. Provider design har step ko tez banane ke baare mein hai, aur utna hi zaroori, jab kuch flap kar raha ho to unhe bekaabu hone se rokna. Tez aur stable ulti disha mein kheenchte hain; kala hai balance.</p>

<h3>Analogy: fire alarm</h3>
<p>Achha alarm dhuan jaldi pakadta hai (detection), har manzil ko batata hai (flooding), aur wardens best exit nikalte hain (SPF) aur darwaze kholte hain (FIB). Par agar alarm har toaster par bajne lage to log bharosa chhod dete hain. Throttles aur dampening toaster filters hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Convergence ke chaar steps">
<rect x="10" y="50" width="135" height="64" rx="10" fill="#fecaca"/><text x="77" y="78" text-anchor="middle" class="svg-ink" font-size="13">1 Detect</text><text x="77" y="98" text-anchor="middle" class="svg-muted" font-size="10">BFD, loss of signal</text>
<rect x="170" y="50" width="135" height="64" rx="10" fill="#fed7aa"/><text x="237" y="78" text-anchor="middle" class="svg-ink" font-size="13">2 Flood</text><text x="237" y="98" text-anchor="middle" class="svg-muted" font-size="10">har jagah naya LSP</text>
<rect x="330" y="50" width="135" height="64" rx="10" fill="#bae6fd"/><text x="397" y="78" text-anchor="middle" class="svg-ink" font-size="13">3 SPF</text><text x="397" y="98" text-anchor="middle" class="svg-muted" font-size="10">paths dobara nikalo</text>
<rect x="490" y="50" width="135" height="64" rx="10" fill="#bbf7d0"/><text x="557" y="78" text-anchor="middle" class="svg-ink" font-size="13">4 RIB aur FIB</text><text x="557" y="98" text-anchor="middle" class="svg-muted" font-size="10">hardware program</text>
<g stroke="#64748b" stroke-width="2"><line x1="145" y1="82" x2="170" y2="82"/><line x1="305" y1="82" x2="330" y2="82"/><line x1="465" y1="82" x2="490" y2="82"/></g>
</svg><p class="cap">Topology badalne par har router yeh chaar steps chalata hai. Har ek ko tune karo.</p></div>

<h3>Detection</h3>
<p>Default hold time ke saath IS-IS hellos ko chup failure pakadne mein kai second lagte hain, jo bahut dheema hai. <b>BFD</b> failed forwarding path ko ek second se bhi kam mein pakadta hai aur IS-IS ko turant adjacency girane ko kehta hai. Point-to-point links par point-to-point network type bhi use karo, jaisa lab har interface par karta hai (Cisco par <code>isis network point-to-point</code>, Junos par <code>point-to-point</code>). Isse DIS election hat jaata hai aur adjacency kaam tez hota hai.</p>

<h3>Flooding aur SPF throttles</h3>
<p>Agar har flap turant SPF chalaye to flapping link CPU ko overload kar sakta hai. Exponential backoff yeh hal karta hai: pehla event jaldi process hota hai, ek window ke andar baar-baar aane wale events zyada intezaar karte hain. IOS XE par knobs hain LSP generation interval, SPF interval aur PRC interval (har ek ke initial, secondary aur maximum waits), aur Junos par <code>spf-options</code> jisme delay, holddown aur rapid-runs hain. Chhote initial values matlab tez convergence; bade maximums matlab zyada stability.</p>

<h3>Protection: SPF ka intezaar mat karo</h3>
<p><b>Loop-free alternate (LFA)</b> aur <b>TI-LFA</b> (segment routing ke saath) backup next hop pehle se compute kar lete hain, isliye failure par FIB turant, kuch milliseconds mein, switch ho jaata hai aur SPF baad mein chalta hai. LFA topology par nirbhar hai: har prefix ka loop-free alternate nahi hota. TI-LFA ek chhote label stack se safe point tak pahunchkar lagbhag har topology cover karta hai.</p>

<h3>Reference configuration (simulator output nahi)</h3>
<p>Simulator yeh knobs implement nahi karta, isliye yeh plain reference configuration ke taur par dikhaye gaye hain. Apne software release par exact syntax aur defaults verify karo.</p>
<pre class="code">! IOS XE reference
router isis
 bfd all-interfaces
 spf-interval 5 50 200
 lsp-gen-interval 5 50 200
 prc-interval 5 50 200
 fast-reroute per-prefix level-2 all
 set-overload-bit on-startup 120

! Junos reference
protocols {
    isis {
        spf-options {
            delay 50;
            holddown 5000;
            rapid-runs 3;
        }
    }
}</pre>

<h3>Andar se protection</h3>
<ul>
<li><b>Authentication:</b> IS-IS authentication (hello aur LSP) use karo taaki rogue router adjacency na bana sake. Hash type aur syntax vendor ke hisaab se alag hote hain, isliye dono taraf consistent keys rakho.</li>
<li><b>Overload bit:</b> router boot hote waqt ya maintenance mein set karo, taaki doosre converge hone tak uske through transit na karein.</li>
<li><b>Passive interfaces:</b> loopbacks aur customer-facing links ko bina adjacency ke advertise karo, jaise lab Junos par <code>lo0.0</code> passive rakhta hai.</li>
<li><b>Stable LSDB:</b> unique system IDs, unique NETs aur sab links par consistent MTU.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> BFD ke bina chup optical fault adjacency ko hold time khatam hone tak up rakhta hai, default timers par kai second, jab traffic blackhole hota hai. BFD ke saath adjacency sub-second range mein girti hai aur doosra path sambhal leta hai, aur LFA ke saath FIB ne alternate next hop pehle hi taiyaar rakha hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> CPU headroom ke bina har jagah aggressive throttle values. Flapping interface phir har router par SPF storm paida karta hai. BFD ko aise timers par bhi mat chalao jo hardware bharosemand tareeke se na sambhal sake.</p></div>
<div class="exam"><p><b>Exam trap.</b> Convergence ke chaar steps aur kaunsa feature kya theek karta hai jaano: detection ke liye BFD, SPF aur flooding ke liye throttles, pehle se compute protection ke liye LFA ya TI-LFA, graceful insertion aur removal ke liye overload bit.</p></div>

<div class="scn"><h4>Flap karta optic</h4><p>Kharab hota optic core link ko har kuch second mein flap karta raha. Har router har flap par SPF dobara chalata raha aur control plane dheema ho gaya. Exponential backoff throttles ne SPF rate seemit kiya, aur NOC ne link shut karke optic badal diya.</p><p><b>Lesson:</b> stability ke liye throttle karo, aur root cause theek karo.</p></div>

<div class="iv"><p class="q">"IS-IS convergence time mein kya yogdaan deta hai aur ise kaise kam karoge?"</p><p>Detection, flooding, SPF aur FIB programming. Detection BFD se chhota karta hoon, LSP aur SPF throttles exponential backoff ke saath tune karta hoon, aur LFA ya TI-LFA se SPF par nirbharta kam karta hoon taaki backup pehle se programmed ho. Stability ke liye authentication aur overload bit use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Convergence matlab detect, flood, SPF, RIB aur FIB.</li>
<li>BFD detection tez karta hai; point-to-point links DIS delay se bachate hain.</li>
<li>Exponential backoff wale throttles speed aur stability ka sauda karte hain.</li>
<li>LFA aur TI-LFA backups precompute karte hain, failover SPF ka intezaar nahi karta.</li>
<li>Overload bit aur authentication change ke dauran domain ki raksha karte hain.</li>
</ul></div>
`}};export{e as default};