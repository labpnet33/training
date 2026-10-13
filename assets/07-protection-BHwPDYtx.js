var e={id:`protection`,h:{en:`Protecting the tree: BPDU, root and loop protection`,hi:`Tree ki suraksha: BPDU, root aur loop protection`},body:{en:`
<p>Spanning tree is built on trust: every switch believes every BPDU it hears. That is a problem on a campus, where anyone can plug a small desk switch into a wall socket. A tiny unmanaged switch with the default priority and a low MAC can try to become the root of your whole network, or loop two wall ports and start a storm. Think of an election with no voter list: anyone who walks in can vote and even stand as the president. The protection features add the voter list. This chapter introduces them at the level the JNCIS-ENT exam expects; the Layer 2 security module goes deeper into each.</p>

<h3>Threats from the access edge</h3>
<ul>
<li><b>Rogue root:</b> a switch added at the edge sends a superior BPDU (lower bridge ID) and the whole tree re-converges around it, so traffic suddenly crosses a weak, slow device.</li>
<li><b>Edge loop:</b> a user connects two wall ports together, or a small switch loops back into itself.</li>
<li><b>Unidirectional link:</b> a damaged fibre carries traffic in one direction only. Switches stop receiving BPDUs, believe the link is quiet and move a blocked port to forwarding, creating a loop.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Protection points">
<rect x="230" y="15" width="180" height="46" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Root bridge (4k)</text>
<rect x="60" y="100" width="150" height="46" rx="10" fill="#ddd6fe"/><text x="135" y="128" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="430" y="100" width="150" height="46" rx="10" fill="#ddd6fe"/><text x="505" y="128" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="60" y="175" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="135" y="197" text-anchor="middle" class="svg-ink" font-size="12">edge: BPDU block</text>
<rect x="430" y="175" width="150" height="34" rx="8" fill="#fecaca"/><text x="505" y="197" text-anchor="middle" class="svg-ink" font-size="12">rogue switch here</text>
<line x1="280" y1="61" x2="160" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="61" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="135" y1="146" x2="135" y2="175" stroke="#64748b" stroke-width="2"/><line x1="505" y1="146" x2="505" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">root-protect on downlinks</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">loop-protect on inter-switch links</text>
</svg><p class="cap">Where each protection is applied: at the edge, on downlinks from the root and on inter-switch links.</p></div>

<h3>BPDU protection on edge ports</h3>
<p>An edge port should never receive a BPDU, because only end hosts live there. If one arrives, a switch is connected where it should not be. With BPDU protection enabled, Junos disables the port (or blocks it) instead of treating it as a normal port again. On ELS this is configured with one RSTP statement that covers every edge port:</p>
<pre class="code">set protocols rstp interface ge-0/0/2 edge
set protocols rstp bpdu-block-on-edge</pre>
<p>A blocked port shows in the operational output with a disabled state and needs the cause removed, then a recovery action, for example <code>clear error bpdu interface ge-0/0/2</code> or a configured recovery timeout. Always find out who plugged in the switch before you restore the port.</p>

<h3>Root protection on downlinks</h3>
<p>Root protection tells a port: "never accept a superior BPDU here". On the links from the distribution switches towards the access layer, no switch below should ever claim to be the root. If one does, the port is placed in a blocked, root-inconsistent state until the superior BPDUs stop, and then it recovers by itself.</p>
<pre class="code">set protocols rstp interface ge-0/0/1 no-root-port</pre>

<h3>Loop protection on inter-switch links</h3>
<p>Loop protection watches ports that should receive BPDUs (root and alternate ports). If BPDUs stop arriving, for example because of a unidirectional link, the port is put in a loop-inconsistent state instead of becoming designated and forwarding. The recovery is automatic when BPDUs return.</p>
<pre class="code">set protocols rstp interface ge-0/0/0 bpdu-timeout-action block</pre>

<table class="cmp"><tr><th>Feature</th><th>Where</th><th>Stops</th></tr>
<tr><td>BPDU protection</td><td>Edge ports</td><td>Rogue switches and edge loops at the access layer</td></tr>
<tr><td>Root protection</td><td>Downlinks from the root or distribution</td><td>A switch below taking over the root role</td></tr>
<tr><td>Loop protection</td><td>Root and alternate ports</td><td>Loops from one-way links and missing BPDUs</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A visitor plugs a home switch into a meeting-room port on FLOOR2 ge-0/0/2, an edge port. The home switch sends BPDUs with the default priority and a random MAC. Because <code>bpdu-block-on-edge</code> is set, FLOOR2 blocks ge-0/0/2 the moment the first BPDU arrives. The rest of the floor never notices, the root stays DSW1, and the security team gets an alarm instead of a storm.</p></div>

<div class="note"><p>Do not confuse these with <b>storm control</b>, which limits the rate of broadcast, multicast or unknown unicast traffic on a port. Storm control reduces the damage of a loop; BPDU, root and loop protection prevent the cause.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using edge on a port that connects a switch, so the protection disables a legitimate uplink. Adding root protection to an uplink towards the root, which is where superior BPDUs are expected. Enabling loop protection and forgetting it on one side of the link. Copying a hardening template to a lab and wondering why a test switch disappears.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the feature to the port type: BPDU protection on edge ports, root protection on designated ports facing the access layer, loop protection on root and alternate ports. A question may ask which feature stops a rogue switch from becoming the root: root protection (or BPDU protection at the edge).</p></div>

<div class="scn"><h4>The meeting room storm that never happened</h4><p>After a storm in another building, a company standardised on edge ports with BPDU protection. Months later a contractor connected a small switch to two wall ports at once to get "more speed". The ports went blocked within a second, a monitoring system raised an alert with the port name, and the network team removed the cable before anyone lost a call.</p><p><b>Lesson:</b> protection turns an outage into an alert.</p></div>

<div class="iv"><p class="q">"How do you stop someone from plugging in a switch and taking over spanning tree?"</p><p>Set an explicit low priority on the real root and backup, configure host ports as edge with BPDU protection so that a received BPDU shuts the port, and enable root protection on downlinks so a superior BPDU is ignored. Add loop protection on inter-switch links against one-way failures and storm control as a safety net.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spanning tree trusts every BPDU, so the access edge needs protection.</li>
<li>BPDU protection blocks an edge port that receives a BPDU.</li>
<li>Root protection refuses superior BPDUs on downlinks.</li>
<li>Loop protection guards against missing BPDUs on root and alternate ports.</li>
<li>Protection prevents the cause; storm control only limits the damage.</li>
</ul></div>
`,hi:`
<p>Spanning tree bharose par bana hai: har switch har BPDU ko sach maanta hai. Campus mein yeh problem hai, kyunki koi bhi chhota desk switch wall socket mein laga sakta hai. Default priority aur chhote MAC wala chhota unmanaged switch aapke poore network ka root banne ki koshish kar sakta hai, ya do wall ports ko loop karke storm shuru kar sakta hai. Socho bina voter list ka election: koi bhi andar aakar vote de sakta hai aur president ka candidate bhi ban sakta hai. Protection features voter list jodte hain. Yeh chapter unhe us level par batata hai jo JNCIS-ENT exam chahta hai; Layer 2 security module har ek mein aur gehra jaata hai.</p>

<h3>Access edge se khatre</h3>
<ul>
<li><b>Rogue root:</b> edge par joda gaya switch superior BPDU (chhota bridge ID) bhejta hai aur poora tree uske aas-paas dobara converge karta hai, isliye traffic achanak kamzor, slow device se guzarta hai.</li>
<li><b>Edge loop:</b> user do wall ports ko aapas mein jod deta hai, ya chhota switch khud mein loop ho jaata hai.</li>
<li><b>Unidirectional link:</b> kharab fibre sirf ek disha mein traffic le jaata hai. Switches BPDUs receive karna band kar dete hain, link ko chup maan lete hain aur blocked port ko forwarding mein le jaate hain, jisse loop banta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Protection points">
<rect x="230" y="15" width="180" height="46" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Root bridge (4k)</text>
<rect x="60" y="100" width="150" height="46" rx="10" fill="#ddd6fe"/><text x="135" y="128" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="430" y="100" width="150" height="46" rx="10" fill="#ddd6fe"/><text x="505" y="128" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="60" y="175" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="135" y="197" text-anchor="middle" class="svg-ink" font-size="12">edge: BPDU block</text>
<rect x="430" y="175" width="150" height="34" rx="8" fill="#fecaca"/><text x="505" y="197" text-anchor="middle" class="svg-ink" font-size="12">rogue switch yahan</text>
<line x1="280" y1="61" x2="160" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="61" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="135" y1="146" x2="135" y2="175" stroke="#64748b" stroke-width="2"/><line x1="505" y1="146" x2="505" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">downlinks par root-protect</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">inter-switch links par loop-protect</text>
</svg><p class="cap">Har protection kahan lagti hai: edge par, root se downlinks par aur inter-switch links par.</p></div>

<h3>Edge ports par BPDU protection</h3>
<p>Edge port ko kabhi BPDU receive nahi karna chahiye, kyunki wahan sirf end hosts rehte hain. Agar ek aa jaaye, to switch wahan juda hai jahan nahi hona chahiye. BPDU protection enable ho to Junos port ko normal port ki tarah treat karne ki jagah disable (ya block) kar deta hai. ELS par yeh ek RSTP statement se configure hota hai jo har edge port ko cover karta hai:</p>
<pre class="code">set protocols rstp interface ge-0/0/2 edge
set protocols rstp bpdu-block-on-edge</pre>
<p>Blocked port operational output mein disabled state mein dikhta hai aur cause hatane ke baad recovery action chahiye, jaise <code>clear error bpdu interface ge-0/0/2</code> ya configured recovery timeout. Port restore karne se pehle pata karo ki switch kisne lagaya.</p>

<h3>Downlinks par root protection</h3>
<p>Root protection port se kehti hai: "yahan kabhi superior BPDU accept mat karo". Distribution switches se access layer ki taraf jaate links par, neeche ke kisi switch ko kabhi root hone ka dawa nahi karna chahiye. Karta hai to port blocked, root-inconsistent state mein chala jaata hai jab tak superior BPDUs band na ho jaayein, phir khud recover ho jaata hai.</p>
<pre class="code">set protocols rstp interface ge-0/0/1 no-root-port</pre>

<h3>Inter-switch links par loop protection</h3>
<p>Loop protection un ports ko dekhti hai jo BPDUs receive karne chahiye (root aur alternate ports). BPDUs aana band ho jaaye, jaise unidirectional link se, to port designated aur forwarding banne ki jagah loop-inconsistent state mein jaata hai. BPDUs wapas aate hi recovery automatic hai.</p>
<pre class="code">set protocols rstp interface ge-0/0/0 bpdu-timeout-action block</pre>

<table class="cmp"><tr><th>Feature</th><th>Kahan</th><th>Kya rokta hai</th></tr>
<tr><td>BPDU protection</td><td>Edge ports</td><td>Access layer par rogue switches aur edge loops</td></tr>
<tr><td>Root protection</td><td>Root ya distribution se downlinks</td><td>Neeche ka switch root role le le</td></tr>
<tr><td>Loop protection</td><td>Root aur alternate ports</td><td>One-way links aur missing BPDUs se loops</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek visitor meeting-room port, FLOOR2 ge-0/0/2 (edge port), mein ghar ka switch lagata hai. Ghar ka switch default priority aur random MAC ke saath BPDUs bhejta hai. <code>bpdu-block-on-edge</code> set hone ki wajah se FLOOR2 pehla BPDU aate hi ge-0/0/2 block kar deta hai. Floor ke baaki hisse ko pata nahi chalta, root DSW1 hi rehta hai, aur security team ko storm ki jagah alarm milta hai.</p></div>

<div class="note"><p>Inhe <b>storm control</b> se confuse mat karo, jo port par broadcast, multicast ya unknown unicast traffic ki rate limit karta hai. Storm control loop ka nuksan kam karta hai; BPDU, root aur loop protection kaaran ko rokte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aise port par edge lagana jo switch jodta hai, jisse protection legitimate uplink disable kar deti hai. Root ki taraf jaate uplink par root protection lagana, jahan superior BPDUs expected hain. Loop protection enable karke link ke ek side par bhool jaana. Hardening template lab mein copy karke hairaan hona ki test switch gayab kyun ho gaya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Feature ko port type se match karo: edge ports par BPDU protection, access layer ki taraf designated ports par root protection, root aur alternate ports par loop protection. Question poochh sakta hai ki rogue switch ko root banne se kaun rokta hai: root protection (ya edge par BPDU protection).</p></div>

<div class="scn"><h4>Meeting room ka storm jo kabhi aaya hi nahi</h4><p>Doosri building mein storm ke baad ek company ne BPDU protection ke saath edge ports standard kiye. Mahino baad ek contractor ne "zyada speed" ke liye chhota switch ek saath do wall ports se jod diya. Ports ek second ke andar blocked ho gaye, monitoring system ne port name ke saath alert diya, aur network team ne kisi ki call girne se pehle cable hata di.</p><p><b>Lesson:</b> protection outage ko alert mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Koi switch laga ke spanning tree ka control na le sake, yeh kaise rokte ho?"</p><p>Asli root aur backup par explicit chhoti priority set karo, host ports ko edge aur BPDU protection ke saath configure karo taaki BPDU aate hi port band ho, aur downlinks par root protection lagao taaki superior BPDU ignore ho. One-way failures ke liye inter-switch links par loop protection aur safety net ke roop mein storm control jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spanning tree har BPDU par bharosa karta hai, isliye access edge ko protection chahiye.</li>
<li>BPDU protection BPDU receive karne wale edge port ko block karti hai.</li>
<li>Root protection downlinks par superior BPDUs refuse karti hai.</li>
<li>Loop protection root aur alternate ports par missing BPDUs se bachati hai.</li>
<li>Protection kaaran rokti hai; storm control sirf nuksan limit karta hai.</li>
</ul></div>
`}};export{e as default};