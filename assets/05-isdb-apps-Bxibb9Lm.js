var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(190,e(10,60,100,60,`#bae6fd`,r[0],r[1])+e(145,60,110,60,`#bbf7d0`,r[2],r[3])+e(290,60,110,60,`#bbf7d0`,r[4],r[5])+e(435,60,100,60,`#bbf7d0`,r[6],r[7])+e(570,60,65,60,`#fed7aa`,r[8],r[9])+t(110,90,145,90)+t(255,90,290,90)+t(400,90,435,90)+t(535,90,570,90),r[10]),i={id:`isdb-apps`,h:{en:`Internet Service Database, application steering and first-packet behaviour`,hi:`Internet Service Database, application steering aur pehle packet ka behaviour`},body:{en:`
<p>The most useful SD-WAN rules name a <b>service</b>, not an IP range: "Microsoft 365 over the cheapest good link". Two mechanisms make that possible: the <b>Internet Service Database (ISDB)</b> and <b>application control</b> signatures. They behave differently, especially for the first packets of a session, and the exam likes that difference.</p>
<h3>ISDB: a list of addresses with a name</h3>
<p>The ISDB maps a service name to IP addresses, ports and protocols. The mapping is known <b>before the first packet arrives</b>: if the destination matches an entry, the session is classified at once and the rule can pick a member on the very first packet. It cannot tell two applications apart if they share the same addresses.</p>
<h3>Application steering: recognised by inspection</h3>
<p>An application signature needs the firewall to look into the traffic, for example the TLS server name or protocol patterns. That takes a few packets. The FortiGate therefore learns the destination and keeps it in an <b>application control cache</b>: the first session to a new server may use another rule or the implicit rule, and later sessions to the same destination match at the first packet using the cache. This is the central point of the chapter.</p>
<table class="cmp"><tr><th>Aspect</th><th>ISDB</th><th>Application signature</th></tr>
<tr><td>Based on</td><td>Addresses, ports, protocols maintained by FortiGuard</td><td>Deep inspection patterns</td></tr>
<tr><td>First packet</td><td>Classified at once</td><td>Needs the cache or inspection; the first session may miss</td></tr>
<tr><td>Strength</td><td>Fast, no inspection needed</td><td>Separates apps on shared addresses</td></tr>
<tr><td>Needs</td><td>Current ISDB package</td><td>App-ctrl database, inspection that fills the cache</td></tr></table>
<h3>Which wins when several match?</h3>
<p>For one destination the sources are consulted in a fixed sequence: a <b>custom internet service</b> you defined first, then the <b>application control cache</b>, then the <b>ISDB</b>. This is separate from rule order: rules are still read top-down, and a rule holding an internet-service criterion uses whichever classification applies to the session. If you define a custom internet service for your own SaaS tenant addresses, it wins over the generic list.</p>
`+r([`New session`,`unknown dest`,`Custom service?`,`your own list`,`App-ctrl cache?`,`learned earlier`,`ISDB?`,`FortiGuard list`,`Rule`,`member`,`Classification order: custom, then app-ctrl cache, then ISDB.`])+`
<h3>When the cache stays empty</h3>
<p>The cache is filled by inspection. If the policy that carries the traffic uses no application control, or uses certain inspection modes where the classification is not recorded as expected (for example a proxy-based profile or the IPS inline option on some builds), the cache can stay empty and application rules never match on the first packet. Fortinet community advice for this symptom is to use a flow-based profile with application control on the policy, or fall back to ISDB or an address object. Treat the exact combinations as something to verify on your build with the diagnose command below.</p>
<h3>Reference configuration</h3>
<pre class="code"># Reference configuration (not run in the simulator)
config system sdwan
    config service
        edit 5
            set name "Video-meetings"
            set mode priority
            set internet-service enable
            set internet-service-app-ctrl 41468
            set health-check "HQ-Loopback"
            set link-cost-factor jitter
            set priority-members 1 2
        next
    end
end
# Show applications the SD-WAN has learned (illustrative command; output depends on traffic)
diagnose sys sdwan internet-service-app-ctrl-list</pre>
<p>The number <code>41468</code> is a placeholder for an application ID; look up real IDs from the application control signature list on your device or in the FortiGuard encyclopedia. Using the group option (<code>internet-service-app-ctrl-group</code>) lets you steer a set of applications together. The command to view the cache is as I know it for recent releases; run it with <code>?</code> to confirm.</p>
<div class="warn"><p><b>Common mistake.</b> Testing an application rule with a single browser request and concluding it fails. The first request may not match; repeat the test, then check the cache and the counters.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Why did the first session to a SaaS application take the wrong link, while later ones were correct?" Because the application was classified from inspection after the first packets, then cached. ISDB entries do not behave this way.</p></div>
<div class="scn"><h4>Meetings that start badly</h4><p>Video meetings joined over the wrong link during the first minute after a new meeting server appeared, then settled. The rule used an application signature only. Adding a second rule below it that matched the provider's ISDB entry caught the early packets and removed the glitch.</p><p><b>Lesson:</b> Combine ISDB for first-packet certainty with application signatures for precision.</p></div>
<div class="iv"><p class="q">"ISDB versus application signature in an SD-WAN rule?"</p><p>ISDB is address-based and classifies at the first packet; application signatures need inspection and are learned into a cache, so the first session may be missed. ISDB is simple and fast; signatures are precise on shared addresses. A custom internet service outranks both for the same destination.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>ISDB is classified at the first packet; applications are learned and cached.</li><li>Classification order: custom internet service, app-ctrl cache, ISDB.</li><li>An empty cache usually means inspection is not recording applications.</li><li>Keep FortiGuard updates healthy for ISDB.</li></ul></div>
`,hi:`
<p>Sabse kaam ke SD-WAN rules <b>service</b> ka naam lete hain, IP range ka nahi: "Microsoft 365 sabse sasti acchi link par". Do mechanisms isse possible banate hain: <b>Internet Service Database (ISDB)</b> aur <b>application control</b> signatures. Woh alag behave karte hain, khaaskar session ke pehle packets ke liye, aur exam is fark ko pasand karta hai.</p>
<h3>ISDB: naam wali addresses ki list</h3>
<p>ISDB service ke naam ko IP addresses, ports aur protocols se map karta hai. Yeh mapping <b>pehla packet aane se pehle</b> pata hoti hai: agar destination kisi entry se match kare to session turant classify ho jaata hai aur rule bilkul pehle packet par member chun sakta hai. Agar do applications same addresses share karein to woh unhe alag nahi kar sakta.</p>
<h3>Application steering: inspection se pehchaan</h3>
<p>Application signature ko firewall ko traffic ke andar dekhna padta hai, jaise TLS server name ya protocol patterns. Isme kuch packets lagte hain. Isliye FortiGate destination seekhta hai aur use ek <b>application control cache</b> mein rakhta hai: naye server ka pehla session doosre rule ya implicit rule use kar sakta hai, aur baad ke sessions cache se pehle packet par match karte hain. Yeh chapter ka kendriya point hai.</p>
<table class="cmp"><tr><th>Pehlu</th><th>ISDB</th><th>Application signature</th></tr>
<tr><td>Aadhar</td><td>FortiGuard ki maintained addresses, ports, protocols</td><td>Deep inspection patterns</td></tr>
<tr><td>Pehla packet</td><td>Turant classify</td><td>Cache ya inspection chahiye; pehla session chook sakta hai</td></tr>
<tr><td>Taakat</td><td>Tez, inspection nahi chahiye</td><td>Shared addresses par apps alag karta hai</td></tr>
<tr><td>Zarurat</td><td>Current ISDB package</td><td>App-ctrl database, inspection jo cache bharti hai</td></tr></table>
<h3>Kai match hon to kaun jeetta hai?</h3>
<p>Ek destination ke liye sources ek fixed sequence mein dekhe jaate hain: pehle aapka define kiya <b>custom internet service</b>, phir <b>application control cache</b>, phir <b>ISDB</b>. Yeh rule order se alag hai: rules abhi bhi upar se neeche padhe jaate hain, aur internet-service criterion wala rule session par jo classification lagu hai woh use karta hai. Agar aap apne SaaS tenant addresses ke liye custom internet service banate ho to woh generic list se upar jeetta hai.</p>
`+r([`Naya session`,`unknown dest`,`Custom service?`,`aapki apni list`,`App-ctrl cache?`,`pehle seekha`,`ISDB?`,`FortiGuard list`,`Rule`,`member`,`Classification order: custom, phir app-ctrl cache, phir ISDB.`])+`
<h3>Jab cache khaali rehta hai</h3>
<p>Cache inspection se bharti hai. Agar traffic carry karne wali policy application control use nahi karti, ya kuch inspection modes use karti hai jahan classification expected tareeke se record nahi hoti (jaise proxy-based profile ya kuch builds par IPS inline option), to cache khaali reh sakti hai aur application rules pehle packet par kabhi match nahi karte. Is symptom ke liye Fortinet community ki salah hai policy par application control ke saath flow-based profile use karo, ya ISDB ya address object par aa jao. Exact combinations ko niche ke diagnose command se apne build par verify karne wali cheez maano.</p>
<h3>Reference configuration</h3>
<pre class="code"># Reference configuration (not run in the simulator)
config system sdwan
    config service
        edit 5
            set name "Video-meetings"
            set mode priority
            set internet-service enable
            set internet-service-app-ctrl 41468
            set health-check "HQ-Loopback"
            set link-cost-factor jitter
            set priority-members 1 2
        next
    end
end
# Show applications the SD-WAN has learned (illustrative command; output depends on traffic)
diagnose sys sdwan internet-service-app-ctrl-list</pre>
<p>Number <code>41468</code> application ID ka placeholder hai; asli IDs apne device ki application control signature list ya FortiGuard encyclopedia se dekho. Group option (<code>internet-service-app-ctrl-group</code>) applications ke set ko ek saath steer karne deta hai. Cache dekhne ka command recent releases ke liye jaisa mujhe pata hai waisa hai; confirm karne ke liye <code>?</code> ke saath chalao.</p>
<div class="warn"><p><b>Common galti.</b> Application rule ko ek browser request se test karke yeh nateeja nikalna ki woh fail hai. Pehli request match nahi kar sakti; test dohrao, phir cache aur counters dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "SaaS application ke pehle session ne galat link kyun li, jabki baad ke sahi the?" Kyunki application pehle packets ke baad inspection se classify hui, phir cache hui. ISDB entries aise behave nahi karti.</p></div>
<div class="scn"><h4>Meetings jo kharab shuru hoti hain</h4><p>Naya meeting server aane ke baad pehle minute video meetings galat link par join hui, phir theek ho gayi. Rule sirf application signature use karta tha. Uske neeche provider ki ISDB entry match karne wala doosra rule jodne se shuruaati packets pakde gaye aur glitch hat gaya.</p><p><b>Seekh:</b> Pehle-packet ki certainty ke liye ISDB aur precision ke liye application signatures milao.</p></div>
<div class="iv"><p class="q">"SD-WAN rule mein ISDB versus application signature?"</p><p>ISDB address-based hai aur pehle packet par classify karta hai; application signatures ko inspection chahiye aur woh cache mein seekhe jaate hain, isliye pehla session chook sakta hai. ISDB simple aur tez hai; signatures shared addresses par precise hain. Custom internet service dono se upar hai same destination ke liye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>ISDB pehle packet par classify hota hai; applications seekhi aur cache ki jaati hain.</li><li>Classification order: custom internet service, app-ctrl cache, ISDB.</li><li>Khaali cache ka matlab aam taur par inspection applications record nahi kar rahi.</li><li>ISDB ke liye FortiGuard updates healthy rakho.</li></ul></div>
`}};export{i as default};