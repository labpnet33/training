var e={id:`cli-templates`,h:{en:`CLI templates and CLI add-on templates`,hi:`CLI templates aur CLI add-on templates`},body:{en:`
<p>Feature templates are like a printed form: you tick boxes and fill fields, and the form makes sure you only enter valid things. A <b>CLI template</b> is like a blank page: you write the configuration yourself, as text. The Manager checks very little and sends exactly what you wrote. That freedom is useful when the form has no box for what you need, and risky because nobody checks your spelling.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CLI template and add-on">
<rect x="10" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Full CLI template</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">whole device config</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">as text</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">CLI add-on</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">extra lines only</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">plus feature templates</text>
<rect x="440" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Variables</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">{{name}} per device</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">or CSV</text>
<path d="M200 65 L225 65 M415 65 L440 65" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">{{variables}} are filled per device at attach time</text>
</svg><p class="cap">Two ways to use CLI, one variable syntax.</p></div>

<h3>Two kinds of CLI template for IOS XE edges</h3>
<table class="cmp"><tr><th></th><th>CLI template (device configuration)</th><th>CLI add-on template</th></tr>
<tr><td>Scope</td><td>The <b>whole</b> device configuration is text; no feature templates are used</td><td>A <b>few extra lines</b> added to a device template built from feature templates</td></tr>
<tr><td>Where it lives</td><td>Device Templates &gt; Create Template &gt; CLI Template</td><td>Feature Templates &gt; Add Template &gt; Other Templates &gt; CLI Add-On Template; attached under Additional Templates</td></tr>
<tr><td>Typical use</td><td>Lift and shift from an existing router, prototypes, features the GUI lacks</td><td>One missing feature, such as a DHCP server pool or a special ACL</td></tr>
<tr><td>Risk</td><td>High: one typo can break the whole config</td><td>Medium: only your lines, but they must not conflict with the generated ones</td></tr></table>
<p>Older releases also had an <i>intent-based</i> CLI template that accepted Viptela-style syntax and converted it to IOS XE. It is being phased out. Cisco recommends the device-configuration-based type, available since IOS XE SD-WAN Release 17.2.1r.</p>

<h3>Click path: full CLI template</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Templates</b> and the <b>Device Templates</b> tab.</li>
<li>Click <b>Create Template</b> &gt; <b>CLI Template</b>.</li>
<li>Choose the <b>Device Model</b>, enter a <b>Template Name</b> and <b>Description</b>, and choose <b>Device configuration</b>.</li>
<li>Type, paste or upload the configuration. To make a variable, select a value and click <b>Create Variable</b>, or type <code>{{variable_name}}</code> yourself.</li>
<li>Click <b>Add</b> (or <b>Save</b>). Then attach devices the same way as for any device template.</li>
</ol>

<h3>Variables in CLI text</h3>
<p>A variable is a name between double curly braces. When you attach a device, the Manager asks for each value, or reads them from a CSV. A short example of the branch configuration as a CLI template:</p>
<pre class="code">hostname {{hostname}}
!
system
 system-ip {{system_ip}}
 site-id {{site_id}}
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30
!
interface GigabitEthernet1
 ip address {{wan_ip}} {{wan_mask}}
 no shutdown
!
ip route 0.0.0.0 0.0.0.0 {{wan_gw}}
!
vrf definition 10
 address-family ipv4
 exit-address-family
interface GigabitEthernet3
 vrf forwarding 10
 ip address {{lan_ip}} 255.255.255.0
 no shutdown</pre>
<p>Names with letters, digits and underscores are safest. Use the same name everywhere you need the same value.</p>

<h3>CLI add-on templates</h3>
<p>Suppose the branch LAN needs a DHCP server on the edge. The feature-template device template does not include it, so you write a <b>CLI add-on template</b>:</p>
<pre class="code">ip dhcp excluded-address vrf 10 {{lan_gw}} {{lan_dhcp_excl_end}}
ip dhcp pool LAN10
 vrf 10
 network {{lan_net}} 255.255.255.0
 default-router {{lan_gw}}
 dns-server 192.0.2.53</pre>
<p>Create it under <b>Feature Templates</b> &gt; <b>Add Template</b> &gt; <b>Other Templates</b> &gt; <b>CLI Add-On Template</b>, then add it to the device template under <b>Additional Templates</b> &gt; <b>CLI Add-On Template</b>. The Manager merges the add-on lines into the final configuration. The rule to remember: <b>add-on lines must not duplicate or contradict what the feature templates already generate.</b> If a feature template configures GigabitEthernet3, do not configure the same interface again in the add-on.</p>

<h3>How to write a safe CLI template</h3>
<ul>
<li><b>Start from a working router.</b> On a device in controller mode, <code>show sdwan running-config</code> shows the configuration in the form the Manager expects. Copy from there, then replace values with variables.</li>
<li><b>Leave out machine-generated parts</b> such as certificates, keys and default lines the platform creates itself.</li>
<li><b>Mind the order</b> of dependent lines (a VRF must exist before an interface uses it).</li>
<li><b>Test on one lab device</b> and read the config preview before pushing to many.</li>
<li><b>Prefer feature templates</b> when a field exists for what you need; they validate input and survive upgrades better.</li>
</ul>

<h3>What a bad line looks like</h3>
<p>When the device rejects a line, the push task fails and shows the device message:</p>
<pre class="out">Task: Push CLI Template Configuration     Device: E-BLR-1     Status: <span class="hl">Failure</span>
Failed to finish task. The device rejected the configuration:
ip dhcp pool LAN10
 vrf 10
 netwrk 10.3.10.0 255.255.255.0
% Invalid input detected at '^' marker.</pre>
<p>The typo <code>netwrk</code> is found by reading the message and the preview, then the template is edited and pushed again. The device keeps its previous working configuration when a push fails.</p>

<div class="warn"><p><b>Common mistakes.</b> Adding add-on lines that duplicate a feature-template interface; forgetting the vrf forwarding order; pasting a configuration that contains the system IP of another device instead of a variable; and using a full CLI template when only one extra feature was needed.</p></div>
<div class="exam"><p><b>Exam trap.</b> A device template is either feature-template based or a full CLI template. A CLI add-on goes with feature templates. The variable syntax is <code>{{name}}</code>. The Manager pushes only the difference between what is on the device and what the template generates.</p></div>

<div class="scn"><h4>The DHCP pool that fought with the LAN</h4><p>At the Pune branch the engineer added a CLI add-on that configured GigabitEthernet3 with an IP helper address. The VPN interface feature template already set the same interface, and the push failed with a conflict. She moved the helper address into the feature template (the DHCP Helper field) and left the add-on only for the DHCP pool, which the GUI could not do. The next push worked.</p><p><b>Lesson:</b> use the feature template for what it covers, and the add-on only for the gap.</p></div>

<div class="iv"><p class="q">"When would you use a CLI template or CLI add-on instead of feature templates?"</p><p>Strong answer: a CLI add-on when a single feature has no field in the GUI (for example a DHCP server pool). A full CLI template for lift-and-shift of existing configuration or for quick prototypes. Otherwise prefer feature templates because they validate input and are easier to maintain. Mention variables <code>{{name}}</code> and that add-on lines must not conflict with generated ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A CLI template is text; a full one replaces feature templates, an add-on supplements them.</li>
<li>Variables use the <code>{{name}}</code> syntax and are filled when you attach devices.</li>
<li>Copy working configuration from <code>show sdwan running-config</code> and replace values with variables.</li>
<li>Add-on lines must not conflict with generated configuration.</li>
<li>Prefer feature templates when a field exists; use CLI for gaps.</li>
</ul></div>
`,hi:`
<p>Feature templates ek printed form jaise hain: aap boxes tick karte ho aur fields bharte ho, aur form dekhta hai ki sirf valid cheezein hi daalo. <b>CLI template</b> ek khaali page jaisa hai: aap configuration khud text mein likhte ho. Manager bahut kam check karta hai aur jo likha wahi bhejta hai. Yeh azaadi tab kaam aati hai jab form mein aapki zaroorat ka box nahi hota, aur risky hai kyunki spelling koi check nahi karta.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CLI template and add-on">
<rect x="10" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Full CLI template</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">poori device config</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">text mein</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">CLI add-on</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">sirf extra lines</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">feature templates ke saath</text>
<rect x="440" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Variables</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">{{name}} per device</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">ya CSV</text>
<path d="M200 65 L225 65 M415 65 L440 65" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">{{variables}} are filled per device at attach time</text>
</svg><p class="cap">CLI use karne ke do tareeke, ek variable syntax.</p></div>

<h3>IOS XE edges ke liye do tarah ke CLI template</h3>
<table class="cmp"><tr><th></th><th>CLI template (device configuration)</th><th>CLI add-on template</th></tr>
<tr><td>Scope</td><td><b>Poori</b> device configuration text hai; feature templates use nahi hote</td><td>Feature templates se bane device template mein <b>kuch extra lines</b></td></tr>
<tr><td>Kahan rehta hai</td><td>Device Templates &gt; Create Template &gt; CLI Template</td><td>Feature Templates &gt; Add Template &gt; Other Templates &gt; CLI Add-On Template; Additional Templates ke neeche attach</td></tr>
<tr><td>Typical use</td><td>Existing router se lift and shift, prototypes, jo features GUI mein nahi</td><td>Ek missing feature, jaise DHCP server pool ya special ACL</td></tr>
<tr><td>Risk</td><td>High: ek typo poori config tod sakta hai</td><td>Medium: sirf aapki lines, lekin generated lines se conflict nahi honi chahiye</td></tr></table>
<p>Purani releases mein <i>intent-based</i> CLI template bhi tha jo Viptela-style syntax leta tha aur use IOS XE mein convert karta tha. Ise phase out kiya ja raha hai. Cisco device-configuration-based type recommend karta hai, jo IOS XE SD-WAN Release 17.2.1r se available hai.</p>

<h3>Click path: full CLI template</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Templates</b> aur <b>Device Templates</b> tab kholo.</li>
<li><b>Create Template</b> &gt; <b>CLI Template</b> click karo.</li>
<li><b>Device Model</b> chuno, <b>Template Name</b> aur <b>Description</b> likho, aur <b>Device configuration</b> chuno.</li>
<li>Configuration type, paste ya upload karo. Variable banane ke liye value select karke <b>Create Variable</b> click karo, ya khud <code>{{variable_name}}</code> type karo.</li>
<li><b>Add</b> (ya <b>Save</b>) click karo. Phir kisi bhi device template ki tarah devices attach karo.</li>
</ol>

<h3>CLI text mein variables</h3>
<p>Variable double curly braces ke beech ka naam hai. Jab aap device attach karte ho, Manager har value maangta hai, ya CSV se padhta hai. Branch configuration ka chhota example CLI template ke roop mein:</p>
<pre class="code">hostname {{hostname}}
!
system
 system-ip {{system_ip}}
 site-id {{site_id}}
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30
!
interface GigabitEthernet1
 ip address {{wan_ip}} {{wan_mask}}
 no shutdown
!
ip route 0.0.0.0 0.0.0.0 {{wan_gw}}
!
vrf definition 10
 address-family ipv4
 exit-address-family
interface GigabitEthernet3
 vrf forwarding 10
 ip address {{lan_ip}} 255.255.255.0
 no shutdown</pre>
<p>Letters, digits aur underscores wale naam sabse safe hain. Jahan same value chahiye wahan har jagah same naam use karo.</p>

<h3>CLI add-on templates</h3>
<p>Maano branch LAN ko edge par DHCP server chahiye. Feature-template device template mein yeh nahi hai, isliye aap <b>CLI add-on template</b> likhte ho:</p>
<pre class="code">ip dhcp excluded-address vrf 10 {{lan_gw}} {{lan_dhcp_excl_end}}
ip dhcp pool LAN10
 vrf 10
 network {{lan_net}} 255.255.255.0
 default-router {{lan_gw}}
 dns-server 192.0.2.53</pre>
<p>Ise <b>Feature Templates</b> &gt; <b>Add Template</b> &gt; <b>Other Templates</b> &gt; <b>CLI Add-On Template</b> ke neeche banao, phir device template mein <b>Additional Templates</b> &gt; <b>CLI Add-On Template</b> ke neeche jodo. Manager add-on lines ko final configuration mein merge karta hai. Yaad rakhne wala rule: <b>add-on lines ko wahi duplicate ya contradict nahi karna chahiye jo feature templates pehle se generate karte hain.</b> Agar feature template GigabitEthernet3 configure karta hai, to same interface ko add-on mein dobara configure mat karo.</p>

<h3>Safe CLI template kaise likhein</h3>
<ul>
<li><b>Working router se shuru karo.</b> Controller mode wale device par <code>show sdwan running-config</code> configuration ko us form mein dikhata hai jo Manager expect karta hai. Wahan se copy karo, phir values ko variables se badlo.</li>
<li><b>Machine-generated parts chhod do</b> jaise certificates, keys aur woh default lines jo platform khud banata hai.</li>
<li>Dependent lines ka <b>order dhyan mein rakho</b> (interface use kare usse pehle VRF maujood hona chahiye).</li>
<li>Ek lab device par <b>test karo</b> aur bahut devices par push karne se pehle config preview padho.</li>
<li>Jab aapki zaroorat ke liye field maujood ho to <b>feature templates ko prefer karo</b>; woh input validate karte hain aur upgrades mein behtar rehte hain.</li>
</ul>

<h3>Kharab line kaisi dikhti hai</h3>
<p>Jab device koi line reject karta hai, push task fail hota hai aur device ka message dikhata hai:</p>
<pre class="out">Task: Push CLI Template Configuration     Device: E-BLR-1     Status: <span class="hl">Failure</span>
Failed to finish task. The device rejected the configuration:
ip dhcp pool LAN10
 vrf 10
 netwrk 10.3.10.0 255.255.255.0
% Invalid input detected at '^' marker.</pre>
<p>Typo <code>netwrk</code> message aur preview padhkar milta hai, phir template edit karke dobara push kiya jaata hai. Push fail hone par device apni pichhli working configuration rakhta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Aisi add-on lines jodna jo feature-template interface ko duplicate karti hain; vrf forwarding order bhool jaana; aisi configuration paste karna jisme variable ki jagah doosre device ka system IP hai; aur sirf ek extra feature ke liye poora CLI template use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Device template ya to feature-template based hai ya full CLI template. CLI add-on feature templates ke saath jaata hai. Variable syntax <code>{{name}}</code> hai. Manager sirf wahi difference push karta hai jo device par maujood aur template se generate hone wale ke beech hai.</p></div>

<div class="scn"><h4>DHCP pool jo LAN se ladh gaya</h4><p>Pune branch par engineer ne CLI add-on jodha jo GigabitEthernet3 par IP helper address configure karta tha. VPN interface feature template pehle se wahi interface set karta tha, aur push conflict ke saath fail hua. Usne helper address ko feature template mein (DHCP Helper field) shift kar diya aur add-on sirf DHCP pool ke liye rakha, jo GUI nahi kar sakta tha. Agla push chal gaya.</p><p><b>Seekh:</b> jo feature template cover karta hai uske liye feature template use karo, aur add-on sirf gap ke liye.</p></div>

<div class="iv"><p class="q">"Feature templates ki jagah CLI template ya CLI add-on kab use karoge?"</p><p>Strong answer: CLI add-on tab jab ek feature ka GUI mein field nahi hai (jaise DHCP server pool). Full CLI template existing configuration ke lift-and-shift ya quick prototypes ke liye. Warna feature templates prefer karo kyunki woh input validate karte hain aur maintain karna aasan hai. Variables <code>{{name}}</code> batao aur yeh bhi ki add-on lines generated lines se conflict nahi karni chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI template text hai; full wala feature templates ki jagah leta hai, add-on unhe supplement karta hai.</li>
<li>Variables <code>{{name}}</code> syntax use karte hain aur devices attach karte waqt bhare jaate hain.</li>
<li><code>show sdwan running-config</code> se working configuration copy karo aur values ko variables se badlo.</li>
<li>Add-on lines generated configuration se conflict nahi karni chahiye.</li>
<li>Field maujood ho to feature templates prefer karo; gaps ke liye CLI use karo.</li>
</ul></div>
`}};export{e as default};