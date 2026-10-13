var e={id:`operations-suspend-functional`,h:{en:`Operations: suspend, functional and committing on the active peer`,hi:`Operations: suspend, functional aur active peer par commit`},body:{en:`
<p>A pilot hands over the controls before leaving the cockpit, never by just walking out. Suspending a Panorama is the polite handover: you tell the pair "I am stepping out", so the peer takes over cleanly. Maintenance such as a reboot or a hardware change should start with that handover.</p>

<h3>The two operational commands</h3>
<pre class="code"><span class="c">! operational mode, as run in the lab</span>
request high-availability state suspend
request high-availability state functional</pre>
<dl class="terms">
<dt>suspend</dt><dd>Takes this peer out of the election. It reports <code>suspended</code>. The other peer becomes active if it was not already.</dd>
<dt>functional</dt><dd>Puts the peer back into the election. It becomes active or passive according to priority and preemption.</dd>
</dl>
<p>Think of them as a pause and a resume, nothing more. Neither deletes configuration.</p>

<h3>A maintenance routine</h3>
<ol>
<li>Check the current state on both peers. Know who is active.</li>
<li>Check firewalls know both servers (chapter 6).</li>
<li>Suspend the peer you will work on (normally the passive one, so nothing changes for anyone).</li>
<li>Do the maintenance.</li>
<li>Make it functional again. Read the state on both peers.</li>
<li>Confirm the synchronization line says synchronized.</li>
</ol>
<p>If you must work on the active peer, suspend it deliberately so the other peer takes over in a planned way, and confirm the firewalls follow before you do anything else. How long to wait and which logs are carried across depends on version and design; check the documentation for your PAN-OS version.</p>

<pre class="out">&gt; request high-availability state suspend      (NK-PANORAMA, lab)
Successfully changed HA state to suspended
&gt; show high-availability state
  Local Information:
    <span class="hl">State            : suspended</span>
  Peer Information:
    <span class="hl">State            : active-secondary</span></pre>

<h3>Why you commit only on the active peer</h3>
<p>The active peer is the source of truth. It copies its configuration to the passive peer on every commit. If you changed the passive peer's shared configuration, the next commit on the active peer would overwrite it, and the two would disagree about what is right. So in the lab model:</p>
<ul>
<li>Shared configuration cannot be committed on a passive or suspended peer.</li>
<li><code>commit-all</code> (push to firewalls) runs only on the active peer.</li>
<li>After a failover, the new active peer is where you work.</li>
</ul>
<table class="tbl">
<tr><th>Task</th><th>Passive peer</th><th>Active peer</th></tr>
<tr><td>Edit device groups, templates</td><td>Do not</td><td>Yes</td></tr>
<tr><td>commit-all (push)</td><td>Refused</td><td>Yes</td></tr>
<tr><td>show high-availability state</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Device-local settings (deviceconfig)</td><td>Yes, on that peer</td><td>Yes, on that peer</td></tr>
</table>

<div class="warn"><p>Always look at the prompt or run the state command before you start changing things. Working on the wrong peer is the number one operator mistake in a pair.</p></div>

<div class="scn"><h4>The refused push</h4><p>After a planned failover, an engineer returned to the old primary's session and ran a push. It was refused: that peer was not active. He moved to the active peer, ran the same commit-all and it worked.</p><p><b>Lesson:</b> a refusal on a passive peer is the pair protecting you, not a fault.</p></div>

<div class="iv"><p class="q">"How do you patch the active Panorama with minimal risk?"</p><p>Verify the state and that firewalls know both servers. Suspend the active peer so the other takes over, confirm the firewalls follow and a push works, do the maintenance, then make it functional and verify state and synchronization. I plan the window and the backup before.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>suspend is a clean handover, functional is the return.</li>
<li>Commit and push only on the active peer.</li>
<li>Check state before you change anything.</li>
<li>Verify synchronization after returning to functional.</li>
</ul></div>
`,hi:`
<p>Pilot cockpit chhodne se pehle controls hand over karta hai, bas uthkar chala nahi jaata. Panorama ko suspend karna polite handover hai: aap pair ko batate ho "main bahar ja raha hoon", taaki peer saaf tareeke se take over kare. Reboot ya hardware change jaisa maintenance isi handover se shuru hona chahiye.</p>

<h3>Do operational commands</h3>
<pre class="code"><span class="c">! operational mode, lab mein jaise chalaya</span>
request high-availability state suspend
request high-availability state functional</pre>
<dl class="terms">
<dt>suspend</dt><dd>Is peer ko election se bahar karta hai. Yeh <code>suspended</code> report karta hai. Doosra peer active ban jaata hai agar pehle nahi tha.</dd>
<dt>functional</dt><dd>Peer ko wapas election mein daalta hai. Priority aur preemption ke hisaab se active ya passive banta hai.</dd>
</dl>
<p>Ise pause aur resume samjho, aur kuch nahi. Dono mein se koi configuration delete nahi karta.</p>

<h3>Maintenance routine</h3>
<ol>
<li>Dono peers par current state check karo. Jaano kaun active hai.</li>
<li>Check karo firewalls dono servers ko jaante hain (chapter 6).</li>
<li>Jis peer par kaam karna hai use suspend karo (normally passive wala, taaki kisi ke liye kuch na badle).</li>
<li>Maintenance karo.</li>
<li>Use wapas functional karo. Dono par state padho.</li>
<li>Confirm karo synchronization line synchronized kehti hai.</li>
</ol>
<p>Agar active peer par kaam karna hi pade, to use jaanbujhkar suspend karo taaki doosra planned tareeke se take over kare, aur kuch bhi karne se pehle confirm karo ki firewalls follow kar rahe hain. Kitna wait karna hai aur kaun se logs saath jaate hain, woh version aur design par depend karta hai; apne PAN-OS version ki documentation check karo.</p>

<pre class="out">&gt; request high-availability state suspend      (NK-PANORAMA, lab)
Successfully changed HA state to suspended
&gt; show high-availability state
  Local Information:
    <span class="hl">State            : suspended</span>
  Peer Information:
    <span class="hl">State            : active-secondary</span></pre>

<h3>Commit sirf active peer par kyun</h3>
<p>Active peer source of truth hai. Woh har commit par apni configuration passive peer ko copy karta hai. Agar aapne passive peer ki shared configuration badli, to active peer ka agla commit use overwrite kar deta, aur dono ka kya sahi hai is par disagreement ho jaata. Isliye lab model mein:</p>
<ul>
<li>Shared configuration passive ya suspended peer par commit nahi ho sakti.</li>
<li><code>commit-all</code> (firewalls par push) sirf active peer par chalta hai.</li>
<li>Failover ke baad naya active peer woh jagah hai jahan kaam karte ho.</li>
</ul>
<table class="tbl">
<tr><th>Kaam</th><th>Passive peer</th><th>Active peer</th></tr>
<tr><td>Device groups, templates edit</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>commit-all (push)</td><td>Refuse</td><td>Haan</td></tr>
<tr><td>show high-availability state</td><td>Haan</td><td>Haan</td></tr>
<tr><td>Device-local settings (deviceconfig)</td><td>Haan, us peer par</td><td>Haan, us peer par</td></tr>
</table>

<div class="warn"><p>Kuch bhi badalne se pehle prompt dekho ya state command chalao. Galat peer par kaam karna pair mein number one operator mistake hai.</p></div>

<div class="scn"><h4>Refuse hua push</h4><p>Planned failover ke baad ek engineer purane primary ke session par laut gaya aur push chalaya. Woh refuse hua: woh peer active nahi tha. Woh active peer par gaya, wahi commit-all chalaya aur chal gaya.</p><p><b>Lesson:</b> passive peer par refusal pair aapko bacha raha hai, fault nahi.</p></div>

<div class="iv"><p class="q">"Active Panorama ko minimal risk ke saath patch kaise karte ho?"</p><p>State aur firewalls ke dono servers verify karta hoon. Active peer ko suspend karta hoon taaki doosra take over kare, confirm karta hoon ki firewalls follow karte hain aur push chalta hai, maintenance karta hoon, phir functional karke state aur synchronization verify karta hoon. Window aur backup pehle plan karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>suspend clean handover hai, functional return hai.</li>
<li>Commit aur push sirf active peer par.</li>
<li>Kuch badalne se pehle state check karo.</li>
<li>Functional par lautne ke baad synchronization verify karo.</li>
</ul></div>
`}};export{e as default};