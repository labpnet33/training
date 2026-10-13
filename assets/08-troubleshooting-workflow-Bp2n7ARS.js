var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: slow under load, drops in the wrong place`,hi:`Troubleshooting workflow: load mein slow, galat jagah drops`},body:{en:`
<p>The call always sounds the same: "The WAN is slow when people are working". It is vague, it is intermittent, and it blames you. A method turns it into six checks and takes less than half an hour. This chapter gives the method, a table of causes, and walks the troubleshooting lab <b>mq-wan-bufferbloat</b> as a diagnostic path. We describe how to look; we do not hand you the fixes, because finding them is the exercise.</p>

<h3>The six-step method</h3>
<ol>
<li><b>Define the symptom exactly.</b> Which flows (voice, video, web, file), which direction, since when, only when busy? Loss, delay or both?</li>
<li><b>Reproduce under load, not at idle.</b> Use the host traffic generator (<code>traffic DEST udp/PORT KBPS SECONDS dscp X</code>) to send your three or four typical flows together, bulk first. Idle tests always look healthy.</li>
<li><b>Find <i>where</i> the packets are lost.</b> Walk the path in order and read the counters at each point (diagram below).</li>
<li><b>Check classification.</b> Does each class count packets, and are they the right packets?</li>
<li><b>Check the rates.</b> Compare shaper and policer values with the contract and with the offered load; compute queue delay from queue-limit and rate.</li>
<li><b>Fix one thing, clear the counters, retest.</b> <code>clear policy-map counters</code> on every device in the path, then run the same load. Repeat until the evidence is clean.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Five places to look along the path">
<rect x="10" y="70" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="12">Sender</text><text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="11">DSCP right?</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="205" y="97" text-anchor="middle" class="svg-ink" font-size="12">CE input</text><text x="205" y="115" text-anchor="middle" class="svg-muted" font-size="11">policers, marking</text>
<rect x="310" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="365" y="97" text-anchor="middle" class="svg-ink" font-size="12">CE output</text><text x="365" y="115" text-anchor="middle" class="svg-muted" font-size="11">shaper, queues</text>
<rect x="470" y="70" width="90" height="60" rx="8" fill="#fed7aa"/><text x="515" y="97" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="515" y="115" text-anchor="middle" class="svg-muted" font-size="11">exceeded?</text>
<line x1="100" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="310" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="55" cy="55" r="12" fill="#f97316"/><text x="55" y="59" text-anchor="middle" font-size="12" fill="#fff">1</text>
<circle cx="205" cy="55" r="12" fill="#f97316"/><text x="205" y="59" text-anchor="middle" font-size="12" fill="#fff">2</text>
<circle cx="365" cy="55" r="12" fill="#f97316"/><text x="365" y="59" text-anchor="middle" font-size="12" fill="#fff">3</text>
<circle cx="515" cy="55" r="12" fill="#f97316"/><text x="515" y="59" text-anchor="middle" font-size="12" fill="#fff">4</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Drops at 3 in the least important class are healthy. Drops at 4 mean the shaper is missing or too high.</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Drops in a voice class at 3, or none anywhere while ping is slow, mean a design fault.</text>
</svg><p class="cap">1 marking, 2 input policers, 3 shaper and queues, 4 the provider policer. Read them in this order.</p></div>

<h3>Drops in the right place and the wrong place</h3>
<table class="cmp"><tr><th>Where the drops are</th><th>What it means</th><th>Next step</th></tr>
<tr><td>CE child class-default (bulk)</td><td>Healthy: your policy chose the victim</td><td>Nothing, unless bulk is too starved</td></tr>
<tr><td>CE voice class</td><td>Priority too small, or the voice flow exceeds its rate</td><td>Compare priority kbps with real voice; check calls count</td></tr>
<tr><td>Provider policer (exceeded grows)</td><td>Shaper missing, on the wrong port, or above the CIR</td><td>Compare the shape rate with the contract; check the attach point</td></tr>
<tr><td>Nowhere, but ping is slow under load</td><td>Bufferbloat: queue too deep</td><td>Read queue-limit; compute delay</td></tr>
<tr><td>LAN input policer</td><td>Policer too tight or Bc too small</td><td>Check cir and bc; compare with offered load</td></tr>
<tr><td>Only one direction is bad</td><td>Per-direction contract, hub shaper missing, provider return policing</td><td>Test both ways; read the PE port facing the slow site</td></tr></table>

<h3>Reading a class with no packets</h3>
<p>Two different problems look alike in <code>show policy-map interface</code>. If <b>no class counts packets at all</b>, the policy is not attached, or it is attached in the wrong direction or on the wrong interface (<code>show running-config interface</code> and the circuit label will tell you). If <b>one class counts zero while the traffic is clearly present in class-default</b>, classification is not matching: compare the class-map with the DSCP or ACL of the real packets, shown for each flow by the generator. The tools to confirm are <code>show class-map NAME</code> and the per-match counters under each class.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
        Class-map: VOICE (match-any)
          <span class="hl">0 packets, 0 bytes</span>
          Match: dscp (a value)
        ...
        Class-map: class-default (match-any)
          <span class="hl">606000 packets, 121200000 bytes</span></pre>
<p>The shape of this output, an empty class next to a full class-default, is the signature of a classification mismatch. What exactly mismatches is for you to find.</p>

<h3>Walking the lab mq-wan-bufferbloat</h3>
<p>Sahyadri University's Nashik campus has a 20 Mbps line on a 1 Gbps port. A contractor left a two-level policy on R1 and blames the line. The brief says: find every fault, add no capacity, prove it. Walk the method:</p>
<ol>
<li><b>Reproduce.</b> From PC1 send bulk, billing and voice flows together (bulk first). Note per flow loss with <code>traffic show</code>. Voice is badly hit, billing too.</li>
<li><b>Where?</b> Read <code>show policy-map interface GigabitEthernet0/0 output</code> on R1: which class counts which packets? Then read the policy on R2, which plays the provider. Compare what R1 sends per second with what R2 allows.</li>
<li><b>Checklist, top to bottom, do not stop at the first fault.</b> Classification of voice; shaper rate against the contract printed on the interface description; queue limit and delay in the bulk class. The lab has more than one fault and each check can find one.</li>
<li><b>Evidence.</b> Compute the worst-case delay of the queue you find, using queue bits over the drain rate, and compare it with the 150 ms voice budget.</li>
<li><b>Prove.</b> Clear the counters on R1 and R2, repeat the load. The proof has three parts: voice and billing intact, bulk dropping in R1's class-default, and the R2 policer showing no drops.</li>
</ol>

<div class="eg"><p><b>Worked example of the proof.</b> Before: <code>traffic show</code> prints 96.7 percent loss for voice and R2 shows thousands of exceeded packets. After: 0.0 percent loss for voice, R2 exceeded 0 packets, and all the loss sits in the child class-default of R1. If R2 still shows exceeded packets, a fault remains upstream of it; if voice still loses packets with R2 clean, look at classification and the priority size.</p></div>

<h3>Ticket evidence to collect</h3>
<ul>
<li>Time and direction of the problem, flow type, affected sites.</li>
<li><code>show policy-map interface</code> on the WAN port, taken <i>during</i> the problem (rates are 30 second averages).</li>
<li>Provider-side counters or the answer from the provider portal.</li>
<li>Marking seen at the far site (a capture or the dscp counters).</li>
<li>Queue limits and shaper rate from the running configuration.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Testing at idle. (2) Changing three things at once, so you do not know which one fixed it. (3) Forgetting to clear the counters and reading old numbers. (4) Reading a 30-second average after the load has ended, which shows 0 bps. (5) Blaming the provider before checking the attach point and the shape rate.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No drops on the router" does not mean "no drops". Drops may be at the provider. And "policy not matching" is a classification problem, "policy not attached" is a configuration one; both give empty counters.</p></div>

<div class="scn"><h4>The shaper on the wrong port</h4><p>At the Delhi site, calls break every evening although a 29 Mbps shaper with a voice child is configured. <code>show policy-map interface GigabitEthernet0/0</code> shows counters that never move. The engineer reads the circuit labels: Gi0/0 is the MPLS circuit but the policy is attached to Gi0/1, the Internet backup port. The MPLS traffic leaves unshaped and the provider policer drops it. He moves the attachment to Gi0/0, clears the counters, runs a test, and the provider policer stays at zero.</p><p><b>Lesson:</b> an empty counter on the right port is a finding. Confirm the attach point against the circuit label.</p></div>
<div class="iv"><p class="q">"Users say the WAN is slow when it is busy. How do you troubleshoot it?"</p><p>I define the symptom, reproduce it under load with a mixed test, then find where packets are lost by reading counters in order: marking, input policers, the shaper and queues, the provider policer. Drops in the bulk class are healthy; drops in voice, at the provider, or high delay with no drops each point to a specific fault. I change one thing, clear the counters and retest, and I finish with evidence from both ends.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce under load with mixed flows; read counters along the path in order.</li>
<li>Drops in the least important class are the goal; drops at the provider or in voice are faults.</li>
<li>An empty class next to a full class-default is a classification mismatch; all classes empty is an attach problem.</li>
<li>Compute queue delay from queue-limit and rate; compare it with the voice budget.</li>
<li>Change one thing at a time and clear counters before every retest.</li>
</ul></div>
`,hi:`
<p>Call hamesha ek jaisi sunai deti hai: "Log kaam karte hain to WAN slow ho jaata hai". Yeh vague hai, kabhi-kabhi hota hai, aur ilzaam aap par aata hai. Ek method ise chhe checks mein badal deta hai aur aadhe ghante se kam leta hai. Is chapter mein method, causes ki table, aur troubleshooting lab <b>mq-wan-bufferbloat</b> ka diagnostic path hai. Hum dekhne ka tareeka batate hain; fixes nahi dete, kyunki unhe dhundna hi abhyas hai.</p>

<h3>Chhe-step method</h3>
<ol>
<li><b>Symptom ko theek se define karo.</b> Kaun se flows (voice, video, web, file), kaun si direction, kab se, sirf busy hone par? Loss, delay ya dono?</li>
<li><b>Idle par nahi, load mein reproduce karo.</b> Host traffic generator (<code>traffic DEST udp/PORT KBPS SECONDS dscp X</code>) se apne teen-chaar typical flows ek saath bhejo, bulk pehle. Idle test hamesha theek dikhte hain.</li>
<li><b>Dhundo ki packets <i>kahan</i> khote hain.</b> Path ko kram se chalo aur har point par counters padho (neeche diagram).</li>
<li><b>Classification check karo.</b> Kya har class packets ginti hai, aur sahi packets?</li>
<li><b>Rates check karo.</b> Shaper aur policer values ko contract aur offered load se milao; queue-limit aur rate se queue delay calculate karo.</li>
<li><b>Ek cheez theek karo, counters clear karo, dobara test karo.</b> Path ke har device par <code>clear policy-map counters</code>, phir wahi load. Evidence saaf hone tak dohrao.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Path par dekhne ki paanch jagah">
<rect x="10" y="70" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="12">Sender</text><text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="11">DSCP sahi?</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="205" y="97" text-anchor="middle" class="svg-ink" font-size="12">CE input</text><text x="205" y="115" text-anchor="middle" class="svg-muted" font-size="11">policers, marking</text>
<rect x="310" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="365" y="97" text-anchor="middle" class="svg-ink" font-size="12">CE output</text><text x="365" y="115" text-anchor="middle" class="svg-muted" font-size="11">shaper, queues</text>
<rect x="470" y="70" width="90" height="60" rx="8" fill="#fed7aa"/><text x="515" y="97" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="515" y="115" text-anchor="middle" class="svg-muted" font-size="11">exceeded?</text>
<line x1="100" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="310" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="55" cy="55" r="12" fill="#f97316"/><text x="55" y="59" text-anchor="middle" font-size="12" fill="#fff">1</text>
<circle cx="205" cy="55" r="12" fill="#f97316"/><text x="205" y="59" text-anchor="middle" font-size="12" fill="#fff">2</text>
<circle cx="365" cy="55" r="12" fill="#f97316"/><text x="365" y="59" text-anchor="middle" font-size="12" fill="#fff">3</text>
<circle cx="515" cy="55" r="12" fill="#f97316"/><text x="515" y="59" text-anchor="middle" font-size="12" fill="#fff">4</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">3 par sabse kam zaroori class mein drops healthy hain. 4 par drops matlab shaper missing ya bahut upar.</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">3 par voice class mein drops, ya kahin nahi lekin ping slow, matlab design fault.</text>
</svg><p class="cap">1 marking, 2 input policers, 3 shaper aur queues, 4 provider policer. Isi kram mein padho.</p></div>

<h3>Sahi jagah aur galat jagah ke drops</h3>
<table class="cmp"><tr><th>Drops kahan hain</th><th>Matlab</th><th>Agla step</th></tr>
<tr><td>CE child class-default (bulk)</td><td>Healthy: aapki policy ne victim chuna</td><td>Kuch nahi, jab tak bulk zyada bhookha na ho</td></tr>
<tr><td>CE voice class</td><td>Priority bahut chhoti, ya voice flow apne rate se upar</td><td>Priority kbps ko asli voice se milao; calls ginti karo</td></tr>
<tr><td>Provider policer (exceeded badhta hai)</td><td>Shaper missing, galat port par, ya CIR se upar</td><td>Shape rate ko contract se milao; attach point dekho</td></tr>
<tr><td>Kahin nahi, lekin load mein ping slow</td><td>Bufferbloat: queue bahut gehri</td><td>queue-limit padho; delay calculate karo</td></tr>
<tr><td>LAN input policer</td><td>Policer bahut tight ya Bc bahut chhota</td><td>cir aur bc dekho; offered load se milao</td></tr>
<tr><td>Sirf ek direction kharab</td><td>Per-direction contract, hub shaper missing, provider return policing</td><td>Dono taraf test karo; slow site ki taraf wala PE port padho</td></tr></table>

<h3>Bina packets wali class padhna</h3>
<p><code>show policy-map interface</code> mein do alag problems ek jaisi dikhti hain. Agar <b>koi bhi class packets nahi ginti</b>, to policy attach nahi hai, ya galat direction ya galat interface par attach hai (<code>show running-config interface</code> aur circuit label bata denge). Agar <b>ek class zero ginti hai jabki traffic saaf class-default mein hai</b>, to classification match nahi ho rahi: class-map ko asli packets ke DSCP ya ACL se milao, jo generator har flow ke liye dikhata hai. Confirm karne ke tools <code>show class-map NAME</code> aur har class ke neeche per-match counters hain.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
        Class-map: VOICE (match-any)
          <span class="hl">0 packets, 0 bytes</span>
          Match: dscp (a value)
        ...
        Class-map: class-default (match-any)
          <span class="hl">606000 packets, 121200000 bytes</span></pre>
<p>Is output ki shakl, khaali class ke bagal mein bhari class-default, classification mismatch ka signature hai. Kya mismatch hai yeh aapko dhundna hai.</p>

<h3>Lab mq-wan-bufferbloat ka walkthrough</h3>
<p>Sahyadri University ke Nashik campus ki 1 Gbps port par 20 Mbps line hai. Ek contractor R1 par do-level policy chhod gaya hai aur line ko doshi bata raha hai. Brief kehta hai: har fault dhundo, capacity mat badhao, sabit karo. Method chalao:</p>
<ol>
<li><b>Reproduce.</b> PC1 se bulk, billing aur voice flows ek saath bhejo (bulk pehle). <code>traffic show</code> se har flow ka loss note karo. Voice buri tarah prabhavit hoti hai, billing bhi.</li>
<li><b>Kahan?</b> R1 par <code>show policy-map interface GigabitEthernet0/0 output</code> padho: kaun si class kaun se packets ginti hai? Phir R2 ki policy padho, jo provider ka kaam karta hai. Dekho R1 per second kitna bhejta hai aur R2 kitna allow karta hai.</li>
<li><b>Checklist, upar se neeche, pehle fault par mat ruko.</b> Voice ki classification; shaper rate ko interface description par likhe contract se milao; bulk class mein queue limit aur delay. Lab mein ek se zyada fault hain aur har check ek dhundh sakta hai.</li>
<li><b>Evidence.</b> Jo queue mile uska worst-case delay calculate karo, queue bits ko drain rate se bhaag kar, aur 150 ms voice budget se milao.</li>
<li><b>Sabit karo.</b> R1 aur R2 par counters clear karo, load dohrao. Proof ke teen hisse: voice aur billing intact, bulk R1 ki class-default mein drop, aur R2 policer koi drop nahi dikhata.</li>
</ol>

<div class="eg"><p><b>Proof ka worked example.</b> Pehle: <code>traffic show</code> voice ke liye 96.7 percent loss chhapta hai aur R2 hazaaron exceeded packets dikhata hai. Baad mein: voice ke liye 0.0 percent loss, R2 exceeded 0 packets, aur saara loss R1 ki child class-default mein. Agar R2 abhi bhi exceeded packets dikhaye to uske upstream mein fault baaki hai; agar R2 saaf ho phir bhi voice packets khoye to classification aur priority size dekho.</p></div>

<h3>Ticket ke liye evidence</h3>
<ul>
<li>Problem ka samay aur direction, flow type, prabhavit sites.</li>
<li>WAN port par <code>show policy-map interface</code>, problem <i>ke dauran</i> liya hua (rates 30 second ke averages hain).</li>
<li>Provider-side counters ya provider portal ka jawab.</li>
<li>Door ki site par dikha marking (capture ya dscp counters).</li>
<li>Running configuration se queue limits aur shaper rate.</li>
</ul>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Idle par test karna. (2) Teen cheezein ek saath badalna, isliye pata nahi kis ne theek kiya. (3) Counters clear karna bhool kar purane numbers padhna. (4) Load khatam hone ke baad 30-second average padhna, jo 0 bps dikhata hai. (5) Attach point aur shape rate dekhe bina provider ko doshi thehrana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Router par drops nahi" ka matlab "drops nahi" nahi hai. Drops provider par ho sakte hain. Aur "policy match nahi ho rahi" classification problem hai, "policy attach nahi hai" configuration wali; dono khaali counters dete hain.</p></div>

<div class="scn"><h4>Galat port par shaper</h4><p>Delhi site par har shaam calls toot-ti hain jabki 29 Mbps shaper aur voice child configured hai. <code>show policy-map interface GigabitEthernet0/0</code> ke counters kabhi hilte nahi. Engineer circuit labels padhta hai: Gi0/0 MPLS circuit hai lekin policy Gi0/1 par lagi hai, jo Internet backup port hai. MPLS traffic bina shape nikalta hai aur provider policer use gira deta hai. Woh attachment Gi0/0 par le jaata hai, counters clear karta hai, test chalata hai, aur provider policer zero par rehta hai.</p><p><b>Lesson:</b> sahi port par khaali counter ek finding hai. Attach point ko circuit label se confirm karo.</p></div>
<div class="iv"><p class="q">"Users kehte hain busy hone par WAN slow hai. Troubleshoot kaise karoge?"</p><p>Main symptom define karta hoon, mixed test se load mein reproduce karta hoon, phir counters kram se padhkar dhundta hoon ki packets kahan khote hain: marking, input policers, shaper aur queues, provider policer. Bulk class ke drops healthy hain; voice mein drops, provider par drops, ya drops ke bina high delay har ek ek khaas fault ki taraf ishara karta hai. Main ek cheez badalta hoon, counters clear karta hoon aur dobara test karta hoon, aur dono sire ke evidence par khatam karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mixed flows se load mein reproduce karo; path par counters kram se padho.</li>
<li>Sabse kam zaroori class mein drops maqsad hain; provider par ya voice mein drops faults hain.</li>
<li>Bhari class-default ke bagal mein khaali class classification mismatch hai; sab classes khaali attach problem hai.</li>
<li>queue-limit aur rate se queue delay calculate karo; voice budget se milao.</li>
<li>Ek baar mein ek cheez badlo aur har retest se pehle counters clear karo.</li>
</ul></div>
`}};export{e as default};