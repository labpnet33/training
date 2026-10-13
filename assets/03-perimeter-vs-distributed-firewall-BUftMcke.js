var e={id:`perimeter-vs-distributed`,h:{en:`Perimeter versus distributed firewall`,hi:`Perimeter versus distributed firewall`},body:{en:`
<h3>The idea in one sentence</h3>
<p>A perimeter firewall is <b>one checkpoint that traffic must be sent to</b>. A distributed firewall is <b>a checkpoint built into every VM's network card</b>, so traffic is checked where it starts and where it ends, without being sent anywhere.</p>
<p>Back to the bank: instead of one extra guard that visitors must walk to, every door now has its own lock, and every lock uses the same rule book.</p>

<h3>How a distributed firewall works, step by step</h3>
<ol>
<li><b>One place holds the policy.</b> A central management console stores groups and rules for the whole data center. You edit policy here, once.</li>
<li><b>The policy is pushed to every host.</b> The console sends the rules to each host, so each host has a local copy and does not need to ask the console for every packet.</li>
<li><b>Each VM is checked at its own vNIC.</b> When a VM sends a packet, the host checks it against the rules at the sending vNIC (on the way <b>out</b>). When a VM receives a packet, the host checks it again at the receiving vNIC (on the way <b>in</b>).</li>
<li><b>Applied To limits where a rule is pushed.</b> A rule can be applied to everything or only to the vNICs of one group. A narrow Applied To means the rule exists only at those vNICs.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Management console pushes policy to hosts and each vNIC enforces it">
<rect x="220" y="14" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Management console</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="11">holds the policy</text>
<line x1="270" y1="58" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="58" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="190" y="82" text-anchor="middle" class="svg-muted" font-size="11">push</text><text x="450" y="82" text-anchor="middle" class="svg-muted" font-size="11">push</text>
<rect x="20" y="100" width="290" height="140" rx="10" fill="none" stroke="#64748b" stroke-width="2"/><text x="165" y="118" text-anchor="middle" class="svg-ink" font-size="12">Host 1</text>
<rect x="340" y="100" width="290" height="140" rx="10" fill="none" stroke="#64748b" stroke-width="2"/><text x="485" y="118" text-anchor="middle" class="svg-ink" font-size="12">Host 2</text>
<rect x="40" y="135" width="100" height="40" rx="8" fill="#bae6fd"/><text x="90" y="160" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="190" y="135" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="160" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="360" y="135" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="410" y="160" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="136" y="145" width="8" height="20" fill="#f97316"/><rect x="186" y="145" width="8" height="20" fill="#f97316"/><rect x="456" y="145" width="8" height="20" fill="#f97316"/>
<line x1="144" y1="155" x2="186" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="165" y="195" text-anchor="middle" class="svg-ink" font-size="11">same host: still checked</text>
<text x="400" y="215" text-anchor="middle" class="svg-ink" font-size="11">orange = vNIC checkpoint</text>
<line x1="294" y1="155" x2="356" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="325" y="225" text-anchor="middle" class="svg-muted" font-size="11">across hosts</text>
</svg><p class="cap">The console holds one policy. Each host enforces it at every VM's vNIC, including traffic between two VMs on the same host.</p></div>

<h3>Two consequences you should remember</h3>
<p><b>The rules follow the VM.</b> The policy is attached to the VM's vNIC and to the VM's group membership, not to a cable or a subnet. If APP-P moves to another host, the same rules protect it there, because every host holds the same policy. Nobody re-cables anything.</p>
<p><b>Same-host traffic is still checked.</b> Suppose WEB-P and DB-P happen to run on one host. Their packets only pass through that host's virtual switch and never reach a physical network. A physical firewall could never see them. A distributed firewall checks them at both vNICs anyway.</p>

<h3>Comparing the three ways to separate servers</h3>
<table class="cmp">
<tr><th>Approach</th><th>Where the check happens</th><th>What you must do to use it</th><th>Weak point for east-west</th></tr>
<tr><td>Appliance firewall (physical or virtual)</td><td>At one box</td><td>Steer traffic through the box, often by designing networks around it</td><td>Traffic that is not steered is not checked; the box can become a bottleneck</td></tr>
<tr><td>VLAN or subnet segmentation</td><td>At a router or switch boundary, using access lists or a firewall</td><td>Put each tier in its own subnet, maintain address-based lists</td><td>Policy tied to addresses; VMs in one subnet trust each other; moving a VM may mean new addresses</td></tr>
<tr><td>Distributed firewall</td><td>At every VM's vNIC</td><td>Group workloads and write rules once on the console</td><td>Only covers workloads that sit behind a host that enforces it</td></tr>
</table>
<p>These are not enemies. Most data centers keep an edge or gateway firewall for north-south traffic and add a distributed firewall for east-west traffic. A later module covers the gateway firewall.</p>

<h3>Order of checking</h3>
<p>The distributed firewall policy is split into <b>categories</b> read in a fixed order: Ethernet (layer 2), Emergency, Infrastructure, Environment, Application, and then the <b>default rule</b>. Inside a category rules are read top to bottom and the first match wins. The Environment category also offers a "Jump to Application" action that skips the rest of Environment; the simulator does not model it. Use of the layer-2 category is also not modelled. For details that depend on your version, check the documentation for your version.</p>

<div class="note"><p><b>What the simulator models, and what it does not.</b> The simulator models the <b>decision</b>: which rule, in which category, allows or denies a flow from one VM to another. It does not model the kernel code on a real host, manager clustering, stateless rules or the delay between publishing and enforcement. When you click Publish here, the change is instant. In real life, check the documentation for your version about how long a change takes to reach every host.</p></div>

<div class="eg"><p><b>Worked example.</b> Narmada moves APP-P from Host 1 to Host 2 for maintenance. With an appliance design, the engineer would check that the new path still goes through the firewall. With the distributed firewall, the rule "Web to app (prod)" still matches because APP-P is still in the group "App servers (prod)" and Host 2 holds the same policy. Traceflow before and after the move gives the same result.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Saying a distributed firewall is "a firewall running on the VM": the VM's own operating system is not involved, the host checks at the vNIC. (2) Thinking the console inspects every packet: it holds the policy, the hosts enforce it. (3) Narrowing Applied To so far that the rule is pushed to the wrong vNICs and never fires.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Does traffic between two VMs on the same host reach the physical network?" No, and that is exactly why a perimeter box cannot see it while a vNIC-level firewall can.</p></div>

<div class="scn"><h4>The maintenance move that changed nothing</h4><p>Narmada's infrastructure team drained a host for patching and moved eight VMs to other hosts. The security team expected a round of rule fixes. Instead they ran Traceflow on six representative flows afterwards and got the same results as before. The policy followed the VMs because it belongs to the group, not to the location.</p><p><b>Lesson:</b> enforcement at the vNIC makes policy independent of the VM's physical position.</p></div>

<div class="iv"><p class="q">"How is a distributed firewall different from putting a firewall between VLANs?"</p><p>Strong answer: a VLAN firewall checks only traffic that crosses the VLAN boundary and ties policy to subnets and addresses. A distributed firewall checks at every VM's vNIC, so traffic inside one subnet or one host is also checked, and the policy follows the VM when it moves. Mention that both can coexist.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A central console holds the policy; the policy is pushed to every host.</li>
<li>Each VM's traffic is checked at its own vNIC, outbound and inbound.</li>
<li>Rules follow the VM, and same-host VM-to-VM traffic is still checked.</li>
<li>Categories run Ethernet, Emergency, Infrastructure, Environment, Application, then the default rule; first match wins inside a category.</li>
<li>The simulator models the decision, not the kernel, and Publish is instant in it.</li>
</ul></div>
`,hi:`
<h3>Ek sentence mein idea</h3>
<p>Perimeter firewall <b>ek checkpoint hai jahan traffic ko bheja jaata hai</b>. Distributed firewall <b>har VM ke network card mein bana checkpoint hai</b>, to traffic wahin check hota hai jahan se shuru hota hai aur jahan khatam hota hai, use kahin bheja nahi jaata.</p>
<p>Wapas bank par: ek extra guard ke paas visitors ko chalke jaana padta tha, ab har darwaze ka apna lock hai, aur har lock wahi rule book use karta hai.</p>

<h3>Distributed firewall kaise kaam karta hai, step by step</h3>
<ol>
<li><b>Policy ek jagah rehti hai.</b> Ek central management console poore data center ke groups aur rules store karta hai. Aap policy yahan ek baar edit karte ho.</li>
<li><b>Policy har host ko push hoti hai.</b> Console rules har host ko bhejta hai, to har host ke paas local copy hoti hai aur use har packet ke liye console se poochna nahi padta.</li>
<li><b>Har VM apne vNIC par check hota hai.</b> Jab VM packet bhejta hai, host use bhejne wale vNIC par rules se check karta hai (<b>out</b> jaate waqt). Jab VM packet receive karta hai, host use receive karne wale vNIC par phir check karta hai (<b>in</b> aate waqt).</li>
<li><b>Applied To batata hai rule kahan push hoga.</b> Rule sab par ya sirf ek group ke vNICs par lag sakta hai. Narrow Applied To ka matlab rule sirf un vNICs par maujood hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Management console policy hosts ko push karta hai aur har vNIC enforce karta hai">
<rect x="220" y="14" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Management console</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="11">policy yahan rehti hai</text>
<line x1="270" y1="58" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="58" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="190" y="82" text-anchor="middle" class="svg-muted" font-size="11">push</text><text x="450" y="82" text-anchor="middle" class="svg-muted" font-size="11">push</text>
<rect x="20" y="100" width="290" height="140" rx="10" fill="none" stroke="#64748b" stroke-width="2"/><text x="165" y="118" text-anchor="middle" class="svg-ink" font-size="12">Host 1</text>
<rect x="340" y="100" width="290" height="140" rx="10" fill="none" stroke="#64748b" stroke-width="2"/><text x="485" y="118" text-anchor="middle" class="svg-ink" font-size="12">Host 2</text>
<rect x="40" y="135" width="100" height="40" rx="8" fill="#bae6fd"/><text x="90" y="160" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="190" y="135" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="240" y="160" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="360" y="135" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="410" y="160" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="136" y="145" width="8" height="20" fill="#f97316"/><rect x="186" y="145" width="8" height="20" fill="#f97316"/><rect x="456" y="145" width="8" height="20" fill="#f97316"/>
<line x1="144" y1="155" x2="186" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="165" y="195" text-anchor="middle" class="svg-ink" font-size="11">same host: phir bhi check</text>
<text x="400" y="215" text-anchor="middle" class="svg-ink" font-size="11">orange = vNIC checkpoint</text>
<line x1="294" y1="155" x2="356" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="325" y="225" text-anchor="middle" class="svg-muted" font-size="11">hosts ke beech</text>
</svg><p class="cap">Console ek policy rakhta hai. Har host use har VM ke vNIC par enforce karta hai, same host ke do VMs ke beech ke traffic par bhi.</p></div>

<h3>Do consequences jo yaad rakhne hain</h3>
<p><b>Rules VM ke saath chalte hain.</b> Policy VM ke vNIC aur VM ki group membership se juri hai, kisi cable ya subnet se nahi. Agar APP-P doosre host par chala jaye, to wahi rules wahan bhi use protect karte hain, kyunki har host ke paas wahi policy hai. Koi kuch re-cable nahi karta.</p>
<p><b>Same-host traffic bhi check hota hai.</b> Maan lo WEB-P aur DB-P ek hi host par chalte hain. Unke packets sirf us host ke virtual switch se guzarte hain aur kisi physical network tak nahi jaate. Physical firewall unhe kabhi nahi dekh sakta. Distributed firewall unhe phir bhi dono vNICs par check karta hai.</p>

<h3>Servers ko alag karne ke teen tareeke, comparison</h3>
<table class="cmp">
<tr><th>Approach</th><th>Check kahan hota hai</th><th>Use karne ke liye kya karna padta hai</th><th>East-west ke liye kamzori</th></tr>
<tr><td>Appliance firewall (physical ya virtual)</td><td>Ek box par</td><td>Traffic ko box ke through steer karo, aksar networks ko box ke hisaab se design karke</td><td>Jo traffic steer nahi hua woh check nahi hota; box bottleneck ban sakta hai</td></tr>
<tr><td>VLAN ya subnet segmentation</td><td>Router ya switch boundary par, access lists ya firewall se</td><td>Har tier ko alag subnet mein rakho, address-based lists sambhalo</td><td>Policy addresses se bandhi hai; ek subnet ke VMs ek doosre par trust karte hain; VM move karne par naye addresses lag sakte hain</td></tr>
<tr><td>Distributed firewall</td><td>Har VM ke vNIC par</td><td>Workloads ko group karo aur rules console par ek baar likho</td><td>Sirf un workloads ko cover karta hai jo enforce karne wale host ke peeche hain</td></tr>
</table>
<p>Yeh dushman nahi hain. Zyada-tar data centers north-south traffic ke liye edge ya gateway firewall rakhte hain aur east-west ke liye distributed firewall jodte hain. Gateway firewall aage ke module mein aayega.</p>

<h3>Checking ka order</h3>
<p>Distributed firewall policy <b>categories</b> mein bati hoti hai jo fixed order mein padhi jaati hain: Ethernet (layer 2), Emergency, Infrastructure, Environment, Application, aur phir <b>default rule</b>. Category ke andar rules ooper se neeche padhe jaate hain aur pehla match jeetta hai. Environment category mein "Jump to Application" action bhi hota hai jo Environment ke baaki rules skip kar deta hai; simulator ise model nahi karta. Layer-2 category ka use bhi model nahi hai. Jo details aapke version par depend karti hain, unke liye apne version ki documentation check karo.</p>

<div class="note"><p><b>Simulator kya model karta hai, aur kya nahi.</b> Simulator <b>decision</b> ko model karta hai: kaunsa rule, kaunsi category mein, ek VM se doosre VM ke flow ko allow ya deny karta hai. Woh real host ka kernel code, manager clustering, stateless rules ya publish aur enforcement ke beech ka delay model nahi karta. Yahan Publish dabate hi change instant ho jaata hai. Real life mein, change har host tak kitni der mein pahunchta hai, yeh apne version ki documentation mein check karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Narmada maintenance ke liye APP-P ko Host 1 se Host 2 par le jaata hai. Appliance design mein engineer ko check karna padta ki naya path abhi bhi firewall se guzarta hai. Distributed firewall ke saath rule "Web to app (prod)" abhi bhi match karta hai kyunki APP-P abhi bhi group "App servers (prod)" mein hai aur Host 2 ke paas wahi policy hai. Move se pehle aur baad ka Traceflow same result deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Distributed firewall ko "VM par chalne wala firewall" kehna: VM ka apna operating system involved nahi hai, host vNIC par check karta hai. (2) Yeh sochna ki console har packet inspect karta hai: console policy rakhta hai, hosts enforce karte hain. (3) Applied To ko itna narrow kar dena ki rule galat vNICs par push ho aur kabhi fire na ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kya same host ke do VMs ke beech ka traffic physical network tak jaata hai?" Nahi, aur isi wajah se perimeter box use nahi dekh sakta jabki vNIC-level firewall dekh leta hai.</p></div>

<div class="scn"><h4>Maintenance move jisne kuch nahi badla</h4><p>Narmada ki infrastructure team ne patching ke liye ek host khaali kiya aur aath VMs doosre hosts par move kiye. Security team ne rule fixes ke ek round ki ummeed ki thi. Uski jagah unhone baad mein chhe representative flows par Traceflow chalaya aur pehle jaise hi results mile. Policy VMs ke saath chali gayi kyunki woh group ki hai, location ki nahi.</p><p><b>Seekh:</b> vNIC par enforcement policy ko VM ki physical position se independent bana deta hai.</p></div>

<div class="iv"><p class="q">"Distributed firewall VLANs ke beech firewall rakhne se kaise alag hai?"</p><p>Strong answer: VLAN firewall sirf wahi traffic check karta hai jo VLAN boundary cross kare aur policy ko subnets aur addresses se bandhta hai. Distributed firewall har VM ke vNIC par check karta hai, to ek subnet ya ek host ke andar ka traffic bhi check hota hai, aur VM move hone par policy uske saath chalti hai. Yeh bhi bolo ki dono saath rah sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central console policy rakhta hai; policy har host ko push hoti hai.</li>
<li>Har VM ka traffic apne vNIC par check hota hai, outbound aur inbound.</li>
<li>Rules VM ke saath chalte hain, aur same-host VM-to-VM traffic bhi check hota hai.</li>
<li>Categories ka order: Ethernet, Emergency, Infrastructure, Environment, Application, phir default rule; category ke andar pehla match jeetta hai.</li>
<li>Simulator decision model karta hai, kernel nahi, aur isme Publish instant hai.</li>
</ul></div>
`}};export{e as default};