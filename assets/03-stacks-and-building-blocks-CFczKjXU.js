var e={id:`stacks-and-building-blocks`,h:{en:`Template stacks and building blocks`,hi:`Template stacks aur building blocks`},body:{en:`
<p>A child building a toy castle does not carve it from one block of wood. There are small standard bricks: wall pieces, towers, a gate. Different castles use different combinations of the same bricks. Panorama works the same way. You keep small, focused <b>templates</b> and combine them in a <b>template stack</b>. The stack is what you assign to firewalls.</p>

<h3>Three words to separate clearly</h3>
<dl class="terms">
<dt>Template</dt><dd>One named bundle of network and device settings, for example NK-BRANCH-NET (interfaces, zones, routes) or NK-REGION (settings for one region).</dd>
<dt>Template stack</dt><dd>An ordered list of templates, plus the firewalls that use them, plus variable values for those firewalls. Panorama merges the templates in the list to produce one resulting configuration per firewall.</dd>
<dt>Managed firewall</dt><dd>A device registered by serial number. It belongs to a stack; the stack decides what template configuration it receives.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates combined into a stack and assigned to firewalls">
<rect x="20" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">NK-GLOBAL (template)</text>
<rect x="20" y="75" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-REGION (template)</text>
<rect x="20" y="130" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="155" text-anchor="middle" class="svg-ink" font-size="13">NK-BRANCH-NET (template)</text>
<rect x="260" y="40" width="150" height="130" rx="10" fill="#fde68a"/><text x="335" y="70" text-anchor="middle" class="svg-ink" font-size="14">NK-STACK</text><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="12">ordered list</text><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="12">+ device list</text><text x="335" y="135" text-anchor="middle" class="svg-ink" font-size="12">+ variable values</text>
<rect x="480" y="30" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="53" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-PA</text>
<rect x="480" y="85" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="108" text-anchor="middle" class="svg-ink" font-size="13">NK-DELHI-PA</text>
<rect x="480" y="140" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="163" text-anchor="middle" class="svg-ink" font-size="13">NK-CHENNAI-PA</text>
<path d="M190 40 L260 80 M190 95 L260 100 M190 150 L260 125 M410 90 L480 48 M410 105 L480 103 M410 125 L480 158" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Templates are the bricks, the stack is the assembled design, firewalls receive the result.</p></div>

<h3>Building a stack in the lab</h3>
<p>These are the commands you will use in the first lab, <code>pn-tpl-build</code>. The serial numbers are the ones you read with <code>show system info</code> on each firewall.</p>
<pre class="code">PANO&gt; configure
PANO# set template-stack NK-STACK templates [ NK-BRANCH-NET ]
PANO# set template-stack NK-STACK devices &lt;serial of NK-PUNE-PA&gt;
PANO# set template-stack NK-STACK devices &lt;serial of NK-DELHI-PA&gt;
PANO# commit
PANO# exit
PANO&gt; show template-stack</pre>

<h3>Why not one giant template?</h3>
<p>A single template for everything works for a tiny company. As soon as Chennai needs a different MTU, or the south region needs another syslog server, you must copy the whole template and the copies drift. Small templates with one clear purpose (global basics, one region, one branch design) can be combined differently for each group of firewalls. Chapter 6 shows how to layer them.</p>
<table class="tbl"><thead><tr><th>Design choice</th><th>Good side</th><th>Risk</th></tr></thead><tbody>
<tr><td>One big template</td><td>Simple to start</td><td>Copy and paste per exception, then drift</td></tr>
<tr><td>Several small templates in a stack</td><td>Reuse, clear ownership, small blast radius</td><td>Needs a clear order and naming</td></tr>
<tr><td>One stack per site</td><td>Full control per site</td><td>Many stacks to maintain</td></tr>
</tbody></table>
<p>The practical limits (how many templates a stack may hold, and how many stacks you may have) depend on the PAN-OS version, so check the documentation for your PAN-OS version before designing at scale.</p>

<div class="scn"><h4>Chennai joins the family</h4><p>Chennai was a new regional site. Instead of copying the branch template, the engineer added Chennai's serial number to the existing stack and gave it its own variables. The same afternoon it had the same zones, routes and management profiles as the other branches, and the team did not have to review a new configuration, only three variable values.</p></div>

<div class="iv"><p class="q">"What is the difference between a template and a template stack?"</p><p>A template is one bundle of settings. A stack is an ordered combination of templates that is assigned to firewalls and also holds the per-firewall variable values. Panorama merges the templates in a stack to compute what each firewall receives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates are reusable bricks; the stack is the assembled design assigned to firewalls.</li>
<li>A stack holds an ordered template list, its firewalls and variable values.</li>
<li>Small focused templates beat one giant template with copies.</li>
<li>Stack and template limits depend on PAN-OS version; read the documentation.</li>
</ul></div>
`,hi:`
<p>Toy castle banane wala bachha use lakdi ke ek tukde se nahi tarashta. Chhote standard bricks hote hain: deewar ke pieces, towers, gate. Alag castles ek hi bricks ke alag combinations use karte hain. Panorama bhi aise hi kaam karta hai. Aap chhote, focused <b>templates</b> rakhte ho aur unhe <b>template stack</b> mein jodte ho. Stack wo cheez hai jo firewalls ko assign hoti hai.</p>

<h3>Teen shabd jinhe saaf alag rakho</h3>
<dl class="terms">
<dt>Template</dt><dd>Network aur device settings ka ek named bundle, jaise NK-BRANCH-NET (interfaces, zones, routes) ya NK-REGION (ek region ki settings).</dd>
<dt>Template stack</dt><dd>Templates ki ordered list, plus unhe use karne wale firewalls, plus un firewalls ke variable values. Panorama list ke templates ko merge karke har firewall ke liye ek resulting configuration banata hai.</dd>
<dt>Managed firewall</dt><dd>Serial number se registered device. Wo ek stack ka hissa hota hai; stack decide karta hai ki use kaunsi template configuration milegi.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates stack mein jud kar firewalls ko assign hote hain">
<rect x="20" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">NK-GLOBAL (template)</text>
<rect x="20" y="75" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-REGION (template)</text>
<rect x="20" y="130" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="155" text-anchor="middle" class="svg-ink" font-size="13">NK-BRANCH-NET (template)</text>
<rect x="260" y="40" width="150" height="130" rx="10" fill="#fde68a"/><text x="335" y="70" text-anchor="middle" class="svg-ink" font-size="14">NK-STACK</text><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="12">ordered list</text><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="12">+ device list</text><text x="335" y="135" text-anchor="middle" class="svg-ink" font-size="12">+ variable values</text>
<rect x="480" y="30" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="53" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-PA</text>
<rect x="480" y="85" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="108" text-anchor="middle" class="svg-ink" font-size="13">NK-DELHI-PA</text>
<rect x="480" y="140" width="140" height="36" rx="8" fill="#fed7aa"/><text x="550" y="163" text-anchor="middle" class="svg-ink" font-size="13">NK-CHENNAI-PA</text>
<path d="M190 40 L260 80 M190 95 L260 100 M190 150 L260 125 M410 90 L480 48 M410 105 L480 103 M410 125 L480 158" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Templates bricks hain, stack assembled design hai, firewalls result receive karte hain.</p></div>

<h3>Lab mein stack banana</h3>
<p>Ye commands tum pehle lab <code>pn-tpl-build</code> mein use karoge. Serial numbers wahi hain jo tum har firewall par <code>show system info</code> se padhte ho.</p>
<pre class="code">PANO&gt; configure
PANO# set template-stack NK-STACK templates [ NK-BRANCH-NET ]
PANO# set template-stack NK-STACK devices &lt;serial of NK-PUNE-PA&gt;
PANO# set template-stack NK-STACK devices &lt;serial of NK-DELHI-PA&gt;
PANO# commit
PANO# exit
PANO&gt; show template-stack</pre>

<h3>Ek giant template kyun nahi?</h3>
<p>Chhoti company ke liye ek template sab kuch chala deta hai. Jaise hi Chennai ko alag MTU chahiye ya south region ko doosra syslog server, tumhe poora template copy karna padta hai aur copies drift karti hain. Ek clear purpose wale chhote templates (global basics, ek region, ek branch design) har firewalls group ke liye alag tareeke se combine ho sakte hain. Chapter 6 batata hai unhe layer kaise karte hain.</p>
<table class="tbl"><thead><tr><th>Design choice</th><th>Achhi baat</th><th>Risk</th></tr></thead><tbody>
<tr><td>Ek bada template</td><td>Shuru karna simple</td><td>Har exception par copy-paste, phir drift</td></tr>
<tr><td>Stack mein kai chhote templates</td><td>Reuse, clear ownership, chhota blast radius</td><td>Clear order aur naming chahiye</td></tr>
<tr><td>Har site ka ek stack</td><td>Har site par poora control</td><td>Maintain karne ko bahut stacks</td></tr>
</tbody></table>
<p>Practical limits (ek stack mein kitne templates aur kitne stacks) PAN-OS version par depend karti hain, isliye bade scale par design karne se pehle apne PAN-OS version ki documentation check karo.</p>

<div class="scn"><h4>Chennai family mein aaya</h4><p>Chennai naya regional site tha. Branch template copy karne ke bajay engineer ne Chennai ka serial number maujooda stack mein jodha aur use apne variables diye. Usi dopahar uske paas baaki branches jaise hi zones, routes aur management profiles the, aur team ko nayi configuration review nahi karni padi, sirf teen variable values.</p></div>

<div class="iv"><p class="q">"Template aur template stack mein kya fark hai?"</p><p>Template settings ka ek bundle hai. Stack templates ka ordered combination hai jo firewalls ko assign hota hai aur per-firewall variable values bhi rakhta hai. Panorama stack ke templates ko merge karke compute karta hai ki har firewall ko kya milega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates reusable bricks hain; stack assembled design hai jo firewalls ko assign hota hai.</li>
<li>Stack mein ordered template list, uske firewalls aur variable values hote hain.</li>
<li>Copies wale giant template se chhote focused templates behtar hain.</li>
<li>Stack aur template limits PAN-OS version par depend karti hain; documentation padho.</li>
</ul></div>
`}};export{e as default};