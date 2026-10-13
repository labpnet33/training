var e={id:`firewalls-two-panoramas`,h:{en:`How firewalls use two Panorama servers`,hi:`Firewalls do Panorama servers ko kaise use karte hain`},body:{en:`
<p>If you move a shop to a new address but only tell customers the old one, the shop is fine and nobody can find it. The Panorama HA pair is the same: the pair can be perfectly healthy, yet a firewall that only knows the primary has nowhere to go when the primary stops being active. The firewall must be told about <b>both</b> servers.</p>

<h3>Two settings on the firewall</h3>
<dl class="terms">
<dt>panorama-server</dt><dd>The first Panorama management IP the firewall connects to. In the lab: 192.0.2.50.</dd>
<dt>panorama-server-2</dt><dd>The second Panorama management IP. In the lab: 192.0.2.51.</dd>
</dl>
<p>You do not type these on every firewall. Panorama owns the firewalls' network configuration through a <b>template</b>, so you add <code>panorama-server-2</code> in the template, commit to Panorama, and push the template stack. Both firewalls then list two servers. (If you are unsure about templates, revisit the earlier templates module.)</p>

<pre class="code"><span class="c">! on the active Panorama (lab, from pn-ha-failover)</span>
configure
set template NK-BASE config deviceconfig system panorama-server-2 192.0.2.51
commit
exit
commit-all template-stack name NK-STACK</pre>

<p>Remember the rule from the commit module: a push sends the last <b>committed</b> configuration. So you must commit before <code>commit-all</code>, otherwise nothing new is sent.</p>

<h3>What the firewall reports</h3>
<pre class="out">&gt; show panorama-status          (PA1, lab, healthy pair, two servers known)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    <span class="hl">HA state      : active</span>

Panorama Server 2 : 192.0.2.51
    Connected     : yes
    <span class="hl">HA state      : passive</span></pre>
<p>Read it like this: the firewall is connected to both, and it knows which one is active. It is <b>managed through the active peer</b>.</p>

<h3>What happens when the second server is missing</h3>
<p>With only <code>panorama-server</code> (the primary) and no <code>panorama-server-2</code>, the firewall depends on that single address. While the primary is not active (for example suspended), the firewall loses management: the secondary is active, but the firewall does not know it exists. In the lab you can see this on the firewall:</p>
<pre class="out">&gt; show panorama-status          (PA1, only one server configured, primary suspended)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    <span class="hl">HA state      : non-functional</span></pre>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Firewall with one or two servers">
<rect x="20" y="20" width="270" height="140" rx="10" fill="#fde68a"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">Only panorama-server</text>
<text x="155" y="76" text-anchor="middle" class="svg-ink" font-size="12">Primary active: managed</text>
<text x="155" y="104" text-anchor="middle" class="svg-ink" font-size="12">Primary suspended: not managed</text>
<text x="155" y="136" text-anchor="middle" class="svg-muted" font-size="11">secondary is unknown to the firewall</text>
<rect x="350" y="20" width="270" height="140" rx="10" fill="#bbf7d0"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">panorama-server + server-2</text>
<text x="485" y="76" text-anchor="middle" class="svg-ink" font-size="12">Primary active: managed by it</text>
<text x="485" y="104" text-anchor="middle" class="svg-ink" font-size="12">Primary suspended: managed by peer</text>
<text x="485" y="136" text-anchor="middle" class="svg-muted" font-size="11">firewall follows the active peer</text>
</svg><p class="cap">The second server entry is what makes the pair useful to the firewalls.</p></div>

<div class="exam"><p>Exam trap: HA formed does not mean firewalls are covered. The firewall side needs panorama-server-2, pushed from the active Panorama through the template.</p></div>

<p>Ports, certificates and the exact connection mechanics are outside the lab; check the documentation for your PAN-OS version.</p>

<div class="scn"><h4>The silent gap</h4><p>A team built a perfect HA pair and tested the pair itself. During the first real failover all branch firewalls showed as disconnected on the new active Panorama. Nobody had added the second server to the template. They added it, committed, pushed the stack from the original, and the firewalls reconnected.</p><p><b>Lesson:</b> test the failover with the firewalls in the loop, not only the pair.</p></div>

<div class="iv"><p class="q">"How do firewalls know where to go when Panorama fails over?"</p><p>They have two Panorama servers configured, normally pushed through a template. They connect to both and are managed through whichever is active. Without the second server entry they would lose management when the first is not active.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls need panorama-server and panorama-server-2.</li>
<li>Add the second server in the template, commit, then push the stack.</li>
<li>show panorama-status shows both servers and their HA states.</li>
<li>Missing server 2 means lost management during failover.</li>
</ul></div>
`,hi:`
<p>Agar aap dukaan naye address par le jaao par customers ko sirf purana address batao, to dukaan theek hai par koi dhoondh nahi sakta. Panorama HA pair bhi aisa hi hai: pair bilkul healthy ho sakta hai, par jo firewall sirf primary ko jaanta hai uske paas jaane ki jagah nahi bachti jab primary active nahi rehta. Firewall ko <b>dono</b> servers ke baare mein batana padta hai.</p>

<h3>Firewall par do settings</h3>
<dl class="terms">
<dt>panorama-server</dt><dd>Pehla Panorama management IP jis se firewall connect hota hai. Lab mein: 192.0.2.50.</dd>
<dt>panorama-server-2</dt><dd>Doosra Panorama management IP. Lab mein: 192.0.2.51.</dd>
</dl>
<p>Yeh har firewall par type nahi karte. Panorama firewalls ki network configuration <b>template</b> se own karta hai, isliye <code>panorama-server-2</code> template mein jodte ho, Panorama par commit karte ho aur template stack push karte ho. Phir dono firewalls do servers list karte hain. (Templates par doubt ho to pehle ka templates module dobara dekho.)</p>

<pre class="code"><span class="c">! active Panorama par (lab, pn-ha-failover se)</span>
configure
set template NK-BASE config deviceconfig system panorama-server-2 192.0.2.51
commit
exit
commit-all template-stack name NK-STACK</pre>

<p>Commit module ka rule yaad rakho: push last <b>committed</b> configuration bhejta hai. To <code>commit-all</code> se pehle commit karna zaroori hai, warna kuch naya nahi jaata.</p>

<h3>Firewall kya report karta hai</h3>
<pre class="out">&gt; show panorama-status          (PA1, lab, healthy pair, do servers known)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    <span class="hl">HA state      : active</span>

Panorama Server 2 : 192.0.2.51
    Connected     : yes
    <span class="hl">HA state      : passive</span></pre>
<p>Aise padho: firewall dono se connected hai, aur use pata hai kaun active hai. Woh <b>active peer ke through managed</b> hota hai.</p>

<h3>Doosra server missing ho to kya hota hai</h3>
<p>Sirf <code>panorama-server</code> (primary) ho aur <code>panorama-server-2</code> na ho, to firewall us ek address par depend karta hai. Jab primary active nahi (jaise suspended), firewall management kho deta hai: secondary active hai, par firewall ko uske hone ka pata hi nahi. Lab mein firewall par yeh dikhta hai:</p>
<pre class="out">&gt; show panorama-status          (PA1, sirf ek server configured, primary suspended)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    <span class="hl">HA state      : non-functional</span></pre>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Firewall with one or two servers">
<rect x="20" y="20" width="270" height="140" rx="10" fill="#fde68a"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">Sirf panorama-server</text>
<text x="155" y="76" text-anchor="middle" class="svg-ink" font-size="12">Primary active: managed</text>
<text x="155" y="104" text-anchor="middle" class="svg-ink" font-size="12">Primary suspended: managed nahi</text>
<text x="155" y="136" text-anchor="middle" class="svg-muted" font-size="11">secondary firewall ko unknown hai</text>
<rect x="350" y="20" width="270" height="140" rx="10" fill="#bbf7d0"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">panorama-server + server-2</text>
<text x="485" y="76" text-anchor="middle" class="svg-ink" font-size="12">Primary active: usi se managed</text>
<text x="485" y="104" text-anchor="middle" class="svg-ink" font-size="12">Primary suspended: peer se managed</text>
<text x="485" y="136" text-anchor="middle" class="svg-muted" font-size="11">firewall active peer ko follow karta hai</text>
</svg><p class="cap">Doosre server ki entry hi pair ko firewalls ke liye useful banati hai.</p></div>

<div class="exam"><p>Exam trap: HA ban gaya matlab firewalls covered nahi. Firewall side ko panorama-server-2 chahiye, active Panorama se template ke through push hua.</p></div>

<p>Ports, certificates aur exact connection mechanics lab ke bahar hain; apne PAN-OS version ki documentation check karo.</p>

<div class="scn"><h4>Khamosh gap</h4><p>Ek team ne perfect HA pair banaya aur sirf pair test kiya. Pehle real failover mein saare branch firewalls naye active Panorama par disconnected dikhe. Kisi ne template mein doosra server nahi jodha tha. Unhone jodha, commit kiya, original se stack push kiya aur firewalls reconnect ho gaye.</p><p><b>Lesson:</b> failover test firewalls ke saath karo, sirf pair ka nahi.</p></div>

<div class="iv"><p class="q">"Panorama fail over ho to firewalls ko kaise pata chalta hai kahan jaana hai?"</p><p>Unke paas do Panorama servers configured hote hain, normally template se push hue. Woh dono se connect hote hain aur jo active ho usi se managed hote hain. Doosre server ki entry ke bina pehle ke active na rehne par woh management kho dete.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls ko panorama-server aur panorama-server-2 chahiye.</li>
<li>Doosra server template mein jodo, commit karo, phir stack push karo.</li>
<li>show panorama-status dono servers aur unki HA states dikhata hai.</li>
<li>Server 2 missing matlab failover mein management lost.</li>
</ul></div>
`}};export{e as default};