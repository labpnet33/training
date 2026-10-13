var e={id:`configure-pair`,h:{en:`Configuring the pair step by step`,hi:`Pair ko step by step configure karna`},body:{en:`
<p>You now know the links and the rules. This chapter walks through configuring a pair from start to finish. The steps are the same in the web interface (Device &gt; High Availability) and in the CLI. Every command block here is a <b>Reference configuration (not run in the simulator)</b>: read it, understand the order, and confirm exact syntax with the <code>?</code> key on your PAN-OS release.</p>

<h3>Build order</h3>
<ol>
<li>Cable the HA1 and HA2 links and confirm the physical link lights.</li>
<li>Give both firewalls unique management IPs and identical software and licences.</li>
<li>On each firewall set the HA links (addresses, ports).</li>
<li>Set the group ID, mode and peer HA1 address.</li>
<li>Set priority and preemption. Make the intended primary the lower number.</li>
<li>Add link and path monitoring (chapter 6).</li>
<li>Enable HA on both, then commit on both.</li>
<li>Check the state and the config sync status, then test a failover.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="10" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">1 Cable + mgmt</text>
<rect x="135" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 HA links</text>
<rect x="260" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="13">3 Group + election</text>
<rect x="385" y="50" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="85" text-anchor="middle" class="svg-ink" font-size="13">4 Monitoring</text>
<rect x="510" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="13">5 Enable + test</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do the same steps on both firewalls, with mirrored values.</p></div>

<h3>Reference configuration (not run in the simulator): FW-A, the intended active</h3>
<pre class="code"><span class="c"># HA links (FW-A)</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.1 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.1 netmask 255.255.255.252
<span class="c"># Group, mode and the peer's HA1 address</span>
set deviceconfig high-availability group group-id 1
set deviceconfig high-availability group mode active-passive
set deviceconfig high-availability group peer-ip 10.99.0.2
<span class="c"># Election: lower number wins, preemption on</span>
set deviceconfig high-availability group election-option device-priority 90
set deviceconfig high-availability group election-option preemptive yes
<span class="c"># Turn HA on</span>
set deviceconfig high-availability enabled yes
commit</pre>
<p>On <b>FW-B</b> the same commands apply with mirrored values: HA1 address 10.99.0.2, HA2 address 10.99.1.2, <code>peer-ip 10.99.0.1</code>, and <code>device-priority 110</code> (higher number, so lower preference). Keep the group ID and mode identical.</p>

<h3>Reading the choices</h3>
<dl class="terms">
<dt>group-id</dt><dd>A number from 1 to 63 that identifies the pair. It also affects the virtual MAC in active/active, so avoid clashes if several pairs share a segment.</dd>
<dt>peer-ip</dt><dd>The HA1 address of the other firewall. If this is wrong, the pair never sees the peer.</dd>
<dt>device-priority</dt><dd>Lower is better. The default is 100.</dd>
<dt>preemptive</dt><dd>Off by default. If it is on in both firewalls, the higher-priority unit takes back the active role after it recovers. Set the same value on both.</dd>
</dl>

<h3>Encrypted HA1 and extra settings</h3>
<p>If HA1 crosses an untrusted path, enable HA1 encryption: export the HA key from one firewall, import it on the other, and then enable encryption on both. Also set the heartbeat backup (management port) and an HA1 or HA2 backup link in the same Device &gt; High Availability pages. These optional steps prevent split brain and are routinely asked about in design reviews.</p>

<h3>Checking the result</h3>
<p>These operational commands exist on PAN-OS and are what you run after enabling HA. Output varies by release and is not reproduced here:</p>
<pre class="code">show high-availability state
show high-availability all
show high-availability interface ha1
show high-availability state-synchronization</pre>
<p>What to read: your local state and the peer state (one active, one passive), the running-configuration sync status (it should say the configs are synchronised), the HA1 and HA2 link status, and the compatibility results for software and licences.</p>

<div class="eg"><p><b>Worked example.</b> The engineer enables HA on FW-A first. FW-A waits for the peer and, after the timers, becomes active alone. She then configures and enables FW-B. FW-B sees the active peer, syncs the configuration across HA1, and settles into passive. If both units are enabled at the same time, priority decides: FW-A, with 90, wins. Always save and commit the HA changes on both firewalls before trusting the pair.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Configuring the security policy on both firewalls by hand. Configure policy on the active unit and let config sync copy it. Editing the passive unit separately creates drift and sync conflicts.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lower device priority wins. If preemption is enabled on only one unit, preemption does not behave the way you expect, so set it on both or on neither.</p></div>

<div class="scn"><h4>Everything committed, nothing synced</h4><p>A new engineer configured the pair and then changed a rule on FW-B, the passive firewall, believing both firewalls were separate. The next commit on FW-A overwrote the change with its own copy. After the incident the team added the rule: always change the active unit, commit, and verify that the passive status says synchronised.</p><p><b>Lesson:</b> one source of truth: configure the active unit and let sync do its work.</p></div>

<div class="iv"><p class="q">"Walk me through configuring an HA pair."</p><p>Cable HA1 and HA2, set unique management addresses, configure HA interface addresses, group ID, mode, peer IP, device priority and preemption on both sides with mirrored values, add monitoring and backups, enable HA and commit on both, then check the state, sync status and run a controlled failover test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mirror the configuration: the same group ID and mode, opposite peer addresses.</li>
<li>Lower device priority wins; set preemption the same on both.</li>
<li>Enable and commit on both firewalls, then check state and sync status.</li>
<li>Encrypt HA1 over untrusted paths and add backups.</li>
<li>Change policy on the active unit only.</li>
</ul></div>
`,hi:`
<p>Ab aap links aur rules jaante ho. Yeh chapter pair ko shuru se aakhir tak configure karna dikhata hai. Steps web interface (Device &gt; High Availability) aur CLI dono mein same hain. Yahan har command block ek <b>Reference configuration (not run in the simulator)</b> hai: padho, order samjho, aur apni PAN-OS release par <code>?</code> key se exact syntax confirm karo.</p>

<h3>Build order</h3>
<ol>
<li>HA1 aur HA2 links cable karo aur physical link lights confirm karo.</li>
<li>Dono firewalls ko unique management IPs do aur software aur licences identical rakho.</li>
<li>Har firewall par HA links set karo (addresses, ports).</li>
<li>Group ID, mode aur peer HA1 address set karo.</li>
<li>Priority aur preemption set karo. Jo primary banana hai use chhota number do.</li>
<li>Link aur path monitoring jodo (chapter 6).</li>
<li>Dono par HA enable karo, phir dono par commit karo.</li>
<li>State aur config sync status check karo, phir ek failover test karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="10" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">1 Cable + mgmt</text>
<rect x="135" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 HA links</text>
<rect x="260" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="13">3 Group + election</text>
<rect x="385" y="50" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="85" text-anchor="middle" class="svg-ink" font-size="13">4 Monitoring</text>
<rect x="510" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="13">5 Enable + test</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dono firewalls par same steps karo, mirrored values ke saath.</p></div>

<h3>Reference configuration (not run in the simulator): FW-A, intended active</h3>
<pre class="code"><span class="c"># HA links (FW-A)</span>
set deviceconfig high-availability interface ha1 port ha1-a ip-address 10.99.0.1 netmask 255.255.255.252
set deviceconfig high-availability interface ha2 port ha2-a ip-address 10.99.1.1 netmask 255.255.255.252
<span class="c"># Group, mode aur peer ka HA1 address</span>
set deviceconfig high-availability group group-id 1
set deviceconfig high-availability group mode active-passive
set deviceconfig high-availability group peer-ip 10.99.0.2
<span class="c"># Election: chhota number jeetta hai, preemption on</span>
set deviceconfig high-availability group election-option device-priority 90
set deviceconfig high-availability group election-option preemptive yes
<span class="c"># HA on karo</span>
set deviceconfig high-availability enabled yes
commit</pre>
<p><b>FW-B</b> par wahi commands mirrored values ke saath lagte hain: HA1 address 10.99.0.2, HA2 address 10.99.1.2, <code>peer-ip 10.99.0.1</code>, aur <code>device-priority 110</code> (bada number, matlab kam preference). Group ID aur mode identical rakho.</p>

<h3>Choices ko padhna</h3>
<dl class="terms">
<dt>group-id</dt><dd>1 se 63 ka number jo pair ko identify karta hai. Active/active mein yeh virtual MAC ko bhi affect karta hai, isliye ek segment par kai pairs hon to clash se bacho.</dd>
<dt>peer-ip</dt><dd>Doosre firewall ka HA1 address. Yeh galat ho to pair kabhi peer ko dekh hi nahi paata.</dd>
<dt>device-priority</dt><dd>Chhota behtar hai. Default 100 hai.</dd>
<dt>preemptive</dt><dd>Default mein off. Dono firewalls mein on ho to higher-priority unit recover hone ke baad active role wapas le leta hai. Dono par same value rakho.</dd>
</dl>

<h3>Encrypted HA1 aur extra settings</h3>
<p>Agar HA1 untrusted path se guzarta hai to HA1 encryption enable karo: ek firewall se HA key export karo, doosre par import karo, phir dono par encryption enable karo. Heartbeat backup (management port) aur HA1 ya HA2 backup link bhi isi Device &gt; High Availability pages mein set karo. Yeh optional steps split brain rokte hain aur design reviews mein aksar poochhe jaate hain.</p>

<h3>Result check karna</h3>
<p>Yeh operational commands PAN-OS par maujood hain aur HA enable karne ke baad inhe chalaate hain. Output release ke hisaab se badalta hai isliye yahan reproduce nahi kiya:</p>
<pre class="code">show high-availability state
show high-availability all
show high-availability interface ha1
show high-availability state-synchronization</pre>
<p>Kya padhna hai: aapka local state aur peer state (ek active, ek passive), running-configuration sync status (batana chahiye ki configs synchronised hain), HA1 aur HA2 link status, aur software aur licences ke compatibility results.</p>

<div class="eg"><p><b>Worked example.</b> Engineer pehle FW-A par HA enable karti hai. FW-A peer ka intezaar karta hai aur timers ke baad akela active ban jaata hai. Phir woh FW-B configure aur enable karti hai. FW-B active peer ko dekhta hai, HA1 par configuration sync karta hai, aur passive mein settle ho jaata hai. Agar dono units ek saath enable ho jaayein to priority decide karti hai: 90 ke saath FW-A jeetta hai. Pair par bharosa karne se pehle HA changes dono firewalls par save aur commit karo.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Security policy dono firewalls par haath se configure karna. Policy active unit par configure karo aur config sync ko copy karne do. Passive unit ko alag se edit karne se drift aur sync conflicts bante hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chhota device priority jeetta hai. Preemption sirf ek unit par enabled ho to woh waise behave nahi karta jaise aap sochte ho, isliye dono par set karo ya kisi par nahi.</p></div>

<div class="scn"><h4>Sab commit hua, kuch sync nahi hua</h4><p>Ek naye engineer ne pair configure kiya aur phir FW-B, passive firewall, par ek rule badla, yeh sochkar ki dono firewalls alag hain. FW-A par agle commit ne apni copy se woh change overwrite kar diya. Incident ke baad team ne rule banaya: hamesha active unit badlo, commit karo, aur verify karo ki passive ka status synchronised batata hai.</p><p><b>Lesson:</b> source of truth ek hi rakho: active unit configure karo aur sync ko apna kaam karne do.</p></div>

<div class="iv"><p class="q">"HA pair configure karne ka process batao."</p><p>HA1 aur HA2 cable karo, unique management addresses set karo, HA interface addresses, group ID, mode, peer IP, device priority aur preemption dono taraf mirrored values ke saath configure karo, monitoring aur backups jodo, dono par HA enable aur commit karo, phir state, sync status check karo aur ek controlled failover test chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration mirror karo: same group ID aur mode, ulte peer addresses.</li>
<li>Chhota device priority jeetta hai; preemption dono par same set karo.</li>
<li>Dono firewalls par enable aur commit karo, phir state aur sync status check karo.</li>
<li>Untrusted paths par HA1 encrypt karo aur backups jodo.</li>
<li>Policy sirf active unit par badlo.</li>
</ul></div>
`}};export{e as default};