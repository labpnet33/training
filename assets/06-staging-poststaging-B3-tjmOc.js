var e={id:`staging-poststaging`,h:{en:`Staging and post-staging: how the branch gets its config`,hi:`Staging aur post-staging: branch ko config kaise milti hai`},body:{en:`
<p>A new employee arrives on day one with only an ID card. At the gate, security checks the card against the staff list (<b>staging</b>). Once recognised, HR gives the employee the desk, the laptop and the access rights prepared in advance (<b>post-staging</b>). The ID card is not the whole job; it is just enough to be recognised. Versa onboarding has exactly these two phases.</p>

<h3>Phase 1: staging</h3>
<p>A freshly installed VOS branch has almost no configuration. <b>Staging</b> gives it the minimum it needs to find the headend:</p>
<ul>
<li>a working WAN interface with an address and a default route toward the Internet underlay (so the underlay can carry packets),</li>
<li>the <b>serial number</b> that identifies the device,</li>
<li>the <b>Controller address</b> to connect to.</li>
</ul>
<p>With these, the branch builds a secure tunnel (IKE and IPsec) to the <b>Controller</b>. This is the first moment the headend hears from the branch. The course lab starts from a branch that already has this minimal underlay; its Internet address is 203.0.113.14/30 with the carrier gateway 203.0.113.13.</p>

<h3>Phase 2: post-staging</h3>
<p>Once the staging tunnel is up, the Controller tells the <b>Director</b> that a device with serial X arrived. The Director looks the serial up in its device list. If it finds the device and the workflow has been deployed, it takes the device's group, the group's template and the device's bind data, expands them into a full configuration, and <b>pushes it to the branch over NETCONF</b> (a management protocol that runs over the secure staging connection). The branch commits the configuration, builds its tunnels on every WAN, and joins the overlay. That is why this phase is called post-staging.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Onboarding message flow">
<text x="80" y="22" text-anchor="middle" class="svg-ink" font-size="13">Branch3</text><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="560" y="22" text-anchor="middle" class="svg-ink" font-size="13">Director</text>
<line x1="80" y1="30" x2="80" y2="245" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="30" x2="320" y2="245" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="30" x2="560" y2="245" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="80" y1="60" x2="320" y2="60" stroke="#0369a1" stroke-width="2"/><text x="200" y="53" text-anchor="middle" class="svg-accent" font-size="12">1 IKE/IPsec + serial</text>
<line x1="320" y1="100" x2="560" y2="100" stroke="#0369a1" stroke-width="2"/><text x="440" y="93" text-anchor="middle" class="svg-accent" font-size="12">2 new device, serial?</text>
<line x1="560" y1="140" x2="560" y2="160" stroke="#64748b" stroke-width="2"/><text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">3 find device, group,</text><text x="440" y="165" text-anchor="middle" class="svg-muted" font-size="12">template, bind data</text>
<line x1="560" y1="195" x2="80" y2="195" stroke="#15803d" stroke-width="2"/><text x="320" y="188" text-anchor="middle" class="svg-accent" font-size="12">4 NETCONF push: full config</text>
<line x1="80" y1="230" x2="320" y2="230" stroke="#15803d" stroke-width="2"/><text x="200" y="223" text-anchor="middle" class="svg-accent" font-size="12">5 WAN tunnels, MP-BGP</text>
</svg><p class="cap">Staging builds the first tunnel to the Controller; post-staging delivers the real configuration from the Director.</p></div>

<h3>Why two phases?</h3>
<p>A new box cannot be told its configuration before it can be reached, and it cannot be trusted before it is identified. Staging solves identity and reachability with the smallest possible configuration. Post-staging then does the heavy work from a trusted, central place. It also means the Director does not need a path into the branch LAN: the push uses the connection the branch itself opened.</p>

<h3>What the serial number does</h3>
<p>The serial is the key that links the physical box to a Director record. If the staged serial is not in the Director device list, the Director cannot match the device to any template. In the course model this is the state <b>Rejected</b>. The serial is checked after the Controller and Director links are verified, so a wrong serial and a broken link produce different symptoms.</p>

<h3>The course model order of checks</h3>
<p>The engine evaluates in this order, which is a useful troubleshooting order too:</p>
<ol>
<li>Was staging started on the branch? (otherwise Not staged)</li>
<li>Does a Controller answer at the staged address, and is it reachable from the branch?</li>
<li>Does the Controller know a Director, can it reach it, and is the Controller registered there?</li>
<li>Is the serial in the Director? (otherwise Rejected)</li>
<li>Has the workflow been deployed? (otherwise Staged - waiting for Director)</li>
<li>Do the device group, template, tenant and complete bind data exist? (otherwise Post-staging failed)</li>
<li>All good: the template is pushed and the device is Online.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Branch3 stages toward 198.51.100.20 with serial VOS-BR3-0001. Steps 1 to 3 pass. Step 4 finds Branch3 in the Director. Step 5: deployed revision 1. Step 6 passes with 6 bind values. Step 7: the Director pushes a few dozen configuration lines (hostname, site-id, controller, two WAN interfaces with transports, two transport routes, LAN, and policy parts), and the branch becomes Online. After the push those lines are <b>read-only on the branch</b>: change the template or bind data in the Director and redeploy.</p></div>

<div class="warn"><p><b>Common mistakes:</b> troubleshooting the template when the staging tunnel never came up; editing pushed lines on the branch (the Director owns them); expecting the Director to reach a branch that has no Controller path.</p></div>
<div class="exam"><p><b>Exam trap:</b> the Controller terminates the staging tunnel, but the Director pushes the configuration. Do not say the Controller sends the template.</p></div>

<div class="scn"><h4>Tunnel is up, config never arrives</h4><p>A new store showed a healthy staging tunnel at the Controller, yet it stayed unconfigured for hours. The Director had the serial under a different device name for a decommissioned store and the new device was never created. After creating the right device with bind data and deploying, the push completed in a few minutes.</p><p><b>Lesson:</b> staging proves reachability and identity at the Controller, not that the Director has a device record.</p></div>

<div class="iv"><p class="q">"Explain staging versus post-staging."</p><p>Staging is the first contact: minimal underlay, serial and Controller address bring up a secure tunnel to the Controller, which informs the Director. Post-staging is the Director matching the serial to a device, resolving group, template and bind data, and pushing the full configuration over NETCONF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Staging = underlay + serial + Controller address, building the first tunnel to the Controller.</li>
<li>Post-staging = Director pushes template plus bind data over NETCONF.</li>
<li>Wrong serial: the Director cannot match the device (Rejected).</li>
<li>Pushed configuration is read-only on the branch; change it in the Director.</li>
<li>Use the check order as your troubleshooting order.</li>
</ul></div>
`,hi:`
<p>Naya employee pehle din sirf ID card leke aata hai. Gate par security card ko staff list se match karti hai (<b>staging</b>). Pehchaan hone ke baad HR use desk, laptop aur pehle se tayyar access rights deta hai (<b>post-staging</b>). ID card poori job nahi hai; wo sirf pehchaane jaane ke liye kaafi hai. Versa onboarding ke bhi bilkul yahi do phases hain.</p>

<h3>Phase 1: staging</h3>
<p>Naye install hue VOS branch ke paas lagbhag koi configuration nahi hoti. <b>Staging</b> use minimum deta hai jo headend dhundne ke liye chahiye:</p>
<ul>
<li>address aur Internet underlay ki taraf default route ke saath working WAN interface (taaki underlay packets le ja sake),</li>
<li>device ko identify karne wala <b>serial number</b>,</li>
<li>jis <b>Controller address</b> se connect karna hai.</li>
</ul>
<p>Inse branch <b>Controller</b> tak secure tunnel (IKE aur IPsec) banata hai. Headend pehli baar branch se yahin sunta hai. Course lab aise branch se start hota hai jisme ye minimal underlay pehle se hai; uska Internet address 203.0.113.14/30 hai aur carrier gateway 203.0.113.13.</p>

<h3>Phase 2: post-staging</h3>
<p>Staging tunnel up hone ke baad Controller <b>Director</b> ko batata hai ki serial X wala device aaya hai. Director serial ko apni device list mein dhundta hai. Agar device mil jaye aur workflow deploy hua ho, to wo device ka group, group ka template aur device ka bind data leta hai, unhe poori configuration mein expand karta hai, aur <b>NETCONF ke through branch ko push</b> karta hai (ek management protocol jo secure staging connection par chalta hai). Branch configuration commit karta hai, har WAN par tunnels banata hai aur overlay join karta hai. Isliye is phase ko post-staging kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Onboarding message flow">
<text x="80" y="22" text-anchor="middle" class="svg-ink" font-size="13">Branch3</text><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="560" y="22" text-anchor="middle" class="svg-ink" font-size="13">Director</text>
<line x1="80" y1="30" x2="80" y2="245" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="30" x2="320" y2="245" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="30" x2="560" y2="245" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="80" y1="60" x2="320" y2="60" stroke="#0369a1" stroke-width="2"/><text x="200" y="53" text-anchor="middle" class="svg-accent" font-size="12">1 IKE/IPsec + serial</text>
<line x1="320" y1="100" x2="560" y2="100" stroke="#0369a1" stroke-width="2"/><text x="440" y="93" text-anchor="middle" class="svg-accent" font-size="12">2 naya device, serial?</text>
<line x1="560" y1="140" x2="560" y2="160" stroke="#64748b" stroke-width="2"/><text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">3 device, group,</text><text x="440" y="165" text-anchor="middle" class="svg-muted" font-size="12">template, bind data</text>
<line x1="560" y1="195" x2="80" y2="195" stroke="#15803d" stroke-width="2"/><text x="320" y="188" text-anchor="middle" class="svg-accent" font-size="12">4 NETCONF push: poori config</text>
<line x1="80" y1="230" x2="320" y2="230" stroke="#15803d" stroke-width="2"/><text x="200" y="223" text-anchor="middle" class="svg-accent" font-size="12">5 WAN tunnels, MP-BGP</text>
</svg><p class="cap">Staging Controller tak pehla tunnel banati hai; post-staging Director se asli configuration deti hai.</p></div>

<h3>Do phases kyun?</h3>
<p>Naye box ko uski configuration tab nahi di ja sakti jab tak wo reach na ho, aur use tab tak trust nahi kar sakte jab tak wo identify na ho. Staging sabse chhoti configuration se identity aur reachability solve karti hai. Post-staging phir bhaari kaam ek trusted, central jagah se karti hai. Iska ye bhi matlab hai ki Director ko branch LAN mein path ki zaroorat nahi: push wahi connection use karta hai jo branch ne khud kholi.</p>

<h3>Serial number kya karta hai</h3>
<p>Serial wo key hai jo physical box ko Director record se jodti hai. Agar staged serial Director device list mein nahi hai to Director device ko kisi template se match nahi kar sakta. Course model mein ye state <b>Rejected</b> hai. Serial Controller aur Director links verify hone ke baad check hota hai, isliye galat serial aur toota hua link alag symptoms dete hain.</p>

<h3>Course model ke checks ka order</h3>
<p>Engine is order mein evaluate karta hai, jo troubleshooting ka bhi achha order hai:</p>
<ol>
<li>Branch par staging start hui? (nahi to Not staged)</li>
<li>Staged address par koi Controller jawab deta hai, aur branch se reachable hai?</li>
<li>Controller ko Director pata hai, wo use reach kar sakta hai, aur Controller wahan registered hai?</li>
<li>Serial Director mein hai? (nahi to Rejected)</li>
<li>Workflow deploy hua? (nahi to Staged - waiting for Director)</li>
<li>Device group, template, tenant aur complete bind data exist karte hain? (nahi to Post-staging failed)</li>
<li>Sab theek: template push hota hai aur device Online ho jata hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Branch3 serial VOS-BR3-0001 ke saath 198.51.100.20 ki taraf stage karta hai. Steps 1 se 3 pass. Step 4 mein Director ko Branch3 milta hai. Step 5: deployed revision 1. Step 6 mein 6 bind values ke saath pass. Step 7: Director kuch dozen configuration lines push karta hai (hostname, site-id, controller, do WAN interfaces transports ke saath, do transport routes, LAN aur policy parts), aur branch Online ho jata hai. Push ke baad ye lines <b>branch par read-only</b> hain: Director mein template ya bind data badlo aur redeploy karo.</p></div>

<div class="warn"><p><b>Common mistakes:</b> staging tunnel kabhi up hi nahi hua aur template troubleshoot karna; branch par pushed lines edit karna (Director unka owner hai); aise branch tak Director se pahunchne ki ummeed jiske paas Controller path nahi.</p></div>
<div class="exam"><p><b>Exam trap:</b> staging tunnel Controller par terminate hota hai, lekin configuration Director push karta hai. Ye mat kaho ki Controller template bhejta hai.</p></div>

<div class="scn"><h4>Tunnel up hai, config nahi aati</h4><p>Naye store ka staging tunnel Controller par healthy tha, phir bhi kuch ghante unconfigured raha. Director mein serial ek decommissioned store ke alag device name ke under tha aur naya device kabhi banaya hi nahi gaya. Sahi device bind data ke saath banake deploy karne ke baad push kuch minutes mein complete hua.</p><p><b>Lesson:</b> staging Controller par reachability aur identity prove karti hai, ye nahi ki Director ke paas device record hai.</p></div>

<div class="iv"><p class="q">"Staging aur post-staging ka fark samjhao."</p><p>Staging pehla contact hai: minimal underlay, serial aur Controller address Controller tak secure tunnel banate hain, jo Director ko inform karta hai. Post-staging mein Director serial ko device se match karta hai, group, template aur bind data resolve karta hai, aur poori configuration NETCONF se push karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Staging = underlay + serial + Controller address, Controller tak pehla tunnel.</li>
<li>Post-staging = Director template plus bind data NETCONF se push karta hai.</li>
<li>Galat serial: Director device match nahi kar paata (Rejected).</li>
<li>Pushed configuration branch par read-only hai; Director mein badlo.</li>
<li>Check order ko apna troubleshooting order banao.</li>
</ul></div>
`}};export{e as default};