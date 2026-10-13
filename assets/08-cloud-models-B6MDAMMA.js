var e={id:`cloud-models`,h:{en:`Cloud computing: NIST characteristics, service and deployment models`,hi:`Cloud computing: NIST characteristics, service aur deployment models`},body:{en:`
<p>Most homes do not own a power station. They plug into the grid, use as much electricity as they need, and pay a monthly bill for exactly what the meter recorded. If a family buys an air conditioner, the grid simply supplies more. <b>Cloud computing</b> is computing delivered the same way: from a large shared pool, on demand, and metered.</p>

<h3>The NIST definition: five essential characteristics</h3>
<p>The US National Institute of Standards and Technology (NIST, publication SP 800-145) wrote the definition that Cisco exams use. A service is "cloud" only if it has all five:</p>
<dl class="terms">
<dt>On-demand self-service</dt><dd>The consumer creates resources (a VM, a network, storage) through a portal or API, without raising a ticket and waiting for a human.</dd>
<dt>Broad network access</dt><dd>Resources are reachable over the network from many kinds of clients: laptops, phones, other servers.</dd>
<dt>Resource pooling</dt><dd>The provider's hardware is shared by many consumers (<b>multi-tenancy</b>); you do not know or care which physical server runs your VM.</dd>
<dt>Rapid elasticity</dt><dd>Capacity can grow and shrink quickly, often automatically, and appears unlimited to the consumer.</dd>
<dt>Measured service</dt><dd>Usage is metered (CPU hours, GB stored, GB transferred) so it can be monitored, reported and billed: pay for what you use.</dd>
</dl>
<p>Note the difference from plain virtualization: a VMware cluster where you must email the server team for a new VM is virtualized, but it is <b>not</b> a cloud until users can self-serve and usage is measured.</p>

<h3>Three service models</h3>
<p>The service model tells you <b>where the provider's responsibility stops and yours begins</b>.</p>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Responsibility by service model">
<text x="110" y="20" text-anchor="middle" class="svg-accent" font-size="13">On-premises</text><text x="260" y="20" text-anchor="middle" class="svg-accent" font-size="13">IaaS</text><text x="410" y="20" text-anchor="middle" class="svg-accent" font-size="13">PaaS</text><text x="560" y="20" text-anchor="middle" class="svg-accent" font-size="13">SaaS</text>
<rect x="45" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="45" y="68" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">Data / runtime</text>
<rect x="45" y="106" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="12">Operating system</text>
<rect x="45" y="144" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="166" text-anchor="middle" class="svg-ink" font-size="12">Virtualization</text>
<rect x="45" y="182" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="204" text-anchor="middle" class="svg-ink" font-size="12">Servers, network</text>
<rect x="195" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="68" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="106" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="195" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="345" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="345" y="68" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="106" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="495" y="30" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="68" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="106" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="150" y="240" width="20" height="16" fill="#bbf7d0"/><text x="178" y="253" class="svg-ink" font-size="12">you manage</text>
<rect x="340" y="240" width="20" height="16" fill="#bae6fd"/><text x="368" y="253" class="svg-ink" font-size="12">provider manages</text>
</svg><p class="cap">Moving right, the provider manages more of the stack and you manage less.</p></div>
<table class="cmp"><tr><th>Model</th><th>You get</th><th>You still manage</th><th>Example</th></tr>
<tr><td><b>IaaS</b> (Infrastructure as a Service)</td><td>VMs, virtual networks, storage</td><td>OS, patches, runtime, application, data</td><td>renting cloud VMs to run your own web servers</td></tr>
<tr><td><b>PaaS</b> (Platform as a Service)</td><td>a ready platform: runtime, database or app hosting</td><td>your code and data</td><td>uploading application code to a managed app platform or managed database</td></tr>
<tr><td><b>SaaS</b> (Software as a Service)</td><td>a finished application</td><td>only users, settings and your data</td><td>web mail, online office suites, CRM</td></tr></table>

<h3>Four deployment models</h3>
<dl class="terms">
<dt>Public cloud</dt><dd>Owned and run by a provider, shared by many organisations, reached over the internet or private links.</dd>
<dt>Private cloud</dt><dd>Used by one organisation only. It can sit in its own data center or be hosted by a third party; what makes it cloud is self-service, pooling, elasticity and metering.</dd>
<dt>Community cloud</dt><dd>Shared by several organisations with common requirements, such as government agencies or hospitals with the same compliance rules.</dd>
<dt>Hybrid cloud</dt><dd>Two or more of the above connected so that data and applications can move between them, for example a private cloud that "bursts" into public cloud at peak times.</dd>
</dl>
<p>You will also hear <b>multi-cloud</b>: using several public cloud providers at once, for example to avoid depending on one vendor.</p>

<div class="eg"><p><b>Worked example.</b> An exam-results website is quiet 11 months a year, then gets 50 times its normal load for 3 days. On-premises, you would buy servers for the peak: 50 servers, 49 of them idle most of the year (large up-front capital expense, CapEx). In an IaaS public cloud you run 2 VMs normally and scale to 100 for three days (rapid elasticity), paying by the hour (measured service, operating expense, OpEx). The five characteristics are exactly what make this possible.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking "private cloud" means "on-premises" and "public cloud" means "internet". A private cloud can be hosted off-site, and a public cloud can be reached over a private WAN link. The deployment model is about <b>who shares the resources</b>, not where the building is.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The consumer deploys applications without managing the OS" = PaaS. "The consumer controls the OS" = IaaS. "The consumer just uses the application" = SaaS. And "pay per use" matches <b>measured service</b>, while "scale up and down quickly" matches <b>rapid elasticity</b>, not resource pooling.</p></div>

<div class="scn"><h4>Who patches the server?</h4><p>After a security audit found an unpatched web server in the company's cloud account, the manager said, "We pay the cloud provider, patching is their job." It was an IaaS VM: the provider secures the hardware and hypervisor, but the guest OS belongs to the customer. The team added automated OS patching and wrote down the responsibility split for every cloud service they used.</p><p><b>Lesson:</b> the service model defines the shared responsibility. In IaaS you own the OS; in PaaS you own the code; in SaaS you own users and data.</p></div>

<div class="iv"><p class="q">"Explain IaaS, PaaS and SaaS, and give an example of each."</p><p>Use the responsibility stack: IaaS gives virtual infrastructure and you manage from the OS up (cloud VMs); PaaS gives a managed platform and you bring code and data (managed app hosting or database); SaaS gives a finished application (web mail, CRM). Then list the five NIST characteristics and the four deployment models, and add that private does not mean on-premises.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIST five: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service.</li>
<li>IaaS: you manage OS and up; PaaS: you manage code and data; SaaS: you only use the application.</li>
<li>Deployment models: public, private, community, hybrid (plus multi-cloud as a common term).</li>
<li>Private cloud can be off-site; the model is about who shares the resources.</li>
<li>Cloud turns capital expense into operating expense and pays for peaks only when they happen.</li>
</ul></div>
`,hi:`
<p>Zyada tar gharon ka apna power station nahi hota. Woh grid mein plug karte hain, jitni bijli chahiye utni use karte hain, aur meter ne jo record kiya bilkul utne ka monthly bill bharte hain. Agar family AC khareedti hai, to grid bas zyada bijli de deta hai. <b>Cloud computing</b> isi tarah deliver ki gayi computing hai: ek bade shared pool se, on demand, aur metered.</p>

<h3>NIST definition: paanch essential characteristics</h3>
<p>US National Institute of Standards and Technology (NIST, publication SP 800-145) ne woh definition likhi jo Cisco exams use karte hain. Koi service tabhi "cloud" hai jab usmein paanchon hon:</p>
<dl class="terms">
<dt>On-demand self-service</dt><dd>Consumer portal ya API se resources (VM, network, storage) banata hai, bina ticket raise kiye aur kisi insaan ka intezaar kiye.</dd>
<dt>Broad network access</dt><dd>Resources network par kai tarah ke clients se reachable hain: laptops, phones, doosre servers.</dd>
<dt>Resource pooling</dt><dd>Provider ka hardware kai consumers share karte hain (<b>multi-tenancy</b>); aapko pata nahi aur farak nahi padta ki aapki VM kaunsa physical server chala raha hai.</dd>
<dt>Rapid elasticity</dt><dd>Capacity jaldi badh aur ghat sakti hai, aksar automatically, aur consumer ko unlimited lagti hai.</dd>
<dt>Measured service</dt><dd>Usage meter hota hai (CPU hours, stored GB, transferred GB) taaki use monitor, report aur bill kiya ja sake: jitna use utna pay.</dd>
</dl>
<p>Plain virtualization se fark dekho: ek VMware cluster jahan nayi VM ke liye server team ko email karna padta hai, woh virtualized hai, par jab tak users self-serve na kar sakein aur usage measure na ho, woh cloud <b>nahi</b> hai.</p>

<h3>Teen service models</h3>
<p>Service model batata hai ki <b>provider ki zimmedari kahan khatam hoti hai aur aapki kahan shuru</b>.</p>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Service model ke hisaab se zimmedari">
<text x="110" y="20" text-anchor="middle" class="svg-accent" font-size="13">On-premises</text><text x="260" y="20" text-anchor="middle" class="svg-accent" font-size="13">IaaS</text><text x="410" y="20" text-anchor="middle" class="svg-accent" font-size="13">PaaS</text><text x="560" y="20" text-anchor="middle" class="svg-accent" font-size="13">SaaS</text>
<rect x="45" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="45" y="68" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">Data / runtime</text>
<rect x="45" y="106" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="12">Operating system</text>
<rect x="45" y="144" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="166" text-anchor="middle" class="svg-ink" font-size="12">Virtualization</text>
<rect x="45" y="182" width="130" height="34" rx="4" fill="#bbf7d0"/><text x="110" y="204" text-anchor="middle" class="svg-ink" font-size="12">Servers, network</text>
<rect x="195" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="68" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="106" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="195" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="195" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="345" y="30" width="130" height="34" rx="4" fill="#bbf7d0"/><rect x="345" y="68" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="106" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="345" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="495" y="30" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="68" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="106" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="144" width="130" height="34" rx="4" fill="#bae6fd"/><rect x="495" y="182" width="130" height="34" rx="4" fill="#bae6fd"/>
<rect x="150" y="240" width="20" height="16" fill="#bbf7d0"/><text x="178" y="253" class="svg-ink" font-size="12">aap manage karte ho</text>
<rect x="340" y="240" width="20" height="16" fill="#bae6fd"/><text x="368" y="253" class="svg-ink" font-size="12">provider manage karta hai</text>
</svg><p class="cap">Daayen jaate hue provider stack ka zyada hissa manage karta hai aur aap kam.</p></div>
<table class="cmp"><tr><th>Model</th><th>Aapko milta hai</th><th>Aap abhi bhi manage karte ho</th><th>Example</th></tr>
<tr><td><b>IaaS</b> (Infrastructure as a Service)</td><td>VMs, virtual networks, storage</td><td>OS, patches, runtime, application, data</td><td>apne web servers chalane ke liye cloud VMs kiraye par lena</td></tr>
<tr><td><b>PaaS</b> (Platform as a Service)</td><td>tayyar platform: runtime, database ya app hosting</td><td>aapka code aur data</td><td>managed app platform ya managed database par application code upload karna</td></tr>
<tr><td><b>SaaS</b> (Software as a Service)</td><td>poori bani application</td><td>sirf users, settings aur aapka data</td><td>web mail, online office suites, CRM</td></tr></table>

<h3>Chaar deployment models</h3>
<dl class="terms">
<dt>Public cloud</dt><dd>Provider ka owned aur chalaya hua, kai organisations share karti hain, internet ya private links se pahuncha jaata hai.</dd>
<dt>Private cloud</dt><dd>Sirf ek organisation use karti hai. Yeh uske apne data center mein ho sakta hai ya third party host kar sakti hai; ise cloud banata hai self-service, pooling, elasticity aur metering.</dd>
<dt>Community cloud</dt><dd>Common requirements wali kai organisations share karti hain, jaise government agencies ya same compliance rules wale hospitals.</dd>
<dt>Hybrid cloud</dt><dd>Upar wale mein se do ya zyada is tarah jude hue ki data aur applications unke beech move kar sakein, jaise ek private cloud jo peak time par public cloud mein "burst" karta hai.</dd>
</dl>
<p>Aap <b>multi-cloud</b> bhi sunoge: ek saath kai public cloud providers use karna, jaise ek vendor par depend hone se bachne ke liye.</p>

<div class="eg"><p><b>Worked example.</b> Exam-results website saal ke 11 mahine shaant rehti hai, phir 3 din ke liye normal se 50 guna load aata hai. On-premises aap peak ke liye servers khareedoge: 50 servers, jinmein se 49 saal bhar zyada tar idle (bada up-front capital expense, CapEx). IaaS public cloud mein aap normally 2 VMs chalate ho aur teen din ke liye 100 tak scale karte ho (rapid elasticity), ghante ke hisaab se pay karte ho (measured service, operating expense, OpEx). Paanch characteristics hi yeh possible banati hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "private cloud" ka matlab "on-premises" aur "public cloud" ka matlab "internet" hai. Private cloud off-site hosted ho sakta hai, aur public cloud tak private WAN link se pahuncha ja sakta hai. Deployment model is baare mein hai ki <b>resources kaun share karta hai</b>, building kahan hai is baare mein nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Consumer bina OS manage kiye applications deploy karta hai" = PaaS. "Consumer OS control karta hai" = IaaS. "Consumer bas application use karta hai" = SaaS. Aur "pay per use" <b>measured service</b> se match karta hai, jabki "jaldi scale up aur down" <b>rapid elasticity</b> se, resource pooling se nahi.</p></div>

<div class="scn"><h4>Server patch kaun karega?</h4><p>Security audit ne company ke cloud account mein ek unpatched web server paaya, to manager ne kaha, "Hum cloud provider ko pay karte hain, patching unka kaam hai." Woh IaaS VM thi: provider hardware aur hypervisor secure karta hai, par guest OS customer ka hai. Team ne automated OS patching jodi aur har cloud service ke liye responsibility split likh kar rakha.</p><p><b>Seekh:</b> service model shared responsibility define karta hai. IaaS mein OS aapka; PaaS mein code aapka; SaaS mein users aur data aapke.</p></div>

<div class="iv"><p class="q">"IaaS, PaaS aur SaaS samjhao, aur har ek ka example do."</p><p>Responsibility stack use karo: IaaS virtual infrastructure deta hai aur aap OS se upar manage karte ho (cloud VMs); PaaS managed platform deta hai aur aap code aur data laate ho (managed app hosting ya database); SaaS poori bani application deta hai (web mail, CRM). Phir paanch NIST characteristics aur chaar deployment models list karo, aur jodo ki private ka matlab on-premises nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIST paanch: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service.</li>
<li>IaaS: aap OS aur upar manage karte ho; PaaS: aap code aur data manage karte ho; SaaS: aap sirf application use karte ho.</li>
<li>Deployment models: public, private, community, hybrid (plus common term multi-cloud).</li>
<li>Private cloud off-site ho sakta hai; model is baare mein hai ki resources kaun share karta hai.</li>
<li>Cloud capital expense ko operating expense mein badalta hai aur peaks ka pay sirf tab hota hai jab woh aate hain.</li>
</ul></div>
`}};export{e as default};