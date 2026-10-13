var e={id:`what-is-synchronized`,h:{en:`What is synchronized and what stays device-local`,hi:`Kya synchronize hota hai aur kya device-local rehta hai`},body:{en:`
<p>Imagine two shop managers sharing one master price list. Whenever the list changes, the second manager gets a copy. But each manager has a personal desk: name plate, phone extension, key to their own drawer. Those are not copied, because they belong to the person, not the shop. Panorama HA works the same way: the <b>shared management data</b> is copied, the <b>device-local settings</b> stay.</p>

<h3>The rule used in the lab</h3>
<p>The active peer synchronizes <b>everything except <code>deviceconfig</code></b> to the passive peer. It happens when the pair forms and again on every commit. In plain words:</p>
<table class="tbl">
<tr><th>Synchronized to the peer</th><th>Stays local on each Panorama</th></tr>
<tr><td>Device groups and their policy</td><td>deviceconfig (management IP, hostname, DNS and other device settings)</td></tr>
<tr><td>Templates and template stacks</td><td>The HA settings themselves (peer address, priority)</td></tr>
<tr><td>Managed device list (mgt-config devices)</td><td>Anything else under deviceconfig</td></tr>
<tr><td>Shared objects, log forwarding profiles, collector groups</td><td></td></tr>
</table>
<p>It makes sense. If the HA settings were copied, the secondary would receive the primary's peer address and its own priority, and the pair would instantly break. Device-local means "belongs to this box".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Synchronization direction">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="14">Active peer</text>
<text x="145" y="74" text-anchor="middle" class="svg-ink" font-size="12">device groups, templates</text><text x="145" y="96" text-anchor="middle" class="svg-ink" font-size="12">stacks, managed devices</text>
<rect x="45" y="116" width="200" height="38" rx="6" fill="#fff"/><text x="145" y="140" text-anchor="middle" class="svg-muted" font-size="12">deviceconfig (local)</text>
<rect x="370" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="495" y="44" text-anchor="middle" class="svg-ink" font-size="14">Passive peer</text>
<text x="495" y="74" text-anchor="middle" class="svg-ink" font-size="12">receives the same copy</text><text x="495" y="96" text-anchor="middle" class="svg-ink" font-size="12">after each commit</text>
<rect x="395" y="116" width="200" height="38" rx="6" fill="#fff"/><text x="495" y="140" text-anchor="middle" class="svg-muted" font-size="12">its own deviceconfig</text>
<line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><polygon points="370,70 360,64 360,76" fill="#64748b"/>
</svg><p class="cap">Synchronization goes from active to passive, one direction only.</p></div>

<h3>How you see it</h3>
<p>The state output ends with a synchronization line. <code>synchronized</code> is what you want. When the peer cannot be reached the line says the peer is not available.</p>

<pre class="out">&gt; show high-availability state          (lab, healthy pair)
  Local Information:
    Management IP    : 192.0.2.50
    Priority         : primary (preemptive)
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.51
    State            : passive-secondary
  <span class="hl">Configuration synchronization: synchronized</span></pre>

<p>You can also prove it by looking at the passive peer's own configuration. In the lab the proof for <code>pn-ha-build</code> is that the secondary now holds the managed devices and the template stack that you only ever configured on the primary. You can force a copy with <code>request high-availability sync-to-remote running-config</code>; use it deliberately and check the documentation for your PAN-OS version for what it overwrites.</p>

<h3>Consequences for daily work</h3>
<ul>
<li>Make configuration changes on the <b>active</b> peer. They flow to the passive one.</li>
<li>A device-local change (for example a management setting) must be made on <b>each</b> Panorama. Forgetting the second one is how a promoted peer surprises you.</li>
<li>Commit means the peer is updated too, including a mistake. HA copies errors faithfully.</li>
</ul>

<p>Which logs and what runtime state are synchronized, and how, depends on version and design. Check the documentation for your PAN-OS version rather than assuming.</p>

<div class="scn"><h4>The DNS surprise</h4><p>After a failover an engineer found the new active Panorama could not resolve a hostname. DNS servers are a device-local setting and had only ever been set on the original. Everything else had synchronized.</p><p><b>Lesson:</b> keep a short list of device-local settings and check it on both peers during build and after changes.</p></div>

<div class="iv"><p class="q">"What does not get synchronized between HA Panoramas, and why?"</p><p>Device-local settings under deviceconfig, including the HA settings themselves, because they describe the individual box. If they were copied the pair would overwrite its own identity. Everything else, such as device groups and templates, follows the active peer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab rule: everything except deviceconfig is synchronized, active to passive.</li>
<li>It happens at pair formation and on every commit.</li>
<li>Device-local settings must be set on both peers.</li>
<li>Synchronization copies mistakes too; it is not a backup.</li>
</ul></div>
`,hi:`
<p>Socho do shop managers ek hi master price list share karte hain. List badle to doosre manager ko copy mil jaati hai. Par har manager ka personal desk hota hai: name plate, phone extension, apni drawer ki chaabi. Yeh copy nahi hote, kyunki yeh person ke hain, shop ke nahi. Panorama HA bhi aise hi kaam karta hai: <b>shared management data</b> copy hota hai, <b>device-local settings</b> wahin rehti hain.</p>

<h3>Lab mein use hone wala rule</h3>
<p>Active peer <b><code>deviceconfig</code> ke alawa sab kuch</b> passive peer ko synchronize karta hai. Yeh pair banne par hota hai aur har commit par phir hota hai. Simple words mein:</p>
<table class="tbl">
<tr><th>Peer ko synchronize hota hai</th><th>Har Panorama par local rehta hai</th></tr>
<tr><td>Device groups aur unki policy</td><td>deviceconfig (management IP, hostname, DNS aur doosri device settings)</td></tr>
<tr><td>Templates aur template stacks</td><td>HA settings khud (peer address, priority)</td></tr>
<tr><td>Managed device list (mgt-config devices)</td><td>deviceconfig ke neeche baaki sab</td></tr>
<tr><td>Shared objects, log forwarding profiles, collector groups</td><td></td></tr>
</table>
<p>Yeh logical hai. Agar HA settings copy hoti, to secondary ko primary ka peer address aur uski apni priority mil jaati aur pair turant toot jaata. Device-local matlab "is box ka apna".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Synchronization direction">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="14">Active peer</text>
<text x="145" y="74" text-anchor="middle" class="svg-ink" font-size="12">device groups, templates</text><text x="145" y="96" text-anchor="middle" class="svg-ink" font-size="12">stacks, managed devices</text>
<rect x="45" y="116" width="200" height="38" rx="6" fill="#fff"/><text x="145" y="140" text-anchor="middle" class="svg-muted" font-size="12">deviceconfig (local)</text>
<rect x="370" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="495" y="44" text-anchor="middle" class="svg-ink" font-size="14">Passive peer</text>
<text x="495" y="74" text-anchor="middle" class="svg-ink" font-size="12">wahi copy receive karta hai</text><text x="495" y="96" text-anchor="middle" class="svg-ink" font-size="12">har commit ke baad</text>
<rect x="395" y="116" width="200" height="38" rx="6" fill="#fff"/><text x="495" y="140" text-anchor="middle" class="svg-muted" font-size="12">apna deviceconfig</text>
<line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><polygon points="370,70 360,64 360,76" fill="#64748b"/>
</svg><p class="cap">Synchronization active se passive ki taraf jaata hai, sirf ek direction.</p></div>

<h3>Aap ise kaise dekhte ho</h3>
<p>State output ke end mein synchronization line hoti hai. <code>synchronized</code> woh hai jo chahiye. Peer reach na ho to line batati hai ki peer not available hai.</p>

<pre class="out">&gt; show high-availability state          (lab, healthy pair)
  Local Information:
    Management IP    : 192.0.2.50
    Priority         : primary (preemptive)
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.51
    State            : passive-secondary
  <span class="hl">Configuration synchronization: synchronized</span></pre>

<p>Passive peer ki apni configuration dekhkar bhi prove kar sakte ho. Lab <code>pn-ha-build</code> mein proof yeh hai ki secondary ke paas ab managed devices aur template stack hain jo aapne sirf primary par configure kiye the. <code>request high-availability sync-to-remote running-config</code> se copy force kar sakte ho; soch samajhkar use karo aur apne PAN-OS version ki documentation check karo ki yeh kya overwrite karta hai.</p>

<h3>Daily kaam par asar</h3>
<ul>
<li>Configuration changes <b>active</b> peer par karo. Woh passive tak jaate hain.</li>
<li>Device-local change (jaise management setting) <b>har</b> Panorama par karna padta hai. Doosra bhool gaye to promoted peer surprise deta hai.</li>
<li>Commit ka matlab peer bhi update hota hai, galti ke saath. HA galtiyan bhi imaandaari se copy karta hai.</li>
</ul>

<p>Kaun se logs aur runtime state synchronize hote hain, aur kaise, woh version aur design par depend karta hai. Assume mat karo, apne PAN-OS version ki documentation check karo.</p>

<div class="scn"><h4>DNS ka surprise</h4><p>Failover ke baad ek engineer ne dekha ki naya active Panorama ek hostname resolve nahi kar pa raha. DNS servers device-local setting hain aur sirf original par set kiye gaye the. Baaki sab synchronize ho chuka tha.</p><p><b>Lesson:</b> device-local settings ki chhoti list rakho aur build ke time aur changes ke baad dono peers par check karo.</p></div>

<div class="iv"><p class="q">"HA Panoramas ke beech kya synchronize nahi hota, aur kyun?"</p><p>deviceconfig ke neeche ki device-local settings, HA settings samet, kyunki woh individual box ko describe karti hain. Copy hoti to pair apni identity overwrite kar leta. Baaki sab, jaise device groups aur templates, active peer ko follow karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab rule: deviceconfig ke alawa sab synchronize, active se passive.</li>
<li>Pair banne par aur har commit par hota hai.</li>
<li>Device-local settings dono peers par set karni hain.</li>
<li>Synchronization galtiyan bhi copy karta hai; yeh backup nahi hai.</li>
</ul></div>
`}};export{e as default};