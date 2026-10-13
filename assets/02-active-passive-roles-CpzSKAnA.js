var e={id:`active-passive-roles`,h:{en:`The active/passive model and the primary and secondary roles`,hi:`Active/passive model aur primary tatha secondary roles`},body:{en:`
<p>Two Panoramas in an HA pair do not share the work equally. At any moment <b>one is active and one is passive</b>. This is like a hospital with two duty doctors: one is on the floor taking decisions, the other is in the next room with the same patient files, ready to walk in. Only the doctor on the floor signs prescriptions.</p>

<h3>Two different ideas: role and state</h3>
<p>Beginners mix these up, so separate them clearly.</p>
<dl class="terms">
<dt>Priority (primary or secondary)</dt><dd>A <b>configured, permanent label</b>. It says which peer you would like to be active when both are healthy. You type it.</dd>
<dt>State (active or passive)</dt><dd>What is <b>happening right now</b>. It is decided by the election and can change during a failure. You do not type it.</dd>
</dl>
<p>So a Panorama with priority secondary can temporarily be in the state <code>active-secondary</code>. The label never changed; the situation did.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Priority versus state">
<rect x="30" y="20" width="270" height="130" rx="10" fill="#ddd6fe"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="14">NK-PANORAMA</text>
<text x="165" y="76" text-anchor="middle" class="svg-ink" font-size="12">Priority: primary (configured)</text>
<text x="165" y="104" text-anchor="middle" class="svg-ink" font-size="12">State: active-primary (elected)</text>
<text x="165" y="132" text-anchor="middle" class="svg-muted" font-size="11">management IP 192.0.2.50</text>
<rect x="340" y="20" width="270" height="130" rx="10" fill="#e2e8f0"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="14">NK-PANORAMA-2</text>
<text x="475" y="76" text-anchor="middle" class="svg-ink" font-size="12">Priority: secondary (configured)</text>
<text x="475" y="104" text-anchor="middle" class="svg-ink" font-size="12">State: passive-secondary (elected)</text>
<text x="475" y="132" text-anchor="middle" class="svg-muted" font-size="11">management IP 192.0.2.51</text>
</svg><p class="cap">Priority is what you configure. State is what the pair decides.</p></div>

<h3>What each peer needs configured</h3>
<ol>
<li>HA enabled.</li>
<li>The <b>other</b> peer's management IP as <code>peer-ip-address</code>. Each side points at the other, never at itself.</li>
<li>A priority: one primary, one secondary.</li>
<li>Optionally preemption on the primary.</li>
</ol>

<pre class="code"><span class="c">! on NK-PANORAMA (192.0.2.50), as in the lab</span>
configure
set deviceconfig high-availability enabled yes
set deviceconfig high-availability peer-ip-address 192.0.2.51
set deviceconfig high-availability election-option priority primary
set deviceconfig high-availability election-option preemptive yes
commit</pre>

<p>The mirror image goes on <code>NK-PANORAMA-2</code>: peer 192.0.2.50, priority secondary. Notice that the two configurations are not identical copies. They are deliberately different in two places: the peer address and the priority. That is one of the most common causes of broken pairs: someone pastes the same block on both.</p>

<h3>Why the passive peer still matters</h3>
<p>The passive Panorama is not idle. It receives the synchronized configuration so that it can be promoted without a rebuild. In the lab model, shared configuration cannot be committed on a passive peer; changes are made on the active one. We study that in chapters 3 and 7.</p>

<pre class="out">&gt; show high-availability state          (lab, NK-PANORAMA, healthy pair)
Local Information:
    Priority         : primary (preemptive)
    <span class="hl">State            : active-primary</span>
  Peer Information:
    State            : passive-secondary</pre>

<div class="warn"><p>Do not call the secondary "the backup that does nothing". It is a full second management server that is simply not accepting configuration changes at the moment.</p></div>

<div class="scn"><h4>Same config on both sides</h4><p>An engineer pasted the exact same HA block on both Panoramas. Both pointed at 192.0.2.51 and both said primary. One Panorama pointed at itself and the pair never formed. The fix was a distinct peer address and priority on each side.</p><p><b>Lesson:</b> a pair is two mirror-image configurations, not one configuration twice.</p></div>

<div class="iv"><p class="q">"What is the difference between primary and active?"</p><p>Primary is a configured priority label. Active is the current state decided by the election. A secondary can be active during a failover. Saying "primary" when you mean "currently active" is the classic confusion.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One peer is active, one passive, at any moment.</li>
<li>Priority is configured; state is elected.</li>
<li>Each side points peer-ip-address at the other.</li>
<li>The passive peer is a ready, synchronized server, not an idle box.</li>
</ul></div>
`,hi:`
<p>HA pair ke do Panorama kaam barabar nahi baantte. Kisi bhi waqt <b>ek active hai aur ek passive</b>. Yeh aise hai jaise hospital mein do duty doctors: ek floor par decisions le raha hai, doosra agle kamre mein wahi patient files lekar ready baitha hai. Prescription sirf floor wala doctor sign karta hai.</p>

<h3>Do alag ideas: role aur state</h3>
<p>Beginners yeh mix kar dete hain, isliye clearly alag karo.</p>
<dl class="terms">
<dt>Priority (primary ya secondary)</dt><dd>Ek <b>configured, permanent label</b>. Yeh batata hai ki dono healthy hon to aap kaun sa peer active chahte ho. Aap type karte ho.</dd>
<dt>State (active ya passive)</dt><dd>Abhi <b>kya ho raha hai</b>. Election decide karta hai aur failure mein badal sakta hai. Aap type nahi karte.</dd>
</dl>
<p>To secondary priority wala Panorama kuch der ke liye <code>active-secondary</code> state mein ho sakta hai. Label nahi badla; situation badli.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Priority versus state">
<rect x="30" y="20" width="270" height="130" rx="10" fill="#ddd6fe"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="14">NK-PANORAMA</text>
<text x="165" y="76" text-anchor="middle" class="svg-ink" font-size="12">Priority: primary (configured)</text>
<text x="165" y="104" text-anchor="middle" class="svg-ink" font-size="12">State: active-primary (elected)</text>
<text x="165" y="132" text-anchor="middle" class="svg-muted" font-size="11">management IP 192.0.2.50</text>
<rect x="340" y="20" width="270" height="130" rx="10" fill="#e2e8f0"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="14">NK-PANORAMA-2</text>
<text x="475" y="76" text-anchor="middle" class="svg-ink" font-size="12">Priority: secondary (configured)</text>
<text x="475" y="104" text-anchor="middle" class="svg-ink" font-size="12">State: passive-secondary (elected)</text>
<text x="475" y="132" text-anchor="middle" class="svg-muted" font-size="11">management IP 192.0.2.51</text>
</svg><p class="cap">Priority aap configure karte ho. State pair decide karta hai.</p></div>

<h3>Har peer par kya configure karna hai</h3>
<ol>
<li>HA enabled.</li>
<li><b>Doosre</b> peer ka management IP <code>peer-ip-address</code> mein. Har side doosre ko point karti hai, khud ko kabhi nahi.</li>
<li>Ek priority: ek primary, ek secondary.</li>
<li>Optional: primary par preemption.</li>
</ol>

<pre class="code"><span class="c">! NK-PANORAMA (192.0.2.50) par, lab ki tarah</span>
configure
set deviceconfig high-availability enabled yes
set deviceconfig high-availability peer-ip-address 192.0.2.51
set deviceconfig high-availability election-option priority primary
set deviceconfig high-availability election-option preemptive yes
commit</pre>

<p>Mirror image <code>NK-PANORAMA-2</code> par jaata hai: peer 192.0.2.50, priority secondary. Dhyan do ki dono configurations identical copies nahi hain. Do jagah jaanbujhkar alag hain: peer address aur priority. Broken pairs ka sabse common reason yahi hai: kisi ne wahi block dono par paste kar diya.</p>

<h3>Passive peer phir bhi kyun matter karta hai</h3>
<p>Passive Panorama idle nahi hai. Use synchronized configuration milti hai taaki bina rebuild ke promote ho sake. Lab model mein shared configuration passive peer par commit nahi ho sakti; changes active par hote hain. Yeh hum chapters 3 aur 7 mein dekhenge.</p>

<pre class="out">&gt; show high-availability state          (lab, NK-PANORAMA, healthy pair)
Local Information:
    Priority         : primary (preemptive)
    <span class="hl">State            : active-primary</span>
  Peer Information:
    State            : passive-secondary</pre>

<div class="warn"><p>Secondary ko "backup jo kuch nahi karta" mat bolo. Woh poora doosra management server hai jo abhi bas configuration changes accept nahi kar raha.</p></div>

<div class="scn"><h4>Dono side same config</h4><p>Ek engineer ne exact same HA block dono Panorama par paste kar diya. Dono 192.0.2.51 ko point kar rahe the aur dono primary the. Ek Panorama khud ko point kar raha tha aur pair kabhi nahi bana. Fix: har side par alag peer address aur priority.</p><p><b>Lesson:</b> pair do mirror-image configurations hai, ek configuration do baar nahi.</p></div>

<div class="iv"><p class="q">"Primary aur active mein kya fark hai?"</p><p>Primary ek configured priority label hai. Active current state hai jo election decide karta hai. Failover mein secondary active ho sakta hai. "Primary" bolna jab matlab "abhi active" ho, yeh classic confusion hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kisi bhi waqt ek peer active, ek passive.</li>
<li>Priority configured hai; state elected hai.</li>
<li>Har side peer-ip-address doosre par point karti hai.</li>
<li>Passive peer ready, synchronized server hai, idle box nahi.</li>
</ul></div>
`}};export{e as default};