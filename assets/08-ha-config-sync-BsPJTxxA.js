var e={id:`ha-config-sync`,h:{en:`Configuration sync: checksums and why the primary wins`,hi:`Configuration sync: checksums aur primary kyun jeetta hai`},body:{en:`
<p>A restaurant chain keeps one master recipe book at head office. Every branch receives the same pages, so a customer gets the same dish anywhere. If a branch cook scribbles a private change in the margin, the next delivery from head office replaces that page. A FortiGate cluster works the same way: the <b>primary</b> is head office, the <b>secondary</b> is the branch. This chapter teaches lab <b>n7-ha-sync</b> (ticket NT-4502) completely.</p>

<h3>What travels and what stays</h3>
<p>Once the units are a cluster, the primary sends its <b>whole configuration</b> to the secondary, at join time and after every change. A new secondary overwrites whatever it had; this is how FGT-B received policy 1 <code>LAN-to-WAN</code> in lab 1 without typing it. A few settings are deliberately <b>per unit</b> and never synchronised:</p>
<ul>
<li>the <b>host name</b> (so you can tell FGT-A from FGT-B),</li>
<li>the device <b>priority</b>,</li>
<li><b>override</b> and <b>override-wait-time</b>,</li>
<li>the interface entry of the <b>reserved management interface</b> (its own IP and allowaccess; chapter 10).</li>
</ul>
<p>Everything else, including firewall policies, address objects, routing, VPNs and the HA block itself, is shared. If you type a change on the secondary, it is sent to the primary first and then comes back to both, so the primary stays the single source of truth.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Configuration flows from the primary to the secondary">
<rect x="30" y="40" width="200" height="130" rx="10" fill="#bae6fd"/><text x="130" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-A primary</text>
<text x="130" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy 1, policy 2 VOIP-OUT</text><text x="130" y="110" text-anchor="middle" class="svg-muted" font-size="12">address objects, routes</text><text x="130" y="140" text-anchor="middle" class="svg-accent" font-size="12">host name FGT-A, priority 200</text>
<rect x="410" y="40" width="200" height="130" rx="10" fill="#ddd6fe"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-B secondary</text>
<text x="510" y="90" text-anchor="middle" class="svg-muted" font-size="12">receives the same tables</text><text x="510" y="110" text-anchor="middle" class="svg-muted" font-size="12">policy 99 is removed</text><text x="510" y="140" text-anchor="middle" class="svg-accent" font-size="12">host name FGT-B, priority 100</text>
<line x1="230" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="4"/><polygon points="410,80 398,73 398,87" fill="#64748b"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">whole configuration</text>
<line x1="410" y1="130" x2="230" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">CLI change on FGT-B goes up first</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Not copied: host name, priority, override, override-wait-time, mgmt interface entry</text>
</svg><p class="cap">The primary always wins: its configuration replaces the secondary's, except the per-unit settings.</p></div>

<h3>Switching sync off</h3>
<p><code>set sync-config disable</code> in <code>config system ha</code> on the primary (or <code>execute ha synchronize stop</code>) pauses synchronisation; <code>execute ha synchronize start</code> resumes it. While it is off, the units are still a cluster, still fail over, but their configurations drift and <code>get system ha status</code> shows <b>out-of-sync</b>. Operators sometimes disable sync during a risky change and forget it, which is exactly the ticket in this lab. Failover to an unsynchronised unit can mean the wrong policy set.</p>

<h3>The checksum workflow</h3>
<p>FortiOS keeps a checksum for every configuration table. The method is always the same, from coarse to fine:</p>
<ol>
<li><code>get system ha status</code>: see "Configuration Status" per serial: in-sync or out-of-sync.</li>
<li><code>diagnose sys ha checksum cluster</code>: for each unit the <code>global</code>, <code>root</code> and <code>all</code> checksums plus <code>is_manage_primary()</code>. If they differ between units, the units differ, but you do not yet know where.</li>
<li><code>diagnose sys ha checksum show</code> on <b>both</b> units: one line per table. Compare the lines; only the differing table matters.</li>
<li>Fix the cause on the primary, then <code>diagnose sys ha checksum recalculate</code> if you suspect stale values, and check again.</li>
</ol>
<pre class="out">FGT-A # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 0a 18 eb 8d 87 c8 f0 dd 39 a5 e8 4b 9b c4 f2 ea</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51
system.ha: e5 14 d5 8b a3 2e bd d4 59 31 de e1 67 52 ce b0

FGT-B # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 77 c2 19 e0 4d 5a b1 08 f3 66 a0 2e 91 d7 3c 5b</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51
system.ha: e5 14 d5 8b a3 2e bd d4 59 31 de e1 67 52 ce b0</pre>
<p>The checksum of <code>system.global</code> is equal on both units even though their host names differ, because the host name is excluded as a per-unit setting. In the simulator the object UUIDs are left out of the comparison; real units compare more detail and an occasional mismatch needs <code>recalculate</code> before you believe it.</p>

<h3>Lab 3 walk-through</h3>
<p>Both units start with <code>sync-config disable</code>. Policy 2 <code>VOIP-OUT</code> exists only on FGT-A, policy 99 <code>TEMP-TEST</code> only on FGT-B.</p>
<pre class="code"><span class="c">! 1 read the symptom</span>
get system ha status
<span class="c">! 2 which table? run on both units, compare</span>
diagnose sys ha checksum show
<span class="c">! 3 find the cause</span>
show system ha
<span class="c">! 4 record the secondary's local change first (on FGT-B)</span>
show firewall policy 99
<span class="c">! 5 fix on the primary</span>
config system ha
    set sync-config enable
end
<span class="c">! 6 verify</span>
diagnose sys ha checksum cluster</pre>
<pre class="out">FGT-A # get system ha status
...
Configuration Status:
    FGVMEV1OO2UZP000(updated 2 seconds ago): <span class="hl">out-of-sync</span>
    FGVMEV1NU41WS000(updated 1 seconds ago): <span class="hl">out-of-sync</span></pre>
<p>After step 5 FGT-B holds policy 2 and <b>has lost policy 99</b>. The primary always wins; a change made on a secondary while sync was off is overwritten. That is why step 4 comes first: write down or export what you will lose. FGT-B still shows its own host name and <code>set priority 100</code>, which proves the per-unit rule.</p>

<div class="warn"><p><b>Common mistake.</b> Fixing "out-of-sync" by editing the secondary to match. Edits go to the primary. And never enable sync before you have recorded unique local changes on the secondary.</p></div>

<div class="exam"><p><b>Exam trap.</b> The checksum cluster output tells you that units differ, not which table; use <code>checksum show</code> for the table. Also: priority, host name, override and the management interface entry never appear in the comparison.</p></div>

<div class="scn"><h4>The test policy that vanished</h4><p>During an incident a junior engineer logged into FGT-B directly, added a temporary policy, and left it. Weeks later sync was repaired on FGT-A and the policy disappeared; a test depending on it stopped. Nothing was broken: the cluster did what it is designed to do. The team now makes every change on the primary and runs <code>checksum show</code> before and after maintenance windows.</p><p><b>Lesson:</b> one source of truth means local edits on a secondary are temporary by design.</p></div>

<div class="iv"><p class="q">"One FortiGate in a cluster shows out-of-sync. What do you do?"</p><p>Answer with the workflow: status, checksum cluster, checksum show on both units to find the table, then the cause (sync-config disable, stopped synchronisation, a heartbeat or version problem). Fix it on the primary, state that the primary overwrites the secondary, and mention what is never synchronised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The primary pushes its whole configuration; the secondary is overwritten, also at join.</li>
<li>Per unit: host name, priority, override, override-wait-time, management interface entry.</li>
<li>sync-config disable or execute ha synchronize stop leaves the units out-of-sync.</li>
<li>Checksum workflow: status, checksum cluster, checksum show on both units, find the table.</li>
<li>Changes belong on the primary; local secondary changes are lost.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain ke head office mein ek master recipe book hoti hai. Har branch ko same pages milte hain, taaki customer ko kahin bhi same dish mile. Agar kisi branch ka cook margin mein apna private change likh de, to head office ki agli delivery us page ko replace kar deti hai. FortiGate cluster bhi aise hi chalta hai: <b>primary</b> head office hai, <b>secondary</b> branch. Is chapter mein lab <b>n7-ha-sync</b> (ticket NT-4502) poora sikhenge.</p>

<h3>Kya jaata hai aur kya nahi</h3>
<p>Units jab cluster ban jaate hain, primary apni <b>poori configuration</b> secondary ko bhejta hai, join ke time aur har change ke baad. Naya secondary jo bhi uske paas tha usse overwrite kar deta hai; lab 1 mein FGT-B ko policy 1 <code>LAN-to-WAN</code> isi tarah type kiye bina mili. Kuch settings jaan-boojh kar <b>per unit</b> hain aur kabhi synchronise nahi hotin:</p>
<ul>
<li><b>host name</b> (taaki FGT-A aur FGT-B mein farq pata chale),</li>
<li>device <b>priority</b>,</li>
<li><b>override</b> aur <b>override-wait-time</b>,</li>
<li><b>reserved management interface</b> ki interface entry (uska apna IP aur allowaccess; chapter 10).</li>
</ul>
<p>Baaki sab kuch, jaise firewall policies, address objects, routing, VPNs aur HA block khud, shared hai. Agar aap secondary par change type karte ho, to woh pehle primary ko jaata hai aur phir dono par wapas aata hai, isliye primary single source of truth rehta hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Configuration primary se secondary ko jaati hai">
<rect x="30" y="40" width="200" height="130" rx="10" fill="#bae6fd"/><text x="130" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-A primary</text>
<text x="130" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy 1, policy 2 VOIP-OUT</text><text x="130" y="110" text-anchor="middle" class="svg-muted" font-size="12">address objects, routes</text><text x="130" y="140" text-anchor="middle" class="svg-accent" font-size="12">host name FGT-A, priority 200</text>
<rect x="410" y="40" width="200" height="130" rx="10" fill="#ddd6fe"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-B secondary</text>
<text x="510" y="90" text-anchor="middle" class="svg-muted" font-size="12">wahi tables milti hain</text><text x="510" y="110" text-anchor="middle" class="svg-muted" font-size="12">policy 99 hat jaati hai</text><text x="510" y="140" text-anchor="middle" class="svg-accent" font-size="12">host name FGT-B, priority 100</text>
<line x1="230" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="4"/><polygon points="410,80 398,73 398,87" fill="#64748b"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">poori configuration</text>
<line x1="410" y1="130" x2="230" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">FGT-B ka CLI change pehle upar jaata hai</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Copy nahi: host name, priority, override, override-wait-time, mgmt interface entry</text>
</svg><p class="cap">Primary hamesha jeetta hai: uski configuration secondary ki configuration replace karti hai, per-unit settings ko chhodkar.</p></div>

<h3>Sync band karna</h3>
<p>Primary par <code>config system ha</code> mein <code>set sync-config disable</code> (ya <code>execute ha synchronize stop</code>) synchronisation pause karta hai; <code>execute ha synchronize start</code> use resume karta hai. Band hone par bhi units cluster rehte hain aur fail over karte hain, par configurations drift karti hain aur <code>get system ha status</code> <b>out-of-sync</b> dikhata hai. Operators kabhi-kabhi risky change ke time sync disable kar dete hain aur bhool jaate hain; is lab ka ticket bilkul yahi hai. Unsynchronised unit par failover ka matlab galat policy set ho sakta hai.</p>

<h3>Checksum workflow</h3>
<p>FortiOS har configuration table ka checksum rakhta hai. Method hamesha same hai, motey se bareek ki taraf:</p>
<ol>
<li><code>get system ha status</code>: har serial ka "Configuration Status" dekho: in-sync ya out-of-sync.</li>
<li><code>diagnose sys ha checksum cluster</code>: har unit ke <code>global</code>, <code>root</code> aur <code>all</code> checksums aur <code>is_manage_primary()</code>. Agar units ke beech alag hain, to units alag hain, par kahan, yeh abhi nahi pata.</li>
<li>Dono units par <code>diagnose sys ha checksum show</code>: har table ki ek line. Lines compare karo; sirf alag table maayne rakhti hai.</li>
<li>Primary par cause theek karo, phir agar stale values ka shak ho to <code>diagnose sys ha checksum recalculate</code>, aur dobara check karo.</li>
</ol>
<pre class="out">FGT-A # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 0a 18 eb 8d 87 c8 f0 dd 39 a5 e8 4b 9b c4 f2 ea</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51
system.ha: e5 14 d5 8b a3 2e bd d4 59 31 de e1 67 52 ce b0

FGT-B # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 77 c2 19 e0 4d 5a b1 08 f3 66 a0 2e 91 d7 3c 5b</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51
system.ha: e5 14 d5 8b a3 2e bd d4 59 31 de e1 67 52 ce b0</pre>
<p><code>system.global</code> ka checksum dono units par barabar hai jabki host name alag hain, kyunki host name per-unit setting hone ki wajah se comparison se bahar hai. Simulator mein object UUIDs comparison se hata diye gaye hain; real units zyada detail compare karte hain aur kabhi-kabhi mismatch par bharosa karne se pehle <code>recalculate</code> chalana padta hai.</p>

<h3>Lab 3 walk-through</h3>
<p>Dono units <code>sync-config disable</code> ke saath start hote hain. Policy 2 <code>VOIP-OUT</code> sirf FGT-A par hai, policy 99 <code>TEMP-TEST</code> sirf FGT-B par.</p>
<pre class="code"><span class="c">! 1 symptom padho</span>
get system ha status
<span class="c">! 2 kaunsi table? dono units par chalao, compare karo</span>
diagnose sys ha checksum show
<span class="c">! 3 cause dhoondo</span>
show system ha
<span class="c">! 4 secondary ka local change pehle record karo (FGT-B par)</span>
show firewall policy 99
<span class="c">! 5 primary par fix karo</span>
config system ha
    set sync-config enable
end
<span class="c">! 6 verify</span>
diagnose sys ha checksum cluster</pre>
<pre class="out">FGT-A # get system ha status
...
Configuration Status:
    FGVMEV1OO2UZP000(updated 2 seconds ago): <span class="hl">out-of-sync</span>
    FGVMEV1NU41WS000(updated 1 seconds ago): <span class="hl">out-of-sync</span></pre>
<p>Step 5 ke baad FGT-B ke paas policy 2 hai aur usne <b>policy 99 kho di</b>. Primary hamesha jeetta hai; sync band hone ke dauraan secondary par kiya change overwrite ho jaata hai. Isiliye step 4 pehle aata hai: jo khone wala hai use likh lo ya export kar lo. FGT-B ab bhi apna host name aur <code>set priority 100</code> dikhata hai, jo per-unit rule ka saboot hai.</p>

<div class="warn"><p><b>Common mistake.</b> "Out-of-sync" ko secondary edit karke match karwa kar theek karna. Edits primary par jaate hain. Aur secondary ke unique local changes record karne se pehle sync enable kabhi mat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Checksum cluster output batata hai ki units alag hain, kaunsi table nahi; table ke liye <code>checksum show</code> use karo. Aur: priority, host name, override aur management interface entry comparison mein kabhi nahi aate.</p></div>

<div class="scn"><h4>Test policy jo gayab ho gayi</h4><p>Ek incident ke dauraan ek junior engineer ne seedha FGT-B par login karke temporary policy jodi aur chhod di. Hafton baad FGT-A par sync repair hui aur policy gayab ho gayi; usspar depend karta test ruk gaya. Kuch toota nahi tha: cluster ne wahi kiya jo uska design hai. Ab team har change primary par karti hai aur maintenance window se pehle aur baad <code>checksum show</code> chalati hai.</p><p><b>Lesson:</b> single source of truth ka matlab hai ki secondary par local edits design se temporary hain.</p></div>

<div class="iv"><p class="q">"Cluster ka ek FortiGate out-of-sync dikha raha hai. Aap kya karoge?"</p><p>Workflow se jawab do: status, checksum cluster, dono units par checksum show se table dhoondo, phir cause (sync-config disable, stopped synchronisation, heartbeat ya version problem). Fix primary par karo, batao ki primary secondary ko overwrite karta hai, aur yeh bhi ki kya kabhi synchronise nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Primary apni poori configuration push karta hai; secondary overwrite hota hai, join par bhi.</li>
<li>Per unit: host name, priority, override, override-wait-time, management interface entry.</li>
<li>sync-config disable ya execute ha synchronize stop se units out-of-sync rehte hain.</li>
<li>Checksum workflow: status, checksum cluster, dono units par checksum show, table dhoondo.</li>
<li>Changes primary par karo; secondary ke local changes kho jaate hain.</li>
</ul></div>
`}};export{e as default};