var e={id:`failover-and-verification`,h:{en:`Failover behaviour and what to verify afterwards`,hi:`Failover behaviour aur uske baad kya verify karna hai`},body:{en:`
<p>A fire drill is only useful if someone checks afterwards that everyone really reached the assembly point. A Panorama failover is the same: seeing a new state on the screen is not proof. You verify the pair, the firewalls and your ability to push.</p>

<h3>The sequence in the lab</h3>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Failover sequence">
<rect x="10" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="12">1. Healthy</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">active-primary</text>
<rect x="170" y="30" width="140" height="70" rx="8" fill="#fde68a"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="12">2. Suspend</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">primary suspended</text>
<rect x="330" y="30" width="140" height="70" rx="8" fill="#bae6fd"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="12">3. Peer active</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">active-secondary</text>
<rect x="490" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="12">4. Functional</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">preempt: back</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The path of lab pn-ha-failover.</p></div>

<h3>After the primary is suspended</h3>
<pre class="out">&gt; show high-availability state          (NK-PANORAMA-2, lab)
  Local Information:
    Priority         : secondary (non-preemptive)
    <span class="hl">State            : active-secondary</span>
  Peer Information:
    State            : suspended
  Configuration synchronization: synchronized

&gt; show panorama-status                   (PA1, lab, two servers configured)
Panorama Server 1 : 192.0.2.50
    HA state      : non-functional
Panorama Server 2 : 192.0.2.51
    <span class="hl">HA state      : active</span></pre>
<p>The firewall has moved to the second server because it is the active one. That is the whole point of chapter 6.</p>

<h3>Verification list after any failover</h3>
<table class="tbl">
<tr><th>Check</th><th>Where</th><th>Good result</th></tr>
<tr><td>Pair state</td><td>show high-availability state, both peers</td><td>One active, one not; the roles you expect</td></tr>
<tr><td>Synchronization</td><td>Same output</td><td>synchronized</td></tr>
<tr><td>Firewalls follow</td><td>show panorama-status on a firewall</td><td>Connected yes to the active server</td></tr>
<tr><td>Management works</td><td>show devices all on the active peer</td><td>Firewalls listed as connected</td></tr>
<tr><td>You can push</td><td>commit-all from the active peer</td><td>Job accepted; check show jobs all</td></tr>
<tr><td>Logs</td><td>show logging-status on a firewall</td><td>Forwarding to the active Panorama, nothing stuck waiting</td></tr>
</table>

<p>The lab proves the push: from the new active peer you run the stack push again, and it must be accepted. A push that is refused means you are on the wrong peer or the state is not what you think.</p>

<h3>Coming back</h3>
<pre class="code">request high-availability state functional</pre>
<p>With preemption on the primary, it returns to <code>active-primary</code>, the secondary returns to <code>passive-secondary</code> and the firewalls follow back. Without preemption, the primary would rejoin as <code>passive-primary</code> and the secondary would keep the active role. Verify with the same list. How long a firewall takes to move and the effect on in-flight jobs or logs depends on version; check the documentation for your PAN-OS version.</p>

<div class="exam"><p>Exam trap: during failover firewalls keep enforcing traffic. Only management changes. Do not answer "traffic stops".</p></div>

<div class="scn"><h4>Green screen, red logs</h4><p>After a drill the pair looked perfect, but a firewall showed logs waiting to be forwarded. It was connected to the right server but its collector group had no collector. The pair was fine; the log path was a separate issue found only because the team checked logging-status.</p><p><b>Lesson:</b> verify each function you depend on, not only the HA state.</p></div>

<div class="iv"><p class="q">"What do you verify after a Panorama failover?"</p><p>Pair state and synchronization on both, that firewalls are connected to the active server, that devices show connected, that a commit-all is accepted from the new active peer, and that logs are forwarding. Then I plan the return and check again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A failover is proven by behaviour, not by one state line.</li>
<li>Firewalls follow the active peer and keep enforcing traffic.</li>
<li>Prove you can push from the new active peer.</li>
<li>With preemption the primary reclaims the active role.</li>
</ul></div>
`,hi:`
<p>Fire drill tabhi useful hai jab baad mein koi check kare ki sab sach mein assembly point par pahunche. Panorama failover bhi aisa hi hai: screen par nayi state dikhna proof nahi hai. Aap pair, firewalls aur push kar paane ki ability verify karte ho.</p>

<h3>Lab mein sequence</h3>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Failover sequence">
<rect x="10" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="12">1. Healthy</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">active-primary</text>
<rect x="170" y="30" width="140" height="70" rx="8" fill="#fde68a"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="12">2. Suspend</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">primary suspended</text>
<rect x="330" y="30" width="140" height="70" rx="8" fill="#bae6fd"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="12">3. Peer active</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">active-secondary</text>
<rect x="490" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="12">4. Functional</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">preempt: wapas</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab pn-ha-failover ka path.</p></div>

<h3>Primary suspend hone ke baad</h3>
<pre class="out">&gt; show high-availability state          (NK-PANORAMA-2, lab)
  Local Information:
    Priority         : secondary (non-preemptive)
    <span class="hl">State            : active-secondary</span>
  Peer Information:
    State            : suspended
  Configuration synchronization: synchronized

&gt; show panorama-status                   (PA1, lab, do servers configured)
Panorama Server 1 : 192.0.2.50
    HA state      : non-functional
Panorama Server 2 : 192.0.2.51
    <span class="hl">HA state      : active</span></pre>
<p>Firewall doosre server par chala gaya kyunki woh active hai. Chapter 6 ka poora point yahi hai.</p>

<h3>Kisi bhi failover ke baad verification list</h3>
<table class="tbl">
<tr><th>Check</th><th>Kahan</th><th>Achha result</th></tr>
<tr><td>Pair state</td><td>show high-availability state, dono peers</td><td>Ek active, ek nahi; expected roles</td></tr>
<tr><td>Synchronization</td><td>Wahi output</td><td>synchronized</td></tr>
<tr><td>Firewalls follow</td><td>Firewall par show panorama-status</td><td>Active server se Connected yes</td></tr>
<tr><td>Management chalta hai</td><td>Active peer par show devices all</td><td>Firewalls connected listed</td></tr>
<tr><td>Push kar sakte ho</td><td>Active peer se commit-all</td><td>Job accepted; show jobs all dekho</td></tr>
<tr><td>Logs</td><td>Firewall par show logging-status</td><td>Active Panorama ko forward, kuch wait nahi kar raha</td></tr>
</table>

<p>Lab push prove karwata hai: naye active peer se stack push dobara chalate ho, aur woh accept hona chahiye. Push refuse ho to ya aap galat peer par ho ya state woh nahi jo aap sochte ho.</p>

<h3>Wapas aana</h3>
<pre class="code">request high-availability state functional</pre>
<p>Primary par preemption ke saath woh <code>active-primary</code> par lautta hai, secondary <code>passive-secondary</code> par lautta hai aur firewalls wapas follow karte hain. Preemption ke bina primary <code>passive-primary</code> ban kar judta aur secondary active rehta. Wahi list se verify karo. Firewall ko shift hone mein kitna time lagta hai aur in-flight jobs ya logs par asar kya hai, woh version par depend karta hai; apne PAN-OS version ki documentation check karo.</p>

<div class="exam"><p>Exam trap: failover mein firewalls traffic enforce karte rehte hain. Sirf management badalta hai. "Traffic ruk jaata hai" answer mat do.</p></div>

<div class="scn"><h4>Green screen, red logs</h4><p>Drill ke baad pair perfect dikh raha tha, par ek firewall par logs forward hone ke liye wait kar rahe the. Woh sahi server se connected tha par uske collector group mein collector nahi tha. Pair theek tha; log path alag issue tha jo sirf isliye mila ki team ne logging-status check kiya.</p><p><b>Lesson:</b> har function verify karo jis par depend karte ho, sirf HA state nahi.</p></div>

<div class="iv"><p class="q">"Panorama failover ke baad aap kya verify karte ho?"</p><p>Dono par pair state aur synchronization, firewalls active server se connected hain, devices connected dikhte hain, naye active peer se commit-all accept hota hai, aur logs forward ho rahe hain. Phir return plan karta hoon aur dobara check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failover behaviour se prove hota hai, ek state line se nahi.</li>
<li>Firewalls active peer ko follow karte hain aur traffic enforce karte rehte hain.</li>
<li>Naye active peer se push kar paana prove karo.</li>
<li>Preemption ke saath primary active role wapas leta hai.</li>
</ul></div>
`}};export{e as default};