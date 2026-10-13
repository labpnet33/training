var e={id:`cli-jinja-groups`,h:{en:`CLI templates, Jinja templates and template groups`,hi:`CLI templates, Jinja templates aur template groups`},body:{en:`
<p>The GUI templates of chapter 3 cover the common objects. Real designs always need something more: a BGP configuration with a loopback, a route map with communities, a setting that the GUI page does not show. For these FortiManager has <b>CLI templates</b>. When the same text must change depending on the device, a <b>Jinja template</b> adds variables and logic. Finally, a <b>template group</b> bundles several templates so that you assign one thing instead of ten.</p>
<h3>Three kinds of CLI content</h3>
<table class="cmp"><tr><th>Kind</th><th>What it is</th><th>When to use</th></tr><tr><td><b>CLI template</b></td><td>Plain FortiOS CLI text that FortiManager sends to the device as part of an install</td><td>A fixed block that is the same on every device</td></tr><tr><td><b>Jinja template</b></td><td>CLI text with variables <code>{{ name }}</code> and Jinja logic such as <code>if</code> and <code>for</code></td><td>Text that differs per device, for example loopback address, BGP AS, optional second hub</td></tr><tr><td><b>CLI script</b></td><td>Text run on demand against a device, a policy package or the device database, outside the normal template flow</td><td>One-time changes and fixes (chapter 7)</td></tr></table>
<p>The difference between a CLI template and a script matters: a <b>template</b> is part of the managed configuration and is assigned to devices, so FortiManager keeps applying it at every install. A <b>script</b> is a one-off action.</p>
<h3>A Jinja template for our branches</h3>
<p>Jinja is the template language used by many tools (Ansible and others). In FortiManager the metadata variables are available as Jinja variables; Fortinet also publishes predefined variables that read values from the device database, and a list of Jinja filters and functions that you can use in CLI templates. The example below builds the loopback and the iBGP session of a spoke, and adds the second hub only when a variable says so.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Jinja CLI template BRANCH-BGP. Variables come from the device variable mapping.</span>
config system interface
    edit "Loopback"
        set vdom "root"
        set ip {{ loopback_ip }} 255.255.255.255
        set allowaccess ping
        set type loopback
    next
end
config router bgp
    set as {{ bgp_as }}
    set router-id {{ loopback_ip }}
    set ibgp-multipath enable
    set recursive-next-hop enable
    config neighbor
        edit "{{ hub1_loopback }}"
            set remote-as {{ bgp_as }}
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
{% if hub2_enabled == "yes" %}
        edit "{{ hub2_loopback }}"
            set remote-as {{ bgp_as }}
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
{% endif %}
    end
end</pre>
<p>The text lines starting with <code>{%</code> are Jinja control statements; they produce no CLI output themselves. When the variable <code>hub2_enabled</code> is "yes" for a branch, the second neighbor is generated; for other branches it is left out. The BGP design is the loopback design of fsd-routing, expressed once. Note that <code>{{ loopback_ip }}</code> is the Jinja form of the variable that the SD-WAN template writes as <code>$(loopback_ip)</code>.</p>
<h3>Creating and testing a Jinja template</h3>
<ol><li>Open <b>Device Manager</b>, then <b>Provisioning Templates</b>, then <b>CLI Templates</b>, and choose to create a new template.</li><li>Give it a name and select the Jinja type (in some releases shown as the script type of the template). Paste the text.</li><li>Use the template's <b>validate</b> function. Since FortiManager 7.0.1 CLI templates can be validated and previewed; the validation catches syntax errors and variables that are not defined.</li><li>Assign the template to one test device, and use the <b>preview</b> to see the exact CLI that would be sent, with all variables substituted for that device.</li><li>Only after the preview looks right, add the template to a template group and assign the group to the device group.</li></ol>
<h3>Template groups</h3>
<p>A <b>template group</b> collects provisioning templates, for example the SD-WAN template, an IPsec template, a BGP template and one or more CLI templates, and is assigned to a device or device group as a unit. The group is the unit that the Overlay Orchestrator of chapter 6 creates for hubs and for branches: Fortinet states that the orchestrator creates IPsec, BGP and CLI templates, assigns them to the devices and organises them into template groups. A group is shown in the template list (as Template Groups, or CLI Template Groups in some releases). Benefits:</p>
<ul><li>One assignment per device instead of many.</li><li>A clear status: the device shows which group it follows and whether it is in sync.</li><li>Easy change control: you edit the template; every device that uses the group is marked as modified.</li></ul>
<p><b>Order and overlap.</b> If a GUI template and a CLI template both set the same option, the one that is applied later wins, and the install preview shows the final result. Avoid overlap on purpose: let the SD-WAN template own SD-WAN settings and let CLI templates add only what the GUI cannot.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="20" width="210" height="170" rx="10" fill="#ddd6fe"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Template group BRANCH-GROUP</text><rect x="25" y="55" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="75" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN template</text><rect x="25" y="92" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="112" text-anchor="middle" class="svg-ink" font-size="12">IPsec template</text><rect x="25" y="129" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="149" text-anchor="middle" class="svg-ink" font-size="12">Jinja BRANCH-BGP</text><rect x="270" y="45" width="170" height="60" rx="10" fill="#bae6fd"/><text x="355" y="70" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="355" y="90" text-anchor="middle" class="svg-muted" font-size="11">BRANCHES</text><rect x="480" y="20" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="480" y="80" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="110" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><rect x="480" y="140" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="170" text-anchor="middle" class="svg-ink" font-size="13">BR3-FGT</text><line x1="220" y1="105" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="165" stroke="#64748b" stroke-width="2"/></svg><p class="cap">One group holds the templates, one assignment to the device group delivers all of them.</p></div>
<div class="warn"><p><b>Common mistake.</b> Editing a shared Jinja template for one special branch. All branches that use the group change at the next install. For a real exception, add a variable with a default or a conditional block, or use a separate template group.</p></div>
<div class="exam"><p><b>Exam trap.</b> Templates are assigned to devices and are reapplied at install; scripts are one-off. Jinja variables use double curly braces. Template groups are the assignment unit and the Overlay Orchestrator builds them for you.</p></div>
<div class="scn"><h4>The branch with one hub</h4><p>A branch in a remote town had only one usable path to HUB2. The BGP session toward HUB2 stayed Active and raised alarms. The team set the variable <code>hub2_enabled</code> to "no" for that branch. After a preview and install, the Jinja template generated only the HUB1 neighbor, and the alarms stopped. Every other branch kept both neighbors.</p><p><b>Lesson:</b> Use variables and Jinja conditions for exceptions, not separate hand-edited copies.</p></div>
<div class="iv"><p class="q">"What is the difference between a CLI template, a Jinja template and a script?"</p><p>A CLI template is fixed CLI text assigned to devices as part of their managed configuration. A Jinja template is CLI text with variables and logic, so the output differs per device. A script is run on demand against a device, a package or the device database and is not part of the assigned configuration. I validate and preview templates before assigning them through a template group.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>CLI templates add what GUI templates cannot; Jinja adds variables and conditions.</li><li>Variables are written with double curly braces in Jinja and with dollar-parenthesis in GUI templates.</li><li>Validate and preview before assigning; templates are reapplied at every install.</li><li>Template groups are the assignment unit and are what the overlay wizard creates.</li></ul></div>
`,hi:`
<p>Chapter 3 ke GUI templates common objects cover karte hain. Asli designs ko hamesha kuch aur chahiye: loopback wali BGP configuration, communities wala route map, aisi setting jo GUI page nahi dikhata. Inke liye FortiManager ke paas <b>CLI templates</b> hain. Jab wahi text device ke hisaab se badalna ho to <b>Jinja template</b> variables aur logic jodta hai. Aakhir mein <b>template group</b> kai templates ko bundle karta hai taaki aap das ki jagah ek cheez assign karo.</p>
<h3>CLI content ke teen kinds</h3>
<table class="cmp"><tr><th>Kind</th><th>Yeh kya hai</th><th>Kab use karein</th></tr><tr><td><b>CLI template</b></td><td>Plain FortiOS CLI text jo FortiManager install ke hisse ke roop mein device ko bhejta hai</td><td>Fixed block jo har device par same ho</td></tr><tr><td><b>Jinja template</b></td><td>Variables <code>{{ name }}</code> aur <code>if</code>, <code>for</code> jaise Jinja logic wala CLI text</td><td>Text jo device ke hisaab se alag ho, jaise loopback address, BGP AS, optional doosra hub</td></tr><tr><td><b>CLI script</b></td><td>Text jo demand par device, policy package ya device database par chalta hai, normal template flow ke bahar</td><td>Ek baar ke changes aur fixes (chapter 7)</td></tr></table>
<p>CLI template aur script ka farq matter karta hai: <b>template</b> managed configuration ka hissa hai aur devices ko assign hota hai, isliye FortiManager use har install par lagata rehta hai. <b>Script</b> ek baar ka action hai.</p>
<h3>Hamare branches ke liye Jinja template</h3>
<p>Jinja woh template language hai jo kai tools (Ansible aur doosre) use karte hain. FortiManager mein metadata variables Jinja variables ki tarah available hain; Fortinet predefined variables bhi deta hai jo device database se values padhte hain, aur Jinja filters aur functions ki list jo aap CLI templates mein use kar sakte ho. Neeche ka example spoke ka loopback aur iBGP session banata hai, aur doosra hub tabhi jodta hai jab variable aisa kahe.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Jinja CLI template BRANCH-BGP. Variables come from the device variable mapping.</span>
config system interface
    edit "Loopback"
        set vdom "root"
        set ip {{ loopback_ip }} 255.255.255.255
        set allowaccess ping
        set type loopback
    next
end
config router bgp
    set as {{ bgp_as }}
    set router-id {{ loopback_ip }}
    set ibgp-multipath enable
    set recursive-next-hop enable
    config neighbor
        edit "{{ hub1_loopback }}"
            set remote-as {{ bgp_as }}
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
{% if hub2_enabled == "yes" %}
        edit "{{ hub2_loopback }}"
            set remote-as {{ bgp_as }}
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
{% endif %}
    end
end</pre>
<p><code>{%</code> se shuru hone wali text lines Jinja control statements hain; woh khud koi CLI output nahi banati. Jab kisi branch ke liye variable <code>hub2_enabled</code> "yes" ho to doosra neighbor generate hota hai; doosre branches ke liye chhoot jaata hai. BGP design fsd-routing ka loopback design hai, ek baar express kiya hua. Dhyan do ki <code>{{ loopback_ip }}</code> us variable ka Jinja form hai jise SD-WAN template <code>$(loopback_ip)</code> likhta hai.</p>
<h3>Jinja template banana aur test karna</h3>
<ol><li><b>Device Manager</b>, phir <b>Provisioning Templates</b>, phir <b>CLI Templates</b> kholo, aur naya template banana chuno.</li><li>Naam do aur Jinja type chuno (kuch releases mein template ke script type ke roop mein dikhta hai). Text paste karo.</li><li>Template ka <b>validate</b> function use karo. FortiManager 7.0.1 se CLI templates validate aur preview ho sakte hain; validation syntax errors aur undefined variables pakadta hai.</li><li>Template ko ek test device par assign karo, aur <b>preview</b> se dekho exactly kaun sa CLI bheja jayega, us device ke liye saare variables substitute hokar.</li><li>Preview theek lage tabhi template ko template group mein jodo aur group ko device group par assign karo.</li></ol>
<h3>Template groups</h3>
<p><b>Template group</b> provisioning templates ko collect karta hai, jaise SD-WAN template, IPsec template, BGP template aur ek ya zyada CLI templates, aur device ya device group ko ek unit ke roop mein assign hota hai. Chapter 6 ka Overlay Orchestrator hubs aur branches ke liye yahi group banata hai: Fortinet kehta hai ki orchestrator IPsec, BGP aur CLI templates banata hai, unhe devices ko assign karta hai aur template groups mein organise karta hai. Group template list mein dikhta hai (Template Groups ya kuch releases mein CLI Template Groups ke roop mein). Fayde:</p>
<ul><li>Bahut saari assignments ki jagah har device ke liye ek.</li><li>Saaf status: device dikhata hai ki woh kaun sa group follow karta hai aur in sync hai ya nahi.</li><li>Aasan change control: aap template edit karte ho; group use karne wala har device modified mark hota hai.</li></ul>
<p><b>Order aur overlap.</b> Agar GUI template aur CLI template dono same option set karein to jo baad mein lagu hota hai woh jeetta hai, aur install preview final result dikhata hai. Overlap jaanbujhkar avoid karo: SD-WAN settings SD-WAN template ke paas rahein aur CLI templates sirf wahi jodein jo GUI nahi kar sakta.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="20" width="210" height="170" rx="10" fill="#ddd6fe"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Template group BRANCH-GROUP</text><rect x="25" y="55" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="75" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN template</text><rect x="25" y="92" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="112" text-anchor="middle" class="svg-ink" font-size="12">IPsec template</text><rect x="25" y="129" width="180" height="30" rx="8" fill="#fde68a"/><text x="115" y="149" text-anchor="middle" class="svg-ink" font-size="12">Jinja BRANCH-BGP</text><rect x="270" y="45" width="170" height="60" rx="10" fill="#bae6fd"/><text x="355" y="70" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="355" y="90" text-anchor="middle" class="svg-muted" font-size="11">BRANCHES</text><rect x="480" y="20" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="480" y="80" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="110" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><rect x="480" y="140" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="170" text-anchor="middle" class="svg-ink" font-size="13">BR3-FGT</text><line x1="220" y1="105" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><line x1="440" y1="75" x2="480" y2="165" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Ek group templates rakhta hai, device group ko ek assignment sab deliver kar deti hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Ek khaas branch ke liye shared Jinja template edit karna. Group use karne wale saare branches agle install par badal jaate hain. Asli exception ke liye default wala variable ya conditional block jodo, ya alag template group use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Templates devices ko assign hote hain aur har install par dobara lagu hote hain; scripts ek baar ke hote hain. Jinja variables double curly braces use karte hain. Template groups assignment unit hain aur Overlay Orchestrator unhe aapke liye banata hai.</p></div>
<div class="scn"><h4>Ek hub wala branch</h4><p>Door ke shehar ke ek branch ke paas HUB2 tak sirf ek hi usable path tha. HUB2 ki taraf BGP session Active mein atka raha aur alarms bajte rahe. Team ne us branch ke liye variable <code>hub2_enabled</code> ko "no" set kiya. Preview aur install ke baad Jinja template ne sirf HUB1 neighbor generate kiya, aur alarms band ho gaye. Baaki har branch ke paas dono neighbors rahe.</p><p><b>Seekh:</b> Exceptions ke liye variables aur Jinja conditions use karo, alag haath se edit ki hui copies nahi.</p></div>
<div class="iv"><p class="q">"CLI template, Jinja template aur script mein kya farq hai?"</p><p>CLI template fixed CLI text hai jo devices ko unki managed configuration ke hisse ke roop mein assign hota hai. Jinja template variables aur logic wala CLI text hai, isliye output device ke hisaab se alag hota hai. Script demand par device, package ya device database par chalta hai aur assigned configuration ka hissa nahi hota. Main templates ko assign karne se pehle validate aur preview karta hoon, template group ke through.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>CLI templates woh jodte hain jo GUI templates nahi kar sakte; Jinja variables aur conditions jodta hai.</li><li>Variables Jinja mein double curly braces se aur GUI templates mein dollar-parenthesis se likhe jaate hain.</li><li>Assign karne se pehle validate aur preview karo; templates har install par dobara lagu hote hain.</li><li>Template groups assignment unit hain aur overlay wizard unhe banata hai.</li></ul></div>
`}};export{e as default};