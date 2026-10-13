var e={id:`state-sync`,h:{en:`What is synchronised: configuration versus session state`,hi:`Kya synchronise hota hai: configuration versus session state`},body:{en:`
<p>Remember the first officer who hears every radio call? In HA the copying is called <b>synchronisation</b>. There are two kinds that behave differently: <b>configuration sync</b>, which copies how the firewall is set up, and <b>state sync</b>, which copies what the firewall is doing right now. Knowing which is which explains almost every "why did my users drop after failover" question.</p>

<h3>Configuration synchronisation (HA1)</h3>
<p>When you commit on one firewall, PAN-OS can push the running configuration to the peer over HA1. Config sync is enabled by default. The firewall that you commit on sends its configuration; the peer applies it. Some settings are deliberately <b>local</b> and never copied:</p>
<ul>
<li>Management interface IP address, hostname and management profile.</li>
<li>The HA configuration itself (each side has its own values).</li>
<li>Licences and device certificates tied to the serial number.</li>
</ul>
<p>Best practice: <b>make changes on the active unit only</b>, commit, and verify that the peer shows the configuration as synchronised. If you also change the passive unit, you create a configuration that fails to match and the pair will report it. You can also push on demand (<code>request high-availability sync-to-remote running-config</code>) when the status shows "out of sync", but understand which side is the good copy before you push, because the push overwrites the peer.</p>

<h3>State synchronisation (HA2)</h3>
<p>State sync copies live information so the new active firewall can carry on. It travels over HA2 (and some over HA1). Typical synchronised items:</p>
<table class="cmp"><tr><th>Synchronised</th><th>Why it matters</th></tr>
<tr><td>Session table, including NAT sessions</td><td>Existing connections continue after failover without a new handshake.</td></tr>
<tr><td>ARP and MAC tables</td><td>Faster recovery of forwarding.</td></tr>
<tr><td>IPsec Phase 2 security associations and sequence numbers</td><td>Tunnels resume quickly. IKE Phase 1 is renegotiated by the new active unit.</td></tr>
<tr><td>User-ID mappings and DHCP leases</td><td>Users keep the same identity-based policy and addresses.</td></tr>
<tr><td>Forwarding table (FIB) data and dynamic routes</td><td>Only partially. Dynamic routing neighbours typically re-converge unless graceful restart is used.</td></tr>
</table>
<p>Session synchronisation requires <b>session synchronisation enabled</b> in the HA settings and a healthy HA2. Not every session is synchronised: for example, sessions that are not yet fully set up or certain traffic that the firewall treats as local to the dataplane may need to restart.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="What syncs where">
<rect x="20" y="30" width="170" height="150" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">candidate + running config</text><text x="105" y="120" text-anchor="middle" class="svg-muted" font-size="12">session table</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">ARP, IPsec SA, User-ID</text>
<rect x="450" y="30" width="170" height="150" rx="10" fill="#e2e8f0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="535" y="95" text-anchor="middle" class="svg-muted" font-size="12">receives config</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">receives sessions</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">receives ARP, SA, User-ID</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">HA1: configuration</text>
<line x1="190" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">HA2: session state</text>
</svg><p class="cap">Configuration moves on HA1; live state moves on HA2.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Session synchronisation is part of the HA election/sync settings</span>
set deviceconfig high-availability group state-synchronization enabled yes
<span class="c"># Manually push the running configuration to the peer (operational mode)</span>
request high-availability sync-to-remote running-config
<span class="c"># Check what the peer reports</span>
show high-availability state-synchronization</pre>
<p>Confirm the exact syntax with <code>?</code> on your PAN-OS release.</p>

<div class="eg"><p><b>Worked example.</b> A user is downloading a 4 GB image over a NAT session. FW-A fails. FW-B already has the NAT session entry and the user mapping from HA2, so when traffic arrives it matches the entry and continues. The download may pause for a couple of seconds while neighbours update. A second user opens a brand-new session one second before the failure; if that session had not yet been replicated, it is dropped and the application retries.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming a full sync of everything. Management settings, licences and some dynamic data are not copied, and short-lived sessions can be lost in the failover window.</p></div>
<div class="exam"><p><b>Exam trap.</b> Configuration sync and session sync are different. Config sync runs on HA1; session sync runs on HA2. If HA2 is down, failover still works but existing connections are lost. For IPsec, Phase 2 SAs sync but IKE Phase 1 is renegotiated.</p></div>

<div class="scn"><h4>Users lost every connection at failover</h4><p>A team ran a failover test and every active SSH session dropped. The HA state looked healthy, and config was synchronised, but session synchronisation had been left disabled when the pair was first built. The firewalls were failing over perfectly; they just had no sessions to take over. Enabling session synchronisation and re-testing showed existing connections surviving.</p><p><b>Lesson:</b> test failover with a long-lived session, not just a ping.</p></div>

<div class="iv"><p class="q">"What is synchronised between HA peers in active/passive?"</p><p>Configuration goes over HA1 (excluding local items such as management IP, hostname and licences). Runtime state goes over HA2: sessions including NAT, ARP and MAC tables, IPsec Phase 2 SAs, User-ID mappings and DHCP leases. Mention that IKE Phase 1 is renegotiated, and dynamic routes re-converge unless graceful restart is used.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Config sync (HA1) copies setup; state sync (HA2) copies live data.</li>
<li>Management IP, hostname, HA settings and licences are local.</li>
<li>Change the active unit only; verify the peer says synchronised.</li>
<li>IPsec Phase 2 SAs sync; IKE Phase 1 is renegotiated.</li>
<li>Test failover with a long-lived session to prove state sync.</li>
</ul></div>
`,hi:`
<p>Yaad hai woh first officer jo har radio call sunta hai? HA mein copying ko <b>synchronisation</b> kehte hain. Iske do kism hain jo alag behave karte hain: <b>configuration sync</b>, jo copy karta hai ki firewall kaise set up hai, aur <b>state sync</b>, jo copy karta hai ki firewall abhi kya kar raha hai. Yeh jaanna ki kaun sa kaun hai lagbhag har "failover ke baad users kyun gir gaye" sawaal ko explain kar deta hai.</p>

<h3>Configuration synchronisation (HA1)</h3>
<p>Jab aap ek firewall par commit karte ho, PAN-OS running configuration ko HA1 par peer ko push kar sakta hai. Config sync default mein enabled hai. Jis firewall par aap commit karte ho woh apni configuration bhejta hai; peer use apply karta hai. Kuch settings jaanbujhkar <b>local</b> hoti hain aur kabhi copy nahi hotin:</p>
<ul>
<li>Management interface IP address, hostname aur management profile.</li>
<li>HA configuration khud (har side ki apni values hoti hain).</li>
<li>Serial number se jude licences aur device certificates.</li>
</ul>
<p>Best practice: <b>changes sirf active unit par karo</b>, commit karo, aur verify karo ki peer configuration ko synchronised dikhata hai. Agar aap passive unit bhi badalte ho, to aisi configuration ban jaati hai jo match nahi karti aur pair use report karega. Status "out of sync" dikhaye to aap on demand push bhi kar sakte ho (<code>request high-availability sync-to-remote running-config</code>), lekin push se pehle samjho ki achhi copy kaun si side hai, kyunki push peer ko overwrite kar deta hai.</p>

<h3>State synchronisation (HA2)</h3>
<p>State sync live information copy karta hai taaki naya active firewall aage chala sake. Yeh HA2 par jaata hai (kuch HA1 par). Aam synchronised items:</p>
<table class="cmp"><tr><th>Synchronised</th><th>Kyun zaroori</th></tr>
<tr><td>Session table, NAT sessions samet</td><td>Maujooda connections failover ke baad bina naye handshake ke chalte rehte hain.</td></tr>
<tr><td>ARP aur MAC tables</td><td>Forwarding ki tez recovery.</td></tr>
<tr><td>IPsec Phase 2 security associations aur sequence numbers</td><td>Tunnels jaldi resume hote hain. IKE Phase 1 ko naya active unit dobara negotiate karta hai.</td></tr>
<tr><td>User-ID mappings aur DHCP leases</td><td>Users ko wahi identity-based policy aur addresses milte hain.</td></tr>
<tr><td>Forwarding table (FIB) data aur dynamic routes</td><td>Sirf aanshik roop se. Dynamic routing neighbours aam taur par dobara converge karte hain jab tak graceful restart use na ho.</td></tr>
</table>
<p>Session synchronisation ke liye HA settings mein <b>session synchronisation enabled</b> hona aur HA2 healthy hona zaroori hai. Har session synchronise nahi hota: jaise woh sessions jo abhi poori tarah set up nahi hue, ya kuch traffic jise firewall dataplane ka local maanta hai, unhe restart karna pad sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="What syncs where">
<rect x="20" y="30" width="170" height="150" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">candidate + running config</text><text x="105" y="120" text-anchor="middle" class="svg-muted" font-size="12">session table</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">ARP, IPsec SA, User-ID</text>
<rect x="450" y="30" width="170" height="150" rx="10" fill="#e2e8f0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="535" y="95" text-anchor="middle" class="svg-muted" font-size="12">config receive karta hai</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">sessions receive karta hai</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">ARP, SA, User-ID receive</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">HA1: configuration</text>
<line x1="190" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">HA2: session state</text>
</svg><p class="cap">Configuration HA1 par chalti hai; live state HA2 par.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Session synchronisation HA settings ka hissa hai</span>
set deviceconfig high-availability group state-synchronization enabled yes
<span class="c"># Running configuration ko peer ko haath se push karo (operational mode)</span>
request high-availability sync-to-remote running-config
<span class="c"># Peer kya report karta hai dekho</span>
show high-availability state-synchronization</pre>
<p>Apni PAN-OS release par exact syntax <code>?</code> se confirm karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek user NAT session par 4 GB ka image download kar raha hai. FW-A fail ho jaata hai. FW-B ke paas HA2 se NAT session entry aur user mapping pehle se hai, isliye traffic aate hi woh entry match karta hai aur chalta rehta hai. Neighbours update hone tak download kuch seconds ruk sakta hai. Doosra user failure se ek second pehle bilkul naya session kholta hai; agar woh session replicate nahi hua tha to woh gir jaata hai aur application retry karta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh maan lena ki sab kuch full sync hota hai. Management settings, licences aur kuch dynamic data copy nahi hote, aur chhote-umr ke sessions failover window mein kho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Configuration sync aur session sync alag hain. Config sync HA1 par chalta hai; session sync HA2 par. HA2 down ho to failover chalta hai lekin maujooda connections kho jaate hain. IPsec ke liye Phase 2 SAs sync hote hain lekin IKE Phase 1 dobara negotiate hota hai.</p></div>

<div class="scn"><h4>Failover par users ke saare connections gir gaye</h4><p>Ek team ne failover test chalaya aur har active SSH session gir gaya. HA state healthy dikh raha tha aur config synchronised thi, lekin pair pehli baar banate waqt session synchronisation disabled chhod di gayi thi. Firewalls bilkul sahi failover kar rahe the; bas unke paas take over karne ke liye sessions the hi nahi. Session synchronisation enable karke dobara test karne par maujooda connections bach gaye.</p><p><b>Lesson:</b> failover ko sirf ping se nahi, lambe-chalne wale session se test karo.</p></div>

<div class="iv"><p class="q">"Active/passive mein HA peers ke beech kya synchronise hota hai?"</p><p>Configuration HA1 par jaati hai (local items jaise management IP, hostname aur licences ko chhodkar). Runtime state HA2 par jaata hai: sessions NAT samet, ARP aur MAC tables, IPsec Phase 2 SAs, User-ID mappings aur DHCP leases. Yeh batao ki IKE Phase 1 dobara negotiate hota hai, aur dynamic routes dobara converge karte hain jab tak graceful restart use na ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Config sync (HA1) setup copy karta hai; state sync (HA2) live data.</li>
<li>Management IP, hostname, HA settings aur licences local hote hain.</li>
<li>Sirf active unit badlo; verify karo ki peer synchronised kehta hai.</li>
<li>IPsec Phase 2 SAs sync hote hain; IKE Phase 1 dobara negotiate hota hai.</li>
<li>State sync prove karne ke liye failover ko lambe session ke saath test karo.</li>
</ul></div>
`}};export{e as default};