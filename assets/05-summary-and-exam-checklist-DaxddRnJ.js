var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one minute</h3>
<p>The firewall at the edge of a data center sees only north-south traffic. Most traffic is east-west, between VMs inside, and a flat network with a default allow rule lets one taken-over workload reach many others. A distributed firewall fixes this by checking every VM's traffic at its own vNIC, using one policy held on a management console and pushed to every host. Micro-segmentation uses that power to allow only the flows an application needs, in four steps: discover flows, group workloads, write allow rules, switch the default to deny. Nothing counts until you publish.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary of the module in four boxes">
<rect x="10" y="30" width="145" height="80" rx="10" fill="#bae6fd"/><text x="82" y="62" text-anchor="middle" class="svg-ink" font-size="13">Problem</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">east-west is unseen</text>
<rect x="175" y="30" width="145" height="80" rx="10" fill="#fed7aa"/><text x="247" y="62" text-anchor="middle" class="svg-ink" font-size="13">Risk</text><text x="247" y="82" text-anchor="middle" class="svg-muted" font-size="11">flat net, big blast radius</text>
<rect x="340" y="30" width="145" height="80" rx="10" fill="#ddd6fe"/><text x="412" y="62" text-anchor="middle" class="svg-ink" font-size="13">Tool</text><text x="412" y="82" text-anchor="middle" class="svg-muted" font-size="11">check at every vNIC</text>
<rect x="505" y="30" width="125" height="80" rx="10" fill="#bbf7d0"/><text x="567" y="62" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="567" y="82" text-anchor="middle" class="svg-muted" font-size="11">allow-list, publish</text>
<line x1="155" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="485" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Problem, risk, tool, method: the storyline you should be able to retell.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the next module when you can do each of these without looking:</p>
<ul>
<li>Define VM, hypervisor, host, virtual switch, vNIC and firewall rule (source, destination, service, action).</li>
<li>Tell north-south from east-west traffic and say which one the edge firewall sees.</li>
<li>Explain flat network, default allow, lateral movement and blast radius in one sentence each, from a defender's point of view.</li>
<li>Run a Traceflow from WEB-P to DB-P on sql and read each line: which rules did not match and why, and what decided.</li>
<li>Explain how the console, the hosts and the vNICs share the work in a distributed firewall.</li>
<li>Explain why rules follow a VM when it moves and why same-host traffic is still checked.</li>
<li>List the four steps of a segmentation project and why default deny comes last.</li>
<li>Add a deny rule between two groups in the Application category, publish it, and prove with Traceflow that the needed flows still work.</li>
<li>Name the seven console pages and the job of each.</li>
<li>State what the simulator does not model.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Applied To</dt><dd>The setting that controls where a rule is pushed: every vNIC, or only the vNICs of one group.</dd>
<dt>Blast radius</dt><dd>Everything a single compromised workload can reach.</dd>
<dt>Category</dt><dd>A block of rules read in a fixed order: Ethernet, Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>The last rule, used when nothing else matched. Permissive on a fresh install.</dd>
<dt>Distributed firewall</dt><dd>Enforcement at each VM's vNIC, with policy held centrally.</dd>
<dt>East-west traffic</dt><dd>Traffic between workloads inside the data center.</dd>
<dt>Group</dt><dd>A set of VMs, dynamic (by tag or name) or static (a fixed list).</dd>
<dt>Lateral movement</dt><dd>An intruder reaching other workloads from one taken-over workload.</dd>
<dt>Micro-segmentation</dt><dd>Small policy-defined boundaries, with only needed flows allowed across them.</dd>
<dt>North-south traffic</dt><dd>Traffic entering or leaving the data center.</dd>
<dt>Publish changes</dt><dd>The action that turns draft edits into enforced policy.</dd>
<dt>Traceflow</dt><dd>A read-only question to the policy: what would happen to this flow, and why?</dd>
<dt>vNIC</dt><dd>A VM's virtual network card, where the check happens.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Category order</td><td>Ethernet, Emergency, Infrastructure, Environment, Application, then the default rule.</td></tr>
<tr><td>Inside a category</td><td>Top to bottom; first match wins.</td></tr>
<tr><td>Fresh install</td><td>Default rule is permissive; add specific allow rules, then move the default to drop or reject.</td></tr>
<tr><td>Where checked</td><td>At the sending vNIC (out) and the receiving vNIC (in).</td></tr>
<tr><td>Who holds the policy</td><td>The management console; hosts enforce a pushed copy.</td></tr>
<tr><td>Applied To</td><td>Controls where the rule is pushed.</td></tr>
<tr><td>Project order</td><td>Discover, group, allow, default deny.</td></tr>
<tr><td>Draft vs live</td><td>Only published changes are enforced.</td></tr>
</table>

<div class="note"><p><b>Simulator limits.</b> The simulator models the allow or deny decision. It does not model real host kernel enforcement, manager clustering, intrusion-detection signature feeds, a malware sandbox, network detection analytics, containers, public-cloud workloads, the layer-2 category, stateless rules, or the delay between publish and enforcement. It also does not model the "Jump to Application" action. This is independent training based on published product documentation, not vendor content and not certification coverage.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Saying the default rule is deny on a fresh install; reading categories in the wrong order; forgetting that unpublished edits do nothing; calling same-host traffic north-south.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which rule decides when no rule matches?" The default rule. "Where does it run?" At each vNIC, not on the console.</p></div>

<div class="scn"><h4>The one-page handover</h4><p>Before going on leave, a Narmada engineer left a note for the team: three Traceflow screenshots (before, after, application flow), the list of published rules, and one line, "default rule still allow, next step is review of default-rule hits". The covering engineer could continue without a call because the note showed evidence, not opinions.</p><p><b>Lesson:</b> write down what the policy does, what proves it, and what is left.</p></div>

<div class="iv"><p class="q">"Summarise micro-segmentation for a non-technical manager."</p><p>Strong answer: today if one server is broken into, it can talk to almost every other server. We add a lock on each server's network connection and open only the paths the business application needs. A break-in then stays small. We introduce it application by application, so nothing stops working. Keep it plain and mention you can show proof with test results.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge firewalls see north-south; distributed firewalls also check east-west at every vNIC.</li>
<li>Flat network plus default allow equals a large blast radius.</li>
<li>Categories are read in fixed order and the first match wins inside a category.</li>
<li>Segmentation order: discover, group, allow, default deny, and publish after each change.</li>
<li>Know what the simulator does not model, and never claim certification coverage.</li>
</ul></div>
`,hi:`
<h3>Poora module ek minute mein</h3>
<p>Data center ke edge ka firewall sirf north-south traffic dekhta hai. Zyada traffic east-west hota hai, andar ke VMs ke beech, aur default allow rule wala flat network ek taken-over workload ko kai doosron tak pahunchne deta hai. Distributed firewall isse theek karta hai: har VM ka traffic uske apne vNIC par check hota hai, ek policy se jo management console par rehti hai aur har host ko push hoti hai. Micro-segmentation is power ko use karke sirf wahi flows allow karti hai jo application ko chahiye, chaar steps mein: flows discover, workloads group, allow rules likho, default ko deny karo. Publish karne tak kuch count nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module ka summary chaar boxes mein">
<rect x="10" y="30" width="145" height="80" rx="10" fill="#bae6fd"/><text x="82" y="62" text-anchor="middle" class="svg-ink" font-size="13">Problem</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">east-west dikhta nahi</text>
<rect x="175" y="30" width="145" height="80" rx="10" fill="#fed7aa"/><text x="247" y="62" text-anchor="middle" class="svg-ink" font-size="13">Risk</text><text x="247" y="82" text-anchor="middle" class="svg-muted" font-size="11">flat net, bada blast radius</text>
<rect x="340" y="30" width="145" height="80" rx="10" fill="#ddd6fe"/><text x="412" y="62" text-anchor="middle" class="svg-ink" font-size="13">Tool</text><text x="412" y="82" text-anchor="middle" class="svg-muted" font-size="11">har vNIC par check</text>
<rect x="505" y="30" width="125" height="80" rx="10" fill="#bbf7d0"/><text x="567" y="62" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="567" y="82" text-anchor="middle" class="svg-muted" font-size="11">allow-list, publish</text>
<line x1="155" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="485" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Problem, risk, tool, method: yeh storyline aapko dobara sunani aani chahiye.</p></div>

<h3>Can-do checklist</h3>
<p>Aap agle module ke liye tayyar ho jab yeh sab bina dekhe kar sako:</p>
<ul>
<li>VM, hypervisor, host, virtual switch, vNIC aur firewall rule (source, destination, service, action) define karo.</li>
<li>North-south aur east-west traffic mein fark batao aur bolo ki edge firewall kaunsa dekhta hai.</li>
<li>Flat network, default allow, lateral movement aur blast radius ko defender ke point of view se ek-ek sentence mein samjhao.</li>
<li>WEB-P se DB-P tak sql par Traceflow chalao aur har line padho: kaunse rules match nahi hue aur kyun, aur kisne decide kiya.</li>
<li>Samjhao ki distributed firewall mein console, hosts aur vNICs kaam kaise baantte hain.</li>
<li>Samjhao ki VM move hone par rules uske saath kyun chalte hain aur same-host traffic phir bhi kyun check hota hai.</li>
<li>Segmentation project ke chaar steps batao aur default deny aakhir mein kyun aata hai.</li>
<li>Application category mein do groups ke beech deny rule jodo, publish karo, aur Traceflow se saabit karo ki zaroori flows abhi bhi chalte hain.</li>
<li>Saat console pages ke naam aur har ka kaam batao.</li>
<li>Batao ki simulator kya model nahi karta.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Applied To</dt><dd>Woh setting jo control karti hai ki rule kahan push hoga: har vNIC par, ya sirf ek group ke vNICs par.</dd>
<dt>Blast radius</dt><dd>Wo sab kuch jo ek compromised workload reach kar sakta hai.</dd>
<dt>Category</dt><dd>Rules ka block jo fixed order mein padha jaata hai: Ethernet, Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>Aakhri rule, jab kuch aur match na ho. Fresh install par permissive hota hai.</dd>
<dt>Distributed firewall</dt><dd>Har VM ke vNIC par enforcement, policy centrally rakhi hui.</dd>
<dt>East-west traffic</dt><dd>Data center ke andar workloads ke beech ka traffic.</dd>
<dt>Group</dt><dd>VMs ka set, dynamic (tag ya name se) ya static (fixed list).</dd>
<dt>Lateral movement</dt><dd>Ek taken-over workload se intruder ka doosre workloads tak pahunchna.</dd>
<dt>Micro-segmentation</dt><dd>Policy se bani chhoti boundaries, jinke paar sirf zaroori flows allowed hain.</dd>
<dt>North-south traffic</dt><dd>Data center mein aane ya bahar jaane wala traffic.</dd>
<dt>Publish changes</dt><dd>Woh action jo draft edits ko enforced policy banata hai.</dd>
<dt>Traceflow</dt><dd>Policy se read-only sawal: is flow ke saath kya hoga, aur kyun?</dd>
<dt>vNIC</dt><dd>VM ka virtual network card, jahan check hota hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Category order</td><td>Ethernet, Emergency, Infrastructure, Environment, Application, phir default rule.</td></tr>
<tr><td>Category ke andar</td><td>Ooper se neeche; pehla match jeetta hai.</td></tr>
<tr><td>Fresh install</td><td>Default rule permissive hai; specific allow rules jodo, phir default ko drop ya reject karo.</td></tr>
<tr><td>Check kahan hota hai</td><td>Bhejne wale vNIC par (out) aur receive karne wale vNIC par (in).</td></tr>
<tr><td>Policy kaun rakhta hai</td><td>Management console; hosts push ki hui copy enforce karte hain.</td></tr>
<tr><td>Applied To</td><td>Control karta hai rule kahan push hoga.</td></tr>
<tr><td>Project order</td><td>Discover, group, allow, default deny.</td></tr>
<tr><td>Draft vs live</td><td>Sirf published changes enforce hote hain.</td></tr>
</table>

<div class="note"><p><b>Simulator ki limits.</b> Simulator allow ya deny decision ko model karta hai. Woh real host kernel enforcement, manager clustering, intrusion-detection signature feeds, malware sandbox, network detection analytics, containers, public-cloud workloads, layer-2 category, stateless rules, ya publish aur enforcement ke beech ka delay model nahi karta. "Jump to Application" action bhi model nahi hai. Yeh independent training hai jo published product documentation par based hai, vendor content nahi aur certification coverage nahi.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Fresh install par default rule ko deny kehna; categories ka order galat padhna; yeh bhoolna ki unpublished edits kuch nahi karte; same-host traffic ko north-south kehna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Jab koi rule match na ho to kaunsa rule decide karta hai?" Default rule. "Woh kahan chalta hai?" Har vNIC par, console par nahi.</p></div>

<div class="scn"><h4>Ek page ka handover</h4><p>Chhutti par jaane se pehle Narmada ke ek engineer ne team ke liye ek note chhoda: teen Traceflow screenshots (pehle, baad, application flow), published rules ki list, aur ek line, "default rule abhi bhi allow hai, agla step default-rule hits ka review hai". Covering engineer bina call ke aage badh saka kyunki note mein opinions nahi, saboot the.</p><p><b>Seekh:</b> likho ki policy kya karti hai, kya saabit karta hai, aur kya baaki hai.</p></div>

<div class="iv"><p class="q">"Non-technical manager ko micro-segmentation summarise karo."</p><p>Strong answer: aaj agar ek server mein ghus liya jaye, to woh lagbhag har doosre server se baat kar sakta hai. Hum har server ke network connection par ek lock lagate hain aur sirf wahi raaste kholte hain jo business application ko chahiye. Phir break-in chhota rehta hai. Hum ise application by application laate hain, to kuch band nahi hota. Simple rakho aur bolo ki test results se saboot dikha sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge firewall north-south dekhta hai; distributed firewall east-west bhi har vNIC par check karta hai.</li>
<li>Flat network plus default allow barabar bada blast radius.</li>
<li>Categories fixed order mein padhi jaati hain aur category ke andar pehla match jeetta hai.</li>
<li>Segmentation order: discover, group, allow, default deny, aur har change ke baad publish.</li>
<li>Jaano ki simulator kya model nahi karta, aur certification coverage ka claim kabhi mat karo.</li>
</ul></div>
`}};export{e as default};