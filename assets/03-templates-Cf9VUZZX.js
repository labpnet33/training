var e={id:`templates`,h:{en:`Templates, template stacks and variables`,hi:`Templates, template stacks aur variables`},body:{en:`
<p>Templates are how Panorama manages everything about how a firewall is built: interfaces, zones, virtual routers, DNS, NTP, syslog servers and admin authentication. The idea: write the common parts once, and vary only what must differ.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator). Names, addresses and zones are lab values.</p></div>
<h3>Template and template stack</h3>
<p>A <b>template</b> holds settings from the Network and Device tabs. A <b>template stack</b> combines up to sixteen templates and is assigned to firewalls. When two templates in a stack set the same value, the template higher in the stack has priority, so you can put a small regional template on top of a broad base template.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A template stack layers templates; the template at the top of the stack wins when settings conflict."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Base-Network</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">zones, VR</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Base-Device</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">DNS, NTP, syslog</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Region-EMEA</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">local overrides</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Stack</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">firewall gets all</text></svg><p class="cap">A template stack layers templates; the template at the top of the stack wins when settings conflict.</p></div>
<p>A common layering pattern:</p>
<ul>
<li><b>Base-Device</b>: DNS, NTP, syslog and SNMP servers, banner, authentication profile, admin lockout.</li>
<li><b>Base-Network</b>: zones LAN, GUEST, UNTRUST, the default virtual router, standard interface management profile.</li>
<li><b>Region-EMEA</b>: a regional NTP, a regional default route.</li>
<li>The stack <b>EMEA-Branch</b> lists the three, with the regional template at the top.</li>
</ul>
<p>Firewalls in a stack get one combined result. Changing NTP in Base-Device changes it for every stack that includes it.</p>
<h3>Variables</h3>
<p>Different sites need different values: the WAN IP, the next hop, the LAN subnet. A <b>template variable</b> is a placeholder with a name that starts with a dollar sign, such as the variable for the WAN address. You use the variable in the template (for example in an interface IP field) and set its real value per firewall or in the stack. Variable types include IP netmask, IP range, FQDN, group ID, device priority and interface. This lets 40 branches share one template while each keeps its own address.</p>
<p>Reference approach:</p>
<ul>
<li>Define variables in the stack with a default or no value.</li>
<li>Set each branch's real value in the device's variable list.</li>
<li>A missing value stops the commit and push for that device, which is the right behaviour: better an error than a firewall with a wrong address.</li>
</ul>
<h3>Overrides on the firewall</h3>
<p>You can allow a local firewall to override a template value, shown with an override marker on the firewall. Use it rarely, for settings such as the management IP and hostname that are always local. Pushed values that a local admin has overridden stay overridden until the override is reverted. For security, give the local site team no write access to template-controlled settings.</p>
<h3>What a template cannot hold</h3>
<p>Policies and objects live in device groups, not templates. A template can hold zones and interfaces, while the device group security rule refers to the zone by name. If the name differs between template and rule, the rule does not match or the commit is rejected, so keep zone names consistent across the stack and the rulebase.</p>
<h3>Order and conflicts</h3>
<ul>
<li>Within a stack, order matters; use the arrows to place the highest-priority template first.</li>
<li>Do not set the same item in several templates unless you mean to override.</li>
<li>Plan names: a clear scheme such as Base-Device, Base-Network, Region-EMEA and Site-Pune makes the stack readable.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Stack PUNE-BRANCH = Site-Pune (top), Region-APAC, Base-Network, Base-Device. Base-Network sets zone LAN. Region-APAC sets a default route to 192.0.2.1 for APAC. Site-Pune sets the WAN interface to the variable value 203.0.113.10/30 set on the Pune firewall. The firewall receives all of them as one configuration.</p></div>
<div class="warn"><p><b>Common mistake.</b> Placing a broad template above a specific one in the stack. The broad one then overrides the regional setting you thought you had.</p></div>
<div class="exam"><p><b>Exam trap.</b> A template stack can hold up to sixteen templates; the topmost wins on conflict. Variables are set per device. Templates carry network and device settings only; policy belongs to device groups.</p></div>
<div class="scn"><h4>The wrong NTP everywhere</h4><p>An engineer changed the NTP server in Base-Device for a lab test and pushed. Forty firewalls lost time sync and certificate validation failed on logins. The audit showed the commit. They reverted the template version, pushed again, and moved lab changes into a separate lab template stack.</p><p><b>Lesson:</b> a base template is shared by everyone; treat it as production.</p></div>
<div class="iv"><p class="q">"What is a template stack and why use one?"</p><p>It is an ordered group of templates assigned to a firewall so common settings live in base templates and local differences in small ones. If two templates set the same value, the higher one wins. Combine with variables so each site gets its own address.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A template holds Network and Device settings; a stack layers up to sixteen.</li><li>The top template in a stack wins conflicts.</li><li>Variables give each firewall its own values from one template.</li><li>Overrides on the firewall should be rare and controlled.</li><li>Keep zone names consistent between templates and device group rules.</li></ul></div>
`,hi:`
<p>Templates woh tareeka hain jisse Panorama firewall ke build ki har cheez manage karta hai: interfaces, zones, virtual routers, DNS, NTP, syslog servers aur admin authentication. Idea: common hisse ek baar likho, aur sirf woh badlo jo alag hona chahiye.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta). Names, addresses aur zones lab values hain.</p></div>
<h3>Template aur template stack</h3>
<p><b>Template</b> Network aur Device tabs ki settings rakhta hai. <b>Template stack</b> solah tak templates ko jodta hai aur firewalls ko assign hota hai. Stack ke do templates same value set karein to stack mein upar wale template ki priority hoti hai, isliye aap chhota regional template broad base template ke upar rakh sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Template stack templates ko layer karta hai; settings conflict hon to stack mein sabse upar wala template jeetta hai."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Base-Network</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">zones, VR</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Base-Device</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">DNS, NTP, syslog</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Region-EMEA</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">local overrides</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Stack</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">firewall ko sab milta hai</text></svg><p class="cap">Template stack templates ko layer karta hai; settings conflict hon to stack mein sabse upar wala template jeetta hai.</p></div>
<p>Common layering pattern:</p>
<ul>
<li><b>Base-Device</b>: DNS, NTP, syslog aur SNMP servers, banner, authentication profile, admin lockout.</li>
<li><b>Base-Network</b>: zones LAN, GUEST, UNTRUST, default virtual router, standard interface management profile.</li>
<li><b>Region-EMEA</b>: regional NTP, regional default route.</li>
<li>Stack <b>EMEA-Branch</b> teeno ko list karta hai, regional template sabse upar.</li>
</ul>
<p>Stack ke firewalls ko ek combined result milta hai. Base-Device mein NTP badalne se woh har us stack ke liye badalta hai jisme woh included hai.</p>
<h3>Variables</h3>
<p>Alag sites ko alag values chahiye: WAN IP, next hop, LAN subnet. <b>Template variable</b> ek naam wala placeholder hai jiska naam dollar sign se shuru hota hai, jaise WAN address ka variable. Aap variable ko template mein use karte ho (jaise interface IP field mein) aur uski asli value per firewall ya stack mein set karte ho. Variable types: IP netmask, IP range, FQDN, group ID, device priority aur interface. Isse 40 branches ek template share karte hain aur har ek apna address rakhti hai.</p>
<p>Reference approach:</p>
<ul>
<li>Variables stack mein default ya bina value ke define karo.</li>
<li>Har branch ki asli value device ki variable list mein set karo.</li>
<li>Value missing ho to us device ka commit aur push ruk jaata hai, jo sahi behaviour hai: galat address wale firewall se behtar error.</li>
</ul>
<h3>Firewall par overrides</h3>
<p>Local firewall ko template value override karne de sakte ho, jo firewall par override marker ke saath dikhta hai. Ise kam use karo, un settings ke liye jo hamesha local hoti hain jaise management IP aur hostname. Local admin ke override kiye pushed values override hi rehte hain jab tak override revert na ho. Security ke liye local site team ko template-controlled settings par write access mat do.</p>
<h3>Template kya nahi rakh sakta</h3>
<p>Policies aur objects device groups mein rehte hain, templates mein nahi. Template zones aur interfaces rakh sakta hai, jabki device group ki security rule zone ko naam se refer karti hai. Template aur rule mein naam alag hon to rule match nahi karti ya commit reject hota hai, isliye stack aur rulebase mein zone names consistent rakho.</p>
<h3>Order aur conflicts</h3>
<ul>
<li>Stack ke andar order matter karta hai; arrows se highest-priority template ko pehle rakho.</li>
<li>Same item kai templates mein tab tak set mat karo jab tak override ka irada na ho.</li>
<li>Names plan karo: Base-Device, Base-Network, Region-EMEA aur Site-Pune jaisi clear scheme stack ko padhne layak banati hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Stack PUNE-BRANCH = Site-Pune (top), Region-APAC, Base-Network, Base-Device. Base-Network zone LAN set karta hai. Region-APAC APAC ke liye 192.0.2.1 ka default route set karta hai. Site-Pune WAN interface ko Pune firewall par set variable value 203.0.113.10/30 par rakhta hai. Firewall ko sab ek combined configuration ki tarah milta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Broad template ko stack mein specific ke upar rakhna. Tab broad wala woh regional setting override kar deta hai jo aapne maana tha aapke paas hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template stack mein solah tak templates ho sakte hain; sabse upar wala conflict jeetta hai. Variables per device set hote hain. Templates sirf network aur device settings rakhte hain; policy device groups ki hoti hai.</p></div>
<div class="scn"><h4>Har jagah galat NTP</h4><p>Ek engineer ne lab test ke liye Base-Device mein NTP server badla aur push kar diya. Chalis firewalls ka time sync gaya aur logins par certificate validation fail hui. Audit ne commit dikhaya. Unhone template version revert karke dobara push kiya, aur lab changes alag lab template stack mein shift kiye.</p><p><b>Lesson:</b> base template sab ka shared hota hai; use production maano.</p></div>
<div class="iv"><p class="q">"Template stack kya hai aur use kyun karte hain?"</p><p>Yeh firewall ko assign hua templates ka ordered group hai taaki common settings base templates mein aur local differences chhote templates mein rahein. Do templates same value set karein to upar wala jeetta hai. Variables ke saath milao taaki har site ko apna address mile.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Template Network aur Device settings rakhta hai; stack solah tak layer karta hai.</li><li>Stack ka top template conflicts jeetta hai.</li><li>Variables ek template se har firewall ko apni values dete hain.</li><li>Firewall par overrides rare aur controlled hone chahiye.</li><li>Templates aur device group rules ke zone names consistent rakho.</li></ul></div>
`}};export{e as default};