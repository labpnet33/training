var e={id:`what-is-managed-centrally`,h:{en:`What is managed centrally: device groups and templates`,hi:`Central kya manage hota hai: device groups aur templates`},body:{en:`
<p>Picture a franchise burger chain. Head office decides the menu and the price list (what is served and the rules for serving it). Each outlet decides its own shop address, its electricity connection and its opening hours (how this specific shop is wired). Panorama splits firewall configuration in the same two ways: <b>what the firewall enforces</b> and <b>how this firewall is built</b>.</p>

<h3>Device groups: policy and objects</h3>
<p>A <b>device group</b> is a set of firewalls that share the same policy and objects. Policy means security rules and NAT rules; objects mean reusable building blocks such as address objects, address groups, services and service groups. You write a rule once in the device group, and Panorama pushes it to every firewall in that group. Device groups sit in a hierarchy under <b>Shared</b>: anything in Shared is visible to every device group, a parent group passes down to its children, and a child can override an object by reusing its name. You will build hierarchies in a later module; here you only need the idea.</p>

<h3>Templates: network and device settings</h3>
<p>A <b>template</b> holds the settings that describe how a firewall is built: interfaces, zones, virtual routers and routes, server profiles, and device settings such as the Panorama server address. A <b>template stack</b> combines several templates in priority order so you can layer a global template under a regional one. Where one site needs different values, such as its own WAN address, templates use variables. Again, details come in the next module; here, remember the split.</p>
<table class="tbl"><tr><th>Container</th><th>Holds</th><th>Example in the labs</th></tr>
<tr><td>Device group</td><td>Security and NAT rules, address and service objects, log forwarding profiles</td><td>NK-BRANCHES, NK-SOUTH</td></tr>
<tr><td>Template / stack</td><td>Interfaces, zones, routing, server profiles, device settings</td><td>NK-BRANCH-NET in stack NK-STACK</td></tr>
<tr><td>Local to the firewall</td><td>Its own management IP, local admin access, anything you choose to keep local</td><td>Management IP 192.0.2.11 on NK-PUNE-PA</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Containers">
<rect x="230" y="10" width="180" height="48" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text>
<rect x="60" y="100" width="220" height="56" rx="8" fill="#fde68a"/><text x="170" y="124" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="170" y="143" text-anchor="middle" class="svg-muted" font-size="12">policy + objects</text>
<rect x="360" y="100" width="220" height="56" rx="8" fill="#bbf7d0"/><text x="470" y="124" text-anchor="middle" class="svg-ink" font-size="13">Template stack</text><text x="470" y="143" text-anchor="middle" class="svg-muted" font-size="12">network + device settings</text>
<rect x="210" y="178" width="220" height="38" rx="8" fill="#bae6fd"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Firewall: merged result</text>
<line x1="290" y1="58" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="350" y1="58" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="156" x2="270" y2="178" stroke="#64748b" stroke-width="2"/><line x1="470" y1="156" x2="370" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The firewall's effective configuration is the merge of the device group, the template stack and its own local settings.</p></div>

<h3>What stays local</h3>
<p>Some things are deliberately local. The firewall must be reachable <i>before</i> Panorama can send it anything, so its management IP, netmask, gateway and the address of Panorama are typed on the firewall itself (this is what you do in lab <b>pn-connect</b>). A later push can include a template that sets many other things, but a value typed locally can win over a template value, which is called an override. The commit workflow module explains how to see and remove overrides.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings wants every branch to block outbound SSH. That is a security rule, so it goes in the device group (a rule named Block-SSH-Out in NK-BRANCHES). Each branch also needs its own WAN address, which is a network setting, so it goes in the template stack with a per-site value. Same project, two different containers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a network setting in a device group or a rule in a template. Ask the question "does this describe what traffic is allowed, or how the box is wired?" The first is a device group matter, the second a template matter.</p></div>

<div class="scn"><h4>Where does the syslog server belong?</h4><p>An engineer wanted to add a syslog server and could not decide where. The log forwarding profile (which logs go where) is policy-side and sits in a device group; the syslog server profile (the address and transport of the server) is a device setting and sits in a template. The two are linked by name.</p><p><b>Lesson:</b> one feature can span both containers; learn which half lives where.</p></div>

<div class="iv"><p class="q">"Explain device groups versus templates."</p><p>Device groups carry policy and objects (rules, addresses, services). Templates carry network and device configuration (interfaces, zones, routing, server settings), and template stacks layer templates in priority order. A firewall can be in one device group and one template stack, and its final configuration is the merge plus local settings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device groups = policy and objects; templates and stacks = network and device settings.</li>
<li>Shared is the top of the device group hierarchy; children can override by name.</li>
<li>The management IP and Panorama address are set locally so the firewall can be reached first.</li>
<li>A local value can override a template value.</li>
<li>Ask: what is allowed (device group) or how is the box wired (template)?</li>
</ul></div>
`,hi:`
<p>Socho ek franchise burger chain. Head office menu aur price list decide karta hai (kya serve hota hai aur serve karne ke rules). Har outlet apna shop address, apna electricity connection aur opening hours decide karta hai (ye specific shop kaise wired hai). Panorama firewall configuration ko isi tarah do hisson mein baant ta hai: <b>firewall kya enforce karta hai</b> aur <b>ye firewall kaise bana hai</b>.</p>

<h3>Device groups: policy aur objects</h3>
<p><b>Device group</b> firewalls ka set hai jo same policy aur objects share karte hain. Policy matlab security rules aur NAT rules; objects matlab reusable building blocks jaise address objects, address groups, services aur service groups. Rule device group mein ek baar likhte ho, aur Panorama use us group ke har firewall ko push kar deta hai. Device groups <b>Shared</b> ke neeche hierarchy mein hote hain: Shared mein jo kuch hai wo har device group ko dikhta hai, parent group children ko pass karta hai, aur child same naam use karke object override kar sakta hai. Hierarchies aage ke module mein banaoge; yahan sirf idea chahiye.</p>

<h3>Templates: network aur device settings</h3>
<p><b>Template</b> wo settings rakhta hai jo batati hain firewall kaise bana hai: interfaces, zones, virtual routers aur routes, server profiles, aur Panorama server address jaisi device settings. <b>Template stack</b> kai templates ko priority order mein jodta hai taaki global template ke neeche regional template layer kar sako. Jahan ek site ko alag values chahiye, jaise apna WAN address, wahan templates variables use karte hain. Details agle module mein; abhi split yaad rakho.</p>
<table class="tbl"><tr><th>Container</th><th>Kya rakhta hai</th><th>Labs mein example</th></tr>
<tr><td>Device group</td><td>Security aur NAT rules, address aur service objects, log forwarding profiles</td><td>NK-BRANCHES, NK-SOUTH</td></tr>
<tr><td>Template / stack</td><td>Interfaces, zones, routing, server profiles, device settings</td><td>Stack NK-STACK mein NK-BRANCH-NET</td></tr>
<tr><td>Firewall par local</td><td>Apna management IP, local admin access, jo bhi aap local rakhna chaho</td><td>NK-PUNE-PA par management IP 192.0.2.11</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Containers">
<rect x="230" y="10" width="180" height="48" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text>
<rect x="60" y="100" width="220" height="56" rx="8" fill="#fde68a"/><text x="170" y="124" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="170" y="143" text-anchor="middle" class="svg-muted" font-size="12">policy + objects</text>
<rect x="360" y="100" width="220" height="56" rx="8" fill="#bbf7d0"/><text x="470" y="124" text-anchor="middle" class="svg-ink" font-size="13">Template stack</text><text x="470" y="143" text-anchor="middle" class="svg-muted" font-size="12">network + device settings</text>
<rect x="210" y="178" width="220" height="38" rx="8" fill="#bae6fd"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Firewall: merged result</text>
<line x1="290" y1="58" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="350" y1="58" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="156" x2="270" y2="178" stroke="#64748b" stroke-width="2"/><line x1="470" y1="156" x2="370" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Firewall ki effective configuration device group, template stack aur uski apni local settings ka merge hai.</p></div>

<h3>Kya local rehta hai</h3>
<p>Kuch cheezein jaanbujhkar local hain. Panorama kuch bhejne se <i>pehle</i> firewall reachable hona chahiye, isliye uska management IP, netmask, gateway aur Panorama ka address firewall par hi type hote hain (lab <b>pn-connect</b> mein yahi karoge). Baad ka push ek template la sakta hai jo bahut kuch set kare, par local type ki hui value template value par jeet sakti hai, ise override kehte hain. Commit workflow module batata hai overrides kaise dekhein aur hataein.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings chahta hai har branch outbound SSH block kare. Ye security rule hai, isliye device group mein jata hai (NK-BRANCHES mein Block-SSH-Out naam ka rule). Har branch ko apna WAN address bhi chahiye, jo network setting hai, isliye template stack mein per-site value ke saath jata hai. Ek project, do alag containers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Network setting device group mein ya rule template mein rakhna. Sawal poocho: "ye batata hai kaun sa traffic allowed hai, ya box kaise wired hai?" Pehla device group ka matter hai, doosra template ka.</p></div>

<div class="scn"><h4>Syslog server kahan aayega?</h4><p>Engineer ko syslog server jodna tha aur decide nahi kar pa raha tha kahan. Log forwarding profile (kaun se logs kahan jayein) policy side hai aur device group mein hota hai; syslog server profile (server ka address aur transport) device setting hai aur template mein hota hai. Dono naam se linked hote hain.</p><p><b>Lesson:</b> ek feature dono containers mein phail sakta hai; seekho kaunsa half kahan rehta hai.</p></div>

<div class="iv"><p class="q">"Device groups aur templates ka difference samjhao."</p><p>Device groups policy aur objects rakhte hain (rules, addresses, services). Templates network aur device configuration rakhte hain (interfaces, zones, routing, server settings), aur template stacks templates ko priority order mein layer karte hain. Firewall ek device group aur ek template stack mein ho sakta hai, aur uski final configuration merge plus local settings hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device groups = policy aur objects; templates aur stacks = network aur device settings.</li>
<li>Shared device group hierarchy ka top hai; children naam se override kar sakte hain.</li>
<li>Management IP aur Panorama address local set hote hain taaki firewall pehle reach ho sake.</li>
<li>Local value template value ko override kar sakti hai.</li>
<li>Poocho: kya allowed hai (device group) ya box kaise wired hai (template)?</li>
</ul></div>
`}};export{e as default};