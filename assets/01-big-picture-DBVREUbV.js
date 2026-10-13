var e={id:`big-picture`,h:{en:`Check before you change: the big picture`,hi:`Change se pehle check: big picture`},body:{en:`
<p>Every network engineer knows the sentence "the config looked right". A route-map name with one letter too many. An AS number written in quotes. A prefix announced to a neighbour who should never see it. The device accepts the change, the outage starts, and the only check was a tired pair of eyes. This module is about checking the change <b>before</b> it reaches a device, with three Python tools that need no router at all.</p>

<h3>What you will learn</h3>
<ul>
<li>Write a change request as data (YAML) and reject a malformed one with <b>jsonschema</b>.</li>
<li>Load IOS XE, Junos and EOS configs into <b>Batfish</b> with <b>pybatfish</b> and ask about undefined references, BGP sessions, routes and traceroute.</li>
<li>Compare live and candidate state with <b>deepdiff</b> and decide whether the difference is the one you wanted.</li>
<li>Join the checks in one <b>gate script</b> whose exit code a pipeline can trust.</li>
<li>Read a BLOCKED message and find the typo in any of the three vendors.</li>
</ul>

<h3>Prerequisites</h3>
<p><b>py-pytest</b> and <b>auto-testing</b> (tests and exit codes), <b>auto-formats</b> (YAML and JSON), <b>py-safepush</b> (why a push needs a rollback plan) and <b>adv-junos-validate</b> (pre and post snapshots; there you met deepdiff basics, so here we use deepdiff on state and config across vendors and do not repeat them). The pushing itself is taught in <b>adv-netconf</b> and <b>adv-pyez-config</b>; this module decides whether a push is allowed to start.</p>

<h3>The big picture: a building plan, not a building</h3>
<p>Before concrete is poured, an architect's drawing is reviewed. Is the form filled in correctly? What differs from the last approved drawing? Will the building stand? A network change deserves the same three questions, and each has a tool.</p>
<table class="cmp"><tr><th>Question</th><th>Tool</th><th>Needs a device?</th><th>Catches</th></tr>
<tr><td>Is the request well formed?</td><td>jsonschema</td><td>No</td><td>wrong type, missing key, bad IP, unknown key</td></tr>
<tr><td>What exactly changes?</td><td>deepdiff</td><td>No</td><td>routes or interfaces added, removed, moved</td></tr>
<tr><td>What will the network do?</td><td>Batfish</td><td>No</td><td>undefined references, BGP not up, NO_ROUTE</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 165" role="img" aria-label="Five checks between the request and the device"><rect x="8" y="28" width="104" height="58" rx="9" fill="#e2e8f0"/><text x="60" y="53" text-anchor="middle" class="svg-ink" font-size="13">intent.yaml</text><text x="60" y="69" text-anchor="middle" class="svg-ink" font-size="13">the request</text><rect x="138" y="28" width="104" height="58" rx="9" fill="#bae6fd"/><text x="190" y="53" text-anchor="middle" class="svg-ink" font-size="13">1 jsonschema</text><text x="190" y="69" text-anchor="middle" class="svg-ink" font-size="13">well formed?</text><rect x="268" y="28" width="104" height="58" rx="9" fill="#ddd6fe"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">2-3 Batfish</text><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">configs, BGP up?</text><rect x="398" y="28" width="104" height="58" rx="9" fill="#fde68a"/><text x="450" y="53" text-anchor="middle" class="svg-ink" font-size="13">4-5 deepdiff</text><text x="450" y="69" text-anchor="middle" class="svg-ink" font-size="13">what moves?</text><rect x="528" y="28" width="104" height="58" rx="9" fill="#bbf7d0"/><text x="580" y="53" text-anchor="middle" class="svg-ink" font-size="13">push + verify</text><text x="580" y="69" text-anchor="middle" class="svg-ink" font-size="13">(other modules)</text><line x1="112" y1="57" x2="138" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="138,57 129,62 129,52" fill="#64748b"/><line x1="242" y1="57" x2="268" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="268,57 259,62 259,52" fill="#64748b"/><line x1="372" y1="57" x2="398" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="398,57 389,62 389,52" fill="#64748b"/><line x1="502" y1="57" x2="528" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="528,57 519,62 519,52" fill="#64748b"/><line x1="190" y1="90" x2="190" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><line x1="320" y1="90" x2="320" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><line x1="450" y1="90" x2="450" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">any failing stage = BLOCKED, exit code 1, nothing is pushed</text></svg><p class="cap">The gate you build in this module: every stage is cheap, offline and stops the change early.</p></div>

<h3>The lab network: three vendors, no routers</h3>
<p>The lab has no routers at all. The network exists as text, which is exactly how Batfish sees a network. On AUTO01 you find this tree for change <b>CHG-3101</b>: xe1 must announce the customer block 192.0.2.0/24 to j1 and e1.</p>
<pre class="out">intent.yaml                 the request (the lab gives you a messy one)
live/configs/xe1.cfg        IOS XE, AS 65001, what runs today
live/configs/j1.cfg         Junos (set format), AS 65002
live/configs/e1.cfg         EOS, AS 65003
candidate/configs/*.cfg     the proposed change (only xe1 differs)</pre>
<p>xe1 peers with j1 over 10.0.12.0/24 and with e1 over 10.0.13.0/24, all eBGP. In Lab 1 you build the checks one by one; in Lab 2 you read someone else's BLOCKED output. At the end the gate prints this:</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
[4/5] state diff      ok
    j1 to 192.0.2.1: ACCEPTED
    e1 to 192.0.2.1: ACCEPTED
[5/5] reachability    ok
<span class="hl">GATE PASSED</span>
exit code: 0</pre>
<p>Do not worry about the code yet. Notice the shape: five numbered stages, each with ok or FAILED, a verdict and an exit code. That is something a person and a pipeline can both read.</p>

<h3>Why not test on a real device?</h3>
<p>Three reasons. A test on gear is a change. Some questions cannot be asked until the change exists, for example "can e1 reach 192.0.2.1?" before xe1 announces it. And a lab device is never an exact copy of production. A model built from the configs answers all of this safely and in seconds.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab has a built-in Batfish service that is always on, so <code>Session(host="localhost")</code> just works. On real gear you start a Batfish container first (it listens on port 9996) and pybatfish talks to it. The lab also prints Batfish messages such as "Successfully initialized snapshot" to the screen. Every other call in this module uses the real library names and arguments.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Trusting the device to catch errors: a device checks syntax, not meaning, so a neighbour line naming a route-map that does not exist is accepted. (2) Writing the checks last, after the outage. (3) A gate that prints a nice report but always exits 0.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Validated" can mean three different things: the request has the right shape (schema), the configs are consistent (Batfish), the difference is the intended one (deepdiff). Say which one you mean.</p></div>

<div class="scn"><h4>The route-map that was never there</h4><p>A team pushed a new outbound filter to 40 routers. On every one the neighbour line named <code>RM-CUST-OUT</code>, but the route-map had been saved as <code>RM-CUST_OUT</code>. IOS accepted the line, the filter did nothing and a customer prefix leaked to a peer for two hours. A Batfish run on the candidate configs would have printed one undefined reference per router in seconds.</p><p><b>Lesson:</b> a device accepting a line is not proof that the line means what you think.</p></div>

<div class="iv"><p class="q">"The router already checks my syntax. Why validate a change offline?"</p><p>Syntax is the smallest part. The device does not know my intent, does not check that every name I reference exists, and cannot tell me what the whole network will do. Offline I can check the request, the consistency of the configs and the difference, and I can do it in a pipeline before anyone logs in.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three questions before a change: well formed, what changes, what will the network do.</li>
<li>jsonschema checks the request, Batfish models the configs, deepdiff names every difference.</li>
<li>None of the three touches a device, so they are safe to run on every change.</li>
<li>A gate has stages, a reason for each failure and an exit code a pipeline can use.</li>
<li>The lab runs Batfish built in; real gear needs the container on port 9996.</li>
</ul></div>
`,hi:`
<p>Har network engineer ne yeh vaakya suna hai: "config sahi lag raha tha". Route-map ke naam mein ek letter zyada. Quotes mein likha AS number. Ek prefix jo aise neighbour ko announce ho gaya jise kabhi nahi dikhna chahiye tha. Device change accept kar leta hai, outage shuru ho jaata hai, aur ek hi check tha: thaki hui do aankhein. Yeh module change ko device tak pahunchne se <b>pehle</b> check karne ke baare mein hai, teen Python tools ke saath jinhe kisi router ki zaroorat nahi.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Change request ko data (YAML) ki tarah likhna aur galat bani request ko <b>jsonschema</b> se reject karna.</li>
<li>IOS XE, Junos aur EOS ke configs ko <b>pybatfish</b> se <b>Batfish</b> mein load karna aur undefined references, BGP sessions, routes aur traceroute ke baare mein poochhna.</li>
<li>Live aur candidate state ko <b>deepdiff</b> se compare karna aur tay karna ki farak wahi hai jo chahiye tha.</li>
<li>Checks ko ek <b>gate script</b> mein jodna jiske exit code par pipeline bharosa kar sake.</li>
<li>BLOCKED message padhna aur teeno vendors mein se kisi mein bhi typo dhoondhna.</li>
</ul>

<h3>Prerequisites</h3>
<p><b>py-pytest</b> aur <b>auto-testing</b> (tests aur exit codes), <b>auto-formats</b> (YAML aur JSON), <b>py-safepush</b> (push ko rollback plan kyun chahiye) aur <b>adv-junos-validate</b> (pre aur post snapshots; wahan deepdiff ki basics mil chuki hain, isliye yahan deepdiff ko vendors ke across state aur config par use karte hain aur basics dohrate nahi). Push karna khud <b>adv-netconf</b> aur <b>adv-pyez-config</b> mein hai; yeh module tay karta hai ki push shuru karne ki ijazat hai ya nahi.</p>

<h3>Big picture: building ka plan, building nahi</h3>
<p>Concrete daalne se pehle architect ka drawing review hota hai. Form sahi bhara hai? Pichhle approved drawing se kya alag hai? Building khadi rahegi? Network change ko bhi yahi teen sawaal chahiye, aur har ek ka tool hai.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Tool</th><th>Device chahiye?</th><th>Kya pakadta hai</th></tr>
<tr><td>Request theek bani hai?</td><td>jsonschema</td><td>Nahi</td><td>galat type, missing key, bura IP, unknown key</td></tr>
<tr><td>Theek kya badalta hai?</td><td>deepdiff</td><td>Nahi</td><td>routes ya interfaces added, removed, moved</td></tr>
<tr><td>Network kya karega?</td><td>Batfish</td><td>Nahi</td><td>undefined references, BGP up nahi, NO_ROUTE</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 165" role="img" aria-label="Request aur device ke beech paanch checks"><rect x="8" y="28" width="104" height="58" rx="9" fill="#e2e8f0"/><text x="60" y="53" text-anchor="middle" class="svg-ink" font-size="13">intent.yaml</text><text x="60" y="69" text-anchor="middle" class="svg-ink" font-size="13">request</text><rect x="138" y="28" width="104" height="58" rx="9" fill="#bae6fd"/><text x="190" y="53" text-anchor="middle" class="svg-ink" font-size="13">1 jsonschema</text><text x="190" y="69" text-anchor="middle" class="svg-ink" font-size="13">shape theek?</text><rect x="268" y="28" width="104" height="58" rx="9" fill="#ddd6fe"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">2-3 Batfish</text><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">configs, BGP up?</text><rect x="398" y="28" width="104" height="58" rx="9" fill="#fde68a"/><text x="450" y="53" text-anchor="middle" class="svg-ink" font-size="13">4-5 deepdiff</text><text x="450" y="69" text-anchor="middle" class="svg-ink" font-size="13">kya hilta hai?</text><rect x="528" y="28" width="104" height="58" rx="9" fill="#bbf7d0"/><text x="580" y="53" text-anchor="middle" class="svg-ink" font-size="13">push + verify</text><text x="580" y="69" text-anchor="middle" class="svg-ink" font-size="13">(doosre modules)</text><line x1="112" y1="57" x2="138" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="138,57 129,62 129,52" fill="#64748b"/><line x1="242" y1="57" x2="268" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="268,57 259,62 259,52" fill="#64748b"/><line x1="372" y1="57" x2="398" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="398,57 389,62 389,52" fill="#64748b"/><line x1="502" y1="57" x2="528" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="528,57 519,62 519,52" fill="#64748b"/><line x1="190" y1="90" x2="190" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><line x1="320" y1="90" x2="320" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><line x1="450" y1="90" x2="450" y2="120" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 5"/><text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">koi bhi stage fail = BLOCKED, exit code 1, kuch push nahi hota</text></svg><p class="cap">Is module mein banne wala gate: har stage sasta, offline hai aur change ko jaldi rok deta hai.</p></div>

<h3>Lab network: teen vendors, koi router nahi</h3>
<p>Lab mein koi router hai hi nahi. Network text ki shakl mein hai, aur Batfish network ko bilkul aise hi dekhta hai. AUTO01 par change <b>CHG-3101</b> ke liye yeh tree milta hai: xe1 ko customer block 192.0.2.0/24 j1 aur e1 ko announce karna hai.</p>
<pre class="out">intent.yaml                 request (lab mein thodi gandi di gayi hai)
live/configs/xe1.cfg        IOS XE, AS 65001, jo aaj chal raha hai
live/configs/j1.cfg         Junos (set format), AS 65002
live/configs/e1.cfg         EOS, AS 65003
candidate/configs/*.cfg     proposed change (sirf xe1 alag hai)</pre>
<p>xe1, j1 se 10.0.12.0/24 par aur e1 se 10.0.13.0/24 par peer karta hai, sab eBGP. Lab 1 mein aap checks ek ek karke banate ho; Lab 2 mein kisi aur ka BLOCKED output padhte ho. Aakhir mein gate yeh print karta hai:</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
[4/5] state diff      ok
    j1 to 192.0.2.1: ACCEPTED
    e1 to 192.0.2.1: ACCEPTED
[5/5] reachability    ok
<span class="hl">GATE PASSED</span>
exit code: 0</pre>
<p>Abhi code ki chinta mat karo. Shape dekho: paanch numbered stages, har ek ok ya FAILED ke saath, ek verdict aur ek exit code. Yeh woh cheez hai jise insaan aur pipeline dono padh sakte hain.</p>

<h3>Real device par test kyun nahi?</h3>
<p>Teen wajah. Gear par test khud ek change hai. Kuch sawaal tab tak poochhe hi nahi ja sakte jab tak change maujood na ho, jaise xe1 ke announce karne se pehle "kya e1 192.0.2.1 tak pahunch sakta hai?". Aur lab device kabhi production ki exact copy nahi hota. Configs se bana model yeh sab surakshit tareeke se aur seconds mein jawab deta hai.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab mein built-in Batfish service hamesha on rehti hai, isliye <code>Session(host="localhost")</code> seedha chalta hai. Real gear par pehle Batfish container start karte ho (woh port 9996 par sunta hai) aur pybatfish usse baat karta hai. Lab "Successfully initialized snapshot" jaise Batfish messages screen par print bhi karta hai. Is module ka baaki har call real library ke naam aur arguments use karta hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Device se errors pakadne ki ummeed: device syntax dekhta hai, matlab nahi, isliye aisi neighbour line jo maujood na hone wale route-map ka naam le, accept ho jaati hai. (2) Checks outage ke baad likhna. (3) Aisa gate jo sundar report print karta hai par hamesha exit 0 deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Validated" ke teen alag matlab ho sakte hain: request ki shape theek hai (schema), configs consistent hain (Batfish), farak wahi hai jo irada tha (deepdiff). Batao aap kaunsa keh rahe ho.</p></div>

<div class="scn"><h4>Woh route-map jo kabhi tha hi nahi</h4><p>Ek team ne 40 routers par naya outbound filter push kiya. Har ek par neighbour line mein <code>RM-CUST-OUT</code> likha tha, par route-map <code>RM-CUST_OUT</code> naam se save hua tha. IOS ne line accept kar li, filter ne kuch nahi kiya aur ek customer prefix do ghante tak peer ko leak hota raha. Candidate configs par Batfish run seconds mein har router ke liye ek undefined reference print kar deta.</p><p><b>Lesson:</b> device ka line accept kar lena saboot nahi ki line wahi matlab rakhti hai jo aap sochte ho.</p></div>

<div class="iv"><p class="q">"Router to syntax check karta hi hai. Change offline validate kyun karein?"</p><p>Syntax sabse chhota hissa hai. Device mera intent nahi jaanta, yeh nahi dekhta ki jis har naam ko main refer kar raha hoon woh maujood hai, aur yeh nahi bata sakta ki poora network kya karega. Offline main request, configs ki consistency aur farak check kar sakta hoon, aur woh bhi pipeline mein, kisi ke login karne se pehle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change se pehle teen sawaal: shape theek, kya badalta hai, network kya karega.</li>
<li>jsonschema request check karta hai, Batfish configs ka model banata hai, deepdiff har farak ko naam deta hai.</li>
<li>Teeno mein se koi device nahi chhuta, isliye har change par chalana surakshit hai.</li>
<li>Gate ke stages hote hain, har failure ki wajah hoti hai aur pipeline ke liye exit code hota hai.</li>
<li>Lab mein Batfish built-in hai; real gear par port 9996 ka container chahiye.</li>
</ul></div>
`}};export{e as default};