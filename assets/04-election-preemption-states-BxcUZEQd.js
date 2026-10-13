var e={id:`election-preemption-states`,h:{en:`Election, preemption and the HA states`,hi:`Election, preemption aur HA states`},body:{en:`
<p>When two Panoramas meet they must decide who leads. This is like two colleagues who both want the same meeting room: there needs to be a rule, otherwise both walk in or both stay out. The rule is the <b>election</b>, and the result is shown as a <b>state</b>.</p>

<h3>The six states you must know</h3>
<table class="tbl">
<tr><th>State</th><th>Meaning</th></tr>
<tr><td>active-primary</td><td>Primary priority peer, currently active (the normal healthy case)</td></tr>
<tr><td>passive-secondary</td><td>Secondary priority peer, currently passive (the normal healthy case)</td></tr>
<tr><td>active-secondary</td><td>Secondary peer that took over because the primary is not active</td></tr>
<tr><td>passive-primary</td><td>Primary peer that is up but is not active, for example after the secondary took over and preemption is off</td></tr>
<tr><td>suspended</td><td>Administratively taken out of the pair by the engineer</td></tr>
<tr><td>non-functional</td><td>The election cannot work: in the lab, both peers have the same priority or none</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HA state diagram">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="12">active-primary</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="12">passive-secondary</text>
<rect x="20" y="150" width="170" height="44" rx="8" fill="#fde68a"/><text x="105" y="177" text-anchor="middle" class="svg-ink" font-size="12">suspended</text>
<rect x="450" y="150" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="177" text-anchor="middle" class="svg-ink" font-size="12">active-secondary</text>
<line x1="190" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="11">healthy pair</text>
<line x1="105" y1="64" x2="105" y2="150" stroke="#64748b" stroke-width="2"/><text x="112" y="110" class="svg-muted" font-size="11">suspend</text>
<line x1="535" y1="64" x2="535" y2="150" stroke="#64748b" stroke-width="2"/><text x="542" y="110" class="svg-muted" font-size="11">peer leaves</text>
<line x1="190" y1="172" x2="450" y2="172" stroke="#64748b" stroke-dasharray="4 4"/><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="11">functional + preempt: back</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="11">Both peers with the same priority: non-functional</text>
</svg><p class="cap">The usual path in the failover lab: healthy, primary suspended, secondary active, primary functional again.</p></div>

<h3>The election rules in the lab</h3>
<ol>
<li>Priorities differ (one primary, one secondary): the pair works. The primary is preferred to be active.</li>
<li>Priorities are the same, or missing: <b>non-functional</b>. The election cannot choose.</li>
<li>If the preferred active peer is unavailable, the other becomes active.</li>
</ol>

<h3>Preemption: who gets the room back?</h3>
<p>Say the primary was suspended and the secondary became <code>active-secondary</code>. The primary then becomes functional again. Two choices:</p>
<ul>
<li><b>preemptive yes</b> on the primary: it takes the active role back as soon as it is functional. The firewalls follow it.</li>
<li><b>no preemption</b>: the secondary stays active and the primary becomes <code>passive-primary</code>. Nothing breaks; the pair is simply flipped.</li>
</ul>
<p>Preemption brings you back to your intended layout automatically, but it also causes a second change event in the day. Some teams prefer to control that moment themselves. Both are valid designs; the exact behaviour and timers depend on version, so check the documentation for your PAN-OS version.</p>

<pre class="out">&gt; show high-availability state          (lab, primary suspended, seen on NK-PANORAMA)
  Local Information:
    Priority         : primary (preemptive)
    <span class="hl">State            : suspended</span>
  Peer Information:
    State            : active-secondary</pre>

<div class="exam"><p>Exam trap: preemption is configured on the peer that should win the role back, normally the primary. Setting it only on the secondary does not return the active role to the primary.</p></div>

<div class="scn"><h4>The unplanned flip</h4><p>A power blip rebooted the primary. The secondary became active. The primary came back as passive-primary because preemption was off. Weeks later a colleague was confused why the "secondary" held the active role and made changes on the wrong box. After the team documented the state or enabled preemption, the confusion ended.</p><p><b>Lesson:</b> always read the state, never assume the primary is the active one.</p></div>

<div class="iv"><p class="q">"What happens to the pair when both Panoramas are set to primary?"</p><p>The election has no way to choose, so they report non-functional or each believes it is alone. The fix is one primary and one secondary, plus a correct peer address on each side. The state output names the priority problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the six states and read them from the state output.</li>
<li>Same priority on both means non-functional.</li>
<li>Preemption on the primary returns the active role; without it the secondary stays active.</li>
<li>Primary does not always mean active.</li>
</ul></div>
`,hi:`
<p>Jab do Panorama milte hain to unhe decide karna padta hai ki lead kaun karega. Yeh aise hai jaise do colleagues dono same meeting room chahte hain: rule chahiye, warna dono ghus jaate hain ya dono bahar rehte hain. Woh rule <b>election</b> hai, aur result <b>state</b> ke roop mein dikhta hai.</p>

<h3>Chhe states jo aapko aani chahiye</h3>
<table class="tbl">
<tr><th>State</th><th>Matlab</th></tr>
<tr><td>active-primary</td><td>Primary priority peer, abhi active (normal healthy case)</td></tr>
<tr><td>passive-secondary</td><td>Secondary priority peer, abhi passive (normal healthy case)</td></tr>
<tr><td>active-secondary</td><td>Secondary peer jisne take over kiya kyunki primary active nahi hai</td></tr>
<tr><td>passive-primary</td><td>Primary peer jo up hai par active nahi, jaise secondary ke take over ke baad aur preemption off ho</td></tr>
<tr><td>suspended</td><td>Engineer ne administratively pair se bahar kiya</td></tr>
<tr><td>non-functional</td><td>Election kaam nahi kar sakta: lab mein dono peers ki same priority ya koi nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HA state diagram">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="12">active-primary</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="12">passive-secondary</text>
<rect x="20" y="150" width="170" height="44" rx="8" fill="#fde68a"/><text x="105" y="177" text-anchor="middle" class="svg-ink" font-size="12">suspended</text>
<rect x="450" y="150" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="177" text-anchor="middle" class="svg-ink" font-size="12">active-secondary</text>
<line x1="190" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="11">healthy pair</text>
<line x1="105" y1="64" x2="105" y2="150" stroke="#64748b" stroke-width="2"/><text x="112" y="110" class="svg-muted" font-size="11">suspend</text>
<line x1="535" y1="64" x2="535" y2="150" stroke="#64748b" stroke-width="2"/><text x="542" y="110" class="svg-muted" font-size="11">peer leaves</text>
<line x1="190" y1="172" x2="450" y2="172" stroke="#64748b" stroke-dasharray="4 4"/><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="11">functional + preempt: back</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="11">Dono ki same priority: non-functional</text>
</svg><p class="cap">Failover lab ka usual path: healthy, primary suspended, secondary active, primary phir functional.</p></div>

<h3>Lab mein election rules</h3>
<ol>
<li>Priorities alag hain (ek primary, ek secondary): pair kaam karta hai. Primary ko active hona prefer kiya jaata hai.</li>
<li>Priorities same hain ya missing: <b>non-functional</b>. Election choose nahi kar sakta.</li>
<li>Preferred active peer unavailable ho to doosra active ban jaata hai.</li>
</ol>

<h3>Preemption: room wapas kise milega?</h3>
<p>Maan lo primary suspend hua aur secondary <code>active-secondary</code> ban gaya. Phir primary functional ho gaya. Do choices:</p>
<ul>
<li>Primary par <b>preemptive yes</b>: functional hote hi woh active role wapas le leta hai. Firewalls usko follow karte hain.</li>
<li><b>No preemption</b>: secondary active rehta hai aur primary <code>passive-primary</code> ban jaata hai. Kuch toota nahi; pair bas flip ho gaya.</li>
</ul>
<p>Preemption aapko apne intended layout par automatically wapas laata hai, par din mein ek aur change event bhi karta hai. Kuch teams yeh moment khud control karna pasand karti hain. Dono valid designs hain; exact behaviour aur timers version par depend karte hain, isliye apne PAN-OS version ki documentation check karo.</p>

<pre class="out">&gt; show high-availability state          (lab, primary suspended, NK-PANORAMA par)
  Local Information:
    Priority         : primary (preemptive)
    <span class="hl">State            : suspended</span>
  Peer Information:
    State            : active-secondary</pre>

<div class="exam"><p>Exam trap: preemption us peer par configure hota hai jo role wapas jeetna chahiye, normally primary. Sirf secondary par set karne se active role primary ko wapas nahi milta.</p></div>

<div class="scn"><h4>Unplanned flip</h4><p>Power blip se primary reboot hua. Secondary active ho gaya. Preemption off thi, isliye primary passive-primary ban kar wapas aaya. Hafton baad ek colleague confuse tha ki "secondary" ke paas active role kyun hai aur usne galat box par changes kar diye. Team ne state document kiya ya preemption on ki, tab confusion khatam hua.</p><p><b>Lesson:</b> hamesha state padho, kabhi assume mat karo ki primary hi active hai.</p></div>

<div class="iv"><p class="q">"Dono Panorama primary set hon to pair ka kya hota hai?"</p><p>Election ke paas choose karne ka tareeka nahi hota, isliye woh non-functional report karte hain ya har ek khud ko akela maanta hai. Fix: ek primary aur ek secondary, aur har side par sahi peer address. State output priority problem ka naam batata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe states jaano aur state output se padho.</li>
<li>Dono par same priority matlab non-functional.</li>
<li>Primary par preemption active role lautata hai; uske bina secondary active rehta hai.</li>
<li>Primary hamesha active nahi hota.</li>
</ul></div>
`}};export{e as default};